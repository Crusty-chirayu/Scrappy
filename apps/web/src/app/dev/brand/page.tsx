"use client";

import React, { useState } from "react";
import { SignalMark, SignalWordmark, SignalLogo } from "@scrappy/ui";
import { ProductSilhouette } from "@scrappy/ui";
import {
  SignalEmptySpot,
  SignalErrorSpot,
  SignalOfflineSpot,
  SignalNotFoundSpot,
  SignalOnboardingSpot,
  SignalVerifiedSpot,
} from "@scrappy/ui";

export default function DevBrandPage() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const sizes = [16, 24, 32, 48, 64, 128, 256];
  const categories = [
    "phone",
    "laptop",
    "audio",
    "watch",
    "tv",
    "shoe",
    "appliance",
    "grocery",
  ];

  React.useEffect(() => {
    const observer = new MutationObserver(() => {
      const current = document.documentElement.getAttribute("data-theme") as "dark" | "light";
      if (current && (current === "dark" || current === "light")) {
        setTheme(current);
      }
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    const initial = document.documentElement.getAttribute("data-theme") as "dark" | "light";
    if (initial) setTheme(initial);
    return () => observer.disconnect();
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("scrappy-theme", next);
  };

  return (
    <div
      className="min-h-screen bg-[var(--surface-0)] text-[var(--text-1)] p-8 transition-colors duration-200"
    >
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header Controls */}
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-6">
          <div>
            <h1 className="text-3xl font-display font-semibold text-[var(--text-1)]">
              Signal Brand System & Asset Showcase
            </h1>
            <p className="text-sm font-mono text-[var(--text-2)] mt-1">
              Geometric ribbon &apos;S&apos; resolving to precision signal node (48px grid)
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono uppercase text-[var(--text-3)]">Preview Theme:</span>
            <button
              id="brand-theme-toggle"
              type="button"
              onClick={toggleTheme}
              className="px-3 py-1.5 rounded-md border border-[var(--border)] bg-[var(--surface-2)] text-xs font-mono text-[var(--text-1)] hover:bg-[var(--surface-3)] transition-colors"
            >
              Toggle {theme === "dark" ? "Light" : "Dark"}
            </button>
          </div>
        </div>

        {/* 1. Brand Mark Across Scales (16 to 256px) */}
        <section className="space-y-4">
          <h2 className="text-xl font-display font-medium text-[var(--text-1)]">
            1. Signal Mark Scale (16px – 256px)
          </h2>
          <div className="flex flex-wrap items-end gap-6 bg-[var(--surface-1)] p-6 rounded-xl border border-[var(--border)] overflow-hidden">
            {sizes.map((sz) => (
              <div key={sz} className="flex flex-col items-center gap-3">
                <div className="p-2 flex items-center justify-center bg-[var(--surface-0)] rounded-lg border border-[var(--border-subtle)] max-w-full overflow-hidden">
                  <SignalMark size={sz} className="max-w-full h-auto" />
                </div>
                <span className="text-[11px] font-mono text-[var(--text-3)]">{sz}px</span>
              </div>
            ))}
          </div>
        </section>

        {/* 2. Wordmark and Lockup Variants */}
        <section className="space-y-4">
          <h2 className="text-xl font-display font-medium text-[var(--text-1)]">
            2. Lockup Variants & Monochrome Fallbacks
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-[var(--surface-1)] rounded-xl border border-[var(--border)] space-y-3">
              <span className="text-xs font-mono uppercase text-[var(--text-3)]">Horizontal Lockup</span>
              <div className="pt-2">
                <SignalLogo variant="lockup" size={32} />
              </div>
            </div>

            <div className="p-6 bg-[var(--surface-1)] rounded-xl border border-[var(--border)] space-y-3">
              <span className="text-xs font-mono uppercase text-[var(--text-3)]">Outlined Wordmark Only</span>
              <div className="pt-2">
                <SignalWordmark height={22} />
              </div>
            </div>

            <div className="p-6 bg-[var(--surface-1)] rounded-xl border border-[var(--border)] space-y-3">
              <span className="text-xs font-mono uppercase text-[var(--text-3)]">Monochrome (High Contrast)</span>
              <div className="pt-2">
                <SignalLogo variant="lockup" size={32} monochrome />
              </div>
            </div>
          </div>
        </section>

        {/* 3. Spot Illustrations (120px) */}
        <section className="space-y-4">
          <h2 className="text-xl font-display font-medium text-[var(--text-1)]">
            3. Spot Illustrations (120px — Signal Node Grammar)
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 bg-[var(--surface-1)] p-6 rounded-xl border border-[var(--border)]">
            <div className="flex flex-col items-center gap-2">
              <SignalEmptySpot size={100} />
              <span className="text-[11px] font-mono text-[var(--text-2)]">Empty State</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <SignalErrorSpot size={100} />
              <span className="text-[11px] font-mono text-[var(--text-2)]">Error / Alert</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <SignalOfflineSpot size={100} />
              <span className="text-[11px] font-mono text-[var(--text-2)]">Offline Radar</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <SignalNotFoundSpot size={100} />
              <span className="text-[11px] font-mono text-[var(--text-2)]">404 Matrix</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <SignalOnboardingSpot size={100} />
              <span className="text-[11px] font-mono text-[var(--text-2)]">Onboarding</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <SignalVerifiedSpot size={100} />
              <span className="text-[11px] font-mono text-[var(--text-2)]">Verified Node</span>
            </div>
          </div>
        </section>

        {/* 4. Product Category Silhouettes (4:3) */}
        <section className="space-y-4">
          <h2 className="text-xl font-display font-medium text-[var(--text-1)]">
            4. Curated Indian Market Category Silhouettes (4:3 Tiles)
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <div
                key={cat}
                className="p-3 bg-[var(--surface-1)] rounded-xl border border-[var(--border)] flex flex-col gap-2.5 items-center"
              >
                <div className="w-full aspect-[4/3]">
                  <ProductSilhouette category={cat} />
                </div>
                <span className="text-xs font-mono uppercase text-[var(--text-2)] capitalize">
                  {cat}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
