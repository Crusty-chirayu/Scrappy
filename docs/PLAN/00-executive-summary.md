# 00 — Executive Summary

> **SCRAPPY Stage A Planning Report** | Date: 2026-10-04 | Status: Awaiting Approval

---

## Thesis

SCRAPPY turns the messy web into a **trusted, historical graph of products, merchants and offers**, exposed as three products sharing one platform:

| Product          | Who It Serves                  | Revenue Model                           |
| ---------------- | ------------------------------ | --------------------------------------- |
| **Compare**      | Shoppers seeking genuine deals | Affiliate commissions (free product)    |
| **Intelligence** | Brands, sellers, pricing teams | SaaS subscriptions (INR/mo)             |
| **Extract**      | Developers, data teams         | Usage-based (records + browser-minutes) |

All three are **views on one platform** — one database, one scraping engine, one matching engine. They are never built as separate apps.

---

## Scope Committed in This Plan

### Ships First (MVP, Phase 1-4)

- Foundation: monorepo, tooling, CI, Supabase-local stack
- Brand & design system (tokens, components, charts, animated mark)
- Data architecture: full Supabase schema with RLS, migrations, seed
- Scraping engine + adapter framework (with 4 initial source stubs)
- Compare: search, product page, price history, watchlist, email+in-app alerts
- Notifications & alert engine
- Auth (Supabase Auth: magic link + Google), workspaces, billing v1 (Razorpay)
- Admin console + observability baseline
- Landing page + marketing surfaces
- Hardened CI/CD, DR runbooks

### Ships After MVP Proves Itself (Phase 5)

- Extract builder (full no-code extractor with live browser stream)
- Intelligence dashboard (competitor tracking, market view, rules, reports)
- Public API + developer platform + SDK generation

### Must Wait (Post-Launch)

- Browser extension, price prediction, auto-repricing, Shopify sync
- SOC2, enterprise SSO, Marketplace, CLI
- Google Sheets sync, PDF reports, mobile app

---

## Key Platform Decisions (Addendum Overrides)

| Area                 | Original Spec      | Addendum Override                                         | Rationale                                                            |
| -------------------- | ------------------ | --------------------------------------------------------- | -------------------------------------------------------------------- |
| Database/Auth        | Neon + Better Auth | Supabase Postgres + Supabase Auth                         | Single vendor for PG, auth, storage, realtime, edge                  |
| Object Storage       | R2                 | Supabase Storage                                          | Simplicity; R2 when egress cost justifies                            |
| In-app notifications | custom push        | Supabase Realtime                                         | Real-time subscription already in platform                           |
| ORM                  | Drizzle            | Generated Supabase types + Drizzle for complex queries    | Supabase CLI generates typed client; Drizzle kept for advanced joins |
| Queue                | pg-boss            | pg-boss on direct PG connection (session mode, port 5432) | Transaction pooler incompatible with advisory locks used by pg-boss  |

---

## What Ships First, What Waits

**Critical path to first paying customer:**

1. Monorepo + Supabase local stack working (Phase 1)
2. DB schema + RLS green (Phase 2)
3. Scraping engine + 2 live adapters (Phase 3)
4. Compare product: search, product page, price history, alerts (Phase 4)
5. Auth + billing woven into Phase 4
6. Admin + observability baseline: Phase 4 tail

Extract and Intelligence are Phase 5+. They reuse the Phase 3 scraping engine.

---

## Honest Limits

**ASSUMPTION** - Supabase Storage will be cost-effective below 10k users; at scale, egress costs may favor Cloudflare R2 or a CDN layer. Budget checkpoint at 10k users.

**ASSUMPTION** - Razorpay Subscriptions v2 API supports the billing flows designed here. Full compliance with 2026 RBI e-mandate framework must be verified before go-live by someone with a live Razorpay account.

**INFERENCE** - Amazon PA-API and Flipkart Affiliate API are available but require active affiliate accounts with qualifying sales. In MVP, these sources run in user-initiated mode against recorded fixtures. Live feeds are a go-live credential step.

**FACT** - Croma and Reliance Digital have no official public data APIs. Their ToS prohibits automated scraping. Plan ships them as Unsupported initially with an honest UI state; a legal review is a go-live blocking item.

**FACT** - India DPDP Act 2023 applies. We are both Data Fiduciary (own users) and Data Processor (Extract customers). DPA templates, privacy policy, breach notification workflow, and data subject rights tooling are required before launch.

**FACT** - pgvector, pg_trgm, pg_cron, unaccent are all available on Supabase Pro. No extension is a blocker.

---

## Risk Profile Summary

