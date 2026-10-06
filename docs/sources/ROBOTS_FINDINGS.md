# Retailer Robots.txt & Extraction Lineage Summary

> Reference summary of live robots.txt findings per retailer for SCRAPPY source adapters.
> All adapters remain **fixture-only** in accordance with SCRAPPY Constitution Rules 5 & 6.

---

## Findings Matrix

| Retailer | Identifier | Base URL | Live Robots.txt HTTP Status | Product Detail Paths | Search & Query Paths | Category & Facet Paths | Adapter Status | Rationale & Policy |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Amazon India** | `amazon-in` | `https://www.amazon.in` | **200 OK** | **Allowed** (`/dp/*` crawlable by default) | **Disallowed** (`*/s?k=*&rh=*`, complex faceted queries) | **Disallowed** (Many `/b/` & browse category parameters) | **`fixture-only`** | Terms of Use prohibit scraping. Requires official PA-API 5.0 associate credentials for live ingestion. |
| **Flipkart** | `flipkart` | `https://www.flipkart.com` | **200 OK** | **Restricted / Challenges** (`/p/*`, Cloudflare challenge active) | **Disallowed** (`/ph/search/`, faceted search params) | **Disallowed** (Faceted filters `?colorSelected=`, `?layout=`) | **`fixture-only`** | Terms of Use prohibit automated bots. Official Affiliate JSON Feed required. CAPTCHA/WAF bypass prohibited. |
| **Croma** | `croma` | `https://www.croma.com` | **403 Forbidden** (Akamai EdgeSuite Access Denied) | **Blocked** by perimeter WAF | **Blocked** by perimeter WAF | **Blocked** by perimeter WAF | **`fixture-only` / `unsupported`** | Akamai WAF blocks robots.txt and catalog crawling. Honest `Source unavailable` state rendered per Constitution Rule 6. |
| **Reliance Digital**| `reliance-digital`| `https://www.reliancedigital.in`| **200 OK** | **Allowed** (Direct product URLs not in disallow list) | **Disallowed** (`/products?q=*`, `/*?*`, `/?page_no=*`) | **Disallowed** (`/*?*` query parameters, loyalty, credit) | **`fixture-only` / `unsupported`** | Prohibits non-human automated extraction. No public API. Honest `Source unavailable` state rendered per Constitution Rule 6. |

---

## Detailed Rules by Retailer

### 1. Amazon India (`amazon-in`)
- **Product Detail**: Default user-agent allows `/dp/{ASIN}`. Disallows internal review forms (`/gp/customer-reviews/write-a-review.html`), availability trackers (`/dp/product-availability/`), and buy box manipulators (`/exec/obidos/handle-buy-box`).
- **Search**: Disallows complex query patterns e.g. `*/s?k=*&rh=n*p_*p_*p_`.
- **Cart / Account**: Explicitly disallows `/gp/cart`, `/gp/history`, `/ap/signin`, `/wishlist/`.
- **SCRAPPY Posture**: `fixture-only`. In live mode, uses Amazon PA-API 5.0 with strict rate limits and associate tracking IDs.

### 2. Flipkart (`flipkart`)
- **Product Detail**: Allows standard bot crawling for indexed items, but Cloudflare WAF issues JavaScript challenges to non-browser requests.
- **Search & Filtering**: Explicitly disallows `/ph/search/`, plus dynamic query parameters including `*?colorSelected=`, `*?layout=`, `*?primarySection=`, `*?sizeSelected=`.
- **Cart / Reviews / Seller**: Disallows `/viewcart`, `/reviews/`, `/ps/` (seller pages), `/affiliateWidget/`.
- **SCRAPPY Posture**: `fixture-only`. In live mode, uses Flipkart Affiliate Feed API (`affiliate-api.flipkart.net`). No bot evasion or solver used.

### 3. Croma (`croma` - Tata Digital)
- **Robots.txt Access**: Returns HTTP 403 Access Denied from Akamai EdgeSuite (`errors.edgesuite.net`).
- **Product & Search**: All automated user-agents are rejected at perimeter WAF without dedicated IP whitelisting or enterprise syndication partnership.
- **SCRAPPY Posture**: `fixture-only` (marked `unsupported`). Renders honest `Source unavailable` badge in product comparison tables. No stealth proxy rotation or fingerprint spoofing.

### 4. Reliance Digital (`reliance-digital`)
- **Product Detail**: Individual static product URLs without query parameters are not explicitly disallowed.
- **Search & Navigation**: Explicitly disallows `/products?q=*`, `/c/resource-center/products?q=`, `/*?*` (all query strings), and pagination `/?page_no=*`.
- **Cart / Auth**: Disallows `/cart`, `/checkout`, `/auth/register`, `/profile`.
- **SCRAPPY Posture**: `fixture-only` (marked `unsupported`). Evaluated as unsupported due to terms of use prohibiting robotic access and lack of programmatic partner API.
