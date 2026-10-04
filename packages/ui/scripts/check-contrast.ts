import { BRAND_COLORS } from "@scrappy/brand";

interface ColorPair {
  name: string;
  foreground: string;
  background: string;
  requiredRatio: number;
  type: "normal-text" | "large-text-or-ui";
}

function hexToRgb(hex: string): [number, number, number] {
  const cleanHex = hex.replace("#", "");
  const num = parseInt(cleanHex, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function channelLuminance(channel: number): number {
  const c = channel / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

export function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex);
  return 0.2126 * channelLuminance(r) + 0.7152 * channelLuminance(g) + 0.0722 * channelLuminance(b);
}

export function contrastRatio(hex1: string, hex2: string): number {
  const l1 = relativeLuminance(hex1);
  const l2 = relativeLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export function runContrastAudit(): { passed: boolean; results: Array<ColorPair & { ratio: number; pass: boolean }> } {
  const pairs: ColorPair[] = [
    // Dark mode text
    {
      name: "Dark Canvas: Primary Text",
      foreground: BRAND_COLORS.ink[100],
      background: BRAND_COLORS.ink[950],
      requiredRatio: 4.5,
      type: "normal-text",
    },
    {
      name: "Dark Surface 1: Primary Text",
      foreground: BRAND_COLORS.ink[100],
      background: BRAND_COLORS.ink[900],
      requiredRatio: 4.5,
      type: "normal-text",
    },
    {
      name: "Dark Canvas: Secondary Text",
      foreground: BRAND_COLORS.ink[300],
      background: BRAND_COLORS.ink[950],
      requiredRatio: 4.5,
      type: "normal-text",
    },
    {
      name: "Dark Surface 1: Secondary Text",
      foreground: BRAND_COLORS.ink[300],
      background: BRAND_COLORS.ink[900],
      requiredRatio: 4.5,
      type: "normal-text",
    },
    {
      name: "Signal Button: Ink on Signal Lime",
      foreground: BRAND_COLORS.ink[950],
      background: BRAND_COLORS.signal[400],
      requiredRatio: 4.5,
      type: "normal-text",
    },
    // Dark mode UI elements & large text
    {
      name: "Dark Canvas: Signal Accent (UI / Large text)",
      foreground: BRAND_COLORS.signal[400],
      background: BRAND_COLORS.ink[950],
      requiredRatio: 3.0,
      type: "large-text-or-ui",
    },
    {
      name: "Dark Canvas: Price Down Green (UI / Accent)",
      foreground: BRAND_COLORS.semantic.priceDown,
      background: BRAND_COLORS.ink[950],
      requiredRatio: 3.0,
      type: "large-text-or-ui",
    },
    {
      name: "Dark Canvas: Price Up Red (UI / Accent)",
      foreground: BRAND_COLORS.semantic.priceUp,
      background: BRAND_COLORS.ink[950],
      requiredRatio: 3.0,
      type: "large-text-or-ui",
    },
    {
      name: "Dark Canvas: Info Blue (UI / Accent)",
      foreground: BRAND_COLORS.semantic.info,
      background: BRAND_COLORS.ink[950],
      requiredRatio: 3.0,
      type: "large-text-or-ui",
    },
    {
      name: "Dark Canvas: Warn Amber (UI / Accent)",
      foreground: BRAND_COLORS.semantic.warn,
      background: BRAND_COLORS.ink[950],
      requiredRatio: 3.0,
      type: "large-text-or-ui",
    },
    // Light mode text
    {
      name: "Light Canvas: Primary Text",
      foreground: BRAND_COLORS.ink[950],
      background: BRAND_COLORS.paper[50],
      requiredRatio: 4.5,
      type: "normal-text",
    },
    {
      name: "Light Surface 1: Primary Text",
      foreground: BRAND_COLORS.ink[950],
      background: BRAND_COLORS.paper[100],
      requiredRatio: 4.5,
      type: "normal-text",
    },
    {
      name: "Light Canvas: Muted Text (ink.500)",
      foreground: BRAND_COLORS.ink[500],
      background: BRAND_COLORS.paper[50],
      requiredRatio: 4.5,
      type: "normal-text",
    },
    {
      name: "Light Canvas: Signal 600 Olive",
      foreground: BRAND_COLORS.signal[600],
      background: BRAND_COLORS.paper[50],
      requiredRatio: 4.5,
      type: "normal-text",
    },
  ];

  const results = pairs.map((pair) => {
    const ratio = Math.round(contrastRatio(pair.foreground, pair.background) * 100) / 100;
    const pass = ratio >= pair.requiredRatio;
    return { ...pair, ratio, pass };
  });

  const passed = results.every((r) => r.pass);
  return { passed, results };
}

if (process.argv[1] && process.argv[1].endsWith("check-contrast.ts")) {
  console.info("=================================================================");
  console.info("  WCAG 2.2 AA CONTRAST AUDIT (@scrappy/brand & @scrappy/ui)       ");
  console.info("=================================================================");
  const audit = runContrastAudit();

  for (const r of audit.results) {
    const mark = r.pass ? "✓ PASS" : "✗ FAIL";
    console.info(
      `  [${mark}] ${r.name.padEnd(46)} ${r.ratio}:1 (min: ${r.requiredRatio}:1) [fg: ${r.foreground} bg: ${r.background}]`,
    );
  }

  console.info("-----------------------------------------------------------------");
  if (audit.passed) {
    console.info("  ✓ ALL COLOR COMBINATIONS MEET OR EXCEED WCAG 2.2 AA THRESHOLDS.");
    console.info("=================================================================\n");
    process.exit(0);
  } else {
    console.error("  ✗ SOME COLOR COMBINATIONS FAILED WCAG 2.2 AA REQUIREMENTS.");
    console.info("=================================================================\n");
    process.exit(1);
  }
}
