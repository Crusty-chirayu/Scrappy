# 05 — Supabase Design

> Full schema, RLS policies, auth flow, storage buckets, realtime channels, edge functions vs workers, connection strategy, migrations, backups

---

## Platform Decision Rationale

**FACT** (verified Oct 2026):

- pg_trgm, pgvector, pg_cron, unaccent: all available on Supabase Pro
- Supavisor pooler: transaction mode (port 6543) for API/web; session mode (port 5432) for workers
- Free tier: 200 pooler connections, 60 direct. Pro: 400+ pooler.
- pg-boss requires advisory locks + LISTEN/NOTIFY -> MUST use session mode (direct port 5432) for worker processes.
- Supabase Storage: 100GB included on Pro, $0.0213/GB overage; 250GB egress included.

---

## Connection Strategy

| Consumer                         | Connection URL  | Mode        | Why                                     |
| -------------------------------- | --------------- | ----------- | --------------------------------------- |
| apps/api (Fastify)               | Supavisor :6543 | Transaction | Many short-lived requests               |
| apps/web (Next.js RSC)           | Supavisor :6543 | Transaction | Serverless-compatible                   |
| apps/worker (pg-boss)            | Direct PG :5432 | Session     | Advisory locks + LISTEN/NOTIFY required |
| apps/browser-worker              | Direct PG :5432 | Session     | Same as worker                          |
| CI migrations (supabase db push) | Direct PG :5432 | Session     | DDL requires direct                     |
| Admin/analytics queries          | Direct PG :5432 | Session     | Long-running queries                    |

**Never**: put `DIRECT_URL` (session mode) in frontend code or Edge Functions. Service-role key never shipped to browser.

---

## Auth Flow (Supabase Auth)

### Supported Methods (MVP)

1. **Magic link (email OTP)** - primary method
2. **Google OAuth** - social login
3. **Passkeys (WebAuthn)** - P2, post-MVP

### Session Management

- httpOnly Secure SameSite=Lax cookies via Supabase SSR helpers (`@supabase/ssr`)
- Session rotation on privilege change (workspace switch, role change)
- Device list visible in Account settings; per-device revoke
- Rate limits on auth endpoints (Supabase built-in + custom Fastify middleware)

### JWT Claims (custom claims via Supabase Auth hook)

```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "role": "authenticated",
  "app_metadata": {
    "workspace_id": "current-workspace-uuid",
    "workspace_role": "admin",
    "plan": "pro"
  }
}
```

Custom JWT hook (`supabase/functions/auth-hook/`): After token sign, reads workspace membership to inject `workspace_id` and `workspace_role` into JWT. This powers RLS policies without extra DB round-trips.

### API Key Auth (Extract / Intelligence API)

- API key: `scp_live_` prefix + 32 bytes random (base62)
- Stored as SHA-256 hash in `api_keys` table
- Shown once on creation; never stored in plain text
- Validated in Fastify plugin before route handlers
- Rate limited per key (column in api_keys table)

---

## Full Database Schema

### Tenancy Rules

- Every workspace-owned table has `workspace_id UUID NOT NULL REFERENCES workspaces(id)`
- RLS enabled (deny-by-default) on EVERY table
- Policies use `auth.uid()` and the custom JWT claims
- Service-role key bypasses RLS -- used ONLY in worker/api server code, never browser

---

### IDENTITY & TENANCY TABLES

