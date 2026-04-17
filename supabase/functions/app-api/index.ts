// ─── APP API EDGE FUNCTION ────────────────────────────────────────────────────
// Single privileged endpoint for all app operations that require the service key.
// The service key never ships to users — it lives only in Supabase secrets.
//
// All requests: POST { action, discord_id, ...params }
// discord_id is the CALLER's Discord ID (from their encrypted local session).
// Role-gated actions verify the caller's DB role before acting.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}

const ROLE_ORDER = ['free', 'pro', 'curator', 'staff', 'admin', 'dev'];
function hasRole(userRole: string, required: string): boolean {
  return ROLE_ORDER.indexOf(userRole) >= ROLE_ORDER.indexOf(required);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  try {
    const body = await req.json();
    const { action, discord_id, ...params } = body;

    if (!action) return json({ ok: false, error: 'Missing action' }, 400);

    const db = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );

    // ── get-profile: no role gate needed, just a DB lookup ────────────────────
    if (action === 'get-profile') {
      if (!discord_id) return json({ ok: false, error: 'Missing discord_id' });
      const { data } = await db
        .from('profiles')
        .select('role, pro_expires_at, ign, discord_name, avatar')
        .eq('discord_id', discord_id)
        .single();
      // Touch last_seen_at (non-critical — silent fail)
      try {
        await db.from('profiles')
          .update({ last_seen_at: new Date().toISOString() })
          .eq('discord_id', discord_id);
      } catch { /* ignore */ }
      return json({ ok: true, profile: data || null });
    }

    // ── All other actions: look up caller's role first ────────────────────────
    let callerRole = 'free';
    if (discord_id) {
      const { data } = await db
        .from('profiles')
        .select('role')
        .eq('discord_id', discord_id)
        .single();
      callerRole = data?.role || 'free';
    }

    // ── Admin: user management ────────────────────────────────────────────────

    if (action === 'admin-get-users') {
      if (!hasRole(callerRole, 'admin')) return json({ ok: false, error: 'Requires admin role' }, 403);
      const { data, error } = await db
        .from('profiles')
        .select('discord_id, discord_name, avatar, role, ign, pro_expires_at, last_seen_at')
        .order('last_seen_at', { ascending: false });
      if (error) return json({ ok: false, error: error.message });
      const users = (data || []).map(u => ({
        id:             u.discord_id,
        discord_name:   u.discord_name,
        avatar_url:     u.avatar,
        role:           u.role,
        ign:            u.ign,
        pro_expires_at: u.pro_expires_at,
        last_seen_at:   u.last_seen_at,
      }));
      return json({ ok: true, users });
    }

    if (action === 'admin-set-role') {
      if (!hasRole(callerRole, 'admin')) return json({ ok: false, error: 'Requires admin role' }, 403);
      const VALID_ROLES = ['free', 'pro', 'curator', 'staff', 'admin', 'dev'];
      if (!VALID_ROLES.includes(params.role)) return json({ ok: false, error: 'Invalid role' });
      const { error } = await db.from('profiles').update({ role: params.role }).eq('discord_id', params.userId);
      if (error) return json({ ok: false, error: error.message });
      return json({ ok: true });
    }

    if (action === 'admin-grant-pro') {
      if (!hasRole(callerRole, 'admin')) return json({ ok: false, error: 'Requires admin role' }, 403);
      const days = Math.max(1, Math.min(3650, parseInt(params.days) || 30));
      const expires = new Date();
      expires.setDate(expires.getDate() + days);
      const { error } = await db.from('profiles')
        .update({ role: 'pro', pro_expires_at: expires.toISOString() })
        .eq('discord_id', params.userId);
      if (error) return json({ ok: false, error: error.message });
      return json({ ok: true });
    }

    if (action === 'admin-revoke-pro') {
      if (!hasRole(callerRole, 'admin')) return json({ ok: false, error: 'Requires admin role' }, 403);
      const { error } = await db.from('profiles')
        .update({ role: 'free', pro_expires_at: null })
        .eq('discord_id', params.userId);
      if (error) return json({ ok: false, error: error.message });
      return json({ ok: true });
    }

    // ── Profile ───────────────────────────────────────────────────────────────

    if (action === 'update-ign') {
      if (!discord_id) return json({ ok: false, error: 'Not authenticated' });
      const { error } = await db.from('profiles').update({ ign: params.ign }).eq('discord_id', discord_id);
      if (error) return json({ ok: false, error: error.message });
      return json({ ok: true });
    }

    // ── Wiki submissions ──────────────────────────────────────────────────────

    if (action === 'wiki-submit') {
      if (!discord_id) return json({ ok: false, error: 'Not authenticated' });
      const { error } = await db.from('wiki_submissions').insert({
        submitter_discord_id: discord_id,
        title:        params.title,
        category:     params.category,
        content:      params.content,
        discord_name: params.discordName || null,
        ign:          params.ign         || null,
      });
      if (error) return json({ ok: false, error: error.message });
      return json({ ok: true });
    }

    if (action === 'wiki-admin-approve') {
      if (!hasRole(callerRole, 'curator')) return json({ ok: false, error: 'Requires curator role' }, 403);
      const { data: sub } = await db.from('wiki_submissions')
        .select('submitter_discord_id').eq('id', params.id).single();
      const { error } = await db.from('wiki_submissions')
        .update({ status: 'approved', reviewed_at: new Date().toISOString() })
        .eq('id', params.id);
      if (error) return json({ ok: false, error: error.message });
      if (sub?.submitter_discord_id) {
        await db.rpc('award_arc_points', {
          p_discord_id:   sub.submitter_discord_id,
          p_points:       25,
          p_action_type:  'wiki_approved',
          p_reference_id: String(params.id),
        });
      }
      return json({ ok: true });
    }

    if (action === 'wiki-admin-reject') {
      if (!hasRole(callerRole, 'curator')) return json({ ok: false, error: 'Requires curator role' }, 403);
      const { error } = await db.from('wiki_submissions')
        .update({ status: 'rejected', feedback: params.feedback || null, reviewed_at: new Date().toISOString() })
        .eq('id', params.id);
      if (error) return json({ ok: false, error: error.message });
      return json({ ok: true });
    }

    // ── ARC Points ────────────────────────────────────────────────────────────

    if (action === 'arc-get-my-points') {
      if (!discord_id) return json({ ok: true, points: 0 });
      const { data, error } = await db.rpc('get_my_points', { p_discord_id: discord_id });
      if (error) return json({ ok: false, error: error.message });
      return json({ ok: true, points: data || 0 });
    }

    if (action === 'arc-get-point-history') {
      if (!discord_id) return json({ ok: true, history: [] });
      const { data, error } = await db.rpc('get_my_point_history', { p_discord_id: discord_id });
      if (error) return json({ ok: false, error: error.message });
      return json({ ok: true, history: data || [] });
    }

    if (action === 'arc-submit-redemption') {
      if (!discord_id) return json({ ok: false, error: 'Not authenticated' });
      const { rewardId, rewardLabel, pointsSpent, ignSnapshot, discordName, recipientId } = params;
      // Server-side balance check
      const { data: balance } = await db.rpc('get_my_points', { p_discord_id: discord_id });
      if ((balance || 0) < pointsSpent) return json({ ok: false, error: 'Insufficient ARC Points' });
      const { data: redemption, error } = await db.from('arc_redemptions').insert({
        discord_id,
        reward_id:    rewardId,
        reward_label: rewardLabel,
        points_spent: pointsSpent,
        ign_snapshot: ignSnapshot || null,
        discord_name: discordName || null,
        recipient_id: recipientId || null,
      }).select('id').single();
      if (error) return json({ ok: false, error: error.message });
      await db.rpc('award_arc_points', {
        p_discord_id:   discord_id,
        p_points:       -pointsSpent,
        p_action_type:  'redemption',
        p_reference_id: String(redemption.id),
      });
      return json({ ok: true });
    }

    if (action === 'arc-get-all-redemptions') {
      if (!hasRole(callerRole, 'admin')) return json({ ok: false, error: 'Requires admin role' }, 403);
      const { data, error } = await db.rpc('get_pending_redemptions');
      if (error) return json({ ok: false, error: error.message });
      return json({ ok: true, redemptions: data || [] });
    }

    if (action === 'arc-fulfill-redemption') {
      if (!hasRole(callerRole, 'admin')) return json({ ok: false, error: 'Requires admin role' }, 403);
      const { error } = await db.from('arc_redemptions')
        .update({ status: 'fulfilled', notes: params.notes || null, fulfilled_at: new Date().toISOString() })
        .eq('id', params.id);
      if (error) return json({ ok: false, error: error.message });
      return json({ ok: true });
    }

    if (action === 'arc-cancel-redemption') {
      if (!hasRole(callerRole, 'admin')) return json({ ok: false, error: 'Requires admin role' }, 403);
      const { data: r } = await db.from('arc_redemptions')
        .select('discord_id, points_spent, status')
        .eq('id', params.id)
        .single();
      const { error } = await db.from('arc_redemptions')
        .update({ status: 'cancelled' })
        .eq('id', params.id);
      if (error) return json({ ok: false, error: error.message });
      if (r?.discord_id && r?.status === 'pending') {
        await db.rpc('award_arc_points', {
          p_discord_id:   r.discord_id,
          p_points:       r.points_spent,
          p_action_type:  'refund',
          p_reference_id: String(params.id),
        });
      }
      return json({ ok: true });
    }

    // ── User Mail ─────────────────────────────────────────────────────────────

    if (action === 'arc-get-my-mail') {
      if (!discord_id) return json({ ok: true, mail: [] });
      const { data, error } = await db
        .from('user_mail')
        .select('*')
        .eq('recipient_discord_id', discord_id)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) return json({ ok: false, error: error.message });
      return json({ ok: true, mail: data || [] });
    }

    if (action === 'arc-mark-mail-read') {
      if (!discord_id) return json({ ok: false, error: 'Not authenticated' });
      const { error } = await db
        .from('user_mail')
        .update({ is_read: true })
        .eq('id', params.id)
        .eq('recipient_discord_id', discord_id); // only own mail
      if (error) return json({ ok: false, error: error.message });
      return json({ ok: true });
    }

    if (action === 'arc-lookup-user') {
      if (!hasRole(callerRole, 'staff')) return json({ ok: false, error: 'Requires staff role' }, 403);
      const { data, error } = await db
        .from('profiles')
        .select('discord_id, discord_name, role, ign')
        .ilike('discord_name', params.discordName)
        .limit(5);
      if (error) return json({ ok: false, error: error.message });
      const user = data?.[0] ? { id: data[0].discord_id, ...data[0] } : null;
      return json({ ok: true, user });
    }

    if (action === 'arc-send-mail') {
      if (!hasRole(callerRole, 'staff')) return json({ ok: false, error: 'Requires staff role' }, 403);
      const { error } = await db.from('user_mail').insert({
        sender_discord_id:    discord_id || null,
        recipient_discord_id: params.recipientId,
        subject:              params.subject,
        body:                 params.body,
        reference_id:         params.referenceId || null,
      });
      if (error) return json({ ok: false, error: error.message });
      return json({ ok: true });
    }

    // ── Recipe submissions ────────────────────────────────────────────────────

    if (action === 'recipe-submit') {
      if (!discord_id) return json({ ok: false, error: 'Not authenticated' });
      const { output, outputQty, profession, labor, materials, notes, ign } = params;
      const { error } = await db.from('recipe_submissions').insert({
        submitter_discord_id: discord_id,
        output,
        output_qty:  outputQty  || 1,
        profession:  profession  || null,
        labor:       labor       || 0,
        materials:   materials   || [],
        notes:       notes       || null,
        ign:         ign         || null,
      });
      if (error) return json({ ok: false, error: error.message });
      return json({ ok: true });
    }

    if (action === 'recipe-admin-approve') {
      if (!hasRole(callerRole, 'curator')) return json({ ok: false, error: 'Requires curator role' }, 403);
      const { id, output, outputQty, profession, labor, materials, notes } = params;
      const { data: sub } = await db.from('recipe_submissions')
        .select('submitter_discord_id').eq('id', id).single();
      const { error } = await db.from('recipe_submissions')
        .update({
          status:      'approved',
          output,
          output_qty:  outputQty,
          profession,
          labor,
          materials,
          notes:       notes || null,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', id);
      if (error) return json({ ok: false, error: error.message });
      if (sub?.submitter_discord_id) {
        await db.rpc('award_arc_points', {
          p_discord_id:   sub.submitter_discord_id,
          p_points:       5,
          p_action_type:  'recipe_verified',
          p_reference_id: String(id),
        });
      }
      return json({ ok: true });
    }

    if (action === 'recipe-admin-reject') {
      if (!hasRole(callerRole, 'curator')) return json({ ok: false, error: 'Requires curator role' }, 403);
      const { error } = await db.from('recipe_submissions')
        .update({ status: 'rejected', feedback: params.feedback || null, reviewed_at: new Date().toISOString() })
        .eq('id', params.id);
      if (error) return json({ ok: false, error: error.message });
      return json({ ok: true });
    }

    return json({ ok: false, error: `Unknown action: ${action}` }, 400);

  } catch (e) {
    console.error('[app-api] error:', e);
    return json({ ok: false, error: (e as Error).message }, 500);
  }
});
