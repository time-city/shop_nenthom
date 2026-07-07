"use client";

import { useOptimistic } from "react";
import Link from "next/link";
import type { CartSummaryProps } from "../../../lib/types/client";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("vi-VN").format(price) + "đ";

export default function CartSummary({
  disabled = false,
  onCheckout,
  subtotal,
}: CartSummaryProps) {
  const [optimisticSubtotal] = useOptimistic(subtotal);
  const total = optimisticSubtotal;

  return (
    <aside className="h-fit rounded-3xl bg-[#F5F0E8]/5 backdrop-blur-md border border-[#F5F0E8]/10 p-6 shadow-[0_16px_36px_rgba(0,0,0,0.5)] sm:p-8">
      <h2 className="relative mb-7 pb-4 font-serif text-[1.55rem] font-bold text-[#F5F0E8] after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-10 after:bg-[#D6A15F]">
        Tóm Tắt Đơn Hàng
      </h2>

      <div className="mb-4 flex justify-between gap-4 text-sm text-[#F5F0E8]/80">
        <span className="font-light">Tạm tính:</span>
        <span className="font-sans font-medium tracking-wide">{formatPrice(optimisticSubtotal)}</span>
      </div>
      <div className="mb-5 flex justify-between gap-4 text-sm text-[#F5F0E8]/80">
        <span className="font-light">Phí vận chuyển:</span>
        <span className="font-sans font-medium tracking-wide text-[#D6A15F]">Miễn phí</span>
      </div>
      <div className="mb-8 flex justify-between gap-4 border-t border-[#F5F0E8]/15 pt-5 items-end">
        <span className="text-[#F5F0E8] font-medium mb-1 tracking-wide">Tổng cộng:</span>
        <span className="font-sans text-[1.8rem] leading-none font-bold text-[#D6A15F] tracking-wide">
          {formatPrice(total)}
        </span>
      </div>

      <button
        type="button"
        onClick={onCheckout}
        disabled={disabled}
        className="mb-4 w-full rounded-full bg-gradient-to-r from-[#D6A15F] to-[#E5C07B] px-6 py-3.5 text-[0.78rem] font-medium uppercase tracking-[0.14em] text-[#2C1810] shadow-[0_10px_24px_rgba(214,161,95,0.3)] transition hover:-translate-y-0.5 hover:shadow-[0_15px_30px_rgba(214,161,95,0.4)] disabled:cursor-not-allowed disabled:opacity-65 disabled:hover:translate-y-0"
      >
        Thanh Toán
      </button>
      <Link
        href="/#collection"
        className="flex w-full items-center justify-center rounded-full border border-[#F5F0E8]/50 px-6 py-3.5 text-[0.78rem] font-medium uppercase tracking-[0.14em] text-[#F5F0E8] transition hover:bg-[#F5F0E8] hover:text-[#2C1810]"
      >
        Tiếp Tục Mua Sắm
      </Link>
    </aside>
  );
}
