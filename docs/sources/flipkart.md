# Source Documentation: Flipkart (`flipkart`)

> Technical adapter architecture, legal considerations, and data lineage for Flipkart.com.

---

## Adapter Metadata

- **Identifier**: `flipkart`
- **Merchant Name**: Flipkart
- **Base URL**: `https://www.flipkart.com`
- **Adapter Version**: `0.2.0`
- **Operational Status**: `fixture-only` (Pending live Flipkart Affiliate API credentials verification)
- **Extraction Protocol**: Dual-mode (Affiliate Feed API primary, ethical HTTP fetcher secondary)

---

## Technical Architecture

### 1. Ingestion Modes
- **Live Mode Status**: **`fixture-only`** (Labeled fixture-only until verified live credentials are provided in `.env`).
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

## Legal & Compliance Posture (Constitution Rule 12)

### 1. Robots.txt Posture
- **[FACT]**: Flipkart's `robots.txt` at `https://www.flipkart.com/robots.txt` disallows wide sections of its site including `/checkout/`, `/account/`, search queries, and dynamic filters.
- **[FACT]**: Product listing paths (e.g. `/p/itm...`) carry specific user-agent restrictions with frequent Cloudflare bot mitigation challenges.
- **[ASSUMPTION]**: Direct web crawling without official affiliate credentials risks rapid 403/429 throttling and IP blocks.

### 2. Terms of Service Posture
- **[FACT]**: Flipkart Terms of Use explicitly state: "You shall not use any 'deep-link', 'page-scrape', 'robot', 'spider' or other automatic device, program, algorithm or methodology... to access, acquire, copy or monitor any portion of the Website or any Content."
- **[FACT]**: Flipkart maintains an official Affiliate Program with JSON feed endpoints (`affiliate-api.flipkart.net`).
- **[FACT]**: In compliance with Constitution Rule 6, Scrappy never solves CAPTCHAs or bypasses Cloudflare stealth controls. The adapter operates strictly in `fixture-only` mode using recorded fixture responses until live affiliate tokens are configured.
