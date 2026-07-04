import React from "react";

interface SpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export default function Spinner({ size = "md", className = "" }: SpinnerProps) {
  const sizeClasses = {
    sm: "size-4 border-[2px]",
    md: "size-8 border-[3px]",
    lg: "size-12 border-[4px]",
    xl: "size-16 border-[4px]",
  };

  return (
    <span
      className={`animate-spin rounded-full border-[#6B1218]/20 border-t-[#6B1218] inline-block ${sizeClasses[size]} ${className}`}
      role="status"
      aria-label="loading"
    />
  );
}
