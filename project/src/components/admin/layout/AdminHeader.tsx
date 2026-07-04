"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import NotificationAdmin from "@/src/components/admin/common/notificationAdmin";
import { useSupportStore } from "@/src/store/useSupportStore";
import { getOrdersAction } from "@/src/lib/action/order.action";
import { callAction } from "@/src/lib/utils/callAction";

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  backUrl?: string;
  children?: React.ReactNode;
}

export default function AdminHeader({ title, subtitle, backUrl, children }: AdminHeaderProps) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [pendingOrdersCount, setPendingOrdersCount] = useState<number>(0);
  const unreadCount = useSupportStore((state) => state.unreadCount);
  const hasHydrated = useSupportStore((state) => state._hasHydrated);

  const pendingSupportCount = mounted && hasHydrated ? unreadCount : 0;

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setMounted(true);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  // Fetch initial pending orders count
  useEffect(() => {
    let cancelled = false;
    const fetchPendingOrders = async () => {
      try {
        const result = await callAction(
          () => getOrdersAction({ status: "PENDING", limit: 1 }),
          "Không thể tải danh sách đơn hàng."
        );
        if (cancelled) return;
        if (result && "success" in result && result.success && result.meta) {
          setPendingOrdersCount(result.meta.total);
        }
      } catch {
        // Ignore
      }
    };
    void fetchPendingOrders();
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  // Listen to global socket events dispatched by the Sidebar's socket connection
  useEffect(() => {
    const handleNewOrder = () => {
      setPendingOrdersCount((prev) => prev + 1);
    };

    window.addEventListener("admin-socket-new-order", handleNewOrder);
    return () => {
      window.removeEventListener("admin-socket-new-order", handleNewOrder);
    };
  }, []);

  return (
    <header className="dashboard-top-header admin-responsive-header">
      {/* 1. Left: Hamburger menu toggle / back button */}
      <div className="admin-header-menu-slot">
        {backUrl ? (
          <Link
            href={backUrl}
            className="flex items-center justify-center w-[38px] h-[38px] rounded-lg border border-[#6B4E35]/15 text-[#6B4C35] hover:bg-[#6B1218]/5 transition-colors"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12,19 5,12 12,5"></polyline>
            </svg>
          </Link>
        ) : (
          <button
            className="dashboard-mobile-toggle flex items-center justify-center w-[38px] h-[38px]"
            type="button"
            aria-label="Menu"
            onClick={() => window.dispatchEvent(new Event("toggle-admin-sidebar"))}
          >
            <Menu size={22} aria-hidden="true" />
          </button>
        )}
      </div>

      {/* 2. Middle: Page title (centered on mobile, left-aligned on desktop) */}
      <div className="admin-header-title-slot">
        <h1 className="dashboard-page-title font-serif text-[1.15rem] md:text-2xl font-bold text-[#2C1810] inline-block">
          {title}
        </h1>
        {subtitle && (
          <p className="dashboard-page-subtitle hidden lg:block text-xs text-[#6B4C35]/85 mt-0.5">
            {subtitle}
          </p>
        )}
      </div>

      {/* 3. Right: Header children (Desktop only) and Bell notification (Mobile only) */}
      <div className="admin-header-actions-slot">
        <div className="hidden lg:block mr-3">
          {children}
        </div>
        <div className="lg:hidden flex items-center">
          <NotificationAdmin
            variant="header"
            pendingOrdersCount={pendingOrdersCount}
            pendingSupportCount={pendingSupportCount}
          />
        </div>
      </div>
    </header>
  );
}