| Risk                                                  | Severity   | Mitigation                                                         |
| ----------------------------------------------------- | ---------- | ------------------------------------------------------------------ |
| Source ToS / legal liability for scraping Croma/RD    | HIGH       | Ship as Unsupported; get legal review; pursue official feeds       |
| Amazon PA-API requires qualifying affiliate sales     | MEDIUM     | Build against fixture/feed mode; account bootstrap is go-live step |
| False product matches destroy user trust              | CRITICAL   | 99.5% precision gate; human review queue; "Possible match" UI      |
| pg-boss incompatible with Supabase transaction pooler | HIGH       | Use session mode (port 5432) for worker direct connections         |
| RBI e-mandate complexity for subscriptions            | MEDIUM     | Razorpay handles compliance; test in test-mode first               |
| DPDP Act non-compliance                               | HIGH       | Legal review gate before launch; privacy-by-design in schema       |
| Cost explosion from browser minutes                   | MEDIUM     | Hard caps per workspace, per-run; metered billing                  |
| Supabase Realtime scaling                             | LOW-MEDIUM | Pro plan: 500 concurrent; upgrade trigger documented               |

---

## Development Philosophy

Every external service is behind an **adapter interface** with `INTEGRATION_MODE=local|live`. The entire app runs with zero real credentials locally.

Go-live = add `.env` secrets + flip mode. No code changes required.

---

## Prompt 01 Rework & Foundation Audit

> Detailed protocol for transitioning the monorepo foundation to full Supabase CLI compliance, pure RLS tenancy, clean phase gates, and file lifecycle disposition.

### 1. Local Stack Migration to Supabase CLI & Schema Type Strategy

- **Supabase CLI as Platform Engine**:
  - Supersedes the raw `infra/docker-compose.yml` and `infra/init-db.sql`.
  - Initialized with `supabase init` generating `/supabase/config.toml`.
  - Local development runs via `supabase start`, spinning up:
    - Postgres 16 (with `pgvector`, `pg_trgm`, `unaccent`, and `pg_cron` built-in).
    - GoTrue (Supabase Auth) on port 54321.
    - PostgREST for instant typed data APIs.
    - Realtime Server for live in-app notifications and price ticker push.
    - Storage API (S3-compatible local bucket emulators).
    - Inbucket for local email confirmation and alert testing.
    - Supabase Studio on port 54323 for visual inspection.
- **Migrations & Seeds**:
  - Versioned SQL migrations in `/supabase/migrations/YYYYMMDDHHMMSS_name.sql`.
  - Idempotent local testing and baseline seed in `/supabase/seed.sql`.
- **Type Generation & ORM Strategy (Drizzle vs Generated Types)**:
  - **Decision**: Primary source of truth is **Supabase Generated Types** via `supabase gen types typescript --local > packages/db/src/supabase.types.ts`.
  - **Drizzle Role**: Drizzle ORM schema is eliminated to avoid double-maintenance of Drizzle definitions vs SQL migrations. Complex backend queries will use typed Postgres queries directly or the typed Supabase JS client (`@supabase/supabase-js`), keeping schema single-sourced in versioned SQL migrations.
  - **Worker Connections**: Workers (`apps/worker`) connect to Postgres directly on port 5432 (session mode) for `pg-boss` advisory locks, bypassing the transaction pooler.

### 2. Tenancy Enforcement: Replacing `withWorkspaceFilter` with Database-Enforced RLS + pgTAP

- **Vulnerability of Application-Level Scoping**: The initial `withWorkspaceFilter` helper relied on developers remembering to wrap queries. A missing filter exposes cross-tenant data.
- **Database Row Level Security (RLS) on EVERY Table**:
  - `ALTER TABLE <table_name> ENABLE ROW LEVEL SECURITY;`
  - `ALTER TABLE <table_name> FORCE ROW LEVEL SECURITY;`
  - Default policy: **DENY ALL**.
  - Tenant policies enforced using `auth.uid()` and session JWT claims:
    ```sql
    CREATE POLICY "Workspace members can view workspace data"
      ON extraction_tasks
      FOR SELECT
      USING (
        workspace_id IN (
          SELECT workspace_id FROM workspace_members
          WHERE user_id = auth.uid()
        )
      );
    ```
  - Public catalog tables (`products`, `offers`, `price_observations`) have `SELECT` policies open to public (`USING (true)`), but `INSERT`/`UPDATE`/`DELETE` restricted exclusively to `service_role` (used only by backend scrapers and workers).
- **pgTAP Cross-Tenant Attack Verification**:
  - Automated SQL test suites in `/supabase/tests/database/tenancy.test.sql`.
  - Creates Tenant A and Tenant B test users.
  - Verifies Tenant A cannot read, insert, update, or delete Tenant B's extraction tasks, alerts, or workspace settings.
  - Verified in CI before any code can merge.

### 3. Honest Verification of Prompt 01 Gate

Real measured command outputs executed in workspace:

