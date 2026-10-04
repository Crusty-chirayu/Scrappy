import { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseAdminClient } from "@scrappy/db";
import {
  UsageRecordParams,
  WorkspaceUsageSummary,
  PLAN_LIMITS,
  PlanTier,
} from "./types.js";

export class UsageMeteringService {
  private db: SupabaseClient;

  constructor(dbClient?: SupabaseClient) {
    this.db = dbClient || getSupabaseAdminClient();
  }

  /**
   * Records a usage event with strict idempotency.
   * If an event with the same idempotencyKey already exists, it is ignored (returns existing: true).
   */
  public async recordUsage(params: UsageRecordParams): Promise<{
    recorded: boolean;
    isDuplicate: boolean;
    quantity: number;
  }> {
    // 1. Check if idempotency key already exists
    const { data: existing } = await this.db
      .from("usage_events")
      .select("id, quantity")
      .eq("idempotency_key", params.idempotencyKey)
      .maybeSingle();

    if (existing) {
      return {
        recorded: false,
        isDuplicate: true,
        quantity: existing.quantity,
      };
    }

    // 2. Insert new usage event
    const { error } = await this.db.from("usage_events").insert({
      workspace_id: params.workspaceId,
      event_type: params.metric,
      quantity: params.quantity,
      idempotency_key: params.idempotencyKey,
    });

    if (error) {
      // If race condition on idempotency key, treat as duplicate
      if (error.code === "23505") {
        return {
          recorded: false,
          isDuplicate: true,
          quantity: params.quantity,
        };
      }
      throw new Error(`Failed to record usage event: ${error.message}`);
    }

    return {
      recorded: true,
      isDuplicate: false,
      quantity: params.quantity,
    };
  }

  /**
   * Aggregates usage for a workspace across all metrics in the current billing cycle.
   */
  public async getWorkspaceUsageSummary(workspaceId: string): Promise<WorkspaceUsageSummary> {
    // 1. Fetch workspace plan
    const { data: ws } = await this.db
      .from("workspaces")
      .select("id, plan, created_at")
      .eq("id", workspaceId)
      .single();

    const plan = ((ws?.plan as PlanTier) || "free") as PlanTier;
    const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.free;

    // 2. Query usage events for this workspace
    const { data: events } = await this.db
      .from("usage_events")
      .select("event_type, quantity")
      .eq("workspace_id", workspaceId);

    let recordsExtracted = 0;
    let browserMinutes = 0;
    let apiRequests = 0;
    let trackedProducts = 0;

    for (const ev of events || []) {
      const qty = Number(ev.quantity) || 0;
      switch (ev.event_type) {
        case "records_extracted":
          recordsExtracted += qty;
          break;
        case "browser_minutes":
          browserMinutes += qty;
          break;
        case "api_requests":
          apiRequests += qty;
          break;
        case "tracked_products":
          trackedProducts += qty;
          break;
      }
    }

    const recordsPct = Math.min(100, Math.round((recordsExtracted / limits.recordsPerMonth) * 100));
    const browserMinutesPct = Math.min(
      100,
      Math.round((browserMinutes / limits.browserMinutes) * 100),
    );

    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

    return {
      workspaceId,
      plan,
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd,
      recordsExtracted,
      browserMinutes,
      apiRequests,
      trackedProducts,
      limits,
      quotaStatus: {
        recordsPct,
        browserMinutesPct,
        hasReachedSoftQuota: recordsPct >= 80 || browserMinutesPct >= 80,
        hasReachedHardQuota: recordsPct >= 100 || browserMinutesPct >= 100,
      },
    };
  }
}

export const defaultUsageMetering = new UsageMeteringService();
