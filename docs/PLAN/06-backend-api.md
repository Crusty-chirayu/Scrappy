# 06 — Backend API

> REST/OpenAPI design, auth, rate limits, idempotency, errors, webhooks, versioning

---

## API Design Principles

- **REST under /v1**, OpenAPI 3.1 generated from zod schemas (single source of truth)
- **Cursor pagination** everywhere (no offset/page)
- **Consistent error envelope** `{error:{code,message,doc_url,request_id,details}}`
- **Idempotency-Key header** required on all POST/PATCH that create or mutate resources
- **ETags** for cacheable resources (product pages, offers)
- **Rate-limit headers**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`
- **Versioning**: URL versioning (/v1, /v2) + dated changelog + 12-month deprecation policy
- **Webhook signatures**: HMAC-SHA256 + timestamp in `Scrappy-Signature` header (replay window 5 min)

---

## Authentication

### Browser Clients (apps/web)

- Supabase Auth JWT in `Authorization: Bearer <jwt>` header
- OR `sb-access-token` httpOnly cookie (for SSR routes)
- Fastify plugin validates JWT against Supabase JWKS endpoint

### API Keys (developer/external access)

- `Authorization: Bearer scp_live_<token>`
- Fastify plugin: extracts prefix, looks up hash in api_keys table, validates SHA-256 match
- Updates `last_used_at` asynchronously (non-blocking)

### Rate Limits

| Tier                 | Requests/min | Burst  | Notes                        |
| -------------------- | ------------ | ------ | ---------------------------- |
| Unauthenticated      | 20           | 30     | Public search, product pages |
| Authenticated (free) | 60           | 100    | Session-based auth           |
| API Key (free)       | 60           | 100    | Per key                      |
| API Key (starter)    | 300          | 500    | Per key                      |
| API Key (pro)        | 1,000        | 2,000  | Per key                      |
| API Key (business)   | 5,000        | 10,000 | Per key                      |

Rate limiting implemented with sliding window in Redis (or fallback to pg with pg_cron cleanup if Redis not available in local mode).

---

## Error Envelope

All errors return this structure with appropriate HTTP status code:

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Product not found",
    "doc_url": "https://scrappy.in/docs/errors#RESOURCE_NOT_FOUND",
    "request_id": "req_01HZ...",
    "details": {
      "resource": "product",
      "id": "abc123"
    }
  }
}
```

### Error Codes

| HTTP | Code                | When                                                 |
| ---- | ------------------- | ---------------------------------------------------- |
| 400  | VALIDATION_ERROR    | Zod schema failure                                   |
| 401  | UNAUTHORIZED        | Missing or invalid auth                              |
| 403  | FORBIDDEN           | Valid auth but insufficient permission               |
| 404  | RESOURCE_NOT_FOUND  | Entity doesn't exist                                 |
| 409  | CONFLICT            | Duplicate idempotency key with different payload     |
| 422  | UNPROCESSABLE       | Business rule violation                              |
| 429  | RATE_LIMITED        | Rate limit exceeded                                  |
| 500  | INTERNAL_ERROR      | Unexpected server error (sanitized, no stack traces) |
| 503  | SERVICE_UNAVAILABLE | Dependency unavailable                               |

---

## Pagination

All list endpoints use cursor pagination:

```
GET /v1/products?cursor=<opaque_cursor>&limit=25&sort=created_at_desc

Response:
{
  "data": [...],
  "pagination": {
    "next_cursor": "eyJpZCI6Ii4uLiJ9",
    "has_more": true,
    "total": null  // Not returned by default (expensive); query ?count=true explicitly
  }
}
```

---

## Core API Resources

### Products API (Compare public)

