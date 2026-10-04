-- ==============================================================================
-- PGTAP TENANCY & ROW LEVEL SECURITY TESTS
-- Verifies that RLS cannot be bypassed and cross-tenant attacks are rejected
-- ==============================================================================

BEGIN;
SELECT plan(13);

-- Test 1: Verify pgTAP extension exists
SELECT has_extension('pgtap');

-- Test 2: Verify RLS is enabled on critical tables (using pg_class relrowsecurity)
SELECT ok(
  (SELECT relrowsecurity FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relname = 'workspaces'),
  'workspaces table must have RLS enabled'
);

SELECT ok(
  (SELECT relrowsecurity FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relname = 'extraction_tasks'),
  'extraction_tasks table must have RLS enabled'
);

SELECT ok(
  (SELECT relrowsecurity FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relname = 'alerts'),
  'alerts table must have RLS enabled'
);

SELECT ok(
  (SELECT relrowsecurity FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relname = 'api_keys'),
  'api_keys table must have RLS enabled'
);

SELECT ok(
  (SELECT relrowsecurity FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relname = 'webhooks'),
  'webhooks table must have RLS enabled'
);

SELECT ok(
  (SELECT relrowsecurity FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relname = 'usage_records'),
  'usage_records table must have RLS enabled'
);

-- Setup test users and workspaces for Tenant Alpha and Tenant Beta
INSERT INTO auth.users (id, email) VALUES 
  ('11111111-1111-1111-1111-111111111111', 'user-alpha@scrappy.internal'),
  ('22222222-2222-2222-2222-222222222222', 'user-beta@scrappy.internal')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.workspaces (id, name, slug) VALUES 
  ('a0000000-0000-0000-0000-000000000001', 'Tenant Alpha Workspace', 'alpha-ws'),
  ('b0000000-0000-0000-0000-000000000002', 'Tenant Beta Workspace', 'beta-ws');

INSERT INTO public.workspace_members (workspace_id, user_id, role) VALUES
  ('a0000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'owner'),
  ('b0000000-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222', 'owner');

-- Insert a task owned by Tenant Beta
INSERT INTO public.extraction_tasks (id, workspace_id, url, schema, status)
VALUES (
  'e0000000-0000-0000-0000-000000000001',
  'b0000000-0000-0000-0000-000000000002',
  'https://beta-internal.example.com/data',
  '[]'::jsonb,
  'completed'
);

-- Test 7: An unauthenticated anon user CANNOT read tenant extraction tasks
SET LOCAL ROLE anon;
SELECT is_empty(
  $$ SELECT * FROM public.extraction_tasks $$,
  'Anonymous unauthenticated requests MUST NOT see any extraction tasks'
);

-- Test 8: An unauthenticated anon user CANNOT insert extraction tasks
PREPARE anon_insert_attack AS
  INSERT INTO public.extraction_tasks (workspace_id, url, schema)
  VALUES ('a0000000-0000-0000-0000-000000000001', 'https://malicious.com', '[]'::jsonb);

SELECT throws_ok(
  'anon_insert_attack',
  '42501', -- insufficient_privilege
  NULL,
  'Anonymous users MUST NOT be able to insert tasks'
);

-- Test 9: Public catalog (products) IS readable by anon users
SELECT isnt_empty(
  $$ SELECT * FROM public.products $$,
  'Public catalog products MUST be readable by all users'
);

-- Test 10: Switch context to Tenant Alpha user - MUST NOT see Tenant Beta's extraction tasks
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" = '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';

SELECT is_empty(
  $$ SELECT * FROM public.extraction_tasks WHERE workspace_id = 'b0000000-0000-0000-0000-000000000002' $$,
  'Tenant Alpha user MUST NOT see Tenant Beta extraction tasks'
);

-- Test 11: Tenant Alpha user attempting to update Tenant Beta's task results in 0 rows updated
SELECT is_empty(
  $$ UPDATE public.extraction_tasks SET status = 'failed' WHERE id = 'e0000000-0000-0000-0000-000000000001' RETURNING id $$,
  'Tenant Alpha update attack against Tenant Beta task MUST affect zero rows'
);

-- Test 12: Tenant Alpha can read its own workspace
SELECT isnt_empty(
  $$ SELECT * FROM public.workspaces WHERE id = 'a0000000-0000-0000-0000-000000000001' $$,
  'Tenant Alpha user CAN read own workspace'
);

SELECT * FROM finish();
ROLLBACK;
