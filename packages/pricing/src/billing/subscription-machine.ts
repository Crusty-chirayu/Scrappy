import { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseAdminClient } from "@scrappy/db";
import {
  BillingSubscription,
  SubscriptionStatus,
  PlanTier,
  BillingWebhookEvent,
} from "./types.js";

export interface DunningEvaluationResult {
  evaluatedCount: number;
  dunningNoticesSent: number;
  downgradedCount: number;
  details: Array<{
    subscriptionId: string;
    workspaceId: string;
    action: "notice_sent" | "downgraded" | "no_action";
    daysRemaining: number;
  }>;
}

export class SubscriptionStateMachine {
  private db: SupabaseClient;

  constructor(dbClient?: SupabaseClient) {
    this.db = dbClient || getSupabaseAdminClient();
  }

  /**
   * Processes incoming billing events and transitions subscription state.
   */
  public async handleBillingEvent(event: BillingWebhookEvent): Promise<BillingSubscription | null> {
    if (!event.subscriptionId) return null;

    const { data: subRow } = await this.db
      .from("subscriptions")
      .select("*")
      .eq("provider_subscription_id", event.subscriptionId)
      .maybeSingle();

    if (!subRow) return null;

    const now = new Date();

    switch (event.event) {
      case "subscription.charged":
      case "payment.captured": {
        // Extend period by 30 days, clear past_due and dunning state
        const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

        const { data: updated } = await this.db
          .from("subscriptions")
          .update({
            status: "active",
            current_period_start: now.toISOString(),
            current_period_end: periodEnd.toISOString(),
            grace_period_ends_at: null,
            dunning_attempt_count: 0,
            last_dunning_at: null,
            updated_at: now.toISOString(),
          })
          .eq("id", subRow.id)
          .select()
          .single();

        // Update workspace plan
        await this.db
          .from("workspaces")
          .update({ plan: subRow.plan })
          .eq("id", subRow.workspace_id);

        return this.mapRowToSubscription(updated);
      }

      case "payment.failed": {
        // Transition to past_due, set 7-day grace period
        const graceEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

        const { data: updated } = await this.db
          .from("subscriptions")
          .update({
            status: "past_due",
            grace_period_ends_at: graceEnd.toISOString(),
            dunning_attempt_count: 1,
            last_dunning_at: now.toISOString(),
            updated_at: now.toISOString(),
          })
          .eq("id", subRow.id)
          .select()
          .single();

        return this.mapRowToSubscription(updated);
      }

      case "subscription.cancelled": {
        const { data: updated } = await this.db
          .from("subscriptions")
          .update({
            status: "cancelled",
            cancel_at_period_end: true,
            cancelled_at: now.toISOString(),
            updated_at: now.toISOString(),
          })
          .eq("id", subRow.id)
          .select()
          .single();

        return this.mapRowToSubscription(updated);
      }

      default:
        return this.mapRowToSubscription(subRow);
    }
  }

  /**
   * Dunning cycle evaluation. Run by pg-boss scheduler hourly.
   * Checks past_due subscriptions: sends notices on days 1, 3, 6, and downgrades past day 7.
   */
  public async evaluateDunningCycle(): Promise<DunningEvaluationResult> {
    const { data: pastDueSubs } = await this.db
      .from("subscriptions")
      .select("*")
      .eq("status", "past_due");

    const now = new Date();
    const result: DunningEvaluationResult = {
      evaluatedCount: (pastDueSubs || []).length,
      dunningNoticesSent: 0,
      downgradedCount: 0,
      details: [],
    };

    for (const sub of pastDueSubs || []) {
      const graceEnd = sub.grace_period_ends_at
        ? new Date(sub.grace_period_ends_at)
        : new Date(now.getTime() - 1000);

      const msRemaining = graceEnd.getTime() - now.getTime();
      const daysRemaining = Math.max(0, Math.ceil(msRemaining / (24 * 60 * 60 * 1000)));

      if (now.getTime() >= graceEnd.getTime()) {
        // Grace period expired -> Downgrade to free
        await this.db
          .from("subscriptions")
          .update({
            status: "expired",
            updated_at: now.toISOString(),
          })
          .eq("id", sub.id);

        await this.db
          .from("workspaces")
          .update({ plan: "free" })
          .eq("id", sub.workspace_id);

        result.downgradedCount++;
        result.details.push({
          subscriptionId: sub.id,
          workspaceId: sub.workspace_id,
          action: "downgraded",
          daysRemaining: 0,
        });
      } else {
        // Send dunning notification
        const attempts = (sub.dunning_attempt_count || 0) + 1;

        await this.db
          .from("subscriptions")
          .update({
            dunning_attempt_count: attempts,
            last_dunning_at: now.toISOString(),
            updated_at: now.toISOString(),
          })
          .eq("id", sub.id);

        // Record in-app notification
        await this.db.from("notifications").insert({
          workspace_id: sub.workspace_id,
          user_id: "00000000-0000-0000-0000-000000000001",
          title: "Payment Past Due: Update Payment Method",
          message: `Your subscription payment could not be processed. ${daysRemaining} days remaining in grace period before account downgrade.`,
          link: "/settings/billing",
          is_read: false,
        });

        result.dunningNoticesSent++;
        result.details.push({
          subscriptionId: sub.id,
          workspaceId: sub.workspace_id,
          action: "notice_sent",
          daysRemaining,
        });
      }
    }

    return result;
  }

  public async getSubscription(workspaceId: string): Promise<BillingSubscription | null> {
    const { data } = await this.db
      .from("subscriptions")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    return data ? this.mapRowToSubscription(data) : null;
  }

  public async saveSubscription(sub: BillingSubscription): Promise<BillingSubscription> {
    const row = {
      workspace_id: sub.workspaceId,
      provider: sub.provider,
      provider_customer_id: sub.providerCustomerId,
      provider_subscription_id: sub.providerSubscriptionId,
      plan: sub.plan,
      status: sub.status,
      current_period_start: sub.currentPeriodStart,
      current_period_end: sub.currentPeriodEnd,
      cancel_at_period_end: sub.cancelAtPeriodEnd,
      cancelled_at: sub.cancelledAt,
      grace_period_ends_at: sub.gracePeriodEndsAt,
      dunning_attempt_count: sub.dunningAttemptCount,
      last_dunning_at: sub.lastDunningAt,
      updated_at: new Date().toISOString(),
    };

    const { data: upserted } = await this.db
      .from("subscriptions")
      .upsert(row, { onConflict: "provider_subscription_id" })
      .select()
      .single();

    return this.mapRowToSubscription(upserted || { ...row, id: sub.id });
  }

  private mapRowToSubscription(row: Record<string, unknown>): BillingSubscription {
    return {
      id: row.id as string,
      workspaceId: row.workspace_id as string,
      provider: (row.provider as "razorpay" | "fake") || "fake",
      providerCustomerId: (row.provider_customer_id as string) || "",
      providerSubscriptionId: (row.provider_subscription_id as string) || "",
      plan: (row.plan as PlanTier) || "free",
      status: (row.status as SubscriptionStatus) || "active",
      currentPeriodStart: row.current_period_start as string,
      currentPeriodEnd: row.current_period_end as string,
      cancelAtPeriodEnd: Boolean(row.cancel_at_period_end),
      cancelledAt: (row.cancelled_at as string) || null,
      gracePeriodEndsAt: (row.grace_period_ends_at as string) || null,
      dunningAttemptCount: (row.dunning_attempt_count as number) || 0,
      lastDunningAt: (row.last_dunning_at as string) || null,
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string,
    };
  }
}

export const defaultSubscriptionMachine = new SubscriptionStateMachine();
