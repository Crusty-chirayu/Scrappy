import { test, expect } from "@playwright/test";

test.describe("SCRAPPY Critical User Flows", () => {
  test("Flow 1: Search -> Product Detail -> Watchlist -> Alert", async ({ page }) => {
    // 1. Visit Compare catalog
    await page.goto("/compare");
    await expect(page).toHaveTitle(/SCRAPPY/);

    // 2. Verify Synthetic Data Banner is displayed (Rule 1 & 3)
    const banner = page.locator('[role="alert"]').filter({ hasText: "DATA PROVENANCE NOTICE" });
    await expect(banner).toBeVisible();
    await expect(banner).toContainText("FIXTURE MODE ACTIVE");

    // 3. Search for a product
    const searchInput = page.locator('input[placeholder*="Search smartphones"]');
    await searchInput.fill("Apple");
    await page.waitForTimeout(400);

    // 4. Click the first product card link
    const firstProduct = page.locator('a[href^="/compare/"]').first();
    await expect(firstProduct).toBeVisible();
    await firstProduct.click();

    // 5. Verify on Product detail page
    await expect(page).toHaveURL(/\/compare\/[a-z0-9-]+/);
    await expect(page.locator("h1")).toBeVisible();

    // 6. Verify TrustBadge and SyntheticBadge
    const trustBadge = page.locator('span:has-text("Verified")').first();
    await expect(trustBadge).toBeVisible();

    // 7. Toggle Watchlist on Product Detail
    const watchButton = page.locator('button:has-text("Watchlist")').first();
    await expect(watchButton).toBeVisible();
    await watchButton.click();

    // 8. Open Set Alert modal
    const alertButton = page.locator('button:has-text("Set Alert")').first();
    await expect(alertButton).toBeVisible();
    await alertButton.click();

    // 9. Submit Price Alert form
    const alertModal = page.locator('div[role="dialog"]');
    await expect(alertModal).toBeVisible();
    
    // Choose Email channel button
    const emailChannel = alertModal.locator('button:has-text("Email Alert")');
    if (await emailChannel.isVisible()) {
      await emailChannel.click();
    }

    const submitAlert = alertModal.locator('button:has-text("Save Alert")');
    await submitAlert.click();

    // Verify modal closes
    await expect(alertModal).not.toBeVisible();
  });

  test("Flow 2: Visual Extract Studio Builder", async ({ page }) => {
    // 1. Visit Extract studio
    await page.goto("/extract");
    await expect(page).toHaveTitle(/SCRAPPY/);

    // 2. Verify SSRF Guard
    const ssrfBadge = page.locator('text=SSRF Security Passed');
    await expect(ssrfBadge).toBeVisible();

    // 3. Test malicious SSRF URL rejection
    const targetUrlInput = page.locator('input[type="url"]');
    await targetUrlInput.fill("http://169.254.169.254/latest/meta-data");
    const blockedMsg = page.locator('text=Blocked:');
    await expect(blockedMsg).toBeVisible();

    // Restore valid public URL
    await targetUrlInput.fill("https://store.example.com/catalog");
    await expect(page.locator('text=SSRF Security Passed')).toBeVisible();

    // 4. Add a field
    const addFieldBtn = page.locator('button:has-text("+ Add Field")');
    await addFieldBtn.click();
    await expect(page.locator('input[value="field_5"]')).toBeVisible();

    // 5. Run Extraction
    const runBtn = page.locator('button:has-text("Run Extraction")');
    await runBtn.click();

    // 6. Verify status transitions to SUCCEEDED and Preview Table activates
    await expect(page.locator('span:has-text("SUCCEEDED")')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=LIVE PREVIEW TABLE')).toBeVisible();
  });

  test("Flow 3: Workspace Settings & API Keys", async ({ page }) => {
    // 1. Visit Settings
    await page.goto("/settings");
    await expect(page.locator("h1")).toContainText("Workspace Settings");

    // 2. Verify Team Members Table
    await expect(page.locator("td:has-text('lead@scrappy.io')")).toBeVisible();
    await expect(page.locator("span:has-text('owner')")).toBeVisible();

    // 3. Switch to API Keys tab
    const keysTab = page.locator('button:has-text("API KEYS")');
    await keysTab.click();

    // 4. Generate new API key
    const keyInput = page.locator('input[placeholder*="Production Data"]');
    await keyInput.fill("E2E Test Key");
    const generateBtn = page.locator('button:has-text("+ Generate New Secret Key")');
    await generateBtn.click();

    // 5. Verify show-once banner appears
    await expect(page.locator("text=SAVE YOUR SECRET KEY NOW")).toBeVisible();
    await expect(page.locator("span:has-text('scrappy_live_')").first()).toBeVisible();

    // 6. Switch to Webhooks tab
    const whTab = page.locator('button:has-text("SIGNED WEBHOOKS")');
    await whTab.click();
    await expect(page.locator("text=HMAC SECRET")).toBeVisible();
  });
});
