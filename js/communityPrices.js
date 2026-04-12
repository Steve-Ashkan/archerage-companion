// ─── COMMUNITY PRICES ─────────────────────────────────────────────────────────
// Handles syncing prices to/from the Supabase community DB.
// Only active for Pro+ users. All calls are fire-and-forget — local save
// always happens first regardless of network state.

import { userHasRole } from './auth.js';
import { savePrice } from './state.js';
import { getItemLastUpdated } from './pages/pricesStorage/priceTracking.js';
import { setPriceSource } from './pages/pricesStorage/priceSource.js';

const CACHE_KEY    = 'communityPrices';
const CACHE_TS_KEY = 'communityPricesAt';
const SYNC_INTERVAL_MS = 15 * 60 * 1000; // 15 min between auto-syncs

// ─── FETCH ────────────────────────────────────────────────────────────────────

export async function fetchCommunityPrices() {
  if (!userHasRole('pro')) return { ok: false, reason: 'not_pro' };
  if (!window.electronAPI?.getCommunityPrices) return { ok: false, reason: 'no_api' };

  try {
    const result = await window.electronAPI.getCommunityPrices();
    if (!result?.ok) return { ok: false, reason: result?.error };

    localStorage.setItem(CACHE_KEY,    JSON.stringify(result.prices));
    localStorage.setItem(CACHE_TS_KEY, Date.now().toString());

    const applied = applyCommunityPrices(result.prices);
    return { ok: true, prices: result.prices, count: Object.keys(result.prices).length, applied };
  } catch(e) {
    return { ok: false, reason: e.message };
  }
}

export function getCachedCommunityPrices() {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}'); }
  catch { return {}; }
}

// Returns age in minutes, or null if never synced.
export function getCommunityPricesAge() {
  const ts = parseInt(localStorage.getItem(CACHE_TS_KEY) || '0');
  if (!ts) return null;
  return Math.floor((Date.now() - ts) / 60000);
}

function shouldSync() {
  const ts = parseInt(localStorage.getItem(CACHE_TS_KEY) || '0');
  return !ts || (Date.now() - ts) > SYNC_INTERVAL_MS;
}

// ─── APPLY ────────────────────────────────────────────────────────────────────

// Merges community prices into local price data.
// Only applies prices newer than the user's local last-updated timestamp.
// Suppresses the submit hook so merged prices don't get re-submitted.
export function applyCommunityPrices(prices) {
  const savedHook = window.__onPriceSaved;
  window.__onPriceSaved = null;

  let applied = 0;
  for (const [itemName, data] of Object.entries(prices)) {
    const localTs     = getItemLastUpdated(itemName);
    const communityTs = data.updatedAt ? new Date(data.updatedAt).getTime() : 0;
    if (communityTs > localTs) {
      savePrice(itemName, data.price);
      setPriceSource(itemName, 'community');
      applied++;
    }
  }

  window.__onPriceSaved = savedHook;
  return applied;
}

// ─── SUBMIT ───────────────────────────────────────────────────────────────────

// Called automatically by savePrice() hook. Fire-and-forget.
export async function submitPrice(itemName, price) {
  if (!userHasRole('pro')) return;
  if (!window.electronAPI?.submitCommunityPrice) return;
  try {
    await window.electronAPI.submitCommunityPrice(itemName, price);
  } catch { /* local save already happened — silent fail is fine */ }
}

// ─── SETUP ────────────────────────────────────────────────────────────────────

// ─── BULK SUBMIT (Staff+) ─────────────────────────────────────────────────────

// Submits a map of { itemName: price } to the community DB.
// Used by staff after an AH scan import.
export async function bulkSubmitPrices(priceMap) {
  if (!userHasRole('staff')) return { ok: false, reason: 'not_staff' };
  if (!window.electronAPI?.bulkSubmitCommunityPrices) return { ok: false, reason: 'no_api' };
  try {
    const items = Object.entries(priceMap)
      .filter(([, price]) => price > 0)
      .map(([item_name, price]) => ({ item_name, price }));
    const result = await window.electronAPI.bulkSubmitCommunityPrices(items);
    return result;
  } catch(e) {
    return { ok: false, reason: e.message };
  }
}

// ─── GAVEL SOUND ─────────────────────────────────────────────────────────────

function playGavelSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();

    function hit(time) {
      const osc    = ctx.createOscillator();
      const gain   = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(900, time);
      filter.frequency.exponentialRampToValueAtTime(80, time + 0.18);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(200, time);
      osc.frequency.exponentialRampToValueAtTime(55, time + 0.18);

      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.exponentialRampToValueAtTime(0.9, time + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.22);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(time);
      osc.stop(time + 0.25);
    }

    hit(ctx.currentTime);
    hit(ctx.currentTime + 0.32);
    hit(ctx.currentTime + 0.64);

    setTimeout(() => ctx.close(), 2000);
  } catch(e) { /* Audio not available — silent fail */ }
}

// ─── PRICE UPDATE TOAST ───────────────────────────────────────────────────────

function showSyncToast(applied) {
  if (applied <= 0) return; // silent when nothing changed

  playGavelSound();

  const existing = document.getElementById('community-sync-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'community-sync-toast';
  toast.style.cssText = `
    position:fixed; bottom:80px; right:20px; z-index:9000;
    background:#1a2535; border:1px solid #2a5a8a; border-radius:10px;
    padding:12px 18px; font-size:13px; color:#93c5fd;
    box-shadow:0 4px 24px rgba(0,0,0,0.5); pointer-events:none;
    animation: fadeInUp 0.25s ease;
  `;
  toast.innerHTML = `🔨 <strong>${applied}</strong> price${applied === 1 ? '' : 's'} updated`;

  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.transition = 'opacity 0.4s ease';
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 400);
  }, 4000);
}

// ─── SETUP ────────────────────────────────────────────────────────────────────

// Call once after initAuth() resolves. Wires up the price-save hook,
// triggers an initial sync, and starts the background polling interval.
export function setupCommunityPrices() {
  // Hook into savePrice — any price save by a Pro user auto-submits
  window.__onPriceSaved = (itemName, price) => {
    if (userHasRole('pro')) submitPrice(itemName, price);
  };

  if (!userHasRole('pro')) return;

  // Initial sync on startup if cache is stale
  if (shouldSync()) {
    fetchCommunityPrices().then(result => {
      if (result.ok && result.applied > 0) {
        showSyncToast(result.applied);
        window.renderCurrentPage?.();
      }
    });
  }

  // Background poll every 15 minutes for the lifetime of the session
  setInterval(async () => {
    const result = await fetchCommunityPrices();
    if (result.ok && result.applied > 0) {
      showSyncToast(result.applied);
      window.renderCurrentPage?.();
    }
  }, SYNC_INTERVAL_MS);
}
