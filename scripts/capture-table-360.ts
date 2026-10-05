import { chromium } from "@playwright/test";
import path from "path";

async function main() {
  console.log("Launching browser for 360px table screenshot...");
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 360, height: 800 } });
  
  console.log("Navigating to http://localhost:3005/dev/kit...");
  await page.goto("http://localhost:3005/dev/kit", { waitUntil: "domcontentloaded" });
  
  console.log("Waiting for stacked table selector...");
  const table = page.locator(".scrappy-table-stacked").first();
  await table.waitFor({ state: "visible", timeout: 10000 });
  await table.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);

  const outPath = path.resolve(process.cwd(), "docs/screens/table-stacked-360.png");
  await table.screenshot({ path: outPath });
  console.log(`Saved 360px table screenshot to ${outPath}`);
  
  await browser.close();
}

main().catch((err) => {
  console.error("Screenshot error:", err);
  process.exit(1);
});
