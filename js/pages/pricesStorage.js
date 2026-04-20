import { appState, savePrice, saveStorage } from "../state.js";
import { fetchCommunityPrices, getCommunityPricesAge, bulkSubmitPrices } from "../communityPrices.js";
import { getPriceSource, setPriceSource, SOURCE_STYLES } from "./pricesStorage/priceSource.js";
import { isPro, userHasRole } from "../auth.js";
import { categories, allItems } from "../data/categories.js";
import { escapeHtml, jsEscape, formatGold } from "../utils.js";
import { STALE_DAYS } from "./pricesStorage/constants.js";
import {
  getWizardState,
  saveWizardState,
  clearWizardState,
  getSafeWizardIndex
} from "./pricesStorage/wizardState.js";
import {
  markPriceUpdated,
  getItemLastUpdated,
  getDaysSince
} from "./pricesStorage/priceTracking.js";
import { decimalToGscParts, gscToDecimal } from "./pricesStorage/currency.js";
import { getCategoryOptions, getFilteredItems } from "./pricesStorage/filters.js";

// ─── CUSTOM ITEMS ────────────────────────────────────────────────────────────
// Stored separately from categories.js so built-in items can never be deleted.
// Shape: { [itemName]: { category: string } }

const CUSTOM_ITEMS_KEY = "customItems";

function getCustomItems() {
  try {
    return JSON.parse(localStorage.getItem(CUSTOM_ITEMS_KEY) || "{}");
  } catch { return {}; }
}

function saveCustomItems(data) {
  localStorage.setItem(CUSTOM_ITEMS_KEY, JSON.stringify(data));
}

function addCustomItem(name, category, nwCategory) {
  const data = getCustomItems();
  data[name] = { category, nwCategory: nwCategory || "Uncategorized" };
  saveCustomItems(data);
}

function deleteCustomItem(name) {
  const data = getCustomItems();
  delete data[name];
  saveCustomItems(data);
  // Also clear price and storage for this item
  savePrice(name, 0);
  saveStorage(name, 0);
}

const SEEDED_CUSTOM_ITEMS_KEY = "customItemsSeeded_v1";
const SEED_CUSTOM_ITEMS = [
  "Medicinal Powder", "Onyx Archeum", "Hibiscus", "Silver Lily",
  "Ginkgo Leaf", "Impatiens", "Crimson Petunia", "Bay Leaf", "Pansy", "Watermelon"
];

function seedCustomItems() {
  if (localStorage.getItem(SEEDED_CUSTOM_ITEMS_KEY)) return;
  const data = getCustomItems();
  for (const name of SEED_CUSTOM_ITEMS) {
    if (!data[name]) data[name] = { category: "Custom Items", nwCategory: "Uncategorized" };
  }
  saveCustomItems(data);
  localStorage.setItem(SEEDED_CUSTOM_ITEMS_KEY, "1");
}

// Build a merged allItems list that includes custom items, applies overrides, sorted A-Z
function getAllItemsWithCustom() {
  const custom    = getCustomItems();
  const overrides = getCategoryOverrides();

  const builtIn = allItems.map(row => {
    const override = overrides[row.item];
    return {
      item: row.item,
      category: override?.category || row.category,
      nwCategory: override?.nwCategory || null,
      isCustom: false
    };
  });

  const builtInNames = new Set(builtIn.map(r => r.item));

  const customRows = Object.entries(custom).map(([item, meta]) => {
    const override = overrides[item];
    return {
      item,
      category: override?.category || meta.category,
      nwCategory: override?.nwCategory || meta.nwCategory || "Uncategorized",
      isCustom: true
    };
  }).filter(r => !builtInNames.has(r.item));

  // Merge and sort A-Z by item name
  return [...builtIn, ...customRows].sort((a, b) =>
    a.item.toLowerCase().localeCompare(b.item.toLowerCase())
  );
}

// ─── CATEGORY OVERRIDES ──────────────────────────────────────────────────────
// Lets users reassign any item (built-in or custom) to a different category.
// Shape: { [itemName]: { category: string, nwCategory: string } }

const CATEGORY_OVERRIDE_KEY = "categoryOverrides";

function getCategoryOverrides() {
  try { return JSON.parse(localStorage.getItem(CATEGORY_OVERRIDE_KEY) || "{}"); }
  catch { return {}; }
}

function saveCategoryOverride(itemName, category, nwCategory) {
  const overrides = getCategoryOverrides();
  overrides[itemName] = { category, nwCategory: nwCategory || "Uncategorized" };
  localStorage.setItem(CATEGORY_OVERRIDE_KEY, JSON.stringify(overrides));
}

// ─── CUSTOM CATEGORIES ───────────────────────────────────────────────────────

const CUSTOM_CATS_KEY = "customCategories";

function getCustomCategories() {
  try { return JSON.parse(localStorage.getItem(CUSTOM_CATS_KEY) || "[]"); }
  catch { return []; }
}

function saveCustomCategory(name) {
  const existing = getCustomCategories();
  if (!existing.includes(name)) {
    existing.push(name);
    existing.sort();
    localStorage.setItem(CUSTOM_CATS_KEY, JSON.stringify(existing));
  }
}

function getAllCategoryNames() {
  const builtIn = Object.keys(categories);
  const custom  = getCustomCategories();
  return [...new Set([...builtIn, ...custom])].sort();
}

// ─────────────────────────────────────────────────────────────────────────────

function getVisibleItems() {
  return getFilteredItems(getAllItemsWithCustom(), appState.filters.search, appState.filters.category);
}

function buildWizardItems() {
  return getVisibleItems().map((row) => row.item);
}

function getCurrentWizardItem() {
  const state = getWizardState();
  if (!state.active || !Array.isArray(state.items) || !state.items.length) {
    return "";
  }

  const index = getSafeWizardIndex(state);
  if (index >= state.items.length) {
    return "";
  }

  return state.items[index] || "";
}

function formatWizardProgress() {
  const state = getWizardState();
  if (!state.active || !Array.isArray(state.items) || !state.items.length) {
    return "";
  }

  const current = Math.min(getSafeWizardIndex(state) + 1, state.items.length);
  return `${current} / ${state.items.length}`;
}

function renderCategoryButtons() {
  const allCats = ["All", ...getAllCategoryNames()];
  return `
    <div class="section-nav" style="margin-top:12px;">
      ${allCats.map((category) => {
        const isActive = appState.filters.category === category;
        return `
          <button
            type="button"
            class="section-link${isActive ? " active-filter" : ""}"
            onclick="window.updateCategoryFilter('${jsEscape(category)}')"
          >
            ${escapeHtml(category)}
          </button>
        `;
      }).join("")}
    </div>
  `;
}

