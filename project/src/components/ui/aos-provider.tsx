"use client";

import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

export default function AosProvider() {
  useEffect(() => {
    AOS.init({
      once: true,
      duration: 800,
      offset: 50,
      easing: "ease-out-cubic",
    });
  }, []);

  return null;
}
