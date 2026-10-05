import { chromium } from "@playwright/test";
import fs from "fs";
import path from "path";

async function main() {
  const publicDir = path.resolve(process.cwd(), "apps/web/public");
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const browser = await chromium.launch();
  const page = await browser.newPage();

  const markSvg = `
    <svg width="100%" height="100%" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="6" fill="#0A0C0F"/>
      <rect x="1.5" y="1.5" width="29" height="29" rx="4.5" stroke="#262E3C" stroke-width="1.5"/>
      <line x1="6" y1="16" x2="26" y2="16" stroke="#3E4A5E" stroke-width="1.2" stroke-dasharray="2 2"/>
      <line x1="16" y1="6" x2="16" y2="26" stroke="#3E4A5E" stroke-width="1.2" stroke-dasharray="2 2"/>
      <path d="M9 22L16 16L23 10" stroke="#C6F135" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M18 10H23V15" stroke="#C6F135" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="16" cy="16" r="3.5" fill="#C6F135"/>
    </svg>
  `;

  // Render 180x180 Apple Touch Icon
  await page.setViewportSize({ width: 180, height: 180 });
  await page.setContent(`<!DOCTYPE html><html><body style="margin:0;padding:12px;background:#0A0C0F;box-sizing:border-box;">${markSvg}</body></html>`);
  await page.screenshot({ path: path.join(publicDir, "apple-touch-icon.png") });
  console.log("Generated apple-touch-icon.png (180x180)");

  // Render 192x192 Maskable Icon
  await page.setViewportSize({ width: 192, height: 192 });
  await page.setContent(`<!DOCTYPE html><html><body style="margin:0;padding:16px;background:#0A0C0F;box-sizing:border-box;">${markSvg}</body></html>`);
  await page.screenshot({ path: path.join(publicDir, "icon-192.png") });
  console.log("Generated icon-192.png (192x192)");

  // Render 512x512 Maskable Icon
  await page.setViewportSize({ width: 512, height: 512 });
  await page.setContent(`<!DOCTYPE html><html><body style="margin:0;padding:48px;background:#0A0C0F;box-sizing:border-box;">${markSvg}</body></html>`);
  await page.screenshot({ path: path.join(publicDir, "icon-512.png") });
  console.log("Generated icon-512.png (512x512)");

  // Render 32x32 Favicon as PNG/ICO
  await page.setViewportSize({ width: 32, height: 32 });
  await page.setContent(`<!DOCTYPE html><html><body style="margin:0;padding:0;background:#0A0C0F;">${markSvg}</body></html>`);
  const faviconPngPath = path.join(publicDir, "favicon.png");
  await page.screenshot({ path: faviconPngPath, type: "png" });
  fs.copyFileSync(faviconPngPath, path.join(publicDir, "favicon.ico"));
  console.log("Generated favicon.ico (32x32)");

  // Render 1200x630 OG Image Template
  await page.setViewportSize({ width: 1200, height: 630 });
  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body {
            margin: 0;
            padding: 72px;
            background: #0A0C0F;
            color: #D6DBE3;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            height: 100vh;
            border: 1px solid #262E3C;
          }
          .header {
            display: flex;
            align-items: center;
            gap: 20px;
          }
          .title {
            font-size: 56px;
            font-weight: 700;
            letter-spacing: -0.02em;
            color: #FFFFFF;
            line-height: 1.1;
            max-width: 900px;
          }
          .subline {
            font-size: 26px;
            color: #98A2B3;
            line-height: 1.4;
            max-width: 820px;
            margin-top: 16px;
          }
          .footer {
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-top: 1px solid #262E3C;
            padding-top: 28px;
            font-family: monospace;
            font-size: 18px;
            color: #8492A6;
          }
          .badge {
            background: rgba(198, 241, 53, 0.12);
            color: #C6F135;
            border: 1px solid rgba(198, 241, 53, 0.3);
            padding: 8px 16px;
            border-radius: 4px;
            font-family: monospace;
            font-size: 16px;
            font-weight: 600;
          }
        </style>
      </head>
      <body>
        <div>
          <div class="header">
            <div style="width: 64px; height: 64px;">${markSvg}</div>
            <div style="font-family: monospace; font-size: 28px; font-weight: 700; color: #D6DBE3; letter-spacing: 0.1em;">
              SCRAPPY
            </div>
          </div>
          <div style="margin-top: 56px;">
            <div class="title">
              Precision price intelligence &amp; web extraction.
            </div>
            <div class="subline">
              Calm, verified price comparison and automated alerts across all major e-commerce sources.
            </div>
          </div>
        </div>
        <div class="footer">
          <div>scrappy.dev &bull; Provenance &bull; Integrity &bull; Speed</div>
          <div class="badge">SAMPLE DATA &bull; ZERO FAKE STATS</div>
        </div>
      </body>
    </html>
  `);
  await page.screenshot({ path: path.join(publicDir, "og-image.png") });
  console.log("Generated og-image.png (1200x630)");

  await browser.close();
  console.log("Brand assets generation complete.");
}

main().catch((err) => {
  console.error("Asset generation error:", err);
  process.exit(1);
});
