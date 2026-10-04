# 12 — Cost & Billing

> Unit economics, quotas, pricing logic, metering

---

## Unit Economics (ASSUMPTION — validate before publishing prices)

All numbers below are estimates. Must be validated against measured infra costs before setting real pricing.

### Cost Drivers

| Resource                    | Unit                              | Est. Cost                               |
| --------------------------- | --------------------------------- | --------------------------------------- |
| Browser minute (Playwright) | Per minute of browser context     | ~$0.005/min (Fly.io micro VM amortized) |
| Records extracted           | Per 1,000 valid records           | ~$0.002/1k (compute + storage)          |
| API request                 | Per non-5xx authenticated request | ~$0.00002/request                       |
| Storage                     | GB-month                          | ~$0.021/GB (Supabase Storage)           |
| AI tokens                   | Per 1M tokens                     | ~$0.75/M (Gemini current)               |
| Email delivery              | Per email sent                    | ~$0.001/email (Resend)                  |
| Tracked product-day         | Per product per day               | ~$0.0005/product-day (compute + data)   |

### Target Gross Margin: >= 70% on paid tiers (RECOMMENDATION)

---

## Plans

### Compare (Free forever)

- Unlimited searches and browsing
- 10 watchlist items
- 5 price alerts
- Email alerts only
- 30 days price history
- No fee, affiliate-disclosed

**Why free**: Compare is the acquisition channel. Affiliate commissions are the revenue.

### Intelligence Plans

| Feature           | Starter      | Pro               | Business          |
| ----------------- | ------------ | ----------------- | ----------------- |
| Price             | INR 999/mo   | INR 2,999/mo      | INR 7,999/mo      |
| Tracked products  | 25           | 100               | 500               |
| Competitors       | 5            | 25                | 100               |
| Refresh frequency | Daily        | 4x daily          | Hourly            |
| Seats             | 1            | 3                 | 10                |
| History retention | 90 days      | 1 year            | 3 years           |
| Reports           | Weekly email | + PDF + shareable | + Custom schedule |
| Alerts            | Email        | Email + in-app    | + Webhook         |
| API access        | No           | Read-only         | Full              |
| Trial             | 14 days free | 14 days free      | Demo call         |

**Note**: All prices are ASSUMPTION pending cost validation.

### Extract Plans

| Feature         | Free             | Starter                               | Pro          | Business     |
| --------------- | ---------------- | ------------------------------------- | ------------ | ------------ |
| Price           | INR 0            | INR 499/mo                            | INR 1,999/mo | INR 5,999/mo |
| Records/month   | 5,000            | 50,000                                | 500,000      | 5,000,000    |
| Browser minutes | 30               | 300                                   | 3,000        | 30,000       |
| Concurrent runs | 1                | 3                                     | 10           | 30           |
| Extractors      | 3                | 25                                    | Unlimited    | Unlimited    |
| Schedules       | None             | 5                                     | Unlimited    | Unlimited    |
| Webhooks        | 1                | 5                                     | Unlimited    | Unlimited    |
| History         | 7 days           | 30 days                               | 90 days      | 1 year       |
| API access      | No               | Yes                                   | Yes          | Yes          |
| Overage         | None (hard stop) | INR 40/1k records + INR 1/browser-min | Same         | Same         |

---

## Metering Semantics

Documented in `/docs/billing/metering.md`:

| Metric              | Definition                                                                | Notes                                  |
| ------------------- | ------------------------------------------------------------------------- | -------------------------------------- |
| `tracked_products`  | Distinct product+variant pairs active in workspace, daily max             | Counted by pg_cron at midnight         |
| `competitors`       | Distinct merchants in tracked_competitors per workspace                   | Daily snapshot                         |
| `browser_minutes`   | Wall-clock time of leased browser context, rounded up to 0.1 min          | Recorded at context close              |
| `records_extracted` | Valid records persisted (failed validation excluded, duplicates excluded) | Idempotent: counted at task completion |
| `api_requests`      | Authenticated non-5xx API calls                                           | Counted in middleware                  |
| `storage_gb`        | Daily average GB of all stored files in workspace                         | Computed by pg_cron                    |
| `runs`              | Started extraction runs (status != DRAFT)                                 | Counted at run start                   |

### Metering Implementation

```typescript
// All usage events are idempotent
await db
  .insert(usage_events)
  .values({
    workspace_id: workspaceId,
    metric: "records_extracted",
    quantity: recordCount,
    occurred_at: new Date(),
    idempotency_key: `run_${runId}_records`, // Prevents double-counting on retry
    metadata: { run_id: runId },
  })
  .onConflict("idempotency_key")
  .ignore();
```

