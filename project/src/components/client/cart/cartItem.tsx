"use client";

import Image from "next/image";
import Link from "next/link";
import { startTransition, useEffect, useState, useRef } from "react";
import type { CartItemProps } from "../../../lib/types/client";
import { useToast } from "@/src/components/ui/toastProvider";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("vi-VN").format(price) + "đ";

const getItemName = (item: CartItemProps["item"]) =>
  item.name ?? item.scent ?? "Nến ChamCham";

export default function CartItem({
  disabled = false,
  index,
  item,
  onQuantityChange,
  onSelectChange,
  quantityDisabled = false,
  selected = false,
}: CartItemProps) {
  const { toast } = useToast();
  const [qty, setQty] = useState<number>(item.quantity);
  const [inputVal, setInputVal] = useState<number | "">(item.quantity);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const originalQtyRef = useRef<number>(item.quantity);

  useEffect(() => {
    startTransition(() => {
      setQty(item.quantity);
      setInputVal(item.quantity);
    });
  }, [item.quantity]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleQuantityChange = (change: number) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!debounceTimerRef.current) {
      originalQtyRef.current = qty;
    }

    const nextQty = qty + change;

    if (nextQty <= 0) {
      setQty(0);
      setInputVal(0);
      try {
        void onQuantityChange(index, -qty);
      } catch (err) {
        setQty(originalQtyRef.current);
        setInputVal(originalQtyRef.current);
        toast.error(err instanceof Error ? err.message : "Cập nhật giỏ hàng thất bại");
      }
      return;
    }

    setQty(nextQty);
    setInputVal(nextQty);

    debounceTimerRef.current = setTimeout(async () => {
      debounceTimerRef.current = null;
      try {
        const finalChange = nextQty - originalQtyRef.current;
        if (finalChange !== 0) {
          await onQuantityChange(index, finalChange);
        }
      } catch (err) {
        setQty(originalQtyRef.current);
        setInputVal(originalQtyRef.current);
        toast.error(err instanceof Error ? err.message : "Cập nhật giỏ hàng thất bại");
      }
    }, 450);
  };

  if (qty <= 0) {
    return null;
  }

  const quantity = Math.max(qty, 1);
  const itemTotal = item.price * quantity;
  const packLabel =
    item.pack && String(item.pack).toLowerCase() !== "undefined"
      ? item.pack
      : "";

  return (
    <article className="grid gap-5 border-b border-[#F5F0E8]/10 px-5 py-6 last:border-b-0 sm:px-7 md:grid-cols-[auto_116px_1fr_auto] md:gap-8 md:py-8">
      <label className="flex items-start pt-1">
        <span className="sr-only">Chọn sản phẩm {getItemName(item)}</span>
        <input
          type="checkbox"
          checked={selected}
          onChange={(event) => onSelectChange(index, event.target.checked)}
          disabled={disabled}
          className="size-5 rounded border-[#F5F0E8]/30 accent-[#D6A15F] disabled:cursor-not-allowed disabled:opacity-45"
        />
      </label>

      <div
        className="relative flex size-[92px] items-center justify-center overflow-hidden rounded-xl bg-black/40 shadow-[0_14px_26px_rgba(0,0,0,0.4)] md:size-[116px] border border-[#F5F0E8]/10 group"
        aria-hidden="true"
      >
        {item.productId ? (
          <Link href={`/collection/${item.productId}`} className="absolute inset-0 z-10" aria-label={`Xem ${getItemName(item)}`} />
        ) : null}
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={getItemName(item)}
            width={116}
            height={116}
            unoptimized
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <span className="text-xl">🕯</span>
        )}
      </div>

      <div>
        <h3 className="mb-3 font-serif text-[1.4rem] font-medium leading-tight text-[#F5F0E8] transition-colors hover:text-[#D6A15F]">
          {item.productId ? (
            <Link href={`/collection/${item.productId}`}>
              {getItemName(item)}
            </Link>
          ) : (
            getItemName(item)
          )}
        </h3>
        {item.color ? (
          <p className="mb-2 text-sm font-light text-[#F5F0E8]/70">
            Màu: {item.color}
          </p>
        ) : null}
        {item.size ? (
          <p className="mb-2 text-sm font-light text-[#F5F0E8]/70">
            Kích thước: {item.size}
          </p>
        ) : null}
        {packLabel ? (
          <p className="mb-2 text-sm font-light text-[#F5F0E8]/70">
            Bao bì: {packLabel}
          </p>
        ) : null}
      </div>

      <div className="text-left md:text-right">
        <div className="mb-5 font-serif text-[1.45rem] font-bold text-[#D6A15F]">
          {formatPrice(itemTotal)}
        </div>
        <div className="mb-5 ml-0 flex w-fit items-center gap-2 rounded-full border border-[#D6A15F]/20 bg-black/30 p-1 md:ml-auto">
          <button
            type="button"
            onClick={() => handleQuantityChange(-1)}
            disabled={quantityDisabled}
            className="flex size-8 items-center justify-center rounded-full border border-[#D6A15F]/30 text-lg text-[#F5F0E8] transition hover:border-[#D6A15F] hover:bg-[#D6A15F] hover:text-[#2C1810] disabled:cursor-not-allowed disabled:opacity-45"
            aria-label="Giảm số lượng"
          >
            −
          </button>
          <input
            type="number"
            min="1"
            value={inputVal}
            onChange={(e) => {
              const val = e.target.value;
              if (val === "") {
                setInputVal("");
                return;
              }
              const intVal = parseInt(val, 10);
              if (!isNaN(intVal)) {
                setInputVal(intVal);
                const targetVal = Math.max(1, intVal);
                const diff = targetVal - qty;
                if (diff !== 0) {
                  handleQuantityChange(diff);
                }
              }
            }}
            onBlur={() => {
              if (inputVal === "" || isNaN(Number(inputVal)) || Number(inputVal) < 1) {
                setInputVal(1);
                const diff = 1 - qty;
                if (diff !== 0) {
                  handleQuantityChange(diff);
                }
              }
            }}
            disabled={quantityDisabled}
            className="w-10 text-center font-serif text-base font-bold text-[#F5F0E8] bg-transparent border-none outline-none p-0 focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <button
            type="button"
            onClick={() => handleQuantityChange(1)}
            disabled={quantityDisabled}
            className="flex size-8 items-center justify-center rounded-full border border-[#D6A15F]/30 text-lg text-[#F5F0E8] transition hover:border-[#D6A15F] hover:bg-[#D6A15F] hover:text-[#2C1810] disabled:cursor-not-allowed disabled:opacity-45"
            aria-label="Tăng số lượng"
          >
            +
          </button>
        </div>
      </div>
    </article>
  );
}
