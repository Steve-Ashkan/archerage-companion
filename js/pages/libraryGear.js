import { escapeHtml } from "../utils.js";

// ─── State ───────────────────────────────────────────────────────────────────

const LOCAL_KEY = "libraryGearPageState";

function getPageState() {
  const fallback = {
    enhancerInputs: {
      sanctuary:    0,
      abyssalRank4: 0,
      abyssalRank3: 0
    },
    whereAmI: {
      rowIndex:   0,
      gradeIndex: 0,
      currentExp: 0
    }
  };
  try {
    const saved = JSON.parse(localStorage.getItem(LOCAL_KEY) || "{}");
    return {
      enhancerInputs: { ...fallback.enhancerInputs, ...(saved.enhancerInputs || {}) },
      whereAmI:       { ...fallback.whereAmI,       ...(saved.whereAmI       || {}) }
    };
  } catch {
    return fallback;
  }
}

function savePageState(state) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(state));
}

// ─── Enhancer data ────────────────────────────────────────────────────────────

const ENHANCER_ITEMS = [
  { key: "sanctuary",    label: "Sanctuary Enhancer",       exp: 20000 },
  { key: "abyssalRank4", label: "Abyssal Enhancer Rank 4",  exp: 7000  },
  { key: "abyssalRank3", label: "Abyssal Enhancer Rank 3",  exp: 2000  }
];

function getTotalEnhancerExp() {
  const state = getPageState();
  return ENHANCER_ITEMS.reduce((sum, item) => {
    return sum + (Number(state.enhancerInputs[item.key]) || 0) * item.exp;
  }, 0);
}

// ─── EXP requirement data ─────────────────────────────────────────────────────
// Grades: Grand, Rare, Arcane, Heroic, Unique, Celestial, Divine, Epic, Legendary, Mythic, Eternal

const EXP_GRADES = ["Grand", "Rare", "Arcane", "Heroic", "Unique", "Celestial", "Divine", "Epic", "Legendary", "Mythic", "Eternal"];

