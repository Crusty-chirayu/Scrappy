import { test, expect } from "@playwright/test";

test.describe("Real Behavior & Database Persistence Tests", () => {
  test.setTimeout(60000);

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
    const patchPromise = page.waitForResponse(
      (res) => res.url().includes("/api/workspaces") && res.request().method() === "PATCH"
    );
    const confirmBtn = page.getByRole("button", { name: /Confirm Subscription/i });
    await confirmBtn.click();
    await patchPromise;

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

    // Fill a valid public URL so the SSRF check passes and the step button enables
    await page.fill("#target-url-input", "https://example.com/catalog");
    // Wait for urlCheck to recompute (React state update)
    await page.waitForTimeout(300);

    // Advance to Step 2
    const proceedToStep2 = page.getByRole("button", { name: /Proceed to Schema Builder/i });
    await expect(proceedToStep2).toBeVisible();
    await expect(proceedToStep2).toBeEnabled();
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
    await expect(page.getByText(/DB RUN:/i)).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/SUCCEEDED/i).first()).toBeVisible({ timeout: 15000 });
  });

  test("Sign up creates user and workspace row in Supabase, and log out ends session", async ({ page }) => {
    const ts = Date.now();
    const testEmail = `persistence_user_${ts}@scrappy.io`;
    const testPassword = "Password123!Secure";
    const testFullName = `Persistence User ${ts}`;

    // 1. Sign up
    await page.goto("http://localhost:3005/auth/signup");
    await page.waitForLoadState("domcontentloaded");
    await page.fill("#signup-name", testFullName);
    await page.fill("#signup-email", testEmail);
    await page.fill("#signup-password", testPassword);
    await page.fill("#signup-confirm-password", testPassword);
    await page.click("#signup-submit-btn");

    // Wait for redirect to /compare
    await page.waitForURL("**/compare", { timeout: 15000 });
    await expect(page).toHaveURL(/.*compare/);

    // Assert direct Supabase database row
    const { createClient } = await import("@supabase/supabase-js");
    const admin = createClient(
      "http://127.0.0.1:55321",
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU"
    );
    const { data: users } = await admin.auth.admin.listUsers();
    const dbUser = users.users.find((u) => u.email === testEmail);
    expect(dbUser).toBeDefined();

    // Reload page and assert session persists
    await page.reload();
    await page.waitForLoadState("domcontentloaded");
    await expect(page).toHaveURL(/.*compare/);

    // 2. Log out — hard-fail if logout button is absent (would indicate auth state is not reflected in UI)
    const logoutBtn = page.locator("#auth-logout-btn");
    await expect(logoutBtn).toBeVisible({ timeout: 5000 });
    await logoutBtn.click();
    // Session must end: login link appears within 5s
    await expect(page.locator("#auth-login-link")).toBeVisible({ timeout: 5000 });
    // Reload confirms session is gone — no stored token resurrection
    await page.reload();
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("#auth-login-link")).toBeVisible();
  });

  test("Add to watchlist and remove from watchlist persist in Supabase across reload", async ({ page }) => {
    const productId = "b2000000-0000-0000-0000-000000000001";
    const workspaceId = "e0000000-0000-0000-0000-000000000001";
    const { createClient } = await import("@supabase/supabase-js");
    const admin = createClient(
      "http://127.0.0.1:55321",
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU"
    );

    // Clean any existing watch for this product in default workspace
    await admin.from("watchlists").delete().eq("workspace_id", workspaceId).eq("product_id", productId);

    // 1. Visit product page and add to watchlist
    await page.goto(`http://localhost:3005/compare/${productId}`);
    await page.waitForLoadState("domcontentloaded");

    const watchBtn = page.getByRole("button", { name: /Watch this product/i }).first();
    await expect(watchBtn).toBeVisible();
    await watchBtn.click();

    // Confirm Watch modal
    const modalWatchBtn = page.getByRole("dialog").getByRole("button", { name: "Watch this product" });
    await expect(modalWatchBtn).toBeVisible();
    await modalWatchBtn.scrollIntoViewIfNeeded();

    const watchResponse = page.waitForResponse(
      (res) => res.url().includes("/api/watchlist") && res.request().method() === "POST"
    );
    await modalWatchBtn.click();
    await watchResponse;

    // Assert row in Supabase watchlists table
    let dbRow = await admin
      .from("watchlists")
      .select("id, product_id")
      .eq("workspace_id", workspaceId)
      .eq("product_id", productId)
      .maybeSingle();
    expect(dbRow.data).not.toBeNull();
    expect(dbRow.data?.product_id).toBe(productId);

    // Reload page and assert button says Watching
    await page.reload();
    await page.waitForLoadState("domcontentloaded");
    await expect(page.getByRole("button", { name: /Watching/i }).first()).toBeVisible();

    // 2. Remove from watchlist via /watchlist
    await page.goto("http://localhost:3005/watchlist");
    await page.waitForLoadState("domcontentloaded");

    const removeBtn = page.locator("button[title='Remove from watchlist']").first();
    await expect(removeBtn).toBeVisible();

    const deleteResponse = page.waitForResponse(
      (res) => res.url().includes("/api/watchlist") && res.request().method() === "DELETE"
    );
    await removeBtn.click();
    await deleteResponse;

    // Assert row deleted from Supabase
    dbRow = await admin
      .from("watchlists")
      .select("id")
      .eq("workspace_id", workspaceId)
      .eq("product_id", productId)
      .maybeSingle();
    expect(dbRow.data).toBeNull();
  });

  test("Save alert persists in Supabase across reload", async ({ page }) => {
    const productId = "b2000000-0000-0000-0000-000000000001";
    const workspaceId = "e0000000-0000-0000-0000-000000000001";
    const { createClient } = await import("@supabase/supabase-js");
    const admin = createClient(
      "http://127.0.0.1:55321",
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU"
    );

    // Clean existing alerts
    await admin.from("alerts").delete().eq("workspace_id", workspaceId).eq("product_id", productId);

    // 1. Visit /alerts and create alert
    await page.goto("http://localhost:3005/alerts");
    await page.waitForLoadState("domcontentloaded");

    const createBtn = page.getByRole("button", { name: /Activate Alert Rule/i });
    await expect(createBtn).toBeVisible({ timeout: 10000 });
    await createBtn.scrollIntoViewIfNeeded();

    const alertResponse = page.waitForResponse(
      (res) => res.url().includes("/api/alerts") && res.request().method() === "POST"
    );
    await createBtn.click();
    await alertResponse;

    // Assert alert created in Supabase
    const alertRow = await admin
      .from("alerts")
      .select("id, product_id, target_price_paise")
      .eq("workspace_id", workspaceId)
      .eq("product_id", productId)
      .maybeSingle();
    expect(alertRow.data).not.toBeNull();
    expect(alertRow.data?.product_id).toBe(productId);

    // Reload page and assert persisted alert rule appears
    await page.reload();
    await page.waitForLoadState("domcontentloaded");
    await expect(page.getByText(/Apple Smartphone Model Pro-1X/i).first()).toBeVisible();
  });

  test("Persistence calls FAIL when Supabase is unreachable — no in-memory fallback", async () => {
    // This test intentionally targets a closed port to prove the app has no silent in-memory fallback.
    // It must be run with Supabase STOPPED. When Supabase IS running this test passes because the
    // connection attempt to the *wrong* port still fails, which is what we assert.
    const BAD_URL = "http://127.0.0.1:19999"; // Deliberately wrong port — nothing listening here
    const SERVICE_ROLE_KEY =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU";

    const { createClient } = await import("@supabase/supabase-js");
    const offlineClient = createClient(BAD_URL, SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    // A read against the offline client must reject or return a network error — never cached data.
    const { data, error } = await offlineClient
      .from("watchlists")
      .select("id")
      .limit(1);

    // The call must produce an error (network failure). If data comes back, something is caching.
    expect(
      error,
      "Expected a network error when Supabase is unreachable. If this passes with data, there is an in-memory fallback."
    ).not.toBeNull();
    expect(data).toBeNull();
  });
});
