import { appState } from "../state.js";
import { escapeHtml, formatGold, jsEscape, renderMaterialsGrid } from "../utils.js";

const LOCAL_KEY = "miscTargetState";
const FILTER_KEY = "miscCategoryFilter";

/* =========================
   STATE
========================= */
function getTargets() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY)) || {};
  } catch {
    return {};
  }
}

function saveTarget(title, value) {
  const data = getTargets();
  data[title] = Math.max(1, Number(value) || 1);
  localStorage.setItem(LOCAL_KEY, JSON.stringify(data));
}

function getCategoryFilter() {
  return localStorage.getItem(FILTER_KEY) || "All";
}

function saveCategoryFilter(value) {
  localStorage.setItem(FILTER_KEY, value);
}

/* =========================
   DATA (from CSV + screenshot)
========================= */
const MISC_DATA = [
  {
    category: "Lunagems",
    title: "Glorious Lunagem",
    items: [
      {name: "Lunagem", amount: 1},
      {name: "Superior Glow Lunarite", amount: 50},
      {name: "Iron Ingot", amount: 320},
      {name: "Copper Ingot", amount: 40},
      {name: "Silver Ingot", amount: 40},
      {name: "Onyx Archeum Essence", amount: 120},
      {name: "Azalea", amount: 800},
      {name: "Narcissus", amount: 800}
    ]
  },

  // ── COSTUME / UNDERGARMENTS ───────────────────────────────────────────────
  {
    category: "Costume/Undies",
    title: "Costume/Undies — Individual Synthium Stones",
    type: "synthium-table",
    note: "Cost to feed one costume OR one undergarment from 0% to 0% Divine using individual stones. With overfeeding method saves ~413–429x Misagon's Crystals vs normal feeding.",
    stoneRows: [
      { stone: "Clear",  needs: 4,  expFrom: 0,    armorFrom: "Basic",     armorTo: "Grand",     expTo: 400  },
      { stone: "Clear",  needs: 8,  expFrom: 400,  armorFrom: "Grand",     armorTo: "Rare",      expTo: 800  },
      { stone: "Vivid",  needs: 12, expFrom: 800,  armorFrom: "Rare",      armorTo: "Arcane",    expTo: 1200 },
      { stone: "Vivid",  needs: 16, expFrom: 1200, armorFrom: "Arcane",    armorTo: "Heroic",    expTo: 1600 },
      { stone: "Lucid",  needs: 20, expFrom: 1600, armorFrom: "Heroic",    armorTo: "Unique",    expTo: 2000 },
      { stone: "Lucid",  needs: 24, expFrom: 2000, armorFrom: "Unique",    armorTo: "Celestial", expTo: 2400 },
      { stone: "Lucid",  needs: 28, expFrom: 2400, armorFrom: "Celestial", armorTo: "Divine",    expTo: 2800 },
    ],
    totals: {
      clear: 387,
      vivid: 270,
      lucid: 162,
    }
  },
  {
    category: "Costume/Undies",
    title: "Costume/Undies — Synthesis Stone Packs",
    type: "synthium-table",
    note: "Using Synthium Synthesis Stone Packs (10x value per pack). More exp per stone, useful for bulk feeding.",
    stoneRows: [
      { stone: "Clear",  needs: 10, expFrom: 0,    armorFrom: "Basic",     armorTo: "Grand",     expTo: 1000 },
      { stone: "Clear",  needs: 20, expFrom: 1000, armorFrom: "Grand",     armorTo: "Rare",      expTo: 2000 },
      { stone: "Vivid",  needs: 30, expFrom: 2000, armorFrom: "Rare",      armorTo: "Arcane",    expTo: 3000 },
      { stone: "Vivid",  needs: 40, expFrom: 3000, armorFrom: "Arcane",    armorTo: "Heroic",    expTo: 4000 },
      { stone: "Lucid",  needs: 50, expFrom: 4000, armorFrom: "Heroic",    armorTo: "Unique",    expTo: 5000 },
      { stone: "Lucid",  needs: 60, expFrom: 5000, armorFrom: "Unique",    armorTo: "Celestial", expTo: 6000 },
      { stone: "Lucid",  needs: 70, expFrom: 6000, armorFrom: "Celestial", armorTo: "Divine",    expTo: 7000 },
    ],
    totals: {
      clear: 70,
      vivid: 45,
      lucid: 25,
    }
  },
  {
    category: "Costume/Undies",
    title: "Costume/Undies — Full Cost (0% → 0% Divine)",
    type: "synthium-full-cost",
    note: "Total materials for one costume/undies + four Synthesis Stone Packs. Misagon's Crystal from honor store.",
    costRows: [
      { item: "Clear Synthium Shard",  costume: 1070, packs: 700,  packsNeed: 2800, total: 3870 },
      { item: "Misagon's Crystal",     costume: 62,   packs: 25,   packsNeed: 100,  total: 162  },
      { item: "Gold (silver)",         costume: 1520, packs: 700,  packsNeed: 2800, total: 4320 },
      { item: "Labor",                 costume: 3800, packs: 1750, packsNeed: 7000, total: 10800 },
    ]
  },

  // ── POTIONS ───────────────────────────────────────────────────────────────
  {
    category: "Potions",
    title: "Potion Crafting — All 12 Potions",
    note: "Total materials to craft one of each of the 12 potions. Uses Medicinal Powder as base ingredient for all.",
    items: [
      { name: "Medicinal Powder",     amount: 1086 },
      { name: "Onyx Archeum",         amount: 12   },
      { name: "Mysterious Garden Powder", amount: 50 },
      { name: "Ginkgo Leaf",          amount: 9    },
      { name: "Hibiscus",             amount: 10   },
      { name: "Silver Lily",          amount: 2    },
      { name: "Cultivated Ginseng",   amount: 60   },
      { name: "Impatiens",            amount: 20   },
      { name: "Crimson Petunia",      amount: 2    },
      { name: "Bay Leaf",             amount: 15   },
      { name: "Pansy",                amount: 6    },
      { name: "Poppy",                amount: 60   },
      { name: "Watermelon",           amount: 20   },
    ],
    potionList: [
      { name: "Desert Fire",       ingredients: { "Medicinal Powder": 40, "Onyx Archeum": 1 } },
      { name: "Sweet Starlight",   ingredients: { "Medicinal Powder": 48, "Onyx Archeum": 1, "Hibiscus": 5 } },
      { name: "Blazing Comet",     ingredients: { "Medicinal Powder": 48, "Onyx Archeum": 1, "Hibiscus": 5, "Silver Lily": 1, "Mysterious Garden Powder": 10 } },
      { name: "Nui's Nova",        ingredients: { "Medicinal Powder": 60, "Onyx Archeum": 1, "Ginkgo Leaf": 3 } },
      { name: "Alluvion Love",     ingredients: { "Medicinal Powder": 120, "Onyx Archeum": 1, "Cultivated Ginseng": 20, "Impatiens": 10 } },
      { name: "Burning Desire",    ingredients: { "Medicinal Powder": 120, "Onyx Archeum": 1, "Cultivated Ginseng": 20, "Impatiens": 10, "Crimson Petunia": 1, "Mysterious Garden Powder": 10 } },
      { name: "Mossy Pool",        ingredients: { "Medicinal Powder": 50, "Onyx Archeum": 1, "Bay Leaf": 5 } },
      { name: "Faint Memory",      ingredients: { "Medicinal Powder": 60, "Onyx Archeum": 1, "Bay Leaf": 5, "Pansy": 1 } },
      { name: "Hazy Reflection",   ingredients: { "Medicinal Powder": 60, "Onyx Archeum": 1, "Bay Leaf": 5, "Pansy": 5, "Crimson Petunia": 1 } },
      { name: "Kraken's Might",    ingredients: { "Medicinal Powder": 120, "Onyx Archeum": 1, "Poppy": 20 } },
      { name: "Stormraw Wave",     ingredients: { "Medicinal Powder": 180, "Onyx Archeum": 1, "Poppy": 20, "Watermelon": 10 } },
      { name: "Castaway Current",  ingredients: { "Medicinal Powder": 180, "Onyx Archeum": 1, "Poppy": 20, "Watermelon": 10, "Mysterious Garden Powder": 15 } },
    ]
  }
];

