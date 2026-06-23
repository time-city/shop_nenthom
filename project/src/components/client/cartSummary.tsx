"use client";

import { useOptimistic } from "react";
import Link from "next/link";
import type { CartSummaryProps } from "../../lib/types/client";

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
    <aside className="h-fit rounded-2xl bg-[#F8F0E4] p-6 shadow-[0_16px_36px_rgba(44,24,16,0.08)] sm:p-8">
      <h2 className="relative mb-7 pb-4 font-serif text-[1.55rem] font-bold text-[#2C1810] after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-10 after:bg-[#6B1218]">
        Tóm Tắt Đơn Hàng
      </h2>

      <div className="mb-4 flex justify-between gap-4 text-sm font-light text-[#6B4C35]">
        <span>Tạm tính:</span>
        <span>{formatPrice(optimisticSubtotal)}</span>
      </div>
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
