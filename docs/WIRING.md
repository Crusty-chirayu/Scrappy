# SCRAPPY PLATFORM WIRING AUDIT

> Audit date: 2026-10-06  
> Requirement: Every user action classified as REAL (hits Supabase or the API), LOCAL (component state or localStorage), or MOCK. Verified by direct code search.

---

## User Action Wiring Table

| User Action | Status | Entrypoint / UI Trigger | Underlying Mechanism & Target Storage | Persistence Guarantee |
| :--- | :--- | :--- | :--- | :--- |
| **Sign Up** | **REAL** | `apps/web/src/app/auth/signup/page.tsx` (`handleSignup`) | Calls `getBrowserSupabase().auth.signUp({ email, password, options: { data: { full_name } } })`. | Creates user record in Supabase `auth.users` and triggers workspace member setup. |
| **Log In** | **REAL** | `apps/web/src/app/auth/login/page.tsx` (`handlePasswordLogin` & `handleMagicLink`) | Calls `supabase.auth.signInWithPassword` or `supabase.auth.signInWithOtp` against Supabase Auth. | Session persisted in browser storage / cookies and synced across tabs. |
| **Log Out** | **REAL** | `apps/web/src/components/WorkspaceSwitcher.tsx` (`auth-logout-btn`) via `auth-context.tsx` | Calls `supabase.auth.signOut()` and resets active workspace. | Invalidates active Supabase session in DB and clears local session cache. |
| **Add to Watchlist** | **REAL** | `apps/web/src/app/compare/[id]/WatchProductModal.tsx` (`handleSaveWatch`) | `POST /api/watchlist` -> calls `defaultSupabaseRepository.addToWatchlist(workspaceId, userId, productId)`. | Row inserted into PostgreSQL `product_watchlist` table. |
| **Remove from Watchlist** | **REAL** | `apps/web/src/app/watchlist/page.tsx` (`handleRemoveItem`) | `DELETE /api/watchlist?productId=...` -> calls `defaultSupabaseRepository.removeFromWatchlist(workspaceId, productId)`. | Row deleted from PostgreSQL `product_watchlist` table. |
| **Save Alert** | **REAL** | `apps/web/src/app/alerts/page.tsx` (`handleCreateAlert`) & `WatchProductModal.tsx` | `POST /api/alerts` -> calls `defaultSupabaseRepository.createAlert(...)`. | Row inserted into PostgreSQL `alerts` table. |
| **Run Extraction** | **MOCK / LOCAL** | `apps/web/src/app/extract/page.tsx` (`handleRunExtraction`) | Calls `POST /api/extract` (which creates DB row in `extract_runs`), but UI displays synthetic in-memory items instead of real run output records. | Run ID created in DB, but extracted records are mock fallback. Needs engine execution against fixtures. |
| **Upgrade Plan** | **LOCAL** | `apps/web/src/app/pricing/page.tsx` (`handleConfirmSubscription`) | Sets local React state `setCurrentPlan(billingModalTier.id)` without updating workspace record in DB. | Lost on page reload. Needs `PATCH /api/workspaces` connecting Razorpay test mode to DB. |

---

## Action Plan for Step 2

1. **Extraction Studio**: Wire Step 3 to execute extraction against real fixture HTML files via the local scraping engine and display real records returned from the database.
2. **Pricing & Plan Upgrade**: Add `PATCH /api/workspaces` route in `apps/web/src/app/api/workspaces/route.ts` to persist `plan` to the database, wire `handleConfirmSubscription` to invoke this API, label Razorpay modal clearly with "Test mode", and verify persistence across page reloads.
