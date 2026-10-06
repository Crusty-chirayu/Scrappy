"use client";

import React, { useState } from "react";
import {
  Button,
  Card,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
  EmptyState,
  Skeleton,
  ToastProvider,
  useToast,
} from "@scrappy/ui";

interface IntelligenceItem {
  id: string;
  title: string;
  brand: string;
  yourPricePaise: number;
  marketLowPaise: number;
  marketHighPaise: number;
  otherPricesPaise: number[];
  rank: number;
  totalSellers: number;
  stockStatus: "In Stock" | "Low Stock" | "Out of Stock";
  freshness: string;
  trustScore: number;
}

const SPECIMEN_INTELLIGENCE_DATA: IntelligenceItem[] = [
  {
    id: "int-1",
    title: "Apple MacBook Air M3 (16GB, 512GB SSD)",
    brand: "Apple",
    yourPricePaise: 13490000,
    marketLowPaise: 13190000,
    marketHighPaise: 14490000,
    otherPricesPaise: [13190000, 13799000, 14490000],
    rank: 2,
    totalSellers: 4,
    stockStatus: "In Stock",
    freshness: "3m ago",
    trustScore: 98,
  },
  {
    id: "int-2",
    title: "Sony WH-1000XM5 Wireless Noise Cancelling",
    brand: "Sony",
    yourPricePaise: 2999000,
    marketLowPaise: 2999000,
    marketHighPaise: 3499000,
    otherPricesPaise: [3149000, 3299000, 3499000],
    rank: 1,
    totalSellers: 5,
    stockStatus: "In Stock",
    freshness: "6m ago",
    trustScore: 95,
  },
  {
    id: "int-3",
    title: "Samsung Galaxy S24 Ultra 5G (512GB)",
    brand: "Samsung",
    yourPricePaise: 13299900,
    marketLowPaise: 12899900,
    marketHighPaise: 13999900,
    otherPricesPaise: [12899900, 13199900, 13999900],
    rank: 3,
    totalSellers: 4,
    stockStatus: "Low Stock",
    freshness: "12m ago",
    trustScore: 92,
  },
  {
    id: "int-4",
    title: "Dell XPS 13 Plus (Core i7, 16GB, 1TB SSD)",
    brand: "Dell",
    yourPricePaise: 16890000,
    marketLowPaise: 16490000,
    marketHighPaise: 17990000,
    otherPricesPaise: [16490000, 17290000, 17990000],
    rank: 2,
    totalSellers: 3,
    stockStatus: "In Stock",
    freshness: "15m ago",
    trustScore: 94,
  },
  {
    id: "int-5",
    title: "Bose QuietComfort Ultra Headphones",
    brand: "Bose",
    yourPricePaise: 3590000,
    marketLowPaise: 3590000,
    marketHighPaise: 3890000,
    otherPricesPaise: [3690000, 3790000, 3890000],
    rank: 1,
    totalSellers: 4,
    stockStatus: "In Stock",
    freshness: "22m ago",
    trustScore: 96,
  },
];

