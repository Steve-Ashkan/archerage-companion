// Tracks where each price came from: 'manual', 'community', or 'scan'

const SOURCE_KEY = 'priceSource';

export function getPriceSourceMap() {
  try { return JSON.parse(localStorage.getItem(SOURCE_KEY) || '{}'); }
  catch { return {}; }
}

export function setPriceSource(itemName, source) {
  const map = getPriceSourceMap();
  map[itemName] = source;
  localStorage.setItem(SOURCE_KEY, JSON.stringify(map));
}

export function getPriceSource(itemName) {
  return getPriceSourceMap()[itemName] || 'manual';
}

export const SOURCE_STYLES = {
  manual:    { label: 'Manual',    color: '#94a3b8' },
  community: { label: 'Community', color: '#93c5fd' },
  scan:      { label: 'Scan',      color: '#86efac' },
};
