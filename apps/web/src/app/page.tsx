"use client";

import React, { useState } from "react";

interface DemoProduct {
  id: string;
  title: string;
  category: string;
  bestPrice: number;
  originalPrice: number;
  dealScore: number;
  dealRating: "EXCELLENT" | "GOOD" | "FAIR" | "OVERPRICED";
  fakeDiscountAnalysis: string;
  provenance: {
    source: string;
    extractedAt: string;
    method: string;
    confidence: number;
  };
  offers: {
    store: string;
    price: number;
    inStock: boolean;
    freeDelivery: boolean;
  }[];
}

const DEMO_PRODUCTS: DemoProduct[] = [
  {
    id: "demo-1",
    title: "Apple iPhone 15 (128 GB) - Black",
    category: "Smartphones",
    bestPrice: 65999,
    originalPrice: 79900,
    dealScore: 9.4,
    dealRating: "EXCELLENT",
    fakeDiscountAnalysis: "Genuine 17.4% drop. Lowest price seen in 90 days (previous low: ₹67,999 on Sep 12).",
    provenance: {
      source: "Amazon India",
      extractedAt: "2 minutes ago",
      method: "Direct HTTP JSON-LD + Selector Validation",
      confidence: 0.998,
    },
    offers: [
      { store: "Amazon India", price: 65999, inStock: true, freeDelivery: true },
      { store: "Flipkart", price: 66499, inStock: true, freeDelivery: true },
      { store: "Croma", price: 69900, inStock: true, freeDelivery: false },
    ],
  },
  {
    id: "demo-2",
    title: "Sony WH-1000XM5 Wireless Noise Cancelling Headphones",
    category: "Audio",
    bestPrice: 28990,
    originalPrice: 34990,
    dealScore: 8.8,
    dealRating: "GOOD",
    fakeDiscountAnalysis: "Genuine 17.1% drop. Listed MRP was not artificially inflated before sale.",
    provenance: {
      source: "Flipkart",
      extractedAt: "5 minutes ago",
      method: "Cheerio Fallback Extraction Chain",
      confidence: 0.994,
    },
    offers: [
      { store: "Flipkart", price: 28990, inStock: true, freeDelivery: true },
      { store: "Amazon India", price: 29990, inStock: true, freeDelivery: true },
      { store: "Reliance Digital", price: 31990, inStock: false, freeDelivery: false },
    ],
  },
  {
    id: "demo-3",
    title: "Apple MacBook Air 13.6-inch M3 Chip (8-Core CPU, 256GB)",
    category: "Laptops",
    bestPrice: 104990,
    originalPrice: 114900,
    dealScore: 9.1,
    dealRating: "EXCELLENT",
    fakeDiscountAnalysis: "8.6% drop below standard retail price. Historic baseline: ₹109,900.",
    provenance: {
      source: "Amazon India",
      extractedAt: "1 minute ago",
      method: "Direct HTTP API Extraction",
      confidence: 0.999,
    },
    offers: [
      { store: "Amazon India", price: 104990, inStock: true, freeDelivery: true },
      { store: "Croma", price: 107990, inStock: true, freeDelivery: true },
      { store: "Flipkart", price: 108990, inStock: true, freeDelivery: true },
    ],
  },
];

