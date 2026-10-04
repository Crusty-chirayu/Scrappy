# 11 — DevOps & Deployment

> Environments, CI/CD, hosting, observability, DR, runbooks

---

## Environments

| Environment    | Purpose             | DB                             | Credentials                  | Deploy                       |
| -------------- | ------------------- | ------------------------------ | ---------------------------- | ---------------------------- |
| **local**      | Developer machine   | `supabase start` (local stack) | Fake / test mode             | `pnpm dev`                   |
| **preview**    | Per-PR ephemeral    | Supabase branch DB             | Fake / test mode             | Auto on PR                   |
| **staging**    | Pre-prod validation | Supabase project (staging)     | Test-mode for payments/email | Auto on main                 |
| **production** | Live                | Supabase project (prod)        | Live credentials             | Manual trigger after staging |

**Rule**: No production credentials in lower environments. Each environment has its own `.env` file managed in the secret manager.

---

## Hosting Architecture

| App                 | Platform                        | Scaling                     | Notes                                 |
| ------------------- | ------------------------------- | --------------------------- | ------------------------------------- |
| apps/web            | Vercel                          | Edge/serverless auto        | Next.js App Router, ISR               |
| apps/api            | Fly.io                          | 2 instances min + autoscale | Fastify, regional close to Supabase   |
| apps/worker         | Fly.io                          | 1-3 instances               | pg-boss consumers                     |
| apps/browser-worker | Fly.io                          | 1-5 instances               | Playwright, isolated, resource-capped |
| apps/admin          | Fly.io                          | 1 instance                  | IP allowlist + MFA required           |
| Database            | Supabase Pro                    | Managed                     | Postgres + Auth + Storage + Realtime  |
| Email               | Resend (live) / Mailpit (local) | Provider-managed            | Via adapter interface                 |

**FACT** (verified Oct 2026):

- Vercel Pro: $20/seat/month + usage; 1TB bandwidth included; credit-based compute
- Fly.io: pay-as-you-go, per-second billing; ~$5/month per always-on micro VM; no base fee
- Supabase Pro: $25/month + usage; 8GB DB storage included; 100GB file storage; 250GB egress

**Cost estimate at MVP launch (ASSUMPTION)**:

- Vercel: $20-40/month (1-2 seats + usage)
- Fly.io (api + workers): ~$30-50/month (micro VMs)
- Supabase Pro: $25/month base + overage
- **Total infra at MVP: ~$75-120/month**

---

## CI/CD Pipeline

### On Every Pull Request

```yaml
jobs:
  lint:
    run: pnpm lint
  typecheck:
    run: pnpm typecheck
  unit:
    run: pnpm test:unit
  integration:
    run: pnpm test:integration
    services: [postgres] # Testcontainers or service container
  build:
    run: pnpm build
  rls-tests:
    run: supabase test db --local
  migration-dry-run:
    run: supabase db push --dry-run
  preview-deploy:
    uses: vercel/action # Deploy web to preview URL
    uses: fly.io/action # Deploy api to preview URL
  e2e:
    run: pnpm test:e2e --base-url=$PREVIEW_URL
  visual-regression:
    run: pnpm test:visual
  a11y:
    run: pnpm test:a11y
  security:
    - npm audit --audit-level=high
    - gitleaks detect
    - codeql analyze
```

### On Main Branch (after PR merges)

```yaml
jobs:
  migrations-expand:
    # Apply only expand-phase migrations (additive: new tables/columns)
    run: supabase db push --local=false # Against staging DB
  deploy-api-staging:
    run: fly deploy --app scrappy-api-staging
  deploy-workers-staging:
    run: fly deploy --app scrappy-worker-staging
  deploy-web-staging:
    run: vercel deploy --prod --env=staging
  smoke-tests-staging:
    run: pnpm test:smoke --env=staging
  # Manual gate: engineer reviews staging and triggers production deploy
```

### Production Deploy (manual trigger)

