-- ─── LIFETIME POINTS FUNCTION ────────────────────────────────────────────────
-- Mirrors get_my_points() but only sums positive entries (earned, never spent).
-- Used for title/badge thresholds — never decreases when points are redeemed.

create or replace function get_my_lifetime_points()
returns int
language sql security invoker
as $$
  SELECT COALESCE(SUM(points), 0)::int
  FROM public.arc_point_events
  WHERE user_id = auth.uid()
    AND points > 0;
$$;
