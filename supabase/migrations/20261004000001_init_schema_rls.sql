-- ==============================================================================
-- SCRAPPY COMPREHENSIVE PLATFORM SCHEMA & ROW LEVEL SECURITY
-- Migration: 20261004000001_init_schema_rls.sql
-- ==============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ------------------------------------------------------------------------------
-- 1. Workspaces & Membership
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'pro', 'enterprise')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.workspace_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL, -- references auth.users(id)
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (workspace_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.team_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 2. Taxonomy & Catalog
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  brand_id UUID REFERENCES public.brands(id) ON DELETE SET NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  model TEXT,
  ean TEXT,
  upc TEXT,
  sku TEXT,
  description TEXT,
  image_url TEXT,
  embedding vector(768),
  is_synthetic BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  sku TEXT NOT NULL,
  attributes JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.product_identifiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  id_type TEXT NOT NULL, -- ASIN, FSN, EAN, UPC, MPN
  id_value TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (id_type, id_value)
);

CREATE TABLE IF NOT EXISTS public.merchants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  source_id TEXT NOT NULL, -- amazon-in, flipkart, croma, reliance-digital
  base_url TEXT NOT NULL,
  trust_score NUMERIC(3, 2) NOT NULL DEFAULT 1.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  merchant_id UUID REFERENCES public.merchants(id) ON DELETE SET NULL,
  source TEXT NOT NULL,
  merchant_name TEXT NOT NULL,
  url TEXT NOT NULL,
  current_price_paise INTEGER NOT NULL CHECK (current_price_paise >= 0),
  original_price_paise INTEGER CHECK (original_price_paise IS NULL OR original_price_paise >= 0),
  in_stock BOOLEAN NOT NULL DEFAULT true,
  provenance JSONB NOT NULL,
  is_synthetic BOOLEAN NOT NULL DEFAULT false,
  last_observed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.price_observations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id UUID NOT NULL REFERENCES public.offers(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  price_paise INTEGER NOT NULL CHECK (price_paise >= 0),
  in_stock BOOLEAN NOT NULL DEFAULT true,
  is_synthetic BOOLEAN NOT NULL DEFAULT false,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  provenance JSONB NOT NULL
);

-- ------------------------------------------------------------------------------
-- 3. Watchlists, Alerts & Notifications
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.watchlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (workspace_id, product_id)
);

