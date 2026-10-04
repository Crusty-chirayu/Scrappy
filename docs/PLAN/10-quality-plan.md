# 10 — Quality Plan

> Test strategy, performance budgets, accessibility plan, named critical tests, release gate

---

## Test Strategy

### Test Types and Owners

| Type                    | Tool                      | Location                                  | When      |
| ----------------------- | ------------------------- | ----------------------------------------- | --------- |
| Unit                    | Vitest                    | `packages/*/src/**/*.test.ts`             | Every PR  |
| Integration (real PG)   | Vitest + Testcontainers   | `packages/*/src/**/*.integration.test.ts` | Every PR  |
| RLS / cross-tenant      | pgTAP                     | `supabase/tests/`                         | Every PR  |
| API contract            | Zod + Drizzle type checks | CI type check                             | Every PR  |
| Component               | Testing Library + Vitest  | `packages/ui/src/**/*.test.tsx`           | Every PR  |
| Visual regression       | Playwright screenshots    | `packages/ui/stories/__snapshots__/`      | Every PR  |
| Accessibility (axe)     | @axe-core/playwright      | All stories + key screens                 | Every PR  |
| E2E (consumer flow)     | Playwright                | `apps/web/e2e/compare/`                   | PR + main |
| E2E (intelligence flow) | Playwright                | `apps/web/e2e/intelligence/`              | PR + main |
| E2E (extract flow)      | Playwright                | `apps/web/e2e/extract/`                   | PR + main |
| Load / perf             | k6                        | `infra/load-tests/`                       | Nightly   |
| Security (OWASP ZAP)    | ZAP baseline              | CI                                        | Nightly   |
| Matching benchmark      | Custom harness            | `packages/matching/bench/`                | Nightly   |
| Scraper canary          | Custom harness            | `.github/workflows/canary.yml`            | Nightly   |
| Chaos                   | Custom scripts            | `infra/chaos/`                            | Weekly    |

### Coverage Targets (minimum for merge)

| Package                     | Line Coverage |
| --------------------------- | ------------- |
| `@scrappy/matching`         | >= 90%        |
| `@scrappy/pricing`          | >= 90%        |
| `@scrappy/billing` (in api) | >= 90%        |
| Auth/authz middleware       | >= 90%        |
| Overall codebase            | >= 75%        |

---

## Performance Budgets (Constitution Rule 8 — TESTS, NOT WISHES)

All budgets enforced as CI tests using Playwright + Lighthouse and k6.

### Web Performance

| Metric    | Budget           | Route                 | Condition                     |
| --------- | ---------------- | --------------------- | ----------------------------- |
| LCP       | < 1.8s           | Compare product page  | 4G mid-tier Android emulation |
| INP       | < 200ms          | All interactive pages |                               |
| TTFB      | < 300ms (cached) | Product page (ISR)    | Cache hit                     |
| JS bundle | < 170KB gz       | Any public route      | Checked by bundlesize         |
| CLS       | < 0.1            | All pages             |                               |

### API Performance

| Endpoint                           | Budget      | Condition                |
| ---------------------------------- | ----------- | ------------------------ |
| GET /v1/search                     | p95 < 150ms | 200 concurrent users, k6 |
| GET /v1/products/:slug/page-data   | p95 < 80ms  | Cache hit                |
| GET /v1/products/:slug/live-offers | p95 < 200ms | Fresh fetch              |
| GET /v1/workspace/:id/overview     | p95 < 300ms | Intelligence dashboard   |
| POST /v1/search/autocomplete       | p95 < 50ms  |                          |

### Infrastructure Performance

| Metric                | Budget                                |
| --------------------- | ------------------------------------- |
| Queue job enqueue     | < 10ms p99                            |
| Alert rule evaluation | < 500ms per price.changed event       |
| Notification fanout   | < 5s from price.changed to email sent |
| Daily rollup job      | < 30 min for 1M observations          |

---

## Accessibility Plan (WCAG 2.2 AA)

### Standards

- WCAG 2.2 Level AA minimum on all pages
- Keyboard operability: every feature usable without mouse
- Visible focus ring on every interactive element (2px, signal color)
- Screen reader support: NVDA + Chrome as primary test combination
- Reduced-motion: respected via `prefers-reduced-motion` + in-app toggle

### Automated Testing

- axe-core on every component story (zero violations required)
- Playwright axe scan on key screens: home, results, product page, watchlist, alerts, Intelligence overview, Extract builder
- Lighthouse a11y score: >= 95 on all pages

### Manual Testing Script

Documented in `/docs/qa/a11y.md`:

