# Source Documentation: Croma (`croma`)

> Status and policy rationale for Croma electronics catalog integration.

---

## Adapter Metadata

- **Identifier**: `croma`
- **Merchant Name**: Croma (Tata Digital)
- **Base URL**: `https://www.croma.com`
- **Adapter Version**: `0.2.0`
- **Operational Status**: `fixture-only` / `unsupported` ("Source unavailable")
- **Extraction Protocol**: None (Scraping disallowed by policy)

---

## Legal & Compliance Posture (Constitution Rule 12)

### 1. Robots.txt Posture
- **[FACT]**: Croma publishes `robots.txt` at `https://www.croma.com/robots.txt` disallowing checkout, cart, internal API endpoints, and private search faceted routes.
- **[FACT]**: Croma employs bot protection and rate limits on catalog pages.
- **[ASSUMPTION]**: Unauthenticated crawling without a commercial arrangement will be blocked by perimeter security.

### 2. Terms of Service Posture
- **[FACT]**: Croma Terms of Use prohibit automated extraction, harvesting, or spidering of website content or pricing data without prior written permission from Infiniti Retail Ltd.
- **[FACT]**: Croma currently offers no public self-service affiliate API or programmatic product feed for third-party developers.
- **[FACT]**: In strict compliance with Constitution Rule 6 ("Unsupported sources show an honest 'Source unavailable' state"):
  - Scrappy refuses stealth evasion, proxy rotation, and CAPTCHA bypass.
  - Queries for Croma products show the honest `Source unavailable` status badge.
  - Any local simulation or testing runs strictly against static fixtures (`fixture-only`).
- **[RECOMMENDATION]**: Direct commercial outreach to Tata Digital for official catalog syndication is tracked under Open Decision **D04**.
