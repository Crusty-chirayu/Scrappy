/**
 * SCRAPPY Design Tokens
 * 
 * Strict WCAG 2.2 AA compliant token architecture.
 * Dual-theme system: Ink Scale (Dark) and Paper Scale (Light).
 * 4px base spacing scale, precise elevation, motion, z-index, and typography.
 */

export const THEME_DARK = {
  surfaces: {
    0: "#0A0C0F", // Deep canvas background
    1: "#0F1217", // Primary container surface
    2: "#141922", // Elevated panel surface
    3: "#1A202B", // Card surface
    4: "#222936", // Popover, dialog, floating highlight
  },
  text: {
    1: "#D6DBE3", // Primary text (contrast: > 14:1)
    2: "#98A2B3", // Secondary text (contrast: > 7:1)
    3: "#8492A6", // Muted / tertiary text (contrast: > 4.6:1 on all surfaces)
  },
  border: {
    subtle: "#1C232F",
    default: "#262E3C",
    strong: "#3E4A5E",
    focus: "#C6F135",
  },
  accent: {
    default: "#C6F135", // Desaturated lime for comfortable dark luminescence
    hover: "#B4DD2E",
    active: "#A3CB24",
    contrast: "#0A0C0F", // Dark ink on accent (> 14:1)
  },
  semantic: {
    success: "#32D59A", // Price decrease / success (contrast: > 7.7:1)
    warn: "#FBB034",    // Caution / warning (contrast: > 7.9:1)
    danger: "#FF7867",  // Price increase / destructive (contrast: > 5.6:1)
    info: "#66B1FF",    // Information (contrast: > 6.4:1)
    priceDown: "#32D59A",
    priceUp: "#FF7867",
  },
  elevation: {
    0: "none",
    1: "0 1px 2px 0 rgba(0, 0, 0, 0.35)",
    2: "0 4px 12px 0 rgba(0, 0, 0, 0.45)",
    3: "0 8px 24px 0 rgba(0, 0, 0, 0.55)",
    4: "0 16px 40px 0 rgba(0, 0, 0, 0.65)",
  },
} as const;

export const THEME_LIGHT = {
  surfaces: {
    0: "#FAF9F6", // Warm alabaster paper canvas
    1: "#F3F1EC", // Primary paper container
    2: "#EAE6DE", // Elevated paper surface
    3: "#DFDBD1", // Card paper surface
    4: "#D5D0C4", // Popover / hover paper
  },
  text: {
    1: "#0A0C0F", // Deep charcoal ink text (contrast: > 12.7:1 on all surfaces)
    2: "#2D3748", // Slate secondary text (contrast: > 7.7:1)
    3: "#445166", // Muted paper text (contrast: > 5.2:1 on all surfaces)
  },
  border: {
    subtle: "#E5E1D7",
    default: "#D3CFC3",
    strong: "#9E988A",
    focus: "#384D00",
  },
  accent: {
    default: "#384D00", // Deep forest olive accent (contrast: > 6.1:1 on all surfaces)
    hover: "#2D3E00",
    active: "#233000",
    contrast: "#FAF9F6", // Light paper on dark accent (> 8.9:1)
  },
  semantic: {
    success: "#0A592E", // Forest green (contrast: > 5.5:1)
    warn: "#6D4200",    // Deep amber (contrast: > 5.6:1)
    danger: "#A71920",  // Deep crimson (contrast: > 4.8:1)
    info: "#004285",    // Deep navy (contrast: > 6.4:1)
    priceDown: "#0A592E",
    priceUp: "#A71920",
  },
  elevation: {
    0: "none",
    1: "0 1px 3px 0 rgba(26, 32, 43, 0.08)",
    2: "0 4px 12px 0 rgba(26, 32, 43, 0.1)",
    3: "0 10px 24px -2px rgba(26, 32, 43, 0.12)",
    4: "0 20px 40px -4px rgba(26, 32, 43, 0.16)",
  },
} as const;

export const SPACING = {
  0: "0px",
  1: "4px",
  2: "8px",
  3: "12px",
  4: "16px",
  5: "20px",
  6: "24px",
  8: "32px",
  10: "40px",
  12: "48px",
  16: "64px",
  20: "80px",
  24: "96px",
} as const;

export const RADIUS = {
  none: "0px",
  sm: "2px", // Inputs, chips, badges
  md: "4px", // Cards, buttons
  lg: "8px", // Dialogs, sheets, modals
  full: "9999px",
} as const;

export const MOTION_DURATIONS = {
  instant: "80ms",
  fast: "140ms",
  base: "220ms",
  slow: "360ms",
  chart: "480ms",
} as const;

