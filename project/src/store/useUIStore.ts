"use client";

import { create } from "zustand";

interface UIStore {
  isCartOpen: boolean;
  isMobileMenuOpen: boolean;
  
  toggleCart: () => void;
  setCartOpen: (isOpen: boolean) => void;
  
  toggleMobileMenu: () => void;
  setMobileMenuOpen: (isOpen: boolean) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  isCartOpen: false,
  isMobileMenuOpen: false,

  toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
  setCartOpen: (isOpen) => set({ isCartOpen: isOpen }),

  toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
  setMobileMenuOpen: (isOpen) => set({ isMobileMenuOpen: isOpen }),
}));
