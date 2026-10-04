# PROGRESS

> SCRAPPY Development Progress Log  
> Read at start of every session. Update after every task.  
> Status: `todo` | `in-progress` | `done` | `blocked`

---

## Current Status: **STAGE B CONTINUOUS EXECUTION (MASTER BACKLOG)**

- **Single Source of Truth**: `/docs/MASTER_BACKLOG.md` created; `/docs/PLAN/*` marked superseded.
- **G1 (Supabase Persistence)**: ✅ **DONE**
  - Wired web app (`/api/watchlist`, `/api/alerts`, `actions.tsx`) and API (`/v1/search`, `/v1/products/:id`, `/v1/watchlist`, `/v1/alerts`) to `defaultSupabaseRepository` against real local Supabase PostgreSQL.
  - Removed in-memory repo from all production runtime paths.
  - Proved persistence: added items, restarted web server, reloaded, and verified items persisted in PostgreSQL.
  - Strict TypeScript: 0 `any` types; all lint, typecheck (23/23 packages), vitest (121 tests), pgTAP (13 tests), and Playwright E2E suites passing.
- **G2 (Real Supabase Auth & Multi-Tenancy)**: ✅ **DONE**
  - PostgreSQL trigger `handle_new_user()` in migration `20261004000002_auth_workspace_trigger.sql` automatically provisions a personal workspace with owner role in `public.workspace_members` whenever a user signs up.
  - Implemented `/auth/login` (password & magic link OTP), `/auth/signup`, `/auth/callback`, `/api/workspaces`, and `WorkspaceSwitcher` component.
  - Verified end-to-end with Playwright suite `e2e/auth-flow.spec.ts` (4/4 passed on desktop and mobile 360px) including verification of local Mailpit magic link receipt.
  - Zero open defects in `docs/DEFECTS.md`; all quality gates green.
- **G3 (Complete Schema, Partitioning & RLS-Coverage pgTAP)**: ✅ **DONE**
  - Applied migration `20261004000003_complete_schema_and_rls.sql` with tables: `match_evidence`, `extract_run_logs`, `datasets`, `dataset_records`, `usage_events`, and `price_daily_rollups`.
  - Enforced Row Level Security on EVERY table in `public` schema.
  - Implemented automated pgTAP test suite `02_rls_coverage.test.sql` (15 tests) including dynamic PostgreSQL catalog audit (`pg_class.relrowsecurity`) confirming zero unprotected public tables, plus cross-tenant dataset attack tests.
  - Tested: `supabase test db` (28/28 tests passing), `pnpm check` (23/23 packages typechecked, 121 unit tests passing, all builds successful), and Playwright E2E suites (10/10 tests passing).

- **G4 (pg-boss Queue, Pipeline & Realtime E2E)**: ✅ **DONE**
  - Applied migration `20261004000004_realtime_publications.sql` adding `public.notifications`, `public.alerts`, and `public.extract_runs` to `supabase_realtime`.
  - Built pg-boss daemon (`apps/worker/src/boss.ts`) connecting directly to PostgreSQL (port 55322, session mode) with queues `job:scrape-and-ingest`, `job:fetch-http`, `job:fetch-browser`, `job:parse`, `job:match`, `job:alert`, `job:notify`.
  - Built full ingestion pipeline (`apps/worker/src/pipeline.ts`) covering scrape -> parse (adapter) -> match (`DeterministicMatchingEngine` + `match_evidence`) -> price observation (`price_observations` + `offers` update) -> alert evaluation -> in-app notification (`public.notifications` via Realtime) -> email delivery via local Mailpit (`apps/worker/src/mailer.ts`).
  - Proved end-to-end with comprehensive test `apps/worker/src/__tests__/worker-pipeline-e2e.test.ts`: verified price drop triggers alert, records immutable price observation, writes match evidence, publishes live via Supabase Realtime channel, and delivers alert email to local Mailpit (HTTP API 200).
  - All quality gates green: `supabase test db` (28/28 tests passing), `pnpm check` (23/23 packages typechecked, 18 test files / 122 tests passing, builds succeeding), and Playwright E2E suites (10/10 tests passing).

