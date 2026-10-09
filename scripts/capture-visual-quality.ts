import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const SCREENS_DIR = path.join(ROOT, "docs", "screens", "v2");

async function runVisualQualityCapture() {
  if (!fs.existsSync(SCREENS_DIR)) {
    fs.mkdirSync(SCREENS_DIR, { recursive: true });
  }

  const port = process.env.PORT || "3005";
  const baseUrl = `http://localhost:${port}`;
  const browser = await chromium.launch({ headless: true });

  const routes = [
    { name: "landing", path: "/" },
    { name: "compare", path: "/compare" },
    { name: "product", path: "/compare/b2000000-0000-0000-0000-000000000001" },
    { name: "intelligence", path: "/intelligence" },
    { name: "extract", path: "/extract" },
  ];

  const viewports = [
    { label: "360", width: 360, height: 740 },
    { label: "1440", width: 1440, height: 900 },
  ];

  const themes: ("dark" | "light")[] = ["dark", "light"];

  console.log(`[visual-quality] Capturing core routes at ${baseUrl}...`);

  for (const r of routes) {
    for (const vp of viewports) {
      for (const theme of themes) {
        const filename = `${r.name}-${vp.label}-${theme}.png`;
        const outPath = path.join(SCREENS_DIR, filename);

        const context = await browser.newContext({
          viewport: { width: vp.width, height: vp.height },
          colorScheme: theme,
        });
        const page = await context.newPage();

        try {
          await page.goto(`${baseUrl}${r.path}`, { waitUntil: "domcontentloaded", timeout: 20000 });
          await page.evaluate((t) => {
            document.documentElement.setAttribute("data-theme", t);
            localStorage.setItem("scrappy-theme", t);
          }, theme);
          await page.waitForTimeout(400);

          await page.screenshot({ path: outPath, fullPage: false });
          console.log(`[visual-quality] Captured: ${filename}`);
        } catch (err) {
          console.error(`[visual-quality] Failed to capture ${filename}:`, err);
        } finally {
          await context.close();
        }
      }
    }
  }

  // Also capture the filmstrip
  const filmstripDelays = [0, 400, 1200, 2400];
  const frames: Buffer[] = [];
  for (const ms of filmstripDelays) {
    const context = await browser.newContext({ viewport: { width: 720, height: 480 } });
    const page = await context.newPage();
    try {
      await page.goto(`${baseUrl}/`, { waitUntil: "domcontentloaded" });
      if (ms > 0) await page.waitForTimeout(ms);
      frames.push(await page.screenshot({ fullPage: false }));
    } catch {
      // Ignored
    } finally {
      await context.close();
    }
  }

  if (frames.length === 4) {
    const b64 = frames.map((f) => `data:image/png;base64,${f.toString("base64")}`);
    const filmstripHtml = `
<!DOCTYPE html><html><head><style>
  body { margin: 0; background: #07080d; font-family: monospace; color: #f4f5f8; padding: 20px; }
  .strip { display: flex; gap: 12px; }
  .frame { display: flex; flex-direction: column; gap: 6px; align-items: center; }
  .lbl { font-size: 12px; color: #6c5cff; font-weight: bold; }
  img { border: 1px solid rgba(255,255,255,0.12); border-radius: 6px; width: 320px; }
</style></head><body>
  <div style="font-size:14px;font-weight:bold;margin-bottom:12px;">LANDING HERO FILMSTRIP (0, 400, 1200, 2400 ms)</div>
  <div class="strip">
    <div class="frame"><span class="lbl">T = 0 ms</span><img src="${b64[0]}" /></div>
    <div class="frame"><span class="lbl">T = 400 ms</span><img src="${b64[1]}" /></div>
    <div class="frame"><span class="lbl">T = 1200 ms</span><img src="${b64[2]}" /></div>
    <div class="frame"><span class="lbl">T = 2400 ms</span><img src="${b64[3]}" /></div>
  </div>
</body></html>`;
    const fPage = await browser.newPage({ viewport: { width: 1400, height: 380 } });
    await fPage.setContent(filmstripHtml);
    await fPage.screenshot({ path: path.join(SCREENS_DIR, "filmstrip-landing-hero.png"), fullPage: true });
    console.log("[visual-quality] Captured filmstrip-landing-hero.png");
  }

  await browser.close();
  console.log("[visual-quality] Visual quality capture finished.");
}

runVisualQualityCapture().catch((err) => {
  console.error(err);
  process.exit(1);
});
