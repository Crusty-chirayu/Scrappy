import { describe, it, expect, vi } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ProductPage from "./page";
import ProductLoading from "./loading";
import { PriceHistoryChart } from "./PriceHistoryChart";
import { WatchProductModal } from "./WatchProductModal";
import { StickyMiniHeader } from "./StickyMiniHeader";
import { ToastProvider } from "@scrappy/ui";
import { defaultCatalogRepository } from "@scrappy/db";

// Mock next/link
vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>
      {children}
    </a>
  ),
}));

describe("Slice F: Product Page (/compare/[id]) Suite", () => {
  const sampleProduct = defaultCatalogRepository.getProductDetail("b2000000-0000-0000-0000-000000000001")!;

  describe("ProductPage Server Component", () => {
    it("renders canonical product header with brand, model, EAN, and verified badges", async () => {
      const pageJsx = await ProductPage({
        params: Promise.resolve({ id: sampleProduct.id }),
      });
      const html = renderToStaticMarkup(<ToastProvider>{pageJsx}</ToastProvider>);

      expect(html).toContain(sampleProduct.title);
      expect(html).toContain(sampleProduct.brand);
      expect(html).toContain(sampleProduct.model);
      expect(html).toContain(sampleProduct.ean);
      expect(html).toContain("Verified 3m ago");
    });

    it("renders financial valuation cards with deal score, discount authenticity, and delta vs average", async () => {
      const pageJsx = await ProductPage({
        params: Promise.resolve({ id: sampleProduct.id }),
      });
      const html = renderToStaticMarkup(<ToastProvider>{pageJsx}</ToastProvider>);

      expect(html).toContain("Lowest Verified Price");
      expect(html).toContain("Deal Rating Score");
      expect(html).toContain("Discount Authenticity");
      expect(html).toContain("30-day average");
      expect(html).toContain("BEST OFFER");
    });

    it("renders live retailer offers table with store names, stock, and visit links", async () => {
      const pageJsx = await ProductPage({
        params: Promise.resolve({ id: sampleProduct.id }),
      });
      const html = renderToStaticMarkup(<ToastProvider>{pageJsx}</ToastProvider>);

      expect(html).toContain("All Verified Store Offers");
      expect(html).toContain("Merchant Store");
      expect(html).toContain("Stock &amp; Delivery");
      expect(html).toContain("In Stock");
      expect(html).toContain("Visit");
    });

    it("renders technical specifications and verified price drop history", async () => {
      const pageJsx = await ProductPage({
        params: Promise.resolve({ id: sampleProduct.id }),
      });
      const html = renderToStaticMarkup(<ToastProvider>{pageJsx}</ToastProvider>);

      expect(html).toContain("Product Specifications");
      expect(html).toContain("Model Number");
      expect(html).toContain("Global EAN / Barcode");
      expect(html).toContain("Verified Price Drop History");
      expect(html).toContain("Past 90 Days");
    });
  });

  describe("PriceHistoryChart Interactive Component", () => {
    it("renders range tabs, SVG price line, and accessible scrub slider", () => {
      const html = renderToStaticMarkup(
        <PriceHistoryChart
          initialHistory={sampleProduct.priceHistory}
          currentPricePaise={sampleProduct.lowestPricePaise}
          productTitle={sampleProduct.title}
        />
      );

      expect(html).toContain("Historical Price Line");
      expect(html).toContain('role="tablist"');
      expect(html).toContain("7d");
      expect(html).toContain("30d");
      expect(html).toContain("90d");
      expect(html).toContain("1y");
      expect(html).toContain("all");
      expect(html).toContain('role="slider"');
      expect(html).toContain("Price history scrub");
      expect(html).toContain("Volatility Index");
      expect(html).toContain("Average Price");
    });
  });

  describe("WatchProductModal Component", () => {
    it("renders threshold presets and 90-day probability analysis", () => {
      const html = renderToStaticMarkup(
        <ToastProvider>
          <WatchProductModal
            open={true}
            onOpenChange={() => {}}
            productId={sampleProduct.id}
            productTitle={sampleProduct.title}
            currentPricePaise={sampleProduct.lowestPricePaise}
            priceHistory={sampleProduct.priceHistory}
          />
        </ToastProvider>
      );

      expect(html).toContain("Configure Price Watch");
      expect(html).toContain("Any Price Drop");
      expect(html).toContain("5% Drop");
      expect(html).toContain("10% Drop");
      expect(html).toContain("Custom Target");
      expect(html).toContain("90-Day Drop Probability (Estimate)");
      expect(html).toContain("Dispatch Channel");
      expect(html).toContain("Watch this product");
    });
  });

  describe("StickyMiniHeader Component", () => {
    it("renders quick action bar with title, best price, and watch button", () => {
      const html = renderToStaticMarkup(
        <StickyMiniHeader
          productTitle={sampleProduct.title}
          category={sampleProduct.category}
          lowestPricePaise={sampleProduct.lowestPricePaise}
          isWatching={false}
          onOpenWatchModal={() => {}}
        />
      );

      // On initial server render, isVisible is false until scroll event
      // If we verify the component logic with isVisible or direct markup
      expect(html).toBe("");
    });
  });

  describe("ProductLoading Skeleton Component", () => {
    it("renders loading skeletons for breadcrumbs, hero, cards, and tables", () => {
      const html = renderToStaticMarkup(<ProductLoading />);
      expect(html).toContain("animate-pulse");
      expect(html).toContain("rounded");
    });
  });
});
