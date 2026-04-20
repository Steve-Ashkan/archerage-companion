const UPGRADE_REFERENCE_ROWS = [
  { step: "1 ➜ 2", weapon: "2× Gedlon", armor: "1× Herstan", accessory: "4× Yordan + 2× Demigod" },
  { step: "2 ➜ 3", weapon: "4× Gedlon + 1× Demigod", armor: "2× Herstan + 1× Demigod", accessory: "15× Yordan + 1× Demigod" },
  { step: "3 ➜ 4", weapon: "7× Gedlon + 1× Demigod", armor: "3× Herstan + 1× Demigod", accessory: "22× Yordan + 1× Demigod" },
  { step: "4 ➜ 5", weapon: "8× Gedlon + 2× Demigod", armor: "4× Herstan + 2× Demigod", accessory: "" },
  { step: "5 ➜ 6", weapon: "11× Gedlon + 1× Demigod", armor: "4× Herstan + 2× Demigod", accessory: "" },
  { step: "6 ➜ 7", weapon: "12× Gedlon + 1× Demigod", armor: "6× Herstan + 1× Demigod", accessory: "" },
  { step: "7 ➜ 8", weapon: "14× Gedlon", armor: "6× Herstan + 2× Demigod", accessory: "" },
  { step: "8 ➜ 9", weapon: "15× Gedlon", armor: "7× Herstan + 1× Demigod", accessory: "" },
  { step: "9 ➜ 10", weapon: "16× Gedlon", armor: "8× Herstan", accessory: "" }
];

const ARMOR_ARTIFACT = {
  title: "Armor Artifacts",
  intro:
    "Leveling up your Armor Artifacts will increase their Physical Defence, Magical Defence and Gearscore. Once you hit Lv 5 and Lv 10 it will also let you choose an extra effect.",
  optionBlocks: [
    {
      title: "For Artifact level 5 your options are",
      color: "#ffef63",
      items: ["Strength 20", "Agility 20", "Stamina 20", "Intelligence 20", "Spirit 20"]
    },
    {
      title: "For Artifact level 10 your options are",
      color: "#ff9d2e",
      items: ["Resilience 192", "Max Health 187", "Move Speed 0.5%", "Toughness 104"]
    }
  ],
  rows: [
    { level: "Level 2", exp: "100", rune: "Ewan's Rune Rank 1", noEssence: "1 Herstan Resilience", withEssence: "", noCost: ["110", "0", "4g 44s 91c"], withCost: ["", "", "", ""] },
    { level: "Level 3", exp: "300", rune: "Ewan's Rune Rank 1", noEssence: "3 Herstan Resiliences", withEssence: "", noCost: ["180", "0", "14g 68s 20c"], withCost: ["", "", "", ""] },
    { level: "Level 4", exp: "500", rune: "Ewan's Rune Rank 1", noEssence: "5 Herstan Resiliences", withEssence: "", noCost: ["250", "0", "26g 69s 45c"], withCost: ["", "", "", ""] },
    { level: "Level 5", exp: "700", rune: "Ewan's Rune Rank 2", noEssence: "7 Herstan Resiliences", withEssence: "4 Herstan Resiliences + 4 Demigod Essences", noCost: ["470", "10", "53g 38s 90c"], withCost: ["365", "10", "400", "25g 72s 56c"] },
    { level: "Level 6", exp: "900", rune: "Ewan's Rune Rank 2", noEssence: "9 Herstan Resiliences", withEssence: "6 Herstan Resiliences + 4 Demigod Essences", noCost: ["540", "10", "106g 77s 87c"], withCost: ["435", "10", "400", "67g 46s 62c"] },
    { level: "Level 7", exp: "1100", rune: "Ewan's Rune Rank 2", noEssence: "11 Herstan Resiliences", withEssence: "8 Herstan Resiliences + 4 Demigod Essences", noCost: ["610", "10", "213g 55s 73c"], withCost: ["505", "10", "400", "143g 14s 08c"] },
    { level: "Level 8", exp: "1200", rune: "Ewan's Rune Rank 3", noEssence: "12 Herstan Resiliences", withEssence: "9 Herstan Resiliences + 4 Demigod Essences", noCost: ["1095", "60", "533g 89s 20c"], withCost: ["990", "60", "400", "365g 54s 75c"] },
    { level: "Level 9", exp: "1300", rune: "Ewan's Rune Rank 3", noEssence: "13 Herstan Resiliences", withEssence: "10 Herstan Resiliences + 4 Demigod Essences", noCost: ["1130", "60", "1334g 73s 08c"], withCost: ["1025", "60", "400", "930g 14s 84c"] },
    { level: "Level 10", exp: "1400", rune: "Ewan's Rune Rank 3", noEssence: "14 Herstan Resiliences", withEssence: "8 Herstan Resiliences + 8 Demigod Essences", noCost: ["1165", "60", "3336g 82s 72c"], withCost: ["955", "60", "800", "1906g 75s 84c"] }
  ],
  totals: {
    exp: "7500",
    noEssence: "75 Herstan Resiliences",
    withEssence: "45 Herstan Resiliences + 28 Demigod Essences",
    noCost: ["5550", "210", "5625g 00s 06c"],
    withCost: ["4275", "210", "2800", "3438g 78s 69c"]
  },
  summary: {
    perPieceNo: "11100 Akash Tokens, 210 Serpent Scales, 5625g 00s 06c",
    perPieceWith: "8480 Akash Tokens, 210 Serpent Scales, 2800 Radiant Hiram Infusions, 3429g 78s 24c",
    fullNo: "77700 Akash Tokens, 1470 Serpent Scales, 39375g 00s 42c",
    fullWith: "59360 Akash Tokens, 1470 Serpent Scales, 19600 Radiant Hiram Infusions, 24001g 47s 68c"
  }
};

