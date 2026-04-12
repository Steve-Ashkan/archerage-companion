import { appState } from "../state.js";
import { escapeHtml, formatGold, jsEscape, renderMaterialsGrid } from "../utils.js";
import { CASTLE_INFUSIONS } from "./castleInfusions/data.js";
import {
  getTargets,
  saveTarget,
  getCategoryFilter,
  saveCategoryFilter
} from "./castleInfusions/state.js";

function getCategoryOptions() {
  return ["All", ...new Set(CASTLE_INFUSIONS.map((infusion) => infusion.category))];
}

function renderCategoryButtons(selected) {
  return `
    <div class="section-nav" style="margin-top:12px;">
      ${getCategoryOptions().map(cat => `
        <button
          type="button"
          class="section-link"
          onclick="window.updateCastleCategoryFilter('${jsEscape(cat)}')"
          style="${cat === selected ? "background:#465062;" : ""}"
        >
          ${escapeHtml(cat)}
        </button>
      `).join("")}
    </div>
  `;
}

/* =========================
   CALCULATION
========================= */
function calculateInfusion(infusion, target) {
  let totalStillNeeded = 0;
  let itemsData = [];

  let progressSum = 0;
  let itemCount = 0;

  infusion.items.forEach(item => {
    const required = item.amount * target;
    const stored = Number(appState.storage[item.name] || 0);
    const price = Number(appState.prices[item.name] || 0);

    const stillNeedQty = Math.max(0, required - stored);
    const goldStillNeed = stillNeedQty * price;

    totalStillNeeded += goldStillNeed;

    // ✅ CORRECT PROGRESS CALC (MATCHES ERENOR)
    let itemProgress = 0;
    if (required > 0) {
      itemProgress = Math.min(stored / required, 1);
    }

    progressSum += itemProgress;
    itemCount++;

    itemsData.push({
      name: item.name,
      required,
      stored,
      price,
      goldStillNeed,
      stillNeed: stillNeedQty
    });
  });

  // ✅ FINAL PROGRESS = AVERAGE OF ITEMS
  const progress = itemCount > 0
    ? Math.round((progressSum / itemCount) * 100)
    : 0;

  return { itemsData, totalStillNeeded, progress };
}

/* =========================
   RENDER
========================= */
function renderInfusionCard(infusion) {
  const target = getTargets()[infusion.title] || 1;
  const { itemsData, totalStillNeeded, progress } = calculateInfusion(infusion, target);

  return `
    <div class="card">
      <h2>${escapeHtml(infusion.title)}</h2>

      <div style="margin-bottom:15px; display:flex; gap:15px; align-items:center; flex-wrap:wrap;">
        <label><strong>Target infusions:</strong></label>
        <input
          type="number"
          value="${target}"
          min="1"
          style="width:80px;"
          onchange="window.updateCastleTarget('${jsEscape(infusion.title)}', this.value)"
        >
      </div>

      ${renderMaterialsGrid(itemsData.map(item => ({
        name:         item.name,
        required:     item.required,
        inStorage:    item.stored,
        price:        item.price,
        stillNeed:    item.stillNeed,
        goldStillNeed:item.goldStillNeed,
        totalGold:    item.required * item.price
      })))}

      <div class="summary-grid" style="margin-top:20px;">
        <div class="summary-box">
          <div class="summary-label">Total Gold Still Needed</div>
          <div class="summary-value">${formatGold(totalStillNeeded)}</div>
        </div>
        <div class="summary-box">
          <div class="summary-label">Progress</div>
          <div class="summary-value">${progress}%</div>
        </div>
      </div>
    </div>
  `;
}

export function renderPage() {
  const categoryFilter = getCategoryFilter();
  const filtered = categoryFilter === "All"
    ? CASTLE_INFUSIONS
    : CASTLE_INFUSIONS.filter(i => i.category === categoryFilter);

  return `
    <h1>Castle Infusions</h1>

    <div class="card">
      <h2>Castle Infusions</h2>
      ${renderCategoryButtons(categoryFilter)}
    </div>

    ${filtered.map(infusion => renderInfusionCard(infusion)).join("")}
  `;
}

/* =========================
   HANDLERS
========================= */
window.updateCastleTarget = (title, val) => {
  saveTarget(title, val);
  window.renderCurrentPage();
};

window.updateCastleCategoryFilter = (value) => {
  saveCategoryFilter(value);
  window.renderCurrentPage();
};