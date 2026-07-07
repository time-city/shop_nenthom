import { z } from 'zod';

export const createReviewSchema = z.object({
  productId: z.string().uuid("ID sản phẩm không hợp lệ"),
  rating: z.number().int().min(1).max(5, "Số sao phải từ 1 đến 5"),
  content: z.string().min(3, "Bình luận quá ngắn").max(1000, "Bình luận quá dài"),
  images: z.array(z.string().url()).max(5, "Tối đa 5 hình ảnh").optional(),
});

export const getReviewsSchema = z.object({
  productId: z.string().uuid("ID sản phẩm không hợp lệ").optional(),
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(50).optional().default(10),
  status: z.enum(['all', 'published', 'pending']).optional().default('published'),
  rating: z.coerce.number().optional(),
});

export const updateReviewStatusSchema = z.object({
  reviewId: z.string().uuid("ID đánh giá không hợp lệ"),
  is_published: z.boolean(),
});

export const replyReviewSchema = z.object({
  reviewId: z.string().uuid("ID đánh giá không hợp lệ"),
  admin_reply: z.string().min(1, "Nội dung phản hồi không được để trống").max(2000, "Phản hồi quá dài"),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type GetReviewsInput = z.infer<typeof getReviewsSchema>;
export type UpdateReviewStatusInput = z.infer<typeof updateReviewStatusSchema>;
export type ReplyReviewInput = z.infer<typeof replyReviewSchema>;
