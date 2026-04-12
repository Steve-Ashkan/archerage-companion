// ─── SUBMIT A RECIPE ─────────────────────────────────────────────────────────
// Open to all users (free and pro). Submitted recipes are queued for Ashkan
// to review, edit, and approve in the Dev Panel before going live.

import { getAuth } from '../auth.js';
import { PROFESSIONS } from '../data/recipes.js';
import { escapeHtml } from '../utils.js';
import {
  PROFICIENCY_RANKS, RANK_COLORS, getRankColor,
  getProfessionRank, effectiveLabor,
} from '../data/proficiency.js';

const IGN_KEY = 'userIgn';

function getIGN() {
  return localStorage.getItem(IGN_KEY) || '';
}

// ─── STATE ────────────────────────────────────────────────────────────────────

let _materials   = [{ item: '', qty: 1 }];
let _currentProf = 'Alchemy'; // tracks selected profession for rank auto-pull

// ─── RANK ROW HELPERS ─────────────────────────────────────────────────────────

function renderRankRow(profession) {
  const profRank  = getProfessionRank(profession); // from proficiency page, or null
  const rankName  = profRank?.name || _srOverrideRank || 'Famed';
  const rank      = PROFICIENCY_RANKS.find(r => r.name === rankName) || PROFICIENCY_RANKS[PROFICIENCY_RANKS.length - 1];
  const color     = getRankColor(rankName);
  const isFromProf = !!profRank && !_srOverrideRank;
  const label     = rank.laborReduction > 0 ? `−${rank.laborReduction}% labor` : 'no reduction';

  const profNote = isFromProf
    ? `<span style="font-size:11px;color:#566174;">from your Proficiency Tracker</span>`
    : `<span style="font-size:11px;color:#566174;">
        ${profRank ? '' : `<a onclick="window.showPage('proficiency')" href="#"
          style="color:#93c5fd;text-decoration:none;" title="Set up your Proficiency Tracker">
          Set in Proficiency →
        </a>`}
      </span>`;

  return `
    <div id="sr-rank-row" style="margin-bottom:18px;">
      <div style="font-size:12px;font-weight:700;letter-spacing:0.07em;text-transform:uppercase;
        color:#566174;margin-bottom:8px;">Your ${profession} Rank</div>
      <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
        <div style="position:relative;display:inline-block;">
          <button id="sr-rank-btn" onclick="window.srToggleRankPicker()"
            style="display:flex;align-items:center;gap:8px;padding:8px 14px;border-radius:8px;
            background:#1a2028;border:1px solid ${color}55;color:${color};
            font-size:13px;font-weight:600;cursor:pointer;white-space:nowrap;">
            <span style="font-size:11px;opacity:0.7;">⚡</span>
            ${rankName} · ${label}
            <span style="font-size:10px;opacity:0.5;margin-left:2px;">▼</span>
          </button>
          <div id="sr-rank-picker" style="display:none;position:absolute;top:calc(100% + 6px);left:0;z-index:500;
            background:#1a2028;border:1px solid #2a3a52;border-radius:12px;
            padding:14px;width:320px;box-shadow:0 12px 32px rgba(0,0,0,0.5);">
            <div style="font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;
              color:#566174;margin-bottom:10px;">Select Your Rank</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
              ${PROFICIENCY_RANKS.map((r, i) => {
                const c      = RANK_COLORS[i];
                const active = r.name === rankName;
                const lbl    = r.laborReduction > 0 ? `−${r.laborReduction}%` : 'no reduction';
                return `
                  <button onclick="window.srSetRank('${r.name}')"
                    style="display:flex;flex-direction:column;padding:8px 10px;border-radius:8px;
                    background:${active ? c + '22' : 'transparent'};
                    border:1px solid ${active ? c + '88' : '#2a3a52'};
                    color:${active ? c : '#8d99ab'};cursor:pointer;text-align:left;transition:all 0.12s;"
                    onmouseover="if(!${active}){this.style.background='${c}11';this.style.borderColor='${c}44';}"
                    onmouseout="if(!${active}){this.style.background='transparent';this.style.borderColor='#2a3a52';}">
                    <span style="font-weight:700;font-size:13px;color:${active ? c : '#eef2f7'};">${r.name}</span>
                    <span style="font-size:10px;color:${c};margin-top:1px;">${lbl}</span>
                    <span style="font-size:10px;color:#394252;margin-top:1px;">${r.range} prof</span>
                  </button>
                `;
              }).join('')}
            </div>
            ${profRank ? `
              <button onclick="window.srClearRankOverride()"
                style="margin-top:10px;width:100%;padding:6px;background:transparent;
                border:1px solid #2a3040;color:#566174;border-radius:6px;font-size:11px;cursor:pointer;">
                ↩ Use Proficiency Tracker (${profRank.name})
              </button>
            ` : ''}
          </div>
        </div>
        ${profNote}
      </div>
    </div>
  `;
}

