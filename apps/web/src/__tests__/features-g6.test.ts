import { describe, it, expect } from "vitest";
import {
  defaultSupabaseRepository,
  DEFAULT_WORKSPACE_ID,
  DEFAULT_USER_ID,
  signWebhookPayload,
} from "@scrappy/db";
import { defaultUsageMetering } from "@scrappy/pricing";

describe("G6 Remaining Product Features E2E Integration Suite", () => {
  const testWorkspaceId = DEFAULT_WORKSPACE_ID;
  const testUserId = DEFAULT_USER_ID;

  describe("1. Saved Searches", () => {
    it("creates, retrieves, and deletes a saved search in real Supabase database", async () => {
      const created = await defaultSupabaseRepository.createSavedSearch({
        workspaceId: testWorkspaceId,
        userId: testUserId,
        query: "Ultra HD Monitor 4K",
        filters: { category: "monitors", minPrice: 2000000 },
        notifyOnNew: true,
      });

      expect(created.id).toBeDefined();
      expect(created.query).toBe("Ultra HD Monitor 4K");
      expect(created.notifyOnNew).toBe(true);

      const allSearches = await defaultSupabaseRepository.getSavedSearches(testWorkspaceId);
      const found = allSearches.find((s) => s.id === created.id);
      expect(found).toBeDefined();
      expect(found?.query).toBe("Ultra HD Monitor 4K");

      const deleted = await defaultSupabaseRepository.deleteSavedSearch(testWorkspaceId, created.id);
      expect(deleted).toBe(true);

      const afterDelete = await defaultSupabaseRepository.getSavedSearches(testWorkspaceId);
      expect(afterDelete.find((s) => s.id === created.id)).toBeUndefined();
    });
  });

  describe("2. Team Invites and Roles", () => {
    it("creates an invitation, lists pending invites, and revokes it", async () => {
      const testEmail = `dev-${Date.now()}@example.com`;
      const invite = await defaultSupabaseRepository.createTeamInvitation({
        workspaceId: testWorkspaceId,
        email: testEmail,
        role: "admin",
      });

      expect(invite.id).toBeDefined();
      expect(invite.email).toBe(testEmail);
      expect(invite.role).toBe("admin");
      expect(invite.token).toHaveLength(48); // 24 hex bytes = 48 chars

      const invites = await defaultSupabaseRepository.getTeamInvitations(testWorkspaceId);
      expect(invites.some((i) => i.id === invite.id)).toBe(true);

      const revoked = await defaultSupabaseRepository.revokeTeamInvitation(testWorkspaceId, invite.id);
      expect(revoked).toBe(true);

      const afterRevoke = await defaultSupabaseRepository.getTeamInvitations(testWorkspaceId);
      expect(afterRevoke.some((i) => i.id === invite.id)).toBe(false);
    });

    it("fetches active workspace members", async () => {
      const members = await defaultSupabaseRepository.getTeamMembers(testWorkspaceId);
      expect(Array.isArray(members)).toBe(true);
      expect(members.length).toBeGreaterThan(0);
      expect(members[0]!.role).toBeDefined();
    });
  });

  describe("3. Webhooks & HMAC Signed Deliveries", () => {
    it("registers a webhook, computes SHA-256 secret hash, and verifies show-once secret", async () => {
      const targetUrl = "https://mock-receiver.scrappy.io/webhook/prices";
      const { webhook, rawSecret } = await defaultSupabaseRepository.createWebhook({
        workspaceId: testWorkspaceId,
        targetUrl,
        events: ["price.drop", "price.spike"],
      });

      expect(webhook.id).toBeDefined();
      expect(webhook.targetUrl).toBe(targetUrl);
      expect(webhook.secretHash).toBeDefined();
      expect(webhook.secretHash).not.toBe(rawSecret); // Only hash is stored
      expect(rawSecret.startsWith("whsec_")).toBe(true);

      // Verify HMAC-SHA256 signature generation
      const payload = { event: "price.drop", productId: "p-123", newPricePaise: 99900 };
      const signature = signWebhookPayload(payload, webhook.secretHash);
      expect(signature).toBeDefined();
      expect(typeof signature).toBe("string");

      // Record a delivery log entry
      const delivery = await defaultSupabaseRepository.recordWebhookDelivery({
        webhookId: webhook.id,
        workspaceId: testWorkspaceId,
        eventType: "price.drop",
        payload,
        responseStatus: 200,
        signature,
        latencyMs: 38,
      });

      expect(delivery.id).toBeDefined();
      expect(delivery.responseStatus).toBe(200);
      expect(delivery.signature).toBe(signature);

      // Fetch deliveries
      const deliveries = await defaultSupabaseRepository.getWebhookDeliveries(testWorkspaceId, webhook.id);
      expect(deliveries.some((d) => d.id === delivery.id)).toBe(true);

      // Clean up webhook
      const deleted = await defaultSupabaseRepository.deleteWebhook(testWorkspaceId, webhook.id);
      expect(deleted).toBe(true);
    });
  });

  describe("4. Usage Metering with Idempotency", () => {
    it("deduplicates usage events with identical idempotency keys", async () => {
      const idempotencyKey = `meter-test-${Date.now()}`;

      const firstRecord = await defaultUsageMetering.recordUsage({
        workspaceId: testWorkspaceId,
        metric: "records_extracted",
        quantity: 50,
        idempotencyKey,
      });

      expect(firstRecord.recorded).toBe(true);
      expect(firstRecord.isDuplicate).toBe(false);

      // Second attempt with exact same key must be deduplicated
      const secondRecord = await defaultUsageMetering.recordUsage({
        workspaceId: testWorkspaceId,
        metric: "records_extracted",
        quantity: 50,
        idempotencyKey,
      });

      expect(secondRecord.recorded).toBe(false);
      expect(secondRecord.isDuplicate).toBe(true);

      // Usage summary contains current period metrics and quota checks
      const summary = await defaultUsageMetering.getWorkspaceUsageSummary(testWorkspaceId);
      expect(summary.workspaceId).toBe(testWorkspaceId);
      expect(summary.recordsExtracted).toBeGreaterThanOrEqual(50);
      expect(summary.limits.recordsPerMonth).toBeGreaterThan(0);
      expect(summary.quotaStatus).toBeDefined();
    });
  });

  describe("5. Extract Run Lifecycle, Streaming Logs & Datasets", () => {
    it("runs complete lifecycle from queued to completed with streaming logs and persistent datasets", async () => {
      // 1. Create run
      const run = await defaultSupabaseRepository.createExtractRun({
        workspaceId: testWorkspaceId,
      });
      expect(run.id).toBeDefined();
      expect(run.status).toBe("running");

      // 2. Append streaming logs
      await defaultSupabaseRepository.appendExtractRunLog({
        runId: run.id,
        workspaceId: testWorkspaceId,
        level: "info",
        message: "Extractor started headless browser context",
        meta: { browser: "chromium" },
      });

      await defaultSupabaseRepository.appendExtractRunLog({
        runId: run.id,
        workspaceId: testWorkspaceId,
        level: "info",
        message: "DOM parsed 5 items with 100% selector resilience score",
      });

      // 3. Verify logs
      const logs = await defaultSupabaseRepository.getExtractRunLogs(run.id);
      expect(logs.length).toBe(2);
      expect(logs[0]!.message).toContain("Extractor started");

      // 4. Create dataset with records
      const sampleRecords = [
        { title: "Item A", price: 1000 },
        { title: "Item B", price: 2000 },
      ];

      const { dataset, recordCount } = await defaultSupabaseRepository.createDataset({
        workspaceId: testWorkspaceId,
        name: `Test Dataset ${Date.now()}`,
        schema: [{ name: "title" }, { name: "price" }],
        records: sampleRecords,
      });

      expect(dataset.id).toBeDefined();
      expect(recordCount).toBe(2);

      // 5. Update run status to completed
      const updated = await defaultSupabaseRepository.updateExtractRun(run.id, {
        status: "completed",
        recordsExtracted: 2,
      });
      expect(updated).toBe(true);

      // 6. Verify dataset records retrieval
      const storedRecords = await defaultSupabaseRepository.getDatasetRecords(dataset.id);
      expect(storedRecords.length).toBe(2);
      expect(storedRecords[0]!["title"]).toBe("Item A");
    });
  });
});
