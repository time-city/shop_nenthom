"use client";

import React, { useRef, useState, useEffect } from "react";

interface TiltWrapperProps {
  children: React.ReactNode;
  className?: string;
  maxRotation?: number;
  scale?: number;
}

export default function TiltWrapper({
  children,
  className = "",
  maxRotation = 10,
  scale = 0.98,
}: TiltWrapperProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    
    // Calculate mouse position relative to card center (-1 to 1)
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    
    // Invert X and Y for "lún" (sink) effect.
    // When mouse is on the right (x > 0), rotateY should be negative to push the right side in.
    // When mouse is on the bottom (y > 0), rotateX should be positive to push the bottom side in.
    setRotateY(x * -maxRotation * 2);
    setRotateX(y * maxRotation * 2);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <div
      ref={cardRef}
      className={`transition-all duration-200 ease-out ${className}`}
      style={{
        transformStyle: "preserve-3d",
        transform: isHovered
          ? `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${scale}, ${scale}, ${scale})`
          : "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );
}