```
GET  /v1/search?q=&filters=&cursor=&limit=       Search products
GET  /v1/products/:slug                           Product page data
GET  /v1/products/:id/offers                      Current offers (live refresh)
GET  /v1/products/:id/price-history?range=1m|3m|1y|all  Price history
GET  /v1/products/:id/alternatives               Similar products
GET  /v1/categories                              Category tree
GET  /v1/categories/:slug/products               Products in category
GET  /v1/deals?category=&min_discount=&cursor=  Deals feed
POST /v1/search/autocomplete                     Autocomplete suggestions
POST /v1/resolve-url                             Resolve retailer URL to product
```

### Watch & Alerts API (Compare authenticated)

```
GET  /v1/watchlist                   User's watchlist
POST /v1/watchlist                   Add to watchlist
      Body: { product_id, variant_id, target_price_minor, notify_channels }
DELETE /v1/watchlist/:id             Remove from watchlist
GET  /v1/alerts                      User's alerts
POST /v1/alerts                      Create alert
PATCH /v1/alerts/:id                 Update alert
DELETE /v1/alerts/:id                Delete alert
GET  /v1/notifications               Notification list (cursor paginated)
PATCH /v1/notifications/read-all    Mark all read
PATCH /v1/notifications/:id/read    Mark one read
PATCH /v1/notifications/:id/snooze  Snooze (body: { hours: 24 })
```

### Intelligence API (workspace-scoped)

```
GET  /v1/workspace/:id/tracked-products              List tracked products
POST /v1/workspace/:id/tracked-products              Add product to track
DELETE /v1/workspace/:id/tracked-products/:id        Stop tracking
GET  /v1/workspace/:id/tracked-products/:id/market-view  Market dot-strip data
GET  /v1/workspace/:id/competitors                   List competitors
POST /v1/workspace/:id/competitors                   Add competitor
GET  /v1/workspace/:id/overview                      Overview data (24h changes, top losses)
GET  /v1/workspace/:id/rules                         Price rules
POST /v1/workspace/:id/rules                         Create rule
PATCH /v1/workspace/:id/rules/:id                    Update rule
DELETE /v1/workspace/:id/rules/:id                   Delete rule
GET  /v1/workspace/:id/reports                       Scheduled reports
POST /v1/workspace/:id/reports                       Create report schedule
GET  /v1/workspace/:id/reports/:id/runs              Report run history
```

### Extract API (workspace-scoped, developer-facing)

```
GET  /v1/workspace/:id/projects                     List projects
POST /v1/workspace/:id/projects                     Create project
GET  /v1/workspace/:id/projects/:pid/extractors     List extractors
POST /v1/workspace/:id/projects/:pid/extractors     Create extractor
GET  /v1/workspace/:id/extractors/:id               Extractor details + schema
PATCH /v1/workspace/:id/extractors/:id              Update schema/schedule
DELETE /v1/workspace/:id/extractors/:id             Delete
POST /v1/workspace/:id/extractors/:id/runs          Trigger run
GET  /v1/workspace/:id/extractors/:id/runs          List runs (cursor)
GET  /v1/workspace/:id/runs/:rid                    Run details + live state
DELETE /v1/workspace/:id/runs/:rid                  Cancel run
GET  /v1/workspace/:id/runs/:rid/logs               Log stream (SSE)
GET  /v1/workspace/:id/datasets                     List datasets
GET  /v1/workspace/:id/datasets/:did/records        Records (cursor)
POST /v1/workspace/:id/datasets/:did/export         Trigger export
GET  /v1/workspace/:id/exports/:eid                 Export download URL
GET  /v1/workspace/:id/webhooks                     List webhooks
POST /v1/workspace/:id/webhooks                     Create webhook
PATCH /v1/workspace/:id/webhooks/:id               Update webhook
DELETE /v1/workspace/:id/webhooks/:id              Delete webhook
GET  /v1/workspace/:id/webhooks/:id/deliveries      Delivery log
POST /v1/workspace/:id/webhooks/:id/test            Send test event
```

### Account & Workspace API

