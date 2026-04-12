import { loadNumberMap, saveNumberValue } from "./state/inventory.js";

export const appState = {
  currentPage: "landing",
  landingText: localStorage.getItem("landingText") || `Welcome to the ArcheRage Companion.

This landing page is editable.
Use the tabs below just like the Google Sheet tabs.`,
  filters: {
    search: "",
    category: "All"
  },
  storage: loadNumberMap("storageData"),
  prices: loadNumberMap("priceData"),
  required: loadNumberMap("requiredData")
};

export function saveLandingText(value) {
  appState.landingText = value;
  localStorage.setItem("landingText", value);
}

export function saveStorage(item, value) {
  saveNumberValue(appState.storage, item, value, "storageData");
}

export function savePrice(item, value) {
  saveNumberValue(appState.prices, item, value, "priceData");
  window.__onPriceSaved?.(item, value);
}

export function saveRequired(item, value) {
  saveNumberValue(appState.required, item, value, "requiredData");
}
