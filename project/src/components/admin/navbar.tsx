"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { logoutUser } from "../../lib/action/auth.action";
import { useSupportStore } from "@/src/store/useSupportStore";
import { useCartStore } from "@/src/store/useCartStore";
import { useUserStore } from "@/src/store/useUserStore";
import { getOrdersAction } from "../../lib/action/order.action";
import type { AdminNavItem, AdminSidebarSectionProps } from "../../lib/types/admin";

const overviewLinks: AdminNavItem[] = [
  {
    href: "/admin/dashboard",
    label: "Dashboard",
    icon: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </>
    ),
  },
];

const managementLinks: AdminNavItem[] = [
  {
    href: "/admin/ordersManagement",
    label: "Đơn hàng",
    icon: (
      <>
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </>
    ),
  },
  {
    href: "/admin/productManagement",
    label: "Sản phẩm",
    icon: (
      <>
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </>
    ),
  },
  {
    href: "/admin/categoryManagement",
    label: "Danh mục",
    icon: (
      <>
        <line x1="8" y1="6" x2="21" y2="6" />
        <line x1="8" y1="12" x2="21" y2="12" />
        <line x1="8" y1="18" x2="21" y2="18" />
        <line x1="3" y1="6" x2="3.01" y2="6" />
        <line x1="3" y1="12" x2="3.01" y2="12" />
        <line x1="3" y1="18" x2="3.01" y2="18" />
      </>
    ),
  },
  {
    href: "/admin/ingredientStore",
    label: "Kho nguyên liệu",
    icon: (
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    ),
  },
  {
    href: "/admin/discountCode",
    label: "Mã giảm giá",
    icon: (
      <>
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
        <line x1="7" y1="7" x2="7.01" y2="7" />
      </>
    ),
  },
  {
    href: "/admin/clientManagement",
    label: "Thành viên",
    icon: (
      <>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
  },
];

const otherLinks: AdminNavItem[] = [
  {
    href: "/admin/support",
    label: "Hỗ trợ",
    icon: (
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    ),
  },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const unreadCount = useSupportStore((state) => state.unreadCount);
  const hasHydrated = useSupportStore((state) => state._hasHydrated);

  const [pendingOrdersCount, setPendingOrdersCount] = useState<number>(0);

  useEffect(() => {
    startTransition(() => {
      setMounted(true);
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    const fetchPendingOrders = async () => {
      try {
        const result = await getOrdersAction({ status: "PENDING", limit: 1 });
        if (cancelled) return;
        if (result && "success" in result && result.success && result.meta) {
          setPendingOrdersCount(result.meta.total);
        }
      } catch {
        // Ignore error
      }
    };
    void fetchPendingOrders();
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  // Badge chỉ hiển thị sau khi mount và store đã hydrate
  const supportBadge = mounted && hasHydrated && unreadCount > 0
    ? unreadCount > 99 ? "99+" : String(unreadCount)
    : undefined;

  const ordersBadge = mounted && pendingOrdersCount > 0
    ? pendingOrdersCount > 99 ? "99+" : String(pendingOrdersCount)
    : undefined;

  const managementLinksWithBadge = useMemo(() => {
    return managementLinks.map((link) => {
      if (link.href === "/admin/ordersManagement") {
        return { ...link, badge: ordersBadge };
      }
      return link;
    });
  }, [ordersBadge]);

  const otherLinksWithBadge: AdminNavItem[] = [
    {
      ...otherLinks[0],
      badge: supportBadge,
    },
  ];

  useEffect(() => {
    const handleToggle = () => setIsOpen((prev) => !prev);
    window.addEventListener("toggle-admin-sidebar", handleToggle);
    return () => {
      window.removeEventListener("toggle-admin-sidebar", handleToggle);
    };
  }, []);

  const handleLogout = () => {
    startTransition(async () => {
      const result = await logoutUser();

      if (!result.success) {
        return;
      }

      useCartStore.getState().clearCart();
      useUserStore.getState().clearUser();
      useSupportStore.getState().clearSupport();
      router.replace("/login");
      router.refresh();
    });
  };

  return (
    <>
      {isOpen && (
        <div
          className="admin-sidebar-backdrop"
          onClick={() => setIsOpen(false)}
        />
      )}
      <aside className={`admin-sidebar ${isOpen ? "open" : ""}`}>
        <div className="admin-sidebar-header">
          <Image
            src="/logo.svg"
            alt="ChamCham"
            width={56}
            height={56}
            className="admin-sidebar-logo"
            priority
          />
          <div className="admin-sidebar-brand">
            <span className="admin-sidebar-brand-name">ChamCham</span>
            <span className="admin-sidebar-brand-sub">Admin Panel</span>
          </div>
          <button
            className="admin-sidebar-close"
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Đóng menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <nav className="admin-sidebar-nav" aria-label="Admin navigation">
          <SidebarSection
            pathname={pathname}
            title="Tổng quan"
            links={overviewLinks}
            setIsOpen={setIsOpen}
          />
          <SidebarSection
            pathname={pathname}
            title="Quản lý"
            links={managementLinksWithBadge}
            setIsOpen={setIsOpen}
          />
          <SidebarSection
            pathname={pathname}
            title="Khác"
            links={otherLinksWithBadge}
            setIsOpen={setIsOpen}
          />
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-sidebar-user">
            <div className="admin-sidebar-avatar">AD</div>
            <div className="admin-sidebar-user-info">
              <div className="admin-sidebar-user-name">Admin ChamCham</div>
              <div className="admin-sidebar-user-role">Quản trị viên</div>
            </div>
          </div>
          <button
            className="admin-sidebar-logout"
            type="button"
            onClick={handleLogout}
            disabled={isPending}
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
              aria-hidden="true"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16,17 21,12 16,7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            {isPending ? "Đang đăng xuất..." : "Đăng xuất"}
          </button>
        </div>
      </aside>
    </>
  );
}

interface SidebarSectionProps extends AdminSidebarSectionProps {
  setIsOpen: (open: boolean) => void;
}

function SidebarSection({
  links,
  pathname,
  title,
  setIsOpen,
}: SidebarSectionProps) {
  return (
    <div className="admin-sidebar-section">
      <div className="admin-sidebar-section-title">{title}</div>
      {links.map((link) => {
        const active =
          pathname === link.href || pathname.startsWith(`${link.href}/`);

        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setIsOpen(false)}
            className={`admin-sidebar-link${active ? " active" : ""}`}
          >
            <svg
              className="admin-sidebar-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              {link.icon}
            </svg>
            <span>{link.label}</span>
            {link.badge ? (
              <span className="admin-sidebar-badge">{link.badge}</span>
            ) : null}
          </Link>
        );
      })}
    </div>
  );
}
