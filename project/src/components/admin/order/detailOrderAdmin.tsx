"use client";

import { useState } from "react";
import type { OrderDetail } from "@/src/lib/types/client";
import AdminHeader from "@/src/components/admin/layout/AdminHeader";
import TableResponsiveWrapper from "@/src/components/admin/common/TableResponsiveWrapper";

interface Props {
  initialOrder: OrderDetail;
}

const statusMap: Record<string, { label: string; className: string }> = {
  PENDING: { label: "Đang xác nhận", className: "pending" },
  PROCESSING: { label: "Đã xác nhận", className: "confirmed" },
  SHIPPED: { label: "Đã xác nhận", className: "confirmed" },
  DELIVERED: { label: "Đã xác nhận", className: "confirmed" },
  CANCELLED: { label: "Đã huỷ", className: "cancelled" },
  CANCEL_REQUESTED: { label: "Yêu cầu huỷ", className: "cancel_requested" },
};

const clientStatusMap: Record<OrderDetail["status"], string> = {
  canceled: "CANCELLED",
  processing: "PROCESSING",
  shipped: "SHIPPED",
  delivered: "DELIVERED",
  pending: "PENDING",
  cancel_requested: "CANCEL_REQUESTED",
};

export default function DetailOrderAdmin({ initialOrder }: Props) {
  const [order] = useState<OrderDetail>(initialOrder);

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

  const latestLog =
    order.historyLogs && order.historyLogs.length > 0
      ? order.historyLogs[order.historyLogs.length - 1]
      : null;

  const currentDBStatus =
    latestLog?.currentStatus || clientStatusMap[order.status] || "PENDING";

  const statusInfo =
    statusMap[currentDBStatus] ||
    ({ label: "Đang xác nhận", className: "pending" } as const);

  return (
    <>
      <AdminHeader
        title={`Chi tiết Đơn hàng: ${order.id}`}
        backUrl="/admin/ordersManagement"
      >
        <span className={`dashboard-status ${statusInfo.className}`}>
          {statusInfo.label}
        </span>
      </AdminHeader>

      {/* 2 cột: mỗi card nằm 1 cột */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Customer Info */}
        <div className="dashboard-card p-6">
          <div className="flex items-center text-lg text-[#2C1810] border-b border-[#6B4E35]/15 pb-4 mb-4">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="mr-2 text-[#6B4E35]"
            >
              <circle cx="12" cy="7" r="4" />
              <circle cx="12" cy="7" r="0" />
            </svg>
            Thông tin khách hàng
          </div>

          <div className="flex justify-between items-center py-3 border-b border-[#6B4E35]/10">
            <span className="text-[#6B4E35] font-medium">Họ tên:</span>
            <span className="text-[#2C1810] font-medium">
              {order.shippingFullname}
            </span>
          </div>

          <div className="flex justify-between items-center py-3 border-b border-[#6B4E35]/10">
            <span className="text-[#6B4E35] font-medium">Điện thoại:</span>
            <span className="text-[#2C1810] font-medium">{order.phone}</span>
          </div>

          <div className="flex justify-between items-center py-3 border-b border-[#6B4E35]/10">
            <span className="text-[#6B4E35] font-medium">Email:</span>
            <span className="text-[#2C1810] font-medium">
              {order.email || "-"}
            </span>
          </div>

          <div className="flex justify-between items-center py-3">
            <span className="text-[#6B4E35] font-medium">Địa chỉ:</span>
            <span className="text-[#2C1810] font-medium text-right ml-5">
              {order.shippingAddress}, {order.shippingCity}
            </span>
          </div>

          {order.shippingNote && (
            <div className="mt-4 p-4 text-sm rounded-lg bg-[#F5F0E8]/40 border border-[#6B4E35]/15 text-[#2C1810]">
              <span className="font-semibold text-[#6B4E35] block mb-1">
                Ghi chú khách hàng:
              </span>
              {order.shippingNote}
            </div>
          )}
        </div>

        {/* Payment & Shipping */}
        <div className="dashboard-card p-6">
          <div className="flex items-center text-lg text-[#2C1810] border-b border-[#6B4E35]/15 pb-4 mb-4">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="mr-2 text-[#6B4E35]"
            >
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
              <line x1="1" y1="10" x2="23" y2="10" />
            </svg>
            Thanh toán &amp; Giao hàng
          </div>

          <div className="flex justify-between items-center py-3 border-b border-[#6B4E35]/10">
            <span className="text-[#6B4E35] font-medium">
              Phương thức thanh toán:
            </span>
            <span className="text-[#2C1810] font-medium text-right ml-5">
              {order.paymentMethod === "bank"
                ? "Chuyển khoản ngân hàng"
                : "COD (Thanh toán khi nhận hàng)"}
            </span>
          </div>

          <div className="flex justify-between items-center py-3 border-b border-[#6B4E35]/10">
            <span className="text-[#6B4E35] font-medium">
              Trạng thái thanh toán:
            </span>
            <span
              className={`font-semibold ${
                order.paymentStatus === "paid" ? "text-emerald-600" : "text-amber-600"
              }`}
            >
              {order.paymentStatus === "paid" ? "Đã thanh toán" : "Chưa thanh toán"}
            </span>
          </div>

          <div className="flex justify-between items-center py-3 border-b border-[#6B4E35]/10">
            <span className="text-[#6B4E35] font-medium">Ngày đặt:</span>
            <span className="text-[#2C1810] font-medium">{order.date}</span>
          </div>

          <div className="flex justify-between items-center py-3 border-b border-[#6B4E35]/10">
            <span className="text-[#6B4E35] font-medium">Tổng tiền hàng:</span>
            <span className="text-[#2C1810] font-medium">
              {formatCurrency(order.subtotal)}
            </span>
          </div>

          {order.discount > 0 && (
            <div className="flex justify-between items-center py-3 border-b border-[#6B4E35]/10 text-rose-600">
              <span className="font-medium">
                Giảm giá {order.discountCode ? `(${order.discountCode})` : ""}:
              </span>
              <span className="font-semibold">-{formatCurrency(order.discount)}</span>
            </div>
          )}

          <div className="flex justify-between items-center py-3 border-b border-[#6B4E35]/10">
            <span className="text-[#6B4E35] font-medium">Phí giao hàng:</span>
            <span className="text-[#2C1810] font-medium">
              {formatCurrency(order.shipping)}
            </span>
          </div>

          <div className="flex justify-between items-center pt-4 mt-2">
            <span className="text-[#2C1810] font-semibold text-lg">Tổng cộng:</span>
            <span className="text-[#2C1810] font-bold text-xl">
              {formatCurrency(order.total)}
            </span>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="dashboard-card mb-6 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#6B4E35]/15 bg-[#F5F0E8]/30">
          <h2 className="text-lg text-[#2C1810] font-medium m-0">Sản phẩm trong đơn</h2>
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-[#6B4E35]/10 text-[#6B4E35]">
            {order.items.length} sản phẩm
          </span>
        </div>

        <TableResponsiveWrapper minWidth={780}>
          <table className="w-full text-left border-collapse text-sm text-[#2C1810]">
            <thead className="bg-[rgba(214,161,95,0.15)] text-[#6B4E35] text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold border-b border-[#6B4E35]/10">Sản phẩm</th>
                <th className="px-6 py-4 font-semibold border-b border-[#6B4E35]/10">Mùi hương</th>
                <th className="px-6 py-4 font-semibold border-b border-[#6B4E35]/10">Màu sáp</th>
                <th className="px-6 py-4 font-semibold border-b border-[#6B4E35]/10">Kích thước</th>
                <th className="px-6 py-4 font-semibold border-b border-[#6B4E35]/10">Topping</th>
                <th className="px-6 py-4 font-semibold border-b border-[#6B4E35]/10 text-center">SL</th>
                <th className="px-6 py-4 font-semibold border-b border-[#6B4E35]/10 text-right">Đơn giá</th>
                <th className="px-6 py-4 font-semibold border-b border-[#6B4E35]/10 text-right">Thành tiền</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#6B4E35]/10">
              {order.items.map((item, index) => {
                const subtotal = item.quantity * item.price;
                return (
                  <tr key={index} className="hover:bg-[#6B4E35]/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-[#2C1810] mb-1">{item.name}</div>
                      {item.detail && <div className="text-xs text-[#6B4E35]">{item.detail}</div>}
                    </td>
                    <td className="px-6 py-4 text-[#2C1810]">{item.scent || "-"}</td>
                    <td className="px-6 py-4">
                      {item.colorName ? (
                        <div className="flex items-center gap-2">
                          {item.colorHex && (
                            <span
                              className="w-4 h-4 rounded border border-[#6B4E35]/20"
                              style={{ backgroundColor: item.colorHex }}
                            />
                          )}
                          <span className="text-[#2C1810]">{item.colorName}</span>
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-6 py-4">{item.size || "-"}</td>
                    <td className="px-6 py-4">
                      {item.toppings && item.toppings.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {item.toppings.map((top, tIdx) => (
                            <span
                              key={tIdx}
                              className="px-2 py-0.5 text-[0.7rem] bg-[#6B4E35]/10 rounded-md whitespace-nowrap text-[#6B4E35]"
                            >
                              + {top}
                            </span>
                          ))}
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-[#2C1810]">{item.quantity}</td>
                    <td className="px-6 py-4 text-right text-[#2C1810]">{formatCurrency(item.price)}</td>
                    <td className="px-6 py-4 text-right font-bold text-[#2C1810]">{formatCurrency(subtotal)}</td>
                  </tr>
                );
              })}
            </tbody>

            <tfoot>
              <tr className="bg-[#F5F0E8]/30">
                <td colSpan={7} className="px-6 py-4 text-right font-semibold text-[#6B4E35]">
                  Tổng thanh toán
                </td>
                <td className="px-6 py-4 text-right font-bold text-lg text-[#2C1810]">{formatCurrency(order.total)}</td>
              </tr>
            </tfoot>
          </table>
        </TableResponsiveWrapper>
      </div>

      {/* Timeline */}
      <div className="dashboard-card mb-6">
        <div className="px-6 py-4 border-b border-[#6B4E35]/15 bg-[#F5F0E8]/30">
          <h2 className="text-lg text-[#2C1810] font-medium m-0">Lịch sử trạng thái</h2>
        </div>

        <div className="p-6">
          <div className="relative border-l border-[#6B4E35]/20 ml-3 space-y-6">
            {order.historyLogs && order.historyLogs.length > 0 ? (
              order.historyLogs.map((log, index) => {
                const isLatest = index === order.historyLogs.length - 1;
                const logStatusInfo =
                  statusMap[log.currentStatus] || ({ label: log.currentStatus, className: "pending" } as const);

                return (
                  <div className="relative pl-6" key={log.id}>
                    <div
                      className={`absolute left-[-5px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-[#F5F0E8] ${
                        isLatest
                          ? "bg-[#6B1218] shadow-[0_0_10px_rgba(107,18,24,0.25)]"
                          : "bg-[#6B4E35]/30"
                      }`}
                    />

                    <div className="text-xs text-[#6B4E35] mb-1 font-mono">{formatDateTime(log.createdAt)}</div>

                    <div className={`font-semibold ${isLatest ? "text-[#2C1810]" : "text-[#6B4E35]"}`}>
                      {logStatusInfo.label}
                    </div>

                    {log.note && <div className="text-sm text-[#6B4E35] mt-1">{log.note}</div>}
                    {log.admin && <div className="text-xs text-[#6B4E35]/70 mt-1">Người thao tác: {log.admin}</div>}
                  </div>
                );
              })
            ) : (
              <div className="text-sm text-[#6B4E35] italic py-4">Chưa có lịch sử trạng thái</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

