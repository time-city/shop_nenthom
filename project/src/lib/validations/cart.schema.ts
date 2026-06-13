import z from "zod"

export const addToCartSchema = z.object({
  product_id: z.string().uuid('Product ID không hợp lệ').optional(),
  quantity: z.coerce.number().min(1).default(1),
  scent_id: z.coerce.number().optional(),
  color_id: z.coerce.number().optional(),
  size_id: z.coerce.number().optional(),
  pack_id: z.coerce.number().optional(),
  toppings_json: z.array(z.number()).optional(),
})

export type AddToCartInput = z.infer<typeof addToCartSchema>

export const updateCartItemSchema = z.object({
    itemId: z.string().uuid('Item ID không hợp lệ'),
    quantity: z.coerce.number().min(1, 'Số lượng tối thiểu là 1'),
})

export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>

export const removeCartItemSchema = z.object({
    itemId: z.string().uuid('Item ID không hợp lệ'),
})

export type RemoveCartItemInput = z.infer<typeof removeCartItemSchema>
