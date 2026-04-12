// ─── RECIPE LOOKUP & VERIFICATION ────────────────────────────────────────────
// Lets Ashkan verify/correct scraped recipes while in-game.
// Verified data gets saved to localStorage and used by the mat-check system.

import { RECIPES, PROFESSIONS } from '../data/recipes.js';
import { appState } from '../state.js';
import { escapeHtml, jsEscape, formatGold } from '../utils.js';
import {
  PROFICIENCY_RANKS, RANK_COLORS, getRankColor, effectiveLabor,
} from '../data/proficiency.js';

const AH_FEE = 0.05; // 5% auction house fee

const VERIFY_KEY = 'recipeVerifications'; // { recipeId: 'verified' | 'wrong' }
const EDITS_KEY  = 'recipeEdits';         // { recipeId: { ...overrides } }
const CUSTOM_KEY = 'customRecipes';       // [ ...recipe objects ]
const RANK_KEY   = 'proficiencyRank';

function getSavedRank() {
  return localStorage.getItem(RANK_KEY) || 'Famed';
}

function saveRank(name) {
  localStorage.setItem(RANK_KEY, name);
}

function getRankData(name) {
  return PROFICIENCY_RANKS.find(r => r.name === name) || PROFICIENCY_RANKS[PROFICIENCY_RANKS.length - 1];
}

function getVerifications() {
  try { return JSON.parse(localStorage.getItem(VERIFY_KEY) || '{}'); } catch { return {}; }
}

function getEdits() {
  try { return JSON.parse(localStorage.getItem(EDITS_KEY) || '{}'); } catch { return {}; }
}

function getCustomRecipes() {
  try { return JSON.parse(localStorage.getItem(CUSTOM_KEY) || '[]'); } catch { return []; }
}

function saveVerification(id, status) {
  const v = getVerifications();
  v[id] = status;
  localStorage.setItem(VERIFY_KEY, JSON.stringify(v));
}

function saveEdit(id, recipe) {
  const e = getEdits();
  e[id] = recipe;
  localStorage.setItem(EDITS_KEY, JSON.stringify(e));
}

function saveCustomRecipes(list) {
  localStorage.setItem(CUSTOM_KEY, JSON.stringify(list));
}

// Merge base recipes with edits
function getAllRecipes() {
  const edits   = getEdits();
  const custom  = getCustomRecipes();
  const base    = RECIPES.map(r => edits[r.id] ? { ...r, ...edits[r.id], id: r.id } : r);
  return [...base, ...custom];
}

// ─── RANK BADGE ───────────────────────────────────────────────────────────────

function renderRankBadge() {
  const rank  = getRankData(_rank);
  const color = getRankColor(_rank);
  const label = rank.laborReduction > 0
    ? `${_rank} · −${rank.laborReduction}% labor`
    : `${_rank} · no reduction`;

  return `
    <div style="position:relative;display:inline-block;">
      <button id="rank-badge-btn" onclick="window.toggleRankPicker()"
        style="display:flex;align-items:center;gap:8px;padding:7px 12px;border-radius:8px;
        background:#1a2028;border:1px solid ${color}55;color:${color};
        font-size:13px;font-weight:600;cursor:pointer;white-space:nowrap;
        transition:border-color 0.15s,background 0.15s;"
        title="Change your proficiency rank">
        <span style="font-size:11px;opacity:0.7;">⚡</span>
        ${escapeHtml(label)}
        <span style="font-size:10px;opacity:0.5;margin-left:2px;">▼</span>
      </button>
      <div id="rank-picker" style="display:none;position:absolute;top:calc(100% + 6px);right:0;z-index:500;
        background:#1a2028;border:1px solid #2a3a52;border-radius:12px;
        padding:14px;width:320px;box-shadow:0 12px 32px rgba(0,0,0,0.5);">
        <div style="font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;
          color:#566174;margin-bottom:10px;">Your Proficiency Rank</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
          ${PROFICIENCY_RANKS.map((r, i) => {
            const c       = RANK_COLORS[i];
            const active  = r.name === _rank;
            const label   = r.laborReduction > 0 ? `−${r.laborReduction}%` : 'no reduction';
            return `
              <button onclick="window.recipeSetRank('${r.name}')"
                style="display:flex;flex-direction:column;padding:8px 10px;border-radius:8px;
                background:${active ? c + '22' : 'transparent'};
                border:1px solid ${active ? c + '88' : '#2a3a52'};
                color:${active ? c : '#8d99ab'};cursor:pointer;text-align:left;
                transition:all 0.12s;"
                onmouseover="if(!${active}) { this.style.background='${c}11'; this.style.borderColor='${c}44'; }"
                onmouseout="if(!${active})  { this.style.background='transparent'; this.style.borderColor='#2a3a52'; }">
                <span style="font-weight:700;font-size:13px;color:${active ? c : '#eef2f7'};">${r.name}</span>
                <span style="font-size:10px;color:${c};margin-top:1px;">${label}</span>
                <span style="font-size:10px;color:#394252;margin-top:1px;">${r.range} prof</span>
              </button>
            `;
          }).join('')}
        </div>
        <div style="font-size:11px;color:#394252;margin-top:10px;text-align:center;">
          Higher rank = lower labor cost in-game
        </div>
      </div>
    </div>
  `;
}

