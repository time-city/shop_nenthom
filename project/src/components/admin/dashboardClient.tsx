"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getFriendlyResponseError } from "@/src/lib/utils/errorMessage";
import LoadingState from "@/src/components/ui/loadingState";

import { getDashboardOverviewAction } from "@/src/lib/action/dashboard.action";
import type {
  DashboardStatsData,
  DashboardTopProduct,
  DashboardLatestOrder,
  DashboardActiveChip,
} from "@/src/lib/types/admin";

const statusLabels: Record<string, string> = {
  cancelled: "Đã huỷ",
  confirmed: "Đã xác nhận",
  pending: "Đang xác nhận",
};

export default function DashboardClient() {
  const [activeChip, setActiveChip] = useState<DashboardActiveChip>(
    "today",
  );
  const [statsData, setStatsData] = useState<DashboardStatsData | null>(null);
  const [topProducts, setTopProducts] = useState<DashboardTopProduct[]>([]);
  const [latestOrders, setLatestOrders] = useState<DashboardLatestOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fetchStats = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await getDashboardOverviewAction({ period: activeChip });
        if (cancelled) return;
        if ("error" in result && result.error) {
          setError(getFriendlyResponseError(result.error));
        } else if ("success" in result && result.success && result.data) {
          const overview = result.data;
          setStatsData({
            revenue: overview.stats.revenueCents,
            ordersCount: overview.stats.orderCount,
            customersCount: overview.stats.customerCount,
            productsSoldCount: overview.stats.soldProductCount,
          });
          setTopProducts(overview.topProducts || []);
          setLatestOrders(overview.latestOrders || []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };
    void fetchStats();
    return () => {
      cancelled = true;
    };
  }, [activeChip]);

  const stats = useMemo(() => {
    return [
      {
        change: "",
        changeType: "",
        icon: "revenue",
        label: "Doanh thu",
        value: statsData ? `${statsData.revenue.toLocaleString("vi-VN")} đ` : "—",
        svg: (
          <>
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </>
        ),
      },
      {
        change: "",
        changeType: "",
        icon: "orders",
        label: "Đơn hàng",
        value: statsData ? statsData.ordersCount.toLocaleString("vi-VN") : "—",
        svg: (
          <>
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </>
        ),
      },
      {
        change: "",
        changeType: "",
        icon: "customers",
        label: "Khách hàng",
        value: statsData ? statsData.customersCount.toLocaleString("vi-VN") : "—",
        svg: (
          <>
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </>
        ),
      },
      {
        change: "",
        changeType: "",
        icon: "products",
        label: "Sản phẩm bán được",
        value: statsData ? statsData.productsSoldCount.toLocaleString("vi-VN") : "—",
        svg: (
          <>
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </>
        ),
      },
    ];
  }, [statsData]);

  return (
    <>
      <header className="dashboard-top-header">
        <div className="dashboard-top-header-left">
          <button
            className="dashboard-mobile-toggle"
            type="button"
            aria-label="Menu"
            onClick={() => window.dispatchEvent(new Event("toggle-admin-sidebar"))}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <div>
            <h1 className="dashboard-page-title">Dashboard</h1>
            <p className="dashboard-page-subtitle">
              Xin chào, Admin! Đây là tổng quan hôm nay.
            </p>
          </div>
        </div>

        <div className="dashboard-top-header-right">
          <div className="dashboard-filter-chips">
            <button
              className={`dashboard-filter-chip ${activeChip === "today" ? "active" : ""}`}
              type="button"
              onClick={() => setActiveChip("today")}
            >
              Hôm nay
            </button>
            <button
              className={`dashboard-filter-chip ${activeChip === "week" ? "active" : ""}`}
              type="button"
              onClick={() => setActiveChip("week")}
            >
              Tuần
            </button>
            <button
              className={`dashboard-filter-chip ${activeChip === "month" ? "active" : ""}`}
              type="button"
              onClick={() => setActiveChip("month")}
            >
              Tháng
            </button>
          </div>
        </div>
      </header>

      <div className="dashboard-page-content">
        {isLoading ? (
          <div className="py-20 flex justify-center items-center">
            <LoadingState label="Đang tải dữ liệu báo cáo..." />
          </div>
        ) : error ? (
          <div className="py-20 text-center text-[#8A1119]">{error}</div>
        ) : (
          <>
            <section className="dashboard-stats-grid" aria-label="Dashboard stats">
              {stats.map((stat) => (
                <article className="dashboard-stat-card" key={stat.label}>
                  <div className="dashboard-stat-header">
                    <div className={`dashboard-stat-icon ${stat.icon}`}>
                      <svg
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        {stat.svg}
                      </svg>
                    </div>
                    {stat.change ? (
                      <span className={`dashboard-stat-change ${stat.changeType}`}>
                        {stat.change}
                      </span>
                    ) : null}
                  </div>
                  <div className="dashboard-stat-value">{stat.value}</div>
                  <div className="dashboard-stat-label">{stat.label}</div>
                </article>
              ))}
            </section>

            <section className="dashboard-grid-2">
              <div className="dashboard-card">
                <div className="dashboard-card-header">
                  <h2 className="dashboard-card-title">Top sản phẩm bán chạy</h2>
                </div>
                <div className="dashboard-card-body no-padding">
                  <div className="dashboard-table-wrapper">
                    <table className="dashboard-admin-table">
                      <thead>
                        <tr>
                          <th></th>
                          <th>Sản phẩm</th>
                          <th>Đã bán</th>
                          <th>Doanh thu</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topProducts.length > 0 ? (
                          topProducts.map((product, idx) => (
                            <tr key={product.productId}>
                              <td className="w-12 text-center text-xs font-semibold text-[#6B4C35]">#{idx + 1}</td>
                              <td className="font-medium">{product.name}</td>
                              <td className="text-center">{product.soldQuantity}</td>
                              <td className="text-right font-semibold text-[#7A1218]">
                                {product.revenueCents.toLocaleString("vi-VN")}đ
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="text-center text-[#6B4C35]">
                              Chưa có dữ liệu bán chạy
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="dashboard-card">
                <div className="dashboard-card-header">
                  <h2 className="dashboard-card-title">Đơn hàng mới nhất</h2>
                  <Link
                    href="/admin/ordersManagement"
                    className="dashboard-btn dashboard-btn-ghost dashboard-btn-sm"
                  >
                    Xem tất cả →
                  </Link>
                </div>
                <div className="dashboard-card-body no-padding">
                  <div className="dashboard-table-wrapper">
                    <table className="dashboard-admin-table">
                      <thead>
                        <tr>
                          <th>Mã đơn</th>
                          <th>Khách hàng</th>
                          <th>Tổng tiền</th>
                          <th>Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody>
                        {latestOrders.length > 0 ? (
                          latestOrders.map((order) => (
                            <tr key={order.orderNumber}>
                              <td className="font-semibold text-[#7A1218]">
                                <Link href={`/admin/ordersManagement/${order.orderNumber}`} className="hover:underline">
                                  {order.orderNumber}
                                </Link>
                              </td>
                              <td>{order.customer}</td>
                              <td className="font-semibold">
                                {order.totalCents.toLocaleString("vi-VN")}đ
                              </td>
                              <td>
                                <span className={`dashboard-status ${order.status}`}>
                                  {statusLabels[order.status] ?? order.status}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="text-center text-[#6B4C35]">
                              Chưa có dữ liệu đơn hàng
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </>
  );
}
