"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button, Card, useToast } from "@scrappy/ui";
import { Check, Sparkles, ArrowRight, ArrowLeft } from "lucide-react";

interface PersonaOption {
  id: string;
  title: string;
  description: string;
  icon: string;
}

const PERSONAS: PersonaOption[] = [
  {
    id: "consumer_tech",
    title: "Consumer Electronics & Tech",
    description: "Track laptops, smartphones, noise-cancelling headphones, and monitors.",
    icon: "💻",
  },
  {
    id: "appliances",
    title: "Home Appliances & Living",
    description: "Track robot vacuums, air purifiers, coffee machines, and TVs.",
    icon: "🏠",
  },
  {
    id: "retail_analytics",
    title: "Market Intelligence & Retail Analyst",
    description: "Multi-merchant cross-index price arbitrage, seller drift, and catalog velocity.",
    icon: "📊",
  },
  {
    id: "developer_api",
    title: "Developer & Data Engineer",
    description: "Headless extraction studio, automated Webhooks, and schema recipes.",
    icon: "⚡",
  },
];

interface SpecimenProduct {
  id: string;
  title: string;
  brand: string;
  currentLowestPaise: number;
  mrpPaise: number;
  dealScore: number;
  retailerCount: number;
}

const SPECIMEN_PRODUCTS: SpecimenProduct[] = [
  {
    id: "p1",
    title: "Apple MacBook Air M3 (16GB RAM, 512GB SSD)",
    brand: "Apple",
    currentLowestPaise: 13490000,
    mrpPaise: 14490000,
    dealScore: 92,
    retailerCount: 4,
  },
  {
    id: "p2",
    title: "Sony WH-1000XM5 Wireless Noise Cancelling",
    brand: "Sony",
    currentLowestPaise: 2999000,
    mrpPaise: 3499000,
    dealScore: 88,
    retailerCount: 3,
  },
  {
    id: "p3",
    title: "Samsung Galaxy S24 Ultra 5G (512GB)",
    brand: "Samsung",
    currentLowestPaise: 12999900,
    mrpPaise: 13999900,
    dealScore: 94,
    retailerCount: 4,
  },
  {
    id: "p4",
    title: "Dyson V12 Detect Slim Cordless Vacuum",
    brand: "Dyson",
    currentLowestPaise: 4990000,
    mrpPaise: 5590000,
    dealScore: 85,
    retailerCount: 3,
  },
];

