export const BRAND_COLORS = {
  ink: {
    950: "#0A0C0F",
    900: "#0F1217",
    850: "#141922",
    800: "#1A202B",
    700: "#262E3C",
    500: "#5B677C",
    300: "#98A2B3",
    100: "#D6DBE3",
  },
  paper: {
    50: "#FAF9F6",
    100: "#F3F1EC",
    200: "#E8E5DD",
    300: "#D3CFC3",
  },
  signal: {
    400: "#C6F135", // dark mode primary signal
    600: "#5E7A00", // light mode primary signal
    ink: "#0A0C0F",
  },
  semantic: {
    priceDown: "#2FBF8A",
    priceUp: "#F2685B",
    warn: "#F5B544",
    info: "#5AA9FF",
    stale: "#8B93A3",
    uncertain: "#9A7BFF",
  },
} as const;

export const SCRAPPY_LOGO_SVG = `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="32" height="32" rx="4" fill="#0A0C0F"/>
  <path d="M7 16H25M16 7V25" stroke="#C6F135" stroke-width="2" stroke-linecap="round"/>
  <circle cx="16" cy="16" r="3" fill="#C6F135"/>
</svg>`;

export const SCRAPPY_FAVICON_SVG = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="16" height="16" rx="2" fill="#0A0C0F"/>
  <circle cx="8" cy="8" r="3" fill="#C6F135"/>
</svg>`;
