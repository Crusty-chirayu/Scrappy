import { chromium } from "@playwright/test";
import fs from "node:fs";

const routes = [
  { path: "/", name: "Home" },
  { path: "/compare", name: "Search & Compare" },
  { path: "/compare/prod_101", name: "Product Detail" },
  { path: "/extract", name: "Extract" },
  { path: "/intelligence", name: "Intelligence" },
  { path: "/settings", name: "Settings" },
  { path: "/docs", name: "Docs" },
  { path: "/status", name: "Status" },
  { path: "/legal/terms", name: "Terms" },
  { path: "/legal/privacy", name: "Privacy" },
  { path: "/legal/responsible-scraping", name: "Responsible Scraping" },
  { path: "/auth/login", name: "Login" },
  { path: "/auth/signup", name: "Signup" },
];

const viewports = [
  { width: 1280, height: 800, label: "1280px" },
  { width: 360, height: 740, label: "360px" },
];

async function main() {
  const browser = await chromium.launch({ headless: true });
  const results = [];

  for (const vp of viewports) {
    for (const r of routes) {
      const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
      const consoleEvents = [];
      const pageErrors = [];
      const failedRequests = [];

      page.on("console", (msg) => {
        consoleEvents.push({
          type: msg.type(),
          text: msg.text(),
          location: msg.location(),
        });
      });

      page.on("pageerror", (err) => {
        pageErrors.push(err.toString());
      });

      page.on("requestfailed", (req) => {
        failedRequests.push({
          url: req.url(),
          failure: req.failure()?.errorText,
        });
      });

      page.on("response", (res) => {
        if (res.status() >= 400) {
          failedRequests.push({
            url: res.url(),
            status: res.status(),
          });
        }
      });

      try {
        const url = `http://localhost:3000${r.path}`;
        const res = await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
        const status = res ? res.status() : "none";
        // give React time to hydrate / log hydration warnings
        await page.waitForTimeout(1000);

        results.push({
          route: r.path,
          name: r.name,
          viewport: vp.label,
          httpStatus: status,
          consoleEvents,
          pageErrors,
          failedRequests,
        });
      } catch (err) {
        results.push({
          route: r.path,
          name: r.name,
          viewport: vp.label,
          error: err.message,
          consoleEvents,
          pageErrors,
          failedRequests,
        });
      } finally {
        await page.close();
      }
    }
  }

  await browser.close();
  fs.writeFileSync("scripts/dev-noise-raw.json", JSON.stringify(results, null, 2));
  console.log("Noise audit complete. Saved to scripts/dev-noise-raw.json");
}

main().catch(console.error);
