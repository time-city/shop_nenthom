import { z } from 'zod';

export const createCategorySchema = z.object({
    name: z.string().trim().min(1, 'Tên danh mục không được để trống').toLowerCase(),
    description: z.string().optional(),
    is_active: z.boolean().default(true),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;

export const updateCategorySchema = createCategorySchema.partial();

export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;

export const deleteCategorySchema = z.object({
    id: z.coerce.number().int().positive('Không thể xác định danh mục. Vui lòng tải lại trang.'),
});

export type DeleteCategoryInput = z.infer<typeof deleteCategorySchema>;
