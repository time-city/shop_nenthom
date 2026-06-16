"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/src/components/ui/toast-provider";
import { updateOrderStatusAction, cancelOrderAction } from "@/src/lib/action/order.action";
import { getFriendlyResponseError } from "@/src/lib/utils/errorMessage";
import type { OrderDetail } from "@/src/lib/types/client";

interface Props {
  initialOrder: OrderDetail;
}

const statusMap: Record<string, { label: string; className: string }> = {
  PENDING: { label: "Chờ xác nhận", className: "pending" },
  PROCESSING: { label: "Đang xử lý", className: "processing" },
  SHIPPED: { label: "Đang giao hàng", className: "shipping" },
  DELIVERED: { label: "Hoàn thành", className: "completed" },
  CANCELLED: { label: "Đã hủy", className: "cancelled" },
};

const clientStatusMap: Record<OrderDetail["status"], string> = {
  canceled: "CANCELLED",
  done: "DELIVERED",
  processing: "PROCESSING", // Fallback, could be PENDING
  shipping: "SHIPPED",
};

export default function DetailOrderAdmin({ initialOrder }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [order, setOrder] = useState<OrderDetail>(initialOrder);
  const [newStatus, setNewStatus] = useState<string>("");
  const [statusNote, setStatusNote] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  // Formats
  const formatCurrency = (value: number) => {
    return `${value.toLocaleString("vi-VN")} đ`;
  };

  const formatDateTime = (value: string) => {
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  };

  // Determine current active status in DB enum format from logs or status mapper
  const latestLog = order.historyLogs && order.historyLogs.length > 0
    ? order.historyLogs[order.historyLogs.length - 1]
    : null;
  const currentDBStatus = latestLog?.currentStatus || clientStatusMap[order.status] || "PENDING";
  const isOrderCancelled = currentDBStatus === "CANCELLED";

  const handleUpdateStatus = async () => {
    if (!newStatus) {
      toast.error("Vui lòng chọn trạng thái mới");
      return;
    }

    if (newStatus === "CANCELLED" && !statusNote.trim()) {
      toast.error("Vui lòng nhập lý do hủy đơn hàng");
      return;
    }

    setIsUpdating(true);
    try {
      let result;
      if (newStatus === "CANCELLED") {
        result = await cancelOrderAction({
          order_id: order.id,
          reason: statusNote.trim() || "Admin hủy đơn hàng",
        });
      } else {
        result = await updateOrderStatusAction({
          order_number: order.id,
          status: newStatus as any,
          note: statusNote.trim() || undefined,
        });
      }

      if ("error" in result && result.error) {
        toast.error(getFriendlyResponseError(result.error));
      } else if ("success" in result && result.success && result.data) {
        toast.success("Cập nhật trạng thái đơn hàng thành công");
        setOrder(result.data as unknown as OrderDetail);
        setNewStatus("");
        setStatusNote("");
        router.refresh();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Đã xảy ra lỗi khi cập nhật");
    } finally {
      setIsUpdating(false);
    }
  };

  const statusInfo = statusMap[currentDBStatus] || { label: "Chờ xác nhận", className: "pending" };

  return (
    <>
      <header className="dashboard-top-header">
        <div className="dashboard-top-header-left">
          <Link
            href="/admin/ordersManagement"
            className="dashboard-mobile-toggle flex items-center justify-center"
            style={{ display: "inline-flex" }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12,19 5,12 12,5"></polyline>
            </svg>
          </Link>
          <div>
            <h1 className="dashboard-page-title">
              Chi tiết Đơn hàng: {order.id}
            </h1>
          </div>
        </div>
        <div className="dashboard-top-header-right">
          <span className={`dashboard-status ${statusInfo.className}`}>
            {statusInfo.label}
          </span>
        </div>
      </header>

      <div className="dashboard-page-content">
        {/* Customer Info + Payment */}
        <div className="dashboard-grid-2" style={{ marginBottom: "1.5rem", marginTop: 0 }}>
          <div className="dashboard-card" style={{ padding: "1.5rem" }}>
            <div className="dashboard-card-title flex items-center" style={{ fontSize: "1.1rem", color: "#6B1218", borderBottom: "1px solid rgba(107, 78, 53, 0.15)", paddingBottom: "0.75rem", marginBottom: "0.75rem" }}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{ marginRight: "6px" }}
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              Thông tin khách hàng
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px dashed rgba(107, 78, 53, 0.12)" }}>
              <span style={{ color: "#6B4C35", fontWeight: 600 }}>Họ tên:</span>
              <span style={{ color: "#2C1810", fontWeight: 500 }}>{order.shippingFullname}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px dashed rgba(107, 78, 53, 0.12)" }}>
              <span style={{ color: "#6B4C35", fontWeight: 600 }}>Điện thoại:</span>
              <span style={{ color: "#2C1810", fontWeight: 500 }}>{order.phone}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px dashed rgba(107, 78, 53, 0.12)" }}>
              <span style={{ color: "#6B4C35", fontWeight: 600 }}>Email:</span>
              <span style={{ color: "#2C1810", fontWeight: 500 }}>{order.email || "-"}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0" }}>
              <span style={{ color: "#6B4C35", fontWeight: 600 }}>Địa chỉ:</span>
              <span style={{ color: "#2C1810", fontWeight: 500, textAlign: "right", marginLeft: "20px" }}>
                {order.shippingAddress}, {order.shippingCity}
              </span>
            </div>
            {order.shippingNote && (
              <div
                className="mt-3 p-3 text-xs italic rounded-lg"
                style={{
                  background: "rgba(107, 78, 53, 0.05)",
                  color: "#6B4C35",
                  border: "1px solid rgba(107, 78, 53, 0.1)",
                }}
              >
                <span className="font-bold block not-italic text-[#6B4C35]/80 mb-1">
                  Ghi chú khách hàng:
                </span>
                "{order.shippingNote}"
              </div>
            )}
          </div>

          <div className="dashboard-card" style={{ padding: "1.5rem" }}>
            <div className="dashboard-card-title flex items-center" style={{ fontSize: "1.1rem", color: "#6B1218", borderBottom: "1px solid rgba(107, 78, 53, 0.15)", paddingBottom: "0.75rem", marginBottom: "0.75rem" }}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{ marginRight: "6px" }}
              >
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                <line x1="1" y1="10" x2="23" y2="10" />
              </svg>
              Thanh toán & Giao hàng
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px dashed rgba(107, 78, 53, 0.12)" }}>
              <span style={{ color: "#6B4C35", fontWeight: 600 }}>Phương thức thanh toán:</span>
              <span style={{ color: "#2C1810", fontWeight: 500, textAlign: "right", marginLeft: "20px" }}>
                {order.paymentMethod === "bank" ? "Chuyển khoản ngân hàng" : "COD (Thanh toán khi nhận hàng)"}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px dashed rgba(107, 78, 53, 0.12)" }}>
              <span style={{ color: "#6B4C35", fontWeight: 600 }}>Trạng thái thanh toán:</span>
              <span className={`font-bold ${order.paymentStatus === "paid" ? "text-green-700" : "text-red-700"}`}>
                {order.paymentStatus === "paid" ? "Đã thanh toán" : "Chưa thanh toán"}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px dashed rgba(107, 78, 53, 0.12)" }}>
              <span style={{ color: "#6B4C35", fontWeight: 600 }}>Ngày đặt:</span>
              <span style={{ color: "#2C1810", fontWeight: 500 }}>{order.date}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px dashed rgba(107, 78, 53, 0.12)" }}>
              <span style={{ color: "#6B4C35", fontWeight: 600 }}>Tổng tiền hàng:</span>
              <span style={{ color: "#2C1810", fontWeight: 500 }}>{formatCurrency(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px dashed rgba(107, 78, 53, 0.12)" }} className="text-[#8A1119]">
                <span className="text-[#8A1119]" style={{ fontWeight: 600 }}>Giảm giá {order.discountCode ? `(${order.discountCode})` : ""}:</span>
                <span className="font-bold">-{formatCurrency(order.discount)}</span>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px dashed rgba(107, 78, 53, 0.12)" }}>
              <span style={{ color: "#6B4C35", fontWeight: 600 }}>Phí giao hàng:</span>
              <span style={{ color: "#2C1810", fontWeight: 500 }}>{formatCurrency(order.shipping)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0 0 0", borderTop: "1px solid rgba(107, 78, 53, 0.15)", marginTop: "4px" }}>
              <span style={{ color: "#2C1810", fontWeight: 700 }}>Tổng cộng:</span>
              <span
                style={{
                  color: "var(--admin-primary)",
                  fontFamily: "var(--admin-font-display)",
                  fontSize: "1.2rem",
                  fontWeight: 700,
                }}
              >
                {formatCurrency(order.total)}
              </span>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="dashboard-card" style={{ marginBottom: "1.5rem" }}>
          <div className="dashboard-card-header">
            <h2 className="dashboard-card-title">Sản phẩm trong đơn</h2>
            <span
              className="dashboard-status completed"
              style={{ padding: "0.25rem 0.75rem", fontSize: "0.8rem" }}
            >
              {order.items.length} sản phẩm
            </span>
          </div>
          <div className="dashboard-card-body no-padding">
            <div className="dashboard-table-wrapper">
              <table className="dashboard-admin-table">
                <thead>
                  <tr>
                    <th>Sản phẩm</th>
                    <th>Mùi hương</th>
                    <th>Màu sáp</th>
                    <th>Kích thước</th>
                    <th>Topping</th>
                    <th>SL</th>
                    <th>Đơn giá</th>
                    <th>Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, index) => {
                    const subtotal = item.quantity * item.price;
                    return (
                      <tr key={index}>
                        <td>
                          <div className="dashboard-product-name">{item.name}</div>
                          {item.detail && (
                            <div className="dashboard-product-note">{item.detail}</div>
                          )}
                        </td>
                        <td>{item.scent || "-"}</td>
                        <td>
                          {item.colorName ? (
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              {item.colorHex && (
                                <span
                                  className="color-swatch"
                                  style={{
                                    backgroundColor: item.colorHex,
                                    width: "20px",
                                    height: "20px",
                                    display: "inline-block",
                                    borderRadius: "4px",
                                    border: "1px solid rgba(107, 78, 53, 0.2)",
                                  }}
                                />
                              )}
                              <span style={{ fontSize: "0.88rem" }}>{item.colorName}</span>
                            </div>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td>{item.size || "-"}</td>
                        <td>
                          {item.toppings && item.toppings.length > 0 ? (
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                              {item.toppings.map((top, tIdx) => (
                                <span
                                  key={tIdx}
                                  className="dashboard-status completed"
                                  style={{
                                    fontSize: "0.7rem",
                                    padding: "0.15rem 0.4rem",
                                    fontWeight: 500,
                                  }}
                                >
                                  + {top}
                                </span>
                              ))}
                            </div>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td>
                          <strong>{item.quantity}</strong>
                        </td>
                        <td>{formatCurrency(item.price)}</td>
                        <td
                          className="font-bold"
                          style={{ color: "var(--admin-primary)", textAlign: "right" }}
                        >
                          {formatCurrency(subtotal)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr style={{ background: "rgba(107, 18, 24, 0.04)" }}>
                    <td colSpan={7} style={{ textAlign: "right", fontWeight: 600, fontSize: "0.88rem", padding: "1rem 1.75rem" }}>
                      Tổng thanh toán
                    </td>
                    <td
                      style={{
                        fontFamily: "var(--admin-font-display)",
                        fontWeight: 700,
                        fontSize: "1.2rem",
                        color: "var(--admin-primary)",
                        textAlign: "right",
                        padding: "1rem 1.75rem",
                      }}
                    >
                      {formatCurrency(order.total)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        {/* Timeline + Status Update */}
        <div className="dashboard-grid-2">
          {/* Timeline */}
          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <h2 className="dashboard-card-title">Lịch sử trạng thái</h2>
            </div>
            <div className="dashboard-card-body">
              <div className="dashboard-timeline">
                {order.historyLogs && order.historyLogs.length > 0 ? (
                  order.historyLogs.map((log, index) => {
                    const isLatest = index === order.historyLogs.length - 1;
                    const logStatusInfo = statusMap[log.currentStatus] || { label: log.currentStatus, className: "pending" };

                    return (
                      <div className="dashboard-timeline-item" key={log.id}>
                        <div
                          className={`dashboard-timeline-dot ${isLatest ? "active" : "completed"}`}
                          style={{
                            backgroundColor: isLatest
                              ? "var(--admin-primary)"
                              : "var(--admin-success, #2E5A44)",
                          }}
                        />
                        <div className="dashboard-timeline-time">
                          {formatDateTime(log.createdAt)}
                        </div>
                        <div className="dashboard-timeline-title">
                          {logStatusInfo.label}
                        </div>
                        {log.note && (
                          <div className="dashboard-timeline-desc">{log.note}</div>
                        )}
                        {log.admin && (
                          <div className="dashboard-timeline-user">Bởi: {log.admin}</div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center text-sm text-[#6B4C35] py-4">
                    Chưa có lịch sử trạng thái
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Update Status */}
          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <h2 className="dashboard-card-title">Cập nhật trạng thái</h2>
            </div>
            <div className="dashboard-card-body">
              {isOrderCancelled ? (
                <div
                  className="p-4 text-center rounded-xl font-medium"
                  style={{
                    backgroundColor: "rgba(138, 17, 25, 0.08)",
                    color: "var(--admin-primary)",
                    border: "1px solid rgba(138, 17, 25, 0.15)",
                  }}
                >
                  Đơn hàng đã bị hủy. Không thể thay đổi trạng thái của đơn hàng đã hủy.
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs uppercase tracking-wider font-bold text-[#6B4C35]">
                      Trạng thái mới
                    </label>
                    <select
                      className="orders-form-select"
                      style={{ width: "100%", height: "46px", background: "white", padding: "0 12px" }}
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      disabled={isUpdating}
                    >
                      <option value="">Chọn trạng thái...</option>
                      <option value="PENDING" disabled={currentDBStatus === "PENDING"}>
                        Chờ xác nhận
                      </option>
                      <option value="PROCESSING" disabled={currentDBStatus === "PROCESSING"}>
                        Đang xử lý
                      </option>
                      <option value="SHIPPED" disabled={currentDBStatus === "SHIPPED"}>
                        Đang giao hàng
                      </option>
                      <option value="DELIVERED" disabled={currentDBStatus === "DELIVERED"}>
                        Hoàn thành
                      </option>
                      <option value="CANCELLED">Đã hủy</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs uppercase tracking-wider font-bold text-[#6B4C35]">
                      Ghi chú / Lý do {newStatus === "CANCELLED" && <span className="text-red-600">*</span>}
                    </label>
                    <textarea
                      className="orders-form-input"
                      style={{
                        width: "100%",
                        height: "90px",
                        background: "white",
                        padding: "10px 12px",
                        resize: "vertical",
                      }}
                      placeholder={
                        newStatus === "CANCELLED"
                          ? "Vui lòng nhập lý do hủy đơn hàng (bắt buộc)..."
                          : "Nhập ghi chú cho lần cập nhật này (tùy chọn)..."
                      }
                      value={statusNote}
                      onChange={(e) => setStatusNote(e.target.value)}
                      disabled={isUpdating}
                    />
                  </div>

                  <button
                    className="dashboard-btn"
                    style={{
                      backgroundColor: "var(--admin-primary)",
                      color: "#F5F0E8",
                      border: "none",
                      width: "100%",
                      height: "46px",
                      borderRadius: "10px",
                      cursor: isUpdating ? "not-allowed" : "pointer",
                      fontWeight: "bold",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                    }}
                    onClick={handleUpdateStatus}
                    disabled={isUpdating}
                  >
                    {isUpdating ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Đang cập nhật...
                      </>
                    ) : (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="20,6 9,17 4,12" />
                        </svg>
                        Cập nhật trạng thái
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
