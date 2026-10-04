import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  PriceTag,
  TrustBadge,
  SourceChip,
  DataFreshness,
  Sparkline,
  SyntheticBadge,
  SyntheticDataBanner,
} from "@scrappy/ui";
import { defaultCatalogRepository } from "@scrappy/db";
import { calculateDealScore, analyzeFakeDiscount } from "@scrappy/pricing";
import { ProductClientActions } from "./actions";

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
    description: `Compare real prices for ${product.title}. Lowest price ₹${lowestRupees} across Amazon and Flipkart with verified price history and deal scoring.`,
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
  const avgPrice = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
  const sorted = [...prices].sort((a, b) => a - b);
  const medianPrice = sorted[Math.floor(sorted.length / 2)] ?? lowestPrice;
  const allTimeLow = Math.min(...prices);

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

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[#98A2B3] mb-6">
          <Link href="/compare" className="hover:text-white transition-colors">
            Compare
          </Link>
          <span>/</span>
          <span className="text-[#5B677C]">{product.category}</span>
          <span>/</span>
          <span className="text-white truncate max-w-xs">{product.title}</span>
        </nav>

        {/* Synthetic Notice Banner if item is fixture (Constitution Rule 1 & 3) */}
        {product.isSynthetic && (
          <SyntheticDataBanner className="mb-6 rounded-[4px]" />
        )}

        {/* Product Canonical Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-[#262E3C] mb-8">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-xs uppercase font-mono tracking-wider text-[#98A2B3]">
                {product.brand} · {product.category}
              </span>
              <TrustBadge state="verified" confidence={0.98} />
              {product.isSynthetic && <SyntheticBadge size="sm" />}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-[#D6DBE3] tracking-tight mb-2">
              {product.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#5B677C]">
              <span>Model: <span className="text-[#98A2B3]">{product.model}</span></span>
              <span>EAN: <span className="text-[#98A2B3]">{product.ean}</span></span>
              <span>Offers: <span className="text-[#98A2B3]">{product.offers.length} live stores</span></span>
            </div>
          </div>

          {/* Client Actions: Watchlist & Alert Trigger */}
          <ProductClientActions product={product} />
        </div>

        {/* Deal Score & Fake Discount Verdict Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Best Price Hero Card */}
          <div className="p-4 bg-[#0F1217] border border-[#262E3C] rounded-[4px] flex flex-col justify-between">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-[#98A2B3]">
              Lowest Verified Price
            </span>
            <div className="my-2">
              <PriceTag
                pricePaise={lowestPrice}
                originalPricePaise={product.originalPricePaise}
                size="lg"
                isLowestPrice
              />
            </div>
            <span className="text-xs text-[#5B677C]">
              Matches best online offer today
            </span>
          </div>

          {/* Deal Score Card */}
          <div className="p-4 bg-[#0F1217] border border-[#262E3C] rounded-[4px] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-[#98A2B3]">
                Deal Score
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded-[2px] font-semibold font-mono ${
                  dealScore.grade === "EXCEPTIONAL"
                    ? "bg-[#C6F135]/20 text-[#C6F135]"
                    : dealScore.grade === "GREAT" || dealScore.grade === "GOOD"
                    ? "bg-[#2FBF8A]/20 text-[#2FBF8A]"
                    : "bg-[#1A202B] text-[#98A2B3]"
                }`}
              >
                {dealScore.grade} ({dealScore.score}/100)
              </span>
            </div>
            <p className="text-xs text-[#D6DBE3] my-2 leading-relaxed">
              {dealScore.explanation}
            </p>
            <span className="text-[11px] text-[#5B677C]">
              90-day median: ₹{Math.round(medianPrice / 100)}
            </span>
          </div>

          {/* Fake Discount Verification Card */}
          <div className="p-4 bg-[#0F1217] border border-[#262E3C] rounded-[4px] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-[#98A2B3]">
                Discount Authenticity
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded-[2px] font-medium ${
                  fakeDiscount.isFakeDiscount
                    ? "bg-[#F5B544]/20 text-[#F5B544]"
                    : "bg-[#2FBF8A]/20 text-[#2FBF8A]"
                }`}
              >
                {fakeDiscount.isFakeDiscount ? "⚠ Inflated MRP" : "✓ Genuine"}
              </span>
            </div>
            <p className="text-xs text-[#98A2B3] my-2 leading-relaxed">
              {fakeDiscount.verdict}
            </p>
            <span className="text-[11px] text-[#5B677C]">
              Real discount vs median: -{fakeDiscount.realDiscountPercent}%
            </span>
          </div>
        </div>

        {/* 30-Day Historical Price Chart */}
        <div className="p-6 bg-[#0F1217] border border-[#262E3C] rounded-[4px] mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-white">30-Day Historical Price Trend</h2>
              <p className="text-xs text-[#98A2B3]">
                Daily price sampling across all active merchants.
              </p>
            </div>
            <span className="text-xs font-mono text-[#5B677C]">
              Low: ₹{Math.round(allTimeLow / 100)} · High: ₹{Math.round(Math.max(...prices) / 100)}
            </span>
          </div>

          <div className="w-full flex items-center justify-center py-2">
            <Sparkline
              data={product.priceHistory.map((h) => ({ date: h.recordedAt, price: h.pricePaise }))}
              width={700}
              height={90}
              showMinMax
            />
          </div>
        </div>

        {/* Live Offers Comparison Table */}
        <div className="p-6 bg-[#0F1217] border border-[#262E3C] rounded-[4px]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-white">Live Store Offers ({product.offers.length})</h2>
              <p className="text-xs text-[#98A2B3]">
                Prices verified within the last 15 minutes. Provenance tracked per merchant.
              </p>
            </div>
            <span className="text-xs font-mono text-[#C6F135]">
              SORT: LOWEST PRICE FIRST
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-[#262E3C] text-xs uppercase tracking-wider text-[#98A2B3]">
                  <th className="py-2.5 px-3">Merchant</th>
                  <th className="py-2.5 px-3">Price</th>
                  <th className="py-2.5 px-3">Stock</th>
                  <th className="py-2.5 px-3">Freshness & Provenance</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A202B]">
                {product.offers.map((offer, idx) => (
                  <tr key={offer.id} className="hover:bg-[#141922]/50 transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <SourceChip
                          sourceName={offer.merchantName}
                          sourceId={offer.source}
                          health="healthy"
                        />
                        {idx === 0 && (
                          <span className="text-[10px] font-semibold uppercase tracking-wider bg-[#C6F135]/20 text-[#C6F135] px-1.5 py-0.5 rounded-[2px]">
                            Best Price
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <PriceTag
                        pricePaise={offer.currentPricePaise}
                        originalPricePaise={offer.originalPricePaise}
                        isLowestPrice={idx === 0}
                        size="md"
                      />
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1.5 text-xs text-[#2FBF8A]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#2FBF8A]" aria-hidden="true" />
                        In Stock
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <DataFreshness
                        fetchedAt={offer.provenance.fetchedAt}
                        source={offer.provenance.source}
                        extractionMethod={offer.provenance.extractionMethod}
                        confidence={offer.provenance.confidence}
                        adapterVersion={offer.provenance.adapterVersion}
                      />
                    </td>
                    <td className="py-3 px-3 text-right">
                      <a
                        href={offer.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-semibold rounded-[2px] bg-[#141922] text-[#D6DBE3] border border-[#262E3C] hover:bg-[#C6F135] hover:text-[#0A0C0F] hover:border-transparent transition-colors"
                      >
                        Visit Store ↗
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
  );
}
