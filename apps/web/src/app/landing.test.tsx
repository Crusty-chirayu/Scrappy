import { describe, it, expect, vi } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import HomePage from "./page.js";

// Mock next/link
vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("Slice D: Landing Page (/) Test Suite", () => {
  it("renders display serif headline and plain copy without banned marketing buzzwords", () => {
    const html = renderToStaticMarkup(<HomePage />);
    expect(html).toContain("The verified graph of products, merchants, and prices.");
    expect(html).toContain("font-display");

    // Strictly enforce KILL LIST / COPY BIBLE
    const killList = [
      "seamless",
      "revolutionize",
      "revolutionary",
      "unlock the power",
      "supercharge",
      "game-changing",
      "all-in-one platform",
      "next-generation",
      "magical",
    ];
    for (const word of killList) {
      expect(html.toLowerCase()).not.toContain(word);
    }
  });

  it("renders telepathic search input with accessible labels and query chips", () => {
    const html = renderToStaticMarkup(<HomePage />);
    expect(html).toContain('aria-label="Search product or enter merchant URL"');
    expect(html).toContain("iPhone 16 Pro");
    expect(html).toContain("MacBook Air M3");
    expect(html).toContain("Sony WH-1000XM5");
    expect(html).toContain("iPad Air M2");
  });

  it("renders honest trust row and labeled sample data disclaimers", () => {
    const html = renderToStaticMarkup(<HomePage />);
    expect(html).toContain("4 verified merchant adapters active");
    expect(html).toContain("Sample data preview");
    expect(html).toContain("Amazon · Flipkart · Croma");
    expect(html).toContain("90-day recorded median");
  });

  it("renders interactive compare demo table with multi-merchant offers and deal scores", () => {
    const html = renderToStaticMarkup(<HomePage />);
    expect(html).toContain("Multi-merchant price graph with provenance");
    expect(html).toContain("Merchant Store");
    expect(html).toContain("Estimated Delivery");
    expect(html).toContain("Amazon India");
    expect(html).toContain("Croma");
    expect(html).toContain("Flipkart");
    expect(html).toContain("Lowest Price");
    expect(html).toContain("Deal Score");
  });

  it("renders 3-step workflow pipeline with sticky visual components", () => {
    const html = renderToStaticMarkup(<HomePage />);
    expect(html).toContain("1. Search &amp; Resolve");
    expect(html).toContain("2. Set Watch Threshold");
    expect(html).toContain("3. Verified Alert Dispatch");
    expect(html).toContain("Step 1: Entity Resolution");
  });

  it("renders three feature blocks with real built UI previews for Compare, Watch, and Extract", () => {
    const html = renderToStaticMarkup(<HomePage />);
    expect(html).toContain("Three lenses into web data truth");
    expect(html).toContain("Open Compare View");
    expect(html).toContain("Explore Watchlist");
    expect(html).toContain("Launch Extract Studio");
    expect(html).toContain("GET /api/v1/extract");
  });

  it("renders honest subscription tiers from real plan data", () => {
    const html = renderToStaticMarkup(<HomePage />);
    expect(html).toContain("Free");
    expect(html).toContain("₹0");
    expect(html).toContain("Pro");
    expect(html).toContain("₹999");
    expect(html).toContain("Team");
    expect(html).toContain("₹4,999");
    expect(html).toContain("20 active watches");
    expect(html).toContain("200 active watches");
    expect(html).toContain("Unlimited product watches");
  });

  it("renders FAQ accordion with real questions on provenance, freshness, and ethics", () => {
    const html = renderToStaticMarkup(<HomePage />);
    expect(html).toContain("Frequently asked questions");
    expect(html).toContain("Where does Scrappy get its price data?");
    expect(html).toContain("How fresh is the pricing information?");
    expect(html).toContain("How does Scrappy detect fake discounts?");
    expect(html).toContain("What is your policy on scraping ethics and rate limits?");
    expect(html).toContain("Can developers extract data from custom ecommerce websites?");
  });

  it("renders structured footer with product, developer, legal, and operational links", () => {
    const html = renderToStaticMarkup(<HomePage />);
    expect(html).toContain("Terms of Service");
    expect(html).toContain("Privacy Policy");
    expect(html).toContain("Scraping Ethics");
    expect(html).toContain("Security Disclosures");
    expect(html).toContain("WCAG 2.2 AA Verified");
    expect(html).toContain("Zero Fake Discounts");
  });
});
