# Source Documentation: Flipkart (`flipkart`)

> Technical adapter architecture, legal considerations, and data lineage for Flipkart.com.

---

## Adapter Metadata

- **Identifier**: `flipkart`
- **Merchant Name**: Flipkart
- **Base URL**: `https://www.flipkart.com`
- **Adapter Version**: `0.2.0`
- **Extraction Protocol**: Dual-mode (Affiliate Feed API primary, ethical HTTP fetcher secondary)

---

## Technical Architecture

### 1. Ingestion Modes
- **Live Mode**: Ingests product delta feeds via Flipkart Affiliate API JSON endpoint.
- **Local / Test Mode**: Replays verified fixtures (`affiliate-feed-response.json` and `sample-product.html`).

### 2. Extracted Data Points
- Title (`productBaseInfoV1.title` or `.B_NuCI`)
- Brand (`productBaseInfoV1.productBrand`)
- Price (`flipkartSellingPrice` in Paise or `._30jeq3`)
- Original Price / MRP (`maximumRetailPrice` in Paise or `._3I9_wc`)
- Stock Status (`inStock` boolean or `._2jcR5m`)
- SKU / FSN (`productIdentifier.productId`)
- Merchant / Seller Name (`#sellerName` or "Flipkart")

---

## Legal & Compliance Notes

1. **Official Feed Priority**:
   - Flipkart explicitly prohibits headless browser crawling in its terms of service. Therefore, Scrappy prioritizes official affiliate feed ingestion.
2. **Rate Limits & Backoff**:
   - Enforces 1,500ms delay between consecutive requests.
   - Circuit breaker trips to OPEN on 4 consecutive errors or rate limit responses (HTTP 429).
