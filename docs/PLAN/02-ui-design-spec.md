# 02 — UI Design Spec

> Every screen: purpose, hierarchy, states, interactions, motion, responsive, accessibility
> ASCII wireframes for the 15 most important screens

---

## Design Language Summary

- **Feel**: Precision data instrument. Calm, fast, exact. Never generic SaaS.
- **Color**: Ink scale (dark surfaces) + Paper scale (light). Signal (#C6F135 dark / #5E7A00 light) for live/actionable only. Price-down green, price-up red always paired with direction symbol.
- **Type**: Geist Sans (UI) + Geist Mono (prices, numbers, code). Tabular nums everywhere prices appear.
- **Motion**: Explains causality. max 400ms feedback. Reduced-motion: opacity only.
- **Density**: Information-dense with air. Hairlines not shadows as separators.

---

## Screen Inventory and States

### S01 — Home / Search (Compare)

**Purpose**: Entry point for shoppers. Communicates product immediately. Drives search.

**Hierarchy**:

1. Animated mark + wordmark (top-left, ~32px)
2. Oversized command-style search input (center, autofocused)
3. Live proof stat strip ("Tracking 42,381 products across 4 stores | Median data age: 18 min")
4. Category rail (8 icons + labels)
5. Today's Verified Deals (top 6, horizontal scroll on mobile)
6. Recently Viewed (if any)

**States**:

- `default`: focus on load, "/" shortcut shown in search hint
- `searching`: live autocomplete dropdown opens immediately on 1st char
- `no-recent-views`: "Start by searching for a product or paste a retailer URL"
- `offline`: banner "You're offline — showing cached recent views"
- `authenticated` vs `anonymous`: watchlist icon in search result differs

**ASCII Wireframe**:

```
+----------------------------------------------------------+
| [S] scrappy         [/] Search  [Bell] [Avatar]          |
+----------------------------------------------------------+
|                                                          |
|         +-----------------------------------------+      |
|         |  Search for any product or paste URL   |      |
|         +-----------------------------------------+      |
|                                                          |
|  Tracking 42,381 products  |  Checked today: 8,241  |   |
|  Median freshness: 18 min  |  4 retailers live       |   |
|                                                          |
|  [Phones]  [Laptops]  [TVs]  [ACs]  [Appliances] [+]   |
|                                                          |
|  Today's Deals                              [See all >]  |
|  +--------+  +--------+  +--------+  +--------+        |
|  |  IMG   |  |  IMG   |  |  IMG   |  |  IMG   |        |
|  | Title  |  | Title  |  | Title  |  | Title  |        |
|  | INR X  |  | INR X  |  | INR X  |  | INR X  |        |
|  | -12%   |  | Great  |  | Good   |  | Fair   |        |
|  +--------+  +--------+  +--------+  +--------+        |
|                                                          |
+----------------------------------------------------------+
```

**Responsive**:

- Mobile: Search takes full width. Proof stats collapse to 2-line. Category rail horizontal scroll. Deals 2-column.
- Tablet: 2/3 width centered search. 4-column deals.
- Desktop: As wireframe above.

**Accessibility**: `role="search"` on form, `aria-label="Search products"`, "/" shortcut announced by visually-hidden helper text, reduced-motion: mark is static.

**Motion**: Animated mark idle state. Proof stats tick live. Search expands on focus (width grows 4px each side, 140ms).

---

### S02 — Search Autocomplete Dropdown

**Purpose**: Speed up product discovery. Reduce zero-result frustration.

**States**:

- `loading`: skeleton rows (3), 80ms delay before showing
- `results`: grouped sections
- `zero-results`: "No matches for 'X'. Try: Samsung TV, Refrigerator..." + recent searches
- `url-input`: "Paste retailer URL to resolve listing"
- `keyboard-navigating`: focused row highlighted, arrow up/down, Enter selects, Esc closes

**ASCII Wireframe**:

```
+-----------------------------------------+
| [Search icon] Samsung Galaxy S25...     |
+-----------------------------------------+
| Products                                |
|  [img] Samsung Galaxy S25 Ultra 256GB   |
|         Flipkart  INR 89,999  [Matched] |
|  [img] Samsung Galaxy S25+ 128GB        |
|         Amazon    INR 79,499  [Matched] |
| Brands                                  |
|  [S] Samsung                            |
| Categories                              |
|  [>] Smartphones                        |
| Actions                                 |
|  [url] Compare this URL                 |
+-----------------------------------------+
| 12 more results  [View all results]     |
+-----------------------------------------+
```

---

### S03 — Search Results Page

**Purpose**: Display relevant products. Enable filtering. Drive to product page.

**URL state**: `/search?q=samsung+s25&brand=samsung&price_min=50000&price_max=100000&sort=deal_score`

**States**:

- `loading`: skeleton list (8 rows), facets skeleton
- `results`: dense list, not card grid
- `zero-results`: "0 results for 'X'" + suggestions + "Track this search" CTA
- `partial`: "Showing results from 3 of 4 retailers (Reliance Digital degraded)" inline note
- `stale-filters`: filter badge dims + "Data may be up to 2h old"
- `error`: "Search unavailable. Retry / Go to categories"

**ASCII Wireframe**:

```
+----------------------------+------------------------------------+
| Filters              [X]  | 847 results for "Samsung S25"     |
|                            | Sort: [Deal Score v]  [Grid|List] |
| Category                   +------------------------------------+
| [x] Smartphones            | [img] Samsung Galaxy S25 Ultra    |
|     Tablets                |       256GB Phantom Black         |
|                            |       INR 89,999    [Flipkart]    |
| Brand                      |       [Great Deal -12%]  [Matched]|
| [x] Samsung                |       3 retailers  Checked 8m ago |
|     Apple                  +------------------------------------+
|     OnePlus                | [img] Samsung Galaxy S25 Ultra    |
|                            |       256GB Titanium Silver       |
| Price Range                |       INR 91,200    [Amazon]      |
| INR [20,000]—[1,20,000]   |       [Good Deal -8%]  [Matched]  |
| [===|==========]           |       2 retailers  Checked 22m ago|
|                            +------------------------------------+
| Discount                   | [img] Samsung Galaxy S25+         |
| 5%+ 10%+ 20%+ 30%+         |       128GB  [Possible Match]     |
|                            |       INR 79,499   [Amazon]       |
| Availability               |       [Possible match info icon]  |
| [x] In stock               |       1 retailer  Checked 4h ago  |
|     Include OOS            +------------------------------------+
| Retailer                   |  [Load more]                      |
| [x] Flipkart               |                                   |
| [x] Amazon                 |                                   |
|     Croma (degraded)       |                                   |
+----------------------------+------------------------------------+
```

**Accessibility**: Facets are `<aside role="complementary" aria-label="Search filters">`. Results list is `<ul role="list">`. Each item is `<li>` with heading hierarchy. Skip-to-results link. Filter changes announce count to screen reader via live region.

---

### S04 — Product Page (SEO-critical)

**Purpose**: Central page for price comparison, history, and alerts. Server-rendered for SEO.

**URL**: `/products/[slug]?variant=[variantId]`

**States**:

- `loading-initial`: TTFB < 300ms (ISR), then skeleton for dynamic sections
- `fresh-offers`: normal state
- `stale-offers`: Stale badge on offers table + dims + no deal badge
- `partial-offers`: "2 of 4 retailers could not be reached. Showing available data."
- `zero-offers`: "No current offers found. Check back later." + alert CTA
- `possible-match`: dashed violet border on offer rows with "Possible match" tooltip
- `product-not-found`: 404 with "Search for similar" + "Request this product" form
- `permission-denied`: login CTA for watchlist/alert features

**ASCII Wireframe**:

```
+------------------------------------------------------------------+
| [S] scrappy  [Search...]              [Bell] [Avatar]            |
| Electronics > Smartphones > Samsung > Galaxy S25 Ultra           |
+------------------------------------------------------------------+
|                                                                  |
| [  IMG 3:2  ]  Samsung Galaxy S25 Ultra 256GB                   |
|                Phantom Black                                      |
|                [128GB] [256GB*] [512GB]  <- variant selector    |
|                                                                  |
|                +-------------------------------------------+     |
|                | BEST PRICE                                |     |
|                | INR 89,999  [Flipkart]                    |     |
|                | Free shipping  In stock                   |     |
|                | Checked 8 min ago  [Refresh]              |     |
|                |                                           |     |
|                | [Great Deal 78/100]  [Why?]               |     |
|                | "INR 8,200 below 90-day median.           |     |
|                |  Lowest in 4 months. MRP unchanged."     |     |
|                |                                           |     |
|                | [+ Add to Watchlist]  [Set Alert]        |     |
|                +-------------------------------------------+     |
|                                                                  |
| OFFERS (4 retailers)                      [Checked 8m ago]      |
+----------+---------+---------+----------+-----------+-----------+
| Retailer | Seller  | Price   | Shipping | Stock     | Action    |
+----------+---------+---------+----------+-----------+-----------+
| Flipkart | FKDirect| 89,999  | Free     | In stock  | Go [->]   |
| Amazon   | Amazon  | 91,200  | 99       | In stock  | Go [->]   |
| Amazon   | 3rd Pty | 93,000  | 49       | 2 left    | Go [->]   |
| Croma    | --      | [Stale] | --       | --        | [Degraded]|
+----------+---------+---------+----------+-----------+-----------+
| [Possible match: Includes 1 unverified listing - show/hide]     |
+------------------------------------------------------------------+
|                                                                  |
| PRICE HISTORY                  [1M] [3M] [1Y] [All] [Table]    |
|                                                                  |
|  1,10,000 --|                                                    |
|  1,00,000 --|---\                                               |
|    90,000 --|    \___/---\___   *current                        |
|    80,000 --|                                                    |
|             Jan  Feb  Mar  Apr  May  Jun                        |
|             [Min: 87,999]  [Max: 1,09,990]  [Median: 98,200]  |
+------------------------------------------------------------------+
| SPECS                                      [Show all 42 specs]  |
| Display    | 6.9" QD-AMOLED 120Hz                               |
| RAM        | 12GB                                               |
| Storage    | 256GB                                              |
| Camera     | 200MP + 50MP + 12MP                                |
+------------------------------------------------------------------+
| ALTERNATIVES (Similar but different price)                       |
| [3 product cards]                                               |
+------------------------------------------------------------------+
```

**SEO**: Product + Offer JSON-LD. Canonical URL. ISR 15min. noindex for zero-offer pages. Structured price freshness.

**Accessibility**: Main heading is product name `<h1>`. Offers table is `<table>` with proper headers. Chart has `<caption>` and "View as table" toggle. Alert button announces state change.

---

### S05 — Price History Chart (component detail)

**Interaction**: Hover shows crosshair with exact value, source chip, timestamp. Keyboard-scrubbable (arrow left/right moves day by day, announced to screen reader). "View as table" always visible.

**States**:

- `loading`: skeleton line
- `insufficient-data`: "Less than 14 days of data — deal score not shown"
- `single-source`: "Prices from 1 retailer only"
- `event-markers`: small circles for "Sale started", "Stock-out", "MRP changed"

---

### S06 — Watchlist

**ASCII Wireframe**:

```
+----------------------------------------------------------+
| Watchlist (12 items)              [+ Add product] [Edit] |
+----------------------------------------------------------+
| [img] Samsung S25 Ultra 256GB                            |
|       Current: INR 89,999  Target: INR 85,000            |
|       [=========90%=====>    ] (target progress)         |
|       [Great Deal]  [In stock]  [Edit] [Remove]         |
+----------------------------------------------------------+
| [img] LG 65" OLED C4         [Stale 2d ago]             |
|       Current: INR 1,34,999  Target: INR 1,20,000        |
|       [======60%======       ]                           |
|       [Fair]  [In stock]  [Edit] [Remove]               |
+----------------------------------------------------------+
| Empty state (if 0 items):                                |
| [icon] "No tracked products yet."                        |
| "Search for a product and add it to your watchlist."    |
| [Search products]                                        |
+----------------------------------------------------------+
```

**States**: loading (skeleton rows), empty (designed), partial (some items stale), bulk-select mode (checkbox + "Remove selected" action), offline (cached list with banner).

---

### S07 — Alert Create / Edit

**States**: fresh / editing / saved / error. Quiet hours toggle. Frequency selector. Channel checkboxes (email, in-app). Preview: "We'll alert you at most once per day between 8 AM - 10 PM IST when price drops below INR 85,000."

---

### S08 — Notification Center Drawer

**ASCII Wireframe**:

```
+-----------------------------------+
| Notifications         [Mark all] |
| [All] [Unread 3] [Alerts] [System]|
+-----------------------------------+
| TODAY                             |
| [!] Samsung S25 dropped to 89,999 |
|     Flipkart  |  8m ago           |
|     [View product] [Edit alert]   |
+-----------------------------------+
| [i] LG OLED: Price check complete |
|     3 retailers checked  |  1h ago|
|     [View]                        |
+-----------------------------------+
| YESTERDAY                         |
| [!] Alert: Back in stock: MacBook |
|     Amazon  |  Yesterday 3:41 PM  |
|     [View product] [Snooze 24h]   |
+-----------------------------------+
```

---

### S09 — Compare View (side-by-side)

**ASCII Wireframe**:

```
+--------+------------------+------------------+------------------+
|        | Samsung S25 Ultra| iPhone 16 Pro Max| OnePlus 13       |
|        | INR 89,999       | INR 1,34,999     | INR 69,999       |
|        | [Great 78] [FK]  | [Good 65] [Apple]| [Fair 52] [FK]   |
+--------+------------------+------------------+------------------+
| [Mode: Show differences only]                                   |
+--------+------------------+------------------+------------------+
| Display| 6.9" 120Hz AMOLED| 6.9" 120Hz OLED | 6.82" 120Hz AMOLED|
| RAM    | 12GB             | 8GB              | 16GB [BEST]      |
| Cam    | 200MP            | 48MP             | 50MP             |
| Bat    | 5000mAh [BEST]   | 4685mAh          | 6000mAh [BEST]   |
+--------+------------------+------------------+------------------+
| [Share link]  [Export]                                          |
+------------------------------------------------------------------+
```

**States**: loading, < 2 products selected (prompt to add), spec-diff mode (only different rows), highlight best-in-row per numeric spec.

---

### S10 — Intelligence Overview

**Purpose**: "Where am I losing sales to price today?"

**ASCII Wireframe**:

```
+------------------------------------------------------------------+
| [S] scrappy  [Intelligence]    Workspace: AcmeSellers [switch]  |
+------------------------------------------------------------------+
| Overview                                                         |
|                                                                  |
| Attention: 5 products priced above market median                 |
| +------+-------------------------------------+------+--------+   |
| | SKU  | Product                             | Gap  | Action |   |
| +------+-------------------------------------+------+--------+   |
| | S25U | Samsung Galaxy S25 Ultra 256GB      | +8%  | View > |   |
| | LGC4 | LG 65" OLED C4                      | +3%  | View > |   |
| +------+-------------------------------------+------+--------+   |
|                                                                  |
| What changed in the last 24h                                     |
| - Flipkart dropped price on Sony WH-1000XM5 by INR 1,500        |
| - Amazon restocked iPhone 16 Pro 512GB                          |
|                                                                  |
| Active alerts: 3 triggered today  [View alerts]                  |
+------------------------------------------------------------------+
```

---

### S11 — Intelligence Market View

**ASCII Wireframe**:

```
Samsung Galaxy S25 Ultra 256GB — Market prices today

INR |
1,00,000 |    o   o          <- Competitor range
  95,000 |        |
  90,000 |  o ====*====  o   <- * = your price  === = median band
  85,000 |        |
  80,000 |    o              <- Lowest offer

Sellers: FK Direct | Amazon | OneStore | Tata Cliq | [You: Acme]
[Your price: INR 91,200  |  Market median: INR 89,500  |  You: +1.9%]
```

---

### S12 — Extract Builder (Desktop only)

**ASCII Wireframe**:

```
+---------------------------+--------------------------------+
| URL: https://site.com/... | Schema                         |
| [Check robots] [Allowed]  | Field     Type    Required     |
+---------------------------+ title     text    [x]          |
|                           | price     currency [x]         |
| [LIVE BROWSER STREAM]     | image     image   [ ]          |
|  Product name    [select] | url       url     [ ]          |
|  Price: INR 999  [select] +--------------------------------+
|  [Add to list]   [select] | Preview (3 rows)              |
|                           | title          price    image  |
|  Pagination: Next [conf]  | Sony WH-1000  INR 2,499  [img]|
|  Detail pages: [off]      | JBL Live 660  INR 1,899  [img]|
|                           | Bose QC45     INR 3,499  [img]|
|  Session: 8:42 remaining  | Fill rate: price 100%, img 67%|
+---------------------------+--------------------------------+
| [Test Run]  [Save]  [Schedule]  [Deliver to: webhook v]   |
+----------------------------------------------------------+
```

**States**: session-starting, active-session (live stream), session-expired (auto "Open new session"), test-running, test-complete, saving, error (SSRF blocked / robots restricted).

---

### S13 — Extraction Run Page

**States**: DRAFT / QUEUED / RUNNING (live log stream via SSE) / PARTIAL / SUCCEEDED / FAILED / CANCELLED.

**ASCII Wireframe**:

```
Run #4821 — "Product Prices Daily"           RUNNING [cancel]
Started: 10:01 AM  |  Records: 847  |  Errors: 3  |  Browser min: 2.1

[TIMELINE]
10:01 QUEUED
10:01 RUNNING  -> Page 1: 24 records
10:02          -> Page 2: 24 records
10:02 [WARN]   -> Page 3: price missing on 3 rows (using default null)
...live...

[Logs] [level: all v] [search: ____ ]
10:02:14  WARN  price field null on rows 3,7,9 of page 3
10:02:15  INFO  Page 4 complete: 24 records
```

---

### S14 — Admin: Source Health Dashboard

**ASCII Wireframe**:

```
Source Health                                     [Refresh]
+------------------+----------+----------+--------+----------+
| Source           | State    | Success% | p95 ms | Fill%    |
+------------------+----------+----------+--------+----------+
| Amazon India     | Healthy  | 98.2%    | 420ms  | 99.1%    |
| Flipkart         | Healthy  | 97.8%    | 380ms  | 98.4%    |
| Croma            | Degraded | 61.0%    | 2,100ms| 82.0%    |
| Reliance Digital | Offline  | 0%       | --     | --       |
+------------------+----------+----------+--------+----------+
| [Pause] [Force refresh] [View drift report] [Circuit state]|
+------------------------------------------------------------------+
```

---

### S15 — Pricing / Plans Page (Marketing)

**ASCII Wireframe**:

```
Simple, honest pricing.

[Compare]  [Intelligence]  [Extract]   <- tabs

Compare: Free forever, always.
No ads. Affiliate links disclosed. No tracking beyond what's necessary.
[Sign up free]

---

Intelligence:
[Monthly | Annual -20%]

+------------------+------------------+------------------+
| Starter          | Pro              | Business         |
| INR 999/mo       | INR 2,999/mo     | INR 7,999/mo     |
| 25 products      | 100 products     | 500 products     |
| 5 competitors    | 25 competitors   | 100 competitors  |
| Daily refresh    | 4x daily         | Hourly           |
| Email alerts     | Email + in-app   | + Webhook        |
| [Start free trial] [Start trial]  [Contact sales]     |
+------------------+------------------+------------------+
* Prices are illustrative. See 12-cost-and-billing.md for unit economics.
```

---

## Motion Specifications (All Screens)

| Trigger                     | Animation                                   | Duration                 | Reduced-motion      |
| --------------------------- | ------------------------------------------- | ------------------------ | ------------------- |
| Page navigation             | Cross-fade + mark shrinks to corner         | 260ms                    | Opacity only 80ms   |
| Search expand               | Width grows 4px each side                   | 140ms, ease-out          | Skip                |
| Result card -> product page | Shared-element image + price                | 220ms, emphasized easing | None (instant)      |
| Price roll                  | Digit roll per column (mono)                | 300ms, stagger 40ms      | None (instant swap) |
| Offer added to watchlist    | Optimistic insert, undo toast slides in     | 220ms                    | Opacity 80ms        |
| Stale badge appears         | Fade in + dim surrounding content           | 220ms                    | Opacity only        |
| Notification bell           | Ring 2 cycles + count badge scales in       | 360ms                    | Opacity only        |
| Chart animate-in            | Draw along path                             | 480ms                    | None                |
| Filter apply                | Cross-fade results (no skeleton if < 300ms) | 220ms                    | Opacity only        |
| Drawer/palette open         | Spring translateY                           | stiffness 420 damping 36 | Opacity only        |

---

## Accessibility Summary (all screens)

- All interactive elements reachable by Tab (logical DOM order matches visual order)
- Visible focus ring: 2px offset, signal color
- Skip-to-content link on every page
- All icons have aria-label or aria-hidden + adjacent text
- Color is never the sole means of communicating status (always + icon/text)
- Charts: always paired with "View as table" toggle
- Price direction: always arrow + color (never color alone)
- Screen reader: live regions for async content updates (search results, notifications)
- Reduced motion preference respected + in-app toggle in Accessibility settings
- All form fields have visible labels (no placeholder-only labels)
- Error messages associated with fields via aria-describedby
- Keyboard shortcuts discoverable via Help menu and Command Palette
