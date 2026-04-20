import { appState } from "../state.js";
import { escapeHtml, formatGold, jsEscape, renderMaterialsGrid } from "../utils.js";

const LOCAL_KEY       = "miscTargetState";
const FILTER_KEY      = "miscCategoryFilter";
const LUNAGEM_KEY     = "miscLunagemCalc";

// ─── LUNAGEM CONSTANTS ────────────────────────────────────────────────────────

const LUNAGEM_TYPES = ['Fireglow', 'Waveglow', 'Copperglow', 'Earthglow', 'Galeglow', 'Sunglow'];

const LUNAGEM_TYPE_COLORS = {
  Fireglow:   '#ef4444',
  Waveglow:   '#60a5fa',
  Copperglow: '#2dd4bf',
  Earthglow:  '#4ade80',
  Galeglow:   '#fbbf24',
  Sunglow:    '#f472b6',
};

// Cumulative base-ingredient counts per tier.
// Splendid = 1 base + 20 lunarite + 10 sturdy ingots
// Glorious = 1 Splendid + 30 lunarite + 30 sturdy ingots
//          = 1 base + 50 lunarite + 40 sturdy ingots (combined)
const LUNAGEM_TIERS = {
  splendid: {
    label: 'Splendid', lunarite: 20, sturdyIngots: 10,
    steps: [
      { label: 'Craft Splendid [T] Lunagem', items: [
        { name: '[T] Lunagem', amount: 1 },
        { name: 'Superior Glow Lunarite', amount: 20 },
        { name: 'Sturdy Ingot', amount: 10 },
      ]},
    ],
  },
  glorious: {
    label: 'Glorious', lunarite: 50, sturdyIngots: 40,
    steps: [
      { label: 'Step 1 — Craft Splendid [T] Lunagem', items: [
        { name: '[T] Lunagem', amount: 1 },
        { name: 'Superior Glow Lunarite', amount: 20 },
        { name: 'Sturdy Ingot', amount: 10 },
      ]},
      { label: 'Step 2 — Craft Glorious [T] Lunagem', items: [
        { name: 'Splendid [T] Lunagem', amount: 1 },
        { name: 'Superior Glow Lunarite', amount: 30 },
        { name: 'Sturdy Ingot', amount: 30 },
      ]},
    ],
  },
};

// Per Sturdy Ingot (raw base):
//   8 Iron Ingot  (×3 ore = 24 Iron Ore)
//   1 Copper Ingot (×3 ore = 3 Copper Ore)
//   1 Silver Ingot (×3 ore = 3 Silver Ore)
//   1 Opaque Polish (3 Onyx Archeum Essence + 20 Azalea + 20 Narcissus)
const PER_STURDY = { ironOre: 24, copperOre: 3, silverOre: 3, onyx: 3, azalea: 20, narcissus: 20 };

function getLunagemCalcState() {
  try { return JSON.parse(localStorage.getItem(LUNAGEM_KEY)) || {}; } catch { return {}; }
}
function saveLunagemCalcState(s) { localStorage.setItem(LUNAGEM_KEY, JSON.stringify(s)); }

function getLunagemBaseItems(type, tierKey, qty) {
  const tier = LUNAGEM_TIERS[tierKey] || LUNAGEM_TIERS.splendid;
  const si   = tier.sturdyIngots * qty;
  return [
    { name: `${type} Lunagem`,         amount: qty },
    { name: 'Superior Glow Lunarite',  amount: tier.lunarite * qty },
    { name: 'Iron Ore',                amount: si * PER_STURDY.ironOre    },
    { name: 'Copper Ore',              amount: si * PER_STURDY.copperOre  },
    { name: 'Silver Ore',              amount: si * PER_STURDY.silverOre  },
    { name: 'Onyx Archeum Essence',    amount: si * PER_STURDY.onyx       },
    { name: 'Azalea',                  amount: si * PER_STURDY.azalea     },
    { name: 'Narcissus',               amount: si * PER_STURDY.narcissus  },
  ];
}

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
  { category: "Lunagems", type: "lunagem-calc" },

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