const EXP_ROWS = [
  // T1 — Disciple's — Awakens at Mythic
  { tier: "T1\nDisciple's",        tierLabel: "T1 Disciple's",        awaken: "Awakens at Mythic",   totalExp: 5119466,
    type: "One-handed / Ranged Weapon",
    values: [3489, 7241, 13714, 25123, 46116, 87831, 180820, 418098, 1101038, 3235996, 0] },
  { tier: "", tierLabel: "", awaken: "", totalExp: 6431391, type: "Two-handed Weapon",
    values: [4383, 9097, 17228, 31561, 57934, 110339, 227157, 525241, 1383192, 4065259, 0] },
  { tier: "", tierLabel: "", awaken: "", totalExp: 4182377, type: "Head",
    values: [2850, 5916, 11204, 20524, 37675, 71754, 147722, 341568, 899499, 2643665, 0] },
  { tier: "", tierLabel: "", awaken: "", totalExp: 5297019, type: "Chest",
    values: [3610, 7492, 14190, 25994, 47715, 90877, 187091, 432599, 1139224, 3348227, 0] },
  { tier: "", tierLabel: "", awaken: "", totalExp: 4744722, type: "Legs",
    values: [3324, 6711, 12710, 23284, 42739, 81400, 167581, 387486, 1020423, 2999064, 0] },
  { tier: "", tierLabel: "", awaken: "", totalExp: 3620123, type: "Hands & Feet",
    values: [2467, 5120, 9698, 17765, 32610, 62108, 127863, 295649, 778576, 2288267, 0] },
  { tier: "", tierLabel: "", awaken: "", totalExp: 3067735, type: "Wrist & Waist",
    values: [2091, 4339, 8218, 15054, 27634, 52631, 108353, 250537, 659774, 1939104, 0] },

  // T2 — Radiant Disciple's — Awakens at Mythic
  { tier: "T2\nRadiant\nDisciple's", tierLabel: "T2 Radiant Disciple's", awaken: "Awakens at Mythic", totalExp: 15501128,
    type: "One-handed / Ranged Weapon",
    values: [null, null, null, null, null, null, null, 1876762, 3255708, 9568658, 800000] },
  { tier: "", tierLabel: "", awaken: "", totalExp: 19270519, type: "Two-handed Weapon",
    values: [null, null, null, null, null, null, null, 2359755, 4090022, 12020742, 800000] },
  { tier: "", tierLabel: "", awaken: "", totalExp: 12258707, type: "Head",
    values: [null, null, null, null, null, null, null, 1531768, 2659769, 7817170, 250000] },
  { tier: "", tierLabel: "", awaken: "", totalExp: 15461271, type: "Chest",
    values: [null, null, null, null, null, null, null, 1942129, 3368623, 9900519, 250000] },
  { tier: "", tierLabel: "", awaken: "", totalExp: 13874160, type: "Legs",
    values: [null, null, null, null, null, null, null, 1738765, 3017332, 8868063, 250000] },
  { tier: "", tierLabel: "", awaken: "", totalExp: 10643252, type: "Hands & Feet",
    values: [null, null, null, null, null, null, null, 1324770, 2302206, 6766276, 250000] },
  { tier: "", tierLabel: "", awaken: "", totalExp: 9056141, type: "Wrist & Waist",
    values: [null, null, null, null, null, null, null, 1121405, 1950916, 5733820, 250000] },

  // T3 — Immortal Warden — Awakens at Unknown
  { tier: "T3\nImmortal\nWarden", tierLabel: "T3 Immortal Warden", awaken: "Awakens at Unknown", totalExp: 24262976,
    type: "One-handed / Ranged Weapon",
    values: [null, null, null, null, null, 198902, 459908, 1211142, 3255708, 9568658, 9568658] },
  { tier: "", tierLabel: "", awaken: "", totalExp: 30480655, type: "Two-handed Weapon",
    values: [null, null, null, null, null, 249873, 577765, 1521511, 4090022, 12020742, 12020742] },
  { tier: "", tierLabel: "", awaken: "", totalExp: 19821777, type: "Head",
    values: [null, null, null, null, null, 162494, 375725, 989449, 2659769, 7817170, 7817170] },
  { tier: "", tierLabel: "", awaken: "", totalExp: 25104467, type: "Chest",
    values: [null, null, null, null, null, 205800, 475859, 1253146, 3368624, 9900519, 9900519] },
  { tier: "", tierLabel: "", awaken: "", totalExp: 22486497, type: "Legs",
    values: [null, null, null, null, null, 184339, 426235, 1122465, 3017332, 8868063, 8868063] },
  { tier: "", tierLabel: "", awaken: "", totalExp: 17157055, type: "Hands & Feet",
    values: [null, null, null, null, null, 140649, 325214, 856434, 2302206, 6766276, 6766276] },
  { tier: "", tierLabel: "", awaken: "", totalExp: 14539086, type: "Wrist & Waist",
    values: [null, null, null, null, null, 119188, 275591, 725751, 1950916, 5733820, 5733820] },
];

// ─── Tier metadata ────────────────────────────────────────────────────────────

const TIER_INFO = [
  { rowStart: 0,  rowEnd: 6,  label: "T1 Disciple's",         color: "#94a3b8", awakeningGradeIdx: 9,  nextTier: "T2 Radiant Disciple's" },
  { rowStart: 7,  rowEnd: 13, label: "T2 Radiant Disciple's",  color: "#86efac", awakeningGradeIdx: 9,  nextTier: "T3 Immortal Warden"   },
  { rowStart: 14, rowEnd: 20, label: "T3 Immortal Warden",     color: "#fcd34d", awakeningGradeIdx: null, nextTier: null                  }
];

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

function getTierInfo(rowIndex) {
  return TIER_INFO.find(t => rowIndex >= t.rowStart && rowIndex <= t.rowEnd) || TIER_INFO[0];
}

// Build a flat label for each row including its tier
function getRowLabels() {
  let currentTier = "";
  return EXP_ROWS.map((row, i) => {
    if (row.tierLabel) currentTier = row.tierLabel;
    return { index: i, label: `${currentTier} — ${row.type}` };
  });
}

