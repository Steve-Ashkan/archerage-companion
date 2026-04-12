import { appState } from "../state.js";
import { escapeHtml, formatGold } from "../utils.js";
import {
  NW_CATEGORIES,
  NW_CATEGORY_COLORS,
  NW_CATEGORY_ICONS,
  ITEM_NW_MAP,
} from "../data/nwCategories.js";

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function getCustomItems() {
  try { return JSON.parse(localStorage.getItem("customItems") || "{}"); }
  catch { return {}; }
}

function getNWCategory(itemName) {
  if (ITEM_NW_MAP[itemName]) return ITEM_NW_MAP[itemName];
  const custom = getCustomItems();
  if (custom[itemName]?.nwCategory) return custom[itemName].nwCategory;
  return "Uncategorized";
}

function pct(value, total) {
  if (!total) return "0.0";
  return ((value / total) * 100).toFixed(1);
}

// ─── COMPUTATION ─────────────────────────────────────────────────────────────

function computeNetWorth() {
  const storage = appState.storage || {};
  const prices  = appState.prices  || {};
  const custom  = getCustomItems();

  // All trackable items: built-in + custom
  const allItemNames = new Set([
    ...Object.keys(ITEM_NW_MAP),
    ...Object.keys(custom)
  ]);

  const categoryTotals = {};
  for (const cat of NW_CATEGORIES) {
    categoryTotals[cat] = { value: 0, items: [] };
  }

  let grandTotal    = 0;
  let unpricedCount = 0;

  for (const itemName of allItemNames) {
    const qty = Number(storage[itemName] || 0);
    if (qty <= 0) continue; // hidden until qty >= 1

    const price = Number(prices[itemName] || 0);
    const value = qty * price;
    const cat   = getNWCategory(itemName);

    if (price === 0) unpricedCount++;

    const target = categoryTotals[cat] || categoryTotals["Uncategorized"];
    target.value += value;
    target.items.push({ name: itemName, qty, price, value });

    grandTotal += value;
  }

  // Sort items within each category by value desc
  for (const cat of Object.values(categoryTotals)) {
    cat.items.sort((a, b) => b.value - a.value);
  }

  return { grandTotal, categoryTotals, unpricedCount };
}

// ─── RENDER ──────────────────────────────────────────────────────────────────

function renderSummaryBar(grandTotal, categoryTotals) {
  const cats = Object.entries(categoryTotals)
    .filter(([, d]) => d.value > 0)
    .sort((a, b) => b[1].value - a[1].value);
  if (!cats.length) return "";

  const segments = cats.map(([cat, d]) => {
    const p = pct(d.value, grandTotal);
    return `<div
      style="flex:${p};min-width:2px;background:${NW_CATEGORY_COLORS[cat] || "#465062"};border-radius:3px;"
      title="${NW_CATEGORY_ICONS[cat] || "📦"} ${cat}: ${formatGold(d.value)} (${p}%)"
    ></div>`;
  }).join("");

  return `<div style="display:flex;height:12px;gap:2px;margin:12px 0 4px 0;">${segments}</div>`;
}

function renderCategoryCards(categoryTotals, grandTotal) {
  return Object.entries(categoryTotals)
    .filter(([, d]) => d.items.length > 0)
    .sort((a, b) => b[1].value - a[1].value)
    .map(([cat, data]) => {
      const icon = NW_CATEGORY_ICONS[cat] || "📦";
      const p    = pct(data.value, grandTotal);

      const rows = data.items.map(item => `
        <tr>
          <td>${escapeHtml(item.name)}</td>
          <td style="text-align:right;">${item.qty.toLocaleString()}</td>
          <td style="text-align:right;color:#ffd166;">${item.price ? item.price.toFixed(4) : "<span style='color:#f59e0b;'>—</span>"}</td>
          <td class="price-text" style="text-align:right;">${formatGold(item.value)}</td>
        </tr>
      `).join("");

      return `
        <div class="card" style="margin-bottom:16px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:8px;">
            <h3 style="margin:0;">${icon} ${escapeHtml(cat)}</h3>
            <div style="text-align:right;">
              <div class="price-text" style="font-size:1.1em;font-weight:700;">${formatGold(data.value)}</div>
              <div style="font-size:12px;color:#94a3b8;">${p}% of total</div>
            </div>
          </div>
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th style="text-align:right;">Quantity</th>
                  <th style="text-align:right;">Price / Unit</th>
                  <th style="text-align:right;">Total Value</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
          </div>
        </div>
      `;
    }).join("");
}

// ─── MAIN EXPORT ─────────────────────────────────────────────────────────────

export function renderPage() {
  const { grandTotal, categoryTotals, unpricedCount } = computeNetWorth();
  const hasAnyItems = Object.values(categoryTotals).some(c => c.items.length > 0);

  return `
    <h1>Net Worth</h1>

    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px;">
        <div>
          <div style="font-size:13px;color:#94a3b8;margin-bottom:4px;">Total Liquid Net Worth</div>
          <div class="price-text" style="font-size:2em;font-weight:800;">${formatGold(grandTotal)}</div>
          ${unpricedCount > 0
            ? `<div style="font-size:12px;color:#f59e0b;margin-top:4px;">⚠️ ${unpricedCount} item${unpricedCount === 1 ? "" : "s"} in storage with no price — run AHScanner to fill them in</div>`
            : hasAnyItems
              ? `<div style="font-size:12px;color:#86efac;margin-top:4px;">✓ All tracked items priced</div>`
              : ""
          }
        </div>
        <div style="font-size:12px;color:#94a3b8;text-align:right;line-height:1.8;">
          Pulls from Prices &amp; Storage.<br>
          Items with 0 quantity are hidden.
        </div>
      </div>

      ${grandTotal > 0 ? renderSummaryBar(grandTotal, categoryTotals) : ""}

      ${grandTotal > 0 ? `
        <div class="summary-grid" style="margin-top:16px;">
          ${Object.entries(categoryTotals)
            .filter(([, d]) => d.value > 0)
            .sort((a, b) => b[1].value - a[1].value)
            .map(([cat, data]) => `
              <div class="summary-box">
                <div class="summary-label">${NW_CATEGORY_ICONS[cat] || "📦"} ${escapeHtml(cat)}</div>
                <div class="summary-value price-text">${formatGold(data.value)}</div>
                <div style="font-size:11px;color:#94a3b8;">${pct(data.value, grandTotal)}%</div>
              </div>
            `).join("")}
        </div>
      ` : ""}
    </div>

    ${!hasAnyItems ? `
      <div class="card" style="text-align:center;padding:40px 20px;">
        <div style="font-size:48px;margin-bottom:16px;">📦</div>
        <h3 style="margin:0 0 8px 0;">Nothing to show yet</h3>
        <p class="notice" style="margin:0;">
          Add quantities to items on the Prices &amp; Storage page and they'll appear here automatically.
          Items with 0 quantity stay hidden.
        </p>
      </div>
    ` : renderCategoryCards(categoryTotals, grandTotal)}
  `;
}