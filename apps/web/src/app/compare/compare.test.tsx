import { describe, it, expect, vi } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ComparePage from "./page.js";
import { SideBySideCompareModal } from "../../components/SideBySideCompareModal.js";
import { defaultCatalogRepository } from "@scrappy/db";
import { ToastProvider } from "@scrappy/ui";

// Mock next/link
vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>
      {children}
    </a>
  ),
}));

describe("Slice E: Compare (/compare) Suite", () => {
  describe("ComparePage Component", () => {
    it("renders page header with verified provenance and sample data label", () => {
      const html = renderToStaticMarkup(
        <ToastProvider>
          <ComparePage />
        </ToastProvider>
      );
      expect(html).toContain("Compare Prices Across Verified Stores");
      expect(html).toContain("Sample data");
      expect(html).toContain("Indexed from Amazon India, Flipkart, Croma, and Reliance Digital");
    });

    it("renders sticky search toolbar with product filter input and sort dropdown", () => {
      const html = renderToStaticMarkup(
        <ToastProvider>
          <ComparePage />
        </ToastProvider>
      );
      expect(html).toContain('aria-label="Filter products by name or model"');
      expect(html).toContain("products");
      expect(html).toContain("Deal Score / Relevance");
      expect(html).toContain("Price: Low to High");
      expect(html).toContain("Price: High to Low");
    });

    it("renders desktop filter sidebar with categories, brands, and verified deal toggles", () => {
      const html = renderToStaticMarkup(
        <ToastProvider>
          <ComparePage />
        </ToastProvider>
      );
      expect(html).toContain('aria-label="Filter products"');
      expect(html).toContain("All Categories");
      expect(html).toContain("Smartphones");
      expect(html).toContain("Laptops");
      expect(html).toContain("Audio");
      expect(html).toContain("Verified Deals Only");
      expect(html).toContain("In Stock Stores Only");
    });

    it("renders indexed product cards with best price, deal score, and retailer actions", () => {
      const html = renderToStaticMarkup(
        <ToastProvider>
          <ComparePage />
        </ToastProvider>
      );
      expect(html).toContain("+ Add to Compare");
      expect(html).toContain("Watch");
      expect(html).toContain("View All Stores");
      expect(html).toContain("Inspect History");
      expect(html).toContain("EAN");
    });
  });

  describe("SideBySideCompareModal Component", () => {
    it("renders comparison matrix with sticky column and differs row highlighting", () => {
      const products = [
        defaultCatalogRepository.getProductDetail("b2000000-0000-0000-0000-000000000001")!,
        defaultCatalogRepository.getProductDetail("b2000000-0000-0000-0000-000000000002")!,
      ].filter(Boolean);

      const html = renderToStaticMarkup(
        <SideBySideCompareModal
          products={products}
          isOpen={true}
          onClose={() => {}}
          onRemoveProduct={() => {}}
        />
      );

      expect(html).toContain("Side-by-Side Product Comparison (2 of 4)");
      expect(html).toContain("Specification");
      expect(html).toContain("Best Price");
      expect(html).toContain("Model / SKU");
      expect(html).toContain("EAN / GTIN");
      expect(html).toContain("Merchants");
      expect(html).toContain("Constitution Rule 4: Distinct entities never merged silently");
    });

    it("renders dialog with modal semantics and accessible close trigger", () => {
      const products = [
        defaultCatalogRepository.getProductDetail("b2000000-0000-0000-0000-000000000001")!,
      ].filter(Boolean);

      const html = renderToStaticMarkup(
        <SideBySideCompareModal
          products={products}
          isOpen={true}
          onClose={() => {}}
          onRemoveProduct={() => {}}
        />
      );

      expect(html).toContain('role="dialog"');
      expect(html).toContain('aria-modal="true"');
      expect(html).toContain('aria-label="Close comparison modal"');
      expect(html).toContain('overflow-x-auto');
    });

    it("returns null when modal is closed or products list is empty", () => {
      const htmlClosed = renderToStaticMarkup(
        <SideBySideCompareModal
          products={[]}
          isOpen={false}
          onClose={() => {}}
          onRemoveProduct={() => {}}
        />
      );
      expect(htmlClosed).toBe("");
    });
  });
});
