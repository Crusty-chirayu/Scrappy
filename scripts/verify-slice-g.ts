import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs";
import path from "node:path";

async function main() {
  const screenshotsDir = path.resolve(process.cwd(), "docs/screenshots");
  const screensDir = path.resolve(process.cwd(), "docs/screens");
  if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir, { recursive: true });
  if (!fs.existsSync(screensDir)) fs.mkdirSync(screensDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });

  const viewports = [
    { width: 360, height: 800, name: "360" },
    { width: 768, height: 1024, name: "768" },
    { width: 1440, height: 900, name: "1440" },
  ];

  const themes = ["dark", "light"] as const;

  console.log("=== STEP 1: CAPTURING WATCHLIST & ALERTS RESPONSIVE SCREENSHOTS ===");
  for (const vp of viewports) {
    for (const theme of themes) {
      // 1. Watchlist
      {
        const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
        const page = await context.newPage();
        await page.goto("http://localhost:3005/watchlist", { waitUntil: "domcontentloaded" });
        await page.waitForTimeout(400);

        await page.evaluate((t) => {
          document.documentElement.setAttribute("data-theme", t);
          localStorage.setItem("scrappy-theme", t);
        }, theme);
        await page.waitForTimeout(300);

        const filePath = path.join(screenshotsDir, `watchlist-${vp.name}-${theme}.png`);
        await page.screenshot({ path: filePath, fullPage: false });
        console.log(`Saved screenshot: ${filePath}`);

        if (vp.width === 1440) {
          const fullPath = path.join(screenshotsDir, `watchlist-full-${theme}.png`);
          await page.screenshot({ path: fullPath, fullPage: true });
        }
        await context.close();
      }

      // 2. Alerts
      {
        const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
        const page = await context.newPage();
        await page.goto("http://localhost:3005/alerts", { waitUntil: "domcontentloaded" });
        await page.waitForTimeout(400);

        await page.evaluate((t) => {
          document.documentElement.setAttribute("data-theme", t);
          localStorage.setItem("scrappy-theme", t);
        }, theme);
        await page.waitForTimeout(300);

        const filePath = path.join(screenshotsDir, `alerts-${vp.name}-${theme}.png`);
        await page.screenshot({ path: filePath, fullPage: false });
        console.log(`Saved screenshot: ${filePath}`);

        if (vp.width === 1440) {
          const fullPath = path.join(screenshotsDir, `alerts-full-${theme}.png`);
          await page.screenshot({ path: fullPath, fullPage: true });
        }
        await context.close();
      }
    }
  }

  console.log("\n=== STEP 2: VERIFYING NOTIFICATION CENTER DRAWER INTERACTION ===");
  {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await page.goto("http://localhost:3005/watchlist", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(500);

    const bellBtn = page.getByRole("button", { name: /open notifications/i }).first();
    await bellBtn.waitFor({ state: "visible" });
    await bellBtn.click();
    await page.waitForTimeout(400);

    const notifPath = path.join(screensDir, "notification-center-open.png");
    await page.screenshot({ path: notifPath });
    console.log(`Saved notification center screenshot: ${notifPath}`);

    await context.close();
  }

  console.log("\n=== STEP 3: CHECKING 360PX VIEWPORT (NO HORIZONTAL PAN) ===");
  {
    const context = await browser.newContext({ viewport: { width: 360, height: 800 } });
    const page = await context.newPage();

    // Check /watchlist
    await page.goto("http://localhost:3005/watchlist", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(400);
    const wlMetrics = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    console.log("360px Watchlist Metrics:", wlMetrics);
    if (wlMetrics.scrollWidth > 360) {
      throw new Error(`Watchlist has horizontal page overflow at 360px: ${wlMetrics.scrollWidth}`);
    }

    // Check /alerts
    await page.goto("http://localhost:3005/alerts", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(400);
    const alMetrics = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    console.log("360px Alerts Metrics:", alMetrics);
    if (alMetrics.scrollWidth > 360) {
      throw new Error(`Alerts has horizontal page overflow at 360px: ${alMetrics.scrollWidth}`);
    }
    console.log("✓ Zero horizontal pan at 360px on both /watchlist and /alerts");

    await context.close();
  }

  console.log("\n=== STEP 4: AXE ACCESSIBILITY AUDIT ON /watchlist & /alerts ===");
  for (const route of ["/watchlist", "/alerts"]) {
    for (const theme of themes) {
      const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
      const page = await context.newPage();
      await page.goto(`http://localhost:3005${route}`, { waitUntil: "domcontentloaded" });

      await page.evaluate((t) => {
        document.documentElement.setAttribute("data-theme", t);
        localStorage.setItem("scrappy-theme", t);
      }, theme);
      await page.waitForTimeout(300);

      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze();

      console.log(`[Axe ${route} ${theme.toUpperCase()}]: ${results.violations.length} violations found.`);
      if (results.violations.length > 0) {
        for (const v of results.violations) {
          console.error(`  Violation: ${v.id} (${v.impact}) - ${v.description}`);
          for (const n of v.nodes) {
            console.error(`    HTML: ${n.html}`);
          }
        }
        throw new Error(`Axe violations on ${route} (${theme})`);
      } else {
        console.log(`  ✓ Zero WCAG 2.2 AA violations on ${route} (${theme})`);
      }

      await context.close();
    }
  }

  await browser.close();
  console.log("\n=== SLICE G VERIFICATION COMPLETED SUCCESSFULLY (0 AXE VIOLATIONS) ===");
}

main().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
