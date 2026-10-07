import { defineConfig } from "vitest/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@scrappy/core": path.resolve(__dirname, "packages/core/src/index.ts"),
      "@scrappy/scraping": path.resolve(__dirname, "packages/scraping/src/index.ts"),
      "@scrappy/adapters": path.resolve(__dirname, "packages/adapters/src/index.ts"),
      "@scrappy/db": path.resolve(__dirname, "packages/db/src/index.ts"),
      "@scrappy/matching": path.resolve(__dirname, "packages/matching/src/index.ts"),
      "@scrappy/pricing": path.resolve(__dirname, "packages/pricing/src/index.ts"),
      "@scrappy/ai": path.resolve(__dirname, "packages/ai/src/index.ts"),
      "@scrappy/brand": path.resolve(__dirname, "packages/brand/src/index.ts"),
      "@scrappy/ui": path.resolve(__dirname, "packages/ui/src/index.ts"),
    },
  },
  test: {
    globals: true,
    environment: "node",
    testTimeout: 30000,
    hookTimeout: 60000,
    include: ["packages/**/src/**/*.{test,spec}.{ts,tsx}", "apps/**/src/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["**/node_modules/**", "**/dist/**", "**/.next/**"],
  },
});
