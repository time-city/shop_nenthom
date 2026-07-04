"use client";

import Link from "next/link";
import Image from "next/image";
import type { CardProductProps } from "../../../lib/types/client";
import styles from "../../../styles/cardProduct.module.css";

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
  candleColor,
  href,
  imageUrl,
  name,
  price,
  scentNote,
}: CardProductProps) {
  return (
    <article
      className="product-card group flex flex-col h-full overflow-hidden rounded-md bg-[#F5F0E8] text-[#2C1810] shadow-[0_14px_30px_rgba(44,8,12,0.22)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_42px_rgba(44,8,12,0.28)]"
    >
      <Link
        href={href}
        aria-label={`Xem chi tiết ${name}`}
        className="product-image relative block w-full aspect-[4/5] overflow-hidden bg-[#FAF6F0] p-0 transition duration-300"
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
      </Link>

      <div className="product-info flex flex-col flex-grow border-t border-[#2C1810]/5 p-3 sm:p-5">
        <div className="flex-grow">
          <Link href={href} className="block">
            <h3 className="line-clamp-1 font-serif text-[1rem] sm:text-[1.32rem] font-medium leading-tight text-[#2C1810] transition group-hover:text-[#6B1218]">
              {name}
            </h3>
          </Link>

          <p className="scent-note mt-1 sm:mt-2 line-clamp-1 text-[0.75rem] sm:text-[0.8rem] leading-4 text-[#2C1810]/80">
            {scentNote || "Nến thơm thủ công tinh giản."}
          </p>
        </div>

        <div className="mt-3 pt-3 sm:mt-5 sm:pt-4 border-t border-[#2C1810]/5 flex flex-col items-stretch sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
          <span className="product-price font-sans text-[1rem] sm:text-[1.12rem] font-bold text-[#6B1218] whitespace-nowrap">
            {formatPrice(price)}
          </span>
          <Link
            href={href}
            className="btn-add-cart flex h-8 sm:h-9 items-center justify-center rounded-md bg-[#6B1218] px-3 sm:px-5 text-center text-[0.65rem] sm:text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-[#F5F0E8] shadow-[0_4px_10px_rgba(107,18,24,0.15)] transition hover:bg-[#520d12] hover:shadow-[0_6px_14px_rgba(107,18,24,0.25)] whitespace-nowrap"
          >
            Chi tiết
          </Link>
        </div>
      </div>
    </article>
  );
}
