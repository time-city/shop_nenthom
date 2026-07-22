"use client";

import { useEffect, useState, useRef } from "react";
import { ChevronDown, Check } from "lucide-react";
import type { Location } from "@/src/lib/utils/location";

interface LocationSelectProps {
  options: Location[];
  value: string;
  onChange: (id: string, name: string) => void;
  placeholder: string;
  disabled?: boolean;
}

export default function LocationSelect({
  options,
  value,
  onChange,
  placeholder,
  disabled,
}: LocationSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex w-full items-center justify-between rounded-[10px] border-[1.5px] border-[#F5F0E8]/20 bg-black/40 px-4 py-3 text-left text-[0.95rem] text-[#F5F0E8] outline-none transition hover:border-[#D6A15F]/50 focus:border-[#D6A15F] disabled:cursor-not-allowed disabled:bg-black/20 disabled:text-[#F5F0E8]/40`}
      >
        <span className={value ? "text-[#F5F0E8]" : "text-[#F5F0E8]/40"}>
          {value || placeholder}
        </span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180 text-[#D6A15F]" : "text-[#F5F0E8]/40"}`} />
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-50 mt-2 max-h-60 w-full overflow-auto rounded-xl border border-[#F5F0E8]/10 bg-[#1A0506]/95 p-1 shadow-xl backdrop-blur-lg custom-scrollbar">
          {options.length === 0 ? (
            <div className="p-3 text-center text-sm text-[#F5F0E8]/50">Đang tải...</div>
          ) : (
            options.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  onChange(opt.id, opt.full_name);
                  setIsOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-[0.9rem] transition-colors hover:bg-[#D6A15F]/10 ${
                  value === opt.full_name ? "text-[#D6A15F] font-medium bg-[#D6A15F]/5" : "text-[#F5F0E8]/80"
                }`}
              >
                {opt.full_name}
                {value === opt.full_name && <Check className="h-4 w-4" />}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
