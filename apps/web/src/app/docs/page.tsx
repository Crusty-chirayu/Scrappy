"use client";

import React, { useState } from "react";

interface EndpointDoc {
  method: "GET" | "POST" | "DELETE";
  path: string;
  tag: string;
  summary: string;
  description: string;
  curl: string;
  typescript: string;
  response: string;
}

const ENDPOINTS: EndpointDoc[] = [
  {
    method: "GET",
    path: "/v1/search?q={query}&limit=20",
    tag: "Catalog",
    summary: "Search Canonical Product Graph",
    description:
      "Performs full-text search across 500+ verified canonical products with category, brand, and sort filters.",
    curl: `curl -X GET "https://api.scrappy.in/v1/search?q=MacBook&limit=5" \\
  -H "x-workspace-id: ws_live_123" \\
  -H "Authorization: Bearer scp_live_key_xyz"`,
    typescript: `import { ScrappyClient } from "@scrappy/sdk";

const scrappy = new ScrappyClient({ apiKey: process.env.SCRAPPY_API_KEY });
const results = await scrappy.search({ query: "MacBook", limit: 5 });
console.log(results.items[0].lowestPricePaise);`,
    response: `{
  "items": [
    {
      "id": "p2000000-0000-0000-0000-000000000001",
      "title": "Apple MacBook Air M3 (16GB, 512GB SSD)",
      "brand": "Apple",
      "lowestPricePaise": 13490000,
      "merchants": ["Amazon.in", "Flipkart"],
      "offerCount": 2
    }
  ],
  "total": 1
}`,
  },
  {
    method: "GET",
    path: "/v1/products/:id/deal-analysis",
    tag: "Pricing",
    summary: "Transparent Deal Score & Anomaly Detection",
    description:
      "Calculates deal score (0-100) with visible component weights and flags artificial pre-sale MRP inflation.",
    curl: `curl -X GET "https://api.scrappy.in/v1/products/p2000000-0000-0000-0000-000000000001/deal-analysis" \\
  -H "x-workspace-id: ws_live_123"`,
    typescript: `const analysis = await scrappy.products.getDealAnalysis("p2000000-0000-0000-0000-000000000001");
console.log(analysis.dealScore.label); // "Great Deal"
console.log(analysis.fakeDiscount.verdict); // "genuine"`,
    response: `{
  "productId": "p2000000-0000-0000-0000-000000000001",
  "dealScore": {
    "score": 92,
    "label": "Great Deal",
    "reasons": [
      "₹10,000 below its 30-day median.",
      "Lowest price observed in 90 days."
    ]
  },
  "fakeDiscount": {
    "isFakeDiscount": false,
    "verdict": "genuine",
    "reason": "MRP has remained constant over the last 30 days."
  }
}`,
  },
  {
    method: "POST",
    path: "/v1/extract/test-run",
    tag: "Extract",
    summary: "Execute Visual Extractor Test",
    description:
      "Extracts structured records using primary selectors, fallback chains, and text anchor heuristics.",
    curl: `curl -X POST "https://api.scrappy.in/v1/extract/test-run" \\
  -H "Content-Type: application/json" \\
  -d '{
    "html": "<div class=\\"card\\"><h3>Earbuds</h3><span class=\\"p\\">₹1,999</span></div>",
    "itemSelector": ".card",
    "fields": [
      {
        "id": "f1",
        "name": "title",
        "type": "string",
        "selectors": { "primary": "h3" }
      }
    ]
  }'`,
    typescript: `const result = await scrappy.extract.testRun({
  html: pageHtml,
  itemSelector: ".product-item",
  fields: mySchemaFields,
});`,
    response: `{
  "totalExtracted": 1,
  "records": [{ "title": "Earbuds", "pricePaise": 199900 }],
  "diagnostics": [
    {
      "fieldName": "title",
      "fillRatePercent": 100,
      "selectorUsed": "primary"
    }
  ]
}`,
  },
  {
    method: "GET",
    path: "/v1/intelligence/competitors",
    tag: "Intelligence",
    summary: "Competitor Price Matrix & Undercut Detection",
    description:
      "Calculates live price spread between Amazon India and Flipkart with undercut leader determination.",
    curl: `curl -X GET "https://api.scrappy.in/v1/intelligence/competitors" \\
  -H "x-workspace-id: ws_live_123"`,
    typescript: `const intel = await scrappy.intelligence.getCompetitors();
for (const row of intel.competitorSpread) {
  console.log(row.productTitle, row.retailerSpreadPercent, row.undercutLeader);
}`,
    response: `{
  "timestamp": "2026-10-04T12:00:00.000Z",
  "competitorSpread": [
    {
      "productId": "p2000000-0000-0000-0000-000000000001",
      "retailerSpreadPercent": 12,
      "undercutLeader": "Amazon.in",
      "storePrices": { "amazonPaise": 13490000, "flipkartPaise": 14290000 }
    }
  ]
}`,
  },
  {
    method: "POST",
    path: "/v1/matching/evaluate",
    tag: "Matching",
    summary: "Resolve Candidate Offer to Canonical Product",
    description:
      "Multi-stage resolution using barcode, exact brand/model, and title token overlap (Constitution Rule 4).",
    curl: `curl -X POST "https://api.scrappy.in/v1/matching/evaluate" \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "Apple Smartphone Model Pro-1X",
    "brand": "Apple",
    "model": "Pro-1X",
    "ean": "890000000001"
  }'`,
    typescript: `const decision = await scrappy.matching.evaluate({
  title: "Apple Smartphone Model Pro-1X",
  ean: "890000000001",
});`,
    response: `{
  "decision": {
    "productId": "p2000000-0000-0000-0000-000000000001",
    "confidence": 0.99,
    "confidenceLevel": "verified",
    "reasons": ["Exact EAN barcode match"]
  }
}`,
  },
];

