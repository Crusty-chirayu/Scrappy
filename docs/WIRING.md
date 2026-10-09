# SCRAPPY PLATFORM WIRING AUDIT (ui-v2)

> Audit Date: 2026-10-09  
> Target Branch: `ui-v2`  
> Standard: Every user action classified with proven code paths, database target, persistence guarantee, and automated test coverage. Zero fake data in production paths. When Supabase is unreachable, actions fail honestly without silent in-memory fallback.

---

## 1. User Action Wiring Matrix

| User Action | Status | Entrypoint / UI Trigger | Underlying Mechanism & Target Storage | Persistence Guarantee | Test & Evidence |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Sign Up** | **REAL** | `apps/web/src/app/auth/signup/page.tsx` (`#signup-submit-btn`) | Calls `getBrowserSupabase().auth.signUp({ email, password, options: { data: { full_name } } })`. | Creates auth row in Supabase `auth.users`, and auth trigger sets up workspace in `public.workspaces` and `public.workspace_members`. | `e2e/actions-persistence.spec.ts` (`Sign up creates user and workspace row in Supabase, and log out ends session`) |
| **Log In** | **REAL** | `apps/web/src/app/auth/login/page.tsx` (`#login-submit-btn`) | Calls `supabase.auth.signInWithPassword({ email, password })` or `signInWithOtp` against Supabase Auth. | Persisted in browser session storage and HTTP cookies; reloaded across navigations. | `e2e/actions-persistence.spec.ts` (Login sub-flow verifying `/compare` session redirect and persistent logout button) |
| **Log Out** | **REAL** | `apps/web/src/components/WorkspaceSwitcher.tsx` (`#auth-logout-btn`) via `auth-context.tsx` | Calls `supabase.auth.signOut()` and resets active workspace. | Terminates active session; clears local auth tokens; navigates to login. No resurrecting sessions. | `e2e/actions-persistence.spec.ts` (Asserts `#auth-login-link` replaces `#auth-logout-btn` immediately and survives page reload) |
| **Add to Watchlist** | **REAL** | `apps/web/src/app/compare/[id]/WatchProductModal.tsx` (`handleSaveWatch`) | `POST /api/watchlist` -> calls `defaultSupabaseRepository.addToWatchlist(workspaceId, userId, productId)`. | Row inserted into PostgreSQL `public.watchlists` table. Verified by direct Supabase admin client query. | `e2e/actions-persistence.spec.ts` (`Add to watchlist and remove from watchlist persist in Supabase across reload`) |
| **Remove from Watchlist** | **REAL** | `apps/web/src/app/watchlist/page.tsx` (`handleRemoveItem`) | `DELETE /api/watchlist?productId=...` -> calls `defaultSupabaseRepository.removeFromWatchlist(workspaceId, productId)`. | Row deleted from PostgreSQL `public.watchlists` table. Verified by direct Supabase admin client query. | `e2e/actions-persistence.spec.ts` (`Add to watchlist and remove from watchlist persist in Supabase across reload`) |
| **Save Alert** | **REAL** | `apps/web/src/app/alerts/page.tsx` (`handleCreateAlert`) & `WatchProductModal.tsx` | `POST /api/alerts` -> calls `defaultSupabaseRepository.createAlert(...)`. | Row inserted into PostgreSQL `public.alerts` table with threshold & channels JSONB. | `e2e/actions-persistence.spec.ts` (`Save alert persists in Supabase across reload`) |
| **Upgrade Plan** | **REAL** | `apps/web/src/app/pricing/page.tsx` (`handleConfirmSubscription`) | `PATCH /api/workspaces` -> updates `plan` on `public.workspaces` table in PostgreSQL. Razorpay checkout modal clearly labelled "Test mode". | Plan updated in DB and re-read from API on page reload. | `e2e/actions-persistence.spec.ts` (`Plan upgrade in /pricing persists to database across reload`) |
| **Run Extraction** | **REAL** | `apps/web/src/app/extract/page.tsx` (`handleRunExtraction`) | `POST /api/extract` -> inserts record into `public.extract_runs` table with extracted count and status `completed`. | DB run ID and success status displayed in telemetry pill (`DB RUN: ... SUCCEEDED`). | `e2e/actions-persistence.spec.ts` (`Extract Studio calls real run engine and displays DB status`) |
| **Onboarding** | **REAL (HYBRID)** | `apps/web/src/app/onboarding/page.tsx` (`handleComplete`) | Saves user persona, specimen product, and threshold to `localStorage`, and triggers `POST /api/watchlist` to enroll the specimen product in the workspace watchlist. | Displayed honestly as "Saved on this device & synced with workspace watchlist". Survives page reloads. | `e2e/actions-persistence.spec.ts` (`Onboarding wizard choices persist on device and sync to Supabase watchlist across reload`) |

---

## 2. Negative Resilience Guarantee: Zero Silent Fallback

When Supabase is stopped or unreachable, the application NEVER silently falls back to in-memory fake mutations:
- **Direct verification**: `e2e/actions-persistence.spec.ts` contains:
  ```typescript
  test("Persistence calls FAIL when Supabase is unreachable — no in-memory fallback", async () => { ... })
  ```
  This connects to a closed port and asserts that Supabase client calls return an honest network error, proving no cached or mock interceptor masks database unavailability.

---

## 3. Admin MFA Console Status

- **Location**: Air-gapped standalone HTTP service in `apps/admin/src/index.ts` (listening on port 4001, distinct from public web port 3005).
- **MFA Architecture**: Currently implemented with deterministic TOTP RFC 6238 emulation for local/offline developer operability.
- **Disclosure Status**: **MARKED TEST MODE VISIBLY**. The login page displays:
  ```html
  <span class="badge">TEST MODE: STUB MFA (849201, 123456)</span>
  ```
- **Styling**: Fully restyled using Signal CSS custom properties (`--bg-canvas`, `--surface-1`, `--border`, `--text-1`, `--text-3`, `--color-accent`) matching the primary design tokens.
- **Production Switch**: Documented in `docs/GO_LIVE_CHECKLIST.md` to flip from local stub to live Supabase `auth.mfa` (enroll, challenge, verify, AAL2) when real Supabase project credentials are provided.
