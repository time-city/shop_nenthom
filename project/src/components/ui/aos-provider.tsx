"use client";

import { useEffect, useRef } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

export default function AosProvider() {
  const initializedRef = useRef(false);

  useEffect(() => {
    const initAos = () => {
      if (initializedRef.current) {
        AOS.refreshHard();
        return;
      }

      initializedRef.current = true;
      AOS.init({
        once: true,
        duration: 900,
        offset: 60,
        easing: "ease-out-cubic",
        delay: 0,
      });

      window.setTimeout(() => AOS.refreshHard(), 120);
    };

    const waitOrInit = () => {
      const introIsPlaying = document.body.classList.contains("intro-playing");
      const introIsReady = document.body.classList.contains("intro-ready");

      if (introIsPlaying && !introIsReady) return;

      initAos();
    };

    window.addEventListener("chamcham:intro-ready", initAos);
    const fallbackTimer = window.setTimeout(waitOrInit, 120);

    return () => {
      window.removeEventListener("chamcham:intro-ready", initAos);
      window.clearTimeout(fallbackTimer);
    };
  }, []);

  return null;
}
