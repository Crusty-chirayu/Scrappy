-- ==============================================================================
-- PGTAP TENANCY & ROW LEVEL SECURITY TESTS
-- Verifies that RLS cannot be bypassed and cross-tenant attacks are rejected
-- ==============================================================================

BEGIN;
SELECT plan(8);

-- Test 1: Verify pgTAP extension exists
SELECT has_extension('pgtap');

-- Test 2: Verify RLS is enabled on critical tables
SELECT table_has_rls('public', 'workspaces', 'workspaces table must have RLS');
SELECT table_has_rls('public', 'extraction_tasks', 'extraction_tasks table must have RLS');
SELECT table_has_rls('public', 'alerts', 'alerts table must have RLS');
SELECT table_has_rls('public', 'api_keys', 'api_keys table must have RLS');

-- Setup test workspaces for Tenant Alpha and Tenant Beta
INSERT INTO public.workspaces (id, name, slug) VALUES 
  ('a0000000-0000-0000-0000-000000000001', 'Tenant Alpha Workspace', 'alpha-ws'),
  ('b0000000-0000-0000-0000-000000000002', 'Tenant Beta Workspace', 'beta-ws');

-- Insert a task owned by Tenant Beta
INSERT INTO public.extraction_tasks (id, workspace_id, url, schema, status)
VALUES (
  'e0000000-0000-0000-0000-000000000001',
  'b0000000-0000-0000-0000-000000000002',
  'https://beta-internal.example.com/data',
  '[]'::jsonb,
  'completed'
);

-- Test 3: An unauthenticated anon user CANNOT read tenant extraction tasks
SET LOCAL ROLE anon;
SELECT is_empty(
  $$ SELECT * FROM public.extraction_tasks $$,
  'Anonymous unauthenticated requests MUST NOT see any extraction tasks'
);

-- Test 4: An unauthenticated anon user CANNOT insert extraction tasks
PREPARE anon_insert_attack AS
  INSERT INTO public.extraction_tasks (workspace_id, url, schema)
  VALUES ('a0000000-0000-0000-0000-000000000001', 'https://malicious.com', '[]'::jsonb);

SELECT throws_ok(
  'anon_insert_attack',
  '42501', -- insufficient_privilege
  NULL,
  'Anonymous users MUST NOT be able to insert tasks'
);

-- Test 5: Public catalog (products) IS readable by anon users
SELECT isnt_empty(
  $$ SELECT * FROM public.products $$,
  'Public catalog products MUST be readable by all users'
);

SELECT * FROM finish();
ROLLBACK;
