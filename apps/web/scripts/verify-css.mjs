// verify-css.mjs — proves Tailwind CSS is applied in the browser
import { chromium } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '..', '..', '..', 'docs', 'screenshots');
fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(`[console.error] ${msg.text()}`);
    if (msg.type() === 'warning') errors.push(`[console.warn] ${msg.text()}`);
  });
  page.on('pageerror', err => errors.push(`[pageerror] ${err.message}`));

  // ---- 1280px ----
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(OUT, 'home-1280.png'), fullPage: false });

  const styles1280 = await page.evaluate(() => {
    const body = document.body;
    const link = document.querySelector('a');
    const sheets = document.querySelectorAll('link[rel="stylesheet"]').length;
    const styleEls = document.querySelectorAll('style[data-n-href], style[nonce]').length;
    return {
      bodyBg: window.getComputedStyle(body).backgroundColor,
      bodyFont: window.getComputedStyle(body).fontFamily,
      linkDecoration: link ? window.getComputedStyle(link).textDecoration : 'NO_LINK',
      bodyColor: window.getComputedStyle(body).color,
      stylesheetLinkCount: sheets,
      inlineStyleCount: styleEls,
      firstH1Text: document.querySelector('h1')?.textContent?.trim() ?? 'NO_H1',
    };
  });

  console.log('\n=== HOME 1280px COMPUTED STYLES ===');
  for (const [k, v] of Object.entries(styles1280)) console.log(`  ${k}: ${v}`);

  // ---- 360px ----
  await page.setViewportSize({ width: 360, height: 800 });
  await page.screenshot({ path: path.join(OUT, 'home-360.png'), fullPage: false });

  // ---- /compare ----
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('http://localhost:3000/compare', { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(OUT, 'compare-1280.png'), fullPage: false });

  // ---- /extract ----
  await page.goto('http://localhost:3000/extract', { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(OUT, 'extract-1280.png'), fullPage: false });

  // ---- /intelligence ----
  await page.goto('http://localhost:3000/intelligence', { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(OUT, 'intelligence-1280.png'), fullPage: false });

  console.log('\n=== CONSOLE ERRORS/WARNINGS ===');
  if (errors.length === 0) {
    console.log('  NONE');
  } else {
    errors.forEach(e => console.log(' ', e));
  }

  console.log('\n=== SCREENSHOTS SAVED TO ===');
  console.log(' ', OUT);

  await browser.close();
})();
