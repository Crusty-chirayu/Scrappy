import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const PAGES = [
  { name: "home", path: "/" },
  { name: "auth-login", path: "/auth/login" },
  { name: "auth-signup", path: "/auth/signup" },
  { name: "compare", path: "/compare" },
  { name: "product-detail", path: "/compare/b2000000-0000-0000-0000-000000000001" },
  { name: "extract", path: "/extract" },
  { name: "intelligence", path: "/intelligence" },
  { name: "status", path: "/status" },
  { name: "settings", path: "/settings" },
  { name: "docs", path: "/docs" },
  { name: "legal-privacy", path: "/legal/privacy" },
  { name: "legal-terms", path: "/legal/terms" },
  { name: "legal-responsible-scraping", path: "/legal/responsible-scraping" },
];

test.describe("Visual Review & Page Screenshots", () => {
  test.beforeAll(async () => {
    const dir = path.join(process.cwd(), "docs", "screenshots");
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  for (const p of PAGES) {
    test(`Visual regression snapshot: ${p.name}`, async ({ page }, testInfo) => {
      await page.goto(p.path, { waitUntil: "domcontentloaded" });
      // Settle animations
      await page.waitForTimeout(400);

      const projectName = testInfo.project.name; // desktop-1280 or mobile-360
      const filePath = path.join(
        process.cwd(),
        "docs",
        "screenshots",
        `${p.name}-${projectName}.png`,
      );

      // Save full page PNG artifact for visual documentation
      await page.screenshot({ path: filePath, fullPage: true });

      // Run real Playwright visual regression comparison
      await expect(page).toHaveScreenshot(`${p.name}-${projectName}-diff.png`, {
        maxDiffPixelRatio: 0.05,
      });
    });
  }
});