export default function HomePage() {
  const [selectedProduct, setSelectedProduct] = useState<DemoProduct>(DEMO_PRODUCTS[0]!);
  const [searchQuery, setSearchQuery] = useState("");
  const [checkoutStatus, setCheckoutStatus] = useState<string | null>(null);

  const filteredProducts = DEMO_PRODUCTS.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTestCheckout = (planName: string) => {
    setCheckoutStatus(`Test Checkout Initialized for ${planName} Plan (Test Mode Razorpay/Stripe)`);
    setTimeout(() => setCheckoutStatus(null), 4000);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 md:py-20">
      {/* Precision Instrument Badge */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#262E3C] bg-[#0F1217] text-xs font-mono text-[#C6F135]">
          <span className="w-2 h-2 rounded-full bg-[#C6F135] animate-pulse"></span>
          <span>PRECISION DATA INSTRUMENT • VERSION 1.0</span>
        </div>
      </div>

      {/* Hero Headline */}
      <div className="text-center max-w-4xl mx-auto mb-10">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
          The verified, historical graph of products, merchants, and prices.
        </h1>
        <p className="text-base md:text-xl text-[#98A2B3] max-w-3xl mx-auto leading-relaxed">
          Scrappy turns the chaotic web into structured, provable truth. Honest price comparison for consumers,
          market intelligence for brands, and headless resilient extraction for developers — all on one unified platform.
        </p>
      </div>

      {/* Trust & Provenance Telemetry Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-16 p-4 rounded bg-[#0F1217] border border-[#262E3C]">
        <div className="text-center border-r border-[#262E3C] last:border-r-0">
          <div className="text-xl md:text-2xl font-bold font-mono text-white">500+</div>
          <div className="text-xs font-mono text-[#98A2B3] mt-0.5">Active Products Indexed</div>
        </div>
        <div className="text-center border-r border-[#262E3C] last:border-r-0">
          <div className="text-xl md:text-2xl font-bold font-mono text-[#C6F135]">0.0%</div>
          <div className="text-xs font-mono text-[#98A2B3] mt-0.5">False Positive Match Rate</div>
        </div>
        <div className="text-center border-r border-[#262E3C] last:border-r-0">
          <div className="text-xl md:text-2xl font-bold font-mono text-white">4 Adapters</div>
          <div className="text-xs font-mono text-[#98A2B3] mt-0.5">Amazon, Flipkart, Croma, Reliance</div>
        </div>
        <div className="text-center">
          <div className="text-xl md:text-2xl font-bold font-mono text-[#70E000]">&lt; 150ms</div>
          <div className="text-xs font-mono text-[#98A2B3] mt-0.5">Search API p95 Latency</div>
        </div>
      </div>

      {/* Dual CTA Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-4 mb-20">
        <a
          href="/compare"
          className="px-6 py-3 rounded bg-[#C6F135] text-[#0A0C0F] font-semibold text-sm hover:bg-[#B5DF2E] transition-all shadow-sm"
        >
          Explore Compare Tool →
        </a>
        <a
          href="/intelligence"
          className="px-6 py-3 rounded bg-[#14181F] text-white font-semibold text-sm border border-[#262E3C] hover:border-[#5B677C] transition-all"
        >
          Launch Market Intelligence
        </a>
        <a
          href="/docs"
          className="px-6 py-3 rounded bg-transparent text-[#98A2B3] font-mono text-xs hover:text-white transition-colors"
        >
          API Docs &amp; Spec ↗
        </a>
      </div>

      {/* Interactive Live Compare Showcase Widget */}
      <div className="border border-[#262E3C] rounded-lg bg-[#0F1217] overflow-hidden mb-24 shadow-2xl">
        <div className="px-6 py-4 border-b border-[#262E3C] bg-[#14181F] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C6F135]"></span>
            <span className="text-xs font-mono font-bold text-white tracking-wider">
              INTERACTIVE PRECISION GRAPH DEMO
            </span>
          </div>
          <div className="text-xs font-mono text-[#98A2B3]">
            Select or search a product to inspect provenance, spread &amp; deal score:
          </div>
        </div>

        <div className="p-6">
          {/* Search bar inside demo */}
          <div className="mb-6 flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Search products (e.g., iPhone 15, Sony WH-1000XM5, MacBook Air)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded bg-[#0A0C0F] border border-[#262E3C] text-sm text-white focus:outline-none focus:border-[#C6F135] font-mono"
            />
            <div className="flex items-center gap-2 overflow-x-auto">
              {(filteredProducts.length > 0 ? filteredProducts : DEMO_PRODUCTS).map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedProduct(p)}
                  className={`px-3 py-1.5 rounded text-xs font-mono whitespace-nowrap transition-colors ${
                    selectedProduct.id === p.id
                      ? "bg-[#C6F135] text-[#0A0C0F] font-bold"
                      : "bg-[#14181F] text-[#98A2B3] hover:text-white border border-[#262E3C]"
                  }`}
                >
                  {p.title.split(" ")[1]}
                </button>
              ))}
            </div>
          </div>

          {/* Active Product Card with Provenance & Offers */}
          <div className="bg-[#0A0C0F] border border-[#262E3C] rounded p-6">
            <div className="flex flex-col lg:flex-row justify-between gap-6 pb-6 border-b border-[#262E3C]">
              <div>
                <span className="text-xs font-mono text-[#C6F135] uppercase">{selectedProduct.category}</span>
                <h3 className="text-xl md:text-2xl font-bold text-white mt-1">{selectedProduct.title}</h3>
                <p className="text-xs text-[#98A2B3] mt-2 font-mono">{selectedProduct.fakeDiscountAnalysis}</p>
              </div>

              <div className="flex items-center gap-4 bg-[#0F1217] p-4 rounded border border-[#262E3C] self-start">
                <div>
                  <div className="text-xs font-mono text-[#98A2B3]">BEST CURRENT PRICE</div>
                  <div className="text-2xl font-mono font-bold text-[#C6F135]">
                    ₹{selectedProduct.bestPrice.toLocaleString("en-IN")}
                  </div>
                  <div className="text-xs text-[#98A2B3] line-through">
                    MRP: ₹{selectedProduct.originalPrice.toLocaleString("en-IN")}
                  </div>
                </div>
                <div className="border-l border-[#262E3C] pl-4 text-center">
                  <div className="text-xs font-mono text-[#98A2B3]">DEAL SCORE</div>
                  <div className="text-2xl font-mono font-bold text-white">{selectedProduct.dealScore}/10</div>
                  <div className="text-[10px] font-mono text-[#70E000] font-semibold">
                    {selectedProduct.dealRating}
                  </div>
                </div>
              </div>
            </div>

            {/* Provenance Badge Section */}
            <div className="py-4 border-b border-[#262E3C] grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs font-mono bg-[#0D1015] px-4 -mx-6">
              <div>
                <span className="text-[#98A2B3]">Primary Source: </span>
                <span className="text-white font-medium">{selectedProduct.provenance.source}</span>
              </div>
              <div>
                <span className="text-[#98A2B3]">Extracted: </span>
                <span className="text-white font-medium">{selectedProduct.provenance.extractedAt}</span>
              </div>
              <div>
                <span className="text-[#98A2B3]">Pipeline: </span>
                <span className="text-white font-medium">{selectedProduct.provenance.method}</span>
              </div>
              <div>
                <span className="text-[#98A2B3]">Confidence: </span>
                <span className="text-[#C6F135] font-bold">
                  {(selectedProduct.provenance.confidence * 100).toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Live Store Offers Table */}
            <div className="pt-6">
              <h4 className="text-xs font-mono text-[#98A2B3] mb-3">VERIFIED RETAILER OFFERS</h4>
              <div className="space-y-2">
                {selectedProduct.offers.map((offer, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded bg-[#0F1217] border border-[#262E3C]"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-[#70E000]"></span>
                      <span className="text-sm font-medium text-white">{offer.store}</span>
                      {offer.freeDelivery && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#162215] text-[#70E000] border border-[#2D6A4F]">
                          Free Delivery
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-base font-mono font-bold text-white">
                        ₹{offer.price.toLocaleString("en-IN")}
                      </span>
                      <a
                        href="/compare"
                        className="px-3 py-1 rounded text-xs font-mono bg-[#14181F] text-[#C6F135] border border-[#262E3C] hover:border-[#C6F135] transition-colors"
                      >
                        View Details →
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* The Three Views on One Platform */}
      <div className="mb-24">
        <div className="text-center mb-12">
          <div className="text-xs font-mono text-[#C6F135] mb-2">UNIFIED ARCHITECTURE</div>
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Three Views. One Precision Engine.
          </h2>
          <p className="text-sm text-[#98A2B3] max-w-xl mx-auto mt-2">
            Compare, Intelligence, and Extract are not disjointed products. They are different perspectives on the same real-time product graph.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded border border-[#262E3C] bg-[#0F1217] flex flex-col justify-between">
            <div>
              <div className="text-xs font-mono text-[#C6F135] mb-3">FOR CONSUMERS</div>
              <h3 className="text-xl font-bold text-white mb-2">Scrappy Compare</h3>
              <p className="text-sm text-[#98A2B3] leading-relaxed mb-6">
                Never fall for artificial sales. Compare tracks genuine 90-day price trajectories, detects fake discounts, and alerts you the moment prices drop across major retail storefronts.
              </p>
              <ul className="text-xs text-[#98A2B3] space-y-2 font-mono">
                <li className="flex items-center gap-2">
                  <span className="text-[#C6F135]">✓</span> Genuine discount scoring (0–10)
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#C6F135]">✓</span> Provenance badge on every offer
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#C6F135]">✓</span> Instant price drop alerts
                </li>
              </ul>
            </div>
            <a
              href="/compare"
              className="mt-6 inline-flex items-center text-xs font-mono text-[#C6F135] hover:underline"
            >
              Open Compare App →
            </a>
          </div>

          <div className="p-6 rounded border border-[#262E3C] bg-[#0F1217] flex flex-col justify-between">
            <div>
              <div className="text-xs font-mono text-[#5AA9FF] mb-3">FOR BRANDS &amp; RETAILERS</div>
              <h3 className="text-xl font-bold text-white mb-2">Scrappy Intelligence</h3>
              <p className="text-sm text-[#98A2B3] leading-relaxed mb-6">
                Enterprise competitive intelligence without the enterprise bloat. Track competitive catalog spreads, simulate repricing rules, and guard margins in real time.
              </p>
              <ul className="text-xs text-[#98A2B3] space-y-2 font-mono">
                <li className="flex items-center gap-2">
                  <span className="text-[#5AA9FF]">✓</span> 500-SKU competitive spread matrix
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#5AA9FF]">✓</span> Automated undercut repricing rules
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#5AA9FF]">✓</span> Price volatility &amp; stock alerts
                </li>
              </ul>
            </div>
            <a
              href="/intelligence"
              className="mt-6 inline-flex items-center text-xs font-mono text-[#5AA9FF] hover:underline"
            >
              Open Intelligence Studio →
            </a>
          </div>

          <div className="p-6 rounded border border-[#262E3C] bg-[#0F1217] flex flex-col justify-between">
            <div>
              <div className="text-xs font-mono text-[#9A7BFF] mb-3">FOR DEVELOPERS</div>
              <h3 className="text-xl font-bold text-white mb-2">Scrappy Extract</h3>
              <p className="text-sm text-[#98A2B3] leading-relaxed mb-6">
                Resilient, schema-driven web extraction with visual CSS selector building, auto-fallback selector chains, and OpenAPI 3.1 endpoints.
              </p>
              <ul className="text-xs text-[#98A2B3] space-y-2 font-mono">
                <li className="flex items-center gap-2">
                  <span className="text-[#9A7BFF]">✓</span> Built-in SSRF protection engine
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#9A7BFF]">✓</span> Selector drift resilience scoring
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#9A7BFF]">✓</span> Multi-format exports (JSON, CSV)
                </li>
              </ul>
            </div>
            <a
              href="/extract"
              className="mt-6 inline-flex items-center text-xs font-mono text-[#9A7BFF] hover:underline"
            >
              Open Visual Extract Studio →
            </a>
          </div>
        </div>
      </div>

      {/* Transparent Pricing Matrix */}
      <div className="mb-24">
        <div className="text-center mb-12">
          <div className="text-xs font-mono text-[#C6F135] mb-2">TRANSPARENT PLANS</div>
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Honest Pricing for Every Scale
          </h2>
          <p className="text-sm text-[#98A2B3] max-w-xl mx-auto mt-2">
            No hidden tiers, no surprise scraping surcharges. Switch or cancel any time.
          </p>
        </div>

        {checkoutStatus && (
          <div className="max-w-md mx-auto mb-8 p-3 rounded bg-[#162215] border border-[#2D6A4F] text-[#C6F135] text-xs font-mono text-center">
            {checkoutStatus}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Plan 1 */}
          <div className="p-6 rounded border border-[#262E3C] bg-[#0F1217] flex flex-col justify-between">
            <div>
              <div className="text-xs font-mono text-[#98A2B3] mb-1">CONSUMER &amp; CASUAL</div>
              <h3 className="text-xl font-bold text-white">Compare Free</h3>
              <div className="mt-4 mb-6">
                <span className="text-3xl font-bold font-mono text-white">₹0</span>
                <span className="text-xs text-[#98A2B3] ml-1 font-mono">/ forever</span>
              </div>
              <ul className="text-xs text-[#98A2B3] space-y-3 font-mono border-t border-[#262E3C] pt-6">
                <li className="flex items-center gap-2">✓ Unlimited public product search</li>
                <li className="flex items-center gap-2">✓ Up to 10 active price drop alerts</li>
                <li className="flex items-center gap-2">✓ 90-day historical price graphs</li>
                <li className="flex items-center gap-2">✓ Fake discount &amp; deal score tags</li>
              </ul>
            </div>
            <a
              href="/compare"
              className="mt-8 block text-center py-2.5 rounded border border-[#262E3C] text-xs font-mono font-semibold text-white hover:border-[#5B677C] transition-colors"
            >
              Start Free
            </a>
          </div>

          {/* Plan 2: Pro */}
          <div className="p-6 rounded border-2 border-[#C6F135] bg-[#0F1217] flex flex-col justify-between relative shadow-lg">
            <div className="absolute -top-3 right-4 px-2.5 py-0.5 rounded bg-[#C6F135] text-[#0A0C0F] text-[10px] font-mono font-bold uppercase">
              Most Popular
            </div>
            <div>
              <div className="text-xs font-mono text-[#C6F135] mb-1">GROWTH &amp; E-COMMERCE</div>
              <h3 className="text-xl font-bold text-white">Pro Studio</h3>
              <div className="mt-4 mb-6">
                <span className="text-3xl font-bold font-mono text-white">₹2,999</span>
                <span className="text-xs text-[#98A2B3] ml-1 font-mono">/ month</span>
              </div>
              <ul className="text-xs text-[#98A2B3] space-y-3 font-mono border-t border-[#262E3C] pt-6">
                <li className="flex items-center gap-2 text-white">✓ 500 Competitor SKUs monitored</li>
                <li className="flex items-center gap-2 text-white">✓ Automated hourly scrape runs</li>
                <li className="flex items-center gap-2 text-white">✓ Repricing rule triggers &amp; webhooks</li>
                <li className="flex items-center gap-2 text-white">✓ 10,000 Extract API calls / month</li>
                <li className="flex items-center gap-2 text-white">✓ Row-Level Security tenant isolation</li>
              </ul>
            </div>
            <button
              onClick={() => handleTestCheckout("Pro Studio")}
              className="mt-8 w-full py-2.5 rounded bg-[#C6F135] text-xs font-mono font-bold text-[#0A0C0F] hover:bg-[#B5DF2E] transition-colors"
            >
              Get Started with Pro
            </button>
          </div>

          {/* Plan 3: Enterprise */}
          <div className="p-6 rounded border border-[#262E3C] bg-[#0F1217] flex flex-col justify-between">
            <div>
              <div className="text-xs font-mono text-[#98A2B3] mb-1">BRANDS &amp; AGGREGATORS</div>
              <h3 className="text-xl font-bold text-white">Enterprise API</h3>
              <div className="mt-4 mb-6">
                <span className="text-3xl font-bold font-mono text-white">₹14,999</span>
                <span className="text-xs text-[#98A2B3] ml-1 font-mono">/ month</span>
              </div>
              <ul className="text-xs text-[#98A2B3] space-y-3 font-mono border-t border-[#262E3C] pt-6">
                <li className="flex items-center gap-2">✓ Unlimited catalog price monitoring</li>
                <li className="flex items-center gap-2">✓ 15-minute scrape frequency</li>
                <li className="flex items-center gap-2">✓ Dedicated scraper circuit breakers</li>
                <li className="flex items-center gap-2">✓ 250,000 Extract API calls / month</li>
                <li className="flex items-center gap-2">✓ 99.9% SLA &amp; 24/7 incident response</li>
              </ul>
            </div>
            <button
              onClick={() => handleTestCheckout("Enterprise API")}
              className="mt-8 w-full py-2.5 rounded border border-[#262E3C] text-xs font-mono font-semibold text-white hover:border-[#5B677C] transition-colors"
            >
              Contact Sales / Checkout
            </button>
          </div>
        </div>
      </div>

      {/* Trust & Constitutional Manifesto */}
      <div className="border border-[#262E3C] rounded p-8 bg-[#0F1217]">
        <div className="inline-flex items-center gap-2 text-xs font-mono text-[#C6F135] mb-2">
          ● THE SCRAPPY COMMITMENT
        </div>
        <h2 className="text-2xl font-bold text-white mb-4">Engineering Standards That Never Waver</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-[#98A2B3] leading-relaxed">
          <div>
            <h4 className="text-white font-semibold mb-1">Every Number Has Provenance</h4>
            <p>
              We never show a price without documenting where it came from, the exact extraction timestamp,
              and our confidence level. You will always know how fresh the data is.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-1">Zero False-Positive Matching</h4>
            <p>
              A false match is catastrophic in price intelligence. Uncertain matches are held in an operator review queue rather than merged into the entity graph.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-1">Responsible &amp; Respectful Crawling</h4>
            <p>
              We respect robots.txt, enforce per-host concurrency limits, identify as ScrappyBot, and never circumvent CAPTCHAs or harvest private customer data.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-1">Database-Level Tenancy Security</h4>
            <p>
              Workspace isolation is not an application check; it is enforced directly via PostgreSQL Row Level Security (RLS) on every table in the graph.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
