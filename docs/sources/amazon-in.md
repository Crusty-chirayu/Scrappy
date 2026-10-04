# Source Documentation: Amazon India (`amazon-in`)

> Technical adapter architecture, legal considerations, and data lineage for Amazon.in.

---

## Adapter Metadata

- **Identifier**: `amazon-in`
- **Merchant Name**: Amazon India
- **Base URL**: `https://www.amazon.in`
- **Adapter Version**: `0.2.0`
- **Extraction Protocol**: Dual-mode (PA-API Feed primary, ethical HTTP fetcher secondary)

---

## Technical Architecture

### 1. Ingestion Modes
- **Live Mode**: Uses Amazon Product Advertising API (PA-API 5.0) with batch item lookups.
- **Local / Test Mode**: Replays verified fixtures (`pa-api-response.json` and `sample-product.html`) to ensure deterministic test runs with zero network overhead.

### 2. Extracted Data Points
- Title (`ItemInfo.Title` or `#productTitle`)
- Brand (`ItemInfo.ByLineInfo.Brand` or `#bylineInfo`)
- Price (`Offers.Listings[0].Price` in Paise or `.priceToPay .a-offscreen`)
- Original Price / MSRP (`SavingBasis` or `.basisPrice .a-offscreen`)
- Stock Status (`Availability.Type` or `#availability`)
- SKU / ASIN (`ItemInfo.ASIN` or URL pattern `dp/B0...`)
- Merchant Name (`Appario Retail`, etc.)

---

## Legal & Compliance Notes

1. **Robots.txt & Rate Limiting**:
   - Honors Amazon.in `robots.txt` paths.
   - Enforces a minimum per-host rate limit of 1,000ms delay per worker.
2. **Bot Identification**:
   - Identifies explicitly with `User-Agent: ScrappyBot/1.0 (+https://scrappy.in/bot)`.
3. **No CAPTCHA / Anti-Bot Circumvention**:
   - In accordance with **Constitution Rule 6**, Scrappy never employs CAPTCHA solving, IP cycling, or browser fingerprint spoofing.
   - If Amazon serves a bot verification challenge, the circuit breaker records a failure and marks the adapter as degraded without bypassing protections.
