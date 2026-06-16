import { OrderStatus, Prisma } from '@prisma/client'
import prisma from '../prisma'
import { orderStatusMap } from '../types/order'
import { GetDashboardOverviewParams } from '../validations/dashboard.schema'

function getPeriodDateRange(period: GetDashboardOverviewParams['period']) {
  const now = new Date()
  const start = new Date(now)

  if (period === 'today') {
    start.setHours(0, 0, 0, 0)
  }

  if (period === 'week') {
    start.setDate(now.getDate() - 6)
    start.setHours(0, 0, 0, 0)
  }

  if (period === 'month') {
    start.setDate(1)
    start.setHours(0, 0, 0, 0)
  }

  return { end: now, start }
}

export const DashboardService = {
  async getOverview(params: GetDashboardOverviewParams) {
    const { end, start } = getPeriodDateRange(params.period)
    const orderWhere: Prisma.OrderWhereInput = {
      created_at: {
        gte: start,
        lte: end,
      },
      status: {
        not: OrderStatus.CANCELLED,
      },
    }

    const [
      revenue,
      orderCount,
      customerCount,
      orderItems,
      latestOrders,
    ] = await prisma.$transaction([
      prisma.order.aggregate({
        where: orderWhere,
        _sum: { total_cents: true },
      }),
      prisma.order.count({ where: orderWhere }),
      prisma.user.count({
        where: {
          role: 'CUSTOMER',
          created_at: {
            gte: start,
            lte: end,
          },
        },
      }),
      prisma.orderItem.findMany({
        where: {
          order: orderWhere,
        },
        select: {
          product_id: true,
          quantity: true,
          unit_price_cents: true,
          product: {
            select: {
              name: true,
            },
          },
        },
      }),
      prisma.order.findMany({
        where: orderWhere,
        orderBy: { created_at: 'desc' },
        take: 5,
        select: {
          created_at: true,
          order_number: true,
          shipping_fullname: true,
          status: true,
          total_cents: true,
        },
      }),
    ])

    const topProductMap = new Map<
      string,
      { name: string; productId: string; revenueCents: number; soldQuantity: number }
    >()

    for (const item of orderItems) {
      const current = topProductMap.get(item.product_id) ?? {
        name: item.product.name,
        productId: item.product_id,
        revenueCents: 0,
        soldQuantity: 0,
      }

      current.soldQuantity += item.quantity
      current.revenueCents += item.unit_price_cents * item.quantity
      topProductMap.set(item.product_id, current)
    }

    const topProducts = [...topProductMap.values()]
      .sort((first, second) => {
        if (second.soldQuantity !== first.soldQuantity) {
          return second.soldQuantity - first.soldQuantity
        }

        return second.revenueCents - first.revenueCents
      })
      .slice(0, 5)

    const soldProductCount = orderItems.reduce(
      (total, item) => total + item.quantity,
      0,
    )

    return {
      latestOrders: latestOrders.map((order) => ({
        createdAt: order.created_at.toISOString(),
        customer: order.shipping_fullname,
        orderNumber: order.order_number,
        status: orderStatusMap[order.status],
        totalCents: order.total_cents,
      })),
      period: params.period,
      stats: {
        customerCount,
        orderCount,
        revenueCents: revenue._sum.total_cents ?? 0,
        soldProductCount,
      },
      topProducts,
    }
  },
}
