"use client";

import { useState, useRef, useEffect } from "react";

interface Option {
  value: string;
  label: string;
}

interface CustomDropdownProps {
  id?: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function CustomDropdown({ id, value, options, onChange, placeholder = "Chọn..." }: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value) || { label: placeholder, value: "" };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        id={id}
        onClick={() => setIsOpen(!isOpen)}
        className="filter-input flex h-12 w-full items-center justify-between rounded-md border border-[#F5F0E8]/25 bg-[#8B363A] px-5 py-3 text-sm text-[#F5F0E8] outline-none transition focus:border-[#F5F0E8]/70 focus:ring-4 focus:ring-[#F5F0E8]/10 hover:border-[#F5F0E8]/50"
      >
        <span className="truncate">{selectedOption.label}</span>
        <svg
          className={`size-4 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div
        className={`absolute z-[100] mt-2 w-full overflow-hidden rounded-md border border-[#F5F0E8]/20 bg-[#7A1218] shadow-[0_10px_24px_rgba(44,8,12,0.4)] transition-all duration-300 ease-out origin-top ${
          isOpen ? "scale-y-100 opacity-100" : "scale-y-0 opacity-0"
        }`}
      >
        <ul className="flex max-h-60 flex-col overflow-y-auto py-1 custom-scrollbar">
          {options.map((option) => (
            <li key={option.value}>
              <button
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-5 py-3 text-[0.8rem] transition-colors hover:bg-[#F5F0E8]/15 ${
                  value === option.value ? "bg-[#F5F0E8]/10 text-[#F5F0E8] font-medium" : "text-[#F5F0E8]/80"
                }`}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
