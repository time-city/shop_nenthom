"use client";

import { startTransition, useEffect, useState } from "react";
import {
  cancelMyOrderAction,
  getMyOrderDetailAction,
  getOrderDetailForAdminAction,
} from "@/src/lib/action/order.action";
import LoadingState from "@/src/components/ui/loadingState";

import type {
  DetailOrderProps,
  OrderDetail,
} from "../../lib/types/client";
import { callAction } from "@/src/lib/utils/callAction";

const statusLabel: Record<OrderDetail["status"], string> = {
  canceled: "Đã huỷ",
  confirmed: "Đã xác nhận",
  pending: "Đang xác nhận",
};

const statusClass: Record<OrderDetail["status"], string> = {
  canceled: "bg-[#2c1810]/10 text-[#6B4C35]",
  confirmed: "bg-[#45A05C]/15 text-[#1F6B3A]",
  pending: "bg-[#F4E2B7] text-[#8B5E3C]",
};

const formatPrice = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    currency: "VND",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value);

export default function DetailOrder({
  orderNumber,
  onClose,
  isAdmin = false,
  onCancelSuccess,
}: DetailOrderProps) {
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelError, setCancelError] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    let isMounted = true;
    startTransition(() => {
      setIsLoading(true);
      setError(null);
    });

    const fetchDetail = async () => {
      try {
        const response = isAdmin
          ? await callAction(() => getOrderDetailForAdminAction({ order_number: orderNumber }), "Không thể tải chi tiết đơn hàng. Vui lòng thử lại sau.")
          : await callAction(() => getMyOrderDetailAction(orderNumber), "Không thể tải chi tiết đơn hàng. Vui lòng thử lại sau.");
        if (!isMounted) return;

        if ("error" in response) {
          setError(response.error);
        } else if ("success" in response && "data" in response) {
          setOrder(response.data as unknown as OrderDetail);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : String(err));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void fetchDetail();

    return () => {
      isMounted = false;
    };
  }, [orderNumber, isAdmin]);

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleCancelOrder = async () => {
    if (!order || isCancelling) return;
    if (!cancelReason.trim()) {
      setCancelError("Vui lòng nhập lý do huỷ đơn");
      return;
    }

    setIsCancelling(true);
    setCancelError("");

    try {
      const result = await callAction(() => cancelMyOrderAction({
        order_id: order.id,
        reason: cancelReason.trim(),
      }), "Không thể hủy đơn hàng. Vui lòng thử lại sau.");

      if ("error" in result && result.error) {
        setCancelError(result.error);
        return;
      }

      setOrder((currentOrder) =>
        currentOrder ? { ...currentOrder, status: "canceled" } : currentOrder,
      );
      setShowCancelForm(false);
      setCancelReason("");
      onCancelSuccess?.();
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div
      onClick={handleOverlayClick}
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-[#2C1810]/60 p-4 backdrop-blur-sm transition-opacity"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative flex max-h-[90vh] w-full max-w-[650px] flex-col overflow-hidden rounded-2xl bg-[#F8F0E4] text-[#2C1810] shadow-[0_24px_54px_rgba(44,24,16,0.22)] transition-all animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#6B4C35]/15 bg-[#6B1218] px-6 py-4 text-[#F5F0E8]">
          <div>
            <h3 className="font-serif text-lg font-bold">Chi Tiết Đơn Hàng</h3>
            <p className="text-xs text-[#F5F0E8]/70 mt-0.5">Mã đơn: {orderNumber}</p>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="rounded-full p-1.5 text-[#F5F0E8]/70 hover:bg-[#F5F0E8]/10 hover:text-[#F5F0E8] transition"
            aria-label="Đóng"
          >
            <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <LoadingState label="Đang tải chi tiết đơn hàng..." className="border-0 bg-transparent shadow-none" />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-[#6B1218] font-medium">{error}</div>
          ) : order ? (
            <>
              {/* Order Info & Status */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-[#6B4C35]/10 bg-white p-4">
                  <div className="text-[0.7rem] uppercase tracking-wider text-[#6B4C35]/60 mb-2 font-bold">Trạng thái</div>
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass[order.status]}`}>
                      {statusLabel[order.status]}
                    </span>
                    <span className="text-xs text-[#6B4C35]/60 font-light">Ngày đặt: {order.date}</span>
                  </div>
                </div>

                <div className="rounded-xl border border-[#6B4C35]/10 bg-white p-4">
                  <div className="text-[0.7rem] uppercase tracking-wider text-[#6B4C35]/60 mb-2 font-bold">Thanh toán</div>
                  <div className="text-sm font-semibold">
                    {order.paymentMethod === "cod" ? "COD (Khi nhận hàng)" : "Chuyển khoản"} -{" "}
                    <span className={order.paymentStatus === "paid" ? "text-[#45A05C]" : "text-[#6B1218]"}>
                      {order.paymentStatus === "paid" ? "Đã thanh toán" : "Chưa thanh toán"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Recipient / Shipping Info */}
              <div className="rounded-xl border border-[#6B4C35]/10 bg-white p-5 space-y-3">
                <h4 className="font-serif font-bold text-[#6B1218] border-b border-[#6B4C35]/10 pb-2 text-sm uppercase tracking-wider">
                  Thông tin giao nhận
                </h4>
                <div className="grid gap-2 text-sm">
                  <div>
                    <span className="text-[#6B4C35]/60 font-medium mr-1">Người nhận:</span>{" "}
                    <span className="font-semibold">{order.shippingFullname}</span>
                  </div>
                  <div>
                    <span className="text-[#6B4C35]/60 font-medium mr-1">Số điện thoại:</span> {order.phone}
                  </div>
                  <div>
                    <span className="text-[#6B4C35]/60 font-medium mr-1">Địa chỉ:</span> {order.shippingAddress}, {order.shippingCity}
                  </div>
                  {order.shippingNote && (
                    <div className="mt-2 rounded-lg bg-[#F8F0E4] p-3 text-xs text-[#6B4C35] italic border border-[#6B4C35]/5">
                      <span className="font-semibold block not-italic text-[#6B4C35]/80 mb-1">Ghi chú giao hàng:</span>
                      &quot;{order.shippingNote}&quot;
                    </div>
                  )}
                </div>
              </div>

              {/* Items List */}
              <div className="rounded-xl border border-[#6B4C35]/10 bg-white p-5 space-y-4">
                <h4 className="font-serif font-bold text-[#6B1218] border-b border-[#6B4C35]/10 pb-2 text-sm uppercase tracking-wider">
                  Sản phẩm đã đặt
                </h4>
                <div className="divide-y divide-[#6B4C35]/10">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="py-3 first:pt-0 last:pb-0 flex items-start justify-between gap-4">
                      <div>
                        <h5 className="font-semibold text-sm text-[#2C1810]">{item.name}</h5>
                        {item.detail && <p className="text-xs text-[#6B4C35]/70 font-light mt-1">{item.detail}</p>}
                        {item.toppings && item.toppings.length > 0 && (
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {item.toppings.map((top, tIdx) => (
                              <span key={tIdx} className="rounded bg-[#6B1218]/5 px-1.5 py-0.5 text-[0.65rem] text-[#6B1218] border border-[#6B1218]/10">
                                + {top}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="text-right text-sm">
                        <span className="font-sans font-bold text-sm text-[#6B1218] mr-2">x{item.quantity}</span>
                        <span className="font-sans font-semibold text-[#6B1218] text-[0.95rem]">{formatPrice(item.price)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Prices breakdown */}
              <div className="rounded-xl border border-[#6B4C35]/10 bg-white p-5 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-[#6B4C35]/70 font-light">Tạm tính:</span>
                  <span className="font-medium">{formatPrice(order.subtotal)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-sm text-[#6B1218]">
                    <span className="font-light">Giảm giá {order.discountCode ? `(${order.discountCode})` : ""}:</span>
                    <span className="font-medium">-{formatPrice(order.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-[#6B4C35]/70 font-light">Phí giao hàng:</span>
                  <span className="font-medium">{formatPrice(order.shipping)}</span>
                </div>
                <div className="flex justify-between border-t border-[#6B4C35]/10 pt-3 text-[1.05rem] font-bold text-[#6B1218]">
                  <span className="font-sans">Tổng cộng:</span>
                  <span className="font-sans text-[1.15rem]">{formatPrice(order.total)}</span>
                </div>
              </div>

              {/* Timeline Logs */}
              {order.historyLogs && order.historyLogs.length > 0 && (
                <div className="rounded-xl border border-[#6B4C35]/10 bg-white p-5 space-y-4">
                  <h4 className="font-serif font-bold text-[#6B1218] border-b border-[#6B4C35]/10 pb-2 text-sm uppercase tracking-wider">
                    Lịch sử đơn hàng
                  </h4>
                  <div className="relative border-l border-[#6B1218]/30 pl-4 ml-2 space-y-4">
                    {order.historyLogs.map((log) => (
                      <div key={log.id} className="relative text-xs">
                        <span className="absolute -left-[21px] mt-1 size-2 rounded-full bg-[#6B1218] border border-white" />
                        <div className="font-bold text-[#6B1218]">
                          {new Date(log.createdAt).toLocaleString("vi-VN")}
                        </div>
                        <div className="text-[#6B4C35] font-light mt-0.5">{log.note || "Cập nhật trạng thái"}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!isAdmin && order.status === "pending" ? (
                <div className="rounded-xl border border-[#6B1218]/15 bg-white p-5">
                  {showCancelForm ? (
                    <div className="space-y-3">
                      <label
                        htmlFor="customer-cancel-reason"
                        className="block text-xs font-semibold uppercase tracking-wider text-[#6B4C35]"
                      >
                        Lý do huỷ đơn
                      </label>
                      <textarea
                        id="customer-cancel-reason"
                        value={cancelReason}
                        onChange={(event) => {
                          setCancelReason(event.target.value);
                          if (cancelError) setCancelError("");
                        }}
                        rows={3}
                        className="w-full rounded-lg border border-[#6B4C35]/25 bg-[#F8F0E4] px-3 py-2 text-sm outline-none focus:border-[#6B1218]"
                        placeholder="Nhập lý do bạn muốn huỷ đơn..."
                      />
                      {cancelError ? (
                        <p className="text-xs font-medium text-[#6B1218]">
                          {cancelError}
                        </p>
                      ) : null}
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setShowCancelForm(false);
                            setCancelError("");
                          }}
                          disabled={isCancelling}
                          className="rounded-full border border-[#6B4C35]/25 px-4 py-2 text-xs font-semibold text-[#6B4C35]"
                        >
                          Quay lại
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelOrder}
                          disabled={isCancelling}
                          className="rounded-full bg-[#6B1218] px-4 py-2 text-xs font-semibold text-[#F5F0E8] disabled:opacity-60"
                        >
                          {isCancelling ? "Đang huỷ..." : "Xác nhận huỷ"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowCancelForm(true)}
                      className="rounded-full border border-[#6B1218] px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#6B1218] transition hover:bg-[#6B1218] hover:text-[#F5F0E8]"
                    >
                      Huỷ đơn hàng
                    </button>
                  )}
                </div>
              ) : null}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
