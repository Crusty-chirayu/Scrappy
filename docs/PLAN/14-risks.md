# 14 — Risks

> Risk register + red-team findings and how the plan fixes them

---

## Risk Register

### R01 — Legal Liability for Scraping

**Category**: Legal/Business  
**Probability**: High (at launch)  
**Impact**: Critical  
**Description**: Croma and Reliance Digital ToS explicitly prohibit automated data extraction. India IT Act 2000 Section 43 creates civil liability for unauthorized computer access. Scraping against these ToS could result in legal action, takedown, or reputational damage.

**Mitigations in plan**:

- Croma and Reliance Digital ship as `Unsupported` with honest UI
- Amazon and Flipkart: official affiliate/product APIs only
- robots.txt enforced strictly (not bypassed under any circumstances)
- Honest bot identification, public bot page, opt-out contact
- Legal review gate before launch (BLOCKED in PROGRESS.md until done)

**Residual risk**: MEDIUM even with mitigations. A future source addition must go through the same legal analysis.

---

### R02 — Amazon PA-API Access Dependency

**Category**: Operational  
**Probability**: Medium  
**Impact**: High (for Compare value proposition)  
**Description**: Amazon PA-API requires an active affiliate account with qualifying sales (3-10/month). A new account without existing traffic won't have qualifying sales. This is a chicken-and-egg problem.

**Mitigations in plan**:

- Build and test against recorded fixtures locally
- PA-API adapter works in `local|live` modes
- Launch with Flipkart first (if it has lower barrier)
- Note in GO_LIVE_CHECKLIST.md as a blocking credential item with exact steps to bootstrap

**Residual risk**: MEDIUM. Need to bootstrap affiliate accounts pre-launch. This requires real traffic or a workaround strategy. Open Decision: see 16-open-decisions.md.

---

### R03 — False Product Match (Trust-destroying)

**Category**: Product Quality  
**Probability**: Medium (without controls), Low (with controls)  
**Impact**: Critical  
**Description**: A false match (e.g., 128GB phone listed under 256GB product) shown in price comparison destroys user trust. If a user buys the wrong variant because of a match error, that's a serious failure.

**Mitigations in plan**:

- Hard conflict rules (storage, pack size, model, size, condition) ALWAYS prevent auto-accept
- 99.5% precision gate on adversarial benchmark in CI
- "Possible match" UI state: never silently merged, user can see confidence
- Human review queue for 0.75-0.96 score band
- LLM can NEVER override hard conflicts

**Residual risk**: LOW with these controls. The 0.5% failure rate on adversarial set means ~1 in 200 adversarial pairs could be wrong. These will be in the "Possible match" category, not auto-accepted.

---

### R04 — Stale Price Data Damaging User Decisions

**Category**: Data Quality  
**Probability**: High (without controls)  
**Impact**: High  
**Description**: A user sees "INR 89,999" but the actual price is INR 95,000. They click through and feel deceived. This is especially bad for deal scores.

**Mitigations in plan**:

- Stale badge on any data > 24h old
- Deal badge suppressed on stale data
- "Checked X min ago" always shown with refresh option
- Source health monitoring with circuit breaker

**Residual risk**: LOW-MEDIUM. Stale data will occur (sources go down). The key is never presenting it as fresh.

---

### R05 — pg-boss Incompatibility with Supabase Transaction Pooler

**Category**: Technical  
**Probability**: HIGH (this is a known issue)  
**Impact**: High (would break the queue entirely)  
**Description**: pg-boss requires advisory locks and LISTEN/NOTIFY. Supabase's Supavisor transaction pooler doesn't support persistent session state needed for these. This is not an assumption - it's a documented constraint.

**Mitigations in plan**:

- Workers connect via session mode (direct PG port 5432), not the pooler
- This is the standard recommendation for pg-boss on Supabase
- Connection limits on direct PG (60 on free, 90 on Small) must be managed: workers use a small, controlled connection pool

**Residual risk**: LOW. The mitigation is clear and implementable. Connection limit must be monitored.

---

### R06 — DPDP Act Compliance Gap

**Category**: Legal/Regulatory  
**Probability**: Medium  
**Impact**: High  
**Description**: India's DPDP Act 2023 is relatively new. Rules and exemptions are still being clarified. Non-compliance can result in penalties up to INR 250 crore for significant data fiduciaries.

**Mitigations in plan**:

- Privacy-by-design in schema (minimal collection, retention limits)
- Data export and delete flows
- Legal review gate (BLOCKED until lawyer reviews privacy policy, ToS, DPA template)
- No scraping of personal data

**Residual risk**: MEDIUM until legal review complete. This is a go-live blocker.

---

### R07 — Supabase Storage Cost at Scale

**Category**: Financial  
**Probability**: Low-Medium  
**Impact**: Medium  
**Description**: Supabase Storage costs $0.021/GB above 100GB included. At scale (10k products × 5 images × 500KB = 25GB/month for images alone), costs grow. Egress is $0.09/GB above 250GB.

**Mitigations in plan**:

- Images are hashed (deduplication prevents storing same image twice)
- CDN caching reduces egress
- Budget checkpoint at 10k users
- Migration path to Cloudflare R2 documented (no code changes needed: StorageAdapter interface)

**Residual risk**: LOW-MEDIUM. Need to monitor carefully.

