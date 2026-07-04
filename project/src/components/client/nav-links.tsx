"use client";

import { usePathname } from "next/navigation";
import { useEffect, type MouseEvent } from "react";
import type { ClientNavLinksProps } from "../../lib/types/client";

/**
 * Smooth scroll đến section khi đang ở trang chủ ("/").
 * Nếu đang ở trang khác thì navigate về /#hash bình thường.
 */
export default function NavLinks({
  links,
  className,
  linkClassName,
}: ClientNavLinksProps) {
  const pathname = usePathname();

  // Xử lý scroll khi navigate từ trang khác về "/#hash"
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash || pathname !== "/") return;

    const id = hash.replace("#", "");
    const el = document.getElementById(id);
    if (!el) return;

    // Delay nhỏ để trang render xong
    const timer = window.setTimeout(() => {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);

    return () => window.clearTimeout(timer);
  }, [pathname]);

  const handleClick = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    const hash = href.split("#")[1];
    if (!hash) return;

    // Nếu đang ở trang chủ → smooth scroll, không navigate
    if (pathname === "/") {
      event.preventDefault();
      const el = document.getElementById(hash);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        // Cập nhật URL mà không reload
        window.history.pushState(null, "", `/#${hash}`);
      }
    }
    // Nếu ở trang khác → để browser navigate bình thường (về / rồi scroll)
  };

  return (
    <ul className={className}>
      {links.map((link) => (
        <li key={link.href}>
          <a
            href={link.href}
            onClick={(e) => handleClick(e, link.href)}
            className={linkClassName}
          >
            {link.label}
          </a>
        </li>
      ))}
    </ul>
  );
}
