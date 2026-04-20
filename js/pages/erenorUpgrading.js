import { appState } from "../state.js";
import { escapeHtml, formatGold, renderMaterialsGrid } from "../utils.js";

const LOCAL_KEY = "erenorUpgradingState";

const AYANAD_FEED_HEADERS = [
  "basic",
  "grand",
  "rare",
  "arcane",
  "heroic",
  "unique",
  "celestial",
  "divine",
  "epic",
  "legendary",
  "mythic",
  "eternal"
];

const AYANAD_FEED_VALUES = [4308, 4738, 5169, 5600, 6031, 6461, 6892, 7323, 7754, 8184, 8615, 9046];

const AYANAD_ROWS = [
  { amount: 7140, item: "Rice", seeds: 2747, craftedAmount: 357, craftedName: "Small Seed Oil" },
  { amount: 1020, item: "Peanut", seeds: 393, craftedAmount: 34, craftedName: "Viscous Glossy Oil" },
  { amount: 1020, item: "Wheat", seeds: 393, craftedAmount: 357, craftedName: "Fine Lumber" },
  { amount: 7140, item: "Corn", seeds: 2747, craftedAmount: 34, craftedName: "Nuri Forest Lumber" },
  { amount: 3570, item: "Lumber", seeds: 0, craftedAmount: 1, craftedName: "Illustrious Staff Scroll" },
  { amount: 103, item: "Sunlight Archeum Essence", seeds: 0, craftedAmount: 1, craftedName: "" },
  { amount: 134, item: "Archeum Ingot", seeds: 0, craftedAmount: 1, craftedName: "" },
  { amount: 680, item: "Red Coral", seeds: 207, craftedAmount: 1, craftedName: "" },
  { amount: 170, item: "Mysterious Garden Powder", seeds: 0, craftedAmount: 0, craftedName: "" },
  { amount: 1241, item: "Onyx Archeum Essence", seeds: 0, craftedAmount: 0, craftedName: "" },
  { amount: 1, item: "Ayanad Weaponsmiting Scroll", seeds: 0, craftedAmount: 0, craftedName: "" },
  { amount: 12, item: "Gold Ingot", seeds: 0, craftedAmount: 0, craftedName: "" }
];

const STAFF_UPGRADE_STEPS = [
  { step: "Heroic -> Unique", chance: "100%", goldCost: 130, extra: "", method: "Use Weapon Regrade Scroll" },
  { step: "Unique -> Celes", chance: "100%", goldCost: 205, extra: "Red Regrade Charm", method: "Use Weapon Regrade Scroll" },
  { step: "Celes -> Divine", chance: "100%", goldCost: 305, extra: "Celestial Weapon Anchoring Charm: 2X", method: "Use Resplendent Weapon Regrade Scroll" },
  { step: "Divine -> Epic", chance: "20%", goldCost: 433, extra: "Silver Regrade Charm 50% / Superior Red Regrade Charm 40%", method: "Use Resplendent Weapon Regrade Scroll" },
  { step: "Epic -> Leg", chance: "12%", goldCost: 652, extra: "Silver Regrade Charm 30% / Superior Red Regrade Charm 24%", method: "Use Resplendent Weapon Regrade Scroll" },
  { step: "Leg -> Mythic", chance: "5%", goldCost: 933, extra: "Silver Regrade Charm 12% / Superior Red Regrade Charm 10%", method: "Use Resplendent Weapon Regrade Scroll" },
  { step: "Mythic -> Eternal", chance: "2%", goldCost: 1380, extra: "Silver Regrade Charm 5% / Superior Red Regrade Charm 4%", method: "Use Weapon Regrade Scroll" }
];

const STAFF_VALUE_ROWS = [
  { label: "Divine staff", value: 20106.58, craftValue: 9000 },
  { label: "Epic staff", value: 25419.58, craftValue: 16000 },
  { label: "Legy staff", value: 27531.58, craftValue: 65000 },
  { label: "Mythic staff", value: 29924.58, craftValue: 100000 },
  { label: "Eternal staff", value: 32184.58, craftValue: 120000 }
];

const TAP_COST_REFERENCE = [
  { staff: "Heroic staff", setup: "--", gold: 19165.558, labor: 9051 },
  { staff: "Divine staff", setup: "Celest + Resp", gold: 21358.058, labor: 150 },
  { staff: "Epic staff", setup: "Silver + Resp", gold: 26991.058, labor: 50 },
  { staff: "Legy staff", setup: "Sup Red + Resp", gold: 29543.058, labor: 50 },
  { staff: "Mythic staff", setup: "Sup Red + Resp", gold: 32376.058, labor: 50 },
  { staff: "Eternal staff", setup: "Sup Red", gold: 35056.058, labor: 50 }
];

