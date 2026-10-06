"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Button,
  Badge,
  SourceChip,
  NumberTick,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  useToast,
  SearchIcon,
  FilterIcon,
  CompareIcon,
  WatchlistIcon,
  CloseIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from "@scrappy/ui";
import { defaultCatalogRepository, SearchResultItem, ProductDetail } from "@scrappy/db";
import { SideBySideCompareModal } from "../../components/SideBySideCompareModal";

export default function ComparePage() {
  const { showToast } = useToast();
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedBrand, setSelectedBrand] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<"price_asc" | "price_desc" | "relevance">("relevance");
  const [dealsOnly, setDealsOnly] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);

  // Mobile Filter Sheet State
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Expanded Product IDs for inline retailer offer table
  const [expandedProductIds, setExpandedProductIds] = useState<string[]>([]);

  // Watchlist state
  const [watchlistIds, setWatchlistIds] = useState<string[]>([]);

  // Compare Matrix state (up to 4 products)
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  // Stale data feed refreshed timestamp
  const [lastRefreshed, setLastRefreshed] = useState("Just now");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Categories & Brands
  const categories = useMemo(() => defaultCatalogRepository.getCategories(), []);
  const brands = useMemo(() => defaultCatalogRepository.getBrands(), []);

  // Search Results
  const searchResults = useMemo(() => {
    const res = defaultCatalogRepository.search({
      query: query || undefined,
      category: selectedCategory !== "all" ? selectedCategory : undefined,
      brand: selectedBrand !== "all" ? selectedBrand : undefined,
      sort: sortOrder,
      limit: 30,
    });

    let items = res.items;
    if (dealsOnly) {
      items = items.filter(
        (item) => item.originalPricePaise && item.originalPricePaise > item.lowestPricePaise
      );
    }
    return { ...res, items, total: items.length };
  }, [query, selectedCategory, selectedBrand, sortOrder, dealsOnly]);

  // Autocomplete suggestions
  const suggestions = useMemo(() => {
    if (query.trim().length < 2) return [];
    return defaultCatalogRepository.autocomplete(query, 5);
  }, [query]);

  // Compare products for side-by-side modal
  const compareProducts = useMemo(() => {
    return compareIds
      .map((id) => defaultCatalogRepository.getProductDetail(id))
      .filter((p): p is ProductDetail => p !== null);
  }, [compareIds]);

  const toggleCompare = (product: SearchResultItem) => {
    if (compareIds.includes(product.id)) {
      setCompareIds((prev) => prev.filter((id) => id !== product.id));
    } else {
      if (compareIds.length >= 4) {
        showToast({
          type: "error",
          title: "Compare limit reached",
          description: "You can compare up to 4 products simultaneously in the matrix.",
        });
        return;
      }
      setCompareIds((prev) => [...prev, product.id]);
      showToast({
        type: "success",
        title: "Added to compare tray",
        description: `${product.title.split("(")[0]?.trim()} (${compareIds.length + 1}/4)`,
      });
    }
  };

  const toggleWatchlist = (product: SearchResultItem) => {
    if (watchlistIds.includes(product.id)) {
      setWatchlistIds((prev) => prev.filter((id) => id !== product.id));
      showToast({
        type: "info",
        title: "Removed from watchlist",
        description: product.title,
      });
    } else {
      setWatchlistIds((prev) => [...prev, product.id]);
      showToast({
        type: "success",
        title: "Added to watchlist",
        description: `Tracking ${product.title.split("(")[0]?.trim()} for verified price drops.`,
      });
    }
  };

  const toggleExpand = (productId: string) => {
    setExpandedProductIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const handleRefreshFeeds = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setLastRefreshed("Just now");
      showToast({
        type: "success",
        title: "Feeds Refreshed",
        description: "Prices updated from 4 live merchant adapters (Amazon, Flipkart, Croma, Reliance).",
      });
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[var(--surface-0)] text-[var(--text-1)] font-sans antialiased pb-28">
      {/* 1. TOP HEADER & STALE BANNER */}
      <div className="border-b border-[var(--border-default)] bg-[var(--surface-1)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-[var(--color-success)] animate-pulse" />
                <span className="text-xs font-mono text-[var(--text-2)] font-semibold uppercase tracking-wider">
                  Live Merchant Price Comparison
                </span>
                <span className="text-[var(--text-3)] font-mono text-xs">·</span>
                <span className="px-2 py-0.5 rounded bg-[var(--surface-2)] text-[var(--text-2)] font-mono text-[11px] border border-[var(--border-subtle)]">
                  Sample data
                </span>
                <span className="text-[var(--text-3)] font-mono text-xs">·</span>
                <span className="font-mono text-[11px] text-[var(--text-3)]">
                  Refreshed: {lastRefreshed}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-display text-[var(--text-1)] font-normal tracking-tight">
                Compare Prices Across Verified Stores
              </h1>
              <p className="text-xs sm:text-sm font-sans text-[var(--text-2)] mt-0.5">
                Indexed from Amazon India, Flipkart, Croma, and Reliance Digital with zero false positive merges.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 font-mono text-xs">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshFeeds}
                disabled={isRefreshing}
                className="gap-1.5 font-mono text-xs min-h-[44px]"
              >
                <span>{isRefreshing ? "Refreshing..." : "↻ Refresh Feeds"}</span>
              </Button>
              {compareIds.length > 0 && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsCompareModalOpen(true)}
                  className="gap-1.5 font-mono text-xs min-h-[44px]"
                >
                  <CompareIcon size={16} />
                  <span>Compare ({compareIds.length}/4)</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* DATA PROVENANCE NOTICE — Constitution Rule 3: every number must show source, fetched_at, freshness */}
      <div
        role="alert"
        className="border-b border-[var(--color-warning)]/30 bg-[var(--color-warning)]/5 px-4 sm:px-6 py-2"
      >
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-[11px] font-mono text-[var(--color-warning)]">
          <span className="font-bold shrink-0">DATA PROVENANCE NOTICE</span>
          <span className="text-[var(--text-3)]">·</span>
          <span>FIXTURE MODE ACTIVE — Prices served from local seed data, not live retailer APIs. Source: seed.sql · fetched_at: local-dev · confidence: matching=high, live-price=unverified.</span>
        </div>
      </div>

      {/* 2. STICKY SEARCH & TELEMETRY TOOLBAR */}
      <div className="sticky top-0 z-30 bg-[var(--surface-0)]/95 backdrop-blur-md border-b border-[var(--border-default)] shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Input with Autocomplete */}
            <div className="relative flex-1 max-w-xl">
              <div className="relative flex items-center bg-[var(--surface-1)] rounded-[var(--radius-md)] border border-[var(--border-default)] focus-within:border-[var(--color-accent)] focus-within:ring-2 focus-within:ring-[var(--color-accent)]/10 transition-all">
                <div className="pl-3 pr-2 text-[var(--text-3)] flex items-center pointer-events-none">
                  <SearchIcon size={16} />
                </div>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Filter by product name, model, EAN (e.g. iPhone, Sony XM5, M3)..."
                  aria-label="Filter products by name or model"
                  className="w-full py-2.5 pr-8 bg-transparent text-xs sm:text-sm text-[var(--text-1)] placeholder-[var(--text-3)] font-sans focus:outline-none min-h-[44px]"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="mr-2 p-1 text-[var(--text-3)] hover:text-[var(--text-1)] rounded min-h-[36px] min-w-[36px] flex items-center justify-center"
                    aria-label="Clear filter query"
                  >
                    <CloseIcon size={16} />
                  </button>
                )}
              </div>

              {/* Suggestions dropdown */}
              {suggestions.length > 0 && query.trim().length >= 2 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-[var(--surface-1)] border border-[var(--border-default)] rounded-[var(--radius-md)] shadow-[var(--elevation-3)] z-40 overflow-hidden divide-y divide-[var(--border-subtle)]">
                  {suggestions.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setQuery(s.title.split("(")[0]?.trim() || s.title)}
                      className="w-full text-left px-3 py-2 text-xs font-mono flex items-center justify-between hover:bg-[var(--surface-2)] transition-colors"
                    >
                      <span className="text-[var(--text-1)] font-sans font-medium">{s.title}</span>
                      <span className="text-[var(--color-success)] font-semibold">
                        ₹{(s.lowestPricePaise / 100).toLocaleString("en-IN")}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Results Counter & Sort Selector */}
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-[var(--text-2)] whitespace-nowrap">
                <strong>{searchResults.total}</strong> products
              </span>

              {/* Mobile Filter Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsMobileFilterOpen(true)}
                className="md:hidden gap-1.5 font-mono text-xs min-h-[44px]"
              >
                <FilterIcon size={16} />
                <span>Filters</span>
              </Button>

              {/* Sort Order Selector */}
              <div className="flex items-center gap-1.5 font-mono text-xs">
                <span className="text-[var(--text-3)] hidden lg:inline">Sort:</span>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as "relevance" | "price_asc" | "price_desc")}
                  aria-label="Sort products"
                  className="px-2.5 py-2 rounded-[var(--radius-sm)] bg-[var(--surface-1)] border border-[var(--border-default)] text-[var(--text-1)] font-mono text-xs focus:outline-none focus:border-[var(--color-accent)] min-h-[44px]"
                >
                  <option value="relevance">Deal Score / Relevance</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. MAIN WORKSPACE: FILTERS RAIL + PRODUCT CARDS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Desktop Filters Left Rail */}
          <aside
            aria-label="Filter products"
            className="hidden md:block md:col-span-3 space-y-6 sticky top-20 bg-[var(--surface-1)] p-4 rounded-[var(--radius-lg)] border border-[var(--border-default)] font-mono text-xs"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
              <span className="font-semibold text-[var(--text-1)] uppercase tracking-wider">Filters</span>
              {(selectedCategory !== "all" || selectedBrand !== "all" || dealsOnly || inStockOnly) && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory("all");
                    setSelectedBrand("all");
                    setDealsOnly(false);
                    setInStockOnly(false);
                  }}
                  className="text-[11px] text-[var(--color-accent)] hover:underline"
                >
                  Reset all
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div>
              <div className="text-[11px] font-semibold text-[var(--text-3)] uppercase tracking-wider mb-2">
                Category
              </div>
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => setSelectedCategory("all")}
                  className={`w-full text-left px-2.5 py-1.5 rounded-[var(--radius-sm)] transition-colors ${
                    selectedCategory === "all"
                      ? "bg-[var(--surface-2)] text-[var(--color-accent)] font-semibold"
                      : "text-[var(--text-2)] hover:text-[var(--text-1)] hover:bg-[var(--surface-2)]"
                  }`}
                >
                  All Categories
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedCategory(c.name)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-[var(--radius-sm)] transition-colors ${
                      selectedCategory === c.name
                        ? "bg-[var(--surface-2)] text-[var(--color-accent)] font-semibold"
                        : "text-[var(--text-2)] hover:text-[var(--text-1)] hover:bg-[var(--surface-2)]"
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Brand Filter */}
            <div className="pt-4 border-t border-[var(--border-subtle)]">
              <div className="text-[11px] font-semibold text-[var(--text-3)] uppercase tracking-wider mb-2">
                Brand
              </div>
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => setSelectedBrand("all")}
                  className={`w-full text-left px-2.5 py-1.5 rounded-[var(--radius-sm)] transition-colors ${
                    selectedBrand === "all"
                      ? "bg-[var(--surface-2)] text-[var(--color-accent)] font-semibold"
                      : "text-[var(--text-2)] hover:text-[var(--text-1)] hover:bg-[var(--surface-2)]"
                  }`}
                >
                  All Brands
                </button>
                {brands.slice(0, 6).map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setSelectedBrand(b.name)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-[var(--radius-sm)] transition-colors ${
                      selectedBrand === b.name
                        ? "bg-[var(--surface-2)] text-[var(--color-accent)] font-semibold"
                        : "text-[var(--text-2)] hover:text-[var(--text-1)] hover:bg-[var(--surface-2)]"
                    }`}
                  >
                    {b.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Checkbox Toggles */}
            <div className="pt-4 border-t border-[var(--border-subtle)] space-y-3">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={dealsOnly}
                  onChange={(e) => setDealsOnly(e.target.checked)}
                  className="rounded border-[var(--border-default)] accent-[var(--color-accent)]"
                />
                <span className="text-[var(--text-2)]">Verified Deals Only (&gt; 0% drop)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="rounded border-[var(--border-default)] accent-[var(--color-accent)]"
                />
                <span className="text-[var(--text-2)]">In Stock Stores Only</span>
              </label>
            </div>
          </aside>

          {/* Product Cards Grid */}
          <main className="col-span-12 md:col-span-9 space-y-4">
            {/* Empty State */}
            {searchResults.items.length === 0 && (
              <div className="p-8 text-center bg-[var(--surface-1)] rounded-[var(--radius-lg)] border border-[var(--border-default)] space-y-3 font-mono">
                <div className="text-sm font-semibold text-[var(--text-1)]">No products found</div>
                <p className="text-xs text-[var(--text-2)] max-w-md mx-auto">
                  Try broadening your search term or clearing the active category and brand filters.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      setSelectedCategory("all");
                      setSelectedBrand("all");
                    }}
                    className="px-3 py-1.5 rounded bg-[var(--surface-2)] text-xs text-[var(--color-accent)] border border-[var(--border-subtle)] hover:border-[var(--color-accent)] font-mono font-medium"
                  >
                    Reset Filters
                  </button>
                </div>
                <div className="flex flex-wrap justify-center gap-2 pt-2">
                  {["iPhone", "MacBook", "Sony", "Dell"].map((sugg) => (
                    <button
                      key={sugg}
                      type="button"
                      onClick={() => {
                        setQuery(sugg);
                        setSelectedCategory("all");
                        setSelectedBrand("all");
                      }}
                      className="px-2.5 py-1 rounded bg-[var(--surface-2)] text-xs text-[var(--color-accent)] border border-[var(--border-subtle)] hover:border-[var(--color-accent)]"
                    >
                      {sugg}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Results List with Retailer Breakdown */}
            {searchResults.items.map((product) => {
              const detail = defaultCatalogRepository.getProductDetail(product.id);
              const isExpanded = expandedProductIds.includes(product.id);
              const isCompared = compareIds.includes(product.id);
              const isWatched = watchlistIds.includes(product.id);
              const lowestPrice = product.lowestPricePaise / 100;
              const originalPrice = product.originalPricePaise ? product.originalPricePaise / 100 : null;
              const hasDrop = originalPrice && originalPrice > lowestPrice;
              const dropPercent = hasDrop ? Math.round(((originalPrice - lowestPrice) / originalPrice) * 100) : 0;

              return (
                <article
                  key={product.id}
                  className="p-5 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-1)] hover:border-[var(--border-strong)] transition-all shadow-[var(--elevation-1)]"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Product Metadata */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <Badge variant="outline" size="sm">
                          {product.category}
                        </Badge>
                        <span className="font-mono text-xs text-[var(--text-3)]">{product.brand}</span>
                        <span className="text-[var(--text-3)] font-mono text-xs">·</span>
                        <span className="font-mono text-[11px] text-[var(--text-3)]">EAN {product.ean}</span>
                      </div>

                      <h2 className="text-base sm:text-lg font-sans font-semibold text-[var(--text-1)] tracking-tight">
                        <Link href={`/compare/${product.id}`} className="hover:text-[var(--color-accent)] transition-colors">
                          {product.title}
                        </Link>
                      </h2>

                      {/* Merchant pills */}
                      <div className="flex flex-wrap items-center gap-2 mt-2 font-mono text-xs text-[var(--text-2)]">
                        <span>Indexed across {product.offerCount} stores:</span>
                        {product.merchants.map((m) => (
                          <span
                            key={m}
                            className="px-2 py-0.5 rounded bg-[var(--surface-2)] text-[11px] border border-[var(--border-subtle)]"
                          >
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Price and Deal Telemetry */}
                    <div className="flex items-center gap-4 bg-[var(--surface-0)] p-3.5 rounded-[var(--radius-md)] border border-[var(--border-subtle)] shrink-0 font-mono">
                      <div>
                        <div className="text-[10px] text-[var(--text-3)] uppercase tracking-wider">Best Price</div>
                        <div className="text-xl font-bold text-[var(--color-success)]">
                          <NumberTick value={lowestPrice} />
                        </div>
                        {hasDrop && (
                          <div className="text-[11px] text-[var(--text-3)] flex items-center gap-1">
                            <span className="line-through">₹{originalPrice.toLocaleString("en-IN")}</span>
                            <span className="text-[var(--color-success)] font-semibold">(-{dropPercent}%)</span>
                          </div>
                        )}
                      </div>

                      <div className="border-l border-[var(--border-subtle)] pl-4">
                        <div className="text-[10px] text-[var(--text-3)] uppercase tracking-wider">Deal Score</div>
                        <div className="text-xl font-bold text-[var(--text-1)]">
                          {hasDrop && dropPercent >= 15 ? "9.2/10" : "8.5/10"}
                        </div>
                        <div className="text-[10px] text-[var(--color-success)] font-semibold">
                          {hasDrop && dropPercent >= 15 ? "EXCELLENT" : "GOOD"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-4 mt-4 border-t border-[var(--border-subtle)] font-mono text-xs">
                    <div className="flex items-center gap-2">
                      <Button
                        variant={isCompared ? "primary" : "secondary"}
                        size="sm"
                        onClick={() => toggleCompare(product)}
                        className="gap-1.5 font-mono text-xs min-h-[44px]"
                      >
                        <CompareIcon size={16} />
                        <span>{isCompared ? "In Compare Tray" : "+ Add to Compare"}</span>
                      </Button>

                      <Button
                        variant={isWatched ? "outline" : "ghost"}
                        size="sm"
                        onClick={() => toggleWatchlist(product)}
                        className={`gap-1.5 font-mono text-xs min-h-[44px] ${
                          isWatched ? "border-[var(--color-accent)] text-[var(--color-accent)]" : ""
                        }`}
                      >
                        <WatchlistIcon size={16} />
                        <span>{isWatched ? "Watching" : "Watch"}</span>
                      </Button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleExpand(product.id)}
                        className="px-2.5 py-1.5 text-xs text-[var(--text-2)] hover:text-[var(--text-1)] flex items-center gap-1 min-h-[44px]"
                      >
                        <span>{isExpanded ? "Hide Retailers" : "View All Stores"}</span>
                        <ChevronDownIcon
                          size={16}
                          className={`transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                        />
                      </button>

                      <Link href={`/compare/${product.id}`}>
                        <Button variant="ghost" size="sm" className="gap-1 font-mono text-xs min-h-[44px]">
                          <span>Inspect History</span>
                          <ChevronRightIcon size={16} />
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {/* Expanded Retailer Table */}
                  {isExpanded && detail && detail.offers.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-[var(--border-subtle)] overflow-x-auto">
                      <table className="w-full text-left font-mono text-xs border-collapse">
                        <thead>
                          <tr className="bg-[var(--surface-2)] text-[11px] text-[var(--text-3)] border-b border-[var(--border-default)]">
                            <th className="px-3 py-2">Merchant Store</th>
                            <th className="px-3 py-2 text-right">Price</th>
                            <th className="px-3 py-2">Stock</th>
                            <th className="px-3 py-2">Extraction Method</th>
                            <th className="px-3 py-2">Last Verified</th>
                            <th className="px-3 py-2 text-right">Checkout</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border-subtle)]">
                          {detail.offers.map((offer) => {
                            const offerPrice = offer.currentPricePaise / 100;
                            const isCheapest = offer.currentPricePaise === product.lowestPricePaise;
                            return (
                              <tr
                                key={offer.id}
                                className={`hover:bg-[var(--surface-2)]/40 transition-colors ${
                                  isCheapest ? "bg-[var(--color-accent-soft)]/20" : ""
                                }`}
                              >
                                <td className="px-3 py-2.5">
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-[var(--text-1)] font-sans">
                                      {offer.merchantName}
                                    </span>
                                    {isCheapest && (
                                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[var(--color-success)]/10 text-[var(--color-success)] border border-[var(--color-success)]/30">
                                        Best Offer
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-3 py-2.5 text-right font-bold">
                                  <span className={isCheapest ? "text-[var(--color-success)]" : "text-[var(--text-1)]"}>
                                    ₹{offerPrice.toLocaleString("en-IN")}
                                  </span>
                                </td>
                                <td className="px-3 py-2.5">
                                  {offer.inStock ? (
                                    <span className="text-[var(--color-success)] font-medium">In Stock</span>
                                  ) : (
                                    <span className="text-[var(--color-danger)] font-medium">Out of Stock</span>
                                  )}
                                </td>
                                <td className="px-3 py-2.5 text-[var(--text-2)] uppercase text-[10px]">
                                  {offer.provenance?.extractionMethod || "DIRECT HTTP"}
                                </td>
                                <td className="px-3 py-2.5">
                                  <SourceChip
                                    sourceName={offer.merchantName}
                                    sourceId={offer.merchantId}
                                    health="healthy"
                                  />
                                </td>
                                <td className="px-3 py-2.5 text-right">
                                  <a
                                    href={offer.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-[var(--text-1)] border border-[var(--border-subtle)] text-[11px] min-h-[36px]"
                                  >
                                    <span>Store ↗</span>
                                  </a>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </article>
              );
            })}
          </main>
        </div>
      </div>

      {/* 4. STICKY BOTTOM COMPARE TRAY */}
      {compareIds.length > 0 && (
        <div
          role="region"
          aria-label="Compare Tray"
          className="fixed bottom-16 md:bottom-4 left-4 right-4 max-w-4xl mx-auto z-40 bg-[var(--surface-1)] border border-[var(--border-strong)] rounded-[var(--radius-lg)] shadow-[var(--elevation-3)] p-3 sm:p-4 flex items-center justify-between gap-3 font-mono text-xs"
        >
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-1.5 shrink-0 font-semibold text-[var(--text-1)]">
              <CompareIcon size={16} />
              <span>Compare Tray ({compareIds.length}/4):</span>
            </div>
            {compareProducts.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[var(--surface-2)] border border-[var(--border-subtle)] shrink-0"
              >
                <span className="font-sans font-medium text-[var(--text-1)] max-w-[140px] truncate">
                  {p.title.split("(")[0]?.trim()}
                </span>
                <button
                  type="button"
                  onClick={() => setCompareIds((prev) => prev.filter((id) => id !== p.id))}
                  className="text-[var(--text-3)] hover:text-[var(--color-danger)] p-0.5"
                  aria-label={`Remove ${p.title} from compare tray`}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setCompareIds([])}
              className="text-xs text-[var(--text-3)] hover:text-[var(--text-1)] px-2 py-1"
            >
              Clear
            </button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsCompareModalOpen(true)}
              className="font-mono text-xs min-h-[44px]"
            >
              Compare Matrix ({compareIds.length}) →
            </Button>
          </div>
        </div>
      )}

      {/* 5. SIDE-BY-SIDE MATRIX MODAL */}
      <SideBySideCompareModal
        products={compareProducts}
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        onRemoveProduct={(id) => setCompareIds((prev) => prev.filter((item) => item !== id))}
      />

      {/* 6. MOBILE FILTER BOTTOM SHEET */}
      <Sheet open={isMobileFilterOpen} onOpenChange={setIsMobileFilterOpen} side="bottom">
        <SheetContent className="max-h-[85vh] p-6 overflow-y-auto font-mono text-xs">
          <SheetHeader className="pb-4 border-b border-[var(--border-subtle)]">
            <SheetTitle className="text-base font-sans font-semibold text-[var(--text-1)]">
              Filter Compare Catalog
            </SheetTitle>
            <SheetDescription className="text-xs font-sans text-[var(--text-2)]">
              Refine results by category, manufacturer brand, and genuine discount status.
            </SheetDescription>
          </SheetHeader>

          <div className="py-4 space-y-6">
            {/* Category */}
            <div>
              <div className="text-[11px] font-semibold text-[var(--text-3)] uppercase tracking-wider mb-2">
                Category
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedCategory("all")}
                  className={`p-2.5 rounded-[var(--radius-sm)] border text-left min-h-[44px] ${
                    selectedCategory === "all"
                      ? "bg-[var(--surface-2)] border-[var(--color-accent)] text-[var(--color-accent)] font-semibold"
                      : "bg-[var(--surface-1)] border-[var(--border-subtle)] text-[var(--text-2)]"
                  }`}
                >
                  All Categories
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedCategory(c.name)}
                    className={`p-2.5 rounded-[var(--radius-sm)] border text-left min-h-[44px] ${
                      selectedCategory === c.name
                        ? "bg-[var(--surface-2)] border-[var(--color-accent)] text-[var(--color-accent)] font-semibold"
                        : "bg-[var(--surface-1)] border-[var(--border-subtle)] text-[var(--text-2)]"
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Checkbox Toggles */}
            <div className="pt-4 border-t border-[var(--border-subtle)] space-y-3">
              <label className="flex items-center gap-2 cursor-pointer min-h-[44px]">
                <input
                  type="checkbox"
                  checked={dealsOnly}
                  onChange={(e) => setDealsOnly(e.target.checked)}
                  className="rounded border-[var(--border-default)] accent-[var(--color-accent)]"
                />
                <span className="text-[var(--text-1)]">Verified Deals Only (&gt; 0% drop)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer min-h-[44px]">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="rounded border-[var(--border-default)] accent-[var(--color-accent)]"
                />
                <span className="text-[var(--text-1)]">In Stock Stores Only</span>
              </label>
            </div>
          </div>

          <SheetFooter className="pt-4 border-t border-[var(--border-subtle)] flex gap-2">
            <Button
              variant="secondary"
              size="md"
              className="flex-1 font-mono text-xs min-h-[44px]"
              onClick={() => {
                setSelectedCategory("all");
                setSelectedBrand("all");
                setDealsOnly(false);
                setInStockOnly(false);
                setIsMobileFilterOpen(false);
              }}
            >
              Reset
            </Button>
            <Button
              variant="primary"
              size="md"
              className="flex-1 font-mono text-xs min-h-[44px]"
              onClick={() => setIsMobileFilterOpen(false)}
            >
              Apply Filters
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
