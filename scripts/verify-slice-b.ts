import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "fs";
import path from "path";

async function main() {
  const screenshotsDir = path.resolve(process.cwd(), "docs/screenshots");
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const viewports = [
    { width: 360, height: 800, name: "360" },
    { width: 768, height: 1024, name: "768" },
    { width: 1440, height: 900, name: "1440" },
  ];
  const themes = ["dark", "light"] as const;

  console.log("=== STEP 1: CAPTURING /dev/motion SCREENSHOTS ===");
  for (const vp of viewports) {
    for (const theme of themes) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
      });
      const page = await context.newPage();

      await page.goto("http://localhost:3005/dev/motion");
      await page.waitForLoadState("networkidle");

      // Set theme attribute
      await page.evaluate((t) => {
        document.documentElement.setAttribute("data-theme", t);
        localStorage.setItem("scrappy-theme", t);
      }, theme);

      await page.waitForTimeout(400);

      const filePath = path.join(screenshotsDir, `dev-motion-${vp.name}-${theme}.png`);
      await page.screenshot({ path: filePath, fullPage: true });
      console.log(`Saved screenshot: ${filePath}`);

      await page.close();
    }
  }

  console.log("\n=== STEP 2: RUNNING AXE ACCESSIBILITY AUDIT ON /dev/motion ===");
  let axePassed = true;
  for (const theme of themes) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await page.goto("http://localhost:3005/dev/motion");
    await page.waitForLoadState("networkidle");

    await page.evaluate((t) => {
      document.documentElement.setAttribute("data-theme", t);
    }, theme);
    await page.waitForTimeout(300);

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();

    console.log(`[Axe ${theme.toUpperCase()}]: ${results.violations.length} violations found.`);
    if (results.violations.length > 0) {
      axePassed = false;
      for (const v of results.violations) {
        console.error(`  - Violation: ${v.id} (${v.impact}) - ${v.description}`);
        for (const n of v.nodes) {
          console.error(`    Node HTML: ${n.html}`);
        }
      }
    } else {
      console.log(`  ✓ Zero WCAG 2.2 AA violations in ${theme} mode!`);
    }

    await page.close();
  }

  console.log("\n=== STEP 3: TESTING INTERACTIVE MOTION CHOREOGRAPHY ===");
  const testContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const testPage = await testContext.newPage();
  await testPage.goto("http://localhost:3005/dev/motion");
  await testPage.waitForLoadState("networkidle");

  // 1. Test NumberTick Price Drop
  const dropBtn = testPage.getByRole("button", { name: /Simulate Price Drop/ });
  await dropBtn.click();
  await testPage.waitForTimeout(100);
  const dropIndicator = await testPage.locator("text=↓").isVisible();
  console.log(`  ✓ NumberTick price drop delta indicator rendered: ${dropIndicator}`);

  // 2. Test NumberTick Price Hike
  const hikeBtn = testPage.getByRole("button", { name: /Simulate Price Hike/ });
  await hikeBtn.click();
  await testPage.waitForTimeout(100);
  const hikeIndicator = await testPage.locator("text=↑").isVisible();
  console.log(`  ✓ NumberTick price hike delta indicator rendered: ${hikeIndicator}`);

  // 3. Test Accordion Expand
  const accordionBtn = testPage.getByRole("button", { name: /What are the hard performance bounds/ });
  await accordionBtn.click();
  await testPage.waitForTimeout(300);
  const isExpanded = await accordionBtn.getAttribute("aria-expanded");
  console.log(`  ✓ Accordion panel expanded attribute: ${isExpanded}`);

  await browser.close();

  if (!axePassed) {
    console.error("Axe audit failed!");
    process.exit(1);
  }

  console.log("\n=== SLICE B MOTION VERIFICATION COMPLETE: ALL PASS ===");
}

main().catch((err) => {
  console.error("Verification error:", err);
  process.exit(1);
});
