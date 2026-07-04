"use client";

interface ClientPaginationProps {
  currentPage: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export default function ClientPagination({
  currentPage,
  totalPages,
  onChange,
}: ClientPaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <button
        onClick={() => onChange(Math.max(currentPage - 1, 1))}
        disabled={currentPage === 1}
        className="px-3 py-1.5 rounded-lg border border-[#6B4E35]/20 text-sm font-medium text-[#6B4C35] hover:bg-[#F2E8D9] disabled:opacity-50 disabled:pointer-events-none transition-all duration-200"
        type="button"
      >
        Trước
      </button>

      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onChange(page)}
          className={`w-9 h-9 rounded-lg text-sm font-semibold transition-all duration-200 ${
            currentPage === page
              ? "bg-[#6B1218] text-[#F5F0E8]"
              : "border border-[#6B4E35]/20 text-[#6B4C35] hover:bg-[#F2E8D9]"
          }`}
          type="button"
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onChange(Math.min(currentPage + 1, totalPages))}
        disabled={currentPage === totalPages}
        className="px-3 py-1.5 rounded-lg border border-[#6B4E35]/20 text-sm font-medium text-[#6B4C35] hover:bg-[#F2E8D9] disabled:opacity-50 disabled:pointer-events-none transition-all duration-200"
        type="button"
      >
        Sau
      </button>
    </div>
  );
}