```yaml
jobs:
  migrations-contract:
    # Apply contract-phase migrations (remove old columns, add NOT NULL constraints)
    run: supabase db push --project-ref=$PROD_REF
  deploy-api-prod:
    run: fly deploy --app scrappy-api --strategy=rolling
  deploy-workers-prod:
    run: fly deploy --app scrappy-worker --strategy=rolling
  deploy-web-prod:
    run: vercel deploy --prod
  smoke-tests-prod:
    run: pnpm test:smoke --env=production
  rollback-on-failure:
    # If smoke tests fail, redeploy previous artifact
    run: fly releases rollback --app scrappy-api
```

---

## Rollback Strategy

- **Web (Vercel)**: One-click rollback to any previous deployment from Vercel dashboard
- **API/Workers (Fly.io)**: `fly releases rollback --app <app-name>` redeploys previous image
- **DB Migrations**: Expand/contract pattern means rollbacks are safe at every step:
  - Expand phase (add columns): safe to roll back app before contract phase
  - Contract phase (remove old columns): only run after new code has been running for 24h+

---

## Observability Stack

### Logs (Pino structured JSON)

```json
{
  "level": "info",
  "time": "2026-10-04T13:15:00.000Z",
  "request_id": "req_01HZ...",
  "workspace_id": "ws_...",
  "run_id": "run_...",
  "source": "amazon-in",
  "action": "fetch_completed",
  "duration_ms": 420,
  "msg": "Listing fetched successfully"
}
```

All logs include: `request_id`, `workspace_id` (where applicable), `run_id` (where applicable). Sensitive data (API keys, emails beyond prefix) never logged.

### Metrics (OpenTelemetry -> Prometheus-compatible)

- API: request latency p50/p95/p99, error rate, rate-limit hits, status codes
- Search: query latency, zero-result rate, cache hit rate
- Queue: depth per queue, age of oldest job, consumer heartbeat
- Scraping: success rate per source, parse failure rate, field fill rates
- Matching: auto-accept rate, review backlog depth
- Browser workers: active contexts count, browser minutes consumed
- DB: connection pool usage, slow query log (> 100ms)
- AI: tokens consumed per feature per day, cache hit rate
- Email: delivery rate, bounce rate
- Billing: active subscriptions per plan, payment failure rate

### Tracing (OpenTelemetry)

- Trace propagation: web -> api -> worker with `traceparent` header
- Key traces: search request, product page load, scraping run, alert evaluation
- Sampled at 10% in production (100% for errors)

### Error Tracking (Sentry)

- All apps report to Sentry
- Release tracking for source maps (Next.js + Fastify)
- Alert on new error type or spike in error rate

### Dashboards (Grafana or Supabase observability)

6 core dashboards at MVP:

1. **System Health**: API latency, error rate, queue depth, DB connections
2. **Scraping Operations**: Source health table, success rates, freshness heatmap
3. **Matching**: Auto-accept rate, review backlog, AI adjudication rate
4. **Product Coverage**: Products tracked, offers count, data freshness distribution
5. **Business Metrics**: Active workspaces, MAU, plan distribution, MRR
6. **Cost**: Infra cost by service, AI token spend, browser minutes used

### Public Status Page

- Hosted at `status.scrappy.in`
- Shows: API status, scraping status per source (state only, no tactics), incident history
- Updated via status page provider (e.g., Upptime or Betterstack) or custom page

---

## Alerting Rules (with Runbooks)

Each alert links to its runbook in `/docs/runbooks/`:

