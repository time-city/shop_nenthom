"use client";

import { startTransition, useEffect, useState } from "react";
import {
  cancelMyOrderAction,
  getMyOrderDetailAction,
  getOrderDetailForAdminAction,
} from "@/src/lib/action/order.action";
import LoadingState from "@/src/components/ui/loadingState";
import { useToast } from "@/src/components/ui/toastProvider";

import type {
  DetailOrderProps,
  OrderDetail,
} from "../../../lib/types/client";
import { callAction } from "@/src/lib/utils/callAction";
import { OrderTrackingTimeline } from "./orderTrackingTimeline";
import { useOrderTrackingSocket } from "@/src/hooks/useOrderTrackingSocket";
import type { ClientOrderStatus } from "@/src/lib/types/client";

const statusLabel: Record<OrderDetail["status"], string> = {
  canceled: "Đã huỷ",
  pending: "Đang chờ xác nhận",
  processing: "Đang xử lý",
  shipped: "Đang giao hàng",
  delivered: "Đã giao thành công",
  cancel_requested: "Chờ duyệt huỷ",
};

const statusClass: Record<OrderDetail["status"], string> = {
  canceled: "bg-[#2c1810]/10 text-[#6B4C35]",
  pending: "bg-[#F4E2B7] text-[#8B5E3C]",
  processing: "bg-[#F4E2B7] text-[#8B5E3C]",
  shipped: "bg-[#45A05C]/15 text-[#1F6B3A]",
  delivered: "bg-[#45A05C]/15 text-[#1F6B3A]",
  cancel_requested: "bg-red-950/40 text-red-400 border border-red-500/20",
};

const formatPrice = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    currency: "VND",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value);

const getTrackingLink = (carrier?: string | null, code?: string | null) => {
  if (!code || !carrier) return null;
  switch (carrier) {
    case "SPX":
      return `https://spx.vn/track?${code}`;
    case "GHTK":
      return `https://i.ghtk.vn/${code}`;
    case "VIETTEL_POST":
      return `https://viettelpost.com.vn/tra-cuu-hanh-trinh-don/`;
    default:
      return `https://www.google.com/search?q=${code}`;
  }
};