function renderLunagemCalc() {
  const s       = getLunagemCalcState();
  const type    = LUNAGEM_TYPES.includes(s.type) ? s.type : 'Fireglow';
  const tierKey = LUNAGEM_TIERS[s.tierKey] ? s.tierKey : 'splendid';
  const qty     = Math.max(1, Number(s.qty) || 1);

  const color = LUNAGEM_TYPE_COLORS[type] || '#93c5fd';
  const tier  = LUNAGEM_TIERS[tierKey];

  // Type pills
  const typePills = LUNAGEM_TYPES.map(t => {
    const c      = LUNAGEM_TYPE_COLORS[t];
    const active = t === type;
    return `<button onclick="window.updateLunagemCalc('type','${jsEscape(t)}')"
      style="padding:7px 18px;border-radius:20px;
      border:1px solid ${active ? c : '#394252'};
      background:${active ? c + '22' : 'transparent'};
      color:${active ? c : '#8d99ab'};
      font-size:13px;font-weight:600;cursor:pointer;transition:all 0.15s;">
      ${escapeHtml(t)}
    </button>`;
  }).join('');

  // Tier pills
  const tierPills = Object.entries(LUNAGEM_TIERS).map(([key, td]) => {
    const active = key === tierKey;
    return `<button onclick="window.updateLunagemCalc('tierKey','${jsEscape(key)}')"
      style="padding:6px 16px;border-radius:20px;
      border:1px solid ${active ? color : '#2a3040'};
      background:${active ? color + '22' : 'transparent'};
      color:${active ? color : '#566174'};
      font-size:12px;font-weight:600;cursor:pointer;transition:all 0.15s;">
      ${escapeHtml(td.label)}
    </button>`;
  }).join('');

  // Crafting steps (scale amounts by qty, substitute [T] with type name)
  const stepsHtml = tier.steps.map(step => {
    const label    = step.label.replace(/\[T\]/g, type);
    const itemsHtml = step.items.map(item => {
      const name   = item.name.replace(/\[T\]/g, type);
      const amount = item.amount * qty;
      return `<div style="display:flex;align-items:center;gap:10px;padding:6px 10px;
        background:#0f1923;border:1px solid #1e2d3d;border-radius:7px;">
        <span style="font-size:13px;color:${color};font-weight:700;">${amount.toLocaleString()}×</span>
        <span style="font-size:13px;color:#8d99ab;">${escapeHtml(name)}</span>
      </div>`;
    }).join('');
    return `
      <div style="margin-bottom:14px;">
        <div style="font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;
          color:#566174;margin-bottom:8px;">${escapeHtml(label)}</div>
        <div style="display:flex;flex-direction:column;gap:5px;">${itemsHtml}</div>
      </div>`;
  }).join('');

  // Base materials grid
  const baseItems = getLunagemBaseItems(type, tierKey, qty);
  const rows = baseItems.map(item => {
    const required      = item.amount;
    const inStorage     = Number(appState.storage[item.name] || 0);
    const price         = Number(appState.prices[item.name]  || 0);
    const stillNeed     = Math.max(0, required - inStorage);
    const goldStillNeed = stillNeed * price;
    return { name: item.name, required, inStorage, price, stillNeed, goldStillNeed, totalGold: required * price };
  });

  return `
    <div class="card">
      <h2 style="margin:0 0 4px;">Lunagem Calculator</h2>
      <p class="notice" style="margin:0 0 20px;">
        Select your lunagem type and target tier — we'll show the crafting steps and total base materials needed.
      </p>

      <!-- Type -->
      <div style="margin-bottom:16px;">
        <div style="font-size:0.78em;color:#8d99ab;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;">Lunagem Type</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">${typePills}</div>
      </div>

      <!-- Tier -->
      <div style="margin-bottom:20px;">
        <div style="font-size:0.78em;color:#8d99ab;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;">Target Tier</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;">${tierPills}</div>
      </div>

      <!-- Result panel -->
      <div style="background:#1a2535;border:1px solid #394252;border-radius:10px;padding:16px;margin-bottom:20px;">

        <!-- Selected lunagem name -->
        <div style="margin-bottom:16px;padding-bottom:14px;border-bottom:1px solid #394252;">
          <div style="font-size:0.78em;color:#8d99ab;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px;">Crafting</div>
          <div style="font-size:1.05em;font-weight:700;color:${color};">
            ${escapeHtml(tier.label)} ${escapeHtml(type)} Lunagem
          </div>
        </div>

        <!-- Qty -->
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">
          <label style="font-size:0.88em;color:#8d99ab;white-space:nowrap;">How many to craft:</label>
          <input type="number" min="1"
            value="${qty}"
            onchange="window.updateLunagemCalc('qty', this.value)"
            style="width:90px;background:#131920;border:1px solid #394252;border-radius:6px;
            color:#eef2f7;padding:8px 10px;font-size:0.9em;">
        </div>

        <!-- Crafting steps -->
        <div style="font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;
          color:#566174;margin-bottom:12px;">Crafting Steps</div>
        ${stepsHtml}
      </div>

      <!-- Total base materials -->
      <div>
        <div style="font-size:0.78em;color:#8d99ab;text-transform:uppercase;
          letter-spacing:0.05em;margin-bottom:12px;">
          Total Base Materials for
          <span style="color:${color};font-weight:700;">
            ${qty.toLocaleString()} × ${escapeHtml(tier.label)} ${escapeHtml(type)} Lunagem
          </span>
        </div>
        ${renderMaterialsGrid(rows)}
      </div>
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
  if (entry.type === "lunagem-calc")       return renderLunagemCalc();
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

window.updateLunagemCalc = function(field, value) {
  const s = getLunagemCalcState();
  if (field === 'qty') s.qty = Math.max(1, Number(value) || 1);
  else s[field] = value;
  saveLunagemCalcState(s);
  window.renderCurrentPage();
};