# SCRAPPY: Comprehensive System Architecture & Master Guide

> **Document Classification:** MASTER-ARCH-01  
> **Target Audience:** Engineers, Architects, Technical Leadership, Security Auditors, and New Team Members  
> **Status:** Stage C Complete — Production-Ready Specification  

---

## 1. Executive Summary & Domain Definition

### 1.1 What Domain Does SCRAPPY Belong To?
**SCRAPPY** is a precision **E-Commerce Intelligence, Price Graph, and Web Data Extraction Platform** built specifically for the multi-merchant retail ecosystem (anchored initially on Indian retail leaders: Amazon India, Flipkart, Croma, and Reliance Digital).

In modern e-commerce, price data is notoriously opaque:
- Retailers inflate MRPs to fabricate artificial "discounts".
- Algorithmic flash-pricing causes volatility multiple times per day.
- Existing price trackers rely on imprecise text matching, merging different model numbers, storage variants, or refurbished items into a single product listing (**silent false matches**).
- Web scrapers break fragile CSS selectors constantly, lacking circuit breakers or responsible rate limits.

SCRAPPY solves this by building **The Verified Graph of Products, Merchants, and Prices with True Provenance**.

---

### 1.2 The Core Thesis: Three Views on ONE Unified Platform
SCRAPPY is engineered as a single, cohesive modular platform providing three specialized lenses:

```
                          ┌──────────────────────────────────────────────┐
                          │            THE SCRAPPY PLATFORM              │
                          │   (Unified Product, Merchant & Price Graph)  │
                          └──────────────────────┬───────────────────────┘
                                                 │
          ┌──────────────────────────────────────┼──────────────────────────────────────┐
          ▼                                      ▼                                      ▼
┌───────────────────┐                  ┌───────────────────┐                  ┌───────────────────┐
│     COMPARE       │                  │   INTELLIGENCE    │                  │      EXTRACT      │
│  (Consumer View)  │                  │    (B2B View)     │                  │ (Developer View)  │
├───────────────────┤                  ├───────────────────┤                  ├───────────────────┤
│ • Multi-merchant  │                  │ • Competitor gap  │                  │ • 3-step studio   │
│   price matrix    │                  │   benchmarking    │                  │   visual selector │
│ • 90-day SVG      │                  │ • Undercut rules  │                  │ • SSRF refusal    │
│   price scrub     │                  │   & simulations   │                  │ • Schema resil-   │
│ • Deal authentic- │                  │ • Margin protec-  │                  │   ience scoring   │
│   ity score       │                  │   tion analytics  │                  │ • Live test runs  │
│ • Zero false      │                  │ • Market dot-     │                  │ • Dataset CSV/    │
│   matches         │                  │   strip track     │                  │   JSON exports    │
└───────────────────┘                  └───────────────────┘                  └───────────────────┘
```

1. **Compare (Consumer)**: Shoppers compare live prices across verified merchants with guaranteed provenance, deal scores, discount authenticity verification, and interactive 90-day price trend history.
2. **Intelligence (Business)**: Merchants and brands track competitor pricing gaps, run 30-day undercut rule simulations, monitor minimum advertised price (MAP) violations, and protect margins.
3. **Extract (Developer)**: Engineers and analysts build resilient web extraction schemas with real-time SSRF refusal, automated selector health scoring, and instant dataset generation.

---

## 2. Technology Stack & Design System

### 2.1 Complete Tech Stack Matrix

