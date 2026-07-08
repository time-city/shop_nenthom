"use client";

import { startTransition, useEffect, useState } from "react";
import { useCartStore } from "@/src/store/useCartStore";

/**
 * CartBadge — hiển thị số lượng sản phẩm trong giỏ hàng.
 * Render client-side để subscribe vào Zustand store.
 * Được đặt trong Header (Server Component).
 *
 * Dùng pattern mounted + onRehydrateStorage để tránh hydration mismatch:
 * - Trước khi mount: không render gì (tránh SSR flash)
 * - Sau khi store hydrate từ localStorage: hiển thị count thực
 */
export default function CartBadge() {
  const cartCount = useCartStore((state) => state.cartCount);
  const hasHydrated = useCartStore((state) => state._hasHydrated);
  const fetchCartCount = useCartStore((state) => state.fetchCartCount);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    startTransition(() => {
      setMounted(true);
    });
    void fetchCartCount();
  }, [fetchCartCount]);

  useEffect(() => {
    if (hasHydrated) {
      console.log(`[Data Source] 🟢 UI UPDATED - cartBadge: Displaying cart count from Zustand LocalStorage state`);
    }
  }, [hasHydrated]);

  // Chưa mount (SSR) hoặc store chưa hydrate → không render để tránh flash
  if (!mounted || !hasHydrated || cartCount <= 0) return null;

  return (
    <span
      className="absolute -right-2 -top-2 flex size-[18px] items-center justify-center rounded-full bg-[#F8F0E4] text-[0.7rem] font-extrabold leading-none text-[#6B1218]"
      aria-label={`${cartCount} sản phẩm trong giỏ hàng`}
    >
      {cartCount > 99 ? "99+" : cartCount}
    </span>
  );
}
