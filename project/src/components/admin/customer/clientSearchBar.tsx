"use client";

interface ClientSearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export default function ClientSearchBar({ value, onChange }: ClientSearchBarProps) {
  return (
    <div className="relative w-full max-w-md">
      <input
        type="text"
        placeholder="Tìm kiếm khách hàng theo tên, email, sđt..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2.5 text-sm text-[#2C1810] placeholder-[#6B4E35]/50 bg-white border border-[#6B4E35]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B1218]/20 focus:border-[#6B1218] transition-all duration-200"
      />
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <svg
          className="size-4 text-[#6B4E35]/40"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </div>
    </div>
  );
}
