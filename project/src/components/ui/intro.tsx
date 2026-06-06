"use client";

import { useEffect, useState } from "react";

type IntroPhase = "black" | "candle" | "garden" | "hide";

const farTrees = [
  { x: "3%", w: 20, h: 85 },
  { x: "9%", w: 16, h: 68 },
  { x: "16%", w: 24, h: 104 },
  { x: "22%", w: 14, h: 60 },
  { x: "60%", w: 18, h: 76 },
  { x: "68%", w: 26, h: 112 },
  { x: "76%", w: 16, h: 66 },
  { x: "84%", w: 22, h: 94 },
  { x: "92%", w: 15, h: 60 },
];

const midTrees = [
  { x: "1%", w: 42, h: 175, op: 0.6 },
  { x: "8%", w: 34, h: 140, op: 0.56 },
  { x: "16%", w: 50, h: 205, op: 0.63 },
  { x: "23%", w: 32, h: 124, op: 0.54 },
  { x: "69%", w: 46, h: 190, op: 0.61 },
  { x: "77%", w: 36, h: 148, op: 0.58 },
  { x: "85%", w: 52, h: 215, op: 0.64 },
  { x: "93%", w: 30, h: 126, op: 0.52 },
];

const nearTrees = [
  { x: "0%", w: 65, h: 190, op: 0.8 },
  { x: "7%", w: 50, h: 150, op: 0.74 },
  { x: "74%", w: 62, h: 184, op: 0.78 },
  { x: "83%", w: 48, h: 144, op: 0.72 },
  { x: "91%", w: 70, h: 196, op: 0.82 },
];

const grass = Array.from({ length: 40 }, (_, index) => ({
  x: `${(index * 13) % 100}%`,
  w: 8 + ((index * 7) % 18),
  h: 14 + ((index * 11) % 28),
  op: 0.35 + ((index * 9) % 45) / 100,
}));

const flowers = Array.from({ length: 34 }, (_, index) => ({
  x: `${(index * 17 + 4) % 100}%`,
  h: 24 + ((index * 13) % 58),
  size: 8 + ((index * 5) % 7),
  delay: `${((index * 3) % 9) / 10}s`,
  op: 0.55 + ((index * 7) % 34) / 100,
  color:
    index % 3 === 0
      ? ["#C4686E", "#B05666", "#E8C87A"]
      : index % 3 === 1
        ? ["#D4887A", "#C87068", "#F5ECD8"]
        : ["#E8C87A", "#D8B85A", "#F5ECD8"],
}));

const fireflies = Array.from({ length: 22 }, (_, index) => ({
  left: `${10 + ((index * 19) % 80)}%`,
  bottom: `${12 + ((index * 11) % 45)}%`,
  size: 2 + ((index * 5) % 4),
  duration: `${3 + ((index * 7) % 5)}s`,
  delay: `${((index * 13) % 70) / 10}s`,
}));

function Tree({
  h,
  opacity,
  w,
  x,
  layer,
}: {
  h: number;
  opacity: number;
  w: number;
  x: string;
  layer: "far" | "mid" | "near";
}) {
  const trunkWidth = Math.round(w * (layer === "near" ? 0.22 : 0.2));
  const trunkHeight = Math.round(h * (layer === "far" ? 0.27 : 0.3));

  return (
    <div
      className="absolute bottom-0"
      style={{ height: h, left: x, opacity, width: w }}
    >
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-sm bg-[#150805]"
        style={{ height: trunkHeight, width: trunkWidth }}
      />
      <div
        className="absolute left-1/2 -translate-x-1/2 rounded-[50%_50%_44%_44%]"
        style={{
          background:
            layer === "far"
              ? "linear-gradient(to bottom,#3a0a0e,#2a0608)"
              : "linear-gradient(155deg,#3a0a0e 0%,#2a0608 55%,#1a0503 100%)",
          bottom: Math.round(h * 0.22),
          height: Math.round(h * 0.8),
          width: w,
        }}
      />
    </div>
  );
}

function Flower({
  delay,
  h,
  opacity,
  size,
  x,
  colors,
}: {
  colors: string[];
  delay: string;
  h: number;
  opacity: number;
  size: number;
  x: string;
}) {
  const petals = Array.from({ length: 6 }, (_, index) => index);

  return (
    <div
      className="absolute bottom-0"
      style={{ left: x, opacity, width: size * 4 }}
    >
      <div
        className="absolute bottom-0 left-1/2 w-0.5 -translate-x-1/2 rounded bg-linear-to-t from-[#1a0a08] to-[#3a1815] origin-bottom animate-[ft-sway_2.8s_ease-in-out_infinite]"
        style={{ animationDelay: delay, height: h }}
      />
      <div
        className="absolute left-1/2 -translate-x-1/2"
        style={{ bottom: h - size * 0.7, height: size * 2.4, width: size * 2.4 }}
      >
        {petals.map((petal) => (
          <div
            key={petal}
            className="absolute left-1/2 top-1/2 origin-[50%_100%] rounded-[50%_50%_40%_40%]"
            style={{
              background: `radial-gradient(ellipse at 50% 30%,${colors[0]},${colors[1]} 80%)`,
              height: size * 1.3,
              transform: `translateX(-50%) translateY(-100%) rotate(${petal * 60}deg)`,
              width: size,
            }}
          />
        ))}
        <div
          className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background: `radial-gradient(circle,${colors[2]},rgba(240,210,60,0.7) 70%)`,
            height: size * 0.9,
            width: size * 0.9,
          }}
        />
      </div>
    </div>
  );
}

