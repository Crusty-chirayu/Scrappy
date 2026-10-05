"use client";

import { useEffect, useState } from "react";

export interface ScrollProgressBarProps {
  className?: string;
  heightPx?: number;
}

export function ScrollProgressBar({ className = "", heightPx = 2 }: ScrollProgressBarProps) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [hasCssScrollTimeline, setHasCssScrollTimeline] = useState(false);

  useEffect(() => {
    // Check if browser natively supports animation-timeline: scroll()
    if (typeof CSS !== "undefined" && CSS.supports && CSS.supports("animation-timeline", "scroll()")) {
      setHasCssScrollTimeline(true);
      return;
    }

    // Fallback: passive scroll listener
    const onScroll = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        setScrollProgress(Math.min(scrollY / docHeight, 1));
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      role="progressbar"
      aria-label="Page scroll progress"
      aria-valuenow={Math.round(scrollProgress * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
      className={`fixed top-0 left-0 right-0 z-50 pointer-events-none ${className}`}
      style={{ height: `${heightPx}px` }}
    >
      <div
        className={`h-full bg-[var(--color-accent)] ${
          hasCssScrollTimeline ? "scroll-progress-fill" : "transition-transform duration-75"
        }`}
        style={{
          transformOrigin: "0% 50%",
          transform: hasCssScrollTimeline ? undefined : `scaleX(${scrollProgress})`,
        }}
      />
    </div>
  );
}
