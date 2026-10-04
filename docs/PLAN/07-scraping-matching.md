# 07 — Scraping & Matching

> Adapter contract, source strategy per retailer (legal/robots research), health, matching algorithm and benchmark plan

---

## Source Research (Appendix D Item 1 & 2)

### Amazon India

**Official Programs** (FACT — verified Oct 2026):

- Amazon Product Advertising API (PA-API) available to Associates members
- Access requires: active Associates account + minimum qualifying sales (~3-10 per 30 days)
- PA-API provides: product info, prices, availability, images, reviews summary
- API rate limits: varies by account tier (typically 1 TPS for new accounts)
- Legacy PA-API v5 deprecated mid-2026; current API must be confirmed before implementation

**robots.txt posture** (INFERENCE from general policy — must verify pre-launch):

- Amazon disallows most automated crawling of product pages in robots.txt
- Disallowed paths include /s (search), product detail pages for bots not identified as Googlebot/Bingbot

**Legal risk**: HIGH for scraping. ToS explicitly prohibits data extraction beyond API usage.

**Plan decision**: Use PA-API as the official feed where available. Ship scraper adapter as `Unsupported` initially. When PA-API access is obtained, implement as official feed mode. This is a go-live credential item.

**Safe mode**: User-initiated product resolve (paste a product URL) using PA-API lookup. Never automated crawling without PA-API.

### Flipkart

**Official Programs** (FACT — verified Oct 2026):

- Flipkart Affiliate API available to registered affiliates
- Provides: Product Feed API, Delta Feed API, Search Query API
- Auth: `Fk-Affiliate-Id` + `Fk-Affiliate-Token` headers
- Registration: affiliate.flipkart.com

**robots.txt posture** (INFERENCE — verify pre-launch):

- Flipkart typically restricts automated crawlers in robots.txt
- Affiliate API is the preferred and TOS-compliant integration method

**Legal risk**: HIGH for scraping product pages. ToS prohibits extraction. Affiliate API is the safe path.

**Plan decision**: Build Flipkart adapter using the Affiliate API. Feed-based mode only. No page scraping without explicit permission.

### Croma (Infiniti Retail)

**Official Programs** (FACT — verified Oct 2026):

- No official public data API or affiliate program with product data feed identified
- No documented developer program

**robots.txt posture** (INFERENCE — must verify pre-launch by reading croma.com/robots.txt):

- Most Indian electronics retailers restrict bots in robots.txt
- ToS (croma.com) prohibits scraping and automated access (FACT from legal research)

**Legal risk**: HIGH. No official feed available. Scraping violates ToS and potentially India IT Act 2000 Section 43.

**Plan decision**: Ship as `Unsupported` source with honest UI state: "Croma is not currently available as an automated source." This is correct and honest. If Croma wants to be listed, they contact us for an official data partnership.

**ADR Required**: See `/docs/adr/0002-croma-unsupported.md`

### Reliance Digital (Reliance Retail)

**Official Programs** (FACT — verified Oct 2026):

- No official public data API or affiliate program with structured product data feed identified

**robots.txt posture** (INFERENCE — verify pre-launch):

- Similar posture to Croma
- ToS prohibits automated access

**Legal risk**: HIGH. Same as Croma.

**Plan decision**: Ship as `Unsupported` source. Same rationale as Croma.

### Summary Table

| Source           | Official Feed                     | Safe Mode         | Legal Risk       | MVP Status                      |
| ---------------- | --------------------------------- | ----------------- | ---------------- | ------------------------------- |
| Amazon India     | PA-API (requires account + sales) | Official API only | HIGH if scraping | Feed-based (go-live credential) |
| Flipkart         | Affiliate API (requires account)  | Official API only | HIGH if scraping | Feed-based (go-live credential) |
| Croma            | None                              | None              | HIGH             | Unsupported                     |
| Reliance Digital | None                              | None              | HIGH             | Unsupported                     |

---

## Adapter Contract