export default function Intro() {
  const [phase, setPhase] = useState<IntroPhase>("black");
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (sessionStorage.getItem("intro-shown") === "true") {
      window.requestAnimationFrame(() => setVisible(false));
      return;
    }

    document.body.classList.add("intro-playing");
    document.body.classList.remove("intro-ready");

    const timers = [
      window.setTimeout(() => setPhase("candle"), 500),
      window.setTimeout(() => setPhase("garden"), 1700),
      window.setTimeout(() => {
        setPhase("hide");
        document.body.classList.remove("intro-playing");
        document.body.classList.add("intro-ready");
        sessionStorage.setItem("intro-shown", "true");
      }, 3800),
      window.setTimeout(() => setVisible(false), 4800),
    ];

    return () => {
      timers.forEach(window.clearTimeout);
      document.body.classList.remove("intro-playing");
    };
  }, []);

  const dismiss = () => {
    setPhase("hide");
    document.body.classList.remove("intro-playing");
    document.body.classList.add("intro-ready");
    sessionStorage.setItem("intro-shown", "true");
    window.setTimeout(() => setVisible(false), 700);
  };

  if (!visible) return null;

  const showCandle = phase === "candle" || phase === "garden" || phase === "hide";
  const showGarden = phase === "garden" || phase === "hide";

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-9999 overflow-hidden bg-black transition-opacity duration-1000 ${
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
            <Tree key={tree.x} {...tree} layer="far" opacity={0.36} />
          ))}
        </div>
        <div
          className={`absolute bottom-[22%] left-0 right-0 h-[235px] transition-opacity duration-1800 delay-150 ${
            showGarden ? "opacity-100" : "opacity-0"
          }`}
        >
          {midTrees.map((tree) => (
            <Tree key={tree.x} {...tree} layer="mid" opacity={tree.op} />
          ))}
        </div>
        <div
          className={`absolute bottom-[14%] left-0 right-0 h-[195px] transition-opacity duration-1800 delay-300 ${
            showGarden ? "opacity-100" : "opacity-0"
          }`}
        >
          {nearTrees.map((tree) => (
            <Tree key={tree.x} {...tree} layer="near" opacity={tree.op} />
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
              key={`${blade.x}-${blade.h}`}
              className="absolute bottom-0 rounded-[50%_50%_28%_28%] bg-linear-to-t from-[#1a0a08] via-[#2c1810] to-[#4a2420]"
              style={{
                height: blade.h,
                left: blade.x,
                opacity: blade.op,
                width: blade.w,
              }}
            />
          ))}
        </div>

        <div
          className={`absolute bottom-[6%] left-0 right-0 h-40 transition-opacity duration-1800 delay-500 ${
            showGarden ? "opacity-100" : "opacity-0"
          }`}
        >
          {flowers.map((flower) => (
            <Flower
              key={`${flower.x}-${flower.h}`}
              colors={flower.color}
              delay={flower.delay}
              h={flower.h}
              opacity={flower.op}
              size={flower.size}
              x={flower.x}
            />
          ))}
        </div>

        <div
          className={`absolute inset-0 transition-opacity duration-1800 delay-700 ${
            showGarden ? "opacity-100" : "opacity-0"
          }`}
        >
          {fireflies.map((fly) => (
            <span
              key={`${fly.left}-${fly.bottom}`}
              className="absolute rounded-full bg-[#fff28c]/90 animate-[ft-firefly_linear_infinite]"
              style={{
                animationDelay: fly.delay,
                animationDuration: fly.duration,
                bottom: fly.bottom,
                height: fly.size,
                left: fly.left,
                width: fly.size,
              }}
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
