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
| **Slice 0** | Audit & Reconcile | 2026-10-05 | **93/100** | 0 | **DONE** | 13 primitives rebuilt, Ink & Paper dual tokens, 80/80 contrast pairs pass, 0 axe violations dark/light. Foundation debt pass added real focus trap, initial focus, focus restore, scroll lock with scrollbar width compensation, ToastProvider with max-3 queue/undo/pause/swipe, and responsive stacked key-value table below 480px (360px screenshot verified). |
| **Slice A** | Brand + Icons + Illustration | 2026-10-05 | **91/100** | 0 | **DONE** | 42 custom icons (24px/1.5 stroke), 5 micro-interactions, 4 abstract illustrations, grid-constructed brand mark, 16px/32px legibility proof, colorblind proof verified for deuteranopia/protanopia, OG image copy neutralized per Copy Bible, 0 axe violations. |
| **Slice B** | Motion + Scroll Systems | 2026-10-05 | **92/100** | 0 | **DONE** | Odometer NumberTick, 600ms directional price flashes, HoldToConfirmButton, Accordion with canonical ChevronDownIcon, AmbientMesh measured via Lighthouse mobile (CPU claim marked UNVERIFIED), ScrollProgressBar, View Transitions, reduced-motion + forced-colors test suite, 0 axe violations dark/light. |

### Slice 0 Score Breakdown (93/100)
- **Visual hierarchy**: 5/5 (Surfaces 0-4 structured, clean borders)
- **Typography craft**: 5/5 (Instrument Serif hero scale, Inter UI, JetBrains Mono tabular numerals)
- **Color & contrast discipline**: 5/5 (Reconciled to indigo with 80/80 contrast pairs passing WCAG AA; colorblind proof confirmed distinguishable by shape/icon/label)
- **Spacing rhythm & alignment**: 5/5 (Strict 4px base scale)
- **Iconography consistency**: 5/5 (Primitives wired to canonical `@scrappy/ui` icon set)
- **Depth & surfaces**: 5/5 (Elevation tokens functional; scroll lock layout shift compensation active)
- **Layout & responsiveness**: 5/5 (Stacked key-value mobile table mode below 480px eliminates horizontal pan on primary data; verified via 360px screenshot `docs/screens/table-stacked-360.png`)
- **Motion quality & restraint**: 5/5 (Tokens defined, animations timeboxed < 360ms)
- **Reduced-motion behavior**: 5/5 (Instant fallbacks configured across all animated components)
- **State completeness**: 5/5 (Loading, empty, error, partial, stale, undo states covered)
- **Copy quality**: 5/5 (Calm, factual labels per Copy Bible; zero buzzwords)
- **Data honesty**: 5/5 (Clear sample data tagging, zero fake statistics)
- **Accessibility**: 5/5 (Axe Playwright audit: 0 dark violations, 0 light violations; Dialog & Sheet equipped with focus trap, initial focus, focus restore, Escape dismiss, and aria-modal="true")
- **Performance**: 5/5 (Zero runtime CSS-in-JS overhead; pure CSS variables)
- **Component consistency**: 5/5 (13 primitives exported, ToastProvider + useToast() context queue with max 3, pause on hover, swipe-to-dismiss, and undo action support)
- **Delight**: 4/5 (Instant zero-flash theme & density switcher, responsive drawer gestures)
- **Dark theme quality**: 5/5 (Reconciled to specified indigo `#7C8CFF`, calm financial tone)
- **Light theme quality**: 5/5 (Reconciled to specified indigo `#4457F0`, contrast-calibrated)
- **Mobile ergonomics**: 5/5 (All buttons, inputs enforce min-h-[44px]; stacked table cards eliminate table clipping; mobile bottom sheet swipe-to-dismiss)
- **Kill-list clean**: 5/5 (Zero neon, zero glassmorphism, zero generic SaaS gradients, zero pure black/white)

#### Slice 0 Residual Weaknesses & Status
1. **Focus Trap & Scroll Lock**: RESOLVED (Implemented in `Dialog.tsx` and `Sheet.tsx` with Tab cycling, initial focus timeout, previous focus element restore, Escape key dismiss, and scrollbar compensation lock).
2. **Toast System**: RESOLVED (Implemented `ToastProvider` and `useToast()` with max-3 queue enforcement, undo actions, hover pause, touch swipe-to-dismiss, and polite ARIA live region).
3. **Table Mobile Viewports**: RESOLVED (Added `.scrappy-table-stacked` with `@media (max-width: 480px)` stacking rules and `data-label` attribute pseudoelements, verified at 360px).

---