- **G5 (Billing, Subscriptions, Dunning & Metering Engine)**: ✅ **DONE**
  - Applied migration `20261004000005_billing_subscriptions.sql` creating `public.subscriptions` and `public.invoices` with RLS, updated `workspaces_plan_check` constraint with 'business' tier, and enabled Realtime.
  - Implemented `FakeRazorpayAdapter` and `RazorpayAdapter` (`packages/pricing/src/billing/razorpay-adapter.ts`) behind `BillingProvider` interface with HMAC webhook verification.
  - Implemented `SubscriptionStateMachine` (`packages/pricing/src/billing/subscription-machine.ts`) with lifecycle transitions: `subscription.charged` -> active, `payment.failed` -> past_due (7-day grace period), hourly dunning cycle reminders (Day 1, 3, 6), and automatic downgrade to free upon expiration.
  - Implemented `UsageMeteringService` (`packages/pricing/src/billing/usage-metering.ts`) with idempotency key deduplication on `public.usage_events` (guaranteeing zero double-billing on retries) and soft (80%) / hard (100%) quota tracking.
  - Added comprehensive test suite `packages/pricing/src/__tests__/billing.test.ts` (7/7 passed).
  - All quality gates green: `supabase test db` (28/28 tests passing), `pnpm check` (23/23 packages typechecked, 19 test files / 129 tests passing, builds successful), and Playwright E2E suites (10/10 tests passing).

- **G6 (Remaining Product Features: Saved Searches, Team, Webhooks, Usage, Extract & Datasets)**: ✅ **DONE**
  - **Saved Searches**: Created `apps/web/src/app/api/saved-searches/route.ts` (GET, POST, DELETE against `public.saved_searches`). Connected `apps/web/src/app/compare/page.tsx` with 1-click filtering, dynamic search saving, and deletion.
  - **Team Invites & Roles**: Created `apps/web/src/app/api/team/route.ts` (GET, POST, DELETE against `public.workspace_members` and `public.team_invitations`). Wired invite dispatch with Mailpit emulator notification, role badges (`owner`, `admin`, `member`), and revocation in `apps/web/src/app/settings/page.tsx`.
  - **Webhooks & Deliveries**: Created `apps/web/src/app/api/webhooks/route.ts` and `apps/web/src/app/api/webhooks/deliveries/route.ts`. Features show-once secret key banner, SHA-256 secret hashing in DB, HMAC-SHA256 request signing, test dispatch ping, and delivery replay log.
  - **Usage UI & Metering**: Created `apps/web/src/app/api/usage/route.ts` querying `UsageMeteringService` on `public.usage_events`. Connected Settings Usage Metering tab to live progress bars and plan limits.
  - **Full Extract Run Lifecycle, Logs & Datasets**: Created `apps/web/src/app/api/extract/route.ts`, `apps/web/src/app/api/extract/[runId]/logs/route.ts`, `apps/web/src/app/api/datasets/route.ts`, and `apps/web/src/app/api/datasets/[datasetId]/export/route.ts`. Supports lifecycle (queued -> running -> completed), writes streaming logs to `public.extract_run_logs`, persists output into `public.datasets` & `public.dataset_records`, meters usage, and provides 1-click CSV/JSON artifact downloads.
  - **Testing & Quality**: Added integration suite `apps/web/src/__tests__/features-g6.test.ts` (6/6 passed). All tests green: `pnpm check` (23/23 packages typechecked, 20 test files / 135 tests passed), `supabase test db` (28/28 pgTAP tests passed), and Playwright E2E suites (10/10 passed on desktop & mobile 360px).

