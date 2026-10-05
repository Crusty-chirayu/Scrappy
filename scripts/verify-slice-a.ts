import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "fs";
import path from "path";

const VIEWPORTS = [
  { name: "360", width: 360, height: 800 },
  { name: "768", width: 768, height: 1024 },
  { name: "1440", width: 1440, height: 900 },
];

const ROUTES = [
  { route: "/dev/icons", prefix: "dev-icons" },
  { route: "/dev/illustrations", prefix: "dev-illustrations" },
];

const THEMES = ["dark", "light"] as const;

async function main() {
  const screenshotDir = path.resolve(process.cwd(), "docs/screenshots");
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  const browser = await chromium.launch();
  let totalViolations = 0;

  console.log("=== STEP 1: CAPTURING SLICE A SCREENSHOTS ===");

  for (const { route, prefix } of ROUTES) {
    for (const vp of VIEWPORTS) {
      for (const theme of THEMES) {
        const context = await browser.newContext({
          viewport: { width: vp.width, height: vp.height },
          colorScheme: theme,
        });
        const page = await context.newPage();

        await page.goto(`http://localhost:3005${route}`, { waitUntil: "networkidle" });
        await page.evaluate((t) => {
          document.documentElement.setAttribute("data-theme", t);
        }, theme);

        await page.waitForTimeout(400);

        const filename = `${prefix}-${vp.name}-${theme}.png`;
        const filepath = path.join(screenshotDir, filename);
        await page.screenshot({ path: filepath, fullPage: true });
        console.log(`Saved screenshot: ${filepath}`);

        await context.close();
      }
    }
  }

  console.log("\n=== STEP 2: RUNNING AXE ACCESSIBILITY AUDIT ON SLICE A ROUTES ===");

  for (const { route } of ROUTES) {
    for (const theme of THEMES) {
      const context = await browser.newContext({
        viewport: { width: 1440, height: 900 },
        colorScheme: theme,
      });
      const page = await context.newPage();
      await page.goto(`http://localhost:3005${route}`, { waitUntil: "networkidle" });
      await page.evaluate((t) => {
        document.documentElement.setAttribute("data-theme", t);
      }, theme);

      await page.waitForTimeout(400);

      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze();

      console.log(`[Axe ${route} - ${theme.toUpperCase()}]: ${results.violations.length} violations found.`);
      if (results.violations.length > 0) {
        totalViolations += results.violations.length;
        for (const v of results.violations) {
          console.error(`  - Violation: ${v.id} (${v.impact}) - ${v.description}`);
          console.error(`    Help: ${v.helpUrl}`);
          for (const n of v.nodes) {
            console.error(`    Node HTML: ${n.html}`);
            console.error(`    Failure: ${n.failureSummary}`);
          }
        }
      } else {
        console.log(`  ✓ Zero WCAG 2.2 AA violations in ${theme} mode on ${route}!`);
      }

      await context.close();
    }
  }

  await browser.close();

  if (totalViolations > 0) {
    console.error(`\nAudit failed with ${totalViolations} accessibility violations.`);
    process.exit(1);
  } else {
    console.log("\n✓ Slice A verification complete: All screenshots captured and 0 axe violations!");
  }
}

main().catch((err) => {
  console.error("Verification script error:", err);
  process.exit(1);
});
