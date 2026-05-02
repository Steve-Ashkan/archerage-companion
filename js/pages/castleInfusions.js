import { appState } from "../state.js";
import { escapeHtml, jsEscape, renderMaterialsGrid } from "../utils.js";
import { CASTLE_INFUSIONS } from "./castleInfusions/data.js";

// ─── Constants ────────────────────────────────────────────────────────────────

const EXP_PER_INFUSION = 2000;
const CALC_KEY         = "castleInfusionsCalc";

const CI_CATEGORIES = ['Weapon', 'Armor', 'Accessory'];

const CI_GRADE_COLORS = {
  Arcane:    '#8b7fd4',
  Heroic:    '#c084fc',
  Unique:    '#fb923c',
  Celestial: '#fbbf24',
  Divine:    '#f87171',
  Epic:      '#6b8cba',
  Legendary: '#fcd34d',
  Mythic:    '#ef4444',
  Eternal:   '#67e8f9',
};

// EXP required per grade, keyed by Erenor tier.
// Values from the Erenor Upgrading EXP Requirements table.
const TIER_GRADE_MAX_EXP = {
  T1: {
    Arcane:    5503,
    Heroic:    7805,
    Unique:    10458,
    Celestial: 13449,
    Divine:    17950,
    Epic:      24371,
    Legendary: 31649,
    Mythic:    41481,
    Eternal:   54419,
  },
  T2: {
    Legendary: 31649,
    Mythic:    41841,
    Eternal:   54419,
  },
  T3: {
    Mythic:  41841,
    Eternal: 108383,
  },
  T4: {
    Mythic:  41841,
    Eternal: 176952,
  },
};

// ─── State ────────────────────────────────────────────────────────────────────

function getCalcState() {
  try { return JSON.parse(localStorage.getItem(CALC_KEY)) || {}; } catch { return {}; }
}
function saveCalcState(s) { localStorage.setItem(CALC_KEY, JSON.stringify(s)); }

// ─── Render ───────────────────────────────────────────────────────────────────

