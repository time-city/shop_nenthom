"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  label: string;
  value: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
}

export default function CustomSelect({ value, onChange, options, placeholder = "Chọn...", className = "" }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => String(opt.value) === String(value));

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-3 px-4 py-2 bg-[rgba(26,5,6,0.65)] border border-[#D6A15F]/30 rounded-lg text-[#F5F0E8] text-sm focus:outline-none focus:border-[#D6A15F] transition-all min-w-[160px]"
      >
        <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown className={`w-4 h-4 text-[#D6A15F] shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div 
          className="absolute z-50 top-full left-0 right-0 mt-1 border border-[#D6A15F]/30 rounded-lg shadow-xl overflow-hidden animate-fade-in min-w-[160px]"
          style={{ background: "url('/assets/option_background.jpg') no-repeat center center", backgroundSize: 'cover' }}
        >
          <div className="absolute inset-0 bg-[#1A0506]/85 backdrop-blur-[2px] pointer-events-none" />
          <div className="max-h-60 overflow-y-auto relative z-10">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between ${
                  String(value) === String(opt.value)
                    ? "bg-[#D6A15F]/30 text-[#D6A15F] font-bold"
                    : "text-[#F5F0E8]/90 hover:bg-[#F5F0E8]/15 hover:text-[#F5F0E8]"
                }`}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
              >
                <span className="truncate pr-2">{opt.label}</span>
                {String(value) === String(opt.value) && <Check className="w-4 h-4 shrink-0 text-[#D6A15F]" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
