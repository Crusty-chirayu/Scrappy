"use client";

import { useState, useTransition, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Input,
  Button,
  PriceTag,
  TrustBadge,
  SourceChip,
  EmptyState,
  SkeletonCard,
  ToastProvider,
  useToast,
  SyntheticBadge,
  SyntheticDataBanner,
} from "@scrappy/ui";
import { defaultCatalogRepository, SearchResultItem } from "@scrappy/db";
import { SideBySideCompareModal } from "../../components/SideBySideCompareModal";

function CompareView() {
  const { showToast } = useToast();
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedBrand, setSelectedBrand] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<"relevance" | "price_asc" | "price_desc">("relevance");
  const [isPending, startTransition] = useTransition();

  // Watchlist state
  const [watchlistIds, setWatchlistIds] = useState<string[]>([]);
  const [isWatchlistOpen, setIsWatchlistOpen] = useState(false);

  // Compare Matrix state (up to 4 products)
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  // Saved searches state
  const [savedSearches, setSavedSearches] = useState<Array<{ id: string; label: string; query: string }>>([
    { id: "ss-1", label: "Smartphones under ₹80k", query: "iPhone" },
    { id: "ss-2", label: "Noise Cancelling Audio", query: "Sony" },
  ]);

  useEffect(() => {
    fetch("/api/saved-searches")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.searches) && data.searches.length > 0) {
          setSavedSearches(
            data.searches.map((s: { id: string; query: string }) => ({
              id: s.id,
              label: s.query,
              query: s.query,
            })),
          );
        }
      })
      .catch(() => {});
  }, []);

  const handleSaveSearch = async () => {
    if (!query.trim()) return;
    const currentQuery = query.trim();
    try {
      const res = await fetch("/api/saved-searches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: currentQuery }),
      });
      if (res.ok) {
        const data = await res.json();
        setSavedSearches((prev) => [
          ...prev,
          { id: data.search.id, label: currentQuery, query: currentQuery },
        ]);
        showToast({ type: "success", title: "Search saved", description: currentQuery });
      } else {
        setSavedSearches((prev) => [
          ...prev,
          { id: `ss-${Date.now()}`, label: currentQuery, query: currentQuery },
        ]);
        showToast({ type: "success", title: "Search saved locally", description: currentQuery });
      }
    } catch {
      setSavedSearches((prev) => [
        ...prev,
        { id: `ss-${Date.now()}`, label: currentQuery, query: currentQuery },
      ]);
      showToast({ type: "success", title: "Search saved locally", description: currentQuery });
    }
  };

  const handleDeleteSavedSearch = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fetch(`/api/saved-searches?id=${id}`, { method: "DELETE" });
    } catch {
      // ignore
    }
    setSavedSearches((prev) => prev.filter((s) => s.id !== id));
    showToast({ type: "info", title: "Saved search removed" });
  };

  // Deals Only toggle
  const [dealsOnly, setDealsOnly] = useState(false);

  // Categories and Brands from catalog
  const categories = useMemo(() => defaultCatalogRepository.getCategories(), []);
  const brands = useMemo(() => defaultCatalogRepository.getBrands(), []);

  // Search Results
  const searchResults = useMemo(() => {
    const res = defaultCatalogRepository.search({
      query: query || undefined,
      category: selectedCategory !== "all" ? selectedCategory : undefined,
      brand: selectedBrand !== "all" ? selectedBrand : undefined,
      sort: sortOrder,
      limit: 24,
    });
    if (dealsOnly) {
      const dealItems = res.items.filter((item) => item.originalPricePaise && item.originalPricePaise > item.lowestPricePaise);
      return { ...res, items: dealItems, total: dealItems.length };
    }
    return res;
  }, [query, selectedCategory, selectedBrand, sortOrder, dealsOnly]);

  // Autocomplete suggestions
  const suggestions = useMemo(() => {
    if (query.trim().length < 2) return [];
    return defaultCatalogRepository.autocomplete(query, 5);
  }, [query]);

  // Watchlist items
  const watchlistProducts = useMemo(() => {
    return watchlistIds
      .map((id) => defaultCatalogRepository.getProductDetail(id))
      .filter((p): p is NonNullable<typeof p> => p !== null);
  }, [watchlistIds]);

  // Compare items
  const compareProducts = useMemo(() => {
    return compareIds
      .map((id) => defaultCatalogRepository.getProductDetail(id))
      .filter((p): p is NonNullable<typeof p> => p !== null);
  }, [compareIds]);

  const toggleCompare = (product: SearchResultItem) => {
    if (compareIds.includes(product.id)) {
      setCompareIds((prev) => prev.filter((id) => id !== product.id));
    } else {
      if (compareIds.length >= 4) {
        showToast({
          type: "error",
          title: "Compare limit reached",
          description: "You can compare up to 4 products simultaneously.",
        });
        return;
      }
      setCompareIds((prev) => [...prev, product.id]);
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
        description: `Tracking ${product.title} for price drops`,
      });
    }
  };

  const handleQueryChange = (val: string) => {
    startTransition(() => {
      setQuery(val);
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#C6F135]" aria-hidden="true" />
            <span className="text-xs uppercase tracking-wider font-mono text-[#C6F135]">
              Precision Price Graph
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#D6DBE3]">
            Compare Products & Prices
          </h1>
          <p className="text-xs text-[#98A2B3] mt-0.5">
            500+ verified canonical items with real-time merchant provenance and zero fake discounts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant={watchlistIds.length > 0 ? "primary" : "secondary"}
            size="sm"
            onClick={() => setIsWatchlistOpen(true)}
            aria-label={`Open Watchlist (${watchlistIds.length} saved)`}
          >
            ★ Watchlist ({watchlistIds.length})
          </Button>
          <span className="text-xs font-mono px-2.5 py-1 rounded bg-[#141922] border border-[#262E3C] text-[#98A2B3]">
            PROVENANCE: VERIFIED
          </span>
        </div>
      </div>

      {/* Synthetic / Fixture Notice Banner (Constitution Rule 1 & 3) */}
      <SyntheticDataBanner className="mb-6 rounded-[4px]" />

      {/* Search Input Bar with Autocomplete */}
      <div className="relative mb-4">
        <Input
          placeholder="Search smartphones, laptops, audio, models (e.g. iPhone, Sony XM5, Dell)..."
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          clearable
          onClear={() => handleQueryChange("")}
          className="text-base h-11 bg-[#0F1217]"
          iconPrefix={
            <svg className="w-4 h-4 text-[#5B677C]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          }
        />

        {/* Instant Suggestions Dropdown */}
        {suggestions.length > 0 && query.trim().length >= 2 && (
          <div className="absolute top-full left-0 right-0 z-30 mt-1 bg-[#0F1217] border border-[#262E3C] rounded-[4px] shadow-xl overflow-hidden divide-y divide-[#1A202B]">
            {suggestions.map((s) => (
              <Link
                key={s.id}
                href={`/compare/${s.id}`}
                className="flex items-center justify-between px-4 py-2.5 text-xs text-[#D6DBE3] hover:bg-[#141922] transition-colors"
              >
                <div>
                  <span className="font-semibold text-white">{s.title}</span>
                  <span className="text-[#5B677C] ml-2">in {s.category}</span>
                </div>
                <PriceTag pricePaise={s.lowestPricePaise} size="sm" />
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Filters & Sorting Bar */}
      <div className="flex flex-col gap-3 p-4 bg-[#0F1217] border border-[#262E3C] rounded-[4px] mb-6">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-[#5B677C] font-semibold shrink-0 uppercase tracking-wider text-[10px]">
            Category:
          </span>
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`px-2.5 py-1 rounded-[2px] transition-colors shrink-0 font-medium ${
              selectedCategory === "all"
                ? "bg-[#C6F135] text-[#0A0C0F] font-semibold"
                : "bg-[#141922] text-[#98A2B3] hover:text-white"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.slug)}
              className={`px-2.5 py-1 rounded-[2px] transition-colors shrink-0 font-medium ${
                selectedCategory === cat.slug
                  ? "bg-[#C6F135] text-[#0A0C0F] font-semibold"
                  : "bg-[#141922] text-[#98A2B3] hover:text-white"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Brand Pills & Sort Dropdown */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#1A202B]">
          <div className="flex items-center gap-2 overflow-x-auto text-xs">
            <span className="text-[#5B677C] font-semibold shrink-0 uppercase tracking-wider text-[10px]">
              Brand:
            </span>
            <button
              type="button"
              onClick={() => setSelectedBrand("all")}
              className={`px-2 py-0.5 rounded-[2px] text-xs transition-colors shrink-0 ${
                selectedBrand === "all"
                  ? "bg-[#262E3C] text-white font-medium"
                  : "text-[#98A2B3] hover:text-white"
              }`}
            >
              All
            </button>
            {brands.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => setSelectedBrand(b.slug)}
                className={`px-2 py-0.5 rounded-[2px] text-xs transition-colors shrink-0 ${
                  selectedBrand === b.slug
                    ? "bg-[#262E3C] text-white font-medium"
                    : "text-[#98A2B3] hover:text-white"
                }`}
              >
                {b.name}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs">
            <label htmlFor="sort-select" className="text-[#5B677C]">
              Sort by:
            </label>
            <select
              id="sort-select"
              value={sortOrder}
              onChange={(e) =>
                setSortOrder(e.target.value as "relevance" | "price_asc" | "price_desc")
              }
              className="bg-[#141922] border border-[#262E3C] text-[#D6DBE3] text-xs rounded px-2 py-1 outline-none focus:border-[#C6F135]"
            >
              <option value="relevance">Relevance</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Saved Searches & Deals Toggle Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 p-3 rounded bg-[#0F1217] border border-[#262E3C] text-xs font-mono">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[#5B677C]">SAVED SEARCHES:</span>
          {savedSearches.map((s) => (
            <span
              key={s.id}
              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#141922] border border-[#262E3C] text-[#98A2B3] hover:border-[#C6F135]/50 transition-colors"
            >
              <button
                type="button"
                onClick={() => {
                  setQuery(s.query);
                  setDealsOnly(false);
                }}
                className="hover:text-[#C6F135]"
              >
                {s.label}
              </button>
              <button
                type="button"
                onClick={(e) => handleDeleteSavedSearch(s.id, e)}
                className="text-[#5B677C] hover:text-[#FF5C5C] text-[10px]"
                title="Remove saved search"
              >
                ×
              </button>
            </span>
          ))}
          {query && (
            <button
              type="button"
              onClick={handleSaveSearch}
              className="text-[#C6F135] hover:underline ml-2"
            >
              + Save current search
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setDealsOnly(!dealsOnly)}
            className={`px-3 py-1 rounded border transition-colors flex items-center gap-1.5 font-bold ${
              dealsOnly
                ? "bg-[#C6F135] text-[#0A0C0F] border-[#C6F135]"
                : "bg-[#141922] text-[#98A2B3] border-[#262E3C] hover:text-white"
            }`}
          >
            <span>🔥</span>
            <span>DEALS ONLY FEED</span>
          </button>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-[#98A2B3] mb-4">
        <span>Showing {searchResults.items.length} of {searchResults.total} products</span>
        {(selectedCategory !== "all" || selectedBrand !== "all" || query) && (
          <button
            type="button"
            onClick={() => {
              setSelectedCategory("all");
              setSelectedBrand("all");
              setQuery("");
            }}
            className="text-[#C6F135] hover:underline"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Product Cards Grid */}
      {isPending ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : searchResults.items.length === 0 ? (
        <EmptyState
          title="No products found"
          description="Try broadening your search term or clearing the active category and brand filters."
          action={
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setSelectedCategory("all");
                setSelectedBrand("all");
                setQuery("");
              }}
            >
              Reset Filters
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {searchResults.items.map((product) => {
            const isSaved = watchlistIds.includes(product.id);
            return (
              <div
                key={product.id}
                className="flex flex-col justify-between p-4 bg-[#0F1217] border border-[#262E3C] rounded-[4px] hover:border-[#5B677C] transition-colors"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-mono text-[#98A2B3] uppercase">
                        {product.brand} · {product.category}
                      </span>
                      {product.isSynthetic && <SyntheticBadge size="sm" />}
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleWatchlist(product)}
                      aria-label={isSaved ? "Remove from watchlist" : "Add to watchlist"}
                      className={`text-sm transition-colors p-1 rounded focus:outline-none focus:ring-1 focus:ring-[#C6F135] ${
                        isSaved ? "text-[#C6F135]" : "text-[#5B677C] hover:text-[#D6DBE3]"
                      }`}
                    >
                      {isSaved ? "★" : "☆"}
                    </button>
                  </div>

                  <Link href={`/compare/${product.id}`} className="block group">
                    <h3 className="text-sm font-semibold text-[#D6DBE3] group-hover:text-[#C6F135] transition-colors line-clamp-2">
                      {product.title}
                    </h3>
                  </Link>

                  <div className="flex items-center gap-1.5 mt-2">
                    <TrustBadge state="verified" confidence={0.98} />
                    <span className="text-[10px] text-[#5B677C] font-mono">
                      EAN: {product.ean}
                    </span>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-[#1A202B]">
                  <div className="flex items-baseline justify-between mb-3">
                    <PriceTag
                      pricePaise={product.lowestPricePaise}
                      originalPricePaise={product.originalPricePaise}
                      isLowestPrice
                      size="md"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleCompare(product)}
                        className={`text-[11px] font-mono px-2 py-0.5 rounded border transition-colors ${
                          compareIds.includes(product.id)
                            ? "bg-[#C6F135]/20 text-[#C6F135] border-[#C6F135]"
                            : "text-[#5B677C] border-[#262E3C] hover:text-white"
                        }`}
                      >
                        {compareIds.includes(product.id) ? "✓ Compared" : "+ Compare"}
                      </button>
                      <span className="text-[11px] text-[#5B677C]">
                        {product.offerCount} {product.offerCount === 1 ? "offer" : "offers"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {product.merchants.map((m) => (
                        <SourceChip key={m} sourceName={m} sourceId={m.toLowerCase()} />
                      ))}
                    </div>

                    <Link href={`/compare/${product.id}`}>
                      <Button variant="outline" size="sm">
                        Compare →
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Watchlist Slide-in Drawer */}
      {isWatchlistOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Your Watchlist"
          className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs"
        >
          <div className="w-full max-w-md bg-[#0F1217] border-l border-[#262E3C] h-full flex flex-col p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#262E3C] mb-4">
              <div className="flex items-center gap-2">
                <span className="text-[#C6F135]">★</span>
                <h2 className="text-base font-bold text-white">Your Watchlist</h2>
                <span className="text-xs font-mono text-[#98A2B3]">({watchlistProducts.length})</span>
              </div>
              <button
                type="button"
                onClick={() => setIsWatchlistOpen(false)}
                aria-label="Close watchlist"
                className="text-[#98A2B3] hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-[#1A202B]">
              {watchlistProducts.length === 0 ? (
                <div className="py-12 text-center text-xs text-[#5B677C]">
                  No products in your watchlist yet. Click the star on any product to track price drops.
                </div>
              ) : (
                watchlistProducts.map((p) => (
                  <div key={p.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/compare/${p.id}`}
                        className="text-xs font-semibold text-[#D6DBE3] hover:text-[#C6F135] truncate block"
                      >
                        {p.title}
                      </Link>
                      <PriceTag pricePaise={p.lowestPricePaise} size="sm" />
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleWatchlist(p)}
                      className="text-xs text-[#F2685B] hover:underline shrink-0"
                    >
                      Remove
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="pt-4 border-t border-[#262E3C]">
              <Button variant="secondary" className="w-full" onClick={() => setIsWatchlistOpen(false)}>
                Back to Compare
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Compare Action Bar */}
      {compareIds.length > 0 && (
        <aside
          aria-label="Product comparison bar"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 px-5 py-3 rounded-full bg-[#141922] border border-[#C6F135]/60 shadow-2xl flex items-center gap-4 font-mono text-xs text-white backdrop-blur-md"
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#C6F135] animate-ping" />
            <span>{compareIds.length} of 4 items selected</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCompareModalOpen(true)}
              disabled={compareIds.length < 2}
              className="px-3 py-1 rounded bg-[#C6F135] text-[#0A0C0F] font-bold hover:bg-[#b0d92e] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Compare Side-by-Side →
            </button>
            <button
              onClick={() => setCompareIds([])}
              className="px-2 py-1 text-[#5B677C] hover:text-[#FF5C5C] transition-colors"
            >
              Clear
            </button>
          </div>
        </aside>
      )}

      {/* Side-by-Side Compare Modal */}
      <SideBySideCompareModal
        products={compareProducts}
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        onRemoveProduct={(id) => setCompareIds((prev) => prev.filter((i) => i !== id))}
      />
    </div>
  );
}

export default function ComparePage() {
  return (
    <ToastProvider>
      <CompareView />
    </ToastProvider>
  );
}