// ─── RENDER ───────────────────────────────────────────────────────────────────

let _search   = '';
let _prof     = 'All';
let _filter   = 'all'; // all | unverified | verified | wrong
let _rank     = getSavedRank();

export function renderPage() {
  const verifications = getVerifications();
  const all           = getAllRecipes();

  const filtered = all.filter(r => {
    const matchSearch = !_search ||
      r.output.toLowerCase().includes(_search.toLowerCase()) ||
      r.materials.some(m => m.item.toLowerCase().includes(_search.toLowerCase()));
    const matchProf   = _prof === 'All' || r.profession === _prof;
    const status      = verifications[r.id] || 'unverified';
    const matchStatus = _filter === 'all' || status === _filter;
    return matchSearch && matchProf && matchStatus;
  });

  const total      = all.length;
  const verified   = Object.values(verifications).filter(v => v === 'verified').length;
  const wrong      = Object.values(verifications).filter(v => v === 'wrong').length;
  const unverified = total - verified - wrong;

  return `
    <div class="card" style="margin-bottom:16px;">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
        <div>
          <h2 style="margin:0 0 4px;">Recipe Verification</h2>
          <p style="margin:0;color:#566174;font-size:13px;">
            Verify scraped recipes while in-game. Corrections are saved locally.
          </p>
        </div>
        <div style="display:flex;gap:16px;font-size:13px;">
          <span style="color:#86efac;">✓ ${verified} verified</span>
          <span style="color:#f87171;">✗ ${wrong} wrong</span>
          <span style="color:#566174;">? ${unverified} unverified</span>
        </div>
      </div>

      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:16px;">
        <input id="recipe-search" type="text" placeholder="Search item or material..."
          value="${escapeHtml(_search)}"
          oninput="window.recipeSearch(this.value)"
          style="flex:1;min-width:200px;">

        <select onchange="window.recipeFilterProf(this.value)"
          style="padding:7px 10px;border-radius:8px;background:#1a2535;border:1px solid #2a3a52;color:#eef2f7;">
          <option value="All"${_prof === 'All' ? ' selected' : ''}>All Professions</option>
          ${PROFESSIONS.map(p => `<option value="${p}"${_prof === p ? ' selected' : ''}>${p}</option>`).join('')}
        </select>

        <select onchange="window.recipeFilterStatus(this.value)"
          style="padding:7px 10px;border-radius:8px;background:#1a2535;border:1px solid #2a3a52;color:#eef2f7;">
          <option value="all"${_filter === 'all' ? ' selected' : ''}>All</option>
          <option value="unverified"${_filter === 'unverified' ? ' selected' : ''}>Unverified</option>
          <option value="verified"${_filter === 'verified' ? ' selected' : ''}>Verified</option>
          <option value="wrong"${_filter === 'wrong' ? ' selected' : ''}>Wrong</option>
        </select>

        ${renderRankBadge()}
      </div>
    </div>

    ${filtered.length === 0
      ? `<div class="card" style="color:#566174;text-align:center;padding:40px;">No recipes match your filters.</div>`
      : filtered.map(r => renderRecipeCard(r, verifications[r.id] || 'unverified')).join('')
    }
  `;
}

