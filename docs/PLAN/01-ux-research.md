# 01 — UX Research

> SCRAPPY Stage A Planning | Claims labeled FACT / ASSUMPTION / INFERENCE / RECOMMENDATION

---

## Personas

### P1: The Cautious Shopper ("Priya, 28, Bengaluru")

- Buys electronics/appliances 4-6x/year, budget INR 10k-80k
- Pain: "I never know if the 'sale' is real or if the price will drop next week"
- Behavior: checks 2-3 sites manually, screenshots prices, asks WhatsApp group
- Goals: confidence in timing, proof the discount is genuine, one trustworthy source
- Frustrations: price trackers that show wrong/stale prices, deals that "expired" 3 days ago
- Success metric: buys confidently without second-guessing

### P2: The Power Shopper ("Rahul, 34, Mumbai")

- Tracks 10-20 products at once, price-alert junkie
- Pain: "Alerts are always late or wrong model/variant"
- Behavior: multiple alert tools simultaneously, checks each morning
- Goals: fastest accurate alerts, variant-aware tracking, historical proof
- Frustrations: false alerts (variant mismatch), no price history depth
- Success metric: never misses a genuine deal; saves measurably

### P3: The Pricing Analyst ("Deepa, 31, Delhi, works at brand/seller")

- Monitors 50-200 SKUs across 4-5 retailers weekly
- Pain: "I spend 4 hours/week manually collecting competitor prices into a spreadsheet"
- Behavior: Excel, manual copy-paste, one junior doing data collection
- Goals: automated daily data, alerts on competitor undercut, market position chart
- Frustrations: data is always 2-3 days old; no history; no audit trail
- Success metric: < 30 min/week on data collection; real-time alerts

### P4: The Developer / Data Team ("Arjun, 26, Remote")

- Needs structured web data for a side project or analytics pipeline
- Pain: "Scraping is 80% maintenance, 20% actual work"
- Behavior: Python scripts, cron jobs, ad-hoc Playwright, constant breakage
- Goals: reliable extraction, scheduling, easy output (CSV/API/webhook)
- Frustrations: no visual selector tool, no monitoring, schema drift breaks pipelines
- Success metric: first extraction working in < 5 minutes; runs without babysitting

---

## User Journeys

### Journey 1: Shopper finds and tracks a product (Compare)

1. Searches "Samsung 65 inch QLED" on scrappy.in
2. Sees search results with best price, retailer count, deal badge
3. Clicks product -> sees price history chart (step-line, 1Y)
4. Sees "Why is this a deal?" popover -> "INR 8,400 below 90-day median. MRP unchanged 140 days."
5. Sets price alert at target price
6. 3 days later: email alert -> clicks -> lands on product page showing new price
7. Clicks "Go to store" (affiliate link, disclosed)

**Friction points to fix:**

- Variant confusion (64GB vs 128GB phone showing same price) -> variant selector + hard conflict in matching
- Stale price shown as current -> Stale badge + dim + no deal badge rule
- Alert email looks generic -> React Email branded templates

### Journey 2: Seller sets up competitor monitoring (Intelligence)

1. Signs up, creates Business workspace
2. Pastes product URLs or CSV of their SKUs
3. System auto-suggests competitors from the graph
4. Reviews and confirms matches (side-by-side review UI)
5. First market view appears within minutes (uses existing catalog data)
6. Creates rule: "Alert when competitor undercuts me by > 5%"
7. Receives weekly competitor briefing report (email + shareable link)

**Friction points to fix:**

- Match review too slow -> side-by-side with one-key decision
- Report too generic -> grounded in real metrics, numbered sentences
- Onboarding time-to-value > 10 min -> auto-suggest competitors from graph immediately

### Journey 3: Developer builds first extractor (Extract)

1. Signs up, creates Developer workspace, goes to Extract
2. Enters URL -> sees robots.txt check result upfront
3. Sees split view: browser stream + schema editor
4. Hovers over product list -> "24 similar items found, use as list?" -> clicks Yes
5. Clicks price field -> creates "price" field, type: currency
6. Test run: sees 24 rows with fill rate, validation errors in plain language
7. Schedules daily 9 AM IST, webhook to their endpoint
8. First webhook arrives within 24 hours

**Friction points to fix:**

- SSRF check not visible -> show it prominently at URL entry
- Selector breaks after site update -> fallback chain + "Why did this break?" AI diff

---

## Friction Audit (Key Problems We Must Solve)