export default function DocsPage() {
  const [selectedTag, setSelectedTag] = useState<string>("All");
  const [codeLanguage, setCodeLanguage] = useState<"curl" | "typescript">("curl");

  const tags = ["All", "Catalog", "Pricing", "Extract", "Intelligence", "Matching"];

  const filteredEndpoints =
    selectedTag === "All"
      ? ENDPOINTS
      : ENDPOINTS.filter((ep) => ep.tag === selectedTag);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#2FBF8A]" aria-hidden="true" />
            <span className="text-xs uppercase tracking-wider font-mono text-[#2FBF8A]">
              Developer Platform
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#D6DBE3]">
            SCRAPPY PUBLIC REST API
          </h1>
          <p className="text-xs text-[#98A2B3] mt-0.5">
            Production-grade REST endpoints with strict schemas, provenance metadata, and zero fake discounts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono px-3 py-1.5 rounded bg-[#141922] border border-[#262E3C] text-[#2FBF8A]">
            OPENAPI 3.1 SPEC
          </span>
          <span className="text-xs font-mono px-3 py-1.5 rounded bg-[#141922] border border-[#262E3C] text-[#98A2B3]">
            BASE: http://localhost:4000
          </span>
        </div>
      </div>

      {/* Security & Authentication Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 text-xs font-mono">
        <div className="p-4 rounded-lg bg-[#0F1217] border border-[#262E3C]">
          <div className="text-[#5B677C] mb-1">TENANT ISOLATION</div>
          <div className="text-[#D6DBE3]">Enforced via Row-Level Security</div>
          <div className="text-[#98A2B3] mt-1 text-[11px]">Header: x-workspace-id</div>
        </div>

        <div className="p-4 rounded-lg bg-[#0F1217] border border-[#262E3C]">
          <div className="text-[#5B677C] mb-1">SSRF RESTRICTION</div>
          <div className="text-[#2FBF8A]">Active IPv4/IPv6 CIDR Filtering</div>
          <div className="text-[#98A2B3] mt-1 text-[11px]">Loopback & cloud metadata blocked</div>
        </div>

        <div className="p-4 rounded-lg bg-[#0F1217] border border-[#262E3C]">
          <div className="text-[#5B677C] mb-1">WEBHOOK SECURITY</div>
          <div className="text-[#D6DBE3]">HMAC SHA-256 Signatures</div>
          <div className="text-[#98A2B3] mt-1 text-[11px]">Header: x-scrappy-signature</div>
        </div>
      </div>

      {/* Filter Tabs & Language Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-[#262E3C] pb-3">
        <div className="flex items-center gap-1 overflow-x-auto text-xs font-mono">
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1.5 rounded transition-colors ${
                selectedTag === tag
                  ? "bg-[#2FBF8A] text-[#0A0C0F] font-bold"
                  : "bg-transparent text-[#98A2B3] hover:text-white"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-[#5B677C]">Code Example:</span>
          <button
            onClick={() => setCodeLanguage("curl")}
            className={`px-2.5 py-1 rounded ${
              codeLanguage === "curl"
                ? "bg-[#141922] text-[#C6F135] border border-[#C6F135]/40 font-bold"
                : "text-[#5B677C] hover:text-white"
            }`}
          >
            cURL
          </button>
          <button
            onClick={() => setCodeLanguage("typescript")}
            className={`px-2.5 py-1 rounded ${
              codeLanguage === "typescript"
                ? "bg-[#141922] text-[#C6F135] border border-[#C6F135]/40 font-bold"
                : "text-[#5B677C] hover:text-white"
            }`}
          >
            TypeScript
          </button>
        </div>
      </div>

      {/* Endpoints List */}
      <div className="space-y-6">
        {filteredEndpoints.map((ep, idx) => (
          <div
            key={idx}
            className="rounded-lg bg-[#0F1217] border border-[#262E3C] overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-[#262E3C] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <span
                  className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded ${
                    ep.method === "GET"
                      ? "bg-[#2FBF8A]/10 text-[#2FBF8A] border border-[#2FBF8A]/20"
                      : "bg-[#5AA9FF]/10 text-[#5AA9FF] border border-[#5AA9FF]/20"
                  }`}
                >
                  {ep.method}
                </span>
                <span className="text-xs font-mono font-bold text-[#D6DBE3]">{ep.path}</span>
              </div>
              <span className="text-xs text-[#98A2B3]">{ep.summary}</span>
            </div>

            <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-[#98A2B3] mb-3">{ep.description}</p>
                <div className="text-[10px] font-mono text-[#5B677C] uppercase mb-1">
                  REQUEST ({codeLanguage.toUpperCase()})
                </div>
                <pre className="p-3 rounded bg-[#141922] border border-[#262E3C] text-xs font-mono text-[#D6DBE3] overflow-x-auto">
                  {codeLanguage === "curl" ? ep.curl : ep.typescript}
                </pre>
              </div>

              <div>
                <div className="text-[10px] font-mono text-[#5B677C] uppercase mb-1">
                  SAMPLE RESPONSE (200 OK)
                </div>
                <pre className="p-3 rounded bg-[#141922] border border-[#262E3C] text-xs font-mono text-[#C6F135] overflow-x-auto max-h-56">
                  {ep.response}
                </pre>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
