import { appState } from "../state.js";
import { escapeHtml, formatGold, jsEscape, renderMaterialsGrid } from "../utils.js";

const LOCAL_KEY = "erenorCloakPageState";

const SECTION_LINKS = [
  { id: "cloak-where-am-i", label: "Where Am I?" },
  { id: "cloak-upgrading",  label: "Cloak Upgrading" },
  { id: "cloak-farming",    label: "Farming Notes" },
  { id: "cloak-exp-calc",   label: "EXP Calculator" },
  { id: "cloak-drop-data",  label: "Drop Data" },
  { id: "cloak-exp-reqs",   label: "EXP Requirements" },
  { id: "cloak-scrolls",    label: "Awakening Scrolls" }
];

const EXP_VALUES = {
  auroranSynthesisStoneAll:  100.61,
  auroranSynthesisStoneOnly: 28.0,
  auroranSynthesisCrystal:   238.06,
  unidentifiedAuroranCloak:  814.8
};

const EXP_CALC_ITEMS = [
  { key: "auroranSynthesisStoneAll",  label: "Auroran Synthesis Stone (All)",          exp: EXP_VALUES.auroranSynthesisStoneAll  },
  { key: "auroranSynthesisStoneOnly", label: "Auroran Synthesis Stone (Stone's Only)", exp: EXP_VALUES.auroranSynthesisStoneOnly },
  { key: "auroranSynthesisCrystal",   label: "Auroran Synthesis Crystal",              exp: EXP_VALUES.auroranSynthesisCrystal   },
  { key: "unidentifiedAuroranCloak",  label: "Unidentified Auroran Cloak",             exp: EXP_VALUES.unidentifiedAuroranCloak  }
];

// ─── Where Am I — data ───────────────────────────────────────────────────────

const GRADE_NAMES = [
  "Basic", "Grand", "Rare", "Arcane", "Heroic", "Unique",
  "Celestial", "Divine", "Epic", "Legendary", "Mythic", "Eternal"
];

const GRADE_COLORS = {
  Basic:     '#6b7280',
  Grand:     '#94a3b8',
  Rare:      '#4ade80',
  Arcane:    '#60a5fa',
  Heroic:    '#c084fc',
  Unique:    '#fb923c',
  Celestial: '#fbbf24',
  Divine:    '#f87171',
  Epic:      '#6b8cba',
  Legendary: '#fcd34d',
  Mythic:    '#ef4444',
  Eternal:   '#67e8f9',
};

const CLOAK_TYPE_DEFS = [
  { key: "epheriumCloak",        label: "Epherium Cloak",        rowIndex: 0, awakeningIdx: 7,  awakeningGrade: "Divine",    nextCloak: "Delphinad Cloak"        },
  { key: "delphinadCloak",       label: "Delphinad Cloak",       rowIndex: 1, awakeningIdx: 8,  awakeningGrade: "Epic",      nextCloak: "Ayanad Cloak"           },
  { key: "ayanadCloak",          label: "Ayanad Cloak",          rowIndex: 2, awakeningIdx: 9,  awakeningGrade: "Legendary", nextCloak: "Erenor Cloak"           },
  { key: "erenorCloak",          label: "Erenor Cloak",          rowIndex: 3, awakeningIdx: 10, awakeningGrade: "Mythic",    nextCloak: "Radiant Erenor Cloak"   },
  { key: "radiantErenorCloak",   label: "Radiant Erenor Cloak",  rowIndex: 4, awakeningIdx: 10, awakeningGrade: "Mythic",    nextCloak: "Brilliant Erenor Cloak" },
  { key: "brilliantErenorCloak", label: "Brilliant Erenor Cloak",rowIndex: 5, awakeningIdx: 11, awakeningGrade: "Eternal",   nextCloak: null                     }
];

// ─── Where Am I — helpers ────────────────────────────────────────────────────

function getAvailableGrades(cloakDef) {
  const row = EXP_REQUIREMENTS.rows[cloakDef.rowIndex];
  return GRADE_NAMES
    .map((name, i) => ({ name, index: i, costStr: row.values[i] }))
    .filter(g => g.costStr && g.costStr !== "" && g.costStr !== "?");
}

// EXP needed to REACH targetIdx (enter that grade), starting from fromIdx with fromExp already accumulated.
function expNeededToReach(rowValues, fromIdx, fromExp, targetIdx) {
  if (targetIdx <= fromIdx) return 0;
  const fromCost = parseFloat(rowValues[fromIdx]) || 0;
  let total = Math.max(0, fromCost - fromExp);
  for (let i = fromIdx + 1; i < targetIdx; i++) {
    const cost = parseFloat(rowValues[i]);
    if (!isNaN(cost)) total += cost;
  }
  return total;
}

