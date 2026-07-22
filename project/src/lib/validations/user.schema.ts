import { z } from 'zod'

export const userStatusSchema = z.enum(['ACTIVE', 'LOCKED'])

export const getUsersSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  status: userStatusSchema.optional(),
  search: z.string().trim().optional(),
})

export const updateProfileSchema = z.object({
    fullname: z.string().trim().min(3, 'Họ và tên không được để trống'),
    phone: z.string().trim().regex(/^(0[3|5|7|8|9])+([0-9]{8})$/, 'Số điện thoại không hợp lệ'),
    address: z.string().trim().optional(),
    city: z.string().trim().optional(),
    postal_code: z.string().trim().optional(),
})

export type UpdateProfileFormState = z.infer<typeof updateProfileSchema>;


export type GetUsersParams = z.infer<typeof getUsersSchema>

export const userIdSchema = z.object({
  id: z.string().uuid('Tài khoản không hợp lệ'),
})

export type UserIdInput = z.infer<typeof userIdSchema>

export const updateUserStatusSchema = userIdSchema.extend({
  status: userStatusSchema,
})

export type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>
