"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface UserProfile {
  id: string;
  fullname: string;
  email: string;
  phone: string;
  role: string;
  // Địa chỉ giao hàng (không có trong DB, lưu local)
  address: string;
  city: string;
  zip: string;
}

interface UserStore {
  user: UserProfile | null;

  // Actions
  setUser: (user: UserProfile) => void;
  updateUser: (partial: Partial<UserProfile>) => void;
  updateAddress: (address: { address: string; city: string; zip: string }) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,

      setUser: (user) => set({ user }),

      updateUser: (partial) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...partial } : null,
        })),

      updateAddress: (address) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...address } : null,
        })),

      clearUser: () => set({ user: null }),
    }),
    {
      name: "chamcham-user",
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
