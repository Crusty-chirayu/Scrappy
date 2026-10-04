# Source Documentation: Croma (`croma`)

> Status and policy rationale for Croma electronics catalog integration.

---

## Adapter Metadata

- **Identifier**: `croma`
- **Merchant Name**: Croma (Tata Digital)
- **Base URL**: `https://www.croma.com`
- **Adapter Version**: `0.2.0`
- **Current Operational Status**: `unsupported` ("Source unavailable")

---

## Policy & Compliance Rationale

In strict compliance with **Constitution Rule 6**:
> "Responsible scraping: honor robots.txt, per-host rate limits, identify the bot, no CAPTCHA solving, no auth bypass, no stealth/fingerprint evasion... Unsupported sources show an honest 'Source unavailable' state."

1. **No Public Affiliate Feed**:
   - Croma does not offer a public affiliate API or open catalog data feed for third-party aggregators.
2. **Terms of Service Restrictions**:
   - Croma's website terms explicitly prohibit automated extraction, harvesting, and scraping.
3. **Honest Platform Behavior**:
   - Scrappy does not deploy headless proxy cycling or stealth evasion.
   - Any query attempting to look up prices on Croma directly reports an honest status `unsupported` with badge `Source unavailable`.
   - Contact has been flagged under Open Decision **D04** for future commercial partnership outreach.
