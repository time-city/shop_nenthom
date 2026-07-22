"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import NotificationAdmin from "@/src/components/admin/common/notificationAdmin";
import { useSupportStore } from "@/src/store/useSupportStore";
import { getOrdersAction } from "@/src/lib/action/order.action";
import { callAction } from "@/src/lib/utils/callAction";
import useSWR from "swr";

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  backUrl?: string;
  children?: React.ReactNode;
}

export default function AdminHeader({ title, subtitle, backUrl, children }: AdminHeaderProps) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);
  const unreadCount = useSupportStore((state) => state.unreadCount);
  const hasHydrated = useSupportStore((state) => state._hasHydrated);

  const pendingSupportCount = mounted && hasHydrated ? unreadCount : 0;

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setMounted(true);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const { data: pendingOrdersResult, mutate: mutatePendingOrders } = useSWR(
    ['admin-pending-orders'],
    async () => {
      return await callAction(
        () => getOrdersAction({ status: "PENDING", limit: 1 }),
        "Không thể tải danh sách đơn hàng."
      );
    }
  );

  const pendingOrdersCount = pendingOrdersResult && 'success' in pendingOrdersResult && pendingOrdersResult.success && pendingOrdersResult.meta
    ? pendingOrdersResult.meta.total 
    : 0;

  // Listen to global socket events dispatched by the Sidebar's socket connection
  useEffect(() => {
    const handleNewOrder = () => {
      mutatePendingOrders();
    };

    window.addEventListener("admin-socket-new-order", handleNewOrder);
    return () => {
      window.removeEventListener("admin-socket-new-order", handleNewOrder);
    };
  }, []);

  const toggleSidebar = () => {
    // On all screen sizes, toggle the sidebar via event
    window.dispatchEvent(new Event("toggle-admin-sidebar"));
    if (window.innerWidth >= 1024) {
      document.body.classList.toggle('admin-sidebar-collapsed');
      setIsDesktopCollapsed(document.body.classList.contains('admin-sidebar-collapsed'));
    }
  };

  return (
    <header className="dashboard-top-header admin-responsive-header">
      {/* 1. Left: Hamburger menu toggle / back button */}
      <div className="admin-header-menu-slot">
        {backUrl ? (
          <Link
            href={backUrl}
            className="flex items-center justify-center w-[36px] h-[36px] rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <svg
              width="18"
              height="18"
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
            className="flex items-center justify-center w-[36px] h-[36px] rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 transition-colors"
            type="button"
            aria-label="Toggle Menu"
            onClick={toggleSidebar}
          >
            <Menu size={20} aria-hidden="true" />
          </button>
        )}
      </div>

      {/* 2. Middle: Page title (centered on mobile, left-aligned on desktop) */}
      <div className="admin-header-title-slot">
        <h1 className="dashboard-page-title">
          {title}
        </h1>
        {subtitle && (
          <p className="dashboard-page-subtitle hidden lg:block">
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
