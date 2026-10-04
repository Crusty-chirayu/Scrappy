-- Add revoked_at to public.api_keys for soft-revocation audit trails
ALTER TABLE public.api_keys ADD COLUMN IF NOT EXISTS revoked_at TIMESTAMPTZ;
