"use client";

import { useEffect, useState } from "react";
import type { IntroPhase } from "../../lib/types/client";
import styles from "../../styles/intro.module.css";

const farTrees = Array.from({ length: 9 }, (_, index) => index);
const midTrees = Array.from({ length: 8 }, (_, index) => index);
const nearTrees = Array.from({ length: 5 }, (_, index) => index);
const grass = Array.from({ length: 40 }, (_, index) => index);
const flowers = Array.from({ length: 34 }, (_, index) => index);
const petals = Array.from({ length: 6 }, (_, index) => index);
const fireflies = Array.from({ length: 22 }, (_, index) => index);

const markIntroReady = (emitEvent = true) => {
  document.body.classList.remove("intro-playing");
  document.body.classList.add("intro-ready");

  if (emitEvent) {
    window.dispatchEvent(new Event("chamcham:intro-ready"));
  }
};

export default function IntroContent() {
  // Dùng lazy initializer: chạy 1 lần tại client trước khi render đầu tiên.
  // Nếu intro đã xem → bắt đầu với visible=false, không flash màn đen.
  const [visible, setVisible] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    return sessionStorage.getItem("intro-shown") !== "true";
  });
  const [phase, setPhase] = useState<IntroPhase>(() => {
    if (typeof window === "undefined") return "black";
    return sessionStorage.getItem("intro-shown") === "true" ? "hide" : "black";
  });

  useEffect(() => {
    if (sessionStorage.getItem("intro-shown") === "true") {
      markIntroReady();
      return;
    }

    document.body.classList.add("intro-playing");
    document.body.classList.remove("intro-ready");

    const timers = [
      window.setTimeout(() => setPhase("candle"), 500),
      window.setTimeout(() => setPhase("garden"), 1700),
      window.setTimeout(() => {
        setPhase("hide");
        markIntroReady(false);
        sessionStorage.setItem("intro-shown", "true");
      }, 3800),
      window.setTimeout(() => {
        setVisible(false);
        window.dispatchEvent(new Event("chamcham:intro-ready"));
      }, 4800),
    ];

    return () => {
      timers.forEach(window.clearTimeout);
      document.body.classList.remove("intro-playing");
    };
  }, []);

  const dismiss = () => {
    setPhase("hide");
    markIntroReady(false);
    sessionStorage.setItem("intro-shown", "true");
    window.setTimeout(() => {
      setVisible(false);
      window.dispatchEvent(new Event("chamcham:intro-ready"));
    }, 700);
  };

  if (!visible) return null;

  const showCandle = phase === "candle" || phase === "garden" || phase === "hide";
  const showGarden = phase === "garden" || phase === "hide";

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-9999 overflow-hidden bg-black transition-opacity duration-1000 hover:cursor-pointer ${
        phase === "hide" ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      onClick={dismiss}
    >
      <div className="absolute inset-0 overflow-hidden">
        <div
          className={`absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(107,18,24,0.3)_0%,rgba(84,12,18,0.5)_28%,rgba(60,8,14,0.7)_52%,rgba(42,6,10,0.85)_75%,#1a0a08_100%)] transition-opacity duration-1800 ${
            showGarden ? "opacity-100" : "opacity-0"
          }`}
        />
        <div
          className={`absolute -top-8 left-1/2 h-44 w-[340px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,180,100,0.25)_0%,rgba(200,100,80,0.08)_48%,transparent_70%)] blur-2xl transition-opacity duration-1800 ${
            showGarden ? "opacity-100" : "opacity-0"
          }`}
        />
        <div
          className={`absolute bottom-[35%] left-[-6%] h-[155px] w-[46%] rounded-[52%_60%_0_0] bg-linear-to-b from-[#3A0A0E] to-[#2a0608] transition-opacity duration-1800 ${
            showGarden ? "opacity-50" : "opacity-0"
          }`}
        />
        <div
          className={`absolute bottom-[33%] left-[28%] h-[188px] w-[56%] rounded-[60%_52%_0_0] bg-linear-to-b from-[#3d0a0d] to-[#2c0809] transition-opacity duration-1800 ${
            showGarden ? "opacity-45" : "opacity-0"
          }`}
        />
        <div
          className={`absolute bottom-[32%] right-[-6%] h-[142px] w-[44%] rounded-[56%_46%_0_0] bg-linear-to-b from-[#380a0c] to-[#280607] transition-opacity duration-1800 ${
            showGarden ? "opacity-45" : "opacity-0"
          }`}
        />

        <div
          className={`absolute bottom-[32%] left-0 right-0 h-[175px] transition-opacity duration-1800 ${
            showGarden ? "opacity-100" : "opacity-0"
          }`}
        >
          {farTrees.map((tree) => (
            <div key={tree} className={`${styles.tree} ${styles.farTree}`}>
              <div className={styles.treeTrunk} />
              <div className={styles.treeCrown} />
            </div>
          ))}
        </div>
        <div
          className={`absolute bottom-[22%] left-0 right-0 h-[235px] transition-opacity duration-1800 delay-150 ${
            showGarden ? "opacity-100" : "opacity-0"
          }`}
        >
          {midTrees.map((tree) => (
            <div key={tree} className={`${styles.tree} ${styles.midTree}`}>
              <div className={styles.treeTrunk} />
              <div className={styles.treeCrown} />
            </div>
          ))}
        </div>
        <div
          className={`absolute bottom-[14%] left-0 right-0 h-[195px] transition-opacity duration-1800 delay-300 ${
            showGarden ? "opacity-100" : "opacity-0"
          }`}
        >
          {nearTrees.map((tree) => (
            <div key={tree} className={`${styles.tree} ${styles.nearTree}`}>
              <div className={styles.treeTrunk} />
              <div className={styles.treeCrown} />
            </div>
          ))}
        </div>

        <div
          className={`absolute bottom-0 left-0 right-0 h-[44%] bg-linear-to-b from-[#1a0a08] via-[#140707] to-[#0f0504] transition-opacity duration-1800 ${
            showGarden ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_22%_80%,rgba(107,18,24,0.15)_0%,transparent_42%),radial-gradient(ellipse_at_78%_88%,rgba(84,12,18,0.12)_0%,transparent_38%)]" />
        </div>

        <div
          className={`absolute bottom-[12%] left-0 right-0 h-24 transition-opacity duration-1800 delay-300 ${
            showGarden ? "opacity-100" : "opacity-0"
          }`}
        >
          {grass.map((blade) => (
            <div
              key={blade}
              className={styles.grassBlade}
            />
          ))}
        </div>

        <div
          className={`absolute bottom-[6%] left-0 right-0 h-40 transition-opacity duration-1800 delay-500 ${
            showGarden ? "opacity-100" : "opacity-0"
          }`}
        >
          {flowers.map((flower) => (
            <div key={flower} className={styles.flower}>
              <div className={styles.flowerStem} />
              <div className={styles.flowerHead}>
                {petals.map((petal) => (
                  <div key={petal} className={styles.petal} />
                ))}
                <div className={styles.flowerCenter} />
              </div>
            </div>
          ))}
        </div>

        <div
          className={`absolute inset-0 transition-opacity duration-1800 delay-700 ${
            showGarden ? "opacity-100" : "opacity-0"
          }`}
        >
          {fireflies.map((fly) => (
            <span
              key={fly}
              className={styles.firefly}
            />
          ))}
        </div>

        <div
          className={`absolute left-1/2 top-1/2 z-30 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center transition-all duration-1000 ${
            showCandle ? "scale-100 opacity-100" : "scale-95 opacity-0"
          }`}
        >
          <div className="relative flex flex-col items-center">
            <div className="absolute top-[-70px] left-1/2 size-[190px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,208,96,0.48)_0%,rgba(255,158,44,0.16)_44%,transparent_68%)] blur-xl animate-[ft-glow_1.6s_ease-in-out_infinite] max-sm:size-[140px] max-sm:-top-14" />
            <div className="relative z-10 h-[46px] w-[19px] rounded-[50%_50%_38%_38%] bg-[radial-gradient(ellipse_at_50%_68%,#fff_0%,#fff8b8_15%,#ffd030_42%,#ff8600_73%,transparent_100%)] origin-bottom animate-[ft-flick_0.62s_ease-in-out_infinite] max-sm:h-9 max-sm:w-3.5" />
            <div className="h-[22px] w-0.5 rounded bg-[#3a2810] max-sm:h-4" />
          </div>
          <div className="relative h-[200px] w-[148px] rounded-[18px_18px_12px_12px] bg-[linear-gradient(115deg,rgba(248,242,230,0.93)_0%,rgba(255,251,240,0.96)_34%,rgba(232,220,200,0.94)_68%,rgba(206,190,166,0.92)_100%)] shadow-[inset_-15px_0_30px_rgba(0,0,0,0.10),inset_10px_0_24px_rgba(255,255,255,0.32),0_12px_44px_rgba(0,0,0,0.28),0_3px_10px_rgba(0,0,0,0.16)] max-sm:h-[152px] max-sm:w-[110px]">
            <div className="absolute left-[13px] top-[8%] h-[66%] w-[11px] rounded-md bg-linear-to-b from-white/35 via-white/10 to-transparent max-sm:left-2.5 max-sm:w-2" />
            <div className="absolute left-1/2 top-1.5 h-6 w-[118px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_40%_38%,rgba(255,252,236,0.92)_0%,rgba(238,224,200,0.82)_55%,rgba(210,192,166,0.68)_100%)] max-sm:h-[18px] max-sm:w-[88px]" />
          </div>
        </div>
      </div>
    </div>
  );
}
