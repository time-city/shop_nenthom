'use server'

import { DashboardService } from '../services/dashboard.service'
import { getSession } from '../session'
import {
  GetDashboardOverviewParams,
  getDashboardOverviewSchema,
} from '../validations/dashboard.schema'

async function requireAdmin() {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return { error: 'Không có quyền truy cập' }

  return null
}

export async function getDashboardOverviewAction(
  params: Partial<GetDashboardOverviewParams> = {},
) {
  const authError = await requireAdmin()
  if (authError) return authError

  const parsed = getDashboardOverviewSchema.safeParse(params)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  try {
    const overview = await DashboardService.getOverview(parsed.data)
    return { success: true, data: overview }
  } catch (err) {
    return { error: (err as Error).message }
  }
}
