# Scrappy Entity Relationship Diagram (ERD)

> Comprehensive schema documentation for all catalog, offer, tenancy, and crawl tables.

```mermaid
erDiagram
    WORKSPACES ||--o{ WORKSPACE_MEMBERS : "has members"
    WORKSPACES ||--o{ AUDIT_LOGS : "logs actions"
    WORKSPACES ||--o{ ALERTS : "configures"
    WORKSPACES ||--o{ EXTRACT_RECIPES : "owns"
    WORKSPACES ||--o{ CRAWL_RUNS : "initiates"

    CATEGORIES ||--o{ PRODUCTS : "categorizes"
    BRANDS ||--o{ PRODUCTS : "manufactures"
    
    PRODUCTS ||--o{ OFFERS : "has multi-merchant"
    PRODUCTS ||--o{ ALERTS : "targets"
    PRODUCTS ||--o{ WATCHLIST_ITEMS : "saved in"

    MERCHANTS ||--o{ OFFERS : "lists"
    OFFERS ||--o{ PRICE_HISTORY : "tracks over time"

    CRAWL_RUNS ||--o{ RAW_SCRAPES : "produces"

    WORKSPACES {
        uuid id PK
        text name
        text slug UK
        text tier
        timestamptz created_at
        timestamptz updated_at
    }

    WORKSPACE_MEMBERS {
        uuid id PK
        uuid workspace_id FK
        uuid user_id
        text role
        timestamptz created_at
    }

    CATEGORIES {
        uuid id PK
        text name
        text slug UK
        uuid parent_id FK
        timestamptz created_at
    }

    BRANDS {
        uuid id PK
        text name
        text slug UK
        timestamptz created_at
    }

    PRODUCTS {
        uuid id PK
        text title
        uuid brand_id FK
        uuid category_id FK
        text model
        text ean
        text upc
        jsonb attributes
        timestamptz created_at
        timestamptz updated_at
    }

    MERCHANTS {
        uuid id PK
        text name
        text slug UK
        text source_id
        text base_url
        numeric trust_score
        timestamptz created_at
    }

    OFFERS {
        uuid id PK
        uuid product_id FK
        uuid merchant_id FK
        text source
        text merchant_name
        text url
        bigint current_price_paise
        bigint original_price_paise
        boolean in_stock
        jsonb provenance
        timestamptz last_checked_at
        timestamptz created_at
        timestamptz updated_at
    }

    PRICE_HISTORY {
        uuid id PK
        uuid offer_id FK
        bigint price_paise
        timestamptz recorded_at
    }

    ALERTS {
        uuid id PK
        uuid workspace_id FK
        uuid user_id
        uuid product_id FK
        bigint target_price_paise
        text notification_channel
        boolean is_active
        timestamptz last_triggered_at
        timestamptz created_at
    }

    WATCHLIST_ITEMS {
        uuid id PK
        uuid workspace_id FK
        uuid user_id
        uuid product_id FK
        timestamptz created_at
    }

    EXTRACT_RECIPES {
        uuid id PK
        uuid workspace_id FK
        text name
        text domain_pattern
        jsonb selector_rules
        timestamptz created_at
        timestamptz updated_at
    }

    CRAWL_RUNS {
        uuid id PK
        uuid workspace_id FK
        text adapter_id
        text status
        integer items_extracted
        integer items_failed
        jsonb error_summary
        timestamptz started_at
        timestamptz completed_at
    }

    RAW_SCRAPES {
        uuid id PK
        uuid crawl_run_id FK
        text source_url
        integer http_status
        text payload_storage_key
        text content_hash
        timestamptz fetched_at
    }

    AUDIT_LOGS {
        uuid id PK
        uuid workspace_id FK
        uuid user_id
        text action
        text entity_type
        uuid entity_id
        jsonb metadata
        timestamptz created_at
    }
```

## Security & Tenancy Invariants
- **Public Tables**: `categories`, `brands`, `merchants`, `products`, `offers`, `price_history`. Read-accessible anonymously, write-restricted to service-role background workers.
- **Tenant-Isolated Tables**: `workspaces`, `workspace_members`, `alerts`, `watchlist_items`, `extract_recipes`, `crawl_runs`, `raw_scrapes`, `audit_logs`. Enforced with PostgreSQL Row Level Security (RLS) on `workspace_id`.
