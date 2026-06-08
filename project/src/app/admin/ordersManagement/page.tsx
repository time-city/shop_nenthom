"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type OrderStatus =
  | "pending"
  | "processing"
  | "shipping"
  | "completed"
  | "cancelled";

type PaymentStatus = "paid" | "unpaid" | "refunded";

type Order = {
  customer: string;
  date: string;
  id: string;
  payment: PaymentStatus;
  status: OrderStatus;
  total: number;
};

const orders: Order[] = [
  {
    id: "DH-2024001",
    date: "2024-12-05T09:30:00",
    customer: "Nguyễn Thị Lan",
    total: 450000,
    status: "completed",
    payment: "paid",
  },
  {
    id: "DH-2024002",
    date: "2024-12-05T10:45:00",
    customer: "Trần Văn Minh",
    total: 680000,
    status: "processing",
    payment: "paid",
  },
  {
    id: "DH-2024003",
    date: "2024-12-04T15:20:00",
    customer: "Lê Thị Hoa",
    total: 320000,
    status: "shipping",
    payment: "paid",
  },
  {
    id: "DH-2024004",
    date: "2024-12-04T18:10:00",
    customer: "Phạm Đức An",
    total: 890000,
    status: "pending",
    payment: "unpaid",
  },
  {
    id: "DH-2024005",
    date: "2024-12-03T11:05:00",
    customer: "Hoàng Thị Mai",
    total: 1250000,
    status: "completed",
    payment: "paid",
  },
  {
    id: "DH-2024006",
    date: "2024-12-03T14:40:00",
    customer: "Đỗ Quốc Bảo",
    total: 520000,
    status: "cancelled",
    payment: "refunded",
  },
  {
    id: "DH-2024007",
    date: "2024-12-02T08:25:00",
    customer: "Vũ Thanh Huyền",
    total: 760000,
    status: "processing",
    payment: "paid",
  },
];

const statusLabels: Record<OrderStatus, string> = {
  cancelled: "Đã hủy",
  completed: "Hoàn thành",
  pending: "Chờ xác nhận",
  processing: "Đang xử lý",
  shipping: "Đang giao",
};

const paymentLabels: Record<PaymentStatus, string> = {
  paid: "Đã thanh toán",
  refunded: "Hoàn tiền",
  unpaid: "Chưa thanh toán",
};

const paymentClassNames: Record<PaymentStatus, string> = {
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

export default function OrdersManagementPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<OrderStatus | "">("");

  const filteredOrders = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesSearch =
        !normalizedSearch ||
        order.id.toLowerCase().includes(normalizedSearch) ||
        order.customer.toLowerCase().includes(normalizedSearch);
      const matchesStatus = !status || order.status === status;

      return matchesSearch && matchesStatus;
    });
  }, [search, status]);

  return (
    <>
        <header className="dashboard-top-header">
          <div className="dashboard-top-header-left">
            <button className="dashboard-mobile-toggle" type="button" aria-label="Menu">
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
                    placeholder="Tìm theo mã đơn hàng..."
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
                    setStatus(event.target.value as OrderStatus | "")
                  }
                >
                  <option value="">Tất cả trạng thái</option>
                  <option value="pending">Chờ xác nhận</option>
                  <option value="processing">Đang xử lý</option>
                  <option value="shipping">Đang giao</option>
                  <option value="completed">Hoàn thành</option>
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
                    {filteredOrders.map((order) => (
                      <tr key={order.id}>
                        <td>
                          <Link
                            className="orders-code-link"
                            href={`/admin/ordersManagement/${order.id}`}
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
                            className={`dashboard-status ${
                              paymentClassNames[order.payment]
                            }`}
                          >
                            {paymentLabels[order.payment]}
                          </span>
                        </td>
                        <td>
                          <Link
                            className="orders-icon-btn"
                            href={`/admin/ordersManagement/${order.id}`}
                            title="Xem chi tiết"
                            aria-label={`Xem chi tiết đơn ${order.id}`}
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              aria-hidden="true"
                            >
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredOrders.length === 0 ? (
                <div className="orders-empty-state">
                  Không tìm thấy đơn hàng phù hợp
                </div>
              ) : null}

              <div className="orders-pagination" aria-label="Orders pagination">
                <button className="orders-pagination-btn" type="button" disabled>
                  ‹
                </button>
                <button
                  className="orders-pagination-btn active"
                  type="button"
                  aria-current="page"
                >
                  1
                </button>
                <button className="orders-pagination-btn" type="button">
                  2
                </button>
                <button className="orders-pagination-btn" type="button">
                  3
                </button>
                <button className="orders-pagination-btn" type="button">
                  ›
                </button>
              </div>
            </div>
          </section>
        </div>
    </>
  );
}
