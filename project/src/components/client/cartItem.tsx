"use client";

import type { CartItemProps } from "../../lib/types/client";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("vi-VN").format(price) + "đ";

const getItemName = (item: CartItemProps["item"]) =>
  item.name ?? item.scent ?? "Nến ChamCham";

export default function CartItem({
  index,
  item,
  onQuantityChange,
  onRemove,
}: CartItemProps) {
  const quantity = Math.max(item.quantity, 1);
  const itemTotal = item.price * quantity;
  const packLabel =
    item.pack && String(item.pack).toLowerCase() !== "undefined"
      ? item.pack
      : "";

  return (
    <article className="grid gap-5 border-b border-[#6B4C35]/10 px-5 py-6 last:border-b-0 sm:px-7 md:grid-cols-[116px_1fr_auto] md:gap-8 md:py-8">

      <div
        className="relative flex size-[92px] items-center justify-center overflow-hidden rounded-xl bg-[linear-gradient(135deg,#F8EFCF_0%,#F8F0E4_52%,#EAD7B0_100%)] text-xl text-[#8B5E3C] shadow-[0_14px_26px_rgba(44,24,16,0.08)] md:size-[116px]"
        aria-hidden="true"
      >
        🕯
      </div>

      <div>
        <h3 className="mb-3 font-serif text-[1.4rem] font-medium leading-tight text-[#2C1810]">
          {getItemName(item)}
        </h3>
        {item.color ? (
          <p className="mb-2 text-sm font-light text-[#6B4C35]">
            Màu: {item.color}
          </p>
        ) : null}
        {item.size ? (
          <p className="mb-2 text-sm font-light text-[#6B4C35]">
            Kích thước: {item.size}
          </p>
        ) : null}
        {packLabel ? (
          <p className="mb-2 text-sm font-light text-[#6B4C35]">
            Bao bì: {packLabel}
          </p>
        ) : null}
      </div>

      <div className="text-left md:text-right">
        <div className="mb-5 font-serif text-[1.45rem] font-bold text-[#6B1218]">
          {formatPrice(itemTotal)}
        </div>
        <div className="mb-5 ml-0 flex w-fit items-center gap-2 rounded-full border border-[#6B4C35]/20 bg-[#F8F0E4] p-1 md:ml-auto">
          <button
            type="button"
            onClick={() => onQuantityChange(index, -1)}
            className="flex size-8 items-center justify-center rounded-full border border-[#6B1218]/20 text-lg text-[#2C1810] transition hover:border-[#6B1218] hover:bg-[#6B1218] hover:text-[#F5F0E8]"
            aria-label="Giảm số lượng"
          >
            −
          </button>
          <span className="min-w-9 text-center font-serif text-base font-bold">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => onQuantityChange(index, 1)}
            className="flex size-8 items-center justify-center rounded-full border border-[#6B1218]/20 text-lg text-[#2C1810] transition hover:border-[#6B1218] hover:bg-[#6B1218] hover:text-[#F5F0E8]"
            aria-label="Tăng số lượng"
          >
            +
          </button>
        </div>
        <button
          type="button"
          onClick={() => onRemove?.(index)}
          className="text-[0.78rem] font-medium uppercase tracking-[0.08em] text-[#6B1218] transition hover:text-[#4A0C10] hover:underline"
        >

          <span aria-hidden="true">🗑 </span>
          Xóa
        </button>
      </div>
    </article>
  );
}
