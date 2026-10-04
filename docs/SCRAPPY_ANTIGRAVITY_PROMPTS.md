# SCRAPPY — Antigravity Build Prompt Pack

**How to use:** Paste **Prompt 00 (Constitution)** first and save it as the workspace rules file (`GEMINI.md` / project rules). Then run prompts **01 → 18 in order**, one per Antigravity task. Do not skip ahead. After each phase, run the **Phase Gate** at the bottom of that prompt before moving on.

**Locked decisions (so Antigravity never guesses):**

| Area     | Decision                                                                                          | Why                                        |
| -------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| Repo     | pnpm + Turborepo monorepo                                                                         | Shared types, one CI, easy split later     |
| Language | TypeScript everywhere (strict)                                                                    | One language across web, API, workers      |
| Web      | Next.js (App Router) + React + Tailwind v4                                                        | SSR/SEO for Compare, rich app for the rest |
| Motion   | `motion` (Framer Motion) + CSS + SVG/SMIL-free custom                                             | Controlled, reduced-motion aware           |
| DB       | PostgreSQL + Drizzle ORM + `pg_trgm` + `unaccent` + `pg_partman`-style monthly partitions         | One DB until proven otherwise              |
| Queue    | `pg-boss` (Postgres) at MVP → BullMQ/Redis when depth > triggers                                  | No extra infra day one                     |
| Scraping | Crawlee + Playwright, HTTP-first, browser only when required                                      | Browser minutes are the main cost          |
| Search   | Postgres FTS + trigram first → Meilisearch when p95 > 150 ms                                      | Don't buy complexity early                 |
| Vectors  | pgvector only for matching candidate retrieval, not for primary search                            | Not fashion-driven                         |
| Auth     | Better Auth (email, Google), sessions in DB                                                       | Own your users                             |
| API      | REST + OpenAPI 3.1, cursor pagination, idempotency keys                                           | Boring, predictable, SDK-friendly          |
| Charts   | visx + custom SVG                                                                                 | Full control over the visual language      |
| AI       | Gemini via a provider-agnostic `ai` package, every feature has deterministic fallback             | Cost + reliability                         |
| Hosting  | Vercel (web) + Fly.io/Railway (api, workers, browser workers) + Neon/Supabase (PG) + R2 (objects) | Cheap start, clear scale path              |

**Thesis (the one sentence everything serves):**

> Scrappy turns the messy web into a _trusted, historical graph of products, merchants and offers_ — and exposes it to shoppers (Compare), businesses (Intelligence) and developers (Extract).

---

## PROMPT 00 — CONSTITUTION (save as workspace rules)

```
You are the principal engineering + design organization for SCRAPPY. You are building a serious, production-grade product, not a demo.

THESIS
Web data -> Source -> Extraction -> Normalization -> Entity resolution -> Product/Merchant/Offer graph -> Price history -> Intelligence -> Consumer, Business and Developer experiences. Compare, Intelligence and Extract are three views on ONE platform. Never build them as separate apps.

NON-NEGOTIABLE RULES
1. TypeScript strict. No `any` without a comment justifying it. No dead code, no TODO placeholders, no lorem ipsum, no fake data in production paths. Seed/fixture data lives only in `/fixtures` and `/seed`.
2. Every feature ships with: UI, API, data layer, validation (zod), loading/empty/error/partial/stale/permission-denied states, a11y, tests, analytics event, structured logs/metrics, docs. If one is missing, the feature is not done.
3. Every important number has PROVENANCE: source, fetched_at, freshness, extraction method, confidence. The UI must be able to answer "where did this come from, how old is it, how sure are we?"
4. A false product match is worse than a missed match. Uncertain matches are shown as "Possible match" and never merged silently.
5. A broken source adapter must never break the platform. Adapters are isolated, versioned, health-scored, and circuit-broken.
6. Responsible scraping: honor robots.txt, per-host rate limits, identify the bot, no CAPTCHA solving, no auth bypass, no stealth/fingerprint evasion, no scraping of personal data, no login-walled content. Where an official affiliate feed/API exists, prefer it. Unsupported sources show an honest "Source unavailable" state.
7. Security by default: workspace isolation enforced in the DB layer (row-level scoping helper + tests), SSRF protection on every user-supplied URL, secrets only via env, hashed API keys (show once), signed webhooks (HMAC), audit log for sensitive actions.
8. Performance budgets are tests, not wishes: LCP < 1.8s on 4G mid-tier Android for Compare pages; INP < 200ms; search API p95 < 150ms; product page TTFB < 300ms (cached); JS per route < 170KB gz for public routes.
9. Accessibility: WCAG 2.2 AA minimum. Full keyboard operability, visible focus, semantic HTML, reduced-motion respected, charts have table/text alternatives.
10. Modular monolith first. Clear package boundaries. A module becomes a separate service only when it hits a documented trigger (see docs/architecture/scale-triggers.md).
11. Never hand-wave. No "best practices", "robust", "scalable" without the concrete mechanism written in code or docs.
12. Label claims in docs as FACT / ASSUMPTION / INFERENCE / RECOMMENDATION. Verify anything about third-party APIs, prices, or policies before relying on it.
13. Small, reviewable commits (conventional commits). Each phase ends with passing: lint, typecheck, tests, build.
14. When you find a better approach than this spec, STOP and write an ADR proposing it (decision, options, why, tradeoffs, migration). Do not silently deviate.

DESIGN LAW (details in Prompt 02)
Feel: a precision data instrument crossed with premium software. Calm, fast, exact. No generic SaaS gradients, no glass blur, no floating-card soup, no neon. Information density with air. Motion explains; it never decorates.

WORKFLOW
Plan first (short), then build, then verify. At the end of each task output: what changed, how to run it, what was tested, known gaps. Never claim something works unless you ran it.
```

---

## PROMPT 01 — FOUNDATION: MONOREPO, TOOLING, CI

