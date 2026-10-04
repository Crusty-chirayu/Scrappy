export type PlanTier = "free" | "starter" | "pro" | "business" | "enterprise";

export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "cancelled"
  | "paused"
  | "expired";

export interface PlanLimits {
  trackedProducts: number;
  recordsPerMonth: number;
  browserMinutes: number;
  concurrentRuns: number;
  historyRetentionDays: number;
  seats: number;
  apiAccess: boolean;
  overageAllowed: boolean;
}

export const PLAN_LIMITS: Record<PlanTier, PlanLimits> = {
  free: {
    trackedProducts: 10,
    recordsPerMonth: 5_000,
    browserMinutes: 30,
    concurrentRuns: 1,
    historyRetentionDays: 30,
    seats: 1,
    apiAccess: false,
    overageAllowed: false,
  },
  starter: {
    trackedProducts: 25,
    recordsPerMonth: 50_000,
    browserMinutes: 300,
    concurrentRuns: 3,
    historyRetentionDays: 90,
    seats: 1,
    apiAccess: true,
    overageAllowed: true,
  },
  pro: {
    trackedProducts: 100,
    recordsPerMonth: 500_000,
    browserMinutes: 3_000,
    concurrentRuns: 10,
    historyRetentionDays: 365,
    seats: 3,
    apiAccess: true,
    overageAllowed: true,
  },
  business: {
    trackedProducts: 500,
    recordsPerMonth: 5_000_000,
    browserMinutes: 30_000,
    concurrentRuns: 30,
    historyRetentionDays: 1095,
    seats: 10,
    apiAccess: true,
    overageAllowed: true,
  },
  enterprise: {
    trackedProducts: 10_000,
    recordsPerMonth: 50_000_000,
    browserMinutes: 300_000,
    concurrentRuns: 100,
    historyRetentionDays: 3650,
    seats: 100,
    apiAccess: true,
    overageAllowed: true,
  },
};

export const PLAN_PRICES_INR: Record<PlanTier, number> = {
  free: 0,
  starter: 499,
  pro: 1999,
  business: 5999,
  enterprise: 19999,
};

export interface BillingCustomer {
  id: string;
  workspaceId: string;
  email: string;
  name?: string;
  createdAt: string;
}

export interface BillingSubscription {
  id: string;
  workspaceId: string;
  provider: "razorpay" | "fake";
  providerCustomerId: string;
  providerSubscriptionId: string;
  plan: PlanTier;
  status: SubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  cancelledAt?: string | null;
  gracePeriodEndsAt?: string | null;
  dunningAttemptCount: number;
  lastDunningAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BillingInvoice {
  id: string;
  workspaceId: string;
  subscriptionId?: string | null;
  invoiceNumber: string;
  amountPaise: number;
  gstAmountPaise: number;
  currency: string;
  status: "paid" | "pending" | "failed" | "refunded";
  pdfUrl?: string | null;
  periodStart: string;
  periodEnd: string;
  paidAt?: string | null;
  createdAt: string;
}

export interface CreateCustomerParams {
  workspaceId: string;
  email: string;
  name?: string;
}

export interface CreateSubscriptionParams {
  workspaceId: string;
  customerId: string;
  plan: PlanTier;
}

export interface UpdateSubscriptionParams {
  subscriptionId: string;
  plan: PlanTier;
}

export interface BillingWebhookEvent {
  event: string;
  subscriptionId?: string;
  paymentId?: string;
  amount?: number;
  status?: string;
  rawPayload: Record<string, unknown>;
}

export interface BillingProvider {
  readonly mode: "local" | "live";
  createCustomer(params: CreateCustomerParams): Promise<BillingCustomer>;
  createSubscription(params: CreateSubscriptionParams): Promise<BillingSubscription>;
  cancelSubscription(subscriptionId: string, immediate?: boolean): Promise<BillingSubscription>;
  updateSubscription(params: UpdateSubscriptionParams): Promise<BillingSubscription>;
  getPortalUrl(customerId: string): Promise<string>;
  handleWebhook(payload: Record<string, unknown>, signature: string): Promise<BillingWebhookEvent>;
}

export interface UsageRecordParams {
  workspaceId: string;
  metric: "records_extracted" | "browser_minutes" | "api_requests" | "tracked_products";
  quantity: number;
  idempotencyKey: string;
  metadata?: Record<string, unknown>;
}

export interface WorkspaceUsageSummary {
  workspaceId: string;
  plan: PlanTier;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  recordsExtracted: number;
  browserMinutes: number;
  apiRequests: number;
  trackedProducts: number;
  limits: PlanLimits;
  quotaStatus: {
    recordsPct: number;
    browserMinutesPct: number;
    hasReachedSoftQuota: boolean; // >= 80%
    hasReachedHardQuota: boolean; // >= 100%
  };
}
