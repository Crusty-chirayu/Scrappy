import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

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

  console.log("Capturing /dev/brand and /dev/kit...");
  for (const vp of viewports) {
    for (const theme of themes) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
      });
      const page = await context.newPage();

      // Init script to prevent hydration overwrite
      await context.addInitScript((t) => {
        localStorage.setItem("scrappy-theme", t);
        document.documentElement.setAttribute("data-theme", t);
      }, theme);

      // 1. /dev/brand
      await page.goto("http://localhost:3000/dev/brand", { waitUntil: "domcontentloaded", timeout: 60000 });
      if (theme === "light") {
        await page.click('[data-testid="theme-toggle"]');
      }
      await page.waitForTimeout(500);

      const brandPath = path.join(screensDir, `dev-brand-${vp.name}-${theme}.png`);
      await page.screenshot({ path: brandPath, fullPage: true });
      console.log(`Saved: ${brandPath}`);

      await context.close();
    }
  }

  await browser.close();
  console.log("P1 screenshots capture complete.");
}

main().catch(console.error);
