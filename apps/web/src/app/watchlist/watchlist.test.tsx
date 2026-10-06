import { describe, it, expect, vi } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import WatchlistPage from "./page";
import { ToastProvider } from "@scrappy/ui";

// Mock next/link
vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>
      {children}
    </a>
  ),
}));

describe("Slice G: Watchlist (/watchlist) Suite", () => {
  it("renders page header with intelligence eyebrow and honest sample data note", () => {
    const html = renderToStaticMarkup(
      <ToastProvider>
        <WatchlistPage />
      </ToastProvider>
    );

    expect(html).toContain("Product Watchlist");
    expect(html).toContain("Workspace Intelligence · Price Drop Tracking");
    expect(html).toContain("Sample Data Feeds");
    expect(html).toContain("Tracked Products");
  });

  it("renders summary KPI cards and filter controls", () => {
    const html = renderToStaticMarkup(
      <ToastProvider>
        <WatchlistPage />
      </ToastProvider>
    );

    expect(html).toContain("Total Tracked Products");
    expect(html).toContain("Price Drop Alerts Triggered");
    expect(html).toContain("Crawl SLA &amp; Freshness");
    expect(html).toContain("Filter watchlist...");
    expect(html).toContain("Recently Added");
  });

  it("renders dense watchlist table with products, prices, and status indicators", () => {
    const html = renderToStaticMarkup(
      <ToastProvider>
        <WatchlistPage />
      </ToastProvider>
    );

    expect(html).toContain("Tracked Product");
    expect(html).toContain("Current Best Price");
    expect(html).toContain("Target Alert Price");
    expect(html).toContain("Alert Status");
    expect(html).toContain("TRIGGERED");
    expect(html).toContain("MONITORING");
  });
});
