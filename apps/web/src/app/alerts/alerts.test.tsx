import { describe, it, expect, vi } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import AlertsPage from "./page";
import { ToastProvider } from "@scrappy/ui";

// Mock next/link
vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>
      {children}
    </a>
  ),
}));

describe("Slice G: Alerts (/alerts) Suite", () => {
  it("renders page header with trigger engine subtitle", () => {
    const html = renderToStaticMarkup(
      <ToastProvider>
        <AlertsPage />
      </ToastProvider>
    );

    expect(html).toContain("Price Alert Rules");
    expect(html).toContain("Intelligence Suite · Trigger Engine");
    expect(html).toContain("Real-time Evaluation");
  });

  it("renders plain-language rule composer with preview sentence and step controls", () => {
    const html = renderToStaticMarkup(
      <ToastProvider>
        <AlertsPage />
      </ToastProvider>
    );

    expect(html).toContain("Plain-Language Rule Composer");
    expect(html).toContain("Rule Preview:");
    expect(html).toContain("1. Target Product");
    expect(html).toContain("2. Drop Condition");
    expect(html).toContain("3. Merchant Scope");
    expect(html).toContain("4. Channels");
    expect(html).toContain("Activate Alert Rule");
    expect(html).toContain("Send Test Ping");
  });

  it("renders active price alert rules with target prices and status toggles", () => {
    const html = renderToStaticMarkup(
      <ToastProvider>
        <AlertsPage />
      </ToastProvider>
    );

    expect(html).toContain("Active Price Alert Rules");
    expect(html).toContain("Target Alert:");
    expect(html).toContain("Current Lowest:");
    expect(html).toContain("Distance to Trigger:");
    expect(html).toContain("ACTIVE");
  });
});
