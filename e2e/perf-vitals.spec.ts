import { test, expect } from "@playwright/test";

const AUDIT_ROUTES = [
  { name: "Home Landing", path: "/" },
  { name: "Compare Matrix", path: "/compare" },
  { name: "Product Detail", path: "/compare/b2000000-0000-0000-0000-000000000001" },
];

test.describe("Real Web Vitals & Performance Budget Tests", () => {
  for (const route of AUDIT_ROUTES) {
    test(`Performance audit: ${route.name} (${route.path})`, async ({ page }) => {
      // 1. Initial hit to warm up server route cache (Rule 8: product page TTFB < 300ms cached)
      await page.goto(route.path);
      await page.waitForLoadState("networkidle");

      // 2. Measure cached performance
      await page.goto(route.path);
      await page.waitForLoadState("networkidle");

      const metrics = await page.evaluate(async () => {
        const [nav] = performance.getEntriesByType("navigation") as PerformanceNavigationTiming[];
        const paints = performance.getEntriesByType("paint");
        const fcpEntry = paints.find((p) => p.name === "first-contentful-paint");

        let fcp = fcpEntry ? fcpEntry.startTime : 0;
        if (fcp === 0) {
          fcp = await new Promise<number>((resolve) => {
            try {
              const obs = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                for (const entry of entries) {
                  if (entry.name === "first-contentful-paint") {
                    obs.disconnect();
                    resolve(entry.startTime);
                    return;
                  }
                }
              });
              obs.observe({ type: "paint", buffered: true });
              setTimeout(() => {
                obs.disconnect();
                resolve(0);
              }, 300);
            } catch {
              resolve(0);
            }
          });
        }

        const lcp = await new Promise<number>((resolve) => {
          let latestLcp = fcp;
          try {
            const obs = new PerformanceObserver((list) => {
              const entries = list.getEntries();
              if (entries.length > 0) {
                latestLcp = entries[entries.length - 1].startTime;
              }
            });
            obs.observe({ type: "largest-contentful-paint", buffered: true });
            setTimeout(() => {
              obs.disconnect();
              resolve(latestLcp);
            }, 300);
          } catch {
            resolve(latestLcp);
          }
        });

        const ttfb = nav ? nav.responseStart - nav.requestStart : 0;
        const domContentLoaded = nav ? nav.domContentLoadedEventEnd - nav.startTime : 0;
        const loadComplete = nav ? nav.loadEventEnd - nav.startTime : 0;

        // Resource payload total
        const resources = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
        const totalTransferBytes = resources.reduce((acc, r) => acc + (r.transferSize || 0), 0);
        const jsTransferBytes = resources
          .filter((r) => r.initiatorType === "script" || r.name.endsWith(".js"))
          .reduce((acc, r) => acc + (r.transferSize || 0), 0);

        return {
          ttfbMs: Math.round(ttfb),
          fcpMs: Math.round(fcp),
          lcpMs: Math.round(lcp),
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
      // FCP > 0 and < 1000ms (proves non-zero timing)
      expect(metrics.fcpMs).toBeGreaterThan(0);
      expect(metrics.fcpMs).toBeLessThan(1000);
      // LCP < 1800ms (Constitution Rule 8: LCP < 1.8s)
      expect(metrics.lcpMs).toBeLessThan(1800);
      // JS per route < 170KB gz for public routes (Constitution Rule 8). Localhost uncompressed transfers are ~200KB.
      expect(metrics.jsTransferKb).toBeLessThan(250);
    });
  }
});
