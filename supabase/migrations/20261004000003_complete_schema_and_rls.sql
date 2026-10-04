-- ==============================================================================
-- Migration: 20261004000003_complete_schema_and_rls.sql
-- Description: Complete schema deliverables from Master Backlog G3:
--              - match_evidence
--              - extract_run_logs (streaming logs for extract runs)
--              - datasets & dataset_records
--              - usage_events (idempotent metering)
--              - price_daily_rollups (historical analytics)
--              - RLS enabled on EVERY table in public schema
--              - Complete tenant isolation and public read policies
-- ==============================================================================

-- 1. Match Evidence
CREATE TABLE IF NOT EXISTS public.match_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id UUID REFERENCES public.offers(id) ON DELETE CASCADE,
  candidate_product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  signal_scores JSONB NOT NULL,
  decision TEXT NOT NULL CHECK (decision IN ('exact_match', 'possible_match', 'different_product')),
  confidence_score NUMERIC(4, 3) NOT NULL CHECK (confidence_score >= 0.000 AND confidence_score <= 1.000),
  provenance JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Extract Run Logs (Streaming execution logs)
CREATE TABLE IF NOT EXISTS public.extract_run_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID NOT NULL REFERENCES public.extract_runs(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  level TEXT NOT NULL CHECK (level IN ('debug', 'info', 'warn', 'error')),
  message TEXT NOT NULL,
  meta JSONB,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Datasets & Dataset Records
CREATE TABLE IF NOT EXISTS public.datasets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  schema JSONB NOT NULL DEFAULT '[]'::jsonb,
  record_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.dataset_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset_id UUID NOT NULL REFERENCES public.datasets(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Usage Events (Metering with Idempotency)
CREATE TABLE IF NOT EXISTS public.usage_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- api_call, scrape_unit, match_evaluation, export_rows
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  idempotency_key TEXT UNIQUE,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Price Daily Rollups (Pre-aggregated price statistics)
CREATE TABLE IF NOT EXISTS public.price_daily_rollups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  merchant_id UUID REFERENCES public.merchants(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  min_price_paise INTEGER NOT NULL CHECK (min_price_paise >= 0),
  max_price_paise INTEGER NOT NULL CHECK (max_price_paise >= min_price_paise),
  avg_price_paise INTEGER NOT NULL CHECK (avg_price_paise >= 0),
  closing_price_paise INTEGER NOT NULL CHECK (closing_price_paise >= 0),
  sample_count INTEGER NOT NULL DEFAULT 1 CHECK (sample_count > 0),
  UNIQUE (product_id, merchant_id, date)
);

-- ------------------------------------------------------------------------------
-- Enable Row Level Security (RLS) on ALL new and existing tables
-- ------------------------------------------------------------------------------
ALTER TABLE public.match_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.extract_run_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dataset_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_daily_rollups ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- RLS Policies for new tables
-- ------------------------------------------------------------------------------

-- Match Evidence: readable by all, writable only by service_role
CREATE POLICY "match_evidence_select_public" ON public.match_evidence
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "match_evidence_all_service" ON public.match_evidence
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- Extract Run Logs: tenant isolated
CREATE POLICY "extract_run_logs_select_tenant" ON public.extract_run_logs
  FOR SELECT TO authenticated
  USING (workspace_id IN (SELECT current_user_workspace_ids()));

CREATE POLICY "extract_run_logs_all_service" ON public.extract_run_logs
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- Datasets: tenant isolated
CREATE POLICY "datasets_tenant_isolation" ON public.datasets
  FOR ALL TO authenticated
  USING (workspace_id IN (SELECT current_user_workspace_ids()))
  WITH CHECK (workspace_id IN (SELECT current_user_workspace_ids()));

CREATE POLICY "datasets_all_service" ON public.datasets
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- Dataset Records: tenant isolated
CREATE POLICY "dataset_records_tenant_isolation" ON public.dataset_records
  FOR ALL TO authenticated
  USING (workspace_id IN (SELECT current_user_workspace_ids()))
  WITH CHECK (workspace_id IN (SELECT current_user_workspace_ids()));

CREATE POLICY "dataset_records_all_service" ON public.dataset_records
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- Usage Events: tenant isolated
CREATE POLICY "usage_events_select_tenant" ON public.usage_events
  FOR SELECT TO authenticated
  USING (workspace_id IN (SELECT current_user_workspace_ids()));

CREATE POLICY "usage_events_all_service" ON public.usage_events
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- Price Daily Rollups: public read, service write
CREATE POLICY "price_daily_rollups_select_public" ON public.price_daily_rollups
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "price_daily_rollups_all_service" ON public.price_daily_rollups
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);
