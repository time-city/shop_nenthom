import prisma from "@/src/lib/prisma";
import type { Prisma } from "@prisma/client";
import { fetchSPX } from "./api";
import { OrderStatus, PaymentMethod } from "@prisma/client";

export class SPXOrderService {
  /**
   * Creates an order on SPX and updates the local database.
   * Uses 2-level address format and handles partial failures via rollback.
   */
  static async createSPXOrder(orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    if (order.tracking_code) {
      throw new Error(`Order ${orderId} already has a tracking code: ${order.tracking_code}`);
    }

    // New 2-level format: Deliver_state = Tỉnh/Thành, Deliver_city = Phường/Xã
    // Assuming shipping_city holds the City/Province and shipping_address holds the Ward/Street
    const payload = {
      order_no: order.id,
      consignee: {
        name: order.shipping_fullname,
        phone: order.shipping_phone,
      },
      deliver_address: {
        state: order.shipping_city, // Tỉnh/Thành
        city: order.shipping_address, // Phường/Xã & Đường (Need to map properly in real-world, assuming here based on prompt)
        full_address: `${order.shipping_address}, ${order.shipping_city}`,
      },
      parcel: {
        weight: 1, // Defaulting to 1kg or calculate from items
        item_name: "Sản phẩm nến thơm",
      },
      cod_amount: (order.payment_method === PaymentMethod.COD) ? order.total_cents : 0,
    };

    let spxResponse;
    try {
      // 1. Call SPX API first
      spxResponse = await fetchSPX("/api/v1/orders/create", payload);
    } catch (error: any) {
      throw new Error(`Failed to create SPX order: ${error.message}`);
    }

    const trackingCode = spxResponse?.data?.tracking_code || spxResponse?.tracking_code;
    
    if (!trackingCode) {
      throw new Error("SPX API did not return a tracking code");
    }

    // 2. Update Database within a transaction
    try {
      await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        // Update order status and tracking info
        await tx.order.update({
          where: { id: orderId },
          data: {
            shipping_carrier: "SPX",
            tracking_code: trackingCode,
            status: OrderStatus.SHIPPED,
          },
        });

        // Add history log
        await tx.orderHistoryLog.create({
          data: {
            order_id: orderId,
            current_status: OrderStatus.SHIPPED,
            note: `Đã tạo đơn SPX. Mã vận đơn: ${trackingCode}`,
          },
        });
      });
      
      return trackingCode;
    } catch (dbError: any) {
      // 3. Rollback (Partial Failure Handling)
      // If DB update fails, we MUST cancel the order on SPX to avoid orphaned orders
      console.error(`[CRITICAL] DB update failed for Order ${orderId}. Rolling back SPX order...`, dbError);
      
      try {
        await fetchSPX("/api/v1/orders/cancel", { 
          order_no: order.id,
          tracking_code: trackingCode 
        });
        console.log(`[SUCCESS] Rolled back SPX order ${trackingCode}`);
      } catch (rollbackError: any) {
        // Log an urgent error if rollback also fails
        console.error(`[URGENT] Orphaned SPX Order! Failed to rollback ${trackingCode}.`, rollbackError);
      }
      
      throw new Error(`Database update failed. SPX order creation rolled back. Details: ${dbError.message}`);
    }
  }

  /**
   * Cancels an order on SPX first before updating the local database to prevent race conditions.
   */
  static async cancelSPXOrder(orderId: string, reason: string = "Khách hàng yêu cầu hủy") {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    if (!order.tracking_code || order.shipping_carrier !== "SPX") {
      throw new Error(`Order ${orderId} is not an SPX order or has no tracking code.`);
    }

    let spxResponse;
    try {
      // 1. Call SPX Cancel API first
      spxResponse = await fetchSPX("/api/v1/orders/cancel", {
        order_no: order.id,
        tracking_code: order.tracking_code,
        cancel_reason: reason,
      });
    } catch (error: any) {
      throw new Error(`Failed to cancel SPX order: ${error.message}`);
    }

    // SPX usually returns a specific code or message if the item is already picked up
    if (spxResponse?.status === "ALREADY_PICKED_UP" || spxResponse?.code === 1001) {
      throw new Error("Cannot cancel: Order has already been picked up by SPX.");
    }

    // 2. ONLY IF SPX says success, update DB to CANCELLED
    try {
      await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        await tx.order.update({
          where: { id: orderId },
          data: {
            status: OrderStatus.CANCELLED,
          },
        });

        await tx.orderHistoryLog.create({
          data: {
            order_id: orderId,
            current_status: OrderStatus.CANCELLED,
            note: `Hủy đơn SPX thành công. Lý do: ${reason}`,
          },
        });
      });
      
      return true;
    } catch (dbError: any) {
      console.error(`[CRITICAL] DB update failed for canceled SPX Order ${orderId}.`, dbError);
      throw new Error(`Order cancelled on SPX but failed to update local DB: ${dbError.message}`);
    }
  }
}
