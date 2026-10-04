import crypto from "node:crypto";
import {
  BillingProvider,
  BillingCustomer,
  BillingSubscription,
  BillingWebhookEvent,
  CreateCustomerParams,
  CreateSubscriptionParams,
  UpdateSubscriptionParams,
  PlanTier,
  PLAN_PRICES_INR,
} from "./types.js";

/**
 * Deterministic Local / Test-Mode Razorpay Adapter.
 * Runs completely locally with zero real credentials or network calls.
 */
export class FakeRazorpayAdapter implements BillingProvider {
  public readonly mode = "local" as const;
  private customers = new Map<string, BillingCustomer>();
  private subscriptions = new Map<string, BillingSubscription>();

  public async createCustomer(params: CreateCustomerParams): Promise<BillingCustomer> {
    const id = `cust_fake_${params.workspaceId.slice(0, 8)}`;
    const customer: BillingCustomer = {
      id,
      workspaceId: params.workspaceId,
      email: params.email,
      name: params.name || "Test Customer",
      createdAt: new Date().toISOString(),
    };
    this.customers.set(id, customer);
    return customer;
  }

  public async createSubscription(params: CreateSubscriptionParams): Promise<BillingSubscription> {
    const id = `sub_fake_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date();
    const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const subscription: BillingSubscription = {
      id,
      workspaceId: params.workspaceId,
      provider: "fake",
      providerCustomerId: params.customerId,
      providerSubscriptionId: id,
      plan: params.plan,
      status: "active",
      currentPeriodStart: now.toISOString(),
      currentPeriodEnd: periodEnd.toISOString(),
      cancelAtPeriodEnd: false,
      cancelledAt: null,
      gracePeriodEndsAt: null,
      dunningAttemptCount: 0,
      lastDunningAt: null,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    this.subscriptions.set(id, subscription);
    return subscription;
  }

  public async cancelSubscription(
    subscriptionId: string,
    immediate = false,
  ): Promise<BillingSubscription> {
    const sub = this.subscriptions.get(subscriptionId);
    if (!sub) {
      throw new Error(`Subscription not found: ${subscriptionId}`);
    }

    const now = new Date().toISOString();
    const updated: BillingSubscription = {
      ...sub,
      status: immediate ? "cancelled" : sub.status,
      cancelAtPeriodEnd: !immediate,
      cancelledAt: now,
      updatedAt: now,
    };

    this.subscriptions.set(subscriptionId, updated);
    return updated;
  }

  public async updateSubscription(params: UpdateSubscriptionParams): Promise<BillingSubscription> {
    const sub = this.subscriptions.get(params.subscriptionId);
    if (!sub) {
      throw new Error(`Subscription not found: ${params.subscriptionId}`);
    }

    const updated: BillingSubscription = {
      ...sub,
      plan: params.plan,
      updatedAt: new Date().toISOString(),
    };

    this.subscriptions.set(params.subscriptionId, updated);
    return updated;
  }

  public async getPortalUrl(customerId: string): Promise<string> {
    return `http://127.0.0.1:3000/settings/billing?customer=${customerId}&session=mock_portal`;
  }

  public async handleWebhook(
    payload: Record<string, unknown>,
    _signature: string,
  ): Promise<BillingWebhookEvent> {
    // In local mode, verify structure and return parsed event
    const event = (payload.event as string) || "payment.captured";
    const payment = (payload.payload as Record<string, unknown>)?.payment as
      | Record<string, unknown>
      | undefined;
    const subscription = (payload.payload as Record<string, unknown>)?.subscription as
      | Record<string, unknown>
      | undefined;

    return {
      event,
      subscriptionId: (subscription?.id as string) || (payload.subscription_id as string),
      paymentId: (payment?.id as string) || (payload.payment_id as string),
      amount: (payment?.amount as number) || (payload.amount as number) || 0,
      status: (payment?.status as string) || "captured",
      rawPayload: payload,
    };
  }

  /**
   * Helper for tests to simulate webhook events with HMAC signature
   */
  public generateMockWebhookPayload(
    event: "subscription.charged" | "payment.failed" | "subscription.cancelled",
    subscriptionId: string,
    plan: PlanTier,
  ): { payload: Record<string, unknown>; signature: string } {
    const secret = "fake_webhook_secret";
    const payload = {
      event,
      payload: {
        subscription: {
          id: subscriptionId,
          plan_id: `plan_${plan}`,
          status: event === "payment.failed" ? "past_due" : "active",
        },
        payment: {
          id: `pay_${Date.now()}`,
          amount: PLAN_PRICES_INR[plan] * 100,
          currency: "INR",
          status: event === "payment.failed" ? "failed" : "captured",
        },
      },
      created_at: Math.floor(Date.now() / 1000),
    };

    const bodyString = JSON.stringify(payload);
    const signature = crypto.createHmac("sha256", secret).update(bodyString).digest("hex");

    return { payload, signature };
  }
}

/**
 * Live Razorpay Provider.
 * Activates when INTEGRATION_MODE=live and RAZORPAY_KEY_ID is present.
 */
export class RazorpayAdapter implements BillingProvider {
  public readonly mode = "live" as const;
  private keyId: string;
  private keySecret: string;
  private webhookSecret: string;

  constructor() {
    this.keyId = process.env.RAZORPAY_KEY_ID || "";
    this.keySecret = process.env.RAZORPAY_KEY_SECRET || "";
    this.webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "";
  }

  private getAuthHeader(): string {
    return `Basic ${Buffer.from(`${this.keyId}:${this.keySecret}`).toString("base64")}`;
  }

