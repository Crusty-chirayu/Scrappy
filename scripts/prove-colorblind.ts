import { chromium } from "@playwright/test";
import fs from "fs";
import path from "path";

async function main() {
  const screensDir = path.resolve(process.cwd(), "docs/screens");
  if (!fs.existsSync(screensDir)) {
    fs.mkdirSync(screensDir, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1000, height: 960 });

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8"/>
      <title>Colorblind Simulation Proof</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0A0C0F; color: #ECEFF6; padding: 32px; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 20px; }
        .card { border-radius: 10px; padding: 24px; border: 1px solid rgba(255,255,255,0.1); }
        .card-dark { background: #0B0D12; color: #ECEFF6; }
        .card-light { background: #F5F6F9; color: #12151C; }
        .title { font-size: 16px; font-weight: 700; margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between; }
        .row { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
        
        /* Primary Action Button */
        .btn-dark { background: #7C8CFF; color: #0B0D12; font-weight: 600; font-size: 14px; padding: 10px 18px; border-radius: 6px; border: none; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; }
        .btn-light { background: #4457F0; color: #FFFFFF; font-weight: 600; font-size: 14px; padding: 10px 18px; border-radius: 6px; border: none; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; }

        /* Price-Down Chip */
        .chip-down-dark { background: rgba(61, 214, 140, 0.12); color: #3DD68C; border: 1px solid rgba(61, 214, 140, 0.3); font-family: monospace; font-size: 13px; font-weight: 700; padding: 6px 12px; border-radius: 9999px; display: inline-flex; align-items: center; gap: 6px; }
        .chip-down-light { background: rgba(13, 122, 72, 0.10); color: #0D7A48; border: 1px solid rgba(13, 122, 72, 0.3); font-family: monospace; font-size: 13px; font-weight: 700; padding: 6px 12px; border-radius: 9999px; display: inline-flex; align-items: center; gap: 6px; }

        /* Price-Up Chip */
        .chip-up-dark { background: rgba(255, 107, 115, 0.12); color: #FF6B73; border: 1px solid rgba(255, 107, 115, 0.3); font-family: monospace; font-size: 13px; font-weight: 700; padding: 6px 12px; border-radius: 9999px; display: inline-flex; align-items: center; gap: 6px; }
        .chip-up-light { background: rgba(197, 40, 56, 0.10); color: #C52838; border: 1px solid rgba(197, 40, 56, 0.3); font-family: monospace; font-size: 13px; font-weight: 700; padding: 6px 12px; border-radius: 9999px; display: inline-flex; align-items: center; gap: 6px; }

        /* SVG Colorblind Filter Classes */
        .filter-normal { }
        .filter-deutan { filter: url(#deuteranopia); }
        .filter-protan { filter: url(#protanopia); }
        .tag { font-size: 12px; font-family: monospace; color: #8892B0; }
      </style>
    </head>
    <body>
      <!-- SVG Filters for Dichromacy Simulation -->
      <svg style="display:none">
        <filter id="deuteranopia">
          <feColorMatrix type="matrix" values="0.625 0.375 0 0 0  0.7 0.3 0 0 0  0 0.3 0.7 0 0  0 0 0 1 0"/>
        </filter>
        <filter id="protanopia">
          <feColorMatrix type="matrix" values="0.567 0.433 0 0 0  0.558 0.442 0 0 0  0 0.242 0.758 0 0  0 0 0 1 0"/>
        </filter>
      </svg>

      <h1 style="font-size: 24px; font-weight: 700; letter-spacing: -0.02em;">
        Scrappy Colorblind Distinctiveness Proof
      </h1>
      <p style="font-size: 14px; color: #8892B0; margin-top: 6px;">
        Proof that Accent Button, Price-Down Chip, and Price-Up Chip are distinguishable by shape, icon, and label under Deuteranopia and Protanopia.
      </p>

      <!-- 1. Normal Vision -->
      <div class="grid filter-normal">
        <div class="card card-dark">
          <div class="title"><span>Dark Theme</span> <span class="tag">Normal Vision</span></div>
          <div class="row">
            <button class="btn-dark">Compare Prices</button>
            <span class="chip-down-dark"><span>↓</span> -12% Best Price</span>
            <span class="chip-up-dark"><span>↑</span> +8% Higher</span>
          </div>
        </div>
        <div class="card card-light">
          <div class="title"><span>Light Theme</span> <span class="tag">Normal Vision</span></div>
          <div class="row">
            <button class="btn-light">Compare Prices</button>
            <span class="chip-down-light"><span>↓</span> -12% Best Price</span>
            <span class="chip-up-light"><span>↑</span> +8% Higher</span>
          </div>
        </div>
      </div>

      <!-- 2. Deuteranopia (Green Blindness) -->
      <div class="grid filter-deutan">
        <div class="card card-dark">
          <div class="title"><span>Dark Theme</span> <span class="tag">Deuteranopia (Green-Blind)</span></div>
          <div class="row">
            <button class="btn-dark">Compare Prices</button>
            <span class="chip-down-dark"><span>↓</span> -12% Best Price</span>
            <span class="chip-up-dark"><span>↑</span> +8% Higher</span>
          </div>
        </div>
        <div class="card card-light">
          <div class="title"><span>Light Theme</span> <span class="tag">Deuteranopia (Green-Blind)</span></div>
          <div class="row">
            <button class="btn-light">Compare Prices</button>
            <span class="chip-down-light"><span>↓</span> -12% Best Price</span>
            <span class="chip-up-light"><span>↑</span> +8% Higher</span>
          </div>
        </div>
      </div>

      <!-- 3. Protanopia (Red Blindness) -->
      <div class="grid filter-protan">
        <div class="card card-dark">
          <div class="title"><span>Dark Theme</span> <span class="tag">Protanopia (Red-Blind)</span></div>
          <div class="row">
            <button class="btn-dark">Compare Prices</button>
            <span class="chip-down-dark"><span>↓</span> -12% Best Price</span>
            <span class="chip-up-dark"><span>↑</span> +8% Higher</span>
          </div>
        </div>
        <div class="card card-light">
          <div class="title"><span>Light Theme</span> <span class="tag">Protanopia (Red-Blind)</span></div>
          <div class="row">
            <button class="btn-light">Compare Prices</button>
            <span class="chip-down-light"><span>↓</span> -12% Best Price</span>
            <span class="chip-up-light"><span>↑</span> +8% Higher</span>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  await page.setContent(htmlContent, { waitUntil: "load" });
  await page.waitForTimeout(300);

  const compositePath = path.join(screensDir, "colorblind-proof-composite.png");
  await page.screenshot({ path: compositePath, fullPage: true });
  console.log(`Saved composite colorblind proof: ${compositePath}`);

  await browser.close();
}

main().catch((err) => {
  console.error("Colorblind proof error:", err);
  process.exit(1);
});