// EXP needed to fully complete the last grade (max out this tier entirely).
function expNeededToFill(rowValues, availableGrades, fromIdx, fromExp) {
  const last = availableGrades[availableGrades.length - 1];
  const lastCost = parseFloat(last.costStr) || 0;
  if (fromIdx === last.index) return Math.max(0, lastCost - fromExp);
  return expNeededToReach(rowValues, fromIdx, fromExp, last.index) + lastCost;
}

// Where would bonusExp get you starting from fromIdx/fromExp?
function calcExpProgress(rowValues, availableGrades, fromIdx, fromExp, bonusExp) {
  const startAi = availableGrades.findIndex(g => g.index === fromIdx);
  if (startAi < 0) return null;

  let remaining = bonusExp;
  let expInGrade = fromExp;

  for (let ai = startAi; ai < availableGrades.length; ai++) {
    const g = availableGrades[ai];
    const cost = parseFloat(g.costStr) || 0;
    const needed = Math.max(0, cost - expInGrade);

    if (remaining >= needed) {
      remaining -= needed;
      expInGrade = 0;
      if (ai === availableGrades.length - 1) {
        return { gradeIndex: g.index, expInGrade: cost, maxed: true };
      }
    } else {
      return { gradeIndex: g.index, expInGrade: expInGrade + remaining, maxed: false };
    }
  }
  return null;
}

// ─── Drop Data ───────────────────────────────────────────────────────────────

const DROP_DATA_GROUPS = [
  {
    title: "Auroran Synthesis Stone (Data on 5000 crates) (OUTDATED??)",
    averageExp: "Average Exp/crate = 100.61",
    notes: [
      "Only using Stones\nAverage Exp/crate = 28.00",
      "Labor for 10k exp\n1490.81"
    ],
    rows: [
      { drop: "Basic Synthesis Shard",   average: "0.11", expPer: "50"  },
      { drop: "Grand Synthesis Shard",   average: "0.52", expPer: "75"  },
      { drop: "Rare Synthesis Shard",    average: "0.25", expPer: "112" },
      { drop: "Arcane Synthesis Stone",  average: "0.06", expPer: "168" },
      { drop: "Heroic Synthesis Stone",  average: "0.04", expPer: "252" },
      { drop: "Unique Synthesis Stone",  average: "0.02", expPer: "378" }
    ]
  },
  {
    title: "Auroran Synthesis Crystal (Data on 3000 crates) (OUTDATED)",
    averageExp: "Average Exp/crate = 238.06",
    notes: ["Labor for 10k exp\n630.10"],
    rows: [
      { drop: "Arcane Synthesis Stone",  average: "0.48", expPer: "168" },
      { drop: "Heroic Synthesis Stone",  average: "0.31", expPer: "252" },
      { drop: "Unique Synthesis Stone",  average: "0.21", expPer: "378" }
    ]
  },
  {
    title: "Unidentified Auroran Cloak (Data on 250 crates)",
    averageExp: "Average Exp/crate = 814.80",
    notes: [
      "You get these from opening Haunted Boxes\n(1) Max alc prof (120 labor/box) (2) No alc prof (200 labor/box)",
      "(1) Labor for 10k exp\n1656.85",
      "(2) Labor for 10k exp\n2638.68"
    ],
    rows: [
      { drop: "Grand Cloak",   average: "0.52", expPer: "500"  },
      { drop: "Rare Cloak",    average: "0.20", expPer: "800"  },
      { drop: "Arcane Cloak",  average: "0.17", expPer: "1200" },
      { drop: "Heroic Cloak",  average: "0.11", expPer: "1700" }
    ]
  }
];

const EXP_REQUIREMENTS = {
  headers: ["Basic", "Grand", "Rare", "Arcane", "Heroic", "Unique", "Celestial", "Divine", "Epic", "Legendary", "Mythic", "Eternal", "Total Exp"],
  rows: [
    {
      type: "Epherium Cloak",
      values: ["75", "237", "356", "534", "801", "1301", "1952", "2928", "", "", "", "", "8184"]
    },
    {
      type: "Delphinad Cloak",
      values: ["", "487", "731", "1097", "1645", "2469", "3704", "5556", "5556", "", "", "", "15689"]
    },
    {
      type: "Ayanad Cloak",
      values: ["100", "13550", "2871", "4594", "7350", "11760", "18816", "30106", "48170", "48170", "", "", "116202"]
    },
    {
      type: "Erenor Cloak",
      values: ["", "1073", "1689", "2660", "4295", "6765", "10655", "16887", "26596", "41889", "65991", "90000", "175738"]
    },
    {
      type: "Radiant Erenor Cloak",
      values: ["", "", "", "", "10790", "16185", "24277", "36415", "54623", "81934", "122901", "184352", "480225"]
    },
    {
      type: "Brilliant Erenor Cloak",
      values: ["", "", "", "", "?", "35452", "51636", "75912", "112328", "166950", "248884", "371790", "975864"]
    }
  ],
  notes: [
    "When awakening a cloak you won't hit these tiers",
    "You can overfeed EXP into your cloak, this will be kept after awakening"
  ]
};