function renderLaborHint(baseLabor, profession) {
  const profRank  = getProfessionRank(profession);
  const rankName  = profRank?.name || _srOverrideRank || 'Famed';
  const rank      = PROFICIENCY_RANKS.find(r => r.name === rankName) || PROFICIENCY_RANKS[PROFICIENCY_RANKS.length - 1];
  if (!rank.laborReduction) return '';
  const eff = effectiveLabor(Number(baseLabor) || 0, rankName);
  return `At your rank (${rankName} ·  −${rank.laborReduction}%) you'd see <strong style="color:#eef2f7;">${eff} labor</strong> in-game`;
}

// ─── RENDER ───────────────────────────────────────────────────────────────────

// Per-session rank override (lets user manually pick a rank ignoring proficiency page)
let _srOverrideRank = null;

export function renderPage() {
  const auth = getAuth();
  const ign  = getIGN();

  const professionOptions = PROFESSIONS.map(p =>
    `<option value="${p}">${p}</option>`
  ).join('');

  return `
    <style>
      .sr-form { max-width: 680px; }
      .sr-field { margin-bottom: 18px; }
      .sr-label {
        display: block; font-size: 12px; font-weight: 700; letter-spacing: 0.07em;
        text-transform: uppercase; color: #566174; margin-bottom: 6px;
      }
      .sr-input {
        width: 100%; box-sizing: border-box; padding: 9px 12px;
        background: #1b2028; color: #eef2f7;
        border: 1px solid #485366; border-radius: 8px;
        font-size: 14px; font-family: inherit;
      }
      .sr-input:focus { outline: none; border-color: #638fd4; }
      .sr-row { display: flex; gap: 10px; align-items: center; }
      .sr-mat-row {
        display: grid; grid-template-columns: 1fr 80px 36px;
        gap: 8px; align-items: center; margin-bottom: 8px;
      }
      .sr-mat-qty {
        width: 100%; box-sizing: border-box; padding: 9px 10px;
        background: #1b2028; color: #eef2f7;
        border: 1px solid #485366; border-radius: 8px;
        font-size: 14px; font-family: inherit; text-align: center;
      }
      .sr-remove-btn {
        width: 36px; height: 36px; border-radius: 8px;
        background: #2a1a1a; border: 1px solid #5a2a2a; color: #f87171;
        font-size: 18px; cursor: pointer; display: flex;
        align-items: center; justify-content: center; line-height: 1; flex-shrink: 0;
      }
      .sr-remove-btn:hover { background: #3a1a1a; }
      .sr-add-btn {
        padding: 7px 16px; background: #1a2535;
        border: 1px dashed #2a3a52; color: #93c5fd;
        border-radius: 8px; font-size: 13px; cursor: pointer; margin-top: 4px;
      }
      .sr-add-btn:hover { background: #1e2d3d; }
      .sr-submit-btn {
        padding: 11px 32px; background: #1a3a2a;
        border: 1px solid #2a6a3a; color: #86efac;
        border-radius: 8px; font-size: 14px; font-weight: 700; cursor: pointer;
      }
      .sr-submit-btn:hover { background: #1e4a32; }
      .sr-submit-btn:disabled { opacity: 0.45; cursor: default; }
      .sr-status { font-size: 13px; margin-top: 14px; min-height: 18px; }
      .sr-note {
        font-size: 12px; color: #566174; line-height: 1.6;
        background: #1a2028; border: 1px solid #2a3040;
        border-radius: 8px; padding: 12px 14px; margin-bottom: 24px;
      }
      .sr-inline { display: flex; gap: 12px; }
      .sr-inline .sr-field { flex: 1; }
    </style>

    <h1 style="margin-bottom:6px;">Submit a Recipe</h1>
    <p style="color:#8d99ab;margin-bottom:24px;">
      Know a recipe that's missing or wrong in the app? Submit it here and
      I'll review it, clean it up, and push it live.
    </p>

    <div class="card sr-form">
      <div class="sr-note">
        Submissions are reviewed before going live. If approved, your IGN gets credited
        and you'll earn <strong style="color:#ffd166;">+5 ARC Points</strong>.
      </div>

      ${!auth.user ? `
        <div style="color:#f87171;font-size:13px;margin-bottom:18px;padding:10px 14px;
          background:#2a1a1a;border:1px solid #5a2a2a;border-radius:8px;">
          You need to be logged in to submit recipes.
        </div>
      ` : ''}

      ${auth.user && !ign ? `
        <div style="color:#fcd34d;font-size:13px;margin-bottom:18px;padding:10px 14px;
          background:#2a2410;border:1px solid #5a4a10;border-radius:8px;">
          Set your IGN on the Home page so your submission gets credited to you.
        </div>
      ` : ''}

      <div class="sr-inline">
        <div class="sr-field">
          <label class="sr-label" for="sr-output">Output Item Name</label>
          <input id="sr-output" class="sr-input" type="text" placeholder="e.g. Fine Lumber" autocomplete="off">
        </div>
        <div class="sr-field" style="flex:0 0 110px;">
          <label class="sr-label" for="sr-output-qty">Output Qty</label>
          <input id="sr-output-qty" class="sr-input" type="number" min="1" value="1" style="text-align:center;">
        </div>
      </div>

      <div class="sr-inline">
        <div class="sr-field">
          <label class="sr-label" for="sr-profession">Profession</label>
          <select id="sr-profession" class="sr-input" onchange="window.srProfessionChanged(this.value)">
            ${professionOptions}
          </select>
        </div>
      </div>

      ${renderRankRow(_currentProf)}

      <div class="sr-inline">
        <div class="sr-field">
          <label class="sr-label" for="sr-labor">Base Labor Cost <span style="font-weight:400;color:#566174;">(what it costs at max proficiency)</span></label>
          <input id="sr-labor" class="sr-input" type="number" min="0" value="10"
            style="text-align:center;" oninput="window.srLaborChanged(this.value)">
          <div id="sr-labor-hint" style="font-size:12px;color:#566174;margin-top:6px;min-height:16px;">
            ${renderLaborHint(10, _currentProf)}
          </div>
        </div>
      </div>

      <div class="sr-field">
        <label class="sr-label">Materials</label>
        <div id="sr-materials-list"></div>
        <button class="sr-add-btn" onclick="window.srAddMaterial()">+ Add Material</button>
      </div>

      <div class="sr-field">
        <label class="sr-label" for="sr-notes">Notes (optional)</label>
        <input id="sr-notes" class="sr-input" type="text"
          placeholder="e.g. Requires workbench, drops from recipe book, etc.">
      </div>

      <button id="sr-submit-btn" class="sr-submit-btn"
        onclick="window.srSubmit()" ${!auth.user ? 'disabled' : ''}>
        Submit Recipe
      </button>
      <div id="sr-status" class="sr-status"></div>
    </div>
  `;
}

