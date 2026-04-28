// ─── CONFIG ───────────────────────────────────────────────────────────────────
// Central configuration for the ArcheRage Companion app.
// Fill in the placeholder values when Ashkan returns with credentials.

export const CONFIG = {
  version: "1.6.0",

  // ── Backend ───────────────────────────────────────────────────────────────
  // Set API_BASE and flip AUTH_ENABLED once the backend is live.
  // Dev:  "http://localhost:3000"
  // Prod: "https://api.archerage-companion.com"  (update when domain is set)
  API_BASE:     null,
  AUTH_ENABLED: true,

  // ── Discord OAuth ─────────────────────────────────────────────────────────
  // From: discord.com/developers/applications → Your App → OAuth2
  DISCORD_CLIENT_ID: "1491287833598496929",
  // Client Secret stays server-side only — never put it here.
  // Redirect URI to register in Discord dashboard (after backend is live):
  //   Electron: "archerage://auth/callback"
  //   Web:      "https://api.archerage-companion.com/auth/discord/callback"

  // ── Supabase ──────────────────────────────────────────────────────────────
  // From: supabase.com → Your Project → Settings → API
  SUPABASE_URL:      "https://ywkyhtvfdbtybevggonb.supabase.co",
  SUPABASE_ANON_KEY: "sb_publishable_vLgj1WUM3-mws4c-ahwDWQ_xUmfjRPF",
  // Service role key stays server-side only — never put it here.

};
