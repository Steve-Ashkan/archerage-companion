// ─── APP API EDGE FUNCTION ────────────────────────────────────────────────────
// Single privileged endpoint for all app operations.
// All requests must carry a signed session JWT in the Authorization header.
// The service key never ships to users — it lives only in Supabase secrets.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// ── JWT verification ──────────────────────────────────────────────────────────

async function verifyToken(authHeader: string | null): Promise<{ discord_id: string; name?: string } | null> {
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7);
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, body, sig] = parts;
    const data    = `${header}.${body}`;
    const enc     = new TextEncoder();
    const secret  = Deno.env.get('SESSION_JWT_SECRET')!;
    const key     = await crypto.subtle.importKey(
      'raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']
    );
    const sigBytes = Uint8Array.from(
      atob(sig.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0)
    );
    const valid = await crypto.subtle.verify('HMAC', key, sigBytes, enc.encode(data));
    if (!valid) return null;
    const payload = JSON.parse(atob(body.replace(/-/g, '+').replace(/_/g, '/')));
    // H-3: Require exp to be present and numeric — undefined exp would pass < check
    if (typeof payload.exp !== 'number' || payload.exp < Date.now() / 1000) return null;
    // Sanity: reject tokens issued more than 60s in the future (clock skew guard)
    if (typeof payload.iat === 'number' && payload.iat > Date.now() / 1000 + 60) return null;
    return payload;
  } catch {
    return null;
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// Sanitize and cap a string param
function str(v: unknown, max = 500): string | null {
  if (v == null || v === '') return null;
  return String(v).trim().slice(0, max);
}

const ROLE_ORDER = ['free', 'pro', 'curator', 'staff', 'admin', 'dev'];
function hasRole(userRole: string, required: string): boolean {
  return ROLE_ORDER.indexOf(userRole) >= ROLE_ORDER.indexOf(required);
}

// ── Main ──────────────────────────────────────────────────────────────────────

// Helper: validate a numeric ID param (Supabase bigint PKs)
function numId(v: unknown): number | null {
  const n = Number(v);
  return Number.isInteger(n) && n >= 1 ? n : null;
}

// Helper: validate a Discord snowflake (17-20 digit numeric string)
function snowflake(v: unknown): string | null {
  if (v == null) return null;
  const s = String(v).trim();
  return /^\d{17,20}$/.test(s) ? s : null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { status: 200 });

  // M-5: Reject browser-originated requests (Electron app sends no Origin header)
  if (req.headers.get('origin')) {
    return json({ ok: false, error: 'Browser access forbidden' }, 403);
  }

  try {
    const body = await req.json();
    const { action, ...params } = body;
    if (!action) return json({ ok: false, error: 'Missing action' }, 400);

    // Verify session JWT — discord_id comes from the verified token, never the body
    const caller     = await verifyToken(req.headers.get('authorization'));
    const discord_id = caller?.discord_id || null;

    const db = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );

    // ── get-profile: returns own profile from verified token ──────────────────
    if (action === 'get-profile') {
      if (!discord_id) return json({ ok: true, profile: null });
      const { data } = await db
        .from('profiles')
        .select('role, pro_expires_at, ign, discord_name, avatar')
        .eq('discord_id', discord_id)
        .single();
      try {
        await db.from('profiles')
          .update({ last_seen_at: new Date().toISOString() })
          .eq('discord_id', discord_id);
      } catch { /* ignore */ }
      return json({ ok: true, profile: data || null });
    }

    // ── All other actions require a valid session token ───────────────────────
    if (!discord_id) return json({ ok: false, error: 'Unauthorized' }, 401);

    // Look up caller role
    let callerRole = 'free';
    {
      const { data } = await db.from('profiles').select('role').eq('discord_id', discord_id).single();
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
        id: u.discord_id, discord_name: u.discord_name, avatar_url: u.avatar,
        role: u.role, ign: u.ign, pro_expires_at: u.pro_expires_at, last_seen_at: u.last_seen_at,
      }));
      return json({ ok: true, users });
    }

    if (action === 'admin-set-role') {
      if (!hasRole(callerRole, 'admin')) return json({ ok: false, error: 'Requires admin role' }, 403);
      const VALID_ROLES = ['free', 'pro', 'curator', 'staff', 'admin', 'dev'];
      if (!VALID_ROLES.includes(params.role)) return json({ ok: false, error: 'Invalid role' });
      const userId = snowflake(params.userId);
      if (!userId) return json({ ok: false, error: 'Invalid userId' });
      const { error } = await db.from('profiles').update({ role: params.role }).eq('discord_id', userId);
      if (error) return json({ ok: false, error: error.message });
      return json({ ok: true });
    }

    if (action === 'admin-grant-pro') {
      if (!hasRole(callerRole, 'admin')) return json({ ok: false, error: 'Requires admin role' }, 403);
      const userId = snowflake(params.userId);
      if (!userId) return json({ ok: false, error: 'Invalid userId' });
      const days = Math.max(1, Math.min(3650, parseInt(params.days) || 30));
      const expires = new Date();
      expires.setDate(expires.getDate() + days);
      const { error } = await db.from('profiles')
        .update({ role: 'pro', pro_expires_at: expires.toISOString() })
        .eq('discord_id', userId);
      if (error) return json({ ok: false, error: error.message });
      return json({ ok: true });
    }

    if (action === 'admin-revoke-pro') {
      if (!hasRole(callerRole, 'admin')) return json({ ok: false, error: 'Requires admin role' }, 403);
      const userId = snowflake(params.userId);
      if (!userId) return json({ ok: false, error: 'Invalid userId' });
      const { error } = await db.from('profiles')
        .update({ role: 'free', pro_expires_at: null })
        .eq('discord_id', userId);
      if (error) return json({ ok: false, error: error.message });
      return json({ ok: true });
    }

    // ── Community prices (admin) ──────────────────────────────────────────────

    if (action === 'admin-get-flagged-prices') {
      if (!hasRole(callerRole, 'staff')) return json({ ok: false, error: 'Requires staff role' }, 403);
      const { data, error } = await db.rpc('admin_get_flagged_prices');
      if (error) return json({ ok: false, error: error.message });
      return json({ ok: true, items: data || [] });
    }

    if (action === 'admin-accept-price') {
      if (!hasRole(callerRole, 'staff')) return json({ ok: false, error: 'Requires staff role' }, 403);
      const itemName = str(params.itemName, 200);
      const price    = typeof params.price === 'number' && isFinite(params.price) && params.price >= 0 ? params.price : null;
      if (!itemName || price === null) return json({ ok: false, error: 'Invalid params' });
      const { error } = await db.rpc('admin_accept_price', { p_item_name: itemName, p_price: price });
      if (error) return json({ ok: false, error: error.message });
      return json({ ok: true });
    }

    if (action === 'admin-reject-price') {
      if (!hasRole(callerRole, 'staff')) return json({ ok: false, error: 'Requires staff role' }, 403);
      const itemName = str(params.itemName, 200);
      if (!itemName) return json({ ok: false, error: 'Invalid params' });
      const { error } = await db.rpc('admin_reject_price', { p_item_name: itemName });
      if (error) return json({ ok: false, error: error.message });
      return json({ ok: true });
    }

    // ── Profile ───────────────────────────────────────────────────────────────

    if (action === 'update-ign') {
      const ign = str(params.ign, 64);
      const { error } = await db.from('profiles').update({ ign }).eq('discord_id', discord_id);
      if (error) return json({ ok: false, error: error.message });
      return json({ ok: true });
    }

    // ── Wiki submissions ──────────────────────────────────────────────────────

    if (action === 'wiki-submit') {
      const title    = str(params.title,    200);
      const category = str(params.category, 100);
      const content  = str(params.content,  65536);
      if (!title || !content) return json({ ok: false, error: 'Missing title or content' });
      const { error } = await db.from('wiki_submissions').insert({
        submitter_discord_id: discord_id,
        title, category, content,
        discord_name: str(params.discordName, 100),
        ign:          str(params.ign,         64),
      });
      if (error) return json({ ok: false, error: error.message });
      return json({ ok: true });
    }

    if (action === 'wiki-admin-get-submissions') {
      if (!hasRole(callerRole, 'curator')) return json({ ok: false, error: 'Requires curator role' }, 403);
      const { data, error } = await db.rpc('admin_get_wiki_submissions');
      if (error) return json({ ok: false, error: error.message });
      return json({ ok: true, submissions: data || [] });
    }

    if (action === 'wiki-admin-approve') {
      if (!hasRole(callerRole, 'curator')) return json({ ok: false, error: 'Requires curator role' }, 403);
      const id = numId(params.id);
      if (!id) return json({ ok: false, error: 'Invalid id' });
      const { data: sub } = await db.from('wiki_submissions')
        .select('submitter_discord_id').eq('id', id).single();
      const { error } = await db.from('wiki_submissions')
        .update({ status: 'approved', reviewed_at: new Date().toISOString() })
        .eq('id', id);
      if (error) return json({ ok: false, error: error.message });
      if (sub?.submitter_discord_id) {
        await db.rpc('award_arc_points', {
          p_discord_id: sub.submitter_discord_id, p_points: 25,
          p_action_type: 'wiki_approved', p_reference_id: String(id),
        });
      }
      return json({ ok: true });
    }

    if (action === 'wiki-admin-reject') {
      if (!hasRole(callerRole, 'curator')) return json({ ok: false, error: 'Requires curator role' }, 403);
      const id = numId(params.id);
      if (!id) return json({ ok: false, error: 'Invalid id' });
      const { error } = await db.from('wiki_submissions')
        .update({ status: 'rejected', feedback: str(params.feedback, 1000), reviewed_at: new Date().toISOString() })
        .eq('id', id);
      if (error) return json({ ok: false, error: error.message });
      return json({ ok: true });
    }

    // ── ARC Points ────────────────────────────────────────────────────────────

    if (action === 'arc-get-my-points') {
      const { data, error } = await db.rpc('get_my_points', { p_discord_id: discord_id });
      if (error) return json({ ok: false, error: error.message });
      return json({ ok: true, points: data || 0 });
    }

    if (action === 'arc-get-point-history') {
      const { data, error } = await db.rpc('get_my_point_history', { p_discord_id: discord_id });
      if (error) return json({ ok: false, error: error.message });
      return json({ ok: true, history: data || [] });
    }

    if (action === 'arc-submit-redemption') {
      const { rewardId, rewardLabel, pointsSpent, ignSnapshot, discordName, recipientId } = params;
      if (typeof pointsSpent !== 'number' || !Number.isInteger(pointsSpent) || pointsSpent <= 0) {
        return json({ ok: false, error: 'Invalid points amount' });
      }
      // Atomic: check balance + insert + deduct in one DB transaction
      const { data, error } = await db.rpc('submit_redemption_atomic', {
        p_discord_id:   discord_id,
        p_reward_id:    str(rewardId, 100),
        p_reward_label: str(rewardLabel, 200),
        p_points_spent: pointsSpent,
        p_ign_snapshot: str(ignSnapshot, 64),
        p_discord_name: str(discordName, 100),
        p_recipient_id: str(recipientId, 100),
      });
      if (error) return json({ ok: false, error: error.message });
      return data as Response;
    }

    if (action === 'arc-get-all-redemptions') {
      if (!hasRole(callerRole, 'admin')) return json({ ok: false, error: 'Requires admin role' }, 403);
      const { data, error } = await db.rpc('get_pending_redemptions');
      if (error) return json({ ok: false, error: error.message });
      return json({ ok: true, redemptions: data || [] });
    }

    if (action === 'arc-fulfill-redemption') {
      if (!hasRole(callerRole, 'admin')) return json({ ok: false, error: 'Requires admin role' }, 403);
      const id = numId(params.id);
      if (!id) return json({ ok: false, error: 'Invalid id' });
      const { error } = await db.from('arc_redemptions')
        .update({ status: 'fulfilled', notes: str(params.notes, 500), fulfilled_at: new Date().toISOString() })
        .eq('id', id);
      if (error) return json({ ok: false, error: error.message });
      return json({ ok: true });
    }

    if (action === 'arc-cancel-redemption') {
      if (!hasRole(callerRole, 'admin')) return json({ ok: false, error: 'Requires admin role' }, 403);
      const id = numId(params.id);
      if (!id) return json({ ok: false, error: 'Invalid id' });
      const { data: r } = await db.from('arc_redemptions')
        .select('discord_id, points_spent, status').eq('id', id).single();
      const { error } = await db.from('arc_redemptions').update({ status: 'cancelled' }).eq('id', id);
      if (error) return json({ ok: false, error: error.message });
      if (r?.discord_id && r?.status === 'pending') {
        await db.rpc('award_arc_points', {
          p_discord_id: r.discord_id, p_points: r.points_spent,
          p_action_type: 'refund', p_reference_id: String(id),
        });
      }
      return json({ ok: true });
    }

    // ── User Mail ─────────────────────────────────────────────────────────────

    if (action === 'arc-get-my-mail') {
      const { data, error } = await db
        .from('user_mail').select('*')
        .eq('recipient_discord_id', discord_id)
        .order('created_at', { ascending: false }).limit(50);
      if (error) return json({ ok: false, error: error.message });
      return json({ ok: true, mail: data || [] });
    }

    if (action === 'arc-mark-mail-read') {
      const id = numId(params.id);
      if (!id) return json({ ok: false, error: 'Invalid id' });
      const { error } = await db.from('user_mail')
        .update({ is_read: true })
        .eq('id', id)
        .eq('recipient_discord_id', discord_id); // only own mail
      if (error) return json({ ok: false, error: error.message });
      return json({ ok: true });
    }

    if (action === 'arc-lookup-user') {
      if (!hasRole(callerRole, 'staff')) return json({ ok: false, error: 'Requires staff role' }, 403);
      // L-6: Strip SQL wildcards to prevent user enumeration via ilike
      const needle = (str(params.discordName, 100) || '').replace(/[%_]/g, '\\$&');
      const { data, error } = await db.from('profiles')
        .select('discord_id, discord_name, role, ign')
        .ilike('discord_name', needle)
        .limit(5);
      if (error) return json({ ok: false, error: error.message });
      const user = data?.[0] ? { id: data[0].discord_id, ...data[0] } : null;
      return json({ ok: true, user });
    }

    if (action === 'arc-send-mail') {
      if (!hasRole(callerRole, 'staff')) return json({ ok: false, error: 'Requires staff role' }, 403);
      const subject     = str(params.subject, 200);
      const body        = str(params.body,    4096);
      const recipientId = snowflake(params.recipientId);
      if (!subject || !body) return json({ ok: false, error: 'Missing subject or body' });
      if (!recipientId) return json({ ok: false, error: 'Invalid recipientId' });
      const { error } = await db.from('user_mail').insert({
        sender_discord_id:    discord_id,
        recipient_discord_id: recipientId,
        subject, body,
        reference_id: str(params.referenceId, 100),
      });
      if (error) return json({ ok: false, error: error.message });
      return json({ ok: true });
    }

    // ── Recipe submissions ────────────────────────────────────────────────────

    if (action === 'recipe-submit') {
      const output    = str(params.output, 200);
      if (!output) return json({ ok: false, error: 'Missing output' });
      const outputQty = Math.max(1, parseInt(params.outputQty) || 1);
      const labor     = Math.max(0, parseInt(params.labor)     || 0);
      const materials = Array.isArray(params.materials) ? params.materials.slice(0, 50) : [];
      const { error } = await db.from('recipe_submissions').insert({
        submitter_discord_id: discord_id,
        output, output_qty: outputQty,
        profession: str(params.profession, 100),
        labor, materials,
        notes: str(params.notes, 2000),
        ign:   str(params.ign,   64),
      });
      if (error) return json({ ok: false, error: error.message });
      return json({ ok: true });
    }

    if (action === 'recipe-admin-get-submissions') {
      if (!hasRole(callerRole, 'curator')) return json({ ok: false, error: 'Requires curator role' }, 403);
      const { data, error } = await db.rpc('admin_get_recipe_submissions');
      if (error) return json({ ok: false, error: error.message });
      return json({ ok: true, submissions: data || [] });
    }

    if (action === 'recipe-admin-approve') {
      if (!hasRole(callerRole, 'curator')) return json({ ok: false, error: 'Requires curator role' }, 403);
      const id = numId(params.id);
      if (!id) return json({ ok: false, error: 'Invalid id' });
      // M-6: Validate curator-supplied fields with same caps as recipe-submit
      const output     = str(params.output, 200);
      if (!output) return json({ ok: false, error: 'Missing output' });
      const outputQty  = Math.max(1, parseInt(params.outputQty) || 1);
      const labor      = Math.max(0, parseInt(params.labor) || 0);
      const profession = str(params.profession, 100);
      const materials  = Array.isArray(params.materials) ? params.materials.slice(0, 50) : [];
      const { data: sub } = await db.from('recipe_submissions')
        .select('submitter_discord_id').eq('id', id).single();
      const { error } = await db.from('recipe_submissions')
        .update({
          status: 'approved', output,
          output_qty: outputQty, profession, labor, materials,
          notes: str(params.notes, 2000), reviewed_at: new Date().toISOString(),
        })
        .eq('id', id);
      if (error) return json({ ok: false, error: error.message });
      if (sub?.submitter_discord_id) {
        await db.rpc('award_arc_points', {
          p_discord_id: sub.submitter_discord_id, p_points: 5,
          p_action_type: 'recipe_verified', p_reference_id: String(id),
        });
      }
      return json({ ok: true });
    }

    if (action === 'recipe-admin-reject') {
      if (!hasRole(callerRole, 'curator')) return json({ ok: false, error: 'Requires curator role' }, 403);
      const id = numId(params.id);
      if (!id) return json({ ok: false, error: 'Invalid id' });
      const { error } = await db.from('recipe_submissions')
        .update({ status: 'rejected', feedback: str(params.feedback, 1000), reviewed_at: new Date().toISOString() })
        .eq('id', id);
      if (error) return json({ ok: false, error: error.message });
      return json({ ok: true });
    }

    return json({ ok: false, error: `Unknown action: ${action}` }, 400);

  } catch (e) {
    console.error('[app-api] error:', e);
    return json({ ok: false, error: (e as Error).message }, 500);
  }
});