const REGRADE_ITEMS = [
  { item: "Weapon Regrade Scroll", needPerStaff: 9 },
  { item: "Red Regrade", needPerStaff: 2 },
  { item: "Celecsial Weapon Anchor Charm: 2X", needPerStaff: 1 },
  { item: "Resplendent Weapon Regrade Scroll", needPerStaff: 4 },
  { item: "Superior Red Regrade Charm", needPerStaff: 2.2 },
  { item: "Silver Regrade Charm", needPerStaff: 1 }
];

const DIVINE_ANCHOR_ROWS = [
  { amount: 300, item: "Stone Brick", seeds: 0, craftedAmount: 30, craftedName: "Opaque Polish" },
  { amount: 90, item: "Onyx Archeum Essence", seeds: 0, craftedAmount: 30, craftedName: "Sturdy Stone" },
  { amount: 600, item: "Narcissus", seeds: 231, craftedAmount: 30, craftedName: "Divine Weapon Anchoring Shard" },
  { amount: 600, item: "Azalea", seeds: 231, craftedAmount: 1, craftedName: "Divine Weapon Anchoring Emblem" },
  { amount: 300, item: "Sunlight Archeum Crystal", seeds: 0, craftedAmount: 1, craftedName: "Divine Weapon Anchoring Charm" },
  { amount: 2, item: "Lucky Sunpoint", seeds: 0, craftedAmount: 0, craftedName: "" }
];

const EPIC_ANCHOR_ROWS = [
  { amount: 900, item: "Stone Brick", seeds: 0, craftedAmount: 90, craftedName: "Opaque Polish" },
  { amount: 270, item: "Onyx Archeum Essence", seeds: 0, craftedAmount: 90, craftedName: "Sturdy Stone" },
  { amount: 1800, item: "Narcissus", seeds: 693, craftedAmount: 30, craftedName: "Epic Weapon Anchoring Shard" },
  { amount: 1800, item: "Azalea", seeds: 693, craftedAmount: 1, craftedName: "Epic Weapon Anchoring Emblem" },
  { amount: 90, item: "Sunlight Archeum Essence", seeds: 0, craftedAmount: 1, craftedName: "Epic Weapon Anchoring Charm" },
  { amount: 7, item: "Lucky Sunpoint", seeds: 0, craftedAmount: 0, craftedName: "" }
];

const EXP_REQUIREMENT_HEADERS = [
  "Grand",
  "Rare",
  "Arcane",
  "Heroic",
  "Unique",
  "Celestial",
  "Divine",
  "Epic",
  "Legendary",
  "Mythic",
  "Eternal"
];

const EXP_REQUIREMENT_ROWS = [
  { type: "T1 Erenor", values: ["", "", 5503, 7805, 10458, 13449, 17950, 24371, 31649, 41481, 54419], tier: "T1", totalExp: 207085 },
  { type: "T2 Erenor", values: ["", "", "", "", "", "", "", "", 31649, 41841, 54419], tier: "T2", totalExp: 127909 },
  { type: "T3 Erenor", values: ["", "", "", "", "", "", "", "", "", 41841, 108383], tier: "T3", totalExp: 150224 },
  { type: "T4 Erenor", values: ["", "", "", "", "", "", "", "", "", 41841, 176952], tier: "T4", totalExp: 218793 },
  { type: "Erenor Infusion (Craft)", values: ["", "", 2.8, 3.9, 5.2, 6.7, 9.0, 12.2, 15.8, 20.7, ""], tier: "", totalExp: "" },
  { type: "", values: ["", "", "", "", 43938.0, 7323, 7754, 8184, 8615, "", ""], tier: "", totalExp: "" }
];

const OVERFEED_HEADERS = [
  "Arcane",
  "Heroic",
  "Unique",
  "Celestial",
  "Divine",
  "Epic",
  "Legendary",
  "Mythic",
  "Eternal"
];

const OVERFEED_ROWS = [
  {
    label: "T1 Erenor",
    values: [5503, 7805, 10458, 13449, 17950, 24371, 31649, 41481, 54419],
    sideA: "",
    sideB: 25979,
    sideC: "",
    sideD: ""
  },
  {
    label: "infusions",
    values: [6, 5, 6, 7, 9, 12, 16, 20, ""],
    sideA: "",
    sideB: 15508,
    sideC: "",
    sideD: ""
  },
  {
    label: "Exp in to next grade",
    values: [6497, 8692, 10234, 10785, 10835, 10464, 10815, 9334, 0],
    sideA: "",
    sideB: 38770,
    sideC: 9692.5,
    sideD: ""
  },
  {
    label: "",
    values: ["", "", "", "", 17231, "", "", "", ""],
    sideA: "",
    sideB: "",
    sideC: "",
    sideD: ""
  }
];

