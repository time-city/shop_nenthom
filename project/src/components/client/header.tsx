import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, User } from "lucide-react";

const navLinks = [
  { href: "#trangChu", label: "Trang chủ" },
  { href: "#cauChuyen", label: "Câu chuyện" },
  { href: "#boSuuTap", label: "Bộ sưu tập" },
  { href: "#tuVan", label: "Tùy chỉnh" },
  { href: "#lienHe", label: "Liên hệ" },
];

export default function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-[100] border-b border-[#f5f0e8]/10 bg-[#6B1218]/95 shadow-lg shadow-black/10 backdrop-blur">
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

        <ul className="nav-links hidden items-center gap-10 md:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="nav-anchor relative pb-1 text-xs font-normal uppercase tracking-[0.12em] text-[#f5f0e8]/85 opacity-75 transition-all duration-300 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-[#f5f0e8]/90 after:transition-all after:duration-300 hover:text-[#f5f0e8] hover:opacity-100 hover:after:w-full"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="nav-actions flex shrink-0 items-center gap-3">
          <Link
            href="/login"
            className="user-btn flex size-10 items-center justify-center rounded-full border border-[#f5f0e8]/20 text-[#f5f0e8] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#f5f0e8]/40 hover:text-[#F8F0E4] hover:opacity-90"
            aria-label="User"
          >
            <User className="size-5" aria-hidden="true" />
          </Link>

          <a
            href="/cart.html"
            className="cart-link relative flex size-10 items-center justify-center rounded-full border border-[#f5f0e8]/20 text-[#f5f0e8] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#f5f0e8]/40 hover:text-[#F8F0E4] hover:opacity-90"
            aria-label="Cart"
          >
            <ShoppingCart className="size-5" aria-hidden="true" />
            <span
              className="cart-count hidden absolute -right-2 -top-2 size-[18px] items-center justify-center rounded-full bg-[#F8F0E4] text-[0.7rem] font-extrabold leading-none text-[#6B1218]"
              id="cartCount"
            >
              0
            </span>
          </a>
        </div>
      </nav>
    </header>
  );
}
