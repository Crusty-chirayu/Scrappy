# MASTER BRIEF: world-class front-end rebuild

## 0. MISSION AND CONTRACT
Rebuild the entire front-end from scratch to the standard of the best product sites in the world (benchmarks for craft, restraint and polish: Linear, Stripe, Vercel, Raycast, Arc, Mercury, Apple.com, Things 3; study their principles, never copy assets, layouts or copy). The product: a price comparison + price intelligence + data extraction tool. The feeling to create: a precise financial instrument with the soul of a beautiful consumer app. Calm, fast, trustworthy, quietly delightful.
Work fully autonomously. Do not ask me questions or wait for approval. When ambiguous, choose the most defensible option, log it in docs/DECISIONS.md (decision, alternatives, reason), and continue.
Quality over speed, but time-box: max 3 critique-fix iterations per slice, then log remaining weaknesses and move on. Polish loops must terminate.

## 1. HARD SAFETY RULES (never violate)
- UI layer only. Do not modify backend logic, DB schema or migrations (minimum glue to render states is allowed).
- Branch ui-rebuild. Commit after every slice. No force-push, no branch deletion, no history rewrite, never push to main.
- No secrets in code or logs. No real retailer scraping or network calls to retailers. No new paid services or paid APIs.
- Data honesty: never present fixture data as live. Every price shows a source-state chip: Live, Fixture, or Stale (with age). No fake logos, testimonials, user counts, stats, awards, or lorem ipsum anywhere. Sample data is always labeled "Sample data".
- Never claim something works without real output from this session. If unproven, write UNVERIFIED. Never edit tests to make them pass; fix the product or log a defect.
- Do not copy copyrighted assets, trademarks or proprietary fonts. Use open-licensed fonts only (Geist, Geist Mono, Instrument Serif or equivalents).

## 2. AUTONOMY PROTOCOL
Create these first: docs/BUILD_STATE.md (checklist of every slice and page with TODO/DOING/DONE/PARTIAL), docs/DECISIONS.md, docs/DESIGN_SYSTEM.md, docs/MOTION.md, docs/COPY_BIBLE.md, docs/RUBRIC_SCORES.md, docs/UI_STATE.md, DEFECTS.md (append, do not overwrite existing entries).
Slice order: 0 audit and reconcile existing Phase 0 work; A brand + icons + illustration; B motion + scroll systems; C app shell + navigation + command palette; D landing; E compare; F product page; G watchlist + alerts + notifications; H extract builder; I auth + onboarding; J pricing + billing; K admin; L system pages; M SEO/PWA/metadata; N final audit.
Per-slice loop: build -> typecheck/lint/tests green -> screenshots (360, 768, 1440; dark and light; every state) -> axe -> score against the rubric in section 14 -> fix everything scoring under 4/5 -> commit with message "slice X: summary, score N/100". If the build breaks, fix before continuing. If context runs low, update BUILD_STATE.md and on resume start from the first non-DONE item.
Gate: a slice is DONE only at rubric score 85/100 or higher with no axe violations. Otherwise mark PARTIAL, log why, continue.

## 3. TASTE: WHAT WORLD-CLASS MEANS HERE
Principles: (1) data is the hero, chrome is quiet; (2) every pixel has a reason; (3) restraint: one accent, one gradient, one ambient loop per view; (4) speed is a feature: perceived performance via skeletons, optimistic UI, instant navigation; (5) honesty builds trust: the interface always says where data came from and how fresh it is; (6) details compound: consistent 4px rhythm, optical alignment, perfect states.
KILL LIST (fail the rubric if any appears): generic purple-blue SaaS gradients; glassmorphism everywhere; neon glows; stock illustrations or 3D blobs; emoji as icons; centered-everything layouts; everything rounded 24px; drop shadows on everything; random accent colors; lorem ipsum; fake logo walls; "Unlock the power of"/"Seamless"/"Revolutionize" copy; carousels of testimonials; gradient text on more than the hero; cards inside cards inside cards; default browser scrollbars/selects/date pickers; layout jumps; spinners as page loaders; placeholder-as-label inputs; icon-only buttons without labels/tooltips; pure #000 or #fff.

