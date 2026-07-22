'use server'

import { cookies } from "next/headers";
import { revalidateTag } from "next/cache";
import prisma from "../prisma";
import { requireAdmin } from "../requireAdmin";
import { getPublicErrorMessage } from "../utils/publicError";
import { OrderService } from "../services/order.service";
import { SPXOrderService } from "../spx/order.service";
import { emitOrderStatusUpdatedToUser } from "../events/userOrderEvents";
import { getSession } from "../session";
import {
  CancelOrderInput,
  CreateOrderInput,
  GetListOrdersParams,
  UpdateOrderStatusInput,
  cancelOrderSchema,
  createOrderSchema,
  getListOrdersSchema,
  orderNumberSchema,
  updateOrderStatusSchema,
  UpdateOrderTrackingInput,
  updateOrderTrackingSchema,
} from "../validations/order.schema";

const CART_SESSION_COOKIE_NAME = 'guest_session_id';

async function getCartIdentity() {
  const cookieStore = await cookies();
  const session = await getSession();
  const sessionId = cookieStore.get(CART_SESSION_COOKIE_NAME)?.value;

  return {
    userId: session?.sub,
    sessionId: session ? undefined : sessionId,
  };
}

// Tạo đơn hàng từ giỏ hàng hiện tại, hỗ trợ cả user đăng nhập và guest session.
export async function createOrderAction(params: CreateOrderInput) {
  const parsed = createOrderSchema.safeParse(params)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  try {
    const { userId, sessionId } = await getCartIdentity();
    const order = await OrderService.createOrder(parsed.data, userId, sessionId);

    // @ts-expect-error: Next.js revalidateTag types are sometimes incomplete or missing
    revalidateTag("dashboard-overview");

    return { success: true, data: order }
  } catch (err) {
    return { error: getPublicErrorMessage(err, "Có lỗi xảy ra. Vui lòng thử lại.") }
  }
}

// Lấy lịch sử đơn hàng của khách hàng đang đăng nhập.
export async function getMyOrdersAction(params: { page?: number; limit?: number } = {}) {
  const session = await getSession()

  if (!session) return { success: false as const, error: 'Vui lòng đăng nhập để xem lịch sử đơn hàng' }
  if (session.role === 'ADMIN') return { success: false as const, error: 'Tài khoản quản trị không có lịch sử mua hàng' }

  const page = Math.max(Math.trunc(params.page ?? 1), 1)
  const limit = Math.min(Math.max(Math.trunc(params.limit ?? 10), 1), 50)

  try {
    const orders = await OrderService.getMyOrders(session.sub, page, limit)
    return { success: true as const, ...orders }
  } catch (err) {
    return { success: false as const, error: getPublicErrorMessage(err, "Có lỗi xảy ra. Vui lòng thử lại.") }
  }
}

// Lấy chi tiết một đơn hàng của chính khách hàng đang đăng nhập.
export async function getMyOrderDetailAction(orderNumber: string) {
  const session = await getSession()

  if (!session) return { error: 'Vui lòng đăng nhập để xem chi tiết đơn hàng' }
  if (session.role === 'ADMIN') return { error: 'Tài khoản quản trị không có lịch sử mua hàng' }

  try {
    const order = await OrderService.getMyOrderDetail(session.sub, orderNumber)

    if (!order) return { error: 'Không tìm thấy đơn hàng phù hợp' }

    return { success: true, data: order }
  } catch (err) {
    console.error("GET_MY_ORDER_DETAIL_ERROR", err);
    return { error: getPublicErrorMessage(err, "Có lỗi xảy ra. Vui lòng thử lại.") }
  }
}

export async function getOrderPaymentStatusAction(params: {
  orderId: string;
  orderNumber: string;
}) {
  if (!params.orderId || !params.orderNumber) {
    return { error: "Không thể xác định đơn hàng." };
  }

  try {
    const payment = await OrderService.getPaymentStatus(
      params.orderId,
      params.orderNumber,
    );

    return { success: true, data: payment };
  } catch (err) {
    return { error: getPublicErrorMessage(err, "Có lỗi xảy ra. Vui lòng thử lại.") };
  }
}

// Lấy danh sách đơn hàng cho admin, có lọc theo trạng thái, ngày đặt, từ khóa và phân trang.
export async function getOrdersAction(params: Partial<GetListOrdersParams> = {}) {
  const admin = await requireAdmin()
  if ("error" in admin) return admin

  const parsed = getListOrdersSchema.safeParse(params)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  try {
    const orders = await OrderService.getOrders(parsed.data)
    return { success: true, ...orders }
  } catch (err) {
    return { error: getPublicErrorMessage(err, "Có lỗi xảy ra. Vui lòng thử lại.") }
  }
}

// Giữ tương thích với tên action cũ trong các màn admin hiện tại.
export async function getListOrderAction(params: Partial<GetListOrdersParams> = {}) {
  return getOrdersAction(params)
}

