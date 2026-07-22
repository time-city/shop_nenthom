"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUp } from "lucide-react";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (pathname !== "/" && pathname !== "/home") {
    return null;
  }

  return (
    <>
      <footer className="mt-auto flex flex-col items-center justify-center gap-4 border-t border-[#f5f0e8]/10 bg-[#2C1810] px-4 py-10 text-center text-[#f5f0e8]">
        <Link
          href="/"
          className="footer-logo-link flex items-center justify-center transition-opacity duration-300 hover:opacity-85"
        >
          <Image
            src="/logo.svg"
            alt="ChamCham - Cham. Studio"
            width={1320}
            height={1228}
            className="footer-logo h-14 w-auto max-w-14 object-contain"
          />
        </Link>

        <div className="footer-text text-sm tracking-[0.08em] text-[#f5f0e8]/62">
          © 2025 ChamCham · Handcrafted in Việt Nam
        </div>
      </footer>

      <button
        id="scrollToTopBtn"
        type="button"
        title="Lên đầu trang"
        onClick={scrollToTop}
        className="fixed bottom-6 right-6 z-[100] flex size-11 items-center justify-center rounded-full border border-[#f5f0e8]/30 bg-[#4A0C10] text-[#f5f0e8] shadow-lg shadow-black/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#6B1218] hover:text-[#F8F0E4]"
      >
        <ArrowUp className="size-5" aria-hidden="true" />
        <span className="sr-only">Lên đầu trang</span>
      </button>
    </>
  );
}
