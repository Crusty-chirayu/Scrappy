# BUILD_STATE: World-Class Front-End Rebuild

> Tracking state for every slice, page, and subsystem.
> Status values: `TODO` | `DOING` | `DONE` | `PARTIAL`
> Release Gate: Every slice >= 85/100 on Rubric, 0 axe violations, 0 open defects.

---

## 1. Slices Execution Checklist

| Slice ID | Name | Description | Status | Score | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Slice 0** | Audit & Reconcile | Audit and reconcile tokens, primitives, /dev/kit route, contrast validation | **DONE** | 93/100 | Dual themes, 13 primitives, 0 axe errors, 80/80 contrast pass; focus trap, ToastProvider queue, stacked table verified |
| **Slice A** | Brand + Icons + Illustration | Grid logo, 24px icon set, abstract stroke illustrations, /dev/icons, /dev/illustrations | **DONE** | 91/100 | 42 icons, 5 micro-interactions, 4 abstract SVGs, 16px/32px proof, colorblind simulated proof, OG copy neutralized |
| **Slice B** | Motion + Scroll Systems | Easings, spring, View Transitions, page transitions, scroll timelines, /dev/motion | **DONE** | 92/100 | Odometer NumberTick, 600ms flashes, HoldToConfirm, Accordion ChevronDownIcon, AmbientMesh measured, reduced-motion + forced-colors suite |
| **Slice C** | App Shell + Nav + Palette | Collapsible sidebar, mobile bottom tab bar, Cmd-K command palette, keyboard nav | **DONE** | 96/100 | Collapsible sidebar, ⌘K command palette, ? shortcut modal, mobile tab bar with scroll hide, 0 axe errors, 6 screenshots |
| **Slice D** | Landing (`/`) | Hero with display serif, telepathic search, interactive compare demo, sticky scroll | **DONE** | 97/100 | Instrument Serif headline, telepathic search, interactive demo, 3-step workflow, 3 feature blocks, honest pricing, FAQ, 0 axe errors, 6 screenshots |
| **Slice E** | Compare (`/compare`) | Results table, FLIP reorder, multi-product diff tray, responsive filter sheet | **DONE** | 98/100 | Sticky search & filter toolbar, desktop filter sidebar, mobile bottom filter sheet, product cards with NumberTick best price & deal scores, collapsible retailer offers table, floating Compare Tray, SideBySideCompareModal with sticky column & differs row highlighting, 0 axe errors, 6 screenshots |
| **Slice F** | Product Page (`/compare/[id]`) | Above-fold LCP, SVG price history chart scrub, Watch sheet with 90d preview | **DONE** | 98/100 | Canonical product header with brand/model/EAN, financial valuation cards (deal score, discount authenticity), interactive SVG price history chart with scrub crosshair, retailer offers table, interactive watch sheet with 90d drop probability, sticky mini-header, 0 axe errors, 6 screenshots |
| **Slice G** | Watchlist + Alerts + Center | Dense watchlist table, plain-language rule builder, notification center drawer | **DONE** | 98/100 | Dense watchlist table with multi-select, bulk CSV export & deletion with undo, live KPI telemetry, plain-language alert rule builder with sentence preview, notification center drawer, 0 axe errors, 6 screenshots |
| **Slice H** | Extract Studio (`/extract`) | 3-step studio: URL check, point-and-select fields, live confidence test | TODO | - | |
| **Slice I** | Auth + Onboarding (`/auth/*`) | Magic link, cooldown timer, 3-step first-watch onboarding flow | TODO | - | |
| **Slice J** | Pricing + Billing (`/pricing`) | Honest tier comparison, usage meter, downgrade/cancellation flows | TODO | - | |
| **Slice K** | Admin Console (`/admin`) | Supabase TOTP MFA enroll + challenge, auto-advance OTP, audit log | TODO | - | |
| **Slice L** | System Pages | Branded 404, 500, offline banner, maintenance, settings console | TODO | - | |
| **Slice M** | SEO, PWA & Metadata | JSON-LD, sitemap, robots, manifest, apple-touch, OG image templates | TODO | - | |
| **Slice N** | Final Audit & Polish | Hostile design review, axe sweep, Lighthouse mobile, contact sheet | TODO | - | |

---

## 2. Page & Subsystem State Matrix

| Surface | States Built (Loaded / Loading / Empty / Error / Stale / Partial) | Mobile (360px) | Tablet (768px) | Desktop (1440px) | Axe Passed |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/dev/kit` | Loaded, interactive states, loading buttons, error inputs, all 13 primitives | PASS | PASS | PASS | PASS (0 violations) |
| `/dev/icons` | Loaded (16, 20, 24, 32px; dark & light; micro-interactions; copy code) | PASS | PASS | PASS | PASS (0 violations) |
| `/dev/illustrations` | Loaded (brand mark grid, empty, error, offline, 404; dark & light) | PASS | PASS | PASS | PASS (0 violations) |
| `/dev/motion` | Loaded (NumberTick, HoldToConfirm, Accordion, Stagger, Ambient, Scroll timeline) | PASS | PASS | PASS | PASS (0 violations) |
| `/` (Landing) | Loaded, telepathic search, interactive demo, 3-step pipeline, 3 feature blocks, FAQ | PASS | PASS | PASS | PASS (0 violations) |
| `/compare` | Loaded, search filter toolbar, desktop rail, mobile sheet, compare tray, side-by-side matrix modal | PASS | PASS | PASS | PASS (0 violations) |
| `/compare/[id]` | Loaded, loading skeleton, financial valuation, interactive SVG chart, watch sheet, sticky mini-header | PASS | PASS | PASS | PASS (0 violations) |
| `/watchlist` | Loaded, loading skeleton, empty state, bulk actions (export/delete), filter tabs, undo toast | PASS | PASS | PASS | PASS (0 violations) |
| `/alerts` | Loaded, loading skeleton, empty state, rule builder with live sentence preview, test ping, channel toggles | PASS | PASS | PASS | PASS (0 violations) |
| `/extract` | 3 steps, permission blocked state, preview test | TODO | TODO | TODO | TODO |
| `/pricing` | Loaded, billing modal, downgrade warning | TODO | TODO | TODO | TODO |
| `/settings` | Profile, notification prefs, density, theme, API keys | TODO | TODO | TODO | TODO |
| `/auth/login` | Form, check-email, rate-limit cooldown | TODO | TODO | TODO | TODO |
| `/admin` | TOTP MFA challenge, recovery codes, audit log | TODO | TODO | TODO | TODO |
| `404 / 500 / Offline` | Custom branded error views | TODO | TODO | TODO | TODO |
