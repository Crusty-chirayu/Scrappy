# UI AUDIT & REBUILD PLAN (v2)

## 1. Executive Summary & Context
- **Branch**: `ui-v2` (cut from `main` @ `91f8f57`).
- **Owner Directive**: Complete redesign and rebuild. The current UI was rejected: no animation, weak theme, weak fonts, walls of text on every page.
- **Scope**: All front-end visual code, layout, tokens, typography, motion system, and illustrations. Backend APIs, DB schemas, contracts, auth, scraping engine, matching algorithms, billing models, and test intent remain strictly preserved.

## 2. Existing Visual & Structural Inventory
1. **Fonts & Typography**: Currently uses standard `Inter` and `JetBrains Mono`. Lacks display character and brand distinction. Transitioning to **Bricolage Grotesque** (Display, 600, opsz), **Geist** (UI/body, 400/500), **Geist Mono** (tabular numbers, prices, IDs), and **Instrument Serif** italic for the single hero emphasis word.
2. **Themes & Palette**: Currently uses basic cool slate (`#0b0d12`). Transitioning to "Signal" theme:
   - **Dark "Midnight"**: Canvas `#07080D`, Raised `#0D0F17`, Overlay `#12151F`, Hairline `rgba(255,255,255,0.07)`, Strong border `rgba(255,255,255,0.12)`, Text `#F4F5F8` / `#A3A9B8` / `#7C8397`.
   - **Light "Daylight"**: Canvas `#F7F7F4`, Raised `#FFFFFF`, Hairline `rgba(10,12,20,0.08)`, Text `#0B0D14` / `#4A5163` / `#6B7285`.
   - **Accent "Signal"**: Vivid electric indigo-violet (`#6C5CFF`) with companion cyan for glowing hero moments. Semantic colors: Price-down green, price-up coral, warn amber, info blue, uncertain violet.
3. **Motion Primitives**: Previous motion was limited to basic CSS transitions and minimal custom timers. Installing `motion` (Framer Motion) with LazyMotion + domAnimation, shared-element morphing (`layoutId`), interactive SVG step-line charts, crosshairs with spring follow, press physics, and circular View Transition theme toggling.
4. **Copy Density**: Previous pages contained dense explanatory paragraphs ("walls of text"). Enforcing hard word budgets with strict ceilings per route (Landing ≤ 320, Compare ≤ 140, Product ≤ 220, Intelligence ≤ 200, Extract ≤ 200, Auth ≤ 70, Settings ≤ 180) enforced via a new check script (`scripts/copy-budget.ts`).
5. **Brand & Assets**: Designing an original 48px grid brand mark: a single continuous stroke "S" resolving into a precision signal node, with 6 spot illustrations and 8 category product silhouettes.

## 3. Disposables vs. Preserved Contracts
- **Disposable**: Existing CSS tokens in `packages/ui/src/tokens.css`, outdated landing page layout (`apps/web/src/app/page.tsx`), cluttered compare view, text-heavy intelligence board, and older component styles.
- **Preserved Backend Contracts**:
  - `/api/search` and compare query parameters (`q`, `category`, `brand`, `minPrice`, `maxPrice`, etc.).
  - `/api/alerts`, `/api/watchlist`, `/api/extract`, `/api/keys`, `/api/usage`, `/api/workspaces`.
  - Supabase Auth session hooks and RLS context.
  - Data structures (`ProductSeed`, `OfferSeed`, `ProvenanceInfo`, `ExtractionResult`).

## 4. Execution Phases (P0 through P8)
- **P0 Audit**: Completed (`docs/UI_AUDIT.md` & `ui-v2` branch created).
- **P1 Foundation**: Fonts, tokens, themes, motion primitives, base components, custom SVG icons, original brand mark, seed v2 data, and `/dev/kit` + `/dev/brand`.
- **P2 Shells**: Marketing & app shells, command palette (⌘K), notifications, mobile tab bar, circular theme reveal.
- **P3 Landing**: "Price radar" hero signature moment, live search, interactive bento, "How we know" strip, pricing row.
- **P4 Compare + Product**: Sticky search, facet rail, dense row/card toggle, compare tray dock, product hero price chart scrub, offers table, watch sheet.
- **P5 Intelligence**: Market board, KPI strip, undercut radar dot-strip, competitor gap table, rule builder with dry-run preview.
- **P6 Extract**: 3-pane workbench (schema tree, rendered preview with element highlight, inspector), live run console with streaming status.
- **P7 Secondary**: Auth, onboarding, settings, pricing, docs, status, 404/500 states.
- **P8 Verification**: Full suite tests, lint, typecheck, axe WCAG 2.2 AA audit, copy budget validation, lighthouse mobile verification.
