# Scale Triggers

> Concrete criteria and thresholds for transitioning modules or components into dedicated infrastructure or services.

## Overview

SCRAPPY follows a **modular monolith** approach. Clear package boundaries are maintained inside the monorepo. A package or component transitions to a separate service or specialized datastore only when it breaches the documented triggers below.

## Scale Triggers Matrix

| Component                     | Current Architecture                    | Upgrade Target                             | Concrete Trigger Threshold                                                                                        | Rationale & Migration Strategy                                                                                                                                                  |
| ----------------------------- | --------------------------------------- | ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Job Queue**                 | `pg-boss` (Postgres tables)             | BullMQ + Redis Cluster                     | Queue throughput > 200 jobs/sec sustained, or lock contention causes > 10% query wait time on Postgres OLTP.      | Keeps initial infrastructure footprint minimal (Postgres only). When queue depth or locks begin affecting OLTP, migrate worker job consumers to BullMQ with an adapter pattern. |
| **Search Engine**             | Postgres FTS + `pg_trgm`                | Meilisearch / Typesense                    | Search API p95 latency > 150ms sustained or indexed product count > 1,000,000 items.                              | Postgres FTS + trigram handles tens of thousands of products with zero extra ops burden. Meilisearch is introduced when typo-tolerance and faceted query latency exceed budget. |
| **Browser Scraping Fleet**    | Shared worker nodes running Playwright  | Dedicated autoscaling browser runner fleet | Browser CPU/RAM consumption exceeds 30% of total worker cost or concurrent browser sessions starve HTTP scrapers. | Playwright instances are resource-intensive. Isolating them into an autoscaling worker pool prevents memory leaks from impacting the primary job queue.                         |
| **Entity Matching Engine**    | In-process batch matching worker        | Dedicated matching microservice            | Matching batch processing exceeds 1 hour or CPU utilization starves API/worker instances.                         | Entity resolution involves heavy string comparison, trigram calculations, and embedding vector distances. Extract into an independent worker service when workload scales.      |
| **Database Read Replicas**    | Single Postgres Primary (Supabase/Neon) | Primary + Read Replicas                    | Sustained DB CPU > 60% or heavy reporting/analytics queries increase p95 OLTP query times.                        | Route read-only queries (Compare catalog browsing, Intelligence reports) to replica instances while keeping writes on primary.                                                  |
| **Price Observation Storage** | Monthly partitioned Postgres tables     | ClickHouse / TimescaleDB                   | Historical observations exceed 1,000,000,000 rows or analytical rollup queries take > 500ms.                      | Monthly partitioning maintains index sizes in Postgres. When raw observation volume crosses billions of rows, stream raw events to ClickHouse for analytical aggregations.      |

## Splitting Procedure

Before splitting any module into a standalone service:

1. File an **ADR** in `docs/adr/` documenting metrics, cost impact, and service contracts.
2. Ensure the package API surface (`packages/<name>`) has no leaking internal database queries.
3. Deploy the new service behind a feature flag with dual-write or shadow verification for 7 days before full cutover.
