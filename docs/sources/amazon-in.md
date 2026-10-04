# Source Documentation: Amazon India (`amazon-in`)

> Technical adapter architecture, legal considerations, and data lineage for Amazon.in.

---

## Adapter Metadata

- **Identifier**: `amazon-in`
- **Merchant Name**: Amazon India
- **Base URL**: `https://www.amazon.in`
- **Adapter Version**: `0.2.0`
- **Operational Status**: `fixture-only` (Pending live PA-API associate credentials verification)
- **Extraction Protocol**: Dual-mode (PA-API Feed primary, ethical HTTP fetcher secondary)

---

## Technical Architecture

### 1. Ingestion Modes
- **Live Mode Status**: **`fixture-only`** (Labeled fixture-only until verified live credentials are provided in `.env`).
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

## Legal & Compliance Posture (Constitution Rule 12)

### 1. Robots.txt Posture
- **[FACT]**: Amazon India publishes `robots.txt` at `https://www.amazon.in/robots.txt`. It disallows automated crawling of `/gp/cart`, `/gp/history`, `/wishlist`, and internal session endpoints for all user-agents.
- **[FACT]**: Product detail URLs matching `/dp/{ASIN}` are generally crawlable under default user-agent rules provided crawling does not exceed rate limits or interfere with server performance.
- **[ASSUMPTION]**: Respecting a 1,000ms per-host rate limit and identifying with `ScrappyBot/1.0` remains within responsible load boundaries.

### 2. Terms of Service Posture
- **[FACT]**: Amazon Conditions of Use prohibit "any collection and use of any product listings, descriptions, or prices; any derivative use of this website or its contents; any downloading or copying of account information... or any use of data mining, robots, or similar data gathering and extraction tools" without express written consent.
- **[FACT]**: Amazon provides the official **Product Advertising API (PA-API 5.0)** for programmatic access to product data, prices, and affiliate links.
- **[ASSUMPTION]**: Commercial live price aggregation requires active Amazon Associates account approval and PA-API access token generation.
- **[FACT]**: In local mode, Scrappy executes exclusively against recorded test fixtures (`pa-api-response.json`, `sample-product.html`). No live Amazon endpoints are contacted in CI or default environments.
