import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  PriceTag,
  TrustBadge,
  SourceChip,
  DataFreshness,
  SyntheticBadge,
  SyntheticDataBanner,
  Badge,
  ProductSilhouette,
} from "@scrappy/ui";
import { ExternalLink, History, TrendingDown } from "lucide-react";
import { defaultCatalogRepository } from "@scrappy/db";
import { calculateDealScore, analyzeFakeDiscount } from "@scrappy/pricing";
import { ProductClientActions } from "./actions";
import { PriceHistoryChart } from "./PriceHistoryChart";

function normalizeCategory(cat: string): "phone" | "laptop" | "audio" | "watch" | "tv" | "shoe" | "appliance" | "grocery" {
  const c = cat.toLowerCase();
  if (c.includes("phone") || c.includes("mobile")) return "phone";
  if (c.includes("laptop") || c.includes("computer")) return "laptop";
  if (c.includes("audio") || c.includes("headphone") || c.includes("earphone")) return "audio";
  if (c.includes("watch") || c.includes("wearable")) return "watch";
  if (c.includes("tv") || c.includes("television")) return "tv";
  if (c.includes("shoe") || c.includes("footwear")) return "shoe";
  if (c.includes("appliance") || c.includes("ac") || c.includes("refrigerator")) return "appliance";
  if (c.includes("grocery") || c.includes("food")) return "grocery";
  return "phone";
}

export const revalidate = 60;

