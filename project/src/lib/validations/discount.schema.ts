import { z } from 'zod'

const discountBaseSchema = z.object({
  code: z.string().min(1, 'Mã giảm giá không được để trống').toUpperCase(),
  discount_amount_cents: z.coerce.number().min(1, 'Giá trị giảm phải lớn hơn 0'),
  type: z.enum(['PERCENTAGE', 'FIXED']),
  max_uses: z.coerce.number().int().min(1, 'Số lần dùng tối thiểu là 1'),
  is_active: z.boolean().default(true),
  expires_at: z.coerce.date().optional(),
})

function validatePercentageDiscount(
  data: Partial<z.infer<typeof discountBaseSchema>>,
  ctx: z.RefinementCtx,
) {
  if (data.type === 'PERCENTAGE' && data.discount_amount_cents && data.discount_amount_cents > 100) {
    ctx.addIssue({
      code: 'custom',
      message: 'Phần trăm giảm giá không được vượt quá 100',
      path: ['discount_amount_cents'],
    })
  }
}

export const createDiscountSchema = discountBaseSchema.superRefine((data, ctx) => {
  validatePercentageDiscount(data, ctx)
})

export const updateDiscountSchema = discountBaseSchema.partial().superRefine((data, ctx) => {
  validatePercentageDiscount(data, ctx)
})

export const getDiscountsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().optional(),
  type: z.enum(['PERCENTAGE', 'FIXED']).optional(),
  is_active: z.boolean().optional(),
})

export type CreateDiscountInput = z.infer<typeof createDiscountSchema>
export type UpdateDiscountInput = z.infer<typeof updateDiscountSchema>
export type GetDiscountsParams = z.infer<typeof getDiscountsSchema>

export const discountIdSchema = z.object({
    id: z.string().uuid('Mã giảm giá không hợp lệ'),
})

export const disableDiscountSchema = discountIdSchema

export type DisableDiscountInput = z.infer<typeof disableDiscountSchema>
