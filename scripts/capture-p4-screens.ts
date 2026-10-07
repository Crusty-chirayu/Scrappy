import { chromium } from "@playwright/test";
import path from "node:path";
import fs from "node:fs";

async function main() {
  const screensDir = path.resolve(process.cwd(), "docs/screens/v2");
  if (!fs.existsSync(screensDir)) {
    fs.mkdirSync(screensDir, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });

  const viewports = [
    { width: 360, height: 800, name: "360" },
    { width: 1440, height: 900, name: "1440" },
  ];

  const themes = ["dark", "light"] as const;

  // 1. Capture /compare
  for (const vp of viewports) {
    for (const theme of themes) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
      });
      const page = await context.newPage();

      await context.addInitScript((t) => {
        localStorage.setItem("scrappy-theme", t);
        document.documentElement.setAttribute("data-theme", t);
      }, theme);

      await page.goto("http://localhost:3000/compare", { waitUntil: "domcontentloaded", timeout: 60000 });
      await page.waitForTimeout(1500);

      const filePath = path.join(screensDir, `compare-${vp.name}-${theme}.png`);
      await page.screenshot({ path: filePath, fullPage: false });
      console.log(`Saved: ${filePath}`);

      await context.close();
    }
  }

  // 2. Capture /compare/prod_iphone_15 (Product Detail)
  for (const vp of viewports) {
    for (const theme of themes) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
      });
      const page = await context.newPage();

      await context.addInitScript((t) => {
        localStorage.setItem("scrappy-theme", t);
        document.documentElement.setAttribute("data-theme", t);
      }, theme);

      await page.goto("http://localhost:3000/compare/b2000000-0000-0000-0000-000000000001", { waitUntil: "domcontentloaded", timeout: 60000 });
      await page.waitForTimeout(1500);

      const filePath = path.join(screensDir, `product-${vp.name}-${theme}.png`);
      await page.screenshot({ path: filePath, fullPage: false });
      console.log(`Saved: ${filePath}`);

      await context.close();
    }
  }

  await browser.close();
  console.log("All P4 screenshots captured successfully!");
}

main().catch(console.error);