const WEAPON_ARTIFACT = {
  title: "Weapon Artifacts",
  intro:
    "Leveling up your Weapon Artifacts will increase their DPS, Attack and Gearscore. Once you hit Lv 5 and Lv 10 it will also let you choose an extra effect.",
  optionBlocks: [
    {
      title: "For Artifact level 5 your options are",
      color: "#ffef63",
      items: ["Strength 20", "Agility 20", "Stamina 20", "Intelligence 20", "Spirit 20"]
    },
    {
      title: "For Artifact level 10 your options are",
      color: "#ff9d2e",
      items: ["Cast Time 1.2%", "Attack speed 18", "Focus 430", "Evasion 0.9%"]
    }
  ],
  rows: [
    { level: "Level 2", exp: "200", rune: "Ewan's Rune Rank 1", noEssence: "2 Gedlon's Strength", withEssence: "", noCost: ["145", "0", "7g 70s 74c"], withCost: ["", "", "", ""] },
    { level: "Level 3", exp: "700", rune: "Ewan's Rune Rank 1", noEssence: "7 Gedlon's Strengths", withEssence: "4 Gedlon's Strengths + 4 Demigod Essences", noCost: ["320", "0", "29g 67s 37c"], withCost: ["215", "0", "400", "14g 70s 12c"] },
    { level: "Level 4", exp: "1200", rune: "Ewan's Rune Rank 1", noEssence: "12 Gedlon's Strengths", withEssence: "9 Gedlon's Strengths + 4 Demigod Essences", noCost: ["495", "0", "55g 49s 40c"], withCost: ["390", "0", "400", "39g 16s 01c"] },
    { level: "Level 5", exp: "1600", rune: "Ewan's Rune Rank 2", noEssence: "16 Gedlon's Strengths", withEssence: "10 Gedlon's Strengths + 8 Demigod Essences", noCost: ["785", "10", "110g 98s 72c"], withCost: ["575", "10", "800", "61g 98s 62c"] },
    { level: "Level 6", exp: "2000", rune: "Ewan's Rune Rank 2", noEssence: "20 Gedlon's Strengths", withEssence: "14 Gedlon's Strengths + 8 Demigod Essences", noCost: ["925", "10", "221g 97s 40c"], withCost: ["715", "10", "800", "143g 57s 30c"] },
    { level: "Level 7", exp: "2200", rune: "Ewan's Rune Rank 2", noEssence: "22 Gedlon's Strengths", withEssence: "13 Gedlon's Strengths + 12 Demigod Essences", noCost: ["995", "10", "443g 94s 68c"], withCost: ["680", "10", "1200", "230g 12s 66c"] },
    { level: "Level 8", exp: "2400", rune: "Ewan's Rune Rank 3", noEssence: "24 Gedlon's Strengths", withEssence: "15 Gedlon's Strengths + 12 Demigod Essences", noCost: ["1515", "60", "1109g 86s 80c"], withCost: ["1200", "60", "1200", "619g 86s 27c"] },
    { level: "Level 9", exp: "2600", rune: "Ewan's Rune Rank 3", noEssence: "26 Gedlon's Strengths", withEssence: "17 Gedlon's Strengths + 12 Demigod Essences", noCost: ["1585", "60", "2774g 67s 06c"], withCost: ["1270", "60", "1200", "1643g 88s 81c"] },
    { level: "Level 10", exp: "2800", rune: "Ewan's Rune Rank 3", noEssence: "28 Gedlon's Strengths", withEssence: "16 Gedlon's Strengths + 16 Demigod Essences", noCost: ["1655", "60", "6936g 67s 80c"], withCost: ["1235", "60", "1600", "3436g 63s 68c"] }
  ],
  totals: {
    exp: "15700",
    noEssence: "157 Gedlon's Strengths",
    withEssence: "98 Gedlon's Strengths + 76 Demigod Essences",
    noCost: ["8420", "210", "11690g 99s 97c"],
    withCost: ["6280", "210", "7600", "6189g 93s 47c"]
  },
  summary: {
    perPieceNo: "16840 Akash Tokens, 210 Serpent Scales, 11690g 99s 97c",
    perPieceWith: "12770 Akash Tokens, 210 Serpent Scales, 7600 Radiant Hiram Infusions, 6203g 80s 82c",
    fullNo: "50520 Akash Tokens, 630 Serpent Scales, 35072g 99s 91c",
    fullWith: "38310 Akash Tokens, 630 Serpent Scales, 22800 Radiant Hiram Infusions, 18611g 42s 46c"
  }
};

