import { z } from 'zod'

export const dashboardPeriodSchema = z.enum(['today', 'week', 'month'])

export const getDashboardOverviewSchema = z.object({
  period: dashboardPeriodSchema.default('today'),
})

export type DashboardPeriod = z.infer<typeof dashboardPeriodSchema>
export type GetDashboardOverviewParams = z.infer<typeof getDashboardOverviewSchema>
