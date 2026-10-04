# DEV NOISE REPORT

> Generated during Truth Pass Step A1 (Clean State Reproduction).
> Audit timestamp: 2026-10-05T00:37:30+05:30
> Tested environments: Windows 11, Node.js v24.16.0, pnpm 11.21.0, npm 11.1.0

---

## 1. Clean State Reproduction Terminal Outputs

### 1.1 `npm run dev` Terminal Capture (RAW UNEDITED)

```text
npm warn Unknown project config "only-built-dependencies". This will stop working in the next major version of npm. See `npm help npmrc` for supported config options.

> scrappy-monorepo@0.1.0 dev
> turbo run dev


   • turbo 2.11.7
   • Packages in scope: @scrappy/adapters, @scrappy/admin, @scrappy/ai, @scrappy/api, @scrappy/brand, @scrappy/browser-worker, @scrappy/config, @scrappy/core, @scrappy/db, @scrappy/matching, @scrappy/pricing, @scrappy/scraping, @scrappy/ui, @scrappy/web, @scrappy/worker
   • Running dev in 15 packages
   • Remote caching disabled

@scrappy/api:dev: cache bypass, force executing 24e12923a78718be
@scrappy/worker:dev: cache bypass, force executing 5c513ccf94ea1fe5
@scrappy/browser-worker:dev: cache bypass, force executing e727f148b729a0d9
@scrappy/admin:dev: cache bypass, force executing 44f47f2a4057b0df
@scrappy/web:dev: cache bypass, force executing 80ccb10babcd1c8c
@scrappy/api:dev: $ node --watch src/index.ts
@scrappy/worker:dev: $ node --watch src/index.ts
@scrappy/browser-worker:dev: $ node --watch src/index.ts
@scrappy/admin:dev: $ node --watch src/index.ts
@scrappy/web:dev: $ next dev
@scrappy/worker:dev: node:internal/modules/esm/resolve:271
@scrappy/worker:dev:     throw new ERR_MODULE_NOT_FOUND(
@scrappy/worker:dev:           ^
@scrappy/worker:dev: 
@scrappy/worker:dev: Error [ERR_MODULE_NOT_FOUND]: Cannot find module 'E:\projects\Scrappy\apps\worker\src\boss.js' imported from E:\projects\Scrappy\apps\worker\src\index.ts
@scrappy/worker:dev:     at finalizeResolution (node:internal/modules/esm/resolve:271:11)
@scrappy/worker:dev:     at moduleResolve (node:internal/modules/esm/resolve:865:10)
@scrappy/worker:dev:     at defaultResolve (node:internal/modules/esm/resolve:992:11)
@scrappy/worker:dev:     at #cachedDefaultResolve (node:internal/modules/esm/loader:691:20)
@scrappy/worker:dev:     at #resolveAndMaybeBlockOnLoaderThread (node:internal/modules/esm/loader:708:38)
@scrappy/worker:dev:     at ModuleLoader.resolveSync (node:internal/modules/esm/loader:740:52)
@scrappy/worker:dev:     at #resolve (node:internal/modules/esm/loader:673:17)
@scrappy/worker:dev:     at ModuleLoader.getOrCreateModuleJob (node:internal/modules/esm/loader:593:35)
@scrappy/worker:dev:     at ModuleJob.syncLink (node:internal/modules/esm/module_job:163:33)
@scrappy/worker:dev:     at ModuleJob.link (node:internal/modules/esm/module_job:253:17) {
@scrappy/worker:dev:   code: 'ERR_MODULE_NOT_FOUND',
@scrappy/worker:dev:   url: 'file:///E:/projects/Scrappy/apps/worker/src/boss.js'
@scrappy/worker:dev: }
@scrappy/worker:dev: 
@scrappy/worker:dev: Node.js v24.16.0
@scrappy/worker:dev: Failed running 'src/index.ts'. Waiting for file changes before restarting...
@scrappy/browser-worker:dev: [Browser Worker] Running isolated browser worker on port 5000
@scrappy/admin:dev: [Admin] Isolated ops console listening on port 3001
@scrappy/web:dev:    ▲ Next.js 15.5.27
@scrappy/web:dev:    - Local:        http://localhost:3000
@scrappy/web:dev:    - Network:      http://172.27.160.1:3000
@scrappy/web:dev: 
@scrappy/web:dev:  ✓ Starting...
@scrappy/api:dev: {"level":30,"time":1791140566791,"pid":16188,"hostname":"LOQ","msg":"Server listening at http://127.0.0.1:4000"}
@scrappy/api:dev: {"level":30,"time":1791140566792,"pid":16188,"hostname":"LOQ","msg":"Server listening at http://172.27.160.1:4000"}
@scrappy/api:dev: {"level":30,"time":1791140566792,"pid":16188,"hostname":"LOQ","msg":"Server listening at http://10.159.168.115:4000"}
@scrappy/api:dev: {"level":30,"time":1791140566792,"pid":16188,"hostname":"LOQ","msg":"Scrappy API listening on http://127.0.0.1:4000"}
@scrappy/api:dev: {"level":30,"time":1791140566792,"pid":16188,"hostname":"LOQ","msg":"Swagger OpenAPI documentation at http://127.0.0.1:4000/docs"}
@scrappy/web:dev:  ✓ Ready in 4s
```