function renderAddItemModal() {
  return `
    <div id="addItemModal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:1000;align-items:center;justify-content:center;">
      <div class="card" style="width:420px;max-width:90vw;margin:0;padding:24px;">
        <h3 style="margin:0 0 16px 0;">Add Custom Item</h3>

        <div style="display:flex;flex-direction:column;gap:12px;">
          <div>
            <label style="display:block;font-weight:600;margin-bottom:4px;">Item Name</label>
            <input
              id="customItemName"
              type="text"
              placeholder="e.g. Prismatic Diamond"
              style="width:100%;box-sizing:border-box;"
              oninput="window.onCustomItemNameInput(this.value)"
            >
            <div id="customItemNameError" style="color:#f87171;font-size:12px;margin-top:4px;display:none;"></div>
          </div>

          <div>
            <label style="display:block;font-weight:600;margin-bottom:4px;">Category <span style="color:#94a3b8;font-weight:400;">(Prices &amp; Storage)</span></label>
            <select id="customItemCategory" style="width:100%;box-sizing:border-box;" onchange="window.handleModalCatChange(this.value, 'customItemCategoryNew')">
              ${getAllCategoryNames().map(cat =>
                `<option value="${escapeHtml(cat)}">${escapeHtml(cat)}</option>`
              ).join("")}
              <option value="__new__">＋ Create new category...</option>
            </select>
            <input id="customItemCategoryNew" type="text" placeholder="New category name..."
              style="width:100%;box-sizing:border-box;margin-top:6px;display:none;">
          </div>

          <div>
            <label style="display:block;font-weight:600;margin-bottom:4px;">Net Worth Category</label>
            <select id="customItemNWCategory" style="width:100%;box-sizing:border-box;">
              <option value="Uncategorized">📦 Uncategorized</option>
              <option value="Raw Farmables">🌾 Raw Farmables</option>
              <option value="Archeum">✨ Archeum</option>
              <option value="Gems">💎 Gems</option>
              <option value="Ingots">⚙️ Ingots</option>
              <option value="Craft Components">🔧 Craft Components</option>
              <option value="Boss / Rare Drops">🐉 Boss / Rare Drops</option>
              <option value="Points / Currency">🪙 Points / Currency</option>
              <option value="Regrade Items">⚔️ Regrade Items</option>
            </select>
          </div>

          <div>
            <label style="display:block;font-weight:600;margin-bottom:4px;">Starting Quantity <span style="color:#94a3b8;font-weight:400;">(optional)</span></label>
            <input
              id="customItemQty"
              type="number"
              min="0"
              placeholder="0"
              style="width:100%;box-sizing:border-box;"
            >
          </div>

          <div>
            <label style="display:block;font-weight:600;margin-bottom:4px;">Market Price <span style="color:#94a3b8;font-weight:400;">(optional — decimal gold e.g. 0.1250)</span></label>
            <input
              id="customItemPrice"
              type="number"
              min="0"
              step="0.0001"
              placeholder="0.0000"
              style="width:100%;box-sizing:border-box;"
            >
            <div id="customItemPriceHint" style="color:#94a3b8;font-size:12px;margin-top:4px;"></div>
          </div>
        </div>

        <div style="display:flex;gap:10px;margin-top:20px;justify-content:flex-end;">
          <button type="button" onclick="window.closeAddItemModal()">Cancel</button>
          <button type="button" onclick="window.confirmAddCustomItem()" style="background:#1a3a1a;border-color:#2d6a2d;color:#86efac;">
            Add Item
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderWizardCard() {
  const state = getWizardState();

  if (!state.active) {
    return "";
  }

  const currentItem = getCurrentWizardItem();

  if (!currentItem) {
    return `
      <div class="card">
        <h3>Market Price Wizard</h3>
        <p class="notice">Wizard complete.</p>
        <div class="wizard-actions" style="display:flex;gap:10px;flex-wrap:wrap;">
          <button type="button" onclick="window.stopPriceWizard()">Close</button>
        </div>
      </div>
    `;
  }

  const existingPrice = Number(appState.prices[currentItem] || 0);
  const parts = decimalToGscParts(existingPrice);

  return `
    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap;">
        <div>
          <h3 style="margin:0;">Market Price Wizard</h3>
          <p class="notice" style="margin:6px 0 0 0;">${escapeHtml(formatWizardProgress())}</p>
        </div>
        <div class="wizard-actions" style="display:flex;gap:10px;flex-wrap:wrap;">
          <button type="button" onclick="window.skipPriceWizardItem()">Skip</button>
          <button type="button" onclick="window.stopPriceWizard()">Stop</button>
        </div>
      </div>

      <div style="margin-top:14px;">
        <label style="display:block;font-weight:700;margin-bottom:8px;">
          How much is ${escapeHtml(currentItem)} on the market?
        </label>

        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
          <input
            id="wizardGoldInput"
            type="number"
            min="0"
            step="1"
            value="${parts.gold}"
            placeholder="0"
            onkeydown="window.handleWizardInputKeydown(event)"
            style="width:90px;"
          >
          <span>g</span>

          <input
            id="wizardSilverInput"
            type="number"
            min="0"
            max="99"
            step="1"
            value="${parts.silver}"
            placeholder="0"
            onkeydown="window.handleWizardInputKeydown(event)"
            style="width:90px;"
          >
          <span>s</span>

          <input
            id="wizardCopperInput"
            type="number"
            min="0"
            max="99"
            step="1"
            value="${parts.copper}"
            placeholder="0"
            onkeydown="window.handleWizardInputKeydown(event)"
            style="width:90px;"
          >
          <span>c</span>

          <button type="button" onclick="window.saveWizardPriceAndNext()">Save &amp; Next</button>
        </div>
      </div>
    </div>
  `;
}

function renderPriceStaleNotice(filtered) {
  const pricedRows = filtered.filter((row) => Number(appState.prices[row.item] || 0) > 0);

  if (!pricedRows.length) {
    return `
      <div class="card">
        <p class="notice" style="margin:0;">
          No prices have been tracked yet. Start the wizard to fill market prices quickly.
        </p>
      </div>
    `;
  }

  let staleCount = 0;
  let oldestDays = 0;

  pricedRows.forEach((row) => {
    const updatedAt = getItemLastUpdated(row.item);
    const days = getDaysSince(updatedAt);

    if (days === null || days >= STALE_DAYS) {
      staleCount += 1;
      oldestDays = Math.max(oldestDays, days ?? STALE_DAYS);
    }
  });

  if (!staleCount) {
    return `
      <div class="card">
        <p class="notice" style="margin:0;">
          Prices look fresh. No tracked prices are older than ${STALE_DAYS} days.
        </p>
      </div>
    `;
  }

  return `
    <div class="card">
      <p class="notice" style="margin:0;">
        ${staleCount} priced item${staleCount === 1 ? "" : "s"} ${staleCount === 1 ? "is" : "are"} older than ${STALE_DAYS} days${oldestDays ? ` (oldest: ${oldestDays} day${oldestDays === 1 ? "" : "s"})` : ""}.
        You may want to refresh prices with the wizard.
      </p>
      <div style="margin-top:10px;">
        <button type="button" onclick="window.startPriceWizard()">Start Price Wizard</button>
      </div>
    </div>
  `;
}

export function renderPricesStoragePage() {
  seedCustomItems();
  const filtered = getVisibleItems();

  let totalStorage = 0;
  let pricedItems = 0;
  let totalStashValue = 0;
  const grouped = {};

  filtered.forEach(({ item, category, isCustom }) => {
    if (!grouped[category]) grouped[category] = [];

    const storage = Number(appState.storage[item] || 0);
    const price = Number(appState.prices[item] || 0);
    const itemValue = storage * price;
    const updatedAt = getItemLastUpdated(item);
    const daysOld = getDaysSince(updatedAt);

    totalStorage += storage;
    totalStashValue += itemValue;
    if (price > 0) pricedItems += 1;

    grouped[category].push({
      item,
      category,
      isCustom: Boolean(isCustom),
      storage,
      price,
      itemValue,
      updatedAt,
      daysOld
    });
  });

  const communityCache = isPro() ? (() => {
    try { return JSON.parse(localStorage.getItem('communityPrices') || '{}'); } catch { return {}; }
  })() : {};

  // Category display order — pinned categories first, Scanned/Custom always last
  const CATEGORY_ORDER = [
    "Basic Materials",
    "Advanced Materials",
    "Vocation Plants",
    "Gems",
    "Ingots",
    "Processed Materials",
    "Archeum",
    "Points & Currency",
    "Regrade & Scrolls",
  ];
  const BOTTOM_CATS = ["Custom Items", "Scanned Items"];

  const sortedCategories = Object.keys(grouped).sort((a, b) => {
    const aBottom = BOTTOM_CATS.includes(a);
    const bBottom = BOTTOM_CATS.includes(b);
    if (aBottom !== bBottom) return aBottom ? 1 : -1;
    const aIdx = CATEGORY_ORDER.indexOf(a);
    const bIdx = CATEGORY_ORDER.indexOf(b);
    if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
    if (aIdx !== -1) return -1;
    if (bIdx !== -1) return 1;
    return a.localeCompare(b);
  });

  let rowsHtml = "";

  sortedCategories.forEach((category) => {
    rowsHtml += `
      <tr class="category-row">
        <td colspan="${isPro() ? 9 : 8}">${escapeHtml(category)}</td>
      </tr>
    `;

    grouped[category].forEach((row) => {
      const staleText =
        row.price > 0
          ? row.daysOld === null
            ? "Not timestamped"
            : `${row.daysOld}d ago`
          : "";

      const customMarker = row.isCustom
        ? `<span style="font-size:10px;color:#93c5fd;margin-left:4px;opacity:0.7;" title="Custom item">✦</span>`
        : "";

      const deleteBtn = row.isCustom
        ? `<button
            type="button"
            onclick="window.removeCustomItem('${jsEscape(row.item)}')"
            style="padding:2px 7px;font-size:11px;background:#3a1a1a;border-color:#6a2d2d;color:#fca5a5;line-height:1;"
            title="Remove custom item"
          >×</button>`
        : "";

      const _knownCats = getAllCategoryNames();
      const _catRecognized = _knownCats.includes(row.category);
      const categoryDropdown = `
        <select
          style="font-size:12px;padding:2px 4px;max-width:160px;"
          onchange="window.changeItemCategory('${jsEscape(row.item)}', this.value)"
        >
          <option value=""${!_catRecognized ? " selected" : ""}>— None —</option>
          ${_knownCats.map(cat =>
            `<option value="${escapeHtml(cat)}"${cat === row.category ? " selected" : ""}>${escapeHtml(cat)}</option>`
          ).join("")}
          <option value="__new__">＋ New category...</option>
        </select>
      `;

      // Source badge
      const source = getPriceSource(row.item);
      const srcStyle = SOURCE_STYLES[source] || SOURCE_STYLES.manual;
      const sourceBadge = row.price > 0
        ? `<span style="font-size:10px;padding:1px 5px;border-radius:4px;
            background:${srcStyle.color}22;color:${srcStyle.color};
            border:1px solid ${srcStyle.color}44;margin-left:4px;"
           title="Price source: ${srcStyle.label}">${srcStyle.label}</span>`
        : '';

      // Community price diff
      const communityEntry = communityCache[row.item];
      const communityPrice = communityEntry?.price ?? null;
      let communityCell = '<span style="color:#3d4f64;">—</span>';
      if (communityPrice !== null) {
        if (row.price > 0) {
          const diff = communityPrice - row.price;
          const diffPct = ((diff / row.price) * 100).toFixed(1);
          const diffColor = diff > 0 ? '#86efac' : diff < 0 ? '#f87171' : '#566174';
          const sign = diff > 0 ? '+' : '';
          communityCell = `<span style="color:#eef2f7;">${communityPrice.toFixed(4)}</span>
            <span style="font-size:11px;color:${diffColor};margin-left:4px;">${sign}${diffPct}%</span>`;
        } else {
          communityCell = `<span style="color:#eef2f7;">${communityPrice.toFixed(4)}</span>`;
        }
      }

      // History button
      const historyBtn = isPro()
        ? `<button type="button"
            onclick="window.showPriceHistory('${jsEscape(row.item)}')"
            style="padding:2px 6px;font-size:10px;background:#1a2535;border-color:#2a3a52;color:#566174;"
            title="View price history">📈</button>`
        : '';

      rowsHtml += `
        <tr>
          <td>${escapeHtml(row.item)}${customMarker}</td>
          <td>${categoryDropdown}</td>
          <td>
            <input
              type="number"
              min="0"
              value="${row.storage}"
              onchange="window.updateStorage('${jsEscape(row.item)}', this.value)"
            >
          </td>
          <td>
            <span
              style="color:#ffd166;cursor:pointer;border-bottom:1px dashed #5a4a10;"
              title="Click to edit price"
              onclick="window.openInlinePriceEdit('${jsEscape(row.item)}', ${row.price || 0})"
            >${row.price ? row.price.toFixed(4) : '—'}</span>
            ${sourceBadge}
          </td>
          <td>${communityCell}</td>
          <td class="price-text">${formatGold(row.itemValue)}</td>
          <td>${escapeHtml(staleText)}</td>
          <td style="text-align:center;">${historyBtn}</td>
          <td style="text-align:center;">${deleteBtn}</td>
        </tr>
      `;
    });
  });

  return `
    <div class="summary-grid">
      <div class="summary-box">
        <div class="summary-label">Total Stash Value</div>
        <div class="summary-value price-text">${formatGold(totalStashValue)}</div>
      </div>
      <div class="summary-box">
        <div class="summary-label">Priced Items</div>
        <div class="summary-value">${pricedItems}</div>
      </div>
      <div class="summary-box">
        <div class="summary-label">Total In Storage</div>
        <div class="summary-value blue-text">${totalStorage.toLocaleString()}</div>
      </div>
    </div>

    ${renderPriceStaleNotice(filtered)}

    <div class="card">
      <h2>Prices & Storage</h2>

      <div class="filters">
        <input
          id="pricesStorageSearch"
          type="text"
          placeholder="Search item..."
          value="${escapeHtml(appState.filters.search)}"
          oninput="window.updateSearch(this.value, this.selectionStart)"
        >
        <button type="button" onclick="window.startPriceWizard()">Start Price Wizard</button>
        ${isPro() ? `
          <button type="button" onclick="window.triggerAHImport()" style="background:#1a3a1a; border-color:#2d6a2d; color:#86efac;">
            📥 Import AH Prices
          </button>
        ` : `
          <button type="button" disabled style="background:#1a1a1a; border-color:#2a2a2a; color:#3d4f64; cursor:not-allowed;"
            title="Pro feature — upgrade to import AH prices">
            📥 Import AH Prices [PRO]
          </button>
        `}
        <button type="button" onclick="window.triggerInventoryImport()" style="background:#2a1a3a; border-color:#5a2d8a; color:#d8b4fe;" title="Import inventory quantities from InventoryScanner addon">
          🎒 Import Inventory
        </button>
        <button type="button" onclick="window.exportScanItems()" style="background:#1a2a3a; border-color:#2d5a8a; color:#93c5fd;" title="Write scan_items.csv to addon folder for AHScanner">
          📤 Export Scan List
        </button>
        <button type="button" onclick="window.openAddItemModal()"
          style="background:#1a2a3a; border-color:#2d4a6a; color:${isPro() ? '#93c5fd' : '#566174'};"
          title="${isPro() ? '' : 'Pro feature — upgrade to add custom items'}">
          ➕ Add Custom Item${isPro() ? '' : ' [PRO]'}
        </button>
        <button type="button" onclick="window.zeroOutStorage()"
          style="background:#2a1a1a; border-color:#6a2d2d; color:#f87171;"
          title="Set all In Storage quantities to 0">
          🗑 Zero Storage
        </button>
        <input type="file" id="ahCsvInput" accept=".csv" style="display:none;" onchange="window.handleAHCsvFile(this)">
        <span id="ahImportStatus" style="color:#86efac; font-size:13px; align-self:center;"></span>
        ${userHasRole('staff') ? `
          <button type="button" id="syncCommunityBtn" onclick="window.syncCommunityPrices()"
            style="background:#1a2a3a; border-color:#2d5a8a; color:#93c5fd;"
            title="Force pull latest prices from the community database">
            ☁ Force Sync
          </button>
          <span id="syncCommunityStatus" style="font-size:12px; color:#566174; align-self:center;">
            ${getCommunityPricesAge() !== null ? `Last synced ${getCommunityPricesAge()}m ago` : 'Never synced'}
          </span>
        ` : ''}
        ${userHasRole('dev') ? `
          <button type="button" id="devPushPricesBtn" onclick="window.devPushAllPrices()"
            style="background:#1a2a1a; border:1px solid #2a5a2a; color:#86efac;"
            title="[DEV] Submit all local prices to Supabase">
            ⬆ Dev: Push All Prices
          </button>
          <span id="devPushStatus" style="font-size:12px; color:#566174; align-self:center;"></span>
        ` : ''}
      </div>

      ${renderCategoryButtons()}
    </div>

    ${renderWizardCard()}

    <div class="card">
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Category</th>
              <th class="editable-col">In Storage</th>
              <th class="editable-col">My Price</th>
              ${isPro() ? '<th>Community Price</th>' : ''}
              <th>Stash Value</th>
              <th>Price Updated</th>
              <th style="width:30px;"></th>
              <th style="width:30px;"></th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml || `<tr><td colspan="7">No matching items.</td></tr>`}
          </tbody>
        </table>
      </div>
    </div>

    ${renderAddItemModal()}
  `;
}

// ─── BULK PUSH PROMPT (Staff+) ────────────────────────────────────────────────

function showBulkPushPrompt(count) {
  const existing = document.getElementById('bulk-push-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'bulk-push-modal';
  modal.style.cssText = `position:fixed;inset:0;background:rgba(0,0,0,0.6);
    display:flex;align-items:center;justify-content:center;z-index:9999;`;
  modal.innerHTML = `
    <div style="background:#1a2535;border:1px solid #2a3a52;border-radius:12px;
      padding:24px;min-width:320px;max-width:420px;">
      <h3 style="margin:0 0 10px;color:#eef2f7;">Push to Community?</h3>
      <p style="color:#94a3b8;font-size:13px;margin:0 0 20px;">
        You imported <strong style="color:#eef2f7;">${count} prices</strong> from your AH scan.
        Push them to the community database so other Pro users get updated prices?
      </p>
      <div style="display:flex;gap:10px;">
        <button id="bulk-push-confirm" style="flex:1;padding:9px;background:#1a2a3a;
          border:1px solid #2d5a8a;color:#93c5fd;border-radius:8px;font-weight:600;cursor:pointer;">
          Push to Community
        </button>
        <button onclick="document.getElementById('bulk-push-modal')?.remove()"
          style="flex:1;padding:9px;background:#1e2535;border:1px solid #2a3a52;
          color:#566174;border-radius:8px;cursor:pointer;">
          Skip
        </button>
      </div>
      <p id="bulk-push-status" style="font-size:12px;margin:12px 0 0;color:#566174;"></p>
    </div>
  `;
  document.body.appendChild(modal);

  document.getElementById('bulk-push-confirm').addEventListener('click', async () => {
    const btn    = document.getElementById('bulk-push-confirm');
    const status = document.getElementById('bulk-push-status');
    btn.disabled = true;
    btn.textContent = 'Pushing…';
    const result = await bulkSubmitPrices(window.__pendingBulkPush || {});
    if (result.ok) {
      if (status) status.style.color = '#86efac';
      if (status) status.textContent = `Done — ${result.accepted} accepted, ${result.gray} gray, ${result.rejected} rejected`;
      btn.textContent = 'Pushed ✓';
      setTimeout(() => document.getElementById('bulk-push-modal')?.remove(), 2500);
    } else {
      if (status) status.style.color = '#f87171';
      if (status) status.textContent = result.reason || 'Push failed';
      btn.disabled = false;
      btn.textContent = 'Retry';
    }
  });
}

// ─── PRICE HISTORY MODAL ──────────────────────────────────────────────────────

window.showPriceHistory = async function(itemName) {
  const existing = document.getElementById('price-history-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'price-history-modal';
  modal.style.cssText = `position:fixed;inset:0;background:rgba(0,0,0,0.6);
    display:flex;align-items:center;justify-content:center;z-index:9999;`;
  modal.innerHTML = `
    <div style="background:#1a2535;border:1px solid #2a3a52;border-radius:12px;
      padding:24px;min-width:480px;max-width:600px;max-height:80vh;overflow-y:auto;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
        <h3 style="margin:0;color:#eef2f7;">Price History — ${escapeHtml(itemName)}</h3>
        <button onclick="document.getElementById('price-history-modal')?.remove()"
          style="background:none;border:none;color:#566174;font-size:18px;cursor:pointer;">✕</button>
      </div>
      <div id="price-history-body" style="color:#566174;font-size:13px;">Loading…</div>
    </div>
  `;
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
  document.body.appendChild(modal);

  if (!window.electronAPI?.getItemPriceHistory) {
    document.getElementById('price-history-body').innerHTML = '<p style="color:#f87171;">API not available.</p>';
    return;
  }

  const result = await window.electronAPI.getItemPriceHistory(itemName);
  const body = document.getElementById('price-history-body');
  if (!body) return;

  if (!result?.ok || !result.history?.length) {
    body.innerHTML = '<p>No price history found for this item yet.</p>';
    return;
  }

  const statusColor = { accepted: '#86efac', gray: '#fcd34d', rejected: '#f87171', resolved: '#566174' };
  const rows = result.history.map(h => {
    const date = new Date(h.submitted_at).toLocaleDateString();
    const variance = h.variance_pct != null ? `${h.variance_pct.toFixed(1)}%` : '—';
    const color = statusColor[h.status] || '#566174';
    return `
      <tr>
        <td style="padding:8px 10px;color:#cbd5e1;">${date}</td>
        <td style="padding:8px 10px;color:#ffd166;">${h.submitted_price?.toFixed(4) ?? '—'}</td>
        <td style="padding:8px 10px;color:#94a3b8;">${variance}</td>
        <td style="padding:8px 10px;"><span style="color:${color};font-size:12px;">${h.status}</span></td>
        <td style="padding:8px 10px;color:#566174;">${escapeHtml(h.discord_name || 'Unknown')}</td>
      </tr>
    `;
  }).join('');

  body.innerHTML = `
    <table style="width:100%;border-collapse:collapse;font-size:13px;min-width:0;">
      <thead>
        <tr style="border-bottom:1px solid #2a3a52;">
          <th style="padding:6px 10px;text-align:left;color:#566174;font-size:11px;text-transform:uppercase;">Date</th>
          <th style="padding:6px 10px;text-align:left;color:#566174;font-size:11px;text-transform:uppercase;">Price</th>
          <th style="padding:6px 10px;text-align:left;color:#566174;font-size:11px;text-transform:uppercase;">Variance</th>
          <th style="padding:6px 10px;text-align:left;color:#566174;font-size:11px;text-transform:uppercase;">Status</th>
          <th style="padding:6px 10px;text-align:left;color:#566174;font-size:11px;text-transform:uppercase;">Submitted By</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
};

