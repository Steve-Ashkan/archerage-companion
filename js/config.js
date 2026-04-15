// ─── CONFIG ───────────────────────────────────────────────────────────────────
// Central configuration for the ArcheRage Companion app.
// Fill in the placeholder values when Ashkan returns with credentials.

export const CONFIG = {
  version: "1.0.0",

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

  // ── Dev Overrides ─────────────────────────────────────────────────────────
  // For local testing only. NEVER ship with DEV_FORCE_PRO: true.
  // Note: flipping this in a distributed build only bypasses client-side UI gating.
  // All privileged IPC handlers enforce role server-side via enforceRole() regardless.
  DEV_FORCE_PRO: false,  // ← must be false before distributing
  DEV_ROLE:      'dev',  // role used when DEV_FORCE_PRO is true
};
