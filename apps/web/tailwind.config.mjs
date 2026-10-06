import preset from "@scrappy/config/tailwind";

/** @type {import('tailwindcss').Config} */
export default {
  presets: [preset],
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
    "../../packages/ui/dist/**/*.{js,jsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