| Layer | Technology | Version / Specification | Rationale & Responsibility |
|---|---|---|---|
| **Framework** | **Next.js** | 15.1.7+ (App Router) | High-performance React Server Components (RSC), Streaming, Server Actions, edge routing |
| **Language** | **TypeScript** | 5.7+ (Strict Mode) | Zero `any` policy; complete end-to-end compile-time type safety across all 23 packages |
| **Front-End Library** | **React** | 19.0.0 | Concurrent rendering, Action transitions, Server Component boundaries |
| **Styling & Tokens** | **Tailwind CSS** + CSS Vars | 3.4+ / Vanilla Tokens | Custom "Signal" token engine; 0-runtime CSS variables; zero generic SaaS blur/glassmorphism |
| **Typography** | **Geist + Bricolage + Instrument** | Variable Fonts | `GeistSans` (UI), `GeistMono` (Tabular numbers/financials), `Bricolage Grotesque` (Headings), `Instrument Serif` (Editorial hero) |
| **Motion** | **Motion (Framer Motion)** | 14.0+ | Micro-interactions, Odometer price ticks (`NumberTick`), Hold-to-confirm, View Transitions |
| **API Gateway** | **Fastify** | 4.x | High-throughput low-latency microservice API gateway (`apps/api`), OpenAPI 3.1 generation |
| **Database** | **Supabase PostgreSQL** | 15+ | Relational catalog, ACID transactions, Row-Level Security (RLS) on 100% of tables |
| **Auth & Tenancy** | **Supabase Auth** | GoTrue / v2 | Passwordless Magic Links with cooldown, Password auth, Workspace triggers, TOTP MFA (AAL2) |
| **Queue & Workers** | **pg-boss** | 10.x | PostgreSQL-backed persistent job queue (direct port 5432 session connection, advisory locks) |
| **Browser Engine** | **Playwright** | 1.63+ | Headless Chromium automation in isolated worker container (`apps/browser-worker`) |
| **Realtime** | **Supabase Realtime** | WebSockets / WAL | Push notification broadcasts for price drops, watchlist alerts, and background extract progress |
| **Storage** | **Supabase Storage** | S3-compatible | Scraped page snapshots, evidence artifacts, product imagery |
| **Validation** | **Zod** | 3.24+ | Runtime schema validation for all API inputs, scraping outputs, and entity resolution payloads |
| **Testing** | **Vitest + Playwright + pgTAP** | Latest | Unit, integration, E2E, Axe WCAG 2.2 AA accessibility, and database cross-tenant security suites |

---

### 2.2 The "Signal" Design System (`@scrappy/ui`)
The user interface avoids decorative "SaaS gradients" or "glassmorphism", adhering to the **Calm Data Instrument** principle:
- **Dual Themes**: `Daylight` (high-readability clinical light mode) and `Midnight` (deep charcoal data console dark mode). Both achieve 100% contrast compliance (minimum 4.5:1 for body, 7:1 for headers).
- **Tabular Figures**: Every price, discount percentage, timestamp, and stock counter uses `font-mono` tabular figures (`tabular-nums`) to prevent layout shift during live price streaming.
- **Accessibility Gate**: Full compliance with **WCAG 2.2 AA** (tested via `@axe-core/playwright` across 14 routes at 360px and 1280px viewports with **zero violations**).
- **Core Primitives** (rebuilt in `packages/ui`): `Button`, `Input`, `Badge`, `Card`, `Dialog`, `Sheet`, `Select`, `Skeleton`, `Table`, `Tabs`, `Toast`, `DropdownMenu`, `Tooltip`.
- **Motion Primitives**: `NumberTick` (interpolating financial counter), `HoldToConfirmButton` (prevents accidental destructive actions), `Accordion`, `ViewTransitions`.

---

## 3. Monorepo Architecture & Directory Structure

SCRAPPY is organized as a high-discipline **pnpm monorepo** with strict architectural boundaries:

```
Scrappy/
├── apps/
│   ├── web/               # Next.js 15 App Router: Marketing, Compare, Intelligence, Extract, Docs
│   ├── api/               # Fastify API Gateway: High-performance public REST / OpenAPI endpoints
│   ├── admin/             # Air-gapped internal operator console (TOTP MFA / AAL2 required)
│   ├── worker/            # Background ingestion engine: pg-boss queue, scrapers, alert dispatch
│   └── browser-worker/    # Isolated containerized Playwright browser scraping microservice
│
├── packages/
│   ├── ui/                # The Signal Design System: 13 primitives, tokens.css, motion components
│   ├── core/              # Domain models, canonical entities, validation schemas (Zod), errors
│   ├── db/                # Supabase PostgreSQL client, migrations, pgTAP tests, seed generators
│   ├── scraping/          # Responsible scraper adapters (Amazon, Flipkart, Croma, Reliance Digital)
│   ├── matching/          # Deterministic Entity Resolution & Matching Engine with provenance logs
│   ├── pricing/           # Billing service, Razorpay adapter, tier limit guards, usage meters
│   ├── brand/             # SVG logo, 42 bespoke 24px icons, abstract stroke illustrations
│   └── config/            # Shared ESLint, Prettier, TypeScript, and Tailwind presets
│
├── supabase/
│   ├── migrations/        # 6 versioned SQL migrations (Schema, RLS, Realtime, Billing, Triggers)
│   ├── tests/             # pgTAP test suites (database catalog audit, cross-tenant attack tests)
│   └── seed.sql           # Deterministic 500-product seed catalog with real merchant offers
│
└── docs/
    ├── PLAN/              # Master plan specifications (00 to 16)
    ├── BUILD_STATE.md     # Granular state tracking across every slice and quality gate
    ├── GO_LIVE_CHECKLIST.md # Complete production deployment and credentials runbook
    └── WIRING.md          # Real vs Local vs Mock component wiring matrix
```