const ACCESSORY_ARTIFACT = {
  title: "Accessory Artifacts",
  intro:
    "Leveling up your Accessory Artifacts will increase their Gearscore. Once you hit Lv 2, 3 and 4 it will also let you choose an extra effect.",
  optionBlocks: [
    {
      title: "For Artifact level 2 your options are",
      color: "#ffef63",
      items: ["Strength 20", "Agility 20", "Stamina 20", "Intelligence 20", "Spirit 20"]
    },
    {
      title: "For Artifact level 3 your options are",
      color: "#ff9d2e",
      items: ["Melee Attack 4", "Range Attack 4", "Magic Attack 4", "Healing Power 4"]
    },
    {
      title: "For Artifact level 4 your options are",
      color: "#4dff2b",
      items: [
        "Melee Critical Rate 1%",
        "Ranged Critical Rate 1%",
        "Magic Critical Rate 1%",
        "Critical Healing Rate 1%",
        "Received Healing 1%"
      ]
    }
  ],
  rows: [
    { level: "Level 2", exp: "900", rune: "Ewan's Rune Rank 1", noEssence: "9 Jodan's Wisdoms", withEssence: "6 Jordan's Wisdoms + 4 Demigod Essences", noCost: ["390", "0", "48g 03s 12c"], withCost: ["285", "0", "400", "26g 68s 40c"] },
    { level: "Level 3", exp: "2700", rune: "Ewan's Rune Rank 1", noEssence: "27 Jodan's Wisdoms", withEssence: "18 Jordan's Wisdoms + 12 Demigod Essences", noCost: ["1020", "0", "373g 57s 74c"], withCost: ["705", "0", "1200", "232g 44s 84c"] },
    { level: "Level 4", exp: "3900", rune: "Ewan's Rune Rank 1", noEssence: "39 Jodan's Wisdoms", withEssence: "24 Jordan's Wisdoms + 20 Demigod Essences", noCost: ["1440", "0", "5203g 39s 17c"], withCost: ["915", "0", "2000", "2701g 76s 12c"] }
  ],
  totals: {
    exp: "7500",
    noEssence: "75 Jodan's Wisdoms",
    withEssence: "48 Jordan's Wisdoms + 36 Demigod Essences",
    noCost: ["2850", "0", "5625g 00s 03c"],
    withCost: ["1905", "0", "3600", "2960g 89s 36c"]
  },
  summary: {
    perPieceNo: "5700 Akash Tokens, 5625g 00s 03c",
    perPieceWith: "3810 Akash Tokens, 3600 Radiant Hiram Infusions, 2960g 89s 36c",
    fullNo: "34200 Akash Tokens, 33750g 00s 18c",
    fullWith: "22860 Akash Tokens, 21600 Radiant Hiram Infusions, 17765g 36s 16c"
  }
};