| Problem                          | Impact             | Solution in Plan                                                 |
| -------------------------------- | ------------------ | ---------------------------------------------------------------- |
| Variant mismatch in price alerts | Trust-destroying   | Hard conflict rules; variant-aware matching; "Possible match" UI |
| Stale prices shown as current    | Trust-destroying   | Stale badge + 24h rule; no deal badge on stale                   |
| Fake discounts not flagged       | Core brand promise | MRP inflation detector; transparent deal score                   |
| No search = can't find product   | Acquisition loss   | URL paste direct resolution; typo correction; Hinglish synonyms  |
| Alert email looks spammy         | Retention          | React Email branded templates; one-click unsubscribe RFC 8058    |
| Extract builder requires desktop | Expected           | Mobile = monitor-only; clear "Open on desktop" state             |
| Intelligence onboarding > 10 min | Activation loss    | Auto-suggest competitors from graph; pre-load existing data      |

---

## Information Architecture

### Global Navigation

```
Compare    Intelligence    Extract    [Workspace Switcher]    [Bell]    [Avatar]
```

### Compare IA

```
Home/Search
  Autocomplete (Products, Brands, Categories, "Compare this URL")
  Category Rail
  Today's Deals
  Recently Viewed
Results (URL-synced state)
  Facets (category, brand, price, retailer, availability, discount%, specs)
  Sort (relevance, price asc/desc, newest, deal score)
  Infinite scroll
Product Page
  Header (title, variant selector, breadcrumb)
  Best Price block
  Offers Table (all retailers)
  Price History Chart (1M/3M/1Y/All + table toggle)
  Specs
  Alternatives
  Set Alert inline
Compare View (2-4 products side-by-side)
Watchlist
  Items with target progress bar
  Bulk actions
Alerts (create/edit/history)
Deals Feed
Category Pages
Account / Settings
```

### Intelligence IA

```
Overview (What changed in 24h)
Products (tracked products table)
  Row Drawer (history chart, competitor moves)
Competitors (per-competitor profile)
Market View (dot-strip, price index over time)
Rules & Alerts (rule builder)
Reports (scheduled briefings)
Team (invites, roles)
Billing & Usage
```

### Extract IA

```
Projects
  Extractors (list)
    Builder (split view: browser + schema)
    Test Run
    Runs (timeline, logs, stats)
    Datasets (versioned records)
    Exports
    Schedule
    Webhooks
API Keys
Usage
Documentation (in /docs)
```

---

## Navigation Patterns

### Desktop (>= 1024px)

- **Compare**: Top navigation bar with search always visible. Left facets sidebar in results.
- **Intelligence**: Left sidebar with workspace switcher. Main content area max 1280px.
- **Extract**: Left sidebar (projects/extractors). Right panel in builder. Full-width for datasets.

### Tablet (768-1023px)

- Compare: Facets in a drawer. Top search bar. Collapsed navigation.
- Intelligence: Sidebar collapses to icon rail.
- Extract: Builder becomes read-only monitor on tablet; "Open on desktop" nudge.

### Mobile (< 768px)

- Compare: Full mobile-first. Bottom navigation (Search, Deals, Watchlist, Account).
- Intelligence: View/monitor only. Edit flows require desktop nudge.
- Extract: Monitor runs, view datasets, trigger/cancel. Builder explicitly desktop-only.

---

## Command Palette

Triggered by Cmd/Ctrl+K or "/" in search. Available everywhere in the app.

**Groups:**

1. Navigation ("Go to Watchlist", "Go to Deals")
2. Actions ("Add to watchlist", "Create extractor", "Create alert", "Compare selected")
3. Products (recent searches, tracked products)
4. Help ("Docs: price history", "What is a deal score?")

**Keyboard shortcuts documented (visible in palette):**

- `/` = open search
- `Cmd+K` = command palette
- `G W` = go to watchlist
- `G D` = go to deals
- `G R` = go to reports (Intelligence)
- `E` = edit selected row (Intelligence products table)
- `R` = refresh current view

---

## Key UX Principles (binding)

1. **Provenance always available**: Every number has a "where did this come from?" trail accessible within 1 click.
2. **Stale = dim**: Any data > 24h old is visually de-emphasized and never shown with deal badge.
3. **"Possible match" is a real UI state**: Never silently merge; never hide uncertainty.
4. **Empty states are designed experiences**: What / why / what to do next. No blank screens.
5. **No surprise alerts**: Every notification explains what happened, why you got it, what you can do.
6. **URL-synced state**: Every filter, sort, and view is bookmarkable and shareable.
7. **Offline works for last view**: Cached last view with honest banner. No silent failures.
