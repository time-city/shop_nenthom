import z from "zod"

export const addToCartSchema = z.object({
  product_id: z.string().uuid('Product ID không hợp lệ'),
  quantity: z.coerce.number().min(1).default(1),
  scent_id: z.coerce.number().optional(),
  color_id: z.coerce.number().optional(),
  size_id: z.coerce.number().optional(),
  pack_id: z.coerce.number().optional(),
  toppings_json: z.array(z.number()).optional(),
})

export type AddToCartInput = z.infer<typeof addToCartSchema>
