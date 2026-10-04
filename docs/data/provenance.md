# Data Provenance Specification

> Technical standard for tracking data lineage, extraction method, freshness, and confidence across the Scrappy platform.

---

## Constitution Rule 3 Compliance

> **Rule 3:** Every important number has PROVENANCE: source, fetched_at, freshness, extraction method, confidence. The UI must be able to answer "where did this come from, how old is it, how sure are we?"

No price, offer, or specification value may be persisted or presented without accompanying provenance metadata.

---

## 1. Provenance Schema

All `offers.provenance` records must adhere strictly to the following TypeScript / JSON schema:

```typescript
export interface ProvenanceMetadata {
  /** Identifier of the source adapter, e.g. "amazon-in", "flipkart" */
  source: string;

  /** Absolute canonical URL where the data was retrieved */
  sourceUrl: string;

  /** ISO-8601 UTC timestamp of retrieval */
  fetchedAt: string;

  /** Protocol / runtime used to collect data */
  extractionMethod: "http" | "browser" | "api" | "feed";

  /** Normalization confidence score from 0.0 to 1.0 */
  confidence: number;

  /** Semver string of the adapter release that extracted this payload */
  adapterVersion: string;

  /** SHA-256 hash of the raw response payload for integrity auditing */
  contentHash?: string;

  /** Latency of the extraction in milliseconds */
  extractionLatencyMs?: number;

  /** If extracted via CSS selector or LLM, rule metadata */
  parserDetails?: {
    engine: "cheerio" | "playwright" | "json_path" | "llm_extract";
    selectorMatchCount?: number;
    driftWarning?: boolean;
  };
}
```

---

## 2. Confidence Score Calculation

The `confidence` score (0.00 – 1.00) is deterministically calculated by the normalization layer based on three pillars:

| Pillar | Weight | Scoring Factors |
| :--- | :--- | :--- |
| **Identifier Match** | 50% | EAN/UPC match = 1.0; Model/MPN exact match = 0.9; Normalized Title match = 0.7; Fuzzy title similarity = cosine similarity score. |
| **Extraction Precision** | 30% | Official API / Feed = 1.0; Validated HTML Microdata / JSON-LD = 0.95; Semantic CSS selector = 0.85; Vision/LLM heuristic = 0.70. |
| **Price Sanity Check** | 20% | Price within 15% of historical median = 1.0; Price within 50% = 0.8; Price >3x or <0.2x historical = 0.2 (triggers anomaly review). |

### Composite Formula
$$\text{Confidence} = 0.50 \times S_{\text{identifier}} + 0.30 \times S_{\text{extraction}} + 0.20 \times S_{\text{sanity}}$$

---

## 3. Match States & UI Thresholds

In accordance with **Constitution Rule 4**:
> "A false product match is worse than a missed match. Uncertain matches are shown as 'Possible match' and never merged silently."

| Confidence Range | UI Badge State | Action Taken |
| :--- | :--- | :--- |
| **$\ge 0.95$** | `Verified` | Automatically merged into canonical product offers table. |
| **$0.80 - 0.94$** | `Matched` | Merged into canonical product offers table with high confidence. |
| **$0.50 - 0.79$** | `Possible match` | **NOT merged silently.** Flagged for review; displayed in UI as a collapsible "Possible match" candidate with confidence disclosure. |
| **$< 0.50$** | `Unmatched` | Discarded into unmatched queue for adapter diagnostics. |

---

## 4. UI Provenance Inspection Protocol

Every domain component displaying price or inventory (`PriceTag`, `SourceChip`, `TrustBadge`, `DataFreshness`) must support inspection:
1. **Hover / Focus**: Renders a floating tooltip indicating exact age (e.g., "Updated 4m ago"), source identifier, and extraction method.
2. **Click / Context**: Opens the **Provenance Drawer**, revealing raw payload timestamp, adapter version, raw content hash, and direct link to source retailer URL.
