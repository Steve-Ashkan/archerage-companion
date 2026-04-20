import { escapeHtml } from "../utils.js";

// ─── EXP REQUIREMENT DATA ────────────────────────────────────────────────────
// Source: Hiram Gear CSV
// Columns: Grand, Rare, Arcane, Heroic, Unique, Celestial, Divine, Epic, Legendary, Mythic, Eternal
// Empty cells mean that grade is not applicable for that tier

const EXP_GRADES = ["Grand", "Rare", "Arcane", "Heroic", "Unique", "Celestial", "Divine", "Epic", "Legendary", "Mythic", "Eternal"];

const EXP_ROWS = [
  // T1 — Awakens at Celestial
  { tier: "T1", type: "One-handed / Ranged Weapon", awaken: "Awakens at Celestial", totalExp: 15716,
    values: [364, 585, 1074, 2068, 3977, 7648, null, null, null, null, null] },
  { tier: "",   type: "Two-handed Weapon",           awaken: "", totalExp: 19727,
    values: [457, 734, 1348, 2596, 4992, 9600, null, null, null, null, null] },
  { tier: "",   type: "Musical Instrument",          awaken: "", totalExp: 9226,
    values: [214, 343, 630, 1214, 2335, 4490, null, null, null, null, null] },
  { tier: "",   type: "Head",                        awaken: "", totalExp: 12836,
    values: [297, 478, 878, 1689, 3248, 6246, null, null, null, null, null] },
  { tier: "",   type: "Chest",                       awaken: "", totalExp: 16262,
    values: [376, 605, 1111, 2140, 4115, 7915, null, null, null, null, null] },
  { tier: "",   type: "Legs",                        awaken: "", totalExp: 14547,
    values: [337, 542, 994, 1914, 3681, 7079, null, null, null, null, null] },
  { tier: "",   type: "Hands & Feet",                awaken: "", totalExp: 11121,
    values: [257, 414, 760, 1463, 2814, 5413, null, null, null, null, null] },
  { tier: "",   type: "Wrist & Waist",               awaken: "", totalExp: 9410,
    values: [218, 350, 643, 1238, 2381, 4580, null, null, null, null, null] },

  // T2 — Awakens at Divine
  { tier: "T2", type: "One-handed / Ranged Weapon", awaken: "Awakens at Divine", totalExp: 64400,
    values: [null, 1637, 3007, 5789, 11135, 21416, 21416, null, null, null, null] },
  { tier: "",   type: "Two-handed Weapon",           awaken: "", totalExp: 80917,
    values: [null, 2056, 3777, 7273, 13989, 26911, 26911, null, null, null, null] },
  { tier: "",   type: "Musical Instrument",          awaken: "", totalExp: 37847,
    values: [null, 962, 1767, 3402, 6544, 12586, 12586, null, null, null, null] },
  { tier: "",   type: "Head",                        awaken: "", totalExp: 52612,
    values: [null, 1337, 2456, 4730, 9097, 17496, 17496, null, null, null, null] },
  { tier: "",   type: "Chest",                       awaken: "", totalExp: 66632,
    values: [null, 1694, 3111, 5990, 11521, 22158, 22158, null, null, null, null] },
  { tier: "",   type: "Legs",                        awaken: "", totalExp: 59685,
    values: [null, 1517, 2786, 5366, 10320, 19848, 19848, null, null, null, null] },
  { tier: "",   type: "Hands & Feet",                awaken: "", totalExp: 45540,
    values: [null, 1158, 2126, 4094, 7874, 15144, 15144, null, null, null, null] },
  { tier: "",   type: "Wrist & Waist",               awaken: "", totalExp: 38592,
    values: [null, 981, 1802, 3470, 6673, 12833, 12833, null, null, null, null] },

  // T3 — Awakens at Epic
  { tier: "T3", type: "One-handed / Ranged Weapon", awaken: "Awakens at Epic", totalExp: 229162,
    values: [null, null, null, null, 22826, 43902, 81217, 81217, null, null, null] },
  { tier: "",   type: "Two-handed Weapon",           awaken: "", totalExp: 287887,
    values: [null, null, null, null, 28675, 55152, 102030, 102030, null, null, null] },
  { tier: "",   type: "Musical Instrument",          awaken: "", totalExp: 134673,
    values: [null, null, null, null, 13415, 25800, 47729, 47729, null, null, null] },
  { tier: "",   type: "Head",                        awaken: "", totalExp: 187216,
    values: [null, null, null, null, 18648, 35866, 66351, 66351, null, null, null] },
  { tier: "",   type: "Chest",                       awaken: "", totalExp: 237110,
    values: [null, null, null, null, 23618, 45424, 84034, 84034, null, null, null] },
  { tier: "",   type: "Legs",                        awaken: "", totalExp: 212384,
    values: [null, null, null, null, 21155, 40687, 75271, 75271, null, null, null] },
  { tier: "",   type: "Hands & Feet",                awaken: "", totalExp: 162047,
    values: [null, null, null, null, 16141, 31044, 57431, 57431, null, null, null] },
  { tier: "",   type: "Wrist & Waist",               awaken: "", totalExp: 137318,
    values: [null, null, null, null, 13677, 26305, 48668, 48668, null, null, null] },

  // T4 — Awakens at Mythic
  { tier: "T4", type: "One-handed / Ranged Weapon", awaken: "Awakens at Mythic", totalExp: 2626562,
    values: [null, null, null, null, null, null, null, 170556, 511668, 1944338, null] },
  { tier: "",   type: "Two-handed Weapon",           awaken: "", totalExp: 3299649,
    values: [null, null, null, null, null, null, null, 214263, 642789, 2442597, null] },
  { tier: "",   type: "Musical Instrument",          awaken: "", totalExp: 1543549,
    values: [null, null, null, null, null, null, null, 100231, 300691, 1142627, null] },
  { tier: "",   type: "Head",                        awaken: "", totalExp: 2145785,
    values: [null, null, null, null, null, null, null, 139337, 418010, 1588438, null] },
  { tier: "",   type: "Chest",                       awaken: "", totalExp: 2717658,
    values: [null, null, null, null, null, null, null, 176472, 529414, 2011772, null] },
  { tier: "",   type: "Legs",                        awaken: "", totalExp: 2434252,
    values: [null, null, null, null, null, null, null, 158069, 474205, 1801978, null] },
  { tier: "",   type: "Hands & Feet",                awaken: "", totalExp: 1857320,
    values: [null, null, null, null, null, null, null, 120606, 361816, 1374898, null] },
  { tier: "",   type: "Wrist & Waist",               awaken: "", totalExp: 1573914,
    values: [null, null, null, null, null, null, null, 102203, 306607, 1165104, null] },

  // T5 — Awakens at Eternal
  { tier: "T5", type: "One-handed Weapon",  awaken: "Awakens at Eternal", totalExp: 9332820,
    values: [null, null, null, null, null, null, null, null, null, 1944338, 7388482] },
  { tier: "",   type: "Two-handed Weapon",  awaken: "", totalExp: 7614535,
    values: [null, null, null, null, null, null, null, null, null, 2442597, 5171938] },
  { tier: "",   type: "Musical Instrument", awaken: "", totalExp: 5484613,
    values: [null, null, null, null, null, null, null, null, null, 1142627, 4341986] },
  { tier: "",   type: "Head",               awaken: "", totalExp: 7624499,
    values: [null, null, null, null, null, null, null, null, null, 1588438, 6036061] },
  { tier: "",   type: "Chest",              awaken: "", totalExp: 9656503,
    values: [null, null, null, null, null, null, null, null, null, 2011772, 7644731] },
  { tier: "",   type: "Legs",               awaken: "", totalExp: 8649491,
    values: [null, null, null, null, null, null, null, null, null, 1801978, 6847513] },
  { tier: "",   type: "Hands & Feet",       awaken: "", totalExp: 6599510,
    values: [null, null, null, null, null, null, null, null, null, 1374898, 5224612] },
  { tier: "",   type: "Wrist & Waist",      awaken: "", totalExp: 5592498,
    values: [null, null, null, null, null, null, null, null, null, 1165104, 4427394] },

  // T6 — Awakens at Unknown
  { tier: "T6", type: "One-handed Weapon",  awaken: "Awakens at Unknown", totalExp: 9235603,
    values: [null, null, null, null, null, null, null, null, null, null, 9235603] },
  { tier: "",   type: "Two-handed Weapon",  awaken: "", totalExp: 11602342,
    values: [null, null, null, null, null, null, null, null, null, null, 11602342] },
  { tier: "",   type: "Musical Instrument", awaken: "", totalExp: 5427483,
    values: [null, null, null, null, null, null, null, null, null, null, 5427483] },
  { tier: "",   type: "Head",               awaken: "", totalExp: 7545076,
    values: [null, null, null, null, null, null, null, null, null, null, 7545076] },
  { tier: "",   type: "Chest",              awaken: "", totalExp: 9555914,
    values: [null, null, null, null, null, null, null, null, null, null, 9555914] },
  { tier: "",   type: "Legs",               awaken: "", totalExp: 8559391,
    values: [null, null, null, null, null, null, null, null, null, null, 8559391] },
  { tier: "",   type: "Hands & Feet",       awaken: "", totalExp: 6530765,
    values: [null, null, null, null, null, null, null, null, null, null, 6530765] },
  { tier: "",   type: "Wrist & Waist",      awaken: "", totalExp: 5534242,
    values: [null, null, null, null, null, null, null, null, null, null, 5534242] },
];

