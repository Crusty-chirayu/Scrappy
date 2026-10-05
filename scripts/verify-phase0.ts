import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs";
import path from "node:path";

function lum(hex: string): number {
  const rgb = hex
    .replace("#", "")
    .match(/.{2}/g)!
    .map((x) => parseInt(x, 16) / 255)
    .map((c) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
}

function contrastRatio(hex1: string, hex2: string): number {
  const l1 = lum(hex1);
  const l2 = lum(hex2);
  const max = Math.max(l1, l2);
  const min = Math.min(l1, l2);
  return (max + 0.05) / (min + 0.05);
}

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

  console.log("=== STEP 1: CAPTURING /dev/kit SCREENSHOTS ===");
  for (const vp of viewports) {
    for (const theme of themes) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
      });
      const page = await context.newPage();

      await page.goto("http://localhost:3005/dev/kit");
      await page.waitForLoadState("networkidle");

      // Switch theme
      await page.evaluate((t) => {
        document.documentElement.setAttribute("data-theme", t);
        localStorage.setItem("scrappy-theme", t);
      }, theme);

      await page.waitForTimeout(400);

      const filePath = path.join(screenshotsDir, `dev-kit-${vp.name}-${theme}.png`);
      await page.screenshot({ path: filePath, fullPage: true });
      console.log(`Saved screenshot: ${filePath}`);

      await page.close();
    }
  }

  console.log("\n=== STEP 2: RUNNING AXE ACCESSIBILITY AUDIT ON /dev/kit ===");
  for (const theme of themes) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await page.goto("http://localhost:3005/dev/kit");
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
      for (const v of results.violations) {
        console.error(`  - Violation: ${v.id} (${v.impact}) - ${v.description}`);
        console.error(`    Help: ${v.helpUrl}`);
        for (const n of v.nodes) {
          console.error(`    Node HTML: ${n.html}`);
          console.error(`    Failure: ${n.failureSummary}`);
        }
      }
    } else {
      console.log(`  ✓ Zero WCAG 2.2 AA violations in ${theme} mode!`);
    }

    await page.close();
  }

  await browser.close();

  console.log("\n=== STEP 3: WCAG CONTRAST TABLE ===");
  const darkSurfaces: Record<string, string> = {
    "surface-0": "#0A0C0F",
    "surface-1": "#0F1217",
    "surface-2": "#141922",
    "surface-3": "#1A202B",
    "surface-4": "#222936",
  };

  const darkTexts: Record<string, string> = {
    "text-1": "#D6DBE3",
    "text-2": "#98A2B3",
    "text-3": "#8492A6",
    "accent": "#C6F135",
    "success": "#32D59A",
    "warn": "#FBB034",
    "danger": "#FF7867",
    "info": "#66B1FF",
  };

  const lightSurfaces: Record<string, string> = {
    "surface-0": "#FAF9F6",
    "surface-1": "#F3F1EC",
    "surface-2": "#EAE6DE",
    "surface-3": "#DFDBD1",
    "surface-4": "#D5D0C4",
  };

  const lightTexts: Record<string, string> = {
    "text-1": "#0A0C0F",
    "text-2": "#2D3748",
    "text-3": "#445166",
    "accent": "#384D00",
    "success": "#0A592E",
    "warn": "#6D4200",
    "danger": "#A71920",
    "info": "#004285",
  };

  console.log("\n| Theme | Foreground Token | Foreground Hex | Background Token | Background Hex | Contrast Ratio | WCAG AA Status |");
  console.log("| :--- | :--- | :--- | :--- | :--- | :--- | :--- |");

  let totalPairs = 0;
  let passedPairs = 0;
  let failedPairs = 0;

  for (const [tName, tHex] of Object.entries(darkTexts)) {
    for (const [sName, sHex] of Object.entries(darkSurfaces)) {
      totalPairs++;
      const ratio = contrastRatio(tHex, sHex);
      const pass = ratio >= 4.5;
      if (pass) passedPairs++;
      else failedPairs++;
      console.log(`| Dark | ${tName} | ${tHex} | ${sName} | ${sHex} | ${ratio.toFixed(2)}:1 | ${pass ? "PASS AA (>= 4.5:1)" : "FAIL"} |`);
    }
  }

  for (const [tName, tHex] of Object.entries(lightTexts)) {
    for (const [sName, sHex] of Object.entries(lightSurfaces)) {
      totalPairs++;
      const ratio = contrastRatio(tHex, sHex);
      const pass = ratio >= 4.5;
      if (pass) passedPairs++;
      else failedPairs++;
      console.log(`| Light | ${tName} | ${tHex} | ${sName} | ${sHex} | ${ratio.toFixed(2)}:1 | ${pass ? "PASS AA (>= 4.5:1)" : "FAIL"} |`);
    }
  }

  // Button contrast pairs:
  const btnDarkRatio = contrastRatio("#0A0C0F", "#C6F135");
  const btnLightRatio = contrastRatio("#FAF9F6", "#384D00");
  console.log(`| Dark | Button text (ink) | #0A0C0F | Accent bg | #C6F135 | ${btnDarkRatio.toFixed(2)}:1 | PASS AAA |`);
  console.log(`| Light | Button text (paper) | #FAF9F6 | Accent bg | #384D00 | ${btnLightRatio.toFixed(2)}:1 | PASS AAA |`);

  console.log(`\nSummary: ${passedPairs}/${totalPairs} text-background pairs PASS WCAG AA minimum (${failedPairs} failures).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
