-- ═══════════════════════════════════════════════════════════════════════════════
-- Streaks Migration
-- Run in Supabase SQL editor
-- ═══════════════════════════════════════════════════════════════════════════════

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS current_streak  INT  NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_scan_date  DATE;

-- Atomically updates a user's scan streak and awards ARC points at milestones.
-- Returns: { streak, points_awarded, milestone }
-- milestone: '7_day' | '30_day' | null
-- Safe to call multiple times per day — idempotent after first call each day.
CREATE OR REPLACE FUNCTION update_scan_streak(p_discord_id TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_last_scan        DATE;
  v_streak           INT;
  v_today            DATE := CURRENT_DATE;
  v_points_awarded   INT  := 0;
  v_milestone        TEXT := NULL;
BEGIN
  SELECT last_scan_date, current_streak
  INTO   v_last_scan, v_streak
  FROM   profiles
  WHERE  discord_id = p_discord_id
  FOR UPDATE;

  -- Already updated today — nothing to do
  IF v_last_scan = v_today THEN
    RETURN jsonb_build_object(
      'streak',          COALESCE(v_streak, 0),
      'points_awarded',  0,
      'milestone',       NULL
    );
  END IF;

  -- Consecutive day → extend streak; gap or first scan → reset to 1
  IF v_last_scan = v_today - INTERVAL '1 day' THEN
    v_streak := COALESCE(v_streak, 0) + 1;
  ELSE
    v_streak := 1;
  END IF;

  UPDATE profiles
  SET    current_streak = v_streak,
         last_scan_date = v_today
  WHERE  discord_id = p_discord_id;

  -- 30-day check before 7-day to avoid double-awarding on multiples of both
  IF v_streak % 30 = 0 THEN
    v_points_awarded := 100;
    v_milestone      := '30_day';
    INSERT INTO arc_point_ledger (discord_id, points, action_type, reference_id)
    VALUES (p_discord_id, 100, 'streak_30day', v_streak::TEXT || ' days');
  ELSIF v_streak % 7 = 0 THEN
    v_points_awarded := 25;
    v_milestone      := '7_day';
    INSERT INTO arc_point_ledger (discord_id, points, action_type, reference_id)
    VALUES (p_discord_id, 25, 'streak_7day', v_streak::TEXT || ' days');
  END IF;

  RETURN jsonb_build_object(
    'streak',         v_streak,
    'points_awarded', v_points_awarded,
    'milestone',      v_milestone
  );
END;
$$;