// ─── MATERIAL ROWS ────────────────────────────────────────────────────────────

function renderMaterialRows() {
  const list = document.getElementById('sr-materials-list');
  if (!list) return;

  list.innerHTML = _materials.map((mat, idx) => `
    <div class="sr-mat-row" id="sr-mat-${idx}">
      <input class="sr-input" type="text" placeholder="Item name"
        value="${escapeHtml(mat.item)}"
        onchange="window.srUpdateMat(${idx}, 'item', this.value)"
        oninput="window.srUpdateMat(${idx}, 'item', this.value)">
      <input class="sr-mat-qty" type="number" min="1" value="${mat.qty}"
        onchange="window.srUpdateMat(${idx}, 'qty', this.value)"
        oninput="window.srUpdateMat(${idx}, 'qty', this.value)">
      <button class="sr-remove-btn" onclick="window.srRemoveMat(${idx})"
        title="Remove" ${_materials.length === 1 ? 'disabled style="opacity:0.3;cursor:default;"' : ''}>
        ×
      </button>
    </div>
  `).join('');
}

window.srAddMaterial = function() {
  _materials.push({ item: '', qty: 1 });
  renderMaterialRows();
};

window.srRemoveMat = function(idx) {
  if (_materials.length <= 1) return;
  _materials.splice(idx, 1);
  renderMaterialRows();
};

window.srUpdateMat = function(idx, field, value) {
  if (!_materials[idx]) return;
  _materials[idx][field] = field === 'qty' ? Math.max(1, parseInt(value) || 1) : value;
};

// ─── SUBMIT ───────────────────────────────────────────────────────────────────

