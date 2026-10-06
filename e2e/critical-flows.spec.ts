import { test, expect } from "@playwright/test";

test.describe("SCRAPPY Critical User Flows", () => {
  test("Flow 1: Search -> Product Detail -> Watchlist -> Alert", async ({ page }) => {
    // 1. Visit Compare catalog
    await page.goto("/compare");
    await expect(page).toHaveTitle(/SCRAPPY/);

    // 2. Verify Synthetic Data Banner is displayed (Rule 1 & 3)
    const banner = page.locator('[role="alert"]').filter({ hasText: "DATA PROVENANCE NOTICE" }).first();
    await expect(banner).toBeVisible();
    await expect(banner).toContainText("FIXTURE MODE ACTIVE");

    // 3. Search for a product
    const searchInput = page.locator('input[placeholder*="Filter by product name"]');
    await expect(searchInput).toBeVisible({ timeout: 5000 });
    await searchInput.fill("Apple");
    await page.waitForTimeout(400);

    // 4. Click the first product card link
    const firstProduct = page.locator('a[href^="/compare/"]').first();
    const href = await firstProduct.getAttribute("href");
    if (href) {
      await page.goto(href);
    } else {
      await firstProduct.click({ force: true });
    }

    // 5. Verify on Product detail page
    await expect(page).toHaveURL(/\/compare\/[a-z0-9-]+/);
    await expect(page.locator("h1")).toBeVisible();

    // 6. Verify TrustBadge
    const trustBadge = page.locator('span:has-text("Verified")').first();
    await expect(trustBadge).toBeAttached();

    // 7. Toggle Watchlist on Product Detail
    const watchButton = page.getByRole("button", { name: /Watch this product/i }).first();
    await expect(watchButton).toBeVisible();
    await watchButton.click();

    // 8. Confirm Watch Modal
    const alertModal = page.locator('div[role="dialog"]');
    await expect(alertModal).toBeVisible();
    
    // Choose Email channel button
    const emailChannel = alertModal.locator('button:has-text("Email Alert")');
    if (await emailChannel.isVisible()) {
      await emailChannel.click();
    }

    const submitAlert = alertModal.getByRole("button", { name: "Watch this product" });
    await submitAlert.click();

    // Verify modal closes
    await expect(alertModal).not.toBeVisible();
  });

  test("Flow 2: Visual Extract Studio Builder", async ({ page }) => {
    // 1. Visit Extract studio
    await page.goto("/extract");
    await expect(page).toHaveTitle(/SCRAPPY/);

    // 2. Verify SSRF Guard — default URL is a valid public host, wait for hydration
    const ssrfBadge = page.locator('text=SSRF Security Passed').first();
    await expect(ssrfBadge).toBeVisible({ timeout: 5000 });

    // 3. Test malicious SSRF URL rejection
    const targetUrlInput = page.locator('input[type="url"]').first();
    await targetUrlInput.fill("http://169.254.169.254/latest/meta-data");
    // Actual SSRF blocked message from the page:
    const blockedMsg = page.locator('text=DISALLOWED SOURCE REFUSED').first();
    await expect(blockedMsg).toBeVisible({ timeout: 3000 });

    // Restore valid public URL
    await targetUrlInput.fill("https://store.example.com/catalog");
    await expect(page.locator('text=SSRF Security Passed').first()).toBeVisible({ timeout: 3000 });

    // 4. Advance to Step 2 (Schema Builder)
    const proceedStep2 = page.getByRole("button", { name: /Proceed to Schema Builder/i });
    await expect(proceedStep2).toBeEnabled();
    await proceedStep2.click();

    // 5. Add a field in Step 2
    const addFieldBtn = page.getByRole("button", { name: /Add New Field/i });
    await expect(addFieldBtn).toBeVisible();
    await addFieldBtn.click();
    await expect(page.locator("text=field_5").first()).toBeVisible();

    // 6. Advance to Step 3 (Test & Verify)
    const proceedStep3 = page.getByRole("button", { name: /Test & Verify Extraction/i });
    await expect(proceedStep3).toBeVisible();
    await proceedStep3.click();

    // 7. Run Extraction
    const runBtn = page.getByRole("button", { name: /Run Real Extraction/i });
    await expect(runBtn).toBeVisible();
    await runBtn.click();

    // 8. Verify status transitions to SUCCEEDED and Preview Table activates
    await expect(page.locator('span:has-text("SUCCEEDED")').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Extracted Records Table').first()).toBeVisible();
  });

  test("Flow 3: Workspace Settings & API Keys", async ({ page }) => {
    // 1. Visit Settings
    await page.goto("/settings");
    await expect(page.locator("h1").first()).toContainText("Workspace Settings");

    // 2. Verify Team Members Table
    await expect(page.locator("td:has-text('lead@scrappy.io')").first()).toBeVisible();
    await expect(page.locator("span:has-text('owner')").first()).toBeVisible();

    // 3. Switch to API Keys tab
    const keysTab = page.locator('button:has-text("API KEYS")').first();
    await keysTab.click();

    // 4. Generate new API key
    const keyInput = page.locator('input[placeholder*="Production Data"]').first();
    await keyInput.fill("E2E Test Key");
    const generateBtn = page.locator('button:has-text("+ Generate New Secret Key")').first();
    await generateBtn.click();

    // 5. Verify show-once banner appears
    await expect(page.locator("text=SAVE YOUR SECRET KEY NOW").first()).toBeVisible();
    await expect(page.locator("span:has-text('scrappy_live_')").first()).toBeVisible();

    // 6. Switch to Webhooks tab
    const whTab = page.locator('button:has-text("SIGNED WEBHOOKS")');
    await whTab.click();
    await expect(page.locator("text=Registered Endpoints")).toBeVisible();
  });
});
