import { z } from 'zod'

export const getListOrdersSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  page: z.coerce.number().int().min(1).default(1),
  search: z.string().trim().optional(),
  status: z.enum(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']).optional(),
})

export type GetListOrdersParams = z.infer<typeof getListOrdersSchema>
