import { describe, it, expect, vi } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { AppShell } from "./AppShell.js";
import { Breadcrumbs } from "./Breadcrumbs.js";
import { CommandPalette } from "./CommandPalette.js";
import { KeyboardShortcuts } from "./KeyboardShortcuts.js";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/compare",
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

// Mock next/link
vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>
      {children}
    </a>
  ),
}));

describe("Slice C: App Shell, Navigation & Command Palette Suite", () => {
  describe("AppShell Component", () => {
    it("renders WCAG 2.2 AA skip link pointing to #main-content", () => {
      const html = renderToStaticMarkup(
        <AppShell>
          <div id="test-child">Child Content</div>
        </AppShell>
      );
      expect(html).toContain('href="#main-content"');
      expect(html).toContain("Skip to main content");
      expect(html).toContain('id="main-content"');
      expect(html).toContain('role="main"');
    });

    it("renders desktop sidebar with all 5 primary navigation items and shortcuts", () => {
      const html = renderToStaticMarkup(
        <AppShell>
          <div>Content</div>
        </AppShell>
      );
      expect(html).toContain('aria-label="Sidebar Navigation"');
      expect(html).toContain("Compare");
      expect(html).toContain("Watchlist");
      expect(html).toContain("Extract");
      expect(html).toContain("Alerts");
      expect(html).toContain("Settings");
      expect(html).toContain("g c");
      expect(html).toContain("g w");
      expect(html).toContain("g e");
      expect(html).toContain("g a");
      expect(html).toContain("g s");
    });

    it("renders top bar with search trigger, live data provenance, and quota meter", () => {
      const html = renderToStaticMarkup(
        <AppShell>
          <div>Content</div>
        </AppShell>
      );
      expect(html).toContain('role="banner"');
      expect(html).toContain("Live, verified 4m ago");
      expect(html).toContain("Free");
      expect(html).toContain("12/20 watches");
      expect(html).toContain("⌘K");
    });

    it("renders mobile bottom tab bar with 44px min touch targets", () => {
      const html = renderToStaticMarkup(
        <AppShell>
          <div>Content</div>
        </AppShell>
      );
      expect(html).toContain('aria-label="Mobile Navigation"');
      expect(html).toContain("min-h-[44px]");
      expect(html).toContain("env(safe-area-inset-bottom");
    });
  });

  describe("Breadcrumbs Component", () => {
    it("renders semantic breadcrumb trail with home root and aria-current on active item", () => {
      const items = [
        { label: "Electronics", href: "/compare?cat=electronics" },
        { label: "Smartphones", href: "/compare?cat=smartphones" },
        { label: "Apple iPhone 16 Pro" },
      ];
      const html = renderToStaticMarkup(<Breadcrumbs items={items} />);
      expect(html).toContain('aria-label="Breadcrumb"');
      expect(html).toContain('href="/"');
      expect(html).toContain("Home");
      expect(html).toContain("Electronics");
      expect(html).toContain("Smartphones");
      expect(html).toContain('aria-current="page"');
      expect(html).toContain("Apple iPhone 16 Pro");
    });

    it("returns null when items array is empty", () => {
      const html = renderToStaticMarkup(<Breadcrumbs items={[]} />);
      expect(html).toBe("");
    });
  });

  describe("CommandPalette Component", () => {
    it("renders accessible trigger button with keyboard hint badge", () => {
      const html = renderToStaticMarkup(<CommandPalette />);
      expect(html).toContain('aria-label="Open command palette (Press ⌘K or /)"');
      expect(html).toContain("Search or command...");
      expect(html).toContain("⌘K");
    });
  });

  describe("KeyboardShortcuts Component", () => {
    it("renders without initial open modal state when closed", () => {
      const html = renderToStaticMarkup(<KeyboardShortcuts />);
      // Dialog modal is closed by default
      expect(html).toBe("");
    });
  });
});
