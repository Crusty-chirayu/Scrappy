# Front-End Rebuild: Rubric Scores

> Scores for every slice evaluated against the 20 criteria (0-5 scale each, total normalized to 100).
> Total = (Sum of Scores / (20 * 5)) * 100.
> Threshold to mark DONE: >= 85/100 with ZERO axe violations.

---

## Evaluation Criteria (20 Rows, 0-5 Points Each)

1. Visual hierarchy
2. Typography craft
3. Color & contrast discipline
4. Spacing rhythm & alignment (4px base)
5. Iconography consistency (1.5 stroke, 24px grid)
6. Depth & surfaces
7. Layout & responsiveness (320px - 1920px)
8. Motion quality & restraint
9. Reduced-motion behavior
10. State completeness (loading, empty, error, partial, stale)
11. Copy quality (calm, clear, no buzzwords)
12. Data honesty (source chips, no fake live data)
13. Accessibility (axe, keyboard navigation, focus rings, ARIA)
14. Performance (LCP, CLS, INP)
15. Component consistency (reusable primitives)
16. Delight (signature moments landing)
17. Dark theme quality (tinted ink neutrals, desaturated accent)
18. Light theme quality (warm paper neutrals, contrast-calibrated)
19. Mobile ergonomics (44px min touch targets)
20. Kill-list clean (zero forbidden patterns or buzzwords)

---

## Slice Score Log

| Slice ID | Slice Name | Evaluated Date | Total Score | Axe Violations | Status | Summary Evidence |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Slice 0** | Audit & Reconcile | 2026-10-05 | **86/100** | 0 | **DONE** | 13 primitives rebuilt, Ink & Paper dual tokens, 80/80 contrast pairs pass, 0 axe violations dark/light, 6 screenshots at 360/768/1440. Hostile review identified 3 concrete weaknesses. |
| **Slice A** | Brand + Icons + Illustration | 2026-10-05 | **87/100** | 0 | **DONE** | 42 custom icons (24px/1.5 stroke), 5 micro-interactions, 4 abstract illustrations, grid-constructed brand mark, 16px/32px legibility proof, 0 axe violations. Hostile review identified 3 concrete weaknesses. |

### Slice 0 Score Breakdown (86/100)
- **Visual hierarchy**: 5/5 (Surfaces 0-4 structured, clean borders)
- **Typography craft**: 5/5 (Instrument Serif hero scale, Inter UI, JetBrains Mono tabular numerals)
- **Color & contrast discipline**: 4/5 (Initial lime/olive prototype departed from brief; reconciled to indigo with 80/80 contrast pairs passing WCAG AA)
- **Spacing rhythm & alignment**: 5/5 (Strict 4px base scale)
- **Iconography consistency**: 4/5 (Primitives initially had minimal inline SVGs before Slice A bespoke icon set)
- **Depth & surfaces**: 4/5 (Elevation tokens functional, but Dialog overlay lacks layered backdrop-filter blur in pure vanilla mode)
- **Layout & responsiveness**: 4/5 (Tested and screenshotted at 360px, 768px, 1440px; mobile table requires horizontal scroll)
- **Motion quality & restraint**: 4/5 (Tokens defined, animations timeboxed < 360ms)
- **Reduced-motion behavior**: 5/5 (Instant fallbacks configured across all animated components)
- **State completeness**: 4/5 (Default, hover, active, focus-visible, disabled, loading covered; empty/stale states need global composite wrapper)
- **Copy quality**: 5/5 (Calm, factual labels per Copy Bible)
- **Data honesty**: 5/5 (Clear sample data tagging, zero fake statistics)
- **Accessibility**: 4/5 (Axe Playwright audit: 0 dark violations, 0 light violations; Dialog lacks built-in keyboard focus trap)
- **Performance**: 5/5 (Zero runtime CSS-in-JS overhead; pure CSS variables)
- **Component consistency**: 4/5 (13 primitives exported, but Toast lacks declarative global hook context)
- **Delight**: 4/5 (Instant zero-flash theme & density switcher)
- **Dark theme quality**: 4/5 (Reconciled from lime to specified indigo `#7C8CFF`, calm financial tone)
- **Light theme quality**: 4/5 (Reconciled from olive to specified indigo `#4457F0`, contrast-calibrated)
- **Mobile ergonomics**: 4/5 (All buttons, inputs enforce min-h-[44px]; table touch scrolling requires multi-axis panning on small viewports)
- **Kill-list clean**: 5/5 (Zero neon, zero glassmorphism, zero generic SaaS gradients, zero pure black/white)

