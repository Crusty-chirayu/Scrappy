# Source Documentation: Reliance Digital (`reliance-digital`)

> Status and policy rationale for Reliance Digital catalog integration.

---

## Adapter Metadata

- **Identifier**: `reliance-digital`
- **Merchant Name**: Reliance Digital
- **Base URL**: `https://www.reliancedigital.in`
- **Adapter Version**: `0.2.0`
- **Operational Status**: `fixture-only` / `unsupported` ("Source unavailable")
- **Extraction Protocol**: None (Scraping disallowed by policy)

---

## Legal & Compliance Posture (Constitution Rule 12)

### 1. Robots.txt Posture
- **[FACT]**: Reliance Digital's `robots.txt` at `https://www.reliancedigital.in/robots.txt` disallows user account, checkout, and search backend service paths.
- **[ASSUMPTION]**: High-frequency automated HTTP polling will trigger web application firewall (WAF) rate limits.

### 2. Terms of Service Posture
- **[FACT]**: Reliance Retail Terms of Use prohibit non-human automated querying, data mining, scraping, and spidering without explicit written license.
- **[FACT]**: Reliance Digital provides no public merchant API or affiliate feed.
- **[FACT]**: In strict accordance with Constitution Rule 6:
  - Scrappy surfaces an honest `Source unavailable` badge across UI compare cards.
  - The adapter is marked `fixture-only` and the circuit breaker reports `unsupported`.
  - No evasion or live scraping is attempted.
