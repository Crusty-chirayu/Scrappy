# SCRAPPY — Project Status Report

**Generated**: 2026-10-05 | **Branch**: `main` (62aeb9d) | **Status**: STAGE B AUDITED

## 1. Routes Status Matrix

| Route | Built | Styled Correctly | Works | Notes |
| :--- | :--- | :--- | :--- | :--- |
| `/` | Yes | Yes (Ink + Paper) | Yes | DONE — Live search, proof telemetry, plan checkout modal |
| `/compare` | Yes | Yes (Ink + Paper) | Yes | DONE — Catalog search, facets, watchlist drawer, compare modal |
| `/compare/[id]` | Yes | Yes (Ink + Paper) | Yes | DONE — ISR page, offers table, JSON-LD, price history, deal score |
| `/extract` | Yes | Yes (Ink + Paper) | Yes | DONE — Schema builder, resilience score, run engine, SSE logs |
| `/intelligence` | Yes | Yes (Ink + Paper) | Yes | DONE — Competitor gap matrix, repricing rules builder, CSV export |
| `/settings` | Yes | Yes (Ink + Paper) | Yes | DONE — Team RBAC, API keys, signed webhooks, usage metering |
| `/docs` | Yes | Yes (Ink + Paper) | Yes | DONE — OpenAPI 3.1 spec, copyable curl/TS/Python code tabs |
| `/status` | Yes | Yes (Ink + Paper) | Yes | DONE — Source health dashboard, p95 latency, circuit-breaker states |
| `/legal/terms` | Yes | Yes (Ink + Paper) | Yes | DONE — Terms of service draft with disclaimers |
| `/legal/privacy` | Yes | Yes (Ink + Paper) | Yes | DONE — DPDP & GDPR data minimization policy |
| `/legal/responsible-scraping`| Yes | Yes (Ink + Paper) | Yes | DONE — ScrappyBot policy, robots.txt pledge, opt-out contact |
| `/auth/login` | Yes | Yes (Ink + Paper) | Yes | DONE — Magic link OTP, local Mailpit integration |
| `/auth/signup` | Yes | Yes (Ink + Paper) | Yes | DONE — Account creation, DB trigger workspace provisioning |

## 2. Prompts (01–18) and Milestones (G1–G10)

| Item | Status | Evidence File Path | Data Provenance |
| :--- | :--- | :--- | :--- |
| **Prompt 01–03** | DONE | `packages/brand/src/index.ts` | Real SVG code & tokens |
| **Prompt 04–06** | DONE | `packages/db/src/schema/` | Real Postgres schema + synthetic seed |
| **Prompt 07–09** | DONE | `apps/web/src/app/compare/` | Real search/compare on seed catalog |
| **Prompt 10–12** | DONE | `apps/worker/src/pipeline.ts` | Real pg-boss + Realtime + Mailpit |
| **Prompt 13–15** | DONE | `packages/pricing/src/billing/` | Real Auth + Fake Razorpay adapter |
| **Prompt 16–18** | DONE | `docs/launch/audit.md` | Real launch audit report |
| **G1 (Persistence)** | DONE | `scripts/demo-g1.ts` | Real Postgres data across restart |
| **G2 (Auth & Multi-Tenancy)**| DONE | `scripts/demo-g2.ts` | Real Supabase Auth + DB trigger |
| **G3 (Schema & RLS)** | DONE | `supabase/tests/database/02_rls_coverage.test.sql` | Real pgTAP tests (28/28 passed) |
| **G4 (Queue & Realtime)** | DONE | `apps/worker/src/__tests__/worker-pipeline-e2e.test.ts` | Real pg-boss + Realtime alert dispatch |
| **G5 (Billing & Dunning)** | DONE | `scripts/demo-g5.ts` | Simulated Razorpay webhook lifecycle |
| **G6 (Core Features)** | DONE | `scripts/demo-g6.ts` | Real HMAC webhooks + extract runs |
| **G7 (Perf & A11y)** | DONE | `load/load-benchmark.ts` | Real k6/load runner (p95: 75ms) |
| **G8 (Matching Gold Set)**| PARTIAL | `packages/matching/src/__tests__/independent-gold-set.test.ts` | Synthetic / AI-authored pairs (not independent) |
| **G9 (Security)** | DONE | `apps/web/src/__tests__/security-g9.test.ts` | Real SSRF/IDOR/key hashing tests |
| **G10 (Resilience)** | DONE | `e2e/console-clean.spec.ts` | Real Playwright browser test (52/52 passed) |

## 3. Disclosed Limitations & Doubted Items

1. **G8 Gold Set**: Authored by the same model that tuned the matching weights. Genuinely UNVERIFIED against real human ground truth.
2. **Admin MFA**: Protected by `x-mfa-token` header check; real Supabase TOTP MFA (AAL2) is not yet enforced in code.
3. **Payments**: Relies on `FakeRazorpayAdapter` and mock checkout. Live RBI e-mandates and Razorpay webhooks require live credentials.
4. **Scraping Sources**: Adapters run against local recorded fixtures; live production feeds/APIs for Amazon & Flipkart remain unconfigured.
5. **Interactive Extract Stream**: Live visual browser session in `/extract` runs on sample DOM rather than remote sandboxed Playwright stream.

## 4. Completion Percentage by Area

- **UI**: 95% (Dual themes, 360px touch targets, zero console noise)
- **Backend / API**: 92% (Fastify REST, OpenAPI 3.1, clean port 4000)
- **Data Layer / DB**: 95% (PostgreSQL, 100% RLS coverage, migrations)
- **Scraping Engine**: 80% (Robust contracts & fixtures; live feeds pending)
- **Matching Engine**: 85% (Deterministic engine built; human benchmark pending)
- **Authentication**: 90% (Supabase magic links working; OAuth unconfigured)
- **Billing**: 80% (Subscription state machine complete; payment gateway mock)
- **Extract**: 85% (Schema builder & runs complete; live session simulated)
- **Intelligence**: 90% (Spread matrix & repricing rules active)
- **Tests**: 95% (Unit, integration, pgTAP, and 52 console-clean e2e pass)
- **Deploy Readiness**: 75% (Runs 100% locally; production cloud setup pending)

## 5. Top 10 Remaining Tasks by Launch Impact

| Rank | Task | Size | Impact |
| :--- | :--- | :--- | :--- |
| 1 | Author human-labeled matching gold set tool (CSV import/export) | M | High — Prove data moat integrity |
| 2 | Enforce real Supabase TOTP MFA (AAL2) in Admin operations console | S | High — Lock privileged surface |
| 3 | Run containerized Gitleaks over entire git history and wire into CI | S | High — Ensure zero secret leaks |
| 4 | Clean & squash pg_boss migrations and verify clean `supabase db reset` | M | High — Guarantee clean clone setup |
| 5 | Verify remote GitHub Actions CI workflow run on `main` (`gh run list`) | S | High — CI pipeline validation |
| 6 | Mobile Lighthouse optimization (Product page LCP < 1.8s) | M | Medium — Consumer SEO performance |
| 7 | Fetch and quote real robots.txt & terms in docs/sources/ (FACT only) | S | Medium — Responsible scraping posture |
| 8 | Run 2,000-request / 50-concurrency load benchmark with p95/p99 | M | Medium — Infrastructure headroom check |
| 9 | Audit packages via `pnpm audit` and apply patched dependency updates | S | Medium — Dependency supply chain |
| 10 | Connect live Razorpay test-mode API keys and Mailpit/SES toggle | L | Medium — Revenue engine readiness |
