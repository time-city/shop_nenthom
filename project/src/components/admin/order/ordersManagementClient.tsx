"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  AdminOrder,
  AdminOrderStatus,
  AdminPaymentStatus,
} from "@/src/lib/types/admin";
import LoadingState from "@/src/components/ui/loadingState";
import TableResponsiveWrapper from "@/src/components/admin/common/TableResponsiveWrapper";
import AdminHeader from "@/src/components/admin/layout/AdminHeader";
import { getOrdersAction, updateOrderStatusAction, cancelOrderAction } from "@/src/lib/action/order.action";
import { getFriendlyResponseError } from "@/src/lib/utils/errorMessage";
import { useToast } from "@/src/components/ui/toast-provider";
import ModalOrderAction from "@/src/components/admin/order/modalOrderAction";
import { callAction } from "@/src/lib/utils/callAction";

const statusLabels: Record<AdminOrderStatus, string> = {
  cancelled: "Đã huỷ",
  confirmed: "Đã xác nhận",
  pending: "Đang xác nhận",
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
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

type Props = {
  orders: AdminOrder[];
};

export default function OrdersManagementClient({ orders: initialOrders }: Props) {
  const router = useRouter();
  const [orders, setOrders] = useState<AdminOrder[]>(initialOrders || []);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<AdminOrderStatus | "">("");
  const { toast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"confirm" | "cancel" | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedOrderStatus, setSelectedOrderStatus] = useState<AdminOrderStatus | null>(null);
  const [isActionSubmitting, setIsActionSubmitting] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const loadOrders = useCallback(async (options: { silent?: boolean } = {}) => {
    if (!options.silent) {
      setIsLoading(true);
    }
    setError(null);

    try {
      const result = await callAction(() => getOrdersAction({ limit: 100 }), "Không thể tải danh sách đơn hàng. Vui lòng thử lại sau.");
      if (!isMountedRef.current) return;

      if ("error" in result && result.error) {
        setError(getFriendlyResponseError(result.error));
        return;
      }

      if ("success" in result && result.success) {
        setOrders((result.data || []) as AdminOrder[]);
      }
    } catch (err) {
      if (!isMountedRef.current) return;
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      if (isMountedRef.current && !options.silent) {
        setIsLoading(false);
      }
    }
  }, []);

  const handleOpenConfirm = (orderId: string, currentStatus: AdminOrderStatus) => {
    setSelectedOrderId(orderId);
    setSelectedOrderStatus(currentStatus);
    setModalType("confirm");
    setModalOpen(true);
  };

  const handleOpenCancel = (orderId: string) => {
    setSelectedOrderId(orderId);
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

  const executeOrderAction = async (reason?: string) => {
    if (!selectedOrderId || !modalType) return;

    setIsActionSubmitting(true);
    try {
      if (modalType === "confirm") {
        if (selectedOrderStatus !== "pending") return;

        const result = await callAction(() => updateOrderStatusAction({
          order_number: selectedOrderId,
          status: "PROCESSING",
          note: "Admin đã xác nhận đơn hàng",
        }), "Không thể cập nhật trạng thái đơn hàng. Vui lòng thử lại sau.");

        if ("error" in result && result.error) {
          toast.error(getFriendlyResponseError(result.error));
        } else if ("success" in result && result.success) {
          toast.success("Cập nhật trạng thái đơn hàng thành công");
          setOrders((prev) =>
            prev.map((o) =>
              o.id === selectedOrderId ? { ...o, status: "confirmed" } : o
            )
          );
          setModalOpen(false);
        }
      } else if (modalType === "cancel") {
        const result = await callAction(() => cancelOrderAction({
          order_id: selectedOrderId,
          reason: reason || "Hủy đơn hàng nhanh từ admin",
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

          // Cảnh báo thêm nếu gửi email thất bại
          if (cancelResult.data?.emailSent === false) {
            toast.warning("Lưu ý: Không gửi được email thông báo cho khách hàng. Vui lòng liên hệ khách trực tiếp.");
          }

          setOrders((prev) =>
            prev.map((o) =>
              o.id === selectedOrderId ? { ...o, status: "cancelled" } : o
            )
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
    if (initialOrders && initialOrders.length > 0) {
      return;
    }
    const timeoutId = window.setTimeout(() => {
      void loadOrders();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [initialOrders, loadOrders]);

  useEffect(() => {
    const handleNewOrder = () => {
      void loadOrders({ silent: true });
    };

    window.addEventListener("admin-socket-new-order", handleNewOrder);
    return () => {
      window.removeEventListener("admin-socket-new-order", handleNewOrder);
    };
  }, [loadOrders]);

  const filteredOrders = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesSearch =
        !normalizedSearch ||
        order.id.toLowerCase().includes(normalizedSearch) ||
        order.customer.toLowerCase().includes(normalizedSearch);
      const matchesStatus =
        !status || order.status === status;

      return matchesSearch && matchesStatus;
    });
  }, [orders, search, status]);

  return (
    <>
      <AdminHeader
        title="Quản lý Đơn hàng"
        subtitle="Tất cả đơn hàng của cửa hàng"
      />

      <div className="dashboard-page-content">
        <section className="dashboard-card orders-filter-card">
          <div className="dashboard-card-body">
            <div className="orders-filter-bar">
              <label className="orders-search-field" htmlFor="orders-search">
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
                  className="orders-form-input"
                  type="text"
                  placeholder="Tìm theo mã đơn hàng hoặc tên khách..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </label>

              <label className="sr-only" htmlFor="orders-status">
                Lọc trạng thái
              </label>
              <select
                id="orders-status"
                className="orders-form-select"
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value as AdminOrderStatus | "")
                }
              >
                <option value="">Tất cả trạng thái</option>
                <option value="pending">Đang xác nhận</option>
                <option value="confirmed">Đã xác nhận</option>
                <option value="cancelled">Đã huỷ</option>
              </select>
            </div>
          </div>
        </section>

        <section className="dashboard-card orders-table-card">
          <div className="dashboard-card-body no-padding">
            <div className="dashboard-table-wrapper">
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
                      <th>
                        <span className="sr-only">Thao tác</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {!isLoading && !error && filteredOrders.map((order) => (
                      <tr
                        key={order.id}
                        className="cursor-pointer transition hover:bg-[#6B1218]/[0.03]"
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
                        <td onClick={(e) => e.stopPropagation()}>
                          {order.status !== "cancelled" ? (
                            <div className="flex items-center gap-2 flex-nowrap">
                              {order.status === "pending" ? (
                                <button
                                  type="button"
                                  className="orders-action-btn-confirm"
                                  title="Xác nhận đơn hàng"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenConfirm(order.id, order.status);
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
                                    <polyline points="20,6 9,17 4,12" />
                                  </svg>
                                </button>
                              ) : null}
                              <button
                                type="button"
                                className="orders-action-btn-cancel"
                                title="Hủy đơn hàng"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenCancel(order.id);
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

            {isLoading ? (
              <LoadingState
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