```sql
-- Purpose: registered users (Supabase Auth manages auth.users; this is profile extension)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Purpose: top-level grouping (personal auto-created; business/developer explicit)
CREATE TABLE public.workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('personal', 'business', 'developer')),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  plan TEXT NOT NULL DEFAULT 'free',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Purpose: user membership in a workspace with role
CREATE TABLE public.memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (workspace_id, user_id)
);

-- Purpose: pending workspace invitations
CREATE TABLE public.invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'member', 'viewer')),
  token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  invited_by UUID NOT NULL REFERENCES auth.users(id),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Purpose: hashed API keys for programmatic access
CREATE TABLE public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  hash TEXT NOT NULL UNIQUE,             -- SHA-256 of the raw key
  prefix TEXT NOT NULL,                  -- First 8 chars for identification
  name TEXT NOT NULL,
  scopes TEXT[] NOT NULL DEFAULT '{}',
  rate_limit_per_minute INT NOT NULL DEFAULT 60,
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_at TIMESTAMPTZ
);
CREATE INDEX idx_api_keys_workspace ON api_keys(workspace_id);
CREATE INDEX idx_api_keys_hash ON api_keys(hash);

-- Purpose: immutable audit log for sensitive actions
CREATE TABLE public.audit_log (
  id BIGSERIAL PRIMARY KEY,
  workspace_id UUID REFERENCES workspaces(id),
  actor_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,        -- 'api_key.created', 'member.removed', etc.
  resource_type TEXT,
  resource_id TEXT,
  metadata JSONB,
  ip_address INET,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
) PARTITION BY RANGE (created_at);
-- Monthly partitions auto-created by pg_cron job
```

### CATALOG GRAPH TABLES (global, not tenant-scoped)

```sql
-- Purpose: product brands
CREATE TABLE public.brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  aliases TEXT[] DEFAULT '{}',  -- For brand normalization
  logo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Purpose: product category tree
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  parent_id UUID REFERENCES categories(id),
  path TEXT NOT NULL,           -- Materialized path 'electronics.phones.smartphones'
  level INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_categories_path ON categories USING gin(to_tsvector('english', path));
CREATE INDEX idx_categories_parent ON categories(parent_id);

-- Purpose: canonical products (de-duplicated, one record per distinct product)
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES brands(id),
  category_id UUID NOT NULL REFERENCES categories(id),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  is_synthetic BOOLEAN NOT NULL DEFAULT FALSE,  -- Seed data flag
  search_vector TSVECTOR,  -- Maintained by trigger
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_products_search ON products USING gin(search_vector);
CREATE INDEX idx_products_brand ON products(brand_id);
CREATE INDEX idx_products_category ON products(category_id);

-- Purpose: product variants (color, storage, size, pack_qty)
CREATE TABLE public.product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  attributes JSONB NOT NULL,  -- {storage: '256GB', color: 'Phantom Black', ...}
  title_suffix TEXT,          -- e.g., "256GB Phantom Black"
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_variants_product ON product_variants(product_id);

-- Purpose: product identifiers (GTIN/EAN/UPC/MPN) with confidence
CREATE TABLE public.product_identifiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES product_variants(id),
  type TEXT NOT NULL CHECK (type IN ('gtin', 'ean', 'upc', 'mpn', 'asin', 'isbn')),
  value TEXT NOT NULL,
  source TEXT NOT NULL,
  confidence NUMERIC(4,3) NOT NULL DEFAULT 0.5 CHECK (confidence BETWEEN 0 AND 1),
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (type, value) WHERE verified = TRUE  -- Partial unique: only for verified
);
CREATE INDEX idx_identifiers_product ON product_identifiers(product_id);
CREATE INDEX idx_identifiers_value ON product_identifiers(type, value);

-- Purpose: merchants (retailers + marketplace sellers)
CREATE TABLE public.merchants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('retailer', 'marketplace_seller', 'brand_store')),
  platform TEXT,  -- 'amazon', 'flipkart', 'croma', etc. for marketplace sellers
  url TEXT,
  logo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Purpose: a source (site + adapter + region combination)
CREATE TABLE public.sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES merchants(id),
  adapter_name TEXT NOT NULL,  -- 'amazon-in', 'flipkart', etc.
  region TEXT NOT NULL DEFAULT 'IN',
  base_url TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'active' CHECK (state IN ('active', 'degraded', 'offline', 'restricted', 'unsupported')),
  robots_allowed BOOLEAN,
  official_feed_available BOOLEAN NOT NULL DEFAULT FALSE,
  last_health_check_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Purpose: a retailer's page for a specific product/variant (canonical URL)
CREATE TABLE public.listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID NOT NULL REFERENCES sources(id),
  merchant_id UUID NOT NULL REFERENCES merchants(id),
  product_id UUID REFERENCES products(id),      -- NULL until matched
  variant_id UUID REFERENCES product_variants(id),
  url TEXT NOT NULL,
  url_hash TEXT NOT NULL,  -- MD5 of canonical URL for dedup
  title TEXT NOT NULL,     -- Original title from source
  search_vector TSVECTOR,
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (url_hash)
);
CREATE INDEX idx_listings_product ON listings(product_id) WHERE product_id IS NOT NULL;
CREATE INDEX idx_listings_search ON listings USING gin(search_vector);
CREATE INDEX idx_listings_source ON listings(source_id);

-- Purpose: a specific offer for a listing (price, seller, condition)
CREATE TABLE public.offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  seller_id UUID REFERENCES merchants(id),  -- NULL for direct retailer offers
  condition TEXT NOT NULL DEFAULT 'new' CHECK (condition IN ('new', 'renewed', 'used', 'open_box')),
  pack_quantity INT NOT NULL DEFAULT 1,
  shipping_cost_minor BIGINT DEFAULT 0,      -- Minor units (paise)
  currency TEXT NOT NULL DEFAULT 'INR',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_offers_listing ON offers(listing_id);
```

