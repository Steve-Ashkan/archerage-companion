const LOCAL_KEY = "erenorCraftQuantities";
const FILTER_KEY = "erenorCraftProfessionFilter";

export function getQuantities() {
  return JSON.parse(localStorage.getItem(LOCAL_KEY) || "{}");
}

export function saveQuantity(id, value) {
  const data = getQuantities();
  data[id] = Math.max(0, Number(value) || 0);
  localStorage.setItem(LOCAL_KEY, JSON.stringify(data));
}

export function getProfessionFilter() {
  return localStorage.getItem(FILTER_KEY) || "All";
}

export function saveProfessionFilter(value) {
  localStorage.setItem(FILTER_KEY, value);
}
