/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        surface: {
          0: "var(--surface-0)",
          1: "var(--surface-1)",
          2: "var(--surface-2)",
          3: "var(--surface-3)",
          4: "var(--surface-4)",
        },
        text: {
          1: "var(--text-1)",
          2: "var(--text-2)",
          3: "var(--text-3)",
        },
        border: {
          DEFAULT: "var(--border)",
          subtle: "var(--border-subtle)",
          strong: "var(--border-strong)",
          focus: "var(--border-focus)",
        },
        accent: {
          DEFAULT: "var(--color-accent)",
          hover: "var(--color-accent-hover)",
          active: "var(--color-accent-active)",
          contrast: "var(--color-accent-contrast)",
        },
        semantic: {
          success: "var(--color-success)",
          warn: "var(--color-warn)",
          danger: "var(--color-danger)",
          info: "var(--color-info)",
          "price-down": "var(--color-price-down)",
          "price-up": "var(--color-price-up)",
        },
        // Backwards compatibility for existing ink & paper tokens
        ink: {
          950: "var(--surface-0)",
          900: "var(--surface-1)",
          850: "var(--surface-2)",
          800: "var(--surface-3)",
          700: "var(--border)",
          500: "var(--text-3)",
          300: "var(--text-2)",
          100: "var(--text-1)",
        },
        paper: {
          50: "#FAF9F6",
          100: "#F3F1EC",
          200: "#EAE6DE",
          300: "#D3CFC3",
        },
        signal: {
          400: "var(--color-accent)",
          600: "var(--color-accent)",
          ink: "var(--color-accent-contrast)",
        },
      },
      fontFamily: {
        ui: ["var(--font-sans)", "var(--font-geist-sans)", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "var(--font-geist-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
        mono: ["var(--font-mono)", "var(--font-geist-mono)", "monospace"],
      },
      borderRadius: {
        none: "var(--radius-none)",
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        full: "var(--radius-full)",
      },
      boxShadow: {
        elevation0: "var(--elevation-0)",
        elevation1: "var(--elevation-1)",
        elevation2: "var(--elevation-2)",
        elevation3: "var(--elevation-3)",
        elevation4: "var(--elevation-4)",
      },
      zIndex: {
        hide: "var(--z-hide)",
        base: "var(--z-base)",
        elevate: "var(--z-elevate)",
        sticky: "var(--z-sticky)",
        drawer: "var(--z-drawer)",
        dialog: "var(--z-dialog)",
        popover: "var(--z-popover)",
        toast: "var(--z-toast)",
        tooltip: "var(--z-tooltip)",
      },
    },
  },
};
