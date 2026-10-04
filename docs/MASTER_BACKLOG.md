# SCRAPPY — MASTER BACKLOG

> **Single Source of Truth** for all requirements, backlog items, gaps, and technical debt.  
> **Status Notice:** Supersedes `/docs/PLAN/*`, merging `/docs/PLAN/13-roadmap.md`, `/docs/GAP_AUDIT.md`, `/docs/PROGRESS.md`, and `/docs/SCRAPPY_PROMPTS.md`.  
> Maintained autonomously. Only this document and `/docs/PROGRESS.md` ("NEXT ACTION") are updated going forward.

---

## 1. Backlog Items & Known Gaps (Execution Order)

| ID | Title | Priority | Status | Acceptance Criteria & Scope | Code / Test Evidence |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **G1** | Supabase Persistence Wiring | P0 | **IN PROGRESS** | Runtime paths (Web, API, Workers) read/write local Supabase via `@supabase/supabase-js`. In-memory repo relegated to isolated unit tests. Watchlist/alert persisted across process restarts. | `packages/db/src/supabase.ts`, `apps/api/src/routes/watchlist.ts`, `supabase test db` |
| **G2** | Real Supabase Auth & Multi-Tenancy | P0 | **TODO** | Supabase Auth (email/password & magic link via Inbucket). Trigger creates personal workspace + membership on signup. Workspace switcher UI, auth cookie sync, protected routes. Full E2E Playwright test. | `apps/web/src/app/auth/*`, `supabase/migrations/*_auth.sql`, `e2e/auth.spec.ts` |
| **G3** | Full Enterprise Schema + RLS Coverage | P0 | **TODO** | Complete schema (~35-40 tables): match evidence, runs, tasks, run_logs, datasets, webhook deliveries, usage_events, notifications, audit_log, price_observations (partitioned), source health, saved searches, invitations. pgTAP test for EVERY table + meta-test verifying no public table lacks RLS. | `supabase/migrations/*_full_schema.sql`, `supabase/tests/database/*.test.sql` |
| **G4** | pg-boss Queue & Realtime End-to-End | P0 | **TODO** | Workers run on pg-boss against local Supabase. Pipeline: Scrape -> Parse -> Match -> Price Observation -> Alert Check -> In-App Notification (Realtime) -> Email (Inbucket). E2E proof with price-drop fixture. | `packages/worker/*`, `supabase/functions/*`, Inbucket mail verification |
| **G5** | Billing & Dunning State Machine | P1 | **TODO** | Razorpay test-mode adapter behind interface (`INTEGRATION_MODE=local\|live`). Subscription lifecycle: active, past_due, trialing, cancelled, halted. Idempotent usage meter & dunning job. | `packages/pricing/src/billing.ts`, `apps/api/src/routes/billing.ts` |
| **G6** | Core Product Features Completion | P1 | **TODO** | Saved searches UI & API, team invites + RBAC roles, signed HMAC webhooks with replay log, live usage metering charts, Extract run lifecycle with streaming logs and scheduling. | `apps/web/src/app/settings/*`, `apps/web/src/app/extract/*` |
| **G7** | Real Performance & Quality Audits | P1 | **TODO** | Real mobile Lighthouse scores (fix FCP 0ms navigation timing anomaly), Playwright visual-regression baselines, Axe checks on all routes, k6 load test scripts for search & product pages. | `e2e/lighthouse.spec.ts`, `e2e/visual-regression.spec.ts`, `load/k6-search.js` |
| **G8** | Adversarial Gold Set (300+ Pairs) | P1 | **TODO** | Independent 300+ pair benchmark derived from messy real-world catalog titles (not synthetic rule generators). Report precision & recall with error taxonomy. | `packages/matching/fixtures/independent-gold-set.json`, vitest suite |
| **G9** | Security & Defense-in-Depth Pass | P0 | **TODO** | IDOR automated tests on every `:id` route, API key SHA-256 validation, webhook 5-minute replay window, XSS sanitize on scraped HTML, SSRF redirect/DNS rebinding prevention. | `e2e/security.spec.ts`, `packages/scraping/src/ssrf.ts` |
| **G10** | Polish & Resilience Law | P2 | **TODO** | Empty, error, partial, loading, stale, and offline states on all views. Full prefers-reduced-motion compliance. 360px viewport audit. | `apps/web/src/app/*`, `docs/screenshots/*` |

---

## 2. Superseded Planning Documents
The following plan files are formally superseded by this backlog:
- `docs/PLAN/00-executive-summary.md` -> Superseded
- `docs/PLAN/01-ux-research.md` -> Superseded
- `docs/PLAN/02-ui-design-spec.md` -> Superseded
- `docs/PLAN/03-design-system.md` -> Superseded
- `docs/PLAN/04-architecture.md` -> Superseded
- `docs/PLAN/05-supabase-design.md` -> Superseded
- `docs/PLAN/06-backend-api.md` -> Superseded
- `docs/PLAN/07-scraping-matching.md` -> Superseded
- `docs/PLAN/08-ai-plan.md` -> Superseded
- `docs/PLAN/09-security-privacy.md` -> Superseded
- `docs/PLAN/10-quality-plan.md` -> Superseded
- `docs/PLAN/11-devops-deploy.md` -> Superseded
- `docs/PLAN/12-cost-and-billing.md` -> Superseded
- `docs/PLAN/13-roadmap.md` -> Superseded
- `docs/PLAN/14-risks.md` -> Superseded
- `docs/PLAN/15-env-and-credentials.md` -> Superseded
- `docs/PLAN/16-open-decisions.md` -> Superseded
