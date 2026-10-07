"use client";

import React, { useEffect, useState, useRef } from "react";
import { SunIcon, MoonIcon } from "@scrappy/ui";

/**
 * Signature Moment A2: Theme Toggle
 * - View Transition circular clip-path reveal originating directly from the button center
 * - 520ms out-expo cubic-bezier(0.16, 1, 0.3, 1)
 * - Fallback to 150ms fade where document.startViewTransition is not supported
 * - Icon morphs sun <-> moon in 240ms with smooth spring transition
 */
export function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
    const currentTheme = document.documentElement.getAttribute("data-theme") as "dark" | "light" | null;
    if (currentTheme === "dark" || currentTheme === "light") {
      setTheme(currentTheme);
    } else {
      const stored = localStorage.getItem("scrappy-theme") as "dark" | "light" | null;
      if (stored) {
        setTheme(stored);
        document.documentElement.setAttribute("data-theme", stored);
      } else {
        const pref = window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
        setTheme(pref);
        document.documentElement.setAttribute("data-theme", pref);
      }
    }
  }, []);

  const toggleTheme = (event: React.MouseEvent<HTMLButtonElement>) => {
    const next = theme === "dark" ? "light" : "dark";

    // Check for View Transition API support and user reduced-motion preference
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // TypeScript fallback type for document.startViewTransition
    const doc = document as unknown as {
      startViewTransition?: (updateCallback: () => void) => { ready: Promise<void> };
    };

    if (!doc.startViewTransition || prefersReducedMotion) {
      setTheme(next);
      localStorage.setItem("scrappy-theme", next);
      document.documentElement.setAttribute("data-theme", next);
      return;
    }

    // Get origin coordinates from click event or button center
    const rect = buttonRef.current?.getBoundingClientRect() ?? {
      left: event.clientX,
      top: event.clientY,
      width: 0,
      height: 0,
    };
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const transition = doc.startViewTransition(() => {
      setTheme(next);
      localStorage.setItem("scrappy-theme", next);
      document.documentElement.setAttribute("data-theme", next);
    });

    transition.ready.then(() => {
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`,
      ];

      document.documentElement.animate(
        {
          clipPath: clipPath,
        },
        {
          duration: 520,
          easing: "cubic-bezier(0.16, 1, 0.3, 1)",
          pseudoElement: "::view-transition-new(root)",
        }
      );
    });
  };

  return (
    <button
      ref={buttonRef}
      onClick={toggleTheme}
      type="button"
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] px-3 py-1.5 rounded-[var(--radius-sm)] text-xs font-mono border border-[var(--border)] bg-[var(--surface-1)] text-[var(--text-2)] hover:text-[var(--text-1)] hover:border-[var(--border-strong)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)] active:scale-[0.98]"
      title={`Current: ${mounted ? theme.toUpperCase() : "DARK"} (Click for circular reveal)`}
      data-testid="theme-toggle"
    >
      <div className="flex items-center gap-2">
        <span className="transition-transform duration-240 ease-[cubic-bezier(0.16,1,0.3,1)]">
          {theme === "dark" ? (
            <SunIcon size={16} className="text-[var(--color-accent)] animate-pulse" />
          ) : (
            <MoonIcon size={16} className="text-[var(--color-accent)]" />
          )}
        </span>
        <span className="text-[11px] font-medium tracking-wide uppercase">
          {theme === "dark" ? "Midnight" : "Daylight"}
        </span>
      </div>
    </button>
  );
}
