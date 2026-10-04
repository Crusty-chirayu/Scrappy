-- ==============================================================================
-- SCRAPPY DATABASE INITIALIZATION & ROW LEVEL SECURITY
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
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
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
  last_observed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.price_observations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id UUID NOT NULL REFERENCES public.offers(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  price_paise INTEGER NOT NULL CHECK (price_paise >= 0),
  in_stock BOOLEAN NOT NULL DEFAULT true,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  provenance JSONB NOT NULL
);

-- ------------------------------------------------------------------------------
-- 3. Tenant Features (Alerts, Extraction, API Keys, Audits)
-- ------------------------------------------------------------------------------
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

CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  key_prefix TEXT NOT NULL,
  scopes JSONB NOT NULL DEFAULT '["read", "extract"]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ
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

-- ------------------------------------------------------------------------------
-- 4. ROW LEVEL SECURITY (RLS) ON EVERY TABLE
-- ------------------------------------------------------------------------------
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces FORCE ROW LEVEL SECURITY;

ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members FORCE ROW LEVEL SECURITY;

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories FORCE ROW LEVEL SECURITY;

ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands FORCE ROW LEVEL SECURITY;

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products FORCE ROW LEVEL SECURITY;

ALTER TABLE public.merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merchants FORCE ROW LEVEL SECURITY;

ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers FORCE ROW LEVEL SECURITY;

ALTER TABLE public.price_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_observations FORCE ROW LEVEL SECURITY;

ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts FORCE ROW LEVEL SECURITY;

ALTER TABLE public.extraction_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.extraction_tasks FORCE ROW LEVEL SECURITY;

ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys FORCE ROW LEVEL SECURITY;

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs FORCE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 5. RLS POLICIES
-- ------------------------------------------------------------------------------

-- Workspaces: Members can view their workspaces
CREATE POLICY "Members can view workspaces"
  ON public.workspaces
  FOR SELECT
  USING (
    auth.role() = 'service_role' OR
    id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Owners can update workspaces"
  ON public.workspaces
  FOR UPDATE
  USING (
    auth.role() = 'service_role' OR
    id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Workspace Members
CREATE POLICY "Members can view workspace members"
  ON public.workspace_members
  FOR SELECT
  USING (
    auth.role() = 'service_role' OR
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = auth.uid()
    )
  );

-- Public Catalog: Anyone can read, only service_role can mutate
CREATE POLICY "Public read categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Service write categories" ON public.categories FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Public read brands" ON public.brands FOR SELECT USING (true);
CREATE POLICY "Service write brands" ON public.brands FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Public read products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Service write products" ON public.products FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Public read merchants" ON public.merchants FOR SELECT USING (true);
CREATE POLICY "Service write merchants" ON public.merchants FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Public read offers" ON public.offers FOR SELECT USING (true);
CREATE POLICY "Service write offers" ON public.offers FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Public read price_observations" ON public.price_observations FOR SELECT USING (true);
CREATE POLICY "Service write price_observations" ON public.price_observations FOR ALL USING (auth.role() = 'service_role');

-- Alerts: Scoped to workspace members
CREATE POLICY "Workspace members view alerts"
  ON public.alerts
  FOR SELECT
  USING (
    auth.role() = 'service_role' OR
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Workspace members mutate alerts"
  ON public.alerts
  FOR ALL
  USING (
    auth.role() = 'service_role' OR
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = auth.uid()
    )
  );

-- Extraction Tasks: Strictly tenant-isolated
CREATE POLICY "Workspace members view extraction tasks"
  ON public.extraction_tasks
  FOR SELECT
  USING (
    auth.role() = 'service_role' OR
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Workspace members insert extraction tasks"
  ON public.extraction_tasks
  FOR INSERT
  WITH CHECK (
    auth.role() = 'service_role' OR
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Service role updates extraction tasks"
  ON public.extraction_tasks
  FOR UPDATE
  USING (auth.role() = 'service_role');

-- API Keys: Only workspace admins
CREATE POLICY "Admins manage api keys"
  ON public.api_keys
  FOR ALL
  USING (
    auth.role() = 'service_role' OR
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Audit Logs: Viewable only by workspace admins, append-only
CREATE POLICY "Admins view audit logs"
  ON public.audit_logs
  FOR SELECT
  USING (
    auth.role() = 'service_role' OR
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Service writes audit logs"
  ON public.audit_logs
  FOR INSERT
  WITH CHECK (true);
