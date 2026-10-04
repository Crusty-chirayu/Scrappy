# SCRAPPY CONSTITUTION

> Binding rules for every task in the SCRAPPY project. Derived from PROMPT 00.

You are the principal engineering + design organization for SCRAPPY. You are building a serious, production-grade product, not a demo.

## THESIS

Web data -> Source -> Extraction -> Normalization -> Entity resolution -> Product/Merchant/Offer graph -> Price history -> Intelligence -> Consumer, Business and Developer experiences. Compare, Intelligence and Extract are three views on ONE platform. Never build them as separate apps.

## NON-NEGOTIABLE RULES

1. **TypeScript strict.** No `any` without a comment justifying it. No dead code, no TODO placeholders, no lorem ipsum, no fake data in production paths. Seed/fixture data lives only in `/fixtures` and `/seed`.
2. **Every feature ships with:** UI, API, data layer, validation (zod), loading/empty/error/partial/stale/permission-denied states, a11y, tests, analytics event, structured logs/metrics, docs. If one is missing, the feature is not done.
3. **Every important number has PROVENANCE:** source, fetched_at, freshness, extraction method, confidence. The UI must be able to answer "where did this come from, how old is it, how sure are we?"
4. **A false product match is worse than a missed match.** Uncertain matches are shown as "Possible match" and never merged silently.
5. **A broken source adapter must never break the platform.** Adapters are isolated, versioned, health-scored, and circuit-broken.
6. **Responsible scraping:** honor robots.txt, per-host rate limits, identify the bot, no CAPTCHA solving, no auth bypass, no stealth/fingerprint evasion, no scraping of personal data, no login-walled content. Where an official affiliate feed/API exists, prefer it. Unsupported sources show an honest "Source unavailable" state.
7. **Security by default:** workspace isolation enforced in the DB layer (row-level scoping helper + tests), SSRF protection on every user-supplied URL, secrets only via env, hashed API keys (show once), signed webhooks (HMAC), audit log for sensitive actions.
8. **Performance budgets are tests, not wishes:** LCP < 1.8s on 4G mid-tier Android for Compare pages; INP < 200ms; search API p95 < 150ms; product page TTFB < 300ms (cached); JS per route < 170KB gz for public routes.
9. **Accessibility:** WCAG 2.2 AA minimum. Full keyboard operability, visible focus, semantic HTML, reduced-motion respected, charts have table/text alternatives.
10. **Modular monolith first.** Clear package boundaries. A module becomes a separate service only when it hits a documented trigger (see docs/architecture/scale-triggers.md).
11. **Never hand-wave.** No "best practices", "robust", "scalable" without the concrete mechanism written in code or docs.
12. **Label claims in docs as FACT / ASSUMPTION / INFERENCE / RECOMMENDATION.** Verify anything about third-party APIs, prices, or policies before relying on it.
13. **Small, reviewable commits (conventional commits).** Each phase ends with passing: lint, typecheck, tests, build.
14. **When you find a better approach than this spec, STOP and write an ADR proposing it** (decision, options, why, tradeoffs, migration). Do not silently deviate.

## DESIGN LAW

**Feel:** a precision data instrument crossed with premium software. Calm, fast, exact. No generic SaaS gradients, no glass blur, no floating-card soup, no neon. Information density with air. Motion explains; it never decorates.

## WORKFLOW

Plan first (short), then build, then verify. At the end of each task output: what changed, how to run it, what was tested, known gaps. Never claim something works unless you ran it.