### TIME-SERIES TABLES (partitioned monthly)

```sql
-- Purpose: immutable price observation from a scraping run (append-only)
CREATE TABLE public.price_observations (
  id BIGSERIAL,
  offer_id UUID NOT NULL REFERENCES offers(id),
  observed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  price_minor BIGINT NOT NULL CHECK (price_minor > 0),
  mrp_minor BIGINT CHECK (mrp_minor >= price_minor),
  currency TEXT NOT NULL DEFAULT 'INR',
  availability TEXT NOT NULL CHECK (availability IN ('in_stock', 'out_of_stock', 'limited', 'preorder', 'unknown')),
  run_id UUID,  -- FK to runs table
  extraction_confidence NUMERIC(4,3) NOT NULL DEFAULT 1.0,
  raw_ref TEXT,  -- Reference to raw HTML/JSON in storage if needed
  PRIMARY KEY (id, observed_at)
) PARTITION BY RANGE (observed_at);

-- Monthly partitions managed by pg_cron:
-- price_observations_2024_01, price_observations_2024_02, etc.

-- Purpose: daily aggregated stats per offer (computed by job, never deleted)
CREATE TABLE public.price_daily_rollups (
  offer_id UUID NOT NULL REFERENCES offers(id),
  date DATE NOT NULL,
  price_min_minor BIGINT NOT NULL,
  price_max_minor BIGINT NOT NULL,
  price_median_minor BIGINT NOT NULL,
  price_open_minor BIGINT NOT NULL,   -- First observation of day
  price_close_minor BIGINT NOT NULL,  -- Last observation of day
  observation_count INT NOT NULL,
  availability_majority TEXT,
  PRIMARY KEY (offer_id, date)
);
CREATE INDEX idx_rollups_offer_date ON price_daily_rollups(offer_id, date DESC);
-- Query: "90-day price history for offer X" -> covers this index
```

### MATCHING TABLES

```sql
-- Purpose: candidate match between a listing and a canonical product
CREATE TABLE public.match_candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES product_variants(id),
  score NUMERIC(4,3) NOT NULL CHECK (score BETWEEN 0 AND 1),
  status TEXT NOT NULL DEFAULT 'needs_review'
    CHECK (status IN ('auto_accepted', 'needs_review', 'rejected', 'human_accepted')),
  has_hard_conflict BOOLEAN NOT NULL DEFAULT FALSE,
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (listing_id, product_id)
);

-- Purpose: evidence rows for each match feature score
CREATE TABLE public.match_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES match_candidates(id) ON DELETE CASCADE,
  feature TEXT NOT NULL,         -- 'gtin_match', 'brand_eq', 'storage_conflict', etc.
  value_a TEXT,                  -- Value from listing
  value_b TEXT,                  -- Value from product/variant
  weight NUMERIC(4,3),
  contribution NUMERIC(4,3),
  is_conflict BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_evidence_candidate ON match_evidence(candidate_id);

-- Purpose: human review decisions on match candidates
CREATE TABLE public.match_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES match_candidates(id),
  reviewer_id UUID NOT NULL REFERENCES auth.users(id),
  decision TEXT NOT NULL CHECK (decision IN ('accept', 'reject', 'split', 'merge')),
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### NOTIFICATIONS TABLES

```sql
-- Purpose: notification record (what happened, for whom)
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,    -- 'price_drop', 'back_in_stock', 'job_failed', etc.
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  metadata JSONB,
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high')),
  read_at TIMESTAMPTZ,
  snoozed_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_notifications_user ON notifications(user_id, created_at DESC);
