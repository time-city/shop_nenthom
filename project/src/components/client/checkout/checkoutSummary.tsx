"use client";

import { useEffect, useState } from "react";
import type { CheckoutSummaryProps } from "../../../lib/types/client";

const shippingFee = 30000;

const formatPrice = (price: number) =>
  new Intl.NumberFormat("vi-VN").format(price) + "đ";

const getItemName = (item: CheckoutSummaryProps["items"][number]) =>
  item.name ?? item.scent ?? "Nến ChamCham";

export default function CheckoutSummary({
  isSubmitting = false,
  items,
  onBackToCart,
  onApplyPromo,
  appliedDiscountCode,
  discountAmount = 0,
  discountType,
}: CheckoutSummaryProps) {
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

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * Math.max(item.quantity, 1),
    0,
  );
  const total = Math.max(subtotal + shippingFee - discountAmount, 0);

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
    <aside className="h-fit rounded-3xl border border-[#F5F0E8]/10 bg-[#F5F0E8]/5 backdrop-blur-md p-6 shadow-[0_16px_36px_rgba(0,0,0,0.5)] sm:p-8">
      {/* mã khuyến mãi */}
      <div className="mb-8 border-b border-[#F5F0E8]/15 pb-8">
        <label
          htmlFor="promoCode"
          className="mb-3 block text-[0.72rem] uppercase tracking-[0.14em] text-[#F5F0E8]/70"
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
            style={{ borderColor: promoError ? "#ff6b6b" : undefined }}
            className="min-w-0 flex-1 rounded-full border-[1.5px] border-[#F5F0E8]/20 bg-black/50 px-4 py-3 text-sm text-[#F5F0E8] outline-none transition placeholder:text-[#F5F0E8]/45 focus:border-[#D6A15F] focus:ring-4 focus:ring-[#D6A15F]/10"
          />
          <button
            type="button"
            onClick={handleApply}
            className="rounded-full border border-[#D6A15F] bg-gradient-to-r from-[#D6A15F] to-[#E5C07B] px-6 py-3 text-[0.72rem] font-medium uppercase tracking-[0.14em] text-[#2C1810] transition hover:-translate-y-0.5 shadow-[0_5px_15px_rgba(214,161,95,0.3)]"
          >
            Áp dụng
          </button>
        </div>
        {promoError && (
          <p style={{ color: "#ff6b6b", fontSize: 12, marginTop: 4 }}>
            {promoError}
          </p>
        )}
        {appliedDiscountCode && (
          <p style={{ color: "#D6A15F", fontSize: 12, marginTop: 6, fontWeight: 500 }}>
            ✓ Đã áp dụng mã: {appliedDiscountCode} ({discountType === "PERCENTAGE" ? "Giảm theo %" : "Giảm theo số tiền"})
          </p>
        )}
      </div>

      <h2 className="relative mb-6 pb-4 font-serif text-[1.25rem] font-bold text-[#F5F0E8] after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-10 after:bg-[#D6A15F]">
        Tóm Tắt Đơn Hàng
      </h2>

      <div className="mb-6 max-h-[300px] overflow-auto border-b border-[#F5F0E8]/15 pb-5 pr-2 scrollbar-hide">
        {items.map((item, index) => {
          const quantity = Math.max(item.quantity, 1);
          const itemTotal = item.price * quantity;

          return (
            <div
              key={`${getItemName(item)}-${index}`}
              className="flex justify-between gap-4 border-b border-[#F5F0E8]/10 py-4 text-sm last:border-b-0"
            >
              <div className="flex flex-col gap-1.5">
                <span className="text-[#F5F0E8] font-medium leading-tight">
                  {getItemName(item)}
                </span>
                <span className="text-[#F5F0E8]/50 text-[0.8rem] font-light">
                  {item.size ? `${item.size} • ` : ""}SL: {quantity}
                </span>
              </div>
              <span className="shrink-0 font-sans font-semibold text-[#D6A15F] mt-0.5 tracking-wide">
                {formatPrice(itemTotal)}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mb-4 flex justify-between gap-4 text-sm text-[#F5F0E8]/80">
        <span className="font-light">Tạm tính:</span>
        <span className="font-sans font-medium tracking-wide">{formatPrice(subtotal)}</span>
      </div>
      <div className="mb-4 flex justify-between gap-4 text-sm text-[#F5F0E8]/80">
        <span className="font-light">Phí vận chuyển:</span>
        <span className="font-sans font-medium tracking-wide text-[#D6A15F]">{formatPrice(shippingFee)}</span>
      </div>
      {discountAmount > 0 && appliedDiscountCode && (
        <div className="mb-4 flex justify-between gap-4 text-sm font-medium text-[#D6A15F]">
          <span>Giảm giá ({appliedDiscountCode} - {discountType === "PERCENTAGE" ? "%" : "tiền"}):</span>
          <span className="font-sans tracking-wide">-{formatPrice(discountAmount)}</span>
        </div>
      )}
      <div className="mb-5 flex justify-between gap-4 text-sm text-[#F5F0E8]/80">
        <span className="font-light">Thuế:</span>
        <span className="font-sans font-medium tracking-wide">0đ</span>
      </div>
      <div className="mb-8 flex justify-between gap-4 border-t border-[#F5F0E8]/15 pt-5 items-end">
        <span className="text-[#F5F0E8] font-medium mb-1 tracking-wide">Tổng cộng:</span>
        <span className="font-sans text-[1.8rem] leading-none font-bold text-[#D6A15F] tracking-wide">
          {formatPrice(total)}
        </span>
      </div>

      <button
        type="submit"
        form="checkoutForm"
        disabled={isSubmitting}
        className="mb-4 w-full rounded-full bg-gradient-to-r from-[#D6A15F] to-[#E5C07B] px-6 py-4 text-[0.78rem] font-medium uppercase tracking-[0.14em] text-[#2C1810] shadow-[0_10px_24px_rgba(214,161,95,0.3)] transition hover:-translate-y-0.5 hover:shadow-[0_15px_30px_rgba(214,161,95,0.4)] disabled:cursor-not-allowed disabled:opacity-65 disabled:hover:translate-y-0"
      >
        {isSubmitting ? "Đang xử lý..." : "Hoàn Thành Đơn Hàng"}
      </button>
      <button
        type="button"
        onClick={onBackToCart}
        disabled={isSubmitting}
        className="w-full rounded-full border border-[#D6A15F]/50 px-6 py-3.5 text-[0.78rem] font-medium uppercase tracking-[0.14em] text-[#D6A15F] transition hover:bg-[#D6A15F] hover:text-[#2C1810] disabled:cursor-not-allowed disabled:opacity-55"
      >
        Quay Lại Giỏ Hàng
      </button>
    </aside>
  );
}