window.srSubmit = async function() {
  const btn    = document.getElementById('sr-submit-btn');
  const status = document.getElementById('sr-status');

  const output    = document.getElementById('sr-output')?.value?.trim();
  const outputQty = parseInt(document.getElementById('sr-output-qty')?.value || '1');
  const profession = document.getElementById('sr-profession')?.value;
  const labor     = parseInt(document.getElementById('sr-labor')?.value || '0');
  const notes     = document.getElementById('sr-notes')?.value?.trim() || '';

  // Validate
  if (!output) {
    status.style.color = '#f87171';
    status.textContent = 'Output item name is required.';
    return;
  }

  // Collect valid materials
  const mats = _materials.filter(m => m.item.trim());
  if (!mats.length) {
    status.style.color = '#f87171';
    status.textContent = 'Add at least one material.';
    return;
  }

  const auth = getAuth();
  if (!auth.user) {
    status.style.color = '#f87171';
    status.textContent = 'You must be logged in to submit.';
    return;
  }

  if (btn) { btn.disabled = true; btn.textContent = 'Submitting…'; }
  if (status) status.textContent = '';

  const result = await window.electronAPI?.recipeSubmit({
    output,
    outputQty: outputQty || 1,
    profession,
    labor: labor || 0,
    materials: mats.map(m => ({ item: m.item.trim(), qty: Math.max(1, parseInt(m.qty) || 1) })),
    notes,
    ign: getIGN() || null,
  });

  if (btn) { btn.disabled = false; btn.textContent = 'Submit Recipe'; }

  if (result?.ok) {
    status.style.color = '#86efac';
    status.textContent = 'Submitted! I\'ll review it and push it live when approved.';
    // Reset form
    _materials = [{ item: '', qty: 1 }];
    document.getElementById('sr-output').value = '';
    document.getElementById('sr-output-qty').value = '1';
    document.getElementById('sr-labor').value = '10';
    document.getElementById('sr-notes').value = '';
    renderMaterialRows();
  } else {
    status.style.color = '#f87171';
    status.textContent = result?.error || 'Submission failed. Try again.';
  }
};

// ─── RANK HANDLERS ────────────────────────────────────────────────────────────

window.srProfessionChanged = function(prof) {
  _currentProf    = prof;
  _srOverrideRank = null; // reset override when profession changes
  const rankRow   = document.getElementById('sr-rank-row');
  if (rankRow) rankRow.outerHTML = renderRankRow(prof);
  srRefreshLaborHint();
};

window.srToggleRankPicker = function() {
  const picker = document.getElementById('sr-rank-picker');
  if (!picker) return;
  const open = picker.style.display !== 'none';
  picker.style.display = open ? 'none' : 'block';
  if (!open) {
    setTimeout(() => {
      const handler = (e) => {
        if (!document.getElementById('sr-rank-picker')?.contains(e.target) &&
            !document.getElementById('sr-rank-btn')?.contains(e.target)) {
          const p = document.getElementById('sr-rank-picker');
          if (p) p.style.display = 'none';
          document.removeEventListener('click', handler);
        }
      };
      document.addEventListener('click', handler);
    }, 0);
  }
};

window.srSetRank = function(rankName) {
  _srOverrideRank = rankName;
  document.getElementById('sr-rank-picker')?.style && (document.getElementById('sr-rank-picker').style.display = 'none');
  const rankRow = document.getElementById('sr-rank-row');
  if (rankRow) rankRow.outerHTML = renderRankRow(_currentProf);
  srRefreshLaborHint();
};

window.srClearRankOverride = function() {
  _srOverrideRank = null;
  document.getElementById('sr-rank-picker')?.style && (document.getElementById('sr-rank-picker').style.display = 'none');
  const rankRow = document.getElementById('sr-rank-row');
  if (rankRow) rankRow.outerHTML = renderRankRow(_currentProf);
  srRefreshLaborHint();
};

window.srLaborChanged = function(val) {
  srRefreshLaborHint(val);
};

function srRefreshLaborHint(val) {
  const hint  = document.getElementById('sr-labor-hint');
  if (!hint) return;
  const labor = val !== undefined ? val : document.getElementById('sr-labor')?.value;
  hint.innerHTML = renderLaborHint(labor, _currentProf);
}

// ─── POST-RENDER INIT ─────────────────────────────────────────────────────────
// Called by app.js via afterRender

export function initSubmitRecipe() {
  _materials      = [{ item: '', qty: 1 }];
  _srOverrideRank = null;
  _currentProf    = 'Alchemy';
  renderMaterialRows();
}