const SCROLL_RECIPES = [
  {
    id: "epherium-cloak-awakening-scroll",
    title: "Epherium Cloak Awakening Scroll",
    craftedItems: [
      { amount: 1, item: "Epherium Cloak Awakening Scroll" }
    ],
    materials: [
      { item: "Honorforged Medal",        qty: 6,  seeds: 0, vocPerSeed: 0 },
      { item: "Moonlight Archeum Crystal",qty: 3,  seeds: 0, vocPerSeed: 0 }
    ]
  },
  {
    id: "delphinad-cloak-awakening-scroll",
    title: "Delphinad Cloak Awakening Scroll",
    craftedItems: [
      { amount: 1, item: "Delphinad Cloak Awakening Scroll" }
    ],
    materials: [
      { item: "Honorforged Medal",        qty: 12, seeds: 0, vocPerSeed: 0 },
      { item: "Moonlight Archeum Crystal",qty: 3,  seeds: 0, vocPerSeed: 0 }
    ]
  },
  {
    id: "ayanad-cloak-awakening-scroll",
    title: "Ayanad Cloak Awakening Scroll",
    craftedItems: [
      { amount: 1, item: "Ipnysh Moonlight Blessing"     },
      { amount: 1, item: "Ayanad Cloak Awakening Scroll" }
    ],
    materials: [
      { item: "Honorforged Medal",           qty: 18, seeds: 0, vocPerSeed: 0 },
      { item: "Moonlight Archeum Essence",   qty: 3,  seeds: 0, vocPerSeed: 0 },
      { item: "Dragon Essence Stabilizer",   qty: 50, seeds: 0, vocPerSeed: 0 },
      { item: "Cursed Armor Piece",          qty: 4,  seeds: 0, vocPerSeed: 0 },
      { item: "Acidic Poison Pouch",         qty: 4,  seeds: 0, vocPerSeed: 0 }
    ]
  },
  {
    id: "erenor-cloak-awakening-scroll",
    title: "Erenor Cloak Awakening Scroll",
    craftedItems: [
      { amount: 110, item: "Small Root Pigment"          },
      { amount: 10,  item: "Small Leaf Pigment"          },
      { amount: 100, item: "Beautifully Colored Fabric"  },
      { amount: 10,  item: "Cloudspun Fabric"            },
      { amount: 1,   item: "Blazing Cloudspun Fabric"    },
      { amount: 1,   item: "Ipnysh Moonlight Blessing"   },
      { amount: 1,   item: "Erenor Cloak Awakening Scroll" }
    ],
    materials: [
      { item: "Cornflower",                  qty: 300,  seeds: 116, vocPerSeed: 45 },
      { item: "Lily",                        qty: 300,  seeds: 150, vocPerSeed: 45 },
      { item: "Clover",                      qty: 2200, seeds: 847, vocPerSeed: 0  },
      { item: "Rose",                        qty: 2200, seeds: 847, vocPerSeed: 0  },
      { item: "Fabric",                      qty: 1000, seeds: 0,   vocPerSeed: 0  },
      { item: "Anya Ingot",                  qty: 9,    seeds: 0,   vocPerSeed: 0  },
      { item: "Moonlight Archeum Essence",   qty: 6,    seeds: 0,   vocPerSeed: 0  },
      { item: "Flaming Log",                 qty: 6,    seeds: 0,   vocPerSeed: 0  },
      { item: "Green Coral",                 qty: 200,  seeds: 61,  vocPerSeed: 0  },
      { item: "Mysterious Garden Powder",    qty: 50,   seeds: 0,   vocPerSeed: 0  },
      { item: "Onyx Archeum Essence",        qty: 380,  seeds: 0,   vocPerSeed: 0  },
      { item: "Dragon Essence Stabilizer",   qty: 75,   seeds: 0,   vocPerSeed: 0  },
      { item: "Honorforged Medal",           qty: 36,   seeds: 0,   vocPerSeed: 0  },
      { item: "Cursed Armor Piece",          qty: 4,    seeds: 0,   vocPerSeed: 0  },
      { item: "Acidic Poison Pouch",         qty: 4,    seeds: 0,   vocPerSeed: 0  }
    ]
  }
];

