import { chromium } from "@playwright/test";
import path from "node:path";

async function main() {
  const screensDir = path.resolve(process.cwd(), "docs/screens/v2");
  const browser = await chromium.launch({ headless: true });

  const viewports = [
    { width: 360, height: 800, name: "360" },
    { width: 1440, height: 900, name: "1440" },
  ];

  const themes = ["dark", "light"] as const;

  for (const vp of viewports) {
    for (const theme of themes) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
      });
      const page = await context.newPage();

      await context.addInitScript((t) => {
        localStorage.setItem("scrappy-theme", t);
        document.documentElement.setAttribute("data-theme", t);
      }, theme);

      await page.goto("http://localhost:3000/", { waitUntil: "domcontentloaded", timeout: 60000 });
      await page.waitForTimeout(2500); // allow radar animation to reach stage 4

      const filePath = path.join(screensDir, `landing-${vp.name}-${theme}.png`);
      await page.screenshot({ path: filePath, fullPage: true });
      console.log(`Saved: ${filePath}`);

      await context.close();
    }
  }

  await browser.close();
}

main().catch(console.error);