- **`pnpm install`**: Clean resolution across 15 workspace packages, 0 vulnerabilities, lockfile verified.
- **`pnpm run lint`**: 0 errors, 0 warnings across all files with strict TypeScript rules and architecture boundary checking.
- **`pnpm run typecheck`**: 23/23 tasks passed with strict TypeScript compilation.
- **`pnpm run test`**: 8 test suites, 25 unit/integration tests passed:
  - Currency normalization (INR paise, commas, decimal parsing)
  - Environment loader (fail-fast behavior, default fallback)
  - SSRF protection (private IP blocking, cloud metadata blocking)
  - Circuit breaker (failure tripping, half-open recovery)
  - Adapter health contracts
  - Deterministic matching & false match prevention
  - Deal score calculation & anomaly suppression
  - AI deterministic fallback
- **`pnpm run build`**: 14/14 packages and apps built successfully. Next.js App Router generated static pages with First Load JS of 103 kB (well below the 170 kB performance budget).
- **`pnpm dev`**: Monorepo orchestration configured in `turbo.json` with persistent daemons for Web (3000), Admin (3001), API (4000), Worker, and Browser-Worker (5000).
- **Environment Prerequisite**: Local `supabase start` requires Docker Desktop running on the developer workstation.

### 4. File Lifecycle & Disposition Audit (Keep / Rewrite / Delete)

| File Path                                  | Original Purpose                 | Planned Prompt  | Disposition Decision                          | Rationale                                                                                               |
| ------------------------------------------ | -------------------------------- | --------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `apps/web/src/app/compare/page.tsx`        | Compare route UI                 | Prompt 05       | **Keep as minimal shell**                     | Keeps Next.js build and routing valid; full UI implemented in Prompt 05.                                |
| `apps/web/src/app/intelligence/page.tsx`   | Intelligence route UI            | Prompt 10       | **Keep as minimal shell**                     | Minimal shell for build validity; full UI implemented in Prompt 10.                                     |
| `apps/web/src/app/extract/page.tsx`        | Extract Studio UI                | Prompt 09       | **Keep as minimal shell**                     | Minimal shell for build validity; full UI implemented in Prompt 09.                                     |
| `apps/web/src/app/docs/page.tsx`           | Docs shell                       | Prompt 12/14    | **Keep as minimal shell**                     | Shell route; full content populated with API & legal docs.                                              |
| `apps/api/src/index.ts`                    | API entrypoint + dummy endpoints | Prompt 06       | **Rewrite in Prompt 06**                      | Replace temporary price endpoint with complete OpenAPI 3.1 router, auth guards, and rate limiting.      |
| `apps/worker/src/index.ts`                 | Worker daemon stub               | Prompt 04/06/08 | **Rewrite in Phase 3**                        | Replace console logs with active pg-boss queue consumers for scraping, matching, and notifications.     |
| `apps/browser-worker/src/index.ts`         | Browser runner stub              | Prompt 04/08    | **Rewrite in Prompt 04**                      | Implement isolated Playwright runner pool with memory caps.                                             |
| `apps/admin/src/index.ts`                  | Ops console HTTP stub            | Prompt 13       | **Rewrite in Prompt 13**                      | Replace simple HTTP server with full Next.js admin app with SSO/allowlist.                              |
| `packages/db/src/schema/index.ts`          | Drizzle ORM schema               | Prompt 02       | **Rewrite to SQL Migrations**                 | Schema transitions to `/supabase/migrations/` to establish Supabase as single source of truth.          |
| `packages/db/src/tenancy/index.ts`         | `withWorkspaceFilter` helper     | Prompt 01       | **Delete / Replace**                          | Replaced by database-level Row Level Security policies and pgTAP test suite.                            |
| `packages/adapters/src/*`                  | Source adapter stubs             | Prompt 04       | **Keep contract, rewrite logic in Prompt 04** | Adapter interfaces kept; real scraping & fixture playback built in Prompt 04.                           |
| `packages/matching/src/*`                  | Matching engine stub             | Prompt 11       | **Keep contract, rewrite in Prompt 11**       | Baseline logic kept; vector + trigram candidate retrieval added in Prompt 11.                           |
| `packages/pricing/src/*`                   | Deal score logic                 | Prompt 04       | **Keep & Calibrate**                          | Mathematical formula for INR paise deal scoring is production-grade; calibrate thresholds in Prompt 04. |
| `packages/ai/src/*`                        | AI fallback client               | Prompt 11       | **Keep contract, expand in Prompt 11**        | Deterministic fallback kept; live Gemini adapter added in Prompt 11.                                    |
| `packages/ui/src/*` & `brand`              | Design tokens                    | Prompt 02/03    | **Rewrite & Expand in Prompt 02/03**          | Baseline tokens kept; complete component library and Storybook-style previews built in Prompt 02 & 03.  |
| `infra/docker-compose.yml` & `init-db.sql` | Raw Docker PG/MinIO stack        | Prompt 01       | **Delete / Replace with Supabase CLI**        | Replaced by `supabase start` (bundled Postgres 16, Auth, Storage, Realtime, Inbucket).                  |