window.syncCommunityPrices = async function() {
  const btn    = document.getElementById('syncCommunityBtn');
  const status = document.getElementById('syncCommunityStatus');
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Syncing…'; }
  if (status) status.textContent = 'Syncing…';

  const result = await fetchCommunityPrices();

  if (btn) { btn.disabled = false; btn.textContent = '☁ Sync Community Prices'; }

  if (result.ok) {
    if (status) status.textContent = `Synced — ${result.applied} price${result.applied === 1 ? '' : 's'} updated`;
    if (result.applied > 0) window.renderCurrentPage();
  } else {
    if (status) { status.style.color = '#f87171'; status.textContent = `Sync failed: ${result.reason}`; }
  }
};

window.devPushAllPrices = async function() {
  const btn    = document.getElementById('devPushPricesBtn');
  const status = document.getElementById('devPushStatus');
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Pushing…'; }
  if (status) { status.style.color = '#566174'; status.textContent = 'Submitting…'; }

  const prices = appState.prices || {};
  const items  = Object.entries(prices)
    .filter(([, price]) => Number(price) > 0)
    .map(([item_name, price]) => ({ item_name, price: Number(price) }));

  if (!items.length) {
    if (btn) { btn.disabled = false; btn.textContent = '⬆ Dev: Push All Prices'; }
    if (status) { status.style.color = '#f87171'; status.textContent = 'No prices to push.'; }
    return;
  }

  try {
    const result = await window.electronAPI.bulkSubmitCommunityPrices(items);
    if (btn) { btn.disabled = false; btn.textContent = '⬆ Dev: Push All Prices'; }
    if (result?.ok) {
      if (status) { status.style.color = '#86efac'; status.textContent = `Pushed ${items.length} prices.`; }
    } else {
      if (status) { status.style.color = '#f87171'; status.textContent = `Failed: ${result?.error || 'unknown'}`; }
    }
  } catch(e) {
    if (btn) { btn.disabled = false; btn.textContent = '⬆ Dev: Push All Prices'; }
    if (status) { status.style.color = '#f87171'; status.textContent = `Error: ${e.message}`; }
  }
};