## 4. DESIGN TOKENS
Reconcile into the existing Phase 0 token files; change values there only, never hardcode elsewhere. Adjust any value failing WCAG AA and record it in DECISIONS.md.
DARK (tinted cool neutrals): surface 0 #0B0D12, 1 #11141B, 2 #171B24, 3 #1E2330, 4 #262C3B. text 1 #ECEFF6, 2 #A4ACBE, 3 #7F879C. border subtle rgba(255,255,255,.06), default .10, strong .16. accent #7C8CFF (hover #94A1FF, pressed #6677F2), accent-soft rgba(124,140,255,.12). success/price-down #3DD68C, danger/price-up #FF6B73, warning #F0B24A, info #5BB5FF.
LIGHT (warm neutrals, designed independently, not inverted): surface 0 #F5F6F9, 1 #FFFFFF, 2 #FAFBFD, 3 #FFFFFF, 4 #FFFFFF. text 1 #12151C, 2 #4B5365, 3 #6B7388. border subtle rgba(18,21,28,.06), default .10, strong .18. accent #4457F0 (hover #3547E0, pressed #2B3BC7), accent-soft rgba(68,87,240,.10). success #16A064, danger #D93F4A, warning #B7791F, info #2B7FD1.
Also define: focus ring (2px accent + 2px surface offset, never clipped), text selection color (accent-soft with text 1), scrollbar styling (thin, tinted, themed), caret-color accent, color-scheme meta, themed meta theme-color, chart palette (6 colorblind-safe categorical colors tested under deuteranopia/protanopia, plus sequential and diverging ramps), overlay/scrim tokens, skeleton base/shimmer tokens, elevation tokens.
Semantics: price-down = green + down arrow + minus sign; price-up = red + up arrow + plus sign; never color alone. Accent only for primary actions, active nav, focus, best-price. One signature gradient (accent to a hue 30 degrees away, low saturation) ONLY on the hero headline, primary CTA hover, best-price badge. Soft accent glow (8-12% alpha) only behind hero and focus states.
Depth: surface 0 page, 1 cards, 2 popovers/menus, 3 dialogs/sheets, 4 command palette. Dark uses border alpha steps + 1px inner top highlight (rgba(255,255,255,.04)); light uses layered tinted shadows (3 layers, color-matched to text 1 at low alpha).
Spacing 4px base. Radius: 6 inputs/small, 10 cards, 16 dialogs, full pills. 12-column grid desktop, 4 mobile, max content widths per layout (app 1280, reading 680, landing 1200).
Density: provide Comfortable and Compact modes (user toggle, persisted) affecting row heights and padding via tokens.

## 5. TYPOGRAPHY
UI Geist; numerals Geist Mono with tabular-nums; display Instrument Serif ONLY for landing hero and major landing section headings. Load via next/font with size-adjusted fallbacks, preload only the used weights, font-display swap. Fluid scale with clamp(): display 40-72, h1 28-40, h2 22-28, h3 18-20, body 15-16, table 13-14, caption 12. Tight tracking (-0.02em) on large headings, line-height 1.1 headings / 1.5 body. text-wrap: balance on headings, pretty on paragraphs. Prices in mono, larger than surroundings, with the rupee sign slightly smaller and raised optically. Currency en-IN with lakh grouping (Rs 1,23,456); never abbreviate without a tooltip. Relative times ("verified 4 min ago") with exact timestamp on hover and in aria-label. Tabular alignment for all numeric columns, right-aligned.

## 6. BRAND, ICONS, ILLUSTRATION
One logo (mark + wordmark) legible at 16px, 32px and monochrome; favicon set (ico, svg, 180 apple-touch, 192/512 maskable), app icon, OG image template, safari pinned tab. The mark must be simple, geometric, ownable (a price-point/node motif is fine); construct it on a grid and document the construction.
Custom icon set on a 24px grid, one stroke width (1.5), one corner radius, currentColor, no emoji, no third-party icon libraries: compare, watchlist, alert, bell, price-drop, price-rise, extract, verified, fixture, stale, search, filter, sort, store, history, export, settings, billing, user, shield, check, close, chevrons, external-link, copy, trash, undo, plus, minus, menu, keyboard, sun, moon, lock, key, mail, calendar, info, warning, error. Micro-interactions: bell rings once on new notification; check draws itself (stroke-dashoffset); arrows nudge 2px on hover; search icon morphs to a spinner while loading; theme icon rotates between sun and moon.
Illustration: a small custom SVG set for empty/error/offline/404 states built from the same stroke language and tokens (themeable via currentColor and accent), calm and abstract (price lines, nodes, receipts), never cartoonish stock art.
Build /dev/icons (every icon at 16/20/24/32, both themes) and /dev/illustrations. Fix anything unclear at 16px.

