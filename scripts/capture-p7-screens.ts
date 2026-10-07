import { chromium } from "@playwright/test";
import path from "node:path";
import fs from "node:fs";

async function main() {
  const screensDir = path.resolve(process.cwd(), "docs/screens/v2");
  if (!fs.existsSync(screensDir)) {
    fs.mkdirSync(screensDir, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });

  const viewports = [
    { width: 360, height: 800, name: "360" },
    { width: 1440, height: 900, name: "1440" },
  ];

  const themes = ["dark", "light"] as const;
  const routes = [
    { path: "/auth/login", name: "login" },
    { path: "/pricing", name: "pricing" },
    { path: "/status", name: "status" },
  ];

  for (const route of routes) {
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

        try {
          await page.goto(`http://localhost:3000${route.path}`, {
            waitUntil: "domcontentloaded",
            timeout: 60000,
          });
          await page.waitForTimeout(1000);

          const filePath = path.join(screensDir, `${route.name}-${vp.name}-${theme}.png`);
          await page.screenshot({ path: filePath, fullPage: false });
          console.log(`Saved: ${filePath}`);
        } catch (err) {
          console.error(`Failed ${route.path} ${vp.name} ${theme}:`, err);
        } finally {
          await context.close();
        }
      }
    }
  }

  await browser.close();
  console.log("All P7 screenshots captured successfully!");
}

main().catch(console.error);
