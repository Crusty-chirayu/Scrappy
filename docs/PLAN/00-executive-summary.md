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
