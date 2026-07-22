"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useRef } from "react";
import useSWR from "swr";
import { getFriendlyResponseError } from "@/src/lib/utils/errorMessage";
import LoadingState from "@/src/components/ui/loadingState";

import { getDashboardOverviewAction } from "@/src/lib/action/dashboard.action";
import type {
  DashboardStatsData,
  DashboardTopProduct,
  DashboardLatestOrder,
  DashboardActiveChip,
} from "@/src/lib/types/admin";
import { callAction } from "@/src/lib/utils/callAction";
import AdminHeader from "@/src/components/admin/layout/AdminHeader";
import TableResponsiveWrapper from "@/src/components/admin/common/TableResponsiveWrapper";
import DashboardLineChart, {
  type DashboardChartDatum,
} from "./DashboardLineChart";


const statusLabels: Record<string, string> = {
  cancelled: "Đã huỷ",
  confirmed: "Đã xác nhận",
  pending: "Đang xác nhận",
};

function FilterTabs({
  activeChip,
  setActiveChip,
  fullWidth = false,
}: {
  activeChip: DashboardActiveChip;
  setActiveChip: (chip: DashboardActiveChip) => void;
  fullWidth?: boolean;
}) {
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const updateIndicator = () => {
      const activeBtn = containerRef.current?.querySelector(".dashboard-filter-chip.active") as HTMLElement;
      if (activeBtn) {
        setIndicatorStyle({
          left: activeBtn.offsetLeft,
          width: activeBtn.offsetWidth,
          opacity: 1,
        });
      }
    };
    
    // Slight delay to ensure fonts/layout are ready
    setTimeout(updateIndicator, 0);
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [activeChip]);

  return (
    <div
      className={`dashboard-filter-chips relative ${fullWidth ? "w-full flex box-border" : ""}`}
      ref={containerRef}
    >
      <div
        className="absolute top-[3px] bottom-[3px] bg-white rounded-[6px] transition-all duration-200 ease-out pointer-events-none"
        style={{ ...indicatorStyle, zIndex: 0, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}
      />
      {[
        { id: "today", label: "Hôm nay" },
        { id: "week", label: "Tuần" },
        { id: "month", label: "Tháng" },
      ].map((tab) => (
        <button
          key={tab.id}
          className={`dashboard-filter-chip relative z-10 ${fullWidth ? "flex-1 text-center" : ""} transition-colors duration-200 ${activeChip === tab.id ? "active" : ""}`}
          type="button"
          onClick={() => setActiveChip(tab.id as DashboardActiveChip)}
          style={{ background: "transparent" }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export default function DashboardClient() {
  const [activeChip, setActiveChip] = useState<DashboardActiveChip>(
    "today",
  );
  const [statsData, setStatsData] = useState<DashboardStatsData | null>(null);
  const [topProducts, setTopProducts] = useState<DashboardTopProduct[]>([]);
  const [latestOrders, setLatestOrders] = useState<DashboardLatestOrder[]>([]);
  const { data: fetchResult, isLoading: isSwrLoading, error: swrError } = useSWR(
    ['admin-dashboard', activeChip],
    async () => {
      console.log("[Data Source] 🟡 NETWORK QUERY - dashboardClient: Fetching overview...");
      const result = await Promise.race([
        callAction(() => getDashboardOverviewAction({ period: activeChip }), "Không thể tải dữ liệu tổng quan. Vui lòng thử lại sau."),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Kết nối quá hạn, vui lòng tải lại trang hoặc thử lại.")), 10000))
      ]) as Awaited<ReturnType<typeof getDashboardOverviewAction>>;
      
      if ("error" in result && result.error) {
        throw new Error(getFriendlyResponseError(result.error));
      }
      return result;
    }
  );

  useEffect(() => {
    if (fetchResult && "success" in fetchResult && fetchResult.success) {
      console.log("[Data Source] 🟢 UI UPDATED - dashboardClient: Displaying overview data (from SWR Cache or Network)");
      const overview = fetchResult.data;

      setStatsData({
        revenue: overview.stats.revenueCents,
        ordersCount: overview.stats.orderCount,
        customersCount: overview.stats.customerCount,
        productsSoldCount: overview.stats.soldProductCount,
      });
      setTopProducts(overview.topProducts || []);
      setLatestOrders(overview.latestOrders || []);
    }
  }, [fetchResult]);

  const isLoading = isSwrLoading && !statsData;
  const error = swrError ? (swrError instanceof Error ? swrError.message : String(swrError)) : null;

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
      <AdminHeader
        title="Dashboard"
        subtitle="Xin chào, Admin! Đây là tổng quan hôm nay."
      >
        <FilterTabs activeChip={activeChip} setActiveChip={setActiveChip} />
      </AdminHeader>

      <div className="dashboard-page-content">
        {/* Mobile filter chips */}
        <div className="flex lg:hidden justify-center mb-6 w-full box-border">
          <FilterTabs activeChip={activeChip} setActiveChip={setActiveChip} fullWidth />
        </div>
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
                <article className="dashboard-stat-card flex items-center justify-between gap-4" key={stat.label}>


                  <div className="flex items-center gap-4">
                    <div className={`dashboard-stat-icon ${stat.icon}`}>
                      <svg
                        width="24"
                        height="24"
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
                    <div className="flex flex-col">
                      <div className="dashboard-stat-label">{stat.label}</div>
                      <div className="dashboard-stat-value">{stat.value}</div>
                    </div>
                  </div>
                  {stat.change ? (
                    <span className={`dashboard-stat-change ${stat.changeType}`}>
                      {stat.change}
                    </span>
                  ) : null}
                </article>
              ))}
            </section>

            {/* Line chart */}
            {statsData && (
              <section className="mb-6 mt-6">
                {(() => {
                  const chartDataRaw = (fetchResult as any)?.data?.chartData;
                  console.log("[DashboardClient] chartDataRaw:", chartDataRaw);

                  const normalized: DashboardChartDatum[] = Array.isArray(chartDataRaw)
                    ? (chartDataRaw as DashboardChartDatum[])
                    : [];

                  console.log(
                    "[DashboardClient] chartData normalized:",
                    {
                      length: normalized.length,
                      first: normalized[0],
                    }
                  );

                  return <DashboardLineChart data={normalized} />;
                })()}
              </section>
            )}



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
                              <td className="w-12 text-center text-xs font-bold text-[#6B1218]">#{idx + 1}</td>
                              <td className="font-medium">{product.name}</td>
                              <td className="text-center text-gray-500">{product.soldQuantity}</td>
                              <td className="text-right font-semibold text-[#6B1218]">
                                {product.revenueCents.toLocaleString("vi-VN")}đ
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="text-center text-gray-400 py-8">
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
                    <TableResponsiveWrapper minWidth={600}>
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
                                <td className="font-semibold text-[#6B1218]">
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
                              <td colSpan={4} className="text-center text-gray-400 py-8">
                                Chưa có dữ liệu đơn hàng
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </TableResponsiveWrapper>
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
