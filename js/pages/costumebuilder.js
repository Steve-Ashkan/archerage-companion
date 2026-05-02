// ─── DATA ─────────────────────────────────────────────────────────────────────

const GRADES = ['Grand', 'Rare', 'Arcane', 'Heroic', 'Unique', 'Celestial', 'Divine', 'Epic', 'Legendary', 'Ethereal', 'Eternal'];

const GRADE_COLORS = {
  'Grand':     '#9e9e9e',
  'Rare':      '#4fc3f7',
  'Arcane':    '#81c784',
  'Heroic':    '#aed581',
  'Unique':    '#fff176',
  'Celestial': '#ffb74d',
  'Divine':    '#f48fb1',
  'Epic':      '#ce93d8',
  'Legendary': '#ff8a65',
  'Ethereal':  '#80deea',
  'Eternal':   '#e0e0e0',
};

const COSTUME_STATS = [
  { name: 'Physical Defense',        unlockGrade: 'Grand',     eternal: '1210' },
  { name: 'Magic Defense',           unlockGrade: 'Grand',     eternal: '1210' },
  { name: 'Max Health',              unlockGrade: 'Grand',     eternal: '1550' },
  { name: 'Move Speed',              unlockGrade: 'Grand',     eternal: '5%' },
  { name: 'Stealth Detection',       unlockGrade: 'Grand',     eternal: '28%' },
  { name: 'PvE Magic Skills',        unlockGrade: 'Grand',     eternal: '7.4%' },
  { name: 'PvE Melee Skills',        unlockGrade: 'Grand',     eternal: '7.4%' },
  { name: 'PvE Ranged Skills',       unlockGrade: 'Grand',     eternal: '7.4%' },
  { name: 'Backstab Melee Damage',   unlockGrade: 'Grand',     eternal: '8.2%' },
  { name: 'Backstab Magic Damage',   unlockGrade: 'Grand',     eternal: '8.2%' },
  { name: 'Backstab Ranged Damage',  unlockGrade: 'Grand',     eternal: '8.2%' },
  { name: 'Received Damage',         unlockGrade: 'Grand',     eternal: '3.8%' },
  { name: 'Melee Attack',            unlockGrade: 'Arcane',    eternal: '47.5' },
  { name: 'Ranged Attack',           unlockGrade: 'Arcane',    eternal: '47.5' },
  { name: 'Magic Attack',            unlockGrade: 'Arcane',    eternal: '47.5' },
  { name: 'Healing Power',           unlockGrade: 'Arcane',    eternal: '47.5' },
  { name: 'PvE Damage Reduction',    unlockGrade: 'Arcane',    eternal: '5.1%' },
  { name: 'Received Healing',        unlockGrade: 'Arcane',    eternal: '11%' },
  { name: 'Cast Time',               unlockGrade: 'Arcane',    eternal: '4.6%' },
  { name: 'Evasion',                 unlockGrade: 'Unique',    eternal: '3.5%' },
  { name: 'Parry Rate',              unlockGrade: 'Unique',    eternal: '3.5%' },
  { name: 'Shield Block Rate',       unlockGrade: 'Unique',    eternal: '2.8%' },
  { name: 'Resilience',              unlockGrade: 'Unique',    eternal: '910' },
  { name: 'Toughness',               unlockGrade: 'Unique',    eternal: '295' },
  { name: 'Focus',                   unlockGrade: 'Unique',    eternal: '960' },
  { name: 'Defense Penetration',     unlockGrade: 'Celestial', eternal: '755' },
  { name: 'Magic Defense Penetration', unlockGrade: 'Celestial', eternal: '755' },
  { name: 'Received Ranged Damage',  unlockGrade: 'Celestial', eternal: '3.1%' },
  { name: 'Received Magic Damage',   unlockGrade: 'Divine',    eternal: '3.1%' },
  { name: 'Received Melee Damage',   unlockGrade: 'Divine',    eternal: '3.1%' },
  { name: 'Magic Critical Damage',   unlockGrade: 'Divine',    eternal: '11.8%' },
  { name: 'Melee Critical Damage',   unlockGrade: 'Divine',    eternal: '11.8%' },
  { name: 'Ranged Critical Damage',  unlockGrade: 'Divine',    eternal: '11.8%' },
  { name: 'Critical Heal Bonus',     unlockGrade: 'Divine',    eternal: '11.8%' },
  { name: 'Melee Skill Damage',      unlockGrade: 'Epic',      eternal: '3.6%' },
  { name: 'Magic Skill Damage',      unlockGrade: 'Epic',      eternal: '3.6%' },
  { name: 'Ranged Skill Damage',     unlockGrade: 'Epic',      eternal: '3.6%' },
  { name: 'Healing',                 unlockGrade: 'Epic',      eternal: '3.6%' },
  { name: 'Melee Critical Rate',     unlockGrade: 'Legendary', eternal: '5.4%' },
  { name: 'Magic Critical Rate',     unlockGrade: 'Legendary', eternal: '5.4%' },
  { name: 'Ranged Critical Rate',    unlockGrade: 'Legendary', eternal: '5.4%' },
  { name: 'Critical Heal Rate',      unlockGrade: 'Legendary', eternal: '5.4%' },
];

