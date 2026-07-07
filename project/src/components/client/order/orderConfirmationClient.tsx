"use client";

import Link from "next/link";
import { startTransition, useEffect, useState } from "react";
import { getCurrentUser } from "@/src/lib/action/user.action";
import { useCartStore } from "@/src/store/useCartStore";
import type { Order } from "../../../lib/types/client";
import LoadingState from "@/src/components/ui/loadingState";
import { callAction } from "@/src/lib/utils/callAction";

export default function OrderConfirmationClient() {
  const { lastOrder, clearLastOrder } = useCartStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    startTransition(() => {
      if (lastOrder) {
        setOrder(lastOrder);
        // Xóa dữ liệu đơn hàng khỏi store sau khi đã đọc
        clearLastOrder();
      }
      setLoading(false);
    });

    const checkAuth = async () => {
      const cookieString = typeof document !== "undefined" ? document.cookie : "";
      const hasCookieToken = cookieString.includes("accessToken") || cookieString.includes("session");
      if (hasCookieToken) {
        setHasToken(true);
        return;
      }
      try {
        const user = await callAction(() => getCurrentUser(), "Không thể tải thông tin tài khoản. Vui lòng thử lại sau.");
        setHasToken(Boolean(user));
      } catch {
        setHasToken(false);
      }
    };
    void checkAuth();
  }, [clearLastOrder, lastOrder]);


  if (loading) {
    return (
      <main className="min-h-screen bg-[#F2E8D9] px-4 py-14 pt-28 text-[#2C1810] flex flex-col items-center justify-center gap-4">
        <LoadingState type="default" label="Đang tải thông tin đơn hàng..." className="border-0 bg-transparent shadow-none" />
      </main>
    );
  }

  if (!order) {
    return (
      <main className="min-h-screen bg-[#F2E8D9] px-4 py-14 pt-28 text-[#2C1810] flex items-center justify-center">
        <div className="max-w-[600px] w-full bg-white border border-[#e0d8ce] rounded-sm p-12 text-center shadow-[0_16px_36px_rgba(44,24,16,0.05)]">
          <p className="text-[#6b6660] text-[0.95rem] mb-8">Không tìm thấy thông tin đơn hàng</p>
          <Link href="/" className="inline-block bg-[#1a1814] text-[#FAF8F5] text-xs font-medium uppercase tracking-[0.12em] px-8 py-3.5 hover:bg-[#3d3830] transition duration-200">
            Quay Lại Cửa Hàng
          </Link>
        </div>
      </main>
    );
  }

  const estimatedDate = new Date(order.createdAt);
  estimatedDate.setDate(estimatedDate.getDate() + 3);

  const paymentMethodText =
    order.paymentMethod === "cod"
      ? "Thanh toán khi nhận hàng (COD)"
      : "Chuyển khoản ngân hàng";

  return (
    <main className="min-h-screen bg-[#F2E8D9] flex items-center justify-center p-4 sm:p-6 md:p-8 text-[#2C1810]">
      <div className="w-full max-w-5xl bg-[#F8F0E4]/90 backdrop-blur-sm border border-[#6B4E35]/15 rounded-2xl shadow-[0_24px_54px_rgba(44,24,16,0.12)] p-4 sm:p-6 md:p-8 flex flex-col gap-6 md:max-h-[90vh] overflow-y-auto md:overflow-hidden">
        {/* Header gọn gàng, tinh tế */}
        <div className="flex items-center justify-between border-b border-[#6B4C35]/15 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-[#10B981] text-[#F5F0E8] font-bold text-lg shadow-md shadow-[#10B981]/20">
              ✓
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-[#2C1810] tracking-wide">
                Đơn Hàng Được Xác Nhận!
              </h1>
              <p className="text-xs sm:text-sm text-[#6B4C35]/80 mt-0.5 font-normal">
                Cảm ơn bạn đã tin tưởng và đồng hành cùng ChamCham.
              </p>
            </div>
          </div>
          <div className="hidden sm:block text-right">
            <span className="text-xs text-[#6B4C35]/60 block uppercase tracking-wider">Mã đơn hàng</span>
            <span className="text-sm sm:text-base font-bold text-[#6B1218]">#{order.orderNumber}</span>
          </div>
        </div>

        {/* Bố cục 2 cột */}
        <div className="flex flex-col md:flex-row gap-6 flex-1 overflow-visible md:overflow-hidden min-h-0">
          {/* CỘT TRÁI: Thông tin vận chuyển & Đơn hàng */}
          <div className="flex-1 flex flex-col gap-4 overflow-visible md:overflow-y-auto pr-0 md:pr-1">
            {/* Chi tiết chung của đơn */}
            <div className="bg-[#FAF6F0] rounded-xl border border-[#6B4E35]/10 p-4 space-y-3 shadow-sm shrink-0">
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#6B1218] border-b border-[#6B4E35]/10 pb-2 flex items-center gap-2">
                <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Thông tin đơn hàng
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
                <div>
                  <span className="text-[#6B4C35]/70 block mb-0.5">Ngày Đặt Hàng</span>
                  <span suppressHydrationWarning className="font-semibold text-[#2C1810]">
                    {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                  </span>
                </div>
                <div>
                  <span className="text-[#6B4C35]/70 block mb-0.5">Dự Kiến Giao</span>
                  <span suppressHydrationWarning className="font-semibold text-[#2C1810]">
                    {estimatedDate.toLocaleDateString("vi-VN")}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-[#6B4C35]/70 block mb-0.5">Phương Thức Thanh Toán</span>
                  <span className="font-semibold text-[#2C1810]">
                    {paymentMethodText}
                  </span>
                </div>
              </div>
            </div>

            {/* Địa chỉ giao hàng */}
            <div className="bg-[#FAF6F0] rounded-xl border border-[#6B4E35]/10 p-4 space-y-2 shadow-sm text-xs sm:text-sm shrink-0">
              <h3 className="font-bold uppercase tracking-wider text-[#6B1218] border-b border-[#6B4E35]/10 pb-2 flex items-center gap-2">
                <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Địa chỉ nhận hàng
              </h3>
              <div className="space-y-1 text-[#2C1810] font-normal leading-relaxed">
                <p className="font-bold text-sm sm:text-base text-[#6B1218]">{order.fullname}</p>
                <p className="font-semibold text-xs sm:text-sm">{order.phone} · {order.email}</p>
                <p className="font-medium">{order.address}, {order.city}{order.zip ? ` (${order.zip})` : ""}</p>
                {order.note && (
                  <div className="mt-2 bg-[#F2E8D9]/40 rounded-lg p-2.5 border border-[#6B4C35]/5 text-[#6B4C35] font-normal">
                    Ghi chú: {order.note}
                  </div>
                )}
              </div>
            </div>

            {/* Các bước tiếp theo - Dạng timeline mini */}
            <div className="bg-[#FAF6F0] rounded-xl border border-[#6B4E35]/10 p-4 space-y-3 shadow-sm text-xs sm:text-sm flex-1 min-h-[120px]">
              <h3 className="font-bold uppercase tracking-wider text-[#6B1218] border-b border-[#6B4E35]/10 pb-2">
                Các bước tiếp theo
              </h3>
              <div className="relative pl-4 border-l border-[#6B1218]/20 space-y-3 py-1">
                <div className="relative">
                  <span className="absolute -left-[21px] top-1.5 size-2 rounded-full bg-[#10B981]" />
                  <p className="font-semibold text-[#2C1810]">Xác nhận email</p>
                  <p className="text-xs text-[#6B4C35]/80 mt-0.5 font-normal">Chi tiết đơn hàng đã được gửi tới hộp thư của bạn.</p>
                </div>
                <div className="relative">
                  <span className="absolute -left-[21px] top-1.5 size-2 rounded-full bg-[#6B1218]/40" />
                  <p className="font-semibold text-[#6B4C35]">Chuẩn bị hàng</p>
                  <p className="text-xs text-[#6B4C35]/80 mt-0.5 font-normal">ChamCham sẽ đóng gói và bàn giao vận chuyển trong 24h.</p>
                </div>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: Giỏ hàng + Actions */}
          <div className="flex-1 flex flex-col gap-4 overflow-visible md:overflow-hidden bg-[#FAF6F0] rounded-xl border border-[#6B4E35]/10 p-4 shadow-sm min-h-0">
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#6B1218] border-b border-[#6B4E35]/10 pb-2 shrink-0 flex items-center gap-2">
              <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              Sản phẩm đã chọn
            </h3>

            {/* Danh sách sản phẩm scroll nội bộ */}
            <div className="flex-1 overflow-visible md:overflow-y-auto space-y-3 pr-0 md:pr-1 min-h-0">
              {order.items.map((item, idx) => {
                const optDetails = [item.color, item.pack].filter(Boolean);
                const labelOpt = optDetails.length ? ` — ${optDetails.join(", ")}` : "";
                return (
                  <div key={idx} className="flex justify-between items-start text-xs sm:text-sm border-b border-[#6B4E35]/10 pb-2.5 last:border-0 last:pb-0">
                    <div className="pr-4 space-y-0.5">
                      <span className="font-bold text-[#2C1810] block">{item.name || item.scent}</span>
                      <span className="text-xs text-[#6B4C35]/80 block font-normal">
                        Kích thước: {item.size}{labelOpt}
                      </span>
                      <span className="text-xs text-[#6B1218] font-bold">
                        Số lượng: {item.quantity} × {item.price.toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                    <span className="text-sm sm:text-base font-bold text-[#6B1218] shrink-0 pt-0.5">
                      {(item.price * item.quantity).toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Tổng hợp tài chính */}
            <div className="shrink-0 border-t border-[#6B4E35]/15 pt-3 space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between items-center text-[#6B4C35] font-medium">
                <span>Tạm Tính</span>
                <span className="font-semibold text-[#2C1810]">{order.subtotal.toLocaleString("vi-VN")}đ</span>
              </div>
              <div className="flex justify-between items-center text-[#6B4C35] font-medium">
                <span>Phí Vận Chuyển</span>
                <span className="font-semibold text-[#2C1810]">{order.shipping.toLocaleString("vi-VN")}đ</span>
              </div>
              <div className="flex justify-between items-center text-sm sm:text-base font-bold border-t border-[#6B4E35]/10 pt-2 text-[#2C1810]">
                <span>Tổng Cộng</span>
                <span className="text-base sm:text-lg text-[#6B1218] font-bold">{order.total.toLocaleString("vi-VN")}đ</span>
              </div>
            </div>

            {/* Nút hành động và liên kết */}
            <div className="shrink-0 pt-2 border-t border-[#6B4E35]/15 space-y-3">
              <div className="flex gap-3 flex-col sm:flex-row">
                <Link
                  href="/"
                  className="flex-1 text-center bg-[#6B1218] text-[#F5F0E8] text-xs sm:text-sm font-bold uppercase tracking-[0.08em] py-3 rounded-lg hover:bg-[#4A0C10] transition-colors duration-200 shadow-md shadow-[#6B1218]/10"
                >
                  Tiếp Tục Mua Sắm
                </Link>
                <Link
                  href="/#contact"
                  className="flex-1 text-center border border-[#6B1218]/30 bg-transparent text-[#6B1218] text-xs sm:text-sm font-bold uppercase tracking-[0.08em] py-3 rounded-lg hover:bg-[#6B1218]/5 transition-colors duration-200"
                >
                  Liên Hệ Hỗ Trợ
                </Link>
              </div>

              {/* Hỗ trợ & Guest Registration */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-[#6B4C35]/80 pt-1 font-medium">
                <span>Cần hỗ trợ? support@lumiere.com</span>
                {order.isGuest && !hasToken ? (
                  <Link href="/register" className="font-bold text-[#6B1218] hover:underline">
                    Đăng ký thành viên ✦
                  </Link>
                ) : (
                  <span className="text-[0.7rem] sm:text-xs">Đã đồng bộ vào lịch sử đơn hàng của bạn.</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
