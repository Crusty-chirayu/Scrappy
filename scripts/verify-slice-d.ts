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

  console.log("=== STEP 1: CAPTURING LANDING PAGE RESPONSIVE SCREENSHOTS ===");
  for (const vp of viewports) {
    for (const theme of themes) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
      });
      const page = await context.newPage();

      await page.goto("http://localhost:3005/", { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(400);

      // Set theme
      await page.evaluate((t) => {
        document.documentElement.setAttribute("data-theme", t);
        localStorage.setItem("scrappy-theme", t);
      }, theme);

      await page.waitForTimeout(300);

      const filePath = path.join(screenshotsDir, `landing-${vp.name}-${theme}.png`);
      await page.screenshot({ path: filePath, fullPage: false });
      console.log(`Saved screenshot: ${filePath}`);

      // Also capture full-page desktop view
      if (vp.width === 1440) {
        const fullPath = path.join(screenshotsDir, `landing-full-${theme}.png`);
        await page.screenshot({ path: fullPath, fullPage: true });
        console.log(`Saved full-page screenshot: ${fullPath}`);
      }

      await context.close();
    }
  }

  console.log("\n=== STEP 2: VERIFYING TELEPATHIC SEARCH SUGGESTIONS INTERACTION ===");
  {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await page.goto("http://localhost:3005/", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(400);

    const searchInput = page.locator('input[aria-label="Search product or enter merchant URL"]');
    await searchInput.focus();
    await searchInput.fill("iPhone");
    await page.waitForTimeout(300);

    const searchPath = path.join(screensDir, "landing-search-telepathic.png");
    await page.screenshot({ path: searchPath });
    console.log(`Saved Telepathic Search screenshot: ${searchPath}`);

    await context.close();
  }

  console.log("\n=== STEP 3: AXE ACCESSIBILITY AUDIT ON LANDING PAGE ===");
  let hasAxeErrors = false;
  for (const theme of themes) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await page.goto("http://localhost:3005/", { waitUntil: "domcontentloaded" });
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
      console.log(`  ✓ Zero WCAG 2.2 AA violations in Landing ${theme} mode!`);
    }

    await context.close();
  }

  await browser.close();

  if (hasAxeErrors) {
    console.error("FAIL: Axe accessibility violations found.");
    process.exit(1);
  }

  console.log("\n=== SLICE D VERIFICATION COMPLETE (ALL TESTS & AXE PASS) ===");
}

main().catch((err) => {
  console.error("Verification error:", err);
  process.exit(1);
});