const SPECIAL_ROWS = [
  { level: "1", weaponExp: 311, weaponGold: 500, weaponLabor: 550, armorLevel: "1", armorExp: 233, armorGold: 250, armorLabor: 220, noteA: "Weapon (lv 10)", noteB: "6x Staff", noteC: "5x Staff 1x Inf", noteD: "Gear (lv 5)", noteE: "", noteF: "Shield/Flute (lv 0)" },
  { level: "2", weaponExp: 622, weaponGold: 750, weaponLabor: 600, armorLevel: "2", armorExp: 466, armorGold: 375, armorLabor: 240, noteA: "Mythic", noteB: 41481, noteC: 41481, noteD: "Mythic + Lv 5", noteE: 44979, noteF: 41481 },
  { level: "3", weaponExp: 933, weaponGold: 1000, weaponLabor: 650, armorLevel: "3", armorExp: 700, armorGold: 500, armorLabor: 260, noteA: "Staff XP", noteB: 49104, noteC: 42920, noteD: "6x Staff", noteE: 49104, noteF: 49104 },
  { level: "4", weaponExp: 1244, weaponGold: 1250, weaponLabor: 700, armorLevel: "4", armorExp: 933, armorGold: 625, armorLabor: 280, noteA: "Leftover XP", noteB: 7623, noteC: 1439, noteD: "Leftover exp", noteE: 4125, noteF: 7623 },
  { level: "5", weaponExp: 1555, weaponGold: 1500, weaponLabor: 750, armorLevel: "5", armorExp: 1166, armorGold: 750, armorLabor: 300, noteA: "% to hit (LEG)", noteB: "75.91%", noteC: "95.45%", noteD: "% to hit (LEG)", noteE: "86.97%", noteF: "75.91%" },
  { level: "6", weaponExp: 1866, weaponGold: 1750, weaponLabor: 800, armorLevel: "6", armorExp: "", armorGold: "", armorLabor: "", noteA: "XP number", noteB: 24026, noteC: 30210, noteD: "XP number", noteE: 27524, noteF: 24026 },
  { level: "7", weaponExp: 2177, weaponGold: 2000, weaponLabor: 850, armorLevel: "7", armorExp: "", armorGold: "", armorLabor: "", noteA: "XP off mythic", noteB: 7623, noteC: 1439, noteD: "XP off mythic", noteE: 4125, noteF: 7623 },
  { level: "8", weaponExp: 2488, weaponGold: 2250, weaponLabor: 900, armorLevel: "8", armorExp: "", armorGold: "", armorLabor: "", noteA: "", noteB: "", noteC: "", noteD: "", noteE: "", noteF: "" },
  { level: "9", weaponExp: 2799, weaponGold: 2500, weaponLabor: 950, armorLevel: "9", armorExp: "", armorGold: "", armorLabor: "", noteA: "", noteB: "", noteC: "", noteD: "", noteE: "", noteF: "" },
  { level: "10", weaponExp: 3110, weaponGold: 2750, weaponLabor: 1000, armorLevel: "10", armorExp: "", armorGold: "", armorLabor: "", noteA: "", noteB: "", noteC: "", noteD: "", noteE: "", noteF: "" },
  { level: "Total", weaponExp: 17105, weaponGold: 16250, weaponLabor: 7750, armorLevel: "Total", armorExp: 3498, armorGold: 2500, armorLabor: 1300, noteA: "", noteB: "", noteC: "", noteD: "", noteE: "", noteF: "" },
  { level: "Lv 1-4", weaponExp: 3110, weaponGold: 3500, weaponLabor: 2500, armorLevel: "Lv 1-2", armorExp: 699, armorGold: 625, armorLabor: 460, noteA: "", noteB: "", noteC: "", noteD: "", noteE: "", noteF: "" },
  { level: "LV 5-10", weaponExp: 13995, weaponGold: 12750, weaponLabor: 5250, armorLevel: "LV 3-5", armorExp: 2799, armorGold: 1875, armorLabor: 840, noteA: "", noteB: "", noteC: "", noteD: "", noteE: "", noteF: "" }
];

