# 13 — Roadmap

> Milestones with exit criteria, task breakdown with estimates and dependencies, critical path

---

## Phases Overview

| Phase | Name                   | Key Deliverables                                                      | Exit Criteria                                                                              |
| ----- | ---------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| 1     | Foundation             | Monorepo, tooling, Supabase local stack, CI                           | `pnpm dev` works; `pnpm check` green                                                       |
| 2     | Data Layer             | DB schema, RLS, migrations, seed, design system                       | Migrations apply; tenancy tests green; design system documented                            |
| 3     | Scraping Engine        | Adapter contract, 2 feed adapters, health, circuit breaker            | Parser tests green; chaos test passes; benchmark harness ready                             |
| 4     | Compare + Alerts       | Search, product page, price history, watchlist, alerts, auth, billing | E2E flows pass on mobile+desktop; Lighthouse >= 90; axe clean                              |
| 5     | Extract + Intelligence | Full builder, runtime, Intelligence dashboard, public API             | E2E from URL to data in < 2 min; permissions tests green; all named critical tests passing |
| 6     | Hardening              | Full test suite, load tests, DR drill, security scan, legal review    | All quality gates green; DR drill complete; legal approved; zero known defects             |
| 7     | Launch                 | Marketing site, admin, observability, go-live                         | Launch audit complete; all release criteria met                                            |

---

## Phase 1 — Foundation (Estimate: 5-7 days)

### Tasks

| Task  | Description                                                                      | Dependencies | Est. |
| ----- | -------------------------------------------------------------------------------- | ------------ | ---- |
| P1.1  | Create pnpm + Turborepo monorepo with all app/package stubs                      | None         | 1d   |
| P1.2  | TypeScript strict config, path aliases, project references                       | P1.1         | 0.5d |
| P1.3  | ESLint (typescript-eslint strict, a11y, import-boundaries), Prettier, commitlint | P1.2         | 0.5d |
| P1.4  | Vitest + Playwright + Testing Library + axe wired                                | P1.2         | 0.5d |
| P1.5  | Supabase local stack integration (supabase start in dev flow)                    | P1.1         | 0.5d |
| P1.6  | docker-compose for Mailpit (email dev), infra/ structure                         | P1.1         | 0.5d |
| P1.7  | .env.example per app; zod env loader in @scrappy/core                            | P1.2         | 0.5d |
| P1.8  | GitHub Actions CI pipeline (lint, typecheck, unit, build, migration dry-run)     | P1.3-P1.4    | 1d   |
| P1.9  | `pnpm dev` boots everything; `pnpm check` runs all gates                         | P1.1-P1.8    | 0.5d |
| P1.10 | docs/architecture/overview.md, scale-triggers.md, adr/0001-monorepo.md           | P1.1         | 0.5d |

**Phase Gate**: `pnpm i && pnpm dev` works on fresh clone; `pnpm check` green; CI green on trivial PR.

---

## Phase 2 — Data Layer + Design System (Estimate: 7-10 days)

### Tasks

| Task  | Description                                                                     | Dependencies | Est. |
| ----- | ------------------------------------------------------------------------------- | ------------ | ---- |
| P2.1  | Full Supabase schema (all tables from 05-supabase-design.md)                    | P1           | 2d   |
| P2.2  | RLS policies on all tables                                                      | P2.1         | 1d   |
| P2.3  | pgTAP cross-tenant attack tests                                                 | P2.2         | 1d   |
| P2.4  | Drizzle ORM setup + scoped() tenancy helper                                     | P2.1         | 0.5d |
| P2.5  | Custom ESLint rule: flag unscoped tenant table queries                          | P2.4         | 0.5d |
| P2.6  | Seed script: 500 synthetic products, 6 categories, realistic offers             | P2.1         | 1d   |
| P2.7  | Design tokens (CSS vars, Tailwind v4 theme)                                     | P1           | 1d   |
| P2.8  | Core components (Button, Input, Table, Toast, skeleton, EmptyState, ErrorState) | P2.7         | 2d   |
| P2.9  | TrustBadge, SourceChip, PriceTag, DataFreshness, Sparkline                      | P2.7         | 1d   |
| P2.10 | Contrast CI script                                                              | P2.7         | 0.5d |
| P2.11 | axe tests for all components                                                    | P2.8-P2.9    | 0.5d |
| P2.12 | docs/data/erd.md, retention.md, provenance.md                                   | P2.1         | 0.5d |

**Phase Gate**: migrations apply on empty+seeded DB; tenancy tests green; design system documented; contrast script green; axe zero violations.

---

## Phase 3 — Scraping Engine (Estimate: 8-10 days)

### Tasks