/* =========================
   CALCULATIONS
========================= */
function calculateMisc(entry, target) {
  const itemsData = entry.items.map(mat => {
    const required = Math.ceil(mat.amount * target);
    const stored = appState.storage[mat.name] || 0;
    const stillNeed = Math.max(0, required - stored);
    const price = appState.prices[mat.name] || 0;
    const goldStillNeed = stillNeed * price;

    return {
      name: mat.name,
      perCraft: mat.amount,
      required,
      stored,
      stillNeed,
      price,
      goldStillNeed
    };
  });

  const totalGoldStillNeeded = itemsData.reduce((sum, row) => sum + row.goldStillNeed, 0);

  return { itemsData, totalGoldStillNeeded };
}

/* =========================
   RENDER HELPERS
========================= */
function renderCategoryButtons(currentFilter) {
  const categories = ["All", "Lunagems", "Costume/Undies", "Potions"];
  return `
    <div class="section-nav">
      ${categories.map(cat => `
        <a href="#" 
           class="section-link ${cat === currentFilter ? 'active' : ''}"
           onclick="window.updateMiscCategoryFilter('${jsEscape(cat)}'); return false;">
          ${escapeHtml(cat)}
        </a>
      `).join('')}
    </div>
  `;
}

function renderSynthiumTable(entry) {
  const rows = entry.stoneRows.map(r => `
    <tr>
      <td><span style="color:${r.stone==='Clear'?'#86efac':r.stone==='Vivid'?'#93c5fd':'#fcd34d'};font-weight:600;">${escapeHtml(r.stone)}</span></td>
      <td style="color:#f8fafc;font-weight:600;">${r.needs}</td>
      <td style="color:#94a3b8;">${r.expFrom}</td>
      <td style="color:#94a3b8;">${escapeHtml(r.armorFrom)}</td>
      <td style="color:#94a3b8;">→</td>
      <td style="color:#e2e8f0;">${escapeHtml(r.armorTo)}</td>
      <td style="color:#94a3b8;">${r.expTo}</td>
    </tr>`).join("");

  return `
    <div class="card">
      <h2>${escapeHtml(entry.title)}</h2>
      ${entry.note ? `<p class="notice" style="margin-bottom:14px;">${escapeHtml(entry.note)}</p>` : ""}
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Stone</th><th>Needs</th><th>From EXP</th><th>Grade From</th><th></th>
              <th>Grade To</th><th>To EXP</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
          <tfoot>
            <tr style="background:#1a2535;font-weight:700;">
              <td colspan="7" style="padding:10px 8px;">
                <span style="color:#86efac;">Clear total: ${entry.totals.clear}</span>
                &nbsp;·&nbsp;
                <span style="color:#93c5fd;">Vivid total: ${entry.totals.vivid}</span>
                &nbsp;·&nbsp;
                <span style="color:#fcd34d;">Lucid total: ${entry.totals.lucid}</span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>`;
}

