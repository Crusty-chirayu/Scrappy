# DESIGN SYSTEM SPECIFICATION: "SIGNAL" (v2)

> Single Source of Truth for tokens, typography, motion, geometry, components, and design contracts.

---

## 1. Brand Concept & Grammar
- **Brand Essence**: A precision intelligence instrument crossed with premium software. Calm, fast, exact, alive.
- **Brand Mark**: A single-stroke 's' ribbon on a 48x48 precision coordinate grid whose lower terminal resolves into a filled signal node: *Messy web data flowing into one trusted coordinate point*.
- **Mark Variants**:
  - `SignalMark`: SVG component legible from 16px to 256px.
  - `SignalWordmark`: Clean vector outlined wordmark (zero font dependency).
  - `SignalLogo`: Responsive lockup (`mark` + `wordmark`).

---

## 2. Color System & Contrast Proofs
- **WCAG 2.2 AA Compliance**: Strictly verified via `scripts/verify-token-contrast.ts` with 0 failures (minimum 4.5:1 text, 3:1 UI).

### Dark Theme ("Midnight")
- **Canvas (`--surface-0`)**: `#07080D`
- **Raised Container (`--surface-1`)**: `#0D0F17`
- **Overlay Surface (`--surface-2`)**: `#12151F`
- **Card Surface (`--surface-3`)**: `#1A1E2B`
- **Dialogs / Popovers (`--surface-4`)**: `#242938`
- **Hairline Border (`--border-subtle`)**: `rgba(255, 255, 255, 0.07)`
- **Strong Border (`--border-strong`)**: `rgba(255, 255, 255, 0.12)`
- **Primary Text (`--text-1`)**: `#F4F5F8` (16.88:1 on canvas)
- **Secondary Text (`--text-2`)**: `#A3A9B8` (8.54:1 on canvas)
- **Tertiary Text (`--text-3`)**: `#7C8397` (6.56:1 on canvas)
- **Signal Accent (`--color-accent`)**: `#6C5CFF` (Electric indigo-violet)
- **Companion Glow**: Cyan `#38E8FF` (Used *only* in gradients on logo, hero glow, and focus moments).

### Light Theme ("Daylight")
- **Canvas (`--surface-0`)**: `#F7F7F4` (Warm paper, not stark white)
- **Raised Container (`--surface-1`)**: `#FFFFFF`
- **Overlay Surface (`--surface-2`)**: `#F0F0EB`
- **Hairline Border (`--border-subtle`)**: `rgba(10, 12, 20, 0.06)`
- **Primary Text (`--text-1`)**: `#0B0D14` (16.90:1 on canvas)
- **Secondary Text (`--text-2`)**: `#4A5163` (7.13:1 on canvas)
- **Tertiary Text (`--text-3`)**: `#6B7285` (5.65:1 on canvas)
- **Signal Accent (`--color-accent`)**: `#4457F0` (5.43:1 on canvas)

### Semantic Colors (Paired with Icons & Signs)
- **Price Down / Success**: `#2FBF8A` (Dark) / `#0D7A48` (Light)
- **Price Up / Destructive**: `#F2685B` (Dark) / `#C52838` (Light)
- **Warn / Stale**: `#F5B544` (Dark) / `#9A5B00` (Light)
- **Info**: `#5AA9FF` (Dark) / `#1D68BD` (Light)
- **Uncertain / Conflict**: `#9A7BFF` (Dark) / `#6C5CFF` (Light)

---

## 3. Typography & Hierarchy
- **Display**: `Bricolage Grotesque` (weight 600, opsz enabled, tracking `-0.035em`, line-height `1.02`), headings only.
- **Hero Accent**: `Instrument Serif` italic (applied to at most ONE word in the hero headline).
- **UI / Body**: `Geist Sans` (400 / 500). Max weight 600 anywhere in the system.
- **Numbers / Prices / IDs / Code**: `Geist Mono` with `tabular-nums` (`font-variant-numeric: tabular-nums`).
- **Scale**:
  - H1: `clamp(36px, 5vw, 64px)`
  - H2: `clamp(24px, 3vw, 36px)`
  - App UI: `13px` / `14px`
  - Body: `15px`
  - Max line length: `62ch`