const TEMPER_ROWS = [
  { level: "0 > 10", chance: "100.00%", downgrade: "0%", great: "20%" },
  { level: "10 > 11", chance: "87.7%", downgrade: "0%", great: "20%" },
  { level: "11 > 12", chance: "74.4%", downgrade: "0%", great: "20%" },
  { level: "12 > 13", chance: "65.2%", downgrade: "0%", great: "20%" },
  { level: "13 > 14", chance: "57.6%", downgrade: "0%", great: "20%" },
  { level: "14 > 15", chance: "51.0%", downgrade: "0%", great: "20%" },
  { level: "15 > 16", chance: "45.2%", downgrade: "0%", great: "20%" },
  { level: "16 > 17", chance: "39.8%", downgrade: "0%", great: "20%" },
  { level: "17 > 18", chance: "34.8%", downgrade: "0%", great: "20%" },
  { level: "18 > 19", chance: "30.0%", downgrade: "50%", great: "20%" },
  { level: "19 > 20", chance: "25.3%", downgrade: "50%", great: "20%" },
  { level: "20 > 21", chance: "20.6%", downgrade: "50%", great: "20%" },
  { level: "21 > 22", chance: "16.9%", downgrade: "50%", great: "20%" },
  { level: "22 > 23", chance: "13.4%", downgrade: "50%", great: "20%" },
  { level: "23 > 24", chance: "10.6%", downgrade: "50%", great: "20%" },
  { level: "24 > 25", chance: "8.3%", downgrade: "50%", great: "20%" },
  { level: "25 > 26", chance: "6.5%", downgrade: "50%", great: "20%" },
  { level: "26 > 27", chance: "5.0%", downgrade: "50%", great: "20%" },
  { level: "27 > 28", chance: "3.7%", downgrade: "50%", great: "20%" },
  { level: "28 > 29", chance: "2.6%", downgrade: "50%", great: "20%" },
  { level: "29 > 30", chance: "1.7%", downgrade: "50%", great: "0%" }
];

const TEMPER_NOTES = [
  `You can use Resplendent Solar/Lunar Temper to increase a chance of "Great Success" (+2). You can craft it on "Regal Alchemy Table" for 10 Solar/Lunar Temper & 1 Lucky Sun/Moonpoint.`,
  `You can use "Tempering Crystal" to increase the success rate by 1.5. There is also a cash-shop item that increases the success rate by 2.0.`,
  `From +10 to +14 you can use "Lesser Tempering Crystal" to get 100% success rate.`,
  `You can get "Solar & Lunar Temper" from farmed crates and from mining the Mysterious Minerals in the Western Hiram Mountains.`,
  `Only take your weapon/armor up to +20 if it's not T3 Erenor yet.`,
  `Once you hit T3 Erenor, temper to +23 without Anchoring Charms. After that, only use Anchoring Charms.`
];

function getPageState() {
  return JSON.parse(localStorage.getItem(LOCAL_KEY) || "{}");
}

function savePageState(value) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(value));
}

function getStaffCount() {
  const state = getPageState();
  return Math.max(1, Number(state.staffCount) || 1);
}

function saveStaffCount(value) {
  const state = getPageState();
  state.staffCount = Math.max(1, Number(value) || 1);
  savePageState(state);
}

function formatCell(value, digits = 0) {
  if (value === "" || value === null || value === undefined) return "";
  if (typeof value === "string") return escapeHtml(value);
  return Number(value).toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  });
}

function getPrice(item) {
  return Number(appState.prices[item] || 0);
}

function getStorage(item) {
  return Number(appState.storage[item] || 0);
}

function buildMaterialRows(rows, multiplier) {
  return rows.map((row) => {
    const required = row.amount * multiplier;
    const storage = getStorage(row.item);
    const price = getPrice(row.item);
    const stillNeed = Math.max(0, required - storage);
    const goldStillNeed = stillNeed * price;
    const totalGold = required * price;
    const seeds = row.seeds ? row.seeds * multiplier : 0;
    const craftedAmount = row.craftedAmount ? row.craftedAmount * multiplier : 0;

    return {
      ...row,
      required,
      storage,
      price,
      stillNeed,
      goldStillNeed,
      totalGold,
      seeds,
      craftedAmount
    };
  });
}

function sumGold(rows, key) {
  return rows.reduce((sum, row) => sum + Number(row[key] || 0), 0);
}

// ─── Where Am I ───────────────────────────────────────────────────────────────

const WAI_KEY_EU = 'erenorUpgradingWAI';