// ─── State ───────────────────────────────────────────────────────────────────

function getPageState() {
  const fallback = {
    expInputs: {
      auroranSynthesisStoneAll:  0,
      auroranSynthesisStoneOnly: 0,
      auroranSynthesisCrystal:   0,
      unidentifiedAuroranCloak:  0
    },
    craftQty: {
      "epherium-cloak-awakening-scroll":  1,
      "delphinad-cloak-awakening-scroll":  1,
      "ayanad-cloak-awakening-scroll":     1,
      "erenor-cloak-awakening-scroll":     1
    },
    whereAmI: {
      cloakType:  "erenorCloak",
      gradeIndex: 3,
      currentExp: 0
    }
  };

  try {
    const saved = JSON.parse(localStorage.getItem(LOCAL_KEY) || "{}");
    return {
      expInputs: { ...fallback.expInputs,  ...(saved.expInputs  || {}) },
      craftQty:  { ...fallback.craftQty,   ...(saved.craftQty   || {}) },
      whereAmI:  { ...fallback.whereAmI,   ...(saved.whereAmI   || {}) }
    };
  } catch {
    return fallback;
  }
}

function savePageState(state) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(state));
}

function getCraftQty(recipeId) {
  return Math.max(0, Number(getPageState().craftQty[recipeId]) || 0);
}

function setCraftQty(recipeId, value) {
  const state = getPageState();
  state.craftQty[recipeId] = Math.max(0, Number(value) || 0);
  savePageState(state);
}

function getExpInput(key) {
  return Math.max(0, Number(getPageState().expInputs[key]) || 0);
}

function setExpInput(key, value) {
  const state = getPageState();
  state.expInputs[key] = Math.max(0, Number(value) || 0);
  savePageState(state);
}

function getTotalExp() {
  return EXP_CALC_ITEMS.reduce((sum, item) => sum + getExpInput(item.key) * item.exp, 0);
}

// ─── Render — section nav ────────────────────────────────────────────────────

function renderSectionNav() {
  return `
    <div class="card">
      <h2>Erenor Cloak</h2>
      <div class="section-nav">
        ${SECTION_LINKS.map(link => `
          <a class="section-link" href="#${escapeHtml(link.id)}">${escapeHtml(link.label)}</a>
        `).join("")}
      </div>
    </div>
  `;
}

// ─── Render — Where Am I ─────────────────────────────────────────────────────