const SET_EFFECTS = {
  ranks: [
    {
      rank: 1,
      effects: ["Max Health +2000", "Max Mana +1000"]
    },
    {
      rank: 2,
      effects: ["Physical Defense +750", "Magic Defense +750"]
    },
    {
      rank: 3,
      effects: ["Toughness +500", "Resilience +200"]
    }
  ],
  requirements: {
    Weapon: [12, 21, 30],
    Armor: [28, 49, 70],
    Accessories: [12, 18, 24]
  }
};

import { escapeHtml } from "../utils.js";

// ─── WHERE AM I — STATE ───────────────────────────────────────────────────────

const WAI_KEY = "ipnyshArtifactWAI";

function getWAIState() {
  try {
    return JSON.parse(localStorage.getItem(WAI_KEY) || "{}");
  } catch { return {}; }
}

function saveWAIState(s) { localStorage.setItem(WAI_KEY, JSON.stringify(s)); }

const ARTIFACT_TYPES = [
  { key: "armor",     label: "Armor Artifacts",     data: null /* filled below */ },
  { key: "weapon",    label: "Weapon Artifacts",     data: null },
  { key: "accessory", label: "Accessory Artifacts",  data: null },
];

// ─── WHERE AM I — RENDER ──────────────────────────────────────────────────────

