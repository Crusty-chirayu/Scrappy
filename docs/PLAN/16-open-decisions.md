# 16 — Open Decisions

> Every decision needed from you, each with my recommendation. These are the only things that block autonomous execution.

---

## D01 — Legal Entity & GST Registration

**Question**: Do you have a registered legal entity (company/LLP/sole prop) in India?

**Why this matters**: Required for Razorpay KYC, Amazon/Flipkart affiliate program registration, GST invoicing for B2B customers. Cannot go live without a legal entity. Does not block development.

**Needed by**: Phase 7 (Launch)

**My recommendation**: If not already done, start the process now in parallel with development. A Private Limited company (Pvt Ltd) is typical for SaaS businesses in India.

**Options**:

1. Already have a registered entity -> Provide company name, GSTIN, PAN
2. Will register before launch -> Note the timeline; it can take 4-8 weeks
3. Starting with sole proprietorship -> Acceptable but upgrade to Pvt Ltd before scaling

---

## D02 — Pricing Strategy: Real Numbers

**Question**: What are the actual prices for Intelligence and Extract plans?

**Why this matters**: The plan has placeholder prices (INR 999/2,999/7,999 for Intelligence; INR 499/1,999/5,999 for Extract). These cannot be published until validated against measured costs AND willingness-to-pay research.

**Needed by**: Before Phase 7 (marketing site publish)

**My recommendation**:

1. During Phase 4-5, measure actual costs per unit on real infrastructure
2. Talk to at least 3 potential customers per tier about willingness-to-pay
3. Update pricing table with validated numbers marked as real before publishing

**Blocker**: Does NOT block development. Placeholder numbers in code are fine until launch.

---

## D03 — Amazon PA-API Bootstrapping Strategy

**Question**: How do you want to handle the Amazon affiliate qualifying-sales catch-22?

**Why this matters**: Amazon PA-API requires 3-10 qualifying sales/month to maintain access. A brand-new account won't have these. This determines how soon Amazon data is available in Compare.

**Needed by**: Phase 3-4 (live data)

**My recommendation**: Launch Flipkart feed first (likely lower barrier). For Amazon, two options:

1. Use an existing personal Amazon Associates account that already has qualifying sales to bootstrap. Provides immediate API access.
2. Accept that Amazon data won't be available on day 1; launch with Flipkart only; add Amazon when qualifying sales are built up organically.

**Options**:
A. Use existing personal Associates account temporarily -> faster but creates personal/business boundary issue
B. Launch without Amazon, add later -> cleaner but weaker launch data coverage
C. Find an affiliate partner who already has PA-API access -> investigate this approach

---

## D04 — Croma/Reliance Digital: Partnership Outreach?

**Question**: Do you want to proactively reach out to Croma and Reliance Digital for a data partnership?

**Why this matters**: Without official feeds, these sources remain `Unsupported`. This significantly limits Compare's coverage of the Indian market (Croma and Reliance are major electronics retailers).

**Needed by**: Anytime; decision affects roadmap scope

**My recommendation**: YES, reach out to both through their business partnerships/API teams. Frame it as a traffic-driving data partnership (you drive users to their stores via affiliate links; they provide a product data feed). This is a business development activity, not a technical one.

**Risk of outreach**: Low. The worst they can say is no.
**ADR**: See /docs/adr/0002-croma-unsupported.md

---

## D05 — Legal Review: Privacy Counsel

**Question**: Do you have a qualified privacy/tech lawyer in India for review?

**Why this matters**: Privacy Policy, Terms of Service, and Data Processing Agreement drafts must be reviewed by Indian counsel familiar with DPDP Act 2023 before go-live. This is a hard legal requirement, not optional.

**Needed by**: Phase 7 (Launch) — BLOCKING

**My recommendation**: Engage a law firm specializing in Indian tech law (e.g., Induslaw, Cyril Amarchand Mangaldas, or smaller boutiques like Ikigai Law). Budget INR 50,000-2,00,000 for the initial review. Start the engagement during Phase 5 so you have time for revisions.

---

## D06 — Hosting Region

