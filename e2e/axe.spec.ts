import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const PAGES = [
  { name: "Home Page", path: "/" },
  { name: "Auth Login", path: "/auth/login" },
  { name: "Auth Signup", path: "/auth/signup" },
  { name: "Compare Catalog", path: "/compare" },
  { name: "Product Detail", path: "/compare/b2000000-0000-0000-0000-000000000001" },
  { name: "Extract Studio", path: "/extract" },
  { name: "Intelligence & Alerts", path: "/intelligence" },
  { name: "System Status", path: "/status" },
  { name: "Workspace Settings", path: "/settings" },
  { name: "Documentation", path: "/docs" },
  { name: "Legal Privacy Policy", path: "/legal/privacy" },
  { name: "Legal Terms of Service", path: "/legal/terms" },
  { name: "Legal Responsible Scraping", path: "/legal/responsible-scraping" },
  { name: "Onboarding Wizard", path: "/onboarding" },
  { name: "Pricing & Plans", path: "/pricing" },
  { name: "Watchlist", path: "/watchlist" },
  { name: "Alerts", path: "/alerts" },
  { name: "404 Not Found", path: "/not-found-page-route" },
];

test.describe("WCAG 2.2 AA Accessibility Audits", () => {
  for (const theme of ["dark", "light"] as const) {
    for (const p of PAGES) {
      test(`Axe scan: ${p.name} [theme=${theme}]`, async ({ page }) => {
        test.setTimeout(60000);
        await page.goto(p.path);
        await page.waitForLoadState("domcontentloaded");
        await page.evaluate((t) => {
          document.documentElement.setAttribute("data-theme", t);
        }, theme);
        // Allow dynamic elements to hydrate
        await page.waitForTimeout(300);

        const accessibilityScanResults = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
          .disableRules(["color-contrast"])
          .analyze();

        expect(accessibilityScanResults.violations).toEqual([]);
      });
    }
  }
});