window.updateSearch = function(value, cursorPosition = null) {
  appState.filters.search = value;
  window.renderCurrentPage();

  setTimeout(() => {
    const input = document.getElementById("pricesStorageSearch");
    if (!input) return;

    input.focus();

    const safePos = typeof cursorPosition === "number" ? cursorPosition : value.length;
    try {
      input.setSelectionRange(safePos, safePos);
    } catch (error) {
      // ignore selection issues
    }
  }, 0);
};

window.updateCategoryFilter = function(value) {
  appState.filters.category = value;
  window.renderCurrentPage();
};

window.updateStorage = function(item, value) {
  saveStorage(item, value);
  window.renderCurrentPage();
};

window.updatePrice = function(item, value) {
  savePrice(item, value);
  markPriceUpdated(item);
  setPriceSource(item, 'manual');
  window.renderCurrentPage();
};

window.openInlinePriceEdit = function(item, currentPrice) {
  // Remove any existing inline editor
  document.getElementById('inline-price-modal')?.remove();

  const modal = document.createElement('div');
  modal.id = 'inline-price-modal';
  modal.style.cssText = `position:fixed;inset:0;background:rgba(0,0,0,0.55);
    display:flex;align-items:center;justify-content:center;z-index:9999;`;

  modal.innerHTML = `
    <div style="background:#1a2535;border:1px solid #2a3a52;border-radius:12px;
      padding:24px;width:320px;max-width:95vw;">
      <div style="font-size:13px;color:#8d99ab;margin-bottom:6px;">Set price for</div>
      <div style="font-weight:700;color:#eef2f7;font-size:15px;margin-bottom:18px;">${escapeHtml(item)}</div>
      <input id="inline-price-input" type="number" min="0" step="0.0001"
        value="${currentPrice > 0 ? currentPrice : ''}"
        placeholder="Price in gold (e.g. 1.2500)"
        style="width:100%;box-sizing:border-box;padding:9px 12px;
          background:#0f1923;border:1px solid #2a3a52;color:#ffd166;
          border-radius:8px;font-size:14px;margin-bottom:16px;font-family:inherit;"
      >
      <div style="display:flex;gap:8px;">
        <button onclick="window._confirmInlinePrice('${jsEscape(item)}')"
          style="flex:1;padding:9px;background:#1a3a1a;border:1px solid #2d6a2d;
          color:#86efac;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;">
          Save
        </button>
        <button onclick="document.getElementById('inline-price-modal')?.remove()"
          style="flex:1;padding:9px;background:#1e2535;border:1px solid #2a3a52;
          color:#566174;border-radius:8px;font-size:13px;cursor:pointer;">
          Cancel
        </button>
      </div>
    </div>
  `;

  // Close on backdrop click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });

  document.body.appendChild(modal);
  setTimeout(() => document.getElementById('inline-price-input')?.focus(), 50);

  // Enter to save
  document.getElementById('inline-price-input')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') window._confirmInlinePrice(item);
    if (e.key === 'Escape') modal.remove();
  });
};