**Question**: Which region should Fly.io deploy to for API and workers?

**Why this matters**: Supabase projects can be hosted in specific regions. The API/workers should be in the same or closest region to Supabase to minimize DB latency.

**Needed by**: Phase 1 (infrastructure setup)

**My recommendation**:

- If Supabase project region = `ap-south-1` (Mumbai): Deploy Fly.io to `bom` (Bombay/Mumbai region)
- Verify Supabase project region when creating the staging project
- Vercel web automatically deploys to Edge close to users (no region choice needed)

**My recommended choice**: `ap-south-1` (Mumbai) for Supabase + `bom` for Fly.io workers. This gives lowest latency for Indian users.

---

## D07 — Compare: Free Forever, or Freemium?

**Question**: Should Compare always be free, or is there a paid Pro tier later?

**Why this matters**: The spec says "free forever" for Compare. The plan commits to this. If you later want a paid tier, it changes the product promise and can damage trust.

**Needed by**: Before launch (this is a brand/product promise)

**My recommendation**: COMMIT to "free forever" for Compare. Monetize only through affiliate commissions. The trust this builds is more valuable than the subscription revenue from Compare. If needed, add Pro features (more watchlist items, deeper history) as optional paid add-ons later, but keep the core product free. Users who paid for your competitors and feel burned are your best acquisition channel.

**Options**:
A. Free forever (recommended)
B. Free core + paid Pro tier (watchlist, alerts, history depth)
C. Ad-supported (NOT recommended - damages trust and brand)

---

## D08 — Admin Console: Who Has Access?

**Question**: Who should be on the admin allowlist?

**Why this matters**: The admin console (apps/admin) has full visibility and limited write access to all data. It must be on a strict IP allowlist + MFA.

**Needed by**: Phase 7 (Launch)

**My recommendation**:

1. List the specific people who need admin access
2. Collect their static IP addresses (or use a VPN/bastion host)
3. Add to the allowlist in admin deployment config
4. Enforce MFA (passkeys or TOTP)

---

## D09 — Intelligence Report: AI Summary or Template-Only?

**Question**: Do you want AI-generated prose summaries in Intelligence reports at launch?

**Why this matters**: AI summaries (Feature F3 in 08-ai-plan.md) add ~$10/day in AI costs at moderate scale. They also require more careful factual grounding checks. The fallback template-based report is always available.

**Needed by**: Phase 5

**My recommendation**: Ship with template-based reports at launch (zero AI cost, always factual). Add AI prose summaries as a Phase 5.5 feature once the base reports are validated. This reduces risk at launch.

---

## D10 — Domain Name

**Question**: What is the primary domain? `scrappy.in` or another?

**Why this matters**: The domain affects the bot URL in the User-Agent string, all documentation links, SEO canonical URLs, and email sender domain.

**Needed by**: Phase 1 (set in .env.example as placeholder, real value needed before staging)

**My recommendation**: `scrappy.in` if available. Verify and register immediately. Also register `scrappy.co.in` and common misspellings as defensive registrations.

---

## Summary: What You Need to Decide NOW (Pre-Development)

| Decision                  | Urgency        | Blocks                 |
| ------------------------- | -------------- | ---------------------- |
| D06: Hosting region       | Before staging | Phase 1 infra          |
| D07: Compare free forever | Before code    | Brand promise in code  |
| D10: Domain name          | Before staging | Bot UA, canonical URLs |

## Summary: What You Need to Decide Before Launch

| Decision               | Urgency      | Blocks                 |
| ---------------------- | ------------ | ---------------------- |
| D01: Legal entity      | By Phase 6   | Go-live (Razorpay KYC) |
| D02: Real pricing      | By Phase 7   | Marketing site publish |
| D03: Amazon strategy   | By Phase 3-4 | Live Amazon data       |
| D04: Croma/RD outreach | Anytime      | Future source coverage |
| D05: Privacy counsel   | By Phase 6   | Legal review gate      |
| D08: Admin allowlist   | By Phase 7   | Admin console deploy   |
| D09: AI reports        | By Phase 5   | Report feature scope   |