#### Slice 0 Concrete Weaknesses & Evidence
1. **Focus Trap & Scroll Lock Missing on Modals**: Dialog (`packages/ui/src/primitives/Dialog.tsx`) and Sheet render basic backdrop overlays without an active keyboard focus trap or `document.body` scroll-lock. When open, keyboard users can press Tab to escape into background DOM elements.
2. **Toast Lacks Imperative Dispatcher / Global Context**: The `Toast` primitive is currently an isolated component without an application-wide event bus or React context hook (`useToast()`). In real user flows, triggering toasts requires boilerplate local state management.
3. **Table Primitive Requires Horizontal Pan on Viewports <= 360px**: The `Table` primitive relies strictly on `overflow-x-auto`. On narrow mobile screens (360px viewport tested in `docs/screens/phase0-dark-360.png`), columns clip and require manual horizontal panning rather than collapsing into stacked priority key-value pairs.

---

### Slice A Score Breakdown (87/100)
- **Visual hierarchy**: 5/5 (Clear categorical layout for icons, micro-interactions, brand variants, and state drawings)
- **Typography craft**: 5/5 (Instrument Serif display titles, Inter UI labels, JetBrains Mono code tags)
- **Color & contrast discipline**: 4/5 (Initial OG template used stale lime accent; updated to indigo `#7C8CFF`)
- **Spacing rhythm & alignment**: 5/5 (Precise 4px base increment layouts, consistent grid cards)
- **Iconography consistency**: 5/5 (All 42 icons adhere strictly to 24px grid, 1.5 stroke, uniform corner radii, currentColor)
- **Depth & surfaces**: 4/5 (Layered surfaces 0-3 with subtle alpha borders; gallery cards could benefit from subtle active state depth)
- **Layout & responsiveness**: 4/5 (Screenshotted and validated at 360px, 768px, 1440px; 42-icon grid wraps densely on 360px)
- **Motion quality & restraint**: 4/5 (Subtle 2px hover nudge, 400ms stroke draw, 600ms bell oscillation, search morph)
- **Reduced-motion behavior**: 5/5 (Explicit `@media (prefers-reduced-motion: reduce)` overrides all keyframes)
- **State completeness**: 4/5 (Visual states well represented; missing dynamic network-driven error fallback triggers)
- **Copy quality**: 4/5 (Technical, calm data instrument tone; OG template initially had "verified" claim which was removed)
- **Data honesty**: 5/5 (Clean sample data tagging, neutral specification preview wording)
- **Accessibility**: 5/5 (Axe Playwright audit: 0 dark violations, 0 light violations across /dev/icons and /dev/illustrations, 44px min targets)
- **Performance**: 4/5 (Pure inline SVGs, but single monolithic index exports rather than individual subpath tree-shaking entrypoints)
- **Component consistency**: 4/5 (Unified IconProps and IllustrationProps interfaces, but illustrations are JSX-only without pure SVG raw exports)
- **Delight**: 4/5 (Interactive micro-interactions: bell ring, check draw, search morph, theme rotate)
- **Dark theme quality**: 4/5 (Reconciled brand mark to indigo `#7C8CFF`)
- **Light theme quality**: 4/5 (Reconciled brand mark to indigo `#4457F0`)
- **Mobile ergonomics**: 4/5 (Touch targets >= 44px on all size switches; copy icon button is slightly tight inside dense grid)
- **Kill-list clean**: 4/5 (OG template now neutral, zero unverified claims)

#### Slice A Concrete Weaknesses & Evidence
1. **Monolithic Icon Packaging Lacks Subpath Tree-Shaking**: All 42 icons are exported from `packages/ui/src/icons/index.ts`. Without subpath exports in `package.json` (e.g. `@scrappy/ui/icons/search`), bundlers that do not perform aggressive side-effect analysis will include all SVG definitions in consumer chunks.
2. **OG Image is Statically Pre-rendered Rather than Dynamic Edge Route**: `apps/web/public/og-image.png` is generated via a Playwright script (`scripts/generate-brand-assets.ts`). While functional for root metadata, it lacks dynamic parameter injection (`@vercel/og`) for individual product comparisons, price drops, or alert summaries (scheduled for Slice M).
3. **Micro-interactions Bound to Local Mock State**: Micro-interactions in `/dev/icons` (bell oscillation, search input morph, animated check draw) are demonstrated with isolated `useState` toggles rather than wired to real product lifecycle events (such as socket alert arrivals or clipboard write completions).
4. **16px Mark Required Post-Creation Optical Simplification**: The initial 32px brand mark geometry included fine reticle grid lines that blurred when rendered at 16x16px (favicon size). This required adding an optical sizing rule (`size <= 20`) to omit sub-axes and keep the discovery trajectory razor-sharp.

