"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface SupportStore {
  /** Số tin nhắn hỗ trợ chưa được phản hồi */
  unreadCount: number;
  /** Đã hydrate từ storage chưa */
  _hasHydrated: boolean;

  // Actions
  setUnreadCount: (count: number) => void;
  incrementUnread: () => void;
  decrementUnread: (by?: number) => void;
  setHasHydrated: (state: boolean) => void;
  clearSupport: () => void;
}

export const useSupportStore = create<SupportStore>()(
  persist(
    (set) => ({
      unreadCount: 0,
      _hasHydrated: false,

      setUnreadCount: (count) => set({ unreadCount: Math.max(0, count) }),

      incrementUnread: () =>
        set((state) => ({ unreadCount: state.unreadCount + 1 })),

      decrementUnread: (by = 1) =>
        set((state) => ({ unreadCount: Math.max(0, state.unreadCount - by) })),

      setHasHydrated: (hydrated) => set({ _hasHydrated: hydrated }),

      clearSupport: () => set({ unreadCount: 0 }),
    }),
    {
      name: "chamcham-support",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ unreadCount: state.unreadCount }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
