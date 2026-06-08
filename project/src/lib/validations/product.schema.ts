import { z } from 'zod';

export const productSchema = z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(12),
    categoryId: z.coerce.number().optional(),
    search: z.string().optional(),
});

export type GetProductsParams = z.infer<typeof productSchema>;


export const createProductSchema = z.object({
    category_id: z.coerce.number().int().positive('Category không hợp lệ'),
    name: z.string().min(1, 'Tên sản phẩm không được để trống'),
    base_price_cents: z.coerce.number().min(0, 'Giá không hợp lệ'),
    description: z.string().optional(),
    images: z.array(z.string().url('URL ảnh không hợp lệ')).min(1, 'Cần ít nhất 1 ảnh'),
    is_active: z.boolean().default(true),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;


export const updateProductSchema = createProductSchema.partial();

export type UpdateProductInput = z.infer<typeof updateProductSchema>;


export const deleteProductSchema = z.object({
    id: z.string().min(1, 'ID sản phẩm không hợp lệ'),
})

export type DeleteProductInput = z.infer<typeof deleteProductSchema>;
