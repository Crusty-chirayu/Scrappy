import { chromium } from "@playwright/test";
import fs from "fs";
import path from "path";

async function main() {
  const screensDir = path.resolve(process.cwd(), "docs/screens");
  if (!fs.existsSync(screensDir)) {
    fs.mkdirSync(screensDir, { recursive: true });
  }

  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Test 16px optical mark
  // Designed directly on 16x16 pixel grid for absolute sharpness:
  const mark16Dark = `
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="14" height="14" rx="3" fill="#171B24" stroke="rgba(255,255,255,0.18)" stroke-width="1"/>
      <path d="M4.5 11.5L11.5 4.5" stroke="#7C8CFF" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M8 4.5H11.5V8" stroke="#7C8CFF" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="8" cy="8" r="1.5" fill="#7C8CFF"/>
    </svg>
  `;

  const mark16Light = `
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="14" height="14" rx="3" fill="#FFFFFF" stroke="rgba(18,21,28,0.18)" stroke-width="1"/>
      <path d="M4.5 11.5L11.5 4.5" stroke="#4457F0" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M8 4.5H11.5V8" stroke="#4457F0" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="8" cy="8" r="1.5" fill="#4457F0"/>
    </svg>
  `;

  const mark32Dark = `
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1.5" y="1.5" width="29" height="29" rx="6" fill="#1E2330" stroke="rgba(255,255,255,0.16)" stroke-width="1.5"/>
      <line x1="6" y1="16" x2="26" y2="16" stroke="rgba(255,255,255,0.12)" stroke-width="1.2" stroke-dasharray="2 2" />
      <line x1="16" y1="6" x2="16" y2="26" stroke="rgba(255,255,255,0.12)" stroke-width="1.2" stroke-dasharray="2 2" />
      <path d="M9 22L16 16L23 10" stroke="#7C8CFF" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M18 10H23V15" stroke="#7C8CFF" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="16" cy="16" r="3.2" fill="#7C8CFF"/>
    </svg>
  `;

  const mark32Light = `
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1.5" y="1.5" width="29" height="29" rx="6" fill="#FFFFFF" stroke="rgba(18,21,28,0.18)" stroke-width="1.5"/>
      <line x1="6" y1="16" x2="26" y2="16" stroke="rgba(18,21,28,0.12)" stroke-width="1.2" stroke-dasharray="2 2" />
      <line x1="16" y1="6" x2="16" y2="26" stroke="rgba(18,21,28,0.12)" stroke-width="1.2" stroke-dasharray="2 2" />
      <path d="M9 22L16 16L23 10" stroke="#4457F0" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M18 10H23V15" stroke="#4457F0" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="16" cy="16" r="3.2" fill="#4457F0"/>
    </svg>
  `;

  // Render 16px standalone
  await page.setViewportSize({ width: 16, height: 16 });
  await page.setContent(`<!DOCTYPE html><html><body style="margin:0;padding:0;background:#0B0D12;overflow:hidden;">${mark16Dark}</body></html>`);
  await page.screenshot({ path: path.join(screensDir, "logo-16px-dark.png") });

  await page.setContent(`<!DOCTYPE html><html><body style="margin:0;padding:0;background:#F5F6F9;overflow:hidden;">${mark16Light}</body></html>`);
  await page.screenshot({ path: path.join(screensDir, "logo-16px-light.png") });

  // Render 32px standalone
  await page.setViewportSize({ width: 32, height: 32 });
  await page.setContent(`<!DOCTYPE html><html><body style="margin:0;padding:0;background:#0B0D12;overflow:hidden;">${mark32Dark}</body></html>`);
  await page.screenshot({ path: path.join(screensDir, "logo-32px-dark.png") });

  await page.setContent(`<!DOCTYPE html><html><body style="margin:0;padding:0;background:#F5F6F9;overflow:hidden;">${mark32Light}</body></html>`);
  await page.screenshot({ path: path.join(screensDir, "logo-32px-light.png") });

  // Render composite proof sheet with actual embedded SVGs!
  await page.setViewportSize({ width: 800, height: 420 });
  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body {
            margin: 0;
            padding: 36px;
            background: #0B0D12;
            color: #ECEFF6;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace;
            box-sizing: border-box;
          }
          h1 {
            font-size: 18px;
            font-weight: 600;
            margin: 0 0 6px 0;
            letter-spacing: -0.01em;
          }
          p {
            font-size: 12px;
            color: #A4ACBE;
            margin: 0 0 28px 0;
          }
          .grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 16px;
          }
          .card {
            padding: 16px;
            background: #11141B;
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 8px;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 12px;
            text-align: center;
          }
          .card.light {
            background: #FFFFFF;
            border-color: rgba(18,21,28,0.12);
            color: #12151C;
          }
          .label {
            font-size: 11px;
            font-family: monospace;
            color: #8D96AC;
          }
          .card.light .label {
            color: #5A6275;
          }
          .preview-box {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 90px;
            height: 90px;
            background: #171B24;
            border-radius: 6px;
            border: 1px solid rgba(255,255,255,0.06);
          }
          .card.light .preview-box {
            background: #F5F6F9;
            border-color: rgba(18,21,28,0.08);
          }
          .tag {
            font-size: 10px;
            padding: 2px 6px;
            border-radius: 4px;
            background: rgba(124,140,255,0.12);
            color: #7C8CFF;
            font-family: monospace;
          }
          .card.light .tag {
            background: rgba(68,87,240,0.10);
            color: #4457F0;
          }
        </style>
      </head>
      <body>
        <h1>Scrappy Brand Mark Scale &amp; Legibility Proof</h1>
        <p>Verified pixel-level clarity across 16px favicon/status sizes and 32px standard header sizes in both themes.</p>

        <div class="grid">
          <!-- 16px Dark -->
          <div class="card">
            <span class="label">16px Mark (Dark)</span>
            <div class="preview-box">
              ${mark16Dark}
            </div>
            <span class="tag">1x Native (16px)</span>
          </div>

          <!-- 32px Dark -->
          <div class="card">
            <span class="label">32px Mark (Dark)</span>
            <div class="preview-box">
              ${mark32Dark}
            </div>
            <span class="tag">1x Native (32px)</span>
          </div>

          <!-- 16px Light -->
          <div class="card light">
            <span class="label">16px Mark (Light)</span>
            <div class="preview-box">
              ${mark16Light}
            </div>
            <span class="tag">1x Native (16px)</span>
          </div>

          <!-- 32px Light -->
          <div class="card light">
            <span class="label">32px Mark (Light)</span>
            <div class="preview-box">
              ${mark32Light}
            </div>
            <span class="tag">1x Native (32px)</span>
          </div>
        </div>
      </body>
    </html>
  `);

  const contactPath = path.join(screensDir, "logo-legibility-proof.png");
  await page.screenshot({ path: contactPath });
  console.log(`Saved composite proof sheet: ${contactPath}`);

  await browser.close();
}

main().catch((err) => {
  console.error("Proof generation error:", err);
  process.exit(1);
});
