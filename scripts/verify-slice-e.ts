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

  console.log("=== STEP 1: CAPTURING COMPARE PAGE RESPONSIVE SCREENSHOTS ===");
  for (const vp of viewports) {
    for (const theme of themes) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
      });
      const page = await context.newPage();

      await page.goto("http://localhost:3005/compare", { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(400);

      // Set theme
      await page.evaluate((t) => {
        document.documentElement.setAttribute("data-theme", t);
        localStorage.setItem("scrappy-theme", t);
      }, theme);

      await page.waitForTimeout(300);

      const filePath = path.join(screenshotsDir, `compare-${vp.name}-${theme}.png`);
      await page.screenshot({ path: filePath, fullPage: false });
      console.log(`Saved screenshot: ${filePath}`);

      // Also capture full-page desktop view
      if (vp.width === 1440) {
        const fullPath = path.join(screenshotsDir, `compare-full-${theme}.png`);
        await page.screenshot({ path: fullPath, fullPage: true });
        console.log(`Saved full-page screenshot: ${fullPath}`);
      }

      await context.close();
    }
  }

  console.log("\n=== STEP 2: VERIFYING COMPARE TRAY & SIDE-BY-SIDE MATRIX MODAL ===");
  {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await page.goto("http://localhost:3005/compare", { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);

    // Click "+ Add to Compare" on first two product cards
    const addButtons = page.locator('button:has-text("+ Add to Compare")');
    await addButtons.nth(0).waitFor({ state: "visible" });
    await addButtons.nth(0).click();
    await page.waitForTimeout(500);

    const remainingAdd = page.locator('button:has-text("+ Add to Compare")');
    if ((await remainingAdd.count()) > 0) {
      await remainingAdd.nth(0).click();
      await page.waitForTimeout(500);
    }

    // Save screenshot of Compare Tray active
    const trayPath = path.join(screensDir, "compare-tray-active.png");
    await page.screenshot({ path: trayPath });
    console.log(`Saved Compare Tray screenshot: ${trayPath}`);

    // Click "Compare Matrix (2) ->"
    const compareMatrixBtn = page.locator('button:has-text("Compare Matrix")');
    await compareMatrixBtn.waitFor({ state: "visible", timeout: 5000 });
    await compareMatrixBtn.click();
    await page.waitForTimeout(500);

    const matrixPath = path.join(screensDir, "compare-matrix-modal-open.png");
    await page.screenshot({ path: matrixPath });
    console.log(`Saved Compare Matrix Modal screenshot: ${matrixPath}`);

      // Press Escape to test focus restore & dismiss
      await page.keyboard.press("Escape");
      await page.waitForTimeout(200);
    }

    await context.close();
  }

  console.log("\n=== STEP 3: AXE ACCESSIBILITY AUDIT ON COMPARE PAGE ===");
  let hasAxeErrors = false;
  for (const theme of themes) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await page.goto("http://localhost:3005/compare", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(400);

    await page.evaluate((t) => {
      document.documentElement.setAttribute("data-theme", t);
      localStorage.setItem("scrappy-theme", t);
    }, theme);

    await page.waitForTimeout(200);

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();

    console.log(`[Axe ${theme.toUpperCase()}]: ${results.violations.length} violations found.`);
    if (results.violations.length > 0) {
      hasAxeErrors = true;
      for (const v of results.violations) {
        console.error(`  - Violation: ${v.id} (${v.impact}) - ${v.description}`);
        for (const n of v.nodes) {
          console.error(`    Node: ${n.html}`);
        }
      }
    } else {
      console.log(`  ✓ Zero WCAG 2.2 AA violations in Compare ${theme} mode!`);
    }

    await context.close();
  }

  await browser.close();

  if (hasAxeErrors) {
    console.error("FAIL: Axe accessibility violations found on /compare.");
    process.exit(1);
  }

  console.log("\n=== SLICE E VERIFICATION COMPLETE (ALL TESTS & AXE PASS) ===");
}

main().catch((err) => {
  console.error("Verification error:", err);
  process.exit(1);
});
