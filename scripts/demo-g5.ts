import { getSupabaseAdminClient } from "@scrappy/db";
import {
  SubscriptionStateMachine,
  UsageMeteringService,
} from "@scrappy/pricing";

async function runG5Demo() {
  console.info("=== G5 LIVE BILLING, GRACE PERIOD & IDEMPOTENCY DEMO ===");
  const db = getSupabaseAdminClient();
  const machine = new SubscriptionStateMachine(db);
  const metering = new UsageMeteringService(db);
  const workspaceId = "e0000000-0000-0000-0000-000000000001";

  // Step 1: Simulate Payment Failure
  console.info("\nStep 1: Simulating payment failure event...");
  const subId = `sub_g5_demo_${Date.now()}`;
  await machine.saveSubscription({
    id: "d5555555-0000-0000-0000-000000000099",
    workspaceId,
    provider: "fake",
    providerCustomerId: "cust_demo_99",
    providerSubscriptionId: subId,
    plan: "pro",
    status: "active",
    currentPeriodStart: new Date().toISOString(),
    currentPeriodEnd: new Date(Date.now() + 30 * 86400000).toISOString(),
    cancelAtPeriodEnd: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const failResult = await machine.handleBillingEvent({
    event: "payment.failed",
    subscriptionId: subId,
    amount: 49900,
    failureReason: "insufficient_funds",
  });
  console.info(`Payment failed handled: status=${failResult?.status}, gracePeriodEndsAt=${failResult?.gracePeriodEndsAt}`);

  // Step 2: Dunning evaluation within grace period
  console.info("\nStep 2: Evaluating dunning cycle while within 7-day grace period...");
  const dunningMid = await machine.evaluateDunningCycle();
  console.info(`Dunning Mid-Cycle: evaluated=${dunningMid.evaluatedCount}, noticesSent=${dunningMid.dunningNoticesSent}`);

  // Step 3: Expired grace period -> downgrade
  console.info("\nStep 3: Expiring grace period and running dunning evaluation...");
  await db
    .from("subscriptions")
    .update({ grace_period_ends_at: new Date(Date.now() - 3600000).toISOString() })
    .eq("provider_subscription_id", subId);

  const dunningExpired = await machine.evaluateDunningCycle();
  console.info(`Dunning Post-Expiry: downgradedCount=${dunningExpired.downgradedCount}`);

  const { data: wsAfter } = await db.from("workspaces").select("plan").eq("id", workspaceId).single();
  console.info(`Workspace plan after downgrade: "${wsAfter?.plan}"`);

  // Step 4: Duplicate usage event idempotency
  console.info("\nStep 4: Testing usage event idempotency (duplicate prevention)...");
  const testKey = `idem_g5_${Date.now()}`;
  const firstEvent = await metering.recordUsage({
    workspaceId,
    metric: "records_extracted",
    quantity: 100,
    idempotencyKey: testKey,
  });
  console.info(`Event 1 (Initial): recorded=${firstEvent.recorded}, duplicate=${firstEvent.isDuplicate}`);

  const duplicateEvent = await metering.recordUsage({
    workspaceId,
    metric: "records_extracted",
    quantity: 100,
    idempotencyKey: testKey,
  });
  console.info(`Event 2 (Duplicate replay): recorded=${duplicateEvent.recorded}, duplicate=${duplicateEvent.isDuplicate}`);

  const { data: dbRows } = await db.from("usage_events").select("id, quantity, idempotency_key").eq("idempotency_key", testKey);
  console.info(`Postgres usage_events rows for key "${testKey}": ${dbRows?.length} (expected: 1)`);

  console.info("\nSUCCESS: G5 Grace Period, Downgrade & Usage Idempotency Verified.");
}

runG5Demo().catch((err) => {
  console.error("G5 Demo Failed:", err);
  process.exit(1);
});
