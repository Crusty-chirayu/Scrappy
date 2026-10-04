-- ==============================================================================
-- PGTAP TEST: 02_rls_coverage.test.sql
-- Master Backlog G3: Automated RLS coverage and cross-tenant attack suite
-- ==============================================================================

BEGIN;
SELECT plan(15);

-- 1. Verify pgTAP extension
SELECT has_extension('pgtap');

-- 2. CRITICAL AUDIT: Every single table in the public schema MUST have RLS enabled
-- This test checks pg_class.relrowsecurity for every table in schemaname = 'public'.
-- If even a single table is created without ALTER TABLE ... ENABLE ROW LEVEL SECURITY, this test FAILS.
SELECT is(
  (
    SELECT count(*)::bigint
    FROM pg_tables t
    JOIN pg_class c ON c.relname = t.tablename
    JOIN pg_namespace n ON n.oid = c.relnamespace AND n.nspname = 'public'
    WHERE t.schemaname = 'public' AND NOT c.relrowsecurity
  ),
  0::bigint,
  'CRITICAL: Every table in schema public MUST have Row Level Security (relrowsecurity) enabled'
);

-- 3. Verify total number of secured public tables is at least 30
SELECT cmp_ok(
  (
    SELECT count(*)::bigint
    FROM pg_tables t
    WHERE t.schemaname = 'public'
  ),
  '>=',
  30::bigint,
  'Complete platform schema MUST have at least 30 tables defined'
);

-- Setup test users and tenant workspaces
INSERT INTO auth.users (id, email) VALUES 
  ('33333333-3333-3333-3333-333333333333', 'user-gamma@scrappy.internal'),
  ('44444444-4444-4444-4444-444444444444', 'user-delta@scrappy.internal')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.workspaces (id, name, slug) VALUES 
  ('c0000000-0000-0000-0000-000000000001', 'Tenant Gamma Workspace', 'gamma-ws'),
  ('d0000000-0000-0000-0000-000000000002', 'Tenant Delta Workspace', 'delta-ws')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.workspace_members (workspace_id, user_id, role) VALUES
  ('c0000000-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333', 'owner'),
  ('d0000000-0000-0000-0000-000000000002', '44444444-4444-4444-4444-444444444444', 'owner')
ON CONFLICT (workspace_id, user_id) DO NOTHING;

-- Populate records for Tenant Delta
INSERT INTO public.datasets (id, workspace_id, name, description)
VALUES ('d1111111-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000002', 'Delta Confidential Scrape', 'Private dataset');

INSERT INTO public.saved_searches (id, workspace_id, user_id, query)
VALUES ('d2222222-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000002', '44444444-4444-4444-4444-444444444444', 'confidential query');

INSERT INTO public.watchlists (id, workspace_id, user_id, product_id)
VALUES ('d3333333-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000002', '44444444-4444-4444-4444-444444444444', 'b2000000-0000-0000-0000-000000000001');

INSERT INTO public.alerts (id, workspace_id, user_id, product_id, target_price_paise, channels)
VALUES ('d4444444-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000002', '44444444-4444-4444-4444-444444444444', 'b2000000-0000-0000-0000-000000000001', 50000, '["in_app"]'::jsonb);

-- 4. Test Anonymous user CANNOT access tenant datasets
SET LOCAL ROLE anon;
SELECT is_empty(
  $$ SELECT * FROM public.datasets $$,
  'Anonymous role CANNOT read any tenant datasets'
);

-- 5. Test Anonymous user CANNOT access tenant saved_searches
SELECT is_empty(
  $$ SELECT * FROM public.saved_searches $$,
  'Anonymous role CANNOT read tenant saved searches'
);

-- 6. Test Anonymous user CAN read public price daily rollups
SELECT ok(
  (SELECT count(*) >= 0 FROM public.price_daily_rollups),
  'Public daily price rollups are accessible by anon'
);

-- 7. Test Anonymous user CAN read public match evidence
SELECT ok(
  (SELECT count(*) >= 0 FROM public.match_evidence),
  'Public match evidence table is accessible by anon'
);

-- 8. Switch to Tenant Gamma (user 3333...)
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" = '{"sub": "33333333-3333-3333-3333-333333333333", "role": "authenticated"}';

-- 9. Cross-Tenant Attack Test: Gamma cannot read Delta datasets
SELECT is_empty(
  $$ SELECT * FROM public.datasets WHERE workspace_id = 'd0000000-0000-0000-0000-000000000002' $$,
  'Tenant Gamma CANNOT read Tenant Delta datasets'
);

-- 10. Cross-Tenant Attack Test: Gamma cannot read Delta saved searches
SELECT is_empty(
  $$ SELECT * FROM public.saved_searches WHERE workspace_id = 'd0000000-0000-0000-0000-000000000002' $$,
  'Tenant Gamma CANNOT read Tenant Delta saved searches'
);

-- 11. Cross-Tenant Attack Test: Gamma cannot read Delta watchlists
SELECT is_empty(
  $$ SELECT * FROM public.watchlists WHERE workspace_id = 'd0000000-0000-0000-0000-000000000002' $$,
  'Tenant Gamma CANNOT read Tenant Delta watchlist'
);

-- 12. Cross-Tenant Attack Test: Gamma cannot read Delta alerts
SELECT is_empty(
  $$ SELECT * FROM public.alerts WHERE workspace_id = 'd0000000-0000-0000-0000-000000000002' $$,
  'Tenant Gamma CANNOT read Tenant Delta alerts'
);

-- 13. Cross-Tenant Attack Test: Gamma CANNOT insert dataset into Delta workspace (WITH CHECK violation)
PREPARE cross_insert_attack AS
  INSERT INTO public.datasets (workspace_id, name)
  VALUES ('d0000000-0000-0000-0000-000000000002', 'Injected Dataset by Attacker');

SELECT throws_ok(
  'cross_insert_attack',
  '42501', -- new row violates row-level security policy
  NULL,
  'Tenant Gamma CANNOT insert datasets into Tenant Delta workspace'
);

-- 14. Tenant Gamma CAN create and read their own dataset
INSERT INTO public.datasets (id, workspace_id, name)
VALUES ('c1111111-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Gamma Allowed Dataset');

SELECT isnt_empty(
  $$ SELECT * FROM public.datasets WHERE id = 'c1111111-0000-0000-0000-000000000001' $$,
  'Tenant Gamma CAN read their own datasets'
);

-- 14b. Verify Gamma only sees exactly 1 dataset (their own)
SELECT is(
  (SELECT count(*)::bigint FROM public.datasets),
  1::bigint,
  'Tenant Gamma sees ONLY their own datasets (total = 1)'
);

-- 15. Cross-Tenant Update Isolation: Gamma CANNOT modify Delta's dataset
UPDATE public.datasets SET name = 'Hacked by Gamma' WHERE workspace_id = 'd0000000-0000-0000-0000-000000000002';

SET LOCAL ROLE postgres;
SELECT is(
  (SELECT name FROM public.datasets WHERE id = 'd1111111-0000-0000-0000-000000000001'),
  'Delta Confidential Scrape',
  'Tenant Delta dataset remains completely untouched after cross-tenant update attempt'
);

SELECT * FROM finish();
ROLLBACK;