export default function OnboardingPage() {
  const { showToast } = useToast();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Selected Persona
  const [selectedPersona, setSelectedPersona] = useState<string>("consumer_tech");

  // Step 2: Selected Product
  const [selectedProductId, setSelectedProductId] = useState<string>("p1");

  // Step 3: Alert Configuration
  const [thresholdType, setThresholdType] = useState<"5_percent" | "10_percent" | "all_time_low">("10_percent");
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifyInApp, setNotifyInApp] = useState(true);

  const selectedProduct: SpecimenProduct = SPECIMEN_PRODUCTS.find((p) => p.id === selectedProductId) ?? SPECIMEN_PRODUCTS[0]!;

  const handleComplete = () => {
    setStep(4);
    showToast({
      type: "success",
      title: "First Watch Activated",
      description: `Now tracking ${selectedProduct.title}`,
    });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 sm:py-16">
      {/* Eyebrow & Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 text-[var(--color-accent)] text-xs font-mono font-medium mb-3">
          <Sparkles size={12} />
          <span>FIRST WATCH SETUP</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-display font-semibold text-[var(--text-1)] tracking-tight">
          Welcome to SCRAPPY
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-3)] mt-2 font-mono max-w-lg mx-auto">
          Complete this 3-step setup to activate your first multi-retailer price tracking monitor.
        </p>
      </div>

      {/* 3-Step Progress Indicator */}
      {step < 4 && (
        <nav aria-label="Onboarding Progress" className="mb-8">
          <ol className="grid grid-cols-3 gap-2 sm:gap-3">
            {[
              { num: 1, label: "Workspace Focus" },
              { num: 2, label: "First Product" },
              { num: 3, label: "Alert Trigger" },
            ].map((s) => (
              <li key={s.num}>
                <div
                  className={`p-3 rounded-xl border text-left transition-all ${
                    step === s.num
                      ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10 shadow-xs"
                      : step > s.num
                      ? "border-[var(--color-success)]/40 bg-[var(--color-success)]/5"
                      : "border-[var(--border)] bg-[var(--surface-1)] opacity-60"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-mono font-bold shrink-0 ${
                        step === s.num
                          ? "bg-[var(--color-accent)] text-white"
                          : step > s.num
                          ? "bg-[var(--color-success)] text-white"
                          : "bg-[var(--surface-2)] text-[var(--text-3)]"
                      }`}
                    >
                      {step > s.num ? <Check size={11} /> : s.num}
                    </span>
                    <span className="text-xs font-mono font-medium text-[var(--text-1)] truncate">
                      {s.label}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </nav>
      )}

      {/* ========================================================= */}
      {/* STEP 1: WORKSPACE FOCUS / PERSONA */}
      {/* ========================================================= */}
      {step === 1 && (
        <Card className="p-6 sm:p-8 space-y-6 bg-[var(--surface-1)] border-[var(--border)] rounded-2xl shadow-xs">
          <div>
            <h2 className="text-lg font-display font-semibold text-[var(--text-1)]">
              Step 1: Choose Your Primary Focus
            </h2>
            <p className="text-xs text-[var(--text-3)] font-mono mt-1">
              Select the domain that best describes how your workspace will utilize Scrappy.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PERSONAS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedPersona(p.id)}
                className={`p-4 rounded-xl border text-left transition-all min-h-[44px] ${
                  selectedPersona === p.id
                    ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10 shadow-xs"
                    : "border-[var(--border)] bg-[var(--surface-2)] hover:border-[var(--text-3)]"
                }`}
              >
                <div className="text-2xl mb-2" aria-hidden="true">{p.icon}</div>
                <div className="text-sm font-semibold text-[var(--text-1)] mb-1">
                  {p.title}
                </div>
                <div className="text-xs text-[var(--text-3)]">
                  {p.description}
                </div>
              </button>
            ))}
          </div>

          <div className="flex justify-end pt-4 border-t border-[var(--border-subtle)]">
            <Button
              variant="primary"
              onClick={() => setStep(2)}
              className="min-h-[44px] font-mono text-xs font-semibold gap-1.5"
            >
              <span>Continue to Product Selection</span>
              <ArrowRight size={14} />
            </Button>
          </div>
        </Card>
      )}

      {/* ========================================================= */}
      {/* STEP 2: CHOOSE FIRST TRACKED PRODUCT */}
      {/* ========================================================= */}
      {step === 2 && (
        <Card className="p-6 sm:p-8 space-y-6 bg-[var(--surface-1)] border-[var(--border)] rounded-2xl shadow-xs">
          <div>
            <h2 className="text-lg font-display font-semibold text-[var(--text-1)]">
              Step 2: Choose Your First Tracked Product
            </h2>
            <p className="text-xs text-[var(--text-3)] font-mono mt-1">
              Pick a specimen product from our verified catalog to initialize live cross-retailer tracking.
            </p>
          </div>

          <div className="space-y-3">
            {SPECIMEN_PRODUCTS.map((prod) => {
              const lowestRupees = Math.round(prod.currentLowestPaise / 100).toLocaleString("en-IN");
              const mrpRupees = Math.round(prod.mrpPaise / 100).toLocaleString("en-IN");
              const isSelected = selectedProductId === prod.id;

              return (
                <button
                  key={prod.id}
                  type="button"
                  onClick={() => setSelectedProductId(prod.id)}
                  className={`w-full p-4 rounded-xl border text-left transition-all min-h-[44px] flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isSelected
                      ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10 shadow-xs"
                      : "border-[var(--border)] bg-[var(--surface-2)] hover:border-[var(--text-3)]"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-[var(--color-accent)]">
                        {prod.brand}
                      </span>
                      <span className="text-xs text-[var(--text-3)] font-mono">
                        · {prod.retailerCount} Merchants
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-[var(--text-1)]">
                      {prod.title}
                    </div>
                  </div>

                  <div className="flex items-center sm:text-right gap-4">
                    <div>
                      <div className="text-base font-bold font-mono text-[var(--color-success)]">
                        ₹{lowestRupees}
                      </div>
                      <div className="text-xs font-mono line-through text-[var(--text-3)]">
                        ₹{mrpRupees}
                      </div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs font-bold shrink-0 ${
                        isSelected
                          ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white"
                          : "border-[var(--border)]"
                      }`}
                    >
                      {isSelected ? <Check size={11} /> : null}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[var(--border-subtle)]">
            <Button
              variant="secondary"
              onClick={() => setStep(1)}
              className="min-h-[44px] font-mono text-xs gap-1.5"
            >
              <ArrowLeft size={14} />
              <span>Back</span>
            </Button>
            <Button
              variant="primary"
              onClick={() => setStep(3)}
              className="min-h-[44px] font-mono text-xs font-semibold gap-1.5"
            >
              <span>Continue to Alert Trigger</span>
              <ArrowRight size={14} />
            </Button>
          </div>
        </Card>
      )}

      {/* ========================================================= */}
      {/* STEP 3: CONFIGURE ALERT TRIGGER */}
      {/* ========================================================= */}
      {step === 3 && (
        <Card className="p-6 sm:p-8 space-y-6 bg-[var(--surface-1)] border-[var(--border)] rounded-2xl shadow-xs">
          <div>
            <h2 className="text-lg font-display font-semibold text-[var(--text-1)]">
              Step 3: Configure Price Drop Alert Trigger
            </h2>
            <p className="text-xs text-[var(--text-3)] font-mono mt-1">
              Set the drop percentage threshold and notification channels for {selectedProduct.title}.
            </p>
          </div>

          {/* Threshold Selection */}
          <div className="space-y-3">
            <label className="block text-xs font-mono font-medium text-[var(--text-2)]">
              TRIGGER THRESHOLD
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: "5_percent", label: "5% Price Drop", desc: "Small immediate drop" },
                { id: "10_percent", label: "10% Price Drop", desc: "Significant saving" },
                { id: "all_time_low", label: "All-Time Low", desc: "Best historical price" },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setThresholdType(t.id as "5_percent" | "10_percent" | "all_time_low")}
                  className={`p-3.5 rounded-xl border text-left transition-all min-h-[44px] ${
                    thresholdType === t.id
                      ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10 shadow-xs"
                      : "border-[var(--border)] bg-[var(--surface-2)] hover:border-[var(--text-3)]"
                  }`}
                >
                  <div className="text-xs font-bold text-[var(--text-1)]">{t.label}</div>
                  <div className="text-[11px] text-[var(--text-3)] mt-0.5">{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Delivery Channels */}
          <div className="space-y-3 pt-2">
            <label className="block text-xs font-mono font-medium text-[var(--text-2)]">
              NOTIFICATION CHANNELS
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] cursor-pointer min-h-[44px]">
                <input
                  type="checkbox"
                  checked={notifyEmail}
                  onChange={(e) => setNotifyEmail(e.target.checked)}
                  className="w-4 h-4 rounded text-[var(--color-accent)] accent-[var(--color-accent)]"
                />
                <div>
                  <div className="text-xs font-semibold text-[var(--text-1)]">
                    Email Notifications
                  </div>
                  <div className="text-[11px] text-[var(--text-3)] font-mono">
                    Instant HTML alerts with direct retailer affiliate links
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] cursor-pointer min-h-[44px]">
                <input
                  type="checkbox"
                  checked={notifyInApp}
                  onChange={(e) => setNotifyInApp(e.target.checked)}
                  className="w-4 h-4 rounded text-[var(--color-accent)] accent-[var(--color-accent)]"
                />
                <div>
                  <div className="text-xs font-semibold text-[var(--text-1)]">
                    In-App Notification Center
                  </div>
                  <div className="text-[11px] text-[var(--text-3)] font-mono">
                    Realtime drawer toast &amp; telemetry badges in app shell
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[var(--border-subtle)]">
            <Button
              variant="secondary"
              onClick={() => setStep(2)}
              className="min-h-[44px] font-mono text-xs gap-1.5"
            >
              <ArrowLeft size={14} />
              <span>Back</span>
            </Button>
            <Button
              variant="primary"
              onClick={handleComplete}
              className="min-h-[44px] font-mono text-xs font-semibold gap-1.5"
            >
              <span>Activate First Watch</span>
              <ArrowRight size={14} />
            </Button>
          </div>
        </Card>
      )}

      {/* ========================================================= */}
      {/* STEP 4: SUCCESS / COMPLETE SCREEN */}
      {/* ========================================================= */}
      {step === 4 && (
        <Card className="p-8 text-center space-y-6 bg-[var(--surface-1)] border-[var(--border)] rounded-2xl shadow-xs">
          <div className="w-14 h-14 rounded-full bg-[var(--color-success)]/10 text-[var(--color-success)] mx-auto flex items-center justify-center font-bold text-2xl border border-[var(--color-success)]/30">
            <Check size={28} />
          </div>

          <div>
            <span className="font-mono text-xs text-[var(--color-success)] font-bold uppercase tracking-wider">
              Setup Complete
            </span>
            <h2 className="text-2xl font-display font-semibold text-[var(--text-1)] tracking-tight mt-1">
              Your Workspace is Live
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-3)] font-mono max-w-md mx-auto mt-2">
              Scrappy is now actively monitoring <strong className="text-[var(--text-1)]">{selectedProduct.title}</strong> across Amazon, Flipkart, Croma, and Reliance Digital.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-xs font-mono text-left max-w-md mx-auto space-y-2">
            <div className="flex justify-between">
              <span className="text-[var(--text-3)]">Active Rule:</span>
              <span className="text-[var(--text-1)] font-semibold">
                {thresholdType === "5_percent" ? "5% Drop" : thresholdType === "10_percent" ? "10% Drop" : "All-Time Low"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-3)]">Channels:</span>
              <span className="text-[var(--text-1)]">
                {[notifyEmail && "Email", notifyInApp && "In-App"].filter(Boolean).join(", ")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-3)]">Polling Frequency:</span>
              <span className="text-[var(--color-accent)] font-semibold">Every 15 minutes</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/watchlist"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[var(--color-accent)] text-white font-mono text-xs font-semibold min-h-[44px] flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity"
            >
              <span>View in Watchlist</span>
              <ArrowRight size={14} />
            </Link>
            <Link
              href="/compare"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-1)] font-mono text-xs font-semibold min-h-[44px] flex items-center justify-center hover:border-[var(--text-3)] transition-colors"
            >
              Explore Full Catalog
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}
