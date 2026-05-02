-- 003_atomic_redemption.sql
-- Replaces the non-atomic 4-step redemption flow with a single transaction.
-- Uses pg_advisory_xact_lock to prevent concurrent double-spend.

CREATE OR REPLACE FUNCTION submit_redemption_atomic(
  p_discord_id   TEXT,
  p_reward_id    TEXT,
  p_reward_label TEXT,
  p_points_spent INTEGER,
  p_ign_snapshot TEXT    DEFAULT NULL,
  p_discord_name TEXT    DEFAULT NULL,
  p_recipient_id TEXT    DEFAULT NULL
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_balance      INTEGER;
  v_redemption   arc_redemptions%ROWTYPE;
BEGIN
  -- Input guard
  IF p_points_spent <= 0 THEN
    RETURN json_build_object('ok', false, 'error', 'Invalid points amount');
  END IF;

  -- Advisory lock on the user — prevents concurrent redemptions from the same account
  PERFORM pg_advisory_xact_lock(hashtext(p_discord_id));

  -- Atomic balance check
  SELECT COALESCE(get_my_points(p_discord_id), 0) INTO v_balance;

  IF v_balance < p_points_spent THEN
    RETURN json_build_object('ok', false, 'error', 'Insufficient ARC Points');
  END IF;

  -- Insert redemption record
  INSERT INTO arc_redemptions (
    discord_id, reward_id, reward_label, points_spent,
    ign_snapshot, discord_name, recipient_id
  ) VALUES (
    p_discord_id, p_reward_id, p_reward_label, p_points_spent,
    p_ign_snapshot, p_discord_name, p_recipient_id
  ) RETURNING * INTO v_redemption;

  -- Deduct points within the same transaction
  PERFORM award_arc_points(
    p_discord_id,
    -p_points_spent,
    'redemption',
    v_redemption.id::TEXT
  );

  RETURN json_build_object('ok', true);
END;
$$;
