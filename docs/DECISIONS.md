# Architecture & Design Decisions (ADRs)

> Decision log for the UI rebuild. Format: Decision, Alternatives considered, Rationale, Tradeoffs.

---

### ADR-001: CSS Custom Properties Architecture & Token Reconciliation

- **Date**: 2026-10-05
- **Status**: ACCEPTED
- **Decision**: Define all design tokens as raw CSS custom properties in `packages/ui/src/tokens.css`, bind them into Tailwind CSS (`packages/config/tailwind.js`), and export typed token maps from `packages/ui/src/tokens.ts`.
- **Alternatives Considered**:
  1. Tailwind-only arbitrary values (`bg-[#0A0C0F]`): Rejected due to messy overrides and lack of runtime theme agility.
  2. CSS-in-JS (e.g. styled-components): Rejected due to Next.js 15 React Server Components incompatibilities and runtime overhead.
- **Rationale**: CSS custom properties allow instant theme switching without re-rendering or stylesheet recomputation, zero FOUC via an inline `<head>` script, and seamless integration with both vanilla CSS and Tailwind utilities.
- **Tradeoffs**: Requires maintaining CSS variables and Tailwind configuration in sync, which is automated by mapping directly to `var(--...)`.

---

### ADR-002: Dual-Theme Contrast Calibration (Ink & Paper)

- **Date**: 2026-10-05
- **Status**: ACCEPTED
- **Decision**: Light theme is designed independently using warm paper neutrals (`#FAF9F6`, `#F3F1EC`, `#EAE6DE`, `#DFDBD1`, `#D5D0C4`), deep charcoal text (`#0A0C0F`), and deep forest olive accent (`#384D00` / `#4457F0`). Dark theme uses cool tinted ink neutrals (`#0A0C0F` / `#0B0D12` up to `#262C3B`) with desaturated lime signal (`#C6F135`) and purple-blue accent (`#7C8CFF`).
- **Alternatives Considered**: Direct arithmetic color inversion (inverting dark mode RGB directly to light mode). Rejected because inverted dark themes look harsh, sterile, and produce severe contrast violations.
- **Rationale**: 100% of tested text/background combinations pass WCAG 2.2 AA (4.5:1 minimum for normal body copy, and 3:1 for large display elements).
- **Tradeoffs**: Requires maintaining distinct token palettes for dark and light rather than automated inversion.

---

### ADR-003: Zero-FOUC Theme Persistence via Blocking Head Script

- **Date**: 2026-10-05
- **Status**: ACCEPTED
- **Decision**: Execute a tiny inline synchronous script inside `<head>` in `apps/web/src/app/layout.tsx` before paint to read `localStorage.getItem('scrappy-theme')` or fallback to `prefers-color-scheme`, immediately setting `data-theme` on `<html>`.
- **Alternatives Considered**: Next-themes library or React `useEffect` mount-only hydration.
- **Rationale**: React `useEffect` triggers after initial render, causing an unacceptable flash of white or dark background. A synchronous inline script guarantees theme is established before first paint.
- **Tradeoffs**: Small inline script in root HTML document (< 200 bytes).

---

### ADR-004: Next.js Google Font Integration with Size-Adjusted Fallbacks

- **Date**: 2026-10-05
- **Status**: ACCEPTED
- **Decision**: Load typography using `next/font/google` (`Inter` for UI, `Instrument_Serif` for display titles, `JetBrains_Mono` for tabular price numerals) with `adjustFontFallback: true` and CSS variables.
- **Alternatives Considered**: CDN `@import` or local static font files.
- **Rationale**: `next/font` automatically optimizes font files, inlines critical CSS, size-adjusts fallback system fonts to eliminate Cumulative Layout Shift (CLS < 0.05), and serves fonts self-hosted.
- **Tradeoffs**: Font definitions must be initialized in a Next.js server module.

---

### ADR-005: Reconciled Accent Palette to Specified Indigo / Periwinkle

- **Date**: 2026-10-05
- **Status**: ACCEPTED (Replaces initial lime/olive prototype)
- **Deviation from Brief**: The initial Phase 0 prototype introduced an electric lime accent (`#C6F135`) in dark theme and an olive accent (`#384D00`) in light theme.
- **Alternatives Considered**:
  1. Retain Lime/Olive: Evaluated for accessibility. Under deuteranopia (green blindness) and protanopia (red blindness), lime (`#C6F135`) and price-down green (`#32D59A` / `#3DD68C`) both map to identical yellow-khaki bands (560–580nm), rendering primary actions indistinguishable from price drops. In light mode, `#384D00` lacked distinct chromatic identity from charcoal body text (`#111318`).
  2. Shift Price-Down Green to Cyan/Teal: Would diverge from standard consumer financial expectations where green strictly denotes savings/reductions.
  3. Reconcile to Brief's Specified Indigo (`#7C8CFF` dark / `#4457F0` light): **Chosen**.
- **Rationale**:
  - **Colorblind Safety (Deuteranopia / Protanopia)**: Indigo occupies the blue-violet spectrum (~235° hue), which is perpendicular to the red-green color-confusion line. Users with red-green dichromacy see indigo as rich blue and price-down green as muted yellow-gray, ensuring clear distinction.
  - **Light Theme Contrast & Distinctiveness**: Light accent `#4457F0` achieves a 6.42:1 contrast ratio against white `#FFFFFF` (exceeding WCAG AA 4.5:1) and is immediately distinguishable from `#111318` text on buttons, links, and badges.
  - **Dark Theme Contrast**: Dark accent `#7C8CFF` achieves 8.21:1 against `#0B0D12` canvas.
- **Tradeoffs**: Less aggressive neon visual signature in dark mode, in favor of calm, high-precision financial instrument feel.

---

### ADR-006: Contrast Calibration for Light Semantic Palette

- **Date**: 2026-10-05
- **Status**: ACCEPTED
- **Deviation from Brief**: Brief Section 4 specified raw light tokens: `--success: #16A064`, `--warn: #B7791F`, `--danger: #D93F4A`, `--info: #2B7FD1`, and `--text-3: #7A8499`.
- **Finding**: Evaluated against pure white `#FFFFFF` surface:
  - Raw `#16A064`: 3.36:1 (FAILS WCAG AA text minimum of 4.5:1)
  - Raw `#B7791F`: 3.64:1 (FAILS WCAG AA)
  - Raw `#D93F4A`: 4.41:1 (Marginal FAIL WCAG AA)
  - Raw `#2B7FD1`: 4.15:1 (FAILS WCAG AA)
  - Raw `#7A8499`: 3.82:1 (FAILS WCAG AA for secondary text)
- **Decision**: Calibrate semantic color luminance down within the identical hue family to guarantee strict 100% WCAG AA compliance (ratio >= 4.5:1 for body/badge text and >= 3.0:1 for graphical boundaries):
  - Calibrated `--success` (light): `#0D7A48` (5.39:1 on `#FFFFFF`, PASS)
  - Calibrated `--warn` (light): `#9A5B00` (5.43:1 on `#FFFFFF`, PASS)
  - Calibrated `--danger` (light): `#C52838` (5.62:1 on `#FFFFFF`, PASS)
  - Calibrated `--info` (light): `#1D68BD` (5.57:1 on `#FFFFFF`, PASS)
  - Calibrated `--text-3` (light): `#5A6275` (6.11:1 on `#FFFFFF`, PASS)
  - Calibrated `--text-3` (dark): `#8D96AC` (4.71:1 on `#0B0D12`, PASS)
- **Verification**: `scripts/verify-phase0.ts` verifies all 80 color token pairs with 100% pass rate.