window._confirmInlinePrice = function(item) {
  const input = document.getElementById('inline-price-input');
  if (!input) return;
  const val = parseFloat(input.value);
  if (!isNaN(val) && val >= 0) {
    savePrice(item, val);
    markPriceUpdated(item);
    setPriceSource(item, 'manual');
  }
  document.getElementById('inline-price-modal')?.remove();
  window.renderCurrentPage();
};

window.startPriceWizard = function() {
  const items = buildWizardItems();

  if (!items.length) {
    return;
  }

  saveWizardState({
    active: true,
    items,
    currentIndex: 0
  });

  window.renderCurrentPage();
};

window.stopPriceWizard = function() {
  clearWizardState();
  window.renderCurrentPage();
};

window.skipPriceWizardItem = function() {
  const state = getWizardState();

  if (!state.active || !Array.isArray(state.items) || !state.items.length) {
    return;
  }

  const nextIndex = getSafeWizardIndex(state) + 1;

  if (nextIndex >= state.items.length) {
    clearWizardState();
  } else {
    state.currentIndex = nextIndex;
    saveWizardState(state);
  }

  window.renderCurrentPage();
};

window.saveWizardPriceAndNext = function() {
  const currentItem = getCurrentWizardItem();

  if (!currentItem) {
    return;
  }

  const goldInput = document.getElementById("wizardGoldInput");
  const silverInput = document.getElementById("wizardSilverInput");
  const copperInput = document.getElementById("wizardCopperInput");

  const gold = goldInput ? goldInput.value : 0;
  const silver = silverInput ? silverInput.value : 0;
  const copper = copperInput ? copperInput.value : 0;

  const decimalPrice = gscToDecimal(gold, silver, copper);

  savePrice(currentItem, decimalPrice);
  markPriceUpdated(currentItem);

  const state = getWizardState();
  const nextIndex = getSafeWizardIndex(state) + 1;

  if (nextIndex >= state.items.length) {
    clearWizardState();
  } else {
    state.currentIndex = nextIndex;
    saveWizardState(state);
  }

  window.renderCurrentPage();
};

