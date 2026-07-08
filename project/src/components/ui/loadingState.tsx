import type { LoadingStateProps } from "../../lib/types/ui";
import Spinner from "./spinner";

// Ensure Spinner stays referenced for JSX (lint rule react/jsx-no-undef)
// eslint-disable-next-line @typescript-eslint/no-unused-vars

export default function LoadingState({
  className = "",
  label = "Đang tải...",
  type = "default",
}: LoadingStateProps) {
  const skelBg = "bg-black/10 dark:bg-white/10";
  const pulseClass = "animate-pulse";

  if (type === "cart") {
    return (
      <div className={`flex w-full flex-col gap-5 ${className}`}>
        {[1, 2].map((i) => (
          <div key={i} className={`flex flex-col sm:flex-row gap-5 p-5 bg-black/5 dark:bg-black/20 rounded-2xl ${pulseClass}`}>
            <div className={`size-24 sm:size-[116px] rounded-xl shrink-0 ${skelBg}`} />
            <div className="flex-1 space-y-4 py-2">
              <div className={`h-6 w-3/4 rounded-md ${skelBg}`} />
              <div className={`h-4 w-1/2 rounded-md ${skelBg}`} />
              <div className={`h-4 w-1/3 rounded-md ${skelBg}`} />
            </div>
            <div className="flex flex-col justify-between items-end gap-4 py-2">
              <div className={`h-7 w-24 rounded-md ${skelBg}`} />
              <div className={`h-10 w-32 rounded-full ${skelBg}`} />
            </div>
          </div>
        ))}
        {label && <p className="text-center text-sm opacity-60 mt-2">{label}</p>}
      </div>
    );
  }

  if (type === "product" || type === "card") {
    return (
      <div className={`grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 ${className}`}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={`flex flex-col gap-4 bg-black/5 dark:bg-black/20 rounded-2xl p-4 sm:p-5 ${pulseClass}`}>
            <div className={`w-full aspect-square rounded-xl ${skelBg}`} />
            <div className={`h-6 w-3/4 rounded-md mt-2 ${skelBg}`} />
            <div className={`h-4 w-1/2 rounded-md ${skelBg}`} />
            <div className={`h-10 w-full rounded-full mt-4 ${skelBg}`} />
          </div>
        ))}
      </div>
    );
  }

  if (type === "table") {
    return (
      <div className={`w-full flex flex-col gap-3 ${className}`}>
        <div className={`w-full h-14 rounded-xl ${pulseClass} ${skelBg}`} />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className={`w-full h-16 rounded-xl ${pulseClass} bg-black/5 dark:bg-white/5`} />
        ))}
      </div>
    );
  }

  if (type === "spinner") {
    return (
      <div
        className={`flex min-h-[200px] flex-col items-center justify-center gap-6 rounded-2xl bg-gradient-to-b from-[#F8F0E4]/40 dark:from-black/20 to-transparent px-8 py-12 text-center ${className}`}
        role="status"
        aria-live="polite"
      >
        <Spinner size="lg" />

        <span className="font-serif tracking-[0.15em] text-[0.8rem] uppercase text-[#6B1218]/70 dark:text-[#D6A15F] animate-pulse">
          {label}
        </span>
      </div>
    );
  }

  // Default skeleton
  return (
    <div
      className={`flex min-h-[200px] w-full flex-col gap-5 rounded-2xl bg-black/5 dark:bg-black/20 p-6 sm:p-8 ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className={`flex items-center gap-5 ${pulseClass}`}>
        <div className={`size-16 rounded-full shrink-0 ${skelBg}`} />
        <div className="flex-1 space-y-4">
          <div className={`h-5 w-3/4 rounded-md ${skelBg}`} />
          <div className={`h-4 w-1/2 rounded-md ${skelBg}`} />
        </div>
      </div>
      <div className={`space-y-4 mt-6 ${pulseClass}`}>
        <div className={`h-4 w-full rounded-md ${skelBg}`} />
        <div className={`h-4 w-full rounded-md ${skelBg}`} />
        <div className={`h-4 w-5/6 rounded-md ${skelBg}`} />
      </div>
      {label && <div className={`mt-8 text-center text-sm font-medium opacity-60 ${pulseClass}`}>{label}</div>}
    </div>
  );
}