-- Query: "unread notifications for user X" -> (user_id, read_at) where read_at IS NULL

-- Purpose: delivery status per notification per channel
CREATE TABLE public.notification_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
  channel TEXT NOT NULL CHECK (channel IN ('email', 'in_app', 'webhook')),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'bounced', 'unsubscribed')),
  attempts INT NOT NULL DEFAULT 0,
  last_attempted_at TIMESTAMPTZ,
  external_id TEXT,   -- e.g. email provider message ID
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### BILLING & USAGE TABLES

```sql
-- Purpose: append-only usage events (metering source of truth)
CREATE TABLE public.usage_events (
  id BIGSERIAL PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES workspaces(id),
  metric TEXT NOT NULL,          -- 'records_extracted', 'browser_minutes', 'api_requests', etc.
  quantity NUMERIC NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  idempotency_key TEXT NOT NULL,  -- Prevents double-counting
  metadata JSONB,
  UNIQUE (idempotency_key)
) PARTITION BY RANGE (occurred_at);

-- Purpose: hourly rolled-up usage per workspace per metric
CREATE TABLE public.usage_rollups (
  workspace_id UUID NOT NULL REFERENCES workspaces(id),
  metric TEXT NOT NULL,
  period_start TIMESTAMPTZ NOT NULL,  -- Truncated to hour
  quantity NUMERIC NOT NULL,
  PRIMARY KEY (workspace_id, metric, period_start)
);

-- Purpose: billing plans definition
CREATE TABLE public.plans (
  id TEXT PRIMARY KEY,    -- 'compare_free', 'intelligence_starter', etc.
  name TEXT NOT NULL,
  product TEXT NOT NULL CHECK (product IN ('compare', 'intelligence', 'extract')),
  limits JSONB NOT NULL,  -- {tracked_products: 25, competitors: 5, refresh_hours: 24, ...}
  price_minor BIGINT NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'INR',
  billing_period TEXT NOT NULL DEFAULT 'month',
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Purpose: workspace subscription to a plan
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id),
  plan_id TEXT NOT NULL REFERENCES plans(id),
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'trialing', 'past_due', 'cancelled', 'paused')),
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  trial_ends_at TIMESTAMPTZ,
  grace_period_ends_at TIMESTAMPTZ,   -- 7 days after payment failure
  razorpay_subscription_id TEXT,
  razorpay_customer_id TEXT,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### INTELLIGENCE TABLES (tenant-scoped)

```sql
-- Purpose: products that a business workspace is monitoring
CREATE TABLE public.tracked_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  variant_id UUID REFERENCES product_variants(id),
  your_price_minor BIGINT,   -- User's own selling price
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (workspace_id, product_id, variant_id)
);

-- Purpose: competitor merchants tracked by a workspace
CREATE TABLE public.tracked_competitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  merchant_id UUID NOT NULL REFERENCES merchants(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (workspace_id, merchant_id)
);

-- Purpose: alert rules (Intelligence: "alert when competitor undercuts me by > 5%")
CREATE TABLE public.price_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  condition_type TEXT NOT NULL,  -- 'competitor_undercut', 'mrp_change', 'out_of_stock'
  condition_params JSONB NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### CONSUMER TABLES (tenant-scoped)

