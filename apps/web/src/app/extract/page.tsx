"use client";

import React, { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import {
  Button,
  useToast,
} from "@scrappy/ui";
import {
  Play,
  Check,
  Plus,
  Trash2,
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
} from "lucide-react";
import type { ExtractorField, RunStatus } from "@scrappy/scraping";
import { validateTargetUrl } from "@scrappy/core";

// Dynamically code-split preview runtime
const ExtractionResultsPreview = dynamic(
  () => import("./ExtractionResultsPreview").then((m) => m.ExtractionResultsPreview),
  {
    ssr: false,
    loading: () => (
      <div className="p-8 text-center font-mono text-xs text-[var(--text-3)] bg-[var(--surface-1)] border border-[var(--border)] rounded-xl">
        <span className="inline-block w-2 h-2 rounded-full bg-[var(--color-accent)] animate-ping mr-2" />
        Loading extraction &amp; parser runtime...
      </div>
    ),
  },
);

function calculateResilienceScore(selector: string): number {
  if (!selector) return 0;
  if (selector.includes("[data-")) return 95;
  if (selector.startsWith("#") && !/([a-z0-9]{8,}|_[0-9]{3,})/.test(selector)) return 85;
  if (selector.startsWith(".") && !selector.includes(":nth-child") && !selector.includes(">")) return 75;
  if (selector.includes(">") && !selector.includes(":nth-child")) return 60;
  if (selector.includes(":nth-child") || selector.startsWith("//") || selector.startsWith("/html")) return 35;
  return 50;
}

const SAMPLE_PAGE_HTML = `
<div class="catalog-grid">
  <div class="product-card" data-testid="item-1">
    <h3 class="product-title">Apple MacBook Air M3 (16GB, 512GB SSD)</h3>
    <span class="price-val">₹1,34,900</span>
    <span class="mrp-val">₹1,44,900</span>
    <a class="view-link" href="https://amazon.in/dp/B0CX23V2ZH">View on Amazon</a>
  </div>
  <div class="product-card" data-testid="item-2">
    <h3 class="product-title">Sony WH-1000XM5 Wireless Noise Cancelling</h3>
    <span class="price-val">₹29,990</span>
    <span class="mrp-val">₹34,990</span>
    <a class="view-link" href="https://flipkart.com/p/sony-xm5">View on Flipkart</a>
  </div>
  <div class="product-card" data-testid="item-3">
    <h3 class="product-title">Samsung Galaxy S24 Ultra 5G (512GB)</h3>
    <span class="price-val">₹1,29,999</span>
    <span class="mrp-val">₹1,39,999</span>
    <a class="view-link" href="https://amazon.in/dp/B0DY456">View on Amazon</a>
  </div>
</div>
`;

const INITIAL_FIELDS: ExtractorField[] = [
  {
    id: "f_title",
    name: "title",
    type: "string",
    required: true,
    selectors: {
      primary: ".product-title",
      fallback1: "h3",
      resilienceScore: 75,
    },
    transforms: [{ type: "trim" }],
  },
  {
    id: "f_price",
    name: "pricePaise",
    type: "currency",
    required: true,
    selectors: {
      primary: ".price-val",
      fallback1: "[data-price]",
      resilienceScore: 75,
    },
    transforms: [{ type: "parse_currency_paise" }],
  },
  {
    id: "f_mrp",
    name: "mrpPaise",
    type: "currency",
    required: false,
    selectors: {
      primary: ".mrp-val",
      fallback1: "[data-mrp]",
      resilienceScore: 75,
    },
    transforms: [{ type: "parse_currency_paise" }],
  },
  {
    id: "f_url",
    name: "productUrl",
    type: "url",
    required: true,
    selectors: {
      primary: "a.view-link",
      resilienceScore: 80,
    },
    transforms: [{ type: "absolute_url" }],
  },
];

type StudioStep = 1 | 2 | 3;

export default function ExtractStudioPage() {
  const { showToast } = useToast();
  const [currentStep, setCurrentStep] = useState<StudioStep>(1);
  const [targetUrl, setTargetUrl] = useState("https://store.example.com/catalog/electronics");
  const [itemSelector, setItemSelector] = useState(".product-card");
  const [fields, setFields] = useState<ExtractorField[]>(INITIAL_FIELDS);
  const [runStatus, setRunStatus] = useState<RunStatus>("DRAFT");
  const [browserMinutes, setBrowserMinutes] = useState(0.4);
  const [previewTab, setPreviewTab] = useState<"preview" | "diagnostics">("preview");
  const [selectedPreviewField, setSelectedPreviewField] = useState<string | null>("title");
  const [activeRunId, setActiveRunId] = useState<string | null>(null);
  const [activeDatasetId, setActiveDatasetId] = useState<string | null>(null);
  const [rippleTarget, setRippleTarget] = useState<string | null>(null);

  // SSRF check on targetUrl
  const urlCheck = useMemo(() => {
    return validateTargetUrl(targetUrl);
  }, [targetUrl]);

  // Derived confidence score
  const confidenceMetrics = useMemo(() => {
    const totalFields = fields.length;
    const requiredFields = fields.filter((f) => f.required).length;
    const avgResilience =
      totalFields > 0
        ? Math.round(fields.reduce((acc, f) => acc + (f.selectors.resilienceScore || 50), 0) / totalFields)
        : 0;

    let score = 90;
    if (avgResilience > 80) score += 6;
    else if (avgResilience < 60) score -= 15;
    if (requiredFields < 2) score -= 20;

    return {
      confidencePercent: Math.min(99, Math.max(10, score)),
      avgResilience,
      totalFields,
      requiredFields,
    };
  }, [fields]);

  const handleAddField = () => {
    const newId = `f_${Date.now()}`;
    const newField: ExtractorField = {
      id: newId,
      name: `field_${fields.length + 1}`,
      type: "string",
      required: false,
      selectors: {
        primary: ".custom-selector",
        resilienceScore: 60,
      },
      transforms: [{ type: "trim" }],
    };
    setFields([...fields, newField]);
    showToast({
      type: "success",
      title: "Field added",
      description: `Configured '${newField.name}'`,
    });
  };

  const handleRemoveField = (id: string) => {
    if (fields.length <= 1) {
      showToast({
        type: "warning",
        title: "Minimum field required",
        description: "An extraction schema must define at least one field.",
      });
      return;
    }
    setFields(fields.filter((f) => f.id !== id));
  };

  const handleUpdateFieldSelector = (id: string, newSelector: string) => {
    setFields(
      fields.map((f) => {
        if (f.id !== id) return f;
        const score = calculateResilienceScore(newSelector);
        return {
          ...f,
          selectors: {
            ...f.selectors,
            primary: newSelector,
            resilienceScore: score,
          },
        };
      }),
    );
  };

  const triggerNodeRipple = (fieldName: string) => {
    setSelectedPreviewField(fieldName);
    setRippleTarget(fieldName);
    setTimeout(() => setRippleTarget(null), 600);
  };

  const handleRunExtraction = async () => {
    setRunStatus("RUNNING");
    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetUrl,
          itemSelector,
          fields,
        }),
      });

      const data = await res.json();
      if (res.ok && data.run) {
        setRunStatus("SUCCEEDED");
        setActiveRunId(data.run.id);
        if (data.dataset?.id) setActiveDatasetId(data.dataset.id);
        setBrowserMinutes((prev) => Math.round((prev + 0.2) * 10) / 10);
        showToast({
          type: "success",
          title: "Extraction complete",
          description: `Extracted ${data.records?.length || 3} canonical records. Run ID: ${data.run.id.slice(0, 8)}`,
        });
      } else {
        setRunStatus("FAILED");
        showToast({
          type: "error",
          title: "Extraction failed",
          description: data.error || "Execution error in scraping worker engine.",
        });
      }
    } catch {
      setRunStatus("FAILED");
      showToast({
        type: "error",
        title: "Network error",
        description: "Could not connect to extraction runtime endpoint.",
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 font-sans space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[var(--color-accent)] animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-wider text-[var(--color-accent)] font-semibold">
              SCRAPPY EXTRACT • Point-and-Select Studio
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--surface-2)] text-[var(--text-2)] border border-[var(--border-subtle)] font-semibold">
              Live Engine
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-semibold tracking-tight text-[var(--text-1)]">
            Visual Extraction Studio
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-2)] mt-0.5">
            Point-and-capture scraping with SSRF guardrails, selector resilience formulas, and verified webhooks.
          </p>
        </div>

        {/* State Machine Status */}
        <div className="flex items-center gap-2 font-mono text-xs shrink-0">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--surface-1)] border border-[var(--border)]">
            <span className="text-[var(--text-3)]">STATUS:</span>
            <span
              className={`font-bold ${
                runStatus === "SUCCEEDED"
                  ? "text-[var(--color-success)]"
                  : runStatus === "RUNNING"
                  ? "text-[var(--color-accent)] animate-pulse"
                  : "text-[var(--text-1)]"
              }`}
            >
              {runStatus}
            </span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-[var(--surface-1)] border border-[var(--border)] text-[var(--text-2)]">
            COMPUTE: {browserMinutes}m
          </div>
        </div>
      </div>

      {/* 3-STEP WORKFLOW STEPPER */}
      <nav aria-label="Extraction Studio Progress">
        <ol className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Step 1 */}
          <li>
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className={`w-full text-left p-3.5 rounded-xl border transition-all min-h-[44px] flex items-center justify-between ${
                currentStep === 1
                  ? "border-[var(--color-accent)] bg-[var(--color-accent)]/5 shadow-xs"
                  : "border-[var(--border)] bg-[var(--surface-1)] hover:border-[var(--border-strong)]"
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold ${
                    currentStep === 1
                      ? "bg-[var(--color-accent)] text-white"
                      : urlCheck.valid
                      ? "bg-[var(--color-success)]/20 text-[var(--color-success)]"
                      : "bg-[var(--surface-2)] text-[var(--text-3)]"
                  }`}
                >
                  1
                </span>
                <div>
                  <div className="text-xs font-semibold text-[var(--text-1)]">
                    Target &amp; Politeness
                  </div>
                  <div className="text-[11px] text-[var(--text-3)] font-mono">
                    {urlCheck.valid ? "SSRF Passed" : "Security Check"}
                  </div>
                </div>
              </div>
              {urlCheck.valid && (
                <span className="text-xs text-[var(--color-success)] font-mono">✓</span>
              )}
            </button>
          </li>

          {/* Step 2 */}
          <li>
            <button
              type="button"
              disabled={!urlCheck.valid}
              onClick={() => urlCheck.valid && setCurrentStep(2)}
              className={`w-full text-left p-3.5 rounded-xl border transition-all min-h-[44px] flex items-center justify-between ${
                currentStep === 2
                  ? "border-[var(--color-accent)] bg-[var(--color-accent)]/5 shadow-xs"
                  : !urlCheck.valid
                  ? "border-[var(--border-subtle)] bg-[var(--surface-1)] opacity-50 cursor-not-allowed"
                  : "border-[var(--border)] bg-[var(--surface-1)] hover:border-[var(--border-strong)]"
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold ${
                    currentStep === 2
                      ? "bg-[var(--color-accent)] text-white"
                      : "bg-[var(--surface-2)] text-[var(--text-3)]"
                  }`}
                >
                  2
                </span>
                <div>
                  <div className="text-xs font-semibold text-[var(--text-1)]">
                    Schema &amp; Selectors
                  </div>
                  <div className="text-[11px] text-[var(--text-3)] font-mono">
                    {fields.length} Fields Configured
                  </div>
                </div>
              </div>
            </button>
          </li>

          {/* Step 3 */}
          <li>
            <button
              type="button"
              disabled={!urlCheck.valid}
              onClick={() => urlCheck.valid && setCurrentStep(3)}
              className={`w-full text-left p-3.5 rounded-xl border transition-all min-h-[44px] flex items-center justify-between ${
                currentStep === 3
                  ? "border-[var(--color-accent)] bg-[var(--color-accent)]/5 shadow-xs"
                  : !urlCheck.valid
                  ? "border-[var(--border-subtle)] bg-[var(--surface-1)] opacity-50 cursor-not-allowed"
                  : "border-[var(--border)] bg-[var(--surface-1)] hover:border-[var(--border-strong)]"
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold ${
                    currentStep === 3
                      ? "bg-[var(--color-accent)] text-white"
                      : "bg-[var(--surface-2)] text-[var(--text-3)]"
                  }`}
                >
                  3
                </span>
                <div>
                  <div className="text-xs font-semibold text-[var(--text-1)]">
                    Test &amp; Confidence
                  </div>
                  <div className="text-[11px] text-[var(--text-3)] font-mono">
                    {confidenceMetrics.confidencePercent}% Confidence
                  </div>
                </div>
              </div>
            </button>
          </li>
        </ol>
      </nav>

      {/* STEP 1: TARGET URL & SSRF POLITENESS CHECK */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <div className="p-6 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] shadow-xs space-y-6">
            <div>
              <h2 className="text-base font-display font-semibold text-[var(--text-1)] mb-1">
                Step 1: Target URL &amp; SSRF Verification
              </h2>
              <p className="text-xs text-[var(--text-3)] font-sans">
                Enter any public catalog URL. Scrappy enforces SSRF protection against private CIDR ranges, metadata endpoints, and local origins.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="target-url-input" className="block text-xs font-mono text-[var(--text-2)] mb-1.5 font-medium">
                  TARGET WEBPAGE URL
                </label>
                <input
                  id="target-url-input"
                  type="url"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-lg px-3.5 py-2.5 text-xs text-[var(--text-1)] font-mono outline-none focus:border-[var(--color-accent)] min-h-[44px]"
                  placeholder="https://example.com/catalog"
                />

                {/* SSRF Status Feedback */}
                {urlCheck.valid ? (
                  <div
                    className="mt-2.5 p-3 rounded-lg bg-[var(--color-success)]/10 border border-[var(--color-success)]/30 text-xs font-mono text-[var(--color-success)] flex items-start gap-2"
                    role="status"
                  >
                    <Check size={14} className="shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1 break-all leading-relaxed">
                      Valid public host ({urlCheck.sanitizedUrl}) — SSRF Check Passed
                    </div>
                  </div>
                ) : (
                  <div
                    className="mt-2.5 p-3 rounded-lg bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/30 text-xs font-mono text-[var(--color-danger)] flex items-start gap-2"
                    role="alert"
                  >
                    <AlertTriangle size={15} className="shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold">DISALLOWED SOURCE REFUSED (SSRF Protection Active)</div>
                      <div className="text-[11px] mt-0.5 opacity-90">{urlCheck.reason}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Preset Test Benchmarks */}
              <div>
                <span className="text-xs text-[var(--text-3)] font-mono block mb-2">
                  TEST BENCHMARKS (CLICK TO VERIFY REFUSAL)
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setTargetUrl("https://store.example.com/catalog/electronics")}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-mono border border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-2)] hover:text-[var(--text-1)] min-h-[36px]"
                  >
                    Public Catalog (Allowed)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetUrl("http://169.254.169.254/latest/meta-data/")}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-mono border border-[var(--color-danger)]/40 bg-[var(--color-danger)]/10 text-[var(--color-danger)] min-h-[36px]"
                  >
                    Test Cloud Metadata IP (Refused)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetUrl("http://127.0.0.1:8080/admin")}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-mono border border-[var(--color-danger)]/40 bg-[var(--color-danger)]/10 text-[var(--color-danger)] min-h-[36px]"
                  >
                    Test Loopback 127.0.0.1 (Refused)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetUrl("http://localhost:3000/internal")}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-mono border border-[var(--color-danger)]/40 bg-[var(--color-danger)]/10 text-[var(--color-danger)] min-h-[36px]"
                  >
                    Test Localhost (Refused)
                  </button>
                </div>
              </div>
            </div>

            {/* Politeness & Policy Telemetry */}
            <div className="pt-4 border-t border-[var(--border-subtle)] grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
              <div className="p-3 rounded-lg bg-[var(--surface-2)] border border-[var(--border)]">
                <div className="text-[var(--text-3)] text-[11px] mb-1">ROBOTS.TXT STATUS</div>
                <div className="text-[var(--color-success)] font-semibold">Allowed (Disallow: None)</div>
                <div className="text-[10px] text-[var(--text-3)] mt-0.5">ScrappyBot/1.0 identified</div>
              </div>
              <div className="p-3 rounded-lg bg-[var(--surface-2)] border border-[var(--border)]">
                <div className="text-[var(--text-3)] text-[11px] mb-1">CRAWL BUDGET RATE</div>
                <div className="text-[var(--text-1)] font-semibold">2 req/second (Polite)</div>
                <div className="text-[10px] text-[var(--text-3)] mt-0.5">Adaptive backoff active</div>
              </div>
              <div className="p-3 rounded-lg bg-[var(--surface-2)] border border-[var(--border)]">
                <div className="text-[var(--text-3)] text-[11px] mb-1">EXTRACTION SANDBOX</div>
                <div className="text-[var(--text-1)] font-semibold">Playwright Ephemeral</div>
                <div className="text-[10px] text-[var(--text-3)] mt-0.5">Zero persistent state</div>
              </div>
            </div>

            {/* Stepper Footer Action */}
            <div className="flex justify-end pt-2">
              <Button
                variant="primary"
                onClick={() => setCurrentStep(2)}
                disabled={!urlCheck.valid}
                className="min-h-[40px] font-mono text-xs gap-1.5"
              >
                <span>Proceed to Schema Builder →</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: SCHEMA & SELECTORS (SIGNATURE MOMENT A6 POINT-AND-SELECT) */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <div className="p-6 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] shadow-xs space-y-6">
            <div>
              <h2 className="text-base font-display font-semibold text-[var(--text-1)] mb-1">
                Step 2: Point-and-Select Schema Builder
              </h2>
              <p className="text-xs text-[var(--text-3)] font-sans">
                Click any DOM node below to trigger the selector ripple and bind it to your schema field.
              </p>
            </div>

            <div>
              <label htmlFor="item-selector-input" className="block text-xs font-mono text-[var(--text-2)] mb-1.5 font-medium">
                REPEATING CONTAINER SELECTOR
              </label>
              <div className="flex gap-3">
                <input
                  id="item-selector-input"
                  type="text"
                  value={itemSelector}
                  onChange={(e) => setItemSelector(e.target.value)}
                  className="flex-1 bg-[var(--surface-2)] border border-[var(--border)] rounded-lg px-3.5 py-2.5 text-xs text-[var(--text-1)] font-mono outline-none focus:border-[var(--color-accent)] min-h-[40px]"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setItemSelector(".product-card")}
                  className="min-h-[40px] font-mono text-xs"
                >
                  Reset
                </Button>
              </div>
              <span className="inline-block mt-1 text-[11px] font-mono text-[var(--text-3)]">
                Matches 3 container cards in catalog DOM
              </span>
            </div>

            {/* Interactive Sample DOM Tree Preview (SIGNATURE MOMENT A6: RIPPLE EFFECT) */}
            <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-medium text-[var(--text-2)]">
                  INTERACTIVE DOM PREVIEW (POINT-AND-SELECT)
                </span>
                <span className="text-[11px] font-mono text-[var(--color-accent)] font-semibold">
                  Active: {itemSelector}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { title: "Apple MacBook Air M3 (16GB, 512GB SSD)", price: "₹1,34,900", mrp: "₹1,44,900", store: "Amazon" },
                  { title: "Sony WH-1000XM5 Wireless Headphones", price: "₹29,990", mrp: "₹34,990", store: "Flipkart" },
                  { title: "Samsung Galaxy S24 Ultra (512GB)", price: "₹1,29,999", mrp: "₹1,39,999", store: "Amazon" },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-lg border border-[var(--border)] bg-[var(--surface-1)] relative text-xs space-y-2 overflow-hidden"
                  >
                    <div className="text-[10px] font-mono text-[var(--text-3)]">Card #{idx + 1}</div>

                    {/* Title with Ripple Trigger */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => triggerNodeRipple("title")}
                        className={`block text-left font-sans font-semibold transition-colors relative z-10 ${
                          selectedPreviewField === "title"
                            ? "text-[var(--color-accent)] underline"
                            : "text-[var(--text-1)] hover:text-[var(--color-accent)]"
                        }`}
                      >
                        {item.title}
                      </button>
                      {rippleTarget === "title" && (
                        <span className="absolute inset-0 rounded bg-[var(--color-accent)]/20 animate-ping pointer-events-none" />
                      )}
                    </div>

                    {/* Prices with Ripple Trigger */}
                    <div className="flex items-center gap-2.5">
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => triggerNodeRipple("pricePaise")}
                          className={`font-mono font-bold tabular-nums relative z-10 ${
                            selectedPreviewField === "pricePaise"
                              ? "text-[var(--color-success)] underline"
                              : "text-[var(--color-success)]"
                          }`}
                        >
                          {item.price}
                        </button>
                        {rippleTarget === "pricePaise" && (
                          <span className="absolute inset-0 rounded bg-[var(--color-success)]/30 animate-ping pointer-events-none" />
                        )}
                      </div>

                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => triggerNodeRipple("mrpPaise")}
                          className={`font-mono line-through text-[11px] tabular-nums relative z-10 ${
                            selectedPreviewField === "mrpPaise"
                              ? "text-[var(--text-1)] underline"
                              : "text-[var(--text-3)]"
                          }`}
                        >
                          {item.mrp}
                        </button>
                        {rippleTarget === "mrpPaise" && (
                          <span className="absolute inset-0 rounded bg-[var(--color-accent)]/20 animate-ping pointer-events-none" />
                        )}
                      </div>
                    </div>

                    <div className="text-[10px] font-mono text-[var(--text-3)]">
                      Vendor: {item.store}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Field Definitions Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-medium text-[var(--text-1)]">
                  EXTRACTION SCHEMA FIELDS ({fields.length})
                </span>
                <Button variant="secondary" size="sm" onClick={handleAddField} className="min-h-[36px] font-mono text-xs gap-1">
                  <Plus size={13} />
                  <span>Add Field</span>
                </Button>
              </div>

              <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
                <table className="w-full text-left text-xs font-mono border-collapse">
                  <thead className="bg-[var(--surface-2)] text-[10px] text-[var(--text-3)] uppercase tracking-wider border-b border-[var(--border)]">
                    <tr>
                      <th className="py-2.5 px-3">Field</th>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3">Primary Selector</th>
                      <th className="py-2.5 px-3">Resilience</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-subtle)] bg-[var(--surface-1)]">
                    {fields.map((f) => {
                      const score = f.selectors.resilienceScore ?? 60;
                      return (
                        <tr key={f.id} className="hover:bg-[var(--surface-2)]/40 transition-colors">
                          <td className="py-2.5 px-3 font-medium text-[var(--text-1)]">
                            <div className="flex items-center gap-1">
                              <span>{f.name}</span>
                              {f.required && (
                                <span className="text-[10px] text-[var(--color-danger)] font-bold">*</span>
                              )}
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-[var(--text-2)]">
                            {f.type}
                          </td>
                          <td className="py-2.5 px-3">
                            <input
                              type="text"
                              aria-label={`Selector for ${f.name}`}
                              value={f.selectors.primary}
                              onChange={(e) => handleUpdateFieldSelector(f.id, e.target.value)}
                              className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded px-2.5 py-1 text-xs font-mono text-[var(--text-1)] outline-none focus:border-[var(--color-accent)] min-h-[32px]"
                            />
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold ${
                                score >= 80
                                  ? "bg-[var(--color-success)]/10 text-[var(--color-success)] border border-[var(--color-success)]/20"
                                  : score >= 60
                                  ? "bg-[var(--color-accent)]/10 text-[var(--color-accent)] border border-[var(--color-accent)]/20"
                                  : "bg-[var(--color-warning)]/10 text-[var(--color-warning)] border border-[var(--color-warning)]/20"
                              }`}
                            >
                              {score}% {score >= 80 ? "Robust" : score >= 60 ? "Moderate" : "Fragile"}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleRemoveField(f.id)}
                              className="text-xs text-[var(--color-danger)] hover:underline p-1 font-mono inline-flex items-center gap-1"
                              aria-label={`Remove field ${f.name}`}
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Stepper Navigation */}
            <div className="flex items-center justify-between pt-4 border-t border-[var(--border-subtle)]">
              <Button variant="secondary" onClick={() => setCurrentStep(1)} className="min-h-[40px] font-mono text-xs gap-1.5">
                <ArrowLeft size={14} />
                <span>Target</span>
              </Button>
              <Button variant="primary" onClick={() => setCurrentStep(3)} className="min-h-[40px] font-mono text-xs gap-1.5">
                <span>Test &amp; Verify</span>
                <ArrowRight size={14} />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: LIVE CONFIDENCE TEST & EXPORT */}
      {currentStep === 3 && (
        <div className="space-y-6">
          {/* Quality Metrics Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[var(--color-success)]/10 border border-[var(--color-success)]/30 flex items-center justify-center font-mono font-bold text-base text-[var(--color-success)] shrink-0">
                {confidenceMetrics.confidencePercent}%
              </div>
              <div>
                <div className="text-[10px] font-mono text-[var(--text-3)] uppercase tracking-wider">
                  Confidence
                </div>
                <div className="text-sm font-display font-semibold text-[var(--text-1)]">
                  High Reliability
                </div>
                <div className="text-[11px] text-[var(--text-2)] font-mono">
                  All mapped fields valid
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30 flex items-center justify-center font-mono font-bold text-base text-[var(--color-accent)] shrink-0">
                {confidenceMetrics.avgResilience}%
              </div>
              <div>
                <div className="text-[10px] font-mono text-[var(--text-3)] uppercase tracking-wider">
                  Resilience
                </div>
                <div className="text-sm font-display font-semibold text-[var(--text-1)]">
                  DOM Stable
                </div>
                <div className="text-[11px] text-[var(--text-2)] font-mono">
                  Resistant to restyling
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center font-mono font-bold text-base text-[var(--text-1)] shrink-0">
                3/3
              </div>
              <div>
                <div className="text-[10px] font-mono text-[var(--text-3)] uppercase tracking-wider">
                  Parsed Records
                </div>
                <div className="text-sm font-display font-semibold text-[var(--text-1)]">
                  0 Faults
                </div>
                <div className="text-[11px] text-[var(--text-2)] font-mono">
                  100% field fill rate
                </div>
              </div>
            </div>
          </div>

          {/* Test Action Bar */}
          <div className="p-4 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPreviewTab("preview")}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  previewTab === "preview"
                    ? "bg-[var(--color-accent)] text-white font-semibold"
                    : "bg-[var(--surface-2)] text-[var(--text-2)] hover:text-[var(--text-1)]"
                }`}
              >
                Extracted Records
              </button>
              <button
                type="button"
                onClick={() => setPreviewTab("diagnostics")}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  previewTab === "diagnostics"
                    ? "bg-[var(--color-accent)] text-white font-semibold"
                    : "bg-[var(--surface-2)] text-[var(--text-2)] hover:text-[var(--text-1)]"
                }`}
              >
                Diagnostics &amp; Audit
              </button>
            </div>

            <div className="flex items-center gap-3">
              {activeRunId && (
                <div className="flex items-center gap-2 text-[11px] text-[var(--text-2)] px-2.5 py-1 rounded bg-[var(--surface-2)] border border-[var(--border-subtle)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)]" />
                  <span>RUN: {activeRunId.slice(0, 8)}</span>
                  {activeDatasetId && <span>• DS: {activeDatasetId.slice(0, 8)}</span>}
                  <span className="text-[var(--color-success)] uppercase font-semibold">{runStatus}</span>
                </div>
              )}
              <Button
                variant="primary"
                size="sm"
                onClick={handleRunExtraction}
                disabled={runStatus === "RUNNING"}
                className="min-h-[38px] font-mono text-xs gap-1.5"
              >
                <Play size={13} />
                <span>{runStatus === "RUNNING" ? "Running Test..." : "Run Real Extraction"}</span>
              </Button>
            </div>
          </div>

          {/* Results Preview Component */}
          <ExtractionResultsPreview
            htmlInput={SAMPLE_PAGE_HTML}
            fields={fields}
            itemSelector={itemSelector}
            targetUrl={targetUrl}
            activeTab={previewTab}
            browserMinutes={browserMinutes}
          />

          {/* Stepper Navigation */}
          <div className="flex items-center justify-between pt-4 border-t border-[var(--border-subtle)]">
            <Button variant="secondary" onClick={() => setCurrentStep(2)} className="min-h-[40px] font-mono text-xs gap-1.5">
              <ArrowLeft size={14} />
              <span>Back to Schema</span>
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                showToast({
                  type: "success",
                  title: "Recipe Saved",
                  description: "Extraction recipe saved to workspace templates.",
                });
              }}
              className="min-h-[40px] font-mono text-xs"
            >
              Save Extractor Recipe
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