| Task  | Description                                                           | Dependencies | Est. |
| ----- | --------------------------------------------------------------------- | ------------ | ---- |
| P3.1  | Adapter contract (TypeScript interface + types)                       | P2           | 0.5d |
| P3.2  | HTTP fetcher (undici, conditional requests, SSRF guard, rate limiter) | P3.1         | 1.5d |
| P3.3  | robots.txt enforcer                                                   | P3.2         | 0.5d |
| P3.4  | Circuit breaker (per source)                                          | P3.1         | 0.5d |
| P3.5  | Browser renderer (Playwright/Crawlee, pooled, resource-capped)        | P3.1         | 1.5d |
| P3.6  | Schema drift detector                                                 | P3.1         | 1d   |
| P3.7  | Amazon India adapter (PA-API feed mode, using recorded fixtures)      | P3.2-P3.3    | 1.5d |
| P3.8  | Flipkart adapter (Affiliate API feed mode, using recorded fixtures)   | P3.2-P3.3    | 1.5d |
| P3.9  | Croma adapter stub (Unsupported state)                                | P3.1         | 0.5d |
| P3.10 | Reliance Digital adapter stub (Unsupported state)                     | P3.1         | 0.5d |
| P3.11 | Fixture test suite for all adapters                                   | P3.7-P3.10   | 1d   |
| P3.12 | pg-boss worker setup (jobs: fetch_http, fetch_browser, parse_listing) | P2, P3.2     | 1d   |
| P3.13 | Chaos test: kill worker mid-run, verify DB consistency                | P3.12        | 0.5d |
| P3.14 | Matching engine stub (candidate retrieval + scoring framework)        | P2           | 1d   |
| P3.15 | docs/sources/ per source (legal notes, adapter decisions)             | P3.7-P3.10   | 0.5d |

**Phase Gate**: parser tests green on all fixtures; chaos test passes; circuit breaker verified; matching framework stub working.

---

## Phase 4 — Compare + Alerts + Auth + Billing (Estimate: 15-20 days)

### Tasks

| Task  | Description                                                                     | Dependencies  | Est. |
| ----- | ------------------------------------------------------------------------------- | ------------- | ---- |
| P4.1  | Supabase Auth integration (magic link + Google OAuth, SSR session)              | P2            | 1d   |
| P4.2  | Search API (Postgres FTS + trigram, autocomplete, query parser)                 | P3, API setup | 2d   |
| P4.3  | Product page API (data, live offers, price history)                             | P3, P2        | 1d   |
| P4.4  | Search UI (home, autocomplete dropdown, results page with facets)               | P2.7-P2.9     | 3d   |
| P4.5  | Product page UI (header, best price, offers table, price history chart, specs)  | P4.3, charts  | 3d   |
| P4.6  | Price history chart (step-line, visx, keyboard-scrubbable, table toggle)        | P2.7          | 1.5d |
| P4.7  | Watchlist UI + API                                                              | P4.1          | 1d   |
| P4.8  | Alert engine (rule evaluator, deduplication, notification jobs)                 | P3, P2        | 2d   |
| P4.9  | Notification center (bell, drawer, delivery state machine)                      | P4.8          | 1d   |
| P4.10 | Email templates (React Email, Mailpit testing)                                  | P4.8          | 1d   |
| P4.11 | Pricing engine (@scrappy/pricing: deal score, anomaly detection, fake-discount) | P2            | 2d   |
| P4.12 | Workspace + membership API                                                      | P4.1          | 1d   |
| P4.13 | Billing: Razorpay adapter + FakeBillingProvider + subscription lifecycle        | P4.12         | 2d   |
| P4.14 | Account/settings page (profile, notification prefs, data export, delete)        | P4.1          | 1d   |
| P4.15 | Deals feed page + category pages                                                | P4.3          | 1d   |
| P4.16 | SEO: JSON-LD, canonical, sitemap, ISR 15min, noindex rules                      | P4.5          | 1d   |
| P4.17 | All states: loading, empty, error, partial, stale, offline (all screens)        | All above     | 1d   |
| P4.18 | E2E tests: search -> product -> watchlist -> alert flow (mobile + desktop)      | All above     | 1.5d |
| P4.19 | Performance validation: Lighthouse >= 90 mobile, axe clean                      | All above     | 0.5d |

**Phase Gate**: E2E flows pass on mobile+desktop; Lighthouse >= 90 mobile; axe clean; all Compare states working.

---

## Phase 5 — Extract + Intelligence + Public API (Estimate: 20-25 days)

### Tasks

