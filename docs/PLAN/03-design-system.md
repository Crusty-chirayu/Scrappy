# 03 — Design System

> @scrappy/ui and @scrappy/brand: complete design language specification

---

## Design Token System

### Color Tokens

All defined as CSS custom properties, re-exported as Tailwind v4 theme tokens. Every pair tested by a CI contrast script; failing pairs block merge.

#### Ink Scale (Dark Surfaces)

```css
--color-ink-950: #0a0c0f; /* Darkest background */
--color-ink-900: #0f1217; /* Primary dark surface */
--color-ink-850: #141922; /* Elevated dark surface */
--color-ink-800: #1a202b; /* Card on dark */
--color-ink-700: #262e3c; /* Hairline / border on dark */
--color-ink-500: #5b677c; /* Placeholder, muted text on dark */
--color-ink-300: #98a2b3; /* Secondary text on dark */
--color-ink-100: #d6dbe3; /* Primary text on dark */
```

#### Paper Scale (Light Surfaces)

```css
--color-paper-50: #faf9f6; /* Lightest background */
--color-paper-100: #f3f1ec; /* Primary light surface */
--color-paper-200: #e8e5dd; /* Elevated light surface */
--color-paper-300: #d3cfc3; /* Hairline / border on light */
```

#### Signal (Brand Accent — "live, actionable")

```css
--color-signal-400: #c6f135; /* Dark mode primary accent */
--color-signal-600: #5e7a00; /* Light mode text/accent on paper */
--color-signal-ink: #0a0c0f; /* Text on signal backgrounds */
```

**Rule**: Signal occupies < 5% of any screen. Used ONLY for: live data dots, actionable CTAs, brand mark node.

#### Semantic Colors

```css
--color-price-down: #2fbf8a; /* Price decreased — always with arrow */
--color-price-up: #f2685b; /* Price increased — always with arrow */
--color-warn: #f5b544; /* Warning states */
--color-info: #5aa9ff; /* Info states */
--color-stale: #8b93a3; /* Stale data — dimmed */
--color-uncertain: #9a7bff; /* Possible match (dashed violet) */
```

**Rule**: Price direction colors ALWAYS paired with an arrow or +/- sign. Never color alone.

#### Contrast Table (WCAG 2.2 AA requirement: 4.5:1 for normal text, 3:1 for large)