// ─── Where Am I — helpers ─────────────────────────────────────────────────────

function getAvailableGrades(rowIndex) {
  return EXP_GRADES
    .map((name, i) => ({ name, index: i, cost: EXP_ROWS[rowIndex].values[i] }))
    .filter(g => g.cost !== null && g.cost > 0);
}

function expNeededToReach(rowIndex, fromGradeIdx, fromExp, targetGradeIdx) {
  if (targetGradeIdx <= fromGradeIdx) return 0;
  const values = EXP_ROWS[rowIndex].values;
  let total = Math.max(0, (values[fromGradeIdx] || 0) - fromExp);
  for (let i = fromGradeIdx + 1; i < targetGradeIdx; i++) {
    if (values[i] !== null && values[i] > 0) total += values[i];
  }
  return total;
}

function expNeededToFill(rowIndex, fromGradeIdx, fromExp) {
  const avail = getAvailableGrades(rowIndex);
  const last  = avail[avail.length - 1];
  if (fromGradeIdx === last.index) return Math.max(0, last.cost - fromExp);
  return expNeededToReach(rowIndex, fromGradeIdx, fromExp, last.index) + last.cost;
}

function calcEnhancerProgress(rowIndex, fromGradeIdx, fromExp, bonusExp) {
  const avail   = getAvailableGrades(rowIndex);
  const startAi = avail.findIndex(g => g.index === fromGradeIdx);
  if (startAi < 0) return null;

  let remaining  = bonusExp;
  let expInGrade = fromExp;

  for (let ai = startAi; ai < avail.length; ai++) {
    const g      = avail[ai];
    const needed = Math.max(0, g.cost - expInGrade);

    if (remaining >= needed) {
      remaining -= needed;
      expInGrade = 0;
      if (ai === avail.length - 1) {
        return { gradeIndex: g.index, expInGrade: g.cost, maxed: true };
      }
    } else {
      return { gradeIndex: g.index, expInGrade: expInGrade + remaining, maxed: false };
    }
  }
  return null;
}

// ─── Specialisation data ──────────────────────────────────────────────────────

const SPEC_ROWS = [
  { level: 1,       weaponExp: 185713,  weaponGold: 500,   weaponLabor: 550,  armorExp: 109473,  armorGold: 250,  armorLabor: 220 },
  { level: 2,       weaponExp: 371426,  weaponGold: 750,   weaponLabor: 600,  armorExp: 218946,  armorGold: 375,  armorLabor: 240 },
  { level: 3,       weaponExp: 557139,  weaponGold: 1000,  weaponLabor: 650,  armorExp: 328419,  armorGold: 500,  armorLabor: 260 },
  { level: 4,       weaponExp: 742852,  weaponGold: 1250,  weaponLabor: 700,  armorExp: 437892,  armorGold: 625,  armorLabor: 280 },
  { level: 5,       weaponExp: 928565,  weaponGold: 1500,  weaponLabor: 750,  armorExp: 547365,  armorGold: 750,  armorLabor: 300 },
  { level: 6,       weaponExp: 1114278, weaponGold: 1750,  weaponLabor: 800,  armorExp: null,    armorGold: null, armorLabor: null },
  { level: 7,       weaponExp: 1299991, weaponGold: 2000,  weaponLabor: 850,  armorExp: null,    armorGold: null, armorLabor: null },
  { level: 8,       weaponExp: 1485704, weaponGold: 2250,  weaponLabor: 900,  armorExp: null,    armorGold: null, armorLabor: null },
  { level: 9,       weaponExp: 1671417, weaponGold: 2500,  weaponLabor: 950,  armorExp: null,    armorGold: null, armorLabor: null },
  { level: 10,      weaponExp: 1857130, weaponGold: 2750,  weaponLabor: 1000, armorExp: null,    armorGold: null, armorLabor: null },
  { level: "Total", weaponExp: 10214215, weaponGold: 16250, weaponLabor: 7750, armorExp: 1642095, armorGold: 2500, armorLabor: 1300 },
];

