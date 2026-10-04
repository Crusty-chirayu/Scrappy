# PROGRESS

> SCRAPPY Development Progress Log  
> Read at start of every session. Update after every task.  
> Status: `todo` | `in-progress` | `done` | `blocked`

---

## Current Status: **PHASE 5 (EXTRACT + INTELLIGENCE + PUBLIC API) COMPLETE — EXECUTING PHASE 6 (HARDENING)**

Phase 1 (Monorepo, Supabase CLI tooling, initial schema migration with RLS on every table, pgTAP tests, generated types, and all gates) is complete.
Phase 2 (500 synthetic product seed generator, design system tokens, core components, trust badges, contrast test script, and axe accessibility verification) is complete.
Phase 3 (Scraping engine: HTTP fetcher, robots.txt, host rate limiter, circuit breakers, Amazon India & Flipkart adapters with fixtures, Croma & Reliance stubs, worker handlers, chaos test, matching stub, docs/sources/) is complete.
Phase 4 (Compare search UI with autocomplete/facets/sort, product details with live offers & SVG step-line price history chart, deal score & fake discount analysis, tenant-isolated watchlist & alerts API, billing checkout endpoint, email templates, Schema.org JSON-LD, all quality gates passing) is complete.
Phase 5 (Extract Visual Builder & Studio UI with SSRF validation/diagnostics/exporters, Price Intelligence competitive spread matrix & rules builder, matching engine benchmark harness with 0% false positives and review queue, Public REST API & OpenAPI docs at /docs) is complete and verified green.

**NEXT ACTION**: Phase 6 — Hardening (20 named critical tests suite, SSRF attack fuzzer, chaos simulation tests, visual regression / dark mode check, DR restore drill script, coverage enforcement >= 90% across matching/pricing/billing, and zero open items in DEFECTS.md).

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
| 03     | Design System                          | todo   | Phase 2                                                    |
| 3     | Scraping Engine             | ✅ done     | Adapter contracts, HTTP fetcher, robots, rate limit, Amazon/Flipkart fixtures, Croma/Reliance stubs, chaos test |
| 4     | Compare + Alerts + Auth     | ✅ done     | Search UI/API, autocomplete, product page, price history, deal analysis, watchlist, alerts, billing checkout |
| 05     | Compare UI                             | ✅ done     | Phase 4                                                    |
| 06     | Alerts & Notifications                 | ✅ done     | Phase 4                                                    |
| 07     | Auth, Workspace, Billing               | ✅ done     | Phase 4                                                    |
| 5     | Extract + Intelligence     | ✅ done     | Visual builder, SSRF validator, selector engine, competitor matrix, matching benchmark, REST API |
| 08     | Extract Engine                         | ✅ done     | Phase 5                                                    |
| 09     | Extract UI                             | ✅ done     | Phase 5                                                    |
| 10     | Intelligence                           | ✅ done     | Phase 5                                                    |
| 11     | Matching & AI                          | ✅ done     | Phase 5                                                    |
| 12     | Public API & Developer Portal          | ✅ done     | Phase 5                                                    |
| 13     | Admin Console                          | todo   | Phase 7                                                    |
| 14     | Marketing Site & Legal Pages           | todo   | Phase 7                                                    |
| 6     | Hardening & Scale           | in-progress | Phase 6: 20 named critical tests, chaos resilience, security scans |
| 15     | Hardening                              | in-progress | Phase 6                                                    |
| 16     | Launch Audit                           | todo   | Phase 7                                                    |
| 17     | Observability                          | todo   | Phase 7                                                    |
| 18     | Retrospective                          | todo   | Phase 7                                                    |

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

| ID                                      | Found | Fixed | Summary | Severity | Regression Test |
| --------------------------------------- | ----- | ----- | ------- | -------- | --------------- |
| (none yet — implementation not started) |       |       |         |          |                 |

---

## Key Research Findings (quick reference)

- **pg-boss + Supabase**: Workers MUST connect via session mode (port 5432), NOT transaction pooler (port 6543)
- **Amazon PA-API**: Requires qualifying sales to maintain; new accounts blocked
- **Croma/Reliance Digital**: No official API; ToS prohibits scraping; shipping as `Unsupported`
- **DPDP Act 2023**: Applies; dual role (Fiduciary for users, Processor for Extract customers); legal review required before launch
- **GST invoicing**: Required for B2B billing; SAC code 998314 for SaaS
- **pgvector, pg_trgm, pg_cron, unaccent**: All available on Supabase Pro
