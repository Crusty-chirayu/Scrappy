# 08 — AI Plan

> Each AI feature: input/output, fallback, cost, latency, eval

---

## AI Provider Strategy

**Primary**: Gemini (via `@google/generative-ai` or Vertex AI SDK)
**Wrapper**: Provider-agnostic `AIProvider` interface in `@scrappy/ai`
**Local/test**: Deterministic fake provider (returns fixture outputs, no API calls)
**Every feature**: has a deterministic fallback that produces a usable (if degraded) result without AI

**FACT** (verified Oct 2026): Current Gemini pricing ~$0.075-0.35/M input tokens (Flash variant), ~$0.75/M (current Flash). Prices subject to change; verify at launch.

**Budget rule**: Every AI feature has a configured per-day token budget. Budget exceeded -> feature gracefully degrades to fallback. No feature can consume unlimited tokens.

---

## AI Features

### F1: Match Adjudication (Matching Engine)

**Trigger**: Listing has match score 0.75-0.96 AND no hard conflicts

**Input** (structured, no raw HTML):

```json
{
  "listing": {
    "title": "Samsung Galaxy S25 Ultra 256GB Phantom Black",
    "price_minor": 89999,
    "specs": { "storage": "256GB", "color": "Phantom Black" },
    "brand": "Samsung"
  },
  "candidate": {
    "title": "Samsung Galaxy S25 Ultra",
    "variant": "256GB Phantom Black",
    "brand": "Samsung",
    "category": "Smartphones"
  },
  "evidence": [
    {
      "feature": "brand_eq",
      "value_a": "Samsung",
      "value_b": "Samsung",
      "weight": 0.15,
      "contribution": 0.15
    },
    { "feature": "title_trigram", "value_a": "0.89", "contribution": 0.089 },
    {
      "feature": "storage_match",
      "value_a": "256GB",
      "value_b": "256GB",
      "weight": 0.2,
      "contribution": 0.2
    }
  ],
  "score": 0.82
}
```

**Output**:

```json
{
  "verdict": "accept",
  "confidence": 0.91,
  "reasons": [
    "Brand, model name, and storage capacity all match.",
    "Color 'Phantom Black' confirmed in both listing and variant."
  ]
}
```

**Fallback**: Score stays in `needs_review` queue. Human reviews it. No block on pipeline.
**Cache**: Keyed by SHA-256 of input JSON. Cache in `ai_cache` table (content-addressed). TTL: 30 days.
**Cost estimate**: ~200 tokens input + ~100 tokens output = ~0.03 cents per call at Flash pricing. At 1000 reviews/day = ~$0.30/day.
**Latency budget**: < 2s (async, not on critical path)
**Eval**: Compare AI verdict vs human verdict on benchmark. Track agreement rate. Alert if < 90% agreement.

---

### F2: Natural Language Search (Search Engine, Stage 2)

**Trigger**: User query doesn't match any lexical result AND query looks like natural language

**Input**: `"best phone under 20k with good camera"`

**Output**:

```json
{
  "structured_filters": {
    "category": "smartphones",
    "price_max": 20000,
    "sort_by": "camera_quality_score"
  },
  "display_chips": [
    { "label": "Smartphones", "filter": "category:smartphones", "editable": true },
    { "label": "Under INR 20,000", "filter": "price_max:20000", "editable": true }
  ],
  "interpretation": "Phones under INR 20,000, sorted by camera quality"
}
```

**Fallback**: Return lexical search results. No AI = valid results, just less structured.
**Shown to user**: Interpretation chips are always visible and editable. Never hidden AI magic.
**Validation**: Output parsed with strict zod schema. Invalid output -> fallback.
**Cost**: ~150 tokens/query. At 10k queries/day with AI: $0.75/day.
**Latency budget**: < 800ms (acceptable for "search understanding" pause)
**Eval**: Test set of 300 NL queries with expected filter output. Track accuracy >=90% before enabling.

---

### F3: Intelligence Report Generation

**Trigger**: Scheduled weekly report run for Intelligence workspace

**Input** (computed metrics, no raw data):

```json
{
  "workspace": "AcmeSellers",
  "period": "2026-09-27 to 2026-10-03",
  "top_losses": [
    {"product": "Samsung S25U", "your_price": 91200, "market_median": 89500, "gap_pct": 1.9}
  ],
  "top_gains": [...],
  "competitor_moves": [
    {"competitor": "Flipkart", "action": "price_drop", "product": "Sony WH-1000XM5", "change_minor": -1500}
  ],
  "summary_stats": {"products_tracked": 45, "alerts_triggered": 3}
}
```

**Output**: Markdown report with numbered sentences, each citing a specific metric.

```markdown
## Weekly Competitor Intelligence: Sept 27 - Oct 3

**3 alerts fired this week.**

You are priced above market median on 5 products, led by Samsung Galaxy S25 Ultra 256GB
where your price of ₹91,200 is 1.9% above the market median of ₹89,500 (based on 4 retailers).

Flipkart reduced the price of Sony WH-1000XM5 by ₹1,500 on October 1 (now ₹18,499).
```

