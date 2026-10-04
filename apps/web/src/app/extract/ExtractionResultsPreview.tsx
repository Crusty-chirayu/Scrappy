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
    );
  }

  // Diagnostics Tab
  return (
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
  );
}
