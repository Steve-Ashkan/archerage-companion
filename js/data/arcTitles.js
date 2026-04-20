// ─── ARC TITLE TIERS ──────────────────────────────────────────────────────────
// Based on lifetime points EARNED (never decreases when spending).
// Ordered highest → lowest so the first match wins.

export const TITLE_TIERS = [
  { min: 10000, title: 'Grand Archivist', color: '#67e8f9' },
  { min:  5000, title: 'Lorekeeper',      color: '#fcd34d' },
  { min:  2000, title: 'Market Oracle',   color: '#c084fc' },
  { min:   750, title: 'Price Seeker',    color: '#86efac' },
  { min:   200, title: 'Market Watcher',  color: '#93c5fd' },
  { min:    50, title: 'Curious Crafter', color: '#8d99ab' },
];

/** Returns the highest title the user has earned, or null if none yet. */
export function getTitleForPoints(lifetimePoints) {
  return TITLE_TIERS.find(t => lifetimePoints >= t.min) || null;
}

/** Renders a small inline title badge, or empty string if no title yet. */
export function renderTitleBadge(lifetimePoints) {
  const t = getTitleForPoints(lifetimePoints);
  if (!t) return '';
  return `<span style="font-size:0.72em;font-weight:700;padding:2px 10px;border-radius:20px;
    background:${t.color}22;color:${t.color};border:1px solid ${t.color}44;
    letter-spacing:0.05em;white-space:nowrap;">${t.title}</span>`;
}

const LIFETIME_KEY = 'arcLifetimePoints';

export function getCachedLifetimePoints() {
  return parseInt(localStorage.getItem(LIFETIME_KEY) || '0');
}

export function cacheLifetimePoints(pts) {
  localStorage.setItem(LIFETIME_KEY, String(pts));
}
