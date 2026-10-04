# ADDENDUM — SUPABASE + AUTONOMY + PLAN-FIRST PROTOCOL

> Overrides conflicting parts of `/docs/SCRAPPY_ANTIGRAVITY_PROMPTS.md`. Everything else there still applies.

## STAGE A: PLANNING ONLY. DO NOT WRITE APPLICATION CODE YET.

Read `/docs/SCRAPPY_PROMPTS.md` fully. Then produce the complete development plan as a report in `/docs/PLAN/`, and STOP. Wait for my written approval before Stage B.

Report files (each concrete, no hand-waving, claims labeled FACT / ASSUMPTION / INFERENCE / RECOMMENDATION):

- `00-executive-summary.md`: Thesis, scope per product, what ships first, what waits, honest limits.
- `01-ux-research.md`: Personas, journeys, friction audit, information architecture, navigation (desktop/tablet/mobile), command palette and shortcuts.
- `02-ui-design-spec.md`: Every screen: purpose, hierarchy, components, all states (loading/empty/error/partial/stale/denied/offline), interactions, motion, responsive behavior, accessibility. Include ASCII wireframes for the 15 most important screens.
- `03-design-system.md`: Tokens, type, color (with contrast table), motion tokens, component inventory, chart language, logo system and animation states.
- `04-architecture.md`: Modular monolith, package boundaries, request/data flow diagrams (mermaid), event model, queue model, scale triggers.
- `05-supabase-design.md`: See "Supabase rules" below. Full schema, RLS policies, auth flow, storage buckets, realtime channels, edge functions vs workers, connection strategy, migrations, backups.
- `06-backend-api.md`: REST/OpenAPI design, auth, rate limits, idempotency, errors, webhooks, versioning.
- `07-scraping-matching.md`: Adapter contract, source strategy per retailer with legal/robots research, health, matching algorithm and benchmark plan.
- `08-ai-plan.md`: Each AI feature: input/output, fallback, cost, latency, eval.
- `09-security-privacy.md`: Threat model (STRIDE), tenancy isolation, abuse, DPDP, responsible scraping.
- `10-quality-plan.md`: Test strategy, perf budgets, a11y plan, named critical tests, "zero known defects" release gate.
- `11-devops-deploy.md`: Environments, CI/CD, hosting, observability, DR, runbooks.
- `12-cost-and-billing.md`: Unit economics, quotas, pricing logic, metering.
- `13-roadmap.md`: Milestones with exit criteria, task breakdown with estimates and dependencies, critical path.
- `14-risks.md`: Risk register + red-team findings and how the plan fixes them.
- `15-env-and-credentials.md`: Exact list of every env var and account I must provide, where it is used, and how to obtain it. Group by "needed at the very end".
- `16-open-decisions.md`: Every decision you need from me, each with your recommendation.

Before finalizing, red-team your own plan: attack it for flaws, fix them, and list what you changed. Challenge anything in the spec you think is wrong via an ADR. End with a one-page "Approve this plan?" summary.

---

## STAGE B: AUTONOMOUS BUILD (only after I write "APPROVED")

### SUPABASE RULES

- **Supabase is the platform** for Postgres, Auth, Storage, Realtime and scheduled DB jobs. Replace in the spec:
  - Neon -> Supabase Postgres
  - Better Auth -> Supabase Auth
  - R2 -> Supabase Storage
  - in-app notification push -> Supabase Realtime
- **Tenancy is enforced with Row Level Security on EVERY table.** RLS is enabled by default, deny-by-default, policies tested with pgTAP or equivalent (including cross-tenant attack tests). Service-role key is used only in server and worker code, never shipped to the browser.
- **Use the Supabase CLI for everything:** local stack (`supabase start`), versioned SQL migrations in `/supabase/migrations`, seed in `/supabase/seed.sql`, generated TypeScript types in CI. Keep Drizzle only if the plan shows a clear benefit; otherwise use generated types.
- **Heavy work (Playwright, scraping, matching, reports) runs in separate worker processes**, NOT in Edge Functions. Queue is Postgres-based on the direct connection (not the transaction pooler) unless the plan documents a better choice. Verify current Supabase limits, pooler modes and extension support (`pg_trgm`, `pgvector`, `pg_cron`) from official docs before designing around them.
- **Never put secrets in git.** Provide `.env.example` per app for every variable.

### AUTONOMY RULES

- **Build everything against the LOCAL Supabase stack plus local emulators** (Mailpit for email, MinIO or local Storage, a deterministic fake AI provider, recorded fixtures for scraping, Razorpay test-mode adapter behind an interface). The app must run fully locally with zero real credentials.
- **Every external service sits behind an adapter interface** with an `INTEGRATION_MODE=local|live` switch. At the end, I only supply the real credentials in `.env` and flip the mode; no code changes should be needed.
- **Do not stop to ask for credentials.** When something truly cannot be done without them (live deploy, live retailer verification, real payments/email/AI), build and test it against the local/fake version, record it in `/docs/GO_LIVE_CHECKLIST.md` with exact steps, and continue.
- **Follow the plan's roadmap in order**, with the Phase Gates. Update `/docs/PROGRESS.md` after every task. Commit small, conventional commits. Keep a `/docs/DEFECTS.md` log: every bug found is logged, fixed, and covered by a regression test.
- **"No flaw" standard:** the release gate is ZERO known open defects, all quality gates green (lint, typecheck, unit, integration, RLS tests, e2e, axe, visual regression, perf budgets, security scans, matching benchmark). Never claim perfection; report residual risks honestly.
- **Decisions not covered by the plan:** choose the safest, simplest option, write a short ADR, continue. Only stop for legal or business decisions flagged in `16-open-decisions.md`.

---

## STAGE C: HAND-OFF

When all roadmap phases are done: run the full launch audit (Prompt 18), then deliver `/docs/GO_LIVE_CHECKLIST.md`:

1. Credentials to add to `.env`
2. How to create the Supabase project and push migrations
3. Deploy steps per app
4. Post-deploy smoke tests
5. Rollback steps.
