import { test, expect } from "@playwright/test";

const ROUTES = [
  { path: "/", name: "Home" },
  { path: "/compare", name: "Search & Compare" },
  { path: "/compare/prod_101", name: "Product Detail" },
  { path: "/extract", name: "Extract" },
  { path: "/intelligence", name: "Intelligence" },
  { path: "/settings", name: "Settings" },
  { path: "/docs", name: "Docs" },
  { path: "/status", name: "Status" },
  { path: "/legal/terms", name: "Terms of Service" },
  { path: "/legal/privacy", name: "Privacy Policy" },
  { path: "/legal/responsible-scraping", name: "Responsible Scraping" },
  { path: "/auth/login", name: "Login" },
  { path: "/auth/signup", name: "Signup" },
];

const VIEWPORTS = [
  { width: 1280, height: 800, label: "desktop (1280px)" },
  { width: 360, height: 740, label: "mobile (360px)" },
];

for (const vp of VIEWPORTS) {
  test.describe(`Console and Network Cleanliness — ${vp.label}`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } });

    for (const r of ROUTES) {
      test(`route '${r.path}' (${r.name}) has zero console errors, zero warnings, and zero failed requests`, async ({
        page,
      }) => {
        const consoleIssues: string[] = [];
        const pageErrors: string[] = [];
        const failedRequests: string[] = [];

        page.on("console", (msg) => {
          const type = msg.type();
          // Filter React DevTools prompt which is standard info log
          if (type === "error" || type === "warning") {
            consoleIssues.push(`[${type}] ${msg.text()}`);
          }
        });

        page.on("pageerror", (err) => {
          pageErrors.push(err.toString());
        });

        page.on("requestfailed", (req) => {
          failedRequests.push(`${req.url()} (${req.failure()?.errorText})`);
        });

        page.on("response", (res) => {
          // Ignore external third-party tracking or benign favicon 404s if any; assert our app APIs and assets succeed
          if (res.status() >= 400 && res.url().startsWith("http://localhost:3000")) {
            failedRequests.push(`${res.url()} returned status ${res.status()}`);
          }
        });

        const res = await page.goto(`http://localhost:3000${r.path}`, {
          waitUntil: "networkidle",
          timeout: 30000,
        });

        expect(res, `Failed to load route ${r.path}`).not.toBeNull();
        expect(res!.status(), `Route ${r.path} did not return 200 OK`).toBe(200);

        // Allow hydration and asynchronous client effects to settle
        await page.waitForTimeout(500);

        expect(pageErrors, `Page errors on ${r.path} (${vp.label}):\n${pageErrors.join("\n")}`).toHaveLength(0);
        expect(failedRequests, `Failed requests on ${r.path} (${vp.label}):\n${failedRequests.join("\n")}`).toHaveLength(0);
        expect(consoleIssues, `Console errors/warnings on ${r.path} (${vp.label}):\n${consoleIssues.join("\n")}`).toHaveLength(0);
      });
    }
  });
}
