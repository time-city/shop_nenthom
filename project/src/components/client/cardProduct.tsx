"use client";

import { useRouter } from "next/navigation";
import type { MouseEvent } from "react";
import type { CardProductProps } from "../../lib/types/client";
import styles from "../../styles/cardProduct.module.css";

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
  index = 0,
  name,
  price,
  scentNote,
}: CardProductProps) {
  const router = useRouter();
  const detailHref = href;
  const openDetail = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    router.push(detailHref, { scroll: false });
  };

  return (
    <article
      data-aos="fade-up"
      data-aos-delay={index * 100}
      className="product-card group overflow-hidden rounded-[14px] bg-[#F5F0E8] text-[#2C1810] shadow-[0_14px_30px_rgba(44,8,12,0.22)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_42px_rgba(44,8,12,0.28)]"
    >
      <a
        href={detailHref}
        onClick={openDetail}
        aria-label={`Xem chi tiết ${name}`}
        className="product-image flex h-48 items-center justify-center overflow-hidden bg-[#F5F0E8] p-5 transition group-hover:bg-[#F2E8D9] sm:h-52 xl:h-56"
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="h-full w-full rounded-lg object-contain transition duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="candle-preview relative h-[104px] w-[76px] rounded-[6px_6px_5px_5px] shadow-[0_16px_30px_rgba(44,24,16,0.12),inset_-9px_0_16px_rgba(126,93,56,0.08),inset_7px_0_13px_rgba(255,255,255,0.26)] sm:h-[122px] sm:w-[90px]">
            <div
              className={`${styles.candleWax} ${getCandleWaxClass(candleColor ?? "#F5E6D3")}`}
            />
            <div className="absolute -top-3 left-1/2 h-4 w-5 -translate-x-1/2 rounded-[4px_4px_0_0] bg-[#D6A15F]" />
            <div className="absolute -top-2 left-1/2 h-3 w-1.5 -translate-x-1/2 rounded-full bg-[#FF9800] shadow-[0_0_16px_rgba(255,152,0,0.68)]" />
          </div>
        )}
      </a>

      <div className="product-info border-t border-[#2C1810]/5 px-4 py-5 sm:px-5">
        <a href={detailHref} onClick={openDetail} className="block">
          <h3 className="line-clamp-1 font-serif text-[1.25rem] font-light leading-tight text-[#2C1810] transition group-hover:text-[#7A1218] sm:text-[1.42rem]">
            {name}
          </h3>
        </a>

        <p className="scent-note mt-2 line-clamp-1 text-[0.82rem] leading-5 text-[#2C1810]/72">
          {scentNote || "Nến thơm thủ công tinh giản."}
        </p>

        <p className="product-price mt-5 font-serif text-[0.98rem] text-[#7A1218]">
          {formatPrice(price)}
        </p>

        <a
          href={detailHref}
          onClick={openDetail}
          className="btn-add-cart mt-5 flex min-h-10 w-full items-center justify-center rounded-full bg-[#7A1218] px-4 text-center text-[0.68rem] font-medium uppercase tracking-[0.1em] text-[#F5F0E8] shadow-[0_10px_18px_rgba(122,18,24,0.2)] transition hover:bg-[#5F0D12] hover:shadow-[0_14px_26px_rgba(122,18,24,0.32)]"
        >
          Xem chi tiết
        </a>
      </div>
    </article>
  );
}
