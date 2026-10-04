/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
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
          400: "#C6F135",
          600: "#5E7A00",
          ink: "#0A0C0F",
        },
        semantic: {
          "price-down": "#2FBF8A",
          "price-up": "#F2685B",
          warn: "#F5B544",
          info: "#5AA9FF",
          stale: "#8B93A3",
          uncertain: "#9A7BFF",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
        serif: ["var(--font-instrument-serif)", "serif"],
      },
      borderRadius: {
        chip: "2px",
        card: "4px",
        dialog: "8px",
      },
    },
  },
};