const UNDERGARMENT_STATS = [
  { name: 'Physical Defense',              unlockGrade: 'Grand',     eternal: '723' },
  { name: 'Magic Defense',                 unlockGrade: 'Grand',     eternal: '723' },
  { name: 'Max Health',                    unlockGrade: 'Grand',     eternal: '930' },
  { name: 'Melee Attack',                  unlockGrade: 'Grand',     eternal: '21.8' },
  { name: 'Ranged Attack',                 unlockGrade: 'Grand',     eternal: '21.8' },
  { name: 'Magic Attack',                  unlockGrade: 'Grand',     eternal: '21.8' },
  { name: 'Healing Power',                 unlockGrade: 'Grand',     eternal: '21.8' },
  { name: 'Backstab Melee Damage',         unlockGrade: 'Grand',     eternal: '7.9%' },
  { name: 'Backstab Magic Damage',         unlockGrade: 'Grand',     eternal: '7.9%' },
  { name: 'Backstab Ranged Damage',        unlockGrade: 'Grand',     eternal: '7.9%' },
  { name: 'Resilience',                    unlockGrade: 'Arcane',    eternal: '824' },
  { name: 'Toughness',                     unlockGrade: 'Arcane',    eternal: '373' },
  { name: 'Focus',                         unlockGrade: 'Arcane',    eternal: '660' },
  { name: 'Defense Penetration',           unlockGrade: 'Arcane',    eternal: '522' },
  { name: 'Magic Defense Penetration',     unlockGrade: 'Arcane',    eternal: '522' },
  { name: 'Received Magic Damage',         unlockGrade: 'Unique',    eternal: '6.7%' },
  { name: 'Received Melee Damage',         unlockGrade: 'Unique',    eternal: '6.7%' },
  { name: 'Received Ranged Damage',        unlockGrade: 'Unique',    eternal: '6.7%' },
  { name: 'Shield Defense Penetration Rate', unlockGrade: 'Unique',  eternal: '12.0%' },
  { name: 'Melee Skill Damage',            unlockGrade: 'Divine',    eternal: '3.8%' },
  { name: 'Magic Skill Damage',            unlockGrade: 'Divine',    eternal: '3.8%' },
  { name: 'Ranged Skill Damage',           unlockGrade: 'Divine',    eternal: '3.8%' },
  { name: 'Healing',                       unlockGrade: 'Divine',    eternal: '3.8%' },
  { name: 'Melee Critical Rate',           unlockGrade: 'Legendary', eternal: '4.8%' },
  { name: 'Magic Critical Rate',           unlockGrade: 'Legendary', eternal: '4.8%' },
  { name: 'Ranged Critical Rate',          unlockGrade: 'Legendary', eternal: '4.8%' },
  { name: 'Critical Heal Rate',            unlockGrade: 'Legendary', eternal: '4.8%' },
];

// Slot count unlocked at each grade
const GRADE_SLOTS = {
  'Grand': 1, 'Rare': 1, 'Arcane': 2, 'Heroic': 3,
  'Unique': 4, 'Celestial': 4, 'Divine': 4, 'Epic': 4,
  'Legendary': 5, 'Ethereal': 5, 'Eternal': 5,
};

// Generates a build order dynamically from whatever stats the user selected.
// Groups selected stats by their unlock grade and produces the regrade path.
function generateBuildOrder(selected, stats) {
  if (!selected.length) return [];

  const gradeOrder = Object.keys(GRADE_SLOTS);

  // Map each selected stat to its unlock grade
  const statGrade = {};
  for (const stat of stats) {
    if (selected.includes(stat.name)) statGrade[stat.name] = stat.unlockGrade;
  }

  // Group by unlock grade
  const byGrade = {};
  for (const [name, grade] of Object.entries(statGrade)) {
    if (!byGrade[grade]) byGrade[grade] = [];
    byGrade[grade].push(name);
  }

  // Walk grades in order, emitting a step whenever selected stats unlock
  const steps = [];
  let obtained = [];

  for (const grade of gradeOrder) {
    if (!byGrade[grade]) continue;
    const rolling = byGrade[grade];
    const action  = obtained.length === 0 ? 'Roll for' : 'Keep & roll for';
    steps.push({
      grade,
      slots:     obtained.length + rolling.length,
      action,
      keepStats: [...obtained],
      rollStats: rolling,
    });
    obtained = [...obtained, ...rolling];
  }

  return steps;
}