export function renderPage() {
  const s           = getCalcState();
  const category    = s.category    || 'Weapon';
  const tier        = s.tier        || 'T1';
  const currentExp  = s.currentExp  !== undefined ? s.currentExp : '';
  const qtyOverride = s.qtyOverride != null ? Number(s.qtyOverride) : null;

  // Available grades for this tier
  const gradeMap     = TIER_GRADE_MAX_EXP[tier] || TIER_GRADE_MAX_EXP.T1;
  const availGrades  = Object.keys(gradeMap);

  // Clamp saved grade to what's available for this tier
  const grade = availGrades.includes(s.grade) ? s.grade : availGrades[0];
  const color = CI_GRADE_COLORS[grade] || '#566174';

  const maxExp = gradeMap[grade] || 0;

  const infusion = CASTLE_INFUSIONS.find(i =>
    i.category === category && i.title.startsWith(grade + ' ')
  );

  // Calculate infusions that fit without overflowing the grade cap
  let infusionsCalc = null;
  let expAfter      = null;
  let fillPct       = null;

  if (currentExp !== '' && currentExp !== null && maxExp > 0) {
    const cur = Number(currentExp);
    const remaining = maxExp - cur;
    if (remaining <= 0) {
      infusionsCalc = 0; // already at or over cap
    } else {
      infusionsCalc = Math.floor(remaining / EXP_PER_INFUSION);
    }
    expAfter  = Math.min(maxExp, cur + infusionsCalc * EXP_PER_INFUSION);
    fillPct   = maxExp > 0 ? ((expAfter / maxExp) * 100).toFixed(1) : '0.0';
  }

  const qty = Math.max(1, qtyOverride ?? infusionsCalc ?? 1);

  // ── Category tabs ──────────────────────────────────────────────────────────
  const categoryTabs = CI_CATEGORIES.map(cat => `
    <button onclick="window.updateCICalc('category', '${jsEscape(cat)}')"
      style="padding:8px 20px;border-radius:20px;
      border:1px solid ${cat === category ? color : '#394252'};
      background:${cat === category ? color + '22' : 'transparent'};
      color:${cat === category ? color : '#8d99ab'};
      font-size:13px;font-weight:600;cursor:pointer;transition:all 0.15s;">
      ${escapeHtml(cat)}
    </button>
  `).join('');

  // ── Tier tabs ──────────────────────────────────────────────────────────────
  const tierTabs = ['T1', 'T2', 'T3', 'T4'].map(t => `
    <button onclick="window.updateCICalc('tier', '${t}')"
      style="padding:6px 14px;border-radius:20px;
      border:1px solid ${t === tier ? '#485366' : '#2a3040'};
      background:${t === tier ? '#485366' : 'transparent'};
      color:${t === tier ? '#eef2f7' : '#566174'};
      font-size:12px;font-weight:600;cursor:pointer;transition:all 0.15s;">
      ${t}
    </button>
  `).join('');

  // ── Grade pills (only grades available for selected tier) ──────────────────
  const gradePills = availGrades.map(g => {
    const c      = CI_GRADE_COLORS[g] || '#566174';
    const active = g === grade;
    return `
      <button onclick="window.updateCICalc('grade', '${jsEscape(g)}')"
        style="padding:5px 14px;border-radius:20px;
        border:1px solid ${active ? c : '#2a3040'};
        background:${active ? c + '22' : 'transparent'};
        color:${active ? c : '#566174'};
        font-size:12px;font-weight:700;cursor:pointer;
        transition:all 0.15s;white-space:nowrap;">
        ${escapeHtml(g)}
      </button>
    `;
  }).join('');

  // ── Result content ─────────────────────────────────────────────────────────
  let resultContent = '';
  if (currentExp === '' || currentExp === null) {
    resultContent = `<div style="color:#566174;font-size:0.88em;padding:4px 0;">
      Enter your current EXP above to see how many infusions to craft.
    </div>`;
  } else if (infusionsCalc === 0) {
    resultContent = `<div style="color:#4ade80;font-weight:700;font-size:0.95em;">
      This piece is already at the grade cap — no infusions needed!
    </div>`;
  } else {
    const barColor = fillPct >= 99 ? '#4ade80' : fillPct >= 80 ? color : color;
    const pctNum   = parseFloat(fillPct);
    resultContent = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:14px;">
        <div>
          <div style="font-size:0.78em;color:#8d99ab;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px;">Infusions to craft</div>
          <div style="font-size:1.6em;font-weight:700;color:${color};">${infusionsCalc.toLocaleString()}</div>
        </div>
        <div>
          <div style="font-size:0.78em;color:#8d99ab;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px;">EXP after crafting</div>
          <div style="font-size:1.1em;font-weight:700;color:#eef2f7;">
            ${expAfter.toLocaleString()}
            <span style="font-size:0.75em;color:${color};margin-left:4px;">(${fillPct}%)</span>
          </div>
        </div>
      </div>
      <div style="margin-bottom:4px;">
        <div style="height:10px;background:#0d1b2a;border-radius:5px;overflow:hidden;">
          <div style="height:100%;width:${Math.min(100, pctNum)}%;background:${color};border-radius:5px;transition:width 0.3s ease;"></div>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:0.75em;color:#566174;margin-top:3px;">
          <span>${Number(currentExp).toLocaleString()} exp now</span>
          <span>${maxExp.toLocaleString()} max</span>
        </div>
      </div>
    `;
  }

  // ── Materials grid ─────────────────────────────────────────────────────────
  let materialsHtml = '';
  if (infusion) {
    const rows = infusion.items.map(item => {
      const required      = item.amount * qty;
      const inStorage     = Number(appState.storage[item.name] || 0);
      const price         = Number(appState.prices[item.name]  || 0);
      const stillNeed     = Math.max(0, required - inStorage);
      const goldStillNeed = stillNeed * price;
      return {
        name: item.name,
        required, inStorage, price,
        stillNeed, goldStillNeed,
        totalGold: required * price,
      };
    });
    materialsHtml = renderMaterialsGrid(rows);
  }

  const gearLabel = `${grade} ${category}`;

  return `
    <div class="card">
      <h2 style="margin:0 0 4px;">Castle Infusions</h2>
      <p class="notice" style="margin:0 0 20px;">
        Each infusion gives <strong>2,000 EXP</strong>. Tell us your piece and current EXP —
        we'll calculate exactly how many infusions fit without overflowing the grade cap.
      </p>

      <!-- Category -->
      <div style="margin-bottom:14px;">
        <div style="font-size:0.78em;color:#8d99ab;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;">What type of gear?</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">${categoryTabs}</div>
      </div>

      <!-- Tier -->
      <div style="margin-bottom:14px;">
        <div style="font-size:0.78em;color:#8d99ab;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;">Erenor Tier</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;">${tierTabs}</div>
      </div>

      <!-- Grade -->
      <div style="margin-bottom:20px;">
        <div style="font-size:0.78em;color:#8d99ab;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;">Infusion Grade</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;">${gradePills}</div>
      </div>

      <!-- Result panel -->
      <div style="background:#1a2535;border:1px solid #394252;border-radius:10px;padding:16px;margin-bottom:20px;">

        <!-- Infusion name -->
        <div style="margin-bottom:16px;padding-bottom:14px;border-bottom:1px solid #394252;">
          <div style="font-size:0.78em;color:#8d99ab;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px;">Selected Infusion</div>
          <div style="font-size:1.05em;font-weight:700;color:${color};">
            ${infusion ? escapeHtml(infusion.title) : '—'}
          </div>
          <div style="font-size:0.78em;color:#566174;margin-top:3px;">
            Grade cap: <span style="color:#8d99ab;">${maxExp.toLocaleString()} EXP</span>
          </div>
        </div>

        <!-- EXP input -->
        <div style="margin-bottom:16px;">
          <label style="display:block;font-size:0.88em;color:#8d99ab;margin-bottom:8px;">
            How much EXP do you currently have in your <span style="color:${color};font-weight:700;">${escapeHtml(gearLabel)}</span>?
          </label>
          <input
            id="ci-exp-input"
            type="number" min="0" placeholder="e.g. 10331"
            value="${currentExp !== '' ? escapeHtml(String(currentExp)) : ''}"
            onchange="window.updateCICalc('currentExp', this.value)"
            style="width:200px;background:#131920;border:1px solid #394252;border-radius:6px;
            color:#eef2f7;padding:8px 10px;font-size:0.9em;">
        </div>

        <!-- Result -->
        ${resultContent}

        <!-- Qty override -->
        ${infusionsCalc !== null && infusionsCalc > 0 ? `
          <div style="display:flex;align-items:center;gap:12px;padding-top:12px;border-top:1px solid #394252;margin-top:14px;">
            <label style="font-size:0.82em;color:#8d99ab;white-space:nowrap;">Craft quantity:</label>
            <input
              type="number" min="1"
              value="${qty}"
              onchange="window.updateCICalc('qtyOverride', this.value)"
              style="width:90px;background:#131920;border:1px solid #394252;border-radius:6px;
              color:#eef2f7;padding:6px 10px;font-size:0.9em;">
            <span style="font-size:0.78em;color:#566174;">Override if needed</span>
          </div>
        ` : ''}
      </div>

      <!-- Materials -->
      ${infusion && (infusionsCalc === null || infusionsCalc > 0) ? `
        <div>
          <div style="font-size:0.78em;color:#8d99ab;text-transform:uppercase;
            letter-spacing:0.05em;margin-bottom:12px;">
            Materials for
            <span style="color:${color};font-weight:700;">
              ${qty.toLocaleString()} × ${escapeHtml(infusion.title)}
            </span>
          </div>
          ${materialsHtml}
        </div>
      ` : ''}
    </div>
  `;
}

// ─── Handlers ─────────────────────────────────────────────────────────────────

window.updateCICalc = function(field, value) {
  const s = getCalcState();

  if (field === 'category' || field === 'tier') {
    s[field]      = value;
    s.qtyOverride = null;
    // When tier changes, clear grade so it snaps to first available for new tier
    if (field === 'tier') delete s.grade;
  } else if (field === 'grade') {
    s.grade       = value;
    s.qtyOverride = null;
  } else if (field === 'currentExp') {
    s.currentExp  = value === '' ? '' : Math.max(0, Number(value) || 0);
    s.qtyOverride = null;
  } else if (field === 'qtyOverride') {
    s.qtyOverride = Math.max(1, Number(value) || 1);
  }

  saveCalcState(s);
  window.renderCurrentPage();
};
