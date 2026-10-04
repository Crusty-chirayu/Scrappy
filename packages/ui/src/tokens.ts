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

export const THEME_TOKENS = {
  colors: BRAND_COLORS,
  durations: MOTION_DURATIONS,
  easings: MOTION_EASINGS,
  radius: {
    chip: "2px",
    card: "4px",
    dialog: "8px",
  },
} as const;