**Fallback**: Template-based report using the same metrics (no prose, just tables).
**Grounding rule**: Every sentence must be derivable from the input metrics. No invented claims.
**Post-processing**: Parse output to verify all cited numbers match input. If mismatch -> use fallback template.
**Cost**: ~1000 tokens input + ~500 output = ~$0.15/report. At 500 reports/week = ~$75/week. Acceptable at scale.
**Latency**: async background job. No user-facing latency requirement.
**Eval**: Human review sample of 50 reports per month for factual accuracy.

---

### F4: Extract "Why did this break?" Diagnostic

**Trigger**: Extractor's fill-rate drops or selector returns 0 results after a site update

**Input**:

```json
{
  "field": "price",
  "selector_used": ".product-price span.amount",
  "old_html_sample": "<span class='amount'>₹2,499</span>",
  "new_html_sample": "<div class='price-display' data-price='2499'>₹2,499</div>",
  "error": "Selector matched 0 elements"
}
```

**Output**:

```json
{
  "diagnosis": "The site moved price data from a <span class='amount'> element to a <div> with a data attribute.",
  "suggested_selectors": [
    { "selector": "[data-price]", "confidence": 0.95, "note": "Stable data attribute" },
    { "selector": ".price-display", "confidence": 0.8, "note": "CSS class (may change)" }
  ],
  "user_action": "Review and confirm the suggested selector."
}
```

**Fallback**: Show raw diff of old/new DOM without AI interpretation. User figures it out.
**User confirmation**: All suggestions require user to explicitly accept before applying.
**Cost**: ~800 tokens input + ~200 output = ~$0.08/diagnostic.
**Latency**: < 5s (user is waiting for this)
**Eval**: Track % of AI suggestions accepted by users. Alert if < 50% (poor quality).

---

### F5: Extract Schema Suggestion ("Describe what you want")

**Trigger**: User types a description instead of manually selecting fields

**Input**: `"Extract product name, price, image, and availability from each product card"`

**Output**:

```json
{
  "proposed_schema": [
    { "name": "product_name", "type": "text", "selector": ".product-title h2" },
    { "name": "price", "type": "currency", "selector": ".price-box .amount" },
    { "name": "image_url", "type": "image", "selector": ".product-image img[src]" },
    { "name": "availability", "type": "text", "selector": ".stock-status" }
  ],
  "confidence": 0.78,
  "note": "Selectors generated from a sample page. Run a test to verify."
}
```

**Fallback**: Open blank schema editor. User selects fields manually.
**User confirmation**: Always shown as "proposed schema to review" — never auto-applied.
**Cost**: ~500 tokens input (includes sample HTML) + ~300 output.
**Latency**: < 3s acceptable

---

## AI Infrastructure (@scrappy/ai)

```typescript
// packages/ai/src/provider.ts
interface AIProvider {
  complete(request: CompletionRequest): Promise<CompletionResponse>;
  embed(texts: string[]): Promise<number[][]>;
}

// packages/ai/src/providers/gemini.ts
class GeminiProvider implements AIProvider { ... }

// packages/ai/src/providers/fake.ts
class FakeProvider implements AIProvider {
  // Returns fixture outputs for testing
  // Configurable: can return specific outputs for specific inputs
  // Zero latency, zero cost, deterministic
}

// packages/ai/src/cache.ts
class AICache {
  // Content-addressed: key = SHA-256(feature + prompt)
  // Stored in ai_cache table (workspace_id, cache_key, response, expires_at)
  // TTL: 30 days for match adjudication, 1 day for search
}

// packages/ai/src/budget.ts
class BudgetEnforcer {
  // Per-feature, per-day token budget
  // Tracks usage_events with metric='ai_tokens'
  // If daily budget exceeded: throws BudgetExceededError
  // Callers catch and use fallback
}
```

---

## Eval Framework

```
packages/ai/evals/
  match-adjudication/
    gold-set.json       Labeled (listing, product, expected_verdict) pairs
    runner.ts           Runs AI on gold set, computes agreement rate
  search-nl/
    queries.json        NL queries with expected structured filters
    runner.ts
  report-factual/
    samples/            Sample inputs + expected output characteristics
    runner.ts           Checks cited numbers against input
```

CI: Evals run nightly (not on every PR to avoid latency). Alert if accuracy drops below threshold.

---

## Cost Summary (ASSUMPTION — verify at launch)

| Feature            | Per-use cost | Daily volume | Daily cost   |
| ------------------ | ------------ | ------------ | ------------ |
| Match adjudication | ~$0.0003     | 1,000        | ~$0.30       |
| NL Search          | ~$0.0001     | 10,000       | ~$1.00       |
| Report generation  | ~$0.15       | 70/day avg   | ~$10.50      |
| Break diagnosis    | ~$0.08       | 50           | ~$4.00       |
| Schema suggestion  | ~$0.05       | 100          | ~$5.00       |
| **Total**          |              |              | **~$21/day** |

At $21/day the AI cost is manageable at launch. Watch for report generation scaling with Intelligence plan growth. Budget gates prevent runaway costs.
