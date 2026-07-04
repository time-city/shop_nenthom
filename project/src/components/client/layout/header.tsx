import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, User, ClipboardList } from "lucide-react";
import { getCurrentUser } from "../../../lib/action/user.action";
import NavLinks from "@/src/components/client/layout/nav-links";
import MobileMenu from "@/src/components/client/layout/mobileMenu";
import CartBadge from "@/src/components/client/cart/cartBadge";
import OrderBadge from "@/src/components/client/order/orderBadge";
import NotificationUser from "@/src/components/client/user/notificationUser";
import { callAction } from "@/src/lib/utils/callAction";

const navLinks = [
  { href: "/", label: "Trang chủ" },
  { href: "/#collection", label: "Bộ sưu tập" },
  { href: "/#custom", label: "Tùy chỉnh" },
  { href: "/#story", label: "Câu chuyện" },
  { href: "/#contact", label: "Liên hệ" },
];

const getInitials = (name: string) => {
  const initials = name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return initials || "CC";
};

export default async function Header() {
  // action-(lấy user hiện tại)
  const currentUser = await callAction(() => getCurrentUser(), "Không thể tải thông tin tài khoản. Vui lòng thử lại sau.");
  const userHref =
    currentUser?.role === "ADMIN"
      ? "/admin/dashboard"
      : currentUser
        ? "/profile"
        : "/login";

  return (
    <header className="fixed inset-x-0 top-0 z-[100] border-b border-transparent bg-transparent backdrop-blur-[4px] transition-all duration-500 hover:border-[#f5f0e8]/10 hover:bg-[#1A0506]/90 hover:shadow-lg hover:shadow-black/30 hover:backdrop-blur-lg">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes flame-flicker {
          0%, 100% { text-shadow: 0 -1px 4px #ffaa00, 0 -2px 10px #ff5500, 0 -4px 15px #ff0000; color: #fff; }
          25% { text-shadow: 0 -2px 6px #ffaa00, 0 -3px 12px #ff5500, 0 -5px 18px #ff0000; color: #ffebcc; }
          50% { text-shadow: 0 -1px 3px #ffaa00, 0 -1px 8px #ff5500, 0 -3px 14px #ff0000; color: #fff; }
          75% { text-shadow: 0 -2px 5px #ffaa00, 0 -4px 14px #ff5500, 0 -6px 20px #ff0000; color: #ffe6bd; }
        }
        .hover-fire:hover {
          animation: flame-flicker 0.15s infinite alternate;
        }
      `}} />
      <nav className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between gap-6 px-4 sm:px-8 lg:px-16">
        <Link
          href="/"
          className="logo-link flex h-[50px] shrink-0 items-center transition-opacity duration-300 hover:opacity-85"
        >
          <Image
            src="/logo.svg"
            alt="ChamCham - Cham. Studio"
            width={1320}
            height={1228}
            priority
            className="logo h-[50px] max-w-[50px] object-contain"
          />
        </Link>

        <NavLinks
          links={navLinks}
          className="nav-links hidden items-center gap-10 md:flex"
          linkClassName="nav-anchor hover-fire relative pb-1 text-xs font-normal uppercase tracking-[0.12em] text-[#f5f0e8]/85 opacity-75 transition-all duration-300 hover:opacity-100"
        />

        <div className="nav-actions flex shrink-0 items-center gap-2 md:gap-3">
          <Link
            href={userHref}
            className="user-btn flex size-8 md:size-10 items-center justify-center rounded-full border border-[#f5f0e8]/20 text-[#f5f0e8] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#f5f0e8]/40 hover:text-[#F8F0E4] hover:opacity-90"
            aria-label={currentUser ? "Thông tin tài khoản" : "Đăng nhập"}
          >
            {currentUser ? (
              <span
                className="flex size-full items-center justify-center rounded-full bg-[#F5F0E8] text-[10px] md:text-xs font-semibold uppercase tracking-[0.08em] text-[#6B1218]"
                aria-hidden="true"
              >
                {getInitials(currentUser.fullname ?? currentUser.email)}
              </span>
            ) : (
              <User className="size-4 md:size-5" aria-hidden="true" />
            )}
          </Link>

          {currentUser && currentUser.role === "CUSTOMER" ? <NotificationUser /> : null}

          <Link
            href="/cart"
            className="cart-link relative flex size-8 md:size-10 items-center justify-center rounded-full border border-[#f5f0e8]/20 text-[#f5f0e8] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#f5f0e8]/40 hover:text-[#F8F0E4] hover:opacity-90"
            aria-label="Giỏ hàng"
          >
            <ShoppingCart className="size-4 md:size-5" aria-hidden="true" />
            <CartBadge />
          </Link>

          {currentUser && (
            <Link
              href="/orderHistory"
              className="history-link relative flex size-8 md:size-10 items-center justify-center rounded-full border border-[#f5f0e8]/20 text-[#f5f0e8] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#f5f0e8]/40 hover:text-[#F8F0E4] hover:opacity-90"
              aria-label="Lịch sử đơn hàng"
            >
              <ClipboardList className="size-4 md:size-5" aria-hidden="true" />
              <OrderBadge />
            </Link>
          )}

          <MobileMenu links={navLinks} currentUser={currentUser} />
        </div>
      </nav>
    </header>
  );
}
