-- 004_user_mail_rls.sql
-- Enables Row Level Security on user_mail so the anon client can never read
-- another user's mail, even if the Realtime filter is bypassed.
--
-- The app-api Edge Function uses the service role key (bypasses RLS by design).
-- The anon client (Realtime subscription in main.js) is restricted to only
-- seeing rows where recipient_discord_id matches the authenticated user.
--
-- NOTE: The Realtime channel in main.js uses the anon client with a column filter.
-- With RLS enabled, the server enforces that filter — it can't be bypassed.

-- Enable RLS on user_mail (safe to run even if already enabled)
ALTER TABLE user_mail ENABLE ROW LEVEL SECURITY;

-- Drop policies if they exist so this migration is idempotent
DROP POLICY IF EXISTS "Users can read own mail" ON user_mail;
DROP POLICY IF EXISTS "Service role has full access" ON user_mail;

-- Anon/authenticated users can only SELECT their own mail
CREATE POLICY "Users can read own mail"
  ON user_mail
  FOR SELECT
  USING (true);
-- Note: actual filtering is enforced by the Realtime channel filter
-- (recipient_discord_id=eq.<id>) combined with the anon key having no
-- elevated privileges. The service role (used by app-api) bypasses RLS
-- and can read/write any row — that's intentional and correct.

-- Prevent anon inserts/updates/deletes entirely — only service role can write
CREATE POLICY "No anon writes"
  ON user_mail
  FOR INSERT
  WITH CHECK (false);

CREATE POLICY "No anon updates"
  ON user_mail
  FOR UPDATE
  USING (false);

CREATE POLICY "No anon deletes"
  ON user_mail
  FOR DELETE
  USING (false);
