'use server'
import { getPublicErrorMessage } from "../utils/publicError";

import { DashboardService } from '../services/dashboard.service'
import { requireAdmin } from '../requireAdmin'
import {
  GetDashboardOverviewParams,
  getDashboardOverviewSchema,
} from '../validations/dashboard.schema'

export async function getDashboardOverviewAction(
  params: Partial<GetDashboardOverviewParams> = {},
) {
  const authError = await requireAdmin()
  if ("error" in authError) return authError

  const parsed = getDashboardOverviewSchema.safeParse(params)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  try {
    const overview = await DashboardService.getOverview(parsed.data)
    return { success: true, data: overview }
  } catch (err) {
    return { error: getPublicErrorMessage(err, "Có lỗi xảy ra. Vui lòng thử lại.") }
  }
}


