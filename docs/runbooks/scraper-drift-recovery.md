# RUNBOOK: Scraper Drift & Circuit Breaker Recovery

> System: Scrappy Source Adapters (`@scrappy/adapters`, `@scrappy/scraping`)  
> Triggers: Circuit breaker OPEN state, consecutive HTTP 429/403 errors, or schema fill-rate drop >= 30%.

---

## 1. Diagnostics & Alert Triage

When a source adapter triggers an alert:
1. Check the Circuit Breaker status in Admin Console:
   - State: `OPEN` (Traffic halted to protect merchant IP and platform stability)
   - Failure Count: >= 5 consecutive network or parsing failures
2. Identify Failure Class:
   - **Network/Rate Limit (429/503)**: Backoff required. Check `HostRateLimiter` delay settings.
   - **DOM/Schema Drift**: Merchant site altered CSS class names or structure.

---

## 2. Recovery Procedure for Schema Drift

### Step 1: Capture Fresh HTML Fixture
Run the sandboxed browser worker to record the updated DOM:
```bash
pnpm --filter @scrappy/browser-worker dev
```

### Step 2: Compare Selector Match Rates
Use the Extract Studio diagnostics (`/extract`) or unit test fixtures:
```bash
pnpm --filter @scrappy/adapters test
```

### Step 3: Update Adapter Selectors with Fallbacks
In `packages/adapters/src/{merchant}/index.ts`:
- Update `primary` selector to match new DOM.
- Retain the prior selector as `fallback1` to support cached pages.
- Ensure selector resilience score >= 75.

### Step 4: Verify Adapter Chaos & Circuit Breaker Reset
```bash
pnpm vitest run apps/worker/src/__tests__/worker-chaos.test.ts
```

### Step 5: Close Circuit Breaker
Reset circuit breaker via Admin API or restart worker task.
