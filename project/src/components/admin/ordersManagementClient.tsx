"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type {
  AdminOrder,
  AdminOrderStatus,
  AdminPaymentStatus,
} from "@/src/lib/types/admin";
import LoadingState from "@/src/components/ui/loadingState";
import { getOrdersAction, updateOrderStatusAction, cancelOrderAction } from "@/src/lib/action/order.action";
import { getFriendlyResponseError } from "@/src/lib/utils/errorMessage";
import { useToast } from "@/src/components/ui/toast-provider";
import ModalOrderAction from "./modalOrderAction";

const statusLabels: Record<AdminOrderStatus, string> = {
  cancelled: "Đã hủy",
  completed: "Hoàn thành",
  pending: "Chờ xác nhận",
  processing: "Đang xử lý",
  shipping: "Đang giao",
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
  const [status, setStatus] = useState<AdminOrderStatus | "confirmed" | "">("");
  const { toast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"confirm" | "cancel" | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedOrderStatus, setSelectedOrderStatus] = useState<AdminOrderStatus | null>(null);
  const [isActionSubmitting, setIsActionSubmitting] = useState(false);

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
        let nextStatus: "PROCESSING" | "SHIPPED" | "DELIVERED" | null = null;
        let nextClientStatus: AdminOrderStatus | null = null;

        if (selectedOrderStatus === "pending") {
          nextStatus = "PROCESSING";
          nextClientStatus = "processing";
        } else if (selectedOrderStatus === "processing") {
          nextStatus = "SHIPPED";
          nextClientStatus = "shipping";
        } else if (selectedOrderStatus === "shipping") {
          nextStatus = "DELIVERED";
          nextClientStatus = "completed";
        }

        if (!nextStatus || !nextClientStatus) return;

        const result = await updateOrderStatusAction({
          order_number: selectedOrderId,
          status: nextStatus,
          note: "Xác nhận nhanh từ danh sách quản lý đơn hàng",
        });

        if ("error" in result && result.error) {
          toast.error(getFriendlyResponseError(result.error));
        } else if ("success" in result && result.success) {
          toast.success("Cập nhật trạng thái đơn hàng thành công");
          setOrders((prev) =>
            prev.map((o) =>
              o.id === selectedOrderId ? { ...o, status: nextClientStatus! } : o
            )
          );
          setModalOpen(false);
        }
      } else if (modalType === "cancel") {
        const result = await cancelOrderAction({
          order_id: selectedOrderId,
          reason: reason || "Hủy đơn hàng nhanh từ admin",
        });

        if ("error" in result && result.error) {
          toast.error(getFriendlyResponseError(result.error));
        } else if ("success" in result && result.success) {
          toast.success("Hủy đơn hàng thành công");
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
    let cancelled = false;
    const loadOrders = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await getOrdersAction({ limit: 100 });
        if (cancelled) return;
        if ("error" in result && result.error) {
          setError(getFriendlyResponseError(result.error));
        } else if ("success" in result && result.success) {
          // getOrdersAction trả dữ liệu danh sách trong result.data.
          const data = (result.data || []) as AdminOrder[];
          setOrders(data);
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
    void loadOrders();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredOrders = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesSearch =
        !normalizedSearch ||
        order.id.toLowerCase().includes(normalizedSearch) ||
        order.customer.toLowerCase().includes(normalizedSearch);
      const matchesStatus =
        !status ||
        (status === "confirmed"
          ? order.status !== "pending" && order.status !== "cancelled"
          : order.status === status);

      return matchesSearch && matchesStatus;
    });
  }, [orders, search, status]);

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
            <h1 className="dashboard-page-title">Quản lý Đơn hàng</h1>
            <p className="dashboard-page-subtitle">
              Tất cả đơn hàng của cửa hàng
            </p>
          </div>
        </div>
      </header>

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
                <option value="pending">Chờ xác nhận</option>
                <option value="confirmed">Đã xác nhận</option>
                <option value="cancelled">Đã hủy</option>
              </select>
            </div>
          </div>
        </section>

        <section className="dashboard-card orders-table-card">
          <div className="dashboard-card-body no-padding">
            <div className="dashboard-table-wrapper">
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
                        {order.status !== "completed" && order.status !== "cancelled" ? (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              className="orders-action-btn-confirm"
                              title={
                                order.status === "pending"
                                  ? "Xác nhận đơn hàng"
                                  : order.status === "processing"
                                  ? "Giao hàng"
                                  : "Hoàn thành đơn"
                              }
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