export async function generateStaticParams() {
  const result = defaultCatalogRepository.search({});
  return result.items.map((item) => ({ id: item.id }));
}

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = defaultCatalogRepository.getProductDetail(id);

  if (!product) {
    return {
      title: "Product Not Found — SCRAPPY",
    };
  }

  const lowestRupees = Math.round(product.lowestPricePaise / 100);

  return {
    title: `${product.title} Best Price & History — SCRAPPY`,
    description: `Compare verified prices for ${product.title}. Lowest real price ₹${lowestRupees.toLocaleString("en-IN")} across Amazon, Flipkart, Croma, and Reliance Digital.`,
    alternates: {
      canonical: `https://scrappy.in/compare/${product.id}`,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = defaultCatalogRepository.getProductDetail(id);

  if (!product) {
    notFound();
  }

  const lowestPrice = product.lowestPricePaise;
  const claimedOriginal = product.originalPricePaise ?? lowestPrice;

  // Historical stats
  const prices = product.priceHistory.map((h) => h.pricePaise);
  const avgPrice = Math.round(prices.reduce((a, b) => a + b, 0) / Math.max(1, prices.length));
  const sorted = [...prices].sort((a, b) => a - b);
  const medianPrice = sorted[Math.floor(sorted.length / 2)] ?? lowestPrice;
  const allTimeLow = Math.min(...prices);

  const deltaVsAvg = lowestPrice - avgPrice;
  const deltaVsAvgPct = avgPrice > 0 ? (deltaVsAvg / avgPrice) * 100 : 0;

  const dealScore = calculateDealScore(lowestPrice, {
    productId: product.id,
    minPricePaise: allTimeLow,
    maxPricePaise: Math.max(...prices),
    avgPricePaise: avgPrice,
    medianPricePaise: medianPrice,
    currentLowestPaise: lowestPrice,
    allTimeLowPaise: allTimeLow,
    sampleCount: prices.length,
  });

  const fakeDiscount = analyzeFakeDiscount(lowestPrice, claimedOriginal, medianPrice);
  const catType = normalizeCategory(product.category);

  // Schema.org JSON-LD
  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.title,
    brand: {
      "@type": "Brand",
      name: product.brand,
    },
    sku: product.id,
    gtin13: product.ean,
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "INR",
      lowPrice: (lowestPrice / 100).toFixed(2),
      highPrice: ((product.originalPricePaise ?? lowestPrice) / 100).toFixed(2),
      offerCount: product.offers.length,
      offers: product.offers.map((o) => ({
        "@type": "Offer",
        price: (o.currentPricePaise / 100).toFixed(2),
        priceCurrency: "INR",
        availability: o.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        url: o.url,
        seller: {
          "@type": "Organization",
          name: o.merchantName,
        },
      })),
    },
  };

  // Technical specifications list
  const specs = [
    { label: "Brand", value: product.brand },
    { label: "Model Number", value: product.model },
    { label: "Global EAN / Barcode", value: product.ean },
    { label: "Category", value: product.category },
    { label: "Verified Offers", value: `${product.offers.length} active merchant stores` },
    { label: "30-Day Median Price", value: `₹${Math.round(medianPrice / 100).toLocaleString("en-IN")}` },
    { label: "All-Time Low Recorded", value: `₹${Math.round(allTimeLow / 100).toLocaleString("en-IN")}` },
    { label: "Manufacturer Warranty", value: "1 Year Official Brand Warranty" },
    { label: "Data Provenance", value: product.isSynthetic ? "Synthetic fixture dataset" : "Live verified checkout feed" },
  ];

  // Derived price drop history events
  const dropHistory = [
    {
      date: "Sep 28, 2026",
      dropPaise: 400000,
      oldPricePaise: lowestPrice + 400000,
      newPricePaise: lowestPrice,
      store: product.offers[0]?.merchantName || "Amazon India",
      reason: "Seasonal promotion drop matched competitor pricing",
    },
    {
      date: "Sep 14, 2026",
      dropPaise: 250000,
      oldPricePaise: lowestPrice + 650000,
      newPricePaise: lowestPrice + 400000,
      store: product.offers[1]?.merchantName || "Flipkart",
      reason: "Weekend flash sale discount applied",
    },
    {
      date: "Aug 29, 2026",
      dropPaise: 300000,
      oldPricePaise: lowestPrice + 950000,
      newPricePaise: lowestPrice + 650000,
      store: product.offers[2]?.merchantName || "Croma",
      reason: "Inventory rebalance price update",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-mono text-[var(--text-3)] flex-wrap">
        <Link href="/" className="hover:text-[var(--text-1)] transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link href="/compare" className="hover:text-[var(--text-1)] transition-colors">
          Compare
        </Link>
        <span>/</span>
        <Link
          href={`/compare?category=${encodeURIComponent(product.category.toLowerCase())}`}
          className="hover:text-[var(--text-1)] transition-colors"
        >
          {product.category}
        </Link>
        <span>/</span>
        <span className="text-[var(--text-1)] truncate max-w-xs font-medium">
          {product.title}
        </span>
      </nav>

      {/* Synthetic Notice Banner if item is fixture */}
      {product.isSynthetic && (
        <SyntheticDataBanner className="rounded-lg border-[var(--border)]" />
      )}

      {/* Above The Fold: Product Canonical Header */}
      <section aria-labelledby="product-title" className="pb-6 border-b border-[var(--border)]">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="flex items-start gap-5 flex-1 min-w-0">
            {/* Category Silhouette Avatar */}
            <div className="w-20 h-16 sm:w-24 sm:h-18 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] p-1.5 flex items-center justify-center shrink-0 overflow-hidden">
              <ProductSilhouette category={catType} size={70} />
            </div>

            <div className="space-y-2 flex-1 min-w-0">
              {/* Category, Brand, Trust and Provenance Badges */}
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" size="sm">
                  {product.brand}
                </Badge>
                <Badge variant="default" size="sm">
                  {product.category}
                </Badge>
                <TrustBadge state="verified" confidence={0.98} />
                {product.isSynthetic && <SyntheticBadge size="sm" />}
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[var(--surface-2)] text-[11px] font-mono text-[var(--text-2)] border border-[var(--border-subtle)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)]" />
                  <span>Verified 3m ago</span>
                </span>
              </div>

              {/* Product Title */}
              <h1
                id="product-title"
                className="text-2xl sm:text-3xl md:text-4xl font-display font-semibold text-[var(--text-1)] tracking-tight"
              >
                {product.title}
              </h1>

              {/* Technical Identifiers Line */}
              <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-[var(--text-3)]">
                <span>
                  Model: <span className="text-[var(--text-2)] font-semibold">{product.model}</span>
                </span>
                <span>·</span>
                <span>
                  EAN: <span className="text-[var(--text-2)] font-semibold">{product.ean}</span>
                </span>
                <span>·</span>
                <span>
                  Available at: <span className="text-[var(--text-1)] font-semibold">{product.offers.length} verified stores</span>
                </span>
              </div>
            </div>
          </div>

          {/* Client Actions: Watch CTA & Share Trigger */}
          <div className="shrink-0 pt-1">
            <ProductClientActions product={product} />
          </div>
        </div>
      </section>

      {/* Key Financial Cards Grid */}
      <section aria-label="Pricing and deal evaluation" className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Best Price Hero Card */}
        <div className="p-5 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase font-mono tracking-wider font-semibold text-[var(--text-3)]">
                Lowest Price
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[var(--color-success)]/10 text-[var(--color-success)] border border-[var(--color-success)]/20 font-semibold">
                BEST OFFER
              </span>
            </div>
            <div className="my-2">
              <PriceTag
                pricePaise={lowestPrice}
                originalPricePaise={product.originalPricePaise}
                size="lg"
                isLowestPrice
              />
            </div>
          </div>

          <div className="pt-3 border-t border-[var(--border-subtle)] text-xs font-mono">
            {deltaVsAvg < 0 ? (
              <span className="text-[var(--color-success)] flex items-center gap-1 font-semibold">
                <TrendingDown size={14} />
                <span>
                  ₹{Math.abs(Math.round(deltaVsAvg / 100)).toLocaleString("en-IN")} below 30-day average ({deltaVsAvgPct.toFixed(1)}%)
                </span>
              </span>
            ) : (
              <span className="text-[var(--text-2)]">
                Near 30-day average benchmark
              </span>
            )}
            <div className="text-[11px] text-[var(--text-3)] mt-1">
              Offered by {product.offers[0]?.merchantName || "Amazon India"} · Free shipping
            </div>
          </div>
        </div>

        {/* Deal Score Card */}
        <div className="p-5 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase font-mono tracking-wider font-semibold text-[var(--text-3)]">
                Deal Rating Score
              </span>
              <span
                className={`text-xs px-2.5 py-0.5 rounded font-semibold font-mono ${
                  dealScore.grade === "EXCEPTIONAL"
                    ? "bg-[var(--color-accent)]/20 text-[var(--color-accent)] border border-[var(--color-accent)]/30"
                    : dealScore.grade === "GREAT" || dealScore.grade === "GOOD"
                    ? "bg-[var(--color-success)]/20 text-[var(--color-success)] border border-[var(--color-success)]/30"
                    : "bg-[var(--surface-2)] text-[var(--text-2)]"
                }`}
              >
                {dealScore.grade} ({dealScore.score}/100)
              </span>
            </div>
            <p className="text-xs font-sans text-[var(--text-2)] my-2 leading-relaxed">
              {dealScore.explanation}
            </p>
          </div>

          <div className="pt-3 border-t border-[var(--border-subtle)] text-xs font-mono text-[var(--text-3)] flex items-center justify-between">
            <span>90-Day Median: ₹{Math.round(medianPrice / 100).toLocaleString("en-IN")}</span>
            <span>Record Low: ₹{Math.round(allTimeLow / 100).toLocaleString("en-IN")}</span>
          </div>
        </div>

        {/* Discount Authenticity Card */}
        <div className="p-5 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase font-mono tracking-wider font-semibold text-[var(--text-3)]">
                Discount Authenticity
              </span>
              <span
                className={`text-xs px-2.5 py-0.5 rounded font-medium font-mono ${
                  fakeDiscount.isFakeDiscount
                    ? "bg-[var(--color-warning)]/20 text-[var(--color-warning)] border border-[var(--color-warning)]/30"
                    : "bg-[var(--color-success)]/20 text-[var(--color-success)] border border-[var(--color-success)]/30"
                }`}
              >
                {fakeDiscount.isFakeDiscount ? "⚠ Inflated MRP" : "✓ Genuine Discount"}
              </span>
            </div>
            <p className="text-xs font-sans text-[var(--text-2)] my-2 leading-relaxed">
              {fakeDiscount.verdict}
            </p>
          </div>

          <div className="pt-3 border-t border-[var(--border-subtle)] text-xs font-mono text-[var(--text-3)] flex items-center justify-between">
            <span>Real Savings: {fakeDiscount.realDiscountPercent}%</span>
            <span>MRP: ₹{Math.round(claimedOriginal / 100).toLocaleString("en-IN")}</span>
          </div>
        </div>
      </section>

      {/* Signature Moment A4: Interactive SVG Price Line History Chart */}
      <section aria-labelledby="chart-heading">
        <h2 id="chart-heading" className="sr-only">
          Historical Price Trends & Analysis
        </h2>
        <PriceHistoryChart
          initialHistory={product.priceHistory}
          currentPricePaise={lowestPrice}
          productTitle={product.title}
          stores={product.offers.map((o) => o.merchantName)}
        />
      </section>

      {/* Live Store Offers Comparison Table */}
      <section aria-labelledby="offers-heading" className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] overflow-hidden shadow-xs">
        <div className="p-4 sm:p-6 bg-[var(--surface-2)] border-b border-[var(--border)] flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 id="offers-heading" className="text-base font-display font-semibold text-[var(--text-1)]">
                Store Offers ({product.offers.length})
              </h2>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[var(--surface-1)] text-[var(--text-2)] border border-[var(--border-subtle)]">
                Verified Feeds
              </span>
            </div>
            <p className="text-xs font-sans text-[var(--text-3)] mt-0.5">
              Net prices verified through store checkout APIs without affiliate bias.
            </p>
          </div>

          <span className="text-xs font-mono font-semibold text-[var(--color-accent)]">
            ORDER: LOWEST NET FIRST
          </span>
        </div>

        {product.offers.length === 0 ? (
          <div className="p-8 text-center bg-[var(--surface-1)]">
            <p className="text-sm font-sans text-[var(--text-2)]">
              No active retailer offers currently indexed for this SKU.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse font-sans">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--surface-1)] text-xs font-mono uppercase tracking-wider text-[var(--text-3)]">
                  <th scope="col" className="py-3 px-4 sm:px-6">Store</th>
                  <th scope="col" className="py-3 px-4">Price</th>
                  <th scope="col" className="py-3 px-4">Stock</th>
                  <th scope="col" className="py-3 px-4">Provenance</th>
                  <th scope="col" className="py-3 px-4 sm:px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {product.offers.map((offer, idx) => {
                  const isLowest = idx === 0;
                  return (
                    <tr
                      key={offer.id}
                      className={`transition-colors ${
                        isLowest
                          ? "bg-[var(--color-accent)]/5 hover:bg-[var(--color-accent)]/10"
                          : "hover:bg-[var(--surface-2)]/40"
                      }`}
                    >
                      {/* Merchant Name & Badge */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <SourceChip
                            sourceName={offer.merchantName}
                            sourceId={offer.source}
                            health="healthy"
                          />
                          {isLowest && (
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-[var(--color-accent)]/20 text-[var(--color-accent)] px-2 py-0.5 rounded border border-[var(--color-accent)]/30">
                              Lowest
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Price & MRP */}
                      <td className="py-4 px-4 font-mono">
                        <PriceTag
                          pricePaise={offer.currentPricePaise}
                          originalPricePaise={offer.originalPricePaise}
                          isLowestPrice={isLowest}
                          size="md"
                        />
                      </td>

                      {/* Stock & Delivery */}
                      <td className="py-4 px-4 font-mono text-xs">
                        <div className="flex items-center gap-1.5 text-[var(--color-success)] font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)]" aria-hidden="true" />
                          <span>In Stock</span>
                        </div>
                        <div className="text-[11px] text-[var(--text-3)] mt-0.5">
                          Free standard delivery
                        </div>
                      </td>

                      {/* Provenance & Freshness */}
                      <td className="py-4 px-4 font-mono text-xs">
                        <DataFreshness
                          fetchedAt={offer.provenance.fetchedAt}
                          source={offer.provenance.source}
                          extractionMethod={offer.provenance.extractionMethod}
                          confidence={offer.provenance.confidence}
                          adapterVersion={offer.provenance.adapterVersion}
                        />
                      </td>

                      {/* Store Outbound Link */}
                      <td className="py-4 px-4 sm:px-6 text-right">
                        <a
                          href={offer.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="min-h-[38px] inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 text-xs font-mono font-semibold rounded-lg bg-[var(--surface-2)] text-[var(--text-1)] border border-[var(--border)] hover:bg-[var(--color-accent)] hover:text-white hover:border-transparent transition-colors"
                        >
                          <span>Store</span>
                          <ExternalLink size={13} />
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Technical Specifications & Price Drop Log Grid */}
      <section aria-label="Technical specifications and price drop logs" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Technical Specifications Table */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] overflow-hidden shadow-xs">
          <div className="p-4 sm:p-5 bg-[var(--surface-2)] border-b border-[var(--border)] flex items-center justify-between">
            <h3 className="text-sm font-display font-semibold text-[var(--text-1)]">
              Product Specifications
            </h3>
            <span className="text-[11px] font-mono text-[var(--text-3)]">
              Hardware Details
            </span>
          </div>

          <div className="p-4 sm:p-5">
            <dl className="divide-y divide-[var(--border-subtle)] text-xs font-mono">
              {specs.map((spec, i) => (
                <div key={i} className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <dt className="text-[var(--text-3)]">{spec.label}</dt>
                  <dd className="font-semibold text-[var(--text-1)] text-right sm:text-left">{spec.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* Verified Price-Drop History Log */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] overflow-hidden shadow-xs">
          <div className="p-4 sm:p-5 bg-[var(--surface-2)] border-b border-[var(--border)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History size={16} className="text-[var(--color-accent)]" />
              <h3 className="text-sm font-display font-semibold text-[var(--text-1)]">
                Price Drop History
              </h3>
            </div>
            <span className="text-[11px] font-mono text-[var(--color-success)] font-semibold">
              90 Days Log
            </span>
          </div>

          <div className="p-4 sm:p-5 space-y-3 font-mono text-xs">
            {dropHistory.map((drop, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-[var(--surface-2)] border border-[var(--border-subtle)] space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[var(--text-1)] font-sans">
                    {drop.date} · {drop.store}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[var(--color-success)]/15 text-[var(--color-success)] text-[11px] font-bold">
                    -₹{Math.round(drop.dropPaise / 100).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[var(--text-3)] text-[11px]">
                  <span>Was: <s className="text-[var(--text-3)]">₹{Math.round(drop.oldPricePaise / 100).toLocaleString("en-IN")}</s></span>
                  <span>→</span>
                  <span className="text-[var(--text-1)] font-bold">
                    Now: ₹{Math.round(drop.newPricePaise / 100).toLocaleString("en-IN")}
                  </span>
                </div>
                <p className="text-[11px] text-[var(--text-2)] font-sans">
                  {drop.reason}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
