import { test, expect } from "@playwright/test";

test.describe("G10 Polish & Resilience Law Suite", () => {
  test("Prefers-reduced-motion: respects user reduced-motion preference", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/compare");

    // Evaluate that global CSS reduced-motion rule takes effect
    const animationDuration = await page.evaluate(() => {
      const el = document.body;
      const computed = window.getComputedStyle(el);
      return computed.transitionDuration;
    });

    expect(animationDuration).toMatch(/0s|0\.00001s|1e-05s|0\.01ms|0ms/);
  });

  test("Offline Resilience: displays calm offline indicator when connection drops", async ({ page, context }) => {
    await page.goto("/compare");

    // Initially online, banner should not be present
    const banner = page.locator('text=OFFLINE MODE ACTIVE');
    await expect(banner).toHaveCount(0);

    // Emulate offline network drop
    await context.setOffline(true);

    // Trigger window offline event
    await page.evaluate(() => {
      window.dispatchEvent(new Event("offline"));
    });

    await expect(page.locator('text=OFFLINE MODE ACTIVE')).toBeVisible();

    // Restore online connection
    await context.setOffline(false);
    await page.evaluate(() => {
      window.dispatchEvent(new Event("online"));
    });

    await expect(page.locator('text=OFFLINE MODE ACTIVE')).toHaveCount(0);
  });

  test("Empty State: displays actionable empty state and resets filters in Compare view", async ({ page }) => {
    await page.goto("/compare");

    // Search for impossible string to trigger EmptyState
    const searchInput = page.locator('input[placeholder*="Search smartphones"]');
    await searchInput.fill("xyz-nonexistent-device-12345");
    await page.waitForTimeout(400);

    // Verify EmptyState is rendered
    const emptyStateTitle = page.locator('text=No products found');
    await expect(emptyStateTitle).toBeVisible();

    const emptyDesc = page.locator('text=Try broadening your search term or clearing the active category and brand filters.');
    await expect(emptyDesc).toBeVisible();

    // Click "Reset Filters" action button
    const resetBtn = page.locator('button:has-text("Reset Filters")');
    await expect(resetBtn).toBeVisible();
    await resetBtn.click();

    // Verify catalog items are restored
    await expect(page.locator('a[href^="/compare/"]').first()).toBeVisible();
  });

  test("404 Error Page: renders branded calm empty state with recovery links", async ({ page }) => {
    await page.goto("/route-that-does-not-exist-404");

    const notFoundTitle = page.locator('h3:has-text("404 — Record Not Found")').first();
    await expect(notFoundTitle).toBeVisible();

    const returnBtn = page.locator('button:has-text("Return to Catalog")').first();
    await expect(returnBtn).toBeVisible();
    await returnBtn.click();

    await expect(page).toHaveURL(/\/compare/);
  });

  test("360px Mobile Viewport Audit: zero horizontal overflow on core views", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 640 });

    const routes = ["/", "/compare", "/extract", "/intelligence", "/settings", "/status"];

    for (const route of routes) {
      await page.goto(route);
      await page.waitForLoadState("domcontentloaded");

      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });

      expect(hasHorizontalScroll, `Route ${route} should not have horizontal scrollbar on 360px`).toBe(false);
    }
  });

  test("Root Loading State: root loading skeleton is strictly present and compliant (Rule 2)", async () => {
    const fs = await import("node:fs");
    const path = await import("node:path");

    const loadingFilePath = path.resolve(process.cwd(), "apps/web/src/app/loading.tsx");
    expect(fs.existsSync(loadingFilePath), "apps/web/src/app/loading.tsx must exist in codebase").toBe(true);

    const fileContent = fs.readFileSync(loadingFilePath, "utf-8");
    expect(fileContent, "loading.tsx must declare an accessible root loading status").toContain('role="status"');
    expect(fileContent, "loading.tsx must declare aria-live attribute").toContain('aria-live="polite"');
    expect(fileContent, "loading.tsx must declare data-testid for automated loading verification").toContain('data-testid="root-loading-skeleton"');
    expect(fileContent, "loading.tsx must render Skeleton UI components").toContain("Skeleton");
  });
});
