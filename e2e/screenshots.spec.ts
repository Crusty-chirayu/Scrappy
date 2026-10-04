import { test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const PAGES = [
  { name: "home", path: "/" },
  { name: "compare", path: "/compare" },
  { name: "product-detail", path: "/compare/b2000000-0000-0000-0000-000000000001" },
  { name: "extract", path: "/extract" },
  { name: "intelligence", path: "/intelligence" },
  { name: "status", path: "/status" },
  { name: "settings", path: "/settings" },
  { name: "docs", path: "/docs" },
];

test.describe("Visual Review & Page Screenshots", () => {
  test.beforeAll(async () => {
    const dir = path.join(process.cwd(), "docs", "screenshots");
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  for (const p of PAGES) {
    test(`Capture screenshot: ${p.name}`, async ({ page }, testInfo) => {
      await page.goto(p.path);
      await page.waitForLoadState("networkidle");
      // Give animations a moment to settle
      await page.waitForTimeout(300);

      const projectName = testInfo.project.name; // desktop-1280 or mobile-360
      const filePath = path.join(
        process.cwd(),
        "docs",
        "screenshots",
        `${p.name}-${projectName}.png`,
      );

      await page.screenshot({ path: filePath, fullPage: true });
    });
  }
});
