-- 005_fix_user_mail_rls.sql
-- C-1 fix: The SELECT policy in 004 used USING (true), which allowed ANY anon
-- client to read ALL rows in user_mail. This migration replaces it with
-- USING (false) so no direct DB reads are possible via the anon key.
-- All mail access goes through the app-api Edge Function (service role, JWT-gated).

-- Replace the broken SELECT policy
DROP POLICY IF EXISTS "Users can read own mail" ON user_mail;
DROP POLICY IF EXISTS "No anon reads" ON user_mail;

CREATE POLICY "No anon reads"
  ON user_mail
  FOR SELECT
  USING (false);
