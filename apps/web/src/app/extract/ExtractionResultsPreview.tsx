"use client";

import React, { useMemo } from "react";
import {
  Button,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
  EmptyState,
  useToast,
} from "@scrappy/ui";
import {
  extractRecordsFromHtml,
  exportToCsv,
  exportToJson,
  exportToNdjson,
  type ExtractorField,
} from "@scrappy/scraping";

export interface ExtractionResultsPreviewProps {
  htmlInput: string;
  fields: ExtractorField[];
  itemSelector: string;
  targetUrl: string;
  activeTab: "preview" | "diagnostics";
  browserMinutes: number;
}

export function ExtractionResultsPreview({
  htmlInput,
  fields,
  itemSelector,
  targetUrl,
  activeTab,
  browserMinutes,
}: ExtractionResultsPreviewProps) {
  const { showToast } = useToast();

  const extractionResult = useMemo(() => {
    try {
      return extractRecordsFromHtml(htmlInput, fields, itemSelector, targetUrl);
    } catch {
      return { records: [], diagnostics: [] };
    }
  }, [htmlInput, fields, itemSelector, targetUrl]);

  const handleDownload = (format: "csv" | "json" | "ndjson") => {
    let content = "";
    let mime = "";
    const filename = `scrappy-extract-${Date.now()}.${format}`;

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

  if (activeTab === "preview") {
    return (
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <span className="text-xs text-[var(--text-3)] font-mono">
            Structured dataset parsed from sample DOM ({extractionResult.records.length} items)
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleDownload("csv")}
              className="min-h-[44px]"
            >
              Download CSV
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleDownload("json")}
              className="min-h-[44px]"
            >
              Download JSON
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleDownload("ndjson")}
              className="min-h-[44px]"
            >
              Download NDJSON
            </Button>
          </div>
        </div>

        <div className="rounded-lg border border-[var(--border-subtle)] overflow-hidden bg-[var(--bg-1)]">
          {extractionResult.records.length === 0 ? (
            <EmptyState
              title="No records extracted"
              description="Adjust the item container selector or inspect field definitions."
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    {fields.map((f) => (
                      <TableHead key={f.id}>{f.name}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {extractionResult.records.map((row, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-mono text-xs text-[var(--text-3)]">
                        {idx + 1}
                      </TableCell>
                      {fields.map((f) => (
                        <TableCell key={f.id} className="text-xs font-mono text-[var(--text-1)]">
                          {String(row[f.name] ?? "—")}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Diagnostics Tab
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="p-5 rounded-lg bg-[var(--bg-1)] border border-[var(--border-subtle)]">
        <h3 className="text-sm font-bold text-[var(--text-1)] mb-3">Field Fill Rates & Health</h3>
        <div className="space-y-3">
          {extractionResult.diagnostics.map((d) => (
            <div key={d.fieldId} className="p-3 rounded bg-[var(--bg-2)] border border-[var(--border-subtle)]">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-mono text-[var(--text-1)]">{d.fieldName}</span>
                <span className="font-mono text-[var(--color-success)] font-medium">
                  {d.fillRatePercent}% Fill
                </span>
              </div>
              <div className="w-full bg-[var(--border-subtle)] h-1.5 rounded-full overflow-hidden mb-2">
                <div
                  className="bg-[var(--color-success)] h-full"
                  style={{ width: `${d.fillRatePercent}%` }}
                />
              </div>
              <div className="text-[11px] text-[var(--text-3)] flex items-center justify-between font-mono">
                <span>Extracted: {d.extractedCount}/{d.totalTested} items</span>
                <span>Selector: {d.selectorUsed}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-5 rounded-lg bg-[var(--bg-1)] border border-[var(--border-subtle)]">
        <h3 className="text-sm font-bold text-[var(--text-1)] mb-3">Runtime Audit & Metering</h3>
        <div className="space-y-2 text-xs font-mono">
          <div className="flex justify-between py-2 border-b border-[var(--border-subtle)]">
            <span className="text-[var(--text-3)]">Worker Sandbox:</span>
            <span className="text-[var(--text-1)]">Playwright Node.js v22 (Ephemeral)</span>
          </div>
          <div className="flex justify-between py-2 border-b border-[var(--border-subtle)]">
            <span className="text-[var(--text-3)]">Session Time Cap:</span>
            <span className="text-[var(--text-1)]">10 Minutes</span>
          </div>
          <div className="flex justify-between py-2 border-b border-[var(--border-subtle)]">
            <span className="text-[var(--text-3)]">SSRF Protection:</span>
            <span className="text-[var(--color-success)]">Active (Private CIDR Blocked)</span>
          </div>
          <div className="flex justify-between py-2 border-b border-[var(--border-subtle)]">
            <span className="text-[var(--text-3)]">Delivery Webhooks:</span>
            <span className="text-[var(--text-1)]">HMAC SHA-256 Signed</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-[var(--text-3)]">Browser Minutes:</span>
            <span className="text-[var(--color-primary)] font-bold">{browserMinutes} min</span>
          </div>
        </div>
      </div>
    </div>
  );
}