function renderRecipeCard(recipe, status) {
  const statusColor = { verified: '#86efac', wrong: '#f87171', unverified: '#566174' };
  const statusLabel = { verified: '✓ Verified', wrong: '✗ Wrong', unverified: '? Unverified' };
  const color = statusColor[status];
  const isCustom = !RECIPES.find(r => r.id === recipe.id);

  return `
    <div class="card" style="margin-bottom:10px;border-left:3px solid ${color};">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:10px;">
        <div>
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
            <span style="font-weight:700;font-size:15px;color:#eef2f7;">${escapeHtml(recipe.output)}</span>
            ${recipe.outputQty > 1 ? `<span style="color:#566174;font-size:12px;">×${recipe.outputQty}</span>` : ''}
            <span style="font-size:11px;padding:2px 8px;border-radius:4px;
              background:#1a2535;color:#94a3b8;border:1px solid #2a3a52;">
              ${escapeHtml(recipe.profession)}
            </span>
            ${isCustom ? `<span style="font-size:11px;padding:2px 8px;border-radius:4px;
              background:#1a2030;color:#c084fc;border:1px solid #6030a0;">Custom</span>` : ''}
            ${(() => {
              const eff  = effectiveLabor(recipe.labor, _rank);
              const rank = getRankData(_rank);
              const reduced = rank.laborReduction > 0 && eff !== recipe.labor;
              return `<span data-recipe-labor="${recipe.labor}" style="font-size:11px;color:#566174;">${
                reduced
                  ? `${eff} labor <span style="color:#394252;">(base ${recipe.labor})</span>`
                  : `${recipe.labor} labor`
              }</span>`;
            })()}
          </div>
          <div style="margin-top:10px;display:flex;flex-wrap:wrap;gap:6px;">
            ${recipe.materials.map(m => `
              <span style="font-size:13px;padding:3px 10px;border-radius:6px;
                background:#0f1923;border:1px solid #1e2d3d;color:#cbd5e1;">
                <span style="color:#94a3b8;">${m.qty}×</span> ${escapeHtml(m.item)}
              </span>
            `).join('')}
          </div>
        </div>

        <div style="display:flex;gap:6px;align-items:flex-start;flex-shrink:0;">
          <span style="font-size:12px;color:${color};padding:3px 8px;border-radius:4px;
            background:${color}11;border:1px solid ${color}33;white-space:nowrap;">
            ${statusLabel[status]}
          </span>
          <button onclick="window.openMatChecker('${jsEscape(recipe.id)}')"
            style="padding:4px 10px;font-size:12px;background:#1a2a3a;border:1px solid #2d5a8a;
            color:#93c5fd;border-radius:6px;cursor:pointer;" title="Check materials & profit">⚗ Mats</button>
          <button onclick="window.verifyRecipe('${jsEscape(recipe.id)}', 'verified')"
            style="padding:4px 10px;font-size:12px;background:#1a2a1a;border:1px solid #2a5a2a;
            color:#86efac;border-radius:6px;cursor:pointer;" title="Mark as correct">✓</button>
          <button onclick="window.verifyRecipe('${jsEscape(recipe.id)}', 'wrong')"
            style="padding:4px 10px;font-size:12px;background:#2a1a1a;border:1px solid #5a2a2a;
            color:#f87171;border-radius:6px;cursor:pointer;" title="Mark as wrong">✗</button>
          <button onclick="window.openEditRecipeModal('${jsEscape(recipe.id)}')"
            style="padding:4px 10px;font-size:12px;background:#1a2535;border:1px solid #2a3a52;
            color:#94a3b8;border-radius:6px;cursor:pointer;" title="Edit recipe">✎</button>
          ${isCustom ? `<button onclick="window.deleteCustomRecipe('${jsEscape(recipe.id)}')"
            style="padding:4px 10px;font-size:12px;background:#2a1a1a;border:1px solid #5a2a2a;
            color:#f87171;border-radius:6px;cursor:pointer;" title="Delete">×</button>` : ''}
        </div>
      </div>
    </div>
  `;
}

// ─── HANDLERS ─────────────────────────────────────────────────────────────────

let _searchTimeout = null;
window.recipeSearch = function(val) {
  _search = val;
  clearTimeout(_searchTimeout);
  _searchTimeout = setTimeout(() => {
    const el = document.getElementById('recipe-search');
    const pos = el?.selectionStart;
    window.renderCurrentPage();
    const restored = document.getElementById('recipe-search');
    if (restored) {
      restored.focus();
      try { restored.setSelectionRange(pos, pos); } catch {}
    }
  }, 300);
};

window.recipeFilterProf = function(val) {
  _prof = val;
  window.renderCurrentPage();
};

window.recipeFilterStatus = function(val) {
  _filter = val;
  window.renderCurrentPage();
};

window.toggleRankPicker = function() {
  const picker = document.getElementById('rank-picker');
  if (!picker) return;
  const open = picker.style.display !== 'none';
  picker.style.display = open ? 'none' : 'block';
  if (!open) {
    // Close when clicking outside
    setTimeout(() => {
      const handler = (e) => {
        if (!document.getElementById('rank-picker')?.contains(e.target) &&
            !document.getElementById('rank-badge-btn')?.contains(e.target)) {
          const p = document.getElementById('rank-picker');
          if (p) p.style.display = 'none';
          document.removeEventListener('click', handler);
        }
      };
      document.addEventListener('click', handler);
    }, 0);
  }
};

window.recipeSetRank = function(val) {
  _rank = val;
  saveRank(val);

  // Close picker
  const picker = document.getElementById('rank-picker');
  if (picker) picker.style.display = 'none';

  // Patch the rank badge in-place without full re-render
  const badgeWrap = document.getElementById('rank-badge-btn')?.parentElement;
  if (badgeWrap) {
    badgeWrap.outerHTML = renderRankBadge();
  }

  // Update labor labels on all visible recipe cards
  const rank = getRankData(_rank);
  document.querySelectorAll('[data-recipe-labor]').forEach(el => {
    const base = parseInt(el.dataset.recipeLabor);
    const eff  = Math.round(base * (1 - rank.laborReduction / 100));
    const reduced = rank.laborReduction > 0 && eff !== base;
    el.innerHTML = reduced
      ? `${eff} labor <span style="color:#394252;">(base ${base})</span>`
      : `${base} labor`;
  });
};

window.verifyRecipe = function(id, status) {
  saveVerification(id, status);
  window.renderCurrentPage();
};

window.deleteCustomRecipe = function(id) {
  if (!confirm('Delete this custom recipe?')) return;
  const list = getCustomRecipes().filter(r => r.id !== id);
  saveCustomRecipes(list);
  window.renderCurrentPage();
};

// ─── EDIT MODAL ───────────────────────────────────────────────────────────────

window.openEditRecipeModal = function(id) {
  const all    = getAllRecipes();
  const recipe = all.find(r => r.id === id);
  if (!recipe) return;
  showRecipeModal(recipe, false);
};

window.openAddRecipeModal = function() {
  showRecipeModal(null, true);
};

function showRecipeModal(recipe, isNew) {
  document.getElementById('recipe-modal')?.remove();

  const mats = recipe?.materials || [{ item: '', qty: 1 }];

  const modal = document.createElement('div');
  modal.id = 'recipe-modal';
  modal.style.cssText = `position:fixed;inset:0;background:rgba(0,0,0,0.6);
    display:flex;align-items:center;justify-content:center;z-index:9999;`;

  modal.innerHTML = `
    <div style="background:#1a2535;border:1px solid #2a3a52;border-radius:12px;
      padding:24px;width:500px;max-height:85vh;overflow-y:auto;">
      <h3 style="margin:0 0 18px;color:#eef2f7;">${isNew ? 'Add Recipe' : 'Edit Recipe'}</h3>

      <div style="display:flex;gap:10px;margin-bottom:12px;">
        <div style="flex:2;">
          <label style="font-size:11px;color:#566174;display:block;margin-bottom:4px;">OUTPUT ITEM</label>
          <input id="rm-output" type="text" value="${escapeHtml(recipe?.output || '')}"
            style="width:100%;box-sizing:border-box;" placeholder="Item name">
        </div>
        <div style="flex:1;">
          <label style="font-size:11px;color:#566174;display:block;margin-bottom:4px;">QTY</label>
          <input id="rm-qty" type="number" min="1" value="${recipe?.outputQty || 1}"
            style="width:100%;box-sizing:border-box;">
        </div>
      </div>

      <div style="display:flex;gap:10px;margin-bottom:16px;">
        <div style="flex:2;">
          <label style="font-size:11px;color:#566174;display:block;margin-bottom:4px;">PROFESSION</label>
          <select id="rm-prof" style="width:100%;box-sizing:border-box;padding:7px;
            background:#0f1923;border:1px solid #2a3a52;color:#eef2f7;border-radius:6px;">
            ${PROFESSIONS.map(p => `<option${recipe?.profession === p ? ' selected' : ''}>${p}</option>`).join('')}
          </select>
        </div>
        <div style="flex:1;">
          <label style="font-size:11px;color:#566174;display:block;margin-bottom:4px;">LABOR</label>
          <input id="rm-labor" type="number" min="0" value="${recipe?.labor || 0}"
            style="width:100%;box-sizing:border-box;">
        </div>
      </div>

      <label style="font-size:11px;color:#566174;display:block;margin-bottom:8px;">MATERIALS</label>
      <div id="rm-mats">
        ${mats.map((m, i) => materialRow(m.item, m.qty, i)).join('')}
      </div>
      <button onclick="window.addMatRow()"
        style="margin-top:8px;padding:5px 12px;font-size:12px;background:#1a2535;
        border:1px solid #2a3a52;color:#93c5fd;border-radius:6px;cursor:pointer;">
        + Add Material
      </button>

      <div style="display:flex;gap:10px;margin-top:20px;">
        <button onclick="window.saveRecipeModal('${isNew ? '' : jsEscape(recipe?.id || '')}')"
          style="flex:1;padding:9px;background:#1a2a3a;border:1px solid #2d5a8a;
          color:#93c5fd;border-radius:8px;font-weight:600;cursor:pointer;">
          ${isNew ? 'Add Recipe' : 'Save Changes'}
        </button>
        <button onclick="document.getElementById('recipe-modal')?.remove()"
          style="flex:1;padding:9px;background:#1e2535;border:1px solid #2a3a52;
          color:#566174;border-radius:8px;cursor:pointer;">Cancel</button>
      </div>
    </div>
  `;
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
  document.body.appendChild(modal);
}

function materialRow(item, qty, i) {
  return `
    <div class="rm-mat-row" style="display:flex;gap:6px;margin-bottom:6px;">
      <input type="text" class="rm-mat-item" value="${escapeHtml(item)}" placeholder="Material name"
        style="flex:2;padding:6px 8px;background:#0f1923;border:1px solid #2a3a52;
        color:#eef2f7;border-radius:6px;font-size:13px;">
      <input type="number" class="rm-mat-qty" min="1" value="${qty}"
        style="flex:1;padding:6px 8px;background:#0f1923;border:1px solid #2a3a52;
        color:#eef2f7;border-radius:6px;font-size:13px;">
      <button onclick="this.closest('.rm-mat-row').remove()"
        style="padding:4px 8px;background:#2a1a1a;border:1px solid #5a2a2a;
        color:#f87171;border-radius:6px;cursor:pointer;font-size:13px;">×</button>
    </div>
  `;
}

window.addMatRow = function() {
  const container = document.getElementById('rm-mats');
  if (!container) return;
  const div = document.createElement('div');
  div.innerHTML = materialRow('', 1, Date.now());
  container.appendChild(div.firstElementChild);
};

// ─── MAT CHECKER & PROFIT CALCULATOR ─────────────────────────────────────────

window.openMatChecker = function(id) {
  const all    = getAllRecipes();
  const recipe = all.find(r => r.id === id);
  if (!recipe) return;

  document.getElementById('mat-checker-modal')?.remove();

  const prices  = appState.prices  || {};
  const storage = appState.storage || {};

  // Per-material analysis
  const matRows = recipe.materials.map(m => {
    const have     = Number(storage[m.item] || 0);
    const need     = m.qty;
    const short    = Math.max(0, need - have);
    const price    = Number(prices[m.item] || 0);
    const haveCost = Math.min(have, need) * price;
    const buyCost  = short * price;
    return { ...m, have, need, short, price, haveCost, buyCost };
  });

  const totalMatCost  = matRows.reduce((s, m) => s + (m.need * m.price), 0);
  const totalBuyCost  = matRows.reduce((s, m) => s + m.buyCost, 0);
  const outputPrice   = Number(prices[recipe.output] || 0);
  const ahRevenue     = outputPrice * (1 - AH_FEE);
  const netProfit     = ahRevenue - totalMatCost;
  const profitColor   = netProfit > 0 ? '#86efac' : netProfit < 0 ? '#f87171' : '#566174';
  const canCraft      = matRows.every(m => m.have >= m.need);
  const missingCount  = matRows.filter(m => m.short > 0).length;

  const modal = document.createElement('div');
  modal.id = 'mat-checker-modal';
  modal.style.cssText = `position:fixed;inset:0;background:rgba(0,0,0,0.6);
    display:flex;align-items:center;justify-content:center;z-index:9999;`;

  modal.innerHTML = `
    <div style="background:#1a2535;border:1px solid #2a3a52;border-radius:12px;
      padding:24px;width:580px;max-height:85vh;overflow-y:auto;">

      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px;">
        <div>
          <h3 style="margin:0 0 4px;color:#eef2f7;">${escapeHtml(recipe.output)}</h3>
          ${(() => {
            const eff  = effectiveLabor(recipe.labor, _rank);
            const rank = getRankData(_rank);
            const reduced = rank.laborReduction > 0 && eff !== recipe.labor;
            return `<span style="font-size:12px;color:#566174;">
              ${escapeHtml(recipe.profession)} ·
              ${reduced
                ? `<span style="color:#86efac;">${eff} labor</span>
                   <span style="color:#394252;font-size:11px;">(base ${recipe.labor} · ${_rank} −${rank.laborReduction}%)</span>`
                : `${recipe.labor} labor`}
            </span>`;
          })()}
        </div>
        <button onclick="document.getElementById('mat-checker-modal')?.remove()"
          style="background:none;border:none;color:#566174;font-size:18px;cursor:pointer;">✕</button>
      </div>

      <!-- Materials Table -->
      <table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:20px;min-width:0;">
        <thead>
          <tr style="border-bottom:1px solid #2a3a52;">
            <th style="padding:6px 8px;text-align:left;color:#566174;font-size:11px;text-transform:uppercase;">Material</th>
            <th style="padding:6px 8px;text-align:center;color:#566174;font-size:11px;text-transform:uppercase;">Need</th>
            <th style="padding:6px 8px;text-align:center;color:#566174;font-size:11px;text-transform:uppercase;">Have</th>
            <th style="padding:6px 8px;text-align:center;color:#566174;font-size:11px;text-transform:uppercase;">Short</th>
            <th style="padding:6px 8px;text-align:right;color:#566174;font-size:11px;text-transform:uppercase;">Buy Cost</th>
          </tr>
        </thead>
        <tbody>
          ${matRows.map(m => `
            <tr style="border-bottom:1px solid #1e2d3d;">
              <td style="padding:8px;color:#eef2f7;">${escapeHtml(m.item)}</td>
              <td style="padding:8px;text-align:center;color:#94a3b8;">${m.need}</td>
              <td style="padding:8px;text-align:center;color:${m.have >= m.need ? '#86efac' : '#f87171'};">${m.have}</td>
              <td style="padding:8px;text-align:center;color:${m.short > 0 ? '#f87171' : '#566174'};">
                ${m.short > 0 ? m.short : '—'}
              </td>
              <td style="padding:8px;text-align:right;color:${m.buyCost > 0 ? '#ffd166' : '#566174'};">
                ${m.price > 0 ? (m.buyCost > 0 ? formatGold(m.buyCost) : '—') : '<span style="color:#566174;">No price</span>'}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <!-- Status Banner -->
      <div style="padding:10px 14px;border-radius:8px;margin-bottom:16px;
        background:${canCraft ? '#1a2a1a' : '#2a1a1a'};
        border:1px solid ${canCraft ? '#2a5a2a' : '#5a2a2a'};">
        <span style="color:${canCraft ? '#86efac' : '#f87171'};font-weight:600;">
          ${canCraft ? '✓ You have all materials' : `✗ Missing ${missingCount} material${missingCount === 1 ? '' : 's'}`}
        </span>
        ${!canCraft && totalBuyCost > 0 ? `
          <span style="color:#94a3b8;font-size:13px;margin-left:10px;">
            Cost to complete: <span style="color:#ffd166;">${formatGold(totalBuyCost)}</span>
          </span>
        ` : ''}
      </div>

      <!-- Profit Summary -->
      <div style="background:#0f1923;border:1px solid #1e2d3d;border-radius:10px;padding:16px;">
        <div style="font-size:12px;color:#566174;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:12px;">
          Profit Analysis
        </div>
        <div style="display:flex;flex-direction:column;gap:8px;font-size:13px;">
          <div style="display:flex;justify-content:space-between;">
            <span style="color:#94a3b8;">Total material cost</span>
            <span style="color:#ffd166;">${totalMatCost > 0 ? formatGold(totalMatCost) : '<span style="color:#566174;">No prices set</span>'}</span>
          </div>
          <div style="display:flex;justify-content:space-between;">
            <span style="color:#94a3b8;">Sale price (${escapeHtml(recipe.output)})</span>
            <span style="color:#ffd166;">${outputPrice > 0 ? formatGold(outputPrice) : '<span style="color:#566174;">No price set</span>'}</span>
          </div>
          <div style="display:flex;justify-content:space-between;">
            <span style="color:#94a3b8;">AH revenue <span id="mc-fee-label" style="color:#566174;font-size:11px;">(−5% fee)</span></span>
            <span id="mc-ah-revenue" style="color:#ffd166;">${outputPrice > 0 ? formatGold(ahRevenue) : '—'}</span>
          </div>
          <div style="border-top:1px solid #2a3a52;padding-top:10px;display:flex;justify-content:space-between;align-items:center;">
            <span style="color:#eef2f7;font-weight:700;">Net Profit</span>
            <span id="mc-net-profit" style="font-weight:700;font-size:16px;color:${profitColor};">
              ${outputPrice > 0 && totalMatCost > 0
                ? (netProfit >= 0 ? '+' : '') + formatGold(netProfit)
                : 'Set prices to calculate'}
            </span>
          </div>
          ${outputPrice > 0 && totalMatCost > 0 ? `
            <div style="display:flex;justify-content:space-between;margin-top:4px;">
              <span style="color:#566174;font-size:12px;">Margin</span>
              <span id="mc-margin" style="font-size:12px;color:${profitColor};">
                ${((netProfit / totalMatCost) * 100).toFixed(1)}%
              </span>
            </div>
          ` : ''}
        </div>

        ${recipe.outputQty > 1 ? `
          <div style="margin-top:10px;padding-top:10px;border-top:1px solid #1e2d3d;
            font-size:12px;color:#566174;">
            Note: This recipe produces <strong style="color:#94a3b8;">${recipe.outputQty}×</strong>
            ${escapeHtml(recipe.output)} per craft.
            Profit above is for the full batch.
          </div>
        ` : ''}
      </div>

      <!-- No Fee Toggle -->
      <div style="margin-top:12px;display:flex;align-items:center;gap:8px;font-size:12px;color:#566174;">
        <input type="checkbox" id="mc-no-fee" onchange="window.toggleNoFee('${jsEscape(id)}')">
        <label for="mc-no-fee">This is a No Fee item (0% AH fee)</label>
      </div>
    </div>
  `;

  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
  document.body.appendChild(modal);
};

window.toggleNoFee = function(id) {
  const checked     = document.getElementById('mc-no-fee')?.checked;
  const fee         = checked ? 0 : AH_FEE;
  const all         = getAllRecipes();
  const recipe      = all.find(r => r.id === id);
  if (!recipe) return;

  const prices      = appState.prices || {};
  const outputPrice = Number(prices[recipe.output] || 0);
  const ahRevenue   = outputPrice * (1 - fee);
  const totalMatCost = recipe.materials.reduce((s, m) => s + (m.qty * Number(prices[m.item] || 0)), 0);
  const netProfit   = ahRevenue - totalMatCost;
  const profitColor = netProfit > 0 ? '#86efac' : netProfit < 0 ? '#f87171' : '#566174';

  const ahEl      = document.getElementById('mc-ah-revenue');
  const profitEl  = document.getElementById('mc-net-profit');
  const marginEl  = document.getElementById('mc-margin');
  const feeLabel  = document.getElementById('mc-fee-label');

  if (ahEl)     ahEl.textContent     = outputPrice > 0 ? formatGold(ahRevenue) : '—';
  if (feeLabel) feeLabel.textContent = checked ? '(0% fee — No Fee item)' : '(−5% fee)';
  if (profitEl) {
    profitEl.style.color = profitColor;
    profitEl.textContent = outputPrice > 0 && totalMatCost > 0
      ? (netProfit >= 0 ? '+' : '') + formatGold(netProfit)
      : 'Set prices to calculate';
  }
  if (marginEl && outputPrice > 0 && totalMatCost > 0) {
    marginEl.style.color   = profitColor;
    marginEl.textContent   = ((netProfit / totalMatCost) * 100).toFixed(1) + '%';
  }
};

window.saveRecipeModal = function(existingId) {
  const output = document.getElementById('rm-output')?.value?.trim();
  const qty    = parseInt(document.getElementById('rm-qty')?.value || '1');
  const prof   = document.getElementById('rm-prof')?.value;
  const labor  = parseInt(document.getElementById('rm-labor')?.value || '0');

  if (!output) { alert('Output item name is required.'); return; }

  const matItems = document.querySelectorAll('.rm-mat-item');
  const matQtys  = document.querySelectorAll('.rm-mat-qty');
  const materials = [];
  matItems.forEach((el, i) => {
    const item = el.value.trim();
    const q    = parseInt(matQtys[i]?.value || '1');
    if (item) materials.push({ item, qty: q });
  });

  if (!materials.length) { alert('At least one material is required.'); return; }

  const recipe = { output, outputQty: qty, profession: prof, labor, materials };

  if (existingId) {
    // Edit existing
    saveEdit(existingId, recipe);
    saveVerification(existingId, 'verified');
  } else {
    // Add custom
    const id   = 'custom_' + Date.now();
    const list = getCustomRecipes();
    list.push({ ...recipe, id });
    saveCustomRecipes(list);
    saveVerification(id, 'verified');
  }

  document.getElementById('recipe-modal')?.remove();
  window.renderCurrentPage();
};
