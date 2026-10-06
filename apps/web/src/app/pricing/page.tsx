"use client";

import React, { useState } from "react";
import { Button, Card, Badge, Dialog, DialogContent, DialogHeader, DialogTitle, useToast } from "@scrappy/ui";

interface PricingTier {
  id: string;
  name: string;
  priceINR: number;
  cadence: string;
  badge?: string;
  description: string;
  limits: {
    trackedProducts: string;
    refreshFrequency: string;
    apiRateLimit: string;
    extractionMinutes: string;
    teamSeats: string;
    webhooks: string;
  };
  features: string[];
  cta: string;
  popular?: boolean;
}

const TIERS: PricingTier[] = [
  {
    id: "free",
    name: "Community",
    priceINR: 0,
    cadence: "Forever Free",
    description: "Personal price drop tracking with standard daily polling.",
    limits: {
      trackedProducts: "10 products",
      refreshFrequency: "Daily (24h)",
      apiRateLimit: "60 req/min",
      extractionMinutes: "5 min/mo",
      teamSeats: "1 seat",
      webhooks: "1 endpoint",
    },
    features: [
      "Access to all 4 supported retailers",
      "Email price drop notifications",
      "CSV catalog export",
      "Standard community support",
    ],
    cta: "Current Plan",
  },
  {
    id: "pro",
    name: "Professional",
    priceINR: 1499,
    cadence: "per month",
    badge: "Most Popular",
    popular: true,
    description: "For active bargain hunters, collectors, and individual analysts.",
    limits: {
      trackedProducts: "250 products",
      refreshFrequency: "Every 15 minutes",
      apiRateLimit: "300 req/min",
      extractionMinutes: "60 min/mo",
      teamSeats: "2 seats",
      webhooks: "5 endpoints",
    },
    features: [
      "Sub-15m refresh frequency",
      "Instant email + webhook notifications",
      "90-day price history charts",
      "Visual Extraction Studio recipes",
      "Priority email support",
    ],
    cta: "Upgrade to Pro",
  },
  {
    id: "team",
    name: "Team & Intelligence",
    priceINR: 4999,
    cadence: "per month",
    badge: "Fastest Scraping",
    description: "For e-commerce brands, pricing teams, and data engineering squads.",
    limits: {
      trackedProducts: "2,500 products",
      refreshFrequency: "Every 5 minutes",
      apiRateLimit: "1,200 req/min",
      extractionMinutes: "300 min/mo",
      teamSeats: "10 seats",
      webhooks: "Unlimited",
    },
    features: [
      "Sub-5m refresh frequency",
      "Cross-merchant price drift alerts",
      "Full REST API & bulk NDJSON export",
      "Audit logging & team role RBAC",
      "Dedicated Slack channel support",
    ],
    cta: "Upgrade to Team",
  },
];

