# 09 — Security & Privacy

> Threat model (STRIDE), tenancy isolation, abuse, DPDP, responsible scraping

---

## Threat Model (STRIDE)

### S — Spoofing

| Threat                                | Target            | Mitigation                                                                                       |
| ------------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------ |
| Attacker impersonates another user    | Auth endpoints    | Supabase Auth: rate-limited magic links, Google OAuth with PKCE; session revocation on suspicion |
| Attacker replays a webhook signature  | Webhook endpoints | HMAC-SHA256 + timestamp; replay window 5 minutes; reject timestamps outside window               |
| Attacker forges API key               | API endpoints     | Keys stored as SHA-256 hash; raw key shown once; secure comparison (crypto.timingSafeEqual)      |
| Attacker spoofs ScrappyBot User-Agent | N/A (outbound)    | No mechanism to prevent others claiming our UA; our bot page and honest behavior is the defense  |

### T — Tampering

| Threat                           | Target           | Mitigation                                                                                           |
| -------------------------------- | ---------------- | ---------------------------------------------------------------------------------------------------- |
| SQL injection via user input     | DB layer         | Parameterized queries only (Drizzle + Postgres driver); no string interpolation in queries           |
| XSS via scraped product content  | Render layer     | All scraped strings treated as untrusted; React escapes by default; DOMPurify for any HTML rendering |
| Tampered webhook payload         | Webhook receiver | HMAC validation required; reject if signature missing or invalid                                     |
| Tampered JWT claims              | Auth             | JWTs signed by Supabase with RS256; verify signature on every request                                |
| Race condition in usage metering | Usage events     | Idempotency keys on every usage_event; `UNIQUE (idempotency_key)` at DB level                        |

### R — Repudiation

| Threat                                | Mitigation                                                                                                  |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| User denies taking a sensitive action | append-only audit_log for: API key create/revoke, member add/remove/role-change, plan change, admin actions |
| Operator denies making a change       | Admin console: every action requires reason field; logged with actor_id, IP, timestamp                      |
| Denial of webhook delivery            | webhook_deliveries table with attempts, status, timestamps, external_id                                     |

### I — Information Disclosure

| Threat                                 | Target     | Mitigation                                                                            |
| -------------------------------------- | ---------- | ------------------------------------------------------------------------------------- |
| Cross-tenant data leakage              | All tables | RLS deny-by-default; `scoped()` helper in all app code; cross-tenant test suite in CI |
| API key exposed in logs                | Logs       | Log only key prefix (first 8 chars), never the raw key or hash                        |
| Stack traces in error responses        | API errors | Sanitized error envelope; full errors in structured logs only; Sentry for server-side |
| SSRF: attacker reads internal metadata | URL fetch  | SSRF guard blocks private IPs, metadata endpoints, redirects re-checked               |
| Sensitive data in exported datasets    | Exports    | Export scoped to workspace; RLS enforced; SSRF guard on webhook delivery URLs         |
| User data in scraped content           | Scraping   | Never scrape login-walled or personal data pages; Constitution Rule 6                 |

### D — Denial of Service

| Threat                                          | Mitigation                                                                                  |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Abuse via extraction loops                      | Per-workspace concurrency caps; per-run resource limits (60s, 40 req, 300MB)                |
| Zip bomb in scraped response                    | Response size cap: 10MB; Content-Type validation; streaming with size limit                 |
| Huge page causing OOM in browser worker         | 300MB memory limit per browser context; kill and fail run if exceeded                       |
| Alert storm (1000 price changes -> 1000 emails) | Deduplication: one alert per threshold-crossing per item; re-arm only when price rises > 3% |
| API rate limit evasion via key rotation         | Per-IP rate limiting (global), per-workspace aggregate limit                                |
| Signup abuse                                    | reCAPTCHA or Cloudflare Turnstile on signup; rate limit per IP                              |
| Workspace data hoarding                         | Storage quotas per plan; hard caps enforced                                                 |

### E — Elevation of Privilege

| Threat                                       | Mitigation                                                                                                             |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Viewer role reads/writes admin resources     | RBAC permission matrix enforced in API middleware AND DB RLS; permission-denied screens designed                       |
| Cross-workspace IDOR on :id routes           | `scoped()` helper ensures every query includes workspace_id; direct UUID access requires workspace membership          |
| Worker process with excessive DB permissions | Least-privilege DB roles: `app_role`, `worker_role`, `admin_role`, `readonly_role`; each with minimum necessary grants |
| Compromised API key accesses all workspaces  | API keys scoped to one workspace; scope array in api_keys table enforced in middleware                                 |
| Admin impersonation of users                 | Admin impersonation is read-only + time-boxed (15min) + audit logged; no write access                                  |

---

## Tenancy Isolation (Deep Dive)

### Layer 1: Application Layer

- `scoped(db, workspaceId)` helper is mandatory for all queries on tenant tables
- Custom ESLint rule flags any direct query on a tenant table without `scoped()`
- CI fails on ESLint violations

### Layer 2: Database Layer (RLS)

- RLS enabled on every table; deny by default
- Policies use JWT claims: `auth.uid()` and custom `workspace_id` claim
- Service-role key bypasses RLS — ONLY used in server/worker code
- Never ship service-role key to browser

### Layer 3: Cross-Tenant Attack Tests

