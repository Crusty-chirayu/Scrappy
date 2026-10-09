# Scrappy Repository State Report

## Git State
- Current branch: `ui-v2` (HEAD at `2d73067`, 11 commits ahead of `main`).
- `ui-v2` is NOT merged into `main` (`main` remains at `91f8f57`).
- Working tree has 23 uncommitted files modified on 2026-10-07 between 21:29 and 21:35 (outside Antigravity session), adding `"use client"` directives across `@scrappy/ui` components, adding `./*` exports in `packages/ui/package.json`, and configuring `optimizePackageImports` in `apps/web/next.config.mjs`.

## Route Table
| Route | Design System | Backend Wiring | Notes |
| :--- | :--- | :--- | :--- |
| `/` | new design | local | Price radar hero, Signal tokens, purely client-rendered |
| `/compare` | new design | mock | Backed by in-memory `defaultCatalogRepository` seed |
| `/compare/[id]` | new design | mixed | Seed product details; real POST to `/api/watchlist` and `/api/alerts` |
| `/intelligence` | new design | mock | Static `SPECIMEN_INTELLIGENCE_DATA` fixture, no backend calls |
| `/extract` | new design | real wiring | Client SSRF guardrail, sends extraction requests to `/api/extract` |
| `/pricing` | new design | real wiring | Interacts with `/api/billing/create-checkout` and customer portal |
| `/status` | new design | mock | Displays hardcoded incident specimen state with Signal tokens |
| `/auth/login` | new design | real wiring | Direct calls to Supabase Auth `signInWithPassword` |
| `/auth/signup` | new design | real wiring | Direct calls to Supabase Auth `signUp` |
| `/auth/callback` | old design | real wiring | 6 hardcoded hex colors; exchanges Supabase auth code for session |
| `/watchlist` | new design | mixed | Seed items fallback; synchronizes via `/api/watchlist` |
| `/alerts` | new design | mixed | Seed rules fallback; persists via `/api/alerts` POST |
| `/settings` | new design | real wiring | Interacts with `/api/workspaces`, `/api/api-keys`, `/api/webhooks` |
| `/onboarding` | new design | local | 3-step wizard with local React state; selections not persisted to DB |
| `/docs` | old design | static | 58 hardcoded hex colors (`#D6DBE3`, `#262E3C`), dark-only |
| `/legal/privacy` | old design | static | 8 hardcoded hex colors, dark-only |
| `/legal/terms` | old design | static | 7 hardcoded hex colors, dark-only |
| `/legal/responsible-scraping` | old design | static | 17 hardcoded hex colors, dark-only |
| `/admin` (web) | not applicable | stub | Calls `notFound()` 404 by design |
| `apps/admin` (port 4001) | old design | mock/staged | Standalone Node server; hardcoded inline hex colors; staging test stubs |
| `/dev/*` (5 routes) | new design | local | Component galleries; blocked in production via `DevLayout` |

## Fonts and Theme Findings
- `apps/web/src/app/fonts.ts` imports `GeistSans` and `GeistMono` from `geist`, but exports `fontDisplay` and `fontSerif` with empty variables.
- `apps/web/src/app/globals.css` imports `@fontsource-variable/bricolage-grotesque` and defines `--font-display: "Bricolage Grotesque Variable"`.
- Typography rendering disconnect:
  - Display renders Bricolage Grotesque (via globals.css `@fontsource`).
  - Body renders Inter fallback because `--font-ui` references `Inter` and is not connected to `GeistSans` CSS variable.
  - Numbers render JetBrains Mono fallback because `--font-mono` references `JetBrains Mono` instead of `GeistMono`.
  - Deviation from spec: Spec requests Bricolage Grotesque, Geist, and Geist Mono. Current runtime body and numbers fall back to Inter and JetBrains Mono.
- Theme tokens: `tokens.css` defines Midnight (`--surface-0: #07080d`) and Daylight (`--surface-0: #f7f7f4`).
- Theme persistence: Toggle lives in `AppShell`, runs circular view transition, and persists to `localStorage('scrappy-theme')`.
- Theme bug on old routes: `/docs`, `/legal/*`, and `/auth/callback` use hardcoded dark hex codes and do not adjust when Daylight theme is active.

## Regressions
- No backend calls were removed or downgraded from real to mock between `main` and `HEAD` (mocked routes like Intelligence and Compare were already using seed/specimen structures in `main`).
- Test assertion loosening in `apps/api/src/__tests__/api.test.ts`:
  - Search merchant match loosened from exact `"Amazon.in"` to substring search.
  - Entity match confidence assertion loosened from `["verified", "matched"]` to also accept `"possible_match"`.
- Vitest timeouts increased from defaults to 30s test timeout and 60s hook timeout in `vitest.config.ts`.
- Playwright `baseURL` altered from `http://localhost:3005` to `http://localhost:3000`.

## Verification Gaps
- `copy-budget script`: DOES NOT EXIST (`scripts/copy-budget.ts` was never created).
- `motion-exists test`: NEVER RUN (automated visual frame-diff motion tests do not exist; only unit tests in vitest).
- `reduced-motion test`: NEVER RUN via Playwright in `ui-v2` (only vitest token check ran; Playwright audit script unverified).
- `console-clean test`: NEVER RUN on `ui-v2` (`e2e/console-clean.spec.ts` unexecuted).
- `360px no-horizontal-scroll test`: NEVER RUN on `ui-v2` (`e2e/resilience-g10.spec.ts` unexecuted).
- `touch-target test`: NEVER RUN as full-page audit (only isolated component unit tests ran).
- `focus-visible test`: NEVER RUN as an automated suite across all pages.
- `production Lighthouse`: NEVER RUN against production build (only local script on `/dev/motion` existed).
- `supabase test db`: NEVER RUN on `ui-v2` (documented in earlier stages on main, but unexecuted on `ui-v2`).
- `full Playwright suite`: NEVER RUN on `ui-v2` (only `e2e/axe.spec.ts` was executed; the remaining 8 e2e spec files were skipped).

## Open Risks
- `ui-v2` uncommitted modifications: 23 files modified in working directory without git commit.
- Branch divergence: 11 commits on `ui-v2` have not been merged into `main`.
- Unprotected external routes: `/docs` and `/legal/*` still present legacy visual styling and lack responsive theme adaptation.
- Next.js client bundles for `/dev/*`: Dev routes are blocked by runtime `notFound()` in production, but route chunks may still compile into the build artifacts if not excluded.

## Weaknesses
- Onboarding choices are ephemeral: `/onboarding` collects persona, product, and alert criteria but never persists them to Supabase.
- Intelligence board is non-functional mock: `/intelligence` shows static mock data with no live crawler or API connectivity.
- Dual styling debt: The application maintains two separate styling systems (Signal tokens in app views vs legacy dark hex colors in docs/legal/admin).
- Unverified end-to-end resilience: Core visual regression, responsiveness, and interaction test suites have not been executed on the rewritten UI.
- Font token misalignment: CSS variables for body and mono fonts fail to bind the bundled Geist fonts, falling back to system or external fonts.