CREATE TABLE IF NOT EXISTS public.alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  target_price_paise INTEGER NOT NULL CHECK (target_price_paise > 0),
  channels JSONB NOT NULL DEFAULT '["email", "in_app"]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.saved_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  query TEXT NOT NULL,
  filters JSONB NOT NULL DEFAULT '{}'::jsonb,
  notify_on_new BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.deal_feed_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  offer_id UUID NOT NULL REFERENCES public.offers(id) ON DELETE CASCADE,
  deal_score NUMERIC(3, 1) NOT NULL,
  discount_pct NUMERIC(5, 2) NOT NULL,
  is_genuine BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 4. Extract Studio, Runs & Datasets
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.extraction_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  schema JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  result JSONB,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.extract_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  target_url TEXT NOT NULL,
  fields JSONB NOT NULL,
  pagination JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.extract_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  template_id UUID REFERENCES public.extract_templates(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed')),
  records_extracted INTEGER NOT NULL DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- ------------------------------------------------------------------------------
-- 5. Market Intelligence & Repricing Rules
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.competitor_monitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  domain TEXT NOT NULL,
  tracked_skus INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.repricing_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  strategy TEXT NOT NULL CHECK (strategy IN ('undercut_lowest', 'match_lowest', 'margin_target')),
  undercut_amount_paise INTEGER NOT NULL DEFAULT 0,
  min_price_paise INTEGER NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.repricing_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  rule_id UUID REFERENCES public.repricing_rules(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  old_price_paise INTEGER NOT NULL,
  new_price_paise INTEGER NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 6. Matching & Entity Resolution Review Queue
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.review_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  primary_title TEXT NOT NULL,
  primary_store TEXT NOT NULL,
  primary_price_paise INTEGER NOT NULL,
  candidate_title TEXT NOT NULL,
  candidate_store TEXT NOT NULL,
  candidate_price_paise INTEGER NOT NULL,
  confidence NUMERIC(4, 3) NOT NULL,
  reasons JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 7. Developer Platform (API Keys, Webhooks & Deliveries)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  key_prefix TEXT NOT NULL,
  scopes JSONB NOT NULL DEFAULT '["read", "extract"]'::jsonb,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  target_url TEXT NOT NULL,
  secret_hash TEXT NOT NULL,
  events JSONB NOT NULL DEFAULT '["price.drop", "extract.complete"]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.webhook_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id UUID NOT NULL REFERENCES public.webhooks(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  response_status INTEGER,
  signature TEXT NOT NULL,
  latency_ms INTEGER,
  delivered_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 8. Billing, Usage Metering & Invoices
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.usage_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  metric TEXT NOT NULL, -- extract_calls, tracked_skus, api_requests
  quantity INTEGER NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.billing_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  amount_paise INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  status TEXT NOT NULL DEFAULT 'paid' CHECK (status IN ('draft', 'open', 'paid', 'void')),
  invoice_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 9. Scraper Telemetry & Drift Monitoring
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.source_health (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id TEXT NOT NULL UNIQUE,
  domain TEXT NOT NULL,
  circuit_state TEXT NOT NULL DEFAULT 'CLOSED' CHECK (circuit_state IN ('CLOSED', 'OPEN', 'HALF_OPEN')),
  failure_count INTEGER NOT NULL DEFAULT 0,
  success_rate NUMERIC(5, 2) NOT NULL DEFAULT 100.00,
  last_scraped_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.source_drift_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id TEXT NOT NULL,
  selector_path TEXT NOT NULL,
  old_pattern TEXT,
  new_pattern TEXT,
  severity TEXT NOT NULL DEFAULT 'warning' CHECK (severity IN ('info', 'warning', 'critical')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  metadata JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- Indexes for Search & Performance
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_products_title_trgm ON public.products USING gin (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_products_ean ON public.products (ean) WHERE ean IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_products_upc ON public.products (upc) WHERE upc IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_offers_product_id ON public.offers (product_id);
CREATE INDEX IF NOT EXISTS idx_price_observations_product ON public.price_observations (product_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_extraction_tasks_workspace ON public.extraction_tasks (workspace_id, status);
CREATE INDEX IF NOT EXISTS idx_webhooks_workspace ON public.webhooks (workspace_id);
CREATE INDEX IF NOT EXISTS idx_usage_records_workspace ON public.usage_records (workspace_id, recorded_at DESC);

-- ------------------------------------------------------------------------------
-- 10. ROW LEVEL SECURITY (RLS) ON EVERY TABLE
-- ------------------------------------------------------------------------------
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces FORCE ROW LEVEL SECURITY;

ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members FORCE ROW LEVEL SECURITY;

ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_invitations FORCE ROW LEVEL SECURITY;

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories FORCE ROW LEVEL SECURITY;

ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands FORCE ROW LEVEL SECURITY;

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products FORCE ROW LEVEL SECURITY;

ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants FORCE ROW LEVEL SECURITY;

ALTER TABLE public.product_identifiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_identifiers FORCE ROW LEVEL SECURITY;

ALTER TABLE public.merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merchants FORCE ROW LEVEL SECURITY;

ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers FORCE ROW LEVEL SECURITY;

ALTER TABLE public.price_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_observations FORCE ROW LEVEL SECURITY;

ALTER TABLE public.watchlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlists FORCE ROW LEVEL SECURITY;

ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts FORCE ROW LEVEL SECURITY;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications FORCE ROW LEVEL SECURITY;

ALTER TABLE public.saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_searches FORCE ROW LEVEL SECURITY;

ALTER TABLE public.deal_feed_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deal_feed_items FORCE ROW LEVEL SECURITY;

ALTER TABLE public.extraction_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.extraction_tasks FORCE ROW LEVEL SECURITY;

ALTER TABLE public.extract_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.extract_templates FORCE ROW LEVEL SECURITY;

ALTER TABLE public.extract_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.extract_runs FORCE ROW LEVEL SECURITY;

ALTER TABLE public.competitor_monitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitor_monitors FORCE ROW LEVEL SECURITY;

ALTER TABLE public.repricing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repricing_rules FORCE ROW LEVEL SECURITY;

ALTER TABLE public.repricing_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repricing_logs FORCE ROW LEVEL SECURITY;

ALTER TABLE public.review_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_queue FORCE ROW LEVEL SECURITY;

ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys FORCE ROW LEVEL SECURITY;

ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhooks FORCE ROW LEVEL SECURITY;

ALTER TABLE public.webhook_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_deliveries FORCE ROW LEVEL SECURITY;

ALTER TABLE public.usage_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_records FORCE ROW LEVEL SECURITY;

ALTER TABLE public.billing_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_invoices FORCE ROW LEVEL SECURITY;

ALTER TABLE public.source_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.source_health FORCE ROW LEVEL SECURITY;

ALTER TABLE public.source_drift_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.source_drift_logs FORCE ROW LEVEL SECURITY;

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs FORCE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- Helper Security Functions (SECURITY DEFINER prevents RLS infinite recursion)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.current_user_workspace_ids()
RETURNS SETOF UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_workspace_admin(ws_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.workspace_members
    WHERE workspace_id = ws_id AND user_id = auth.uid() AND role IN ('owner', 'admin')
  );
$$;

-- ------------------------------------------------------------------------------
-- 11. RLS POLICIES
-- ------------------------------------------------------------------------------

-- Workspaces
CREATE POLICY "Members can view workspaces"
  ON public.workspaces FOR SELECT
  USING (
    auth.role() = 'service_role' OR
    id IN (SELECT public.current_user_workspace_ids())
  );

CREATE POLICY "Owners can update workspaces"
  ON public.workspaces FOR UPDATE
  USING (
    auth.role() = 'service_role' OR
    public.is_workspace_admin(id)
  );

-- Workspace Members
CREATE POLICY "Members can view workspace members"
  ON public.workspace_members FOR SELECT
  USING (
    auth.role() = 'service_role' OR
    user_id = auth.uid() OR
    workspace_id IN (SELECT public.current_user_workspace_ids())
  );

-- Team Invitations
CREATE POLICY "Admins manage invitations"
  ON public.team_invitations FOR ALL
  USING (
    auth.role() = 'service_role' OR
    public.is_workspace_admin(workspace_id)
  );

-- Public Catalog Read Access
CREATE POLICY "Public read categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Service write categories" ON public.categories FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Public read brands" ON public.brands FOR SELECT USING (true);
CREATE POLICY "Service write brands" ON public.brands FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Public read products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Service write products" ON public.products FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Public read product_variants" ON public.product_variants FOR SELECT USING (true);
CREATE POLICY "Service write product_variants" ON public.product_variants FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Public read product_identifiers" ON public.product_identifiers FOR SELECT USING (true);
CREATE POLICY "Service write product_identifiers" ON public.product_identifiers FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Public read merchants" ON public.merchants FOR SELECT USING (true);
CREATE POLICY "Service write merchants" ON public.merchants FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Public read offers" ON public.offers FOR SELECT USING (true);
CREATE POLICY "Service write offers" ON public.offers FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Public read price_observations" ON public.price_observations FOR SELECT USING (true);
CREATE POLICY "Service write price_observations" ON public.price_observations FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Public read deal_feed_items" ON public.deal_feed_items FOR SELECT USING (true);
CREATE POLICY "Service write deal_feed_items" ON public.deal_feed_items FOR ALL USING (auth.role() = 'service_role');

-- Watchlists & Alerts (Tenant Isolated)
CREATE POLICY "Workspace members access watchlists"
  ON public.watchlists FOR ALL
  USING (
    auth.role() = 'service_role' OR
    workspace_id IN (SELECT public.current_user_workspace_ids())
  );

CREATE POLICY "Workspace members access alerts"
  ON public.alerts FOR ALL
  USING (
    auth.role() = 'service_role' OR
    workspace_id IN (SELECT public.current_user_workspace_ids())
  );

CREATE POLICY "Workspace members access notifications"
  ON public.notifications FOR ALL
  USING (
    auth.role() = 'service_role' OR
    workspace_id IN (SELECT public.current_user_workspace_ids())
  );

CREATE POLICY "Workspace members access saved_searches"
  ON public.saved_searches FOR ALL
  USING (
    auth.role() = 'service_role' OR
    workspace_id IN (SELECT public.current_user_workspace_ids())
  );

-- Extraction Tasks & Templates
CREATE POLICY "Workspace members access extraction_tasks"
  ON public.extraction_tasks FOR ALL
  USING (
    auth.role() = 'service_role' OR
    workspace_id IN (SELECT public.current_user_workspace_ids())
  );

CREATE POLICY "Workspace members access extract_templates"
  ON public.extract_templates FOR ALL
  USING (
    auth.role() = 'service_role' OR
    workspace_id IN (SELECT public.current_user_workspace_ids())
  );

CREATE POLICY "Workspace members access extract_runs"
  ON public.extract_runs FOR ALL
  USING (
    auth.role() = 'service_role' OR
    workspace_id IN (SELECT public.current_user_workspace_ids())
  );

-- Market Intelligence & Repricing
CREATE POLICY "Workspace members access competitor_monitors"
  ON public.competitor_monitors FOR ALL
  USING (
    auth.role() = 'service_role' OR
    workspace_id IN (SELECT public.current_user_workspace_ids())
  );

CREATE POLICY "Workspace members access repricing_rules"
  ON public.repricing_rules FOR ALL
  USING (
    auth.role() = 'service_role' OR
    workspace_id IN (SELECT public.current_user_workspace_ids())
  );

CREATE POLICY "Workspace members access repricing_logs"
  ON public.repricing_logs FOR ALL
  USING (
    auth.role() = 'service_role' OR
    workspace_id IN (SELECT public.current_user_workspace_ids())
  );

-- Developer Platform: API Keys & Webhooks
CREATE POLICY "Admins manage api_keys"
  ON public.api_keys FOR ALL
  USING (
    auth.role() = 'service_role' OR
    public.is_workspace_admin(workspace_id)
  );

CREATE POLICY "Admins manage webhooks"
  ON public.webhooks FOR ALL
  USING (
    auth.role() = 'service_role' OR
    public.is_workspace_admin(workspace_id)
  );

CREATE POLICY "Workspace members view webhook_deliveries"
  ON public.webhook_deliveries FOR SELECT
  USING (
    auth.role() = 'service_role' OR
    workspace_id IN (SELECT public.current_user_workspace_ids())
  );

CREATE POLICY "Service writes webhook_deliveries"
  ON public.webhook_deliveries FOR INSERT
  WITH CHECK (true);

-- Billing & Usage
CREATE POLICY "Workspace members view usage"
  ON public.usage_records FOR SELECT
  USING (
    auth.role() = 'service_role' OR
    workspace_id IN (SELECT public.current_user_workspace_ids())
  );

CREATE POLICY "Service writes usage"
  ON public.usage_records FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins view invoices"
  ON public.billing_invoices FOR SELECT
  USING (
    auth.role() = 'service_role' OR
    public.is_workspace_admin(workspace_id)
  );

CREATE POLICY "Service writes invoices"
  ON public.billing_invoices FOR ALL
  USING (auth.role() = 'service_role');

-- Internal Ops & Health (Service & Admin only)
CREATE POLICY "Service role review_queue" ON public.review_queue FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Public read source_health" ON public.source_health FOR SELECT USING (true);
CREATE POLICY "Service write source_health" ON public.source_health FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Public read source_drift_logs" ON public.source_drift_logs FOR SELECT USING (true);
CREATE POLICY "Service write source_drift_logs" ON public.source_drift_logs FOR ALL USING (auth.role() = 'service_role');

-- Audit Logs
CREATE POLICY "Admins view audit logs"
  ON public.audit_logs FOR SELECT
  USING (
    auth.role() = 'service_role' OR
    public.is_workspace_admin(workspace_id)
  );

CREATE POLICY "Service writes audit logs"
  ON public.audit_logs FOR INSERT
  WITH CHECK (true);
