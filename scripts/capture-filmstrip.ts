import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

/**
 * Captures animated entrance frames at 0, 250, 600, and 1200 ms
 * and stitches them into a horizontal filmstrip SVG.
 */
async function captureFilmstrip() {
  const screensDir = path.resolve(process.cwd(), "docs/screens/v2");
  if (!fs.existsSync(screensDir)) {
    fs.mkdirSync(screensDir, { recursive: true });
  }

  const port = process.env.PORT || "3005";
  const baseUrl = `http://localhost:${port}`;
  const browser = await chromium.launch({ headless: true });
  const delays = [0, 400, 1200, 2400];
  const frames: Buffer[] = [];

  for (const ms of delays) {
    const context = await browser.newContext({
      viewport: { width: 720, height: 480 },
    });
    const page = await context.newPage();

    await page.goto(`${baseUrl}/`, { waitUntil: "domcontentloaded" });
    if (ms > 0) {
      await page.waitForTimeout(ms);
    }
    const buf = await page.screenshot({ fullPage: false });
    frames.push(buf);
    await context.close();
  }

  // Create an HTML/SVG contact filmstrip document
  const b64Frames = frames.map((f) => `data:image/png;base64,${f.toString("base64")}`);
  const filmstripHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { margin: 0; background: #07080d; font-family: monospace; color: #f4f5f8; padding: 24px; }
    h2 { margin: 0 0 16px 0; font-size: 16px; letter-spacing: 0.05em; color: #a3a9b8; }
    .strip { display: flex; gap: 16px; overflow-x: auto; }
    .frame-container { display: flex; flex-direction: column; gap: 8px; align-items: center; }
    .label { font-size: 13px; color: #6c5cff; font-weight: bold; }
    img { border: 1px solid rgba(255,255,255,0.12); border-radius: 8px; width: 340px; height: auto; }
  </style>
</head>
<body>
  <h2>MOTION FILMSTRIP: LANDING HERO ENTRANCE PROGRESSION (0, 400, 1200, 2400 ms)</h2>
  <div class="strip">
    <div class="frame-container"><span class="label">T = 0 ms</span><img src="${b64Frames[0]}" alt="0ms" /></div>
    <div class="frame-container"><span class="label">T = 400 ms</span><img src="${b64Frames[1]}" alt="400ms" /></div>
    <div class="frame-container"><span class="label">T = 1200 ms</span><img src="${b64Frames[2]}" alt="1200ms" /></div>
    <div class="frame-container"><span class="label">T = 2400 ms</span><img src="${b64Frames[3]}" alt="2400ms" /></div>
  </div>
</body>
</html>
`;

  // Render and save the filmstrip as an image
  const page = await browser.newPage({ viewport: { width: 1480, height: 420 } });
  await page.setContent(filmstripHtml);
  const filmstripPath = path.join(screensDir, "filmstrip-landing-hero.png");
  await page.screenshot({ path: filmstripPath, fullPage: true });
  console.log(`Saved filmstrip: ${filmstripPath}`);

  await browser.close();
}

captureFilmstrip().catch(console.error);