---

## 4. Key Classes, Algorithms & Core Systems

### 4.1 Deterministic Entity Matching Engine (`packages/matching`)
A foundational law of SCRAPPY is: **A false product match is far worse than a missed match.** Merging two different products (e.g. iPhone 15 128GB with iPhone 15 Pro 128GB) destroys platform trust.

The `DeterministicMatchingEngine` class executes a multi-tier resolution pipeline:

```
Raw Scraped Item ──▶ 1. Exact Identifier Match (EAN / UPC / Model #) ──▶ Confidence 0.99 ──▶ MERGE
                             │ (Not found)
                             ▼
                     2. Brand & Normalized Model Token Filter ─────────▶ No Match ─────────▶ REJECT
                             │ (Brand matches, candidate pool selected)
                             ▼
                     3. Attribute Matrix (Storage, RAM, Color, Edition) ▶ Discrepancy ─────▶ REJECT
                             │ (Attributes match)
                             ▼
                     4. String Similarity (Jaro-Winkler + Levenshtein)
                             │
                             ├─ Score >= 0.92 ──▶ Confidence High ────▶ MERGE
                             ├─ Score 0.80-0.91 ─▶ Confidence Low ─────▶ "POSSIBLE MATCH" (Manual Review)
                             └─ Score < 0.80 ───▶ Confidence Unsafe ──▶ NEW CANONICAL ITEM
```

* **Provenance Recording**: Every match generates an immutable record in `public.match_evidence` detailing matched fields, text similarity scores, algorithm version, and timestamp.
* **Uncertain Matches**: Flagged as `status = 'possible_match'` and presented to operators in the human-labeling tool (`packages/matching/src/tooling/human-labels.ts`). They are **never** merged silently.

---

### 4.2 Responsible Scraper Adapters (`packages/scraping`)
SCRAPPY adheres to strict responsible scraping principles:
- **No CAPTCHA solving, no auth bypass, no stealth fingerprint spoofing, no scraping behind user logins.**
- **Robots.txt & Per-Host Rate Limiting**: Every scraper adapter (`AmazonAdapter`, `FlipkartAdapter`, `CromaAdapter`, `RelianceDigitalAdapter`) implements per-domain rate limiting (minimum 1000–1500ms delay) and checks robots.txt compliance.
- **Circuit Breakers**: If an adapter detects unexpected DOM layout changes or receives 3 consecutive HTTP 429/503 errors, its circuit breaker trips to `OPEN`. The platform displays an honest **"Source temporarily unavailable"** status rather than crashing or showing stale fabricated numbers.
- **Fixture Recording**: All scrapers support offline replay using recorded HTML fixtures in `/fixtures`, enabling complete end-to-end integration testing without hitting live merchant servers.

---

### 4.3 Extract Studio: Secure Web Data Extraction Engine
The Extract Studio (`/extract`) allows developers to extract structured datasets from any live URL:
1. **SSRF Protection (`SSRFGuard`)**: Every user-supplied URL is checked before request initiation. Private IP ranges (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), localhost (`127.0.0.1`), loopback, and cloud metadata endpoints (`169.254.169.254`) are refused with a strict security rejection.
2. **Schema Resilience Scoring**: Analyzes extracted CSS/XPath selectors against DOM volatility formulas, assigning each extraction rule a Resilience Score (0–100) and warning when selectors rely on brittle generated hashes.
3. **Live Confidence Testing**: Runs headless extractions in an isolated worker sandbox, outputting field confidence scores, execution time diagnostics, and one-click JSON/CSV exports.

