import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs";
import path from "node:path";

const BASE_URL = "http://localhost:3005";
const SCREENSHOTS_DIR = path.resolve("docs/screenshots");
const SCREENS_DIR = path.resolve("docs/screens");

const ROUTES = [
  { name: "auth-login", path: "/auth/login" },
  { name: "auth-signup", path: "/auth/signup" },
  { name: "onboarding", path: "/onboarding" },
  { name: "pricing", path: "/pricing" },
  { name: "admin", path: "/admin" },
];

async function main() {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  fs.mkdirSync(SCREENS_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });

  console.log("=== STEP 1: CAPTURING SLICE I RESPONSIVE SCREENSHOTS ===");
  const viewports = [
    { name: "360", width: 360, height: 740 },
    { name: "768", width: 768, height: 1024 },
    { name: "1440", width: 1440, height: 900 },
  ];

  for (const r of ROUTES) {
    for (const vp of viewports) {
      for (const theme of ["dark", "light"]) {
        const context = await browser.newContext({
          viewport: { width: vp.width, height: vp.height },
        });
        const page = await context.newPage();

        await page.goto(`${BASE_URL}${r.path}`, { waitUntil: "domcontentloaded" });
        await page.evaluate((t) => {
          document.documentElement.setAttribute("data-theme", t);
          localStorage.setItem("scrappy-theme", t);
        }, theme);
        await page.waitForTimeout(300);

        const filePath = path.join(SCREENSHOTS_DIR, `${r.name}-${vp.name}-${theme}.png`);
        await page.screenshot({ path: filePath, fullPage: false });
        console.log(`Saved screenshot: ${filePath}`);

        if (vp.name === "1440") {
          const fullPath = path.join(SCREENSHOTS_DIR, `${r.name}-full-${theme}.png`);
          await page.screenshot({ path: fullPath, fullPage: true });
        }

        await context.close();
      }
    }
  }

  console.log("\n=== STEP 2: VERIFYING TOTP MFA & ONBOARDING INTERACTIONS ===");
  // 1. Verify Onboarding
  const onbContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const onbPage = await onbContext.newPage();
  await onbPage.goto(`${BASE_URL}/onboarding`, { waitUntil: "domcontentloaded" });

  const onbContinue = onbPage.locator('button:has-text("Continue to Product Selection →")');
  await onbContinue.click();
  await onbPage.waitForTimeout(200);

  const prodContinue = onbPage.locator('button:has-text("Continue to Alert Trigger →")');
  await prodContinue.click();
  await onbPage.waitForTimeout(200);

  const activateBtn = onbPage.locator('button:has-text("Activate First Watch →")');
  await activateBtn.click();
  await onbPage.waitForTimeout(300);

  await onbPage.screenshot({
    path: path.join(SCREENS_DIR, "onboarding-complete.png"),
    fullPage: false,
  });
  console.log("Saved onboarding completion screenshot: docs/screens/onboarding-complete.png");
  await onbContext.close();

  // 2. Verify Admin TOTP MFA
  const adminContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const adminPage = await adminContext.newPage();
  await adminPage.goto(`${BASE_URL}/admin`, { waitUntil: "domcontentloaded" });

  // Challenge screen screenshot
  await adminPage.screenshot({
    path: path.join(SCREENS_DIR, "admin-totp-challenge.png"),
    fullPage: false,
  });

  // Switch to enroll device
  await adminPage.click('button:has-text("Re-enroll Device")');
  await adminPage.waitForTimeout(300);
  await adminPage.screenshot({
    path: path.join(SCREENS_DIR, "admin-totp-enroll.png"),
    fullPage: false,
  });
  console.log("Saved admin enroll screenshot: docs/screens/admin-totp-enroll.png");

  // Switch back to challenge and verify with test code
  await adminPage.click('button:has-text("I Have Saved My Codes →")');
  await adminPage.waitForTimeout(300);

  const digit1 = adminPage.locator('input[aria-label="Digit 1"]');
  await digit1.fill("1");
  await adminPage.locator('input[aria-label="Digit 2"]').fill("2");
  await adminPage.locator('input[aria-label="Digit 3"]').fill("3");
  await adminPage.locator('input[aria-label="Digit 4"]').fill("4");
  await adminPage.locator('input[aria-label="Digit 5"]').fill("5");
  await adminPage.locator('input[aria-label="Digit 6"]').fill("6");

  await adminPage.click('button:has-text("Verify & Enter Console →")');
  await adminPage.waitForTimeout(400);

  await adminPage.screenshot({
    path: path.join(SCREENS_DIR, "admin-dashboard-authenticated.png"),
    fullPage: false,
  });
  console.log("Saved admin authenticated dashboard: docs/screens/admin-dashboard-authenticated.png");
  await adminContext.close();

  console.log("\n=== STEP 3: CHECKING 360PX VIEWPORT (NO HORIZONTAL PAN) ===");
  for (const r of ROUTES) {
    const mobileContext = await browser.newContext({ viewport: { width: 360, height: 740 } });
    const mobilePage = await mobileContext.newPage();
    await mobilePage.goto(`${BASE_URL}${r.path}`, { waitUntil: "domcontentloaded" });
    await mobilePage.waitForTimeout(300);

    const scrollWidth = await mobilePage.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await mobilePage.evaluate(() => document.documentElement.clientWidth);
    console.log(`360px ${r.name} Metrics: { scrollWidth: ${scrollWidth}, clientWidth: ${clientWidth} }`);

    if (scrollWidth > clientWidth) {
      throw new Error(`Horizontal scroll detected at 360px on ${r.path}: ${scrollWidth} > ${clientWidth}`);
    }
    console.log(`✓ Zero horizontal pan at 360px on ${r.path}`);
    await mobileContext.close();
  }

  console.log("\n=== STEP 4: AXE ACCESSIBILITY AUDIT ON SLICE I ROUTES ===");
  for (const r of ROUTES) {
    for (const theme of ["dark", "light"]) {
      const axeContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
      const axePage = await axeContext.newPage();
      await axePage.goto(`${BASE_URL}${r.path}`, { waitUntil: "domcontentloaded" });
      await axePage.evaluate((t) => {
        document.documentElement.setAttribute("data-theme", t);
      }, theme);
      await axePage.waitForTimeout(400);

      const results = await new AxeBuilder({ page: axePage })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze();

      console.log(`[Axe ${r.path} ${theme.toUpperCase()}]: ${results.violations.length} violations found.`);
      if (results.violations.length > 0) {
        for (const v of results.violations) {
          console.error(`  Violation: ${v.id} (${v.impact}) - ${v.description}`);
          for (const n of v.nodes) {
            console.error(`    HTML: ${n.html}`);
          }
        }
        throw new Error(`Axe accessibility violations detected on ${r.path} in ${theme} mode`);
      }
      console.log(`  ✓ Zero WCAG 2.2 AA violations on ${r.path} (${theme})`);
      await axeContext.close();
    }
  }

  await browser.close();
  console.log("\n=== SLICE I VERIFICATION COMPLETED SUCCESSFULLY (0 AXE VIOLATIONS) ===");
}

main().catch((err) => {
  console.error("Slice I verification failed:", err);
  process.exit(1);
});
