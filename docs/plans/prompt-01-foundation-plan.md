# Prompt 01 Plan: Foundation — Monorepo, Tooling, CI

## Objective

Establish the production-grade monorepo foundation for SCRAPPY using pnpm workspaces, Turborepo, TypeScript strict mode, ESLint with import boundaries, Prettier, Vitest, Docker Compose, GitHub Actions CI, and clean starter scaffolding across all required apps and packages.

## Files to Create

### Monorepo Root & Tooling

- `package.json`: Root scripts (`dev`, `build`, `lint`, `typecheck`, `test`, `check`), devDependencies (turbo, prettier, eslint, typescript, vitest, husky, lint-staged, @commitlint/*).
- `pnpm-workspace.yaml`: Package & app glob definitions (`apps/*`, `packages/*`, `packages/adapters/*`).
- `turbo.json`: Pipeline configuration with cache outputs, dependencies (`^build`, `^typecheck`), env vars pass-through.
- `tsconfig.base.json`: Base TypeScript strict configuration with project references and node/browser targets.
- `.gitignore`: Ignore node_modules, .turbo, dist, .next, .env, *.log, coverage.
- `.prettierrc`: Consistent formatting configuration.
- `.commitlintrc.json`: Conventional commits config (`feat`, `fix`, `docs`, `chore`, etc.).
- `.lintstagedrc.json`: Staged linting & formatting.
- `vitest.workspace.ts`: Vitest multi-package test runner configuration.

### Config Packages (`/packages/config`)

- `packages/config/package.json`
- `packages/config/tsconfig/base.json`, `nextjs.json`, `node.json`, `library.json`
- `packages/config/eslint/base.js`, `nextjs.js`, `import-boundaries.js`
- `packages/config/tailwind/preset.js`

### Packages

- `packages/core`:
  - Domain error classes (`ScrappyError`, `NotFoundError`, `RateLimitError`, etc.)
  - Zod schemas for core entities (product, offer, merchant, price, extraction)
  - Units & currency normalization (INR paise, currency formatting)
  - Zod-validated environment loader (`loadEnv()`) that fails fast on missing/invalid vars
- `packages/db`:
  - DB client interface stub, tenant isolation query helpers (`withWorkspace()`)
- `packages/scraping`:
  - Adapter interface contract (`SourceAdapter`, `FetchResult`, `ExtractResult`, `AdapterHealth`)
  - Health scoring and circuit-breaker types
- `packages/adapters`:
  - `amazon-in`, `flipkart`, `croma`, `reliance-digital` initial adapter stubs conforming to `SourceAdapter`
- `packages/matching`:
  - Entity resolution engine types and interface contract
- `packages/pricing`:
  - Price stats, deal score interfaces
- `packages/ai`:
  - Provider-agnostic AI client interface (Gemini ready)
- `packages/brand`:
  - Brand assets, SVG marks, theme constants
- `packages/ui`:
  - Design tokens, basic button/badge/trust-badge primitives

### Apps

- `apps/web`: Next.js 15+ / App Router minimal shell with marketing, compare, intelligence, extract route shells, `.env.example`.
- `apps/api`: Fastify REST API with OpenAPI 3.1 generation via `@fastify/swagger` and zod validation, `.env.example`.
- `apps/worker`: pg-boss worker job dispatcher and handlers stub, `.env.example`.
- `apps/browser-worker`: Playwright/Crawlee isolated runner stub, `.env.example`.
- `apps/admin`: Internal operations console Next.js shell with allowlist auth check stub, `.env.example`.

### Infrastructure & CI

- `infra/docker-compose.yml`: PostgreSQL 16 (pgvector, pg_trgm, unaccent enabled), Mailpit, MinIO.
- `infra/init-db.sql`: Database extensions and baseline schema initialization.
- `.github/workflows/ci.yml`: Full multi-stage CI pipeline (lint -> typecheck -> unit -> integration -> build -> e2e preview -> security -> migration dry-run).

### Documentation

- `docs/architecture/overview.md`: Thesis diagram (Mermaid) and architectural data flow.
- `docs/architecture/scale-triggers.md`: Module splitting criteria.
- `docs/adr/0001-monorepo.md`: Architectural Decision Record for monorepo and tooling choices.

## Risks & Mitigations

1. **Node 24 / pnpm / tool compatibility**: Fastify, Next.js, and Turborepo need compatible configuration and modern ESM/CJS interop.
   _Mitigation_: Use standard modern TypeScript `moduleResolution: "bundler"` or `"node16"` and explicit package exports.
2. **ESLint flat config vs legacy config**: ESLint v9 uses flat config (`eslint.config.mjs`).
   _Mitigation_: Use flat config or clean compatible config that lints smoothly.
3. **Circular dependencies or improper package imports**:
   _Mitigation_: Enforce strict boundary rules (`apps` -> `packages`, `packages` cannot import `apps`, `adapters` only import `scraping` and `core`).

## Open Questions

- None blocking Phase 1 foundation; all decisions locked in Prompt 00 and Prompt Pack.
