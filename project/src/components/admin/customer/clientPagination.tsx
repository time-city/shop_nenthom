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

  const getPages = () => {
let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);

    if (endPage - startPage < 4) {
      startPage = Math.max(1, endPage - 4);
      endPage = Math.min(totalPages, startPage + 4);
    }

    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  };

  const pages = getPages();

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      {currentPage > 1 && (
        <button
          onClick={() => onChange(1)}
          className="px-3 py-1.5 h-9 flex items-center justify-center rounded-lg border border-[#6B4E35]/20 text-sm font-medium text-[#6B4E35] hover:bg-[#F5F0E8] hover:border-[#6B4E35]/35 disabled:opacity-50 disabled:pointer-events-none transition-all duration-200"
          type="button"
        >
          « Trang đầu
        </button>
      )}

      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onChange(page)}
          className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-semibold transition-all duration-200 ${
            currentPage === page
              ? "bg-[#6B1218] text-[#F5F0E8]"
              : "border border-[#6B4E35]/20 text-[#6B4E35] hover:bg-[#F5F0E8] hover:border-[#6B4E35]/35"
          }`}
          type="button"
        >
          {page}
        </button>
      ))}

      {currentPage < totalPages && (
        <button
          onClick={() => onChange(totalPages)}
          className="px-3 py-1.5 h-9 flex items-center justify-center rounded-lg border border-[#6B4E35]/20 text-sm font-medium text-[#6B4E35] hover:bg-[#F5F0E8] hover:border-[#6B4E35]/35 disabled:opacity-50 disabled:pointer-events-none transition-all duration-200"
          type="button"
        >
          Trang cuối »
        </button>
      )}
    </div>
  );
}