## 7. MOTION SYSTEM
Durations: fast 120, base 200, slow 360, hero 600 (ms). Easings: ease-out-expo (entrances), ease-in-out-cubic (state change), spring stiffness 300 damping 30 (sheets, dialogs, drag). Animate only transform and opacity (clip-path/filter sparingly). Zero layout shift. Choreography principles: elements enter from the direction of their cause; exits are faster than entrances (about 70%); related elements stagger, unrelated ones never animate together; motion explains change, never decorates it.
Required patterns:
1. Page transitions: crossfade + 8px rise via View Transitions API with CSS fallback; shared-element transition from compare row to product page image and price.
2. List stagger 40ms steps, max 8 items, once per mount.
3. Number tick: odometer-style roll on price change, 600ms green/red flash that fades, plus arrow.
4. Skeleton-to-content crossfade; skeletons match final layout exactly; shimmer 1.6s, paused offscreen.
5. Ambient infinite loops (the living feel): hero background drifting gradient mesh or floating price points, 20-40s cycle; "Live" chip pulse dot (2s, opacity only); sparkline idle breathing in the landing demo. Rules: transform/opacity only, GPU-layered, paused by IntersectionObserver offscreen and on document.hidden, disabled under prefers-reduced-motion and reduced-data, max ONE ambient loop per viewport, measured cost under 2% Lighthouse performance (report with and without).
6. Charts: draw-in once on first view; hover scrub with crosshair and tooltip at 60fps; range-tab change morphs the line; keyboard scrub with arrow keys.
7. Buttons: press scale 0.97 over 80ms; primary hover gradient shift + 1px lift; loading = inline spinner preserving width; success draws a check for 600ms then reverts; irreversible destructive actions use hold-to-confirm (600ms radial fill). Variants primary, secondary, ghost, danger, icon, link, each fully specified in default/hover/active/focus-visible/disabled/loading.
8. Toasts: slide+fade, stack max 3, swipe to dismiss, pause on hover, undo support.
9. Command palette: scale 0.98 to 1 with backdrop fade, 20ms result stagger.
10. Realtime notification arrival: bell rings once, badge ticks, toast slides in, new row highlights then settles over 1.5s.
11. Theme toggle: 200ms circular reveal via View Transitions; zero flash on load.
12. Cards: hover lift 2px + border brighten; pressed state; focus ring never clipped.
13. Tabs: sliding indicator. Switches/checkboxes: spring thumb, check draw. Accordions: height via grid-rows trick, no layout thrash.
Hard rules: honor prefers-reduced-motion with a tested fallback (instant changes, no loops, no parallax); nothing blocks input; no animation over 600ms except ambient loops; document every animation and its purpose in docs/MOTION.md.

## 8. SIGNATURE MOMENTS (the unforgettable details; build all five and make them flawless)
1. "Search that feels telepathic": the hero search shows instant results as you type, highlights matched characters, shows typo correction inline ("Showing results for X"), and pre-warms the product page on hover/focus so navigation feels instant.
2. "The price line": on the product page the history chart draws in, the lowest-in-90-days point pulses once, and scrubbing shows a crosshair with the date, price, delta vs today, and which retailer, all tabular and jitter-free.
3. "Watch in one tap": tapping Watch morphs the button into a threshold sheet (shared-element), presets animate in, a live preview states "This would have fired 3 times in the last 90 days", and confirming plays the check draw plus a bell micro-ring.
4. "Alive but quiet": realtime price changes tick like an odometer with a brief colored flash; the freshness indicator breathes; everything else stays still.
5. "Command everything": Cmd/Ctrl-K opens a palette that can search products, jump anywhere, toggle theme and density, start a watch, and shows keyboard hints; every primary action in the app has a shortcut listed on "?".

## 9. SCROLL SYSTEM
CSS scroll-driven animations (animation-timeline: view()/scroll()) with IntersectionObserver fallback. No scroll-jacking, no smooth-scroll libraries that fight native scroll.
Global: thin accent scroll-progress bar on long pages; header gains blur + border after 8px; scroll-padding-top for anchors; scroll restoration on back navigation; overscroll-behavior contained in sheets/dialogs; scroll-snap only where specified.
Landing: section reveals (fade + 16px rise at 20% visibility, once); hero mockup parallax max 24px (transform only, off on mobile/reduced-motion); sticky "how it works" where three steps highlight in sequence as you scroll (sticky visual on one side, steps on the other, mobile stacks).
Compare: sticky table header and first column on horizontal scroll with edge shadows only when scrollable; sticky best-price summary bar that slides in after the hero card leaves view.
Product: sticky mini-header (thumb, price, Watch button) once the main price scrolls away; chart range tabs sticky on mobile.
Mobile: scroll-snap carousels with peeking next card; pull-to-refresh with a custom indicator on watchlist and notifications; bottom tab bar hides on scroll-down, returns on scroll-up.
Virtualize lists over 50 rows; infinite scroll with visible end-of-results state and preserved position; "back to top" button after 2 viewports.