// ─── Awakening guide text ─────────────────────────────────────────────────────

const AWAKENING_DISCIPLE = `When starting a set at Disciple's the upgrade path which will cost you the least gold is awaken T1 up to Eternal, make it T2 (will be Legendary with ~20k EXP needed to hit Mythic). Once T2, make it Eternal again, then feed it enough EXP to do specialisation level 1→2 for gear and 1→4 for weapons, then cap the piece off as close to max EXP as you can. Now awaken the piece to T3. It will still be Eternal — all you have to do is feed it enough EXP to finish lv 3→5 for gear and 5→10 for weapons.`;

const AWAKENING_IMMORTAL = `If you get a gear/weapon drop in Ipnysh Sanctuary it will be Celestial — all you have to do is make it Eternal and reach lv 5 / 10 specialisation level to finish the piece.`;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(val) {
  if (val === null || val === undefined || val === "") return "—";
  if (typeof val === "number") return val.toLocaleString();
  return escapeHtml(String(val));
}

function getTierColor(tierLabel) {
  if (tierLabel.includes("T1")) return "#94a3b8";
  if (tierLabel.includes("T2")) return "#86efac";
  if (tierLabel.includes("T3")) return "#fcd34d";
  return "transparent";
}

// ─── Render — enhancer calculator ────────────────────────────────────────────

function renderEnhancerCalc() {
  const state      = getPageState();
  const totalExp   = getTotalEnhancerExp();

  // Calculator integration with Where Am I
  const wai        = state.whereAmI;
  const avail      = getAvailableGrades(wai.rowIndex);
  let gradeIdx     = wai.gradeIndex;
  if (!avail.find(g => g.index === gradeIdx)) gradeIdx = avail[0]?.index ?? 0;
  const gradeDef   = avail.find(g => g.index === gradeIdx);
  const gradeCost  = gradeDef?.cost ?? 0;
  const currentExp = Math.min(Math.max(0, wai.currentExp), gradeCost);

  const progress = totalExp > 0 ? calcEnhancerProgress(wai.rowIndex, gradeIdx, currentExp, totalExp) : null;

  const enhancerCards = ENHANCER_ITEMS.map(item => {
    const qty    = Number(state.enhancerInputs[item.key]) || 0;
    const expVal = qty * item.exp;
    return `
      <div style="background:#21262f;border:1px solid #394252;border-radius:10px;padding:14px;flex:1;min-width:150px;">
        <div style="font-weight:600;color:#eef2f7;font-size:0.9em;margin-bottom:3px;">${escapeHtml(item.label)}</div>
        <div style="font-size:0.8em;color:#8d99ab;margin-bottom:10px;">${item.exp.toLocaleString()} EXP each</div>
        <input type="number" min="0" value="${qty}"
          onchange="window.updateLibraryGearEnhancer('${escapeHtml(item.key)}', this.value)"
          style="width:100%;box-sizing:border-box;margin-bottom:8px;">
        <div style="font-size:0.84em;color:#8d99ab;">Total: <strong style="color:#eef2f7;">${expVal.toLocaleString()}</strong> EXP</div>
      </div>
    `;
  }).join("");

  return `
    <div class="card" id="enhancer-calc">
      <h3 style="margin-top:0;">Enhancer EXP Calculator</h3>
      <p class="notice" style="margin:0 0 16px 0;">Enter how many enhancers you have to see your total EXP.</p>

      <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:16px;">
        ${enhancerCards}
        <div style="background:#21262f;border:1px solid #2d5a8a;border-radius:10px;padding:14px;flex:1;min-width:130px;display:flex;flex-direction:column;justify-content:center;">
          <div style="font-size:0.72em;color:#8d99ab;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px;">Grand Total</div>
          <div style="font-size:1.5em;font-weight:700;color:#93c5fd;">${totalExp.toLocaleString()}</div>
          <div style="font-size:0.8em;color:#8d99ab;">EXP</div>
        </div>
      </div>

      ${progress ? `
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:12px;">
          <div class="summary-box">
            <div style="font-weight:bold;margin-bottom:8px;">Where This Gets You</div>
            <div style="margin-bottom:4px;">+<strong>${totalExp.toLocaleString()}</strong> EXP</div>
            ${progress.maxed ? `
              <div style="color:var(--accent,#2dd4bf);font-size:0.9em;">Enough to max this tier!</div>
            ` : progress.gradeIndex > gradeIdx ? `
              <div style="font-size:0.9em;">Lands at: <strong>${escapeHtml(EXP_GRADES[progress.gradeIndex])}</strong></div>
              <div style="font-size:0.85em;opacity:0.8;margin-top:3px;">${progress.expInGrade.toLocaleString()} EXP into that grade</div>
            ` : `
              <div style="font-size:0.9em;">Not enough to advance</div>
              <div style="font-size:0.85em;opacity:0.8;margin-top:3px;">
                ${Math.max(0, gradeCost - currentExp - totalExp).toLocaleString()} more EXP needed
              </div>
            `}
          </div>
        </div>
      ` : ""}
    </div>
  `;
}

