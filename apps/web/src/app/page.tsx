"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  SearchIcon,
  CheckIcon,
  ShieldIcon,
  ArrowRight,
  TrendingDown,
  ChevronRight,
  Activity,
  Layers,
  Database,
} from "lucide-react";
import { ProductSilhouette } from "@scrappy/ui";

/**
 * SIGNATURE MOMENT A1: LANDING "PRICE RADAR" HERO
 * - 0ms: dot-grid fades in, headline words rise with 60ms stagger
 * - 300ms: search input fades + scales .98 -> 1, example chips stagger
 * - 500ms: step-line draws left -> right with leading signal dot
 * - 1100-2200ms: 4 retailer chips arrive from right on spring arcs
 * - 2400ms: lowest chip highlighted with ring, deal verdict stamps in
 * - 3200ms+: idle pulse every 2.4s, live price roll
 */

const EXAMPLE_SEARCH_QUERIES = [
  "iPhone 15",
  "Sony WH-1000XM5",
  "1.5 ton split AC",
];

const RETAILER_CHIPS = [
  { name: "Amazon India", price: "₹69,999", isLowest: true, verified: "2m ago" },
  { name: "Flipkart", price: "₹71,490", isLowest: false, verified: "4m ago" },
  { name: "Croma", price: "₹72,990", isLowest: false, verified: "12m ago" },
  { name: "Reliance Digital", price: "₹72,499", isLowest: false, verified: "8m ago" },
];