| Task  | Description                                                        | Dependencies | Est. |
| ----- | ------------------------------------------------------------------ | ------------ | ---- |
| P5.1  | Extract: schema, run state machine, jobs, datasets, exports        | P3, P2       | 3d   |
| P5.2  | Extract Builder UI (split view, field selection, test run)         | P5.1, P2.7   | 5d   |
| P5.3  | Browser stream (live Playwright stream to builder UI via SSE)      | P5.1, P3.5   | 2d   |
| P5.4  | Selector engine (CSS/XPath, resilience score, fallback chain)      | P5.1         | 2d   |
| P5.5  | Scheduling UI + delivery (webhooks, CSV/JSON/XLSX export)          | P5.1         | 2d   |
| P5.6  | Extract run logs (SSE stream, level filters, error diagnostics)    | P5.1         | 1d   |
| P5.7  | Usage metering for Extract                                         | P5.1         | 0.5d |
| P5.8  | Intelligence: tracked products, competitors, market view           | P3, P2       | 3d   |
| P5.9  | Intelligence: rules builder, alerts, weekly report job             | P5.8, P4.8   | 2d   |
| P5.10 | Intelligence: team roles + permissions matrix                      | P4.12        | 1d   |
| P5.11 | Matching engine full (all phases, benchmark harness, review queue) | P3.14        | 3d   |
| P5.12 | Public API + OpenAPI generation + SDK stubs                        | P5.1, P4     | 2d   |
| P5.13 | API dashboard (keys, request log, usage, webhook inspector)        | P5.12        | 1d   |
| P5.14 | Developer docs (quickstart, API reference, guides)                 | P5.12        | 1.5d |

**Phase Gate**: E2E: URL to data in < 2 min; matching benchmark passes; permissions tests green; OpenAPI contract tests pass.

---

## Phase 6 — Hardening (Estimate: 10-12 days)

### Tasks

| Task  | Description                                                     | Dependencies | Est. |
| ----- | --------------------------------------------------------------- | ------------ | ---- |
| P6.1  | Load tests (k6: search, API, extraction, alert fanout)          | P4, P5       | 1.5d |
| P6.2  | Security scan (OWASP ZAP baseline, SSRF suite, authz fuzzing)   | P4, P5       | 1d   |
| P6.3  | All 20 named critical tests                                     | P4, P5       | 2d   |
| P6.4  | Chaos tests (worker kill, queue stall, DB failover sim)         | P4, P5       | 1d   |
| P6.5  | Visual regression baselines + dark mode verification            | P2.7, P4, P5 | 1d   |
| P6.6  | DB restore drill (scripted, timed, documented)                  | P2           | 0.5d |
| P6.7  | All runbooks written and tested                                 | P4, P5       | 1d   |
| P6.8  | Performance budget validation (all budgets in CI)               | P4           | 0.5d |
| P6.9  | Coverage check: matching >= 90%, pricing >= 90%, billing >= 90% | P4, P5       | 0.5d |
| P6.10 | DEFECTS.md: zero open items                                     | Ongoing      | 1d   |

**Phase Gate**: All quality gates green; DR drill complete; 20 named critical tests passing; zero open defects.

---

## Phase 7 — Launch (Estimate: 5-7 days)

### Tasks

| Task | Description                                                       | Dependencies | Est.                         |
| ---- | ----------------------------------------------------------------- | ------------ | ---------------------------- |
| P7.1 | Marketing landing page (hero, scroll story, pricing, legal pages) | P2.7         | 3d                           |
| P7.2 | Admin console (users, sources, jobs, match review)                | P5           | 2d                           |
| P7.3 | Observability setup (Sentry, dashboards, alerting)                | P4, P5       | 1d                           |
| P7.4 | Public status page                                                | P7.3         | 0.5d                         |
| P7.5 | Logo + animated mark final SVGs                                   | P2           | 1d                           |
| P7.6 | Legal review (Privacy policy, ToS, DPA template)                  | All          | BLOCKED until lawyer reviews |
| P7.7 | Launch audit (Prompt 18)                                          | All          | 1d                           |
| P7.8 | GO_LIVE_CHECKLIST.md completion                                   | All          | 0.5d                         |

**Phase Gate**: All launch criteria from Prompt 18 met; legal approved; status page live.

---

## Critical Path

```
P1 (Foundation)
  -> P2 (Data Layer + Design System)
      -> P3 (Scraping Engine)
          -> P4 (Compare + Alerts) [CRITICAL PATH: first paying/using customer]
              -> P5 (Extract + Intelligence) [revenue growth]
                  -> P6 (Hardening)
                      -> P7 (Launch)
```

**Design system is on the critical path** through Phase 2; delay there ripples to all UI work in Phase 4+.

**Legal review is on the critical path to launch** (Phase 7.6 is BLOCKED without it).

---

## Total Estimate

| Phase             | Optimistic | Realistic | Pessimistic |
| ----------------- | ---------- | --------- | ----------- |
| 1 Foundation      | 5d         | 7d        | 10d         |
| 2 Data + Design   | 7d         | 10d       | 14d         |
| 3 Scraping        | 8d         | 10d       | 14d         |
| 4 Compare         | 15d        | 20d       | 28d         |
| 5 Extract + Intel | 20d        | 25d       | 35d         |
| 6 Hardening       | 10d        | 12d       | 16d         |
| 7 Launch          | 5d         | 7d        | 10d         |
| **Total**         | **70d**    | **91d**   | **127d**    |

**RECOMMENDATION**: Plan for 90-100 working days (18-20 weeks for a solo builder or small team). The hardening phase is always underestimated; this estimate has it at 12 days but real projects often stretch to 20+.