const EU_GRADES = ['Heroic', 'Unique', 'Celestial', 'Divine', 'Epic', 'Legendary', 'Mythic', 'Eternal'];

const EU_GRADE_COLORS = {
  Heroic:    '#c084fc',
  Unique:    '#fb923c',
  Celestial: '#fbbf24',
  Divine:    '#f87171',
  Epic:      '#6b8cba',
  Legendary: '#fcd34d',
  Mythic:    '#ef4444',
  Eternal:   '#67e8f9',
};

function getWAIGrade() { return localStorage.getItem(WAI_KEY_EU) || 'Heroic'; }
function saveWAIGrade(g) { localStorage.setItem(WAI_KEY_EU, g); }

function renderEUWhereAmI() {
  const currentGrade = getWAIGrade();
  const currentIdx   = EU_GRADES.indexOf(currentGrade);
  const color        = EU_GRADE_COLORS[currentGrade] || '#566174';
  const doneSteps    = currentIdx; // steps completed = index of current grade
  const totalSteps   = STAFF_UPGRADE_STEPS.length;
  const pct          = totalSteps > 0 ? Math.round((doneSteps / totalSteps) * 100) : 0;
  const remaining    = STAFF_UPGRADE_STEPS.slice(doneSteps);

  const gradeOpts = EU_GRADES.map(g => {
    const c = EU_GRADE_COLORS[g] || '#eef2f7';
    return `<option value="${escapeHtml(g)}" ${g === currentGrade ? 'selected' : ''} style="color:${c};">${escapeHtml(g)}</option>`;
  }).join('');

  const stepRows = remaining.map(s => `
    <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;padding:8px 0;border-bottom:1px solid #1e2a38;">
      <div style="font-size:0.88em;color:#eef2f7;">${escapeHtml(s.step)}</div>
      <div style="display:flex;gap:14px;font-size:0.82em;flex-shrink:0;">
        <span style="color:#fcd34d;">${escapeHtml(s.chance)}</span>
        <span style="color:#8d99ab;">${formatGold(s.goldCost)}</span>
      </div>
    </div>
  `).join('');

  return `
    <div class="card" id="eu-where-am-i">
      <h3 style="margin-top:0;">Where Am I?</h3>
      <p class="notice" style="margin:0 0 16px 0;">
        Select your staff's current grade to see remaining upgrade steps to Eternal.
      </p>
      <div style="margin-bottom:16px;">
        <label style="display:block;font-size:0.8em;color:#8d99ab;margin-bottom:4px;text-transform:uppercase;letter-spacing:0.05em;">Current Grade</label>
        <select onchange="window.updateEUWhereAmI(this.value)"
          style="width:100%;max-width:260px;background:#131920;border:1px solid #394252;border-radius:6px;color:#eef2f7;padding:8px 10px;font-size:0.9em;">
          ${gradeOpts}
        </select>
      </div>
      <div style="background:#1a2535;border:1px solid #394252;border-radius:10px;padding:16px;">
        <div style="margin-bottom:${remaining.length ? '12px' : '0'};">
          <div style="font-size:0.78em;color:#8d99ab;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px;">Your Staff</div>
          <div style="font-size:1.05em;font-weight:700;color:${color};">${escapeHtml(currentGrade)}</div>
          <div style="margin-top:6px;">
            <div style="height:10px;background:#0d1b2a;border-radius:5px;overflow:hidden;">
              <div style="height:100%;width:${pct}%;background:${color};border-radius:5px;transition:width 0.3s ease;"></div>
            </div>
            <div style="font-size:0.78em;color:#8d99ab;margin-top:3px;">${doneSteps} / ${totalSteps} steps completed</div>
          </div>
        </div>
        ${currentGrade === 'Eternal'
          ? `<div style="color:#4ade80;font-weight:700;padding-top:4px;">Your staff is fully upgraded!</div>`
          : `<div style="font-size:0.82em;color:#8d99ab;font-weight:600;margin-bottom:4px;">${remaining.length} step${remaining.length !== 1 ? 's' : ''} remaining</div>
             ${stepRows}`
        }
      </div>
    </div>
  `;
}

function renderAnchorNav() {
  const links = [
    ["#eu-where-am-i",   "Where Am I?"],
    ["#ayanad-staff", "Ayanad Staff"],
    ["#staff-upgrading", "Staff Upgrading"],
    ["#exp-requirements", "EXP Requirements"],
    ["#overfeeding", "Overfeeding"],
    ["#specialisation", "Specialisation"],
    ["#tempering", "Tempering"]
  ];

  return `
    <div class="card">
      <h2>Erenor Upgrading</h2>
      <p class="notice">Read-only reference sections from the sheet, with Ayanad Staff quantity driving the live craft cost tables.</p>
      <div class="section-nav">
        ${links.map(([href, label]) => `<a href="${href}" class="section-link">${escapeHtml(label)}</a>`).join("")}
      </div>
    </div>
  `;
}