```
GET  /v1/me                         Current user profile
PATCH /v1/me                        Update profile
GET  /v1/me/workspaces              User's workspaces
POST /v1/workspaces                 Create workspace
GET  /v1/workspace/:id              Workspace details
PATCH /v1/workspace/:id             Update workspace
GET  /v1/workspace/:id/members      Members list
POST /v1/workspace/:id/invitations  Send invite
DELETE /v1/workspace/:id/members/:uid  Remove member
PATCH /v1/workspace/:id/members/:uid/role  Change role
GET  /v1/workspace/:id/api-keys     List API keys (no secrets shown)
POST /v1/workspace/:id/api-keys     Create API key (returns secret once)
DELETE /v1/workspace/:id/api-keys/:id  Revoke key
GET  /v1/workspace/:id/usage        Usage stats
GET  /v1/workspace/:id/subscription Subscription + plan details
```

---

## OpenAPI Generation

Using `zod-to-openapi` or Fastify's `@fastify/swagger` with `zod-fastify-type-provider`:

```typescript
// Every route defines its own schema:
const searchSchema = {
  querystring: z.object({
    q: z.string().min(1).max(500),
    cursor: z.string().optional(),
    limit: z.number().int().min(1).max(100).default(25),
    brand: z.array(z.string()).optional(),
    price_min: z.number().int().optional(),
    price_max: z.number().int().optional(),
    sort: z.enum(["relevance", "price_asc", "price_desc", "deal_score"]).default("relevance"),
  }),
  response: {
    200: z.object({
      data: z.array(SearchResultSchema),
      pagination: PaginationSchema,
    }),
    400: ErrorResponseSchema,
  },
};
```

OpenAPI spec generated to `/apps/api/openapi.json` in CI. SDK generation uses this spec.

---

## Webhooks

### Signing

```
Scrappy-Signature: t=<timestamp>,v1=<hmac-sha256-hex>
```

HMAC computed over `timestamp.payload_body`. Timestamp within 5 minutes (replay protection). Documented on `/docs/api/webhooks`.

### Event Types

```
price.dropped          Price dropped below threshold
price.target_reached   Price reached user's target
availability.restored  Item back in stock
run.completed          Extraction run completed
run.failed             Extraction run failed
usage.threshold_80     80% of plan limit reached
usage.threshold_100    Plan limit reached
billing.payment_failed Payment processing failed
```

### Delivery

- Retry: 3x with exponential backoff (1m, 10m, 1h)
- Max age: 24 hours
- Dead-letter: failed deliveries logged, visible in dashboard, operator can replay
- Test event: POST /webhooks/:id/test sends a sample payload immediately

---

## Idempotency

POST requests that create resources MUST include `Idempotency-Key: <uuid>` header.

Response caching strategy:

- Key stored with SHA-256 of request body, response status, and response body
- Second request with same key: returns cached response (no re-execution)
- Key conflict (same key, different body): returns 409
- Keys expire after 24 hours
- Stored in `idempotency_keys` table (append-only, partitioned by created_at)

---

## Versioning Policy

- Current version: v1
- New breaking changes: new major version (/v2)
- Deprecation: 12-month notice in changelog + `Deprecation` response header
- Changelog: `/changelog` page in docs, RSS feed, email subscription
- Old versions: served for 12 months after deprecation announcement, then 410 Gone

---

## Fastify Plugin Architecture

```
apps/api/src/
  plugins/
    auth.ts          JWT + API key validation
    rls.ts           Workspace scope enforcement
    rate-limit.ts    Sliding window rate limiting
    idempotency.ts   Idempotency key management
    openapi.ts       Swagger/OpenAPI generation
    error-handler.ts Consistent error envelope
    request-id.ts    Unique request ID (ulid)
    cors.ts          CORS (allowlist in production)
    helmet.ts        Security headers
    logger.ts        Pino structured logging with request context
  routes/
    v1/
      search/
      products/
      watchlist/
      alerts/
      notifications/
      workspace/
      ...
  jobs/
    client.ts        pg-boss client singleton
    enqueue.ts       Typed job enqueue helpers
```
