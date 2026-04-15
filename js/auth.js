// ─── AUTH ─────────────────────────────────────────────────────────────────────
// Auth abstraction layer. Only place in the app that knows about auth state.
// Swap internals here when backend is ready — nothing else changes.
//
// Electron now:  electronAPI.getAuthStatus() → main.js decrypts safeStorage token
// Web later:     fetch('/api/me') with httpOnly session cookie
// Mobile later:  same fetch('/api/me'), cookie handled by webview
//
// Auth state shape:
//   { ok, isPro, role, user, proExpires }
//
// Role hierarchy: free < pro < curator < staff < admin < dev
// hasRole/hasPermission live in roles.js — import from there for checks.

import { CONFIG } from "./config.js";
import { hasRole } from "./roles.js";

const DEFAULT_AUTH = {
  isPro:      false,
  role:       'free',
  user:       null,   // { id, name, avatar } — populated after Discord OAuth
  proExpires: null,   // ISO string or null
};

let _auth = { ...DEFAULT_AUTH };

// ─── INIT ─────────────────────────────────────────────────────────────────────

// Call once at startup before rendering anything.
export async function initAuth() {
  if (!CONFIG.AUTH_ENABLED) {
    _auth = { ...DEFAULT_AUTH };
    return _auth;
  }

  try {
    // Electron path — main.js decrypts token, validates JWT, returns claims
    if (window.electronAPI?.getAuthStatus) {
      const result = await window.electronAPI.getAuthStatus();
      if (result?.ok) {
        _auth = {
          isPro:      result.isPro      === true,
          role:       result.role       || 'free',
          user:       result.user       || null,
          proExpires: result.proExpires || null,
        };
        return _auth;
      }
    }

    // Web path (uncomment when backend is live)
    // const res = await fetch(`${CONFIG.API_BASE}/api/me`, { credentials: 'include' });
    // if (res.ok) {
    //   const data = await res.json();
    //   _auth = {
    //     isPro:      data.isPro      === true,
    //     role:       data.role       || 'free',
    //     user:       data.user       || null,
    //     proExpires: data.proExpires || null,
    //   };
    //   return _auth;
    // }
  } catch {
    // Network or IPC failure — fall back to free silently
  }

  _auth = { ...DEFAULT_AUTH };
  return _auth;
}

// ─── GETTERS (sync — only valid after initAuth resolves) ──────────────────────

export function getAuth()       { return _auth; }
export function isPro()         { return _auth.isPro === true; }
export function getRole()       { return _auth.role || 'free'; }
export function getUser()       { return _auth.user; }
export function getProExpires() { return _auth.proExpires; }

// Convenience — checks role hierarchy via roles.js
export function userHasRole(requiredRole) {
  return hasRole(getRole(), requiredRole);
}

// ─── MUTATIONS ────────────────────────────────────────────────────────────────

// Initiates Discord OAuth — opens system browser, waits for deep link callback.
// Returns { ok, error? } after the flow completes (or fails).
export async function login() {
  if (!window.electronAPI) return { ok: false, error: 'Not running in Electron' };

  // 1. Open Discord OAuth in system browser
  const openResult = await window.electronAPI.openDiscordAuth();
  if (!openResult?.ok) return { ok: false, error: openResult?.error || 'Failed to open auth' };

  // 2. Wait for the deep link callback from main process
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      resolve({ ok: false, error: 'Login timed out. Please try again.' });
    }, 5 * 60 * 1000); // 5-minute timeout

    window.electronAPI.onOAuthCallback(async (callbackUrl) => {
      clearTimeout(timeout);
      console.log('[auth] onOAuthCallback fired, URL:', callbackUrl?.slice(0, 80));
      try {
        const result = await window.electronAPI.handleOAuthCallback(callbackUrl);
        console.log('[auth] handleOAuthCallback result:', JSON.stringify(result)?.slice(0, 200));
        if (!result?.ok) {
          resolve({ ok: false, error: result?.error || 'OAuth callback failed' });
          return;
        }
        // Apply new auth state
        const auth = result.auth;
        _auth = {
          isPro:      auth.isPro      === true,
          role:       auth.role       || 'free',
          user:       auth.user       || null,
          proExpires: auth.proExpires || null,
        };
        console.log('[auth] _auth set, user:', _auth.user?.name, 'role:', _auth.role);
        // Notify app to rebuild UI
        window.__onAuthChange?.(_auth);
        resolve({ ok: true });
      } catch(e) {
        console.error('[auth] onOAuthCallback error:', e.message);
        resolve({ ok: false, error: e.message });
      }
    });
  });
}

// Signs the user out — clears Supabase session and local auth cache.
export async function logout() {
  try {
    if (window.electronAPI?.signOut) await window.electronAPI.signOut();
  } catch { /* ignore */ }
  _auth = { ...DEFAULT_AUTH };
  window.__onAuthChange?.(_auth);
}

// For the local dev panel role switcher only — not used in production.
export function devSetRole(role) {
  _auth = { ..._auth, role, isPro: hasRole(role, 'pro') };
}

// Call on logout before rebuilding UI.
export function clearAuthCache() {
  _auth = { ...DEFAULT_AUTH };
}
