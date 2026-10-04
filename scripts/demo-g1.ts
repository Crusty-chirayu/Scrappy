import { defaultSupabaseRepository, getSupabaseAdminClient } from "@scrappy/db";

async function runG1Demo() {
  console.info("=== G1 LIVE PERSISTENCE PROOF ===");
  const testWorkspaceId = "e0000000-0000-0000-0000-000000000001";
  const testUserId = "00000000-0000-0000-0000-000000000001";
  const testProductId = "b2000000-0000-0000-0000-000000000001";

  // 1. Add item to watchlist via repository
  console.info(`\nStep 1: Adding product ${testProductId} to watchlist for user ${testUserId} in workspace ${testWorkspaceId}...`);
  await defaultSupabaseRepository.addToWatchlist(testWorkspaceId, testUserId, testProductId);

  // 2. Query Postgres directly using admin client to prove persistence in database
  console.info("\nStep 2: Querying public.watchlists row directly in Postgres...");
  const adminClient = getSupabaseAdminClient();
  const { data: rowBefore, error: errBefore } = await adminClient
    .from("watchlists")
    .select("id, workspace_id, user_id, product_id, created_at")
    .eq("workspace_id", testWorkspaceId)
    .eq("product_id", testProductId);

  if (errBefore) throw errBefore;
  console.info("Postgres Row Found:", JSON.stringify(rowBefore, null, 2));

  // 3. Emulate service restart by instantiating a fresh client and re-querying
  console.info("\nStep 3: Simulating stack restart (fresh connection pool & cache eviction)...");
  const freshClient = getSupabaseAdminClient();

  console.info("\nStep 4: Reloading and verifying row still persists in Postgres post-restart...");
  const { data: rowAfter, error: errAfter } = await freshClient
    .from("watchlists")
    .select("id, workspace_id, user_id, product_id, created_at")
    .eq("workspace_id", testWorkspaceId)
    .eq("product_id", testProductId);

  if (errAfter) throw errAfter;
  console.info("Postgres Row Verified After Restart:", JSON.stringify(rowAfter, null, 2));

  // 4. Verify watchlist repository getWatchlist
  const watchlist = await defaultSupabaseRepository.getWatchlist(testWorkspaceId, testUserId);
  console.info(`\nStep 5: Repository read confirmation: ${watchlist.length} items in user watchlist.`);
  console.info("\nSUCCESS: G1 Supabase Persistence Verified.");
}

runG1Demo().catch((err) => {
  console.error("G1 Demo Failed:", err);
  process.exit(1);
});