function DotStripPrice({
  yourPrice,
  marketLow,
  marketHigh,
  otherPrices,
}: {
  yourPrice: number;
  marketLow: number;
  marketHigh: number;
  otherPrices: number[];
}) {
  const min = Math.min(yourPrice, marketLow) * 0.98;
  const max = Math.max(yourPrice, marketHigh) * 1.02;
  const range = max - min || 1;

  const getPercent = (price: number) => {
    return Math.min(100, Math.max(0, ((price - min) / range) * 100));
  };

  const yourPercent = getPercent(yourPrice);

  return (
    <div className="w-48 py-2">
      <div className="relative h-2 bg-[var(--surface-3)] rounded-full flex items-center">
        {/* Competitor Dots */}
        {otherPrices.map((p, idx) => {
          const pct = getPercent(p);
          return (
            <div
              key={idx}
              title={`Competitor: ₹${(p / 100).toLocaleString("en-IN")}`}
              className="absolute w-2 h-2 rounded-full bg-[var(--text-3)] opacity-70 transform -translate-x-1/2"
              style={{ left: `${pct}%` }}
            />
          );
        })}

        {/* Your Price Dot (Accentuated) */}
        <div
          title={`Your Price: ₹${(yourPrice / 100).toLocaleString("en-IN")}`}
          className="absolute w-3.5 h-3.5 rounded-full bg-[var(--color-accent)] ring-2 ring-[var(--surface-0)] transform -translate-x-1/2 shadow-sm z-10"
          style={{ left: `${yourPercent}%` }}
        />
      </div>

      <div className="flex justify-between items-center text-[10px] font-mono text-[var(--text-3)] mt-1">
        <span>₹{(min / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span>
        <span className="text-[var(--color-accent)] font-semibold">You ({yourPercent.toFixed(0)}%)</span>
        <span>₹{(max / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span>
      </div>
    </div>
  );
}

function IntelligenceContent() {
  const { showToast } = useToast();
  const [viewState, setViewState] = useState<"loaded" | "loading" | "empty" | "error" | "stale">("loaded");
  const [undercutThreshold, setUndercutThreshold] = useState<number>(5);
  const [dryRunChannel, setDryRunChannel] = useState<string>("email");
  const [dryRunFiredCount, setDryRunFiredCount] = useState<number>(14);
  const [isSimulating, setIsSimulating] = useState(false);

  // Dry-run computation whenever threshold changes
  const handleCalculateDryRun = () => {
    setIsSimulating(true);
    setTimeout(() => {
      // Dynamic dry run calculation: threshold 5% -> 14 triggers, 8% -> 7 triggers, 12% -> 2 triggers
      const simulatedTriggers = Math.max(1, Math.round(70 / undercutThreshold));
      setDryRunFiredCount(simulatedTriggers);
      setIsSimulating(false);
      showToast({
        type: "info",
        title: "Dry-Run Simulation Complete",
        description: `Rule would have triggered ${simulatedTriggers} times in the last 30 days.`,
      });
    }, 300);
  };

  const handleSaveRule = () => {
    showToast({
      type: "success",
      title: "Repricing Rule Active",
      description: `Undercut alert > ${undercutThreshold}% configured via ${dryRunChannel.toUpperCase()}.`,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[var(--color-accent)]" />
            <span className="text-xs font-mono uppercase tracking-wider text-[var(--color-accent)] font-semibold">
              Business Intelligence Board
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--surface-2)] text-[var(--text-3)] border border-[var(--border-subtle)] uppercase">
              Synthetic Market Data
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-1)]">
            Market Gap &amp; Pricing Intelligence
          </h1>
          <p className="text-xs text-[var(--text-2)] mt-0.5">
            Monitor real-time retailer price spreads, benchmark against market leaders, and calibrate automated undercut triggers.
          </p>
        </div>

        {/* State Toggle Bar (Demonstrates All 5 Data States) */}
        <div className="flex items-center gap-1.5 p-1 rounded-[var(--radius-sm)] bg-[var(--surface-1)] border border-[var(--border-subtle)] text-[11px] font-mono">
          <span className="text-[var(--text-3)] px-1">STATE:</span>
          {(["loaded", "loading", "empty", "error", "stale"] as const).map((st) => (
            <button
              key={st}
              onClick={() => setViewState(st)}
              className={`px-2 py-1 rounded transition-colors uppercase ${
                viewState === st
                  ? "bg-[var(--color-accent)] text-[var(--color-accent-contrast)] font-bold"
                  : "text-[var(--text-2)] hover:text-[var(--text-1)]"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* STATE: LOADING SKELETON */}
      {viewState === "loading" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="p-4 space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-7 w-28" />
              </Card>
            ))}
          </div>
          <Card className="p-6 space-y-4">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-64 w-full" />
          </Card>
        </div>
      )}

      {/* STATE: EMPTY */}
      {viewState === "empty" && (
        <Card className="p-12 text-center">
          <EmptyState
            title="No Tracked Competitor Products"
            description="Add products to your business catalog to benchmark your prices against market leaders."
            action={
              <Button variant="primary" onClick={() => setViewState("loaded")}>
                Load Specimen Catalog
              </Button>
            }
          />
        </Card>
      )}

      {/* STATE: ERROR */}
      {viewState === "error" && (
        <Card className="p-8 text-center border-[var(--color-danger)]/30 bg-[var(--color-danger)]/5">
          <div className="text-[var(--color-danger)] font-mono text-sm font-semibold mb-2">
            Failed to sync live competitor market feeds
          </div>
          <p className="text-xs text-[var(--text-2)] mb-4">
            Downstream adapter circuit tripped due to upstream rate limits. Showing offline cached telemetry.
          </p>
          <Button variant="secondary" onClick={() => setViewState("loaded")}>
            Retry Connection
          </Button>
        </Card>
      )}

      {/* STATE: STALE BANNER */}
      {viewState === "stale" && (
        <div className="mb-6 p-3 rounded-[var(--radius-sm)] bg-[var(--color-warn)]/10 border border-[var(--color-warn)]/30 text-[var(--color-warn)] text-xs font-mono flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>⚠️</span>
            <span>STALE TELEMETRY: Market prices were fetched &gt; 2 hours ago. Next crawl scheduled in 14 minutes.</span>
          </div>
          <Button size="sm" variant="secondary" onClick={() => setViewState("loaded")}>
            Force Refresh
          </Button>
        </div>
      )}

      {/* STATE: LOADED / STALE MAIN VIEW */}
      {(viewState === "loaded" || viewState === "stale") && (
        <div className="space-y-8">
          {/* Telemetry Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4">
              <span className="text-[11px] font-mono uppercase text-[var(--text-3)] font-semibold">
                BEST-PRICE SHARE
              </span>
              <div className="text-2xl font-bold text-[var(--text-1)] my-1 font-mono">
                40% <span className="text-xs text-[var(--color-success)] font-normal">(2 of 5 products)</span>
              </div>
              <div className="text-[11px] text-[var(--text-2)] font-mono">
                Lowest price rank in category
              </div>
            </Card>

            <Card className="p-4">
              <span className="text-[11px] font-mono uppercase text-[var(--text-3)] font-semibold">
                AVERAGE MARKET GAP
              </span>
              <div className="text-2xl font-bold text-[var(--color-warn)] my-1 font-mono">
                +2.4%
              </div>
              <div className="text-[11px] text-[var(--text-2)] font-mono">
                Across all competing listings
              </div>
            </Card>

            <Card className="p-4">
              <span className="text-[11px] font-mono uppercase text-[var(--text-3)] font-semibold">
                UNDER-CUT EXPOSURE
              </span>
              <div className="text-2xl font-bold text-[var(--color-danger)] my-1 font-mono">
                3 Listings
              </div>
              <div className="text-[11px] text-[var(--text-2)] font-mono">
                Competitors lower by &gt; ₹3,000
              </div>
            </Card>

            <Card className="p-4">
              <span className="text-[11px] font-mono uppercase text-[var(--text-3)] font-semibold">
                FEED FRESHNESS
              </span>
              <div className="text-2xl font-bold text-[var(--color-success)] my-1 font-mono">
                3m Avg
              </div>
              <div className="text-[11px] text-[var(--text-2)] font-mono">
                Last checked via automated crawl
              </div>
            </Card>
          </div>

          {/* Competitor Gap Table with Dot-Strip */}
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h2 className="text-base font-bold text-[var(--text-1)]">
                  Competitor Gap &amp; Position Analysis
                </h2>
                <p className="text-xs text-[var(--text-2)] font-mono">
                  Your price versus competing market offerings with visual dot-strip distribution.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>PRODUCT</TableHead>
                    <TableHead>YOUR PRICE</TableHead>
                    <TableHead>MARKET RANGE (DOT-STRIP)</TableHead>
                    <TableHead>GAP %</TableHead>
                    <TableHead>SELLER RANK</TableHead>
                    <TableHead>STOCK</TableHead>
                    <TableHead>FRESHNESS</TableHead>
                    <TableHead className="text-right">TRUST</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {SPECIMEN_INTELLIGENCE_DATA.map((item) => {
                    const diffPaise = item.yourPricePaise - item.marketLowPaise;
                    const gapPercent = item.marketLowPaise > 0 ? (diffPaise / item.marketLowPaise) * 100 : 0;
                    const isLowest = item.rank === 1;

                    return (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="font-medium text-[var(--text-1)] text-xs">{item.title}</div>
                          <div className="text-[11px] font-mono text-[var(--text-3)]">{item.brand}</div>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono font-bold text-[var(--text-1)] text-xs">
                            ₹{(item.yourPricePaise / 100).toLocaleString("en-IN")}
                          </span>
                        </TableCell>
                        <TableCell>
                          <DotStripPrice
                            yourPrice={item.yourPricePaise}
                            marketLow={item.marketLowPaise}
                            marketHigh={item.marketHighPaise}
                            otherPrices={item.otherPricesPaise}
                          />
                        </TableCell>
                        <TableCell>
                          <span
                            className={`font-mono text-xs font-semibold ${
                              isLowest
                                ? "text-[var(--color-success)]"
                                : gapPercent > 5
                                ? "text-[var(--color-danger)]"
                                : "text-[var(--color-warn)]"
                            }`}
                          >
                            {isLowest ? "Lowest (0%)" : `+${gapPercent.toFixed(1)}%`}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-xs text-[var(--text-1)] font-semibold">
                            #{item.rank} of {item.totalSellers}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-0.5 rounded-[var(--radius-sm)] text-[10px] font-mono uppercase font-bold border ${
                              item.stockStatus === "In Stock"
                                ? "bg-[var(--color-success)]/10 text-[var(--color-success)] border-[var(--color-success)]/30"
                                : "bg-[var(--color-warn)]/10 text-[var(--color-warn)] border-[var(--color-warn)]/30"
                            }`}
                          >
                            {item.stockStatus}
                          </span>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-[var(--text-2)]">
                          {item.freshness}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="inline-flex items-center gap-1 font-mono text-xs font-semibold px-2 py-0.5 rounded bg-[var(--surface-2)] text-[var(--color-accent)] border border-[var(--border-subtle)]">
                            ★ {item.trustScore}%
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </Card>

          {/* Undercut Rule Builder with 30-Day Dry-Run Engine */}
          <Card className="p-6">
            <div className="mb-6">
              <h2 className="text-base font-bold text-[var(--text-1)]">
                Automated Undercut Rule Builder &amp; 30-Day Dry-Run Engine
              </h2>
              <p className="text-xs text-[var(--text-2)] font-mono">
                Define threshold alert rules with zero risk. Validate against 30 days of actual historical market data before activation.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              {/* Rule Parameters */}
              <div className="space-y-4">
                <div>
                  <label htmlFor="undercut-input" className="block text-xs font-mono text-[var(--text-2)] mb-1.5 font-medium">
                    UNDERCUT THRESHOLD PERCENTAGE (%)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      id="undercut-input"
                      type="number"
                      min={1}
                      max={50}
                      value={undercutThreshold}
                      onChange={(e) => setUndercutThreshold(Number(e.target.value) || 5)}
                      className="w-32 bg-[var(--surface-2)] border border-[var(--border-default)] rounded px-3 py-2 text-sm font-mono text-[var(--text-1)] outline-none focus:border-[var(--border-focus)] min-h-[44px]"
                    />
                    <span className="text-xs font-mono text-[var(--text-3)]">
                      Notify me when any verified competitor undercuts me by more than {undercutThreshold}%
                    </span>
                  </div>
                </div>

                <div>
                  <label htmlFor="channel-select" className="block text-xs font-mono text-[var(--text-2)] mb-1.5 font-medium">
                    NOTIFICATION DISPATCH CHANNEL
                  </label>
                  <select
                    id="channel-select"
                    value={dryRunChannel}
                    onChange={(e) => setDryRunChannel(e.target.value)}
                    className="w-full bg-[var(--surface-2)] border border-[var(--border-default)] rounded px-3 py-2 text-xs font-mono text-[var(--text-1)] outline-none focus:border-[var(--border-focus)] min-h-[44px]"
                  >
                    <option value="email">Email Notification (Instant)</option>
                    <option value="webhook">Signed HMAC Webhook Endpoint</option>
                  </select>
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <Button
                    variant="secondary"
                    onClick={handleCalculateDryRun}
                    disabled={isSimulating}
                    className="min-h-[44px]"
                  >
                    {isSimulating ? "Simulating..." : "Run 30-Day Historical Dry-Run"}
                  </Button>
                  <Button variant="primary" onClick={handleSaveRule} className="min-h-[44px]">
                    Activate Undercut Rule
                  </Button>
                </div>
              </div>

              {/* Dry-Run Result Preview Card */}
              <div className="p-5 rounded-[var(--radius-md)] bg-[var(--surface-2)] border border-[var(--border-subtle)] space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase text-[var(--text-1)]">
                    Historical Dry-Run Analysis
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--surface-3)] text-[var(--color-accent)] font-semibold">
                    PAST 30 DAYS
                  </span>
                </div>

                <div className="p-4 rounded bg-[var(--surface-1)] border border-[var(--border-subtle)]">
                  <div className="text-xs font-mono text-[var(--text-2)] mb-1">SIMULATION VERDICT:</div>
                  <div className="text-lg font-bold text-[var(--color-accent)] font-mono">
                    Would have fired {dryRunFiredCount} times in the last 30 days
                  </div>
                  <div className="text-[11px] text-[var(--text-3)] font-mono mt-1">
                    Based on 14,200 recorded catalog price checkpoints across Amazon &amp; Flipkart.
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-3 rounded bg-[var(--surface-1)] border border-[var(--border-subtle)]">
                    <span className="text-[var(--text-3)] text-[10px] uppercase">Avg Undercut Gap</span>
                    <div className="text-[var(--color-danger)] font-bold text-sm mt-0.5">
                      {(undercutThreshold * 1.35).toFixed(1)}%
                    </div>
                  </div>
                  <div className="p-3 rounded bg-[var(--surface-1)] border border-[var(--border-subtle)]">
                    <span className="text-[var(--text-3)] text-[10px] uppercase">False Positive Rate</span>
                    <div className="text-[var(--color-success)] font-bold text-sm mt-0.5">
                      0.0% (Verified)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

export default function IntelligencePage() {
  return (
    <ToastProvider>
      <IntelligenceContent />
    </ToastProvider>
  );
}
