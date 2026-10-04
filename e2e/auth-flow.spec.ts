import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "http://127.0.0.1:55321";
const SUPABASE_SERVICE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU";

test.describe("SCRAPPY Supabase Auth & Multi-Tenancy Flow (G2)", () => {
  const timestamp = Date.now();
  const testEmail = `playwright_user_${timestamp}@scrappy.io`;
  const testPassword = "Password123!Secure";
  const testFullName = `E2E Tester ${timestamp}`;

  test("Flow 1: Signup -> Auto-Workspace Creation -> Sign In -> Switcher -> Sign Out", async ({
    page,
  }) => {
    // 1. Visit signup page
    await page.goto("/auth/signup");
    await expect(page.locator("h1")).toContainText("Create SCRAPPY Workspace");

    // 2. Fill form
    await page.fill("#signup-name", testFullName);
    await page.fill("#signup-email", testEmail);
    await page.fill("#signup-password", testPassword);
    await page.fill("#signup-confirm-password", testPassword);

    // 3. Submit
    await page.click("#signup-submit-btn");

    // 4. In local stack, direct session redirects to /compare with workspace active
    await page.waitForURL("**/compare", { timeout: 15000 });
    await expect(page).toHaveURL(/.*compare/);

    // 5. Verify database trigger created the workspace
    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const { data: users } = await admin.auth.admin.listUsers();
    const createdUser = users.users.find((u) => u.email === testEmail);
    expect(createdUser).toBeDefined();

    const { data: memberships } = await admin
      .from("workspace_members")
      .select("role, workspaces (id, name, slug, plan)")
      .eq("user_id", createdUser!.id);

    expect(memberships).toBeDefined();
    expect(memberships!.length).toBeGreaterThan(0);
    expect(memberships![0].role).toBe("owner");
    const ws = memberships![0].workspaces as unknown as { name: string };
    expect(ws.name).toContain(testFullName);

    // 6. Verify header shows workspace switcher and user email
    const wsBtn = page.locator("#workspace-switcher-btn");
    await expect(wsBtn).toBeVisible({ timeout: 10000 });
    await expect(wsBtn).toContainText(testFullName);
    await expect(page.locator("#auth-logout-btn")).toBeVisible();

    // 7. Click Sign Out
    await page.click("#auth-logout-btn");
    await expect(page.locator("#auth-login-link")).toBeVisible({ timeout: 5000 });

    // 8. Go to Login page to verify password sign in works
    await page.goto("/auth/login");
    await expect(page.locator("h1")).toContainText("Sign In to SCRAPPY");
    await page.fill("#login-email", testEmail);
    await page.fill("#login-password", testPassword);
    await page.click("#login-submit-btn");

    // 9. Redirects to /compare with authenticated session
    await page.waitForURL("**/compare", { timeout: 15000 });
    await expect(page).toHaveURL(/.*compare/);
    await expect(page.locator("#workspace-switcher-btn")).toBeVisible({ timeout: 10000 });
    await expect(page.locator("#workspace-switcher-btn")).toContainText(testFullName);
  });

  test("Flow 2: Magic Link Sign In via Local Inbucket/Mailpit", async ({ page }) => {
    const magicEmail = `magic_e2e_${timestamp}@scrappy.io`;

    // 1. Visit Login page and switch to Magic Link tab
    await page.goto("/auth/login");
    await page.click("#tab-magic");
    await expect(page.locator("#magic-email")).toBeVisible();

    // 2. Submit magic link request
    await page.fill("#magic-email", magicEmail);
    await page.click("#magic-submit-btn");

    // 3. Verify confirmation UI
    await expect(page.locator("h2")).toContainText("Check your email", { timeout: 10000 });

    // 4. Verify message in local Mailpit
    const mailRes = await fetch("http://127.0.0.1:55324/api/v1/messages");
    expect(mailRes.ok).toBe(true);
    const mailData = await mailRes.json();
    interface MailpitMessage {
      To: Array<{ Address: string }>;
      Subject: string;
    }
    const messages = (mailData.messages || []) as MailpitMessage[];
    const msg = messages.find((m) =>
      m.To.some((to) => to.Address === magicEmail),
    );
    expect(msg).toBeDefined();
    expect(msg?.Subject.toLowerCase()).toContain("sign");
  });
});