export default function LandingPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [stage, setStage] = useState(0);

  useEffect(() => {
    // Stage orchestration
    const t1 = setTimeout(() => setStage(1), 300);
    const t2 = setTimeout(() => setStage(2), 500);
    const t3 = setTimeout(() => setStage(3), 1100);
    const t4 = setTimeout(() => setStage(4), 2400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-[var(--surface-0)] text-[var(--text-1)] overflow-hidden">
      {/* Background radial gradient glow (pure CSS, no large blur filters) */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full opacity-35"
        style={{
          background: "radial-gradient(circle, rgba(108, 92, 255, 0.22) 0%, rgba(56, 232, 255, 0.08) 45%, transparent 70%)",
        }}
      />

      {/* 1. HERO SECTION */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-12 md:pt-20 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Headline, search, chips */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--surface-1)] border border-[var(--border-strong)] text-xs font-mono text-[var(--text-2)] shadow-[var(--elevation-1)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)] animate-pulse" />
                <span>Indexed 500+ Indian products</span>
                <span className="text-[var(--text-3)]">·</span>
                <span className="text-[var(--color-accent)] font-semibold">Demo data</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-semibold tracking-tight text-[var(--text-1)] leading-[1.05]">
                Every price. <span className="font-serif italic font-normal text-[var(--color-accent)]">One</span> truth.
              </h1>

              <p className="text-base sm:text-lg text-[var(--text-2)] max-w-xl font-sans">
                Live prices, matched and verified across Indian stores.
              </p>
            </div>

            {/* Hero Search Box */}
            <div
              className={`transition-all duration-500 transform ${
                stage >= 1 ? "opacity-100 scale-100" : "opacity-0 scale-[0.98]"
              }`}
            >
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (searchQuery.trim()) {
                    window.location.href = `/compare?q=${encodeURIComponent(searchQuery.trim())}`;
                  }
                }}
                className="relative flex items-center shadow-[var(--elevation-2)]"
              >
                <div className="absolute left-4 text-[var(--text-3)] pointer-events-none">
                  <SearchIcon size={18} />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search a product, model or paste a link"
                  className="w-full h-[52px] pl-11 pr-28 rounded-lg bg-[var(--surface-1)] border border-[var(--border-strong)] focus:border-[var(--border-focus)] focus:ring-2 focus:ring-[var(--border-focus)]/30 text-sm font-sans text-[var(--text-1)] placeholder-[var(--text-3)] outline-none transition-all"
                />
                <button
                  type="submit"
                  className="absolute right-2 h-9 px-4 rounded-md bg-[var(--color-accent)] hover:opacity-95 text-[var(--color-accent-contrast)] text-xs font-mono font-medium transition-opacity flex items-center gap-1.5 shadow-sm"
                >
                  <span>Search</span>
                  <ArrowRight size={13} />
                </button>
              </form>

              {/* Example Chips */}
              <div className="flex flex-wrap items-center gap-2 mt-3 text-xs font-mono">
                <span className="text-[var(--text-3)]">Popular:</span>
                {EXAMPLE_SEARCH_QUERIES.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => {
                      setSearchQuery(q);
                      window.location.href = `/compare?q=${encodeURIComponent(q)}`;
                    }}
                    className="px-2.5 py-1 rounded-full bg-[var(--surface-1)] border border-[var(--border)] hover:border-[var(--border-strong)] text-[var(--text-2)] hover:text-[var(--text-1)] transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Signature Moment A1 "Price Radar" Visual */}
          <div className="lg:col-span-6">
            <div className="relative p-6 sm:p-8 rounded-2xl bg-[var(--surface-1)] border border-[var(--border-strong)] shadow-[var(--elevation-2)] space-y-6 overflow-hidden">
              {/* Product header inside radar */}
              <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)]">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-9 rounded-md overflow-hidden border border-[var(--border)] bg-[var(--surface-2)] flex items-center justify-center p-0.5">
                    <ProductSilhouette category="phone" size={44} />
                  </div>
                  <div>
                    <h2 className="text-sm font-sans font-semibold text-[var(--text-1)]">
                      Apple iPhone 15 (128 GB)
                    </h2>
                    <span className="text-xs font-mono text-[var(--text-3)]">
                      Model A3090 · 4 Live Stores
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[var(--surface-2)] font-mono text-xs text-[var(--color-success)] font-semibold border border-[var(--border-subtle)]">
                  <TrendingDown size={14} />
                  <span>-7.8%</span>
                </div>
              </div>

              {/* Animated SVG Step-line Chart */}
              <div className="relative h-44 w-full bg-[var(--surface-0)] rounded-xl border border-[var(--border)] p-4 flex flex-col justify-between">
                <div className="flex justify-between text-[11px] font-mono text-[var(--text-3)]">
                  <span>90-Day Range</span>
                  <span className="text-[var(--text-2)] font-medium">Median: ₹74,200</span>
                </div>

                {/* Step line graphic */}
                <svg className="w-full h-24 overflow-visible" viewBox="0 0 400 80" preserveAspectRatio="none">
                  {/* Hairline axes */}
                  <line x1="0" y1="20" x2="400" y2="20" stroke="var(--border)" strokeDasharray="3 3" />
                  <line x1="0" y1="60" x2="400" y2="60" stroke="var(--border)" strokeDasharray="3 3" />

                  {/* Step path */}
                  <path
                    d="M 0 20 L 90 20 L 90 35 L 180 35 L 180 25 L 280 25 L 280 58 L 400 58"
                    fill="none"
                    stroke="var(--color-accent)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`transition-all duration-1000 ${
                      stage >= 2 ? "opacity-100 stroke-dashoffset-0" : "opacity-0"
                    }`}
                  />

                  {/* Live pulsing coordinate node */}
                  {stage >= 2 && (
                    <g transform="translate(400, 58)">
                      <circle cx="0" cy="0" r="10" fill="var(--color-accent)" opacity="0.25" className="animate-ping" />
                      <circle cx="0" cy="0" r="5" fill="var(--color-accent)" stroke="var(--surface-0)" strokeWidth="2" />
                    </g>
                  )}
                </svg>

                <div className="flex justify-between items-center text-[11px] font-mono text-[var(--text-3)]">
                  <span>Jul 09</span>
                  <span>Aug 18</span>
                  <span className="text-[var(--color-accent)] font-semibold">Today (Live)</span>
                </div>
              </div>

              {/* Arriving Retailer Chips */}
              <div className="grid grid-cols-2 gap-2.5">
                {RETAILER_CHIPS.map((chip, idx) => (
                  <div
                    key={chip.name}
                    className={`p-3 rounded-lg border transition-all duration-500 flex items-center justify-between ${
                      stage >= 3 ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
                    } ${
                      chip.isLowest && stage >= 4
                        ? "bg-[var(--surface-2)] border-[var(--color-success)] ring-1 ring-[var(--color-success)]/40 shadow-sm"
                        : "bg-[var(--surface-0)] border-[var(--border)]"
                    }`}
                    style={{ transitionDelay: `${idx * 120}ms` }}
                  >
                    <div>
                      <div className="text-xs font-medium text-[var(--text-1)]">{chip.name}</div>
                      <div className="text-[10px] font-mono text-[var(--text-3)]">{chip.verified}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-mono font-bold tabular-nums text-[var(--text-1)]">
                        {chip.price}
                      </div>
                      {chip.isLowest && stage >= 4 && (
                        <span className="text-[9px] font-mono text-[var(--color-success)] font-semibold uppercase">
                          Best Offer
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Deal Verdict Stamp */}
              <div
                className={`transition-all duration-400 p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                  stage >= 4 ? "opacity-100 scale-100" : "opacity-0 scale-95"
                }`}
              >
                <div className="flex items-center gap-2">
                  <ShieldIcon size={16} className="text-[var(--color-success)] shrink-0" />
                  <span className="text-xs font-medium text-[var(--text-1)]">
                    Good deal. ₹4,200 below the 90-day median.
                  </span>
                </div>
                <Link
                  href="/compare"
                  className="text-xs font-mono text-[var(--color-accent)] hover:underline inline-flex items-center gap-1 shrink-0 self-end sm:self-auto"
                >
                  <span>Explore</span>
                  <ChevronRight size={13} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. BENTO GRID: THREE VIEWS ON ONE PLATFORM */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 border-t border-[var(--border-subtle)] space-y-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-display font-semibold text-[var(--text-1)]">
            One platform. Three operational views.
          </h2>
          <p className="text-sm font-sans text-[var(--text-2)] mt-1">
            Deterministic data engine powers consumer comparison, merchant intelligence, and scraping infrastructure.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Bento Tile 1: Compare */}
          <Link
            href="/compare"
            className="group p-6 rounded-2xl bg-[var(--surface-1)] border border-[var(--border)] hover:border-[var(--color-accent)]/50 hover:ring-1 hover:ring-[var(--border-strong)] transition-all space-y-4 hover:shadow-[var(--elevation-2)]"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-[var(--color-accent)]">
                Compare View
              </span>
              <Activity size={18} className="text-[var(--text-3)] group-hover:text-[var(--text-1)] transition-colors" />
            </div>
            <h3 className="text-lg font-display font-semibold text-[var(--text-1)]">
              Cross-store price parity
            </h3>
            <p className="text-xs font-sans text-[var(--text-2)] leading-relaxed">
              Scan identical products across Flipkart, Amazon, and Croma with real-time stock and delivery telemetry.
            </p>
            <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs font-mono text-[var(--text-3)] group-hover:text-[var(--text-1)]">
              <span>500+ Canonical Items</span>
              <ChevronRight size={14} />
            </div>
          </Link>

          {/* Bento Tile 2: Intelligence */}
          <Link
            href="/intelligence"
            className="group p-6 rounded-2xl bg-[var(--surface-1)] border border-[var(--border)] hover:border-[var(--color-accent)]/50 hover:ring-1 hover:ring-[var(--border-strong)] transition-all space-y-4 hover:shadow-[var(--elevation-2)]"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-[var(--color-accent)]">
                Intelligence View
              </span>
              <Layers size={18} className="text-[var(--text-3)] group-hover:text-[var(--text-1)] transition-colors" />
            </div>
            <h3 className="text-lg font-display font-semibold text-[var(--text-1)]">
              Market gap telemetry
            </h3>
            <p className="text-xs font-sans text-[var(--text-2)] leading-relaxed">
              Spot undercut opportunities, competitor price movements, and automated repricing simulations.
            </p>
            <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs font-mono text-[var(--text-3)] group-hover:text-[var(--text-1)]">
              <span>Undercut Radar</span>
              <ChevronRight size={14} />
            </div>
          </Link>

          {/* Bento Tile 3: Extract */}
          <Link
            href="/extract"
            className="group p-6 rounded-2xl bg-[var(--surface-1)] border border-[var(--border)] hover:border-[var(--color-accent)]/50 hover:ring-1 hover:ring-[var(--border-strong)] transition-all space-y-4 hover:shadow-[var(--elevation-2)]"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-[var(--color-accent)]">
                Extract View
              </span>
              <Database size={18} className="text-[var(--text-3)] group-hover:text-[var(--text-1)] transition-colors" />
            </div>
            <h3 className="text-lg font-display font-semibold text-[var(--text-1)]">
              Point-and-capture scraping
            </h3>
            <p className="text-xs font-sans text-[var(--text-2)] leading-relaxed">
              Visual 3-step extraction workbench with instant confidence verification and webhook broadcasts.
            </p>
            <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs font-mono text-[var(--text-3)] group-hover:text-[var(--text-1)]">
              <span>Interactive Studio</span>
              <ChevronRight size={14} />
            </div>
          </Link>
        </div>
      </section>

      {/* 3. "HOW WE KNOW" TRUST STRIP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 border-t border-[var(--border-subtle)]">
        <div className="p-8 rounded-2xl bg-[var(--surface-1)] border border-[var(--border)] grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-[var(--color-accent)]">
              Data Provenance
            </span>
            <h2 className="text-xl font-display font-semibold text-[var(--text-1)] mt-1">
              How we know
            </h2>
            <p className="text-xs text-[var(--text-3)] font-sans mt-1">
              Every data point includes source origin, timestamp, and confidence rating.
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono font-semibold text-[var(--text-1)]">
              <CheckIcon size={14} className="text-[var(--color-success)]" />
              <span>1. Multi-Store Ingest</span>
            </div>
            <p className="text-[11px] font-sans text-[var(--text-3)]">
              Responsible HTTP adapters respect robots.txt and store terms.
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono font-semibold text-[var(--text-1)]">
              <ShieldIcon size={14} className="text-[var(--color-accent)]" />
              <span>2. Entity Resolution</span>
            </div>
            <p className="text-[11px] font-sans text-[var(--text-3)]">
              Deterministic EAN and title normalization prevent false matches.
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono font-semibold text-[var(--text-1)]">
              <Activity size={14} className="text-[var(--color-info)]" />
              <span>3. Price Graph History</span>
            </div>
            <p className="text-[11px] font-sans text-[var(--text-3)]">
              Verified price points stored permanently with audit signatures.
            </p>
          </div>
        </div>
      </section>

      {/* 4. PRICING ROW: THREE TIERS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 border-t border-[var(--border-subtle)] space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-display font-semibold text-[var(--text-1)]">
            Simple, transparent pricing.
          </h2>
          <p className="text-xs font-mono text-[var(--text-3)]">
            Start free, scale into automated business intelligence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto items-stretch">
          {/* Free Tier */}
          <div className="p-6 rounded-2xl bg-[var(--surface-1)] border border-[var(--border)] flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-base font-sans font-bold text-[var(--text-1)]">Free</h3>
                <div className="text-2xl font-mono font-bold text-[var(--text-1)]">₹0</div>
                <span className="text-[11px] font-mono text-[var(--text-3)]">Forever free</span>
              </div>
              <ul className="text-xs font-mono text-[var(--text-2)] space-y-2">
                <li className="flex items-center gap-2">✓ 20 Active Product Watches</li>
                <li className="flex items-center gap-2">✓ 6-hour refresh rate</li>
                <li className="flex items-center gap-2">✓ Email price drop alerts</li>
              </ul>
            </div>
            <Link
              href="/compare"
              className="block w-full py-2.5 text-center rounded-lg bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-xs font-mono text-[var(--text-1)] transition-colors border border-[var(--border)] font-medium"
            >
              Start Free
            </Link>
          </div>

          {/* Pro Tier (Featured) */}
          <div className="p-6 rounded-2xl bg-[var(--surface-1)] border-2 border-[var(--color-accent)] relative flex flex-col justify-between space-y-6 shadow-[var(--elevation-2)]">
            <div className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full bg-[var(--color-accent)] text-[var(--color-accent-contrast)] text-[10px] font-mono font-bold uppercase">
              Popular
            </div>
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-base font-sans font-bold text-[var(--text-1)]">Pro</h3>
                <div className="text-2xl font-mono font-bold text-[var(--text-1)]">₹1,499<span className="text-xs font-normal text-[var(--text-3)]">/mo</span></div>
                <span className="text-[11px] font-mono text-[var(--text-3)]">Billed monthly</span>
              </div>
              <ul className="text-xs font-mono text-[var(--text-2)] space-y-2">
                <li className="flex items-center gap-2">✓ 250 Active Product Watches</li>
                <li className="flex items-center gap-2">✓ 15-minute refresh rate</li>
                <li className="flex items-center gap-2">✓ Intelligence Market Board</li>
                <li className="flex items-center gap-2">✓ Visual Extract Studio</li>
              </ul>
            </div>
            <Link
              href="/pricing"
              className="block w-full py-2.5 text-center rounded-lg bg-[var(--color-accent)] hover:opacity-95 text-xs font-mono text-[var(--color-accent-contrast)] font-medium transition-opacity"
            >
              Upgrade to Pro
            </Link>
          </div>

          {/* Business Tier */}
          <div className="p-6 rounded-2xl bg-[var(--surface-1)] border border-[var(--border)] flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-base font-sans font-bold text-[var(--text-1)]">Business</h3>
                <div className="text-2xl font-mono font-bold text-[var(--text-1)]">₹4,999<span className="text-xs font-normal text-[var(--text-3)]">/mo</span></div>
                <span className="text-[11px] font-mono text-[var(--text-3)]">Dedicated pipelines</span>
              </div>
              <ul className="text-xs font-mono text-[var(--text-2)] space-y-2">
                <li className="flex items-center gap-2">✓ 2,000 Active Product Watches</li>
                <li className="flex items-center gap-2">✓ 5-minute real-time polling</li>
                <li className="flex items-center gap-2">✓ HMAC signed webhooks</li>
                <li className="flex items-center gap-2">✓ Multi-seat workspaces</li>
              </ul>
            </div>
            <Link
              href="/pricing"
              className="block w-full py-2.5 text-center rounded-lg bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-xs font-mono text-[var(--text-1)] transition-colors border border-[var(--border)] font-medium"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </section>

      {/* 5. COMPACT FOOTER */}
      <footer className="border-t border-[var(--border-subtle)] bg-[var(--surface-1)] px-4 sm:px-6 py-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[var(--text-3)]">
          <div className="flex items-center gap-2">
            <span className="text-[var(--text-1)] font-bold">SCRAPPY</span>
            <span>— The Web Product &amp; Price Graph</span>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/compare" className="hover:text-[var(--text-1)] transition-colors">Compare</Link>
            <Link href="/intelligence" className="hover:text-[var(--text-1)] transition-colors">Intelligence</Link>
            <Link href="/extract" className="hover:text-[var(--text-1)] transition-colors">Extract</Link>
            <Link href="/legal/terms" className="hover:text-[var(--text-1)] transition-colors">Terms</Link>
            <Link href="/legal/privacy" className="hover:text-[var(--text-1)] transition-colors">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