export default function DetailOrder({
  orderNumber,
  onClose,
  isAdmin = false,
  onCancelSuccess,
}: DetailOrderProps) {
  const { toast } = useToast();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelError, setCancelError] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);

  useOrderTrackingSocket({
    orderId: order?.dbId,
    onOrderStatusUpdated: (data) => {
      const translatedStatus = statusLabel[data.status as ClientOrderStatus] || data.status;
      if (data.isGuest) {
        toast.info(`Đơn hàng của bạn đã được cập nhật trạng thái: ${translatedStatus}`);
      }
      setOrder((prev) => prev ? { 
        ...prev, 
        status: data.status as ClientOrderStatus,
        ...(data.trackingCode ? { trackingCode: data.trackingCode } : {}),
        ...(data.shippingCarrier ? { shippingCarrier: data.shippingCarrier } : {})
      } : prev);
    },
    onPaymentSuccess: (data) => {
      toast.success("Thanh toán thành công! Cảm ơn bạn.");
      setOrder((prev) => prev ? { ...prev, paymentStatus: "PAID" } : prev);
    }
  });

  useEffect(() => {
    let isMounted = true;
    startTransition(() => {
      setIsLoading(true);
      setError(null);
    });

    const fetchDetail = async () => {
      try {
        const result = isAdmin
          ? await callAction(
              () => getOrderDetailForAdminAction({ order_number: orderNumber }),
              "Không thể tải chi tiết đơn hàng (Admin)"
            )
          : await callAction(
              () => getMyOrderDetailAction(orderNumber),
              "Không thể tải chi tiết đơn hàng"
            );

        if ("error" in result && result.error) {
          if (isMounted) {
            setError(result.error);
            setOrder(null);
          }
          return;
        }

        if ("success" in result && result.success && result.data) {
          if (isMounted) {
            setOrder(result.data as OrderDetail);
          }
        } else {
          if (isMounted) {
            setError("Không lấy được dữ liệu chi tiết.");
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || "Lỗi tải chi tiết đơn hàng");
        }
      } finally {
        if (isMounted) setIsLoading(false);
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
    setCancelError("");
    if (!order || isCancelling) return;
    if (!cancelReason.trim()) {
      setCancelError("Vui lòng nhập lý do huỷ");
      return;
    }

    setIsCancelling(true);
    try {
      const result = await callAction(() => cancelMyOrderAction({
        order_id: order.id,
        reason: cancelReason.trim(),
      }), "Không thể hủy đơn hàng.");

      if ("error" in result && result.error) {
        setCancelError(result.error);
        return;
      }
      if ("success" in result && result.success) {
        onCancelSuccess?.();
        onClose();
      }
    } catch (err: any) {
      setCancelError(err.message || "Có lỗi xảy ra khi hủy.");
    } finally {
      setIsCancelling(false);
    }
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  return (
    <div
      onClick={handleOverlayClick}
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm transition-opacity"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative flex max-h-[90vh] w-full max-w-[650px] flex-col overflow-hidden rounded-3xl bg-[#F5F0E8]/5 backdrop-blur-md border border-[#F5F0E8]/10 text-[#F5F0E8] shadow-[0_24px_54px_rgba(0,0,0,0.6)] transition-all animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#F5F0E8]/10 bg-[#6B1218] px-6 py-4 text-[#F5F0E8]">
          <div>
            <h3 className="font-serif text-lg font-bold">Chi Tiết Đơn Hàng</h3>
            <p className="text-xs text-[#F5F0E8]/70 mt-0.5">Mã đơn: {orderNumber}</p>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="rounded-full p-1.5 text-[#F5F0E8]/70 hover:bg-[#F5F0E8]/10 hover:text-[#F5F0E8] transition active:scale-95"
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
            <div className="text-center py-12 text-[#ff6b6b] font-medium">{error}</div>
          ) : order ? (
            <>
              {/* Timeline Tracking */}
              {!isAdmin && (
                <OrderTrackingTimeline 
                  orderId={order.dbId} 
                  initialStatus={order.status} 
                  trackingCode={order.trackingCode}
                  shippingCarrier={order.shippingCarrier}
                />
              )}

              {/* Order Info & Status */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-[#F5F0E8]/10 bg-black/35 p-4 shadow-[0_4px_12px_rgba(0,0,0,0.2)]">
                  <div className="text-[0.7rem] uppercase tracking-wider text-[#F5F0E8]/60 mb-2 font-bold">Trạng thái</div>
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass[order.status]}`}>
                      {statusLabel[order.status]}
                    </span>
                    <span className="text-xs text-[#F5F0E8]/60 font-light">Ngày đặt: {order.date}</span>
                  </div>
                </div>

                <div className="rounded-2xl border border-[#F5F0E8]/10 bg-black/35 p-4 shadow-[0_4px_12px_rgba(0,0,0,0.2)]">
                  <div className="text-[0.7rem] uppercase tracking-wider text-[#F5F0E8]/60 mb-2 font-bold">Thanh toán</div>
                  <div className="text-sm font-semibold">
                    {order.paymentMethod === "cod" ? "COD (Khi nhận hàng)" : "Chuyển khoản"} -{" "}
                    <span className={order.paymentStatus === "PAID" ? "text-green-400" : "text-orange-400"}>
                      {order.paymentStatus === "PAID" ? "Đã thanh toán" : "Chưa thanh toán"}
                    </span>
                  </div>
                </div>
              </div>

              {/* QR Code Thanh Toán */}
              {order.paymentMethod === "bank" && order.paymentStatus === "UNPAID" && (
                <div className="rounded-2xl border border-[#10B981]/30 bg-black/35 p-5 space-y-4 shadow-[0_4px_12px_rgba(0,0,0,0.2)] relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#10B981]"></div>
                  <h4 className="font-serif font-bold text-[#10B981] border-b border-[#F5F0E8]/10 pb-2 text-sm uppercase tracking-wider flex items-center gap-2">
                    <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                    Quét Mã Thanh Toán
                  </h4>
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="bg-white p-2 rounded-xl shrink-0">
                      <img 
                        src={`https://vietqr.app/img?bank=MBBank&acc=0001118294755&template=qronly&amount=${order.total}&des=CHAM${order.dbId.replace(/-/g, '').substring(0,12).toUpperCase()}&showinfo=true&holder=NGUYEN%20THANH%20NHAN`} 
                        alt="QR Code Thanh Toán" 
                        className="w-32 h-32 md:w-40 md:h-40 object-contain"
                      />
                    </div>
                    <div className="flex-1 space-y-3 text-sm">
                      <p className="text-[#F5F0E8]/80 leading-relaxed">
                        Vui lòng sử dụng App Ngân hàng của bạn để quét mã QR bên cạnh. 
                        Hệ thống sẽ tự động xác nhận thanh toán ngay lập tức.
                      </p>
                      <div className="bg-black/50 p-3 rounded-xl border border-[#F5F0E8]/10 space-y-1 mt-2">
                        <div className="flex justify-between">
                          <span className="text-[#F5F0E8]/60">Số tiền:</span>
                          <strong className="text-[#10B981] font-bold">{formatPrice(order.total)}</strong>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-[#F5F0E8]/60">Nội dung:</span>
                          <strong className="text-[#F5F0E8] font-bold text-right">CHAM{order.dbId.replace(/-/g, '').substring(0, 12).toUpperCase()}</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Recipient / Shipping Info */}
              <div className="rounded-2xl border border-[#F5F0E8]/10 bg-black/35 p-5 space-y-3 shadow-[0_4px_12px_rgba(0,0,0,0.2)]">
                <h4 className="font-serif font-bold text-[#E5C07B] border-b border-[#F5F0E8]/10 pb-2 text-sm uppercase tracking-wider">
                  Thông tin giao nhận
                </h4>
                <div className="grid gap-2 text-sm">
                  <div>
                    <span className="text-[#F5F0E8]/60 font-medium mr-1">Người nhận:</span>{" "}
                    <span className="font-semibold">{order.shippingFullname}</span>
                  </div>
                  <div>
                    <span className="text-[#F5F0E8]/60 font-medium mr-1">Số điện thoại:</span> {order.phone}
                  </div>
                  <div>
                    <span className="text-[#F5F0E8]/60 font-medium mr-1">Địa chỉ:</span> {order.shippingAddress}, {order.shippingCity}
                  </div>
                  {order.shippingNote && (
                    <div className="mt-2 rounded-xl bg-[#6B1218]/20 p-3 text-xs text-[#F5F0E8]/80 italic border border-[#F5F0E8]/10">
                      <span className="font-semibold block not-italic text-[#F5F0E8]/70 mb-1">Ghi chú giao hàng:</span>
                      &quot;{order.shippingNote}&quot;
                    </div>
                  )}
                  {order.trackingCode && order.shippingCarrier && (
                    <div className="mt-4 border-t border-[#F5F0E8]/10 pt-4">
                      <div className="text-[#F5F0E8]/80 text-sm mb-2">
                        Đơn vị vận chuyển: <strong className="text-[#E5C07B]">{order.shippingCarrier}</strong>
                        <br />
                        Mã vận đơn: <strong className="text-[#E5C07B]">{order.trackingCode}</strong>
                      </div>
                      <a
                        href={getTrackingLink(order.shippingCarrier, order.trackingCode) || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-[#E5C07B] text-[#2C1810] px-4 py-2 rounded-lg font-semibold hover:bg-[#d4b06a] transition-colors"
                      >
                        <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        Theo dõi hành trình
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Items List */}
              <div className="rounded-2xl border border-[#F5F0E8]/10 bg-black/35 p-5 space-y-4 shadow-[0_4px_12px_rgba(0,0,0,0.2)]">
                <h4 className="font-serif font-bold text-[#E5C07B] border-b border-[#F5F0E8]/10 pb-2 text-sm uppercase tracking-wider">
                  Sản phẩm đã đặt
                </h4>
                <div className="divide-y divide-[#F5F0E8]/10">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="py-3 first:pt-0 last:pb-0 flex items-start justify-between gap-4">
                      <div>
                        <h5 className="font-semibold text-sm text-[#F5F0E8]">{item.name}</h5>
                        {item.detail && <p className="text-xs text-[#F5F0E8]/60 font-light mt-1">{item.detail}</p>}
                        {item.toppings && item.toppings.length > 0 && (
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {item.toppings.map((top, tIdx) => (
                              <span key={tIdx} className="rounded bg-[#6B1218]/25 px-1.5 py-0.5 text-[0.65rem] text-[#E5C07B] border border-[#E5C07B]/10">
                                + {top}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="text-right text-sm">
                        <span className="font-sans font-bold text-sm text-[#E5C07B] mr-2">x{item.quantity}</span>
                        <span className="font-sans font-semibold text-[#E5C07B] text-[0.95rem]">{formatPrice(item.price)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Prices breakdown */}
              <div className="rounded-2xl border border-[#F5F0E8]/10 bg-black/35 p-5 space-y-3 shadow-[0_4px_12px_rgba(0,0,0,0.2)]">
                <div className="flex justify-between text-sm">
                  <span className="text-[#F5F0E8]/60 font-light">Tạm tính:</span>
                  <span className="font-medium text-[#F5F0E8]">{formatPrice(order.subtotal)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-sm text-[#E5C07B]">
                    <span className="font-light">Giảm giá {order.discountCode ? `(${order.discountCode})` : ""}:</span>
                    <span className="font-medium">-{formatPrice(order.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-[#F5F0E8]/60 font-light">Phí giao hàng:</span>
                  <span className="font-medium text-[#F5F0E8]">{formatPrice(order.shipping)}</span>
                </div>
                <div className="flex justify-between border-t border-[#F5F0E8]/10 pt-3 text-[1.05rem] font-bold text-[#E5C07B]">
                  <span className="font-sans">Tổng cộng:</span>
                  <span className="font-sans text-[1.15rem]">{formatPrice(order.total)}</span>
                </div>
              </div>

              {/* Timeline Logs */}
              {order.historyLogs && order.historyLogs.length > 0 && (
                <div className="rounded-2xl border border-[#F5F0E8]/10 bg-black/35 p-5 space-y-4 shadow-[0_4px_12px_rgba(0,0,0,0.2)]">
                  <h4 className="font-serif font-bold text-[#E5C07B] border-b border-[#F5F0E8]/10 pb-2 text-sm uppercase tracking-wider">
                    Lịch sử đơn hàng
                  </h4>
                  <div className="relative border-l border-[#F5F0E8]/20 pl-4 ml-2 space-y-4">
                    {order.historyLogs.map((log) => (
                      <div key={log.id} className="relative text-xs">
                        <span className="absolute -left-[21px] mt-1 size-2 rounded-full bg-[#10B981] border border-[#F5F0E8]/10" />
                        <div className="font-bold text-[#F5F0E8]/85">
                          {new Date(log.createdAt).toLocaleString("vi-VN")}
                        </div>
                        <div className="text-[#F5F0E8]/60 font-light mt-0.5">{log.note || "Cập nhật trạng thái"}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!isAdmin && order.status === "pending" ? (
                <div className="rounded-2xl border border-[#F5F0E8]/10 bg-black/35 p-5 shadow-[0_4px_12px_rgba(0,0,0,0.2)]">
                  {showCancelForm ? (
                    <div className="space-y-3">
                      <label
                        htmlFor="customer-cancel-reason"
                        className="block text-xs font-semibold uppercase tracking-wider text-[#F5F0E8]/65"
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
                        className="w-full rounded-xl border border-[#F5F0E8]/15 bg-black/45 px-3 py-2 text-sm text-[#F5F0E8] outline-none focus:border-[#D6A15F]"
                        placeholder="Nhập lý do bạn muốn huỷ đơn..."
                      />
                      {cancelError ? (
                        <p className="text-xs font-medium text-[#ff6b6b]">
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
                          className="rounded-xl border border-[#F5F0E8]/15 px-4 py-2 text-xs font-semibold text-[#F5F0E8] hover:bg-white/5 transition"
                        >
                          Quay lại
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelOrder}
                          disabled={isCancelling}
                          className="rounded-xl bg-[#6B1218] px-4 py-2 text-xs font-semibold text-[#F5F0E8] hover:bg-[#8A1119] transition active:scale-[0.98] disabled:opacity-60"
                        >
                          {isCancelling ? "Đang huỷ..." : "Xác nhận huỷ"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowCancelForm(true)}
                      className="rounded-xl border border-red-500/40 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-red-400 hover:bg-red-500/10 transition active:scale-[0.98]"
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
