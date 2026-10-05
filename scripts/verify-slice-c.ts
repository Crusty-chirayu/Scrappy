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

  console.log("=== STEP 1: CAPTURING APP SHELL RESPONSIVE SCREENSHOTS ===");
  for (const vp of viewports) {
    for (const theme of themes) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
      });
      const page = await context.newPage();

      await page.goto("http://localhost:3005/dev/kit", { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(300);

      // Set theme
      await page.evaluate((t) => {
        document.documentElement.setAttribute("data-theme", t);
        localStorage.setItem("scrappy-theme", t);
      }, theme);

      await page.waitForTimeout(200);

      const filePath = path.join(screenshotsDir, `dev-shell-${vp.name}-${theme}.png`);
      await page.screenshot({ path: filePath, fullPage: false });
      console.log(`Saved screenshot: ${filePath}`);

      await context.close();
    }
  }

  console.log("\n=== STEP 2: VERIFYING COMMAND PALETTE (CMD+K) ===");
  {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await page.goto("http://localhost:3005/dev/kit", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(400);

    // Open command palette via trigger button
    await page.click('button[aria-label^="Open command palette"]');
    await page.waitForTimeout(400);

    // Type search query
    await page.keyboard.type("iPhone");
    await page.waitForTimeout(300);

    const palettePath = path.join(screensDir, "command-palette-open.png");
    await page.screenshot({ path: palettePath });
    console.log(`Saved Command Palette screenshot: ${palettePath}`);

    // Dismiss with Escape
    await page.keyboard.press("Escape");
    await page.waitForTimeout(200);

    await context.close();
  }

  console.log("\n=== STEP 3: VERIFYING KEYBOARD SHORTCUTS MODAL (?) ===");
  {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await page.goto("http://localhost:3005/dev/kit", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(400);

    // Trigger ? shortcut
    await page.evaluate(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "?", bubbles: true }));
    });
    await page.waitForTimeout(400);

    const shortcutsPath = path.join(screensDir, "keyboard-shortcuts-open.png");
    await page.screenshot({ path: shortcutsPath });
    console.log(`Saved Keyboard Shortcuts screenshot: ${shortcutsPath}`);

    // Dismiss with Escape
    await page.keyboard.press("Escape");
    await page.waitForTimeout(200);

    await context.close();
  }

  console.log("\n=== STEP 4: AXE ACCESSIBILITY AUDIT ON APP SHELL ===");
  for (const theme of themes) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await page.goto("http://localhost:3005/dev/kit", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(300);

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
      for (const v of results.violations) {
        console.error(`  - Violation: ${v.id} (${v.impact}) - ${v.description}`);
        for (const n of v.nodes) {
          console.error(`    Node: ${n.html}`);
        }
      }
    } else {
      console.log(`  ✓ Zero WCAG 2.2 AA violations in AppShell ${theme} mode!`);
    }

    await context.close();
  }

  await browser.close();
  console.log("\n=== SLICE C VERIFICATION COMPLETE ===");
}

main().catch((err) => {
  console.error("Verification error:", err);
  process.exit(1);
});
