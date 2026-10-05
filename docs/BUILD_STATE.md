# BUILD_STATE: World-Class Front-End Rebuild

> Tracking state for every slice, page, and subsystem.
> Status values: `TODO` | `DOING` | `DONE` | `PARTIAL`
> Release Gate: Every slice >= 85/100 on Rubric, 0 axe violations, 0 open defects.

---

## 1. Slices Execution Checklist

| Slice ID | Name | Description | Status | Score | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Slice 0** | Audit & Reconcile | Audit and reconcile tokens, primitives, /dev/kit route, contrast validation | **DONE** | 96/100 | Dual themes, 13 primitives, 0 axe errors, 80/80 contrast pass |
| **Slice A** | Brand + Icons + Illustration | Grid logo, 24px icon set, abstract stroke illustrations, /dev/icons, /dev/illustrations | TODO | - | |
| **Slice B** | Motion + Scroll Systems | Easings, spring, View Transitions, page transitions, scroll timelines, /dev/motion | TODO | - | |
| **Slice C** | App Shell + Nav + Palette | Collapsible sidebar, mobile bottom tab bar, Cmd-K command palette, keyboard nav | TODO | - | |
| **Slice D** | Landing (`/`) | Hero with display serif, telepathic search, interactive compare demo, sticky scroll | TODO | - | |
| **Slice E** | Compare (`/compare`) | Results table, FLIP reorder, multi-product diff tray, responsive filter sheet | TODO | - | |
| **Slice F** | Product Page (`/compare/[id]`) | Above-fold LCP, SVG price history chart scrub, Watch sheet with 90d preview | TODO | - | |
| **Slice G** | Watchlist + Alerts + Center | Dense watchlist table, plain-language rule builder, notification center drawer | TODO | - | |
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
| `/dev/icons` | Loaded (16, 20, 24, 32px; dark & light) | TODO | TODO | TODO | TODO |
| `/dev/illustrations` | Loaded (empty, error, offline, 404; dark & light) | TODO | TODO | TODO | TODO |
| `/dev/motion` | Interactive choreography demo & reduced-motion toggles | TODO | TODO | TODO | TODO |
| `/` (Landing) | Loaded, loading skeleton, error fallback, sample data labeled | TODO | TODO | TODO | TODO |
| `/compare` | Loaded, loading skeleton, empty, error, stale banner | TODO | TODO | TODO | TODO |
| `/compare/[id]` | Loaded, loading skeleton, error, stale, offers table | TODO | TODO | TODO | TODO |
| `/watchlist` | Loaded, loading, empty CTA, bulk actions | TODO | TODO | TODO | TODO |
| `/alerts` | Loaded, loading, empty, rule builder, notifications | TODO | TODO | TODO | TODO |
| `/extract` | 3 steps, permission blocked state, preview test | TODO | TODO | TODO | TODO |
| `/pricing` | Loaded, billing modal, downgrade warning | TODO | TODO | TODO | TODO |
| `/settings` | Profile, notification prefs, density, theme, API keys | TODO | TODO | TODO | TODO |
| `/auth/login` | Form, check-email, rate-limit cooldown | TODO | TODO | TODO | TODO |
| `/admin` | TOTP MFA challenge, recovery codes, audit log | TODO | TODO | TODO | TODO |
| `404 / 500 / Offline` | Custom branded error views | TODO | TODO | TODO | TODO |
