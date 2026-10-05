# SCRAPPY Motion & Scroll System Specification

> Motion explains causality; it never decorates. Every animation is intentional, physically grounded, and respects accessibility.

---

## 1. Tokens & Easings

| Duration Token | Value | Semantic Intent |
| :--- | :--- | :--- |
| `--motion-duration-instant` | `80ms` | Immediate micro-feedback (button presses, tab switches) |
| `--motion-duration-fast` | `140ms` | Small state transitions (hover highlights, tooltips, checkmarks) |
| `--motion-duration-base` | `220ms` | Component transitions (dropdowns, accordions, toast slide-in) |
| `--motion-duration-slow` | `360ms` | Large layout transitions (dialog overlays, sheet drawers) |
| `--motion-duration-hero` | `600ms` | Hero entrance choreographies and hold-to-confirm progress fills |

### Easings

- **Entrance**: `cubic-bezier(0.16, 1, 0.3, 1)` (ease-out-expo)
- **State Change / Standard**: `cubic-bezier(0.2, 0, 0, 1)`
- **Exit**: `cubic-bezier(0.4, 0, 1, 1)` (exits are ~30% faster than entrances)
- **Spring**: Stiffness 300, Damping 30 (dialogs, sheet drawers)

---

## 2. Reduced-Motion Policy

Strictly enforced via CSS and React hooks:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```
All ambient loops, parallax effects, and kinetic transforms are disabled when `prefers-reduced-motion: reduce` is active.

---

## 3. Choreography Principles

1. **Direction of Cause**: Elements enter from the direction of the action that caused them.
2. **Exits are Faster**: Exit animations run at ~70% of entrance durations.
3. **List Stagger**: 40ms stagger steps, capped at 8 items maximum, firing once per mount.
4. **Zero Layout Shift**: Transitions animate `transform` and `opacity` only. Never animate width, height, margin, or padding.
5. **Ambient Loops**: Maximum one ambient loop per viewport. Paused via `IntersectionObserver` when offscreen and on `document.hidden`.
