"use client";

import { startTransition, useEffect, useState } from "react";
import { useCartStore } from "@/src/store/useCartStore";

/**
 * OrderBadge — hiển thị số lượng đơn hàng của người dùng.
 * Render client-side để subscribe vào Zustand store.
 * Được đặt trong Header (Server Component).
 */
export default function OrderBadge() {
  const orderCount = useCartStore((state) => state.orderCount);
  const hasHydrated = useCartStore((state) => state._hasHydrated);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    startTransition(() => {
      setMounted(true);
    });
  }, []);

  // Chưa mount (SSR) hoặc store chưa hydrate → không render để tránh flash
  if (!mounted || !hasHydrated || orderCount <= 0) return null;

  return (
    <span
      className="absolute -right-2 -top-2 flex size-[18px] items-center justify-center rounded-full bg-[#FAF0E6] text-[0.7rem] font-extrabold leading-none text-[#6B1218] border border-[#6B1218]/10 shadow-sm"
      aria-label={`${orderCount} đơn hàng của bạn`}
    >
      {orderCount > 99 ? "99+" : orderCount}
    </span>
  );
}