// ─── Render — Where Am I ──────────────────────────────────────────────────────

function renderWhereAmI() {
  const state  = getPageState();
  const wai    = state.whereAmI;

  const rowLabels = getRowLabels();
  const avail     = getAvailableGrades(wai.rowIndex);

  let gradeIdx = wai.gradeIndex;
  if (!avail.find(g => g.index === gradeIdx)) gradeIdx = avail[0]?.index ?? 0;

  const gradeDef    = avail.find(g => g.index === gradeIdx);
  const gradeCost   = gradeDef?.cost ?? 0;
  const currentExp  = Math.min(Math.max(0, wai.currentExp), gradeCost);
  const progressPct = gradeCost > 0 ? Math.min(100, (currentExp / gradeCost) * 100) : 0;

  const tierInfo   = getTierInfo(wai.rowIndex);
  const gradeColor = GRADE_COLORS[gradeDef?.name] || '#eef2f7';
  const rowType    = EXP_ROWS[wai.rowIndex]?.type ?? '';

  const rowOptions = rowLabels.map(r =>
    `<option value="${r.index}" ${r.index === wai.rowIndex ? "selected" : ""}>${escapeHtml(r.label)}</option>`
  ).join("");

  const gradeOptions = avail.map(g =>
    `<option value="${g.index}" ${g.index === gradeIdx ? "selected" : ""}>${escapeHtml(g.name)}</option>`
  ).join("");

  const nextGrade     = avail.find(g => g.index > gradeIdx);
  const isAtMax       = !nextGrade;
  const atAwakeningPt = tierInfo.awakeningGradeIdx !== null && gradeIdx >= tierInfo.awakeningGradeIdx;
  const remainInGrade = gradeCost - currentExp;

  const calcExp      = getTotalEnhancerExp();
  const calcProgress = calcExp > 0
    ? calcEnhancerProgress(wai.rowIndex, gradeIdx, currentExp, calcExp)
    : null;

  // ── Grade breakdown ──
  let breakdownHtml = '';
  if (!isAtMax) {
    const remainingGrades = avail.filter(g => g.index > gradeIdx);
    const xpToMax = expNeededToFill(wai.rowIndex, gradeIdx, currentExp);

    const breakdownRows = [
      `<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #1e2a38;font-size:0.88em;">
        <span style="color:${gradeColor};">${escapeHtml(gradeDef?.name ?? '')} <span style="color:#8d99ab;">(current)</span></span>
        <span style="color:#eef2f7;">${remainInGrade.toLocaleString()} XP</span>
      </div>`,
      ...remainingGrades.map(g => {
        const gc = GRADE_COLORS[g.name] || '#eef2f7';
        const isAwaken = tierInfo.awakeningGradeIdx !== null && g.index === tierInfo.awakeningGradeIdx;
        return `<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #1e2a38;font-size:0.88em;">
          <span style="color:${gc};">${escapeHtml(g.name)}${isAwaken ? ' <span style="color:#86efac;font-size:0.82em;">[awaken]</span>' : ''}</span>
          <span style="color:#eef2f7;">${g.cost.toLocaleString()} XP</span>
        </div>`;
      }),
      `<div style="display:flex;justify-content:space-between;padding:8px 0;font-weight:700;border-top:2px solid #394252;margin-top:4px;">
        <span style="color:#8d99ab;">Total to max</span>
        <span style="color:#fcd34d;">${xpToMax.toLocaleString()} XP</span>
      </div>`,
      `<div style="font-size:0.8em;color:#8d99ab;margin-top:2px;">
        ~${Math.ceil(xpToMax / 20000).toLocaleString()} Sanctuary &nbsp;|&nbsp;
        ~${Math.ceil(xpToMax / 7000).toLocaleString()} Rank 4 &nbsp;|&nbsp;
        ~${Math.ceil(xpToMax / 2000).toLocaleString()} Rank 3
      </div>`
    ].join('');

    breakdownHtml = `
      <div style="margin-top:12px;">
        <div style="font-size:0.8em;color:#8d99ab;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;">XP Remaining</div>
        ${breakdownRows}
      </div>`;

    if (!atAwakeningPt && tierInfo.awakeningGradeIdx !== null && tierInfo.nextTier) {
      const xpToAwaken = expNeededToReach(wai.rowIndex, gradeIdx, currentExp, tierInfo.awakeningGradeIdx);
      breakdownHtml += `
        <div style="margin-top:8px;padding:8px 12px;background:#0a1e2e;border:1px solid #1e4d6b;border-radius:6px;font-size:0.85em;display:flex;justify-content:space-between;align-items:center;">
          <span><span style="color:#86efac;">Awaken at ${escapeHtml(EXP_GRADES[tierInfo.awakeningGradeIdx])}</span> <span style="color:#8d99ab;">→ ${escapeHtml(tierInfo.nextTier)}</span></span>
          <span style="color:#eef2f7;font-weight:600;">${xpToAwaken.toLocaleString()} XP</span>
        </div>`;
    }
  }

  const awakenBadge = isAtMax
    ? `<div style="margin-top:12px;padding:10px 14px;background:#0a2a1a;border:1px solid #16a34a;border-radius:8px;color:#4ade80;font-weight:600;font-size:0.9em;">
        This piece is at its maximum grade for this tier!
       </div>`
    : atAwakeningPt && tierInfo.nextTier
    ? `<div style="margin-top:12px;padding:10px 14px;background:#0a2a1a;border:1px solid #16a34a;border-radius:8px;color:#4ade80;font-weight:600;font-size:0.9em;">
        Ready to Awaken! Use your scroll to become <strong>${escapeHtml(tierInfo.nextTier)}</strong>.
       </div>`
    : '';

  return `
    <div class="card" id="where-am-i">
      <h3 style="margin-top:0;">Where Am I?</h3>
      <p class="notice" style="margin:0 0 16px 0;">
        Select your gear type and current grade, then enter your current EXP in that grade (first number on your tooltip).
      </p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">
        <div style="grid-column:1/-1;">
          <label style="display:block;font-size:0.8em;color:#8d99ab;margin-bottom:4px;text-transform:uppercase;letter-spacing:0.05em;">Gear Type</label>
          <select onchange="window.updateLibraryGearWAI('rowIndex', parseInt(this.value))"
            style="width:100%;background:#131920;border:1px solid #394252;border-radius:6px;color:#eef2f7;padding:8px 10px;font-size:0.9em;">
            ${rowOptions}
          </select>
        </div>
        <div>
          <label style="display:block;font-size:0.8em;color:#8d99ab;margin-bottom:4px;text-transform:uppercase;letter-spacing:0.05em;">Current Grade</label>
          <select onchange="window.updateLibraryGearWAI('gradeIndex', parseInt(this.value))"
            style="width:100%;background:#131920;border:1px solid #394252;border-radius:6px;color:#eef2f7;padding:8px 10px;font-size:0.9em;">
            ${gradeOptions}
          </select>
        </div>
        <div>
          <label style="display:block;font-size:0.8em;color:#8d99ab;margin-bottom:4px;text-transform:uppercase;letter-spacing:0.05em;">Current XP (first number on tooltip)</label>
          <input type="number" min="0" max="${gradeCost}" value="${currentExp}" placeholder="e.g. 1500000"
            onchange="window.updateLibraryGearWAI('currentExp', parseFloat(this.value) || 0)"
            style="width:100%;background:#131920;border:1px solid #394252;border-radius:6px;color:#eef2f7;padding:8px 10px;font-size:0.9em;box-sizing:border-box;">
          <div style="font-size:0.78em;color:#8d99ab;margin-top:3px;">Max: ${gradeCost.toLocaleString()} EXP</div>
        </div>
      </div>

      <div style="background:#1a2535;border:1px solid #394252;border-radius:10px;padding:16px;">
        <div style="margin-bottom:14px;">
          <div style="font-size:0.78em;color:#8d99ab;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px;">Your Piece</div>
          <div style="font-size:1.05em;font-weight:700;">
            <span style="color:${gradeColor};">${escapeHtml(gradeDef?.name ?? '')}</span>
            <span style="color:${escapeHtml(tierInfo.color)};margin-left:6px;">${escapeHtml(tierInfo.label)}</span>
            <span style="color:#8d99ab;font-weight:400;margin-left:6px;">${escapeHtml(rowType)}</span>
          </div>
        </div>
        <div>
          <div style="display:flex;justify-content:space-between;font-size:0.85em;margin-bottom:6px;">
            <span style="color:#8d99ab;">Grade Progress</span>
            <span style="color:#eef2f7;">${currentExp.toLocaleString()} / ${gradeCost.toLocaleString()} EXP
              <span style="color:${gradeColor};margin-left:4px;">(${progressPct.toFixed(1)}%)</span>
            </span>
          </div>
          <div style="height:10px;background:#0d1b2a;border-radius:5px;overflow:hidden;">
            <div style="height:100%;width:${progressPct.toFixed(1)}%;background:${gradeColor};border-radius:5px;"></div>
          </div>
          ${nextGrade ? `<div style="font-size:0.82em;color:#8d99ab;margin-top:5px;">${remainInGrade.toLocaleString()} XP to reach <span style="color:${GRADE_COLORS[nextGrade.name] || '#eef2f7'};">${escapeHtml(nextGrade.name)}</span></div>` : ''}
        </div>
        ${breakdownHtml}
        ${awakenBadge}
        ${calcProgress ? `
          <div style="margin-top:12px;padding:10px 14px;background:#131920;border:1px solid #394252;border-radius:8px;">
            <div style="font-size:0.78em;color:#8d99ab;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:6px;">Your Enhancers (+${calcExp.toLocaleString()} EXP)</div>
            ${calcProgress.maxed ? `
              <div style="color:#4ade80;font-size:0.9em;">Enough to max this tier!</div>
            ` : calcProgress.gradeIndex > gradeIdx ? `
              <div style="font-size:0.9em;">Lands at: <strong style="color:${GRADE_COLORS[EXP_GRADES[calcProgress.gradeIndex]] || '#eef2f7'};">${escapeHtml(EXP_GRADES[calcProgress.gradeIndex])}</strong></div>
              <div style="font-size:0.85em;color:#8d99ab;margin-top:3px;">${calcProgress.expInGrade.toLocaleString()} EXP into that grade</div>
            ` : `
              <div style="font-size:0.9em;color:#8d99ab;">Not enough to advance grades yet</div>
            `}
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

// ─── Render — EXP requirements table ─────────────────────────────────────────

function renderExpTable() {
  const groups = [];
  let current = null;
  EXP_ROWS.forEach(row => {
    if (row.tierLabel) {
      current = { label: row.tierLabel, awaken: row.awaken, color: getTierColor(row.tierLabel), rows: [] };
      groups.push(current);
    }
    current.rows.push(row);
  });

  const cards = groups.map(group => {
    const activeGrades = EXP_GRADES
      .map((name, i) => ({ name, i }))
      .filter(g => group.rows.some(r => r.values[g.i] !== null && r.values[g.i] > 0));

    const gearRows = group.rows.map((row, ri) => {
      const badges = activeGrades.map(g => {
        const val = row.values[g.i];
        if (!val) return "";
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
          <span style="font-weight:700;color:${group.color};">${escapeHtml(group.label)}</span>
          ${group.awaken ? `<span style="color:#8d99ab;font-size:0.85em;">${escapeHtml(group.awaken)}</span>` : ""}
        </div>
        ${gearRows}
      </div>
    `;
  }).join("");

  return `
    <div class="card" id="exp-requirements">
      <h3 style="margin-top:0;">Disciple's / Immortal Warden EXP Requirements</h3>
      <p class="notice" style="margin:0 0 16px 0;">
        EXP required per grade for each gear type and tier. &nbsp;
        <span style="color:#94a3b8;">■</span> T1 &nbsp;
        <span style="color:#86efac;">■</span> T2 &nbsp;
        <span style="color:#fcd34d;">■</span> T3
      </p>
      ${cards}
    </div>
  `;
}

// ─── Render — specialisation table ───────────────────────────────────────────

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
      <h3 style="margin-top:0;">Specialisation Level — Disciple's</h3>
      <p class="notice" style="margin:0 0 16px 0;">
        EXP, gold, and labor per specialisation level. Armor caps at level 5.
      </p>
      ${rows}
    </div>
  `;
}

// ─── Render — awakening guide ─────────────────────────────────────────────────

function renderAwakeningGuide() {
  return `
    <div class="card" id="awakening">
      <h3 style="margin-top:0;">Awakening Guide</h3>

      <div style="margin-bottom:20px;">
        <h4 style="margin:0 0 8px 0;color:#94a3b8;">Disciple's → Immortal Warden</h4>
        <p class="notice" style="margin:0;line-height:1.6;">${escapeHtml(AWAKENING_DISCIPLE)}</p>
      </div>

      <div>
        <h4 style="margin:0 0 8px 0;color:#fcd34d;">Immortal Warden (Ipnysh Drop)</h4>
        <p class="notice" style="margin:0;line-height:1.6;">${escapeHtml(AWAKENING_IMMORTAL)}</p>
      </div>
    </div>
  `;
}

// ─── Page entry point ─────────────────────────────────────────────────────────

export function renderPage() {
  return `
    <div class="card">
      <h2>Library Gear</h2>
      <p class="notice" style="margin:8px 0 0 0;">
        EXP requirements and specialisation costs for Disciple's and Immortal Warden gear.
      </p>
      <div class="section-nav" style="margin-top:12px;">
        <a href="#where-am-i"       class="section-link">Where Am I?</a>
        <a href="#enhancer-calc"    class="section-link">Enhancer Calculator</a>
        <a href="#exp-requirements" class="section-link">EXP Requirements</a>
        <a href="#specialisation"   class="section-link">Specialisation</a>
        <a href="#awakening"        class="section-link">Awakening Guide</a>
      </div>
    </div>

    ${renderWhereAmI()}
    ${renderEnhancerCalc()}
    ${renderExpTable()}
    ${renderSpecTable()}
    ${renderAwakeningGuide()}
  `;
}

// ─── Window handlers ──────────────────────────────────────────────────────────

window.updateLibraryGearEnhancer = function(key, value) {
  const state = getPageState();
  state.enhancerInputs[key] = Math.max(0, Number(value) || 0);
  savePageState(state);
  window.renderCurrentPage();
};

window.updateLibraryGearWAI = function(field, value) {
  const state = getPageState();
  if (field === "rowIndex") {
    const avail = getAvailableGrades(value);
    state.whereAmI.rowIndex   = value;
    state.whereAmI.gradeIndex = avail[0]?.index ?? 0;
    state.whereAmI.currentExp = 0;
  } else if (field === "gradeIndex") {
    state.whereAmI.gradeIndex = value;
    state.whereAmI.currentExp = 0;
  } else {
    state.whereAmI[field] = value;
  }
  savePageState(state);
  window.renderCurrentPage();
};
