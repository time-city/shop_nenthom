import z from "zod";

export const scentSchema = z.object({
    name: z.string().trim().min(1, 'Tên mùi hương không được để trống').toLowerCase(),
    price_extra_cents: z.coerce.number().min(0).default(0),
    is_active: z.boolean().default(true),
});

export type ScentInput = z.infer<typeof scentSchema>

export const updateScentSchema = scentSchema.partial();

export type UpdateScentInput = z.infer<typeof updateScentSchema>

export const waxColorSchema = z.object({
    name: z.string().min(1, 'Tên không được để trống'),
    hex_code: z.string().regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, 'Mã màu không hợp lệ'),
    price_extra_cents: z.coerce.number().min(0).default(0),
    is_active: z.boolean().default(true),
})

export type WaxColorInput = z.infer<typeof waxColorSchema>


export const updateWaxColorSchema = waxColorSchema.partial();

export type UpdateWaxColorInput = z.infer<typeof updateWaxColorSchema>


export const sizeSchema = z.object({
  name: z.string().min(1, 'Tên không được để trống'),
  weight_gram: z.coerce.number().min(1, 'Khối lượng phải lớn hơn 0'),
  price_extra_cents: z.coerce.number().min(0).default(0),
  is_active: z.boolean().default(true),
})

export const updateSizeSchema = sizeSchema.partial()

export type SizeInput = z.infer<typeof sizeSchema>
export type UpdateSizeInput = z.infer<typeof updateSizeSchema>

export const packagingSchema = z.object({
  name: z.string().min(1, 'Tên không được để trống'),
  price_extra_cents: z.coerce.number().min(0).default(0),
  is_active: z.boolean().default(true),
})

export const updatePackagingSchema = packagingSchema.partial()

export type PackagingInput = z.infer<typeof packagingSchema>
export type UpdatePackagingInput = z.infer<typeof updatePackagingSchema>


export const toppingSchema = z.object({
  name: z.string().min(1, 'Tên không được để trống'),
  price_extra_cents: z.coerce.number().min(0).default(0),
  in_stock: z.boolean().default(true),
  is_active: z.boolean().default(true),
})

export const updateToppingSchema = toppingSchema.partial()

export type ToppingInput = z.infer<typeof toppingSchema>
export type UpdateToppingInput = z.infer<typeof updateToppingSchema>


export const deleteOptionSchema = z.object({
  type: z.enum(['scent', 'waxColor', 'size', 'packaging', 'topping']),
  id: z.coerce.number().int().positive('ID phải là số nguyên dương'),
})

export type DeleteOptionInput = z.infer<typeof deleteOptionSchema>
