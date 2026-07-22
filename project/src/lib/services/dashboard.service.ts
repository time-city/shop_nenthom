import { OrderStatus, Prisma } from '@prisma/client'
import { unstable_cache } from 'next/cache'
import prisma from '../prisma' // Sửa lại đường dẫn import prisma nếu cần
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
  chart_raw_data: Array<{
    createdAt: string
    totalCents: number
    identifier: string
    quantity: number
  }>
}

function getPeriodDateRange(period: GetDashboardOverviewParams['period']) {
  const now = new Date();
  
  // Lấy chuỗi ngày tháng ở múi giờ Việt Nam
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = formatter.formatToParts(now);
  const year = parts.find(p => p.type === 'year')?.value;
  const month = parts.find(p => p.type === 'month')?.value;
  const day = parts.find(p => p.type === 'day')?.value;

  // Dựng chuỗi ISO chuẩn giờ VN (UTC+7) cho 0h sáng hôm nay
  const todayVnIso = `${year}-${month}-${day}T00:00:00.000+07:00`;
  const startUTC = new Date(todayVnIso);

  if (period === 'week') {
    startUTC.setDate(startUTC.getDate() - 6);
  } else if (period === 'month') {
    startUTC.setDate(startUTC.getDate() - 29);
  }

  return { end: now, start: startUTC }
}

async function getDashboardOverview(
  period: GetDashboardOverviewParams['period'],
) {
  const { end, start } = getPeriodDateRange(period)
  console.log(`[getDashboardOverview] period: ${period}, start: ${start.toISOString()}, end: ${end.toISOString()}`)
  
  const rows = await prisma.$queryRaw<DashboardQueryRow[]>(Prisma.sql`
    WITH filtered_orders AS (
      SELECT
        "id",
        "created_at",
        "order_number",
        "shipping_fullname",
        "status",
        "total_cents",
        COALESCE("user_id"::text, "shipping_phone") AS "identifier"
      FROM "public"."orders"
      WHERE "created_at" >= ${start}
        AND "created_at" <= ${end}
        AND "status" NOT IN ('CANCELLED', 'CANCEL_REQUESTED')
    ),
    order_stats AS (
      SELECT
        COUNT(*) AS "order_count",
        COALESCE(SUM("total_cents"), 0) AS "revenue_cents"
      FROM filtered_orders
    ),
    customer_stats AS (
      -- Đã Fix: Đếm số lượng khách hàng UNIQUE thực tế phát sinh đơn hàng
      SELECT COUNT(DISTINCT "identifier") AS "customer_count"
      FROM filtered_orders
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
    ),
    chart_raw_data AS (
      -- Kéo toàn bộ data thô của các đơn hàng để làm biểu đồ
      SELECT COALESCE(
        JSONB_AGG(
          JSONB_BUILD_OBJECT(
            'createdAt', orders."created_at",
            'totalCents', orders."total_cents",
            'identifier', orders."identifier",
            'quantity', COALESCE((SELECT SUM(quantity) FROM "public"."order_items" WHERE order_id = orders."id"), 0)
          )
        ),
        '[]'::JSONB
      ) AS "items"
      FROM filtered_orders orders
    )
    SELECT
      order_stats."order_count",
      order_stats."revenue_cents",
      customer_stats."customer_count",
      product_stats."sold_product_count",
      latest_orders."items" AS "latest_orders",
      top_products."items" AS "top_products",
      chart_raw_data."items" AS "chart_raw_data"
    FROM order_stats
    CROSS JOIN customer_stats
    CROSS JOIN product_stats
    CROSS JOIN latest_orders
    CROSS JOIN top_products
    CROSS JOIN chart_raw_data
  `)

  const overview = rows[0]

  if (!overview) {
    throw new Error('Không thể tải dữ liệu tổng quan. Vui lòng thử lại.')
  }

  // ==========================================
  // THUẬT TOÁN BUCKETING (Tạo mốc thời gian & điền số 0)
  // ==========================================
  const chartMap = new Map();
  const now = new Date();
  const daysToGenerate = period === 'today' ? 0 : (period === 'week' ? 7 : 30);

  // 1. Dựng sẵn các mốc thời gian rỗng (chứa toàn số 0)
  if (period === "today") {
    for (let i = 0; i <= 23; i++) {
      const hourLabel = `${i.toString().padStart(2, "0")}:00`;
      chartMap.set(hourLabel, { revenue: 0, orders: 0, customers: new Set(), products: 0 });
    }
  } else {
    for (let i = daysToGenerate - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateLabel = `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}`;
      chartMap.set(dateLabel, { revenue: 0, orders: 0, customers: new Set(), products: 0 });
    }
  }

  // 2. Phân loại data thực tế vào các mốc thời gian
  overview.chart_raw_data.forEach((order) => {
    // Append 'Z' to ensure JS parses it as UTC, avoiding timezone shift
    const dateStr = order.createdAt.endsWith('Z') ? order.createdAt : `${order.createdAt}Z`;
    const orderDate = new Date(dateStr);
    let bucketKey = "";
    
    if (period === "today") {
      bucketKey = `${orderDate.getHours().toString().padStart(2, "0")}:00`;
    } else {
      bucketKey = `${orderDate.getDate().toString().padStart(2, "0")}/${(orderDate.getMonth() + 1).toString().padStart(2, "0")}`;
    }

    if (chartMap.has(bucketKey)) {
      const bucket = chartMap.get(bucketKey);
      bucket.revenue += order.totalCents;
      bucket.orders += 1;
      bucket.products += order.quantity;
      if (order.identifier) bucket.customers.add(order.identifier);
    }
  });

  // 3. Format lại cho mảng Recharts
  const finalChartData = Array.from(chartMap.entries()).map(([date, data]) => ({
    date,
    revenue: data.revenue,
    orders: data.orders,
    customers: data.customers.size,
    products: data.products,
  }));

  return {
    latestOrders: overview.latest_orders.map((order) => {
      const dateStr = order.createdAt.endsWith('Z') ? order.createdAt : `${order.createdAt}Z`;
      return {
        ...order,
        createdAt: new Date(dateStr).toISOString(),
        status: orderStatusMap[order.status],
      };
    }),
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
    // Gắn mảng chart hoàn chỉnh vào đây
    chartData: finalChartData,
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
      return await getDashboardOverview(params.period)
    } finally {}
  },
}