import { z } from 'zod'

export const createOrderSchema = z.object({
  cart_item_ids: z.array(
    z.string().uuid('Sản phẩm trong giỏ hàng không hợp lệ. Vui lòng tải lại trang.'),
  ).min(1, 'Chọn ít nhất 1 sản phẩm'),
  discount_code: z.string().trim().optional(),
  guest_email: z.string().trim().email('Email không hợp lệ').optional(),
  guest_phone: z.string().trim().optional(),
  payment_method: z.enum(['COD', 'BANK_TRANSFER']),
  shipping_address: z.string().trim().min(1, 'Vui lòng nhập địa chỉ'),
  shipping_city: z.string().trim().min(1, 'Vui lòng chọn thành phố'),
  shipping_fullname: z.string().trim().min(1, 'Vui lòng nhập họ tên'),
  shipping_note: z.string().trim().optional(),
  shipping_phone: z
    .string()
    .trim()
    .regex(/^(0[35789])+([0-9]{8})$/, 'Số điện thoại không hợp lệ'),
})

export const getListOrdersSchema = z.object({
  end_date: z.coerce.date().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  page: z.coerce.number().int().min(1).default(1),
  search: z.string().trim().optional(),
  search_keyword: z.string().trim().optional(),
  start_date: z.coerce.date().optional(),
  status: z.enum(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']).optional(),
}).refine(
  ({ end_date, start_date }) =>
    !end_date || !start_date || start_date <= end_date,
  {
    message: 'Ngày bắt đầu không được lớn hơn ngày kết thúc',
    path: ['start_date'],
  },
)

export const orderNumberSchema = z.object({
  order_number: z.string().trim().min(1, 'Không tìm thấy đơn hàng phù hợp'),
})

export const updateOrderStatusSchema = orderNumberSchema.extend({
  note: z.string().trim().optional(),
  status: z.enum(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED']),
})

export const cancelOrderSchema = z.object({
  order_id: z.string().trim().min(1, 'Không tìm thấy đơn hàng phù hợp'),
  reason: z.string().trim().min(1, 'Vui lòng nhập lý do hủy đơn'),
})

export type CancelOrderInput = z.infer<typeof cancelOrderSchema>
export type CreateOrderInput = z.infer<typeof createOrderSchema>
export type GetListOrdersParams = z.infer<typeof getListOrdersSchema>
export type OrderNumberInput = z.infer<typeof orderNumberSchema>
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>
