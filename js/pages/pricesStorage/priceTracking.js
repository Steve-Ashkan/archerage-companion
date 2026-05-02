import { PRICE_UPDATED_KEY } from "./constants.js";

export function getPriceUpdatedMap() {
  return JSON.parse(localStorage.getItem(PRICE_UPDATED_KEY) || "{}");
}

export function savePriceUpdatedMap(map) {
  localStorage.setItem(PRICE_UPDATED_KEY, JSON.stringify(map));
}

export function markPriceUpdated(item) {
  const map = getPriceUpdatedMap();
  map[item] = Date.now();
  savePriceUpdatedMap(map);
}

export function getItemLastUpdated(item) {
  const map = getPriceUpdatedMap();
  return Number(map[item] || 0);
}

export function getDaysSince(timestamp) {
  if (!timestamp) return null;
  return Math.floor((Date.now() - timestamp) / (1000 * 60 * 60 * 24));
}