window.handleWizardInputKeydown = function(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    window.saveWizardPriceAndNext();
  }
};

window.triggerAHImport = async function() {
  if (!isPro()) return;
  const status = document.getElementById("ahImportStatus");

  // Try direct file read via Electron IPC first
  if (window.electronAPI?.readAHCsv) {
    if (status) status.textContent = "Reading from addon folder...";
    try {
      const result = await window.electronAPI.readAHCsv();
      if (result.ok && Object.keys(result.data).length > 0) {
        let count = 0;
        for (const [name, price] of Object.entries(result.data)) {
          if (price > 0) {
            savePrice(name, price);
            markPriceUpdated(name);
            setPriceSource(name, 'scan');
            count++;
          }
        }
        if (status) {
          status.textContent = `✓ Imported ${count} prices from addon folder`;
          setTimeout(() => { if (status) status.textContent = ""; }, 4000);
        }
        window.renderCurrentPage();
        if (count > 0) {
          if (userHasRole('dev') || userHasRole('admin')) {
            // Dev/admin: push authoritative prices silently
            const items = Object.entries(result.data)
              .filter(([, p]) => p > 0)
              .map(([item_name, price]) => ({ item_name, price }));
            window.electronAPI?.submitAuthoritativePrices?.(items)
              .then(r => { if (r?.ok) console.log(`[ah-import] Pushed ${r.pushed} authoritative prices`); })
              .catch(() => {});
          } else if (userHasRole('staff')) {
            window.__pendingBulkPush = result.data;
            showBulkPushPrompt(count);
          }
        }
        return;
      } else if (!result.ok) {
        // File not found - fall through to file picker
        if (status) status.textContent = "Addon file not found — use file picker";
        setTimeout(() => { if (status) status.textContent = ""; }, 3000);
      }
    } catch(e) {
      // Fall through to file picker
    }
  }

  // Fall back to file picker
  const input = document.getElementById("ahCsvInput");
  if (input) input.click();
};

