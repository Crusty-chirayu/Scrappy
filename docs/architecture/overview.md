# Architecture Overview

> SCRAPPY architectural blueprint and data flow from raw web to multi-audience experiences.

## Thesis

Web data -> Source -> Extraction -> Normalization -> Entity resolution -> Product/Merchant/Offer graph -> Price history -> Intelligence -> Consumer, Business and Developer experiences. Compare, Intelligence and Extract are three views on ONE unified platform.

```mermaid
flowchart TD
    subgraph Sources["Target Sources (HTTP & Browser)"]
        S1["Amazon India"]
        S2["Flipkart"]
        S3["Croma"]
        S4["Reliance Digital"]
        S5["Custom Target Webpages"]
    end

    subgraph Ingestion["Ingestion & Scraping (/packages/scraping & adapters)"]
        direction TB
        Fetch["Crawlee / HTTP Fetcher (HTTP-First)"]
        Browser["Playwright Runner (Isolated Browser Worker)"]
        Robots["Robots.txt & Rate Limiter"]
        Circuit["Circuit Breaker & Source Health Scoring"]
    end

    subgraph Processing["Normalization & Entity Resolution"]
        Norm["Data Normalization (Zod, INR paise, EAN/UPC/SKU)"]
        ER["Entity Matching Engine (/packages/matching)<br/>Deterministic + pg_trgm + pgvector candidate retrieval"]
        Review["Human/Confidence Gate<br/>('Possible match' vs 'Verified match')"]
    end

    subgraph DataGraph["Unified Graph Data Layer (/packages/db)"]
        PG[("PostgreSQL 16<br/>Drizzle ORM + pg_trgm + unaccent + pgvector")]
        Partitions[("Price Observations (Monthly Partitions)")]
        BossQueue[("Job Queue (pg-boss in Postgres)")]
    end

    subgraph CoreServices["Domain Services"]
        Pricing["Pricing Engine (/packages/pricing)<br/>Deal score, anomalies, stats"]
        IntelligenceSvc["Intelligence Engine<br/>Competitor gap analysis, repricing alerts"]
        ExtractionEngine["Extraction Engine<br/>Custom schema execution, webhooks"]
        AISvc["AI Synthesis Layer (/packages/ai)<br/>Gemini fallback-safe summaries"]
    end

    subgraph Experiences["Delivery Surfaces (apps/)"]
        WebCompare["apps/web: Compare (Shoppers)<br/>Price history, alerts, trust badges"]
        WebIntel["apps/web: Intelligence (Merchants)<br/>Competitor monitoring, price gaps"]
        WebExtract["apps/web: Extract UI (Developers)<br/>Schema builder, dataset runs"]
        RestAPI["apps/api: REST API & Developer Portal<br/>OpenAPI 3.1, HMAC webhooks"]
        AdminOps["apps/admin: Internal Ops Console<br/>Allowlist-only, adapter health, audits"]
    end

    Sources --> Robots
    Robots --> Circuit
    Circuit --> Fetch
    Fetch -. "Fallback on JS lock" .-> Browser
    Fetch --> Norm
    Browser --> Norm
    Norm --> ER
    ER --> Review
    Review --> PG
    Norm --> Partitions
    PG --> BossQueue
    BossQueue --> Pricing
    BossQueue --> IntelligenceSvc
    BossQueue --> ExtractionEngine
    Pricing --> AISvc

    PG --> RestAPI
    PG --> WebCompare
    PG --> WebIntel
    PG --> WebExtract
    PG --> AdminOps
```

## Core Tenets

1. **Provenance First**: Every observation records `source`, `source_url`, `fetched_at`, `extraction_method`, and `confidence_score`.
2. **Conservative Entity Resolution**: Missed matches can be flagged later; false merges corrupt historical data permanently.
3. **Resilient Ingestion**: Failure of a single source adapter triggers circuit-breakers and isolated retries without affecting other targets or consumers.
4. **Tenant Isolation**: B2B workspaces and customer extractors have database-level row filtering enforced on all data queries.
