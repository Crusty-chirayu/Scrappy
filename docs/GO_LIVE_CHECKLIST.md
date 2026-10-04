# GO-LIVE & PRODUCTION DEPLOYMENT CHECKLIST

> Document Ref: DOCS-GOLIVE-01  
> Stage: Stage C — Production Hand-Off  
> Target Infrastructure: Supabase (PostgreSQL, Auth, Storage), Vercel (Next.js Web), Railway / Fly.io (Fastify API & Workers)

---

## 1. Environment & Credentials Provisioning

Set the following production environment variables in your deployment environments. All external integrations operate behind adapter interfaces; flipping `INTEGRATION_MODE=live` activates production APIs.

| Service | Environment Variable | Where to Obtain | Default / Mode |
|---|---|---|---|
| **Platform Mode** | `INTEGRATION_MODE` | Set to `live` for production | `local` (dev/test) / `live` (prod) |
| **Supabase URL** | `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard -> Project Settings -> API | `https://<ref>.supabase.co` |
| **Supabase Anon Key** | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard -> Project Settings -> API | `eyJhbGciOi...` (Safe for browser) |
| **Supabase Service Role** | `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard -> Project Settings -> API | `eyJhbGciOi...` (Backend/Worker ONLY) |
| **PostgreSQL Session URL** | `DATABASE_URL` | Supabase Dashboard -> Database -> Connection String (Port 5432) | `postgresql://postgres:<pw>@db.<ref>.supabase.co:5432/postgres?sslmode=require` |
| **Razorpay Key ID** | `RAZORPAY_KEY_ID` | Razorpay Dashboard -> API Keys | `rzp_live_...` |
| **Razorpay Secret** | `RAZORPAY_KEY_SECRET` | Razorpay Dashboard -> API Keys | Cryptographic secret |
| **Razorpay Webhook Secret** | `RAZORPAY_WEBHOOK_SECRET` | Razorpay Dashboard -> Webhooks | `whsec_...` |
| **Resend / Email API Key** | `RESEND_API_KEY` | Resend Dashboard -> API Keys | `re_...` |
| **Gemini AI API Key** | `GEMINI_API_KEY` | Google AI Studio | `AIza...` |
| **Public App URL** | `NEXT_PUBLIC_APP_URL` | DNS / Domain Registrar | `https://scrappy.in` |
| **Public API Gateway URL** | `NEXT_PUBLIC_API_URL` | API Deployment Domain | `https://api.scrappy.in` |
| **Admin Operator Allowlist**| `ADMIN_ALLOWED_EMAILS` | Comma-separated operator emails | `admin@scrappy.in,ops@scrappy.in` |

---

## 2. Database Migration & RLS Deployment

Run migrations using the Supabase CLI against your remote Supabase project:

```bash
# 1. Link to your production Supabase project
supabase link --project-ref <your-project-ref>

# 2. Push versioned SQL migrations (includes all 6 migrations + complete Row Level Security on all 35+ tables)
#    - 20261004000001_initial_schema.sql (Core catalog, products, merchants, offers, alerts, watchlist)
#    - 20261004000002_auth_workspace_trigger.sql (Auto-workspace creation trigger on auth.users)
#    - 20261004000003_complete_schema_and_rls.sql (Enterprise schema: match evidence, datasets, usage events, daily rollups)
#    - 20261004000004_realtime_publications.sql (Realtime publications for alerts, notifications, extract runs)
#    - 20261004000005_billing_subscriptions.sql (Subscriptions, invoices, dunning states, tiered workspace constraints)
#    - 20261004000006_api_keys_revoked_at.sql (Soft revocation timestamp for cryptographic API keys)
supabase db push

# 3. Verify pgTAP Row-Level Security test suite (all 28 tests must pass)
supabase test db

# 4. Populate deterministic initial catalog seed (500 canonical items + verified retailer offers)
supabase db seed
```

---

## 3. Application Deployment Sequence

### A. Next.js Web Frontend (`apps/web`)
1. Connect repository to **Vercel** or container host.
2. Root directory: `./apps/web`.
3. Build command: `pnpm --filter @scrappy/web build`.
4. Output directory: `.next`.
5. Configure environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_API_URL`).

### B. Fastify REST API Gateway (`apps/api`)
1. Deploy as a persistent Node container (Railway / Fly.io / Render).
2. Root directory: `./apps/api`.
3. Command: `node dist/index.js`.
4. Bind host: `0.0.0.0`, Port: `8080`.
5. Connect to `DATABASE_URL` (direct port 5432).

### C. Scraping & Match Workers (`packages/worker`)
1. Deploy as background worker processes (min: 2 replicas for fault tolerance).
2. Command: `node dist/index.js`.
3. Ensure worker instances have outbound HTTP access and DNS resolution.
4. Concurrency setting: 4 workers per process.

---

## 4. Post-Deployment Smoke Test Protocol

Immediately after deployment, execute the following smoke tests:

1. **Public Health Check**:
   ```bash
   curl -s -f https://api.scrappy.in/health
   # Expected: {"status":"healthy","uptime":...}
   ```
2. **Search API Smoke Test**:
   ```bash
   curl -s "https://api.scrappy.in/v1/search?q=iPhone" | jq '.total'
   # Expected: Number >= 1
   ```
3. **SSRF Validator & Attack Prevention Check**:
   ```bash
   curl -X POST https://api.scrappy.in/v1/extract/validate-url \
     -H "Content-Type: application/json" \
     -d '{"url":"http://169.254.169.254/latest/meta-data/"}'
   # Expected: {"valid":false,"reason":"SSRF: URL resolves to private or loopback IP range"}
   ```
4. **Compare Route Rendering**:
   Navigate to `https://scrappy.in/compare` in browser; verify product cards, price history charts, and provenance badges load without console errors.
5. **Admin Console Allowlist Check**:
   Attempt to access `https://scrappy.in/admin` without authorized headers or credentials; verify 403 Forbidden response.
6. **Matching Engine Adversarial Benchmark Verification**:
   ```bash
   pnpm --filter @scrappy/matching test
   # Expected: 350/350 pairs evaluated, 0 false positives (0.00% FPR), 100% precision
   ```
7. **End-to-End Test Suite Smoke Verification**:
   ```bash
   pnpm exec playwright test e2e/critical-flows.spec.ts e2e/security.spec.ts e2e/resilience-g10.spec.ts
   # Expected: All test suites passing on both desktop-1280 and mobile-360
   ```

---

## 5. Rollback Runbook

If critical anomalies or unexpected drift occur post-cutover:

1. **Immediate Circuit Breaker Trip**:
   In the Admin Console (`/admin`), trigger "Force Trip" on the misbehaving source adapter (Amazon, Flipkart, etc.). This instantly halts outbound scrapes for that domain and falls back to safe cached values.
2. **Traffic Redirection**:
   Revert the active Vercel/Railway deployment to the previous stable release commit hash.
3. **Database Rollback (if schema changed)**:
   Refer to `docs/runbooks/db-restore-drill.md` for Point-In-Time-Recovery (PITR) procedures.