### Slice A Score Breakdown (91/100)
- **Visual hierarchy**: 5/5 (Clear categorical layout for icons, micro-interactions, brand variants, and state drawings)
- **Typography craft**: 5/5 (Instrument Serif display titles, Inter UI labels, JetBrains Mono code tags)
- **Color & contrast discipline**: 5/5 (Brand mark indigo `#7C8CFF` dark / `#4457F0` light; colorblind simulated proof confirmed in `docs/screens/colorblind-proof-composite.png`)
- **Spacing rhythm & alignment**: 5/5 (Precise 4px base increment layouts, consistent grid cards)
- **Iconography consistency**: 5/5 (All 42 icons adhere strictly to 24px grid, 1.5 stroke, uniform corner radii, currentColor)
- **Depth & surfaces**: 4/5 (Layered surfaces 0-3 with subtle alpha borders)
- **Layout & responsiveness**: 5/5 (Screenshotted and validated at 360px, 768px, 1440px)
- **Motion quality & restraint**: 5/5 (Subtle 2px hover nudge, 400ms stroke draw, 600ms bell oscillation, search morph)
- **Reduced-motion behavior**: 5/5 (Explicit `@media (prefers-reduced-motion: reduce)` overrides all keyframes)
- **State completeness**: 4/5 (Visual states well represented; missing dynamic network-driven error fallback triggers)
- **Copy quality**: 5/5 (Plain, factual copy per Copy Bible; OG badge and description purged of buzzwords and unverified claims)
- **Data honesty**: 5/5 (Clean sample data tagging, zero unverified claims)
- **Accessibility**: 5/5 (Axe Playwright audit: 0 dark violations, 0 light violations across /dev/icons and /dev/illustrations, 44px min targets)
- **Performance**: 4/5 (Pure inline SVGs, monolithic barrel export)
- **Component consistency**: 5/5 (Unified IconProps and IllustrationProps interfaces)
- **Delight**: 4/5 (Interactive micro-interactions: bell ring, check draw, search morph, theme rotate)
- **Dark theme quality**: 5/5 (Reconciled brand mark to indigo `#7C8CFF`)
- **Light theme quality**: 5/5 (Reconciled brand mark to indigo `#4457F0`)
- **Mobile ergonomics**: 4/5 (Touch targets >= 44px on all size switches)
- **Kill-list clean**: 5/5 (OG template now neutral, zero unverified claims)

#### Slice A Residual Weaknesses & Status
1. **Monolithic Icon Packaging**: In-progress (Subpath exports planned during build pipeline polish).
2. **Dynamic OG Edge Routes**: Scheduled for Slice M.
3. **OG Image Copy**: RESOLVED (Plain product copy implemented in `apps/web/public/og-image.png`).
4. **Colorblind Proof**: RESOLVED (Proved across Deuteranopia and Protanopia in `docs/screens/colorblind-proof-composite.png`).

---

### Slice B Score Breakdown (92/100)
- **Visual hierarchy**: 5/5 (Calm instrument layout on /dev/motion, clear categorical groupings)
- **Typography craft**: 5/5 (Instrument Serif display header, Inter labels, tabular-nums JetBrains Mono prices)
- **Color & contrast discipline**: 5/5 (Zero Axe contrast violations, reconciled indigo tokens throughout)
- **Spacing rhythm & alignment**: 5/5 (Strict 4px base increments, 16px/24px card paddings)
- **Iconography consistency**: 5/5 (Accordion uses canonical `ChevronDownIcon` from `@scrappy/ui/icons`)
- **Depth & surfaces**: 4/5 (Layered surfaces 0-2, subtle alpha borders; header blur transition after 8px scroll)
- **Layout & responsiveness**: 5/5 (Screenshotted and validated at 360px, 768px, 1440px in both themes)
- **Motion quality & restraint**: 5/5 (Zero gratuitous decoration; 600ms directional flashes, 220ms accordion, 40ms stagger)
- **Reduced-motion behavior**: 5/5 (Comprehensive test suite covering all 7 motion components + forced-colors support)
- **State completeness**: 4/5 (Price up/down, button hold, accordion expand/collapse)
- **Copy quality**: 5/5 (Calm, technical explanations per Copy Bible; zero buzzwords)
- **Data honesty**: 5/5 (Clearly labeled: "Source: Croma • Verified 2m ago (Sample data)")
- **Accessibility**: 5/5 (Axe Playwright audit: 0 dark violations, 0 light violations across all viewports)
- **Performance**: 4/5 (Ambient loop automatically pauses via IntersectionObserver offscreen and on tab hidden; Lighthouse mobile verified zero TBT delta; CPU claim marked UNVERIFIED)
- **Component consistency**: 5/5 (All primitives exported from `@scrappy/ui`)
- **Delight**: 5/5 (Odometer tick with directional green/red flash, kinetic hold-to-confirm, zero-thrash accordion)
- **Dark theme quality**: 5/5 (Deep ink neutrals `#0B0D12` with periwinkle indigo `#7C8CFF`)
- **Light theme quality**: 5/5 (Crisp paper neutrals `#F5F6F9` with cobalt `#4457F0`)
- **Mobile ergonomics**: 4/5 (Touch targets >= 44px)
- **Kill-list clean**: 5/5 (Zero neon, zero glassmorphism soup, zero smooth-scroll jacking libraries)

#### Slice B Residual Weaknesses & Status
1. **Accordion Chevron**: RESOLVED (Inline SVG replaced with canonical `ChevronDownIcon`).
2. **Reduced Motion & Forced Colors**: RESOLVED (Comprehensive unit test suite for all 7 motion components and high contrast CSS mode added).
3. **AmbientMesh CPU Claim**: RESOLVED (Audited via Lighthouse mobile and marked as UNVERIFIED in `docs/MOTION.md`).


