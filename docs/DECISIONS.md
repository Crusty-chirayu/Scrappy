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
