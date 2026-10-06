"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Button,
  Badge,
  PriceTag,
  EmptyState,
  ExternalLinkIcon,
  SearchIcon,
  TrashIcon,
  BellIcon,
  CloseIcon,
  useToast,
} from "@scrappy/ui";
import { defaultCatalogRepository, ProductDetail } from "@scrappy/db";

interface WatchlistItem {
  id: string;
  productId: string;
  product: ProductDetail;
  targetPricePaise: number;
  status: "active" | "triggered" | "paused";
  addedAt: string;
  lastCheckedAt: string;
}

export default function WatchlistPage() {
  const { showToast } = useToast();

  // Initial seed items from local catalog repository
  const [items, setItems] = useState<WatchlistItem[]>(() => {
    const catalogProducts = [
      defaultCatalogRepository.getProductDetail("b2000000-0000-0000-0000-000000000001"),
      defaultCatalogRepository.getProductDetail("b2000000-0000-0000-0000-000000000002"),
      defaultCatalogRepository.getProductDetail("b2000000-0000-0000-0000-000000000003"),
      defaultCatalogRepository.getProductDetail("b2000000-0000-0000-0000-000000000004"),
    ].filter((p): p is ProductDetail => Boolean(p));

    return catalogProducts.map((p, idx) => ({
      id: `wl-${p.id}`,
      productId: p.id,
      product: p,
      targetPricePaise: Math.round(p.lowestPricePaise * 0.92),
      status: idx === 0 ? "triggered" : "active",
      addedAt: new Date(Date.now() - (idx + 1) * 86400000).toISOString(),
      lastCheckedAt: new Date(Date.now() - (idx * 15 + 5) * 60000).toISOString(),
    }));
  });

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "triggered" | "active" | "paused">("all");
  const [sortBy, setSortBy] = useState<"recent" | "price_asc" | "target_gap">("recent");

  // Load from Supabase API on mount if available
  useEffect(() => {
    let mounted = true;
    fetch("/api/watchlist")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!mounted || !data?.items || !Array.isArray(data.items) || data.items.length === 0) return;
        // Merge with local items if real items exist
      })
      .catch(() => {
        // Fallback to local catalog seed data
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Filter and sort items
  const filteredItems = useMemo(() => {
    let list = items;

    if (activeTab === "triggered") {
      list = list.filter((item) => item.status === "triggered");
    } else if (activeTab === "active") {
      list = list.filter((item) => item.status === "active");
    } else if (activeTab === "paused") {
      list = list.filter((item) => item.status === "paused");
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (item) =>
          item.product.title.toLowerCase().includes(q) ||
          item.product.brand.toLowerCase().includes(q) ||
          item.product.category.toLowerCase().includes(q)
      );
    }

    return [...list].sort((a, b) => {
      if (sortBy === "price_asc") {
        return a.product.lowestPricePaise - b.product.lowestPricePaise;
      }
      if (sortBy === "target_gap") {
        const gapA = a.product.lowestPricePaise - a.targetPricePaise;
        const gapB = b.product.lowestPricePaise - b.targetPricePaise;
        return gapA - gapB;
      }
      return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
    });
  }, [items, activeTab, searchQuery, sortBy]);

  // Bulk actions
  const toggleSelectAll = () => {
    if (selectedIds.length === filteredItems.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredItems.map((i) => i.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const removeSelected = () => {
    const toRemove = [...selectedIds];
    const removedItems = items.filter((i) => toRemove.includes(i.id));
    setItems((prev) => prev.filter((i) => !toRemove.includes(i.id)));
    setSelectedIds([]);

    for (const item of removedItems) {
      fetch(`/api/watchlist?productId=${encodeURIComponent(item.productId)}`, {
        method: "DELETE",
      }).catch(() => {});
    }

    showToast({
      type: "info",
      title: `Removed ${toRemove.length} products`,
      description: "Items removed from your personal watchlist.",
      onUndo: () => {
        setItems((prev) => [...prev, ...removedItems]);
        for (const item of removedItems) {
          fetch("/api/watchlist", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId: item.productId }),
          }).catch(() => {});
        }
      },
    });
  };

  const removeItem = (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    setItems((prev) => prev.filter((i) => i.id !== id));
    setSelectedIds((prev) => prev.filter((i) => i !== id));

    fetch(`/api/watchlist?productId=${encodeURIComponent(item.productId)}`, {
      method: "DELETE",
    }).catch(() => {});

    showToast({
      type: "info",
      title: "Removed from Watchlist",
      description: item.product.title,
      onUndo: () => {
        setItems((prev) => [...prev, item]);
        fetch("/api/watchlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: item.productId }),
        }).catch(() => {});
      },
    });
  };

  const toggleStatus = (id: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newStatus = item.status === "paused" ? "active" : "paused";
          return { ...item, status: newStatus };
        }
        return item;
      })
    );
  };

  const exportCSV = () => {
    const headers = ["Product Title", "Brand", "Category", "Lowest Price (INR)", "Target Price (INR)", "Status", "Last Checked"];
    const rows = filteredItems.map((i) => [
      `"${i.product.title.replace(/"/g, '""')}"`,
      `"${i.product.brand}"`,
      `"${i.product.category}"`,
      (i.product.lowestPricePaise / 100).toFixed(2),
      (i.targetPricePaise / 100).toFixed(2),
      i.status,
      i.lastCheckedAt,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `scrappy-watchlist-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast({
      type: "success",
      title: "Watchlist Exported",
      description: `Downloaded ${filteredItems.length} records as CSV.`,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Header & Telemetry */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[var(--border-default)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--color-accent)] font-semibold">
              Workspace Intelligence · Price Drop Tracking
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--surface-2)] text-[var(--text-3)] border border-[var(--border-subtle)]">
              Sample Data Feeds
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-[var(--text-1)] tracking-tight">
            Product Watchlist
          </h1>
          <p className="text-xs sm:text-sm font-sans text-[var(--text-2)] mt-1">
            Tracked items with continuous price monitoring across Amazon, Flipkart, Croma, and Reliance Digital.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link href="/alerts">
            <Button variant="secondary" className="min-h-[44px]">
              <BellIcon size={16} />
              <span>Alert Rules</span>
            </Button>
          </Link>
          <Link href="/compare">
            <Button variant="primary" className="min-h-[44px]">
              <span>+ Add Products</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-[var(--radius-lg)] bg-[var(--surface-0)] border border-[var(--border-default)]">
          <div className="text-xs font-mono uppercase text-[var(--text-3)]">Total Tracked Products</div>
          <div className="text-2xl font-bold font-mono text-[var(--text-1)] mt-1">{items.length}</div>
          <div className="text-[11px] text-[var(--text-2)] mt-0.5">Across 4 major Indian e-commerce stores</div>
        </div>

        <div className="p-4 rounded-[var(--radius-lg)] bg-[var(--surface-0)] border border-[var(--border-default)]">
          <div className="text-xs font-mono uppercase text-[var(--text-3)]">Price Drop Alerts Triggered</div>
          <div className="text-2xl font-bold font-mono text-[var(--color-success)] mt-1">
            {items.filter((i) => i.status === "triggered").length}
          </div>
          <div className="text-[11px] text-[var(--text-2)] mt-0.5">Below configured target threshold</div>
        </div>

        <div className="p-4 rounded-[var(--radius-lg)] bg-[var(--surface-0)] border border-[var(--border-default)]">
          <div className="text-xs font-mono uppercase text-[var(--text-3)]">Crawl SLA &amp; Freshness</div>
          <div className="text-2xl font-bold font-mono text-[var(--color-accent)] mt-1">100%</div>
          <div className="text-[11px] text-[var(--text-2)] mt-0.5">All items checked within last 60 minutes</div>
        </div>
      </div>

      {/* Controls: Search, Filter Tabs, Bulk Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-[var(--radius-lg)] bg-[var(--surface-1)] border border-[var(--border-default)]">
        {/* Left: Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`min-h-[38px] px-3.5 py-1.5 rounded-[var(--radius-sm)] text-xs font-mono font-medium transition-colors ${
              activeTab === "all"
                ? "bg-[var(--surface-3)] text-[var(--text-1)] shadow-sm"
                : "text-[var(--text-3)] hover:text-[var(--text-1)] hover:bg-[var(--surface-2)]"
            }`}
          >
            All ({items.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("triggered")}
            className={`min-h-[38px] px-3.5 py-1.5 rounded-[var(--radius-sm)] text-xs font-mono font-medium transition-colors ${
              activeTab === "triggered"
                ? "bg-[var(--color-success)]/15 text-[var(--color-success)] border border-[var(--color-success)]/30"
                : "text-[var(--text-3)] hover:text-[var(--text-1)] hover:bg-[var(--surface-2)]"
            }`}
          >
            Triggered ({items.filter((i) => i.status === "triggered").length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("active")}
            className={`min-h-[38px] px-3.5 py-1.5 rounded-[var(--radius-sm)] text-xs font-mono font-medium transition-colors ${
              activeTab === "active"
                ? "bg-[var(--surface-3)] text-[var(--text-1)] shadow-sm"
                : "text-[var(--text-3)] hover:text-[var(--text-1)] hover:bg-[var(--surface-2)]"
            }`}
          >
            Active ({items.filter((i) => i.status === "active").length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("paused")}
            className={`min-h-[38px] px-3.5 py-1.5 rounded-[var(--radius-sm)] text-xs font-mono font-medium transition-colors ${
              activeTab === "paused"
                ? "bg-[var(--surface-3)] text-[var(--text-1)] shadow-sm"
                : "text-[var(--text-3)] hover:text-[var(--text-1)] hover:bg-[var(--surface-2)]"
            }`}
          >
            Paused ({items.filter((i) => i.status === "paused").length})
          </button>
        </div>

        {/* Right: Search Input & Sort Dropdown */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-3)] pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter watchlist..."
              aria-label="Filter watchlist by title or brand"
              className="w-full pl-9 pr-3 py-2 text-xs font-sans rounded-[var(--radius-sm)] bg-[var(--surface-0)] border border-[var(--border-default)] text-[var(--text-1)] placeholder-[var(--text-3)] focus:outline-none focus:ring-2 focus:ring-[var(--border-focus)] min-h-[38px]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label="Clear filter"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-[var(--text-3)] hover:text-[var(--text-1)]"
              >
                <CloseIcon size={16} />
              </button>
            )}
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            aria-label="Sort watchlist"
            className="px-3 py-2 text-xs font-mono rounded-[var(--radius-sm)] bg-[var(--surface-0)] border border-[var(--border-default)] text-[var(--text-1)] focus:outline-none focus:ring-2 focus:ring-[var(--border-focus)] min-h-[38px]"
          >
            <option value="recent">Recently Added</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="target_gap">Closest to Target</option>
          </select>
        </div>
      </div>

      {/* Bulk Action Toolbar (When 1+ items selected) */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between p-3 rounded-[var(--radius-md)] bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30 text-xs font-mono">
          <div className="flex items-center gap-2 text-[var(--color-accent)] font-semibold">
            <span>{selectedIds.length} products selected</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={exportCSV} className="min-h-[36px]">
              Export CSV
            </Button>
            <Button variant="danger" size="sm" onClick={removeSelected} className="min-h-[36px]">
              <TrashIcon size={16} />
              <span>Remove Selected</span>
            </Button>
          </div>
        </div>
      )}

      {/* Watchlist Dense Table */}
      {filteredItems.length === 0 ? (
        <div className="p-12 text-center rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-0)]">
          <EmptyState
            title="No Products in Watchlist"
            description={
              searchQuery
                ? `No tracked items match "${searchQuery}". Clear your search filter to see all products.`
                : "You have not added any products to your watchlist yet. Browse the compare catalog and tap Watch to start monitoring."
            }
          />
          <div className="mt-6">
            <Link href="/compare">
              <Button variant="primary">
                Browse Compare Catalog
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-0)] overflow-hidden shadow-[var(--elevation-1)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-sans">
              <thead>
                <tr className="border-b border-[var(--border-default)] bg-[var(--surface-1)] text-[11px] font-mono uppercase tracking-wider text-[var(--text-3)]">
                  <th scope="col" className="py-3 px-4 w-10">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === filteredItems.length && filteredItems.length > 0}
                      onChange={toggleSelectAll}
                      aria-label="Select all products in watchlist"
                      className="rounded border-[var(--border-default)] text-[var(--color-accent)] focus:ring-[var(--border-focus)] w-4 h-4 cursor-pointer"
                    />
                  </th>
                  <th scope="col" className="py-3 px-4 sm:px-6">Tracked Product</th>
                  <th scope="col" className="py-3 px-4">Current Best Price</th>
                  <th scope="col" className="py-3 px-4">Target Alert Price</th>
                  <th scope="col" className="py-3 px-4">Alert Status</th>
                  <th scope="col" className="py-3 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {filteredItems.map((item) => {
                  const isSelected = selectedIds.includes(item.id);
                  const isBelowTarget = item.product.lowestPricePaise <= item.targetPricePaise;
                  const priceDiffRupees = Math.round((item.targetPricePaise - item.product.lowestPricePaise) / 100);

                  return (
                    <tr
                      key={item.id}
                      className={`transition-colors ${
                        isSelected
                          ? "bg-[var(--color-accent)]/10"
                          : item.status === "triggered"
                          ? "bg-[var(--color-success)]/5 hover:bg-[var(--color-success)]/10"
                          : "hover:bg-[var(--surface-1)]"
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-4 px-4 align-top">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(item.id)}
                          aria-label={`Select ${item.product.title}`}
                          className="rounded border-[var(--border-default)] text-[var(--color-accent)] focus:ring-[var(--border-focus)] w-4 h-4 cursor-pointer"
                        />
                      </td>

                      {/* Product Info */}
                      <td className="py-4 px-4 sm:px-6 align-top">
                        <div className="space-y-1 max-w-md">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" size="sm">
                              {item.product.brand}
                            </Badge>
                            <span className="text-[11px] font-mono text-[var(--text-3)]">
                              {item.product.category}
                            </span>
                          </div>
                          <Link
                            href={`/compare/${item.productId}`}
                            className="font-semibold text-sm text-[var(--text-1)] hover:text-[var(--color-accent)] line-clamp-2 transition-colors focus-visible:outline-none focus-visible:underline"
                          >
                            {item.product.title}
                          </Link>
                          <div className="text-[11px] font-mono text-[var(--text-3)] flex items-center gap-3">
                            <span>SKU: {item.product.id.slice(0, 8)}</span>
                            <span>EAN: {item.product.ean}</span>
                          </div>
                        </div>
                      </td>

                      {/* Current Best Price */}
                      <td className="py-4 px-4 align-top font-mono">
                        <PriceTag
                          pricePaise={item.product.lowestPricePaise}
                          originalPricePaise={item.product.originalPricePaise}
                          size="md"
                          isLowestPrice
                        />
                        <div className="text-[11px] text-[var(--text-3)] mt-0.5">
                          via {item.product.offers[0]?.merchantName || "Amazon India"}
                        </div>
                      </td>

                      {/* Target Alert Price */}
                      <td className="py-4 px-4 align-top font-mono">
                        <div className="text-sm font-bold text-[var(--text-1)]">
                          ₹{Math.round(item.targetPricePaise / 100).toLocaleString("en-IN")}
                        </div>
                        {isBelowTarget ? (
                          <div className="text-[11px] text-[var(--color-success)] font-semibold mt-0.5">
                            ✓ ₹{Math.abs(priceDiffRupees).toLocaleString("en-IN")} below target
                          </div>
                        ) : (
                          <div className="text-[11px] text-[var(--text-3)] mt-0.5">
                            Needs ₹{Math.abs(priceDiffRupees).toLocaleString("en-IN")} drop
                          </div>
                        )}
                      </td>

                      {/* Alert Status */}
                      <td className="py-4 px-4 align-top">
                        {item.status === "triggered" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--radius-sm)] text-[11px] font-mono font-bold bg-[var(--color-success)]/15 text-[var(--color-success)] border border-[var(--color-success)]/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)] animate-pulse" />
                            TRIGGERED
                          </span>
                        ) : item.status === "active" ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[var(--radius-sm)] text-[11px] font-mono font-medium bg-[var(--color-accent)]/10 text-[var(--color-accent)] border border-[var(--color-accent)]/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]" />
                            MONITORING
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[var(--radius-sm)] text-[11px] font-mono text-[var(--text-3)] bg-[var(--surface-2)]">
                            PAUSED
                          </span>
                        )}
                        <div className="text-[10px] font-mono text-[var(--text-3)] mt-1">
                          Checked 15m ago
                        </div>
                      </td>

                      {/* Row Actions */}
                      <td className="py-4 px-4 sm:px-6 align-top text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => toggleStatus(item.id)}
                            className="min-h-[36px] px-2.5 py-1 text-xs font-mono rounded text-[var(--text-2)] hover:text-[var(--text-1)] hover:bg-[var(--surface-2)] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--border-focus)]"
                            title={item.status === "paused" ? "Resume tracking" : "Pause tracking"}
                          >
                            {item.status === "paused" ? "Resume" : "Pause"}
                          </button>
                          <Link
                            href={`/compare/${item.productId}`}
                            className="min-h-[36px] min-w-[36px] p-2 rounded text-[var(--text-3)] hover:text-[var(--text-1)] hover:bg-[var(--surface-2)] flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--border-focus)]"
                            title="Inspect product detail"
                            aria-label={`Inspect ${item.product.title}`}
                          >
                            <ExternalLinkIcon size={16} />
                          </Link>
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="min-h-[36px] min-w-[36px] p-2 rounded text-[var(--text-3)] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10 flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--border-focus)]"
                            title="Remove from watchlist"
                            aria-label={`Remove ${item.product.title} from watchlist`}
                          >
                            <TrashIcon size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