### 1.2 `pnpm dev` Terminal Capture (RAW UNEDITED)

```text
$ turbo run dev

   • turbo 2.11.7
   • Packages in scope: @scrappy/adapters, @scrappy/admin, @scrappy/ai, @scrappy/api, @scrappy/brand, @scrappy/browser-worker, @scrappy/config, @scrappy/core, @scrappy/db, @scrappy/matching, @scrappy/pricing, @scrappy/scraping, @scrappy/ui, @scrappy/web, @scrappy/worker
   • Running dev in 15 packages
   • Remote caching disabled

@scrappy/web:dev: cache bypass, force executing 80ccb10babcd1c8c
@scrappy/api:dev: cache bypass, force executing 24e12923a78718be
@scrappy/worker:dev: cache bypass, force executing 5c513ccf94ea1fe5
@scrappy/admin:dev: cache bypass, force executing 44f47f2a4057b0df
@scrappy/browser-worker:dev: cache bypass, force executing e727f148b729a0d9
@scrappy/web:dev: $ next dev
@scrappy/api:dev: $ node --watch src/index.ts
@scrappy/worker:dev: $ node --watch src/index.ts
@scrappy/admin:dev: $ node --watch src/index.ts
@scrappy/browser-worker:dev: $ node --watch src/index.ts
@scrappy/worker:dev: node:internal/modules/esm/resolve:271
@scrappy/worker:dev:     throw new ERR_MODULE_NOT_FOUND(
@scrappy/worker:dev:           ^
@scrappy/worker:dev: 
@scrappy/worker:dev: Error [ERR_MODULE_NOT_FOUND]: Cannot find module 'E:\projects\Scrappy\apps\worker\src\boss.js' imported from E:\projects\Scrappy\apps\worker\src\index.ts
@scrappy/worker:dev:     at finalizeResolution (node:internal/modules/esm/resolve:271:11)
@scrappy/worker:dev:     at moduleResolve (node:internal/modules/esm/resolve:865:10)
@scrappy/worker:dev:     at defaultResolve (node:internal/modules/esm/resolve:992:11)
@scrappy/worker:dev:     at #cachedDefaultResolve (node:internal/modules/esm/loader:691:20)
@scrappy/worker:dev:     at #resolveAndMaybeBlockOnLoaderThread (node:internal/modules/esm/loader:708:38)
@scrappy/worker:dev:     at ModuleLoader.resolveSync (node:internal/modules/esm/loader:740:52)
@scrappy/worker:dev:     at #resolve (node:internal/modules/esm/loader:673:17)
@scrappy/worker:dev:     at ModuleLoader.getOrCreateModuleJob (node:internal/modules/esm/loader:593:35)
@scrappy/worker:dev:     at ModuleJob.syncLink (node:internal/modules/esm/module_job:163:33)
@scrappy/worker:dev:     at ModuleJob.link (node:internal/modules/esm/module_job:253:17) {
@scrappy/worker:dev:   code: 'ERR_MODULE_NOT_FOUND',
@scrappy/worker:dev:   url: 'file:///E:/projects/Scrappy/apps/worker/src/boss.js'
@scrappy/worker:dev: }
@scrappy/worker:dev: 
@scrappy/worker:dev: Node.js v24.16.0
@scrappy/worker:dev: Failed running 'src/index.ts'. Waiting for file changes before restarting...
@scrappy/admin:dev: [Admin] Isolated ops console listening on port 3001
@scrappy/browser-worker:dev: [Browser Worker] Running isolated browser worker on port 5000
@scrappy/web:dev:    ▲ Next.js 15.5.27
@scrappy/web:dev:    - Local:        http://localhost:3000
@scrappy/web:dev:    - Network:      http://172.27.160.1:3000
@scrappy/web:dev: 
@scrappy/web:dev:  ✓ Starting...
@scrappy/api:dev: {"level":30,"time":1791140857853,"pid":21916,"hostname":"LOQ","msg":"Server listening at http://127.0.0.1:4000"}
@scrappy/api:dev: {"level":30,"time":1791140857854,"pid":21916,"hostname":"LOQ","msg":"Server listening at http://172.27.160.1:4000"}
@scrappy/api:dev: {"level":30,"time":1791140857854,"pid":21916,"hostname":"LOQ","msg":"Server listening at http://10.159.168.115:4000"}
@scrappy/api:dev: {"level":30,"time":1791140857854,"pid":21916,"hostname":"LOQ","msg":"Scrappy API listening on http://127.0.0.1:4000"}
@scrappy/api:dev: {"level":30,"time":1791140857854,"pid":21916,"hostname":"LOQ","msg":"Swagger OpenAPI documentation at http://127.0.0.1:4000/docs"}
@scrappy/web:dev:  ✓ Ready in 3.8s
```

