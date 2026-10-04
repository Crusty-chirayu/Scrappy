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
| D005 | 2026-10-04 | 2026-10-04 | `PriceTag` prop mismatch (`amountPaise` vs `pricePaise`) in intelligence view | P2 | `apps/web/src/app/intelligence/page.tsx` build | CLOSED |

---

## Current Status: **ZERO OPEN DEFECTS**

- Total Logged: 5
- Total Closed: 5
- Total Open: 0
