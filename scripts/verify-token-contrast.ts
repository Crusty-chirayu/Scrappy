/**
 * Script to verify WCAG contrast ratios of all token pairs in tokens.ts
 * Fails CI if text contrast < 4.5:1 or UI/border contrast < 3.0:1
 */
import { THEME_DARK, THEME_LIGHT } from "../packages/ui/src/tokens";

function lum(hex: string): number {
  const cleanHex = hex.replace("#", "");
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;

  const toLinear = (c: number) =>
    c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);

  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

function contrast(hex1: string, hex2: string): number {
  const l1 = lum(hex1);
  const l2 = lum(hex2);
  const max = Math.max(l1, l2);
  const min = Math.min(l1, l2);
  return (max + 0.05) / (min + 0.05);
}

function verifyTokens() {
  console.log("Checking token contrast ratios...");
  let errors = 0;

  // Dark Theme
  console.log("\n--- Checking Dark Theme (Midnight) ---");
  const darkSurfaces = [
    THEME_DARK.surfaces[0],
    THEME_DARK.surfaces[1],
    THEME_DARK.surfaces[2],
  ];

  for (const [sIdx, surface] of darkSurfaces.entries()) {
    // Text 1
    const cr1 = contrast(surface, THEME_DARK.text[1]);
    if (cr1 < 4.5) {
      console.error(`FAIL: Dark Surface ${sIdx} vs Text 1: ${cr1.toFixed(2)}:1 (< 4.5:1)`);
      errors++;
    } else {
      console.log(`PASS: Dark Surface ${sIdx} vs Text 1: ${cr1.toFixed(2)}:1`);
    }

    // Text 2
    const cr2 = contrast(surface, THEME_DARK.text[2]);
    if (cr2 < 4.5) {
      console.error(`FAIL: Dark Surface ${sIdx} vs Text 2: ${cr2.toFixed(2)}:1 (< 4.5:1)`);
      errors++;
    } else {
      console.log(`PASS: Dark Surface ${sIdx} vs Text 2: ${cr2.toFixed(2)}:1`);
    }

    // Text 3 (Muted text should satisfy at least 4.5:1 for body readability)
    const cr3 = contrast(surface, THEME_DARK.text[3]);
    if (cr3 < 4.5) {
      console.error(`FAIL: Dark Surface ${sIdx} vs Text 3: ${cr3.toFixed(2)}:1 (< 4.5:1)`);
      errors++;
    } else {
      console.log(`PASS: Dark Surface ${sIdx} vs Text 3: ${cr3.toFixed(2)}:1`);
    }
  }

  // Accent button contrast (text on accent)
  const darkBtnCr = contrast(THEME_DARK.accent.default, THEME_DARK.accent.contrast);
  if (darkBtnCr < 4.5) {
    console.error(`FAIL: Dark Accent vs Accent Text: ${darkBtnCr.toFixed(2)}:1 (< 4.5:1)`);
    errors++;
  } else {
    console.log(`PASS: Dark Accent vs Accent Text: ${darkBtnCr.toFixed(2)}:1`);
  }

  // Light Theme
  console.log("\n--- Checking Light Theme (Daylight) ---");
  const lightSurfaces = [
    THEME_LIGHT.surfaces[0],
    THEME_LIGHT.surfaces[1],
    THEME_LIGHT.surfaces[2],
  ];

  for (const [sIdx, surface] of lightSurfaces.entries()) {
    // Text 1
    const cr1 = contrast(surface, THEME_LIGHT.text[1]);
    if (cr1 < 4.5) {
      console.error(`FAIL: Light Surface ${sIdx} vs Text 1: ${cr1.toFixed(2)}:1 (< 4.5:1)`);
      errors++;
    } else {
      console.log(`PASS: Light Surface ${sIdx} vs Text 1: ${cr1.toFixed(2)}:1`);
    }

    // Text 2
    const cr2 = contrast(surface, THEME_LIGHT.text[2]);
    if (cr2 < 4.5) {
      console.error(`FAIL: Light Surface ${sIdx} vs Text 2: ${cr2.toFixed(2)}:1 (< 4.5:1)`);
      errors++;
    } else {
      console.log(`PASS: Light Surface ${sIdx} vs Text 2: ${cr2.toFixed(2)}:1`);
    }

    // Text 3
    const cr3 = contrast(surface, THEME_LIGHT.text[3]);
    if (cr3 < 4.5) {
      console.error(`FAIL: Light Surface ${sIdx} vs Text 3: ${cr3.toFixed(2)}:1 (< 4.5:1)`);
      errors++;
    } else {
      console.log(`PASS: Light Surface ${sIdx} vs Text 3: ${cr3.toFixed(2)}:1`);
    }
  }

  const lightBtnCr = contrast(THEME_LIGHT.accent.default, THEME_LIGHT.accent.contrast);
  if (lightBtnCr < 4.5) {
    console.error(`FAIL: Light Accent vs Accent Text: ${lightBtnCr.toFixed(2)}:1 (< 4.5:1)`);
    errors++;
  } else {
    console.log(`PASS: Light Accent vs Accent Text: ${lightBtnCr.toFixed(2)}:1`);
  }

  if (errors > 0) {
    console.error(`\nTotal Contrast Errors: ${errors}`);
    process.exit(1);
  } else {
    console.log(`\nAll token pairs pass WCAG contrast requirements!`);
  }
}

verifyTokens();