```sql
-- Purpose: user's watchlist items with target price
CREATE TABLE public.watch_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  product_id UUID NOT NULL REFERENCES products(id),
  variant_id UUID REFERENCES product_variants(id),
  target_price_minor BIGINT,  -- NULL = any drop
  notify_channels TEXT[] NOT NULL DEFAULT '{email,in_app}',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (workspace_id, user_id, product_id, variant_id)
);
CREATE INDEX idx_watch_items_product ON watch_items(product_id) WHERE is_active = TRUE;
-- Query: "which users watch product X?" -> covers this index
```

---

## RLS Policies

### Pattern: Deny-by-default, then grant

```sql
-- Example: notifications table
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Deny all by default (no need for explicit deny policy; it's the default)

-- Users can only see their own notifications
CREATE POLICY "users_own_notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

-- Users can only update (read/snooze) their own notifications
CREATE POLICY "users_update_own_notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Server only: INSERT via service-role (no user policy needed for INSERT)
-- Service role bypasses RLS

-- Example: workspace-scoped table (watch_items)
ALTER TABLE watch_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workspace_members_select" ON watch_items
  FOR SELECT USING (
    workspace_id IN (
      SELECT workspace_id FROM memberships WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "workspace_members_insert" ON watch_items
  FOR INSERT WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM memberships WHERE user_id = auth.uid()
    )
    AND user_id = auth.uid()
  );
```

### RLS Testing Strategy

- pgTAP tests in `supabase/tests/` run in CI
- Cross-tenant attack tests: user A cannot read user B's data
- Every table has at least one cross-tenant test
- Test helper: `SET LOCAL role = authenticated; SET LOCAL request.jwt.claims = '{"sub":"user-a-uuid"}'`

---

## Supabase Storage Buckets

| Bucket           | Access            | Purpose                           |
| ---------------- | ----------------- | --------------------------------- |
| `product-images` | Public            | Product photos, hashed filenames  |
| `brand-assets`   | Public            | Brand logos, cached from sources  |
| `exports`        | Authenticated     | User data exports (CSV/JSON/XLSX) |
| `reports`        | Authenticated     | Generated PDF/HTML reports        |
| `run-artifacts`  | Service-role only | Raw HTML snapshots for debugging  |

**Image storage**: All scraped images are re-hosted. Never hotlink. Hash-based filenames prevent duplication. CDN via Supabase Storage CDN.

---

## Supabase Realtime Channels

| Channel                        | Pattern                               | Payload              | Subscribers          |
| ------------------------------ | ------------------------------------- | -------------------- | -------------------- |
| `workspace:{id}:notifications` | DB changes on notifications table     | Notification row     | User browser tabs    |
| `workspace:{id}:prices`        | DB changes on offers table            | Offer + latest price | Product page viewers |
| `run:{id}:logs`                | DB changes on run_logs table          | Log entry            | Run page viewers     |
| `source:health`                | DB changes on source_health_snapshots | Health state         | Admin dashboard      |

**Security**: All Realtime subscriptions are authenticated (JWT required). RLS policies apply to Realtime DB change events.

---

## Edge Functions vs Worker Processes

| Task                                      | Location            | Why                                   |
| ----------------------------------------- | ------------------- | ------------------------------------- |
| Auth JWT enrichment hook                  | Edge Function       | Must intercept auth flow              |
| Webhook signature verification (incoming) | Edge Function       | Lightweight, stateless                |
| Short-lived API responses (< 5s)          | apps/api (Fastify)  | More control, pg-boss integration     |
| Playwright scraping                       | apps/browser-worker | Cannot run in Edge Function           |
| pg-boss job processing                    | apps/worker         | Advisory locks incompatible with Edge |
| Report generation                         | apps/worker         | Long-running, PDF generation          |
| Match processing                          | apps/worker         | CPU-intensive                         |

**NEVER put heavy work in Edge Functions.** They have 150MB memory limit and are not for long-running compute.

---

## Migration Strategy

- All migrations in `/supabase/migrations/` as numbered SQL files
- Format: `YYYYMMDDHHMMSS_description.sql`
- Forward-only (no `down` files in practice; document rollback procedure separately)
- Expand/Contract pattern: add column (nullable) -> backfill (job) -> add NOT NULL -> drop old column
- Large backfills run as pg-boss jobs, not in migration files
- Migration dry-run in CI: `supabase db push --dry-run`
- Applied to local stack: `supabase db push`
- Applied to production: via CD pipeline using `supabase db push` with service-role key

