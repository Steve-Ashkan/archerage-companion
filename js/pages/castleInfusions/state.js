const LOCAL_KEY = "castleInfusionsTargetState";
const FILTER_KEY = "castleInfusionsCategoryFilter";

export function getTargets() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY)) || {};
  } catch {
    return {};
  }
}

export function saveTarget(title, value) {
  const data = getTargets();
  data[title] = Math.max(1, Number(value) || 1);
  localStorage.setItem(LOCAL_KEY, JSON.stringify(data));
}

export function getCategoryFilter() {
  return localStorage.getItem(FILTER_KEY) || "All";
}

export function saveCategoryFilter(value) {
  localStorage.setItem(FILTER_KEY, value);
}