function renderWhereAmI() {
  const state  = getPageState();
  const wai    = state.whereAmI;

  const cloakDef    = CLOAK_TYPE_DEFS.find(c => c.key === wai.cloakType) || CLOAK_TYPE_DEFS[3];
  const row         = EXP_REQUIREMENTS.rows[cloakDef.rowIndex];
  const rowValues   = row.values;

  const availableGrades = getAvailableGrades(cloakDef);

  let gradeIdx = wai.gradeIndex;
  if (!availableGrades.find(g => g.index === gradeIdx)) {
    gradeIdx = availableGrades[0]?.index ?? 0;
  }

  const currentGradeData = availableGrades.find(g => g.index === gradeIdx);
  const gradeCost        = parseFloat(currentGradeData?.costStr) || 0;
  const currentExp       = Math.min(Math.max(0, wai.currentExp), gradeCost);
  const progressPct      = gradeCost > 0 ? Math.min(100, (currentExp / gradeCost) * 100) : 0;
  const gradeColor       = GRADE_COLORS[currentGradeData?.name] || '#eef2f7';

  const cloakOptions = CLOAK_TYPE_DEFS.map(c =>
    `<option value="${escapeHtml(c.key)}" ${c.key === wai.cloakType ? "selected" : ""}>${escapeHtml(c.label)}</option>`
  ).join("");

  const gradeOptions = availableGrades.map(g =>
    `<option value="${g.index}" ${g.index === gradeIdx ? "selected" : ""}>${escapeHtml(g.name)}</option>`
  ).join("");

  const nextGradeData = availableGrades.find(g => g.index > gradeIdx);
  const atAwakeningPt = gradeIdx >= cloakDef.awakeningIdx;
  const isAtMax       = !nextGradeData;
  const remainInGrade = gradeCost - currentExp;

  const calcExp      = getTotalExp();
  const calcProgress = calcExp > 0
    ? calcExpProgress(rowValues, availableGrades, gradeIdx, currentExp, calcExp)
    : null;

  const fmt         = n => Math.ceil(n).toLocaleString();
  const fmtCrystals = n => (n / EXP_VALUES.auroranSynthesisCrystal).toFixed(1);
  const fmtStones   = n => (n / EXP_VALUES.auroranSynthesisStoneAll).toFixed(1);

  // ── Grade breakdown ──
  let breakdownHtml = '';
  if (!isAtMax) {
    const remainingGrades = availableGrades.filter(g => g.index > gradeIdx);
    const xpToMax = expNeededToFill(rowValues, availableGrades, gradeIdx, currentExp);

    const breakdownRows = [
      `<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #1e2a38;font-size:0.88em;">
        <span style="color:${gradeColor};">${escapeHtml(currentGradeData?.name ?? '')} <span style="color:#8d99ab;">(current)</span></span>
        <span style="color:#eef2f7;">${fmt(remainInGrade)} XP</span>
      </div>`,
      ...remainingGrades.map(g => {
        const gc   = GRADE_COLORS[g.name] || '#eef2f7';
        const cost = parseFloat(g.costStr) || 0;
        const isAwaken = g.index === cloakDef.awakeningIdx;
        return `<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #1e2a38;font-size:0.88em;">
          <span style="color:${gc};">${escapeHtml(g.name)}${isAwaken ? ' <span style="color:#86efac;font-size:0.82em;">[awaken]</span>' : ''}</span>
          <span style="color:#eef2f7;">${fmt(cost)} XP</span>
        </div>`;
      }),
      `<div style="display:flex;justify-content:space-between;padding:8px 0;font-weight:700;border-top:2px solid #394252;margin-top:4px;">
        <span style="color:#8d99ab;">Total to max</span>
        <span style="color:#fcd34d;">${fmt(xpToMax)} XP</span>
      </div>`,
      `<div style="font-size:0.8em;color:#8d99ab;margin-top:2px;">~${fmtCrystals(xpToMax)} Synthesis Crystals &nbsp;|&nbsp; ~${fmtStones(xpToMax)} Synthesis Stones</div>`
    ].join('');

    breakdownHtml = `
      <div style="margin-top:12px;">
        <div style="font-size:0.8em;color:#8d99ab;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;">XP Remaining</div>
        ${breakdownRows}
      </div>`;

    if (!atAwakeningPt && cloakDef.nextCloak) {
      const xpToAwaken = expNeededToReach(rowValues, gradeIdx, currentExp, cloakDef.awakeningIdx);
      breakdownHtml += `
        <div style="margin-top:8px;padding:8px 12px;background:#0a1e2e;border:1px solid #1e4d6b;border-radius:6px;font-size:0.85em;display:flex;justify-content:space-between;align-items:center;">
          <span><span style="color:#86efac;">Awaken at ${escapeHtml(cloakDef.awakeningGrade)}</span> <span style="color:#8d99ab;">→ ${escapeHtml(cloakDef.nextCloak)}</span></span>
          <span style="color:#eef2f7;font-weight:600;">${fmt(xpToAwaken)} XP</span>
        </div>`;
    }
  }

  const awakenBadge = isAtMax
    ? `<div style="margin-top:12px;padding:10px 14px;background:#0a2a1a;border:1px solid #16a34a;border-radius:8px;color:#4ade80;font-weight:600;font-size:0.9em;">
        This cloak is at its maximum grade!
       </div>`
    : atAwakeningPt && cloakDef.nextCloak
    ? `<div style="margin-top:12px;padding:10px 14px;background:#0a2a1a;border:1px solid #16a34a;border-radius:8px;color:#4ade80;font-weight:600;font-size:0.9em;">
        Ready to Awaken! Use your scroll to become <strong>${escapeHtml(cloakDef.nextCloak)}</strong>.
       </div>`
    : '';

  return `
    <div class="card" id="cloak-where-am-i">
      <h3 style="margin-top:0;">Where Am I?</h3>
      <p class="notice" style="margin:0 0 16px 0;">
        Select your cloak type and current grade, then enter your current EXP (first number on your tooltip).
      </p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">
        <div style="grid-column:1/-1;">
          <label style="display:block;font-size:0.8em;color:#8d99ab;margin-bottom:4px;text-transform:uppercase;letter-spacing:0.05em;">Cloak Type</label>
          <select onchange="window.updateErenorCloakWAI('cloakType', this.value)"
            style="width:100%;background:#131920;border:1px solid #394252;border-radius:6px;color:#eef2f7;padding:8px 10px;font-size:0.9em;">
            ${cloakOptions}
          </select>
        </div>
        <div>
          <label style="display:block;font-size:0.8em;color:#8d99ab;margin-bottom:4px;text-transform:uppercase;letter-spacing:0.05em;">Current Grade</label>
          <select onchange="window.updateErenorCloakWAI('gradeIndex', parseInt(this.value))"
            style="width:100%;background:#131920;border:1px solid #394252;border-radius:6px;color:#eef2f7;padding:8px 10px;font-size:0.9em;">
            ${gradeOptions}
          </select>
        </div>
        <div>
          <label style="display:block;font-size:0.8em;color:#8d99ab;margin-bottom:4px;text-transform:uppercase;letter-spacing:0.05em;">Current EXP (first number on tooltip)</label>
          <input type="number" min="0" max="${gradeCost}" value="${currentExp}" placeholder="e.g. 5000"
            onchange="window.updateErenorCloakWAI('currentExp', parseFloat(this.value) || 0)"
            style="width:100%;background:#131920;border:1px solid #394252;border-radius:6px;color:#eef2f7;padding:8px 10px;font-size:0.9em;box-sizing:border-box;">
          <div style="font-size:0.78em;color:#8d99ab;margin-top:3px;">Max: ${fmt(gradeCost)} EXP</div>
        </div>
      </div>

      <div style="background:#1a2535;border:1px solid #394252;border-radius:10px;padding:16px;">
        <div style="margin-bottom:14px;">
          <div style="font-size:0.78em;color:#8d99ab;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px;">Your Cloak</div>
          <div style="font-size:1.05em;font-weight:700;">
            <span style="color:${gradeColor};">${escapeHtml(currentGradeData?.name ?? '')}</span>
            <span style="color:#93c5fd;margin-left:6px;">${escapeHtml(cloakDef.label)}</span>
          </div>
        </div>
        <div>
          <div style="display:flex;justify-content:space-between;font-size:0.85em;margin-bottom:6px;">
            <span style="color:#8d99ab;">Grade Progress</span>
            <span style="color:#eef2f7;">${fmt(currentExp)} / ${fmt(gradeCost)} EXP
              <span style="color:${gradeColor};margin-left:4px;">(${progressPct.toFixed(1)}%)</span>
            </span>
          </div>
          <div style="height:10px;background:#0d1b2a;border-radius:5px;overflow:hidden;">
            <div style="height:100%;width:${progressPct.toFixed(1)}%;background:${gradeColor};border-radius:5px;"></div>
          </div>
          ${nextGradeData ? `<div style="font-size:0.82em;color:#8d99ab;margin-top:5px;">${fmt(remainInGrade)} XP to reach <span style="color:${GRADE_COLORS[nextGradeData.name] || '#eef2f7'};">${escapeHtml(nextGradeData.name)}</span></div>` : ''}
        </div>
        ${breakdownHtml}
        ${awakenBadge}
        ${calcProgress ? `
          <div style="margin-top:12px;padding:10px 14px;background:#131920;border:1px solid #394252;border-radius:8px;">
            <div style="font-size:0.78em;color:#8d99ab;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:6px;">Your Stones (+${fmt(calcExp)} EXP)</div>
            ${calcProgress.maxed ? `
              <div style="color:#4ade80;font-size:0.9em;">Enough to max this cloak!</div>
            ` : calcProgress.gradeIndex > gradeIdx ? `
              <div style="font-size:0.9em;">Lands at: <strong style="color:${GRADE_COLORS[GRADE_NAMES[calcProgress.gradeIndex]] || '#eef2f7'};">${escapeHtml(GRADE_NAMES[calcProgress.gradeIndex])}</strong></div>
              <div style="font-size:0.85em;color:#8d99ab;margin-top:3px;">${fmt(calcProgress.expInGrade)} EXP into that grade</div>
            ` : `
              <div style="font-size:0.9em;color:#8d99ab;">Not enough to advance grades yet</div>
            `}
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

// ─── Render — intro ──────────────────────────────────────────────────────────

function renderIntroSection() {
  const intro = `To start with your erenor cloak you are gonna need to get 150 Guild Prestige and spend it on the cloak that you want. Your options are:
Epherium Arrowflash Cloak: Attackspeed + Backstab Melee Damage / Melee Critical Damage
Epherium Windsong Cloak: Movement speed + Defence penetration / Ranged Critdamage
Epherium Bastion Cloak: Max Health + Healing Power / Critical Heal Bonus
Epherium Hatchblade Cloak: Cast time + Magic Defense Penetration / Magic Critical  Damage
Epherium Twintail Cloak: Block Rate + Magic Defence / Max Health

Each Cloak Awakening Scroll has a 25% chance of success and gets a 5% bonus when you fail.

Once you have chosen the cloak you want, you will need to take it up to Divine to use the Epherium Awakening Scroll.
After that it will drop back down to Arcane, and you will have to take it up to Epic to use the Delphinad Cloak Awakening Scroll.
After that it will drop back to Arcane, and you will have to take it up to Legendary to use the Ayanad Cloak Awakening Scroll.

You now have a T1 erenor cloak. You will have to take this up to Mythic to awaken it to a T2 erenor cloak. You can however already take it up to eternal. Since you won't lose any exp doing this, it will just mean it drops to a higher rank when you awaken it.`;

  return `
    <div class="card" id="cloak-upgrading">
      <h3>Cloak Upgrading</h3>
      <p class="notice" style="white-space:pre-line;">${escapeHtml(intro)}</p>
    </div>
  `;
}

// ─── Render — farming ────────────────────────────────────────────────────────

function renderFarmingSection() {
  const text = `To upgrade your cloak you are going to need Auroran Synthesis Crystals/Stones
You can get these dropped from monsters at the Diamond Shores purification area, and Castle Zone purification areas.
Diamond Shores will rarely drop Crystals, but it's a good place to farm for lower gs players

You will need about 35 Auroran Synthesis Crystal to go from Basic to Divine on your Epherium Cloak
You will need about 66 Auroran Synthesis Crystal to go from Grand to Epic on your Delphinad Cloak
You will need about 488 Auroran Synthesis Crystal to go from Heroic to Legendary on your Epherium Cloak
You will need about 738 Auroran Synthesis Crystals to go from Arcane to Mythic on your Erenor Cloak
You will need about 2017 Auroran Synthesis Crystals to go from Divine to Eternal 100% on your Radiant Erenor Cloak
You will need about 3174 Auroran Synthesis Crystals to go from Legendary to Eternal 100%  on your Brilliant Erenor Cloak

You will need about 6518 Auroran Synthesis Crystals total (Crits will make this lower)`;

  return `
    <div class="card" id="cloak-farming">
      <h3>Farming Auroran Synthesis Crystals/Stones</h3>
      <p class="notice" style="white-space:pre-line;">${escapeHtml(text)}</p>
    </div>
  `;
}

// ─── Render — EXP calculator ─────────────────────────────────────────────────

function renderExpCalculator() {
  const totalExp = getTotalExp();

  return `
    <div class="card" id="cloak-exp-calc">
      <h3>Enter how many Stones you have below to calc how much exp you have</h3>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Item name</th>
              <th>Amount</th>
              <th>Exp</th>
            </tr>
          </thead>
          <tbody>
            ${EXP_CALC_ITEMS.map(item => {
              const amount = getExpInput(item.key);
              const exp    = amount * item.exp;
              return `
                <tr>
                  <td>${escapeHtml(item.label)}</td>
                  <td>
                    <input
                      type="number" min="0" value="${amount}"
                      onchange="window.updateErenorCloakExp('${jsEscape(item.key)}', this.value)"
                    >
                  </td>
                  <td>${exp.toFixed(2)}</td>
                </tr>
              `;
            }).join("")}
            <tr>
              <td><strong>Total exp</strong></td>
              <td></td>
              <td><strong>${totalExp.toFixed(2)}</strong></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ─── Render — drop data ──────────────────────────────────────────────────────

function renderDropDataSection() {
  return `
    <div class="card" id="cloak-drop-data">
      <h3>Drop Data</h3>
      <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(280px, 1fr));gap:16px;">
        ${DROP_DATA_GROUPS.map(group => `
          <div class="summary-box">
            <div style="font-weight:bold;margin-bottom:10px;">${escapeHtml(group.title)}</div>
            <div class="notice" style="white-space:pre-line;margin-bottom:10px;">${escapeHtml(group.averageExp)}</div>
            <div class="table-wrap" style="margin-bottom:10px;">
              <table style="min-width:100%;">
                <thead>
                  <tr>
                    <th>Drops:</th>
                    <th>Average/Crate</th>
                    <th>Exp/per</th>
                  </tr>
                </thead>
                <tbody>
                  ${group.rows.map(row => `
                    <tr>
                      <td>${escapeHtml(row.drop)}</td>
                      <td>${escapeHtml(row.average)}</td>
                      <td>${escapeHtml(row.expPer)}</td>
                    </tr>
                  `).join("")}
                </tbody>
              </table>
            </div>
            ${group.notes.map(note => `
              <div class="notice" style="white-space:pre-line;margin-top:8px;">${escapeHtml(note)}</div>
            `).join("")}
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

// ─── Render — EXP requirements table ────────────────────────────────────────

function renderExpRequirementsSection() {
  return `
    <div class="card" id="cloak-exp-reqs">
      <h3>Cloak exp requirements</h3>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Type</th>
              ${EXP_REQUIREMENTS.headers.map(header => `<th>${escapeHtml(header)}</th>`).join("")}
            </tr>
          </thead>
          <tbody>
            ${EXP_REQUIREMENTS.rows.map(row => `
              <tr>
                <td>${escapeHtml(row.type)}</td>
                ${row.values.map(value => `<td>${escapeHtml(value || "")}</td>`).join("")}
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
      <div style="margin-top:12px;">
        ${EXP_REQUIREMENTS.notes.map(note => `
          <p class="notice" style="margin:6px 0;">${escapeHtml(note)}</p>
        `).join("")}
      </div>
    </div>
  `;
}

// ─── Render — awakening scroll recipes ──────────────────────────────────────

function renderCraftRecipe(recipe) {
  const craftQty = getCraftQty(recipe.id);

  const computedItems = recipe.materials.map(m => {
    const required  = (m.qty || 0) * craftQty;
    const inStorage = Number(appState.storage[m.item] || 0);
    const price     = Number(appState.prices[m.item] || 0);
    const stillNeed = Math.max(0, required - inStorage);
    const seeds     = (m.seeds || 0) * craftQty;
    const totalVoc  = seeds * (m.vocPerSeed || 0);
    return {
      name: m.item, required, inStorage, price,
      stillNeed,
      goldStillNeed: stillNeed * price,
      totalGold:     required  * price,
      seeds, totalVoc
    };
  });

  const craftedRows = recipe.craftedItems.map(item => `
    <div style="display:flex;justify-content:space-between;gap:8px;padding:5px 0;border-bottom:1px solid #394252;font-size:0.9em;">
      <span>${escapeHtml(item.item)}</span>
      <strong>${(Number(item.amount) * craftQty).toLocaleString()}</strong>
    </div>
  `).join("");

  return `
    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:flex-end;gap:12px;flex-wrap:wrap;margin-bottom:12px;">
        <h3 style="margin:0;">${escapeHtml(recipe.title)}</h3>
        <div>
          <label style="display:block;margin-bottom:4px;">&lt;-- Enter how many scrolls you want to craft</label>
          <input type="number" min="0" value="${craftQty}"
            onchange="window.updateErenorCloakCraftQty('${jsEscape(recipe.id)}', this.value)">
        </div>
      </div>
      <div style="margin-bottom:10px;">
        <div style="font-size:0.75em;opacity:0.5;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:5px;">Crafts</div>
        ${craftedRows}
      </div>
      ${renderMaterialsGrid(computedItems)}
    </div>
  `;
}

function renderScrollSection() {
  return `
    <div id="cloak-scrolls">
      <div class="card">
        <h3>Cloak Awakening Scroll</h3>
      </div>
      ${SCROLL_RECIPES.map(renderCraftRecipe).join("")}
    </div>
  `;
}

// ─── Page entry point ────────────────────────────────────────────────────────

export function renderPage() {
  return `
    ${renderSectionNav()}
    ${renderWhereAmI()}
    ${renderIntroSection()}
    ${renderFarmingSection()}
    ${renderExpCalculator()}
    ${renderDropDataSection()}
    ${renderExpRequirementsSection()}
    ${renderScrollSection()}
  `;
}

// ─── Window handlers ─────────────────────────────────────────────────────────

window.updateErenorCloakExp = function(key, value) {
  setExpInput(key, value);
  window.renderCurrentPage();
};

window.updateErenorCloakCraftQty = function(recipeId, value) {
  setCraftQty(recipeId, value);
  window.renderCurrentPage();
};

window.updateErenorCloakWAI = function(field, value) {
  const state = getPageState();
  if (field === "cloakType") {
    // Reset grade and exp when switching cloak type
    const cloakDef  = CLOAK_TYPE_DEFS.find(c => c.key === value);
    const firstGrade = cloakDef
      ? getAvailableGrades(cloakDef)[0]
      : null;
    state.whereAmI.cloakType  = value;
    state.whereAmI.gradeIndex = firstGrade?.index ?? 0;
    state.whereAmI.currentExp = 0;
  } else if (field === "gradeIndex") {
    state.whereAmI.gradeIndex = value;
    state.whereAmI.currentExp = 0; // reset exp when grade changes
  } else {
    state.whereAmI[field] = value;
  }
  savePageState(state);
  window.renderCurrentPage();
};