// ─── STATE ────────────────────────────────────────────────────────────────────

const STATE_KEY = 'costumeBuilderState';

function getState() {
  try { return JSON.parse(localStorage.getItem(STATE_KEY)) || {}; } catch { return {}; }
}
function saveState(s) { localStorage.setItem(STATE_KEY, JSON.stringify(s)); }

// ─── RENDER ───────────────────────────────────────────────────────────────────

export function renderCostumeBuilderPage() {
  const container = document.getElementById('content');
  const state = getState();
  const activeTab = state.activeTab || 'costume';

  container.innerHTML = `
    <style>
      .cb-wrap { padding: 20px; max-width: 1100px; margin: 0 auto; }
      .cb-title { font-size: 28px; font-weight: 700; color: #f8fafc; margin: 0 0 4px; }
      .cb-subtitle { color: #64748b; font-size: 13px; font-family: Arial, sans-serif; margin: 0 0 20px; }

      .cb-tabs { display: flex; gap: 8px; margin-bottom: 24px; }
      .cb-tab { background: #1a2535; border: 1px solid #2a3a52; border-radius: 10px; padding: 10px 22px;
        color: #94a3b8; font-size: 14px; font-family: Arial, sans-serif; cursor: pointer; transition: all 0.15s; }
      .cb-tab:hover { border-color: #93c5fd; color: #93c5fd; }
      .cb-tab.active { background: #1e3a5f; border-color: #93c5fd; color: #93c5fd; font-weight: 700; }

      .cb-section { margin-bottom: 28px; }
      .cb-section-title { font-size: 16px; font-weight: 700; color: #93c5fd; font-family: Arial, sans-serif;
        margin: 0 0 12px; padding-bottom: 8px; border-bottom: 1px solid #1e2d3d; }

      /* Stat selector */
      .cb-stat-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 8px; }
      .cb-stat-card { background: #1a2535; border: 1px solid #2a3a52; border-radius: 10px; padding: 12px 14px;
        cursor: pointer; transition: all 0.15s; display: flex; justify-content: space-between; align-items: center; }
      .cb-stat-card:hover { border-color: #3a5a82; }
      .cb-stat-card.selected { background: #1e3a5f; border-color: #93c5fd; }
      .cb-stat-card.locked { opacity: 0.35; cursor: not-allowed; }
      .cb-stat-name { font-size: 13px; font-weight: 600; color: #f8fafc; font-family: Arial, sans-serif; }
      .cb-stat-meta { text-align: right; }
      .cb-grade-badge { font-size: 10px; padding: 2px 6px; border-radius: 5px; font-family: Arial, sans-serif;
        font-weight: 700; display: inline-block; margin-bottom: 2px; }
      .cb-eternal-val { font-size: 11px; color: #64748b; font-family: Arial, sans-serif; }

      /* Selected stats display */
      .cb-selected-bar { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px; min-height: 40px;
        background: #111a26; border: 1px solid #1e2d3d; border-radius: 10px; padding: 10px 14px; align-items: center; }
      .cb-selected-pill { background: #1e3a5f; border: 1px solid #93c5fd; border-radius: 20px;
        padding: 5px 12px; font-size: 12px; color: #93c5fd; font-family: Arial, sans-serif;
        display: flex; align-items: center; gap: 6px; }
      .cb-pill-remove { cursor: pointer; color: #64748b; font-size: 14px; line-height: 1; transition: color 0.15s; }
      .cb-pill-remove:hover { color: #f87171; }
      .cb-slot-count { font-size: 12px; color: #64748b; font-family: Arial, sans-serif; margin-left: auto; }

      /* Build order */
      .cb-build-steps { display: flex; flex-direction: column; gap: 8px; }
      .cb-step { background: #1a2535; border: 1px solid #2a3a52; border-radius: 10px; padding: 14px 16px;
        display: flex; align-items: flex-start; gap: 14px; }
      .cb-step.active-step { border-color: #93c5fd; background: #1e2d40; }
      .cb-step-grade { font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 6px;
        font-family: Arial, sans-serif; white-space: nowrap; min-width: 90px; text-align: center; }
      .cb-step-body { flex: 1; }
      .cb-step-action { font-size: 12px; color: #64748b; font-family: Arial, sans-serif; margin-bottom: 6px; }
      .cb-step-stats { display: flex; flex-wrap: wrap; gap: 6px; }
      .cb-step-stat { font-size: 11px; padding: 3px 9px; border-radius: 6px; font-family: Arial, sans-serif; }
      .cb-step-stat.keep { background: #1a3a2a; color: #86efac; border: 1px solid #2a4a3a; }
      .cb-step-stat.roll { background: #3a2a1a; color: #fcd34d; border: 1px solid #4a3a1a; }
      .cb-step-slots { font-size: 11px; color: #475569; font-family: Arial, sans-serif; margin-top: 6px; }

      /* Stat reference table */
      .cb-table { width: 100%; border-collapse: collapse; font-family: Arial, sans-serif; font-size: 13px; }
      .cb-table th { background: #111a26; color: #64748b; font-size: 11px; text-transform: uppercase;
        letter-spacing: 0.5px; padding: 8px 12px; text-align: left; border-bottom: 1px solid #1e2d3d; }
      .cb-table td { padding: 8px 12px; border-bottom: 1px solid #1a2535; color: #cbd5e1; }
      .cb-table tr:hover td { background: #1a2535; }
      .cb-table tr.highlighted td { background: #1e2d40; }

      .cb-info-box { background: #111a26; border: 1px solid #1e3a5f; border-radius: 10px;
        padding: 14px 16px; margin-bottom: 16px; font-size: 13px; color: #94a3b8; font-family: Arial, sans-serif; line-height: 1.6; }
      .cb-info-box strong { color: #93c5fd; }
    </style>

    <div class="cb-wrap">
      <h1 class="cb-title">🎭 Costume Builder</h1>
      <p class="cb-subtitle">Select your desired stats, follow the build order, and reference the full stat list below.</p>

      <div class="cb-tabs">
        <button class="cb-tab ${activeTab === 'costume' ? 'active' : ''}" onclick="window.setCostumeTab('costume')">👘 Costume</button>
        <button class="cb-tab ${activeTab === 'undergarment' ? 'active' : ''}" onclick="window.setCostumeTab('undergarment')">🧤 Undergarments</button>
      </div>

      <div id="cb-tab-content"></div>
    </div>
  `;

  renderTabContent(activeTab);
}

