import {
  defaultSupabaseRepository,
  signWebhookPayload,
  verifyWebhookSignature,
} from "@scrappy/db";

async function runG6Demo() {
  console.info("=== G6 LIVE WEBHOOK HMAC SIGNATURE & REPLAY DEMO ===");
  const workspaceId = "e0000000-0000-0000-0000-000000000001";
  const targetUrl = "https://receiver.example.com/api/scrappy-webhook";

  // Step 1: Create Webhook Endpoint
  console.info("\nStep 1: Registering webhook endpoint with raw secret generation...");
  const { webhook, rawSecret } = await defaultSupabaseRepository.createWebhook({
    workspaceId,
    targetUrl,
    events: ["price.drop"],
  });
  console.info(`Registered Webhook ID: ${webhook.id}`);
  console.info(`Show-once raw secret: ${rawSecret.substring(0, 12)}... (Stored as SHA-256 hash: ${webhook.secretHash})`);

  // Step 2: Sign and Deliver Webhook with Valid HMAC
  console.info("\nStep 2: Constructing and delivering signed webhook event...");
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const payloadData = {
    event: "price.drop",
    productId: "b2000000-0000-0000-0000-000000000001",
    oldPricePaise: 4999900,
    newPricePaise: 3899900,
    dropPct: 22.0,
    timestamp: new Date().toISOString(),
  };
  const payloadStr = JSON.stringify(payloadData);

  // Compute standard v1 HMAC using canonical signWebhookPayload
  const signatureHeader = signWebhookPayload(payloadStr, rawSecret, currentTimestamp);

  console.info(`Computed HMAC Header: ${signatureHeader}`);

  // Record initial delivery
  const initialDelivery = await defaultSupabaseRepository.recordWebhookDelivery({
    webhookId: webhook.id,
    workspaceId,
    eventType: "price.drop",
    payload: payloadData,
    responseStatus: 200,
    signature: signatureHeader,
    latencyMs: 42,
  });
  console.info(`Delivery 1 recorded in Postgres: ID=${initialDelivery.id}, status=${initialDelivery.responseStatus}`);

  // Step 3: Receiver Validates HMAC
  console.info("\nStep 3: Validating HMAC on receiver side...");
  const initialVerification = verifyWebhookSignature({
    payload: payloadStr,
    signatureHeader,
    secret: rawSecret,
  });
  console.info(`Initial Verification Result: valid=${initialVerification.isValid}`);
  if (!initialVerification.isValid) {
    throw new Error(`Expected initial verification to succeed: ${initialVerification.reason}`);
  }

  // Step 4: Replay Webhook from Delivery Log
  console.info("\nStep 4: Replaying webhook delivery from delivery log...");
  const replayDelivery = await defaultSupabaseRepository.recordWebhookDelivery({
    webhookId: webhook.id,
    workspaceId,
    eventType: "price.drop",
    payload: initialDelivery.payload,
    responseStatus: 200,
    signature: signatureHeader,
    latencyMs: 35,
  });
  console.info(`Replayed delivery recorded: ID=${replayDelivery.id}, replayedSignature=${replayDelivery.signature.substring(0, 30)}...`);

  const deliveries = await defaultSupabaseRepository.getWebhookDeliveries(workspaceId, webhook.id);
  console.info(`Total webhook deliveries logged in Postgres: ${deliveries.length}`);

  // Step 5: Test Replay Defense against Stale Signatures (> 300s window)
  console.info("\nStep 5: Testing Replay Attack Defense (stale signature > 300s)...");
  const staleTimestamp = currentTimestamp - 400; // 400 seconds ago (> 300s tolerance)
  const staleHeader = signWebhookPayload(payloadStr, rawSecret, staleTimestamp);

  const replayAttackResult = verifyWebhookSignature({
    payload: payloadStr,
    signatureHeader: staleHeader,
    secret: rawSecret,
    toleranceSeconds: 300,
  });
  console.info(`Stale Signature Verification Result: valid=${replayAttackResult.isValid}, reason="${replayAttackResult.reason}"`);

  if (replayAttackResult.isValid || replayAttackResult.reason !== "timestamp_expired") {
    throw new Error("Security failure: Stale replayed webhook was not rejected!");
  }

  // Cleanup
  await defaultSupabaseRepository.deleteWebhook(workspaceId, webhook.id);
  console.info("\nSUCCESS: G6 Webhook Delivered with Valid HMAC, Replayed & Stale Replay Defended.");
}

runG6Demo().catch((err) => {
  console.error("G6 Demo Failed:", err);
  process.exit(1);
});
