export function loadNumberMap(key) {
  return JSON.parse(localStorage.getItem(key) || "{}");
}

export function saveNumberMap(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function saveNumberValue(map, key, value, storageKey) {
  map[key] = Number(value) || 0;
  saveNumberMap(storageKey, map);
}
