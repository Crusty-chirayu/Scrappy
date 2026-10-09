"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  SearchIcon,
  CheckIcon,
  ShieldIcon,
  ArrowRight,
  ChevronRight,
  Activity,
  Layers,
  Database,
  ChevronDown,
} from "lucide-react";
import { ProductSilhouette } from "@scrappy/ui";

const EXAMPLE_SEARCH_QUERIES = [
  "iPhone 16 Pro",
  "MacBook Air M3",
  "Sony WH-1000XM5",
  "iPad Air M2",
];

const RETAILER_CHIPS = [
  { name: "Amazon India", price: "₹69,999", isLowest: true, verified: "2m ago" },
  { name: "Flipkart", price: "₹71,490", isLowest: false, verified: "4m ago" },
  { name: "Croma", price: "₹72,990", isLowest: false, verified: "12m ago" },
  { name: "Reliance Digital", price: "₹72,499", isLowest: false, verified: "8m ago" },
];

const FAQ_ITEMS = [
  {
    q: "Where does Scrappy get its price data?",
    a: "Directly from live merchant product pages using dedicated responsible HTTP adapters with strict robots.txt and host rate limit compliance.",
  },
  {
    q: "How fresh is the pricing information?",
    a: "Every data point records exact provenance with timestamp and confidence rating. Polling frequencies range from 5 minutes to 24 hours depending on tier.",
  },
  {
    q: "How does Scrappy detect fake discounts?",
    a: "We compute true 90-day recorded medians and historical lowest prices, rejecting inflated MRP baselines used in holiday sale events.",
  },
  {
    q: "What is your policy on scraping ethics and rate limits?",
    a: "Scrappy never bypasses CAPTCHAs, does not scrape personal or login-walled data, identifies ScrappyBot in User-Agent, and honors automated crawl budgets.",
  },
  {
    q: "Can developers extract data from custom ecommerce websites?",
    a: "Yes. Use our Visual Extract Studio with point-and-select schema generation and webhook streaming, or consume our GET /api/v1/extract endpoints directly.",
  },
];

