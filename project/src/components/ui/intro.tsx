"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const IntroContent = dynamic(() => import("./introContent"), { ssr: false });

export default function Intro() {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("intro-shown") === "true") {
      document.body.classList.remove("intro-playing");
      document.body.classList.add("intro-ready");
      window.dispatchEvent(new Event("chamcham:intro-ready"));
    } else {
      setShouldRender(true);
    }
  }, []);

  if (!shouldRender) return null;

  return <IntroContent />;
}
