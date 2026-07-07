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
        className="w-full px-4 py-2.5 text-sm text-[#F5F0E8] placeholder-[#F5F0E8]/40 bg-[rgba(248,240,228,0.05)] border border-[#D6A15F]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D6A15F] focus:border-[#D6A15F] transition-all duration-200"
      />
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <svg
          className="size-4 text-[#F5F0E8]/40"
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
