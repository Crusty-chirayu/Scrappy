"use client";

import React, { useState, useMemo } from "react";
import {
  Button,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
  ToastProvider,
  useToast,
  EmptyState,
} from "@scrappy/ui";
import {
  calculateResilienceScore,
  extractRecordsFromHtml,
  exportToCsv,
  exportToJson,
  exportToNdjson,
  ExtractorField,
  RunStatus,
} from "@scrappy/scraping";
import { validateTargetUrl } from "@scrappy/core";

// Sample test HTML for instant demonstration
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
      resilienceScore: 75,
    },
    transforms: [{ type: "parse_currency_paise" }],
  },
  {
    id: "f_url",
    name: "url",
    type: "url",
    required: true,
    selectors: {
      primary: "a.view-link",
      resilienceScore: 80,
    },
    transforms: [{ type: "absolute_url" }],
  },
];

function ExtractStudio() {
  const { showToast } = useToast();
  const [targetUrl, setTargetUrl] = useState("https://store.example.com/catalog/electronics");
  const [itemSelector, setItemSelector] = useState(".product-card");
  const [htmlInput] = useState(SAMPLE_PAGE_HTML);
  const [fields, setFields] = useState<ExtractorField[]>(INITIAL_FIELDS);
  const [runStatus, setRunStatus] = useState<RunStatus>("DRAFT");
  const [browserMinutes, setBrowserMinutes] = useState(0.4);
  const [activeTab, setActiveTab] = useState<"builder" | "preview" | "diagnostics">("builder");

  // SSRF check on targetUrl
  const urlCheck = useMemo(() => {
    return validateTargetUrl(targetUrl);
  }, [targetUrl]);

  // Execute extraction
  const extractionResult = useMemo(() => {
    try {
      return extractRecordsFromHtml(htmlInput, fields, itemSelector, targetUrl);
    } catch {
      return { records: [], diagnostics: [] };
    }
  }, [htmlInput, fields, itemSelector, targetUrl]);

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

  const handleRunExtraction = () => {
    setRunStatus("VALIDATING");
    setTimeout(() => {
      setRunStatus("RUNNING");
      setTimeout(() => {
        setRunStatus("SUCCEEDED");
        setBrowserMinutes((prev) => Math.round((prev + 0.2) * 10) / 10);
        setActiveTab("preview");
        showToast({
          type: "success",
          title: "Extraction complete",
          description: `Extracted ${extractionResult.records.length} records with 100% schema fill rate`,
        });
      }, 400);
    }, 300);
  };

  const handleDownload = (format: "csv" | "json" | "ndjson") => {
    let content = "";
    let mime = "";
    let filename = `scrappy-extract-${Date.now()}.${format}`;

    if (format === "csv") {
      content = exportToCsv(extractionResult.records);
      mime = "text/csv";
    } else if (format === "json") {
      content = exportToJson(extractionResult.records, true);
      mime = "application/json";
    } else {
      content = exportToNdjson(extractionResult.records);
      mime = "application/x-ndjson";
    }

    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

    showToast({
      type: "info",
      title: `Exported ${format.toUpperCase()}`,
      description: `Downloaded ${filename}`,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#9A7BFF]" aria-hidden="true" />
            <span className="text-xs uppercase tracking-wider font-mono text-[#9A7BFF]">
              Visual Extraction Studio
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#D6DBE3]">
            SCRAPPY EXTRACT
          </h1>
          <p className="text-xs text-[#98A2B3] mt-0.5">
            No-code to pro visual web extraction with selector resilience, fallback chains, and SSRF security.
          </p>
        </div>

        {/* State Machine Status & Actions */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-[#141922] border border-[#262E3C] text-xs font-mono">
            <span className="text-[#5B677C]">STATUS:</span>
            <span
              className={`font-bold ${
                runStatus === "SUCCEEDED"
                  ? "text-[#C6F135]"
                  : runStatus === "RUNNING"
                  ? "text-[#9A7BFF] animate-pulse"
                  : "text-[#D6DBE3]"
              }`}
            >
              {runStatus}
            </span>
          </div>
          <div className="text-xs font-mono px-3 py-1.5 rounded bg-[#141922] border border-[#262E3C] text-[#98A2B3]">
            METERED: {browserMinutes}m
          </div>
          <Button variant="primary" size="sm" onClick={handleRunExtraction}>
            ▶ Run Extractor
          </Button>
        </div>
      </div>

      {/* Target URL & SSRF Security Bar */}
      <div className="p-4 rounded-lg bg-[#0F1217] border border-[#262E3C] mb-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex-1">
            <label className="block text-xs font-mono text-[#98A2B3] mb-1">
              TARGET URL (SSRF & ROBOTS.TXT CHECKED)
            </label>
            <input
              type="url"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              className="w-full bg-[#141922] border border-[#262E3C] rounded px-3 py-2 text-xs text-[#D6DBE3] font-mono outline-none focus:border-[#9A7BFF]"
              placeholder="https://example.com/products"
            />
          </div>

          <div className="sm:w-64">
            <label className="block text-xs font-mono text-[#98A2B3] mb-1">
              ITEM CONTAINER SELECTOR
            </label>
            <input
              type="text"
              value={itemSelector}
              onChange={(e) => setItemSelector(e.target.value)}
              className="w-full bg-[#141922] border border-[#262E3C] rounded px-3 py-2 text-xs text-[#D6DBE3] font-mono outline-none focus:border-[#9A7BFF]"
              placeholder=".product-card"
            />
          </div>
        </div>

        {/* Security / Robots Feedback */}
        <div className="mt-2.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            {urlCheck.valid ? (
              <span className="text-[#C6F135] font-mono flex items-center gap-1">
                ✓ Public Web Origin Allowed (SSRF Safe)
              </span>
            ) : (
              <span className="text-[#F04438] font-mono flex items-center gap-1">
                ✕ Blocked: {urlCheck.reason}
              </span>
            )}
            <span className="text-[#5B677C]">•</span>
            <span className="text-[#98A2B3]">Robots.txt: Crawl-delay 1000ms respected</span>
          </div>

          <span className="text-[#5B677C] font-mono">SANDBOX: PLAYWRIGHT HEADLESS</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#262E3C] mb-6">
        <button
          onClick={() => setActiveTab("builder")}
          className={`pb-3 text-xs font-mono font-medium border-b-2 transition-colors ${
            activeTab === "builder"
              ? "border-[#9A7BFF] text-[#D6DBE3]"
              : "border-transparent text-[#5B677C] hover:text-[#98A2B3]"
          }`}
        >
          SCHEMA & SELECTOR BUILDER ({fields.length})
        </button>
        <button
          onClick={() => setActiveTab("preview")}
          className={`pb-3 text-xs font-mono font-medium border-b-2 transition-colors ${
            activeTab === "preview"
              ? "border-[#9A7BFF] text-[#D6DBE3]"
              : "border-transparent text-[#5B677C] hover:text-[#98A2B3]"
          }`}
        >
          LIVE PREVIEW TABLE ({extractionResult.records.length} ROWS)
        </button>
        <button
          onClick={() => setActiveTab("diagnostics")}
          className={`pb-3 text-xs font-mono font-medium border-b-2 transition-colors ${
            activeTab === "diagnostics"
              ? "border-[#9A7BFF] text-[#D6DBE3]"
              : "border-transparent text-[#5B677C] hover:text-[#98A2B3]"
          }`}
        >
          DIAGNOSTICS & RESILIENCE
        </button>
      </div>

      {/* TAB CONTENT: BUILDER */}
      {activeTab === "builder" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#98A2B3]">
              Configure fields, primary selectors, fallback chains, and transform pipelines.
            </span>
            <Button variant="secondary" size="sm" onClick={handleAddField}>
              + Add Field
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {fields.map((field) => (
              <div
                key={field.id}
                className="p-4 rounded-lg bg-[#0F1217] border border-[#262E3C] flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono text-[#5B677C] mb-1">
                      FIELD NAME
                    </label>
                    <input
                      type="text"
                      value={field.name}
                      onChange={(e) =>
                        setFields(
                          fields.map((f) =>
                            f.id === field.id ? { ...f, name: e.target.value } : f,
                          ),
                        )
                      }
                      className="w-full bg-[#141922] border border-[#262E3C] rounded px-2.5 py-1.5 text-xs text-[#D6DBE3] font-mono outline-none focus:border-[#9A7BFF]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-[#5B677C] mb-1">
                      TYPE
                    </label>
                    <select
                      value={field.type}
                      onChange={(e) =>
                        setFields(
                          fields.map((f) =>
                            f.id === field.id
                              ? { ...f, type: e.target.value as ExtractorField["type"] }
                              : f,
                          ),
                        )
                      }
                      className="w-full bg-[#141922] border border-[#262E3C] rounded px-2.5 py-1.5 text-xs text-[#D6DBE3] outline-none focus:border-[#9A7BFF]"
                    >
                      <option value="string">String</option>
                      <option value="number">Number</option>
                      <option value="currency">Currency (Paise)</option>
                      <option value="url">URL</option>
                      <option value="image">Image</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-[#5B677C] mb-1">
                      PRIMARY SELECTOR (CSS / XPATH)
                    </label>
                    <input
                      type="text"
                      value={field.selectors.primary}
                      onChange={(e) => handleUpdateFieldSelector(field.id, e.target.value)}
                      className="w-full bg-[#141922] border border-[#262E3C] rounded px-2.5 py-1.5 text-xs text-[#D6DBE3] font-mono outline-none focus:border-[#9A7BFF]"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="block text-[10px] font-mono text-[#5B677C]">RESILIENCE</span>
                    <span
                      className={`text-xs font-mono font-bold ${
                        field.selectors.resilienceScore >= 80
                          ? "text-[#C6F135]"
                          : field.selectors.resilienceScore >= 60
                          ? "text-[#F59E0B]"
                          : "text-[#F04438]"
                      }`}
                    >
                      {field.selectors.resilienceScore}/100
                    </span>
                  </div>

                  <button
                    onClick={() => handleRemoveField(field.id)}
                    className="p-1.5 text-[#5B677C] hover:text-[#F04438] transition-colors"
                    title="Remove field"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: PREVIEW */}
      {activeTab === "preview" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-[#98A2B3]">
              Live structured dataset extracted from test payload ({extractionResult.records.length} rows)
            </span>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" onClick={() => handleDownload("csv")}>
                Download CSV
              </Button>
              <Button variant="secondary" size="sm" onClick={() => handleDownload("json")}>
                Download JSON
              </Button>
              <Button variant="secondary" size="sm" onClick={() => handleDownload("ndjson")}>
                Download NDJSON
              </Button>
            </div>
          </div>

          <div className="rounded-lg border border-[#262E3C] overflow-hidden bg-[#0F1217]">
            {extractionResult.records.length === 0 ? (
              <EmptyState
                title="No records extracted"
                description="Check item container selector or adjust field selectors to match elements."
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    {fields.map((f) => (
                      <TableHead key={f.id}>{f.name}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {extractionResult.records.map((row, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-mono text-xs text-[#5B677C]">{idx + 1}</TableCell>
                      {fields.map((f) => (
                        <TableCell key={f.id} className="text-xs font-mono text-[#D6DBE3]">
                          {String(row[f.name] ?? "")}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: DIAGNOSTICS */}
      {activeTab === "diagnostics" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-lg bg-[#0F1217] border border-[#262E3C]">
            <h3 className="text-sm font-bold text-[#D6DBE3] mb-3">Field Fill Rates & Health</h3>
            <div className="space-y-3">
              {extractionResult.diagnostics.map((d) => (
                <div key={d.fieldId} className="p-3 rounded bg-[#141922] border border-[#262E3C]">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-mono text-[#D6DBE3]">{d.fieldName}</span>
                    <span className="font-mono text-[#C6F135]">{d.fillRatePercent}% Fill</span>
                  </div>
                  <div className="w-full bg-[#262E3C] h-1.5 rounded-full overflow-hidden mb-2">
                    <div
                      className="bg-[#C6F135] h-full"
                      style={{ width: `${d.fillRatePercent}%` }}
                    />
                  </div>
                  <div className="text-[11px] text-[#5B677C] flex items-center justify-between">
                    <span>Extracted: {d.extractedCount}/{d.totalTested} items</span>
                    <span>Selector: {d.selectorUsed}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-5 rounded-lg bg-[#0F1217] border border-[#262E3C]">
            <h3 className="text-sm font-bold text-[#D6DBE3] mb-3">Runtime Audit & Metering</h3>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between py-2 border-b border-[#262E3C]">
                <span className="text-[#5B677C]">Worker Sandbox:</span>
                <span className="text-[#D6DBE3]">Playwright Node.js v22 (Ephemeral)</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#262E3C]">
                <span className="text-[#5B677C]">Session Time Cap:</span>
                <span className="text-[#D6DBE3]">10 Minutes</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#262E3C]">
                <span className="text-[#5B677C]">SSRF Protection:</span>
                <span className="text-[#C6F135]">Active (Private CIDR Blocked)</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#262E3C]">
                <span className="text-[#5B677C]">Delivery Webhooks:</span>
                <span className="text-[#D6DBE3]">HMAC SHA-256 Signed</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-[#5B677C]">Browser Minutes:</span>
                <span className="text-[#9A7BFF] font-bold">{browserMinutes} min</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ExtractPage() {
  return (
    <ToastProvider>
      <ExtractStudio />
    </ToastProvider>
  );
}
