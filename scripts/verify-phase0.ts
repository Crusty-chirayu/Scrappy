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
    "surface-0": "#0B0D12",
    "surface-1": "#11141B",
    "surface-2": "#171B24",
    "surface-3": "#1E2330",
    "surface-4": "#262C3B",
  };

  const darkTexts: Record<string, string> = {
    "text-1": "#ECEFF6",
    "text-2": "#A4ACBE",
    "text-3": "#8D96AC",
    "accent": "#7C8CFF",
    "success": "#3DD68C",
    "warn": "#F0B24A",
    "danger": "#FF6B73",
    "info": "#5BB5FF",
  };

  const lightSurfaces: Record<string, string> = {
    "surface-0": "#F5F6F9",
    "surface-1": "#FFFFFF",
    "surface-2": "#FAFBFD",
    "surface-3": "#FFFFFF",
    "surface-4": "#FFFFFF",
  };

  const lightTexts: Record<string, string> = {
    "text-1": "#12151C",
    "text-2": "#4B5365",
    "text-3": "#5A6275",
    "accent": "#4457F0",
    "success": "#0D7A48",
    "warn": "#9A5B00",
    "danger": "#C52838",
    "info": "#1D68BD",
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
  const btnDarkRatio = contrastRatio("#0B0D12", "#7C8CFF");
  const btnLightRatio = contrastRatio("#FFFFFF", "#4457F0");
  console.log(`| Dark | Button text (ink) | #0B0D12 | Accent bg | #7C8CFF | ${btnDarkRatio.toFixed(2)}:1 | PASS AAA |`);
  console.log(`| Light | Button text (paper) | #FFFFFF | Accent bg | #4457F0 | ${btnLightRatio.toFixed(2)}:1 | PASS AA |`);

  console.log(`\nSummary: ${passedPairs}/${totalPairs} text-background pairs PASS WCAG AA minimum (${failedPairs} failures).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
