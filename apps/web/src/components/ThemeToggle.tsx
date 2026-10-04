"use client";

import React, { useEffect, useState } from "react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    // Read stored theme or system preference
    const stored = localStorage.getItem("scrappy-theme");
    if (stored === "light" || stored === "dark") {
      setTheme(stored);
      document.documentElement.setAttribute("data-theme", stored);
    } else {
      document.documentElement.setAttribute("data-theme", "dark");
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("scrappy-theme", next);
    document.documentElement.setAttribute("data-theme", next);
  };

  return (
    <button
      onClick={toggleTheme}
      type="button"
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] px-2.5 py-1 rounded text-xs font-mono border border-[#262E3C] bg-[#0F1217] text-[#98A2B3] hover:text-white transition-colors"
      title={`Current: ${theme.toUpperCase()} (Click to toggle)`}
      data-testid="theme-toggle"
    >
      {theme === "dark" ? (
        <span className="flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 text-[#C6F135]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <span className="hidden lg:inline text-[11px]">INK</span>
        </span>
      ) : (
        <span className="flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 text-[#5E7A00]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
          <span className="hidden lg:inline text-[11px]">PAPER</span>
        </span>
      )}
    </button>
  );
}
