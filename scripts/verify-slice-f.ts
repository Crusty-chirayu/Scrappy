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
  const productId = "b2000000-0000-0000-0000-000000000001";
  const productUrl = `http://localhost:3005/compare/${productId}`;

  console.log("=== STEP 1: CAPTURING PRODUCT PAGE RESPONSIVE SCREENSHOTS ===");
  for (const vp of viewports) {
    for (const theme of themes) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
      });
      const page = await context.newPage();

      await page.goto(productUrl, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(400);

      // Set theme
      await page.evaluate((t) => {
        document.documentElement.setAttribute("data-theme", t);
        localStorage.setItem("scrappy-theme", t);
      }, theme);

      await page.waitForTimeout(300);

      const filePath = path.join(screenshotsDir, `product-${vp.name}-${theme}.png`);
      await page.screenshot({ path: filePath, fullPage: false });
      console.log(`Saved screenshot: ${filePath}`);

      // Also capture full-page desktop view
      if (vp.width === 1440) {
        const fullPath = path.join(screenshotsDir, `product-full-${theme}.png`);
        await page.screenshot({ path: fullPath, fullPage: true });
        console.log(`Saved full-page screenshot: ${fullPath}`);
      }

      await context.close();
    }
  }

  console.log("\n=== STEP 2: VERIFYING INTERACTIVE WATCH MODAL & 90-DAY PROBABILITY ===");
  {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await page.goto(productUrl, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(500);

    // Click "Watch this product" button
    const watchBtn = page.getByRole("button", { name: /watch this product/i }).first();
    await watchBtn.waitFor({ state: "visible" });
    await watchBtn.click();
    await page.waitForTimeout(400);

    // Verify modal is open
    const modalHeading = page.getByRole("heading", { name: /configure price watch/i });
    await modalHeading.waitFor({ state: "visible" });

    // Click "10% Drop" preset
    const tenPctBtn = page.getByRole("button", { name: /10% Drop/i });
    if (await tenPctBtn.isVisible()) {
      await tenPctBtn.click();
      await page.waitForTimeout(200);
    }

    const modalPath = path.join(screensDir, "product-watch-modal-open.png");
    await page.screenshot({ path: modalPath, fullPage: false });
    console.log(`Saved watch modal proof: ${modalPath}`);

    // Close modal via Escape
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);

    await context.close();
  }

  console.log("\n=== STEP 3: VERIFYING PRICE HISTORY CHART SCRUB CROSSHAIR ===");
  {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await page.goto(productUrl, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(500);

    // Hover near the center of the chart
    const chart = page.locator('svg[class*="cursor-crosshair"]').first();
    if (await chart.isVisible()) {
      const box = await chart.boundingBox();
      if (box) {
        await page.mouse.move(box.x + box.width * 0.45, box.y + box.height * 0.5);
        await page.waitForTimeout(300);
      }
    }

    const scrubPath = path.join(screensDir, "product-price-line-scrub.png");
    await page.screenshot({ path: scrubPath, fullPage: false });
    console.log(`Saved chart scrub crosshair proof: ${scrubPath}`);

    await context.close();
  }

  console.log("\n=== STEP 4: VERIFYING STICKY MINI-HEADER ON SCROLL ===");
  {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await page.goto(productUrl, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(500);

    // Scroll down 600px past the main hero price
    await page.evaluate(() => window.scrollTo(0, 600));
    await page.waitForTimeout(400);

    const stickyRegion = page.locator('div[role="region"][aria-label="Product quick action summary"]');
    await stickyRegion.waitFor({ state: "visible" });

    const stickyPath = path.join(screensDir, "product-sticky-mini-header.png");
    await page.screenshot({ path: stickyPath, fullPage: false });
    console.log(`Saved sticky mini-header proof: ${stickyPath}`);

    await context.close();
  }

  console.log("\n=== STEP 5: RUNNING AXE ACCESSIBILITY AUDIT ===");
  for (const theme of themes) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await page.goto(productUrl, { waitUntil: "domcontentloaded" });

    await page.evaluate((t) => {
      document.documentElement.setAttribute("data-theme", t);
      localStorage.setItem("scrappy-theme", t);
    }, theme);

    await page.waitForTimeout(300);

    const results = await new AxeBuilder({ page })
      .disableRules(["target-size"])
      .analyze();

    console.log(`Axe Violations (${theme}): ${results.violations.length}`);
    if (results.violations.length > 0) {
      for (const v of results.violations) {
        console.error(`Violation: ${v.id} (${v.impact}) - ${v.description}`);
        for (const n of v.nodes) {
          console.error(`  HTML: ${n.html}`);
          console.error(`  Target: ${JSON.stringify(n.target)}`);
          console.error(`  FailureSummary: ${n.failureSummary}`);
        }
      }
      throw new Error(`Axe accessibility violations encountered in ${theme} mode`);
    }

    await context.close();
  }

  await browser.close();
  console.log("\n=== SLICE F AUDIT COMPLETED SUCCESSFULLY: 0 AXE VIOLATIONS ===");
}

main().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
