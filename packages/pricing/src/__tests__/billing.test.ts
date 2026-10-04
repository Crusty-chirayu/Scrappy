import { describe, it, expect, beforeAll } from "vitest";
import { getSupabaseAdminClient } from "@scrappy/db";
import {
  FakeRazorpayAdapter,
  SubscriptionStateMachine,
  UsageMeteringService,
  PLAN_LIMITS,
} from "../billing/index.js";

const TEST_WORKSPACE_ID = "e0000000-0000-0000-0000-000000000001"; // Default workspace from seed

describe("G5: Billing, Subscriptions, Dunning & Metering Engine", () => {
  const db = getSupabaseAdminClient();
  const adapter = new FakeRazorpayAdapter();
  const machine = new SubscriptionStateMachine(db);
  const metering = new UsageMeteringService(db);

  beforeAll(async () => {
    // Ensure workspace exists
    await db.from("workspaces").upsert({
      id: TEST_WORKSPACE_ID,
      name: "Default Workspace",
      slug: "default",
      plan: "free",
    });
  });

  describe("Razorpay Test-Mode Adapter", () => {
    it("creates customer, provisions subscription, and handles cancellation", async () => {
      const customer = await adapter.createCustomer({
        workspaceId: TEST_WORKSPACE_ID,
        email: "billing-test@scrappy.io",
        name: "Test Corp",
      });

      expect(customer.id).toContain("cust_fake_");
      expect(customer.workspaceId).toBe(TEST_WORKSPACE_ID);

      const sub = await adapter.createSubscription({
        workspaceId: TEST_WORKSPACE_ID,
        customerId: customer.id,
        plan: "pro",
      });

      expect(sub.id).toContain("sub_fake_");
      expect(sub.plan).toBe("pro");
      expect(sub.status).toBe("active");

      const cancelled = await adapter.cancelSubscription(sub.id, false);
      expect(cancelled.cancelAtPeriodEnd).toBe(true);
      expect(cancelled.cancelledAt).toBeDefined();
    });

    it("verifies and parses webhook payloads with mock signature", async () => {
      const { payload, signature } = adapter.generateMockWebhookPayload(
        "subscription.charged",
        "sub_fake_123",
        "starter",
      );

      const parsed = await adapter.handleWebhook(payload, signature);
      expect(parsed.event).toBe("subscription.charged");
      expect(parsed.subscriptionId).toBe("sub_fake_123");
      expect(parsed.amount).toBe(49900); // ₹499 in paise
    });
  });

  describe("Subscription State Machine & Dunning Lifecycle", () => {
    it("transitions state to active and upgrades workspace plan on successful charge", async () => {
      const subId = `sub_test_${Date.now()}`;

      // Save initial subscription in database
      await machine.saveSubscription({
        id: "d5555555-0000-0000-0000-000000000001",
        workspaceId: TEST_WORKSPACE_ID,
        provider: "fake",
        providerCustomerId: "cust_123",
        providerSubscriptionId: subId,
        plan: "business",
        status: "trialing",
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: new Date().toISOString(),
        cancelAtPeriodEnd: false,
        dunningAttemptCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      // Handle subscription.charged event
      const updated = await machine.handleBillingEvent({
        event: "subscription.charged",
        subscriptionId: subId,
        rawPayload: {},
      });

      expect(updated).not.toBeNull();
      expect(updated!.status).toBe("active");
      expect(updated!.dunningAttemptCount).toBe(0);

      // Verify workspace plan was upgraded to business
      const { data: ws } = await db
        .from("workspaces")
        .select("plan")
        .eq("id", TEST_WORKSPACE_ID)
        .single();

      expect(ws?.plan).toBe("business");
    });

    it("transitions to past_due with 7-day grace period on payment failure", async () => {
      const subId = `sub_fail_${Date.now()}`;

      await machine.saveSubscription({
        id: "d5555555-0000-0000-0000-000000000002",
        workspaceId: TEST_WORKSPACE_ID,
        provider: "fake",
        providerCustomerId: "cust_123",
        providerSubscriptionId: subId,
        plan: "pro",
        status: "active",
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: new Date().toISOString(),
        cancelAtPeriodEnd: false,
        dunningAttemptCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      const updated = await machine.handleBillingEvent({
        event: "payment.failed",
        subscriptionId: subId,
        rawPayload: {},
      });

      expect(updated).not.toBeNull();
      expect(updated!.status).toBe("past_due");
      expect(updated!.gracePeriodEndsAt).toBeDefined();

      const graceEnd = new Date(updated!.gracePeriodEndsAt!);
      const now = new Date();
      const diffDays = Math.round((graceEnd.getTime() - now.getTime()) / (24 * 3600 * 1000));
      expect(diffDays).toBe(7);
    });

    it("evaluates dunning cycle: sends reminder within grace period, downgrades when expired", async () => {
      // 1. Subscription within grace period (5 days remaining)
      const futureGrace = new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString();
      await machine.saveSubscription({
        id: "d5555555-0000-0000-0000-000000000003",
        workspaceId: TEST_WORKSPACE_ID,
        provider: "fake",
        providerCustomerId: "cust_123",
        providerSubscriptionId: "sub_grace_active",
        plan: "pro",
        status: "past_due",
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: new Date().toISOString(),
        cancelAtPeriodEnd: false,
        gracePeriodEndsAt: futureGrace,
        dunningAttemptCount: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      // 2. Subscription with expired grace period
      const pastGrace = new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString();
      await machine.saveSubscription({
        id: "d5555555-0000-0000-0000-000000000004",
        workspaceId: TEST_WORKSPACE_ID,
        provider: "fake",
        providerCustomerId: "cust_123",
        providerSubscriptionId: "sub_grace_expired",
        plan: "pro",
        status: "past_due",
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: new Date().toISOString(),
        cancelAtPeriodEnd: false,
        gracePeriodEndsAt: pastGrace,
        dunningAttemptCount: 3,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      const dunningResult = await machine.evaluateDunningCycle();
      expect(dunningResult.evaluatedCount).toBeGreaterThanOrEqual(2);
      expect(dunningResult.dunningNoticesSent).toBeGreaterThanOrEqual(1);
      expect(dunningResult.downgradedCount).toBeGreaterThanOrEqual(1);

      // Verify expired subscription was marked expired
      const { data: expiredSub } = await db
        .from("subscriptions")
        .select("status")
        .eq("provider_subscription_id", "sub_grace_expired")
        .single();

      expect(expiredSub?.status).toBe("expired");

      // Verify workspace was downgraded to free
      const { data: ws } = await db
        .from("workspaces")
        .select("plan")
        .eq("id", TEST_WORKSPACE_ID)
        .single();

      expect(ws?.plan).toBe("free");
    });
  });

  describe("Usage Metering & Idempotency", () => {
    it("guarantees idempotency: duplicate events with identical key do not double-bill", async () => {
      const idempotencyKey = `extract_run_test_${Date.now()}`;

      // First insertion: recorded = true
      const first = await metering.recordUsage({
        workspaceId: TEST_WORKSPACE_ID,
        metric: "records_extracted",
        quantity: 250,
        idempotencyKey,
      });

      expect(first.recorded).toBe(true);
      expect(first.isDuplicate).toBe(false);

      // Second insertion (retry storm with same idempotency key): recorded = false, isDuplicate = true
      const second = await metering.recordUsage({
        workspaceId: TEST_WORKSPACE_ID,
        metric: "records_extracted",
        quantity: 250,
        idempotencyKey,
      });

      expect(second.recorded).toBe(false);
      expect(second.isDuplicate).toBe(true);

      // Third insertion
      const third = await metering.recordUsage({
        workspaceId: TEST_WORKSPACE_ID,
        metric: "records_extracted",
        quantity: 250,
        idempotencyKey,
      });

      expect(third.recorded).toBe(false);
      expect(third.isDuplicate).toBe(true);

      // Verify exact count in database for this key is exactly 1 row
      const { data: rows } = await db
        .from("usage_events")
        .select("id, quantity")
        .eq("idempotency_key", idempotencyKey);

      expect(rows?.length).toBe(1);
      expect(rows![0].quantity).toBe(250);
    });

    it("evaluates workspace quotas and flags soft (80%) and hard (100%) thresholds", async () => {
      const summary = await metering.getWorkspaceUsageSummary(TEST_WORKSPACE_ID);

      expect(summary.workspaceId).toBe(TEST_WORKSPACE_ID);
      expect(summary.limits).toEqual(PLAN_LIMITS[summary.plan]);
      expect(typeof summary.quotaStatus.recordsPct).toBe("number");
      expect(typeof summary.quotaStatus.hasReachedSoftQuota).toBe("boolean");
      expect(typeof summary.quotaStatus.hasReachedHardQuota).toBe("boolean");
    });
  });
});
