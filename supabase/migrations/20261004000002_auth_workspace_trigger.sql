-- ==============================================================================
-- Migration: 20261004000002_auth_workspace_trigger.sql
-- Description: Automatically create a personal workspace and owner membership
--              whenever a new user signs up in Supabase Auth (auth.users).
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  new_ws_id UUID;
  user_name TEXT;
  user_slug TEXT;
BEGIN
  user_name := COALESCE(
    new.raw_user_meta_data->>'full_name',
    split_part(new.email, '@', 1),
    'User'
  );
  
  user_slug := lower(regexp_replace(user_name, '[^a-zA-Z0-9]', '-', 'g')) || '-' || substr(new.id::text, 1, 8);

  INSERT INTO public.workspaces (name, slug, plan)
  VALUES (
    user_name || '''s Workspace',
    user_slug,
    'free'
  )
  RETURNING id INTO new_ws_id;

  INSERT INTO public.workspace_members (workspace_id, user_id, role)
  VALUES (new_ws_id, new.id, 'owner');

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
