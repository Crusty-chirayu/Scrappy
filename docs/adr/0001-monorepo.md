# ADR 0001: Monorepo Architecture with pnpm and Turborepo

## Status

Accepted

## Context

SCRAPPY consists of multiple coordinated application surfaces (Next.js web application for consumer/business/developer portals, Fastify REST API, pg-boss background workers, Playwright browser workers, internal admin console) sharing extensive domain logic:

- Strict entity schemas (Zod)
- Normalization routines (INR currency parsing, EAN/UPC matching)
- Database schemas and migration definitions (Drizzle ORM)
- Design tokens, UI primitives, and visual charts
- Ingestion contracts and source adapters

Managing separate repositories would create significant version drift, slow down full-stack feature development, and complicate end-to-end type validation.

## Decision

We adopt a **pnpm workspaces + Turborepo** monorepo structure:

1. **Package Manager**: `pnpm` (fast, disk-efficient, strict symlink isolation that prevents phantom dependencies).
2. **Build System & Task Orchestrator**: `Turborepo` (pipeline orchestration, topological execution, remote-cache ready, parallelized caching).
3. **Language & Tooling**: TypeScript strict across all packages and apps, project references, path aliases via `@scrappy/*`.
4. **Dependency Boundaries**:
   - `apps/*` may depend on `packages/*`.
   - `packages/*` may NOT depend on `apps/*`.
   - `packages/adapters/*` may only depend on `packages/scraping` and `packages/core`.

## Consequences

### Positive

- Single atomic commits across UI, API, worker jobs, and database schema migrations.
- Shared domain validation types and utilities without publishing private npm packages.
- Uniform linting, formatting, typechecking, and test pipelines in a single CI definition.
- High velocity during early stage development and prototyping.

### Negative / Tradeoffs

- Repository size grows faster over time. Mitigated by strict `.gitignore` rules and keeping fixtures small.
- Monorepo tooling setup requires explicit boundary rules in ESLint to avoid improper coupling.
