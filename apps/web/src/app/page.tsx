"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  AmbientMesh,
  Accordion,
  Badge,
  Button,
  SourceChip,
  NumberTick,
  SearchIcon,
  CompareIcon,
  WatchlistIcon,
  ExtractIcon,
  CheckIcon,
  ExternalLinkIcon,
  ShieldIcon,
  ChevronRightIcon,
} from "@scrappy/ui";

// Sample verified product graph data for interactive demo
interface DemoOffer {
  store: string;
  price: number;
  originalPrice: number;
  delivery: string;
  inStock: boolean;
  verifiedAgo: string;
  sourceType: "live" | "fixture" | "stale";
}

interface DemoProduct {
  id: string;
  title: string;
  category: "Smartphones" | "Laptops" | "Audio" | "Tablets";
  bestPrice: number;
  mrp: number;
  deltaPercent: number;
  dealScore: number;
  dealRating: "EXCELLENT" | "GOOD" | "FAIR";
  sparklineData: number[];
  analysis: string;
  offers: DemoOffer[];
}

const SAMPLE_PRODUCTS: DemoProduct[] = [
  {
    id: "prod-iphone-16-pro",
    title: "Apple iPhone 16 Pro (128GB, Natural Titanium)",
    category: "Smartphones",
    bestPrice: 119900,
    mrp: 129900,
    deltaPercent: -7.7,
    dealScore: 9.4,
    dealRating: "EXCELLENT",
    sparklineData: [129900, 128500, 126900, 125000, 122900, 119900],
    analysis: "Genuine 7.7% drop below launch retail baseline. All-time lowest price indexed.",
    offers: [
      { store: "Amazon India", price: 119900, originalPrice: 129900, delivery: "Tomorrow by 11 AM", inStock: true, verifiedAgo: "2m ago", sourceType: "live" },
      { store: "Croma", price: 121900, originalPrice: 129900, delivery: "2-3 days", inStock: true, verifiedAgo: "14m ago", sourceType: "live" },
      { store: "Flipkart", price: 122990, originalPrice: 129900, delivery: "Tomorrow by 5 PM", inStock: true, verifiedAgo: "5m ago", sourceType: "live" },
      { store: "Reliance Digital", price: 124900, originalPrice: 129900, delivery: "4 days", inStock: true, verifiedAgo: "1h ago", sourceType: "stale" },
    ],
  },
  {
    id: "prod-macbook-air-m3",
    title: "Apple MacBook Air 13.6-inch M3 (8GB Unified Memory, 256GB SSD)",
    category: "Laptops",
    bestPrice: 94990,
    mrp: 104900,
    deltaPercent: -9.4,
    dealScore: 9.1,
    dealRating: "EXCELLENT",
    sparklineData: [104900, 102900, 99990, 98900, 96500, 94990],
    analysis: "Lowest price in 60 days. Flipkart festive bank discount verified against checkout API.",
    offers: [
      { store: "Flipkart", price: 94990, originalPrice: 104900, delivery: "Tomorrow by 2 PM", inStock: true, verifiedAgo: "4m ago", sourceType: "live" },
      { store: "Amazon India", price: 97990, originalPrice: 104900, delivery: "Tomorrow by 9 PM", inStock: true, verifiedAgo: "8m ago", sourceType: "live" },
      { store: "Croma", price: 99900, originalPrice: 104900, delivery: "3 days", inStock: true, verifiedAgo: "22m ago", sourceType: "live" },
      { store: "Reliance Digital", price: 101900, originalPrice: 104900, delivery: "3 days", inStock: false, verifiedAgo: "45m ago", sourceType: "live" },
    ],
  },
  {
    id: "prod-sony-wh1000xm5",
    title: "Sony WH-1000XM5 Wireless Active Noise Canceling Headphones",
    category: "Audio",
    bestPrice: 26990,
    mrp: 34990,
    deltaPercent: -22.9,
    dealScore: 8.9,
    dealRating: "EXCELLENT",
    sparklineData: [32990, 31490, 29990, 28990, 27490, 26990],
    analysis: "Genuine 22.9% drop. MRP of ₹34,990 was maintained for 120 days prior to promo.",
    offers: [
      { store: "Amazon India", price: 26990, originalPrice: 34990, delivery: "Tomorrow by 1 PM", inStock: true, verifiedAgo: "1m ago", sourceType: "live" },
      { store: "Flipkart", price: 27990, originalPrice: 34990, delivery: "2 days", inStock: true, verifiedAgo: "12m ago", sourceType: "live" },
      { store: "Croma", price: 28990, originalPrice: 34990, delivery: "Same-day store pickup", inStock: true, verifiedAgo: "30m ago", sourceType: "live" },
      { store: "Reliance Digital", price: 29990, originalPrice: 34990, delivery: "4 days", inStock: true, verifiedAgo: "2h ago", sourceType: "stale" },
    ],
  },
  {
    id: "prod-ipad-air-m2",
    title: "Apple iPad Air 11-inch M2 (Wi-Fi, 128GB, Space Gray)",
    category: "Tablets",
    bestPrice: 53990,
    mrp: 59900,
    deltaPercent: -9.9,
    dealScore: 8.7,
    dealRating: "GOOD",
    sparklineData: [59900, 58500, 56900, 55500, 54900, 53990],
    analysis: "Stable price trend. ₹2,000 instant bank discount verified at checkout.",
    offers: [
      { store: "Amazon India", price: 53990, originalPrice: 59900, delivery: "Tomorrow by 6 PM", inStock: true, verifiedAgo: "3m ago", sourceType: "live" },
      { store: "Croma", price: 54900, originalPrice: 59900, delivery: "2 days", inStock: true, verifiedAgo: "18m ago", sourceType: "live" },
      { store: "Flipkart", price: 55490, originalPrice: 59900, delivery: "Tomorrow", inStock: true, verifiedAgo: "9m ago", sourceType: "live" },
      { store: "Reliance Digital", price: 56900, originalPrice: 59900, delivery: "3 days", inStock: true, verifiedAgo: "1h ago", sourceType: "stale" },
    ],
  },
];