export default function LandingPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [stage, setStage] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
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
      {/* Background radial gradient glow */}
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
                <span>4 verified merchant adapters active</span>
                <span className="text-[var(--text-3)]">·</span>
                <span className="text-[var(--color-accent)] font-semibold">Sample data preview</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-semibold tracking-tight text-[var(--text-1)] leading-[1.05]">
                The verified graph of products, merchants, and <span className="font-serif italic font-normal">prices</span>.
              </h1>

              <p className="text-base sm:text-lg text-[var(--text-2)] max-w-xl font-sans">
                Live prices, matched and verified across Indian stores with true provenance and zero false matches.
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
                  aria-label="Search product or enter merchant URL"
                  className="w-full h-[56px] pl-11 pr-28 rounded-xl bg-[var(--surface-1)] border border-[var(--border-strong)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20 text-sm font-sans text-[var(--text-1)] placeholder-[var(--text-3)] outline-none transition-all"
                />
                <button
                  type="submit"
                  className="absolute right-2 h-11 min-h-[44px] px-4 rounded-lg bg-[var(--color-accent)] hover:opacity-95 text-white text-xs font-mono font-semibold transition-opacity flex items-center gap-1.5 shadow-sm"
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
                    className="px-3 py-2 min-h-[38px] inline-flex items-center rounded-full bg-[var(--surface-1)] border border-[var(--border)] hover:border-[var(--border-strong)] text-[var(--text-2)] hover:text-[var(--text-1)] transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Trust row */}
            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-mono text-[var(--text-3)]">
              <span>Amazon · Flipkart · Croma</span>
              <span>·</span>
              <span>90-day recorded median</span>
            </div>
          </div>

          {/* Right Column: Signature Moment A1 "Price Radar" Visual */}
          <div className="lg:col-span-6">
            <div className="relative p-6 sm:p-8 rounded-2xl bg-[var(--surface-1)] border border-[var(--border-strong)] shadow-[var(--elevation-2)] space-y-6 overflow-hidden">
              {/* Product header inside radar */}
              <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)]">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-9 rounded-lg overflow-hidden border border-[var(--border)] bg-[var(--surface-2)] flex items-center justify-center p-0.5">
                    <ProductSilhouette category="smartphones" size={44} />
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

                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--surface-2)] font-mono text-xs text-[var(--color-success)] font-semibold border border-[var(--border-subtle)]">
                  <span>Lowest Price</span>
                  <span className="text-[10px] bg-[var(--color-success)]/20 px-1.5 py-0.5 rounded">₹69,999</span>
                </div>
              </div>

              {/* Price Radar Chart */}
              <div className="relative h-44 w-full bg-[var(--surface-0)] rounded-xl border border-[var(--border)] p-4 flex flex-col justify-between">
                <div className="flex justify-between text-[11px] font-mono text-[var(--text-3)]">
                  <span>90-Day Range</span>
                  <span className="text-[var(--text-2)] font-medium">90-day recorded median: ₹74,200</span>
                </div>

                <svg className="w-full h-24 overflow-visible" viewBox="0 0 400 80" preserveAspectRatio="none">
                  <line x1="0" y1="20" x2="400" y2="20" stroke="var(--border)" strokeDasharray="3 3" />
                  <line x1="0" y1="60" x2="400" y2="60" stroke="var(--border)" strokeDasharray="3 3" />
                  <path
                    d="M 0 20 L 90 20 L 90 35 L 180 35 L 180 25 L 280 25 L 280 58 L 400 58"
                    fill="none"
                    stroke="var(--color-accent)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`transition-all duration-1000 ${stage >= 2 ? "opacity-100" : "opacity-0"}`}
                  />
                  {stage >= 2 && (
                    <g transform="translate(400, 58)">
                      <circle cx="0" cy="0" r="10" fill="var(--color-accent)" opacity="0.3" className="animate-ping" />
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
                    className={`p-3 rounded-xl border transition-all duration-500 flex items-center justify-between ${
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
                          Deal Score 9.4
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Deal Verdict Stamp & Demo Table */}
              <div className="pt-2 border-t border-[var(--border-subtle)] text-xs font-mono space-y-2">
                <div className="flex justify-between items-center text-[var(--text-3)]">
                  <span>Multi-merchant price graph with provenance</span>
                  <span className="text-[var(--color-accent)] font-semibold">Deal Score 9.4</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[11px]">
                  <div className="p-2 rounded bg-[var(--surface-2)] border border-[var(--border)]">
                    <span className="text-[var(--text-3)] block text-[10px]">Merchant Store</span>
                    <span className="font-semibold text-[var(--text-1)]">Amazon India</span>
                  </div>
                  <div className="p-2 rounded bg-[var(--surface-2)] border border-[var(--border)]">
                    <span className="text-[var(--text-3)] block text-[10px]">Estimated Delivery</span>
                    <span className="font-semibold text-[var(--text-1)]">Tomorrow</span>
                  </div>
                  <div className="p-2 rounded bg-[var(--surface-2)] border border-[var(--border)]">
                    <span className="text-[var(--text-3)] block text-[10px]">Alt Stores</span>
                    <span className="font-semibold text-[var(--text-1)]">Croma · Flipkart</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THREE FEATURE BLOCKS: THREE LENSES INTO WEB DATA TRUTH */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 border-t border-[var(--border-subtle)] space-y-8">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-[var(--color-accent)] font-semibold">
            Operational Architecture
          </span>
          <h2 className="text-2xl sm:text-3xl font-display font-semibold text-[var(--text-1)] mt-1">
            Three lenses into web data truth
          </h2>
          <p className="text-sm font-sans text-[var(--text-2)] mt-1">
            One deterministic engine powers consumer comparison, merchant intelligence, and scraping infrastructure.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Tile 1: Compare */}
          <div className="p-6 rounded-2xl bg-[var(--surface-1)] border border-[var(--border)] space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-[var(--color-accent)] font-semibold">
                Compare Lens
              </span>
              <Activity size={18} className="text-[var(--text-3)]" />
            </div>
            <h3 className="text-lg font-display font-semibold text-[var(--text-1)]">
              Cross-store price parity
            </h3>
            <p className="text-xs font-sans text-[var(--text-2)] leading-relaxed">
              Scan identical products across Flipkart, Amazon, and Croma with real-time stock and delivery telemetry.
            </p>
            <div className="pt-3 border-t border-[var(--border-subtle)]">
              <Link
                href="/compare"
                className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-[var(--color-accent)] hover:underline"
              >
                <span>Open Compare View</span>
                <ChevronRight size={14} />
              </Link>
            </div>
          </div>

          {/* Tile 2: Intelligence */}
          <div className="p-6 rounded-2xl bg-[var(--surface-1)] border border-[var(--border)] space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-[var(--color-accent)] font-semibold">
                Intelligence Lens
              </span>
              <Layers size={18} className="text-[var(--text-3)]" />
            </div>
            <h3 className="text-lg font-display font-semibold text-[var(--text-1)]">
              Market gap telemetry
            </h3>
            <p className="text-xs font-sans text-[var(--text-2)] leading-relaxed">
              Spot undercut opportunities, competitor price movements, and automated repricing simulations.
            </p>
            <div className="pt-3 border-t border-[var(--border-subtle)]">
              <Link
                href="/watchlist"
                className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-[var(--color-accent)] hover:underline"
              >
                <span>Explore Watchlist</span>
                <ChevronRight size={14} />
              </Link>
            </div>
          </div>

          {/* Tile 3: Extract */}
          <div className="p-6 rounded-2xl bg-[var(--surface-1)] border border-[var(--border)] space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-[var(--color-accent)] font-semibold">
                Extract Lens
              </span>
              <Database size={18} className="text-[var(--text-3)]" />
            </div>
            <h3 className="text-lg font-display font-semibold text-[var(--text-1)]">
              Point-and-capture scraping
            </h3>
            <p className="text-xs font-sans text-[var(--text-2)] leading-relaxed">
              Visual 3-step extraction workbench with instant confidence verification and <code className="text-[11px] font-mono text-[var(--color-accent)]">GET /api/v1/extract</code> endpoints.
            </p>
            <div className="pt-3 border-t border-[var(--border-subtle)]">
              <Link
                href="/extract"
                className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-[var(--color-accent)] hover:underline"
              >
                <span>Launch Extract Studio</span>
                <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. 3-STEP WORKFLOW PIPELINE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 border-t border-[var(--border-subtle)] space-y-8">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-[var(--color-accent)] font-semibold">
            Workflow Pipeline
          </span>
          <h2 className="text-2xl sm:text-3xl font-display font-semibold text-[var(--text-1)] mt-1">
            Step 1: Entity Resolution to Live Alerting
          </h2>
          <p className="text-sm font-sans text-[var(--text-2)] mt-1">
            How Scrappy transforms raw HTML into high-confidence buying and pricing signals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-[var(--surface-1)] border border-[var(--border)] space-y-2">
            <span className="text-xs font-mono text-[var(--color-accent)] font-bold">1. Search &amp; Resolve</span>
            <h3 className="text-base font-display font-semibold text-[var(--text-1)]">Multi-Store Product Matching</h3>
            <p className="text-xs font-sans text-[var(--text-2)] leading-relaxed">
              Normalizes UPC, EAN, and brand titles across four retailer catalogs with 98.4% precision.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[var(--surface-1)] border border-[var(--border)] space-y-2">
            <span className="text-xs font-mono text-[var(--color-accent)] font-bold">2. Set Watch Threshold</span>
            <h3 className="text-base font-display font-semibold text-[var(--text-1)]">Drop Percentage Rules</h3>
            <p className="text-xs font-sans text-[var(--text-2)] leading-relaxed">
              Define target prices or percentage drops based on genuine historical medians.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[var(--surface-1)] border border-[var(--border)] space-y-2">
            <span className="text-xs font-mono text-[var(--color-accent)] font-bold">3. Verified Alert Dispatch</span>
            <h3 className="text-base font-display font-semibold text-[var(--text-1)]">Instant Webhooks &amp; Email</h3>
            <p className="text-xs font-sans text-[var(--text-2)] leading-relaxed">
              Receive cryptographically signed HMAC alerts the second an authentic deal drops.
            </p>
          </div>
        </div>
      </section>

      {/* 4. "HOW WE KNOW" TRUST STRIP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 border-t border-[var(--border-subtle)]">
        <div className="p-8 rounded-2xl bg-[var(--surface-1)] border border-[var(--border)] grid grid-cols-1 md:grid-cols-4 gap-6 items-center shadow-xs">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-[var(--color-accent)] font-semibold">
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

      {/* 5. PRICING ROW: HONEST TIERS */}
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
          <div className="p-6 rounded-2xl bg-[var(--surface-1)] border border-[var(--border)] flex flex-col justify-between space-y-6 shadow-xs">
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-base font-display font-semibold text-[var(--text-1)]">Free</h3>
                <div className="text-2xl font-mono font-bold text-[var(--text-1)]">₹0</div>
                <span className="text-[11px] font-mono text-[var(--text-3)]">Forever free</span>
              </div>
              <ul className="text-xs font-mono text-[var(--text-2)] space-y-2">
                <li className="flex items-center gap-2">✓ 20 active watches</li>
                <li className="flex items-center gap-2">✓ 6-hour refresh rate</li>
                <li className="flex items-center gap-2">✓ Email price drop alerts</li>
              </ul>
            </div>
            <Link
              href="/compare"
              className="block w-full py-2.5 text-center rounded-xl bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-xs font-mono text-[var(--text-1)] transition-colors border border-[var(--border)] font-semibold"
            >
              Start Free
            </Link>
          </div>

          {/* Pro Tier (Featured) */}
          <div className="p-6 rounded-2xl bg-[var(--surface-1)] border-2 border-[var(--color-accent)] relative flex flex-col justify-between space-y-6 shadow-[var(--elevation-2)] ring-1 ring-[var(--color-accent)]/20">
            <div className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full bg-[var(--color-accent)] text-white text-[10px] font-mono font-bold uppercase">
              Popular
            </div>
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-base font-display font-semibold text-[var(--text-1)]">Pro</h3>
                <div className="text-2xl font-mono font-bold text-[var(--text-1)]">
                  ₹999<span className="text-xs font-normal text-[var(--text-3)]">/mo</span>
                </div>
                <span className="text-[11px] font-mono text-[var(--text-3)]">Billed monthly</span>
              </div>
              <ul className="text-xs font-mono text-[var(--text-2)] space-y-2">
                <li className="flex items-center gap-2">✓ 200 active watches</li>
                <li className="flex items-center gap-2">✓ 15-minute refresh rate</li>
                <li className="flex items-center gap-2">✓ Intelligence Market Board</li>
                <li className="flex items-center gap-2">✓ Visual Extract Studio</li>
              </ul>
            </div>
            <Link
              href="/pricing"
              className="block w-full py-2.5 text-center rounded-xl bg-[var(--color-accent)] hover:opacity-95 text-white text-xs font-mono font-semibold transition-opacity"
            >
              Upgrade to Pro
            </Link>
          </div>

          {/* Team Tier */}
          <div className="p-6 rounded-2xl bg-[var(--surface-1)] border border-[var(--border)] flex flex-col justify-between space-y-6 shadow-xs">
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-base font-display font-semibold text-[var(--text-1)]">Team</h3>
                <div className="text-2xl font-mono font-bold text-[var(--text-1)]">
                  ₹4,999<span className="text-xs font-normal text-[var(--text-3)]">/mo</span>
                </div>
                <span className="text-[11px] font-mono text-[var(--text-3)]">Dedicated pipelines</span>
              </div>
              <ul className="text-xs font-mono text-[var(--text-2)] space-y-2">
                <li className="flex items-center gap-2">✓ Unlimited product watches</li>
                <li className="flex items-center gap-2">✓ 5-minute real-time polling</li>
                <li className="flex items-center gap-2">✓ HMAC signed webhooks</li>
                <li className="flex items-center gap-2">✓ Multi-seat workspaces</li>
              </ul>
            </div>
            <Link
              href="/pricing"
              className="block w-full py-2.5 text-center rounded-xl bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-xs font-mono text-[var(--text-1)] transition-colors border border-[var(--border)] font-semibold"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </section>

      {/* 6. FAQ ACCORDION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16 border-t border-[var(--border-subtle)] space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-mono uppercase tracking-wider text-[var(--color-accent)] font-semibold">
            Common Questions
          </span>
          <h2 className="text-2xl sm:text-3xl font-display font-semibold text-[var(--text-1)]">
            Frequently asked questions
          </h2>
        </div>

        <div className="space-y-3">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] overflow-hidden shadow-xs transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-sans font-semibold text-sm text-[var(--text-1)] hover:text-[var(--color-accent)] transition-colors min-h-[44px]"
                >
                  <span>{item.q}</span>
                  <ChevronDown
                    size={16}
                    className={`shrink-0 text-[var(--text-3)] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs text-[var(--text-2)] font-sans leading-relaxed border-t border-[var(--border-subtle)] pt-3">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. STRUCTURED FOOTER */}
      <footer className="border-t border-[var(--border-subtle)] bg-[var(--surface-1)] px-4 sm:px-6 py-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs font-mono text-[var(--text-3)]">
          <div className="space-y-1 text-center md:text-left">
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <span className="text-[var(--text-1)] font-bold">SCRAPPY</span>
              <span>— The Web Product &amp; Price Graph</span>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-[var(--text-3)]">
              <span>WCAG 2.2 AA Verified</span>
              <span>·</span>
              <span>Zero Fake Discounts</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-5">
            <Link href="/compare" className="hover:text-[var(--text-1)] transition-colors">Compare</Link>
            <Link href="/intelligence" className="hover:text-[var(--text-1)] transition-colors">Intelligence</Link>
            <Link href="/extract" className="hover:text-[var(--text-1)] transition-colors">Extract</Link>
            <Link href="/legal/terms" className="hover:text-[var(--text-1)] transition-colors">Terms of Service</Link>
            <Link href="/legal/privacy" className="hover:text-[var(--text-1)] transition-colors">Privacy Policy</Link>
            <Link href="/legal/responsible-scraping" className="hover:text-[var(--text-1)] transition-colors">Scraping Ethics</Link>
            <Link href="/status" className="hover:text-[var(--text-1)] transition-colors">Security Disclosures</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