// Admin xem chi tiết bất kỳ đơn hàng nào, bao gồm topping và lịch sử thay đổi trạng thái.
export async function getOrderDetailForAdminAction(params: unknown) {
  const admin = await requireAdmin()
  if ("error" in admin) return admin

  const parsed = orderNumberSchema.safeParse(params)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  try {
    const order = await OrderService.getOrderDetailForAdmin(parsed.data.order_number)
    if (!order) return { error: 'Không tìm thấy đơn hàng phù hợp' }
    return { success: true, data: order }
  } catch (err) {
    return { error: getPublicErrorMessage(err, "Có lỗi xảy ra. Vui lòng thử lại.") }
  }
}

// Admin cập nhật trạng thái đơn hàng và ghi history log với admin hiện tại.
export async function updateOrderStatusAction(params: UpdateOrderStatusInput) {
  const admin = await requireAdmin()
  if ("error" in admin) return admin

  const parsed = updateOrderStatusSchema.safeParse(params)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  try {
    const order = await OrderService.updateOrderStatus(parsed.data, admin.adminId)
    // @ts-expect-error: Next.js revalidateTag types are sometimes incomplete or missing
    revalidateTag("dashboard-overview");

    // Task 3: Kích Hoạt Trigger Tự Động
    if (order && order.status === "shipped" && !order.trackingCode) {
      try {
        await SPXOrderService.createSPXOrder(order.id);
      } catch (spxError: any) {
        return { error: `Đã cập nhật trạng thái nhưng tạo đơn SPX thất bại: ${spxError.message}` };
      }
    }

    return { success: true, data: order }
  } catch (err) {
    return { error: getPublicErrorMessage(err, "Có lỗi xảy ra. Vui lòng thử lại.") }
  }
}

// Admin hủy đơn hàng, ghi history log và hoàn lại lượt dùng mã giảm giá nếu có.
export async function cancelOrderAction(params: CancelOrderInput) {
  const admin = await requireAdmin()
  if ("error" in admin) return admin

  const parsed = cancelOrderSchema.safeParse(params)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  try {
    const order = await OrderService.cancelOrder(parsed.data.order_id, parsed.data.reason, "admin")
    return { success: true, data: order }
  } catch (err) {
    return { error: getPublicErrorMessage(err, "Chưa thể hủy đơn hàng. Vui lòng thử lại.") }
  }
}

// Khách hàng hủy đơn của chính mình, action kiểm tra quyền sở hữu trước khi gọi service hủy đơn.
export async function cancelMyOrderAction(params: CancelOrderInput) {
  const session = await getSession()

  if (!session) return { error: 'Vui lòng đăng nhập để hủy đơn hàng' }
  if (session.role === 'ADMIN') return { error: 'Tài khoản quản trị vui lòng hủy đơn trong trang quản trị' }

  const parsed = cancelOrderSchema.safeParse(params)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  try {
    const order = await OrderService.getMyOrderDetail(session.sub, parsed.data.order_id)
    if (!order) return { error: 'Không tìm thấy đơn hàng phù hợp' }

    const cancelledOrder = await OrderService.cancelOrder(parsed.data.order_id, parsed.data.reason, "user")
    return { success: true, data: cancelledOrder }
  } catch (err) {
    return { error: getPublicErrorMessage(err, "Chưa thể hủy đơn hàng. Vui lòng thử lại.") }
  }
}

// Admin cập nhật thông tin vận chuyển
export async function updateOrderTrackingAction(params: UpdateOrderTrackingInput) {
  const admin = await requireAdmin()
  if ("error" in admin) return admin

  const parsed = updateOrderTrackingSchema.safeParse(params)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  try {
    const order = await OrderService.updateOrderTracking(parsed.data, admin.adminId)
    return { success: true, data: order }
  } catch (err) {
    return { error: getPublicErrorMessage(err, "Có lỗi xảy ra. Vui lòng thử lại.") }
  }
}

// TEST ONLY: Chuyển đơn hàng sang DELIVERED
export async function testDeliverOrderAction(orderId: string) {
  const admin = await requireAdmin();
  if ("error" in admin) return admin;

  try {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return { error: "Không tìm thấy đơn hàng" };

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "DELIVERED",
        history_logs: {
          create: {
            current_status: "DELIVERED",
            previous_status: order.status,
            note: "TEST: Tự động chuyển sang Giao hàng thành công",
          }
        }
      }
    });

    const statusPayload = {
      orderId: updated.id,
      orderNumber: updated.order_number,
      status: "delivered" as const,
      updatedAt: new Date().toISOString(),
      userId: updated.user_id || undefined,
    };
    await emitOrderStatusUpdatedToUser(statusPayload);

    // @ts-expect-error: Next.js revalidateTag types are sometimes incomplete or missing
    revalidateTag("dashboard-overview");
    return { success: true };
  } catch (err) {
    return { error: getPublicErrorMessage(err, "Có lỗi xảy ra.") };
  }
}
