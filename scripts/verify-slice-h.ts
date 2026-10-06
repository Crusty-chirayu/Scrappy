import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs";
import path from "node:path";

const BASE_URL = "http://localhost:3005";
const SCREENSHOTS_DIR = path.resolve("docs/screenshots");
const SCREENS_DIR = path.resolve("docs/screens");

async function run() {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  fs.mkdirSync(SCREENS_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });

  console.log("=== STEP 1: CAPTURING EXTRACT RESPONSIVE SCREENSHOTS ===");
  const viewports = [
    { name: "360", width: 360, height: 740 },
    { name: "768", width: 768, height: 1024 },
    { name: "1440", width: 1440, height: 900 },
  ];

  for (const vp of viewports) {
    for (const theme of ["dark", "light"]) {
      const page = await browser.newPage({
        viewport: { width: vp.width, height: vp.height },
      });

      await page.goto(`${BASE_URL}/extract`, { waitUntil: "domcontentloaded" });
      await page.evaluate((t) => {
        document.documentElement.setAttribute("data-theme", t);
        localStorage.setItem("scrappy-theme", t);
      }, theme);

      await page.waitForTimeout(300);

      const filePath = path.join(SCREENSHOTS_DIR, `extract-${vp.name}-${theme}.png`);
      await page.screenshot({ path: filePath, fullPage: false });
      console.log(`Saved screenshot: ${filePath}`);

      if (vp.name === "1440") {
        const fullPath = path.join(SCREENSHOTS_DIR, `extract-full-${theme}.png`);
        await page.screenshot({ path: fullPath, fullPage: true });
      }

      await page.close();
    }
  }

  console.log("\n=== STEP 2: VERIFYING 3-STEP BUILDER & SSRF REFUSAL INTERACTION ===");
  const testPage = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });
  await testPage.goto(`${BASE_URL}/extract`, { waitUntil: "domcontentloaded" });

  // 1. Initial State: Step 1
  const step1Text = await testPage.textContent("body");
  if (!step1Text?.includes("Target & Politeness")) {
    throw new Error("Step 1 header not found");
  }

  // 2. Test SSRF refusal in UI
  const urlInput = testPage.locator("#target-url-input");
  await urlInput.fill("http://169.254.169.254/latest/meta-data/");
  await testPage.waitForTimeout(200);

  const refusalBanner = testPage.locator('text=DISALLOWED SOURCE REFUSED');
  const isRefusalVisible = await refusalBanner.isVisible();
  if (!isRefusalVisible) {
    throw new Error("SSRF Disallowed Source refusal banner was not displayed!");
  }
  console.log("✓ SSRF refusal banner successfully displayed for 169.254.169.254");

  const proceedBtn = testPage.locator('button:has-text("Proceed to Schema Builder →")');
  const isProceedDisabled = await proceedBtn.isDisabled();
  if (!isProceedDisabled) {
    throw new Error("Proceed button must be disabled when disallowed URL is entered!");
  }
  console.log("✓ Proceed button is correctly disabled for disallowed target");

  // Screenshot refusal state
  await testPage.screenshot({
    path: path.join(SCREENS_DIR, "extract-disallowed-source-refusal.png"),
    fullPage: false,
  });
  console.log("Saved refusal screenshot: docs/screens/extract-disallowed-source-refusal.png");

  // 3. Restore valid URL and proceed to Step 2
  await urlInput.fill("https://store.example.com/catalog/electronics");
  await testPage.waitForTimeout(200);
  await proceedBtn.click();
  await testPage.waitForTimeout(300);

  const step2Text = await testPage.textContent("body");
  if (!step2Text?.includes("Step 2: Point-and-Select Schema Builder")) {
    throw new Error("Step 2 Schema Builder failed to open");
  }
  console.log("✓ Step 2 Schema Builder successfully reached");

  // Screenshot Step 2
  await testPage.screenshot({
    path: path.join(SCREENS_DIR, "extract-step-2-schema.png"),
    fullPage: false,
  });

  // 4. Proceed to Step 3
  const step3Btn = testPage.locator('button:has-text("Test & Verify Extraction →")');
  await step3Btn.click();
  await testPage.waitForTimeout(300);

  const step3Text = await testPage.textContent("body");
  if (!step3Text?.includes("Confidence Score")) {
    throw new Error("Step 3 Confidence test failed to open");
  }
  console.log("✓ Step 3 Live Confidence Test successfully reached");

  // Screenshot Step 3
  await testPage.screenshot({
    path: path.join(SCREENS_DIR, "extract-step-3-confidence.png"),
    fullPage: false,
  });

  await testPage.close();

  console.log("\n=== STEP 3: CHECKING 360PX VIEWPORT (NO HORIZONTAL PAN) ===");
  const mobilePage = await browser.newPage({
    viewport: { width: 360, height: 740 },
  });
  await mobilePage.goto(`${BASE_URL}/extract`, { waitUntil: "domcontentloaded" });
  await mobilePage.waitForTimeout(300);

  const scrollWidth = await mobilePage.evaluate(() => document.documentElement.scrollWidth);
  const clientWidth = await mobilePage.evaluate(() => document.documentElement.clientWidth);
  console.log(`360px Extract Metrics: { scrollWidth: ${scrollWidth}, clientWidth: ${clientWidth} }`);

  if (scrollWidth > clientWidth) {
    throw new Error(`Horizontal scroll detected at 360px on /extract: ${scrollWidth} > ${clientWidth}`);
  }
  console.log("✓ Zero horizontal pan at 360px on /extract");
  await mobilePage.close();

  console.log("\n=== STEP 4: AXE ACCESSIBILITY AUDIT ON /extract ===");
  for (const theme of ["dark", "light"]) {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    });
    const axePage = await context.newPage();
    await axePage.goto(`${BASE_URL}/extract`, { waitUntil: "domcontentloaded" });
    await axePage.evaluate((t) => {
      document.documentElement.setAttribute("data-theme", t);
    }, theme);
    await axePage.waitForTimeout(400);

    const results = await new AxeBuilder({ page: axePage })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();

    console.log(`[Axe /extract ${theme.toUpperCase()}]: ${results.violations.length} violations found.`);
    if (results.violations.length > 0) {
      console.error(JSON.stringify(results.violations, null, 2));
      throw new Error(`Axe accessibility violations detected on /extract in ${theme} mode`);
    }
    console.log(`  ✓ Zero WCAG 2.2 AA violations on /extract (${theme})`);
    await context.close();
  }

  await browser.close();
  console.log("\n=== SLICE H VERIFICATION COMPLETED SUCCESSFULLY (0 AXE VIOLATIONS) ===");
}

run().catch((err) => {
  console.error("Slice H verification failed:", err);
  process.exit(1);
});
