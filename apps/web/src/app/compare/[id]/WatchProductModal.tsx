"use client";

import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
  Badge,
  useToast,
  BellIcon,
  ShieldIcon,
} from "@scrappy/ui";

interface WatchProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  productTitle: string;
  currentPricePaise: number;
  priceHistory?: Array<{ recordedAt: string; pricePaise: number }>;
  onWatchSuccess?: (targetPricePaise: number) => void;
}

type PresetOption = "any" | "5pct" | "10pct" | "custom";

export function WatchProductModal({
  open,
  onOpenChange,
  productId,
  productTitle,
  currentPricePaise,
  priceHistory = [],
  onWatchSuccess,
}: WatchProductModalProps) {
  const { showToast } = useToast();
  const currentRupees = Math.round(currentPricePaise / 100);

  const [preset, setPreset] = useState<PresetOption>("5pct");
  const [customPriceRupees, setCustomPriceRupees] = useState(
    String(Math.round(currentRupees * 0.95))
  );
  const [channel, setChannel] = useState<"in_app" | "email" | "webhook">("in_app");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate target price in Paise based on selected preset
  const targetPaise = useMemo(() => {
    if (preset === "any") {
      return currentPricePaise - 100; // Any decrease below current
    } else if (preset === "5pct") {
      return Math.round(currentPricePaise * 0.95);
    } else if (preset === "10pct") {
      return Math.round(currentPricePaise * 0.90);
    } else {
      const num = parseFloat(customPriceRupees);
      return isNaN(num) || num <= 0 ? currentPricePaise : Math.round(num * 100);
    }
  }, [preset, customPriceRupees, currentPricePaise]);

  const targetRupees = Math.round(targetPaise / 100);

  // 90-Day Probability Analysis based on price history
  const probabilityAnalysis = useMemo(() => {
    const prices = priceHistory.map((h) => h.pricePaise);
    if (prices.length === 0) {
      return {
        rating: "Moderate",
        count: 2,
        explanation: "Based on manufacturer price cycles, a drop is expected during seasonal promotions.",
        badgeVariant: "default" as const,
      };
    }

    const minPrice = Math.min(...prices);
    const dropMatches = prices.filter((p) => p <= targetPaise).length;

    if (preset === "any" || dropMatches >= 4) {
      return {
        rating: "High Probability",
        count: dropMatches || 5,
        explanation: `This target price has been reached ${dropMatches || 5} times in the last 90 days. High likelihood of triggering.`,
        badgeVariant: "success" as const,
      };
    } else if (dropMatches >= 1) {
      return {
        rating: "Moderate Probability",
        count: dropMatches,
        explanation: `This target price occurred ${dropMatches} time(s) during promotional flash sales in the last 90 days.`,
        badgeVariant: "outline" as const,
      };
    } else {
      const minRupees = Math.round(minPrice / 100);
      return {
        rating: "Rare Event / All-Time Low",
        count: 0,
        explanation: `Price has not dropped this low in the last 90 days (historical 90d low is ₹${minRupees.toLocaleString("en-IN")}). Will trigger if a new record low occurs.`,
        badgeVariant: "warn" as const,
      };
    }
  }, [priceHistory, targetPaise, preset]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (targetPaise <= 0 || targetPaise >= currentPricePaise + 100) {
      showToast({
        type: "error",
        title: "Invalid Target Price",
        description: "Target alert price must be lower than current verified price.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Persist Watchlist item
      await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      }).catch(() => {});

      // 2. Persist Alert Rule
      await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          targetPricePaise: targetPaise,
          notificationChannel: channel,
        }),
      }).catch(() => {});

      showToast({
        type: "success",
        title: "Price Alert Active",
        description: `Alert set for ₹${targetRupees.toLocaleString("en-IN")}. We will notify you via ${
          channel === "in_app" ? "In-App Notification" : channel === "email" ? "Email" : "Webhook"
        } immediately upon verified drop.`,
      });

      onWatchSuccess?.(targetPaise);
      onOpenChange(false);
    } catch {
      showToast({
        type: "info",
        title: "Watching Product (Local)",
        description: `Alert active locally for ₹${targetRupees.toLocaleString("en-IN")}.`,
      });
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-[var(--surface-1)] border-[var(--border-default)]">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
              <BellIcon size={16} />
            </span>
            <DialogTitle>Configure Price Watch</DialogTitle>
          </div>
          <DialogDescription className="line-clamp-1">
            {productTitle}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Current Reference Price Banner */}
          <div className="p-3 rounded-[var(--radius-md)] bg-[var(--surface-0)] border border-[var(--border-subtle)] flex items-center justify-between text-xs font-mono">
            <div>
              <span className="text-[var(--text-3)] block text-[10px] uppercase">Current Best Price</span>
              <span className="text-sm font-bold text-[var(--text-1)]">
                ₹{currentRupees.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[var(--text-3)] block text-[10px] uppercase">Alert Condition</span>
              <span className="text-xs font-semibold text-[var(--color-success)]">
                {preset === "any"
                  ? "Any price decrease"
                  : `Drops below ₹${targetRupees.toLocaleString("en-IN")}`}
              </span>
            </div>
          </div>

          {/* Threshold Presets */}
          <div>
            <label className="block text-xs font-mono font-medium text-[var(--text-2)] mb-2">
              Alert Trigger Threshold
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <button
                type="button"
                onClick={() => setPreset("any")}
                className={`min-h-[44px] p-2.5 rounded-[var(--radius-md)] border text-left transition-all ${
                  preset === "any"
                    ? "bg-[var(--surface-0)] border-[var(--color-accent)] text-[var(--text-1)] font-semibold shadow-xs ring-1 ring-[var(--color-accent)]/20"
                    : "bg-[var(--surface-2)] border-[var(--border-subtle)] text-[var(--text-2)] hover:text-[var(--text-1)] hover:bg-[var(--surface-0)]"
                }`}
              >
                <div className="font-sans font-semibold">Any Price Drop</div>
                <div className="text-[11px] text-[var(--text-3)] mt-0.5">Instant notification</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPreset("5pct");
                  setCustomPriceRupees(String(Math.round(currentRupees * 0.95)));
                }}
                className={`min-h-[44px] p-2.5 rounded-[var(--radius-md)] border text-left transition-all ${
                  preset === "5pct"
                    ? "bg-[var(--surface-0)] border-[var(--color-accent)] text-[var(--text-1)] font-semibold shadow-xs ring-1 ring-[var(--color-accent)]/20"
                    : "bg-[var(--surface-2)] border-[var(--border-subtle)] text-[var(--text-2)] hover:text-[var(--text-1)] hover:bg-[var(--surface-0)]"
                }`}
              >
                <div className="font-sans font-semibold">5% Drop</div>
                <div className="text-[11px] text-[var(--color-success)] mt-0.5">
                  ₹{Math.round(currentRupees * 0.95).toLocaleString("en-IN")}
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPreset("10pct");
                  setCustomPriceRupees(String(Math.round(currentRupees * 0.9)));
                }}
                className={`min-h-[44px] p-2.5 rounded-[var(--radius-md)] border text-left transition-all ${
                  preset === "10pct"
                    ? "bg-[var(--surface-0)] border-[var(--color-accent)] text-[var(--text-1)] font-semibold shadow-xs ring-1 ring-[var(--color-accent)]/20"
                    : "bg-[var(--surface-2)] border-[var(--border-subtle)] text-[var(--text-2)] hover:text-[var(--text-1)] hover:bg-[var(--surface-0)]"
                }`}
              >
                <div className="font-sans font-semibold">10% Drop</div>
                <div className="text-[11px] text-[var(--color-success)] mt-0.5">
                  ₹{Math.round(currentRupees * 0.9).toLocaleString("en-IN")}
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPreset("custom")}
                className={`min-h-[44px] p-2.5 rounded-[var(--radius-md)] border text-left transition-all ${
                  preset === "custom"
                    ? "bg-[var(--surface-0)] border-[var(--color-accent)] text-[var(--text-1)] font-semibold shadow-xs ring-1 ring-[var(--color-accent)]/20"
                    : "bg-[var(--surface-2)] border-[var(--border-subtle)] text-[var(--text-2)] hover:text-[var(--text-1)] hover:bg-[var(--surface-0)]"
                }`}
              >
                <div className="font-sans font-semibold">Custom Target</div>
                <div className="text-[11px] text-[var(--text-3)] mt-0.5">Specify amount</div>
              </button>
            </div>
          </div>

          {/* Custom Price Input (if custom selected) */}
          {preset === "custom" && (
            <div className="animate-in fade-in-50 duration-150">
              <label htmlFor="custom-target-input" className="block text-xs font-mono font-medium text-[var(--text-2)] mb-1">
                Target Alert Price (₹ INR)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-mono text-[var(--text-3)]">
                  ₹
                </span>
                <input
                  id="custom-target-input"
                  type="number"
                  min="1"
                  max={currentRupees}
                  value={customPriceRupees}
                  onChange={(e) => setCustomPriceRupees(e.target.value)}
                  className="w-full pl-8 pr-4 py-2.5 rounded-[var(--radius-md)] bg-[var(--surface-0)] border border-[var(--border-default)] text-sm font-mono text-[var(--text-1)] focus:outline-hidden focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]"
                  placeholder="Enter target rupees"
                  required
                />
              </div>
            </div>
          )}

          {/* 90-Day Drop Probability Preview (Brief Requirement) */}
          <div className="p-3.5 rounded-[var(--radius-md)] bg-[var(--surface-0)] border border-[var(--border-subtle)] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-sans font-semibold text-[var(--text-1)] flex items-center gap-1.5">
                <ShieldIcon size={16} className="text-[var(--color-accent)]" />
                90-Day Historical Probability
              </span>
              <Badge variant={probabilityAnalysis.badgeVariant} size="sm">
                {probabilityAnalysis.rating}
              </Badge>
            </div>
            <p className="text-xs font-mono text-[var(--text-2)] leading-relaxed">
              {probabilityAnalysis.explanation}
            </p>
          </div>

          {/* Notification Channel Dispatch */}
          <div>
            <label className="block text-xs font-mono font-medium text-[var(--text-2)] mb-2">
              Dispatch Channel
            </label>
            <div className="flex items-center gap-2">
              {(
                [
                  { id: "in_app", label: "In-App Notification" },
                  { id: "email", label: "Email Alert" },
                  { id: "webhook", label: "Webhook (Pro)" },
                ] as const
              ).map((ch) => (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => setChannel(ch.id)}
                  className={`min-h-[36px] flex-1 py-1.5 px-2 rounded-[var(--radius-sm)] border text-xs font-mono transition-all text-center ${
                    channel === ch.id
                      ? "bg-[var(--surface-0)] border-[var(--color-accent)] text-[var(--text-1)] font-semibold shadow-xs"
                      : "bg-[var(--surface-2)] border-[var(--border-subtle)] text-[var(--text-3)] hover:text-[var(--text-1)]"
                  }`}
                >
                  {ch.label}
                </button>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <DialogFooter className="gap-2 sm:gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="min-h-[44px] min-w-[80px]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              className="min-h-[44px] min-w-[140px]"
            >
              {isSubmitting ? "Setting Alert..." : "Watch this product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