| Foreground           | Background           | Ratio  | Status   |
| -------------------- | -------------------- | ------ | -------- |
| ink-100 (#D6DBE3)    | ink-950 (#0A0C0F)    | 14.8:1 | PASS AAA |
| ink-100 (#D6DBE3)    | ink-900 (#0F1217)    | 13.2:1 | PASS AAA |
| ink-100 (#D6DBE3)    | ink-800 (#1A202B)    | 10.6:1 | PASS AAA |
| ink-300 (#98A2B3)    | ink-950 (#0A0C0F)    | 7.9:1  | PASS AA  |
| ink-300 (#98A2B3)    | ink-900 (#0F1217)    | 7.1:1  | PASS AA  |
| signal-400 (#C6F135) | ink-950 (#0A0C0F)    | 12.4:1 | PASS AAA |
| signal-ink (#0A0C0F) | signal-400 (#C6F135) | 12.4:1 | PASS AAA |
| price-down (#2FBF8A) | ink-950 (#0A0C0F)    | 6.2:1  | PASS AA  |
| price-up (#F2685B)   | ink-950 (#0A0C0F)    | 4.8:1  | PASS AA  |
| paper-50 (#FAF9F6)   | signal-600 (#5E7A00) | 5.9:1  | PASS AA  |
| ink-950 (#0A0C0F)    | paper-50 (#FAF9F6)   | 19.4:1 | PASS AAA |
| ink-500 (#5B677C)    | paper-50 (#FAF9F6)   | 4.6:1  | PASS AA  |

**CI Script**: `packages/config/scripts/check-contrast.ts` — reads all token pairs from `contrast-pairs.json`, checks with wcag-contrast library, exits 1 on any failure.

---

## Typography Tokens

### Font Families

```css
--font-sans: "Geist", system-ui, sans-serif; /* UI, body */
--font-mono: "Geist Mono", monospace; /* Prices, numbers, code */
--font-display: "Instrument Serif", serif; /* Marketing display only, italic accent */
```

**Rule**: `font-variant-numeric: tabular-nums` applied to all elements rendering prices and numeric data.

### Type Scale (1.2 ratio, fluid via clamp)

```css
--text-xs: clamp(11px, 0.7rem + 0.2vw, 12px); /* Metadata, timestamps */
--text-sm: clamp(12px, 0.8rem + 0.2vw, 13px); /* Data tables, chips */
--text-base: clamp(14px, 0.9rem + 0.2vw, 15px); /* Body text */
--text-md: clamp(15px, 1rem + 0.2vw, 16px); /* UI labels */
--text-lg: clamp(16px, 1.1rem + 0.3vw, 18px); /* Section headings */
--text-xl: clamp(18px, 1.2rem + 0.4vw, 22px); /* Page headings */
--text-2xl: clamp(22px, 1.5rem + 0.6vw, 28px); /* H2 */
--text-3xl: clamp(28px, 2rem + 0.8vw, 36px); /* H1 */
--text-4xl: clamp(36px, 2.5rem + 1vw, 48px); /* Display */
--text-5xl: clamp(48px, 3.5rem + 1.5vw, 64px); /* Hero display */
```

### Line Heights

- Body text: 1.5
- Data tables: 1.35
- Headings: 1.1
- Display: 1.05

### Price Rendering Rules

- Currency symbol (INR / ₹): dimmed to 60% opacity
- Paise (decimal): de-emphasized, smaller (text-sm)
- Amount: Geist Mono, tabular-nums, full weight

---

## Space and Shape Tokens

### Spacing (4px base grid)

```css
--space-0: 0px;
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
--space-24: 96px;
```

### Border Radius

```css
--radius-sm: 2px; /* Inputs, chips, badges */
--radius-md: 4px; /* Cards, buttons */
--radius-lg: 8px; /* Dialogs, drawers */
```

NO giant rounded corners (> 8px).

### Borders

- Primary separator: 1px hairline (`--color-ink-700` on dark, `--color-paper-300` on light)
- Shadows only for overlays (dialogs, menus, command palette): `0 8px 24px rgba(0,0,0,0.4)` on dark

### Layout

- 12-column grid
- Max content width: 1280px
- App shell: fluid
- Breakpoints: 480px / 768px / 1024px / 1280px / 1536px

---

## Motion Tokens

```ts
export const duration = {
  instant: 80,
  fast: 140,
  base: 220,
  slow: 360,
  chart: 480,
} as const;

export const easing = {
  standard: "cubic-bezier(.2,0,0,1)",
  exit: "cubic-bezier(.4,0,1,1)",
  emphasized: "cubic-bezier(.16,1,.3,1)",
} as const;

export const spring = {
  drawerPalette: { stiffness: 420, damping: 36 },
} as const;
```

**Reduced-motion policy**: When `prefers-reduced-motion: reduce` OR in-app toggle enabled OR tab hidden OR battery saver OR > 60 simultaneous animating elements: replace transforms with opacity-only at 80ms. Disable rolls, pulses, parallax. Implemented via `useReducedMotion()` hook in @scrappy/ui.

---

## Component Inventory

Each component ships with: all states, keyboard behavior, ARIA, docs page at `/design/[component]`, visual regression baseline, axe test.

### Form Controls

| Component | Key States                                           | Notes                              |
| --------- | ---------------------------------------------------- | ---------------------------------- |
| Button    | default, hover, active, disabled, loading, icon-only | Loading shows spinner, keeps width |
| Input     | default, focus, filled, error, disabled              | 2px radius                         |
| Textarea  | default, focus, error, character-count               | Auto-grow option                   |
| Select    | default, open, selected, disabled                    | Native on mobile                   |
| Combobox  | default, open, searching, selected, multi-select     | Virtualized options                |
| Checkbox  | unchecked, checked, indeterminate, disabled          | 16px touch target min              |
| Radio     | unchecked, checked, disabled                         | Always in RadioGroup               |
| Switch    | off, on, disabled                                    | Announces state change             |
| Slider    | default, dragging, disabled                          | Price range: dual handle           |

### Feedback & Status

| Component     | States                                                                               | Notes                                |
| ------------- | ------------------------------------------------------------------------------------ | ------------------------------------ |
| TrustBadge    | Fresh / Stale / Verified / Estimated / Matched / Possible-match / Source-unavailable | Confidence popover on hover/focus    |
| SourceChip    | logo + health dot (Healthy/Degraded/Offline)                                         | Max 24px logo                        |
| PriceTag      | price + delta + direction arrow                                                      | Always direction symbol + color      |
| Sparkline     | loading, data, no-data, flat                                                         | 40x24px inline                       |
| DataFreshness | Live-ticking ("Updated 12 min ago")                                                  | Pauses when tab hidden               |
| Toast         | info, success, warning, error, with-undo                                             | Undo within 5s, keyboard dismissible |
| Badge         | count, label, dot                                                                    | Max count: 99+                       |
| Progress      | linear, indeterminate                                                                | No circular in MVP                   |
| Skeleton      | shape-matched per content type                                                       | 80ms delay before showing            |

### Navigation

| Component         | States                                     | Notes                                    |
| ----------------- | ------------------------------------------ | ---------------------------------------- |
| Tabs              | default, active, disabled                  | Keyboard arrow nav                       |
| Breadcrumbs       | default, truncated                         | Schema.org markup                        |
| Sidebar           | default, collapsed, mobile-drawer          | Icon rail when collapsed                 |
| TopBar            | default, scrolled                          | Blur on scroll is NOT used (performance) |
| WorkspaceSwitcher | open, loading, error                       | Keyboard-navigable dropdown              |
| CommandPalette    | closed, open, searching, loading, selected | Cmdk library; 50ms open budget           |
| Kbd               | single, combo                              | `<kbd>` elements                         |

### Data Display

| Component  | States                                                                | Notes                                 |
| ---------- | --------------------------------------------------------------------- | ------------------------------------- |
| Table      | default, loading, empty, selected-rows, column-resize, density-toggle | Virtualized > 100 rows; sticky header |
| EmptyState | icon + title + description + action                                   | Never "N/A" without action            |
| ErrorState | error + retry + alternative                                           | Always offer a recovery path          |
| Stat       | value + label + trend                                                 | Tabular nums                          |
| Timeline   | event list, loading                                                   | Used in run pages, match history      |
| DiffView   | added/removed/unchanged lines                                         | Used in schema drift reports          |
| CodeBlock  | default, copy button, copied                                          | Prism highlight                       |

### Charts (visx)

All charts: hairline axes, no gridline clutter, mono tick labels, end-of-line direct labels. Keyboard-scrubbable. "View as table" always present. Animate-in on first paint 480ms. Reduced-motion = none.

| Chart           | Use Case                                | Notes                               |
| --------------- | --------------------------------------- | ----------------------------------- |
| PriceHistory    | step-line (prices are discrete events)  | min/max/median bands; event markers |
| MarketStrip     | dot-strip/beeswarm of competitor prices | Your price marked distinctly        |
| AvailabilityBar | segmented timeline                      | OOS/In-stock/Unknown segments       |
| UsageBar        | thin bars with budget line              | Records, browser minutes, etc.      |

---

## Logo System (@scrappy/brand)

### Symbol Concept: "The Convergence"

Three thin traces (2px stroke at 32px) enter from left at different heights — representing the messy web — bend, and converge into a single bold node that forms the counter of a stylized lowercase "s". The node is the ONLY element in Signal color (#C6F135 dark / #5E7A00 light).

### Asset Set

All in `/packages/brand/assets/`, exported to `/apps/web/public/`:

| Variant            | Files                                                                   |
| ------------------ | ----------------------------------------------------------------------- |
| Primary horizontal | symbol + wordmark                                                       |
| Stacked            | symbol above wordmark                                                   |
| Symbol only        | scrappy-symbol.svg                                                      |
| Wordmark only      | scrappy-wordmark.svg                                                    |
| Color modes        | light, dark, monochrome-ink, monochrome-paper, signal-on-ink            |
| Small (16px)       | 2 traces, thicker stroke (optical correction)                           |
| Favicon            | favicon.svg (prefers-color-scheme), favicon.ico, apple-touch-icon 180px |
| PWA                | android-192.png, android-512-maskable.png, safari-pinned-tab.svg (mono) |
| Social             | avatar-400x400.png, OG template (1200x630 via @vercel/og with tokens)   |

### Animated Mark (`<ScrappyMark state="...">`)

React component. < 4KB gz. GPU-friendly transforms and stroke-dashoffset only.

| State           | Animation                                                                                                                              |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| idle            | Node scale 1->1.06->1, 3.2s ease-in-out; traces static                                                                                 |
| hover           | Traces send single pulse toward node (stroke-dashoffset sweep, 360ms)                                                                  |
| loading         | Continuous scan: pulse travels each trace staggered (120ms offset)                                                                     |
| success         | Traces snap-converge 220ms, node expands to ring, tick-draw                                                                            |
| startup         | Traces draw in staggered from left (80ms apart), converge, node ignites, wordmark fades up 8px. Max 900ms, skippable, once per session |
| page-transition | Mark shrinks into top-left slot, content cross-fades, 260ms                                                                            |
| error           | Node dims to ink-500, one trace breaks (gap), 1-cycle shake 140ms                                                                      |
| reduced-motion  | Static frames, opacity-only state changes                                                                                              |

### Brand Showcase Page

Internal at `/brand` — every variant on light/dark/mono backgrounds, minimum-size tests (must be crisp at 16/32/64/512px), motion state playground, contrast verification.

### Clear-Space Rules

Documented in `/docs/brand/logo.md`:

- Minimum clear space: 1x height of the symbol on all sides
- Minimum size: 16px (use 2-trace optical variant)
- Never: rotate, recolor traces, change node color, use on low-contrast background without mono variant

---

## Design System Package Structure

```
packages/
  ui/
    src/
      components/      # All component source files
      charts/          # visx chart components
      hooks/           # useReducedMotion, useMediaQuery, etc.
      tokens/          # CSS vars, TS token exports
      theme/           # Tailwind v4 preset
      lib/             # Utility functions (cn, etc.)
    stories/           # Visual docs / component stories (for visual regression)
    tests/             # axe tests per component
  brand/
    assets/            # All SVG/PNG brand assets
    components/        # ScrappyMark, ScrappyLogo React components
    templates/         # OG image templates
```

---

## Visual Regression and Quality Gates

- Storybook visual snapshots via Playwright for every component in every state (light + dark)
- Baseline committed to `/packages/ui/stories/__snapshots__/`
- axe runs against every story: zero violations required
- Contrast script: CI fails on any registered pair falling below threshold
- Lighthouse a11y: 100 on the `/design` page
