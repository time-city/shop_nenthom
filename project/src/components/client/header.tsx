import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, User } from "lucide-react";
import { getCurrentUser } from "../../lib/action/user.action";
import NavLinks from "./nav-links";
import MobileMenu from "./mobileMenu";
import CartBadge from "./cartBadge";

const navLinks = [
  { href: "/#home", label: "Trang chủ" },
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
  const currentUser = await getCurrentUser();
  const userHref =
    currentUser?.role === "ADMIN"
      ? "/admin/dashboard"
      : currentUser
        ? "/profile"
        : "/login";

  return (
    <header className="fixed inset-x-0 top-0 z-[100] border-b border-[#f5f0e8]/10 bg-[#4A0C10]/95 shadow-lg shadow-black/10 backdrop-blur">
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
          linkClassName="nav-anchor relative pb-1 text-xs font-normal uppercase tracking-[0.12em] text-[#f5f0e8]/85 opacity-75 transition-all duration-300 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-[#f5f0e8]/90 after:transition-all after:duration-300 hover:text-[#f5f0e8] hover:opacity-100 hover:after:w-full"
        />

        <div className="nav-actions flex shrink-0 items-center gap-3">
          <Link
            href={userHref}
            className="user-btn flex size-10 items-center justify-center rounded-full border border-[#f5f0e8]/20 text-[#f5f0e8] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#f5f0e8]/40 hover:text-[#F8F0E4] hover:opacity-90"
            aria-label={currentUser ? "Thông tin tài khoản" : "Đăng nhập"}
          >
            {currentUser ? (
              <span
                className="flex size-full items-center justify-center rounded-full bg-[#F5F0E8] text-xs font-semibold uppercase tracking-[0.08em] text-[#6B1218]"
                aria-hidden="true"
              >
                {getInitials(currentUser.fullname ?? currentUser.email)}
              </span>
            ) : (
              <User className="size-5" aria-hidden="true" />
            )}
          </Link>

          <Link
            href="/cart"
            className="cart-link relative flex size-10 items-center justify-center rounded-full border border-[#f5f0e8]/20 text-[#f5f0e8] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#f5f0e8]/40 hover:text-[#F8F0E4] hover:opacity-90"
            aria-label="Giỏ hàng"
          >
            <ShoppingCart className="size-5" aria-hidden="true" />
            <CartBadge />
          </Link>

          <MobileMenu links={navLinks} currentUser={currentUser} />
        </div>
      </nav>
    </header>
  );
}