```typescript
// supabase/tests/rls/cross-tenant.test.ts
describe("Cross-tenant isolation", () => {
  it("user A cannot read user B watch_items", async () => {
    const userADb = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { session: sessionA },
    });
    const result = await userADb.from("watch_items").select("*").eq("workspace_id", workspaceB_id);
    expect(result.data).toHaveLength(0);
  });

  it("API key from workspace A cannot access workspace B runs", async () => {
    // Test via HTTP API with workspace A API key
    const response = await fetch(`/v1/workspace/${workspaceB_id}/runs`, {
      headers: { Authorization: `Bearer ${apiKeyA}` },
    });
    expect(response.status).toBe(403);
  });
});
```

---

## Input Validation

- **Zod at every boundary**: request body, query params, path params, environment variables, config files
- **No raw string interpolation** in SQL (Drizzle uses parameterized queries)
- **Output encoding**: React escapes by default; `dangerouslySetInnerHTML` banned by ESLint rule
- **File upload**: MIME type validation (magic bytes, not just Content-Type header); size limits; virus scan (ClamAV or similar) before storage
- **URL validation**: SSRF guard before any outbound fetch of user-supplied URL

---

## Security Baseline (per Constitution Rule 7)

### Headers

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-{nonce}'; ...
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
```

### Secret Management

- All secrets via environment variables (never hardcoded)
- `gitleaks` in CI pre-commit and PR checks
- `.env.example` per app (committed); `.env` (gitignored)
- `INTEGRATION_MODE=local|live` switch: local mode uses fake/test adapters

### API Key Security

- Pattern for GitHub Secret Scanning: `scp_live_[A-Za-z0-9]{43}` — registered with GitHub
- Prefix `scp_live_` identifies scrappy keys in logs/dumps
- SHA-256 stored; raw shown once; no recovery
- Rotation: generates new key, old key remains valid for 24h grace period

### Dependency Security

- `npm audit` in CI (block on HIGH/CRITICAL)
- Renovate bot for automated dependency updates (auto-merge patches, review minors/majors)
- Package pinning in production lockfile

---

## DPDP Act Compliance (India DPDP Act 2023)

**FACT**: India DPDP Act 2023 applies to SCRAPPY.

### Our Dual Role

1. **Data Fiduciary**: for our own users' data (profiles, watchlists, emails, billing info)
2. **Data Processor**: when processing Extract customers' scraped data on their behalf

### Key Obligations

| Obligation                  | How We Meet It                                                                   |
| --------------------------- | -------------------------------------------------------------------------------- |
| Lawful basis for processing | Explicit consent at signup; magic link implies consent; clear privacy policy     |
| Data minimization           | Only collect what's needed; no tracking beyond stated purpose                    |
| User rights: access         | `/account/data-export` endpoint; JSON download within 72h                        |
| User rights: correction     | Account settings allow name/email update                                         |
| User rights: erasure        | `/account/delete` self-serve; purges data in 30 days; audit log retained 2 years |
| Data retention limits       | Raw observations 13 months; exports 7 days; deleted account data 30 days         |
| Breach notification         | Internal runbook: notify affected users + DPDPB within 72h of discovery          |
| DPA for B2B Extract         | Data Processing Agreement template for Extract business customers                |
| Security safeguards         | TLS, encryption at rest (Supabase), bcrypt for any stored credentials            |
| Children's data             | No service to under-18; collect age declaration at signup                        |

### What We Do NOT Do

- No cross-context behavioral tracking
- No selling user data
- No scraping of personal data pages (login-walled content)
- No linking extracted data to individual users without explicit consent
- No profiling for advertising

### RECOMMENDATION: Legal Review Gate

Before launch, have a qualified privacy lawyer review:

1. Privacy Policy draft
2. Data Processing Agreement template
3. Cookie policy (only if non-essential cookies exist)
4. Terms of Service

---

## Responsible Scraping Policy (Constitution Rule 6)

### What We DO

- Identify ourselves: `ScrappyBot/1.0 (+https://scrappy.in/bot)` User-Agent
- Publish a bot page at `/bot` explaining behavior + opt-out contact
- Respect robots.txt: fetch, cache 24h, enforce strictly
- Rate-limit: default 1 req / 2s / host
- Prefer official feeds/APIs over scraping wherever available
- Backoff on rate limiting and errors
- Show "Source unavailable" honestly when access is restricted

### What We DO NOT Do

- No CAPTCHA solving (ever)
- No fingerprint evasion / headless browser spoofing
- No login-wall scraping / credential stuffing
- No personal data scraping
- No bypassing robots.txt disallow directives
- No scraping at speeds that degrade target site performance
- No scraping of non-public content

### Opt-Out

Any website operator can contact bot@scrappy.in to request removal. We process opt-out requests within 5 business days and add them to our blocklist.

---

## Abuse Controls

| Vector                                 | Control                                                                         |
| -------------------------------------- | ------------------------------------------------------------------------------- |
| Extraction loops (run 1000 extractors) | Per-workspace concurrent run limit (plan-based); per-run caps                   |
| Browser minute hoarding                | Hard cap per workspace per billing period; metered billing; hard-stop option    |
| API key farming                        | Signup rate limit; phone/email verification; manual review flag for high volume |
| Webhook bombing                        | Webhook delivery rate: max 100/min per endpoint; dead-letter after 3 failures   |
| Storage abuse                          | Per-workspace storage quota; auto-delete exports after 7 days                   |
| Data export abuse                      | Rate limit on export triggers (5/hour); max export size 500MB                   |
| Malicious extraction targets           | SSRF guard; response size cap 10MB; Content-Type validation; execution timeout  |
