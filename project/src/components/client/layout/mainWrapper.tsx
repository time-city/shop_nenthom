"use client";

import { usePathname } from "next/navigation";

export default function MainWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isCart = pathname?.startsWith("/cart");
  const isProfile = pathname?.startsWith("/profile");
  const isOrders = pathname?.startsWith("/orderHistory") || pathname?.startsWith("/orders");
  const noPadding = isCart || isProfile || isOrders;

  return (
    <div className={`flex flex-1 flex-col ${noPadding ? "" : "pt-20"}`}>
      {children}
    </div>
  );
}