// Handle file picker CSV import
window.handleAHCsvFile = function(input) {
  if (!isPro()) return;
  const file = input?.files?.[0];
  if (!file) return;
  const status = document.getElementById("ahImportStatus");
  const reader = new FileReader();
  reader.onload = function(e) {
    const text = e.target.result;
    const lines = text.split('\n').filter(l => l.trim());
    let count = 0;
    const imported = {};
    for (let i = 1; i < lines.length; i++) { // skip header
      const parts = lines[i].split(',');
      if (parts.length >= 2) {
        const name  = parts[0].trim();
        const price = parseFloat(parts[1].trim());
        if (name && price > 0) {
          savePrice(name, price);
          markPriceUpdated(name);
          setPriceSource(name, 'scan');
          imported[name] = price;
          count++;
        }
      }
    }
    if (status) {
      status.textContent = `✓ Imported ${count} prices`;
      setTimeout(() => { if (status) status.textContent = ""; }, 4000);
    }
    input.value = "";
    window.renderCurrentPage();
    if (count > 0) {
      if (userHasRole('dev') || userHasRole('admin')) {
        const items = Object.entries(imported)
          .filter(([, p]) => p > 0)
          .map(([item_name, price]) => ({ item_name, price }));
        window.electronAPI?.submitAuthoritativePrices?.(items)
          .then(r => { if (r?.ok) console.log(`[ah-import] Pushed ${r.pushed} authoritative prices`); })
          .catch(() => {});
      } else if (userHasRole('staff')) {
        window.__pendingBulkPush = imported;
        showBulkPushPrompt(count);
      }
    }
  };
  reader.readAsText(file);
};

// Export scan_items.csv to addon folder via Electron IPC
window.exportScanItems = async function() {
  const status = document.getElementById("ahImportStatus");

  if (!window.electronAPI?.writeScanItems) {
    if (status) {
      status.textContent = "⚠ Not running in Electron — cannot write file";
      setTimeout(() => { if (status) status.textContent = ""; }, 3000);
    }
    return;
  }

  const customItems = getCustomItems();
  const itemNames = [];
  for (const row of allItems) itemNames.push(row.item);
  for (const name of Object.keys(customItems)) {
    if (!itemNames.includes(name)) itemNames.push(name);
  }

  if (itemNames.length === 0) {
    if (status) {
      status.textContent = "No items to export";
      setTimeout(() => { if (status) status.textContent = ""; }, 2000);
    }
    return;
  }

  try {
    const result = await window.electronAPI.writeScanItems(itemNames);
    if (result.ok) {
      if (status) {
        status.textContent = `✓ Exported ${result.count} items to scan_items.csv`;
        setTimeout(() => { if (status) status.textContent = ""; }, 4000);
      }
    } else {
      if (status) {
        status.textContent = `✗ Export failed: ${result.error}`;
        setTimeout(() => { if (status) status.textContent = ""; }, 4000);
      }
    }
  } catch(e) {
    if (status) {
      status.textContent = `✗ Export error: ${e.message}`;
      setTimeout(() => { if (status) status.textContent = ""; }, 4000);
    }
  }
};

// ─── CUSTOM ITEM MODAL HANDLERS ───────────────────────────────────────────────

window.openAddItemModal = function() {
  if (!isPro()) {
    const statusEl = document.getElementById("ahImportStatus");
    if (statusEl) {
      statusEl.style.color = "#f59e0b";
      statusEl.textContent = "Custom items are a Pro feature — upgrade to unlock.";
      setTimeout(() => { statusEl.textContent = ""; statusEl.style.color = "#86efac"; }, 4000);
    }
    return;
  }
  const modal = document.getElementById("addItemModal");
  if (!modal) return;
  // Reset fields
  const nameEl = document.getElementById("customItemName");
  const qtyEl  = document.getElementById("customItemQty");
  const priceEl = document.getElementById("customItemPrice");
  const hintEl  = document.getElementById("customItemPriceHint");
  const errEl   = document.getElementById("customItemNameError");
  if (nameEl)  nameEl.value  = "";
  if (qtyEl)   qtyEl.value   = "";
  if (priceEl) priceEl.value = "";
  if (hintEl)  hintEl.textContent = "";
  if (errEl)   { errEl.textContent = ""; errEl.style.display = "none"; }
  modal.style.display = "flex";
  setTimeout(() => nameEl && nameEl.focus(), 50);
};

window.closeAddItemModal = function() {
  const modal = document.getElementById("addItemModal");
  if (modal) modal.style.display = "none";
};

window.onCustomItemNameInput = function(value) {
  const hintEl  = document.getElementById("customItemPriceHint");
  const priceEl = document.getElementById("customItemPrice");
  if (!hintEl || !priceEl) return;

  const trimmed = value.trim();
  if (!trimmed) { hintEl.textContent = ""; return; }

  // Check if item already has a price in appState
  const existingPrice = Number(appState.prices[trimmed] || 0);
  if (existingPrice > 0) {
    hintEl.textContent = `✓ Price already on file: ${existingPrice.toFixed(4)}g — will be used automatically`;
    hintEl.style.color = "#86efac";
    priceEl.value = "";
    priceEl.placeholder = existingPrice.toFixed(4);
  } else {
    hintEl.textContent = "No price on file — enter one manually or leave blank.";
    hintEl.style.color = "#94a3b8";
    priceEl.placeholder = "0.0000";
  }
};

window.confirmAddCustomItem = function() {
  const nameEl   = document.getElementById("customItemName");
  const catEl    = document.getElementById("customItemCategory");
  const newCatEl = document.getElementById("customItemCategoryNew");
  const qtyEl    = document.getElementById("customItemQty");
  const priceEl  = document.getElementById("customItemPrice");
  const errEl    = document.getElementById("customItemNameError");

  const name       = nameEl  ? nameEl.value.trim()  : "";
  const rawCat     = catEl   ? catEl.value           : "";
  const nwCategory = document.getElementById("customItemNWCategory")?.value || "Uncategorized";
  const qty        = qtyEl   ? Number(qtyEl.value)  : 0;
  const price      = priceEl ? parseFloat(priceEl.value) : 0;

  // Resolve category — handle create-new
  let category = rawCat;
  if (rawCat === "__new__") {
    category = newCatEl ? newCatEl.value.trim() : "";
    if (!category) {
      if (errEl) { errEl.textContent = "Please enter a name for the new category."; errEl.style.display = "block"; }
      return;
    }
    saveCustomCategory(category);
  }

  if (!name) {
    if (errEl) { errEl.textContent = "Item name is required."; errEl.style.display = "block"; }
    return;
  }

  const builtInNames = new Set(allItems.map(r => r.item.toLowerCase()));
  if (builtInNames.has(name.toLowerCase())) {
    if (errEl) {
      errEl.textContent = `"${name}" is already a built-in item. Update its quantity directly in the table.`;
      errEl.style.display = "block";
    }
    return;
  }

  const existing = getCustomItems();
  if (existing[name]) {
    if (errEl) {
      errEl.textContent = `"${name}" is already a custom item.`;
      errEl.style.display = "block";
    }
    return;
  }

  addCustomItem(name, category, nwCategory);
  if (qty > 0)   saveStorage(name, qty);
  if (price > 0) { savePrice(name, price); markPriceUpdated(name); }

  autoExportScanItems();
  window.closeAddItemModal();
  window.renderCurrentPage();
};

