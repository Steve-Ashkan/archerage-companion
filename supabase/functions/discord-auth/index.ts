// ─── DISCORD AUTH EDGE FUNCTION ───────────────────────────────────────────────
// GET ?code=xxx&state=xxx → Discord OAuth redirect.
// Exchanges the code, upserts the profile, mints a signed session JWT,
// and redirects to archerage://auth/callback?token=<jwt>&state=<state>
//
// Client secret and JWT secret live in Supabase secrets — never in the binary.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// ── JWT helpers ───────────────────────────────────────────────────────────────

function b64url(str: string): string {
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

async function signToken(payload: object): Promise<string> {
  const secret = Deno.env.get('SESSION_JWT_SECRET')!;
  const enc    = new TextEncoder();
  const header = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body   = b64url(JSON.stringify(payload));
  const data   = `${header}.${body}`;
  const key    = await crypto.subtle.importKey(
    'raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sig    = await crypto.subtle.sign('HMAC', key, enc.encode(data));
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  return `${data}.${sigB64}`;
}

// ── OAuth helpers ─────────────────────────────────────────────────────────────

const REDIRECT_URI = Deno.env.get('SUPABASE_URL')! + '/functions/v1/super-endpoint';

async function exchangeAndUpsert(code: string) {
  const CLIENT_ID     = Deno.env.get('DISCORD_CLIENT_ID')!;
  const CLIENT_SECRET = Deno.env.get('DISCORD_CLIENT_SECRET')!;

  const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    new URLSearchParams({
      client_id: CLIENT_ID, client_secret: CLIENT_SECRET,
      grant_type: 'authorization_code', code, redirect_uri: REDIRECT_URI,
    }),
  });
  const tokenData = await tokenRes.json();
  if (tokenData.error) throw new Error(tokenData.error_description || tokenData.error);

  const userRes = await fetch('https://discord.com/api/users/@me', {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });
  const discordUser = await userRes.json();

  const avatar = discordUser.avatar
    ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
    : null;

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  await supabase.from('profiles').upsert({
    discord_id:   discordUser.id,
    discord_name: discordUser.username,
    avatar,
    last_seen_at: new Date().toISOString(),
  }, { onConflict: 'discord_id' });

  return { id: discordUser.id, name: discordUser.username, avatar };
}

// ── Main ──────────────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  try {
    if (req.method !== 'GET') return new Response('Method not allowed', { status: 405 });

    const url   = new URL(req.url);
    const code  = url.searchParams.get('code');
    const state = url.searchParams.get('state') || '';

    if (!code) return new Response('Missing code', { status: 400 });

    const user = await exchangeAndUpsert(code);

    // Mint a 30-day signed session JWT
    const now = Math.floor(Date.now() / 1000);
    const token = await signToken({
      discord_id: user.id,
      name:       user.name,
      avatar:     user.avatar || '',
      iat:        now,
      exp:        now + 60 * 60 * 24 * 30, // 30 days
    });

    // Redirect to Electron deep link — token + state for CSRF verification
    const params = new URLSearchParams({ token, state });
    return Response.redirect(`archerage://auth/callback?${params}`, 302);

  } catch (e) {
    console.error('[discord-auth] error:', e);
    return Response.redirect(
      `archerage://auth/callback?error=${encodeURIComponent((e as Error).message)}`,
      302
    );
  }
});
