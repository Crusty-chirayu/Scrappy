import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

async function main() {
  const finalDir = path.resolve(process.cwd(), "docs/screens/final");
  if (!fs.existsSync(finalDir)) {
    fs.mkdirSync(finalDir, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });

  const tasks: {
    name: string;
    route: string;
    viewport: { width: number; height: number };
    theme: "dark" | "light";
    filename: string;
  }[] = [
    // 1. Home
    { name: "home-360-dark", route: "/", viewport: { width: 360, height: 800 }, theme: "dark", filename: "01-home-360-dark.png" },
    { name: "home-1440-dark", route: "/", viewport: { width: 1440, height: 900 }, theme: "dark", filename: "02-home-1440-dark.png" },
    { name: "home-1440-light", route: "/", viewport: { width: 1440, height: 900 }, theme: "light", filename: "03-home-1440-light.png" },

    // 2. /compare
    { name: "compare-360-dark", route: "/compare", viewport: { width: 360, height: 800 }, theme: "dark", filename: "04-compare-360-dark.png" },
    { name: "compare-1440-dark", route: "/compare", viewport: { width: 1440, height: 900 }, theme: "dark", filename: "05-compare-1440-dark.png" },

    // 3. Product Page (/compare/b2000000-0000-0000-0000-000000000001)
    { name: "product-360-dark", route: "/compare/b2000000-0000-0000-0000-000000000001", viewport: { width: 360, height: 800 }, theme: "dark", filename: "06-product-360-dark.png" },
    { name: "product-1440-dark", route: "/compare/b2000000-0000-0000-0000-000000000001", viewport: { width: 1440, height: 900 }, theme: "dark", filename: "07-product-1440-dark.png" },
    { name: "product-1440-light", route: "/compare/b2000000-0000-0000-0000-000000000001", viewport: { width: 1440, height: 900 }, theme: "light", filename: "08-product-1440-light.png" },

    // 4. /intelligence
    { name: "intelligence-360-dark", route: "/intelligence", viewport: { width: 360, height: 800 }, theme: "dark", filename: "09-intelligence-360-dark.png" },
    { name: "intelligence-1440-dark", route: "/intelligence", viewport: { width: 1440, height: 900 }, theme: "dark", filename: "10-intelligence-1440-dark.png" },
  ];

  console.log(`Capturing ${tasks.length} final curated screenshots...`);

  for (const t of tasks) {
    const context = await browser.newContext({
      viewport: t.viewport,
      colorScheme: t.theme,
    });
    const page = await context.newPage();

    await page.goto(`http://localhost:3005${t.route}`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(500);

    await page.evaluate((theme) => {
      document.documentElement.setAttribute("data-theme", theme);
      localStorage.setItem("scrappy-theme", theme);
    }, t.theme);
    await page.waitForTimeout(400);

    const outPath = path.join(finalDir, t.filename);
    await page.screenshot({ path: outPath, fullPage: false });
    console.log(`Saved: ${t.filename} (${t.viewport.width}x${t.viewport.height}, ${t.theme})`);

    await context.close();
  }

  await browser.close();
  console.log("All 10 final curated screenshots captured successfully!");
}

main().catch((err) => {
  console.error("Capture failed:", err);
  process.exit(1);
});
