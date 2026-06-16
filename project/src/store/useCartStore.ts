"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Order } from "@/src/lib/types/client";

interface CartStore {
  /** Tổng số sản phẩm trong giỏ hàng (để hiển thị badge header) */
  cartCount: number;
  /** Dữ liệu đơn hàng vừa đặt (thay thế localStorage "lumiere-order") */
  lastOrder: Order | null;
  /** Đã hydrate từ storage chưa (dùng để tránh flash badge) */
  _hasHydrated: boolean;

  // Actions
  setCartCount: (count: number) => void;
  incrementCartCount: (by?: number) => void;
  decrementCartCount: (by?: number) => void;
  setLastOrder: (order: Order) => void;
  clearLastOrder: () => void;
  setHasHydrated: (state: boolean) => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      cartCount: 0,
      lastOrder: null,
      _hasHydrated: false,

      setCartCount: (count) => set({ cartCount: Math.max(0, count) }),

      incrementCartCount: (by = 1) =>
        set((state) => ({ cartCount: Math.max(0, state.cartCount + by) })),

      decrementCartCount: (by = 1) =>
        set((state) => ({ cartCount: Math.max(0, state.cartCount - by) })),

      setLastOrder: (order) => set({ lastOrder: order }),

      clearLastOrder: () => set({ lastOrder: null }),

      setHasHydrated: (hydrated) => set({ _hasHydrated: hydrated }),
    }),
    {
      name: "chamcham-cart",
      // localStorage persist tốt hơn sessionStorage — không bị mất khi navigate
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        cartCount: state.cartCount,
        lastOrder: state.lastOrder,
      }),
      onRehydrateStorage: () => (state) => {
        // Đánh dấu đã hydrate xong để CartBadge biết khi nào render
        state?.setHasHydrated(true);
      },
    },
  ),
);

