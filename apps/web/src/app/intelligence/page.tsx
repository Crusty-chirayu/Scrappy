"use client";

import React, { useState } from "react";
import {
  Button,
  useToast,
  ToastProvider,
} from "@scrappy/ui";
import {
  Activity,
  Zap,
  Play,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";

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
    title: "Apple MacBook Air M3 (16GB, 512GB)",
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
    title: "Sony WH-1000XM5 Wireless Headphones",
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
    title: "Samsung Galaxy S24 Ultra (512GB)",
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
    title: "Dell XPS 13 Plus (Core i7, 16GB)",
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
    title: "Bose QuietComfort Ultra",
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
    <div className="w-44 py-1">
      <div className="relative h-2 bg-[var(--surface-2)] rounded-full flex items-center border border-[var(--border-subtle)]">
        {/* Competitor Dots */}
        {otherPrices.map((p, idx) => {
          const pct = getPercent(p);
          return (
            <div
              key={idx}
              title={`Competitor: ₹${(p / 100).toLocaleString("en-IN")}`}
              className="absolute w-2 h-2 rounded-full bg-[var(--text-3)] opacity-75 transform -translate-x-1/2"
              style={{ left: `${pct}%` }}
            />
          );
        })}

        {/* Your Price Dot */}
        <div
          title={`Your Price: ₹${(yourPrice / 100).toLocaleString("en-IN")}`}
          className="absolute w-3.5 h-3.5 rounded-full bg-[var(--color-accent)] ring-2 ring-[var(--surface-0)] transform -translate-x-1/2 shadow-xs z-10"
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
      const simulatedTriggers = Math.max(1, Math.round(70 / undercutThreshold));
      setDryRunFiredCount(simulatedTriggers);
      setIsSimulating(false);
      showToast({
        type: "info",
        title: "Simulation Complete",
        description: `Rule would have triggered ${simulatedTriggers} times in past 30 days.`,
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 font-sans space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[var(--color-accent)] animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-wider text-[var(--color-accent)] font-semibold">
              Market Intelligence
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--surface-2)] text-[var(--text-2)] border border-[var(--border-subtle)] font-semibold">
              Demo Data
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-semibold tracking-tight text-[var(--text-1)]">
            Market Gap &amp; Pricing Telemetry
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-2)] mt-0.5">
            Monitor real-time retailer price spreads, competitor undercuts, and automated repricing triggers.
          </p>
        </div>

        {/* State Toggle Bar (Demonstrates All 5 Data States) */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-[var(--surface-1)] border border-[var(--border)] text-xs font-mono shrink-0">
          <span className="text-[var(--text-3)] px-1.5 text-[11px]">STATE:</span>
          {(["loaded", "loading", "empty", "error", "stale"] as const).map((st) => (
            <button
              key={st}
              onClick={() => setViewState(st)}
              className={`px-2 py-1 rounded-md transition-colors uppercase text-[11px] ${
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
        <div className="space-y-6 animate-pulse">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-4 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] h-24" />
            ))}
          </div>
          <div className="p-6 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] h-64" />
        </div>
      )}

      {/* STATE: EMPTY */}
      {viewState === "empty" && (
        <div className="p-12 text-center rounded-xl bg-[var(--surface-1)] border border-[var(--border)] space-y-4">
          <Activity size={32} className="mx-auto text-[var(--text-3)]" />
          <h2 className="text-base font-display font-semibold text-[var(--text-1)]">
            No Tracked Competitor Products
          </h2>
          <p className="text-xs text-[var(--text-2)] max-w-sm mx-auto font-sans">
            Add products to your catalog to benchmark your prices against market leaders.
          </p>
          <Button variant="primary" size="sm" onClick={() => setViewState("loaded")}>
            Load Demo Catalog
          </Button>
        </div>
      )}

      {/* STATE: ERROR */}
      {viewState === "error" && (
        <div className="p-8 text-center rounded-xl border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/5 space-y-3 font-mono">
          <AlertTriangle size={28} className="mx-auto text-[var(--color-danger)]" />
          <div className="text-[var(--color-danger)] text-sm font-semibold">
            Failed to sync live competitor market feeds
          </div>
          <p className="text-xs text-[var(--text-2)] max-w-md mx-auto font-sans">
            Downstream adapter circuit tripped due to upstream rate limits. Showing offline cached telemetry.
          </p>
          <Button variant="secondary" size="sm" onClick={() => setViewState("loaded")}>
            <RotateCcw size={14} className="mr-1.5" />
            <span>Retry Connection</span>
          </Button>
        </div>
      )}

      {/* STATE: STALE BANNER */}
      {viewState === "stale" && (
        <div className="p-3.5 rounded-xl bg-[var(--color-warning)]/10 border border-[var(--color-warning)]/30 text-[var(--color-warning)] text-xs font-mono flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle size={15} />
            <span>STALE TELEMETRY: Prices fetched 2 hours ago. Next crawl in 14 minutes.</span>
          </div>
          <Button size="sm" variant="secondary" onClick={() => setViewState("loaded")}>
            Force Refresh
          </Button>
        </div>
      )}

      {/* STATE: LOADED / STALE MAIN VIEW */}
      {(viewState === "loaded" || viewState === "stale") && (
        <div className="space-y-6">
          {/* KPI Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] shadow-xs">
              <span className="text-[10px] font-mono uppercase text-[var(--text-3)] font-semibold tracking-wider">
                BEST-PRICE SHARE
              </span>
              <div className="text-2xl font-bold text-[var(--text-1)] my-1 font-mono tabular-nums">
                40% <span className="text-xs text-[var(--color-success)] font-normal">(2/5 products)</span>
              </div>
              <div className="text-[11px] text-[var(--text-2)] font-mono">
                Lowest rank in category
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] shadow-xs">
              <span className="text-[10px] font-mono uppercase text-[var(--text-3)] font-semibold tracking-wider">
                AVG MARKET GAP
              </span>
              <div className="text-2xl font-bold text-[var(--color-warning)] my-1 font-mono tabular-nums">
                +2.4%
              </div>
              <div className="text-[11px] text-[var(--text-2)] font-mono">
                Across competing stores
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] shadow-xs">
              <span className="text-[10px] font-mono uppercase text-[var(--text-3)] font-semibold tracking-wider">
                UNDERCUT EXPOSURE
              </span>
              <div className="text-2xl font-bold text-[var(--color-danger)] my-1 font-mono tabular-nums">
                3 Listings
              </div>
              <div className="text-[11px] text-[var(--text-2)] font-mono">
                Competitors lower by &gt; ₹3,000
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] shadow-xs">
              <span className="text-[10px] font-mono uppercase text-[var(--text-3)] font-semibold tracking-wider">
                FEED FRESHNESS
              </span>
              <div className="text-2xl font-bold text-[var(--color-success)] my-1 font-mono tabular-nums">
                3m Avg
              </div>
              <div className="text-[11px] text-[var(--text-2)] font-mono">
                Automated crawl sync
              </div>
            </div>
          </div>

          {/* Competitor Gap Table with Dot-Strip */}
          <div className="p-5 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] shadow-xs space-y-4">
            <div>
              <h2 className="text-base font-display font-semibold text-[var(--text-1)]">
                Competitor Gap &amp; Position Analysis
              </h2>
              <p className="text-xs text-[var(--text-2)] font-sans">
                Your price versus competing market offerings with visual dot-strip distribution.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--surface-2)] text-[10px] text-[var(--text-3)] uppercase tracking-wider">
                    <th className="py-2.5 px-3">Product</th>
                    <th className="py-2.5 px-3">Your Price</th>
                    <th className="py-2.5 px-3">Market Range (Dot-Strip)</th>
                    <th className="py-2.5 px-3">Gap %</th>
                    <th className="py-2.5 px-3">Rank</th>
                    <th className="py-2.5 px-3">Stock</th>
                    <th className="py-2.5 px-3">Freshness</th>
                    <th className="py-2.5 px-3 text-right">Trust</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {SPECIMEN_INTELLIGENCE_DATA.map((item) => {
                    const diffPaise = item.yourPricePaise - item.marketLowPaise;
                    const gapPercent = item.marketLowPaise > 0 ? (diffPaise / item.marketLowPaise) * 100 : 0;
                    const isLowest = item.rank === 1;

                    return (
                      <tr key={item.id} className="hover:bg-[var(--surface-2)]/40 transition-colors">
                        <td className="py-3 px-3">
                          <div className="font-medium text-[var(--text-1)] font-sans text-xs">{item.title}</div>
                          <div className="text-[10px] text-[var(--text-3)]">{item.brand}</div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-bold text-[var(--text-1)] tabular-nums">
                            ₹{(item.yourPricePaise / 100).toLocaleString("en-IN")}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <DotStripPrice
                            yourPrice={item.yourPricePaise}
                            marketLow={item.marketLowPaise}
                            marketHigh={item.marketHighPaise}
                            otherPrices={item.otherPricesPaise}
                          />
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`font-semibold tabular-nums ${
                              isLowest
                                ? "text-[var(--color-success)]"
                                : gapPercent > 5
                                ? "text-[var(--color-danger)]"
                                : "text-[var(--color-warning)]"
                            }`}
                          >
                            {isLowest ? "Lowest (0%)" : `+${gapPercent.toFixed(1)}%`}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-semibold text-[var(--text-1)]">
                          #{item.rank} of {item.totalSellers}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                              item.stockStatus === "In Stock"
                                ? "bg-[var(--color-success)]/10 text-[var(--color-success)] border-[var(--color-success)]/30"
                                : "bg-[var(--color-warning)]/10 text-[var(--color-warning)] border-[var(--color-warning)]/30"
                            }`}
                          >
                            {item.stockStatus}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-[var(--text-2)]">
                          {item.freshness}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <span className="px-1.5 py-0.5 rounded bg-[var(--surface-2)] text-[var(--color-accent)] border border-[var(--border-subtle)] text-[11px] font-semibold">
                            ★ {item.trustScore}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Undercut Rule Builder with 30-Day Dry-Run Engine */}
          <div className="p-5 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] shadow-xs space-y-4">
            <div>
              <h2 className="text-base font-display font-semibold text-[var(--text-1)]">
                Undercut Rule Builder &amp; 30-Day Dry-Run
              </h2>
              <p className="text-xs text-[var(--text-2)] font-sans">
                Simulate threshold alert rules against 30 days of market data before activation.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              {/* Rule Parameters */}
              <div className="space-y-4">
                <div>
                  <label htmlFor="undercut-input" className="block text-xs font-mono text-[var(--text-2)] mb-1 font-medium">
                    UNDERCUT THRESHOLD (%)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      id="undercut-input"
                      type="number"
                      min={1}
                      max={50}
                      value={undercutThreshold}
                      onChange={(e) => setUndercutThreshold(Number(e.target.value) || 5)}
                      className="w-24 bg-[var(--surface-2)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm font-mono text-[var(--text-1)] outline-none focus:border-[var(--color-accent)] min-h-[40px]"
                    />
                    <span className="text-xs font-mono text-[var(--text-3)]">
                      Alert when competitor undercuts by &gt; {undercutThreshold}%
                    </span>
                  </div>
                </div>

                <div>
                  <label htmlFor="channel-select" className="block text-xs font-mono text-[var(--text-2)] mb-1 font-medium">
                    DISPATCH CHANNEL
                  </label>
                  <select
                    id="channel-select"
                    value={dryRunChannel}
                    onChange={(e) => setDryRunChannel(e.target.value)}
                    className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-lg px-3 py-2 text-xs font-mono text-[var(--text-1)] outline-none focus:border-[var(--color-accent)] min-h-[40px]"
                  >
                    <option value="email">Email Notification (Instant)</option>
                    <option value="webhook">Signed HMAC Webhook Endpoint</option>
                  </select>
                </div>

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <Button
                    variant="secondary"
                    onClick={handleCalculateDryRun}
                    disabled={isSimulating}
                    className="min-h-[40px] font-mono text-xs gap-1.5"
                  >
                    <Play size={13} />
                    <span>{isSimulating ? "Simulating..." : "Run 30-Day Dry-Run"}</span>
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleSaveRule}
                    className="min-h-[40px] font-mono text-xs gap-1.5"
                  >
                    <Zap size={13} />
                    <span>Activate Rule</span>
                  </Button>
                </div>
              </div>

              {/* Dry-Run Result Preview Card */}
              <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] space-y-3 font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-[var(--text-1)]">
                    Historical Dry-Run
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[var(--surface-1)] text-[var(--color-accent)] font-semibold border border-[var(--border-subtle)]">
                    PAST 30 DAYS
                  </span>
                </div>

                <div className="p-3.5 rounded-lg bg-[var(--surface-1)] border border-[var(--border-subtle)]">
                  <div className="text-[11px] text-[var(--text-3)] mb-0.5">SIMULATION VERDICT:</div>
                  <div className="text-base font-bold text-[var(--color-accent)] tabular-nums">
                    Fired {dryRunFiredCount} times in last 30 days
                  </div>
                  <div className="text-[10px] text-[var(--text-3)] mt-1">
                    Based on 14,200 recorded checkpoints across Amazon &amp; Flipkart.
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-[var(--surface-1)] border border-[var(--border-subtle)]">
                    <span className="text-[var(--text-3)] text-[10px] uppercase">Avg Undercut Gap</span>
                    <div className="text-[var(--color-danger)] font-bold text-sm mt-0.5 tabular-nums">
                      {(undercutThreshold * 1.35).toFixed(1)}%
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-[var(--surface-1)] border border-[var(--border-subtle)]">
                    <span className="text-[var(--text-3)] text-[10px] uppercase">False Positive Rate</span>
                    <div className="text-[var(--color-success)] font-bold text-sm mt-0.5 tabular-nums">
                      0.0% (Verified)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
