'use server'

import { OrderService } from "../services/order.service";
import { getSession } from "../session";
import {
  GetListOrdersParams,
  getListOrdersSchema,
} from "../validations/order.schema";

async function requireAdmin() {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return { error: 'Không có quyền truy cập' }

  return null
}

export async function getListOrderAction(params: Partial<GetListOrdersParams> = {}) {
  const authError = await requireAdmin()
  if (authError) return authError

  const parsed = getListOrdersSchema.safeParse(params)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  try {
    const orders = await OrderService.getListOrder(parsed.data)
    return { success: true, ...orders }
  } catch (err) {
    return { error: (err as Error).message }
  }
}
