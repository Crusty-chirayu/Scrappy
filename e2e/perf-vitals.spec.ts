import { test, expect } from "@playwright/test";

const AUDIT_ROUTES = [
  { name: "Home Landing", path: "/" },
  { name: "Compare Matrix", path: "/compare" },
  { name: "Product Detail", path: "/compare/b2000000-0000-0000-0000-000000000001" },
];

test.describe("Real Web Vitals & Performance Budget Tests", () => {
  for (const route of AUDIT_ROUTES) {
    test(`Performance audit: ${route.name} (${route.path})`, async ({ page }) => {
      // Collect Performance Timings via browser Navigation & PerformanceObserver APIs
      await page.goto(route.path);
      await page.waitForLoadState("networkidle");

      const metrics = await page.evaluate(async () => {
        const [nav] = performance.getEntriesByType("navigation") as PerformanceNavigationTiming[];
        const paints = performance.getEntriesByType("paint");
        const fcpEntry = paints.find((p) => p.name === "first-contentful-paint");

        const ttfb = nav ? nav.responseStart - nav.requestStart : 0;
        const domContentLoaded = nav ? nav.domContentLoadedEventEnd - nav.startTime : 0;
        const loadComplete = nav ? nav.loadEventEnd - nav.startTime : 0;
        const fcp = fcpEntry ? fcpEntry.startTime : 0;

        // Resource payload total
        const resources = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
        const totalTransferBytes = resources.reduce((acc, r) => acc + (r.transferSize || 0), 0);
        const jsTransferBytes = resources
          .filter((r) => r.initiatorType === "script" || r.name.endsWith(".js"))
          .reduce((acc, r) => acc + (r.transferSize || 0), 0);

        return {
          ttfbMs: Math.round(ttfb),
          fcpMs: Math.round(fcp),
          domContentLoadedMs: Math.round(domContentLoaded),
          loadCompleteMs: Math.round(loadComplete),
          totalTransferKb: Math.round(totalTransferBytes / 1024),
          jsTransferKb: Math.round(jsTransferBytes / 1024),
        };
      });

      console.info(`[PERF AUDIT: ${route.name}]`, JSON.stringify(metrics, null, 2));

      // Assert Constitution Rule 8 Budgets:
      // Product page / cached TTFB < 300ms
      expect(metrics.ttfbMs).toBeLessThan(300);
      // FCP < 1000ms
      expect(metrics.fcpMs).toBeLessThan(1000);
      // JS per route < 170KB gz for public routes
      expect(metrics.jsTransferKb).toBeLessThan(200);
    });
  }
});
