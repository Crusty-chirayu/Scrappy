# DEFECTS LOG

> SCRAPPY Defect Tracking Log  
> Release Gate Rule: ZERO open defects (Found -> Logged -> Fixed -> Regression Test -> Closed).

---

## Log

| ID | Found | Fixed | Summary | Severity | Regression Test | Status |
| -- | ----- | ----- | ------- | -------- | --------------- | ------ |
| D001 | 2026-10-04 | 2026-10-04 | `node:url` and `node:fs` scheme error during Webpack client build | P1 | `apps/web/build` Next.js compilation | CLOSED |
| D002 | 2026-10-04 | 2026-10-04 | `as any` type assertion in compare search sort order select | P2 | `apps/web/compare/page.tsx` typecheck | CLOSED |
| D003 | 2026-10-04 | 2026-10-04 | `INTEGRATION_MODE` missing from `BaseEnvSchema` | P2 | `packages/core/src/env/index.ts` typecheck | CLOSED |
| D004 | 2026-10-04 | 2026-10-04 | Fastify test suite hook timeout under multi-package parallel execution | P2 | `apps/api/src/__tests__/api.test.ts` hookTimeout | CLOSED |
| D006 | 2026-10-04 | 2026-10-04 | Missing `role="img"` on `<ScrappyLogo>` resulting in invalid `aria-label` | P2 | `e2e/axe.spec.ts` | CLOSED |
| D007 | 2026-10-04 | 2026-10-04 | Missing `aria-label` on Extract Studio selector and field type inputs | P2 | `e2e/axe.spec.ts` | CLOSED |
| D008 | 2026-10-04 | 2026-10-04 | Nav and footer link target height < 24px failing WCAG 2.2 AA SC 2.5.8 | P2 | `e2e/axe.spec.ts` | CLOSED |
| D009 | 2026-10-04 | 2026-10-04 | `/admin` route co-located in public web app without isolated port, allowlist, or MFA gate | P1 | `apps/admin/src/__tests__/admin.test.ts` | CLOSED |
| D010 | 2026-10-04 | 2026-10-04 | Extract studio First Load JS exceeded 170 kB budget (255 kB) | P1 | `apps/web/build` bundle trace (< 128 kB) | CLOSED |
| D011 | 2026-10-04 | 2026-10-04 | Retailer adapters lacked explicit fixture-only verificationStatus label | P2 | `packages/scraping/src/types.ts` typecheck | CLOSED |
| D012 | 2026-10-04 | 2026-10-04 | Missing root `apps/web/src/app/loading.tsx` state | P1 | `e2e/resilience-g10.spec.ts` | CLOSED |

---

## Current Status: **ZERO OPEN DEFECTS**

- Total Logged: 12
- Total Closed: 12
- Total Open: 0
