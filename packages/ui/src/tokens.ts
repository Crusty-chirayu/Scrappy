import { BRAND_COLORS } from "@scrappy/brand";

export const MOTION_DURATIONS = {
  instant: 80,
  fast: 140,
  base: 220,
  slow: 360,
  chart: 480,
} as const;

export const MOTION_EASINGS = {
  standard: "cubic-bezier(0.2, 0, 0, 1)",
  exit: "cubic-bezier(0.4, 0, 1, 1)",
  emphasized: "cubic-bezier(0.16, 1, 0.3, 1)",
} as const;

export const TYPOGRAPHY = {
  fonts: {
    sans: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  },
  tabularNums: {
    fontVariantNumeric: "tabular-nums",
    fontFeatureSettings: '"tnum" 1, "zero" 1',
  },
} as const;

export const THEME_TOKENS = {
  colors: BRAND_COLORS,
  durations: MOTION_DURATIONS,
  easings: MOTION_EASINGS,
  typography: TYPOGRAPHY,
  radius: {
    none: "0px",
    sm: "2px",
    md: "4px",
    lg: "6px",
    pill: "9999px",
  },
  spacing: {
    xs: "4px",
    sm: "8px",
    md: "12px",
    lg: "16px",
    xl: "24px",
    "2xl": "32px",
  },
  elevation: {
    flat: "none",
    subtle: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    surface: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)",
    floating: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)",
  },
} as const;

/**
 * Generate CSS variable declarations for injecting into root stylesheet.
 */
export function getCssVariables(): Record<string, string> {
  return {
    "--scrappy-bg": BRAND_COLORS.ink[950],
    "--scrappy-surface-1": BRAND_COLORS.ink[900],
    "--scrappy-surface-2": BRAND_COLORS.ink[850],
    "--scrappy-surface-3": BRAND_COLORS.ink[800],
    "--scrappy-border": BRAND_COLORS.ink[700],
    "--scrappy-text-primary": BRAND_COLORS.ink[100],
    "--scrappy-text-secondary": BRAND_COLORS.ink[300],
    "--scrappy-text-muted": BRAND_COLORS.ink[500],
    "--scrappy-signal": BRAND_COLORS.signal[400],
    "--scrappy-price-down": BRAND_COLORS.semantic.priceDown,
    "--scrappy-price-up": BRAND_COLORS.semantic.priceUp,
    "--scrappy-warn": BRAND_COLORS.semantic.warn,
    "--scrappy-info": BRAND_COLORS.semantic.info,
    "--scrappy-uncertain": BRAND_COLORS.semantic.uncertain,
    "--scrappy-stale": BRAND_COLORS.semantic.stale,
  };
}