export default function PricingPage() {
  const { showToast } = useToast();
  const [currentPlan, setCurrentPlan] = useState<string>("free");
  const [billingModalTier, setBillingModalTier] = useState<PricingTier | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");

  const handleSelectTier = (tier: PricingTier) => {
    if (tier.id === currentPlan) {
      if (tier.id !== "free") {
        setShowCancelModal(true);
      }
      return;
    }
    setBillingModalTier(tier);
  };

  const handleConfirmSubscription = () => {
    if (!billingModalTier) return;
    setIsProcessing(true);

    // Simulate Razorpay test-mode checkout transition
    setTimeout(() => {
      setIsProcessing(false);
      setCurrentPlan(billingModalTier.id);
      setBillingModalTier(null);
      showToast({
        type: "success",
        title: "Subscription Activated",
        description: `Your workspace is now upgraded to ${billingModalTier.name} (Test Mode simulated).`,
      });
    }, 800);
  };

  const handleConfirmDowngrade = () => {
    setCurrentPlan("free");
    setShowCancelModal(false);
    showToast({
      type: "info",
      title: "Subscription Downgraded",
      description: "Workspace returned to the Community tier.",
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 mb-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-primary)]" aria-hidden="true" />
          <span className="font-mono text-xs uppercase tracking-wider text-[var(--color-primary)] font-bold">
            Transparent Pricing
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-1)] tracking-tight">
          Simple, Predictable Plans
        </h1>
        <p className="text-sm sm:text-base text-[var(--text-3)] mt-2">
          No hidden overage charges or artificial rate gates. Upgrade or cancel anytime with pro-rated billing.
        </p>

        {/* Current Active Plan Status */}
        <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--bg-2)] border border-[var(--border-subtle)] text-xs font-mono">
          <span className="text-[var(--text-3)]">Current Active Workspace Plan:</span>
          <span className="font-bold text-[var(--color-primary)] uppercase">
            {currentPlan}
          </span>
          {currentPlan !== "free" && (
            <button
              type="button"
              onClick={() => setShowCancelModal(true)}
              className="text-[var(--color-danger)] underline ml-2 hover:opacity-80"
            >
              Cancel / Downgrade
            </button>
          )}
        </div>
      </div>

      {/* Pricing Tiers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        {TIERS.map((tier) => {
          const isCurrent = currentPlan === tier.id;
          return (
            <Card
              key={tier.id}
              className={`p-6 sm:p-8 flex flex-col justify-between relative transition-all ${
                tier.popular
                  ? "border-[var(--color-primary)] shadow-md"
                  : "border-[var(--border-subtle)] bg-[var(--bg-1)]"
              }`}
            >
              {tier.badge && (
                <div className="absolute -top-3 right-6">
                  <Badge variant={tier.popular ? "accent" : "success"}>
                    {tier.badge}
                  </Badge>
                </div>
              )}

              <div>
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-[var(--text-1)]">
                    {tier.name}
                  </h2>
                  <p className="text-xs text-[var(--text-3)] mt-1 min-h-[32px]">
                    {tier.description}
                  </p>
                </div>

                <div className="mb-6 pb-6 border-b border-[var(--border-subtle)]">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-bold font-mono text-[var(--text-1)]">
                      ₹{tier.priceINR.toLocaleString("en-IN")}
                    </span>
                    <span className="text-xs text-[var(--text-3)] font-mono">
                      / {tier.cadence}
                    </span>
                  </div>
                </div>

                {/* Quota Limits Breakdown */}
                <div className="space-y-2 mb-6 text-xs font-mono">
                  <div className="flex justify-between py-1 border-b border-[var(--border-subtle)]/50">
                    <span className="text-[var(--text-3)]">Tracked Items:</span>
                    <span className="text-[var(--text-1)] font-semibold">{tier.limits.trackedProducts}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[var(--border-subtle)]/50">
                    <span className="text-[var(--text-3)]">Poll Cadence:</span>
                    <span className="text-[var(--color-success)] font-semibold">{tier.limits.refreshFrequency}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[var(--border-subtle)]/50">
                    <span className="text-[var(--text-3)]">API Limit:</span>
                    <span className="text-[var(--text-1)]">{tier.limits.apiRateLimit}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[var(--border-subtle)]/50">
                    <span className="text-[var(--text-3)]">Extract Compute:</span>
                    <span className="text-[var(--text-1)]">{tier.limits.extractionMinutes}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[var(--border-subtle)]/50">
                    <span className="text-[var(--text-3)]">Team Seats:</span>
                    <span className="text-[var(--text-1)]">{tier.limits.teamSeats}</span>
                  </div>
                </div>

                {/* Features List */}
                <div className="space-y-2.5 mb-8">
                  <div className="text-xs font-bold text-[var(--text-1)] uppercase font-mono">
                    Included Features
                  </div>
                  {tier.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-[var(--text-2)]">
                      <span className="text-[var(--color-success)] font-bold">✓</span>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Button
                  variant={isCurrent ? "secondary" : tier.popular ? "primary" : "secondary"}
                  onClick={() => handleSelectTier(tier)}
                  disabled={isCurrent}
                  className="w-full min-h-[44px] font-mono text-xs font-bold"
                >
                  {isCurrent ? "Current Active Plan" : tier.cta}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Usage Meter Preview */}
      <Card className="p-6 sm:p-8 mb-16">
        <h3 className="text-lg font-bold text-[var(--text-1)] mb-1">
          Workspace Quota &amp; Usage Meter
        </h3>
        <p className="text-xs text-[var(--text-3)] font-mono mb-6">
          Real-time telemetry of your billing period resource consumption.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-4 rounded-lg bg-[var(--bg-2)] border border-[var(--border-subtle)]">
            <div className="flex justify-between text-xs font-mono mb-2">
              <span className="text-[var(--text-3)]">Tracked Items</span>
              <span className="text-[var(--text-1)] font-bold">3 / 10 used</span>
            </div>
            <div className="w-full bg-[var(--border-subtle)] h-2 rounded-full overflow-hidden">
              <div className="bg-[var(--color-primary)] h-full" style={{ width: "30%" }} />
            </div>
          </div>

          <div className="p-4 rounded-lg bg-[var(--bg-2)] border border-[var(--border-subtle)]">
            <div className="flex justify-between text-xs font-mono mb-2">
              <span className="text-[var(--text-3)]">Browser Compute</span>
              <span className="text-[var(--text-1)] font-bold">0.4 / 5.0 min</span>
            </div>
            <div className="w-full bg-[var(--border-subtle)] h-2 rounded-full overflow-hidden">
              <div className="bg-[var(--color-success)] h-full" style={{ width: "8%" }} />
            </div>
          </div>

          <div className="p-4 rounded-lg bg-[var(--bg-2)] border border-[var(--border-subtle)]">
            <div className="flex justify-between text-xs font-mono mb-2">
              <span className="text-[var(--text-3)]">API Requests</span>
              <span className="text-[var(--text-1)] font-bold">120 / 60,000</span>
            </div>
            <div className="w-full bg-[var(--border-subtle)] h-2 rounded-full overflow-hidden">
              <div className="bg-[var(--color-primary)] h-full" style={{ width: "2%" }} />
            </div>
          </div>
        </div>
      </Card>

      {/* BILLING CHECKOUT MODAL (RAZORPAY TEST ADAPTER) */}
      <Dialog
        open={!!billingModalTier}
        onOpenChange={(open) => {
          if (!open) setBillingModalTier(null);
        }}
      >
        {billingModalTier && (
          <DialogContent className="max-w-md bg-[var(--bg-1)] border-[var(--border-subtle)]">
            <DialogHeader>
              <DialogTitle>Subscribe to {billingModalTier.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 text-xs font-mono mt-3">
              <div className="p-3 rounded bg-[var(--bg-2)] border border-[var(--border-subtle)]">
                <div className="flex justify-between mb-1">
                  <span className="text-[var(--text-3)]">Plan:</span>
                  <span className="text-[var(--text-1)] font-bold">{billingModalTier.name}</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span className="text-[var(--text-3)]">Billing Amount:</span>
                  <span className="text-[var(--color-success)] font-bold">
                    ₹{billingModalTier.priceINR.toLocaleString("en-IN")} / month
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-3)]">Adapter Gateway:</span>
                  <span className="text-[var(--text-1)]">Razorpay Sandbox (INR)</span>
                </div>
              </div>

              <p className="text-[var(--text-3)] text-xs">
                This checkout operates in test mode. Zero real currency will be charged. Clicking Confirm activates the tier immediately.
              </p>

              <div className="flex justify-end gap-3 pt-3">
                <Button
                  variant="secondary"
                  onClick={() => setBillingModalTier(null)}
                  className="min-h-[44px]"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleConfirmSubscription}
                  disabled={isProcessing}
                  className="min-h-[44px]"
                >
                  {isProcessing ? "Processing..." : "Confirm Subscription →"}
                </Button>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>

      {/* CANCELLATION / DOWNGRADE MODAL */}
      <Dialog
        open={showCancelModal}
        onOpenChange={(open) => setShowCancelModal(open)}
      >
        <DialogContent className="max-w-md bg-[var(--bg-1)] border-[var(--border-subtle)]">
          <DialogHeader>
            <DialogTitle>Downgrade to Community Tier</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-xs mt-3">
            <div className="p-3 rounded bg-[var(--color-warn)]/10 border border-[var(--color-warn)]/30 text-[var(--color-warn)] font-mono">
              ⚠️ Warning: Downgrading will reduce your tracked product limit to 10 and polling cadence to 24h.
            </div>

            <div>
              <label htmlFor="cancel-reason" className="block text-xs font-mono text-[var(--text-2)] mb-1.5 font-medium">
                Reason for downgrade (Optional)
              </label>
              <select
                id="cancel-reason"
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                className="w-full bg-[var(--bg-2)] border border-[var(--border-subtle)] rounded px-3 py-2 text-xs text-[var(--text-1)] outline-none min-h-[44px]"
              >
                <option value="">Select a reason</option>
                <option value="too_expensive">Pricing didn't fit budget</option>
                <option value="missing_features">Missing retailers or features</option>
                <option value="temporary">Completed active purchase project</option>
                <option value="other">Other reason</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <Button
                variant="secondary"
                onClick={() => setShowCancelModal(false)}
                className="min-h-[44px]"
              >
                Keep Current Plan
              </Button>
              <Button
                variant="danger"
                onClick={handleConfirmDowngrade}
                className="min-h-[44px]"
              >
                Confirm Downgrade
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
