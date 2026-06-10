import { z } from 'zod'

export const submitContactSchema = z.object({
  name: z.string().min(1, 'Tên không được để trống'),
  email: z.string().email('Email không hợp lệ'),
  subject: z.string().min(1, 'Tiêu đề không được để trống'),
  message: z.string().min(10, 'Nội dung ít nhất 10 ký tự'),
})

export type SubmitContactInput = z.infer<typeof submitContactSchema>

export const contactStatusSchema = z.enum(['PENDING', 'REPLIED'])

export const getContactsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  status: contactStatusSchema.optional(),
  search: z.string().trim().optional(),
})

export type GetContactsParams = z.infer<typeof getContactsSchema>

export const updateContactStatusSchema = z.object({
  id: z.string().uuid('ID liên hệ không hợp lệ'),
  status: contactStatusSchema,
})

export type UpdateContactStatusInput = z.infer<typeof updateContactStatusSchema>
