-- 007_rate_limits_and_token_version.sql

-- H-4: Rate limiting table — tracks write actions per discord_id per hour.
-- Only accessible via service role key (app-api Edge Function).
-- Rows older than 25h are cleaned up by app-api on each write.

CREATE TABLE IF NOT EXISTS rate_limits (
  id         bigserial    PRIMARY KEY,
  discord_id text         NOT NULL,
  action     text         NOT NULL,
  created_at timestamptz  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_lookup
  ON rate_limits (discord_id, action, created_at);

ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "No anon access" ON rate_limits FOR ALL USING (false);

-- M-3: Token version for JWT revocation.
-- Increment this column to invalidate all existing JWTs for a user.
-- discord-auth reads it when minting; app-api verifies it on every request.

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS token_version integer NOT NULL DEFAULT 1;

-- M-3: Helper function to atomically increment token_version.
-- Called by app-api sign-out action to revoke all existing JWTs for a user.
CREATE OR REPLACE FUNCTION increment_token_version(p_discord_id text)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE profiles
  SET token_version = token_version + 1
  WHERE discord_id = p_discord_id;
$$;
