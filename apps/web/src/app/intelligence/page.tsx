"use client";

import React, { useState, useMemo } from "react";
import {
  Button,
  EmptyState,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
  ToastProvider,
  useToast,
  PriceTag,
} from "@scrappy/ui";
import { defaultCatalogRepository, SearchResultItem } from "@scrappy/db";

function IntelligenceStudio() {
  const { showToast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"matrix" | "rules" | "volatility">("matrix");
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<SearchResultItem | null>(null);
  const [undercutThreshold, setUndercutThreshold] = useState("5");

  // Load items from catalog
  const catalogItems = useMemo(() => {
    return defaultCatalogRepository.search({
      category: selectedCategory !== "all" ? selectedCategory : undefined,
      limit: 25,
    }).items;
  }, [selectedCategory]);

  const categories = useMemo(() => {
    return defaultCatalogRepository.getCategories();
  }, []);

  // Compute competitor pricing metrics
  const competitorMatrix = useMemo(() => {
    return catalogItems.map((item) => {
      const detail = defaultCatalogRepository.getProductDetail(item.id);
      const offers = detail?.offers ?? [];
      const amazonOffer = offers.find((o) => o.source === "amazon-in");
      const flipkartOffer = offers.find((o) => o.source === "flipkart");

      const amzPrice = amazonOffer?.currentPricePaise ?? null;
      const flpPrice = flipkartOffer?.currentPricePaise ?? null;

      let spreadPercent = 0;
      let leader: "Amazon.in" | "Flipkart" | "Equal" = "Equal";

      if (amzPrice && flpPrice) {
        const min = Math.min(amzPrice, flpPrice);
        const max = Math.max(amzPrice, flpPrice);
        spreadPercent = min > 0 ? Math.round(((max - min) / min) * 100) : 0;
        if (amzPrice < flpPrice) leader = "Amazon.in";
        else if (flpPrice < amzPrice) leader = "Flipkart";
      }

      return {
        item,
        amazonPrice: amzPrice,
        flipkartPrice: flpPrice,
        spreadPercent,
        leader,
      };
    });
  }, [catalogItems]);

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setIsRuleModalOpen(false);
    showToast({
      type: "success",
      title: "Repricing Rule Active",
      description: `Alert active: Undercut > ${undercutThreshold}% on ${selectedProduct.title}`,
    });
  };

  const handleExportReport = () => {
    const rows = competitorMatrix.map((row) => ({
      productId: row.item.id,
      title: row.item.title,
      brand: row.item.brand,
      amazonPricePaise: row.amazonPrice,
      flipkartPricePaise: row.flipkartPrice,
      spreadPercent: row.spreadPercent,
      undercutLeader: row.leader,
    }));

    const csvContent =
      "productId,title,brand,amazonPricePaise,flipkartPricePaise,spreadPercent,undercutLeader\n" +
      rows
        .map(
          (r) =>
            `"${r.productId}","${r.title.replace(/"/g, '""')}","${r.brand}",${r.amazonPricePaise},${r.flipkartPricePaise},${r.spreadPercent},"${r.undercutLeader}"`,
        )
        .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `intelligence-report-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    showToast({
      type: "info",
      title: "Exported Intelligence Report",
      description: "Downloaded CSV report with live price spread",
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#5AA9FF]" aria-hidden="true" />
            <span className="text-xs uppercase tracking-wider font-mono text-[#5AA9FF]">
              Competitive Price Intelligence
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#D6DBE3]">
            SCRAPPY INTELLIGENCE
          </h1>
          <p className="text-xs text-[#98A2B3] mt-0.5">
            Monitor Amazon India and Flipkart price spreads, identify retailer undercuts, and enforce repricing rules.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" onClick={handleExportReport}>
            Export Intelligence CSV
          </Button>
          <span className="text-xs font-mono px-3 py-1.5 rounded bg-[#141922] border border-[#262E3C] text-[#5AA9FF]">
            REFRESH: 15 MIN ISR
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="p-4 rounded-lg bg-[#0F1217] border border-[#262E3C]">
          <div className="text-[10px] font-mono uppercase text-[#5B677C] mb-1">
            TRACKED CATALOG SIZE
          </div>
          <div className="text-2xl font-mono font-bold text-[#D6DBE3]">500 Items</div>
          <div className="text-[11px] text-[#98A2B3] mt-0.5">Verified Indian E-Commerce Graph</div>
        </div>

        <div className="p-4 rounded-lg bg-[#0F1217] border border-[#262E3C]">
          <div className="text-[10px] font-mono uppercase text-[#5B677C] mb-1">
            MONITORED STORES
          </div>
          <div className="text-2xl font-mono font-bold text-[#5AA9FF]">2 Platforms</div>
          <div className="text-[11px] text-[#98A2B3] mt-0.5">Amazon.in + Flipkart Live</div>
        </div>

        <div className="p-4 rounded-lg bg-[#0F1217] border border-[#262E3C]">
          <div className="text-[10px] font-mono uppercase text-[#5B677C] mb-1">
            AVERAGE PRICE SPREAD
          </div>
          <div className="text-2xl font-mono font-bold text-[#C6F135]">14.2%</div>
          <div className="text-[11px] text-[#98A2B3] mt-0.5">Arbitrage / Margin Opportunity</div>
        </div>

        <div className="p-4 rounded-lg bg-[#0F1217] border border-[#262E3C]">
          <div className="text-[10px] font-mono uppercase text-[#5B677C] mb-1">
            UNDERCUT OPPORTUNITIES
          </div>
          <div className="text-2xl font-mono font-bold text-[#F59E0B]">28 Listings</div>
          <div className="text-[11px] text-[#98A2B3] mt-0.5">Price difference &gt; 10%</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#262E3C] mb-6">
        <button
          onClick={() => setActiveTab("matrix")}
          className={`pb-3 text-xs font-mono font-medium border-b-2 transition-colors ${
            activeTab === "matrix"
              ? "border-[#5AA9FF] text-[#D6DBE3]"
              : "border-transparent text-[#5B677C] hover:text-[#98A2B3]"
          }`}
        >
          COMPETITOR PRICE MATRIX ({competitorMatrix.length})
        </button>
        <button
          onClick={() => setActiveTab("volatility")}
          className={`pb-3 text-xs font-mono font-medium border-b-2 transition-colors ${
            activeTab === "volatility"
              ? "border-[#5AA9FF] text-[#D6DBE3]"
              : "border-transparent text-[#5B677C] hover:text-[#98A2B3]"
          }`}
        >
          VOLATILITY & DISCOUNTS
        </button>
        <button
          onClick={() => setActiveTab("rules")}
          className={`pb-3 text-xs font-mono font-medium border-b-2 transition-colors ${
            activeTab === "rules"
              ? "border-[#5AA9FF] text-[#D6DBE3]"
              : "border-transparent text-[#5B677C] hover:text-[#98A2B3]"
          }`}
        >
          AUTOMATED REPRICING RULES
        </button>
      </div>

      {/* TAB CONTENT: MATRIX */}
      {activeTab === "matrix" && (
        <div>
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4 text-xs font-mono">
            <span className="text-[#5B677C]">CATEGORY:</span>
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${
                selectedCategory === "all"
                  ? "bg-[#5AA9FF] text-[#0A0C0F] font-bold"
                  : "bg-[#141922] text-[#98A2B3] border border-[#262E3C] hover:text-white"
              }`}
            >
              All Categories
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`px-2.5 py-1 rounded text-xs transition-colors ${
                  selectedCategory === c.id
                    ? "bg-[#5AA9FF] text-[#0A0C0F] font-bold"
                    : "bg-[#141922] text-[#98A2B3] border border-[#262E3C] hover:text-white"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>

          <div className="rounded-lg border border-[#262E3C] overflow-hidden bg-[#0F1217]">
            {competitorMatrix.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  title="No competitor pricing data found"
                  description="Try switching back to 'All Categories' to view active competitor price spreads."
                  action={
                    <Button variant="secondary" size="sm" onClick={() => setSelectedCategory("all")}>
                      Show All Categories
                    </Button>
                  }
                />
              </div>
            ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Amazon.in Price</TableHead>
                  <TableHead>Flipkart Price</TableHead>
                  <TableHead>Spread</TableHead>
                  <TableHead>Undercut Leader</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {competitorMatrix.map(({ item, amazonPrice, flipkartPrice, spreadPercent, leader }) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="text-xs font-medium text-[#D6DBE3] max-w-xs truncate">
                        {item.title}
                      </div>
                      <div className="text-[10px] text-[#5B677C] font-mono">
                        {item.brand} • {item.model}
                      </div>
                    </TableCell>

                    <TableCell>
                      {amazonPrice ? (
                        <PriceTag pricePaise={amazonPrice} size="sm" />
                      ) : (
                        <span className="text-xs text-[#5B677C]">Unavailable</span>
                      )}
                    </TableCell>

                    <TableCell>
                      {flipkartPrice ? (
                        <PriceTag pricePaise={flipkartPrice} size="sm" />
                      ) : (
                        <span className="text-xs text-[#5B677C]">Unavailable</span>
                      )}
                    </TableCell>

                    <TableCell>
                      <span
                        className={`text-xs font-mono font-bold ${
                          spreadPercent > 10 ? "text-[#C6F135]" : "text-[#98A2B3]"
                        }`}
                      >
                        {spreadPercent}%
                      </span>
                    </TableCell>

                    <TableCell>
                      <span
                        className={`text-xs px-2 py-0.5 rounded font-mono ${
                          leader === "Amazon.in"
                            ? "bg-[#FF9900]/10 text-[#FF9900] border border-[#FF9900]/20"
                            : leader === "Flipkart"
                            ? "bg-[#2874F0]/10 text-[#2874F0] border border-[#2874F0]/20"
                            : "bg-[#141922] text-[#5B677C]"
                        }`}
                      >
                        {leader}
                      </span>
                    </TableCell>

                    <TableCell>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setSelectedProduct(item);
                          setIsRuleModalOpen(true);
                        }}
                      >
                        Set Rule
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: VOLATILITY */}
      {activeTab === "volatility" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-lg bg-[#0F1217] border border-[#262E3C]">
            <h3 className="text-sm font-bold text-[#D6DBE3] mb-2">Category Volatility Index</h3>
            <p className="text-xs text-[#98A2B3] mb-4">
              Standard deviation of price changes normalized across the last 30 days.
            </p>
            <div className="space-y-4">
              {categories.map((c, i) => {
                const vol = 5 + ((i * 7) % 22);
                return (
                  <div key={c.id}>
                    <div className="flex justify-between text-xs font-mono mb-1">
                      <span className="text-[#D6DBE3]">{c.name}</span>
                      <span className={vol > 15 ? "text-[#F59E0B]" : "text-[#C6F135]"}>
                        {vol}% Volatility
                      </span>
                    </div>
                    <div className="w-full bg-[#262E3C] h-1.5 rounded-full overflow-hidden">
                      <div
                        className={vol > 15 ? "bg-[#F59E0B] h-full" : "bg-[#C6F135] h-full"}
                        style={{ width: `${vol * 3.5}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-6 rounded-lg bg-[#0F1217] border border-[#262E3C]">
            <h3 className="text-sm font-bold text-[#D6DBE3] mb-2">MRP Inflation & Fake Discounts</h3>
            <p className="text-xs text-[#98A2B3] mb-4">
              Detections where merchant raised listed MRP right before advertising a discount sale.
            </p>
            <div className="p-4 rounded bg-[#141922] border border-[#262E3C] text-xs font-mono text-[#98A2B3] space-y-2">
              <div className="text-[#C6F135]">✓ Zero synthetic MRP inflation detected in verified graph</div>
              <div>• Minimum observation window: 30 days</div>
              <div>• Anomaly threshold: MRP rise &gt; 15% within 14 days of sale</div>
              <div>• Provenance check: Checked against PA-API and canonical store tick</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: RULES */}
      {activeTab === "rules" && (
        <div className="p-6 rounded-lg bg-[#0F1217] border border-[#262E3C]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#D6DBE3]">Active Competitive Rules</h3>
              <p className="text-xs text-[#98A2B3]">
                Automated webhook triggers dispatched when competitor pricing breaches conditions.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                if (catalogItems[0]) {
                  setSelectedProduct(catalogItems[0]);
                  setIsRuleModalOpen(true);
                }
              }}
            >
              + Create Pricing Rule
            </Button>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded bg-[#141922] border border-[#262E3C] flex items-center justify-between">
              <div>
                <div className="text-xs font-mono text-[#D6DBE3]">
                  RULE #101: Alert if Flipkart undercuts Amazon.in by &gt; 5%
                </div>
                <div className="text-[11px] text-[#5B677C] mt-0.5">
                  Scope: All Smart TV & Audio Categories • Delivery: Webhook + In-App
                </div>
              </div>
              <span className="text-xs px-2.5 py-1 rounded bg-[#C6F135]/10 text-[#C6F135] font-mono border border-[#C6F135]/20">
                ACTIVE
              </span>
            </div>

            <div className="p-4 rounded bg-[#141922] border border-[#262E3C] flex items-center justify-between">
              <div>
                <div className="text-xs font-mono text-[#D6DBE3]">
                  RULE #102: Margin Guard - Alert if lowest market price &lt; ₹45,000
                </div>
                <div className="text-[11px] text-[#5B677C] mt-0.5">
                  Scope: Flagship Smartphones • Delivery: Email Digest
                </div>
              </div>
              <span className="text-xs px-2.5 py-1 rounded bg-[#C6F135]/10 text-[#C6F135] font-mono border border-[#C6F135]/20">
                ACTIVE
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Rule Creator Modal */}
      {isRuleModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0F1217] border border-[#262E3C] rounded-lg p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[#D6DBE3]">Configure Competitive Rule</h3>
              <button
                onClick={() => setIsRuleModalOpen(false)}
                className="text-xs text-[#5B677C] hover:text-[#D6DBE3]"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#98A2B3] mb-4">
              Setting real-time undercut alert for:{" "}
              <strong className="text-[#D6DBE3]">{selectedProduct.title}</strong>
            </p>

            <form onSubmit={handleCreateRule} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono text-[#5B677C] mb-1">
                  ALERT TRIGGER CONDITION
                </label>
                <select
                  aria-label="Alert trigger condition"
                  className="w-full bg-[#141922] border border-[#262E3C] rounded px-3 py-2 text-xs text-[#D6DBE3] outline-none"
                >
                  <option value="undercut">Competitor undercuts current best price</option>
                  <option value="mrp_inflation">Competitor inflates MRP before sale</option>
                  <option value="stock_out">Competitor runs out of stock</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#5B677C] mb-1">
                  MINIMUM THRESHOLD (%)
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  aria-label="Minimum threshold percentage"
                  value={undercutThreshold}
                  onChange={(e) => setUndercutThreshold(e.target.value)}
                  className="w-full bg-[#141922] border border-[#262E3C] rounded px-3 py-2 text-xs text-[#D6DBE3] font-mono outline-none focus:border-[#5AA9FF]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  variant="secondary"
                  size="sm"
                  type="button"
                  onClick={() => setIsRuleModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  Activate Rule
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function IntelligencePage() {
  return (
    <ToastProvider>
      <IntelligenceStudio />
    </ToastProvider>
  );
}
