"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Inject lightweight custom AOS styles
const AOS_STYLES = `
  [data-aos] {
    transition-duration: 900ms;
    transition-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
    transition-property: opacity, transform;
    will-change: opacity, transform;
    backface-visibility: hidden;
  }
  /* Initial States */
  [data-aos="fade-up"] {
    opacity: 0;
    transform: translate3d(0, 30px, 0);
  }
  [data-aos="fade-left"] {
    opacity: 0;
    transform: translate3d(30px, 0, 0);
  }
  [data-aos="fade-right"] {
    opacity: 0;
    transform: translate3d(-30px, 0, 0);
  }
  [data-aos="zoom-in"] {
    opacity: 0;
    transform: scale(0.9);
  }
  [data-aos="flip-up"] {
    opacity: 0;
    transform: perspective(2500px) rotateX(-90deg);
  }

  /* Animated States */
  [data-aos].aos-animate {
    opacity: 1;
    transform: translate3d(0, 0, 0) scale(1) perspective(2500px) rotateX(0deg);
  }
`;

export default function AosProvider() {
  const pathname = usePathname();

  useEffect(() => {
    if (!document.getElementById("custom-aos-styles")) {
      const style = document.createElement("style");
      style.id = "custom-aos-styles";
      style.innerHTML = AOS_STYLES;
      document.head.appendChild(style);
    }

    const observerOptions = {
      root: null,
      rootMargin: "50px",
      threshold: 0.1,
    };

    const observer = new IntersectionObserver((entries, observerInstance) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("aos-animate");
          observerInstance.unobserve(entry.target);
        }
      });
    }, observerOptions);

    const observeElements = () => {
      const elements = document.querySelectorAll("[data-aos]:not(.aos-animate)");
      elements.forEach((el) => observer.observe(el));
    };

    observeElements();

    const timeoutIds = [120, 500, 1500, 3000].map((delay) =>
      setTimeout(observeElements, delay)
    );

    return () => {
      observer.disconnect();
      timeoutIds.forEach(clearTimeout);
    };
  }, [pathname]);

  return null;
}
