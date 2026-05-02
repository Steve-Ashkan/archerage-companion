-- Migration 012: Fix update_scan_streak to use arc_point_events (actual table)
-- Migration 009 mistakenly referenced arc_point_ledger which does not exist.
-- Streak milestone rewards were silently failing with every 7/30-day milestone hit.
-- Run in Supabase SQL editor.

CREATE OR REPLACE FUNCTION update_scan_streak(p_discord_id TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id          UUID;
  v_last_scan        DATE;
  v_streak           INT;
  v_today            DATE := CURRENT_DATE;
  v_points_awarded   INT  := 0;
  v_milestone        TEXT := NULL;
BEGIN
  SELECT p.id, p.last_scan_date, p.current_streak
  INTO   v_user_id, v_last_scan, v_streak
  FROM   profiles p
  WHERE  p.discord_id = p_discord_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('streak', 0, 'points_awarded', 0, 'milestone', NULL);
  END IF;

  -- Already updated today — idempotent
  IF v_last_scan = v_today THEN
    RETURN jsonb_build_object(
      'streak',         COALESCE(v_streak, 0),
      'points_awarded', 0,
      'milestone',      NULL
    );
  END IF;

  -- Consecutive day → extend; gap or first scan → reset to 1
  v_streak := CASE
    WHEN v_last_scan = v_today - INTERVAL '1 day' THEN COALESCE(v_streak, 0) + 1
    ELSE 1
  END;

  UPDATE profiles
  SET    current_streak = v_streak,
         last_scan_date = v_today
  WHERE  discord_id = p_discord_id;

  -- 30-day check before 7-day to avoid double-awarding on multiples of both
  IF v_streak % 30 = 0 THEN
    v_points_awarded := 100;
    v_milestone      := '30_day';
    INSERT INTO arc_point_events (user_id, action_type, points, reference_id)
    VALUES (v_user_id, 'streak_30day', 100, v_streak::TEXT || ' days');
  ELSIF v_streak % 7 = 0 THEN
    v_points_awarded := 25;
    v_milestone      := '7_day';
    INSERT INTO arc_point_events (user_id, action_type, points, reference_id)
    VALUES (v_user_id, 'streak_7day', 25, v_streak::TEXT || ' days');
  END IF;

  RETURN jsonb_build_object(
    'streak',         v_streak,
    'points_awarded', v_points_awarded,
    'milestone',      v_milestone
  );
END;
$$;

-- Revoke anon execute (defence in depth — app-api calls this with service role)
REVOKE EXECUTE ON FUNCTION public.update_scan_streak(text) FROM PUBLIC, anon, authenticated;
