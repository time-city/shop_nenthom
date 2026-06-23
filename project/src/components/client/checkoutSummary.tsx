"use client";

import { useEffect, useState } from "react";
import type { CheckoutSummaryProps } from "../../lib/types/client";

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
    <aside className="h-fit rounded-2xl border border-[#6B4C35]/10 bg-[#F8F0E4] p-6 shadow-[0_16px_36px_rgba(44,24,16,0.08)] sm:p-8">
      {/* mã khuyến mãi */}
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

      <h2 className="mb-6 border-b-2 border-[#6B1218] pb-4 font-serif text-[1.25rem] font-bold text-[#2C1810]">
        Tóm Tắt Đơn Hàng
      </h2>

      <div className="mb-6 max-h-[300px] overflow-auto border-b border-[#6B4C35]/15 pb-5">
        {items.map((item, index) => {
          const quantity = Math.max(item.quantity, 1);
          const itemTotal = item.price * quantity;

          return (
            <div
              key={`${getItemName(item)}-${index}`}
              className="flex justify-between gap-4 border-b border-[#6B4C35]/10 py-4 text-sm last:border-b-0"
            >
              <span className="text-[#2C1810]">
                {getItemName(item)}
                {item.size ? ` (${item.size})` : ""} x {quantity}
              </span>
              <span className="shrink-0 font-serif font-bold text-[#6B1218]">
                {formatPrice(itemTotal)}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mb-4 flex justify-between gap-4 text-sm font-light text-[#6B4C35]">
        <span>Tạm tính:</span>
        <span>{formatPrice(subtotal)}</span>
      </div>
      <div className="mb-4 flex justify-between gap-4 text-sm font-light text-[#6B4C35]">
        <span>Phí vận chuyển:</span>
        <span className="italic text-[#8B5E3C]">{formatPrice(shippingFee)}</span>
      </div>
      {discountAmount > 0 && appliedDiscountCode && (
        <div className="mb-4 flex justify-between gap-4 text-sm font-medium text-[#8A1119]">
          <span>Giảm giá ({appliedDiscountCode} - {discountType === "PERCENTAGE" ? "%" : "tiền"}):</span>
          <span>-{formatPrice(discountAmount)}</span>
        </div>
      )}
      <div className="mb-5 flex justify-between gap-4 text-sm font-light text-[#6B4C35]">
        <span>Thuế:</span>
        <span>0đ</span>
      </div>
      <div className="mb-8 flex justify-between gap-4 border-t-2 border-[#6B4C35]/15 pt-5 text-[#2C1810]">
        <span>Tổng cộng:</span>
        <span className="font-serif text-[1.6rem] text-[#2C1810]">
          {formatPrice(total)}
        </span>
      </div>

      <button
        type="submit"
        form="checkoutForm"
        disabled={isSubmitting}
        className="mb-4 w-full rounded-full bg-[#6B1218] px-6 py-4 text-[0.78rem] font-medium uppercase tracking-[0.14em] text-[#F5F0E8] shadow-[0_10px_24px_rgba(107,18,24,0.28)] transition hover:-translate-y-0.5 hover:bg-[#4A0C10] disabled:cursor-not-allowed disabled:opacity-65 disabled:hover:translate-y-0"
      >
        {isSubmitting ? "Đang xử lý..." : "Hoàn Thành Đơn Hàng"}
      </button>
      <button
        type="button"
        onClick={onBackToCart}
        disabled={isSubmitting}
        className="w-full rounded-full border border-[#6B1218] px-6 py-3.5 text-[0.78rem] font-medium uppercase tracking-[0.14em] text-[#6B1218] transition hover:bg-[#6B1218] hover:text-[#F5F0E8] disabled:cursor-not-allowed disabled:opacity-55"
      >
        Quay Lại Giỏ Hàng
      </button>
    </aside>
  );
}
