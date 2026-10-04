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

**NEXT ACTION**: Build G5 — Billing: Razorpay test-mode adapter, subscription state machine, usage metering with idempotency, grace period and dunning, with tests.

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
