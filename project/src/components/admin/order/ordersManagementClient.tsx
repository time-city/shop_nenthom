"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useSWR from "swr";
import type {
  AdminOrder,
  AdminOrderStatus,
  AdminPaymentStatus,
} from "@/src/lib/types/admin";
import CustomSelect from "@/src/components/admin/common/CustomSelect";
import LoadingState from "@/src/components/ui/loadingState";
import TableResponsiveWrapper from "@/src/components/admin/common/TableResponsiveWrapper";
import AdminHeader from "@/src/components/admin/layout/AdminHeader";
import { getOrdersAction, updateOrderStatusAction, cancelOrderAction } from "@/src/lib/action/order.action";
import { getFriendlyResponseError } from "@/src/lib/utils/errorMessage";
import { useToast } from "@/src/components/ui/toastProvider";
import ModalOrderAction from "@/src/components/admin/order/modalOrderAction";
import { callAction } from "@/src/lib/utils/callAction";

const statusLabels: Record<AdminOrderStatus, string> = {
  cancelled: "Đã huỷ",
  confirmed: "Đã xác nhận",
  pending: "Đang xác nhận",
  cancel_requested: "Yêu cầu huỷ",
  shipped: "Đang giao hàng",
  delivered: "Giao thành công",
};

const paymentLabels: Record<AdminPaymentStatus, string> = {
  paid: "Đã thanh toán",
  refunded: "Hoàn tiền",
  unpaid: "Chưa thanh toán",
};

const paymentClassNames: Record<AdminPaymentStatus, string> = {
  paid: "done",
  refunded: "cancelled",
  unpaid: "pending",
};

function formatCurrency(value: number) {
  return `${value.toLocaleString("vi-VN")} đ`;
}

function formatDateTime(value: string) {
  if (!value) return "";
  const dateObj = new Date(value);
  if (isNaN(dateObj.getTime())) return "";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(dateObj);
}

type Props = {
  orders: AdminOrder[];
  initialMeta?: { limit: number; page: number; total: number; totalPages: number; };
};