| Alert                     | Condition                                 | Severity | Runbook                        |
| ------------------------- | ----------------------------------------- | -------- | ------------------------------ |
| Queue backlog             | fetch_http queue depth > 500 for > 10 min | P2       | runbooks/queue-backlog.md      |
| Source degraded           | Any source success rate < 80%             | P2       | runbooks/source-degraded.md    |
| DB connections near limit | Pool usage > 80%                          | P2       | runbooks/db-pool.md            |
| DB slow queries           | > 5 queries > 500ms in 5 min              | P2       | runbooks/slow-queries.md       |
| Payment webhook failure   | Razorpay webhook 5xx > 3 in 10 min        | P1       | runbooks/payment-webhook.md    |
| Email bounce spike        | Bounce rate > 5% in 1h                    | P2       | runbooks/email-bounce.md       |
| Cost anomaly              | Daily AI spend > 2x 7-day average         | P2       | runbooks/cost-anomaly.md       |
| Browser worker OOM        | Container memory > 85%                    | P1       | runbooks/browser-worker-oom.md |
| API error rate spike      | 5xx rate > 1% for > 5 min                 | P1       | runbooks/api-errors.md         |
| Match review backlog      | Review queue > 1000 items                 | P3       | runbooks/match-backlog.md      |

---

## Disaster Recovery

### RPO and RTO Targets (ASSUMPTION — validate with Supabase PITR)

- **RPO (Recovery Point Objective)**: <= 15 minutes (Supabase PITR is continuous)
- **RTO (Recovery Time Objective)**: <= 2 hours

### DR Components

- **Supabase PITR**: Continuous WAL archiving; restore to any point in last 7 days (Pro plan)
- **Daily backups**: Automated by Supabase Pro; stored separately from primary
- **Supabase Storage**: Versioning enabled on all buckets
- **Configuration**: All config in git; secrets in secret manager
- **Queue**: pg-boss queue is Postgres; covered by DB recovery; jobs are idempotent so replay is safe
- **Workers**: Stateless; simply redeploy after DB recovery

### Weekly Restore Drill

Script: `/docs/runbooks/restore-drill.md`

```bash
# 1. Spin up a test Supabase project
# 2. Restore from backup
# 3. Run migration dry-run
# 4. Run smoke tests against restored DB
# 5. Verify data integrity (row counts, sample data)
# 6. Document duration and any issues
# 7. Clean up test project
```

Results logged in `/docs/runbooks/restore-drill-log.md` with date, duration, RTO achieved.

### Runbooks (required at launch)

- `/docs/runbooks/db-restore.md`: Full database restore procedure
- `/docs/runbooks/credential-compromise.md`: Rotate all secrets script (< 30 min)
- `/docs/runbooks/bad-deploy-rollback.md`: Rollback steps per app
- `/docs/runbooks/source-corruption.md`: Quarantine + reprocess from raw_ref
- `/docs/runbooks/incident-response.md`: Communication template + escalation

---

## Data Retention

Documented in `/docs/data/retention.md`:

| Data Type          | Hot Retention                   | Cold/Archive                     | Notes                    |
| ------------------ | ------------------------------- | -------------------------------- | ------------------------ |
| Price observations | 13 months (partitioned)         | Archive (S3/Storage)             | Rollups retained forever |
| Price rollups      | Forever                         | n/a                              |                          |
| Run logs           | 30 days (free) / 90 days (paid) | Delete after                     |                          |
| Audit logs         | 2 years                         | Legal hold exceptions documented |                          |
| Exports            | 7 days                          | Auto-deleted                     | User can re-generate     |
| Deleted accounts   | 30 days                         | Then purged                      | Legal hold exceptions    |
| Raw HTML snapshots | 7 days                          | Auto-deleted                     | Only for debug           |
| Session tokens     | Until expiry / revocation       |                                  |                          |

---

## Local Dev Setup (One Command)

```bash
git clone https://github.com/scrappy/scrappy
cd scrappy
pnpm install

# Start Supabase local stack (PG + Auth + Storage + Realtime + Studio at localhost:54323)
supabase start

# Apply migrations and seed
supabase db push
supabase db seed

# Boot all apps in dev mode
pnpm dev
```

`pnpm dev` uses Turborepo to start:

- `apps/web` on port 3000
- `apps/api` on port 3001
- `apps/worker` (watches for jobs)
- `apps/browser-worker` (on demand)
- Mailpit at http://localhost:8025

`pnpm check` runs all gates locally before pushing.
