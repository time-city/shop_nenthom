"use client";

import dynamic from "next/dynamic";

const IntroContent = dynamic(() => import("./introContent"), { ssr: false });

// Inline script trong layout.tsx đã set 'intro-playing' đồng bộ trước khi paint.
// IntroContent tự kiểm tra sessionStorage bên trong và tự dismiss nếu đã xem.
export default function Intro() {
  return <IntroContent />;
}
