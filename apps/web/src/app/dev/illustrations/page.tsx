"use client";

import React, { useState } from "react";
import {
  ScrappyLogo,
  ScrappyMark,
  EmptyStateIllustration,
  ErrorStateIllustration,
  OfflineStateIllustration,
  NotFoundIllustration,
  Badge,
  Button,
} from "@scrappy/ui";

export default function DevIllustrationsPage() {
  const [isThemeDark, setIsThemeDark] = useState(true);

  const toggleTheme = (targetTheme: "dark" | "light") => {
    document.documentElement.setAttribute("data-theme", targetTheme);
    setIsThemeDark(targetTheme === "dark");
  };

  return (
    <main className="min-h-screen bg-[var(--surface-0)] text-[var(--text-1)] p-6 md:p-12 space-y-12 max-w-7xl mx-auto">
      {/* Page Header */}
      <header className="border-b border-[var(--border)] pb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-display tracking-tight text-[var(--text-1)]">
              Scrappy Brand &amp; Illustration Architecture
            </h1>
            <Badge variant="accent">
              Slice A &bull; Geometric Construction
            </Badge>
          </div>
          <p className="text-sm text-[var(--text-2)] mt-1.5 max-w-2xl">
            Brand identity mark constructed on a 32x32 coordinate reticle. Abstract SVG illustration system sharing 1.5 stroke geometry and design token colors.
          </p>
        </div>

        {/* Theme Switcher */}
        <div className="flex items-center bg-[var(--surface-1)] border border-[var(--border)] rounded-[var(--radius-md)] p-1">
          <button
            type="button"
            onClick={() => toggleTheme("dark")}
            className={`min-h-[44px] px-4 text-xs font-mono rounded-[var(--radius-sm)] transition-colors ${
              isThemeDark
                ? "bg-[var(--surface-3)] text-[var(--text-1)] font-semibold"
                : "text-[var(--text-2)] hover:text-[var(--text-1)]"
            }`}
          >
            Dark (Ink)
          </button>
          <button
            type="button"
            onClick={() => toggleTheme("light")}
            className={`min-h-[44px] px-4 text-xs font-mono rounded-[var(--radius-sm)] transition-colors ${
              !isThemeDark
                ? "bg-[var(--surface-3)] text-[var(--text-1)] font-semibold"
                : "text-[var(--text-2)] hover:text-[var(--text-1)]"
            }`}
          >
            Light (Paper)
          </button>
        </div>
      </header>

      {/* SECTION 1: Brand Mark Construction */}
      <section aria-labelledby="brand-heading" className="space-y-6">
        <div>
          <h2 id="brand-heading" className="text-xl font-semibold text-[var(--text-1)] tracking-tight">
            1. Brand Identity Mark &amp; Wordmark
          </h2>
          <p className="text-xs text-[var(--text-2)] mt-0.5">
            Constructed on a 32x32 master grid with 4px corner radii, reticle crosshairs, upward price discovery vector, and a central telemetry coordinate node.
          </p>
        </div>

        {/* Logo Variants Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Combined Logo */}
          <div className="p-6 rounded-[var(--radius-md)] bg-[var(--surface-1)] border border-[var(--border)] space-y-4">
            <span className="text-xs font-mono text-[var(--text-2)]">Combined (Mark + Wordmark)</span>
            <div className="p-4 bg-[var(--surface-2)] rounded-[var(--radius-sm)] flex items-center justify-center min-h-[96px]">
              <ScrappyLogo variant="combined" size={32} />
            </div>
            <p className="text-xs text-[var(--text-3)]">
              Primary brand presentation used in navigation bars and public headers.
            </p>
          </div>

          {/* Mark Only (Various Scales) */}
          <div className="p-6 rounded-[var(--radius-md)] bg-[var(--surface-1)] border border-[var(--border)] space-y-4">
            <span className="text-xs font-mono text-[var(--text-2)]">Mark Only (16px, 24px, 32px, 48px)</span>
            <div className="p-4 bg-[var(--surface-2)] rounded-[var(--radius-sm)] flex items-center justify-center gap-5 min-h-[96px]">
              <ScrappyMark size={16} />
              <ScrappyMark size={24} />
              <ScrappyMark size={32} />
              <ScrappyMark size={48} />
            </div>
            <p className="text-xs text-[var(--text-3)]">
              Tested for sharp legibility from 16px favicon/status sizes up to 48px avatars.
            </p>
          </div>

          {/* Monochrome Mode */}
          <div className="p-6 rounded-[var(--radius-md)] bg-[var(--surface-1)] border border-[var(--border)] space-y-4">
            <span className="text-xs font-mono text-[var(--text-2)]">Monochrome (Inherits CurrentColor)</span>
            <div className="p-4 bg-[var(--surface-2)] rounded-[var(--radius-sm)] flex items-center justify-center gap-6 min-h-[96px] text-[var(--text-2)]">
              <ScrappyLogo variant="combined" size={32} monochrome />
            </div>
            <p className="text-xs text-[var(--text-3)]">
              Pure stroke &amp; fill adaptation for printing, single-ink stamps, and footer badges.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 2: Abstract SVG Illustrations */}
      <section aria-labelledby="illustrations-heading" className="space-y-6">
        <div>
          <h2 id="illustrations-heading" className="text-xl font-semibold text-[var(--text-1)] tracking-tight">
            2. Abstract State Illustrations
          </h2>
          <p className="text-xs text-[var(--text-2)] mt-0.5">
            Calm, technical drawings replacing cartoon stock art. Built with coordinate grids, price trajectories, and semantic token signals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Empty State */}
          <div className="p-6 rounded-[var(--radius-md)] bg-[var(--surface-1)] border border-[var(--border)] flex flex-col items-center text-center space-y-4">
            <div className="py-4">
              <EmptyStateIllustration width={240} height={160} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[var(--text-1)]">No Price History Recorded</h3>
              <p className="text-xs text-[var(--text-2)] mt-1 max-w-sm">
                Unpopulated coordinate ledger waiting for telemetry feed or first retailer extraction cycle.
              </p>
            </div>
            <Button size="sm" variant="outline">
              Initialize Extraction
            </Button>
          </div>

          {/* Error State */}
          <div className="p-6 rounded-[var(--radius-md)] bg-[var(--surface-1)] border border-[var(--border)] flex flex-col items-center text-center space-y-4">
            <div className="py-4">
              <ErrorStateIllustration width={240} height={160} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[var(--text-1)]">Telemetry Feed Disconnected</h3>
              <p className="text-xs text-[var(--text-2)] mt-1 max-w-sm">
                Discontinuous price line with pinpoint fault indicator. Source adapter circuit breaker active.
              </p>
            </div>
            <Button size="sm" variant="outline">
              Retry Source Ping
            </Button>
          </div>

          {/* Offline State */}
          <div className="p-6 rounded-[var(--radius-md)] bg-[var(--surface-1)] border border-[var(--border)] flex flex-col items-center text-center space-y-4">
            <div className="py-4">
              <OfflineStateIllustration width={240} height={160} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[var(--text-1)]">Signal Mesh Offline</h3>
              <p className="text-xs text-[var(--text-2)] mt-1 max-w-sm">
                Local telemetry receiver disconnected from upstream price feed. Cached historical rates displayed.
              </p>
            </div>
            <Button size="sm" variant="outline">
              Check Network Status
            </Button>
          </div>

          {/* 404 Not Found State */}
          <div className="p-6 rounded-[var(--radius-md)] bg-[var(--surface-1)] border border-[var(--border)] flex flex-col items-center text-center space-y-4">
            <div className="py-4">
              <NotFoundIllustration width={240} height={160} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[var(--text-1)]">Coordinate Out of Bounds</h3>
              <p className="text-xs text-[var(--text-2)] mt-1 max-w-sm">
                The requested product node or extraction schema could not be located in the catalog index.
              </p>
            </div>
            <Button size="sm" variant="outline">
              Return to Catalog
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
