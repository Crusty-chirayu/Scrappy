"use client";

import React, { useState } from "react";
import {
  ALL_ICONS,
  IconName,
  AnimatedBellIcon,
  AnimatedCheckIcon,
  NudgeArrowIcon,
  SearchSpinnerIcon,
  ThemeRotateIcon,
  Badge,
  Input,
  Button,
} from "@scrappy/ui";

export default function DevIconsPage() {
  const [selectedSize, setSelectedSize] = useState<16 | 20 | 24 | 32>(24);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedName, setCopiedName] = useState<string | null>(null);
  const [isThemeDark, setIsThemeDark] = useState(true);
  const [bellRinging, setBellRinging] = useState(false);
  const [checkTrigger, setCheckTrigger] = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  const toggleTheme = (targetTheme: "dark" | "light") => {
    document.documentElement.setAttribute("data-theme", targetTheme);
    setIsThemeDark(targetTheme === "dark");
  };

  const handleCopy = (name: string) => {
    const componentName = ALL_ICONS[name as IconName]?.displayName || name;
    navigator.clipboard.writeText(`<${componentName} size={${selectedSize}} />`);
    setCopiedName(name);
    setTimeout(() => setCopiedName(null), 1500);
  };

  const triggerBell = () => {
    setBellRinging(false);
    setTimeout(() => setBellRinging(true), 10);
  };

  const triggerCheck = () => {
    setCheckTrigger(false);
    setTimeout(() => setCheckTrigger(true), 10);
  };

  const iconEntries = Object.entries(ALL_ICONS).filter(([name]) =>
    name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <main className="min-h-screen bg-[var(--surface-0)] text-[var(--text-1)] p-6 md:p-12 space-y-10 max-w-7xl mx-auto">
      {/* Page Header */}
      <header className="border-b border-[var(--border)] pb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-display tracking-tight text-[var(--text-1)]">
              Scrappy Icon System
            </h1>
            <Badge variant="accent">
              Slice A &bull; 24px Grid / 1.5 Stroke
            </Badge>
          </div>
          <p className="text-sm text-[var(--text-2)] mt-1.5 max-w-2xl">
            Custom precision vector icon set. Uniform 1.5 stroke width, consistent optical weight, currentColor inheritance, zero third-party icon libraries.
          </p>
        </div>

        {/* Global Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Theme switcher */}
          <div className="flex items-center bg-[var(--surface-1)] border border-[var(--border)] rounded-[var(--radius-md)] p-1">
            <button
              type="button"
              onClick={() => toggleTheme("dark")}
              className={`min-h-[44px] px-3.5 text-xs font-mono rounded-[var(--radius-sm)] transition-colors ${
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
              className={`min-h-[44px] px-3.5 text-xs font-mono rounded-[var(--radius-sm)] transition-colors ${
                !isThemeDark
                  ? "bg-[var(--surface-3)] text-[var(--text-1)] font-semibold"
                  : "text-[var(--text-2)] hover:text-[var(--text-1)]"
              }`}
            >
              Light (Paper)
            </button>
          </div>

          {/* Size switcher */}
          <div className="flex items-center bg-[var(--surface-1)] border border-[var(--border)] rounded-[var(--radius-md)] p-1">
            {([16, 20, 24, 32] as const).map((sz) => (
              <button
                key={sz}
                type="button"
                onClick={() => setSelectedSize(sz)}
                className={`min-h-[44px] px-3 text-xs font-mono rounded-[var(--radius-sm)] transition-colors ${
                  selectedSize === sz
                    ? "bg-[var(--color-accent)] text-[var(--color-accent-contrast)] font-bold"
                    : "text-[var(--text-2)] hover:text-[var(--text-1)]"
                }`}
              >
                {sz}px
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* SECTION 1: Micro-interactions Showcase */}
      <section aria-labelledby="micro-heading" className="space-y-4">
        <div>
          <h2 id="micro-heading" className="text-xl font-semibold text-[var(--text-1)] tracking-tight">
            1. Micro-Interactions &amp; Animated Glyphs
          </h2>
          <p className="text-xs text-[var(--text-2)] mt-0.5">
            Calm, physics-driven state transitions: bell vibration on notification, self-drawing checkmark, hover nudge, spinner morph, theme rotation.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Bell Ring */}
          <div className="p-5 rounded-[var(--radius-md)] bg-[var(--surface-1)] border border-[var(--border)] flex flex-col justify-between items-start gap-4">
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-mono text-[var(--text-2)]">Bell Ring</span>
              <AnimatedBellIcon size={24} ring={bellRinging} className="text-[var(--color-accent)]" />
            </div>
            <p className="text-xs text-[var(--text-3)]">
              Rings smoothly on arrival of price drop or threshold alerts.
            </p>
            <Button size="sm" variant="outline" onClick={triggerBell} fullWidth>
              Ring Bell
            </Button>
          </div>

          {/* Check Draw */}
          <div className="p-5 rounded-[var(--radius-md)] bg-[var(--surface-1)] border border-[var(--border)] flex flex-col justify-between items-start gap-4">
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-mono text-[var(--text-2)]">Check Draw</span>
              <AnimatedCheckIcon size={24} trigger={checkTrigger} className="text-[var(--color-success)]" />
            </div>
            <p className="text-xs text-[var(--text-3)]">
              SVG stroke-dashoffset animation executes on action confirmation.
            </p>
            <Button size="sm" variant="outline" onClick={triggerCheck} fullWidth>
              Replay Draw
            </Button>
          </div>

          {/* Arrow Nudge */}
          <div className="group p-5 rounded-[var(--radius-md)] bg-[var(--surface-1)] border border-[var(--border)] flex flex-col justify-between items-start gap-4 hover:border-[var(--border-strong)] transition-colors">
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-mono text-[var(--text-2)]">Hover Nudge</span>
              <NudgeArrowIcon size={24} direction="right" className="text-[var(--text-1)]" />
            </div>
            <p className="text-xs text-[var(--text-3)]">
              2px directional translation on link and next-step actions.
            </p>
            <div className="text-[11px] font-mono text-[var(--color-accent)] self-center pt-2">
              Hover card to test &rarr;
            </div>
          </div>

          {/* Search to Spinner Morph */}
          <div className="p-5 rounded-[var(--radius-md)] bg-[var(--surface-1)] border border-[var(--border)] flex flex-col justify-between items-start gap-4">
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-mono text-[var(--text-2)]">Search Morph</span>
              <SearchSpinnerIcon size={24} isLoading={isSearching} className="text-[var(--text-1)]" />
            </div>
            <p className="text-xs text-[var(--text-3)]">
              Lens seamlessly morphs to an inline spinner during live extraction.
            </p>
            <Button
              size="sm"
              variant={isSearching ? "primary" : "outline"}
              onClick={() => setIsSearching(!isSearching)}
              fullWidth
            >
              {isSearching ? "Stop Loading" : "Start Loading"}
            </Button>
          </div>

          {/* Theme Rotate */}
          <div className="p-5 rounded-[var(--radius-md)] bg-[var(--surface-1)] border border-[var(--border)] flex flex-col justify-between items-start gap-4">
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-mono text-[var(--text-2)]">Theme Rotate</span>
              <ThemeRotateIcon size={24} isDark={isThemeDark} className="text-[var(--color-accent)]" />
            </div>
            <p className="text-xs text-[var(--text-3)]">
              Rotates 180 degrees seamlessly when switching between palettes.
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => toggleTheme(isThemeDark ? "light" : "dark")}
              fullWidth
            >
              Toggle Mode
            </Button>
          </div>
        </div>
      </section>

      {/* SECTION 2: Complete Icon Inventory */}
      <section aria-labelledby="inventory-heading" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 id="inventory-heading" className="text-xl font-semibold text-[var(--text-1)] tracking-tight">
              2. Complete Icon Inventory ({Object.keys(ALL_ICONS).length} Icons)
            </h2>
            <p className="text-xs text-[var(--text-2)] mt-0.5">
              Click any icon to copy the component snippet. Rendered at {selectedSize}px on 24px coordinate geometry.
            </p>
          </div>

          <div className="w-full sm:w-72">
            <Input
              id="search-icons-input"
              label=""
              placeholder="Search icons (e.g. alert, price)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Icon Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {iconEntries.map(([name, IconComponent]) => (
            <button
              key={name}
              type="button"
              onClick={() => handleCopy(name)}
              className="p-4 rounded-[var(--radius-md)] bg-[var(--surface-1)] border border-[var(--border)] hover:border-[var(--border-strong)] hover:bg-[var(--surface-2)] transition-all flex flex-col items-center justify-center gap-3 text-center group focus-visible:ring-2 focus-visible:ring-[var(--border-focus)] outline-none min-h-[104px]"
            >
              <div className="h-9 flex items-center justify-center text-[var(--text-1)] group-hover:text-[var(--color-accent)] transition-colors">
                <IconComponent size={selectedSize} />
              </div>
              <div className="flex flex-col items-center">
                <span className="text-xs font-mono text-[var(--text-2)] group-hover:text-[var(--text-1)]">
                  {name}
                </span>
                {copiedName === name ? (
                  <span className="text-[10px] font-mono text-[var(--color-success)] mt-0.5">
                    Copied!
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-[var(--text-3)] mt-0.5">
                    {selectedSize}px
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>

        {iconEntries.length === 0 && (
          <div className="p-8 text-center border border-[var(--border)] rounded-[var(--radius-md)] bg-[var(--surface-1)]">
            <p className="text-sm text-[var(--text-2)]">No icons matching &ldquo;{searchQuery}&rdquo;</p>
          </div>
        )}
      </section>
    </main>
  );
}