```typescript
// packages/scraping/src/types.ts

interface AdapterCapabilities {
  requiresBrowser: boolean;
  supportsSearch: boolean;
  supportsVariants: boolean;
  officialFeedAvailable: boolean;
  robotsAllowed: boolean | null; // null = not checked yet
}

type ErrorClass =
  | "NETWORK"
  | "TIMEOUT"
  | "BLOCKED"
  | "NOT_FOUND"
  | "PARSE_CHANGED"
  | "VALIDATION"
  | "RATE_LIMITED"
  | "UNKNOWN";

interface AdapterContext {
  runId: string;
  workspaceId?: string;
  logger: Logger;
  db: Database;
  storage: StorageClient;
  rateLimiter: RateLimiter;
  circuitBreaker: CircuitBreaker;
}

interface Adapter {
  readonly name: string;
  readonly version: string;
  readonly capabilities: AdapterCapabilities;

  // Yields discovery targets (category URLs, search result pages, sitemaps)
  discover(ctx: AdapterContext): AsyncIterable<DiscoveryTarget>;

  // Fetches a target; chooses HTTP vs browser based on capabilities
  fetch(target: DiscoveryTarget, ctx: AdapterContext): Promise<FetchResult>;

  // Pure function: extract RawListing[] from FetchResult (fixture-testable)
  parse(result: FetchResult): RawListing[];

  // Currency normalization, unit normalization, availability enum
  normalize(raw: RawListing): NormalizedListing;

  // Zod + business rules validation
  validate(norm: NormalizedListing): ValidationReport;

  // Persist to DB, update listings + offers
  persist(norm: NormalizedListing, ctx: AdapterContext): Promise<PersistOutcome>;

  // Current health snapshot
  health(): AdapterHealth;

  // Classify an error for retry/circuit-breaker logic
  classify(error: unknown): ErrorClass;
}
```

---

## Fetch Layer Architecture

### HTTP Fetcher (undici)

```typescript
// packages/scraping/src/fetcher/http.ts
class HttpFetcher {
  // Conditional requests: ETag / If-Modified-Since caching
  // gzip/br decompression
  // Connection reuse (keep-alive)
  // Per-host token bucket rate limiter
  // Honest User-Agent: "ScrappyBot/1.0 (+https://scrappy.in/bot)"
  // SSRF guard on every URL (before and after redirects)
  // Size limit: 10MB response max
  // Timeout: 30s
  // Backoff: exponential with jitter on NETWORK/TIMEOUT/RATE_LIMITED
  // Honors Retry-After header
}
```

### Browser Renderer (Playwright + Crawlee)

```typescript
// packages/scraping/src/fetcher/browser.ts
class BrowserRenderer {
  // Pooled browser contexts (reused, not launched per request)
  // Per-run hard limits: 60s max, 40 requests max, 300MB max
  // Block: images, fonts, media, tracking scripts (RequestInterception)
  // Always close context after use (crash-safe try/finally)
  // Honest User-Agent same as HTTP fetcher (no spoofing)
  // Used ONLY when adapter.capabilities.requiresBrowser OR HTTP parse fails
}
```

### SSRF Guard

```typescript
// packages/scraping/src/ssrf-guard.ts
// Validates any user-supplied or fetched URL:
// 1. Parse URL, check scheme allowlist (https, http only)
// 2. Resolve DNS (all A/AAAA records)
// 3. Block private ranges: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16
// 4. Block link-local: 169.254.0.0/16 (AWS metadata), fe80::/10
// 5. Block loopback: 127.0.0.0/8, ::1
// 6. Block cloud metadata: 169.254.169.254/32
// 7. Re-check SSRF after every redirect
// 8. Max 5 redirects
// 9. Max URL length: 2048 chars
```

### robots.txt Enforcement

```typescript
// packages/scraping/src/robots.ts
class RobotsEnforcer {
  // Fetch robots.txt for each host (cached 24 hours)
  // Parse using robots-parser library
  // Check our User-Agent ("ScrappyBot") AND "User-agent: *"
  // If disallowed: mark source as 'restricted', do NOT fetch, do NOT bypass
  // UI shows "Source unavailable" for restricted sources
  // Never bypass robots.txt under any circumstances
}
```

### Rate Limiter

```typescript
// Per-host token bucket
// Default: 1 req / 2s / host (adjustable only downward automatically)
// Backoff: double rate limit on RATE_LIMITED error, max 1 req/30s
// Never automatically increase rate limits
```

### Circuit Breaker

```typescript
// Per source
// Opens on > 40% failures in last 20 runs
// Half-open: probe every 10 minutes (1 test request)
// Open state: scheduler skips, UI shows "Source degraded", data shown as Stale
// Transitions: CLOSED -> OPEN -> HALF_OPEN -> CLOSED (or back to OPEN)
```

---

## Scraping Pipeline

```
Source -> Scheduler (pg-boss) -> fetch_http / fetch_browser job
  -> Adapter.fetch() -> Adapter.parse() -> Adapter.normalize() -> Adapter.validate()
  -> If ValidationReport.ok: Adapter.persist() -> Enqueue: match_listing job
  -> If ValidationReport.failed: Log VALIDATION error, alert ops
  -> Enqueue: schema_drift_check if field fill-rate drops > 25%
```

### Schema Drift Detection

```typescript
// After each parse run, compute field fill-rate vs trailing 7-day baseline
// Fields: title, price, availability, MRP, images, specs
// If any field's fill-rate drops > 25%:
//   1. Create schema_drift_report with sample of raw HTML
//   2. Classify adapter error as PARSE_CHANGED
//   3. Zero retries (this is a structural failure)
//   4. Alert operator: "Amazon adapter field fill-rate dropped: price 98% -> 60%"
//   5. Do NOT update product data with bad parses
```

