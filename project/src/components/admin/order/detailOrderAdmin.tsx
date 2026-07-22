"use client";

import { useState } from "react";
import type { OrderDetail } from "@/src/lib/types/client";
import AdminHeader from "@/src/components/admin/layout/AdminHeader";
import TableResponsiveWrapper from "@/src/components/admin/common/TableResponsiveWrapper";
import UpdateTrackingForm from "./UpdateTrackingForm";
import { testDeliverOrderAction } from "@/src/lib/action/order.action";
import { useToast } from "@/src/components/ui/toastProvider";
import { useRouter } from "next/navigation";

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
  const order = initialOrder;
  const { toast } = useToast();
  const router = useRouter();
  const [isDelivering, setIsDelivering] = useState(false);

  const handleDevDeliver = async () => {
    setIsDelivering(true);
    const res = await testDeliverOrderAction(order.dbId);
    setIsDelivering(false);
    if (res && "error" in res && res.error) {
      toast.error(res.error as string);
    } else {
      toast.success("Đã chuyển sang trạng thái Đã giao hàng!");
      router.refresh();
    }
  };

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
        <div className="flex items-center gap-3">
          {(currentDBStatus === "PROCESSING" || currentDBStatus === "SHIPPED") && (
            <button
              onClick={handleDevDeliver}
              disabled={isDelivering}
              className="px-3 py-1.5 text-xs font-semibold bg-gray-900 text-white rounded-md hover:bg-black transition disabled:opacity-50"
            >
              {isDelivering ? "Đang xử lý..." : "Test: Đã giao hàng"}
            </button>
          )}
          <span className={`dashboard-status ${statusInfo.className}`}>
            {statusInfo.label}
          </span>
        </div>
      </AdminHeader>

      {/* 2 cột: mỗi card nằm 1 cột */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        {/* Customer Info */}
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center text-sm font-semibold text-gray-700 uppercase tracking-wide mb-5">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="mr-2 text-gray-400"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
              <circle cx="8.5" cy="7" r="4" />
              <line x1="20" y1="8" x2="20" y2="14" />
              <line x1="23" y1="11" x2="17" y2="11" />
            </svg>
            Thông tin khách hàng
          </div>

          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-gray-500 text-[0.65rem] block mb-1 uppercase tracking-wider font-semibold">Họ tên</span>
                <span className="text-gray-900 font-medium text-sm">{order.shippingFullname}</span>
              </div>
              
              <div>
                <span className="text-gray-500 text-[0.65rem] block mb-1 uppercase tracking-wider font-semibold">Điện thoại</span>
                <span className="text-gray-900 font-medium text-sm">{order.phone}</span>
              </div>
            </div>

            <div>
              <span className="text-gray-500 text-[0.65rem] block mb-1 uppercase tracking-wider font-semibold">Email</span>
              <span className="text-gray-900 font-medium text-sm">{order.email || "-"}</span>
            </div>

            <div>
              <span className="text-gray-500 text-[0.65rem] block mb-1 uppercase tracking-wider font-semibold">Địa chỉ</span>
              <span className="text-gray-900 font-medium text-sm leading-relaxed block">
                {order.shippingAddress}, {order.shippingCity}
              </span>
            </div>

            {order.shippingNote && (
              <div className="sm:col-span-2 mt-1">
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-100 text-sm">
                  <span className="font-semibold text-amber-700 block mb-1">Ghi chú:</span>
                  <p className="leading-relaxed text-amber-800">{order.shippingNote}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Payment & Shipping */}
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm flex flex-col h-full">
          <div className="flex items-center text-sm font-semibold text-gray-700 uppercase tracking-wide mb-5">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="mr-2 text-gray-400"
            >
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
              <line x1="1" y1="10" x2="23" y2="10" />
            </svg>
            Thanh toán &amp; Giao hàng
          </div>

          <div className="flex flex-col gap-3 flex-1">
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-sm">Phương thức thanh toán</span>
              <span className="text-gray-800 font-medium text-right">
                {order.paymentMethod === "bank" ? "Chuyển khoản" : "COD (Thanh toán khi nhận)"}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-sm">Trạng thái thanh toán</span>
              {order.paymentStatus === "PAID" ? (
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold border border-emerald-200">
                  Đã thanh toán
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold border border-amber-200">
                  Chưa thanh toán
                </span>
              )}
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-sm">Ngày đặt</span>
              <span className="text-gray-800 font-medium text-right">{order.date}</span>
            </div>

            <hr className="border-gray-100 my-1" />

            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Tổng tiền hàng</span>
              <span className="text-gray-900 font-medium">{formatCurrency(order.subtotal)}</span>
            </div>

            {order.discount > 0 && (
              <div className="flex justify-between items-center text-sm text-red-500">
                <span>
                  Giảm giá {order.discountCode ? `(${order.discountCode})` : ""}
                </span>
                <span className="font-semibold text-right">-{formatCurrency(order.discount)}</span>
              </div>
            )}

            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Phí giao hàng</span>
              <span className="text-gray-900 font-medium">{formatCurrency(order.shipping)}</span>
            </div>
            
            {/* Tự động đẩy phần tổng tiền xuống dưới cùng */}
            <div className="mt-auto pt-4 flex justify-between items-center">
              <span className="text-gray-900 font-bold text-base uppercase tracking-wider">Tổng cộng</span>
              <span className="text-gray-900 font-bold text-xl">{formatCurrency(order.total)}</span>
            </div>
          </div>
        </div>
      </div>

      <UpdateTrackingForm
        orderId={order.dbId}
        initialCarrier={order.shippingCarrier}
        initialCode={order.trackingCode}
      />

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-5 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide m-0">Sản phẩm trong đơn</h2>
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-200 text-gray-600">
            {order.items.length} sản phẩm
          </span>
        </div>

        <TableResponsiveWrapper minWidth={780}>
          <table className="w-full text-left border-collapse text-sm text-gray-800">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3 font-semibold whitespace-nowrap border-b border-gray-100">Sản phẩm</th>
                <th className="px-5 py-3 font-semibold whitespace-nowrap border-b border-gray-100">Mùi hương</th>
                <th className="px-5 py-3 font-semibold whitespace-nowrap border-b border-gray-100">Màu sáp</th>
                <th className="px-5 py-3 font-semibold whitespace-nowrap border-b border-gray-100">Kích thước</th>
                <th className="px-5 py-3 font-semibold whitespace-nowrap border-b border-gray-100">Topping</th>
                <th className="px-5 py-3 font-semibold whitespace-nowrap border-b border-gray-100 text-center">SL</th>
                <th className="px-5 py-3 font-semibold whitespace-nowrap border-b border-gray-100 text-right">Đơn giá</th>
                <th className="px-5 py-3 font-semibold whitespace-nowrap border-b border-gray-100 text-right">Thành tiền</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {order.items.map((item, index) => {
                const subtotal = item.quantity * item.price;
                return (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-gray-900 min-w-[200px]">{item.name}</div>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-gray-600">{item.scent || "-"}</td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      {item.colorName ? (
                        <div className="flex items-center gap-2">
                          {item.colorHex && (
                            <span
                              className="w-4 h-4 rounded border border-gray-200"
                              style={{ backgroundColor: item.colorHex }}
                            />
                          )}
                          <span className="text-gray-600">{item.colorName}</span>
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-gray-600">{item.size || "-"}</td>
                    <td className="px-5 py-3.5 max-w-[200px]">
                      {item.toppings && item.toppings.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {item.toppings.map((top, tIdx) => (
                            <span
                              key={tIdx}
                              className="px-2 py-0.5 text-[0.68rem] bg-gray-100 rounded text-gray-600 whitespace-nowrap"
                            >
                              + {top}
                            </span>
                          ))}
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-center font-bold text-gray-800">{item.quantity}</td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap text-gray-600">{formatCurrency(item.price)}</td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap font-bold text-gray-900">{formatCurrency(subtotal)}</td>
                  </tr>
                );
              })}
            </tbody>

            <tfoot>
              <tr className="bg-gray-50 border-t border-gray-200">
                <td colSpan={7} className="px-5 py-4 text-right font-semibold text-gray-600">
                  Tổng thanh toán
                </td>
                <td className="px-5 py-4 text-right font-bold text-base text-gray-900">{formatCurrency(order.total)}</td>
              </tr>
            </tfoot>
          </table>
        </TableResponsiveWrapper>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-5 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide m-0">Lịch sử trạng thái</h2>
        </div>

        <div className="p-5">
          <div className="relative border-l border-gray-200 ml-3 space-y-5">
            {order.historyLogs && order.historyLogs.length > 0 ? (
              order.historyLogs.map((log, index) => {
                const isLatest = index === order.historyLogs.length - 1;
                const logStatusInfo =
                  statusMap[log.currentStatus] || ({ label: log.currentStatus, className: "pending" } as const);

                return (
                  <div className="relative pl-6 pb-2" key={log.id}>
                    <div
                      className={`absolute left-[-5px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
                        isLatest
                          ? "bg-gray-900 shadow-sm"
                          : "bg-gray-300"
                      }`}
                    />

                    <div className="text-xs text-gray-400 mb-0.5 font-mono">{formatDateTime(log.createdAt)}</div>

                    <div className={`font-semibold ${isLatest ? "text-gray-900 text-sm" : "text-gray-500 text-sm"}`}>
                      {logStatusInfo.label}
                    </div>

                    {log.note && <div className="text-sm text-gray-500 mt-1">{log.note}</div>}
                    {log.admin && <div className="text-xs text-gray-400 mt-0.5">Người thao tác: {log.admin}</div>}
                  </div>
                );
              })
            ) : (
              <div className="text-sm text-gray-400 italic py-4">Chưa có lịch sử trạng thái</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}




