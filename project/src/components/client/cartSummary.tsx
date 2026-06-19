"use client";

import { useEffect, useOptimistic, useState } from "react";
import Link from "next/link";
import type { CartSummaryProps } from "../../lib/types/client";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("vi-VN").format(price) + "đ";

export default function CartSummary({
  disabled = false,
  onApplyPromo,
  onCheckout,
  subtotal,
  appliedDiscountCode,
  discountAmount = 0,
  discountType,
}: CartSummaryProps) {
  const [optimisticSubtotal] = useOptimistic(subtotal);
  const [promoInput, setPromoInput] = useState("");
  const [promoError, setPromoError] = useState("");
  const [prevCode, setPrevCode] = useState(appliedDiscountCode);

  useEffect(() => {
    setTimeout(() => {
      if (prevCode && !appliedDiscountCode) {
        setPromoError("Vui lòng áp dụng lại mã giảm giá do giỏ hàng đã thay đổi.");
      }
      setPrevCode(appliedDiscountCode);
    }, 0);
  }, [appliedDiscountCode, prevCode]);

  const total = Math.max(optimisticSubtotal - discountAmount, 0);

  const handleApply = async () => {
    if (!promoInput.trim()) {
      setPromoError("Vui lòng nhập mã khuyến mãi.");
      return;
    }
    setPromoError("");
    const result = await onApplyPromo(promoInput);
    if (result && !result.success && result.error) {
      setPromoError(result.error);
    }
  };

  return (
    <aside className="h-fit rounded-2xl bg-[#F8F0E4] p-6 shadow-[0_16px_36px_rgba(44,24,16,0.08)] sm:p-8">
      <div className="mb-8 border-b border-[#6B4C35]/15 pb-8">
        <label
          htmlFor="promoCode"
          className="mb-3 block text-[0.72rem] uppercase tracking-[0.14em] text-[#6B4C35]"
        >
          Mã Khuyến Mãi
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            id="promoCode"
            type="text"
            placeholder="Nhập mã khuyến mãi..."
            value={promoInput}
            onChange={(e) => {
              setPromoInput(e.target.value.toUpperCase());
              if (promoError) setPromoError("");
            }}
            style={{ borderColor: promoError ? "#6B1218" : undefined }}
            className="min-w-0 flex-1 rounded-full border-[1.5px] border-[#6B4C35]/25 bg-white px-4 py-3 text-sm text-[#2C1810] outline-none transition placeholder:text-[#6B4C35]/45 focus:border-[#6B1218] focus:ring-4 focus:ring-[#6B1218]/10"
          />
          <button
            type="button"
            onClick={handleApply}
            className="rounded-full border border-[#6B1218] bg-[#6B1218] px-6 py-3 text-[0.72rem] font-medium uppercase tracking-[0.14em] text-[#F5F0E8] transition hover:bg-[#4A0C10]"
          >
            Áp dụng
          </button>
        </div>
        {promoError && (
          <p style={{ color: "#6B1218", fontSize: 12, marginTop: 4 }}>
            {promoError}
          </p>
        )}
        {appliedDiscountCode && (
          <p style={{ color: "#1F6B3A", fontSize: 12, marginTop: 6, fontWeight: 500 }}>
            ✓ Đã áp dụng mã: {appliedDiscountCode} ({discountType === "PERCENTAGE" ? "Giảm theo %" : "Giảm theo số tiền"})
          </p>
        )}
      </div>

      <h2 className="relative mb-7 pb-4 font-serif text-[1.55rem] font-bold text-[#2C1810] after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-10 after:bg-[#6B1218]">
        Tóm Tắt Đơn Hàng
      </h2>

      <div className="mb-4 flex justify-between gap-4 text-sm font-light text-[#6B4C35]">
        <span>Tạm tính:</span>
        <span>{formatPrice(optimisticSubtotal)}</span>
      </div>
      {discountAmount > 0 && appliedDiscountCode && (
        <div className="mb-4 flex justify-between gap-4 text-sm font-medium text-[#8A1119]">
          <span>Giảm giá ({appliedDiscountCode} - {discountType === "PERCENTAGE" ? "%" : "tiền"}):</span>
          <span>-{formatPrice(discountAmount)}</span>
        </div>
      )}
      <div className="mb-5 flex justify-between gap-4 text-sm font-light text-[#6B4C35]">
        <span>Phí vận chuyển:</span>
        <span className="italic text-[#8B5E3C]">Miễn phí</span>
      </div>
      <div className="mb-8 flex justify-between gap-4 border-t border-[#6B4C35]/15 pt-5 text-[#2C1810]">
        <span>Tổng cộng:</span>
        <span className="font-serif text-[1.6rem] font-bold text-[#6B1218]">
          {formatPrice(total)}
        </span>
      </div>

      <button
        type="button"
        onClick={onCheckout}
        disabled={disabled}
        className="mb-4 w-full rounded-full bg-[#6B1218] px-6 py-3.5 text-[0.78rem] font-medium uppercase tracking-[0.14em] text-[#F5F0E8] shadow-[0_10px_24px_rgba(107,18,24,0.28)] transition hover:-translate-y-0.5 hover:bg-[#4A0C10] disabled:cursor-not-allowed disabled:opacity-65 disabled:hover:translate-y-0"
      >
        Thanh Toán
      </button>
      <Link
        href="/#collection"
        className="flex w-full items-center justify-center rounded-full border border-[#6B1218] px-6 py-3.5 text-[0.78rem] font-medium uppercase tracking-[0.14em] text-[#6B1218] transition hover:bg-[#6B1218] hover:text-[#F5F0E8]"
      >
        Tiếp Tục Mua Sắm
      </Link>
    </aside>
  );
}