---

## Reliability

| Error Class   | Retries              | Action                            |
| ------------- | -------------------- | --------------------------------- |
| NETWORK       | 3 with backoff       | Standard retry                    |
| TIMEOUT       | 3 with backoff       | Standard retry                    |
| RATE_LIMITED  | 3, honor Retry-After | Automatic rate reduction          |
| BLOCKED       | 0                    | Circuit breaker, classify BLOCKED |
| PARSE_CHANGED | 0                    | Alert ops, schema drift report    |
| VALIDATION    | 0                    | Alert ops, do not persist         |
| NOT_FOUND     | 0                    | Mark listing inactive             |
| UNKNOWN       | 1                    | Log, alert ops                    |

**Idempotency**: tasks keyed by `(source_id, target_url, time_window)`. If job re-runs, it upserts (no duplicate observations).

---

## Matching Engine (@scrappy/matching)

### Phase 1: Normalization

- Brand aliasing: "Samsung Electronics" -> "Samsung", "Apple Inc" -> "Apple" (lookup table)
- Title tokenization: extract model numbers (regex patterns per brand), storage (256GB), RAM (12GB), color, pack quantity (2-pack), size (1.5 ton, 65")
- Spec extraction: structured attributes from title + spec table

### Phase 2: Candidate Retrieval (cheap, fast)

1. **Exact identifier hit** (GTIN/EAN/MPN): if match found -> auto-accept if score >= 0.96 with no conflicts
2. **Blocking keys**: brand + model token prefix -> narrow candidates significantly
3. **Trigram similarity** (pg_trgm): `similarity(listing.title, product.title) > 0.4`
4. **pgvector nearest neighbors**: top-20 by cosine similarity of title+spec embedding
5. **Result**: <= 50 candidates per listing for pairwise scoring

### Phase 3: Pairwise Scoring

Each feature produces an evidence row with weight and contribution:

| Feature                         | Weight | Evidence Type | Notes                   |
| ------------------------------- | ------ | ------------- | ----------------------- |
| GTIN/EAN match                  | 0.40   | identifier    | Strong positive         |
| MPN / model number equality     | 0.35   | identifier    | Strong positive         |
| Brand equality                  | 0.15   | brand         | Normalized              |
| Storage/RAM/capacity spec match | 0.20   | spec          | Per attribute           |
| Color match                     | 0.05   | spec          | Weak signal             |
| Pack quantity match             | 0.15   | spec          | Important               |
| Price plausibility              | 0.10   | price         | Outlier vs cohort       |
| Image perceptual hash           | 0.10   | image         | Requires image download |
| Title token overlap (Jaccard)   | 0.15   | title         | Normalized tokens       |
| Title trigram similarity        | 0.10   | title         | Fuzzy                   |

**Total score**: weighted sum, normalized to 0-1.

### Phase 4: Hard Conflicts (override score, force review or reject)

| Conflict                                          | Decision        |
| ------------------------------------------------- | --------------- |
| Different storage/RAM (e.g. 128GB vs 256GB)       | FORCE non-match |
| Different pack quantity (e.g. 1-pack vs 2-pack)   | FORCE non-match |
| Different model number (confirmed different)      | FORCE non-match |
| Different size (e.g. 55" vs 65")                  | FORCE non-match |
| New vs refurbished                                | FORCE non-match |
| Accessory vs main product (e.g. charger vs phone) | FORCE non-match |
| Different capacity/size unit (750ml vs 1L)        | FORCE non-match |

Hard conflicts are stored as evidence rows with `is_conflict=TRUE`.

### Phase 5: Decision Thresholds

```typescript
function decide(score: number, hardConflicts: number, evidence: Evidence[]): Decision {
  const hasIdentifierMatch = evidence.some(e =>
    e.feature === 'gtin_match' || e.feature === 'mpn_match'
  );
  const hasModelBrandSpec = /* model + brand + >= 2 matching specs */;

  if (hardConflicts > 0) return 'needs_review'; // Never auto-accept with conflict

  if (score >= 0.96 && (hasIdentifierMatch || hasModelBrandSpec)) {
    return 'auto_accepted';
  } else if (score >= 0.75) {
    return 'needs_review';
  } else {
    return 'rejected';
  }
}
// Thresholds live in config (tunable), not hardcoded
```

### Phase 6: Human Review Queue (Admin)

UI: Side-by-side comparison of listing vs product:

- Left: listing title, images, specs, price, source
- Right: product canonical info, variants, existing matches
- Center: evidence table (feature, value_a, value_b, weight, contribution, conflict)
- Actions (keyboard-navigable, one-key): `A` = Accept, `R` = Reject, `S` = Split, `M` = Merge
- All decisions stored in `match_reviews` and become labeled training data

**Reversible**: Merges and splits can be undone. Full audit trail.

### Phase 7: UI Contract

| Match Status             | Badge            | Visual        | Price Comparison    |
| ------------------------ | ---------------- | ------------- | ------------------- |
| auto_accepted            | "Matched"        | Solid green   | Included            |
| human_accepted           | "Verified"       | Solid green   | Included            |
| needs_review (low score) | "Possible match" | Dashed violet | Excluded by default |
| needs_review (conflict)  | "Possible match" | Dashed violet | Excluded by default |
| rejected                 | Hidden           | None          | Not shown           |

"Possible match" listings: user can choose to include them in comparison (with warning).

### AI Adjudicator (bounded, optional)

- Applies ONLY to 0.75-0.96 score band
- Input: structured evidence table (no raw HTML)
- Output: `{ verdict: 'accept' | 'reject', reasons: string[], confidence: number }`
- Cache: keyed by hash of evidence; if same evidence seen before, reuse cached decision
- Cost ceiling: configurable per-day token budget (e.g. $5/day)
- Fallback: if AI unavailable, leaves in review queue (never blocks pipeline)
- **Rule**: LLM can NEVER override a hard conflict. Hard conflicts always force non-match.

---

## Benchmark Plan

**Before tuning, build the benchmark**:

```
packages/matching/bench/
  gold-set/
    pairs.json          >= 1,000 labeled pairs (is_match: bool, notes: string)
    adversarial.json    >= 300 adversarial pairs (storage variants, pack sizes, accessories, refurb)
  runner.ts             Runs matching on gold set, computes metrics
  report.ts             Outputs precision/recall/F1/false-positive list
```

**Adversarial categories** (must be represented):

- 128GB vs 256GB same model
- 2-pack vs 1-pack same product
- Similar model numbers with one digit different
- Accessories vs main product (charger vs phone)
- Refurbished vs new same model
- Regional variants (India vs global)
- Similar brands (Sony vs Soniq)
- Same specs, different size variants (55" vs 65")

**CI gate**:

```yaml
- name: Matching Benchmark
  run: pnpm --filter @scrappy/matching bench
  # Fails CI if:
  # - precision on adversarial set < 99.5%
  # - overall precision < 99%
  # - F1 on overall set < 95%
```

**Labeling tooling**: Review UI in admin doubles as labeling tool. Admin can tag a review decision as "add to benchmark". Benchmark grows over time.

---

## Source Health System

### Metrics Per Source

- Success rate (last 100 runs)
- p50/p95 fetch latency
- Parse failure %
- Field fill rates (per field)
- Freshness: median age of latest observation
- HTTP error mix (4xx/5xx/timeout breakdown)

### Health States

| State         | Condition                              | UI Treatment                         |
| ------------- | -------------------------------------- | ------------------------------------ |
| Healthy       | Success > 95%, fill rates normal       | Green dot                            |
| Degraded      | Success 60-95% or fill rate drop < 25% | Yellow dot                           |
| Offline       | Success < 10% or circuit breaker OPEN  | Red dot                              |
| Stale         | No new data in > 24h                   | Gray dot + "Stale Xh ago"            |
| ParserChanged | Field fill rate drop > 25%             | Orange dot + alert                   |
| Restricted    | robots.txt disallowed                  | Gray dot + "Source unavailable"      |
| Unsupported   | No safe mode available                 | Gray dot + "Not currently available" |

**Public vs Internal**: Public status page shows State only (no scraping tactics). Internal admin shows full metrics and HTML diffs.

---

## Fixture-Driven Testing

```
fixtures/
  amazon-in/
    normal.html        Normal product page
    out-of-stock.html  OOS state
    variant-heavy.html Multi-variant product
    sale-price.html    Sale with MRP shown
    missing-price.html Price not available
    layout-changed.html Simulated DOM change
    blocked.html       Bot-detection page
  flipkart/
    ...same cases...
```

Parser tests run **offline** (no network) in CI:

```typescript
// packages/adapters/src/amazon-in/adapter.test.ts
it("parses normal product page", async () => {
  const html = readFileSync("fixtures/amazon-in/normal.html", "utf-8");
  const result = adapter.parse({ html, url: "https://amazon.in/dp/B0CX..." });
  expect(result).toMatchObject({
    title: expect.stringContaining("Samsung Galaxy S25"),
    price_minor: expect.any(Number),
    availability: "in_stock",
  });
});
```

**Nightly "live canary"**: separate GitHub Action job (not blocking CI) that runs 1 page per source and posts health status.