---

### R08 — Razorpay Subscription Complexity

**Category**: Technical/Regulatory  
**Probability**: Medium  
**Impact**: Medium  
**Description**: RBI e-mandate compliance (2026 framework) has specific requirements: pre-debit notifications 24h before charge, AFA for registration, customer control over mandates. Implementation errors could result in failed payments or RBI compliance issues.

**Mitigations in plan**:

- Razorpay handles most compliance requirements at the payment layer
- Build against Razorpay test mode first (FakeBillingProvider for local)
- Verify all flows in test mode before live credentials
- Legal/tax review for GST invoicing format

**Residual risk**: MEDIUM. The BillingProvider adapter isolates risk; if Razorpay changes behavior, only the adapter needs updating.

---

### R09 — Browser Worker Cost Explosion

**Category**: Financial  
**Probability**: Medium  
**Impact**: Medium  
**Description**: Playwright browser minutes are the most expensive resource. A bug or abuse vector could cause runaway costs (e.g., an extractor in an infinite loop, or a malicious user trying to consume all browser minutes).

**Mitigations in plan**:

- Per-run hard limits (60s, 40 req, 300MB)
- Per-workspace monthly browser-minute budget (plan-based)
- Hard-cap option for workspaces
- Metered billing with clear overage pricing
- Abuse detection: alert if workspace consumes > 3x average in 1 day

**Residual risk**: LOW with controls. The hard caps ensure no single run can cause excessive cost.

---

### R10 — Scope Creep / Underestimating Quality Gates

**Category**: Execution  
**Probability**: High  
**Impact**: High  
**Description**: The spec is extremely comprehensive. The hardening phase (Phase 6) is historically underestimated. Shipping with known defects damages launch and reputation.

**Mitigations in plan**:

- "Zero known defects" gate is non-negotiable
- DEFECTS.md protocol: every bug logged, fixed, regression-tested before closing
- Roadmap estimates include pessimistic column (127d total)
- Phased shipping: Compare (P4) can be soft-launched before Extract/Intelligence (P5)

**Residual risk**: MEDIUM. The timeline estimate is generous but realistic. Cutting scope is acceptable; cutting quality is not.

---

## Red-Team Findings and Fixes

The following issues were found during self-review of this plan:

### Finding 1: pg-boss + Supabase Transaction Pooler Incompatibility

**Before red-team**: Plan initially inherited pg-boss queue without explicit connection mode specification.  
**Attack**: Supabase's default pooler (Supavisor) uses transaction mode; pg-boss advisory locks fail silently.  
**Fix**: Explicitly documented in 04-architecture.md, 05-supabase-design.md: workers MUST use session mode (port 5432). Added as Risk R05.

### Finding 2: Amazon PA-API Chicken-and-Egg

**Before red-team**: Plan assumed PA-API access was straightforward.  
**Attack**: New affiliate account can't get PA-API access without qualifying sales. Can't get sales without traffic.  
**Fix**: Documented in 07-scraping-matching.md. Marked as go-live credential item. Open Decision in 16-open-decisions.md.

### Finding 3: Scraping Croma/Reliance Digital ToS Violation

**Before red-team**: Plan had 4 initial adapters including Croma and Reliance Digital as active scrapers.  
**Attack**: Both sites' ToS prohibit scraping. India IT Act creates civil liability.  
**Fix**: Both shipped as `Unsupported`. Plan documents this as Risk R01. ADR 0002 documents the decision.

### Finding 4: DPDP Act Applies to Extract Product

**Before red-team**: Privacy analysis focused only on Compare user data.  
**Attack**: Extract processes data on behalf of business customers = Scrappy is a Data Processor for that data. Requires Data Processing Agreements.  
**Fix**: Documented dual role in 09-security-privacy.md. DPA template required before launch (BLOCKED in checklist).

### Finding 5: Fake Discount Detection Missing from MVP Scope

**Before red-team**: Fake discount detection was vague.  
**Attack**: Without MRP inflation detection, the "Great Deal" badge on a fake discount destroys trust.  
**Fix**: Explicitly designed in 08-ai-plan.md (F3) and 12-cost-and-billing.md. Named critical test T7 covers it. The pricing engine (Phase 4) includes fake-discount detector as required.

### Finding 6: Alert Deduplication Storm Not Tested

**Before red-team**: Alert deduplication was designed but not named as a critical test.  
**Attack**: 1,000 price changes trigger 1,000 emails to one user. Spam, user anger, email deliverability damaged.  
**Fix**: Named critical test T19 ("duplicate_storm") is now required for launch gate.

### Finding 7: Supabase Realtime Doesn't Work Without RLS Consideration

**Before red-team**: Realtime channels were described without RLS context.  
**Attack**: Without RLS on Realtime, one user could subscribe to another workspace's price updates.  
**Fix**: Added to 05-supabase-design.md: all Realtime subscriptions are authenticated; RLS policies apply to DB change events.

### Finding 8: Chart Accessibility Gap

**Before red-team**: Charts were described visually but accessibility was not explicitly addressed.  
**Attack**: A blind user using screen reader cannot get price history data from a chart.  
**Fix**: "View as table" toggle is mandatory on all charts (02-ui-design-spec.md). Chart keyboard scrubbing with screen reader announcement. Named in quality plan.
