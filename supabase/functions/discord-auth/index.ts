// ─── DISCORD AUTH EDGE FUNCTION ───────────────────────────────────────────────
// Two modes:
//   GET  ?code=xxx  → Discord OAuth redirect — exchange code, redirect to archerage://
//   POST {code}     → (unused, kept for reference)
//
// Client secret lives in Supabase secrets, never in the Electron binary.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const REDIRECT_URI = Deno.env.get('SUPABASE_URL')! + '/functions/v1/super-endpoint';

async function exchangeAndUpsert(code: string) {
  const CLIENT_ID     = Deno.env.get('DISCORD_CLIENT_ID')!;
  const CLIENT_SECRET = Deno.env.get('DISCORD_CLIENT_SECRET')!;

  // ── Exchange code for Discord access token ──────────────────────────────────
  const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    new URLSearchParams({
      client_id:     CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type:    'authorization_code',
      code,
      redirect_uri:  REDIRECT_URI,
    }),
  });
  const tokenData = await tokenRes.json();
  if (tokenData.error) throw new Error(tokenData.error_description || tokenData.error);

  // ── Get Discord user — identify scope only, NO email ───────────────────────
  const userRes = await fetch('https://discord.com/api/users/@me', {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });
  const discordUser = await userRes.json();
  // discordUser: { id, username, discriminator, avatar } — never email

  const avatar = discordUser.avatar
    ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
    : null;

  // ── Upsert profile ──────────────────────────────────────────────────────────
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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  try {
    // ── GET: Discord OAuth redirect ─────────────────────────────────────────
    if (req.method === 'GET') {
      const url  = new URL(req.url);
      const code = url.searchParams.get('code');

      if (!code) {
        return new Response('Missing code', { status: 400 });
      }

      const user = await exchangeAndUpsert(code);

      // Redirect to Electron app — only identity data, role is fetched from DB
      const params = new URLSearchParams({
        discord_id: user.id,
        name:       user.name,
        avatar:     user.avatar || '',
      });

      return Response.redirect(`archerage://auth/callback?${params}`, 302);
    }

    return new Response('Method not allowed', { status: 405, headers: CORS });

  } catch (e) {
    console.error('[discord-auth] error:', e);
    // Redirect to app with error so the popup closes cleanly
    return Response.redirect(
      `archerage://auth/callback?error=${encodeURIComponent((e as Error).message)}`,
      302
    );
  }
});
