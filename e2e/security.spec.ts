import { test, expect } from "@playwright/test";

test.describe("G9 Defense-in-Depth & Security Flow Suite", () => {
  test("API Keys Console: show-once plaintext warning and key lifecycle", async ({ page }) => {
    await page.goto("/settings");

    // 1. Switch to API Keys tab
    const keysTab = page.locator('button:has-text("API KEYS")').first();
    await expect(keysTab).toBeVisible();
    await keysTab.click();

    // 2. Generate a new cryptographic API key
    const uniqueKeyName = `Key ${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const keyInput = page.locator('input[aria-label="Secret Key Name"]');
    await expect(keyInput).toBeVisible();
    await keyInput.fill(uniqueKeyName);

    const generateBtn = page.locator('button:has-text("+ Generate New Secret Key")');
    await generateBtn.click();

    // 3. Assert show-once banner and Constitution Rule 7 notice
    const showOnceBanner = page.locator('text=SAVE YOUR SECRET KEY NOW (SHOW-ONCE)');
    await expect(showOnceBanner).toBeVisible();

    const rule7Notice = page.locator('text=Constitution Rule 7: For your security, Scrappy only stores a cryptographic SHA-256 hash.');
    await expect(rule7Notice).toBeVisible();

    // 4. Assert secret key value starts with scrappy_live_
    const secretKeyDisplay = page.locator("span:has-text('scrappy_live_')").first();
    await expect(secretKeyDisplay).toBeVisible();

    // Dismiss show-once banner
    const dismissBtn = page.locator('button:has-text("✕ Dismiss")');
    if (await dismissBtn.isVisible()) {
      await dismissBtn.click();
    }

    // 5. Assert key appears in the table
    const tableRow = page.locator("tr", { hasText: uniqueKeyName });
    await expect(tableRow).toBeVisible();

    // 6. Revoke the key
    const revokeBtn = tableRow.locator('button:has-text("Revoke")');
    await revokeBtn.scrollIntoViewIfNeeded();
    await revokeBtn.click({ force: true });

    // 7. Verify row is removed
    await expect(page.locator("tr", { hasText: uniqueKeyName })).toHaveCount(0);
  });

  test("SSRF Defense: rejects cloud metadata and loopback targets", async ({ request }) => {
    // Attempt 1: Link-local AWS/GCP cloud metadata IP
    const cloudRes = await request.post("/api/extract", {
      data: {
        targetUrl: "http://169.254.169.254/latest/meta-data",
        datasetName: "SSRF_Attack_Test",
      },
    });
    expect(cloudRes.status()).toBe(400);
    const cloudBody = await cloudRes.json();
    expect(cloudBody.error).toContain("SSRF Validation failed");

    // Attempt 2: Localhost loopback port attack
    const loopbackRes = await request.post("/api/extract", {
      data: {
        targetUrl: "http://127.0.0.1:55321/rest/v1/",
        datasetName: "SSRF_Loopback_Attack",
      },
    });
    expect(loopbackRes.status()).toBe(400);
    const loopbackBody = await loopbackRes.json();
    expect(loopbackBody.error).toContain("SSRF Validation failed");

    // Attempt 3: Obfuscated decimal IP for 127.0.0.1 (2130706433)
    const obfuscatedRes = await request.post("/api/extract", {
      data: {
        targetUrl: "http://2130706433/admin",
        datasetName: "SSRF_Obfuscated_Attack",
      },
    });
    expect(obfuscatedRes.status()).toBe(400);
    const obfuscatedBody = await obfuscatedRes.json();
    expect(obfuscatedBody.error).toContain("SSRF Validation failed");
  });

  test("Multi-Tenant IDOR: enforces workspace isolation over API endpoints", async ({ request }) => {
    const adversarialWorkspace = "ws-adversarial-attacker-999";

    // 1. API Keys isolation
    const keysRes = await request.get(`/api/keys?workspaceId=${adversarialWorkspace}`);
    expect(keysRes.status()).toBe(200);
    const keysData = await keysRes.json();
    expect(keysData.keys).toEqual([]);

    // 2. Saved Searches isolation
    const searchesRes = await request.get(`/api/saved-searches?workspaceId=${adversarialWorkspace}`);
    expect(searchesRes.status()).toBe(200);
    const searchesData = await searchesRes.json();
    expect(searchesData.searches).toEqual([]);

    // 3. Webhooks isolation
    const webhooksRes = await request.get(`/api/webhooks?workspaceId=${adversarialWorkspace}`);
    expect(webhooksRes.status()).toBe(200);
    const webhooksData = await webhooksRes.json();
    expect(webhooksData.webhooks).toEqual([]);
  });
});