function renderSynthiumFullCost(entry) {
  const rows = entry.costRows.map(r => `
    <tr>
      <td style="font-weight:600;">${escapeHtml(r.item)}</td>
      <td style="color:#93c5fd;">${r.costume.toLocaleString()}</td>
      <td style="color:#86efac;">${r.packs.toLocaleString()}</td>
      <td style="color:#fb923c;">${r.packsNeed.toLocaleString()}</td>
      <td style="color:#fcd34d;font-weight:700;">${r.total.toLocaleString()}</td>
    </tr>`).join("");

  return `
    <div class="card">
      <h2>${escapeHtml(entry.title)}</h2>
      ${entry.note ? `<p class="notice" style="margin-bottom:14px;">${escapeHtml(entry.note)}</p>` : ""}
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Material</th>
              <th style="color:#93c5fd;">Costume/Undies</th>
              <th style="color:#86efac;">Per Pack</th>
              <th style="color:#fb923c;">4 Packs</th>
              <th style="color:#fcd34d;">Grand Total</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>`;
}

function renderPotionCard(entry) {
  const target = getTargets()[entry.title] || 1;
  const calc = calculateMisc(entry, target);

  const potionGrid = entry.potionList ? `
    <h3 style="margin:20px 0 12px;color:#fcd34d;">Individual Potion Recipes</h3>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px;margin-bottom:20px;">
      ${entry.potionList.map(p => `
        <div style="background:#131d2a;border:1px solid #2a3a52;border-radius:8px;padding:12px;">
          <div style="font-weight:700;color:#f8fafc;margin-bottom:6px;font-size:13px;">${escapeHtml(p.name)}</div>
          ${Object.entries(p.ingredients).map(([item, qty]) =>
            `<div style="font-size:12px;color:#94a3b8;">• ${qty}x ${escapeHtml(item)}</div>`
          ).join("")}
        </div>`).join("")}
    </div>` : "";

  return `
    <div class="card">
      <h2>${escapeHtml(entry.title)}</h2>
      ${entry.note ? `<p class="notice" style="margin-bottom:14px;">${escapeHtml(entry.note)}</p>` : ""}

      <div style="margin-bottom:15px;">
        <strong>← Enter how many sets you want to craft:</strong>
        <input type="number"
               value="${target}"
               min="1"
               style="width:90px;font-size:1.1em;"
               onchange="window.updateMiscTarget('${jsEscape(entry.title)}', this.value)">
        <span style="font-size:12px;color:#64748b;margin-left:8px;">(1 = one of each potion)</span>
      </div>

      ${renderMaterialsGrid(calc.itemsData.map(row => ({
        name:          row.name,
        required:      row.required,
        inStorage:     row.stored,
        price:         row.price || 0,
        stillNeed:     row.stillNeed,
        goldStillNeed: row.goldStillNeed,
        totalGold:     row.required * (row.price || 0)
      })))}
      ${potionGrid}
    </div>`;
}