- **G7 (Real Performance, Accessibility & Quality Audits)**: ✅ **DONE**
  - **FCP / LCP & Navigation Timing Budget Audits**: Enhanced `e2e/perf-vitals.spec.ts` with buffered `PerformanceObserver` paint and largest contentful paint observers, strictly asserting non-zero FCP (`fcpMs > 0` and `< 1000ms`), LCP (`lcpMs < 1800ms`), cached TTFB (`< 300ms`), and JS bundle transfer budgets (`< 250KB`). Verified 6/6 tests passing across both desktop-1280 and mobile-360.
  - **Complete WCAG 2.2 AA Accessibility Audit**: Expanded `e2e/axe.spec.ts` across all 13 routes (`/`, `/auth/login`, `/auth/signup`, `/compare`, `/compare/[id]`, `/extract`, `/intelligence`, `/status`, `/settings`, `/docs`, `/legal/privacy`, `/legal/terms`, `/legal/responsible-scraping`). Fixed accessible name violations on form inputs and selects. Verified 26/26 tests passing on desktop and mobile with zero violations.
  - **Visual Regression Baselines**: Updated `e2e/screenshots.spec.ts` to capture full-page baselines across all 13 routes in both desktop-1280 and mobile-360 viewports into `/docs/screenshots/` (26 verified PNG baselines generated).
  - **Search & Product Page Caching & Load Benchmarks**:
    - Created high-performance `/api/search` route with in-memory query caching (60s TTL) and Cache-Control headers.
    - Implemented ISR caching (`revalidate = 60` and `generateStaticParams`) on `/compare/[id]` route.
    - Authored k6 scripts: `load/k6-search.js` (threshold `p(95)<150`) and `load/k6-product.js` (threshold `p(95)<300`).
    - Built TypeScript benchmark runner `load/load-benchmark.ts` (`pnpm run test:load`) testing 60 requests with 10 concurrent workers. Achieved:
      - Search API p95: **118ms** (< 150ms budget, passing Rule 8)
      - Product Page p95: **98ms** (< 300ms budget, passing Rule 8)
      - Zero error rate across all runs.
  - **Quality Gates Passing**: All 68 Playwright tests passing, 28/28 pgTAP tests passing, 135/135 vitest unit tests passing, zero lint/typecheck defects.

**NEXT ACTION**: Build G8 — Adversarial Gold Set (300+ Pairs) with messy real-world catalog titles, precision/recall benchmark reporting, and error taxonomy analysis.

---

## Stage A: Planning

| Doc | Title               | Status  | Location                            |
| --- | ------------------- | ------- | ----------------------------------- |
| 00  | Executive Summary   | ✅ done | docs/PLAN/00-executive-summary.md   |
| 01  | UX Research         | ✅ done | docs/PLAN/01-ux-research.md         |
| 02  | UI Design Spec      | ✅ done | docs/PLAN/02-ui-design-spec.md      |
| 03  | Design System       | ✅ done | docs/PLAN/03-design-system.md       |
| 04  | Architecture        | ✅ done | docs/PLAN/04-architecture.md        |
| 05  | Supabase Design     | ✅ done | docs/PLAN/05-supabase-design.md     |
| 06  | Backend API         | ✅ done | docs/PLAN/06-backend-api.md         |
| 07  | Scraping & Matching | ✅ done | docs/PLAN/07-scraping-matching.md   |
| 08  | AI Plan             | ✅ done | docs/PLAN/08-ai-plan.md             |
| 09  | Security & Privacy  | ✅ done | docs/PLAN/09-security-privacy.md    |
| 10  | Quality Plan        | ✅ done | docs/PLAN/10-quality-plan.md        |
| 11  | DevOps & Deployment | ✅ done | docs/PLAN/11-devops-deploy.md       |
| 12  | Cost & Billing      | ✅ done | docs/PLAN/12-cost-and-billing.md    |
| 13  | Roadmap             | ✅ done | docs/PLAN/13-roadmap.md             |
| 14  | Risks               | ✅ done | docs/PLAN/14-risks.md               |
| 15  | Env & Credentials   | ✅ done | docs/PLAN/15-env-and-credentials.md |
| 16  | Open Decisions      | ✅ done | docs/PLAN/16-open-decisions.md      |

---

## Stage B: Implementation Roadmap (Single Source of Truth: 13-roadmap.md)

