"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getCurrentUser } from "@/src/lib/action/user.action";
import { useCartStore } from "@/src/store/useCartStore";
import type { Order, OrderItem, OrderPaymentMethod } from "../../lib/types/client";

export default function OrderConfirmationClient() {
  const { lastOrder, clearLastOrder } = useCartStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    if (lastOrder) {
      setOrder(lastOrder);
      // Xóa dữ liệu đơn hàng khỏi store sau khi đã đọc
      clearLastOrder();
    }
    setLoading(false);

    const checkAuth = async () => {
      const cookieString = typeof document !== "undefined" ? document.cookie : "";
      const hasCookieToken = cookieString.includes("accessToken") || cookieString.includes("session");
      if (hasCookieToken) {
        setHasToken(true);
        return;
      }
      try {
        const user = await getCurrentUser();
        setHasToken(Boolean(user));
      } catch {
        setHasToken(false);
      }
    };
    void checkAuth();
  }, []);


  if (loading) {
    return (
      <main className="min-h-screen bg-[#F2E8D9] px-4 py-14 pt-28 text-[#2C1810] flex items-center justify-center">
        <div className="text-center font-serif text-lg">Đang tải thông tin đơn hàng...</div>
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
    <main className="min-h-screen bg-[#F2E8D9] px-4 py-14 pt-28 text-[#2C1810] flex items-center justify-center">
      <div className="max-w-[600px] w-full bg-white border border-[#e0d8ce] rounded-sm p-8 md:p-12 text-center shadow-[0_16px_36px_rgba(44,24,16,0.05)]">
        <div className="text-[3.5rem] leading-none mb-6 text-[#6B1218] animate-bounce">✓</div>
        <h1 className="font-serif text-[2.2rem] font-light text-[#1a1814] mb-3 leading-tight">
          Đơn Hàng Được Xác Nhận!
        </h1>
        <p className="text-[0.95rem] text-[#6b6660] mb-8 leading-relaxed">
          Cảm ơn bạn đã tin tưởng ChamCham. Chúng tôi sẽ giao hàng sớm nhất.
        </p>

        {/* Thông tin chung */}
        <div className="bg-[#FAF8F5] p-6 border border-[#e0d8ce]/40 rounded-sm mb-6 text-left">
          <div className="font-serif text-lg font-semibold text-[#1a1814] mb-4 pb-3 border-b border-[#e0d8ce]">
            Mã đơn hàng: #{order.orderNumber}
          </div>
          <div className="flex justify-between items-center mb-3 text-sm text-[#6b6660]">
            <span className="text-[#8B7355]">Ngày Đặt Hàng:</span>
            <span className="text-[#1a1814] text-right font-medium">
              {new Date(order.createdAt).toLocaleDateString("vi-VN")}
            </span>
          </div>
          <div className="flex justify-between items-center mb-3 text-sm text-[#6b6660]">
            <span className="text-[#8B7355]">Dự Kiến Giao Hàng:</span>
            <span className="text-[#1a1814] text-right font-medium">
              {estimatedDate.toLocaleDateString("vi-VN")}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm text-[#6b6660]">
            <span className="text-[#8B7355]">Phương Thức Thanh Toán:</span>
            <span className="text-[#1a1814] text-right font-medium">
              {paymentMethodText}
            </span>
          </div>
        </div>

        {/* Địa chỉ giao hàng */}
        <div className="bg-[#FAF8F5] p-6 border border-[#e0d8ce]/40 rounded-sm mb-6 text-left">
          <div className="text-[0.78rem] tracking-[0.1em] uppercase text-[#8B7355] font-semibold mb-3">
            Địa Chỉ Giao Hàng
          </div>
          <div className="text-sm text-[#1a1814] space-y-1.5 font-light">
            <p className="font-medium text-base text-[#2C1810]">{order.fullname}</p>
            <p>{order.address}</p>
            <p>{order.city}{order.zip ? `, ${order.zip}` : ", Việt Nam"}</p>
            <p>Điện thoại: {order.phone}</p>
            <p>Email: {order.email}</p>
            {order.note && (
              <p className="mt-3 text-xs italic text-[#6b6660]">Ghi chú: {order.note}</p>
            )}
          </div>
        </div>

        {/* Chi tiết đơn hàng */}
        <div className="bg-[#FAF8F5] p-6 border border-[#e0d8ce]/40 rounded-sm mb-6 text-left">
          <div className="text-[0.78rem] tracking-[0.1em] uppercase text-[#8B7355] font-semibold mb-4">
            Chi Tiết Đơn Hàng
          </div>
          <div className="space-y-4 mb-4">
            {order.items.map((item, idx) => {
              const optDetails = [item.color, item.pack].filter(Boolean);
              const labelOpt = optDetails.length ? ` — ${optDetails.join(", ")}` : "";
              return (
                <div key={idx} className="flex justify-between items-start text-sm">
                  <div className="text-[#6b6660] pr-4">
                    <span className="font-medium text-[#1a1814]">{item.name || item.scent}</span>
                    <span className="text-xs text-[#8B7355]"> ({item.size}{labelOpt})</span>
                    <span className="text-[#8B7355]"> x {item.quantity}</span>
                  </div>
                  <span className="text-[#1a1814] font-medium shrink-0">
                    {(item.price * item.quantity).toLocaleString("vi-VN")}đ
                  </span>
                </div>
              );
            })}
          </div>

          <div className="border-t border-[#e0d8ce]/60 pt-4 space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-[#8B7355]">Tạm Tính:</span>
              <span className="text-[#1a1814]">{order.subtotal.toLocaleString("vi-VN")}đ</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-[#8B7355]">Phí Vận Chuyển:</span>
              <span className="text-[#1a1814]">{order.shipping.toLocaleString("vi-VN")}đ</span>
            </div>
            <div className="flex justify-between items-center text-[1.1rem] font-bold text-[#1a1814] pt-2 border-t border-[#e0d8ce]/30">
              <span>Tổng Cộng:</span>
              <span className="text-[#6B1218]">{order.total.toLocaleString("vi-VN")}đ</span>
            </div>
          </div>
        </div>

        {/* Các bước tiếp theo */}
        <div className="bg-[#FAF8F5] p-6 border border-[#e0d8ce]/40 rounded-sm mb-6 text-left">
          <div className="font-serif text-lg text-[#1a1814] font-semibold mb-4">
            Các Bước Tiếp Theo
          </div>
          <div className="space-y-4">
            <div className="flex gap-4 items-start text-sm">
              <div className="min-w-6 h-6 bg-[#1a1814] text-[#FAF8F5] rounded-full flex items-center justify-center font-bold text-xs shrink-0">
                1
              </div>
              <div className="text-[#6b6660] pt-0.5 leading-relaxed">
                Xác nhận đơn hàng được gửi qua email
              </div>
            </div>
            <div className="flex gap-4 items-start text-sm">
              <div className="min-w-6 h-6 bg-[#1a1814] text-[#FAF8F5] rounded-full flex items-center justify-center font-bold text-xs shrink-0">
                2
              </div>
              <div className="text-[#6b6660] pt-0.5 leading-relaxed">
                Chúng tôi sẽ chuẩn bị hàng trong 24 giờ
              </div>
            </div>
            <div className="flex gap-4 items-start text-sm">
              <div className="min-w-6 h-6 bg-[#1a1814] text-[#FAF8F5] rounded-full flex items-center justify-center font-bold text-xs shrink-0">
                3
              </div>
              <div className="text-[#6b6660] pt-0.5 leading-relaxed">
                Hàng sẽ được giao trong 2-3 ngày làm việc
              </div>
            </div>
          </div>
          <div className="contact-info text-xs text-[#6b6660] mt-5 pt-4 border-t border-[#e0d8ce]/60 leading-relaxed">
            <strong>Cần hỗ trợ?</strong> Liên hệ chúng tôi qua email{" "}
            <span className="underline">support@lumiere.com</span> hoặc số điện thoại{" "}
            <strong>+84 xxx xxxx</strong>.
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-8 flex-col sm:flex-row">
          <Link
            href="/"
            className="flex-1 text-center bg-[#1a1814] text-[#FAF8F5] text-xs font-semibold uppercase tracking-[0.12em] py-3.5 hover:bg-[#3d3830] transition duration-200"
          >
            Tiếp Tục Mua Sắm
          </Link>
          <Link
            href="/#contact"
            className="flex-1 text-center border border-[#1a1814] bg-transparent text-[#1a1814] text-xs font-semibold uppercase tracking-[0.12em] py-3.5 hover:bg-[#1a1814] hover:text-[#FAF8F5] transition duration-200"
          >
            Liên Hệ Hỗ Trợ
          </Link>
        </div>

        {/* Guest Suggestion / Member notice */}
        {order.isGuest && !hasToken ? (
          <div className="bg-[#FAF8F5] p-5 border border-[#6B4C35]/15 rounded-sm mt-6 text-left">
            <div className="text-[0.78rem] tracking-[0.1em] uppercase text-[#6B1218] font-bold mb-2">
              Gợi ý đăng ký thành viên
            </div>
            <div className="text-xs text-[#6b6660] leading-relaxed mb-4">
              Lưu thông tin giao hàng để mua sắm nhanh hơn lần sau và nhận các ưu đãi thành viên độc quyền từ ChamCham.
            </div>
            <div className="flex gap-4 flex-col sm:flex-row">
              <Link
                href="/register"
                className="flex-1 text-center bg-[#6B1218] text-[#FAF8F5] text-xs font-semibold uppercase tracking-[0.12em] py-2.5 hover:bg-[#4a0c10] transition duration-200"
              >
                Đăng ký thành viên
              </Link>
              <Link
                href="/"
                className="flex-1 text-center border border-[#6B4C35]/30 bg-transparent text-[#2C1810] text-xs font-semibold uppercase tracking-[0.12em] py-2.5 hover:bg-[#2C1810]/5 transition duration-200"
              >
                Về trang chủ
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-6 text-xs text-[#6b6660] text-center leading-relaxed">
            Bạn có thể xem lịch sử đơn hàng trong phần tài khoản cá nhân bất cứ lúc nào.
          </div>
        )}
      </div>
    </main>
  );
}
