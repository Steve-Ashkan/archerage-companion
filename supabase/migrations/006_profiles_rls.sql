-- 006_profiles_rls.sql
-- C-2 fix: profiles table had no RLS, allowing any caller with the anon key to
-- dump the full user table (discord_ids, roles, stripe_customer_id, etc.).
-- All profile access is now routed through the app-api Edge Function (service role),
-- which enforces JWT auth and only returns the fields each action requires.

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Deny all direct anon/authenticated access — service role bypasses RLS
DROP POLICY IF EXISTS "No anon reads on profiles" ON profiles;
DROP POLICY IF EXISTS "No anon writes on profiles" ON profiles;
DROP POLICY IF EXISTS "No anon updates on profiles" ON profiles;
DROP POLICY IF EXISTS "No anon deletes on profiles" ON profiles;

CREATE POLICY "No anon reads on profiles"
  ON profiles FOR SELECT USING (false);

CREATE POLICY "No anon writes on profiles"
  ON profiles FOR INSERT WITH CHECK (false);

CREATE POLICY "No anon updates on profiles"
  ON profiles FOR UPDATE USING (false);

CREATE POLICY "No anon deletes on profiles"
  ON profiles FOR DELETE USING (false);