function renderWhereAmI() {
  const s         = getWAIState();
  const typeKey   = s.type   || "armor";
  const curLevel  = s.level  != null ? Number(s.level) : 1;

  // lazy-init artifact data refs after consts are declared
  const artifactMap = { armor: ARMOR_ARTIFACT, weapon: WEAPON_ARTIFACT, accessory: ACCESSORY_ARTIFACT };
  const artifact    = artifactMap[typeKey] || ARMOR_ARTIFACT;

  // rows are Level 2 … Level 10; level 1 = not started
  const allLevels = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const maxLevel  = artifact.rows.length + 1; // 10

  const typeOpts = ARTIFACT_TYPES.map(t =>
    `<option value="${t.key}" ${t.key === typeKey ? "selected" : ""}>${escapeHtml(t.label)}</option>`
  ).join("");

  const levelOpts = allLevels.slice(0, maxLevel).map(l =>
    `<option value="${l}" ${l === curLevel ? "selected" : ""}>Level ${l}${l === maxLevel ? " (Max)" : ""}</option>`
  ).join("");

  // Remaining rows = all rows with level number > curLevel
  const remainingRows = artifact.rows.filter((_, i) => (i + 2) > curLevel);

  let breakdownHtml = "";
  if (remainingRows.length === 0) {
    breakdownHtml = `
      <div style="margin-top:12px;padding:10px 14px;background:#0a2a1a;border:1px solid #16a34a;border-radius:8px;color:#4ade80;font-weight:600;font-size:0.9em;">
        This artifact is already at Level 10 (max)!
      </div>`;
  } else {
    let totalTokens = 0, totalScales = 0;
    const rowsHtml = remainingRows.map(r => {
      const tokens = Number(r.noCost[0]) || 0;
      const scales = Number(r.noCost[1]) || 0;
      totalTokens += tokens;
      totalScales += scales;
      return `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:7px 0;border-bottom:1px solid #1e2a38;font-size:0.88em;gap:8px;">
          <span style="color:#fcd34d;font-weight:600;white-space:nowrap;">${escapeHtml(r.level)}</span>
          <span style="color:#94a3b8;font-size:0.85em;flex:1;">${escapeHtml(r.noEssence)}</span>
          <span style="color:#93c5fd;white-space:nowrap;">${tokens.toLocaleString()} tokens</span>
          ${scales > 0 ? `<span style="color:#fb923c;white-space:nowrap;">${scales} scales</span>` : ''}
          <span style="color:#86efac;white-space:nowrap;">${escapeHtml(r.noCost[2])}</span>
        </div>`;
    }).join("");

    breakdownHtml = `
      <div style="margin-top:12px;">
        <div style="font-size:0.8em;color:#8d99ab;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;">Remaining Levels (No Essence Path)</div>
        <div style="display:flex;justify-content:space-between;font-size:0.75em;color:#8d99ab;padding:0 0 4px 0;border-bottom:2px solid #394252;">
          <span>Level</span><span>Feed</span><span>Tokens</span><span>Gold</span>
        </div>
        ${rowsHtml}
        <div style="display:flex;justify-content:space-between;padding:8px 0;font-weight:700;border-top:2px solid #394252;margin-top:4px;font-size:0.9em;">
          <span style="color:#8d99ab;">Totals to Level ${maxLevel}</span>
          <span style="color:#93c5fd;">${totalTokens.toLocaleString()} tokens</span>
          ${totalScales > 0 ? `<span style="color:#fb923c;">${totalScales} scales</span>` : ''}
        </div>
      </div>`;
  }

  return `
    <div class="card" id="ia-where-am-i">
      <h3 style="margin-top:0;">Where Am I?</h3>
      <p class="notice" style="margin:0 0 16px 0;">
        Select your artifact type and current level to see what you still need to reach Level 10.
      </p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">
        <div>
          <label style="display:block;font-size:0.8em;color:#8d99ab;margin-bottom:4px;text-transform:uppercase;letter-spacing:0.05em;">Artifact Type</label>
          <select onchange="window.updateIpnyshWAI('type', this.value)"
            style="width:100%;background:#131920;border:1px solid #394252;border-radius:6px;color:#eef2f7;padding:8px 10px;font-size:0.9em;">
            ${typeOpts}
          </select>
        </div>
        <div>
          <label style="display:block;font-size:0.8em;color:#8d99ab;margin-bottom:4px;text-transform:uppercase;letter-spacing:0.05em;">Current Level</label>
          <select onchange="window.updateIpnyshWAI('level', parseInt(this.value))"
            style="width:100%;background:#131920;border:1px solid #394252;border-radius:6px;color:#eef2f7;padding:8px 10px;font-size:0.9em;">
            ${levelOpts}
          </select>
        </div>
      </div>

      <div style="background:#1a2535;border:1px solid #394252;border-radius:10px;padding:16px;">
        <div style="margin-bottom:10px;">
          <div style="font-size:0.78em;color:#8d99ab;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px;">Your Artifact</div>
          <div style="font-size:1.05em;font-weight:700;">
            <span style="color:#fcd34d;">Level ${curLevel}</span>
            <span style="color:#93c5fd;margin-left:8px;">${escapeHtml(artifact.title)}</span>
          </div>
          ${curLevel < maxLevel ? `
            <div style="margin-top:6px;">
              <div style="height:8px;background:#0d1b2a;border-radius:4px;overflow:hidden;">
                <div style="height:100%;width:${Math.round(((curLevel - 1) / (maxLevel - 1)) * 100)}%;background:#fcd34d;border-radius:4px;"></div>
              </div>
              <div style="font-size:0.78em;color:#8d99ab;margin-top:3px;">${curLevel - 1} / ${maxLevel - 1} levels completed</div>
            </div>
          ` : ''}
        </div>
        ${breakdownHtml}
      </div>
    </div>
  `;
}