export default function OrdersManagementClient({ orders: initialOrders, initialMeta }: Props) {
  const router = useRouter();
  const [orders, setOrders] = useState<AdminOrder[]>(initialOrders || []);
  const [page, setPage] = useState(initialMeta?.page || 1);
  const [totalPages, setTotalPages] = useState(initialMeta?.totalPages || 1);

  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState<AdminOrderStatus | "">("");
  const [sortDirection, setSortDirection] = useState<"desc" | "asc">("desc");
  const { toast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"confirm" | "cancel" | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedOrderStatus, setSelectedOrderStatus] = useState<AdminOrderStatus | null>(null);
  const [isActionSubmitting, setIsActionSubmitting] = useState(false);
  const isMountedRef = useRef(true);

  // Map frontend status to backend enum for API
  const reverseStatusMap: Record<string, string> = {
    pending: "PENDING",
    confirmed: "PROCESSING",
    shipped: "SHIPPED",
    cancelled: "CANCELLED",
    cancel_requested: "CANCEL_REQUESTED",
  };

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset page on new search
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  // Reset page on status or sort change
  useEffect(() => {
    setPage(1);
  }, [status, sortDirection]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const limit = 20;

  const { data: fetchResult, isLoading: isSwrLoading, error: swrError, mutate: mutateOrders } = useSWR(
    ['admin-orders', page, limit, status, sortDirection, debouncedSearch],
    async () => {
      console.log("[Data Source] 🟡 NETWORK QUERY - ordersManagementClient: Fetching orders...");
      const params: any = { limit, page };
      if (status) params.status = reverseStatusMap[status];
      if (sortDirection) params.sort_direction = sortDirection;
      if (debouncedSearch) params.search = debouncedSearch;

      const result = await callAction(() => getOrdersAction(params), "Không thể tải danh sách đơn hàng. Vui lòng thử lại sau.");
      if ("error" in result && result.error) {
        throw new Error(getFriendlyResponseError(result.error));
      }
      return result;
    }
  );

  useEffect(() => {
    if (swrError) {
      const friendlyErr = swrError instanceof Error ? swrError.message : String(swrError);
      setError(friendlyErr);
      setOrders([]);
    } else if (fetchResult && "success" in fetchResult && fetchResult.success) {
      console.log("[Data Source] 🟢 UI UPDATED - ordersManagementClient: Displaying orders (from SWR Cache or Network)");
      setOrders((fetchResult.data || []) as AdminOrder[]);
      if (fetchResult.meta) {
        setTotalPages(fetchResult.meta.totalPages);
      }
      setError(null);
    }
  }, [fetchResult, swrError]);

  const isLoading = isSwrLoading && orders.length === 0;

  const handleOpenConfirm = (orderId: string, currentStatus: AdminOrderStatus) => {
    setSelectedOrderId(orderId);
    setSelectedOrderStatus(currentStatus);
    setModalType("confirm");
    setModalOpen(true);
  };

  const handleOpenCancel = (orderId: string, currentStatus: AdminOrderStatus) => {
    setSelectedOrderId(orderId);
    setSelectedOrderStatus(currentStatus);
    setModalType("cancel");
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    if (isActionSubmitting) return;
    setModalOpen(false);
    setModalType(null);
    setSelectedOrderId(null);
    setSelectedOrderStatus(null);
  };

  const executeOrderAction = async (data?: any) => {
    if (!selectedOrderId || !modalType) return;

    setIsActionSubmitting(true);
    try {
      if (modalType === "confirm") {
        if (selectedOrderStatus !== "pending" && selectedOrderStatus !== "cancel_requested" && selectedOrderStatus !== "confirmed" && selectedOrderStatus !== "shipped") return;

        let nextStatus: "PROCESSING" | "SHIPPED" | "DELIVERED" = "PROCESSING";
        let noteText = "";
        let newAdminStatus = "confirmed";

        if (selectedOrderStatus === "cancel_requested") {
           noteText = "Admin bác bỏ yêu cầu hủy và xác nhận đơn hàng";
           nextStatus = "PROCESSING";
        } else if (selectedOrderStatus === "pending") {
           noteText = "Admin đã xác nhận đơn hàng";
           nextStatus = "PROCESSING";
        } else if (selectedOrderStatus === "confirmed") {
           noteText = "Admin xác nhận giao hàng";
           nextStatus = "SHIPPED";
           newAdminStatus = "shipped";
        } else if (selectedOrderStatus === "shipped") {
           noteText = "Admin xác nhận giao thành công";
           nextStatus = "DELIVERED";
           newAdminStatus = "delivered";
        }

        const result = await callAction(() => updateOrderStatusAction({
          order_number: selectedOrderId,
          status: nextStatus,
          note: noteText,
          tracking_code: data?.trackingCode,
          shipping_carrier: data?.shippingCarrier,
        }), "Không thể cập nhật trạng thái đơn hàng. Vui lòng thử lại sau.");

        if ("error" in result && result.error) {
          toast.error(getFriendlyResponseError(result.error));
        } else if ("success" in result && result.success) {
          toast.success("Cập nhật trạng thái thành công");
          mutateOrders(
            (current: any) => {
              if (!current || !current.data) return current;
              return {
                ...current,
                data: current.data.map((o: any) => o.id === selectedOrderId ? {
                  id: result.data.id,
                  customer: result.data.shippingFullname,
                  date: result.data.date || o.date,
                  payment: result.data.paymentStatus,
                  status: newAdminStatus,
                  total: result.data.total,
                  shippingCarrier: result.data.shippingCarrier,
                  trackingCode: result.data.trackingCode,
                } : o)
              };
            },
            false
          );
          setModalOpen(false);
        }
      } else if (modalType === "cancel") {
        const result = await callAction(() => cancelOrderAction({
          order_id: selectedOrderId,
          reason: data?.reason || (selectedOrderStatus === "cancel_requested" ? "Khách yêu cầu hủy" : "Hủy đơn hàng nhanh từ admin"),
        }), "Không thể hủy đơn hàng. Vui lòng thử lại sau.");

        if ("error" in result && result.error) {
          toast.error(getFriendlyResponseError(result.error));
        } else if ("success" in result && result.success) {
          const cancelResult = result as {
            success: true;
            data?: { message?: string; emailSent?: boolean };
          };
          const msg = cancelResult.data?.message ?? "Đã hủy đơn hàng thành công";
          toast.success(msg);

          if (cancelResult.data?.emailSent === false) {
            toast.warning("Lưu ý: Không gửi được email thông báo cho khách hàng. Vui lòng liên hệ khách trực tiếp.");
          }

          mutateOrders(
            (current: any) => {
              if (!current || !current.data) return current;
              return {
                ...current,
                data: current.data.map((o: any) => o.id === selectedOrderId ? { ...o, status: "cancelled" } : o)
              };
            },
            false
          );
          setModalOpen(false);
        }
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Đã xảy ra lỗi");
    } finally {
      setIsActionSubmitting(false);
    }
  };

  useEffect(() => {
    const handleNewOrder = () => {
      void mutateOrders();
    };
    
    // Đăng ký tất cả các sự kiện thay đổi của đơn hàng
    window.addEventListener("admin-socket-new-order", handleNewOrder);
    window.addEventListener("admin-socket-new-payment", handleNewOrder);
    window.addEventListener("admin-socket-cancel-request", handleNewOrder);
    window.addEventListener("admin-socket-order-updated", handleNewOrder);
    
    return () => {
      window.removeEventListener("admin-socket-new-order", handleNewOrder);
      window.removeEventListener("admin-socket-new-payment", handleNewOrder);
      window.removeEventListener("admin-socket-cancel-request", handleNewOrder);
      window.removeEventListener("admin-socket-order-updated", handleNewOrder);
    };
  }, [mutateOrders]);

  // We don't need client-side filtering anymore because the server does it via getOrdersAction.
  const filteredOrders = orders;

  return (
    <>
      <AdminHeader
        title="Quản lý Đơn hàng"
        subtitle="Tất cả đơn hàng của cửa hàng"
      />

      <div className="dashboard-page-content">
        <section className="dashboard-card orders-filter-card relative z-20">
          <div className="dashboard-card-body">
            <div className="orders-filter-bar flex flex-col md:flex-row gap-4">
              <label className="orders-search-field flex-1" htmlFor="orders-search">
                <span className="sr-only">Tìm kiếm đơn hàng</span>
                <svg
                  className="orders-search-icon"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  id="orders-search"
                  className="orders-form-input w-full"
                  type="text"
                  placeholder="Tìm theo mã đơn hàng hoặc tên khách..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </label>

              <label className="sr-only" htmlFor="orders-status">
                Lọc trạng thái
              </label>
              <CustomSelect
                className="w-full md:w-[180px]"
                value={status}
                onChange={(val) => setStatus(val as AdminOrderStatus | "")}
                options={[
                  { label: "Tất cả trạng thái", value: "" },
                  { label: "Đang xác nhận", value: "pending" },
                  { label: "Đã xác nhận", value: "confirmed" },
                  { label: "Đang giao hàng", value: "shipped" },
                  { label: "Giao thành công", value: "delivered" },
                  { label: "Yêu cầu huỷ", value: "cancel_requested" },
                  { label: "Đã huỷ", value: "cancelled" }
                ]}
              />

              <label className="sr-only" htmlFor="orders-sort">
                Sắp xếp theo ngày
              </label>
              <CustomSelect
                className="w-full md:w-[180px]"
                value={sortDirection}
                onChange={(val) => setSortDirection(val as "desc" | "asc")}
                options={[
                  { label: "Mới nhất", value: "desc" },
                  { label: "Cũ nhất", value: "asc" },
                ]}
              />
            </div>
          </div>
        </section>

        <section className="dashboard-card orders-table-card">
          <div className="dashboard-card-body no-padding">
            {/* DESKTOP TABLE */}
            <div className="dashboard-table-wrapper hidden md:block">
              <TableResponsiveWrapper minWidth={950}>
                <table className="dashboard-admin-table orders-admin-table">
                  <thead>
                    <tr>
                      <th>Mã đơn</th>
                      <th>Ngày đặt</th>
                      <th>Khách hàng</th>
                      <th>Tổng tiền</th>
                      <th>Trạng thái</th>
                      <th>Thanh toán</th>
                      <th>Vận chuyển</th>
                      <th>
                        <span className="sr-only">Thao tác</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {!isLoading && !error && filteredOrders.map((order) => (
                      <tr
                        key={order.id}
                        className="cursor-pointer transition hover:bg-black/20"
                        onClick={() => router.push(`/admin/ordersManagement/${order.id}`)}
                      >
                        <td>
                          <Link
                            href={`/admin/ordersManagement/${order.id}`}
                            className="orders-code-link"
                          >
                            {order.id}
                          </Link>
                        </td>
                        <td>{formatDateTime(order.date)}</td>
                        <td>{order.customer}</td>
                        <td className="orders-table-amount">
                          {formatCurrency(order.total)}
                        </td>
                        <td>
                          <span className={`dashboard-status ${order.status}`}>
                            {statusLabels[order.status]}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`dashboard-status ${paymentClassNames[order.payment]}`}
                          >
                            {paymentLabels[order.payment]}
                          </span>
                        </td>
                        <td>
                          {order.trackingCode ? (
                            <div className="text-xs">
                               <span className="font-medium text-gray-800 break-all">{order.trackingCode}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">Chưa có</span>
                          )}
                        </td>
                        <td onClick={(e) => e.stopPropagation()}>
                          {order.status !== "cancelled" ? (
                            <div className="flex items-center gap-2 flex-nowrap">
                              {order.status === "pending" || order.status === "cancel_requested" || order.status === "confirmed" || order.status === "shipped" ? (
                                <button
                                  type="button"
                                  className="orders-action-btn-confirm"
                                  title={
                                    order.status === "cancel_requested" ? "Duyệt yêu cầu huỷ đơn" : 
                                    order.status === "confirmed" ? "Giao hàng" :
                                    order.status === "shipped" ? "Đã giao thành công" :
                                    "Xác nhận đơn hàng"
                                  }
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (order.status === "cancel_requested") {
                                      handleOpenCancel(order.id, order.status);
                                    } else {
                                      handleOpenConfirm(order.id, order.status);
                                    }
                                  }}
                                >
                                  <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    {order.status === "confirmed" ? (
                                      <path d="M5 12h14M12 5l7 7-7 7" /> // arrow right for shipping
                                    ) : order.status === "shipped" ? (
                                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4L12 14.01l-3-3" /> // check circle for delivered
                                    ) : (
                                      <polyline points="20,6 9,17 4,12" />
                                    )}
                                  </svg>
                                </button>
                              ) : null}
                              <button
                                type="button"
                                className="orders-action-btn-cancel"
                                title={order.status === "cancel_requested" ? "Bác bỏ yêu cầu huỷ" : "Hủy đơn hàng"}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (order.status === "cancel_requested") {
                                    handleOpenConfirm(order.id, order.status);
                                  } else {
                                    handleOpenCancel(order.id, order.status);
                                  }
                                }}
                              >
                                <svg
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <line x1="18" y1="6" x2="6" y2="18" />
                                  <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                              </button>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-xs italic" style={{ paddingLeft: "12px" }}>-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TableResponsiveWrapper>
            </div>

            {/* MOBILE CARDS */}
            <div className="md:hidden flex flex-col gap-4 p-4">
              {!isLoading && !error && filteredOrders.map((order) => (
                <div 
                  key={order.id} 
                  className="bg-white rounded-xl p-4 flex flex-col gap-3 cursor-pointer shadow-sm border border-gray-200 hover:shadow-md transition"
                  onClick={() => router.push(`/admin/ordersManagement/${order.id}`)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <Link
                        href={`/admin/ordersManagement/${order.id}`}
                        className="text-gray-900 font-bold text-base hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {order.id}
                      </Link>
                      <div className="text-xs text-gray-500 mt-1">{formatDateTime(order.date)}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900 text-base">{formatCurrency(order.total)}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-1">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="text-sm text-[#2C1810]">{order.customer}</span>
                  </div>

                  <div className="flex justify-between items-center mt-2 border-t border-[#E5D5B5]/50 pt-3">
                    <div className="flex flex-col w-full">
                      <div className="flex flex-wrap gap-2 mb-2">
                        <span className={`dashboard-status ${order.status} text-xs px-2 py-1`}>
                          {statusLabels[order.status]}
                        </span>
                        <span className={`dashboard-status ${paymentClassNames[order.payment]} text-xs px-2 py-1`}>
                          {paymentLabels[order.payment]}
                        </span>
                      </div>
                      
                      {order.trackingCode && (
                        <div className="dashboard-order-mobile-footer-row flex justify-between items-center pt-2 pb-2 border-t border-dashed border-[#E5D5B5]/50">
                          <span className="text-xs text-gray-500">Mã vận đơn:</span>
                          <div className="flex flex-col items-end max-w-[55%]">
                            <span className="text-xs font-medium text-gray-800 break-all text-right">{order.trackingCode}</span>
                          </div>
                        </div>
                      )}

                      <div className="dashboard-order-mobile-footer-row mt-2" onClick={(e) => e.stopPropagation()}>
                        {order.status !== "cancelled" && (
                          <div className="flex items-center gap-2">
                            {order.status === "pending" || order.status === "cancel_requested" || order.status === "confirmed" || order.status === "shipped" ? (
                              <button
                                type="button"
                                className="orders-action-btn-confirm"
                                title={
                                  order.status === "cancel_requested" ? "Duyệt yêu cầu huỷ đơn" : 
                                  order.status === "confirmed" ? "Giao hàng" :
                                  order.status === "shipped" ? "Đã giao thành công" :
                                  "Xác nhận đơn hàng"
                                }
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (order.status === "cancel_requested") {
                                    handleOpenCancel(order.id, order.status);
                                  } else {
                                    handleOpenConfirm(order.id, order.status);
                                  }
                                }}
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  {order.status === "confirmed" ? (
                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                  ) : order.status === "shipped" ? (
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4L12 14.01l-3-3" />
                                  ) : (
                                    <polyline points="20,6 9,17 4,12" />
                                  )}
                                </svg>
                              </button>
                            ) : null}
                            <button
                              type="button"
                              className="orders-action-btn-cancel"
                              title={order.status === "cancel_requested" ? "Bác bỏ yêu cầu huỷ" : "Hủy đơn hàng"}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenCancel(order.id, order.status);
                              }}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                {order.status === "cancel_requested" ? (
                                  <line x1="18" y1="6" x2="6" y2="18" />
                                ) : (
                                  <>
                                    <polyline points="3 6 5 6 21 6" />
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                  </>
                                )}
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {isLoading ? (
              <LoadingState type="table"
                label="Đang tải danh sách đơn hàng..."
                className="m-5"
              />
            ) : null}

            {!isLoading && error ? (
              <div className="px-5 py-8 text-center text-sm text-[#8A1119]">
                {error}
              </div>
            ) : null}

            {!isLoading && !error && filteredOrders.length === 0 ? (
              <div className="orders-empty-state">
                {orders.length === 0
                  ? "Chưa có đơn hàng nào"
                  : "Không tìm thấy đơn hàng phù hợp"}
              </div>
            ) : null}
            
            {/* PAGINATION */}
            {!isLoading && !error && totalPages > 1 && (
              <div className="px-5 py-4 border-t border-[#E5D5B5]/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-500 text-center sm:text-left">
                  Trang <span className="font-bold text-[#2C1810]">{page}</span> trên {totalPages}
                </div>
                <div className="flex items-center gap-2 justify-center">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 rounded-lg border border-[#E5D5B5] text-[#2C1810] text-sm hover:bg-[#E5D5B5]/20 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Trước
                  </button>
                  <div className="flex gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                      .map((p, i, arr) => {
                        if (i > 0 && arr[i - 1] !== p - 1) {
                          return (
                            <div key={`ellipsis-${p}`} className="flex gap-1 items-center">
                              <span className="text-gray-400 px-1">...</span>
                              <button
                                onClick={() => setPage(p)}
                                className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition ${page === p ? "bg-[#8A1119] text-white font-bold border border-[#8A1119]" : "border border-[#E5D5B5] text-[#2C1810] hover:bg-[#E5D5B5]/20"}`}
                              >
                                {p}
                              </button>
                            </div>
                          );
                        }
                        return (
                          <button
                            key={p}
                            onClick={() => setPage(p)}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition ${page === p ? "bg-[#8A1119] text-white font-bold border border-[#8A1119]" : "border border-[#E5D5B5] text-[#2C1810] hover:bg-[#E5D5B5]/20"}`}
                          >
                            {p}
                          </button>
                        );
                      })}
                  </div>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-1.5 rounded-lg border border-[#E5D5B5] text-[#2C1810] text-sm hover:bg-[#E5D5B5]/20 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}

          </div>
        </section>
      </div>

      <ModalOrderAction
        key={`${modalType ?? "none"}-${selectedOrderId ?? "none"}-${modalOpen}`}
        open={modalOpen}
        onClose={handleCloseModal}
        onConfirm={executeOrderAction}
        type={modalType}
        orderId={selectedOrderId}
        currentStatus={selectedOrderStatus}
        isSubmitting={isActionSubmitting}
      />
    </>
  );
}
