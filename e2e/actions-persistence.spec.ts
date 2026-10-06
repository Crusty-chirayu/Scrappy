import { test, expect } from "@playwright/test";

test.describe("Real Behavior & Database Persistence Tests", () => {
  test.beforeEach(async ({ request }) => {
    // Reset workspace plan to free before test
    await request.patch("http://localhost:3005/api/workspaces", {
      data: { plan: "free" },
    });
  });

  test("Plan upgrade in /pricing persists to database across reload", async ({ page }) => {
    await page.goto("http://localhost:3005/pricing");
    await page.waitForLoadState("domcontentloaded");

    // Click Upgrade to Pro
    const upgradeProBtn = page.getByRole("button", { name: "Upgrade to Pro" });
    await expect(upgradeProBtn).toBeVisible();
    await upgradeProBtn.click();

    // Verify Test mode indicator on checkout modal
    await expect(page.getByText("Test mode", { exact: true })).toBeVisible();
    await expect(page.getByText("Subscribe to Professional")).toBeVisible();

    // Click Confirm Subscription
    const confirmBtn = page.getByRole("button", { name: /Confirm Subscription/i });
    await confirmBtn.click();

    // Toast confirms activation
    await expect(page.getByText(/Subscription Activated/i)).toBeVisible();

    // Reload page and assert Pro plan persisted from database
    await page.reload();
    await page.waitForLoadState("domcontentloaded");

    // Pro tier button should now display Current Plan
    const proSection = page.locator("div").filter({ hasText: "Professional" }).filter({ hasText: "Current Plan" });
    await expect(proSection.first()).toBeVisible();
  });

  test("Extract Studio calls real run engine and displays DB status", async ({ page }) => {
    await page.goto("http://localhost:3005/extract");
    await page.waitForLoadState("domcontentloaded");

    // Advance to Step 2
    const proceedToStep2 = page.getByRole("button", { name: /Proceed to Schema Builder/i });
    await expect(proceedToStep2).toBeVisible();
    await proceedToStep2.click();

    // Advance to Step 3
    const proceedToStep3 = page.getByRole("button", { name: /Test & Verify Extraction/i });
    await expect(proceedToStep3).toBeVisible();
    await proceedToStep3.click();

    // Click Run Real Extraction
    const runExtractionBtn = page.getByRole("button", { name: /Run Real Extraction/i });
    await expect(runExtractionBtn).toBeVisible();
    await runExtractionBtn.click();

    // Assert real database run indicator appears
    await expect(page.getByText(/DB RUN:/i)).toBeVisible();
    await expect(page.getByText(/SUCCEEDED/i).first()).toBeVisible();
  });
});
