"use client";

import { useEffect, useRef, useState } from "react";
import { logoutUser } from "../../lib/action/auth.action";
import { useCartStore } from "@/src/store/useCartStore";
import { useUserStore } from "@/src/store/useUserStore";
import { useSupportStore } from "@/src/store/useSupportStore";

interface MobileMenuProps {
  links: { href: string; label: string }[];
  currentUser?: unknown;
}

export default function MobileMenu({ links, currentUser }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Detect clicks outside of both the menu dropdown and the toggle button
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = async () => {
    await logoutUser();
    useCartStore.getState().clearCart();
    useUserStore.getState().clearUser();
    useSupportStore.getState().clearSupport();
    window.location.href = "/login";
  };

  const handleLinkClick = (event: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    const hash = href.split("#")[1];
    setIsOpen(false);
    if (!hash) return;

    // Smooth scroll if on home page
    if (window.location.pathname === "/") {
      event.preventDefault();
      const el = document.getElementById(hash);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        window.history.pushState(null, "", `/#${hash}`);
      }
    }
  };

  return (
    <div className="flex md:hidden">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex size-10 items-center justify-center rounded-full border border-[#f5f0e8]/20 text-[#f5f0e8] transition-all duration-200 hover:border-[#f5f0e8]/40"
        type="button"
        aria-label={isOpen ? "Đóng menu" : "Mở menu"}
      >
        {isOpen ? (
          /* Inline SVG X Icon */
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          /* Inline SVG Hamburger Icon */
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        )}
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          className="fixed top-20 left-0 right-0 z-[200] bg-[#6B1218] text-[#F5F0E8] rounded-b-[12px] p-4 shadow-xl border-t border-[#f5f0e8]/15 animate-dropdown-slide-down flex flex-col gap-1"
        >
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleLinkClick(e, link.href)}
              className="block py-3 text-sm font-medium uppercase tracking-wider text-[#F5F0E8] hover:opacity-80 transition-opacity border-b border-[rgba(245,240,232,0.15)]"
            >
              {link.label}
            </a>
          ))}

          {Boolean(currentUser) && (
            <button
              onClick={handleLogout}
              className="w-full mt-4 bg-[rgba(245,240,232,0.1)] text-[#F5F0E8] hover:text-[#6B1218] hover:bg-[#F5F0E8] py-2.5 px-4 rounded-[8px] text-center transition-all duration-200 font-semibold block"
            >
              Đăng Xuất
            </button>
          )}
        </div>
      )}
    </div>
  );
}