1. Navigate entire Compare flow (home -> search -> product -> alert) using keyboard only
2. Complete Intelligence onboarding using screen reader (NVDA)
3. Verify all chart data accessible via "View as table" toggle
4. Verify all error states are announced via live regions
5. Verify reduced-motion state: no transform animations

### Axe CI Integration

```yaml
# In GitHub Actions
- name: Axe accessibility scan
  run: pnpm --filter @scrappy/ui test:axe
  # Fails if any violation with impact: 'critical' or 'serious'
```

---

## Named Critical Tests (required before any release)

These named tests must pass for the release gate to open:

### Matching Safety

1. **`variant_mismatch_128_vs_256`**: Samsung S25 128GB listing must NOT auto-match Samsung S25 256GB product
2. **`pack_size_mismatch_1_vs_2`**: 1-pack product must NOT match 2-pack listing
3. **`false_match_prevention`**: Two different products with similar titles must have precision >= 99.5%
4. **`accessory_not_main`**: Phone charger listing must NOT match phone product
5. **`refurbished_not_new`**: Refurbished variant must NOT auto-match new product

### Price / Deal Safety

6. **`stale_price_no_deal_badge`**: Offer with observation > 24h old must show Stale badge and NO deal badge
7. **`fake_discount_flagged`**: Product where MRP rose > 15% in 30 days before "sale" must show "MRP was raised recently" warning
8. **`insufficient_data_no_score`**: Product with < 14 days history must show "Insufficient data", not a deal score

### Extraction Safety

9. **`partial_extraction_not_lost`**: Killing browser-worker mid-run must result in PARTIAL state with accurate record count, not FAILED with 0 records
10. **`duplicate_record_prevention`**: Running same extractor twice must not duplicate records (idempotency key enforced)
11. **`ssrf_test_suite`**: Extractor with URL pointing to 169.254.169.254 (AWS metadata) must be rejected at URL entry

### Billing Safety

12. **`double_billing_prevention`**: Idempotency key on usage_events prevents double-counting the same event
13. **`grace_period_state`**: Workspace with failed payment should enter grace period for 7 days, not immediately downgrade
14. **`overage_hard_cap`**: Workspace that enabled hard cap must not be charged overage; extraction stops at limit

### Security

15. **`cross_tenant_leakage`**: User A querying workspace B's watch_items returns 0 rows (RLS test)
16. **`schema_drift_no_persist`**: Adapter with 30% fill-rate drop must NOT persist new data; must create drift report
17. **`webhook_replay_rejected`**: Webhook with timestamp > 5 minutes old must return 401
18. **`api_key_in_log_scrubbed`**: API key raw value must not appear in any log output

### Notifications

19. **`duplicate_storm`**: 1000 price.changed events for the same item in 1 minute must produce exactly 1 notification (deduplication)
20. **`delivery_state_machine`**: Failed email delivery (Mailpit connection refused) must retry 3x, then set status to failed (not lost)

---

## "Zero Known Defects" Release Gate

A release cannot go to production until ALL of the following are true:

1. [ ] All 20 named critical tests passing
2. [ ] Zero OPEN defects in DEFECTS.md (each bug: found -> logged -> fixed -> regression test added -> closed)
3. [ ] Lint: zero errors
4. [ ] TypeScript strict: zero errors
5. [ ] Unit + integration tests: 100% passing
6. [ ] Matching benchmark: precision >= 99% overall, >= 99.5% adversarial
7. [ ] All performance budgets passing in k6 load tests
8. [ ] axe: zero critical/serious violations on all scanned pages
9. [ ] Lighthouse a11y >= 95 on all public pages
10. [ ] Security scan (OWASP ZAP baseline): no high/critical findings
11. [ ] npm audit: no high/critical unpatched vulnerabilities
12. [ ] Migration dry-run: passes on production-schema snapshot
13. [ ] DB restore drill: completed and timed within target RTO
14. [ ] Legal pages: reviewed and approved by counsel

**Residual risks**: After all of the above, the team documents any remaining known risks in the launch audit (Prompt 18 / `docs/launch/audit.md`). Honesty is required — no "zero risk" claims.

---

## DEFECTS.md Protocol

Every bug found during development is logged in `/docs/DEFECTS.md`:

```markdown
## DEFECTS LOG

| ID   | Found      | Fixed      | Summary                                            | Severity | Regression Test               |
| ---- | ---------- | ---------- | -------------------------------------------------- | -------- | ----------------------------- |
| D001 | 2026-10-05 | 2026-10-05 | Stale price shown without badge on mobile viewport | P1       | test/stale-price-badge.e2e.ts |
| D002 | OPEN       | --         | ...                                                | --       | --                            |
```

Rule: A defect is only "fixed" when both the code fix AND a regression test are committed. The regression test prevents it from reoccurring silently.
