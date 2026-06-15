"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, type MouseEvent } from "react";
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
  const [activeSection, setActiveSection] = useState<string>("home");

  // Theo dõi scroll để xác định section đang hiển thị (scroll spy)
  useEffect(() => {
    if (pathname !== "/") return;

    const sections = ["home", "collection", "custom", "story", "contact"];
    const sectionElements = sections
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    const observerOptions = {
      root: null, // viewport
      rootMargin: "-30% 0px -60% 0px", // Kích hoạt khi mục nằm ở giữa khung nhìn
      threshold: 0,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    sectionElements.forEach((el) => observer.observe(el));

    // Fallback khi cuộn lên đầu trang
    const handleScroll = () => {
      if (window.scrollY < 80) {
        setActiveSection("home");
      }
    };
    window.addEventListener("scroll", handleScroll);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, [pathname]);

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
        setActiveSection(hash);
      }
    }
    // Nếu ở trang khác → để browser navigate bình thường (về / rồi scroll)
  };

  return (
    <ul className={className}>
      {links.map((link) => {
        const hash = link.href.split("#")[1];
        const isActive = pathname === "/" && activeSection === hash;

        return (
          <li key={link.href}>
            <a
              href={link.href}
              onClick={(e) => handleClick(e, link.href)}
              className={`${linkClassName} ${
                isActive ? "text-[#f5f0e8] !opacity-100 after:!w-full" : ""
              }`}
            >
              {link.label}
            </a>
          </li>
        );
      })}
    </ul>
  );
}