export const MOTION_EASINGS = {
  standard: "cubic-bezier(0.2, 0, 0, 1)",
  exit: "cubic-bezier(0.4, 0, 1, 1)",
  emphasized: "cubic-bezier(0.16, 1, 0.3, 1)",
} as const;

export const Z_INDEX = {
  hide: -1,
  base: 0,
  elevate: 10,
  sticky: 100,
  drawer: 200,
  dialog: 300,
  popover: 400,
  toast: 500,
  tooltip: 600,
} as const;

export const TYPOGRAPHY = {
  fonts: {
    ui: 'var(--font-ui, Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif)',
    display: 'var(--font-display, "Instrument Serif", Georgia, serif)',
    mono: 'var(--font-mono, "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace)',
  },
  tabularNums: {
    fontVariantNumeric: "tabular-nums",
    fontFeatureSettings: '"tnum" 1, "zero" 1',
  },
  scale: {
    xs: "clamp(0.7rem, 0.66rem + 0.2vw, 0.75rem)",
    sm: "clamp(0.75rem, 0.71rem + 0.2vw, 0.8125rem)",
    base: "clamp(0.875rem, 0.83rem + 0.2vw, 0.9375rem)",
    md: "clamp(0.9375rem, 0.89rem + 0.25vw, 1rem)",
    lg: "clamp(1.0625rem, 1rem + 0.3vw, 1.1875rem)",
    xl: "clamp(1.25rem, 1.15rem + 0.5vw, 1.5rem)",
    "2xl": "clamp(1.5rem, 1.35rem + 0.75vw, 1.875rem)",
    "3xl": "clamp(1.875rem, 1.6rem + 1.2vw, 2.375rem)",
    "4xl": "clamp(2.25rem, 1.9rem + 1.6vw, 3rem)",
    "5xl": "clamp(2.75rem, 2.2rem + 2.5vw, 4rem)",
  },
} as const;

/**
 * Returns CSS variable mappings for runtime styling or server-side injection.
 */
export function getCssVariables(theme: "dark" | "light" = "dark"): Record<string, string> {
  const t = theme === "dark" ? THEME_DARK : THEME_LIGHT;
  return {
    "--surface-0": t.surfaces[0],
    "--surface-1": t.surfaces[1],
    "--surface-2": t.surfaces[2],
    "--surface-3": t.surfaces[3],
    "--surface-4": t.surfaces[4],
    "--text-1": t.text[1],
    "--text-2": t.text[2],
    "--text-3": t.text[3],
    "--border-subtle": t.border.subtle,
    "--border": t.border.default,
    "--border-strong": t.border.strong,
    "--border-focus": t.border.focus,
    "--color-accent": t.accent.default,
    "--color-accent-hover": t.accent.hover,
    "--color-accent-active": t.accent.active,
    "--color-accent-contrast": t.accent.contrast,
    "--color-success": t.semantic.success,
    "--color-warn": t.semantic.warn,
    "--color-danger": t.semantic.danger,
    "--color-info": t.semantic.info,
    "--color-price-down": t.semantic.priceDown,
    "--color-price-up": t.semantic.priceUp,
    "--elevation-0": t.elevation[0],
    "--elevation-1": t.elevation[1],
    "--elevation-2": t.elevation[2],
    "--elevation-3": t.elevation[3],
    "--elevation-4": t.elevation[4],
  };
}

// Backwards-compatible THEME_TOKENS export for existing packages
export const THEME_TOKENS = {
  colors: {
    ink: {
      950: THEME_DARK.surfaces[0],
      900: THEME_DARK.surfaces[1],
      850: THEME_DARK.surfaces[2],
      800: THEME_DARK.surfaces[3],
      700: THEME_DARK.border.default,
      500: THEME_DARK.text[3],
      300: THEME_DARK.text[2],
      100: THEME_DARK.text[1],
    },
    paper: {
      50: THEME_LIGHT.surfaces[0],
      100: THEME_LIGHT.surfaces[1],
      200: THEME_LIGHT.surfaces[2],
      300: THEME_LIGHT.border.default,
    },
    signal: {
      400: THEME_DARK.accent.default,
      600: THEME_LIGHT.accent.default,
      ink: "#0A0C0F",
    },
    semantic: {
      priceDown: THEME_DARK.semantic.priceDown,
      priceUp: THEME_DARK.semantic.priceUp,
      warn: THEME_DARK.semantic.warn,
      info: THEME_DARK.semantic.info,
      stale: "#8492A6",
      uncertain: "#9A7BFF",
    },
  },
  durations: MOTION_DURATIONS,
  easings: MOTION_EASINGS,
  typography: TYPOGRAPHY,
  radius: RADIUS,
  spacing: SPACING,
  elevation: THEME_DARK.elevation,
  zIndex: Z_INDEX,
} as const;
