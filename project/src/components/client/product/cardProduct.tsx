"use client";

import Link from "next/link";
import Image from "next/image";
import type { CardProductProps } from "../../../lib/types/client";
import styles from "../../../styles/cardProduct.module.css";
import { useTransition } from "react";
import { addToCartAction } from "@/src/lib/action/cart.action";
import { useCartStore } from "@/src/store/useCartStore";
import { useToast } from "@/src/components/ui/toastProvider";
import { mutate } from "swr";

const formatPrice = (price: number | string) => {
  if (typeof price === "number") {
    return new Intl.NumberFormat("vi-VN").format(price) + "đ";
  }

  return price;
};

const getCandleWaxClass = (color: string) => {
  const normalizedColor = color.toLowerCase();

  if (normalizedColor === "#c8ddc4") return styles.sage;
  if (normalizedColor === "#e7b4d4") return styles.blossom;
  if (normalizedColor === "#e4a9cb") return styles.peony;
  if (normalizedColor === "#d29a61") return styles.cedar;
  if (normalizedColor === "#c88f58") return styles.sandalwood;
  if (normalizedColor === "#f1dec5") return styles.linen;

  return styles.cream;
};

export default function CardProduct({
  id,
  candleColor,
  href,
  imageUrl,
  name,
  price,
  scentNote,
}: CardProductProps & { id?: string }) {
  const [isPending, startTransition] = useTransition();
  const incrementCartCount = useCartStore((state) => state.incrementCartCount);
  const decrementCartCount = useCartStore((state) => state.decrementCartCount);
  const { toast } = useToast();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Ngăn Link bao ngoài (nếu có)
    e.stopPropagation();

    if (!id || isPending) return;

    // 1. Optimistic update
    incrementCartCount(1);
    toast.success("Đã thêm vào giỏ hàng");

    // 2. Call API
    startTransition(async () => {
      const result = await addToCartAction({ product_id: id, quantity: 1 });
      if (result?.error) {
        // Rollback
        decrementCartCount(1);
        toast.error(result.error);
      } else {
        void mutate(["client-cart"]);
      }
    });
  };

  return (
    <article
      className="product-card group relative flex flex-col h-full overflow-hidden rounded-2xl bg-white text-[#2C1810] shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(107,18,24,0.08)] ring-1 ring-[#2C1810]/5"
    >
      <Link href={href} className="absolute inset-0 z-10" aria-label={`Xem chi tiết ${name}`} />
      
      <div
        className="product-image relative block w-full aspect-[4/5] overflow-hidden bg-[#F5F0E8]/30 p-0 transition duration-500 group-hover:bg-[#F5F0E8]/50"
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            loading="lazy"
            className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[#2C1810]/5">
            <div className="candle-preview relative h-[104px] w-[76px] rounded-[6px_6px_5px_5px] shadow-[0_16px_30px_rgba(44,24,16,0.12),inset_-9px_0_16px_rgba(126,93,56,0.08),inset_7px_0_13px_rgba(255,255,255,0.26)] sm:h-[122px] sm:w-[90px]">
              <div
                className={`${styles.candleWax} ${getCandleWaxClass(candleColor ?? "#F5E6D3")}`}
              />
              <div className="absolute -top-3 left-1/2 h-4 w-5 -translate-x-1/2 rounded-[4px_4px_0_0] bg-[#D6A15F]" />
              <div className="absolute -top-2 left-1/2 h-3 w-1.5 -translate-x-1/2 rounded-full bg-[#FF9800] shadow-[0_0_16px_rgba(255,152,0,0.68)]" />
            </div>
          </div>
        )}

        {/* Floating Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={isPending}
          aria-label="Thêm vào giỏ"
          className="absolute bottom-3 right-3 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm text-[#6B1218] shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-all duration-300 hover:bg-[#6B1218] hover:text-white hover:scale-110 disabled:opacity-50 disabled:hover:bg-white/90 disabled:hover:text-[#6B1218] disabled:hover:scale-100"
        >
          {isPending ? (
            <svg className="h-5 w-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
          )}
        </button>
      </div>

      <div className="product-info flex flex-col flex-grow p-4 sm:p-5 relative z-20 pointer-events-none bg-gradient-to-t from-white via-white to-white/90">
        <div className="flex-grow">
          <h3 className="line-clamp-1 font-serif text-[1.1rem] sm:text-[1.25rem] font-medium leading-tight text-[#2C1810] transition-colors group-hover:text-[#6B1218]">
            {name}
          </h3>

          <p className="scent-note mt-1 sm:mt-1.5 line-clamp-1 text-[0.8rem] sm:text-[0.85rem] leading-relaxed text-[#8B7355]">
            {scentNote || "Nến thơm thủ công tinh giản."}
          </p>
        </div>

        <div className="mt-3 sm:mt-4 flex items-center justify-between">
          <span className="product-price font-sans text-[1.05rem] sm:text-[1.15rem] font-bold text-[#6B1218] tracking-tight">
            {formatPrice(price)}
          </span>
        </div>
      </div>
    </article>
  );
}
