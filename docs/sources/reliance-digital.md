# Source Documentation: Reliance Digital (`reliance-digital`)

> Status and policy rationale for Reliance Digital catalog integration.

---

## Adapter Metadata

- **Identifier**: `reliance-digital`
- **Merchant Name**: Reliance Digital
- **Base URL**: `https://www.reliancedigital.in`
- **Adapter Version**: `0.2.0`
- **Current Operational Status**: `unsupported` ("Source unavailable")

---

## Policy & Compliance Rationale

In strict compliance with **Constitution Rule 6**:
> "Responsible scraping: honor robots.txt, per-host rate limits, identify the bot, no CAPTCHA solving, no auth bypass, no stealth/fingerprint evasion... Unsupported sources show an honest 'Source unavailable' state."

1. **No Public Catalog Feed**:
   - Reliance Digital lacks an open merchant feed API for real-time price monitoring.
2. **Access Policy**:
   - Terms of use prohibit non-human automated querying.
3. **Platform Behavior**:
   - Scrappy surfaces an honest `Source unavailable` badge across the UI.
   - Circuit breaker and adapter report `health: "unsupported"` and `lastError: "Official affiliate feed unavailable; scraping disallowed by policy"`.
