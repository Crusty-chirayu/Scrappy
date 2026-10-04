import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getSupabaseAdminClient, getSupabaseClient } from "@scrappy/db";
import { BossManager } from "../boss.js";

const TEST_PRODUCT_ID = "b2000000-0000-0000-0000-000000000001"; // Apple Smartphone Model Pro-1X from seed
const TEST_WORKSPACE_ID = "e0000000-0000-0000-0000-000000000001";
const TEST_USER_ID = "00000000-0000-0000-0000-000000000001";

describe("Worker pg-boss & Realtime Pipeline E2E (G4 Acceptance Proof)", () => {
  let bossManager: BossManager;
  const db = getSupabaseAdminClient();

  beforeAll(async () => {
    bossManager = new BossManager();
    await bossManager.start();
  });

  afterAll(async () => {
    await bossManager.stop();
  });

  it("proves complete chain: scrape -> parse -> match -> price obs -> alert -> realtime notif -> email", async () => {
    // 1. Setup an active alert for target price ₹45,000 (4,500,000 paise)
    // Clean prior test alerts
    await db
      .from("alerts")
      .delete()
      .eq("workspace_id", TEST_WORKSPACE_ID)
      .eq("product_id", TEST_PRODUCT_ID);

    const { data: createdAlert, error: alertErr } = await db
      .from("alerts")
      .insert({
        workspace_id: TEST_WORKSPACE_ID,
        user_id: TEST_USER_ID,
        product_id: TEST_PRODUCT_ID,
        target_price_paise: 4500000, // ₹45,000
        channels: ["in_app", "email"],
        is_active: true,
      })
      .select()
      .single();

    expect(alertErr).toBeNull();
    expect(createdAlert).toBeDefined();

    // 2. Setup Supabase Realtime Listener to verify live notification delivery
    const realtimeClient = getSupabaseClient();
    const receivedRealtimeEvents: unknown[] = [];

    const channel = realtimeClient
      .channel("public:notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `workspace_id=eq.${TEST_WORKSPACE_ID}`,
        },
        (payload) => {
          receivedRealtimeEvents.push(payload.new);
        },
      )
      .subscribe();

    // Give websocket subscription 500ms to establish
    await new Promise((r) => setTimeout(r, 500));

    // 3. Prepare an Amazon HTML fixture with price drop to ₹38,999 (3,899,900 paise)
    const priceDropHtml = `
      <html>
        <body>
          <span id="productTitle">Apple Smartphone Model Pro-1X</span>
          <span class="a-offscreen">₹38,999</span>
          <span class="priceToPay"><span class="a-offscreen">₹38,999</span></span>
          <span class="basisPrice"><span class="a-offscreen">₹49,999</span></span>
          <span>In stock</span>
          <span>Sold by <a>Amazon Retail</a></span>
          <div class="sku">B012100001</div>
        </body>
      </html>
    `;

    // 4. Dispatch Ingestion job to pg-boss
    const jobId = await bossManager.dispatchIngestion({
      url: "https://www.amazon.in/dp/B012100001",
      sourceId: "amazon-in",
      htmlFixture: priceDropHtml,
      forceProductId: TEST_PRODUCT_ID,
      workspaceId: TEST_WORKSPACE_ID,
      userId: TEST_USER_ID,
    });

    expect(jobId).toBeDefined();

    // 5. Wait for pg-boss consumer to execute the job (max 10s)
    let observationFound = false;
    let notificationFound = false;

    for (let i = 0; i < 20; i++) {
      await new Promise((r) => setTimeout(r, 500));

      // Check price_observations table
      const { data: obs } = await db
        .from("price_observations")
        .select("id, price_paise")
        .eq("product_id", TEST_PRODUCT_ID)
        .eq("price_paise", 3899900);

      if (obs && obs.length > 0) {
        observationFound = true;
      }

      // Check notifications table
      const { data: notifs } = await db
        .from("notifications")
        .select("id, title, message")
        .eq("workspace_id", TEST_WORKSPACE_ID)
        .ilike("title", "%Price Drop Alert%");

      if (notifs && notifs.length > 0) {
        notificationFound = true;
      }

      if (observationFound && notificationFound) {
        break;
      }
    }

    expect(observationFound).toBe(true);
    expect(notificationFound).toBe(true);

    // 6. Verify Match Evidence was recorded
    const { data: evidence } = await db
      .from("match_evidence")
      .select("id, decision, confidence_score")
      .eq("candidate_product_id", TEST_PRODUCT_ID);

    expect(evidence && evidence.length > 0).toBe(true);
    expect(evidence?.[0]?.decision).toBe("exact_match");

    // 7. Verify Local Mailpit / Inbucket received the price drop alert email
    const mailpitRes = await fetch("http://127.0.0.1:55324/api/v1/messages");
    expect(mailpitRes.ok).toBe(true);
    const mailpitData = (await mailpitRes.json()) as {
      messages: Array<{ Subject: string; To: Array<{ Address: string }> }>;
    };

    const alertEmail = mailpitData.messages.find((m) =>
      m.Subject.includes("Price Drop Alert"),
    );

    expect(alertEmail).toBeDefined();
    expect(alertEmail!.Subject).toContain("Apple Smartphone Model Pro-1X");

    // Cleanup realtime subscription
    await realtimeClient.removeChannel(channel);
  }, 25000);
});