function renderAyanadStaffSection(staffCount, ayanadRows) {
  const totalStillNeed = sumGold(ayanadRows, "goldStillNeed");
  const totalGold = sumGold(ayanadRows, "totalGold");

  return `
    <div class="card" id="ayanad-staff">
      <div style="display:flex;justify-content:space-between;align-items:flex-end;gap:12px;flex-wrap:wrap;margin-bottom:12px;">
        <div>
          <h3 style="margin:0;">Ayanad Staff</h3>
          <p class="notice" style="margin:6px 0 0 0;">Feed EXP first, then the craft table below it. Craft cost totals stay in this section.</p>
        </div>
        <div>
          <label style="display:block;margin-bottom:4px;">Enter how many staffs you want to craft:</label>
          <input type="number" min="1" value="${staffCount}" onchange="window.updateErenorUpgradingStaffCount(this.value)">
        </div>
      </div>

      <div class="table-wrap" style="margin-bottom:16px;">
        <table>
          <thead>
            <tr>
              <th>Ayanad Feed EXP</th>
              ${AYANAD_FEED_HEADERS.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Ayanad Staff</td>
              ${AYANAD_FEED_VALUES.map((value) => `<td>${formatCell(value)}</td>`).join("")}
            </tr>
          </tbody>
        </table>
      </div>

      ${renderMaterialsGrid(ayanadRows.map(row => ({
        name:          row.item,
        required:      row.required,
        inStorage:     row.storage,
        price:         row.price,
        stillNeed:     row.stillNeed,
        goldStillNeed: row.goldStillNeed,
        totalGold:     row.totalGold,
        seeds:         row.seeds || 0,
        crafted:       row.craftedAmount && row.craftedName
                         ? `${row.craftedAmount.toLocaleString()}\u00d7 ${row.craftedName}`
                         : null
      })))}
    </div>
  `;
}