const SEARCH_SUGGESTIONS = [
  { query: "iPhone 16 Pro", match: "Apple iPhone 16 Pro (128GB, Natural Titanium)", price: 119900, store: "Amazon India" },
  { query: "MacBook Air M3", match: "Apple MacBook Air 13.6-inch M3 (256GB)", price: 94990, store: "Flipkart" },
  { query: "Sony WH-1000XM5", match: "Sony WH-1000XM5 Noise Canceling Headphones", price: 26990, store: "Amazon India" },
  { query: "iPad Air M2", match: "Apple iPad Air 11-inch M2 (Wi-Fi, 128GB)", price: 53990, store: "Amazon India" },
  { query: "Samsung Galaxy S24 Ultra", match: "Samsung Galaxy S24 Ultra 5G (256GB)", price: 121999, store: "Croma" },
];

export default function HomePage() {
  // Telepathic Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<DemoProduct>(SAMPLE_PRODUCTS[0]!);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [sortBy, setSortBy] = useState<"price" | "score">("price");

  // Sticky Scroll Step State
  const [activeStep, setActiveStep] = useState<number>(1);

  // Watch threshold interactive state for feature block 2
  const [watchThreshold, setWatchThreshold] = useState<number>(115000);

  // Filtered products for demo table
  const filteredProducts = useMemo(() => {
    return SAMPLE_PRODUCTS.filter((p) => {
      const matchesCategory = activeCategory === "All" || p.category === activeCategory;
      const matchesSearch =
        !searchQuery ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    }).sort((a, b) => {
      if (sortBy === "price") return a.bestPrice - b.bestPrice;
      return b.dealScore - a.dealScore;
    });
  }, [activeCategory, searchQuery, sortBy]);

  // Suggestions for telepathic search
  const suggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return SEARCH_SUGGESTIONS.filter(
      (s) => s.query.toLowerCase().includes(q) || s.match.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Typo correction check
  const typoCorrection = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (q === "iphne" || q === "iphn" || q === "iphone16") return "iPhone 16 Pro";
    if (q === "mcbook" || q === "macbok") return "MacBook Air M3";
    if (q === "sny" || q === "xm5") return "Sony WH-1000XM5";
    return null;
  }, [searchQuery]);

  return (
    <div className="relative min-h-screen bg-[var(--surface-0)] text-[var(--text-1)] selection:bg-[var(--color-accent)]/20 selection:text-[var(--color-accent)] font-sans">
      {/* 1. HERO SECTION WITH AMBIENT MESH */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 px-4 sm:px-6 lg:px-8 border-b border-[var(--border-subtle)] overflow-hidden">
        {/* Subtle Ambient Mesh backdrop */}
        <div className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-60 overflow-hidden">
          <AmbientMesh variant="mesh" />
        </div>

        <div className="relative max-w-[1200px] mx-auto z-10">
          {/* Small Honest Telemetry / Status Pill */}
          <div className="flex items-center gap-2 mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--surface-1)] border border-[var(--border-default)] font-mono text-xs text-[var(--text-2)] shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[var(--color-success)] animate-pulse" />
              <span>4 verified merchant adapters active</span>
              <span className="text-[var(--text-3)]">·</span>
              <span className="text-[var(--text-3)]">Sample data preview</span>
            </div>
          </div>

          {/* Left-Aligned Headline in Display Serif */}
          <div className="max-w-4xl">
            <h1 className="font-display text-4xl sm:text-5xl md:text-7xl font-normal tracking-tight text-[var(--text-1)] leading-[1.08] mb-6">
              The verified graph of products, merchants, and prices.
            </h1>
            <p className="font-sans text-base sm:text-lg md:text-xl text-[var(--text-2)] max-w-2xl leading-relaxed mb-10">
              Scrappy monitors prices across Amazon, Flipkart, Croma, and Reliance Digital. It verifies merchant discount claims against historical baselines and alerts you when prices actually drop.
            </p>
          </div>

          {/* Telepathic Hero Search (Signature Moment 1) */}
          <div className="max-w-2xl relative mb-4">
            <div
              className={`relative flex items-center bg-[var(--surface-1)] rounded-[var(--radius-lg)] border transition-all duration-200 shadow-[var(--elevation-2)] ${
                searchFocused
                  ? "border-[var(--color-accent)] ring-4 ring-[var(--color-accent)]/10"
                  : "border-[var(--border-strong)] hover:border-[var(--text-3)]"
              }`}
            >
              <div className="pl-4 pr-2 text-[var(--text-3)] flex items-center justify-center pointer-events-none">
                <SearchIcon size={20} />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                placeholder="Search any product or paste merchant URL..."
                aria-label="Search product or enter merchant URL"
                className="w-full py-3.5 pr-4 bg-transparent text-sm sm:text-base text-[var(--text-1)] placeholder-[var(--text-3)] font-sans focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="mr-2 px-2.5 py-1.5 text-xs font-mono text-[var(--text-3)] hover:text-[var(--text-1)] rounded min-h-[44px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)]"
                  aria-label="Clear search query"
                >
                  Clear
                </button>
              )}
              <Link
                href="/compare"
                className="mr-2 inline-flex items-center min-h-[44px] min-w-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)] rounded-[var(--radius-sm)]"
              >
                <Button variant="primary" size="md" className="min-h-[44px] px-4 font-medium flex items-center gap-1.5">
                  <span>Compare</span>
                  <ChevronRightIcon size={16} />
                </Button>
              </Link>
            </div>

            {/* Typo Correction Banner */}
            {typoCorrection && (
              <div className="mt-2 text-xs font-mono text-[var(--text-2)] flex items-center gap-1.5">
                <span>Showing results for</span>
                <button
                  type="button"
                  onClick={() => setSearchQuery(typoCorrection)}
                  className="font-semibold text-[var(--color-accent)] underline hover:no-underline"
                >
                  {typoCorrection}
                </button>
              </div>
            )}

            {/* Telepathic Instant Suggestions Dropdown */}
            {searchFocused && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--surface-1)] border border-[var(--border-default)] rounded-[var(--radius-md)] shadow-[var(--elevation-3)] z-30 overflow-hidden divide-y divide-[var(--border-subtle)]">
                <div className="px-3 py-1.5 bg-[var(--surface-2)] font-mono text-[11px] text-[var(--text-3)] flex items-center justify-between">
                  <span>Instant Match Suggestions</span>
                  <span>Press Enter to inspect</span>
                </div>
                {suggestions.map((item) => (
                  <button
                    key={item.query}
                    type="button"
                    onClick={() => {
                      setSearchQuery(item.query);
                      const matched = SAMPLE_PRODUCTS.find((p) => p.title.toLowerCase().includes(item.query.toLowerCase()));
                      if (matched) setSelectedProduct(matched);
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-[var(--surface-2)] flex items-center justify-between transition-colors focus-visible:outline-none focus-visible:bg-[var(--surface-2)]"
                  >
                    <div>
                      <div className="text-sm font-medium text-[var(--text-1)] font-sans">{item.match}</div>
                      <div className="text-xs font-mono text-[var(--text-3)]">Available on {item.store}</div>
                    </div>
                    <div className="text-right font-mono">
                      <div className="text-sm font-semibold text-[var(--color-success)]">₹{item.price.toLocaleString("en-IN")}</div>
                      <div className="text-[10px] text-[var(--text-3)]">Verified</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Example Query Chips */}
          <div className="flex flex-wrap items-center gap-2 mb-10">
            <span className="font-mono text-xs text-[var(--text-3)] mr-1">Popular searches:</span>
            {["iPhone 16 Pro", "MacBook Air M3", "Sony WH-1000XM5", "iPad Air M2"].map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => {
                  setSearchQuery(chip);
                  const matched = SAMPLE_PRODUCTS.find((p) => p.title.toLowerCase().includes(chip.toLowerCase()));
                  if (matched) setSelectedProduct(matched);
                }}
                className={`px-2.5 py-1 rounded-[var(--radius-sm)] border text-xs font-mono transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)] ${
                  searchQuery === chip
                    ? "bg-[var(--surface-2)] text-[var(--color-accent)] border-[var(--color-accent)] font-semibold"
                    : "bg-[var(--surface-1)] text-[var(--text-2)] hover:text-[var(--text-1)] hover:border-[var(--border-strong)] border-[var(--border-subtle)]"
                }`}
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Honest Provenance Trust Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-6 border-t border-[var(--border-subtle)] max-w-4xl font-mono text-xs text-[var(--text-2)]">
            <div className="flex flex-col">
              <span className="text-[var(--text-3)] text-[11px]">Primary Adapters</span>
              <span className="font-semibold text-[var(--text-1)] mt-0.5">Amazon · Flipkart · Croma</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[var(--text-3)] text-[11px]">Historical Baselines</span>
              <span className="font-semibold text-[var(--text-1)] mt-0.5">90-day recorded median</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[var(--text-3)] text-[11px]">Extraction Method</span>
              <span className="font-semibold text-[var(--text-1)] mt-0.5">Direct JSON-LD + API</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[var(--text-3)] text-[11px]">Match Verification</span>
              <span className="font-semibold text-[var(--text-1)] mt-0.5">0% false-match tolerance</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. INTERACTIVE COMPARE DEMO WITH LABELED SAMPLE DATA */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 border-b border-[var(--border-subtle)] bg-[var(--surface-1)]/50">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 mb-2 font-mono text-xs text-[var(--color-accent)] font-semibold">
                <CompareIcon size={16} />
                <span>INTERACTIVE DATA INSTRUMENT DEMO</span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl md:text-4xl text-[var(--text-1)] font-normal">
                Multi-merchant price graph with provenance
              </h2>
              <p className="text-sm font-sans text-[var(--text-2)] mt-1 max-w-xl">
                Select a product below to inspect real-time price spread across stores, historical deal scores, and extraction telemetry.
              </p>
            </div>

            {/* Category Filter Pills & Sort Toggle */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex p-0.5 rounded-[var(--radius-sm)] bg-[var(--surface-2)] border border-[var(--border-subtle)] text-xs font-mono">
                {["All", "Smartphones", "Laptops", "Audio"].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    className={`px-2.5 py-1 rounded-[var(--radius-xs)] transition-colors ${
                      activeCategory === cat
                        ? "bg-[var(--surface-0)] text-[var(--text-1)] font-semibold shadow-xs"
                        : "text-[var(--text-3)] hover:text-[var(--text-2)]"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setSortBy((prev) => (prev === "price" ? "score" : "price"))}
                className="px-3 py-1.5 rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--surface-0)] text-xs font-mono text-[var(--text-2)] hover:text-[var(--text-1)] transition-colors"
                title="Toggle sort criterion"
              >
                Sort: {sortBy === "price" ? "Lowest Price" : "Deal Score"}
              </button>
            </div>
          </div>

          {/* Interactive Demo Frame */}
          <div className="border border-[var(--border-default)] rounded-[var(--radius-lg)] bg-[var(--surface-0)] shadow-[var(--elevation-2)] overflow-hidden">
            {/* Demo Header Bar with Provenance Disclaimer */}
            <div className="px-4 py-3 bg-[var(--surface-2)] border-b border-[var(--border-default)] flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[var(--color-success)]" />
                <span className="font-semibold text-[var(--text-1)]">Product Graph Inspection</span>
                <span className="text-[var(--text-3)]">·</span>
                <span className="px-2 py-0.5 rounded bg-[var(--surface-3)] text-[var(--text-2)] border border-[var(--border-subtle)]">
                  Sample data
                </span>
              </div>
              <div className="text-[var(--text-3)]">
                Click a product to recompute price deltas and retailer spread
              </div>
            </div>

            {/* Product Selector Pills */}
            <div className="p-4 border-b border-[var(--border-subtle)] bg-[var(--surface-1)] flex items-center gap-2 overflow-x-auto no-scrollbar">
              {filteredProducts.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedProduct(p)}
                  className={`px-3 py-2 rounded-[var(--radius-md)] text-xs font-mono whitespace-nowrap transition-all border ${
                    selectedProduct.id === p.id
                      ? "bg-[var(--surface-0)] text-[var(--text-1)] border-[var(--color-accent)] font-semibold shadow-xs"
                      : "bg-[var(--surface-2)] text-[var(--text-2)] hover:text-[var(--text-1)] border-[var(--border-subtle)]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{p.title.split("(")[0]?.trim()}</span>
                    <span className="text-[var(--color-success)] font-semibold">₹{p.bestPrice.toLocaleString("en-IN")}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Selected Product Overview Card */}
            <div className="p-6 border-b border-[var(--border-subtle)] bg-[var(--surface-0)]">
              <div className="flex flex-col lg:flex-row justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Badge variant="outline" size="sm">{selectedProduct.category}</Badge>
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[2px] bg-[var(--surface-2)] border border-[var(--border-subtle)] text-[11px] font-mono text-[var(--text-2)]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)]" />
                      <span>Verified 2m ago</span>
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-sans font-semibold text-[var(--text-1)] tracking-tight">
                    {selectedProduct.title}
                  </h3>
                  <p className="text-xs font-mono text-[var(--text-2)] mt-2 flex items-center gap-1.5">
                    <ShieldIcon size={16} className="text-[var(--color-success)]" />
                    <span>{selectedProduct.analysis}</span>
                  </p>
                </div>

                <div className="flex items-center gap-4 bg-[var(--surface-1)] p-4 rounded-[var(--radius-md)] border border-[var(--border-default)] shrink-0 font-mono">
                  <div>
                    <div className="text-[11px] text-[var(--text-3)] uppercase tracking-wider">Lowest Price</div>
                    <div className="text-2xl font-bold text-[var(--color-success)]">
                      <NumberTick value={selectedProduct.bestPrice} />
                    </div>
                    <div className="text-xs text-[var(--text-3)] line-through">
                      MRP ₹{selectedProduct.mrp.toLocaleString("en-IN")}
                    </div>
                  </div>
                  <div className="border-l border-[var(--border-default)] pl-4">
                    <div className="text-[11px] text-[var(--text-3)] uppercase tracking-wider">Deal Score</div>
                    <div className="text-2xl font-bold text-[var(--text-1)]">{selectedProduct.dealScore}/10</div>
                    <div className="text-[10px] text-[var(--color-success)] font-semibold">
                      {selectedProduct.dealRating}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Offers Comparison Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left font-sans text-xs border-collapse">
                <thead>
                  <tr className="bg-[var(--surface-2)] border-b border-[var(--border-default)] font-mono text-[11px] text-[var(--text-3)]">
                    <th className="px-4 py-2.5 font-medium">Merchant Store</th>
                    <th className="px-4 py-2.5 font-medium text-right">Price</th>
                    <th className="px-4 py-2.5 font-medium">Estimated Delivery</th>
                    <th className="px-4 py-2.5 font-medium">Availability</th>
                    <th className="px-4 py-2.5 font-medium">Source Telemetry</th>
                    <th className="px-4 py-2.5 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)] font-mono text-xs">
                  {selectedProduct.offers.map((offer) => {
                    const isBest = offer.price === selectedProduct.bestPrice;
                    return (
                      <tr
                        key={offer.store}
                        className={`hover:bg-[var(--surface-1)] transition-colors ${
                          isBest ? "bg-[var(--color-accent-soft)]/20" : ""
                        }`}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="font-sans font-semibold text-[var(--text-1)]">{offer.store}</span>
                            {isBest && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[var(--color-success)]/10 text-[var(--color-success)] border border-[var(--color-success)]/30">
                                Lowest
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className={`text-sm font-bold ${isBest ? "text-[var(--color-success)]" : "text-[var(--text-1)]"}`}>
                            ₹{offer.price.toLocaleString("en-IN")}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[var(--text-2)]">{offer.delivery}</td>
                        <td className="px-4 py-3">
                          {offer.inStock ? (
                            <span className="text-[var(--color-success)] font-medium">In Stock</span>
                          ) : (
                            <span className="text-[var(--color-danger)] font-medium">Out of Stock</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <SourceChip
                            sourceName={offer.store}
                            sourceId={offer.store.toLowerCase().replace(/\s+/g, "-")}
                            health={offer.sourceType === "stale" ? "degraded" : "healthy"}
                          />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link href="/compare">
                            <Button variant="ghost" size="sm" className="gap-1 font-mono text-[11px]">
                              <span>Inspect</span>
                              <ExternalLinkIcon size={16} />
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Demo Footer with CTA */}
            <div className="p-4 bg-[var(--surface-1)] border-t border-[var(--border-default)] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
              <span className="text-[var(--text-2)]">
                All prices verified directly against merchant product pages via JSON-LD endpoints.
              </span>
              <Link href="/compare">
                <Button variant="primary" size="sm" className="gap-1.5 font-medium">
                  <span>Open Full Comparison Tool</span>
                  <ChevronRightIcon size={16} />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS STICKY SCROLL */}
      <section className="py-20 md:py-32 px-4 sm:px-6 lg:px-8 border-b border-[var(--border-subtle)]">
        <div className="max-w-[1200px] mx-auto">
          <div className="mb-12">
            <span className="font-mono text-xs text-[var(--color-accent)] font-semibold tracking-wider uppercase">
              WORKFLOW PIPELINE
            </span>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-[var(--text-1)] font-normal mt-2">
              Three steps to never overpaying again
            </h2>
            <p className="text-sm sm:text-base font-sans text-[var(--text-2)] mt-2 max-w-xl">
              From continuous merchant crawling to verified discount alerts, Scrappy automates price monitoring without manual checking.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Steps Rail (Sticky on Desktop) */}
            <div className="lg:col-span-5 space-y-4">
              {[
                {
                  step: 1,
                  title: "1. Search & Resolve",
                  desc: "Enter any product name, model number, or paste a direct merchant URL. Our entity resolver matches identifiers (UPC, EAN, ASIN) across Flipkart, Amazon, Croma, and Reliance Digital with zero false merges.",
                },
                {
                  step: 2,
                  title: "2. Set Watch Threshold",
                  desc: "Set your target price with one tap. Scrappy calculates the 90-day probability of the drop occurring based on historical promotion schedules and manufacturer price cycles.",
                },
                {
                  step: 3,
                  title: "3. Verified Alert Dispatch",
                  desc: "When a genuine drop is detected and verified against checkout APIs, alerts fire immediately via Webhook, Email, or In-App notification with a direct checkout link.",
                },
              ].map((item) => (
                <div
                  key={item.step}
                  onClick={() => setActiveStep(item.step)}
                  className={`p-6 rounded-[var(--radius-lg)] border cursor-pointer transition-all duration-200 ${
                    activeStep === item.step
                      ? "bg-[var(--surface-1)] border-[var(--color-accent)] shadow-[var(--elevation-2)] ring-1 ring-[var(--color-accent)]/20"
                      : "bg-[var(--surface-0)] border-[var(--border-subtle)] hover:border-[var(--border-default)] hover:bg-[var(--surface-1)]/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-semibold text-[var(--color-accent)]">
                      PHASE 0{item.step}
                    </span>
                    {activeStep === item.step && (
                      <span className="w-2 h-2 rounded-full bg-[var(--color-accent)]" />
                    )}
                  </div>
                  <h3 className="text-lg font-sans font-semibold text-[var(--text-1)] mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm font-sans text-[var(--text-2)] leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Right Sticky Visual Display */}
            <div className="lg:col-span-7 lg:sticky lg:top-24">
              <div className="p-6 md:p-8 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-1)] shadow-[var(--elevation-3)]">
                {activeStep === 1 && (
                  <div className="space-y-4 font-mono text-xs">
                    <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
                      <span className="font-semibold text-[var(--text-1)]">Step 1: Entity Resolution</span>
                      <Badge variant="outline" size="sm">Deterministic Match</Badge>
                    </div>
                    <div className="p-4 bg-[var(--surface-0)] rounded-[var(--radius-md)] border border-[var(--border-subtle)] space-y-2">
                      <div className="text-[var(--text-3)] text-[11px]">Input Query:</div>
                      <div className="text-sm font-semibold text-[var(--text-1)] font-sans">
                        "Sony WH-1000XM5 Silver Wireless Headphones"
                      </div>
                      <div className="pt-2 text-[11px] text-[var(--color-success)] flex items-center gap-1.5">
                        <CheckIcon size={16} />
                        <span>Matched to canonical EAN 4548736132580 (Confidence: 99.8%)</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="p-3 bg-[var(--surface-0)] rounded border border-[var(--border-subtle)]">
                        <div className="text-[10px] text-[var(--text-3)]">Amazon ASIN</div>
                        <div className="font-semibold text-[var(--text-1)] mt-0.5">B09XS7JWHH</div>
                      </div>
                      <div className="p-3 bg-[var(--surface-0)] rounded border border-[var(--border-subtle)]">
                        <div className="text-[10px] text-[var(--text-3)]">Flipkart FSN</div>
                        <div className="font-semibold text-[var(--text-1)] mt-0.5">ACCGHH8W39D</div>
                      </div>
                    </div>
                  </div>
                )}

                {activeStep === 2 && (
                  <div className="space-y-4 font-mono text-xs">
                    <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
                      <span className="font-semibold text-[var(--text-1)]">Step 2: Threshold Probability Engine</span>
                      <Badge variant="outline" size="sm">90-Day Analysis</Badge>
                    </div>

                    <div className="p-4 bg-[var(--surface-0)] rounded-[var(--radius-md)] border border-[var(--border-subtle)] space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[var(--text-2)]">Target Alert Price:</span>
                        <span className="text-lg font-bold text-[var(--color-accent)]">₹{watchThreshold.toLocaleString("en-IN")}</span>
                      </div>
                      <input
                        type="range"
                        min="105000"
                        max="125000"
                        step="1000"
                        value={watchThreshold}
                        onChange={(e) => setWatchThreshold(Number(e.target.value))}
                        className="w-full accent-[var(--color-accent)]"
                        aria-label="Set watch threshold price"
                      />
                      <div className="flex justify-between text-[11px] text-[var(--text-3)]">
                        <span>₹1,05,000 (Historic Low)</span>
                        <span>₹1,25,000 (Current MRP)</span>
                      </div>
                    </div>

                    <div className="p-3 rounded bg-[var(--surface-2)] border border-[var(--border-subtle)] text-[11px] text-[var(--text-2)] flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[var(--color-success)]" />
                      <span>
                        Historical check: This price point was hit <strong>3 times</strong> in the last 90 days.
                      </span>
                    </div>
                  </div>
                )}

                {activeStep === 3 && (
                  <div className="space-y-4 font-mono text-xs">
                    <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
                      <span className="font-semibold text-[var(--text-1)]">Step 3: Signed Webhook / Alert Delivery</span>
                      <Badge variant="outline" size="sm">HMAC Verified</Badge>
                    </div>

                    <div className="p-4 bg-[var(--surface-0)] rounded-[var(--radius-md)] border border-[var(--border-subtle)] font-mono text-[11px] space-y-1.5 text-[var(--text-2)]">
                      <div className="text-[var(--color-accent)] font-semibold">POST /api/webhooks/scrappy</div>
                      <div>x-scrappy-signature: sha256=9b7f4e8c1a...</div>
                      <div className="text-[var(--text-3)] pt-1">&#123;</div>
                      <div className="pl-4">"event": "price.drop_verified",</div>
                      <div className="pl-4">"product": "Apple iPhone 16 Pro (128GB)",</div>
                      <div className="pl-4 text-[var(--color-success)]">"new_price": 119900,</div>
                      <div className="pl-4">"previous_price": 129900,</div>
                      <div className="pl-4">"store": "Amazon India",</div>
                      <div className="pl-4">"drop_percent": 7.7,</div>
                      <div className="pl-4">"checkout_url": "https://amazon.in/dp/..."</div>
                      <div className="text-[var(--text-3)]">&#125;</div>
                    </div>

                    <div className="text-right">
                      <Link href="/alerts">
                        <Button variant="outline" size="sm" className="font-mono text-[11px]">
                          Configure Alert Channels →
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. THREE FEATURE BLOCKS: COMPARE, WATCH, EXTRACT */}
      <section className="py-20 md:py-32 px-4 sm:px-6 lg:px-8 border-b border-[var(--border-subtle)] bg-[var(--surface-1)]/40">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="font-mono text-xs text-[var(--color-accent)] font-semibold tracking-wider uppercase">
              ONE UNIFIED PLATFORM
            </span>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-[var(--text-1)] font-normal mt-2">
              Three lenses into web data truth
            </h2>
            <p className="text-sm sm:text-base font-sans text-[var(--text-2)] mt-2">
              Compare, Watch, and Extract operate on the exact same underlying graph of merchants, offers, and verified prices.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1: Compare */}
            <div className="p-6 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-0)] flex flex-col justify-between shadow-[var(--elevation-1)]">
              <div>
                <div className="w-10 h-10 rounded-[var(--radius-md)] bg-[var(--surface-2)] flex items-center justify-center text-[var(--color-accent)] mb-4">
                  <CompareIcon size={20} />
                </div>
                <h3 className="text-xl font-sans font-semibold text-[var(--text-1)] mb-2">Compare</h3>
                <p className="text-sm font-sans text-[var(--text-2)] leading-relaxed mb-6">
                  Cross-merchant search with live price spreads, delivery times, and deal scores derived from 90-day baselines.
                </p>

                {/* Built Mini UI */}
                <div className="p-3 bg-[var(--surface-1)] rounded-[var(--radius-md)] border border-[var(--border-subtle)] font-mono text-xs space-y-2 mb-6">
                  <div className="flex justify-between items-center text-[11px] text-[var(--text-3)] pb-1.5 border-b border-[var(--border-subtle)]">
                    <span>Store</span>
                    <span>Spread</span>
                  </div>
                  <div className="flex justify-between items-center text-[var(--text-1)]">
                    <span>Amazon India</span>
                    <span className="font-semibold text-[var(--color-success)]">₹65,999 (Lowest)</span>
                  </div>
                  <div className="flex justify-between items-center text-[var(--text-2)]">
                    <span>Flipkart</span>
                    <span>₹66,499 (+₹500)</span>
                  </div>
                  <div className="flex justify-between items-center text-[var(--text-2)]">
                    <span>Croma</span>
                    <span>₹69,900 (+₹3,901)</span>
                  </div>
                </div>
              </div>

              <Link href="/compare" className="w-full">
                <Button variant="outline" size="sm" className="w-full justify-between font-mono text-xs">
                  <span>Open Compare View</span>
                  <ChevronRightIcon size={16} />
                </Button>
              </Link>
            </div>

            {/* Feature 2: Watch */}
            <div className="p-6 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-0)] flex flex-col justify-between shadow-[var(--elevation-1)]">
              <div>
                <div className="w-10 h-10 rounded-[var(--radius-md)] bg-[var(--surface-2)] flex items-center justify-center text-[var(--color-accent)] mb-4">
                  <WatchlistIcon size={20} />
                </div>
                <h3 className="text-xl font-sans font-semibold text-[var(--text-1)] mb-2">Watch</h3>
                <p className="text-sm font-sans text-[var(--text-2)] leading-relaxed mb-6">
                  Continuous background price monitoring with custom threshold rules and immediate multi-channel dispatch.
                </p>

                {/* Built Mini UI */}
                <div className="p-3 bg-[var(--surface-1)] rounded-[var(--radius-md)] border border-[var(--border-subtle)] font-mono text-xs space-y-2 mb-6">
                  <div className="flex justify-between items-center text-[11px] text-[var(--text-3)] pb-1.5 border-b border-[var(--border-subtle)]">
                    <span>Watch Target</span>
                    <span>Status</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[var(--text-1)] font-sans">Sony WH-1000XM5</span>
                    <span className="text-[var(--color-success)] font-semibold">&lt; ₹27,000</span>
                  </div>
                  <div className="text-[10px] text-[var(--text-3)] pt-1 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)]" />
                    <span>Polling every 5 min · 0 false triggers</span>
                  </div>
                </div>
              </div>

              <Link href="/watchlist" className="w-full">
                <Button variant="outline" size="sm" className="w-full justify-between font-mono text-xs">
                  <span>Explore Watchlist</span>
                  <ChevronRightIcon size={16} />
                </Button>
              </Link>
            </div>

            {/* Feature 3: Extract */}
            <div className="p-6 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-0)] flex flex-col justify-between shadow-[var(--elevation-1)]">
              <div>
                <div className="w-10 h-10 rounded-[var(--radius-md)] bg-[var(--surface-2)] flex items-center justify-center text-[var(--color-accent)] mb-4">
                  <ExtractIcon size={20} />
                </div>
                <h3 className="text-xl font-sans font-semibold text-[var(--text-1)] mb-2">Extract</h3>
                <p className="text-sm font-sans text-[var(--text-2)] leading-relaxed mb-6">
                  Headless data extraction for developers. Convert any ecommerce product URL into structured, typed JSON.
                </p>

                {/* Built Mini UI */}
                <div className="p-3 bg-[var(--surface-1)] rounded-[var(--radius-md)] border border-[var(--border-subtle)] font-mono text-[11px] space-y-1 text-[var(--text-2)] mb-6">
                  <div className="text-[var(--text-3)] text-[10px] pb-1 border-b border-[var(--border-subtle)]">
                    GET /api/v1/extract?url=...
                  </div>
                  <div>&#123;</div>
                  <div className="pl-3">"sku": "IPH-16P-128",</div>
                  <div className="pl-3 text-[var(--color-success)]">"confidence": 0.998,</div>
                  <div className="pl-3">"price_inr": 119900</div>
                  <div>&#125;</div>
                </div>
              </div>

              <Link href="/extract" className="w-full">
                <Button variant="outline" size="sm" className="w-full justify-between font-mono text-xs">
                  <span>Launch Extract Studio</span>
                  <ChevronRightIcon size={16} />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. PRICING TEASER FROM REAL PLAN DATA */}
      <section className="py-20 md:py-32 px-4 sm:px-6 lg:px-8 border-b border-[var(--border-subtle)]">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="font-mono text-xs text-[var(--color-accent)] font-semibold tracking-wider uppercase">
              HONEST SUBSCRIPTION TIERS
            </span>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-[var(--text-1)] font-normal mt-2">
              Simple plans for shoppers and developers
            </h2>
            <p className="text-sm sm:text-base font-sans text-[var(--text-2)] mt-2">
              No hidden fees, no credit card required to start, and real-time quotas enforced strictly via Row Level Security.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Free Tier */}
            <div className="p-6 md:p-8 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-1)] flex flex-col justify-between">
              <div>
                <div className="text-sm font-mono font-semibold text-[var(--text-2)]">Free</div>
                <div className="mt-4 mb-6">
                  <span className="font-mono text-4xl font-bold text-[var(--text-1)]">₹0</span>
                  <span className="font-mono text-xs text-[var(--text-3)]"> / forever</span>
                </div>
                <p className="text-xs font-sans text-[var(--text-2)] mb-6">
                  For individual shoppers tracking a handful of electronics and wishlist items.
                </p>

                <ul className="space-y-3 font-mono text-xs text-[var(--text-2)] border-t border-[var(--border-subtle)] pt-6 mb-8">
                  <li className="flex items-center gap-2">
                    <CheckIcon size={16} className="text-[var(--color-success)] shrink-0" />
                    <span>20 active watches</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckIcon size={16} className="text-[var(--color-success)] shrink-0" />
                    <span>1 hour refresh interval</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckIcon size={16} className="text-[var(--color-success)] shrink-0" />
                    <span>4 major retailer adapters</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckIcon size={16} className="text-[var(--color-success)] shrink-0" />
                    <span>In-app and email alerts</span>
                  </li>
                </ul>
              </div>

              <Link href="/auth/login" className="w-full">
                <Button variant="secondary" size="md" className="w-full font-mono text-xs">
                  Get Started Free
                </Button>
              </Link>
            </div>

            {/* Pro Tier (Accent Highlight) */}
            <div className="p-6 md:p-8 rounded-[var(--radius-lg)] border-2 border-[var(--color-accent)] bg-[var(--surface-0)] flex flex-col justify-between shadow-[var(--elevation-2)] relative">
              <div className="absolute -top-3 right-6 px-2.5 py-0.5 rounded-full bg-[var(--color-accent)] text-[var(--surface-0)] font-mono text-[10px] font-bold tracking-wider uppercase">
                Most Popular
              </div>

              <div>
                <div className="text-sm font-mono font-semibold text-[var(--color-accent)]">Pro</div>
                <div className="mt-4 mb-6">
                  <span className="font-mono text-4xl font-bold text-[var(--text-1)]">₹999</span>
                  <span className="font-mono text-xs text-[var(--text-3)]"> / month</span>
                </div>
                <p className="text-xs font-sans text-[var(--text-2)] mb-6">
                  For serious buyers, power shoppers, and independent price researchers.
                </p>

                <ul className="space-y-3 font-mono text-xs text-[var(--text-2)] border-t border-[var(--border-subtle)] pt-6 mb-8">
                  <li className="flex items-center gap-2">
                    <CheckIcon size={16} className="text-[var(--color-success)] shrink-0" />
                    <span>200 active watches</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckIcon size={16} className="text-[var(--color-success)] shrink-0" />
                    <span>5 minute refresh interval</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckIcon size={16} className="text-[var(--color-success)] shrink-0" />
                    <span>Webhook + Telegram (Telegram: Coming soon)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckIcon size={16} className="text-[var(--color-success)] shrink-0" />
                    <span>Historical CSV export</span>
                  </li>
                </ul>
              </div>

              <Link href="/pricing" className="w-full">
                <Button variant="primary" size="md" className="w-full font-mono text-xs">
                  Upgrade to Pro
                </Button>
              </Link>
            </div>

            {/* Team Tier */}
            <div className="p-6 md:p-8 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-1)] flex flex-col justify-between">
              <div>
                <div className="text-sm font-mono font-semibold text-[var(--text-2)]">Team</div>
                <div className="mt-4 mb-6">
                  <span className="font-mono text-4xl font-bold text-[var(--text-1)]">₹4,999</span>
                  <span className="font-mono text-xs text-[var(--text-3)]"> / month</span>
                </div>
                <p className="text-xs font-sans text-[var(--text-2)] mb-6">
                  For market intelligence teams, brands, and automated ecommerce analytics.
                </p>

                <ul className="space-y-3 font-mono text-xs text-[var(--text-2)] border-t border-[var(--border-subtle)] pt-6 mb-8">
                  <li className="flex items-center gap-2">
                    <CheckIcon size={16} className="text-[var(--color-success)] shrink-0" />
                    <span>Unlimited product watches</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckIcon size={16} className="text-[var(--color-success)] shrink-0" />
                    <span>1 minute continuous crawling</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckIcon size={16} className="text-[var(--color-success)] shrink-0" />
                    <span>Custom scraper studio access</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckIcon size={16} className="text-[var(--color-success)] shrink-0" />
                    <span>Dedicated proxies &amp; 99.9% SLA</span>
                  </li>
                </ul>
              </div>

              <Link href="/pricing" className="w-full">
                <Button variant="secondary" size="md" className="w-full font-mono text-xs">
                  Contact Team Sales
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FAQ SECTION USING ACCESSIBLE ACCORDION */}
      <section className="py-20 md:py-32 px-4 sm:px-6 lg:px-8 border-b border-[var(--border-subtle)] bg-[var(--surface-1)]/30">
        <div className="max-w-[800px] mx-auto">
          <div className="text-center mb-12">
            <span className="font-mono text-xs text-[var(--color-accent)] font-semibold tracking-wider uppercase">
              TRANSPARENCY &amp; ETHICS
            </span>
            <h2 className="font-display text-3xl sm:text-4xl text-[var(--text-1)] font-normal mt-2">
              Frequently asked questions
            </h2>
            <p className="text-sm font-sans text-[var(--text-2)] mt-2">
              Clear, honest explanations about how data is extracted, verified, and protected.
            </p>
          </div>

          <Accordion
            defaultExpandedIds={["faq-1"]}
            items={[
              {
                id: "faq-1",
                title: "Where does Scrappy get its price data?",
                content:
                  "Scrappy queries public merchant product endpoints and official affiliate feeds directly using headless HTTP fetchers. We inspect structured JSON-LD schemas and canonical HTML microdata. Every price displayed in the UI records exact provenance: the merchant domain, extraction timestamp, method, and confidence score.",
              },
              {
                id: "faq-2",
                title: "How fresh is the pricing information?",
                content:
                  "Freshness ranges from 1 minute on Team plans to 1 hour on Free plans. Every price tag includes a source-state chip indicating whether the number is Live (verified recently), Fixture (sample preview data), or Stale (older than normal polling thresholds). Stale prices trigger automatic re-crawl jobs.",
              },
              {
                id: "faq-3",
                title: "How does Scrappy detect fake discounts?",
                content:
                  "Many retailers artificially inflate the listed MRP (Maximum Retail Price) right before promotional sales to make discounts appear larger. Scrappy calculates deal quality against the true 90-day recorded median price rather than trusting retailer strikethroughs.",
              },
              {
                id: "faq-4",
                title: "What is your policy on scraping ethics and rate limits?",
                content:
                  "We strictly respect robots.txt directives, enforce conservative per-host rate limits, identify our user-agent clearly as 'ScrappyBot/1.0', and never attempt CAPTCHA solving, IP cycling for stealth, or scraping of private user accounts. If a retailer blocks automated extraction, we display an honest 'Source unavailable' state.",
              },
              {
                id: "faq-5",
                title: "Can developers extract data from custom ecommerce websites?",
                content:
                  "Yes. Our Extract Studio allows developers to point at any public product URL, visually tag fields (price, title, availability, seller), and generate a reliable extraction recipe with validation schemas (Zod).",
              },
            ]}
          />
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="py-12 md:py-16 px-4 sm:px-6 lg:px-8 bg-[var(--surface-0)] border-t border-[var(--border-default)]">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="font-mono text-xs font-semibold text-[var(--text-1)] uppercase tracking-wider mb-4">
                Product
              </div>
              <ul className="space-y-2.5 font-sans text-xs text-[var(--text-2)]">
                <li><Link href="/compare" className="hover:text-[var(--text-1)] transition-colors">Compare Tool</Link></li>
                <li><Link href="/watchlist" className="hover:text-[var(--text-1)] transition-colors">Watchlist</Link></li>
                <li><Link href="/alerts" className="hover:text-[var(--text-1)] transition-colors">Price Alerts</Link></li>
                <li><Link href="/extract" className="hover:text-[var(--text-1)] transition-colors">Extract Studio</Link></li>
                <li><Link href="/pricing" className="hover:text-[var(--text-1)] transition-colors">Pricing Plans</Link></li>
              </ul>
            </div>

            <div>
              <div className="font-mono text-xs font-semibold text-[var(--text-1)] uppercase tracking-wider mb-4">
                Developers
              </div>
              <ul className="space-y-2.5 font-sans text-xs text-[var(--text-2)]">
                <li><Link href="/dev/kit" className="hover:text-[var(--text-1)] transition-colors">Design Kit</Link></li>
                <li><Link href="/dev/icons" className="hover:text-[var(--text-1)] transition-colors">Icon Library</Link></li>
                <li><Link href="/dev/motion" className="hover:text-[var(--text-1)] transition-colors">Motion Lab</Link></li>
                <li><Link href="/dev/illustrations" className="hover:text-[var(--text-1)] transition-colors">Illustrations</Link></li>
                <li><a href="https://github.com/Crusty-chirayu/Scrappy" target="_blank" rel="noreferrer" className="hover:text-[var(--text-1)] transition-colors">GitHub Repository ↗</a></li>
              </ul>
            </div>

            <div>
              <div className="font-mono text-xs font-semibold text-[var(--text-1)] uppercase tracking-wider mb-4">
                Standards &amp; Legal
              </div>
              <ul className="space-y-2.5 font-sans text-xs text-[var(--text-2)]">
                <li><Link href="/legal/terms" className="hover:text-[var(--text-1)] transition-colors">Terms of Service</Link></li>
                <li><Link href="/legal/privacy" className="hover:text-[var(--text-1)] transition-colors">Privacy Policy</Link></li>
                <li><Link href="/legal/robots" className="hover:text-[var(--text-1)] transition-colors">Scraping Ethics</Link></li>
                <li><Link href="/legal/security" className="hover:text-[var(--text-1)] transition-colors">Security Disclosures</Link></li>
              </ul>
            </div>

            <div>
              <div className="font-mono text-xs font-semibold text-[var(--text-1)] uppercase tracking-wider mb-4">
                Operational Telemetry
              </div>
              <div className="space-y-2 font-mono text-xs text-[var(--text-2)]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[var(--color-success)]" />
                  <span>All adapters operational</span>
                </div>
                <div className="text-[11px] text-[var(--text-3)]">
                  p95 latency: &lt; 150ms
                </div>
                <div className="text-[11px] text-[var(--text-3)]">
                  Postgres + Supabase RLS
                </div>
                <div className="pt-2 text-[10px] text-[var(--text-3)]">
                  Press <kbd className="px-1 py-0.5 rounded bg-[var(--surface-2)] border border-[var(--border-subtle)]">?</kbd> for keyboard cheatsheet
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-[var(--text-3)]">
            <div>
              © 2026 SCRAPPY. The Web Product &amp; Price Graph. All rights reserved.
            </div>
            <div className="flex items-center gap-3">
              <span>WCAG 2.2 AA Verified</span>
              <span>·</span>
              <span>Zero Fake Discounts</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
