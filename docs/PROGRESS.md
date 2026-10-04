# PROGRESS

> SCRAPPY Development Progress Log  
> Read at start of every session. Update after every task.  
> Status: `todo` | `in-progress` | `done` | `blocked`

---

## Current Status: **STAGE A PLANNING COMPLETE (WITH PROMPT 01 REWORK PLAN) — AWAITING WRITTEN APPROVAL**

The 16-document development plan is complete, incorporating the Binding Addendum (Supabase + Autonomy + Plan-First) and a complete Prompt 01 Rework plan. No feature code proceeds until written approval is received.

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

## Stage B: Implementation Prompts

**NOT STARTED. Blocked on written approval of Stage A plan.**

| Prompt | Title                                  | Status | Notes                                                      |
| ------ | -------------------------------------- | ------ | ---------------------------------------------------------- |
| 01     | Foundation: Monorepo & Supabase Rework | todo   | Phase 1: Supabase CLI migration, RLS policies, clean gates |
| 02     | Brand & Design System Tokens           | todo   | Phase 2 (@scrappy/ui & @scrappy/brand)                     |
| 03     | Design System                          | todo   | Phase 2                                                    |
| 04     | Scraping Engine (Compare)              | todo   | Phase 3                                                    |
| 05     | Compare UI                             | todo   | Phase 4                                                    |
| 06     | Alerts & Notifications                 | todo   | Phase 4                                                    |
| 07     | Auth, Workspace, Billing               | todo   | Phase 4                                                    |
| 08     | Extract Engine                         | todo   | Phase 5                                                    |
| 09     | Extract UI                             | todo   | Phase 5                                                    |
| 10     | Intelligence                           | todo   | Phase 5                                                    |
| 11     | Matching & AI                          | todo   | Phase 5                                                    |
| 12     | Public API & Developer Portal          | todo   | Phase 5                                                    |
| 13     | Admin Console                          | todo   | Phase 7                                                    |
| 14     | Marketing Site & Legal Pages           | todo   | Phase 7                                                    |
| 15     | Hardening                              | todo   | Phase 6                                                    |
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