### Migration Lifecycle

```
1. Developer writes migration SQL
2. Tests pass locally (supabase db reset + migrations + seed + tests)
3. PR: CI runs migration dry-run against migration history
4. Main: CD runs expand phase migration -> deploy -> (later) contract phase
```

---

## Backup & Recovery

- **FACT**: Supabase Pro includes daily automated backups + Point-in-Time Recovery (PITR) up to 7 days
- **FACT**: PITR logs archived continuously
- **Weekly restore drill**: scripted in `/docs/runbooks/restore-drill.md`, logged with timestamp and duration
- RPO target: <= 15 minutes (ASSUMPTION - validate with Supabase PITR granularity)
- RTO target: <= 2 hours (ASSUMPTION - validate with restore drill)

---

## pg_cron Jobs

```sql
-- Rotate price_observations partitions (first day of each month)
SELECT cron.schedule('create-monthly-partition', '0 0 1 * *',
  $$SELECT create_monthly_partition('price_observations')$$);

-- Daily price rollup (aggregate yesterday's observations at 2 AM IST)
SELECT cron.schedule('daily-price-rollup', '30 20 * * *',  -- 20:30 UTC = 02:00 IST
  $$CALL compute_daily_rollups(NOW()::DATE - 1)$$);

-- Hourly usage rollup
SELECT cron.schedule('hourly-usage-rollup', '5 * * * *',
  $$CALL compute_usage_rollups()$$);

-- Source health snapshot (every 15 min)
SELECT cron.schedule('source-health-snapshot', '*/15 * * * *',
  $$CALL snapshot_source_health()$$);
```

---

## pgTAP Cross-Tenant Attack Test Suite

To guarantee that Row Level Security (RLS) is airtight and cannot be bypassed, the codebase includes automated SQL tests executed via `supabase test db` (pgTAP):

```sql
-- supabase/tests/database/01_tenancy_rls.test.sql
BEGIN;
SELECT plan(12);

-- Setup test extensions and tenants
SELECT has_extension('pgtap');
SELECT tables_have_rls();

-- Create Tenant A and Tenant B test workspaces
INSERT INTO workspaces (id, name, slug) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Tenant Alpha', 'alpha'),
  ('b0000000-0000-0000-0000-000000000002', 'Tenant Beta', 'beta');

-- Simulate authenticated user session for Tenant Alpha
SELECT tests.authenticate_as('user-alpha@scrappy.in');

-- TEST: Tenant Alpha can view their own extraction tasks
SELECT is_empty(
  $$ SELECT * FROM extraction_tasks WHERE workspace_id = 'b0000000-0000-0000-0000-000000000002' $$,
  'Tenant Alpha MUST NOT be able to select Tenant Beta tasks'
);

-- TEST: Cross-tenant INSERT attack blocked
PREPARE cross_tenant_insert AS
  INSERT INTO extraction_tasks (workspace_id, url, schema)
  VALUES ('b0000000-0000-0000-0000-000000000002', 'https://victim.com', '[]'::jsonb);

SELECT throws_ok(
  'cross_tenant_insert',
  '42501', -- insufficient_privilege / RLS policy violation
  NULL,
  'Tenant Alpha MUST NOT be able to insert rows into Tenant Beta workspace'
);

SELECT * FROM finish();
ROLLBACK;
```

---

## Supabase CLI Workflow & Type Generation

1. **Local Stack**: `supabase start` boots the entire local stack (Postgres, Auth, Storage, Realtime, Inbucket, Studio).
2. **Schema Migrations**: Written in `/supabase/migrations/`. Applied with `supabase db reset`.
3. **Type Generation**:
   ```bash
   supabase gen types typescript --local > packages/db/src/supabase.types.ts
   ```
4. **CI Integration**:
   - `supabase test db` executes the pgTAP test suite.
   - `supabase db diff --check` fails CI if local migrations are out of sync with schema.