```
Create the SCRAPPY monorepo foundation. Do not build features yet.

STRUCTURE
/apps
  /web            Next.js app (marketing + Compare + Intelligence + Extract UI + docs shell)
  /api            Fastify (TypeScript) REST API, OpenAPI 3.1 generated from zod schemas
  /worker         pg-boss worker process (jobs: fetch, parse, match, alert, notify, report, export, ai)
  /browser-worker Playwright/Crawlee runner, isolated, resource-limited
  /admin          Internal operations console (separate deploy, SSO/allowlist only)
/packages
  /ui             Design system (tokens, components, motion, charts)
  /brand          Logo SVGs, animated mark, favicons, OG templates
  /db             Drizzle schema, migrations, query helpers, tenancy helpers
  /core           Domain types, zod schemas, events, errors, units/currency normalization
  /scraping       Adapter contract, fetchers, renderers, validators, health
  /adapters       One folder per source (amazon-in, flipkart, croma, reliance-digital) — stubs now
  /matching       Entity resolution engine + evaluation harness
  /pricing        Price stats, deal score, anomaly detection
  /ai             Provider-agnostic AI layer, prompts, evals, caching
  /config         eslint, tsconfig, prettier, tailwind presets
/docs             Architecture, ADRs, runbooks, API, security, brand
/fixtures         Recorded HTML/JSON fixtures per source (committed, small)
/infra            Docker compose (postgres, redis optional, mailpit, minio), deploy configs

REQUIREMENTS
- pnpm workspaces + Turborepo with remote-cache-ready config.
- TS strict, path aliases, project references, `@scrappy/*` package names.
- ESLint (typescript-eslint strict + a11y + import boundaries rule: apps may depend on packages, packages may not depend on apps; /adapters may only depend on /scraping and /core).
- Prettier, commitlint (conventional), husky + lint-staged.
- Vitest (unit), Playwright (e2e), Testing Library (component), axe (a11y) wired.
- `.env.example` per app with every variable documented; zod-validated env loader in /core that fails fast.
- GitHub Actions: lint -> typecheck -> unit -> integration (service containers) -> build -> e2e (preview) -> security (npm audit, gitleaks, CodeQL) -> migration dry-run. Required checks documented.
- docker-compose for local Postgres (with pg_trgm, unaccent, pgvector), Mailpit, MinIO.
- One command: `pnpm dev` boots everything. One command: `pnpm check` runs all gates.
- docs/architecture/overview.md with the thesis diagram (mermaid), docs/architecture/scale-triggers.md (when to split a module), docs/adr/0001-monorepo.md.

PHASE GATE: fresh clone -> `pnpm i && pnpm dev` works; `pnpm check` is green; CI green on a trivial PR.
```

---

## PROMPT 02 — BRAND + DESIGN SYSTEM + TOKENS

```
Build @scrappy/ui and @scrappy/brand: the complete design language. This is the most important visual prompt — make it distinctive.

CONCEPT: "DATA INSTRUMENT"
Scrappy looks like a precision instrument that reads the web: crisp hairlines, tabular numerals, calibrated scales, a single "signal" color that appears only when something is live, fresh, or actionable. Premium, quiet, exact.

COLOR (define as CSS variables + Tailwind tokens, light and dark, all pairs AA-checked by a script that FAILS CI on contrast regression)
- Ink scale (dark surfaces): ink-950 #0A0C0F, ink-900 #0F1217, ink-850 #141922, ink-800 #1A202B, ink-700 #262E3C, ink-500 #5B677C, ink-300 #98A2B3, ink-100 #D6DBE3
- Paper scale (light surfaces): paper-50 #FAF9F6, paper-100 #F3F1EC, paper-200 #E8E5DD, paper-300 #D3CFC3
- Signal (brand accent, "live"): signal-400 #C6F135 (dark mode primary), signal-600 #5E7A00 (light mode primary text/accent on paper), signal-ink #0A0C0F for text on signal
- Semantic: price-down #2FBF8A (good), price-up #F2685B (bad), warn #F5B544, info #5AA9FF, stale #8B93A3, uncertain (dashed violet) #9A7BFF
- Rule: Signal color occupies < 5% of any screen. Price direction colors are ALWAYS paired with an arrow/sign (never color alone).

TYPE
- UI/body: Geist Sans. Numerals + code + data: Geist Mono (tabular-nums everywhere prices appear). Display (marketing only, sparingly): "Instrument Serif" italic accent word in headlines.
- Scale (1.2 ratio, fluid via clamp): 12/13/14/16/18/22/28/36/48/64. Body 15/16 on 1.5 line-height. Data tables 13 on 1.35.
- Prices: mono, tabular, currency symbol dimmed 60%, paise de-emphasised.

SPACE / SHAPE
- 4px base grid. Spacing tokens 0,1,2,3,4,6,8,10,12,16,24.
- Radius: 2 (inputs, chips), 4 (cards, buttons), 8 (dialogs). NO giant rounded corners.
- Borders: 1px hairlines (ink-700 / paper-300) are the primary separator; shadows only for overlays (dialogs, menus, command palette).
- Surfaces: flat; "graph paper" 8px dot-grid texture at 4% opacity allowed on hero/empty states only.
- Layout: 12-col grid, max content 1280, app shell max fluid. Breakpoints 480/768/1024/1280/1536.

COMPONENTS (each with all states, keyboard behavior, ARIA, Storybook-style docs page in /apps/web/(design)/ and visual regression tests)
Button (primary/secondary/ghost/danger/icon, loading), Input, Textarea, Select, Combobox, Checkbox, Radio, Switch, Slider (price range), Tabs, Segmented control, Table (sticky header, column resize, virtualization, row selection, density toggle), Tooltip, Popover, Dropdown, Dialog, Drawer, Toast (with undo), Badge, Chip, Progress, Skeleton (shape-matched), EmptyState, ErrorState, TrustBadge (Fresh/Stale/Verified/Estimated/Matched/Possible match/Source unavailable with confidence popover), SourceChip (logo + health dot), PriceTag (with delta + direction), Sparkline, Breadcrumbs, CommandPalette (cmdk), Sidebar, TopBar, WorkspaceSwitcher, Kbd, CodeBlock (copy), DataFreshness ("Updated 12 min ago" live-ticking), Stat, Timeline, DiffView.

CHARTS (visx; one coherent language)
- Hairline axes, no gridline clutter, mono tick labels, end-of-line direct labels instead of legends.
- Price history: step-line (prices are discrete events, not smooth curves), min/max/median bands, event markers (sale, stock-out), hover crosshair with exact value + source + timestamp. Keyboard-scrubbable. "View as table" toggle always present.
- Market view: dot-strip/beeswarm of competitor prices with your price marked. Availability: segmented timeline bar. Usage: thin bars with budget line.
- Animate-in only on first paint, 400ms, reduced-motion = none.

MOTION SYSTEM (tokens in code: duration, easing, spring)
- Durations: instant 80ms, fast 140ms, base 220ms, slow 360ms, chart 480ms. Easings: standard cubic-bezier(.2,0,0,1), exit (.4,0,1,1), emphasized (.16,1,.3,1). Spring for drawers/palette: stiffness 420, damping 36.
- Principles: motion communicates causality (what changed), continuity (shared-element transitions: result card -> product page image/price), status (live pulse on signal dot 2.4s), never > 400ms for UI feedback.
- Price change: number rolls per digit (mono), tinted flash of direction color 600ms, then settles.
- List updates: FLIP reorder 220ms. Filters: results cross-fade, never full skeleton flash if < 300ms.
- Reduced motion (prefers-reduced-motion + in-app toggle): replace transforms with opacity 80ms; disable rolls/pulses/parallax. Motion is also skipped when tab hidden, battery saver, or > 60 simultaneous animating elements.

LOGO SYSTEM (@scrappy/brand) — see Prompt 03 for full spec; here create the folder, tokens and a placeholder mark that Prompt 03 will replace.

DELIVERABLES
Tokens (CSS vars + TS), Tailwind v4 theme, light+dark, component library, docs site section, contrast script, visual regression baselines, axe tests on every component story.

PHASE GATE: every component documented with all states; contrast script green; axe zero violations; Lighthouse a11y 100 on the design page.
```

---

## PROMPT 03 — LOGO, WORDMARK, ANIMATED MARK

```
Design the Scrappy logo system as hand-authored SVG (no raster, no AI-image generation). Produce original, production-ready assets.

SYMBOL CONCEPT: "THE CONVERGENCE"
Three thin traces enter from the left at different heights (the messy web: many sources), bend, and converge into a single bold node that forms the counter of a stylised lowercase "s" — many sources resolve to one trusted point. The node is the ONLY element in Signal color. Geometry on a 32-unit grid, 2-unit stroke at 32px scaling to optical-corrected strokes at 16px.

WORDMARK
"scrappy" lowercase, custom-tuned Geist-derived letterforms: tighter tracking (-2%), a clipped terminal on the "s" and "y" echoing the trace ends, the dot-free "i"-less word so the node motif is the signature. Provide outlined paths (no font dependency).

ASSET SET (all in /packages/brand, exported to /apps/web/public)
- primary-horizontal (symbol + wordmark), stacked, symbol-only, wordmark-only
- light, dark, monochrome-ink, monochrome-paper, signal-on-ink
- small-size (16px optical variant: 2 traces instead of 3, thicker stroke)
- favicon.svg (with prefers-color-scheme), favicon.ico, apple-touch-icon 180, android 192/512 maskable, safari-pinned-tab mono
- social avatar 400x400, OG image template (1200x630) generated per page via `@vercel/og` using tokens
- clear-space and minimum-size rules documented in /docs/brand/logo.md

ANIMATED MARK (React component <ScrappyMark state="..."> using SVG + motion; < 4KB gz; GPU-friendly transforms/stroke-dashoffset only)
- idle: node breathes (scale 1 -> 1.06 -> 1, 3.2s, ease-in-out); traces static.
- hover: traces send a single pulse toward the node (stroke-dashoffset sweep 360ms), node brightens.
- loading: continuous "scan" — a pulse travels each trace in staggered loop (120ms offset), node holds steady glow.
- success: traces snap converge (220ms), node expands to a ring and settles with a tiny tick-draw (no confetti).
- startup (first app load, max 900ms, skippable, once per session): traces draw in staggered from left (80ms apart), converge, node ignites, wordmark fades up 8px.
- page transition: mark shrinks into the top-left slot while content cross-fades (shared element, 260ms).
- error: node dims to ink-500, one trace breaks (gap) with a 1-cycle shake 140ms; accompanied by text, never alone.
- reduced motion: static frames with opacity-only state changes.

Also output a /brand showcase page (internal) with every variant on light/dark/mono backgrounds, minimum-size tests, and a motion state playground.

PHASE GATE: all assets render crisp at 16/32/64/512; contrast verified; animated mark meets size + 60fps budget; reduced-motion verified.
```

---

## PROMPT 04 — DATA ARCHITECTURE (SCHEMA, TENANCY, PROVENANCE)

```
Implement @scrappy/db with Drizzle. Design deliberately; do not create tables "because they sound useful". For every table write a one-line purpose in the schema file.

IDENTITY & TENANCY
users, accounts(auth), sessions, organizations, workspaces(type: personal|business|developer), memberships(role: owner|admin|member|viewer), invitations, api_keys(hash, prefix, scopes, last_used_at, workspace_id), audit_log(append-only).
Rule: every workspace-owned row has workspace_id; a `scoped(db, workspaceId)` helper is the ONLY way app code queries those tables. Add a test that fails if any query on a tenant table lacks the scope.

CATALOG GRAPH (global, not tenant-owned)
brands, categories(tree, materialized path), products (canonical), product_variants (color/storage/size/pack_qty as typed attributes), product_identifiers (gtin/ean/upc/mpn with type + source + confidence; unique per (type,value) only when verified), merchants (retailers + marketplace sellers), sources (a site+adapter+region), listings (a merchant's page for a product/variant; url canonical + hash), offers (listing + seller + condition + shipping + pack info), images (hashed, stored in R2, attribution), specs (normalized key/value/unit with typed value).

TIME-SERIES (immutable, append-only, partitioned monthly by observed_at)
price_observations(offer_id, observed_at, price_minor, currency, mrp_minor, availability, run_id, extraction_confidence, raw_ref)
availability_events, offer_events (price.changed etc.),
Derived: price_daily_rollups (min/max/median/open/close per offer per day) built by a job; retention: raw observations 13 months hot, rollups forever.

MATCHING
match_candidates(listing_id, product_id, score, status: auto_accepted|needs_review|rejected|human_accepted), match_evidence(candidate_id, feature, value_a, value_b, weight, verdict), match_reviews(reviewer, decision, reason). Conflicts are stored, not discarded.

EXTRACTION & JOBS
extraction_projects, extraction_schemas(versioned, jsonb field defs), extraction_jobs, schedules, runs(state machine), tasks, run_logs(partitioned), datasets, dataset_records(jsonb + schema_version + provenance), exports, webhooks(+ deliveries with signature, attempts), templates.

INTELLIGENCE
tracked_products(workspace), tracked_competitors, price_rules, alerts, alert_triggers, reports, report_runs.

CONSUMER
watchlists, watch_items(target_price, variant, notify_channels), saved_searches, recent_views.

BILLING & USAGE
plans, subscriptions, usage_events(append-only: metric, quantity, workspace_id, occurred_at, idempotency_key), usage_rollups, invoices (mirror of payment provider), entitlements.

SOURCE OPS
adapter_versions, source_health_snapshots, fetch_logs (sampled), schema_drift_reports.

NOTIFICATIONS
notifications, notification_deliveries(channel, status, attempts), notification_prefs.

STANDARDS
- uuid v7 primary keys; created_at/updated_at; soft-delete only where product requires; money as integer minor units + ISO currency; all timestamps timestamptz UTC.
- Every FK indexed; every list endpoint has a supporting composite index; document each index's query in a comment.
- Migrations via drizzle-kit, forward-only, expand/contract pattern, each migration reversible by a documented down script; large backfills run as jobs.
- Seed script: realistic catalog (500 products across the 6 launch categories with REAL-looking but clearly synthetic offers flagged `is_synthetic=true`) for local dev only.
- docs/data/erd.md (mermaid), docs/data/retention.md, docs/data/provenance.md ("Where did this number come from?" -> the exact query path).

PHASE GATE: migrations apply on empty DB and on seeded DB; tenancy test suite green; EXPLAIN plans checked for the 10 hottest queries.
```

---

## PROMPT 05 — SCRAPING ENGINE + SOURCE ADAPTER CONTRACT

```
Implement @scrappy/scraping and the adapter framework. Reliability and responsibility are the whole point.

ADAPTER CONTRACT (TypeScript interface, versioned, one adapter per source)
discover(ctx): AsyncIterable<DiscoveryTarget>      // category/search/sitemap URLs
fetch(target, ctx): FetchResult                    // chooses http vs browser per capability flags
parse(result): RawListing[]                        // pure function, fixture-testable
normalize(raw): NormalizedListing                  // currency, units, pack size, availability enum
validate(norm): ValidationReport                   // zod + business rules (price > 0, MRP >= price, title length, etc.)
persist(norm, ctx): PersistOutcome
health(): AdapterHealth
classify(error): ErrorClass  // NETWORK | TIMEOUT | BLOCKED | NOT_FOUND | PARSE_CHANGED | VALIDATION | RATE_LIMITED | UNKNOWN
Capabilities flag: { requiresBrowser, supportsSearch, supportsVariants, officialFeedAvailable, robotsAllowed }.

PIPELINE: Source -> Scheduler -> Fetcher -> (Renderer) -> Parser -> Normalizer -> Validator -> Matcher -> Persistence -> Events

FETCH LAYER
- HTTP-first (undici) with conditional requests (ETag/If-Modified-Since), gzip/br, connection reuse.
- Browser (Playwright via Crawlee) ONLY when adapter.capabilities.requiresBrowser or HTTP parse fails; pooled contexts, per-run hard limits (60s, 40 requests, 300MB), block images/fonts/media/trackers, always close contexts, crash-safe.
- Per-host token-bucket rate limiter + concurrency caps (default 1 req/2s/host, adjustable only downward automatically), exponential backoff with jitter, honors Retry-After, honors robots.txt (fetched, cached 24h, enforced; disallowed => source marked `restricted`, NOT bypassed).
- Honest User-Agent: `ScrappyBot/1.0 (+https://scrappy.example/bot)` with a public bot page explaining behavior and an opt-out contact.
- SSRF guard for any user-supplied URL (resolve DNS, block private/link-local/metadata ranges, re-check after redirects, scheme allowlist, size/time caps).
- NO captcha solving, NO fingerprint spoofing, NO credential stuffing, NO login-wall scraping. If blocked: classify BLOCKED, back off, mark degraded, surface honestly.

RELIABILITY
- Idempotent tasks keyed by (source, target, window). Retries: 3 with backoff for NETWORK/TIMEOUT/RATE_LIMITED; zero retries for PARSE_CHANGED/VALIDATION (alert instead).
- Circuit breaker per source: opens on >40% failures in 20 runs; half-open probes every 10 min. Open => scheduler skips, UI shows "Source degraded", last known data shown as Stale with age.
- Schema-drift detector: field fill-rate vs trailing baseline; drop > 25% => PARSE_CHANGED, create drift report with sample HTML diff, page the operator.
- Fixture-driven tests: every adapter has recorded fixtures (/fixtures/<source>/<case>.html) for: normal, out-of-stock, variant-heavy, sale price, missing price, layout-changed, blocked page. Parser tests run offline in CI.
- A nightly "live canary" workflow runs 1 page per source and posts health, never blocks CI.

SOURCE HEALTH
Metrics per source: success rate, p50/p95 latency, parse failure %, field fill rate, freshness (median age of latest observation), HTTP failure mix. States: Healthy | Degraded | Offline | Stale | ParserChanged | Restricted | Unsupported. Internal view = full; public status = state only, no tactics.

INITIAL ADAPTERS
Amazon India, Flipkart, Croma, Reliance Digital. Before coding each: research current official programs (affiliate/product APIs/feeds), robots.txt and ToS, document findings + legal-risk note in docs/sources/<source>.md labeled FACT/ASSUMPTION. Prefer official feeds where available. Ship each adapter behind a feature flag defaulting to the SAFEST mode (e.g., user-initiated, low-frequency, or feed-based). If a source can't be supported responsibly, ship it as `Unsupported` with an honest UI state rather than a hack.

PHASE GATE: parser tests green on all fixtures; chaos test (kill worker mid-run, 500s, timeouts, malformed HTML) leaves DB consistent; circuit breaker verified; docs/sources complete.
```

---

## PROMPT 06 — PRODUCT GRAPH + MATCHING ENGINE

```
Implement @scrappy/matching. This is the data moat; precision beats recall.

ENTITIES: Canonical Product -> Variant -> Retailer Listing -> Offer (+ Seller). Brand, Category, Merchant are first-class.

STAGES
1. Normalize: brand aliasing, title tokenization (units, model numbers, colors, storage/RAM, pack qty, size), spec extraction to typed attributes.
2. Candidate retrieval (cheap): exact identifier hit (GTIN/EAN/MPN) -> blocking keys (brand + model token) -> trigram title similarity -> pgvector nearest neighbors on title+spec embedding (top 20).
3. Pairwise scoring: weighted features, each producing evidence rows:
   - identifier match (strong +), MPN/model equality (strong +), brand equality, normalized spec equality (RAM, storage, capacity, size), color, pack quantity, price plausibility (outlier ratio vs cohort), image perceptual-hash similarity, title similarity.
   - HARD CONFLICTS (force non-match or review): different storage/RAM/capacity, different pack qty, different model number, different size, new vs refurbished, accessory vs main product.
4. Decision thresholds: auto_accept >= 0.96 AND zero hard conflicts AND (identifier OR model+brand+spec agreement); needs_review 0.75–0.96 or any conflict; reject < 0.75. Thresholds live in config and are tuned by the benchmark, not by feel.
5. Variant resolution: attach to the right variant, never the parent when a variant attribute is knowable.
6. Human review queue (admin): side-by-side listings, evidence table, one-key accept/reject/split/merge, decisions become labeled training/eval data. Merges and splits are reversible and fully audited.
7. UI contract: auto_accepted => "Matched" badge; needs_review/low => "Possible match" (dashed violet, excluded from price comparison math by default, user can include); never silently merge.

AI ROLE (optional, bounded): an LLM adjudicator ONLY for the 0.75–0.96 band, given structured evidence, returning {verdict, reasons[]}; cached by content hash; cost ceiling per day; if unavailable => stays in review queue. LLM can never override a hard conflict.

BENCHMARK (build before tuning)
- /packages/matching/bench: gold set of >= 1,000 labeled pairs (build tooling to label from the review UI), including adversarial pairs: 128GB vs 256GB, 2-pack vs 1-pack, similar model numbers, accessories, refurbished, regional variants.
- Report precision, recall, F1, false-positive list; CI fails if precision on the adversarial set < 99.5% or overall precision < 99%.

PHASE GATE: benchmark passes; property tests (symmetry, idempotency) pass; review queue works end to end; docs/matching.md explains every feature weight and conflict rule.
```

---

## PROMPT 07 — SEARCH ENGINE

```
Implement search as a core capability (apps/api search module + packages/core query parser).

STAGE 1 (MVP, Postgres-only)
- Query understanding pipeline: normalize -> detect model numbers (regex + brand dictionary) -> detect units/specs ("8gb 256gb", "1.5 ton") -> brand/category intent -> typo correction (trigram against brand/model vocab) -> synonym expansion (curated table: "mobile"="phone", "fridge"="refrigerator", Hinglish common terms).
- Retrieval: tsvector (weighted: brand A, model A, title B, specs C) + pg_trgm for fuzzy + exact identifier short-circuit (paste a GTIN/URL => direct product resolution; paste a retailer URL => resolve listing and show comparison).
- Ranking: BM25-ish ts_rank + text quality + availability + number of verified offers + price freshness + popularity (smoothed) ; explainable score in debug mode.
- Filters (faceted counts, <60ms): category, brand, price range, retailer, availability, discount%, key specs per category, rating if available.
- Autocomplete: prefix + popularity + recent, <50ms p95, keyboard-first, groups: Products, Brands, Categories, "Compare this URL".
- Natural language (optional AI, Stage 2): "best phone under 20k with good camera" -> structured filter JSON via LLM with strict schema, validated, shown to user as editable chips (never hidden), fallback to lexical.
- Search analytics: zero-result queries, reformulations, click positions -> feeds synonyms and ranking.

STAGE 2 TRIGGER (document it): migrate to Meilisearch (self-hosted) when search p95 > 150ms at 1M+ indexed products or facet latency > 100ms. Keep a `SearchProvider` interface so this is a swap, not a rewrite.

Load-test with k6: 200 rps mixed queries, p95 budget enforced in CI nightly.

PHASE GATE: relevance test set of 300 queries with expected top results (nDCG@10 tracked), latency budgets met, zero-result rate reported.
```

---

## PROMPT 08 — PRICE INTELLIGENCE ENGINE

```
Implement @scrappy/pricing.

COMPUTE (from price_observations + rollups)
Current best offer (only verified matches, in-stock, comparable pack/variant), lowest/highest ever, 30/90/365-day min/median/avg, volatility (coefficient of variation), price percentile vs own history, discount history, availability correlation, retailer spread, price-change events (drop/rise/restock), anomaly detection (robust z-score on log-price + sudden-MRP-inflation check).

TRANSPARENT DEAL SCORE (0–100, always explained)
Components with visible weights: price vs 90-day median (40), price vs all-time low (20), MRP-inflation penalty (up to -25 if MRP rose recently before a "sale"), retailer spread (10), data freshness (15), history length confidence (15).
Output: score, label (Great/Good/Fair/Wait/Insufficient data), and a plain-language reason list: "₹1,200 below its 90-day median. Lowest price in 5 months. MRP unchanged for 120 days (discount is genuine)." If history < 14 days => label "Insufficient data", no score shown. NEVER show a deal badge on stale (> 24h) or unverified-match prices.
Fake-discount detector: flags listings whose MRP jumped > 15% in the 30 days before the sale; surfaced honestly: "MRP was raised recently."

BUY-TIMING (Stage 2, labeled "Estimate")
Simple, explainable seasonality/trend signal (not a black-box prediction): "Prices for this category usually dip around X (based on N past events)". No claims of certainty.

Everything returns provenance + confidence. Unit tests with synthetic series for: flat, gradual decline, spike, fake sale, missing days, single observation.

PHASE GATE: deterministic tests pass; deal-score explanations snapshot-tested; docs/pricing.md documents formulas.
```

---

## PROMPT 09 — SCRAPPY COMPARE (CONSUMER PRODUCT)

```
Build Compare end to end. Mobile-first; this is the front door to the whole platform.

MVP CAPABILITIES (P0): search, browse categories, product page, offers table, price history, "possible match" handling, watchlist, price-drop alerts (email + in-app), recent views, share a comparison, outbound retailer links (affiliate-disclosed).
P1: side-by-side compare (2–4 products with spec diff highlighting), deals feed (with fake-discount filtering), saved searches, alternatives ("similar but cheaper"), variant selector.
P2: price-prediction estimate, browser extension (post-MVP).

SCREENS (each: purpose, hierarchy, states, motion, responsive, a11y — implement all)
1. Home/Search: one oversized command-style search input (focus on load, "/" shortcut), live-ticking "Tracking N products across 4 stores" proof stat, category rail, today's verified deals, recently viewed.
2. Results: left facets (drawer on mobile), result rows (not cards-in-a-grid: dense list with image, title, best price, retailer count, deal label, trust badge), sort, URL-synced state, infinite scroll with scroll restoration.
3. Product page (SEO-critical, server-rendered, ISR 15 min): header (title, variant selector), BEST PRICE block (price, retailer, freshness "Checked 14 min ago", deal score with "Why?" popover), offers table (retailer, seller, price, shipping, availability, TrustBadge, "Go to store"), price-history chart (1M/3M/1Y/All, table toggle, events), specs (normalized), alternatives, "Set price alert" inline, structured data (Product + Offer JSON-LD), canonical URL.
4. Compare view: column per product, sticky header, spec diff mode (only differences), best-in-row highlight with legend, share link.
5. Watchlist: items with target price progress bar, status chips, bulk actions, empty state.
6. Alerts: create/edit target-price/back-in-stock/any-drop; frequency + quiet hours; deliveries log.
7. Deals: filters by category/discount/retailer, each deal shows "why it's a deal".
8. Category pages: curated + data-driven (top by price drops, best value), SEO copy generated from real data only.
9. Account/settings: profile, notification prefs, data export, delete account.

STATES (all required): loading (shape-matched skeleton), empty (what/why/next action), error (retry + alternative), partial (some retailers failed => show others + inline note), stale (> 24h: badge + dim + no deal badges), source unavailable, product not found (offer search again / track request), offline (cached last view with banner).

INTERACTIONS: autocomplete keyboard nav, "Add to watchlist" with optimistic update + undo toast + one-line explanation ("We'll email you when it drops below ₹X"), price roll animation on refresh, shared-element transition from result image to product hero.

SEO: sitemap shards, canonical rules to prevent duplicate variant pages, noindex for thin/stale/zero-offer pages, price freshness in structured data, no indexed filter-permutation pages.

ANALYTICS EVENTS: search_submitted, result_clicked, product_viewed, offer_outbound_clicked, watch_added, alert_created, alert_triggered, alert_clicked.

PHASE GATE: e2e flows (search -> product -> watch -> alert) pass on mobile + desktop; Lighthouse perf >= 90 mobile on product page; axe clean; all states screenshot-tested.
```

---

## PROMPT 10 — NOTIFICATIONS + ALERT ENGINE

```
Implement the alert engine and notification center.

ENGINE: event price.changed / availability.changed -> rule evaluator (indexed lookup of watch_items by offer/product) -> dedupe (one trigger per item per threshold-crossing, re-arm when price rises > 3% above target) -> notification record -> channel delivery jobs.
CHANNELS: in-app, email (Resend/SES via adapter interface; templates in React Email, brand-consistent, plain-text twin).
RULES: quiet hours (user tz), frequency caps (digest option), per-channel prefs, unsubscribe one-click (RFC 8058), bounce/complaint handling, delivery status + retries (3x backoff), dead-letter table visible to ops.
EVENTS: price drop, target reached, back in stock, competitor change, job completed/failed, usage threshold, billing event, workspace invite.
NOTIFICATION CENTER (UI): bell with unread count, drawer with tabs All/Unread/Alerts/System, grouping by product/day, priority styling, inline actions (View, Snooze 24h, Edit alert), mark all read, keyboard nav, preferences link.
Every notification states: what happened, why you got it, what you can do.

PHASE GATE: duplicate-storm test (1,000 changes in 1 min => correct deduped notifications), email rendering tested in Mailpit, delivery state machine tested.
```

---

## PROMPT 11 — SCRAPPY EXTRACT (BUILDER + RUNTIME)

```
Build Extract: a no-code-to-pro extraction platform sharing the scraping engine from Prompt 05.

WORKFLOW (improved): SOURCE -> NAVIGATE -> DISCOVER -> SELECT -> SCHEMA -> TRANSFORM -> VALIDATE -> TEST -> SCHEDULE -> DELIVER

BUILDER (the flagship UI)
- URL entry (SSRF-guarded, robots check shown upfront: "This site allows/restricts automated access").
- Split view: live remote browser stream (Playwright in browser-worker, sandboxed, ephemeral, 10-min session cap) + right panel schema editor.
- Hover highlights an element with a measured overlay (tag, size, selector confidence). Click selects -> creates a field. Auto-detect repeated structures ("Found 24 similar items — use as a list?").
- Selector engine generates ranked selectors (data-attrs > stable ids > semantic CSS > structural XPath) with a resilience score; stores primary + 2 fallbacks + text-anchor heuristic; user can edit CSS/XPath in a code tab with live match count.
- Live preview table of extracted rows updates as fields change; each cell shows raw vs transformed value on hover.
- Field types: string, number, boolean, date, currency, url, image, array, object, table. Per-field: required, default, regex/format validation, transforms (trim, regex replace, parse number/currency, split, join, absolute URL, date parse w/ locale, lowercase, map values).
- Pagination wizard: next-button, URL pattern, infinite scroll, load-more; with max pages + stop conditions. Detail-page follow ("for each link, open and extract").
- Test run: runs on 3 pages, shows per-field fill rate, validation errors with human-readable diagnostics ("Price: expected a number, got 'Out of stock' on 4/24 rows — add a default or mark optional").
- Save as template; template gallery (e-commerce product list, product detail, table scrape, article, listing directory).
- Scheduling: manual, interval, cron builder (human preview "Every weekday at 9:00 IST"), timezone-aware, concurrency policy (skip/queue).
- Delivery: datasets (versioned), export CSV/JSON/XLSX/NDJSON, REST API, webhooks (HMAC signed, retries, delivery log), Google Sheets (later).
- AI assist (bounded): "Describe what you want" -> proposed schema + selectors the user reviews; "Why did this break?" -> diff of old/new DOM with suggested selector fix. Always user-confirmed, always with deterministic fallback.

RUN STATE MACHINE: DRAFT -> VALIDATING -> QUEUED -> RUNNING -> (PARTIAL | SUCCEEDED | FAILED | CANCELLED) with RETRYING as a transient substate; timeouts, cancellation, priority by plan, per-workspace concurrency caps, per-run caps. Logs stream live (SSE) with level filters and search; a run page shows timeline, records count, error classes, browser minutes consumed.

RELIABILITY: change detection (fill-rate drop), selector fallback chain, partial results preserved, dedupe by configurable key, human-readable diagnostics, alert on repeated failure.

MOBILE: view/monitor runs, logs, datasets, trigger/cancel, edit schedule. The builder itself is desktop-only with a clear, friendly "Open on desktop" state — do not ship a bad mobile builder.

METERING: records extracted, browser minutes, runs, storage, API calls — recorded as idempotent usage_events at task completion.

PHASE GATE: build a full extractor from URL in under 2 minutes in an e2e test; 20 real-world fixture sites extract correctly; kill-worker test leaves run PARTIAL or FAILED with accurate counts; SSRF test suite green.
```

---

## PROMPT 12 — SCRAPPY INTELLIGENCE (BUSINESS)

```
Build Intelligence for sellers, brands and pricing teams. Every chart must answer a named business question — put that question as the chart's title.

ONBOARDING (time-to-value < 10 minutes): Create workspace -> add your products (paste URLs / CSV / connect later) -> auto-suggest competitors via graph ("Others selling this exact product") -> confirm matches (review UI) -> first market view appears within minutes using existing graph data.

SCREENS
1. Overview: "Where am I losing sales to price today?" — top 5 products where you're priced > market median, "what changed in the last 24h", alert summary. No vanity KPIs.
2. Products: table of tracked products: your price, market min/median, gap %, position (rank among N sellers), stock status, last checked, trust badge. Row drawer: history chart overlaying you vs competitors, competitor moves timeline.
3. Competitors: per-competitor profile: overlap count, average price index vs you, recent price moves, stock-outs, frequency of discounting.
4. Market view: dot-strip per product (all sellers' prices, yours highlighted), category-level price index over time.
5. Rules & Alerts: "Notify when a competitor undercuts me by > 5%", "when X is out of stock", "when MRP changes". Rule builder with plain-language preview and dry-run against last 30 days ("this rule would have fired 6 times").
6. Reports: scheduled weekly competitor briefing (PDF + email + shareable link), CSV/XLSX exports; AI-written summary grounded ONLY on computed metrics with numbers cited, each sentence linkable to underlying data; fallback = template summary.
7. Team: invites, roles (owner/admin/analyst/viewer), permissions matrix, audit history viewer.
8. Billing & usage (see Prompt 13).

Suggested actions are shown as "Consider…" with evidence, never auto-applied. No automatic repricing in MVP.

PHASE GATE: demo workspace with seeded data tells a coherent story; permissions tests (viewer cannot edit, cross-workspace access impossible); report generation job tested; every metric has a documented definition in docs/metrics.md.
```

---

## PROMPT 13 — ACCOUNTS, BILLING, USAGE, SECURITY

```
Implement identity, workspaces, billing, usage metering and the security baseline.

ACCOUNT MODEL: one User identity -> many Workspaces (personal auto-created; business/developer created explicitly) -> Memberships with roles. Organizations group workspaces for enterprise (hidden until needed). Project = scope inside an Extract workspace. Document the exact relationships in docs/architecture/accounts.md.

AUTH: Better Auth: email magic link + Google; optional passkeys (P2). Sessions: httpOnly, Secure, SameSite=Lax, rotation on privilege change, device list + revoke. CSRF protection, strict CSP with nonces, HSTS, security headers, rate limits on auth endpoints, breached-password check if passwords enabled.

AUTHZ: RBAC permission matrix as code (single source), enforced in API middleware AND DB scope helper; permission-denied states are designed screens.

API KEYS: `scp_live_` prefix + 32 bytes random, stored as SHA-256 hash, shown once, scopes, per-key rate limit, last-used, rotate/revoke, leak-detection pattern registered for GitHub secret scanning (document).

BILLING: Razorpay (India-first, INR, UPI/cards/netbanking) behind a `BillingProvider` interface; Stripe adapter for international later. Research current Razorpay Subscriptions API + India recurring-payment rules (RBI e-mandate) and GST invoicing requirements before implementing; document findings as FACT/ASSUMPTION.
Plans (initial logic; validate against measured infra cost per unit before publishing prices):
- Compare: free forever (ad-free, affiliate-disclosed). Pro (optional later): more watch items, history depth, faster alerts.
- Intelligence: Free trial -> Starter / Pro / Business by tracked products, competitors, refresh frequency, history retention, seats, reports.
- Extract: Free (small monthly records + browser minutes) -> Starter / Pro / Business: included records + browser minutes + concurrency; overage per 1,000 records / per browser-minute with hard-cap option.
Flows: upgrade/downgrade proration, invoices (GST-compliant), payment failure => dunning emails, 7-day grace with banner, then downgrade to Free (data retained 30 days), cancellation self-serve, billing history.
Pricing logic doc: cost per browser-minute, per 1k records, per tracked-product-day, storage GB-month, AI token budget -> target >= 70% gross margin on paid tiers. Pricing numbers are placeholders marked ASSUMPTION until validated.

USAGE METERING SEMANTICS (docs/billing/metering.md): tracked product = distinct offer-set per workspace counted daily-max; competitor = distinct merchant; run = started run; browser minute = wall-clock of leased browser context rounded up to 1/10 min; record = valid record persisted (duplicates and failed validation excluded); API request = authenticated non-5xx call; storage = daily-average GB. Events are idempotent; rollups hourly; users see live usage with budget lines and threshold alerts at 80/100%.

SECURITY BASELINE: SSRF guard, input validation (zod at every boundary), output encoding, parameterized queries only, file upload scanning/type limits, webhook HMAC signatures with timestamp (replay window 5 min), secret management via env/secret manager (no secrets in repo; gitleaks in CI), dependency pinning + audit + Renovate, least-privilege DB roles (app, worker, admin, readonly), encryption at rest (provider) + application-level encryption for stored credentials/tokens, audit log (append-only, restricted), data-export + account deletion flows (privacy), abuse controls (per-IP/per-user/per-workspace quotas, signup throttling, resource caps on extraction), threat model doc (STRIDE) covering consumers, malicious users, compromised API keys, malicious extraction targets (e.g., zip bombs, huge pages, redirect traps), supply chain.

PHASE GATE: authz test matrix green; cross-tenant attack tests green; webhook replay test; billing state machine tests incl. failed payment + grace; metering idempotency tests.
```

---

## PROMPT 14 — PUBLIC API + DEVELOPER PLATFORM

```
Build the developer experience for Extract and the data APIs.

API: REST under /v1, OpenAPI 3.1 generated from zod (single source of truth), Bearer API keys, cursor pagination, filtering, consistent error envelope {error:{code,message,doc_url,request_id,details}}, Idempotency-Key on POSTs, ETags, rate-limit headers (X-RateLimit-*), versioning via URL + dated changelog + 12-month deprecation policy, webhooks (event types, signing, retries with exponential backoff up to 24h, replay from dashboard).
Resources: projects, extractors, runs, datasets, records, schedules, webhooks, usage; later: products, offers, price-history (Product Graph API).
SDKs: generate TypeScript and Python SDKs from OpenAPI in CI (published later); CLI `scrappy` for local runs (P2).
DOCS (apps/web /docs): MDX, search (Cmd-K), quickstart in 3 steps with copy-able curl/TS/Python tabs, guides (builder, selectors, pagination, scheduling, webhooks, errors, rate limits, responsible scraping), API reference with live "Try it" using a sandbox key, changelog, status link. Every code sample is executed in CI.
DASHBOARD: keys (create/rotate/revoke, copy-with-confirm micro-interaction), request log with filters, usage vs limits, webhook delivery inspector, sandbox mode with synthetic data.

PHASE GATE: a new developer goes from sign-up to first successful API data fetch in < 5 minutes (e2e timed); contract tests against OpenAPI; docs code samples pass CI.
```

---

## PROMPT 15 — ADMIN CONSOLE + OBSERVABILITY + OPERATIONS

```
Build apps/admin and the observability stack.

ADMIN (separate deployment, allowlisted staff + MFA, every action audited with reason field)
Views: users, workspaces (impersonation only read-only + audited + time-boxed), sources/adapters (health, toggles, circuit-breaker state, drift reports with HTML diff), match review queue, products (merge/split), jobs/runs/failures with replay, data freshness heatmap, subscriptions/usage, dead-letter queues, feature flags, system health.
Safe actions: pause source, replay run, requeue DLQ item, refund-flag, revoke API key, force re-match — each with confirm dialog stating blast radius.

OBSERVABILITY
OpenTelemetry traces (web -> api -> worker with propagated trace ids), structured JSON logs (pino) with request_id/workspace_id/run_id, metrics (Prometheus-compatible): API latency, search latency, queue depth + age, worker heartbeat, scrape success per source, adapter health, data freshness, match auto-accept rate + review backlog, DB pool/slow queries, storage, AI tokens + cost, email delivery, cost per workspace. Error tracking (Sentry). Dashboards + alerts with runbooks linked (docs/runbooks/*.md) for: queue backlog, source degraded, DB saturation, payment webhook failure, email bounce spike, cost anomaly.
Public status page: system, API, per-retailer source state, scraper status — states only, no sensitive tactics; incident history.

MATURITY: MVP = logs + Sentry + uptime + 6 core dashboards; 10k users = traces + SLOs; 100k = per-tenant cost attribution + anomaly detection.

PHASE GATE: induced failures (kill worker, block a source, saturate queue) each trigger the right alert with a working runbook.
```

---

## PROMPT 16 — LANDING PAGE + MARKETING EXPERIENCE

```
Design and build the Scrappy homepage and marketing surfaces. It must communicate WHAT / WHO / WHY / WHY NOW / WHY SCRAPPY within 5 seconds, using the real product, not stock imagery.

NARRATIVE (scroll story using the brand motion story: DISCOVER -> SCAN -> UNDERSTAND -> CONNECT -> COMPARE -> ACT)
1. HERO: headline "Every price. One truth." (variant test: "The web, resolved.") with the animated mark converging as the headline resolves; a LIVE search input that returns real results from the catalog (not a screenshot); sub-line + 3 path buttons: Shop smarter (Compare) / Outprice competitors (Intelligence) / Extract any page (Extract). Live proof stat strip (products tracked, prices checked today, median data age) pulled from real data.
2. DISCOVER -> SCAN: interactive demo — paste a product URL, watch Scrappy resolve it to the canonical product and show the offers from other stores (real pipeline, rate-limited, cached).
3. UNDERSTAND: price-history chart demo with the "Why is this a good deal?" explainer, genuine fake-discount catch example.
4. CONNECT: product-graph visualization (one product node, retailer listings snapping onto it with confidence lines solid/dashed = Matched/Possible) — the signature visual.
5. COMPARE/ACT for businesses: market dot-strip with "you are 8% above median" insight and rule-builder preview.
6. EXTRACT: looped, real recording of the builder going URL -> select -> preview -> API in 20s; code snippet tabs.
7. TRUST: "How we know what we know" — provenance explained, freshness, honest limits, responsible scraping policy, data-source policy.
8. PRICING (3 audiences, tabbed), FAQ, final CTA.
9. Footer: status, docs, bot page, legal.

Messaging: Consumers — "Know if it's actually a deal." Businesses — "See your market move before it moves your sales." Developers — "Structured web data, one API call."

Performance: no autoplay video above fold, hero interactive < 100KB JS, fonts subset + preloaded, animations GPU-only, below-fold sections lazy-hydrated. Fully usable with JS animations disabled.

Also: /about, /bot (ScrappyBot explanation + opt-out), /security, /privacy, /terms, /acceptable-use, /data-sources, /status, /changelog, /blog scaffold. Draft legal text as clearly-marked DRAFT for lawyer review (do not present as final legal advice).

PHASE GATE: Lighthouse 95+ perf/a11y/SEO on mobile; hero live search works under load; every claim on the page is backed by a real number or removed.
```

---

## PROMPT 17 — TESTING, CI/CD, DEPLOYMENT, DISASTER RECOVERY

```
Harden the delivery pipeline.

TESTS (coverage targets are minimums for critical packages: matching, pricing, billing, authz >= 90% lines; overall >= 75%)
Unit, integration (real Postgres via Testcontainers), API contract, component, E2E (Playwright: consumer, business, developer journeys), visual regression (all design-system stories + key screens, light/dark), accessibility (axe in CI + manual keyboard/screen-reader script in docs/qa/a11y.md), load (k6: search, product page, API, extraction enqueue, dashboard, alert fan-out), security (OWASP ZAP baseline, authz fuzzing, SSRF suite), scraper fixtures + nightly canaries, matching benchmark gate, chaos (worker kill, queue stall, DB failover simulation).
Mandatory named tests: variant mismatch, pack-size mismatch, false-match prevention, stale-price suppression of deal badges, partial extraction, duplicate records, schema drift, webhook replay, double-billing prevention, cross-tenant leakage.

CI/CD: PR => lint, typecheck, unit, integration, build, preview deploy (web + api), e2e on preview, security scans; main => migrations (expand phase) -> deploy api/workers (rolling) -> deploy web -> smoke tests -> contract phase later. Feature flags for risky launches. Rollback: one command re-deploys previous artifact; DB migrations are expand/contract so rollbacks are safe. Required checks listed in docs/engineering/quality-gates.md.

ENVIRONMENTS: local, preview (ephemeral DB branch), staging (prod-like, synthetic + canary data), production. Secrets per env in secret manager; no shared prod credentials in lower envs.

DR: automated daily DB backups + PITR, weekly restore drill scripted and logged, R2 versioning, config in git, queue is Postgres (covered by DB recovery), worker stateless. Targets: RPO <= 15 min, RTO <= 2 h (ASSUMPTION; revisit). Runbooks: DB restore, credential compromise (rotate everything script), source corruption (quarantine + reprocess from raw_ref), bad deploy rollback.

DATA RETENTION (docs/data/retention.md): raw observations 13 months hot then archived; rollups indefinite; run logs 30 days (90 paid); audit logs 2 years; exports 7 days; deleted accounts purged in 30 days with legal-hold exceptions documented.

PHASE GATE: full pipeline green; restore drill executed and timed; chaos suite passes.
```

---

## PROMPT 18 — RED TEAM, POLISH, LAUNCH AUDIT

```
Act as a hostile reviewer, then fix everything you find. Produce docs/launch/audit.md with findings + fixes + residual risk.

AUDIT AXES
1. Security: attempt cross-tenant reads, IDOR on every :id route, API key leakage in logs, SSRF via redirects/DNS rebinding, XSS via scraped content (all scraped strings are untrusted!), webhook forgery, auth bypass, rate-limit evasion.
2. Data truth: sample 200 offers per source and compare with the live page; report accuracy %, staleness; fix adapters. Sample 300 matches; compute real precision.
3. UX: walk every journey on a 360px Android viewport, on slow 3G throttling, with keyboard only, with screen reader, with reduced motion. List every dead end, unclear state, missing empty/error state, misleading label.
4. Performance: verify budgets from the Constitution on real routes; bundle analysis; fix regressions.
5. Cost: simulate abusive user (1,000 extractors, huge pages, loops); verify quotas/backpressure protect margins.
6. Legal/Policy: confirm robots/ToS posture per source, affiliate disclosures, privacy policy matches actual data flows, cookie banner only if non-essential cookies exist.
7. Brand coherence: logo, motion, charts, empty states, emails, OG images, docs all feel like one universe.
8. "What would users hate / developers hate / businesses distrust?" — answer honestly and fix.

LAUNCH CRITERIA (all must be true)
- Match precision >= 99% on benchmark; zero known cross-tenant leaks; all P0 acceptance criteria met; every P0/P1 feature meets the Definition of Done below; status page live; runbooks tested; restore drill passed; legal pages reviewed by counsel; support contact + help center live.

DEFINITION OF DONE (every feature)
UI + states, backend, data + migration, validation, a11y, tests (unit + integration + e2e where user-facing), analytics event, security review, observability (logs/metrics/alerts), docs, and acceptance criteria demonstrably met.
```

---

## APPENDIX A — MVP SCOPE (stop scope explosion)

| Product      | Must exist (P0)                                                                     | Should (P1)                              | Must wait                                |
| ------------ | ----------------------------------------------------------------------------------- | ---------------------------------------- | ---------------------------------------- |
| Compare      | Search, product page, offers, history, watchlist, email/in-app alerts, trust badges | Side-by-side, deals feed, saved searches | Price prediction, extension, mobile app  |
| Intelligence | Track products/competitors, gap table, market view, rules + alerts, weekly report   | AI summaries, CSV import, team roles     | Auto-repricing, Shopify/WooCommerce sync |
| Extract      | Builder, schema, test run, runs, datasets, export, API, webhooks, schedule          | Templates gallery, AI assist             | Marketplace, Sheets sync, CLI            |
| Platform     | Auth, workspaces, billing, metering, admin, observability, status                   | SSO prep, passkeys                       | SOC2 process, enterprise SSO             |

## APPENDIX B — SCALE TRIGGERS

| Component                           | Split/upgrade when                                                      |
| ----------------------------------- | ----------------------------------------------------------------------- |
| Queue (pg-boss -> BullMQ/Redis)     | Queue throughput > ~200 jobs/s or lock contention visible in DB metrics |
| Search (PG -> Meilisearch)          | p95 > 150ms or > 1M indexed products                                    |
| Browser workers (own service/fleet) | Browser minutes > 30% of infra cost or need autoscale                   |
| Matching (own service)              | Matching CPU starves API or batch > 1h                                  |
| Read replicas                       | DB CPU > 60% sustained or reporting queries hurt OLTP                   |
| Time-series (Timescale/ClickHouse)  | Observations > ~1B rows or rollup queries > 500ms                       |

## APPENDIX C — INDEPENDENT IDEAS (evaluated, not auto-added)

- **Universal Product ID / Product Graph API** — likely the strongest long-term moat; ship after matching precision is proven. (NEXT)
- **Retailer reliability score** (price accuracy, stock accuracy, delivery claims) — differentiates Compare, builds trust. (NEXT)
- **Genuine-discount ledger** (public "MRP inflation" stats per retailer) — viral, brand-defining, legally needs careful wording. (NEXT)
- **Browser extension** (price history + alerts on the retailer page itself) — strong retention loop. (NEXT)
- **Extraction template marketplace** — network effects for Extract. (LATER)
- **Price prediction** — high trust risk if wrong; only as labeled estimate. (LATER)
- **AI data analyst over your workspace data** — useful after metrics are solid. (LATER)
- **Automated repricing** — high liability. (MAYBE NEVER, or enterprise opt-in only)

## APPENDIX D — OPEN RESEARCH ITEMS (Antigravity must verify before building, not assume)

1. Official affiliate/product-data programs and feeds for Amazon India, Flipkart, Croma, Reliance Digital (availability, terms, rate limits).
2. robots.txt + ToS posture of each target; document legal-risk and chosen safe mode.
3. India DPDP Act obligations for user data; GST invoicing format; RBI recurring-payment rules for Razorpay subscriptions.
4. Current Gemini/Embedding model pricing and quotas; pick models by measured eval, not hype.
5. Hosting pricing at 100 / 10k / 100k user scale to validate the cost model.