window.updateIpnyshWAI = function(field, value) {
  const s = getWAIState();
  s[field] = value;
  saveWAIState(s);
  window.renderCurrentPage();
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function esc(s) { return escapeHtml(String(s ?? "")); }

// ─── SUB-RENDERS ─────────────────────────────────────────────────────────────

function renderSetEffects() {
  const { ranks, requirements } = SET_EFFECTS;
  const reqRows = Object.entries(requirements).map(([type, vals]) =>
    `<tr>
      <td>${esc(type)}</td>
      ${vals.map(v => `<td>${v} levels</td>`).join("")}
    </tr>`
  ).join("");

  const effectRows = ranks.map(r =>
    `<tr>
      <td style="color:#fcd34d;font-weight:600;">Rank ${r.rank}</td>
      <td>${r.effects.map(e => esc(e)).join("<br>")}</td>
    </tr>`
  ).join("");

  return `
    <div class="card" id="ia-set-effects">
      <h2>Set Effects</h2>
      <p class="notice" style="margin-bottom:16px;">
        Collecting enough artifact levels across all three categories unlocks powerful set bonuses.
        The levels required are <strong>cumulative</strong> across all pieces.
      </p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;flex-wrap:wrap;">
        <div>
          <h3 style="margin-top:0;color:#93c5fd;">Level Requirements</h3>
          <div class="table-wrap">
            <table>
              <thead><tr><th>Type</th><th>Rank 1</th><th>Rank 2</th><th>Rank 3</th></tr></thead>
              <tbody>${reqRows}</tbody>
            </table>
          </div>
        </div>
        <div>
          <h3 style="margin-top:0;color:#93c5fd;">Bonuses</h3>
          <div class="table-wrap">
            <table>
              <thead><tr><th>Set Rank</th><th>Bonus</th></tr></thead>
              <tbody>${effectRows}</tbody>
            </table>
          </div>
        </div>
      </div>
    </div>`;
}

function renderUpgradeReference() {
  const rows = UPGRADE_REFERENCE_ROWS.map(r =>
    `<tr>
      <td style="color:#fcd34d;font-weight:600;">${esc(r.step)}</td>
      <td>${esc(r.weapon)}</td>
      <td>${esc(r.armor)}</td>
      <td>${esc(r.accessory) || "—"}</td>
    </tr>`
  ).join("");

  return `
    <div class="card" id="ia-quick-ref">
      <h2>Quick Upgrade Reference</h2>
      <p class="notice" style="margin-bottom:12px;">Cost per level per piece (no Demigod Essence path unless shown).</p>
      <div class="table-wrap">
        <table>
          <thead>
            <tr><th>Level Step</th><th>Weapon</th><th>Armor</th><th>Accessory</th></tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>`;
}

function renderArtifactCard(artifact) {
  const isAccessory = artifact.rows.length <= 4;
  const hasBothPaths = artifact.rows.some(r => r.withEssence);

  // Option blocks
  const optionBlocks = artifact.optionBlocks.map(ob => `
    <div style="background:#131d2a;border:1px solid #2a3a52;border-radius:8px;padding:12px 16px;flex:1;min-width:200px;">
      <div style="font-size:11px;font-weight:700;color:${esc(ob.color)};text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">${esc(ob.title)}</div>
      ${ob.items.map(item => `<div style="font-size:13px;color:#cbd5e1;padding:2px 0;">• ${esc(item)}</div>`).join("")}
    </div>`).join("");

  // Level rows
  const levelRows = artifact.rows.map(r => `
    <tr>
      <td style="color:#fcd34d;font-weight:600;">${esc(r.level)}</td>
      <td style="color:#94a3b8;">${esc(r.exp)}</td>
      <td style="color:#86efac;font-size:12px;">${esc(r.rune)}</td>
      <td>${esc(r.noEssence)}</td>
      <td style="color:#93c5fd;">${r.noCost[0]}</td>
      <td style="color:#fb923c;">${r.noCost[1]}</td>
      <td style="color:#fcd34d;">${r.noCost[2]}</td>
      ${hasBothPaths ? `
      <td>${esc(r.withEssence) || "—"}</td>
      <td style="color:#93c5fd;">${r.withCost[0] || "—"}</td>
      <td style="color:#fb923c;">${r.withCost[1] || "—"}</td>
      <td style="color:#c4b5fd;">${r.withCost[2] || "—"}</td>
      <td style="color:#fcd34d;">${r.withCost[3] || "—"}</td>` : ""}
    </tr>`).join("");

  // Totals row
  const totalsRow = `
    <tr style="background:#1a2535;font-weight:700;">
      <td style="color:#f8fafc;">Total</td>
      <td style="color:#94a3b8;">${esc(artifact.totals.exp)}</td>
      <td></td>
      <td style="color:#f8fafc;">${esc(artifact.totals.noEssence)}</td>
      <td style="color:#93c5fd;">${artifact.totals.noCost[0]}</td>
      <td style="color:#fb923c;">${artifact.totals.noCost[1]}</td>
      <td style="color:#fcd34d;">${artifact.totals.noCost[2]}</td>
      ${hasBothPaths ? `
      <td style="color:#f8fafc;">${esc(artifact.totals.withEssence)}</td>
      <td style="color:#93c5fd;">${artifact.totals.withCost[0]}</td>
      <td style="color:#fb923c;">${artifact.totals.withCost[1]}</td>
      <td style="color:#c4b5fd;">${artifact.totals.withCost[2]}</td>
      <td style="color:#fcd34d;">${artifact.totals.withCost[3]}</td>` : ""}
    </tr>`;

  const noPathHeader  = hasBothPaths ? `<th colspan="4" style="background:#1a3a2a;color:#86efac;">No Essence Path</th>` : "";
  const withPathHeader = hasBothPaths ? `<th colspan="4" style="background:#1a2a3a;color:#93c5fd;">With Demigod Essence Path</th>` : "";
  const noSubHeaders  = hasBothPaths ? `<th style="color:#93c5fd;">Tokens</th><th style="color:#fb923c;">Scales</th><th style="color:#fcd34d;">Gold</th>` : `<th style="color:#93c5fd;">Tokens</th><th style="color:#fb923c;">Scales</th><th style="color:#fcd34d;">Gold</th>`;
  const withSubHeaders = hasBothPaths ? `<th>Feed (with ess)</th><th style="color:#93c5fd;">Tokens</th><th style="color:#fb923c;">Scales</th><th style="color:#c4b5fd;">Infusions</th><th style="color:#fcd34d;">Gold</th>` : "";

  return `
    <div class="card" id="ia-${artifact.title.toLowerCase().replace(/\s+/g,"-")}">
      <h2>${esc(artifact.title)}</h2>
      <p class="notice" style="margin-bottom:16px;">${esc(artifact.intro)}</p>

      <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:20px;">
        ${optionBlocks}
      </div>

      <div class="table-wrap" style="overflow-x:auto;">
        <table>
          <thead>
            <tr>
              <th rowspan="2">Level</th>
              <th rowspan="2">EXP Req.</th>
              <th rowspan="2">Ewan's Rune</th>
              <th rowspan="2">Feed (no ess)</th>
              ${noPathHeader}
              ${withPathHeader}
            </tr>
            <tr>
              ${noSubHeaders}
              ${withSubHeaders}
            </tr>
          </thead>
          <tbody>
            ${levelRows}
            ${totalsRow}
          </tbody>
        </table>
      </div>

      <div style="margin-top:16px;padding:14px 16px;background:#0f1923;border:1px solid #2a3a52;border-radius:10px;">
        <div style="font-size:12px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px;">Full Cost Summary</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
          <div>
            <div style="font-size:11px;color:#86efac;font-weight:600;margin-bottom:4px;">Per piece (No Essence)</div>
            <div style="font-size:13px;color:#cbd5e1;">${esc(artifact.summary.perPieceNo)}</div>
          </div>
          <div>
            <div style="font-size:11px;color:#93c5fd;font-weight:600;margin-bottom:4px;">Per piece (With Essence)</div>
            <div style="font-size:13px;color:#cbd5e1;">${esc(artifact.summary.perPieceWith)}</div>
          </div>
          ${artifact.summary.fullNo ? `
          <div>
            <div style="font-size:11px;color:#fcd34d;font-weight:600;margin-bottom:4px;">All pieces (No Essence)</div>
            <div style="font-size:13px;color:#cbd5e1;">${esc(artifact.summary.fullNo)}</div>
          </div>
          <div>
            <div style="font-size:11px;color:#c4b5fd;font-weight:600;margin-bottom:4px;">All pieces (With Essence)</div>
            <div style="font-size:13px;color:#cbd5e1;">${esc(artifact.summary.fullWith)}</div>
          </div>` : ""}
        </div>
      </div>
    </div>`;
}

// ─── MAIN RENDER ──────────────────────────────────────────────────────────────

export function renderPage() {
  const navLinks = [
    { id: "ia-where-am-i",        label: "Where Am I?" },
    { id: "ia-set-effects",       label: "Set Effects" },
    { id: "ia-quick-ref",         label: "Quick Ref" },
    { id: "ia-armor-artifacts",   label: "Armor" },
    { id: "ia-weapon-artifacts",  label: "Weapons" },
    { id: "ia-accessory-artifacts", label: "Accessories" },
  ];

  const nav = `
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:20px;">
      ${navLinks.map(l => `
        <button onclick="document.getElementById('${l.id}')?.scrollIntoView({behavior:'smooth'})"
          style="background:#1e2a38;border:1px solid #2a3a52;border-radius:20px;padding:6px 14px;
                 color:#94a3b8;font-size:12px;font-family:Arial,sans-serif;cursor:pointer;">
          ${esc(l.label)}
        </button>`).join("")}
    </div>`;

  const totalsNote = `
    <div class="card" style="background:linear-gradient(135deg,#1a2535,#0f1923);border-color:#2a3a52;">
      <h2 style="margin-top:0;">Ipnysh Artifacts</h2>
      <p class="notice">
        Artifact levels increase your gear's stats and gearscore, and unlock bonus effects at milestone levels.
        All calculations assume <strong>zero exp wasted</strong> — use Demigod Essence to fill gaps when you have more
        Hiram Infusions than Akasch Tokens.
      </p>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:12px;margin-top:16px;">
        <div style="background:#0f1923;border:1px solid #2a3a52;border-radius:10px;padding:14px;">
          <div style="font-size:11px;color:#fb923c;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">100% Completion (No Essence)</div>
          <div style="font-size:13px;color:#cbd5e1;line-height:1.7;">
            81,210 Akasch Tokens<br>
            2,100 Serpent Scales<br>
            108,198g 00s 51c
          </div>
        </div>
        <div style="background:#0f1923;border:1px solid #2a3a52;border-radius:10px;padding:14px;">
          <div style="font-size:11px;color:#93c5fd;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">100% Completion (With Essence)</div>
          <div style="font-size:13px;color:#cbd5e1;line-height:1.7;">
            60,265 Akasch Tokens<br>
            2,100 Serpent Scales<br>
            64,000 Radiant Hiram Infusions<br>
            57,378g 26s 30c
          </div>
        </div>
      </div>
    </div>`;

  return `
    <h1>Ipnysh Artifacts</h1>
    ${nav}
    ${renderWhereAmI()}
    ${totalsNote}
    ${renderSetEffects()}
    ${renderUpgradeReference()}
    ${renderArtifactCard(ARMOR_ARTIFACT)}
    ${renderArtifactCard(WEAPON_ARTIFACT)}
    ${renderArtifactCard(ACCESSORY_ARTIFACT)}
  `;
}