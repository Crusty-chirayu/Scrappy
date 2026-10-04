# RUNBOOK: Billing Reconciliation & Webhook Diagnostics

> System: Razorpay Payment Gateway & Workspace Subscriptions (`apps/api`, `packages/pricing`)  
> Triggers: Webhook delivery failure, payment dispute, subscription grace period expiration.

---

## 1. Webhook Signature & Replay Verification

All Razorpay and billing webhooks MUST be authenticated with HMAC SHA-256 signatures:
- Header: `x-razorpay-signature` or `x-scrappy-signature`
- Timestamp check: Must be within 300 seconds (5 minutes) of current server time to prevent replay attacks.

---

## 2. Failed Payment & Grace Period Lifecycle

1. When a recurring subscription payment fails:
   - Status transitions to `grace_period` (7 days duration).
   - Email notification dispatched via React Email template (`emails/payment-failed.tsx`).
   - Workspace access is **NOT** immediately revoked.
2. If payment is unresolved after 7 days:
   - Workspace plan transitions to `free_tier`.
   - Active scraping jobs and extract schedules pause cleanly.
   - User data and watchlists are retained (never deleted automatically).

---

## 3. Idempotency Audit Command
```bash
# Verify no duplicate usage charges exist for any workspace
pnpm vitest run packages/core/src/__tests__/named-critical-tests.test.ts -t "double_billing_prevention"
```
