"use client";

import { useEffect, useRef, useState } from "react";

export interface AmbientMeshProps {
  className?: string;
  variant?: "mesh" | "price-nodes";
}

export function AmbientMesh({ className = "", variant = "mesh" }: AmbientMeshProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // IntersectionObserver to pause animation when off-screen
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry) {
          setIsPaused(!entry.isIntersecting);
        }
      },
      { threshold: 0.05 }
    );
    observer.observe(el);

    // Pause on document hidden / tab switch to guarantee 0% background CPU
    const handleVisibility = () => {
      if (document.hidden) {
        setIsPaused(true);
      } else {
        // Re-check bounding client rect
        const rect = el.getBoundingClientRect();
        const inView = rect.top < window.innerHeight && rect.bottom > 0;
        setIsPaused(!inView);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden select-none ${className}`}
    >
      {/* Drifting subtle gradient mesh: transform & opacity only, GPU accelerated */}
      <div
        style={{
          animationPlayState: isPaused ? "paused" : "running",
          willChange: "transform",
        }}
        className="absolute -top-[25%] -left-[20%] w-[140%] h-[140%] opacity-[0.07] dark:opacity-[0.14] animate-[ambient-drift_30s_cubic-bezier(0.4,0,0.6,1)_infinite]"
      >
        <div className="absolute top-[20%] left-[25%] w-[450px] h-[450px] rounded-full bg-[var(--color-accent)] blur-[100px]" />
        <div className="absolute top-[40%] right-[20%] w-[400px] h-[400px] rounded-full bg-[var(--color-price-down)] blur-[120px]" />
      </div>

      {variant === "price-nodes" && (
        <svg
          className="absolute inset-0 w-full h-full opacity-10 dark:opacity-20"
          style={{ animationPlayState: isPaused ? "paused" : "running" }}
        >
          <line x1="10%" y1="30%" x2="40%" y2="20%" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="40%" y1="20%" x2="80%" y2="50%" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
          <circle cx="10%" cy="30%" r="3" fill="var(--color-accent)" />
          <circle cx="40%" cy="20%" r="3" fill="var(--color-price-down)" />
          <circle cx="80%" cy="50%" r="3" fill="var(--color-accent)" />
        </svg>
      )}
    </div>
  );
}
