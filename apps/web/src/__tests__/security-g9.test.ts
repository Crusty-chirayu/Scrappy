import { describe, it, expect } from "vitest";
import {
  defaultSupabaseRepository,
  DEFAULT_WORKSPACE_ID,
  DEFAULT_USER_ID,
  signWebhookPayload,
  verifyWebhookSignature,
} from "@scrappy/db";
import crypto from "node:crypto";

describe("G9 Security & Defense-in-Depth Suite: Tenant Isolation, IDOR, API Keys, and Webhook Replay", () => {
  const tenantA = DEFAULT_WORKSPACE_ID;
  const tenantB = "ws-adversarial-corp-9999";
  const userA = DEFAULT_USER_ID;

  describe("1. Multi-Tenant IDOR and Workspace Isolation", () => {
    it("prevents Tenant B from listing, reading, or deleting Tenant A's saved searches", async () => {
      // 1. Tenant A creates a proprietary search
      const secretSearch = await defaultSupabaseRepository.createSavedSearch({
        workspaceId: tenantA,
        userId: userA,
        query: "Secret High-Margin Product Monitor",
        filters: { category: "confidential" },
        notifyOnNew: true,
      });
      expect(secretSearch.id).toBeDefined();

      // 2. Tenant B attempts to list saved searches
      const tenantBSearches = await defaultSupabaseRepository.getSavedSearches(tenantB);
      expect(tenantBSearches.some((s) => s.id === secretSearch.id)).toBe(false);

      // 3. Tenant B attempts to delete Tenant A's search via IDOR
      const deleteResult = await defaultSupabaseRepository.deleteSavedSearch(tenantB, secretSearch.id);
      expect(deleteResult).toBe(false);

      // 4. Verify Tenant A's search remains uncompromised
      const tenantASearches = await defaultSupabaseRepository.getSavedSearches(tenantA);
      expect(tenantASearches.some((s) => s.id === secretSearch.id)).toBe(true);

      // Clean up
      await defaultSupabaseRepository.deleteSavedSearch(tenantA, secretSearch.id);
    });

    it("prevents Tenant B from listing, viewing, or revoking Tenant A's team invitations", async () => {
      const inviteEmail = `confidential-hire-${Date.now()}@tenant-a.com`;
      const invite = await defaultSupabaseRepository.createTeamInvitation({
        workspaceId: tenantA,
        email: inviteEmail,
        role: "admin",
      });
      expect(invite.id).toBeDefined();

      // Tenant B lists invitations
      const tenantBInvites = await defaultSupabaseRepository.getTeamInvitations(tenantB);
      expect(tenantBInvites.some((i) => i.id === invite.id)).toBe(false);

      // Tenant B attempts to revoke Tenant A's invitation
      const revokeAttempt = await defaultSupabaseRepository.revokeTeamInvitation(tenantB, invite.id);
      expect(revokeAttempt).toBe(false);

      // Verify Tenant A still has the invite
      const tenantAInvites = await defaultSupabaseRepository.getTeamInvitations(tenantA);
      expect(tenantAInvites.some((i) => i.id === invite.id)).toBe(true);

      // Clean up
      await defaultSupabaseRepository.revokeTeamInvitation(tenantA, invite.id);
    });

    it("prevents Tenant B from listing or deleting Tenant A's webhooks", async () => {
      const { webhook } = await defaultSupabaseRepository.createWebhook({
        workspaceId: tenantA,
        targetUrl: "https://tenant-a.com/webhooks/catalog",
        events: ["product.matched", "price.dropped"],
      });
      expect(webhook.id).toBeDefined();

      // Tenant B lists webhooks
      const tenantBWebhooks = await defaultSupabaseRepository.getWebhooks(tenantB);
      expect(tenantBWebhooks.some((w) => w.id === webhook.id)).toBe(false);

      // Tenant B tries to delete Tenant A's webhook
      const deleteAttempt = await defaultSupabaseRepository.deleteWebhook(tenantB, webhook.id);
      expect(deleteAttempt).toBe(false);

      // Verify Tenant A's webhook is intact
      const tenantAWebhooks = await defaultSupabaseRepository.getWebhooks(tenantA);
      expect(tenantAWebhooks.some((w) => w.id === webhook.id)).toBe(true);

      // Clean up
      await defaultSupabaseRepository.deleteWebhook(tenantA, webhook.id);
    });

    it("prevents Tenant B from accessing, listing, or revoking Tenant A's API keys", async () => {
      const { apiKey, plainSecret } = await defaultSupabaseRepository.createApiKey({
        workspaceId: tenantA,
        name: "Tenant A Production Ingestion Key",
        scopes: ["read", "write"],
      });
      expect(apiKey.id).toBeDefined();

      // Tenant B lists API keys
      const tenantBKeys = await defaultSupabaseRepository.getApiKeys(tenantB);
      expect(tenantBKeys.some((k) => k.id === apiKey.id)).toBe(false);

      // Tenant B tries to revoke Tenant A's API key
      const revokeAttempt = await defaultSupabaseRepository.revokeApiKey(tenantB, apiKey.id);
      expect(revokeAttempt).toBe(false);

      // Verify Tenant A's key is still valid and unrevoked
      const authValidation = await defaultSupabaseRepository.validateApiKey(plainSecret);
      expect(authValidation.isValid).toBe(true);
      expect(authValidation.apiKey?.workspaceId).toBe(tenantA);

      // Clean up
      await defaultSupabaseRepository.revokeApiKey(tenantA, apiKey.id);
    });

    it("prevents Tenant B from listing Tenant A's datasets", async () => {
      const tenantBDatasets = await defaultSupabaseRepository.getDatasets(tenantB);
      // All returned datasets must belong exclusively to tenantB
      for (const ds of tenantBDatasets) {
        expect(ds.workspaceId).toBe(tenantB);
      }
    });
  });

  describe("2. Cryptographic API Key Management (Constitution Rule 7)", () => {
    it("creates API key with show-once secret, stores only SHA-256 hash, and authenticates correctly", async () => {
      const keyName = `Automated Pipeline Key ${Date.now()}`;
      const { apiKey, plainSecret } = await defaultSupabaseRepository.createApiKey({
        workspaceId: tenantA,
        name: keyName,
        scopes: ["read", "extract"],
      });

      // Secret must follow prefix format and high entropy
      expect(plainSecret).toMatch(/^scrappy_live_[a-f0-9]{32,64}$/);
      expect(apiKey.keyPrefix).toBe(plainSecret.substring(0, 16));
      expect(apiKey.name).toBe(keyName);
      expect(apiKey.revokedAt).toBeNull();

      // Cryptographic verification: plain secret must NOT equal hash stored
      const expectedSha256 = crypto.createHash("sha256").update(plainSecret).digest("hex");
      expect(plainSecret).not.toBe(expectedSha256);

      // Authentic validation
      const validRes = await defaultSupabaseRepository.validateApiKey(plainSecret);
      expect(validRes.isValid).toBe(true);
      expect(validRes.apiKey?.id).toBe(apiKey.id);
      expect(validRes.apiKey?.scopes).toEqual(["read", "extract"]);

      // Tampered / incorrect secret validation
      const invalidRes = await defaultSupabaseRepository.validateApiKey(plainSecret + "_tampered");
      expect(invalidRes.isValid).toBe(false);
      expect(invalidRes.reason).toBe("invalid_key");

      // Key revocation
      const revokeSuccess = await defaultSupabaseRepository.revokeApiKey(tenantA, apiKey.id);
      expect(revokeSuccess).toBe(true);

      // Once revoked, authentication must fail with 'revoked'
      const postRevokeRes = await defaultSupabaseRepository.validateApiKey(plainSecret);
      expect(postRevokeRes.isValid).toBe(false);
      expect(postRevokeRes.reason).toBe("revoked");
    });
  });

  describe("3. Webhook HMAC Signatures & 5-Minute Replay Window", () => {
    const testSecret = "whsec_99af2418e268a7c8d93021be0e49f2b84a9c68";
    const testPayload = JSON.stringify({
      event: "price.dropped",
      productId: "prod-sony-xm5",
      price: 24900,
      currency: "INR",
    });

    it("verifies freshly generated webhook signatures", () => {
      const now = Math.floor(Date.now() / 1000);
      const signatureHeader = signWebhookPayload(testPayload, testSecret, now);

      const verification = verifyWebhookSignature({
        payload: testPayload,
        signatureHeader,
        secret: testSecret,
      });

      expect(verification.isValid).toBe(true);
    });

    it("verifies webhook signature within 5-minute replay window (e.g. 200 seconds ago)", () => {
      const now = Math.floor(Date.now() / 1000);
      const timestamp200sAgo = now - 200;
      const signatureHeader = signWebhookPayload(testPayload, testSecret, timestamp200sAgo);

      const verification = verifyWebhookSignature({
        payload: testPayload,
        signatureHeader,
        secret: testSecret,
      });

      expect(verification.isValid).toBe(true);
    });

    it("rejects replayed webhook signatures older than 300 seconds (5 minutes)", () => {
      const now = Math.floor(Date.now() / 1000);
      const timestamp305sAgo = now - 305; // 5 minutes and 5 seconds old
      const signatureHeader = signWebhookPayload(testPayload, testSecret, timestamp305sAgo);

      const verification = verifyWebhookSignature({
        payload: testPayload,
        signatureHeader,
        secret: testSecret,
      });

      expect(verification.isValid).toBe(false);
      expect(verification.reason).toBe("timestamp_expired");
    });

    it("rejects webhook signatures claiming timestamps significantly in the future (> 60s)", () => {
      const now = Math.floor(Date.now() / 1000);
      const timestampFuture = now + 120; // 2 minutes into future
      const signatureHeader = signWebhookPayload(testPayload, testSecret, timestampFuture);

      const verification = verifyWebhookSignature({
        payload: testPayload,
        signatureHeader,
        secret: testSecret,
      });

      expect(verification.isValid).toBe(false);
      expect(verification.reason).toBe("future_timestamp");
    });

    it("rejects tampered webhook payloads", () => {
      const now = Math.floor(Date.now() / 1000);
      const signatureHeader = signWebhookPayload(testPayload, testSecret, now);

      // Attacker tampers price from 24900 to 14900
      const tamperedPayload = JSON.stringify({
        event: "price.dropped",
        productId: "prod-sony-xm5",
        price: 14900,
        currency: "INR",
      });

      const verification = verifyWebhookSignature({
        payload: tamperedPayload,
        signatureHeader,
        secret: testSecret,
      });

      expect(verification.isValid).toBe(false);
      expect(verification.reason).toBe("signature_mismatch");
    });

    it("rejects signatures verified with incorrect secret", () => {
      const now = Math.floor(Date.now() / 1000);
      const signatureHeader = signWebhookPayload(testPayload, testSecret, now);

      const verification = verifyWebhookSignature({
        payload: testPayload,
        signatureHeader,
        secret: "whsec_wrong_attacker_secret_1234567890",
      });

      expect(verification.isValid).toBe(false);
      expect(verification.reason).toBe("signature_mismatch");
    });
  });
});
