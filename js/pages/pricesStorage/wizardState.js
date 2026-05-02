import { WIZARD_KEY } from "./constants.js";

export function getWizardState() {
  return JSON.parse(localStorage.getItem(WIZARD_KEY) || "{}");
}

export function saveWizardState(state) {
  localStorage.setItem(WIZARD_KEY, JSON.stringify(state));
}

export function clearWizardState() {
  localStorage.removeItem(WIZARD_KEY);
}

export function getSafeWizardIndex(state) {
  const index = Number(state.currentIndex || 0);
  if (!Number.isFinite(index) || index < 0) return 0;
  return index;
}
