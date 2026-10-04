import { chromium } from "@playwright/test";
import fs from "fs";
import path from "path";

const ROUTES = [
  { path: "/", name: "home" },
  { path: "/compare", name: "compare" },
  { path: "/compare/prod_101", name: "product-detail" },
  { path: "/extract", name: "extract" },
  { path: "/intelligence", name: "intelligence" },
  { path: "/settings", name: "settings" },
  { path: "/docs", name: "docs" },
  { path: "/status", name: "status" },
  { path: "/legal/terms", name: "legal-terms" },
  { path: "/legal/privacy", name: "legal-privacy" },
  { path: "/legal/responsible-scraping", name: "legal-responsible-scraping" },
  { path: "/auth/login", name: "auth-login" },
  { path: "/auth/signup", name: "auth-signup" },
];

const VIEWPORTS = [
  { width: 1280, height: 800, label: "1280px" },
  { width: 360, height: 740, label: "360px" },
];

const THEMES = ["dark", "light"];

const OUT_DIR = path.resolve(process.cwd(), "docs/screenshots");
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function run() {
  console.log(`Starting automated screenshot capture into ${OUT_DIR}...`);
  const browser = await chromium.launch({ headless: true });

  let totalCaptured = 0;

  for (const vp of VIEWPORTS) {
    for (const theme of THEMES) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        colorScheme: theme,
      });

      const page = await context.newPage();

      for (const route of ROUTES) {
        const url = `http://localhost:3000${route.path}`;
        try {
          await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
          await page.waitForTimeout(600); // allow hydration to complete

          // Apply data-theme attribute explicitly
          await page.evaluate((t) => {
            document.documentElement.setAttribute("data-theme", t);
            if (t === "light") {
              document.documentElement.classList.add("light");
            } else {
              document.documentElement.classList.remove("light");
            }
          }, theme);

          await page.waitForTimeout(400); // allow layout & theme styles to settle

          const filename = `${route.name}-${vp.label}-${theme}.png`;
          const filepath = path.join(OUT_DIR, filename);

          await page.screenshot({ path: filepath, fullPage: false });
          totalCaptured++;
          console.log(`[OK] Captured (${totalCaptured}): ${filename}`);
        } catch (err) {
          console.error(`[ERROR] Failed to capture ${url} (${vp.label}, ${theme}):`, err.message);
        }
      }

      await context.close();
    }
  }

  await browser.close();
  console.log(`Successfully completed! Total screenshots captured: ${totalCaptured}`);
}

run().catch((err) => {
  console.error("Fatal capture error:", err);
  process.exit(1);
});
