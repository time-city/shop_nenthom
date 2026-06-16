"use client";

interface ClientStatusBadgeProps {
  isActive: boolean;
  role: string;
}

export default function ClientStatusBadge({ isActive, role }: ClientStatusBadgeProps) {
  return (
    <div className="flex items-center gap-2">
      {isActive ? (
        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-[#E8F5E9] text-[#2E7D32]">
          Hoạt động
        </span>
      ) : (
        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-[#FFEBEE] text-[#C62828]">
          Đã khóa
        </span>
      )}

      {role === "ADMIN" && (
        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-[rgba(107,18,24,0.1)] text-[#6B1218]">
          ADMIN
        </span>
      )}
    </div>
  );
}
