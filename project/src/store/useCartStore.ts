"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Order } from "@/src/lib/types/client";
import { getOrCreateCartAction } from "@/src/lib/action/cart.action";
import { callAction } from "@/src/lib/utils/callAction";

export interface AppliedDiscount {
  code: string;
  type?: string;
  discount_cents: number;
  subtotal_cents: number;
  total_cents: number;
}

interface CartStore {
  /** Tổng số sản phẩm trong giỏ hàng (để hiển thị badge header) */
  cartCount: number;
  /** Dữ liệu đơn hàng vừa đặt (thay thế localStorage "lumiere-order") */
  lastOrder: Order | null;
  /** Đã hydrate từ storage chưa (dùng để tránh flash badge) */
  _hasHydrated: boolean;
  /** Tổng số đơn hàng của người dùng */
  orderCount: number;
  /** Mã giảm giá đang được áp dụng */
  appliedDiscount: AppliedDiscount | null;

  // Actions
  setCartCount: (count: number) => void;
  incrementCartCount: (by?: number) => void;
  decrementCartCount: (by?: number) => void;
  setLastOrder: (order: Order) => void;
  clearLastOrder: () => void;
  setHasHydrated: (state: boolean) => void;
  clearCart: () => void;
  setOrderCount: (count: number) => void;
  incrementOrderCount: (by?: number) => void;
  fetchCartCount: () => Promise<void>;
  setAppliedDiscount: (discount: AppliedDiscount | null) => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      cartCount: 0,
      lastOrder: null,
      _hasHydrated: false,
      orderCount: 0,
      appliedDiscount: null,

      setCartCount: (count) => set({ cartCount: Math.max(0, count) }),

      incrementCartCount: (by = 1) =>
        set((state) => ({ cartCount: Math.max(0, state.cartCount + by) })),

      decrementCartCount: (by = 1) =>
        set((state) => ({ cartCount: Math.max(0, state.cartCount - by) })),

      setLastOrder: (order) => set({ lastOrder: order }),

      clearLastOrder: () => set({ lastOrder: null }),

      setHasHydrated: (hydrated) => set({ _hasHydrated: hydrated }),

      clearCart: () => set({ cartCount: 0, lastOrder: null, appliedDiscount: null, orderCount: 0 }),

      setOrderCount: (count) => set({ orderCount: Math.max(0, count) }),

      incrementOrderCount: (by = 1) =>
        set((state) => ({ orderCount: Math.max(0, state.orderCount + by) })),

      fetchCartCount: async () => {
        try {
          const result = await callAction(() => getOrCreateCartAction(), "Không thể tải giỏ hàng. Vui lòng thử lại sau.");
          if ("success" in result && result.success && result.cart) {
            set({ cartCount: result.cart.items.length });
          } else {
            set({ cartCount: 0 });
          }
        } catch {
          set({ cartCount: 0 });
        }
      },

      setAppliedDiscount: (discount) => set({ appliedDiscount: discount }),
    }),
    {
      name: "chamcham-cart",
      // localStorage persist tốt hơn sessionStorage — không bị mất khi navigate
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        cartCount: state.cartCount,
        lastOrder: state.lastOrder,
        orderCount: state.orderCount,
        appliedDiscount: state.appliedDiscount,
      }),
      onRehydrateStorage: () => (state) => {
        // Đánh dấu đã hydrate xong để CartBadge biết khi nào render
        state?.setHasHydrated(true);
      },
    },
  ),
);
