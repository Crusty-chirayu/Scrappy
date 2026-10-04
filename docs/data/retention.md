# Data Retention & Pruning Policies

> Formal data lifecycles, partitioning schedules, and pruning rules for Scrappy.

## Overview

Scrappy maintains a high-frequency telemetry ingestion pipeline. To balance historical price analytics against storage cost and database performance budgets, data is segmented into four distinct lifecycle tiers:

| Table / Artifact | Granularity | Retention Period | Pruning / Compaction Strategy |
| :--- | :--- | :--- | :--- |
| `raw_scrapes` | Raw HTML/JSON | 14 days | Stored in Supabase/S3 object storage; lifecycle policy deletes after 14d. DB pointer retained. |
| `price_history` (Live) | Sub-hourly ticks | 90 days | Full resolution retained for 90 days. |
| `price_history` (Aggregated) | Daily (OHLC) | Indefinite (7 years) | Automated roll-up job aggregates ticks >90d into daily min/max/close. |
| `crawl_runs` | Per execution | 180 days | Metadata purged after 6 months; aggregate stats rolled into daily adapter metrics. |
| `audit_logs` | Per security action | 365 days (1 year) | Archived to cold storage for compliance before purging from active DB. |

---

## 1. Price History Compaction

To ensure price history queries execute within the `< 150ms` p95 performance budget:

1. **Partitioning**:
   - `price_history` is range-partitioned by month on `recorded_at`.
2. **Roll-up Pipeline**:
   - Every night at 02:00 UTC, a background pg-boss job aggregates partition records older than 90 days into daily summaries:
     ```sql
     -- Conceptual compaction query
     INSERT INTO price_history_daily (offer_id, date, low_paise, high_paise, close_paise)
     SELECT offer_id, recorded_at::date, min(price_paise), max(price_paise), (array_agg(price_paise ORDER BY recorded_at DESC))[1]
     FROM price_history
     WHERE recorded_at < NOW() - INTERVAL '90 days'
     GROUP BY offer_id, recorded_at::date;
     ```
3. **Partition Drop**:
   - Partitions older than 90 days are detached and archived or truncated.

---

## 2. Raw Scrape Storage Lifecycle

- Raw HTML/JSON payloads are compressed using zstandard (`zstd`) before upload to Supabase Storage bucket `scrapes/raw/`.
- S3 / Supabase Storage lifecycle rule:
  - Transition to Glacier/Cold after 7 days.
  - Hard delete after 14 days.
- Raw content hashes (`content_hash`) remain in the database indefinitely for deduplication and conditional HTTP requests (`ETag` / `If-None-Match`).

---

## 3. Compliance and Tenant Data Deletion (GDPR / DPDP)

- When a workspace is deleted, the cascade delete trigger removes all associated `watchlist_items`, `alerts`, `extract_recipes`, `crawl_runs`, and `audit_logs`.
- Workspace export API (`GET /api/v1/workspaces/:id/export`) generates a single zip containing JSON exports of all tenant data within 10 seconds.
