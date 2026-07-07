import React from "react";

interface SpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export default function Spinner({ size = "md", className = "" }: SpinnerProps) {
  const sizeClasses = {
    sm: "size-5",
    md: "size-10",
    lg: "size-14",
    xl: "size-20",
  };

  return (
    <div className={`relative flex items-center justify-center ${sizeClasses[size]} ${className}`} role="status" aria-label="loading">
      {/* Outer spinning ring - elegant thin border */}
      <div className="absolute inset-0 rounded-full border-[1.5px] border-[#6B1218]/10 border-t-[#6B1218]/60 animate-[spin_2s_linear_infinite]" />
      {/* Inner spinning ring - spins reverse and slightly faster */}
      <div className="absolute inset-1.5 rounded-full border-[1.5px] border-[#6B4C35]/10 border-b-[#6B4C35]/80 animate-[spin_1.5s_linear_infinite_reverse]" />
      {/* Center dot/pulse */}
      <div className="absolute size-1.5 md:size-2 rounded-full bg-[#6B1218]/80 animate-pulse" />
    </div>
  );
}