  public async createCustomer(params: CreateCustomerParams): Promise<BillingCustomer> {
    const res = await fetch("https://api.razorpay.com/v1/customers", {
      method: "POST",
      headers: {
        Authorization: this.getAuthHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: params.name || params.email,
        email: params.email,
        notes: { workspaceId: params.workspaceId },
      }),
    });

    if (!res.ok) {
      throw new Error(`Razorpay customer creation failed (${res.status}): ${await res.text()}`);
    }

    const data = (await res.json()) as { id: string; email: string; name: string };
    return {
      id: data.id,
      workspaceId: params.workspaceId,
      email: data.email,
      name: data.name,
      createdAt: new Date().toISOString(),
    };
  }

  public async createSubscription(params: CreateSubscriptionParams): Promise<BillingSubscription> {
    const res = await fetch("https://api.razorpay.com/v1/subscriptions", {
      method: "POST",
      headers: {
        Authorization: this.getAuthHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        plan_id: `plan_${params.plan}`,
        customer_id: params.customerId,
        total_count: 120, // 10 years recurring
        notes: { workspaceId: params.workspaceId },
      }),
    });

    if (!res.ok) {
      throw new Error(`Razorpay subscription creation failed (${res.status}): ${await res.text()}`);
    }

    const data = (await res.json()) as {
      id: string;
      customer_id: string;
      status: string;
      current_start?: number;
      current_end?: number;
    };

    const now = new Date();
    const start = data.current_start ? new Date(data.current_start * 1000) : now;
    const end = data.current_end
      ? new Date(data.current_end * 1000)
      : new Date(now.getTime() + 30 * 86400000);

    return {
      id: data.id,
      workspaceId: params.workspaceId,
      provider: "razorpay",
      providerCustomerId: data.customer_id,
      providerSubscriptionId: data.id,
      plan: params.plan,
      status: "active",
      currentPeriodStart: start.toISOString(),
      currentPeriodEnd: end.toISOString(),
      cancelAtPeriodEnd: false,
      cancelledAt: null,
      gracePeriodEndsAt: null,
      dunningAttemptCount: 0,
      lastDunningAt: null,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
  }

  public async cancelSubscription(
    subscriptionId: string,
    immediate = false,
  ): Promise<BillingSubscription> {
    const res = await fetch(`https://api.razorpay.com/v1/subscriptions/${subscriptionId}/cancel`, {
      method: "POST",
      headers: {
        Authorization: this.getAuthHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ cancel_at_cycle_end: immediate ? 0 : 1 }),
    });

    if (!res.ok) {
      throw new Error(`Razorpay cancel failed (${res.status}): ${await res.text()}`);
    }

    const data = (await res.json()) as { id: string; status: string };
    const now = new Date().toISOString();

    return {
      id: data.id,
      workspaceId: "",
      provider: "razorpay",
      providerCustomerId: "",
      providerSubscriptionId: data.id,
      plan: "free",
      status: immediate ? "cancelled" : "active",
      currentPeriodStart: now,
      currentPeriodEnd: now,
      cancelAtPeriodEnd: !immediate,
      cancelledAt: now,
      dunningAttemptCount: 0,
      createdAt: now,
      updatedAt: now,
    };
  }

  public async updateSubscription(params: UpdateSubscriptionParams): Promise<BillingSubscription> {
    const res = await fetch(`https://api.razorpay.com/v1/subscriptions/${params.subscriptionId}`, {
      method: "PATCH",
      headers: {
        Authorization: this.getAuthHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ plan_id: `plan_${params.plan}` }),
    });

    if (!res.ok) {
      throw new Error(`Razorpay plan update failed (${res.status}): ${await res.text()}`);
    }

    const data = (await res.json()) as { id: string };
    const now = new Date().toISOString();

    return {
      id: data.id,
      workspaceId: "",
      provider: "razorpay",
      providerCustomerId: "",
      providerSubscriptionId: data.id,
      plan: params.plan,
      status: "active",
      currentPeriodStart: now,
      currentPeriodEnd: now,
      cancelAtPeriodEnd: false,
      dunningAttemptCount: 0,
      createdAt: now,
      updatedAt: now,
    };
  }

  public async getPortalUrl(customerId: string): Promise<string> {
    return `https://dashboard.razorpay.com/app/subscriptions?customer_id=${customerId}`;
  }

  public async handleWebhook(
    payload: Record<string, unknown>,
    signature: string,
  ): Promise<BillingWebhookEvent> {
    if (!this.webhookSecret) {
      throw new Error("RAZORPAY_WEBHOOK_SECRET must be configured in live mode");
    }

    const raw = JSON.stringify(payload);
    const expected = crypto.createHmac("sha256", this.webhookSecret).update(raw).digest("hex");

    if (expected !== signature) {
      throw new Error("Invalid Razorpay webhook signature");
    }

    const event = payload.event as string;
    const payment = (payload.payload as Record<string, unknown>)?.payment as
      | Record<string, unknown>
      | undefined;
    const subscription = (payload.payload as Record<string, unknown>)?.subscription as
      | Record<string, unknown>
      | undefined;

    return {
      event,
      subscriptionId: subscription?.id as string,
      paymentId: payment?.id as string,
      amount: payment?.amount as number,
      status: payment?.status as string,
      rawPayload: payload,
    };
  }
}

/**
 * Factory creating the active BillingProvider based on INTEGRATION_MODE.
 */
export function createBillingProvider(
  mode: "local" | "live" = (process.env.INTEGRATION_MODE as "local" | "live") || "local",
): BillingProvider {
  if (mode === "live" && process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    return new RazorpayAdapter();
  }
  return new FakeRazorpayAdapter();
}

export const defaultBillingProvider = createBillingProvider();
