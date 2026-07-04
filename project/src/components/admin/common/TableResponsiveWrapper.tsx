"use client";

import React, { useRef, useState, useEffect } from "react";

interface TableResponsiveWrapperProps {
  children: React.ReactNode;
  minWidth?: number;
}

export default function TableResponsiveWrapper({
  children,
  minWidth = 900,
}: TableResponsiveWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [height, setHeight] = useState<number | string>("auto");

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && contentRef.current) {
        const containerWidth = containerRef.current.getBoundingClientRect().width;
        
        if (containerWidth < minWidth && containerWidth > 0) {
          const s = containerWidth / minWidth;
          setScale(s);
          // Get the unscaled height of the inner content
          const originalHeight = contentRef.current.scrollHeight || contentRef.current.getBoundingClientRect().height;
          setHeight(originalHeight * s);
        } else {
          setScale(1);
          setHeight("auto");
        }
      }
    };

    handleResize();

    // Use ResizeObserver to detect container width updates correctly
    let observer: ResizeObserver | null = null;
    if (typeof window !== "undefined" && "ResizeObserver" in window) {
      observer = new ResizeObserver(() => {
        handleResize();
      });
      if (containerRef.current) {
        observer.observe(containerRef.current);
      }
    }

    const timer = setTimeout(handleResize, 150);

    return () => {
      if (observer) {
        observer.disconnect();
      }
      clearTimeout(timer);
    };
  }, [children, minWidth]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        overflow: "hidden",
        height: height,
        position: "relative",
      }}
    >
      <div
        ref={contentRef}
        style={{
          width: scale < 1 ? `${minWidth}px` : "100%",
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          position: scale < 1 ? "absolute" : "relative",
          top: 0,
          left: 0,
        }}
      >
        {children}
      </div>
    </div>
  );
}