function renderMiscCard(entry) {
  // Route to correct renderer based on type
  if (entry.type === "synthium-table")     return renderSynthiumTable(entry);
  if (entry.type === "synthium-full-cost") return renderSynthiumFullCost(entry);
  if (entry.category === "Potions")        return renderPotionCard(entry);

  // Default: standard crafting calculator
  const target = getTargets()[entry.title] || 1;
  const calc = calculateMisc(entry, target);

  return `
    <div class="card">
      <h2>${escapeHtml(entry.title)}</h2>
      ${entry.note ? `<p class="notice" style="margin-bottom:14px;">${escapeHtml(entry.note)}</p>` : ""}

      <div style="margin-bottom:15px;">
        <strong>← Enter how many you want to craft:</strong>
        <input type="number"
               value="${target}"
               min="1"
               style="width:90px; font-size:1.1em;"
               onchange="window.updateMiscTarget('${jsEscape(entry.title)}', this.value)">
      </div>

      ${renderMaterialsGrid(calc.itemsData.map(row => ({
        name:          row.name,
        required:      row.required,
        inStorage:     row.stored,
        price:         row.price || 0,
        stillNeed:     row.stillNeed,
        goldStillNeed: row.goldStillNeed,
        totalGold:     row.required * (row.price || 0)
      })))}
    </div>
  `;
}

/* =========================
   MAIN
========================= */
export function renderPage() {
  const categoryFilter = getCategoryFilter();
  const filtered = categoryFilter === "All" 
    ? MISC_DATA 
    : MISC_DATA.filter(e => e.category === categoryFilter);

  return `
    <h1>Misc</h1>
    <div class="card">
      <h2>Misc</h2>
      ${renderCategoryButtons(categoryFilter)}
    </div>
    ${filtered.map(entry => renderMiscCard(entry)).join('') || '<div class="card"><p class="notice">No items in this category.</p></div>'}
  `;
}

/* =========================
   HANDLERS
========================= */
window.updateMiscTarget = (title, val) => {
  saveTarget(title, val);
  window.renderCurrentPage();
};

window.updateMiscCategoryFilter = (value) => {
  saveCategoryFilter(value);
  window.renderCurrentPage();
};