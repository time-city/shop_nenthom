import type { LoadingStateProps } from "../../lib/types/ui";
import Spinner from "./Spinner";

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
      <Spinner size="md" />
      <span>{label}</span>
    </div>
  );
}
