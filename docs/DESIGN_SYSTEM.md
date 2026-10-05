# SCRAPPY Design System Specification

> The visual and structural foundation of SCRAPPY: a precision data instrument with the soul of a calm, beautiful consumer product.

---

## 1. Principles

1. **Data is the Hero, Chrome is Quiet**: Interfaces fade into the background so prices, changes, and provenance stand out.
2. **Restraint**: Maximum one accent color, one gradient, and one ambient loop per viewport. No visual noise.
3. **Speed is a Feature**: Sub-100ms perceived interactions via shape-matched skeletons, optimistic state transitions, and instant navigation.
4. **Honesty Builds Trust**: Every single number has provenance (source, age, confidence). Fixture data is always labeled "Sample data".
5. **Details Compound**: Strict 4px spatial rhythm, optical alignment, and 100% WCAG 2.2 AA accessibility.

---

## 2. Color System & Contrast Law

Dual-theme system:
- **Dark Theme (Ink Scale)**: Tinted cool neutrals. Avoid pure `#000000`. Desaturate accents to prevent eye fatigue.
- **Light Theme (Paper Scale)**: Warm alabaster neutrals. Avoid pure `#FFFFFF` glare. Calibrated deep accents for high legibility.

### Surface Scale

| Level | Dark (Ink) | Light (Paper) | Semantic Purpose |
| :--- | :--- | :--- | :--- |
| `surface-0` | `#0A0C0F` / `#0B0D12` | `#FAF9F6` / `#F5F6F9` | Base canvas background |
| `surface-1` | `#0F1217` / `#11141B` | `#F3F1EC` / `#FFFFFF` | Primary containers & cards |
| `surface-2` | `#141922` / `#171B24` | `#EAE6DE` / `#FAFBFD` | Elevated surfaces & hover states |
| `surface-3` | `#1A202B` / `#1E2330` | `#DFDBD1` / `#FFFFFF` | Popovers, dropdown menus, cards |
| `surface-4` | `#222936` / `#262C3B` | `#D5D0C4` / `#FFFFFF` | Dialogs, sheets, high-contrast highlights |

### Text Scale

| Token | Dark (Ink) | Light (Paper) | Contrast on Surface-0 | Contrast on Surface-1 |
| :--- | :--- | :--- | :--- | :--- |
| `text-1` (Primary) | `#ECEFF6` | `#12151C` | > 14.0:1 (AAA) | > 13.0:1 (AAA) |
| `text-2` (Secondary) | `#98A2B3` / `#A4ACBE` | `#2D3748` / `#4B5365` | > 7.0:1 (AAA) | > 6.5:1 (AA) |
| `text-3` (Muted) | `#8492A6` / `#7F879C` | `#445166` / `#6B7388` | > 5.0:1 (AA) | > 4.6:1 (AA) |

### Accent & Semantics

| Token | Dark (Ink) | Light (Paper) | Rule |
| :--- | :--- | :--- | :--- |
| `color-accent` | `#C6F135` / `#7C8CFF` | `#384D00` / `#4457F0` | Primary actions, active nav, best-price only |
| `color-success` | `#32D59A` / `#3DD68C` | `#0A592E` / `#16A064` | Price decrease (always with down arrow & minus) |
| `color-danger` | `#FF7867` / `#FF6B73` | `#A71920` / `#D93F4A` | Price increase (always with up arrow & plus) |
| `color-warn` | `#FBB034` / `#F0B24A` | `#6D4200` / `#B7791F` | Warning / degraded state |
| `color-info` | `#66B1FF` / `#5BB5FF` | `#004285` / `#2B7FD1` | Informational indicator |

---

## 3. Typography System

- **UI Face**: `Inter` / `Geist Sans` via `next/font/google`
- **Numerals & Prices**: `JetBrains Mono` / `Geist Mono` with `font-variant-numeric: tabular-nums`
- **Display Face**: `Instrument Serif` (Landing hero and major marketing headings only)

### Fluid Scale

| Token | Range | Usage |
| :--- | :--- | :--- |
| `--text-xs` | `clamp(11px, 0.7rem, 12px)` | Metadata, badge counters, timestamps |
| `--text-sm` | `clamp(12px, 0.75rem, 13px)` | Data tables, form helper text |
| `--text-base` | `clamp(14px, 0.875rem, 15px)` | Body text, input contents |
| `--text-md` | `clamp(15px, 0.9375rem, 16px)` | UI buttons, navigation links |
| `--text-lg` | `clamp(17px, 1.0625rem, 19px)` | Subheadings, card titles |
| `--text-xl` | `clamp(20px, 1.25rem, 24px)` | Section headings |
| `--text-2xl` | `clamp(24px, 1.5rem, 30px)` | Page titles |
| `--text-3xl` | `clamp(30px, 1.875rem, 38px)` | Feature headings |
| `--text-4xl` | `clamp(36px, 2.25rem, 48px)` | Major headlines |
| `--text-5xl` | `clamp(44px, 2.75rem, 64px)` | Landing hero title |

---

## 4. Spacing & Shape Tokens

- **Base Grid**: 4px base (`--space-1`: 4px, `--space-2`: 8px, `--space-3`: 12px, `--space-4`: 16px, `--space-6`: 24px, `--space-8`: 32px, `--space-12`: 48px, `--space-16`: 64px, `--space-24`: 96px).
- **Corner Radii**:
  - `radius-none`: 0px
  - `radius-sm`: 2px (inputs, badges, chips)
  - `radius-md`: 4px (cards, buttons)
  - `radius-lg`: 8px (dialogs, sheets, modals)
  - `radius-full`: 9999px (pills, avatar)
- **Minimum Touch Target**: 44px min-height and min-width for all primary interactive tap areas (WCAG 2.2 AA SC 2.5.8).
