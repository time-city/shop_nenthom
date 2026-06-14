'use server'

import { cookies } from "next/headers";
import { OrderService } from "../services/order.service";
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

async function requireAdmin() {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return { error: 'Không có quyền truy cập' }

  return session
}

// Tạo đơn hàng từ giỏ hàng hiện tại, hỗ trợ cả user đăng nhập và guest session.
export async function createOrderAction(params: CreateOrderInput) {
  const parsed = createOrderSchema.safeParse(params)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  try {
    const { userId, sessionId } = await getCartIdentity()
    const order = await OrderService.createOrder(parsed.data, userId, sessionId)
    return { success: true, data: order }
  } catch (err) {
    return { error: (err as Error).message }
  }
}

// Lấy lịch sử đơn hàng của khách hàng đang đăng nhập.
export async function getMyOrdersAction() {
  const session = await getSession()

  if (!session) return { error: 'Vui lòng đăng nhập để xem lịch sử đơn hàng' }
  if (session.role === 'ADMIN') return { error: 'Tài khoản quản trị không có lịch sử mua hàng' }

  try {
    const orders = await OrderService.getMyOrders(session.sub)
    return { success: true, data: orders }
  } catch (err) {
    return { error: (err as Error).message }
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
    return { error: (err as Error).message }
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
    return { error: (err as Error).message }
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
    return { error: (err as Error).message }
  }
}

// Admin cập nhật trạng thái đơn hàng và ghi history log với admin hiện tại.
export async function updateOrderStatusAction(params: UpdateOrderStatusInput) {
  const admin = await requireAdmin()
  if ("error" in admin) return admin

  const parsed = updateOrderStatusSchema.safeParse(params)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  try {
    const order = await OrderService.updateOrderStatus(parsed.data, admin.sub)
    return { success: true, data: order }
  } catch (err) {
    return { error: (err as Error).message }
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
    return { error: (err as Error).message }
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
    return { error: (err as Error).message }
  }
}
