import type { LoadingStateProps } from "../../lib/types/ui";

export default function LoadingState({
  className = "",
  label = "Đang tải dữ liệu...",
}: LoadingStateProps) {
  return (
    <div
      className={`flex min-h-32 flex-col items-center justify-center gap-3 rounded-xl border border-[#6B4E35]/10 bg-[#F8F0E4]/80 px-5 py-8 text-center text-sm text-[#6B4C35] ${className}`}
      role="status"
      aria-live="polite"
    >
      <span
        className="size-8 animate-spin rounded-full border-2 border-[#6B1218]/20 border-t-[#6B1218]"
        aria-hidden="true"
      />
      <span>{label}</span>
    </div>
  );
}
