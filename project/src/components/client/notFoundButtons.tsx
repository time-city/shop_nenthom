"use client";

import { useRouter } from "next/navigation";

export default function NotFoundButtons() {
  const router = useRouter();

  return (
    <div className="flex flex-col sm:flex-row gap-3 justify-center">
      <button
        id="btn-go-back"
        onClick={() => router.back()}
        className="px-6 py-2.5 text-sm font-sans border border-[#6B4C35]/40 text-[#6B4C35] rounded hover:bg-[#6B4C35]/10 transition-all duration-200"
      >
        ← Quay lại
      </button>
      <a
        id="btn-go-home"
        href="/"
        className="px-6 py-2.5 text-sm font-sans bg-[#2C1810] text-[#F8F0E4] rounded hover:bg-[#6B1218] transition-all duration-200 text-center"
      >
        Về trang chủ
      </a>
    </div>
  );
}
