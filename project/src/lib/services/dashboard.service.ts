import { OrderStatus, Prisma } from '@prisma/client'
import { unstable_cache } from 'next/cache'
import prisma from '../prisma'
import { orderStatusMap } from '../types/order'
import { GetDashboardOverviewParams } from '../validations/dashboard.schema'

type DashboardQueryRow = {
  customer_count: number | bigint
  latest_orders: Array<{
    createdAt: string
    customer: string
    orderNumber: string
    status: OrderStatus
    totalCents: number
  }>
  order_count: number | bigint
  revenue_cents: number | bigint
  sold_product_count: number | bigint
  top_products: Array<{
    name: string
    productId: string
    revenueCents: number
    soldQuantity: number
  }>
}

function getPeriodDateRange(period: GetDashboardOverviewParams['period']) {
  const now = new Date()
  const start = new Date(now)

  if (period === 'today') {
    start.setUTCHours(0, 0, 0, 0)
  }

  if (period === 'week') {
    start.setUTCDate(now.getUTCDate() - 6)
    start.setUTCHours(0, 0, 0, 0)
  }

  if (period === 'month') {
    start.setUTCDate(1)
    start.setUTCHours(0, 0, 0, 0)
  }

  return { end: now, start }
}

async function getDashboardOverview(
  period: GetDashboardOverviewParams['period'],
) {
  const { end, start } = getPeriodDateRange(period)
  const rows = await prisma.$queryRaw<DashboardQueryRow[]>(Prisma.sql`
    WITH filtered_orders AS (
      SELECT
        "id",
        "created_at",
        "order_number",
        "shipping_fullname",
        "status",
        "total_cents"
      FROM "public"."orders"
      WHERE "created_at" >= ${start}
        AND "created_at" <= ${end}
        AND "status" <> 'CANCELLED'
    ),
    order_stats AS (
      SELECT
        COUNT(*) AS "order_count",
        COALESCE(SUM("total_cents"), 0) AS "revenue_cents"
      FROM filtered_orders
    ),
    customer_stats AS (
      SELECT COUNT(*) AS "customer_count"
      FROM "public"."users"
      WHERE "role" = 'CUSTOMER'
        AND "created_at" >= ${start}
        AND "created_at" <= ${end}
    ),
    product_stats AS (
      SELECT
        COALESCE(SUM(oi."quantity"), 0) AS "sold_product_count"
      FROM "public"."order_items" oi
      INNER JOIN filtered_orders orders ON orders."id" = oi."order_id"
    ),
    latest_orders AS (
      SELECT COALESCE(
        JSONB_AGG(
          JSONB_BUILD_OBJECT(
            'createdAt', latest."created_at",
            'customer', latest."shipping_fullname",
            'orderNumber', latest."order_number",
            'status', latest."status",
            'totalCents', latest."total_cents"
          )
          ORDER BY latest."created_at" DESC
        ),
        '[]'::JSONB
      ) AS "items"
      FROM (
        SELECT *
        FROM filtered_orders
        ORDER BY "created_at" DESC
        LIMIT 5
      ) latest
    ),
    top_products AS (
      SELECT COALESCE(
        JSONB_AGG(
          JSONB_BUILD_OBJECT(
            'productId', ranked."product_id",
            'name', ranked."name",
            'soldQuantity', ranked."sold_quantity",
            'revenueCents', ranked."revenue_cents"
          )
          ORDER BY ranked."sold_quantity" DESC, ranked."revenue_cents" DESC
        ),
        '[]'::JSONB
      ) AS "items"
      FROM (
        SELECT
          oi."product_id",
          COALESCE(product."name", 'Sản phẩm ẩn') AS "name",
          SUM(oi."quantity") AS "sold_quantity",
          SUM(oi."unit_price_cents" * oi."quantity") AS "revenue_cents"
        FROM "public"."order_items" oi
        INNER JOIN filtered_orders orders ON orders."id" = oi."order_id"
        LEFT JOIN "public"."products" product ON product."id" = oi."product_id"
        GROUP BY oi."product_id", product."name"
        ORDER BY "sold_quantity" DESC, "revenue_cents" DESC
        LIMIT 5
      ) ranked
    )
    SELECT
      order_stats."order_count",
      order_stats."revenue_cents",
      customer_stats."customer_count",
      product_stats."sold_product_count",
      latest_orders."items" AS "latest_orders",
      top_products."items" AS "top_products"
    FROM order_stats
    CROSS JOIN customer_stats
    CROSS JOIN product_stats
    CROSS JOIN latest_orders
    CROSS JOIN top_products
  `)

  const overview = rows[0]

  if (!overview) {
    throw new Error('Không thể tải dữ liệu tổng quan. Vui lòng thử lại.')
  }

  return {
    latestOrders: overview.latest_orders.map((order) => ({
      ...order,
      createdAt: new Date(order.createdAt).toISOString(),
      status: orderStatusMap[order.status],
    })),
    period,
    stats: {
      customerCount: Number(overview.customer_count),
      orderCount: Number(overview.order_count),
      revenueCents: Number(overview.revenue_cents),
      soldProductCount: Number(overview.sold_product_count),
    },
    topProducts: overview.top_products.map((product) => ({
      ...product,
      revenueCents: Number(product.revenueCents),
      soldQuantity: Number(product.soldQuantity),
    })),
  }
}

const getCachedDashboardOverview = unstable_cache(
  getDashboardOverview,
  ['dashboard-overview'],
  {
    revalidate: 600,
    tags: ['dashboard-overview'],
  },
)

export const DashboardService = {
  async getOverview(params: GetDashboardOverviewParams) {
    try {
      return await getCachedDashboardOverview(params.period)
    } finally {}
  },
}