---

## 4. Spacing, Shapes & Elevation
- **Grid**: Strict 4px base (`4`, `8`, `12`, `16`, `24`, `32`, `48`, `64`, `96px`).
- **Radii**:
  - Controls & Inputs: `6px` (`--radius-sm`)
  - Cards: `10px` (`--radius-md`)
  - Sheets & Hero Panels: `16px` (`--radius-lg`)
  - Full: `9999px` (`--radius-full`, pills only)
- **Control Heights**:
  - Compact: `28px`
  - App Default: `32px`
  - Marketing: `40px`
  - Hero Search: `52px`
  - Minimum touch target on touch devices: `44px`
- **Surfaces & Depth**:
  - 1px inner top-highlight on raised cards.
  - Soft radial ambient glow behind heroes and primary telemetry charts (pure CSS radial gradients, zero blur on large layouts).
  - Hairlines over heavy drop shadows; shadows reserved for floating overlays.

---

## 5. Motion Tokens & Physics
- **Tokens**:
  - Instant: `90ms`
  - Fast: `150ms`
  - Base: `240ms`
  - Slow: `420ms`
  - Chart Draw: `700ms`
- **Curves**:
  - Out-Expo: `cubic-bezier(0.16, 1, 0.3, 1)`
  - Standard: `cubic-bezier(0.2, 0, 0, 1)`
  - Spring: `{ stiffness: 420, damping: 34 }`
- **Reduced Motion**: Under `prefers-reduced-motion: reduce`, all transitions collapse to opacity-only `80ms`, no parallax, no count-ups, no continuous loops.

---

## 6. Curated Category Silhouettes (4:3)
Vector silhouettes built from 3–5 geometric shapes with top-left directional lighting and soft floor contact shadows:
1. `Smartphones`: Bezel frame, screen, dynamic island, home bar.
2. `Laptops`: Precision display shell, chassis base, trackpad.
3. `Audio`: Continuous curved headband, angled earcups, plush cushions.
4. `Smartwatches`: Bezel dial, crown, silicone loop straps.
5. `Televisions`: Ultra-thin bezel panel, dual cantilever stand legs.
6. `Footwear`: Streamlined midsole curve, upper contour, collar opening.
7. `Appliances`: Structured chassis, display module, rotary adjustment dial.
8. `Grocery Staples`: Standing gusset pouch, heat-sealed header, certification seal.

---

## 7. Copy Budget & Word Density Law
Strict word ceilings enforced per route by automated CI gate `scripts/copy-budget.ts`:
- Landing (`/`): ≤ 350 words
- Compare (`/compare`): ≤ 160 words
- Product Detail (`/compare/[id]`): ≤ 240 words
- Intelligence (`/intelligence`): ≤ 220 words
- Extract Studio (`/extract`): ≤ 220 words
- Auth (`/auth/login`, `/auth/signup`): ≤ 80 words
- Settings (`/settings`): ≤ 200 words

---

## 8. Automated Verification Suite Matrix
- `e2e/fonts-tokens.spec.ts`: Asserts body=Geist Sans, h1=Bricolage Grotesque, price=Geist Mono, zero Inter/JetBrains Mono traces, ≤ 3 font file requests on landing, theme toggle persistence across navigation.
- `scripts/no-raw-colors.ts`: Audits all 56 `.tsx` route files; guarantees 0 raw hex color violations.
- `scripts/copy-budget.ts`: Enforces strict route copy word ceilings.
- `e2e/ux-hardening.spec.ts`: Audits 360px zero horizontal overflow across 17 routes, 44x44 CSS px touch target minimum, keyboard focus-visible indicator ring, and motion suppressions under reduced motion.
- `e2e/axe.spec.ts`: Automated WCAG 2.2 AA audit on every route across Midnight (Dark) and Daylight (Light) themes.