## 10. APP SHELL AND NAVIGATION
Desktop: collapsible sidebar (icons-only collapsed with tooltips, persisted), top bar with search trigger, plan/usage meter, data-freshness indicator ("Fixture data" or "Live, verified 4m ago"), notification bell with realtime unread count, density + theme toggles, user menu. Mobile: top bar + bottom tab bar (Compare, Watchlist, Extract, Alerts, Me) with a sliding active pill and safe-area insets. Command palette (Cmd/Ctrl-K), breadcrumbs, skip link, landmarks, visible focus, full keyboard navigation, shortcut sheet on "?". Keyboard shortcuts: g then c/w/e/a for navigation, / to focus search, w to watch on a product page, t to toggle theme, [ to collapse sidebar.

## 11. PAGES (each: loaded, loading, empty, error, partial-data, stale-data states; forms with inline validation, disabled-until-valid, linked error summaries)
1. LANDING. Layout: hero (left-aligned headline in display serif, one-sentence subline, the search box as the primary element with example queries as chips, ambient mesh behind, small honest trust row: "Prices from N verified sources" only if true, else omit); interactive demo built from labeled sample data (compare table that reorders when you change a filter); how-it-works sticky scroll (Search, Watch, Get alerted); three feature blocks (Compare, Watch, Extract) each with a real built UI component, not an image; pricing teaser from real plan data; FAQ with real answers about data sources, freshness, privacy; footer with real links. Hero headline must be specific and plain (e.g. about finding the lowest real price and knowing when it drops), never buzzwords.
2. COMPARE. Sticky header with query, result count, sort, filter. Retailer rows: store, price (mono, large), delivery, seller, last-verified age, source-state chip, best-price badge with one-time shimmer. Filters inline on desktop (left rail or top bar), bottom sheet on mobile. Row reorder via FLIP. Compare mode up to 4 products with a sticky first column and diff highlighting ("differs" rows). Empty state suggests alternatives; stale state shows a banner with refresh.
3. PRODUCT. Above the fold server-rendered: image (LCP, priority), name, best price with delta vs 30-day average, best offer, source-state chip, Watch CTA. Below: lazy chart (7d/30d/90d/1y/all, min/max/avg annotations, lowest-in-90-days marker, scrub), offers table, specifications, price-drop history list. Watch sheet with presets (any drop, 5%, 10%, target price) and the 90-day preview.
4. WATCHLIST. Dense table on desktop (checkbox, product, sparkline, current, target (inline editable), delta, store, status), cards on mobile; multi-select bulk actions (pause, change target, delete) with undo toast; sort/filter/search; empty state with a single CTA.
5. ALERTS. Plain-language rule builder ("Tell me when [product] drops below [Rs amount] on [any store]") with inline token pickers and a live preview; rules list with toggles; notification center with grouped events (Today, Yesterday, Earlier), mark-all-read, filters; email template matching the app visually and verified in Inbucket.
6. EXTRACT. Three steps with a progress rail: (1) paste URL with validation and source-permission check; (2) point-and-select fields on a rendered preview with hover highlight, field tagging, and a side list of captured fields; (3) review/test with live row preview, per-field confidence meter, errors that say exactly what to fix. Saved extractors list with last-run status and a diff of what changed. Sources unverified or not permitted are blocked with a clear reason, and a test proves it.
7. AUTH + ONBOARDING. Magic-link login, clear check-your-inbox state with resend cooldown timer, 3-step onboarding ending with the user's first watched product (progress indicator, skippable but nudged, never a dead end).
8. PRICING + BILLING. Honest plan comparison (no fake "most popular" unless a real rule), usage meter, grace-period and downgrade states with unambiguous banners and a timeline, invoices list, clear cancel flow.
9. ADMIN. Real Supabase TOTP MFA enroll and challenge screens (QR, auto-advancing 6-digit input with paste support, recovery codes with copy/download), audit log table with filters.
10. SYSTEM. Custom 404, 500, offline, maintenance, settings (profile, notifications, density, theme, data export), and privacy/terms pages clearly labeled DRAFT, needing legal review.

## 12. INTERACTION CRAFT CHECKLIST
Buttons: labels are verb-first ("Watch this product"). Inputs: visible labels, helper text, inline validation on blur, error text with cause and fix, correct inputmode/autocomplete/type. Selects/menus/popovers: fully keyboard operable, typeahead, roving tabindex, Escape closes and restores focus. Tooltips: delay 400ms, never contain essential info, accessible via focus. Tables: sticky headers, resizable or sensible column widths, row hover, keyboard row navigation, sortable with aria-sort. Dialogs/sheets: focus trap, scroll lock, Escape, backdrop click, drag-to-dismiss on mobile sheets. Drag interactions have keyboard alternatives. Optimistic UI with rollback + toast for watch/unwatch/edit. Skeletons everywhere except inside buttons. Copy-to-clipboard with confirmation. Undo for destructive bulk actions. Cursor and hover states accurate (no pointer on non-interactive). Long text truncates with tooltip; no horizontal page scroll at 320px.

## 13. COPY BIBLE (docs/COPY_BIBLE.md, then follow it)
Voice: plain, specific, calm, a little dry. Short sentences. No hype. Always say what happened, why, and what to do next. Errors: cause + next step ("We couldn't reach this source. Try again in a minute, or watch it and we'll retry for you."). Empty states teach and offer one action. Numbers are concrete. Never use: seamless, revolutionize, unlock, supercharge, game-changing, leverage (verb), empower. Source honesty phrases: "Sample data", "Verified 4 min ago", "Source not verified yet". All microcopy lives in a central file for easy editing.

## 14. RUBRIC (score every slice; record in docs/RUBRIC_SCORES.md with one-line evidence per row)
Each row 0-5, total 100 = sum x (100/ (rows x 5)):
Visual hierarchy; typography craft; color and contrast discipline; spacing rhythm and alignment; iconography consistency; depth and surfaces; layout and responsiveness (320-1920); motion quality and restraint; reduced-motion behavior; state completeness (loading/empty/error/partial/stale); copy quality; data honesty (source chips, no fake data); accessibility (axe, keyboard, focus, aria); performance (CLS/LCP/INP); component consistency; delight (signature moments land); dark theme quality; light theme quality; mobile ergonomics (thumb reach, 44px targets); kill-list clean.
Any kill-list item caps the total at 70. Score honestly; inflated scores found by a later audit count as defects.

## 15. ENGINEERING STANDARDS
Component architecture: primitives -> patterns -> page sections -> pages; no one-off styling in pages; all values from tokens; Tailwind or CSS modules per existing stack, no mixed approaches. Server Components by default, client components only where interactive; code-split charts, command palette, extract preview. Error boundaries per route segment with branded error UI. Loading UI per segment (loading.tsx must exist at the root and per major segment, with tests that fail if missing). Strict TypeScript, no any in new code. Unit tests for formatters (currency, relative time), a11y tests, Playwright flows for each page's core path, visual regression with toHaveScreenshot on Linux baselines (docker or CI), 1% tolerance, OS in snapshot names. /dev/kit, /dev/icons, /dev/illustrations, /dev/motion routes (excluded from production build and sitemap).
Content-Security hygiene: no inline event handlers, no dangerouslySetInnerHTML without sanitization, no third-party scripts, no trackers.

## 16. PERFORMANCE, SEO, PWA BUDGETS
Mobile Lighthouse with SIMULATED throttling for /, /compare, a product page, /watchlist: Performance 90+, Accessibility 100, Best Practices 100, SEO 100, LCP under 1.8s, CLS under 0.05, INP under 200ms. Report real numbers; log any miss as a defect. JS per route reported; landing under 170KB gzipped. next/image with priority only on the LCP image; fonts preloaded. Per-page metadata, Open Graph and Twitter images, canonical URLs, sitemap, robots, JSON-LD only where truthful, web manifest and installable PWA basics, themed browser chrome color. Measure ambient loop cost with and without.

## 17. FINAL AUDIT (slice N, no new features)
1. Screenshot every route at 360/768/1440, dark and light, every state; assemble a contact sheet in docs/screens/.
2. Hostile senior design review: list every inconsistency in spacing, type, color, icon weight, motion, copy; fix them all; repeat until at most 3 minor issues remain.
3. Verify reduced-motion, forced-colors, keyboard-only, 200% zoom and 320px width on every route.
4. Run typecheck, lint, unit tests, full Playwright suite, axe, Lighthouse, bundle report; paste raw output summaries into docs/UI_STATE.md.
5. Re-score every page against the rubric; write docs/RUBRIC_SCORES.md final table.
6. Write docs/UI_STATE.md: what shipped, what is weak, what is UNVERIFIED, known defects, NEXT ACTION. Finalize docs/DESIGN_SYSTEM.md and docs/MOTION.md.
7. Final message: concise report of what was built, real metrics, rubric scores, honest weaknesses, and the three things you would improve next. Do not call your own output "world-class"; let the evidence speak.
