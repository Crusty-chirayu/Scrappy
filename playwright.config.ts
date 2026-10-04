import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 30000,
  use: {
    baseURL: "http://localhost:3005",
    trace: "on-first-retry",
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
