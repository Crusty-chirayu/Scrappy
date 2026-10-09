import { defineConfig } from "@playwright/test";

const PORT = process.env.PORT || "3005";
const baseURL = process.env.PLAYWRIGHT_TEST_BASE_URL || `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 30000,
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  webServer: {
    command: "pnpm --filter @scrappy/web build && pnpm --filter @scrappy/web start -p 3005",
    url: "http://localhost:3005",
    reuseExistingServer: true,
    timeout: 120000,
  },
  projects: [
    {
      name: "desktop-1280",
      use: {
        viewport: { width: 1280, height: 800 },
      },
    },
    {
      name: "mobile-360",
      use: {
        viewport: { width: 360, height: 640 },
        isMobile: true,
      },
    },
  ],
});