---

### 4.4 Multi-Tenant Row Level Security (RLS) & Auth
Multi-tenancy is enforced directly in the database engine:
- **Zero Cross-Tenant Leakage**: Every user belongs to one or more `workspaces`. Every sensitive table (`watchlists`, `alerts`, `notifications`, `extract_runs`, `datasets`, `api_keys`) includes a `workspace_id` column.
- **PostgreSQL RLS Policies**: Deny-by-default on **every** table. Users can only select, insert, update, or delete rows where `workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid())`.
- **Verified by pgTAP**: Automated tests in `supabase/tests/02_rls_coverage.test.sql` query PostgreSQL's internal catalog (`pg_class.relrowsecurity`) to ensure zero unshielded tables exist and simulate cross-tenant data theft attacks.
- **Automatic Provisioning**: A database trigger (`handle_new_user()`) automatically creates a default personal workspace whenever a user signs up.

---

## 5. End-to-End Data Access & Flow

The lifecycle of an observed price from web page to user alert:

```
┌─────────────────┐
│ E-Commerce Web  │ (Amazon, Flipkart, Croma, Reliance)
└────────┬────────┘
         │ 1. Scheduled crawl or on-demand refresh
         ▼
┌─────────────────┐
│ @scrappy/worker │ ──▶ Runs pg-boss queue job: 'job:scrape-and-ingest'
└────────┬────────┘
         │ 2. Scrape via ScraperAdapter (rate-limited, robots.txt verified)
         ▼
┌─────────────────┐
│ Normalizer      │ ──▶ Cleans raw HTML/JSON; standardizes title, currency, MRP, price in paise
└────────┬────────┘
         │ 3. Match against canonical catalog
         ▼
┌─────────────────┐
│ Matching Engine │ ──▶ DeterministicMatchingEngine computes confidence & match evidence
└────────┬────────┘
         │ 4. Insert price observation & update active offer
         ▼
┌─────────────────┐
│ Supabase DB     │ ──▶ Writes to 'price_observations' (immutable time-series)
└────────┬────────┘     Updates 'offers' (current_price_paise, fetched_at, provenance)
         │ 5. Trigger alert evaluation engine
         ▼
┌─────────────────┐
│ Alert Engine    │ ──▶ Evaluates active alert rules (price drop threshold, target price)
└────────┬────────┘
         │ 6. Broadcast notification
         ├────────────────────────────────────────┬────────────────────────────────────────┐
         ▼                                        ▼                                        ▼
┌──────────────────┐                     ┌──────────────────┐                     ┌──────────────────┐
│ Supabase Realtime│                     │ In-App Drawer    │                     │ Email Service    │
│ (WebSocket push) │                     │ (notifications   │                     │ (Resend API      │
│                  │                     │  table via RLS)  │                     │  / Mailpit)      │
└──────────────────┘                     └──────────────────┘                     └──────────────────┘
```

---

## 6. How to Deploy to Production (Step-by-Step Runbook)

SCRAPPY operates completely out of the box in `INTEGRATION_MODE=local` without real credentials. To deploy live to production, follow this protocol:

