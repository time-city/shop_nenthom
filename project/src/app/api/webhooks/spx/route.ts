import { NextRequest, NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import type { Prisma } from "@prisma/client";
import { validateSPXWebhookSignature } from "@/src/lib/spx/api";
import { OrderStatus } from "@prisma/client";
import { emitOrderStatusUpdatedToUser } from "@/src/lib/events/userOrderEvents";
import { emitOrderUpdatedToAdmin } from "@/src/lib/events/adminOrderEvents";
import { OrderService } from "@/src/lib/services/order.service";

export async function POST(req: NextRequest) {
  try {
    // 1. Extract signature from headers
    const signature = req.headers.get("x-spx-signature");
    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 401 });
    }

    // Read the raw body as text for signature validation
    const rawBody = await req.text();

    // 2. Spoofing Protection: Validate signature
    const isValid = validateSPXWebhookSignature(rawBody, signature);
    if (!isValid) {
      console.warn("[SPX Webhook] Invalid signature attempt");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // Parse payload
    const payload = JSON.parse(rawBody);
    const { event_id, order_no, tracking_code, status: spxStatus } = payload;

    if (!event_id) {
      return NextResponse.json({ error: "Missing event_id" }, { status: 400 });
    }

    // 3. Idempotency Check
    const existingLog = await prisma.webhookLog.findUnique({
      where: { event_id },
    });

    if (existingLog) {
      // Duplicate event. Acknowledge SPX immediately to prevent Webhook Storms
      console.log(`[SPX Webhook] Duplicate event ignored: ${event_id}`);
      return NextResponse.json({ message: "OK" }, { status: 200 });
    }

    // 4. Map SPX status to our OrderStatus
    let newStatus: OrderStatus | null = null;
    if (spxStatus === "DELIVERED") {
      newStatus = OrderStatus.DELIVERED;
    } else if (spxStatus === "RETURNED" || spxStatus === "CANCELLED") {
      newStatus = OrderStatus.CANCELLED;
    } // Add more mappings as needed

    // 5. Transactional Update
    let updatedOrderNumber: string | null = null;
    let updatedOrderUserId: string | null = null;
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Insert WebhookLog first to lock this event
      await tx.webhookLog.create({
        data: {
          event_id,
          order_id: order_no, // assuming order_no matches our UUID. If it doesn't, we can query by tracking_code
          status: spxStatus,
        },
      });

      // Update Order if a mapped status exists
      if (newStatus) {
        // Query by tracking_code if order_no isn't reliable, but assuming order_no is our DB id
        await tx.order.updateMany({
          where: { tracking_code },
          data: { status: newStatus },
        });

        // Optionally, find order id to create history log
        const order = await tx.order.findUnique({
          where: { tracking_code },
        });

        if (order) {
          updatedOrderNumber = order.order_number;
          updatedOrderUserId = order.user_id;
          await tx.orderHistoryLog.create({
            data: {
              order_id: order.id,
              current_status: newStatus,
              note: `Cập nhật từ SPX Webhook. Trạng thái SPX: ${spxStatus}`,
            },
          });
        }
      }
    });

    // 6. Trigger WS if order was updated
    if (updatedOrderNumber) {
      try {
        const adminOrder = await OrderService.getOrderDetailForAdmin(updatedOrderNumber);
        if (adminOrder) {
          // Emit to User tracking page
          await emitOrderStatusUpdatedToUser({
            orderId: adminOrder.dbId,
            orderNumber: adminOrder.id,
            status: adminOrder.status as any,
            updatedAt: new Date().toISOString(),
            userId: updatedOrderUserId || undefined,
          });

          // Emit to Admin
          await emitOrderUpdatedToAdmin({
            order: adminOrder as any,
            orderId: adminOrder.dbId,
            orderNumber: adminOrder.id,
            status: adminOrder.status as any,
          });
        }
      } catch (e) {
        console.error("Failed to emit WS events for SPX webhook", e);
      }
    }

    // 7. Return 200 OK instantly upon successful transaction
    return NextResponse.json({ message: "OK" }, { status: 200 });
  } catch (error: any) {
    console.error("[SPX Webhook Error]", error);
    // Return 500 so SPX will retry if this is an unexpected server error
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