Rollups: pg_cron job runs hourly, aggregating usage_events -> usage_rollups. Users see live usage in the dashboard (from usage_rollups + unbatched usage_events from last hour).

### Quota Enforcement

**Soft quota** (default): At 80% and 100% of plan limit, user receives notification.

**Hard quota** (per-feature setting): Extraction stops when `records_extracted` reaches plan limit. User shown clear message: "Monthly record limit reached. Upgrade your plan or wait until next billing period."

**Overage** (Starter/Pro/Business Extract): Usage above included amount charged at overage rate. Rate shown in pricing table. User can set a hard cap in billing settings to prevent overage charges.

---

## Billing Flows

### Subscription (Razorpay)

**FACT** (verified Oct 2026): Razorpay Subscriptions API supports INR recurring payments via UPI Autopay and card e-mandates. Compliant with 2026 RBI e-mandate framework.

**Implementation**:

```typescript
// BillingProvider interface (adapter pattern)
interface BillingProvider {
  createCustomer(params: CreateCustomerParams): Promise<Customer>;
  createSubscription(params: CreateSubscriptionParams): Promise<Subscription>;
  cancelSubscription(id: string, params: CancelParams): Promise<void>;
  updateSubscription(id: string, params: UpdateParams): Promise<Subscription>;
  getPortalUrl(customerId: string): Promise<string>;
  handleWebhook(payload: Buffer, signature: string): Promise<WebhookEvent>;
}

// Local/test mode:
class FakeBillingProvider implements BillingProvider { ... }

// Live mode:
class RazorpayProvider implements BillingProvider { ... }
```

### Subscription Lifecycle

```
User upgrades -> Razorpay subscription created ->
  Razorpay webhook: subscription.charged ->
  Update subscriptions.status = 'active', period dates ->
  Update workspace.plan ->
  Send confirmation email

Payment failure ->
  Razorpay webhook: payment.failed ->
  Update subscriptions.status = 'past_due' ->
  Set grace_period_ends_at = NOW() + 7 days ->
  Send dunning email day 1, day 3, day 6 ->
  If not resolved by grace_period_ends_at: downgrade to Free ->
  Data retained 30 days -> user can re-subscribe and recover

User cancels ->
  Cancel in Razorpay ->
  Update subscriptions.cancelled_at ->
  Access continues until current_period_end ->
  Send cancellation confirmation + "See you again" email
```

### GST Invoicing (FACT — India requirement)

```
Required on every invoice:
- "Tax Invoice" header
- Unique consecutive serial number (< 16 chars, resets per financial year)
- Issue date
- Supplier: Scrappy's legal name, GSTIN, address
- Customer: Name, address, GSTIN (if B2B)
- Place of supply: Customer's state
- SAC code: 998314 (or appropriate for SaaS/OIDAR)
- Taxable value
- GST rate: 18% (CGST 9% + SGST 9% for intra-state; IGST 18% for inter-state)
- Total amount with GST breakdown
- E-invoice (IRN + QR code) required above INR 5 crore annual turnover
```

Invoices generated as PDF and emailed on each successful billing cycle. Stored in Supabase Storage for 7 years (tax requirement).

---

## Pricing Logic Documentation

This document that any price published must trace to:

1. Measured infra cost per unit at projected volume
2. Target gross margin >= 70%
3. Competitive benchmark (what do similar Indian SaaS products charge?)
4. Willingness-to-pay validation (at least 3 customer interviews per tier)

**Pre-launch validation required** (marked BLOCKED until done):

- Measure actual browser-minute cost on Fly.io at 1,000 browser-min/day
- Measure actual storage cost at 100GB
- Measure actual compute cost for 100k records extracted
- Update pricing table with validated numbers before publishing

---

## Usage Dashboard (User-Facing)

Every workspace sees:

- Current period: used vs included per metric
- Visual progress bar with budget line
- Threshold alerts: email at 80% and 100%
- Cost-to-date (if on overage plan)
- Upgrade CTA when approaching limits
- Historical usage by month

---

## Affiliate Revenue Model (Compare)

Compare generates revenue through affiliate commissions on outbound retailer clicks.

**Disclosure**: Every "Go to store" link clearly shows the affiliate relationship. Required by ASCI (Advertising Standards Council of India) guidelines and general fair practice.

**Implementation**:

- Amazon: PA-API affiliate links with associate tag
- Flipkart: Affiliate API links with tracking ID
- Others: Contact affiliate programs directly at launch

**ASSUMPTION**: Affiliate commission rates (Amazon ~3-10%, Flipkart ~2-6%) are approximate. Verify actual rates with affiliate programs before financial modeling.

**Revenue estimate at 10k MAU**: INR 50,000-150,000/month (highly dependent on click-through rate and conversion). This is exploratory; cannot be modeled accurately without live data.