// ─── SPECIALISATION DATA ─────────────────────────────────────────────────────

const SPEC_ROWS = [
  { level: 1,       weaponExp: 372339,    weaponGold: 500,   weaponLabor: 550,  armorExp: 219484,   armorGold: 250,  armorLabor: 220 },
  { level: 2,       weaponExp: 744678,    weaponGold: 750,   weaponLabor: 600,  armorExp: 438968,   armorGold: 375,  armorLabor: 240 },
  { level: 3,       weaponExp: 1117017,   weaponGold: 1000,  weaponLabor: 650,  armorExp: 658452,   armorGold: 500,  armorLabor: 260 },
  { level: 4,       weaponExp: 1489356,   weaponGold: 1250,  weaponLabor: 700,  armorExp: 877936,   armorGold: 625,  armorLabor: 280 },
  { level: 5,       weaponExp: 1861695,   weaponGold: 1500,  weaponLabor: 750,  armorExp: 1097420,  armorGold: 750,  armorLabor: 300 },
  { level: 6,       weaponExp: 2234034,   weaponGold: 1750,  weaponLabor: 800,  armorExp: null,     armorGold: null, armorLabor: null },
  { level: 7,       weaponExp: 2606373,   weaponGold: 2000,  weaponLabor: 850,  armorExp: null,     armorGold: null, armorLabor: null },
  { level: 8,       weaponExp: 2978712,   weaponGold: 2250,  weaponLabor: 900,  armorExp: null,     armorGold: null, armorLabor: null },
  { level: 9,       weaponExp: 3351051,   weaponGold: 2500,  weaponLabor: 950,  armorExp: null,     armorGold: null, armorLabor: null },
  { level: 10,      weaponExp: 3723390,   weaponGold: 2750,  weaponLabor: 1000, armorExp: null,     armorGold: null, armorLabor: null },
  { level: "Total", weaponExp: 20478645,  weaponGold: 16250, weaponLabor: 7750, armorExp: 3292260,  armorGold: 2500, armorLabor: 1300 },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function fmt(val) {
  if (val === null || val === undefined || val === "") return "—";
  if (typeof val === "number") return val.toLocaleString();
  return escapeHtml(String(val));
}

function getTierColor(tier) {
  switch (tier) {
    case "T1": return "#94a3b8";
    case "T2": return "#86efac";
    case "T3": return "#93c5fd";
    case "T4": return "#c4b5fd";
    case "T5": return "#fcd34d";
    case "T6": return "#f87171";
    default:   return "transparent";
  }
}

// ─── WHERE AM I ──────────────────────────────────────────────────────────────

const TIER_NAMES = {
  T1: 'Hiram',
  T2: 'Radiant Hiram',
  T3: 'Brilliant Hiram',
  T4: 'Glorious Hiram',
  T5: 'Exalted Hiram',
  T6: 'Sacred Hiram',
};

const GRADE_COLORS = {
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

function getTierRows(tierKey) {
  const tierIdx     = EXP_ROWS.findIndex(r => r.tier === tierKey);
  const nextTierIdx = EXP_ROWS.findIndex((r, i) => i > tierIdx && r.tier && r.tier !== tierKey);
  return EXP_ROWS.slice(tierIdx, nextTierIdx === -1 ? undefined : nextTierIdx);
}

function getActiveGrades(slotRow) {
  return EXP_GRADES
    .map((name, i) => ({ name, i, xp: slotRow.values[i] }))
    .filter(g => g.xp !== null);
}

function renderWhereAmI() {
  const tiers = Object.entries(TIER_NAMES)
    .map(([key, name]) => `<option value="${key}">${name}</option>`).join('');

  const t1Rows   = getTierRows('T1');
  const t1Slots  = [...new Set(t1Rows.map(r => r.type))];
  const t1First  = t1Rows[0];
  const t1Grades = getActiveGrades(t1First);

  const slotOpts  = t1Slots.map(s => `<option value="${escapeHtml(s)}">${escapeHtml(s)}</option>`).join('');
  const gradeOpts = t1Grades.map(g => `<option value="${g.name}">${g.name}</option>`).join('');

  return `
    <div class="card" id="where-am-i">
      <h3 style="margin-top:0;">Where Am I?</h3>
      <p class="notice" style="margin:0 0 16px 0;">
        Select your tier, slot, and current grade, then enter the first XP number shown on your item tooltip (e.g. <strong style="color:#eef2f7;">2908</strong> from XP 2908/12832).
      </p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">
        <div>
          <label style="display:block;font-size:0.8em;color:#8d99ab;margin-bottom:4px;text-transform:uppercase;letter-spacing:0.05em;">Tier</label>
          <select id="wai-tier" style="width:100%;background:#131920;border:1px solid #394252;border-radius:6px;color:#eef2f7;padding:8px 10px;font-size:0.9em;">
            ${tiers}
          </select>
        </div>
        <div>
          <label style="display:block;font-size:0.8em;color:#8d99ab;margin-bottom:4px;text-transform:uppercase;letter-spacing:0.05em;">Gear Slot</label>
          <select id="wai-slot" style="width:100%;background:#131920;border:1px solid #394252;border-radius:6px;color:#eef2f7;padding:8px 10px;font-size:0.9em;">
            ${slotOpts}
          </select>
        </div>
        <div>
          <label style="display:block;font-size:0.8em;color:#8d99ab;margin-bottom:4px;text-transform:uppercase;letter-spacing:0.05em;">Current Grade</label>
          <select id="wai-grade" style="width:100%;background:#131920;border:1px solid #394252;border-radius:6px;color:#eef2f7;padding:8px 10px;font-size:0.9em;">
            ${gradeOpts}
          </select>
        </div>
        <div>
          <label style="display:block;font-size:0.8em;color:#8d99ab;margin-bottom:4px;text-transform:uppercase;letter-spacing:0.05em;">Current XP (first number on tooltip)</label>
          <input id="wai-xp" type="number" min="0" placeholder="e.g. 2908"
            style="width:100%;background:#131920;border:1px solid #394252;border-radius:6px;color:#eef2f7;padding:8px 10px;font-size:0.9em;box-sizing:border-box;">
        </div>
      </div>
      <div id="wai-result"></div>
    </div>
  `;
}

function _updateWaiSlots(tierKey) {
  const rows    = getTierRows(tierKey);
  const slots   = [...new Set(rows.map(r => r.type))];
  const slotEl  = document.getElementById('wai-slot');
  if (!slotEl) return;
  slotEl.innerHTML = slots.map(s => `<option value="${escapeHtml(s)}">${escapeHtml(s)}</option>`).join('');
  _updateWaiGrades(tierKey, slots[0]);
}

function _updateWaiGrades(tierKey, slotType) {
  const rows    = getTierRows(tierKey);
  const slotRow = rows.find(r => r.type === slotType);
  if (!slotRow) return;
  const grades   = getActiveGrades(slotRow);
  const gradeEl  = document.getElementById('wai-grade');
  if (!gradeEl) return;
  gradeEl.innerHTML = grades.map(g => `<option value="${g.name}">${g.name}</option>`).join('');
}

function _renderWaiResult() {
  const tierKey   = document.getElementById('wai-tier')?.value;
  const slotType  = document.getElementById('wai-slot')?.value;
  const gradeName = document.getElementById('wai-grade')?.value;
  const rawXP     = document.getElementById('wai-xp')?.value;
  const resultEl  = document.getElementById('wai-result');
  if (!resultEl) return;

  if (!tierKey || !slotType || !gradeName || rawXP === '' || rawXP === null) {
    resultEl.innerHTML = ''; return;
  }
  const currentXP = parseInt(rawXP);
  if (isNaN(currentXP) || currentXP < 0) { resultEl.innerHTML = ''; return; }

  const rows    = getTierRows(tierKey);
  const slotRow = rows.find(r => r.type === slotType);
  if (!slotRow) { resultEl.innerHTML = ''; return; }

  const grades       = getActiveGrades(slotRow);
  const gradeIdx     = grades.findIndex(g => g.name === gradeName);
  if (gradeIdx === -1) { resultEl.innerHTML = ''; return; }

  const grade         = grades[gradeIdx];
  const safeXP        = Math.min(currentXP, grade.xp);
  const remainInGrade = grade.xp - safeXP;
  const progressPct   = Math.min(100, Math.round((safeXP / grade.xp) * 100));
  const gradeColor    = GRADE_COLORS[gradeName] || '#eef2f7';
  const tierColor     = getTierColor(tierKey);
  const tierName      = TIER_NAMES[tierKey];
  const awakenGrade   = grades[grades.length - 1];
  const isAtMax       = gradeIdx === grades.length - 1;

  const remainingGrades = grades.slice(gradeIdx + 1);
  const xpToAwakening   = remainInGrade + remainingGrades.reduce((s, g) => s + g.xp, 0);
  const nextGrade       = grades[gradeIdx + 1];

  const gradeBreakdown = isAtMax ? '' : `
    <div style="margin-top:12px;">
      <div style="font-size:0.8em;color:#8d99ab;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;">XP Remaining to Awakening (${awakenGrade.name})</div>
      <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #1e2a38;font-size:0.88em;">
        <span style="color:${gradeColor};">${gradeName} <span style="color:#8d99ab;">(current)</span></span>
        <span style="color:#eef2f7;">${remainInGrade.toLocaleString()} XP</span>
      </div>
      ${remainingGrades.map(g => `
        <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #1e2a38;font-size:0.88em;">
          <span style="color:${GRADE_COLORS[g.name] || '#eef2f7'};">${g.name}</span>
          <span style="color:#eef2f7;">${g.xp.toLocaleString()} XP</span>
        </div>
      `).join('')}
      <div style="display:flex;justify-content:space-between;padding:8px 0;font-weight:700;border-top:2px solid #394252;margin-top:4px;">
        <span style="color:#8d99ab;">Total to awakening</span>
        <span style="color:#fcd34d;">${xpToAwakening.toLocaleString()} XP</span>
      </div>
    </div>
  `;

  const awakenBadge = isAtMax
    ? `<div style="margin-top:12px;padding:10px 14px;background:#0a2a1a;border:1px solid #16a34a;border-radius:8px;color:#4ade80;font-weight:600;font-size:0.9em;">
        Ready to awaken! This piece is at its maximum grade for this tier.
       </div>`
    : gradeBreakdown;

  resultEl.innerHTML = `
    <div style="background:#1a2535;border:1px solid #394252;border-radius:10px;padding:16px;">
      <div style="margin-bottom:14px;">
        <div style="font-size:0.78em;color:#8d99ab;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px;">Your Piece</div>
        <div style="font-size:1.05em;font-weight:700;">
          <span style="color:${gradeColor};">${gradeName}</span>
          <span style="color:${tierColor};margin-left:6px;">${tierName}</span>
          <span style="color:#8d99ab;font-weight:400;margin-left:6px;">${escapeHtml(slotType)}</span>
        </div>
      </div>
      <div>
        <div style="display:flex;justify-content:space-between;font-size:0.85em;margin-bottom:6px;">
          <span style="color:#8d99ab;">Grade Progress</span>
          <span style="color:#eef2f7;">${safeXP.toLocaleString()} / ${grade.xp.toLocaleString()} XP
            <span style="color:${gradeColor};margin-left:4px;">(${progressPct}%)</span>
          </span>
        </div>
        <div style="height:10px;background:#0d1b2a;border-radius:5px;overflow:hidden;">
          <div style="height:100%;width:${progressPct}%;background:${gradeColor};border-radius:5px;"></div>
        </div>
        ${!isAtMax ? `<div style="font-size:0.82em;color:#8d99ab;margin-top:5px;">${remainInGrade.toLocaleString()} XP to reach <span style="color:${GRADE_COLORS[nextGrade.name] || '#eef2f7'};">${nextGrade.name}</span></div>` : ''}
      </div>
      ${awakenBadge}
    </div>
  `;
}

export function initHiramPage() {
  const tierEl  = document.getElementById('wai-tier');
  const slotEl  = document.getElementById('wai-slot');
  const gradeEl = document.getElementById('wai-grade');
  const xpEl    = document.getElementById('wai-xp');
  if (!tierEl) return;
  tierEl.addEventListener('change',  () => { _updateWaiSlots(tierEl.value); _renderWaiResult(); });
  slotEl?.addEventListener('change', () => { _updateWaiGrades(tierEl.value, slotEl.value); _renderWaiResult(); });
  gradeEl?.addEventListener('change', _renderWaiResult);
  xpEl?.addEventListener('input',    _renderWaiResult);
}

// ─── RENDER ──────────────────────────────────────────────────────────────────

function renderExpTable() {
  const groups = [];
  let current = null;
  EXP_ROWS.forEach(row => {
    if (row.tier) {
      current = { tier: row.tier, awaken: row.awaken, color: getTierColor(row.tier), rows: [] };
      groups.push(current);
    }
    current.rows.push(row);
  });

  const cards = groups.map(group => {
    const activeGrades = EXP_GRADES
      .map((name, i) => ({ name, i }))
      .filter(g => group.rows.some(r => r.values[g.i] !== null));

    const gearRows = group.rows.map((row, ri) => {
      const badges = activeGrades.map(g => {
        const val = row.values[g.i];
        if (val === null) return "";
        return `<span style="background:#1a2535;border:1px solid #2a3a52;border-radius:6px;padding:3px 9px;font-size:0.8em;white-space:nowrap;">
          <span style="color:#8d99ab;">${escapeHtml(g.name)}</span>&nbsp;<strong style="color:#eef2f7;">${val.toLocaleString()}</strong>
        </span>`;
      }).join("");

      return `
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;padding:10px 0;
          ${ri < group.rows.length - 1 ? "border-bottom:1px solid #1e2a38;" : ""}">
          <div style="min-width:0;">
            <div style="font-weight:600;color:#eef2f7;margin-bottom:7px;font-size:0.9em;">${escapeHtml(row.type)}</div>
            <div style="display:flex;flex-wrap:wrap;gap:5px;">${badges}</div>
          </div>
          <div style="text-align:right;flex-shrink:0;">
            <div style="font-size:0.72em;color:#8d99ab;text-transform:uppercase;letter-spacing:0.05em;">Total</div>
            <div style="font-weight:700;color:#fcd34d;">${row.totalExp.toLocaleString()}</div>
          </div>
        </div>
      `;
    }).join("");

    return `
      <div style="background:#21262f;border:1px solid #394252;border-radius:10px;padding:16px;margin-bottom:10px;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;padding-bottom:10px;border-bottom:1px solid #394252;">
          <span style="font-weight:700;color:${group.color};">${escapeHtml(group.tier)}</span>
          ${group.awaken ? `<span style="color:#8d99ab;font-size:0.85em;">${escapeHtml(group.awaken)}</span>` : ""}
        </div>
        ${gearRows}
      </div>
    `;
  }).join("");

  return `
    <div class="card" id="exp-requirements">
      <h3 style="margin-top:0;">Hiram Gear EXP Requirements</h3>
      <p class="notice" style="margin:0 0 16px 0;">
        EXP required per grade per gear type. Total is the full EXP to reach the awakening grade.
      </p>
      ${cards}
    </div>
  `;
}

function renderSpecTable() {
  const rows = SPEC_ROWS.map(row => {
    const isTotal = row.level === "Total";
    return `
      <div style="display:grid;grid-template-columns:3.5rem 1fr 1fr;gap:0 16px;padding:10px 0;
        ${isTotal ? "border-top:2px solid #394252;margin-top:4px;" : "border-bottom:1px solid #1e2a38;"}">
        <div style="color:${isTotal ? "#eef2f7" : "#8d99ab"};font-size:0.88em;padding-top:4px;font-weight:${isTotal ? "700" : "400"};">
          ${isTotal ? "Total" : `Lv ${row.level}`}
        </div>
        <div>
          <div style="font-size:0.72em;color:#8d99ab;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:3px;">Weapon</div>
          <div style="font-size:0.88em;color:#eef2f7;">${fmt(row.weaponExp)} <span style="color:#8d99ab;">exp</span></div>
          <div style="font-size:0.84em;color:#ffd166;">${fmt(row.weaponGold)}g <span style="color:#8d99ab;">· ${fmt(row.weaponLabor)} labor</span></div>
        </div>
        <div>
          ${row.armorExp !== null ? `
            <div style="font-size:0.72em;color:#8d99ab;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:3px;">Armor</div>
            <div style="font-size:0.88em;color:#eef2f7;">${fmt(row.armorExp)} <span style="color:#8d99ab;">exp</span></div>
            <div style="font-size:0.84em;color:#ffd166;">${fmt(row.armorGold)}g <span style="color:#8d99ab;">· ${fmt(row.armorLabor)} labor</span></div>
          ` : `<div style="color:#394252;font-size:0.85em;padding-top:16px;">—</div>`}
        </div>
      </div>
    `;
  }).join("");

  return `
    <div class="card" id="specialisation">
      <h3 style="margin-top:0;">Specialisation Level</h3>
      <p class="notice" style="margin:0 0 16px 0;">
        EXP, gold, and labor per specialisation level. Armor caps at level 5.
      </p>
      ${rows}
    </div>
  `;
}

// ─── MAIN EXPORT ─────────────────────────────────────────────────────────────

export function renderPage() {
  return `
    <div class="card">
      <h2>Hiram Gear</h2>
      <p class="notice" style="margin:8px 0 0 0;">
        EXP requirements by tier and gear type, plus specialisation level costs.
        Tier color indicates progression stage.
      </p>
      <div class="section-nav" style="margin-top:12px;">
        <a href="#where-am-i" class="section-link">Where Am I?</a>
        <a href="#exp-requirements" class="section-link">EXP Requirements</a>
        <a href="#specialisation" class="section-link">Specialisation</a>
      </div>
    </div>

    ${renderWhereAmI()}
    ${renderExpTable()}
    ${renderSpecTable()}
  `;
}