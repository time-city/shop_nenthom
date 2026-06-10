import { z } from 'zod'

export const createDiscountSchema = z.object({
  code: z.string().min(1, 'Mã giảm giá không được để trống').toUpperCase(),
  discount_amount_cents: z.coerce.number().min(1, 'Giá trị giảm phải lớn hơn 0'),
  type: z.enum(['PERCENTAGE', 'FIXED']),
  max_uses: z.coerce.number().int().min(1, 'Số lần dùng tối thiểu là 1'),
  is_active: z.boolean().default(true),
  expires_at: z.coerce.date().optional(),
}).superRefine((data, ctx) => {
  if (data.type === 'PERCENTAGE' && data.discount_amount_cents > 100) {
    ctx.addIssue({
      code: 'custom',
      message: 'Phần trăm giảm giá không được vượt quá 100',
      path: ['discount_amount_cents'],
    })
  }
})

export const updateDiscountSchema = createDiscountSchema.partial()

export type CreateDiscountInput = z.infer<typeof createDiscountSchema>
export type UpdateDiscountInput = z.infer<typeof updateDiscountSchema>

export const discountIdSchema = z.object({
    id: z.string().uuid('Mã giảm giá không hợp lệ'),
})

export const disableDiscountSchema = discountIdSchema

export type DisableDiscountInput = z.infer<typeof disableDiscountSchema>