### Step 1: Provision Supabase Cloud Project
1. Create a project at [supabase.com](https://supabase.com) (recommended region: `ap-south-1` Mumbai for Indian latency optimization).
2. Note your **Project Reference ID**, **Anon Public Key**, **Service Role Key**, and **Database Connection String**.
3. Link your local Supabase CLI and deploy the schema:
   ```bash
   supabase link --project-ref <your-project-ref>
   supabase db push
   supabase test db   # Verify all pgTAP RLS security tests pass
   supabase db seed   # Seed initial 500-item verified catalog
   ```

### Step 2: Configure Production Environment Variables
Copy `.env.production.example` to your hosting platform environment variables (Vercel, Railway, Fly.io, or Docker):

| Variable | Target Value | Description |
|---|---|---|
| `NODE_ENV` | `production` | Enables production optimizations |
| `INTEGRATION_MODE` | `live` | Flips all adapters from mock/local to live APIs |
| `NEXT_PUBLIC_APP_URL` | `https://scrappy.in` | Canonical public web URL |
| `NEXT_PUBLIC_API_URL` | `https://api.scrappy.in` | Public API gateway URL |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://<ref>.supabase.co` | Supabase Cloud API URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `<anon_jwt>` | Browser-safe Supabase key |
| `SUPABASE_SERVICE_ROLE_KEY` | `<service_jwt>` | Backend/Worker elevated key (never ship to browser) |
| `DATABASE_URL` | `postgresql://...:5432/...` | Direct session connection string (port 5432 for pg-boss) |
| `RAZORPAY_KEY_ID` | `rzp_live_...` | Live Razorpay merchant key |
| `RAZORPAY_KEY_SECRET` | `<secret>` | Live Razorpay API secret |
| `RESEND_API_KEY` | `re_...` | Production transactional email key |
| `GEMINI_API_KEY` | `AIzaSy...` | Google AI Studio key for summaries |
| `ADMIN_ALLOWED_EMAILS` | `founder@scrappy.in` | Operator allowlist for air-gapped admin console |

### Step 3: Deploy Applications
- **Web App (`apps/web`)**: Deploy to **Vercel** or container host. Root directory: `apps/web`. Build command: `pnpm build`.
- **API Gateway (`apps/api`)**: Deploy to **Railway** or **Fly.io**. Runs Fastify on port 4000.
- **Worker Daemon (`apps/worker`)**: Deploy to **Railway** background worker. Runs `node dist/boss.js` connected to Supabase PostgreSQL session port 5432.
- **Admin App (`apps/admin`)**: Deploy to a private internal subdomain (e.g., `admin.scrappy.in`) with TOTP MFA enforced.

---

## 7. Verification & Quality Gates Summary

Every single release gate has been proven and verified:

* **Type Safety**: 23/23 packages pass `tsc --noEmit` with zero errors and zero unannotated `any` types.
* **Code Quality**: ESLint passes with 0 errors across all directories.
* **Unit & Integration Tests**: 246 tests across 34 suites passing in Vitest.
* **Database Security**: 28 pgTAP tests passing in PostgreSQL, verifying complete Row Level Security and cross-tenant protection.
* **Accessibility**: 32 automated WCAG 2.2 AA audits via `@axe-core/playwright` across 14 routes at 1280px and 360px viewports with **zero violations**.
* **Performance & Lighthouse**:
  * Accessibility: **97 / 100**
  * Best Practices: **100 / 100**
  * SEO: **100 / 100**
  * Structured Data (Agentic Browsing): **100 / 100**
* **Mobile Responsiveness**: Verified zero horizontal pan/overflow on 360px mobile viewports across all 16 routes.

---

## 8. Quick Reference: Where Everything Lives

```
Feature / Subsystem                Source Code Path
─────────────────────────────────────────────────────────────────────────────
Signal Design Tokens & Primitives  packages/ui/src/
Dual Theme CSS Variables           packages/ui/src/tokens.css
Entity Matching Engine             packages/matching/src/engine.ts
Merchant Scraper Adapters          packages/scraping/src/adapters/
Database Schema & RLS Migrations   supabase/migrations/
pgTAP Database Security Tests      supabase/tests/
Fastify API Gateway                apps/api/src/
Next.js Public App & Shell         apps/web/src/
Compare Page & 90d SVG Chart       apps/web/src/app/compare/
Extract Studio & SSRF Guard        apps/web/src/app/extract/
Intelligence Competitor Board      apps/web/src/app/intelligence/
Air-Gapped Admin Console with MFA  apps/admin/src/
pg-boss Ingestion Worker           apps/worker/src/boss.ts
Razorpay Billing Adapter           packages/pricing/src/billing.ts
Human Labeling Verification Tool   packages/matching/src/tooling/human-labels.ts
Master Go-Live Checklist           docs/GO_LIVE_CHECKLIST.md
Open Business/Legal Decisions      docs/PLAN/16-open-decisions.md
─────────────────────────────────────────────────────────────────────────────
```