function renderStaffUpgradingSection(staffCount) {
  const regradeRows = REGRADE_ITEMS.map((row) => {
    const needTotal = row.needPerStaff * staffCount;
    const storage = getStorage(row.item);
    const price = getPrice(row.item);
    const stillNeed = Math.max(0, needTotal - storage);
    const totalCost = stillNeed * price;

    return {
      ...row,
      needTotal,
      storage,
      price,
      stillNeed,
      totalCost
    };
  });

  const totalTapMaterials = regradeRows.reduce((sum, row) => sum + row.totalCost, 0);

  const state = getPageState();
const divineQty = Math.max(1, Number(state.divineCharmQty) || 1);
const epicQty = Math.max(1, Number(state.epicCharmQty) || 1);

const divineRows = buildMaterialRows(DIVINE_ANCHOR_ROWS, divineQty);
  const epicRows = buildMaterialRows(EPIC_ANCHOR_ROWS, epicQty);

  const divineTotal = sumGold(divineRows, "goldStillNeed");
  const epicTotal = sumGold(epicRows, "goldStillNeed");

  return `
    <div class="card" id="staff-upgrading">
      <h3 style="margin-top:0;">Staff Upgrading</h3>
      <p class="notice">Read-only guide block from the sheet, with your current staff count carried into the supporting cost tables.</p>

      <div class="notice" style="margin-bottom:14px;">
        <strong>Flow:</strong>
        Illustrious scroll -> Magnificent scroll -> 3 Weapon regrade scroll (take to unique) -> Epherium scroll ->
        3 Weapon regrade scroll + Red Regrade Charm (take to Celestial) -> Delphinad scroll -> Follow list below
      </div>

      <div class="table-wrap" style="margin-bottom:18px;">
        <table>
          <thead>
            <tr>
              <th>ONLY ONCE AYANAD</th>
              <th>Starts Heroic</th>
              <th>Gold Cost</th>
              <th>Extra</th>
              <th>Method</th>
            </tr>
          </thead>
          <tbody>
            ${STAFF_UPGRADE_STEPS.map((row) => `
              <tr>
                <td>${escapeHtml(row.step)}</td>
                <td>${escapeHtml(row.chance)}</td>
                <td>${formatCell(row.goldCost)}</td>
                <td>${escapeHtml(row.extra)}</td>
                <td>${escapeHtml(row.method)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:16px;">
        <div>
          <h4 style="margin:0 0 8px 0;">Value Reference</h4>
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Total Staff</th>
                  <th>Value</th>
                  <th>Total Craft</th>
                  <th>Fail Cost</th>
                  <th>Total Value</th>
                </tr>
              </thead>
              <tbody>
                ${STAFF_VALUE_ROWS.map((row) => `
                  <tr>
                    <td>${formatCell(staffCount)}</td>
                    <td>${escapeHtml(row.label)}</td>
                    <td class="price-text">${formatGold(row.value)}</td>
                    <td>${formatCell(row.craftValue)}</td>
                    <td>0</td>
                    <td>0</td>
                  </tr>
                `).join("")}
                <tr>
                  <td colspan="5"><strong>Win / Loss</strong></td>
                  <td>0</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h4 style="margin:0 0 8px 0;">Cost to Tap</h4>
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Staff</th>
                  <th>Setup</th>
                  <th>Gold</th>
                  <th>Labor</th>
                </tr>
              </thead>
              <tbody>
                ${TAP_COST_REFERENCE.map((row) => `
                  <tr>
                    <td>${escapeHtml(row.staff)}</td>
                    <td>${escapeHtml(row.setup)}</td>
                    <td class="price-text">${formatGold(row.gold)}</td>
                    <td>${formatCell(row.labor)}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div style="margin-top:18px;">
        <h4 style="margin:0 0 8px 0;">Regrading Materials</h4>
        ${renderMaterialsGrid(regradeRows.map(row => ({
          name:          row.item,
          required:      row.needTotal,
          inStorage:     row.storage,
          price:         row.price,
          stillNeed:     row.stillNeed,
          goldStillNeed: row.totalCost,
          totalGold:     row.needTotal * row.price
        })))}
      </div>

      <div style="margin-top:18px;display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:16px;">
        <div>
          <h4 style="margin:0 0 8px 0;">Divine Weapon Anchor Charm</h4>
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
            <input type="number" min="1" value="${divineQty}" onchange="window.setDivineCharmQty(this.value)" style="width:60px;">
            <span>← Enter how many you want</span>
          </div>
          ${renderMaterialsGrid(divineRows.map(row => ({
            name:          row.item,
            required:      row.required,
            inStorage:     row.storage,
            price:         row.price,
            stillNeed:     row.stillNeed,
            goldStillNeed: row.goldStillNeed,
            totalGold:     row.totalGold,
            seeds:         row.seeds || 0,
            crafted:       row.craftedAmount && row.craftedName
                             ? `${row.craftedAmount.toLocaleString()}\u00d7 ${row.craftedName}`
                             : null
          })))}
        </div>

        <div>
          <h4 style="margin:0 0 8px 0;">Epic Weapon Anchor Charm</h4>
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
            <input type="number" min="1" value="${epicQty}" onchange="window.setEpicCharmQty(this.value)" style="width:60px;">
            <span>← Enter how many you want</span>
          </div>
          ${renderMaterialsGrid(epicRows.map(row => ({
            name:          row.item,
            required:      row.required,
            inStorage:     row.storage,
            price:         row.price,
            stillNeed:     row.stillNeed,
            goldStillNeed: row.goldStillNeed,
            totalGold:     row.totalGold,
            seeds:         row.seeds || 0,
            crafted:       row.craftedAmount && row.craftedName
                             ? `${row.craftedAmount.toLocaleString()}\u00d7 ${row.craftedName}`
                             : null
          })))}
        </div>
      </div>
    </div>
  `;
}

function renderExpRequirementsSection() {
  return `
    <div class="card" id="exp-requirements">
      <h3 style="margin-top:0;">Erenor Gear, Weapon, Accessory Exp Requirements</h3>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Type</th>
              ${EXP_REQUIREMENT_HEADERS.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}
              <th>Tier</th>
              <th>Total Exp</th>
            </tr>
          </thead>
          <tbody>
            ${EXP_REQUIREMENT_ROWS.map((row) => `
              <tr>
                <td>${row.type ? escapeHtml(row.type) : ""}</td>
                ${row.values.map((value) => `<td>${formatCell(value, typeof value === "number" && String(value).includes(".") ? 1 : 0)}</td>`).join("")}
                <td>${row.tier ? escapeHtml(row.tier) : ""}</td>
                <td>${row.totalExp !== "" ? formatCell(row.totalExp) : ""}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderOverfeedingSection() {
  return `
    <div class="card" id="overfeeding">
      <h3 style="margin-top:0;">Overfeeding with lower tier crafted infusions</h3>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th></th>
              ${OVERFEED_HEADERS.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}
              <th></th>
              <th></th>
              <th></th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${OVERFEED_ROWS.map((row) => `
              <tr>
                <td>${row.label ? escapeHtml(row.label) : ""}</td>
                ${row.values.map((value) => `<td>${formatCell(value, typeof value === "number" && String(value).includes(".") ? 1 : 0)}</td>`).join("")}
                <td>${formatCell(row.sideA)}</td>
                <td>${formatCell(row.sideB, typeof row.sideB === "number" && String(row.sideB).includes(".") ? 1 : 0)}</td>
                <td>${formatCell(row.sideC, typeof row.sideC === "number" && String(row.sideC).includes(".") ? 1 : 0)}</td>
                <td>${formatCell(row.sideD)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderSpecialisationSection() {
  return `
    <div class="card" id="specialisation">
      <h3 style="margin-top:0;">Specialisation Level & Erenor feeding</h3>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th></th>
              <th colspan="3">Weapon</th>
              <th colspan="4">Armor</th>
              <th></th>
              <th colspan="3">Leg -> Mythic 99%</th>
              <th colspan="3">Leg -> Eternal</th>
            </tr>
            <tr>
              <th>Level</th>
              <th>Exp.</th>
              <th>Gold</th>
              <th>Labor</th>
              <th>Level</th>
              <th>Exp.</th>
              <th>Gold</th>
              <th>Labor</th>
              <th></th>
              <th></th>
              <th></th>
              <th></th>
              <th></th>
              <th></th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${SPECIAL_ROWS.map((row) => `
              <tr>
                <td>${escapeHtml(row.level)}</td>
                <td>${formatCell(row.weaponExp)}</td>
                <td>${formatCell(row.weaponGold)}</td>
                <td>${formatCell(row.weaponLabor)}</td>
                <td>${escapeHtml(row.armorLevel)}</td>
                <td>${formatCell(row.armorExp)}</td>
                <td>${formatCell(row.armorGold)}</td>
                <td>${formatCell(row.armorLabor)}</td>
                <td></td>
                <td>${formatCell(row.noteA)}</td>
                <td>${formatCell(row.noteB)}</td>
                <td>${formatCell(row.noteC)}</td>
                <td>${formatCell(row.noteD)}</td>
                <td>${formatCell(row.noteE)}</td>
                <td>${formatCell(row.noteF)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderTemperingSection() {
  return `
    <div class="card" id="tempering">
      <h3 style="margin-top:0;">Tempering</h3>
      <div class="table-wrap" style="margin-bottom:16px;">
        <table>
          <thead>
            <tr>
              <th>Tempering Lvl</th>
              <th>Chance %</th>
              <th>Downgrade Chance %</th>
              <th>Great Success %</th>
            </tr>
          </thead>
          <tbody>
            ${TEMPER_ROWS.map((row) => `
              <tr>
                <td>${escapeHtml(row.level)}</td>
                <td>${escapeHtml(row.chance)}</td>
                <td>${escapeHtml(row.downgrade)}</td>
                <td>${escapeHtml(row.great)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>

      <div class="notice">
        ${TEMPER_NOTES.map((note) => `<p style="margin:0 0 8px 0;">• ${escapeHtml(note)}</p>`).join("")}
      </div>
    </div>
  `;
}

export function renderPage() {
  const staffCount = getStaffCount();
  const ayanadRows = buildMaterialRows(AYANAD_ROWS, staffCount);

  return `
    ${renderAnchorNav()}
    ${renderEUWhereAmI()}
    ${renderAyanadStaffSection(staffCount, ayanadRows)}
    ${renderStaffUpgradingSection(staffCount)}
    ${renderExpRequirementsSection()}
    ${renderOverfeedingSection()}
    ${renderSpecialisationSection()}
    ${renderTemperingSection()}
  `;
}

window.updateEUWhereAmI = function(grade) {
  saveWAIGrade(grade);
  window.renderCurrentPage();
};

window.updateErenorUpgradingStaffCount = function(value) {
  saveStaffCount(value);
  window.renderCurrentPage();
};
window.setDivineCharmQty = (val) => {
  const state = getPageState();
  state.divineCharmQty = Math.max(1, Number(val) || 1);
  savePageState(state);
  window.renderErenorUpgrading?.();
};

window.setEpicCharmQty = (val) => {
  const state = getPageState();
  state.epicCharmQty = Math.max(1, Number(val) || 1);
  savePageState(state);
  window.renderErenorUpgrading?.();
};