| Phase | Name                        | Status      | Key Deliverables & Notes                                                  |
| ----- | --------------------------- | ----------- | ------------------------------------------------------------------------- |
| 1     | Foundation (P1 Rework)      | ✅ done     | Monorepo, Supabase CLI, RLS on every table, pgTAP tests, generated types  |
| 2     | Data Layer + Design System  | ✅ done     | Schema seed (500 products), tokens, @scrappy/ui components, contrast, axe |
| 03    | Design System               | ✅ done     | Phase 2                                                    |
| 3     | Scraping Engine             | ✅ done     | Adapter contracts, HTTP fetcher, robots, rate limit, Amazon/Flipkart fixtures, Croma/Reliance stubs, chaos test |
| 4     | Compare + Alerts + Auth     | ✅ done     | Search UI/API, autocomplete, product page, price history, deal analysis, watchlist, alerts, billing checkout |
| 05    | Compare UI                  | ✅ done     | Phase 4                                                    |
| 06    | Alerts & Notifications      | ✅ done     | Phase 4                                                    |
| 07    | Auth, Workspace, Billing    | ✅ done     | Phase 4                                                    |
| 5     | Extract + Intelligence      | ✅ done     | Visual builder, SSRF validator, selector engine, competitor matrix, matching benchmark, REST API |
| 08    | Extract Engine              | ✅ done     | Phase 5                                                    |
| 09    | Extract UI                  | ✅ done     | Phase 5                                                    |
| 10    | Intelligence                | ✅ done     | Phase 5                                                    |
| 11    | Matching & AI               | ✅ done     | Phase 5                                                    |
| 12    | Public API & Developer Portal | ✅ done   | Phase 5                                                    |
| 6     | Hardening & Scale           | ✅ done     | 20 named critical tests, runbooks (DR, drift, billing), DEFECTS.md 0 open |
| 15    | Hardening                   | ✅ done     | Phase 6                                                    |
| 7     | Launch & Marketing          | ✅ done     | Admin console, marketing landing page, legal, status, Prompt 18 audit      |
| 13    | Admin Console               | ✅ done     | Phase 7                                                    |
| 14    | Marketing Site & Legal Pages| ✅ done     | Phase 7                                                    |
| 16    | Launch Audit                | ✅ done     | Phase 7                                                    |
| 17    | Observability               | ✅ done     | Phase 7                                                    |
| 18    | Retrospective               | ✅ done     | Phase 7                                                    |

---

## Open Decisions (from docs/PLAN/16-open-decisions.md)

| #   | Decision                            | Status | Blocks           |
| --- | ----------------------------------- | ------ | ---------------- |
| D06 | Hosting region (Mumbai recommended) | OPEN   | Phase 1 infra    |
| D07 | Compare: free forever?              | OPEN   | Brand promise    |
| D10 | Domain name (scrappy.in?)           | OPEN   | Canonical URLs   |
| D01 | Legal entity registration           | OPEN   | Go-live          |
| D02 | Real pricing numbers                | OPEN   | Marketing site   |
| D03 | Amazon PA-API strategy              | OPEN   | Live Amazon data |
| D04 | Croma/Reliance partnership outreach | OPEN   | Future coverage  |
| D05 | Privacy counsel engagement          | OPEN   | Legal gate       |
| D08 | Admin allowlist                     | OPEN   | Admin deploy     |
| D09 | AI summaries in reports at launch?  | OPEN   | Report scope     |

---

## Defects Log

See [docs/DEFECTS.md](file:///e:/projects/Scrappy/docs/DEFECTS.md) for full tracking:
- **Total Logged:** 11
- **Total Closed:** 11
- **Total Open:** 0 (Zero Open Defects standard fulfilled)

---

## Key Research Findings (quick reference)

- **pg-boss + Supabase**: Workers MUST connect via session mode (port 5432), NOT transaction pooler (port 6543)
- **Amazon PA-API**: Requires qualifying sales to maintain; new accounts blocked
- **Croma/Reliance Digital**: No official API; ToS prohibits scraping; shipping as `Unsupported`
- **DPDP Act 2023**: Applies; dual role (Fiduciary for users, Processor for Extract customers); legal review required before launch
- **GST invoicing**: Required for B2B billing; SAC code 998314 for SaaS
- **pgvector, pg_trgm, pg_cron, unaccent**: All available on Supabase Pro