---

## 2. Browser Console & Network Audit Matrix (1280px & 360px)

Audited across 13 core web routes + isolated admin console:

| Route | Viewport | HTTP Status | Page Errors | Failed Requests | Console Warnings / Errors |
|---|---|---|---|---|---|
| `/` (Home) | 1280px | 200 | 0 | 0* | 0 |
| `/compare` | 1280px | 200 | 0 | 0* | 0 |
| `/compare/prod_101` | 1280px | 200 | 0 | 0 | 0 |
| `/extract` | 1280px | 200 | 0 | 0 | 0 |
| `/intelligence` | 1280px | 200 | 0 | 0 | 1 GoTrue warning |
| `/settings` | 1280px | 200 | 0 | 0 | 0 |
| `/docs` | 1280px | 200 | 0 | 0 | 0 |
| `/status` | 1280px | 200 | 0 | 0 | 0 |
| `/legal/terms` | 1280px | 200 | 0 | 0 | 0 |
| `/legal/privacy` | 1280px | 200 | 0 | 0 | 0 |
| `/legal/responsible-scraping` | 1280px | 200 | 0 | 0 | 0 |
| `/auth/login` | 1280px | 200 | 0 | 0 | 0 |
| `/auth/signup` | 1280px | 200 | 0 | 0 | 0 |
| `/` (Home) | 360px | 200 | 0 | 0 | 0 |
| `/compare` | 360px | 200 | 0 | 0 | 1 GoTrue warning |
| `/compare/prod_101` | 360px | 200 | 0 | 0 | 0 |
| `/extract` | 360px | 200 | 0 | 0 | 0 |
| `/intelligence` | 360px | 200 | 0 | 0 | 1 GoTrue warning |
| `/settings` | 360px | 200 | 0 | 0 | 0 |
| `/docs` | 360px | 200 | 0 | 0 | 0 |
| `/status` | 360px | 200 | 0 | 0 | 0 |
| `/legal/terms` | 360px | 200 | 0 | 0 | 0 |
| `/legal/privacy` | 360px | 200 | 0 | 0 | 0 |
| `/legal/responsible-scraping` | 360px | 200 | 0 | 0 | 0 |
| `/auth/login` | 360px | 200 | 0 | 0 | 0 |
| `/auth/signup` | 360px | 200 | 0 | 0 | 0 |

