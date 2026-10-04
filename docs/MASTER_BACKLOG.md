# SCRAPPY — MASTER BACKLOG

> **Single Source of Truth** for all requirements, backlog items, gaps, and technical debt.  
> **Status Notice:** Supersedes `/docs/PLAN/*`, merging `/docs/PLAN/13-roadmap.md`, `/docs/GAP_AUDIT.md`, `/docs/PROGRESS.md`, and `/docs/SCRAPPY_PROMPTS.md`.  
> Maintained autonomously. Only this document and `/docs/PROGRESS.md` ("NEXT ACTION") are updated going forward.

---

## 1. Backlog Items & Known Gaps (Execution Order)

| ID | Title | Priority | Status | Acceptance Criteria & Scope | Code / Test Evidence |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **G1** | Supabase Persistence Wiring | P0 | ✅ **DONE** | Runtime paths (Web, API, Workers) read/write local Supabase via `@supabase/supabase-js`. In-memory repo relegated to isolated unit tests. Watchlist/alert persisted across process restarts. | `packages/db/src/supabase.ts`, `apps/web/src/app/api/*`, `supabase test db` |
| **G2** | Real Supabase Auth & Multi-Tenancy | P0 | ✅ **DONE** | Supabase Auth (email/password & magic link via Mailpit). Trigger creates personal workspace + membership on signup. Workspace switcher UI, auth cookie sync, protected routes. Full E2E Playwright test. | `apps/web/src/app/auth/*`, `supabase/migrations/*_auth.sql`, `e2e/auth-flow.spec.ts` |
| **G3** | Full Enterprise Schema + RLS Coverage | P0 | ✅ **DONE** | Complete schema (~35-40 tables): match evidence, runs, tasks, run_logs, datasets, webhook deliveries, usage_events, notifications, audit_log, price_observations (partitioned), source health, saved searches, invitations. pgTAP test for EVERY table + meta-test verifying no public table lacks RLS. | `supabase/migrations/*_complete_schema_and_rls.sql`, `supabase/tests/database/02_rls_coverage.test.sql` |
| **G4** | pg-boss Queue & Realtime End-to-End | P0 | ✅ **DONE** | Workers run on pg-boss against local Supabase. Pipeline: Scrape -> Parse -> Match -> Price Observation -> Alert Check -> In-App Notification (Realtime) -> Email (Mailpit). E2E proof with price-drop fixture. | `apps/worker/*`, `supabase/migrations/*_realtime_publications.sql`, Mailpit API verification |
| **G5** | Billing & Dunning State Machine | P1 | ✅ **DONE** | Razorpay test-mode adapter behind interface (`INTEGRATION_MODE=local\|live`). Subscription lifecycle: active, past_due, trialing, cancelled, paused. Idempotent usage meter & 7-day grace period dunning state machine. | `packages/pricing/src/billing/*`, `packages/pricing/src/__tests__/billing.test.ts` |
| **G6** | Core Product Features Completion | P1 | ✅ **DONE** | Saved searches UI & API, team invites + RBAC roles via Mailpit, signed HMAC webhooks with replay log, live usage metering charts, Extract run lifecycle with streaming logs, scheduling, and datasets/export. | `apps/web/src/app/settings/*`, `apps/web/src/app/extract/*`, `apps/web/src/__tests__/features-g6.test.ts` |
| **G7** | Real Performance & Quality Audits | P1 | ✅ **DONE** | Real mobile Lighthouse scores (fix FCP 0ms navigation timing anomaly), Playwright visual-regression baselines (26 baselines), Axe checks on all 13 routes (zero violations), k6 & TS load test scripts verifying search p95 < 150ms & product p95 < 300ms. | `e2e/perf-vitals.spec.ts`, `e2e/axe.spec.ts`, `e2e/screenshots.spec.ts`, `load/load-benchmark.ts` |
| **G8** | Adversarial Gold Set (300+ Pairs) | P1 | ✅ **DONE** | Independent 350-pair benchmark derived from messy real-world catalog titles across 10 error taxonomies. Achieved 100.0% precision, 0.00% FPR (0 false merges), 99.17% recall, and 99.58% F1. | `packages/matching/fixtures/independent-gold-set.json`, `packages/matching/src/__tests__/independent-gold-set.test.ts` |
| **G9** | Security & Defense-in-Depth Pass | P0 | ✅ **DONE** | Multi-tenant IDOR protection verified across all workspace `:id` routes. Cryptographic API keys stored as SHA-256 with show-once plaintext secrets and soft-revocation audit trails. Webhook HMAC verification with 300s (5-minute) replay window. XSS sanitization of scraped HTML. SSRF defense blocking loopback, link-local metadata (169.254.169.254), private subnets, decimal/hex obfuscations, DNS rebinding, and redirect chains. | `e2e/security.spec.ts`, `packages/scraping/src/ssrf.ts`, `packages/scraping/src/html-sanitizer.ts`, `packages/scraping/src/__tests__/security.test.ts`, `apps/web/src/__tests__/security-g9.test.ts` |
| **G10** | Polish & Resilience Law | P2 | **IN PROGRESS** | Empty, error, partial, loading, stale, and offline states on all views. Full prefers-reduced-motion compliance. 360px viewport audit. | `apps/web/src/app/*`, `docs/screenshots/*` |

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