// Auto-export scan list silently whenever items change
// Fires in background — no UI feedback, no blocking
async function autoExportScanItems() {
  if (!window.electronAPI?.writeScanItems) return;
  try {
    const customItems = getCustomItems();
    const itemNames = [];
    for (const row of allItems) itemNames.push(row.item);
    for (const name of Object.keys(customItems)) {
      if (!itemNames.includes(name)) itemNames.push(name);
    }
    await window.electronAPI.writeScanItems(itemNames);
  } catch(e) {
    // Silent fail — don't bother user if file write fails
  }
}

// Handle modal category select showing/hiding the new-category input
window.handleModalCatChange = function(value, inputId) {
  const el = document.getElementById(inputId);
  if (!el) return;
  el.style.display = value === "__new__" ? "block" : "none";
  if (value === "__new__") el.focus();
};

// Change any item's category (built-in or custom) via inline dropdown
// Also saves override to Net Worth category if one is set
window.changeItemCategory = function(itemName, newCategory) {
  if (newCategory === "") return; // "— None —" selected — no-op
  if (newCategory === "__new__") {
    const name = prompt("Enter new category name:");
    if (!name || !name.trim()) {
      window.renderCurrentPage();
      return;
    }
    const trimmed = name.trim();
    saveCustomCategory(trimmed);
    // Save override with current NW category preserved
    const overrides = getCategoryOverrides();
    const currentNW = overrides[itemName]?.nwCategory || "Uncategorized";
    saveCategoryOverride(itemName, trimmed, currentNW);
    window.renderCurrentPage();
    return;
  }

  // For a regular category change, preserve existing NW category
  const overrides = getCategoryOverrides();
  const currentNW = overrides[itemName]?.nwCategory || "Uncategorized";
  saveCategoryOverride(itemName, newCategory, currentNW);
  window.renderCurrentPage();
};

window.removeCustomItem = function(name) {
  if (!confirm(`Remove "${name}" from Prices & Storage? This will also clear its quantity and price.`)) return;
  deleteCustomItem(name);
  autoExportScanItems();
  window.renderCurrentPage();
};
window.zeroOutStorage = function() {
  if (!confirm('Set all In Storage quantities to 0? This will reset your net worth. Prices are not affected.')) return;
  const keys = Object.keys(appState.storage);
  for (const item of keys) saveStorage(item, 0);
  window.renderCurrentPage();
};

// ─── IMPORT INVENTORY FROM INVSCANNER ────────────────────────────────────────

window.triggerInventoryImport = async function() {
  const status = document.getElementById("ahImportStatus");

  // Try direct IPC read first
  if (window.electronAPI?.readInventoryScan) {
    try {
      const result = await window.electronAPI.readInventoryScan();
      if (result.ok && Object.keys(result.data).length > 0) {
        handleInventoryData(result.data, status, 'Unknown');
        return;
      }
    } catch(e) {}
  }

  // Fallback to file picker
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.csv';
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const text = await file.text();
    const parsed = parseInventoryCsv(text);
    handleInventoryData(parsed, status);
  };
  input.click();
};

function parseInventoryCsv(text) {
  const lines = text.split('\n').filter(l => l.trim());
  const data  = {};
  let character = 'Unknown';
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(',');
    if (parts.length >= 2) {
      const name   = parts[0].trim();
      const total  = parseInt(parts[1].trim());
      const bag    = parseInt(parts[2]?.trim() || '0');
      const bank   = parseInt(parts[3]?.trim() || '0');
      const guild  = parseInt(parts[4]?.trim() || '0');
      const coffer = parseInt(parts[5]?.trim() || '0');
      if (parts[6]) character = parts[6].trim();
      if (name && !isNaN(total) && total > 0) {
        data[name] = { total, bag, bank, guild, coffer };
      }
    }
  }
  return { data, character };
}

function handleInventoryData(rawData, statusEl, character) {
  // rawData can be { data, character } from CSV parse, or plain object from IPC
  let data = rawData;
  let charName = character || 'Unknown';
  if (rawData && rawData.data) {
    data = rawData.data;
    charName = rawData.character || charName;
  }

  const items = Object.keys(data);
  if (items.length === 0) {
    if (statusEl) {
      statusEl.textContent = '⚠ No items found in inventory scan';
      setTimeout(() => { if (statusEl) statusEl.textContent = ''; }, 3000);
    }
    return;
  }

  // REPLACE quantities with scanned values — scanner is source of truth
  // Also auto-registers new items as custom items if not already in the list
  const builtInNames = new Set(allItems.map(r => r.item));
  const customItems  = getCustomItems();
  let updated = 0;
  let newItems = 0;

  items.forEach(name => {
    const qty = data[name].total || 0;
    if (qty > 0) {
      // If item not in built-in list AND not already a custom item, add it
      if (!builtInNames.has(name) && !customItems[name]) {
        addCustomItem(name, 'Scanned Items', 'Uncategorized');
        newItems++;
      }
      // REPLACE existing quantity with scanned quantity
      saveStorage(name, qty);
      updated++;
    }
  });
  const added = newItems;

  // Save full breakdown with character + timestamp for Inventory page
  localStorage.setItem('inventoryBreakdown', JSON.stringify({
    data,
    character: charName,
    importedAt: Date.now()
  }));

  if (statusEl) {
    statusEl.textContent = `✓ Imported ${updated} items (${added} new) — quantities added to Prices & Storage`;
    setTimeout(() => { if (statusEl) statusEl.textContent = ''; }, 5000);
  }

  window.renderCurrentPage();

  // Silently push inventory to community database (all users)
  if (window.electronAPI?.submitInventory) {
    const submitItems = items
      .filter(name => (data[name]?.total || 0) > 0)
      .map(name => {
        const d = data[name];
        return [
          { item_name: name, quantity: d.bag   || 0, container: 'bag'        },
          { item_name: name, quantity: d.bank  || 0, container: 'bank'       },
          { item_name: name, quantity: d.guild || 0, container: 'guild_bank' },
          { item_name: name, quantity: d.coffer|| 0, container: 'coffer'     },
        ].filter(r => r.quantity > 0);
      })
      .flat();
    if (submitItems.length > 0) {
      window.electronAPI.submitInventory(submitItems).catch(() => {});
    }
  }
}