*\*Note: On initial cold boot, Next.js page compilation took >15s on Windows leading to client timeout if wait timeout is low. In normal running, both returned HTTP 200 cleanly with zero network errors.*

---

## 3. Inventory of Distinct Noise Items with Source Files

### Item 1: npm unknown project config warning
- **Symptom:** `npm warn Unknown project config "only-built-dependencies". This will stop working in the next major version of npm.`
- **Source File:** [`.npmrc`](file:///e:/projects/Scrappy/.npmrc#L2)
- **Root Cause:** `only-built-dependencies=*` is a pnpm-specific directive. Placing it directly in `.npmrc` causes npm to emit warnings when `npm` is invoked.
- **Fix:** Move `onlyBuiltDependencies` into root `package.json` under `"pnpm": { "onlyBuiltDependencies": [...] }` or delete `.npmrc` entry and configure properly for pnpm. Also add a predev guard that fails `npm run dev` with a clear message: `"This repository uses pnpm. Please run: pnpm dev"`.

### Item 2: Module resolution crash in `@scrappy/worker:dev`
- **Symptom:** `Error [ERR_MODULE_NOT_FOUND]: Cannot find module 'E:\projects\Scrappy\apps\worker\src\boss.js' imported from E:\projects\Scrappy\apps\worker\src\index.ts`
- **Source File:** [`apps/worker/package.json`](file:///e:/projects/Scrappy/apps/worker/package.json#L9) and [`apps/worker/src/index.ts`](file:///e:/projects/Scrappy/apps/worker/src/index.ts#L4)
- **Root Cause:** `apps/worker` dev script is `"dev": "node --watch src/index.ts"`. Node's experimental TypeScript runner does not map relative `.js` imports to `.ts` files on Windows.
- **Fix:** Update dev script to `"tsx watch src/index.ts"`, consistent with modern TS monorepo standards.

### Item 3: Supabase Multiple GoTrueClient instances warning
- **Symptom:** `Multiple GoTrueClient instances detected in the same browser context. It is not an error, but this should be avoided as it may produce undefined behavior when used concurrently under the same storage key.`
- **Source Files:**
  - [`packages/db/src/supabase.ts`](file:///e:/projects/Scrappy/packages/db/src/supabase.ts)
  - [`apps/web/src/app/compare/page.tsx`](file:///e:/projects/Scrappy/apps/web/src/app/compare/page.tsx)
  - [`apps/web/src/app/intelligence/page.tsx`](file:///e:/projects/Scrappy/apps/web/src/app/intelligence/page.tsx)
- **Root Cause:** Client components or hook calls call `createBrowserClient()` or `createClient()` multiple times instead of reusing a module-level singleton browser client instance.
- **Fix:** Ensure a singleton browser client is created and shared across all client components in `apps/web`.

### Item 4: Fastify API raw JSON multi-line logs on boot
- **Symptom:** 5 raw JSON logs printed on startup:
  ```json
  {"level":30,"time":1791140566791,"pid":16188,"hostname":"LOQ","msg":"Server listening at http://127.0.0.1:4000"}
  ```
- **Source File:** [`apps/api/src/index.ts`](file:///e:/projects/Scrappy/apps/api/src/index.ts)
- **Root Cause:** Fastify's default logger outputs raw JSON lines for each network interface.
- **Fix:** Provide clean, quiet structured logs: a single clean startup line per app (`[Scrappy API] Listening on port 4000`), with detailed JSON/debug logs enabled only when `DEBUG=1`.

### Item 5: Inconsistent dev script ports and port drift risk
- **Symptom:** `next dev` by default may pick 3000, 3001, 3002 if a port is held. Admin console and worker ports must be strictly locked down.
- **Source Files:**
  - `apps/web/package.json` (`next dev -p 3000`)
  - `apps/admin/package.json` (3001)
  - `apps/api/package.json` (4000)
  - `apps/browser-worker/package.json` (5000)
- **Fix:** Explicit `-p 3000` for Next.js, and preflight port verification that fails fast if any port in the 3000, 3001, 4000, 5000 map is occupied.
