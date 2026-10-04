-- ==============================================================================
-- MIGRATION: 20261004000005_billing_subscriptions.sql
-- Subscriptions, Invoices, Dunning, and Tenant Isolation
-- ==============================================================================

-- 0. Update workspaces plan check constraint to support 'business' tier
ALTER TABLE public.workspaces DROP CONSTRAINT IF EXISTS workspaces_plan_check;
ALTER TABLE public.workspaces ADD CONSTRAINT workspaces_plan_check CHECK (plan IN ('free', 'starter', 'pro', 'business', 'enterprise'));

-- 1. Subscriptions Table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  provider TEXT NOT NULL DEFAULT 'razorpay',
  provider_customer_id TEXT,
  provider_subscription_id TEXT UNIQUE,
  plan TEXT NOT NULL CHECK (plan IN ('starter', 'pro', 'business', 'enterprise')),
  status TEXT NOT NULL CHECK (status IN ('trialing', 'active', 'past_due', 'cancelled', 'paused', 'expired')),
  current_period_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  current_period_end TIMESTAMPTZ NOT NULL,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
  cancelled_at TIMESTAMPTZ,
  grace_period_ends_at TIMESTAMPTZ,
  dunning_attempt_count INTEGER NOT NULL DEFAULT 0,
  last_dunning_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Invoices Table
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  invoice_number TEXT NOT NULL UNIQUE,
  amount_paise INTEGER NOT NULL CHECK (amount_paise >= 0),
  gst_amount_paise INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'INR',
  status TEXT NOT NULL CHECK (status IN ('paid', 'pending', 'failed', 'refunded')),
  pdf_url TEXT,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_workspace ON public.subscriptions(workspace_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_invoices_workspace ON public.invoices(workspace_id);

-- Enable RLS (Strict Default Deny)
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions FORCE ROW LEVEL SECURITY;

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices FORCE ROW LEVEL SECURITY;

-- Tenant RLS Policies
CREATE POLICY "Workspace members access subscriptions"
  ON public.subscriptions FOR ALL
  USING (
    auth.role() = 'service_role' OR
    workspace_id IN (SELECT public.current_user_workspace_ids())
  );

CREATE POLICY "Workspace members access invoices"
  ON public.invoices FOR ALL
  USING (
    auth.role() = 'service_role' OR
    workspace_id IN (SELECT public.current_user_workspace_ids())
  );

-- Realtime publication for subscriptions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'subscriptions' AND schemaname = 'public'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.subscriptions;
  END IF;
END $$;