function renderTabContent(tab) {
  const state      = getState();
  const isCostume  = tab === 'costume';
  const stats      = isCostume ? COSTUME_STATS : UNDERGARMENT_STATS;
  const selectedKey = tab + 'Selected';
  const selected   = state[selectedKey] || [];
  const MAX_STATS  = 5;

  const buildOrder = generateBuildOrder(selected, stats);

  // Group stats by unlock grade
  const byGrade = {};
  stats.forEach(s => {
    if (!byGrade[s.unlockGrade]) byGrade[s.unlockGrade] = [];
    byGrade[s.unlockGrade].push(s);
  });

  const el = document.getElementById('cb-tab-content');
  if (!el) return;

  el.innerHTML = `
    <div class="cb-info-box">
      <strong>How to use:</strong> Select up to 5 stats you want on your ${tab}. The Build Order below updates automatically to show the regrade path for your exact selection.
    </div>

    <!-- Selected stats bar -->
    <div class="cb-section">
      <div class="cb-section-title">Your Selected Stats</div>
      <div class="cb-selected-bar" id="cb-selected-bar">
        ${selected.length === 0
          ? '<span style="color:#475569;font-size:12px;font-family:Arial,sans-serif;">Click stats below to select up to 5</span>'
          : selected.map(s => `
              <div class="cb-selected-pill">
                <span>${s}</span>
                <span class="cb-pill-remove" onclick="window.removeCostumeStat('${tab}','${s.replace(/'/g,"\\'")}')">×</span>
              </div>
            `).join('')
        }
        <span class="cb-slot-count">${selected.length} / ${MAX_STATS} stats selected</span>
        ${selected.length > 0
          ? `<button onclick="window.clearCostumeStats('${tab}')" style="margin-left:auto;padding:3px 10px;font-size:11px;background:#2a1a1a;border:1px solid #5a2a2a;color:#f87171;border-radius:6px;cursor:pointer;">Clear All</button>`
          : ''
        }
      </div>
    </div>

    <!-- Build Order -->
    <div class="cb-section">
      <div class="cb-section-title">Build Order</div>
      ${buildOrder.length === 0
        ? `<div style="color:#475569;font-size:13px;font-family:Arial,sans-serif;padding:12px 0;">Select stats above to generate your build order.</div>`
        : `<div class="cb-build-steps">
            ${buildOrder.map((step, i) => {
              const gradeColor = GRADE_COLORS[step.grade] || '#9e9e9e';
              const isLast = i === buildOrder.length - 1;
              return `
                <div class="cb-step ${isLast ? 'active-step' : ''}">
                  <div>
                    <div class="cb-step-grade" style="background:${gradeColor}22;color:${gradeColor};border:1px solid ${gradeColor}55;">
                      ${step.grade}
                    </div>
                  </div>
                  <div class="cb-step-body">
                    <div class="cb-step-action">${step.action} — ${step.slots} slot${step.slots !== 1 ? 's' : ''}:</div>
                    <div class="cb-step-stats">
                      ${step.keepStats.map(s => `<span class="cb-step-stat keep">${s}</span>`).join('')}
                      ${step.rollStats.map(s => `<span class="cb-step-stat roll">${s}</span>`).join('')}
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>`
      }
    </div>

    <!-- Stat selector by grade -->
    <div class="cb-section">
      <div class="cb-section-title">Available Stats — Click to Select</div>
      ${Object.entries(byGrade).map(([grade, gradeStats]) => {
        const color = GRADE_COLORS[grade] || '#9e9e9e';
        return `
          <div style="margin-bottom:16px;">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
              <span class="cb-grade-badge" style="background:${color}22;color:${color};border:1px solid ${color}55;">${grade}</span>
              <span style="font-size:11px;color:#475569;font-family:Arial,sans-serif;">Unlocks at ${grade}</span>
            </div>
            <div class="cb-stat-grid">
              ${gradeStats.map(stat => {
                const isSelected = selected.includes(stat.name);
                const isLocked   = !isSelected && selected.length >= MAX_STATS;
                return `
                  <div class="cb-stat-card ${isSelected ? 'selected' : ''} ${isLocked ? 'locked' : ''}"
                    onclick="${isLocked ? '' : `window.toggleCostumeStat('${tab}','${stat.name.replace(/'/g,"\\'")}','${stat.unlockGrade}')`}">
                    <span class="cb-stat-name">${stat.name}</span>
                    <div class="cb-stat-meta">
                      <div class="cb-grade-badge" style="background:${color}22;color:${color};">${grade}</div>
                      <div class="cb-eternal-val">@Eternal: ${stat.eternal}</div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        `;
      }).join('')}
    </div>

    <!-- Full stat reference table -->
    <div class="cb-section">
      <div class="cb-section-title">Full Stat Reference</div>
      <table class="cb-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Stat</th>
            <th>Unlocks At</th>
            <th>@ Eternal 100%</th>
          </tr>
        </thead>
        <tbody>
          ${stats.map((stat, i) => {
            const color = GRADE_COLORS[stat.unlockGrade] || '#9e9e9e';
            const isHighlighted = selected.includes(stat.name);
            return `
              <tr class="${isHighlighted ? 'highlighted' : ''}">
                <td style="color:#475569;">${i + 1}</td>
                <td style="font-weight:${isHighlighted ? '700' : '400'};color:${isHighlighted ? '#93c5fd' : '#cbd5e1'};">${stat.name}</td>
                <td><span class="cb-grade-badge" style="background:${color}22;color:${color};">${stat.unlockGrade}</span></td>
                <td style="font-family:monospace;color:#22d3ee;">${stat.eternal}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// ─── HANDLERS ─────────────────────────────────────────────────────────────────

window.setCostumeTab = function(tab) {
  const state = getState();
  state.activeTab = tab;
  saveState(state);
  // Update tab buttons
  document.querySelectorAll('.cb-tab').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.cb-tab').forEach(b => {
    if ((tab === 'costume' && b.textContent.includes('Costume')) ||
        (tab === 'undergarment' && b.textContent.includes('Undergarment'))) {
      b.classList.add('active');
    }
  });
  renderTabContent(tab);
};

window.toggleCostumeStat = function(tab, statName, unlockGrade) {
  const state = getState();
  const key = tab + 'Selected';
  const selected = state[key] || [];
  const idx = selected.indexOf(statName);
  if (idx >= 0) {
    selected.splice(idx, 1);
  } else {
    if (selected.length >= 5) return;
    selected.push(statName);
  }
  state[key] = selected;
  saveState(state);
  renderTabContent(tab);
};

window.removeCostumeStat = function(tab, statName) {
  const state = getState();
  const key = tab + 'Selected';
  const selected = state[key] || [];
  state[key] = selected.filter(s => s !== statName);
  saveState(state);
  renderTabContent(tab);
};

window.clearCostumeStats = function(tab) {
  const state = getState();
  state[tab + 'Selected'] = [];
  saveState(state);
  renderTabContent(tab);
};