# SCRAPPY — UI Before & After Improvements

**Task Ref**: A4 (UI Fixes & Polish)  
**Standard**: Constitution Design Law, Prompt 02/03/09/11/12/16, WCAG 2.2 AA (44px touch targets).

---

## 1. Summary of Changes

| Area | Before A4 | After A4 | Spec Reference |
| :--- | :--- | :--- | :--- |
| **Brand Mark Geometry** | Basic concentric circles & generic spinner. Did not match "The Convergence" motif. | Hand-crafted SVG with 3 distinct incoming traces (`M 4 9`, `M 4 16`, `M 4 23`) converging into the single precision signal node `(16, 16)`. | Prompt 03: "The Convergence" |
| **Mark States & Reduced Motion** | Pulse and spin animations lacked `motion-reduce` overrides. | All 7 states (`idle`, `loading`, `fetching`, `success`, `error`, `drift`, `circuit-broken`) with `motion-reduce:animate-none`. | Prompt 02 & Constitution Rule 9 |
| **Loading State** | Skeleton lines only (`loading.tsx`), no animated mark. | Prominently displays animated `<ScrappyLogo state="loading" size={28} />` with telemetry description. | A3 Audit Requirement |
| **Error Boundary** | Generic warning triangle icon in `ErrorState.tsx`. | Replaced with `<ScrappyLogo state="error" size={36} />` featuring broken trace with gap. | A3 Audit Requirement |
| **Light & Dark Themes** | Hardcoded `#0A0C0F` dark mode; light mode completely missing. | Dual-theme system supporting Ink Scale (dark, `#0A0C0F` / `#C6F135`) and Paper Scale (light, `#FAF9F6` / `#5E7A00`) with hairline borders `#262E3C` / `#D3CFC3`. | Prompt 02: Color Tokens |
| **Theme Switching** | No user control for theme. | Added `<ThemeToggle />` button in top bar with persistence in `localStorage` and `data-theme` attribute. | A3 Audit Requirement |
| **Mobile Tap Targets (360px)** | Navigation items were 28px - 32px height, violating touch target accessibility budgets. | All interactive navigation controls enforce `min-h-[44px] min-w-[44px]`. | WCAG 2.2 AA (2.5.8) |
| **Mobile Navigation (360px)** | Navigation bar collapsed into horizontal scroll rail at the top. | Dedicated fixed bottom navigation bar on mobile viewports (<640px) with 44px tap targets for Compare, Intel, Extract, Docs, and Config. | A3 Audit Requirement |

---

## 2. Screenshot Inventory (`/docs/screenshots/`)

All 13 routes captured at 1280px (Desktop) and 360px (Mobile) in both **Dark** and **Light** modes:

1. `home-1280px-dark.png` / `home-1280px-light.png` / `home-360px-dark.png` / `home-360px-light.png`
2. `compare-1280px-dark.png` / `compare-1280px-light.png` / `compare-360px-dark.png` / `compare-360px-light.png`
3. `product-detail-1280px-dark.png` / `product-detail-1280px-light.png` / `product-detail-360px-dark.png` / `product-detail-360px-light.png`
4. `extract-1280px-dark.png` / `extract-1280px-light.png` / `extract-360px-dark.png` / `extract-360px-light.png`
5. `intelligence-1280px-dark.png` / `intelligence-1280px-light.png` / `intelligence-360px-dark.png` / `intelligence-360px-light.png`
6. `settings-1280px-dark.png` / `settings-1280px-light.png` / `settings-360px-dark.png` / `settings-360px-light.png`
7. `docs-1280px-dark.png` / `docs-1280px-light.png` / `docs-360px-dark.png` / `docs-360px-light.png`
8. `status-1280px-dark.png` / `status-1280px-light.png` / `status-360px-dark.png` / `status-360px-light.png`
9. `legal-terms-1280px-dark.png` / `legal-terms-1280px-light.png` / `legal-terms-360px-dark.png` / `legal-terms-360px-light.png`
10. `legal-privacy-1280px-dark.png` / `legal-privacy-1280px-light.png` / `legal-privacy-360px-dark.png` / `legal-privacy-360px-light.png`
11. `legal-responsible-scraping-1280px-dark.png` / `legal-responsible-scraping-1280px-light.png` / `legal-responsible-scraping-360px-dark.png` / `legal-responsible-scraping-360px-light.png`
12. `auth-login-1280px-dark.png` / `auth-login-1280px-light.png` / `auth-login-360px-dark.png` / `auth-login-360px-light.png`
13. `auth-signup-1280px-dark.png` / `auth-signup-1280px-light.png` / `auth-signup-360px-dark.png` / `auth-signup-360px-light.png`

Total screenshots: **52 files**.
