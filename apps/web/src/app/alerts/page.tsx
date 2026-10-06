"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Button,
  Badge,
  EmptyState,
  TrashIcon,
  BellIcon,
  CheckIcon,
  useToast,
} from "@scrappy/ui";
import { defaultCatalogRepository, ProductDetail } from "@scrappy/db";

interface AlertRule {
  id: string;
  productId: string;
  productTitle: string;
  brand: string;
  currentLowestPricePaise: number;
  targetPricePaise: number;
  store: string;
  channels: ("email" | "in_app" | "webhook")[];
  frequency: "instant" | "hourly" | "daily";
  status: "active" | "paused";
  createdAt: string;
  lastFiredAt?: string;
  triggerCount: number;
}

export default function AlertsPage() {
  const { showToast } = useToast();

  const catalogProducts = useMemo(() => {
    return [
      defaultCatalogRepository.getProductDetail("b2000000-0000-0000-0000-000000000001"),
      defaultCatalogRepository.getProductDetail("b2000000-0000-0000-0000-000000000002"),
      defaultCatalogRepository.getProductDetail("b2000000-0000-0000-0000-000000000003"),
      defaultCatalogRepository.getProductDetail("b2000000-0000-0000-0000-000000000004"),
    ].filter((p): p is ProductDetail => Boolean(p));
  }, []);

  const [rules, setRules] = useState<AlertRule[]>([
    {
      id: "rule-1",
      productId: "b2000000-0000-0000-0000-000000000001",
      productTitle: catalogProducts[0]?.title || "Apple iPhone 16 Pro (128GB)",
      brand: catalogProducts[0]?.brand || "Apple",
      currentLowestPricePaise: catalogProducts[0]?.lowestPricePaise || 11990000,
      targetPricePaise: 11000000,
      store: "Any Verified Store",
      channels: ["email", "in_app"],
      frequency: "instant",
      status: "active",
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      lastFiredAt: new Date(Date.now() - 4 * 3600000).toISOString(),
      triggerCount: 2,
    },
    {
      id: "rule-2",
      productId: "b2000000-0000-0000-0000-000000000002",
      productTitle: catalogProducts[1]?.title || "Sony WH-1000XM5 Wireless Headphones",
      brand: catalogProducts[1]?.brand || "Sony",
      currentLowestPricePaise: catalogProducts[1]?.lowestPricePaise || 2699000,
      targetPricePaise: 2450000,
      store: "Amazon India",
      channels: ["email", "in_app", "webhook"],
      frequency: "hourly",
      status: "active",
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      triggerCount: 0,
    },
  ]);

  // Rule Builder Form State
  const [selectedProductId, setSelectedProductId] = useState<string>(
    catalogProducts[0]?.id || "b2000000-0000-0000-0000-000000000001"
  );
  const [conditionType, setConditionType] = useState<"preset_10" | "preset_5" | "all_time_low" | "custom">("preset_10");
  const [customPriceRupees, setCustomPriceRupees] = useState<string>("105000");
  const [selectedStore, setSelectedStore] = useState<string>("Any Verified Store");
  const [channels, setChannels] = useState<("email" | "in_app" | "webhook")[]>(["email", "in_app"]);
  const [frequency, setFrequency] = useState<"instant" | "hourly" | "daily">("instant");

  const selectedProduct = useMemo(() => {
    return catalogProducts.find((p) => p.id === selectedProductId) || catalogProducts[0];
  }, [catalogProducts, selectedProductId]);

  // Compute calculated target price paise
  const calculatedTargetPaise = useMemo(() => {
    if (!selectedProduct) return 0;
    if (conditionType === "preset_10") {
      return Math.round(selectedProduct.lowestPricePaise * 0.90);
    }
    if (conditionType === "preset_5") {
      return Math.round(selectedProduct.lowestPricePaise * 0.95);
    }
    if (conditionType === "all_time_low") {
      const prices = selectedProduct.priceHistory.map((h) => h.pricePaise);
      return Math.min(...prices, selectedProduct.lowestPricePaise);
    }
    const parsed = parseInt(customPriceRupees.replace(/,/g, ""), 10);
    return isNaN(parsed) ? selectedProduct.lowestPricePaise : parsed * 100;
  }, [selectedProduct, conditionType, customPriceRupees]);

  // Channel toggling
  const toggleChannel = (ch: "email" | "in_app" | "webhook") => {
    setChannels((prev) =>
      prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch]
    );
  };

  // Add rule handler
  const handleCreateRule = async () => {
    if (!selectedProduct) return;
    if (channels.length === 0) {
      showToast({
        type: "warning",
        title: "Select At Least One Channel",
        description: "Choose Email, In-App, or Webhook to receive drop notifications.",
      });
      return;
    }

    const newRule: AlertRule = {
      id: `rule-${Date.now()}`,
      productId: selectedProduct.id,
      productTitle: selectedProduct.title,
      brand: selectedProduct.brand,
      currentLowestPricePaise: selectedProduct.lowestPricePaise,
      targetPricePaise: calculatedTargetPaise,
      store: selectedStore,
      channels,
      frequency,
      status: "active",
      createdAt: new Date().toISOString(),
      triggerCount: 0,
    };

    setRules((prev) => [newRule, ...prev]);

    // Persist via API
    try {
      await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedProduct.id,
          targetPricePaise: calculatedTargetPaise,
          notificationChannel: channels.join(","),
        }),
      });
    } catch {
      // Local state maintained
    }

    showToast({
      type: "success",
      title: "Alert Rule Activated",
      description: `Monitoring ${selectedProduct.title} for drops below ₹${Math.round(calculatedTargetPaise / 100).toLocaleString("en-IN")}.`,
    });
  };

  const handleTestAlert = () => {
    showToast({
      type: "info",
      title: "Test Alert Dispatched",
      description: `Simulated price drop ping sent via ${channels.join(", ")}. In-App badge updated.`,
    });
  };

  // Fetch persisted alerts on mount
  useEffect(() => {
    let mounted = true;
    fetch("/api/alerts")
      .then((r) => (r.ok ? r.json() : { alerts: [] }))
      .then((data) => {
        if (!mounted || !data.alerts || data.alerts.length === 0) return;
        interface RawAlert {
          id: string;
          productId?: string;
          product_id?: string;
          product?: { title?: string; brand?: string; lowestPricePaise?: number };
          productTitle?: string;
          brand?: string;
          targetPricePaise?: number;
          target_price_paise?: number;
          notificationChannel?: "email" | "in_app" | "webhook";
          status?: "active" | "paused";
          createdAt?: string;
          created_at?: string;
        }
        const mapped: AlertRule[] = (data.alerts as RawAlert[]).map((a) => ({
          id: a.id,
          productId: a.productId || a.product_id || "b2000000-0000-0000-0000-000000000001",
          productTitle: a.product?.title || a.productTitle || "Verified Product",
          brand: a.product?.brand || a.brand || "Verified Brand",
          currentLowestPricePaise: a.product?.lowestPricePaise || 11990000,
          targetPricePaise: a.targetPricePaise || a.target_price_paise || 10000000,
          store: "Any Verified Store",
          channels: a.notificationChannel ? [a.notificationChannel] : ["in_app"],
          frequency: "instant",
          status: a.status || "active",
          createdAt: a.createdAt || a.created_at || new Date().toISOString(),
          triggerCount: 0,
        }));
        setRules(mapped);
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, []);

  const handleDeleteRule = (id: string) => {
    const deleted = rules.find((r) => r.id === id);
    setRules((prev) => prev.filter((r) => r.id !== id));

    fetch(`/api/alerts?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    }).catch(() => {});

    showToast({
      type: "info",
      title: "Rule Removed",
      description: deleted?.productTitle || "Alert rule removed.",
      onUndo: () => {
        if (deleted) {
          setRules((prev) => [...prev, deleted]);
          fetch("/api/alerts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              productId: deleted.productId,
              targetPricePaise: deleted.targetPricePaise,
              notificationChannel: deleted.channels.join(","),
            }),
          }).catch(() => {});
        }
      },
    });
  };

  const toggleRuleStatus = (id: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: r.status === "active" ? "paused" : "active" } : r))
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border-default)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--color-accent)] font-semibold">
              Intelligence Suite · Trigger Engine
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--surface-2)] text-[var(--text-3)] border border-[var(--border-subtle)]">
              Real-time Evaluation
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-[var(--text-1)] tracking-tight">
            Price Alert Rules
          </h1>
          <p className="text-xs sm:text-sm font-sans text-[var(--text-2)] mt-1">
            Build plain-language drop trigger conditions with instant multi-channel dispatch.
          </p>
        </div>

        <Link href="/watchlist">
          <Button variant="secondary" className="min-h-[44px]">
            <span>View Watchlist ({rules.length})</span>
          </Button>
        </Link>
      </div>

      {/* Plain-Language Rule Builder Card */}
      <section aria-labelledby="rule-builder-heading" className="p-6 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-1)] shadow-[var(--elevation-2)] space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-accent)]" />
            <h2 id="rule-builder-heading" className="text-base font-sans font-bold text-[var(--text-1)] tracking-tight">
              Plain-Language Rule Composer
            </h2>
          </div>
          <span className="text-xs font-mono text-[var(--text-3)]">
            Step-by-step trigger configuration
          </span>
        </div>

        {/* Live Rule Preview Sentence */}
        <div className="p-4 rounded-[var(--radius-md)] bg-[var(--surface-0)] border border-[var(--border-subtle)] text-sm sm:text-base font-sans leading-relaxed text-[var(--text-2)]">
          <span className="text-[var(--text-1)] font-semibold">Rule Preview: </span>
          <span>&ldquo;Notify me when </span>
          <strong className="text-[var(--color-accent)] font-semibold underline underline-offset-4 decoration-[var(--color-accent)]/40">
            {selectedProduct?.title || "selected product"}
          </strong>
          <span> drops below </span>
          <strong className="text-[var(--color-success)] font-mono font-bold">
            ₹{Math.round(calculatedTargetPaise / 100).toLocaleString("en-IN")}
          </strong>
          <span> across </span>
          <strong className="text-[var(--text-1)] font-medium">
            {selectedStore}
          </strong>
          <span> via </span>
          <strong className="text-[var(--color-accent)] font-medium uppercase font-mono text-xs">
            {channels.join(" + ") || "no channels selected"}
          </strong>
          <span> at </span>
          <strong className="text-[var(--text-1)] font-mono text-xs">
            {frequency} frequency
          </strong>
          <span>.&rdquo;</span>
        </div>

        {/* Configuration Controls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* 1. Target Product */}
          <div className="space-y-1.5">
            <label htmlFor="product-select" className="text-xs font-mono uppercase text-[var(--text-3)]">
              1. Target Product
            </label>
            <select
              id="product-select"
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full px-3 py-2 text-xs font-sans rounded-[var(--radius-sm)] bg-[var(--surface-0)] border border-[var(--border-default)] text-[var(--text-1)] min-h-[44px] focus:outline-none focus:ring-2 focus:ring-[var(--border-focus)]"
            >
              {catalogProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.brand} — {p.title.slice(0, 38)}... (₹{Math.round(p.lowestPricePaise / 100).toLocaleString("en-IN")})
                </option>
              ))}
            </select>
          </div>

          {/* 2. Target Condition */}
          <div className="space-y-1.5">
            <span className="text-xs font-mono uppercase text-[var(--text-3)] block">
              2. Drop Condition
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => setConditionType("preset_10")}
                className={`min-h-[40px] px-2 text-xs font-mono rounded-[var(--radius-sm)] border transition-colors ${
                  conditionType === "preset_10"
                    ? "bg-[var(--color-accent)]/15 text-[var(--color-accent)] border-[var(--color-accent)]/30 font-semibold"
                    : "bg-[var(--surface-0)] text-[var(--text-2)] border-[var(--border-default)] hover:text-[var(--text-1)]"
                }`}
              >
                10% Drop
              </button>
              <button
                type="button"
                onClick={() => setConditionType("preset_5")}
                className={`min-h-[40px] px-2 text-xs font-mono rounded-[var(--radius-sm)] border transition-colors ${
                  conditionType === "preset_5"
                    ? "bg-[var(--color-accent)]/15 text-[var(--color-accent)] border-[var(--color-accent)]/30 font-semibold"
                    : "bg-[var(--surface-0)] text-[var(--text-2)] border-[var(--border-default)] hover:text-[var(--text-1)]"
                }`}
              >
                5% Drop
              </button>
              <button
                type="button"
                onClick={() => setConditionType("all_time_low")}
                className={`min-h-[40px] px-2 text-xs font-mono rounded-[var(--radius-sm)] border transition-colors ${
                  conditionType === "all_time_low"
                    ? "bg-[var(--color-accent)]/15 text-[var(--color-accent)] border-[var(--color-accent)]/30 font-semibold"
                    : "bg-[var(--surface-0)] text-[var(--text-2)] border-[var(--border-default)] hover:text-[var(--text-1)]"
                }`}
              >
                All-Time Low
              </button>
              <button
                type="button"
                onClick={() => setConditionType("custom")}
                className={`min-h-[40px] px-2 text-xs font-mono rounded-[var(--radius-sm)] border transition-colors ${
                  conditionType === "custom"
                    ? "bg-[var(--color-accent)]/15 text-[var(--color-accent)] border-[var(--color-accent)]/30 font-semibold"
                    : "bg-[var(--surface-0)] text-[var(--text-2)] border-[var(--border-default)] hover:text-[var(--text-1)]"
                }`}
              >
                Custom ₹
              </button>
            </div>
          </div>

          {/* 3. Retailer Scope */}
          <div className="space-y-1.5">
            <label htmlFor="store-select" className="text-xs font-mono uppercase text-[var(--text-3)]">
              3. Merchant Scope
            </label>
            <select
              id="store-select"
              value={selectedStore}
              onChange={(e) => setSelectedStore(e.target.value)}
              className="w-full px-3 py-2 text-xs font-sans rounded-[var(--radius-sm)] bg-[var(--surface-0)] border border-[var(--border-default)] text-[var(--text-1)] min-h-[44px] focus:outline-none focus:ring-2 focus:ring-[var(--border-focus)]"
            >
              <option value="Any Verified Store">Any Verified Store (Amazon, Flipkart, Croma, Reliance)</option>
              <option value="Amazon India">Amazon India Only</option>
              <option value="Flipkart">Flipkart Only</option>
              <option value="Croma">Croma Only</option>
            </select>
          </div>

          {/* 4. Notification Channels */}
          <div className="space-y-1.5">
            <span className="text-xs font-mono uppercase text-[var(--text-3)] block">
              4. Channels
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => toggleChannel("email")}
                className={`min-h-[40px] px-2.5 text-xs font-mono rounded-[var(--radius-sm)] border transition-colors flex items-center gap-1.5 ${
                  channels.includes("email")
                    ? "bg-[var(--color-accent)]/15 text-[var(--color-accent)] border-[var(--color-accent)]/30 font-semibold"
                    : "bg-[var(--surface-0)] text-[var(--text-3)] border-[var(--border-default)]"
                }`}
              >
                {channels.includes("email") && <CheckIcon size={16} />}
                <span>Email</span>
              </button>
              <button
                type="button"
                onClick={() => toggleChannel("in_app")}
                className={`min-h-[40px] px-2.5 text-xs font-mono rounded-[var(--radius-sm)] border transition-colors flex items-center gap-1.5 ${
                  channels.includes("in_app")
                    ? "bg-[var(--color-accent)]/15 text-[var(--color-accent)] border-[var(--color-accent)]/30 font-semibold"
                    : "bg-[var(--surface-0)] text-[var(--text-3)] border-[var(--border-default)]"
                }`}
              >
                {channels.includes("in_app") && <CheckIcon size={16} />}
                <span>In-App</span>
              </button>
              <button
                type="button"
                onClick={() => toggleChannel("webhook")}
                className={`min-h-[40px] px-2.5 text-xs font-mono rounded-[var(--radius-sm)] border transition-colors flex items-center gap-1.5 ${
                  channels.includes("webhook")
                    ? "bg-[var(--color-accent)]/15 text-[var(--color-accent)] border-[var(--color-accent)]/30 font-semibold"
                    : "bg-[var(--surface-0)] text-[var(--text-3)] border-[var(--border-default)]"
                }`}
              >
                {channels.includes("webhook") && <CheckIcon size={16} />}
                <span>Webhook</span>
              </button>
              <button
                type="button"
                disabled
                title="Telegram bot webhook integration is in development"
                className="min-h-[40px] px-2.5 text-xs font-mono rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-[var(--surface-1)] text-[var(--text-3)] opacity-60 cursor-not-allowed flex items-center gap-1.5"
              >
                <span>Telegram (Coming soon)</span>
              </button>
            </div>
          </div>

          {/* 5. Dispatch Frequency */}
          <div className="space-y-1.5">
            <label htmlFor="frequency-select" className="text-xs font-mono uppercase text-[var(--text-3)] block">
              5. Frequency
            </label>
            <select
              id="frequency-select"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as typeof frequency)}
              className="w-full px-3 py-2 text-xs font-sans rounded-[var(--radius-sm)] bg-[var(--surface-0)] border border-[var(--border-default)] text-[var(--text-1)] min-h-[44px] focus:outline-none focus:ring-2 focus:ring-[var(--border-focus)]"
            >
              <option value="instant">Instant (&lt; 60s)</option>
              <option value="hourly">Hourly Digest</option>
              <option value="daily">Daily Summary</option>
            </select>
          </div>
        </div>

        {/* Custom Price Input if selected */}
        {conditionType === "custom" && (
          <div className="pt-2">
            <label htmlFor="custom-target-input" className="text-xs font-mono text-[var(--text-3)] block mb-1">
              Specify Exact Target Price (₹ INR):
            </label>
            <input
              id="custom-target-input"
              type="text"
              value={customPriceRupees}
              onChange={(e) => setCustomPriceRupees(e.target.value)}
              placeholder="e.g. 105000"
              className="max-w-xs px-3 py-2 text-sm font-mono rounded-[var(--radius-sm)] bg-[var(--surface-0)] border border-[var(--border-default)] text-[var(--text-1)] min-h-[44px] focus:outline-none focus:ring-2 focus:ring-[var(--border-focus)]"
            />
          </div>
        )}

        {/* Action Row */}
        <div className="pt-4 border-t border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="primary" onClick={handleCreateRule} className="min-h-[44px]">
              <BellIcon size={16} />
              <span>Activate Alert Rule</span>
            </Button>
            <Button variant="secondary" onClick={handleTestAlert} className="min-h-[44px]">
              <span>Send Test Ping</span>
            </Button>
          </div>

          <div className="text-xs font-mono text-[var(--text-3)]">
            Verified dispatch SLA: &lt; 60 seconds from price observation
          </div>
        </div>
      </section>

      {/* Active Rules List */}
      <section aria-labelledby="active-rules-heading" className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 id="active-rules-heading" className="text-base font-sans font-bold text-[var(--text-1)]">
              Active Price Alert Rules ({rules.length})
            </h2>
          </div>
          <span className="text-xs font-mono text-[var(--text-3)]">
            Monitored by worker daemon
          </span>
        </div>

        {rules.length === 0 ? (
          <div className="p-8 text-center rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-0)]">
            <EmptyState
              title="No Alert Rules Active"
              description="Configure a rule above to receive automated price drop alerts when deals break."
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rules.map((rule) => {
              const gapRupees = Math.round((rule.currentLowestPricePaise - rule.targetPricePaise) / 100);
              const isBelowTarget = rule.currentLowestPricePaise <= rule.targetPricePaise;

              return (
                <div
                  key={rule.id}
                  className="p-5 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-0)] shadow-[var(--elevation-1)] space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <Badge variant="outline" size="sm">
                        {rule.brand}
                      </Badge>
                      <button
                        type="button"
                        onClick={() => toggleRuleStatus(rule.id)}
                        className={`text-[11px] font-mono px-2 py-0.5 rounded border ${
                          rule.status === "active"
                            ? "bg-[var(--color-success)]/10 text-[var(--color-success)] border-[var(--color-success)]/20"
                            : "bg-[var(--surface-2)] text-[var(--text-3)] border-[var(--border-subtle)]"
                        }`}
                      >
                        {rule.status === "active" ? "ACTIVE" : "PAUSED"}
                      </button>
                    </div>

                    <Link
                      href={`/compare/${rule.productId}`}
                      className="font-semibold text-sm text-[var(--text-1)] hover:text-[var(--color-accent)] line-clamp-1 transition-colors focus-visible:outline-none focus-visible:underline"
                    >
                      {rule.productTitle}
                    </Link>

                    <div className="p-3 rounded-[var(--radius-sm)] bg-[var(--surface-1)] text-xs font-mono space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[var(--text-3)]">Target Alert:</span>
                        <span className="font-bold text-[var(--color-success)]">
                          ₹{Math.round(rule.targetPricePaise / 100).toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[var(--text-3)]">Current Lowest:</span>
                        <span className="text-[var(--text-1)]">
                          ₹{Math.round(rule.currentLowestPricePaise / 100).toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-[var(--border-subtle)] text-[11px]">
                        <span className="text-[var(--text-3)]">Distance to Trigger:</span>
                        {isBelowTarget ? (
                          <span className="text-[var(--color-success)] font-semibold">
                            ✓ Trigger condition met!
                          </span>
                        ) : (
                          <span className="text-[var(--text-2)]">
                            ₹{gapRupees.toLocaleString("en-IN")} drop needed
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {rule.channels.map((ch) => (
                        <span
                          key={ch}
                          className="px-2 py-0.5 rounded text-[10px] uppercase font-mono bg-[var(--surface-2)] text-[var(--text-2)] border border-[var(--border-subtle)]"
                        >
                          {ch}
                        </span>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteRule(rule.id)}
                      className="min-h-[36px] min-w-[36px] p-2 rounded text-[var(--text-3)] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10 flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--border-focus)]"
                      title="Delete rule"
                      aria-label={`Delete alert rule for ${rule.productTitle}`}
                    >
                      <TrashIcon size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
