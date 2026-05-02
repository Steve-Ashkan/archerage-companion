// ─── PROFICIENCY TRACKER ──────────────────────────────────────────────────────
// Track your proficiency points per skill. Rank is auto-derived from points.
// Other pages (Submit Recipe, Recipe Lookup) read from this to show accurate labor.

import {
  SKILL_GROUPS, PROFICIENCY_RANKS, RANK_COLORS, ALL_SKILLS,
  getRankFromPoints, getRankColor, effectiveLabor,
  getProfData, saveProfData,
} from '../data/proficiency.js';

const MAX_POINTS = 230000;

// ─── RENDER ───────────────────────────────────────────────────────────────────

export function renderPage() {
  const data = getProfData();

  return `
    <style>
      .prof-section { margin-bottom: 24px; }
      .prof-section-title {
        font-size: 11px; font-weight: 700; letter-spacing: 0.1em;
        text-transform: uppercase; color: #566174; margin: 0 0 12px;
        display: flex; align-items: center; gap: 8px;
      }
      .prof-columns {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 16px;
        align-items: start;
      }
      @media (max-width: 900px) {
        .prof-columns { grid-template-columns: 1fr; }
      }
      .prof-grid {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .prof-card {
        background: #1a2028; border: 1px solid #2a3040; border-radius: 10px;
        padding: 14px; display: flex; flex-direction: column; gap: 8px;
        transition: border-color 0.15s;
      }
      .prof-card:focus-within { border-color: #485366; }
      .prof-skill-name {
        font-size: 13px; font-weight: 700; color: #eef2f7;
      }
      .prof-points-row {
        display: flex; align-items: center; gap: 8px;
      }
      .prof-points-input {
        flex: 1; padding: 6px 10px; background: #0f1923;
        border: 1px solid #2a3040; border-radius: 7px;
        color: #eef2f7; font-size: 13px; font-family: inherit;
        width: 0; min-width: 0;
      }
      .prof-points-input:focus { outline: none; border-color: #485366; }
      .prof-rank-badge {
        font-size: 12px; font-weight: 700; padding: 3px 9px;
        border-radius: 20px; white-space: nowrap; flex-shrink: 0;
      }
      .prof-bar-wrap {
        height: 4px; background: #1e2a38; border-radius: 2px; overflow: hidden;
      }
      .prof-bar-fill {
        height: 100%; border-radius: 2px;
        transition: width 0.3s ease, background-color 0.3s ease;
      }
      .prof-reduction {
        font-size: 11px; color: #566174;
      }
      .prof-reset-btn {
        padding: 8px 20px; background: #2a1a1a; border: 1px solid #5a2a2a;
        color: #f87171; border-radius: 8px; font-size: 13px; cursor: pointer;
      }
      .prof-reset-btn:hover { background: #3a1a1a; }
    </style>

    <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px;margin-bottom:20px;">
      <div>
        <h1 style="margin:0 0 4px;">Proficiency Tracker</h1>
        <p style="margin:0;color:#8d99ab;font-size:13px;">
          Enter your points per skill. Your rank auto-fills into Submit a Recipe and Recipe Lookup.
        </p>
      </div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
        <button onclick="window.profImportScan()"
          style="padding:8px 16px;background:#1a2a3a;border:1px solid #2a5a7a;color:#93c5fd;border-radius:8px;font-size:13px;cursor:pointer;">
          Import from Scanner
        </button>
        <button class="prof-reset-btn" onclick="window.profResetAll()">Reset All</button>
      </div>
    </div>
    <div id="prof-import-status" style="display:none;margin-bottom:16px;"></div>

    <div class="prof-columns">
      ${SKILL_GROUPS.map(group => `
        <div class="card" style="margin-bottom:0;">
          <div class="prof-section-title">
            <span>${group.icon}</span> ${group.label}
          </div>
          <div class="prof-grid">
            ${group.skills.map(skill => renderSkillCard(skill, data[skill])).join('')}
          </div>
        </div>
      `).join('')}
    </div>

    <div class="card" style="font-size:12px;color:#566174;line-height:1.8;margin-top:16px;margin-bottom:24px;">
      <strong style="color:#8d99ab;">How ranks work:</strong>
      ${PROFICIENCY_RANKS.map((r, i) => {
        const color = RANK_COLORS[i];
        const reduction = r.laborReduction > 0 ? `−${r.laborReduction}% labor` : 'no reduction';
        return `<span style="display:inline-block;margin:2px 6px 2px 0;padding:2px 8px;
          border-radius:20px;background:${color}22;color:${color};border:1px solid ${color}44;">
          ${r.name} · ${reduction}
        </span>`;
      }).join('')}
    </div>
    <div style="height:24px;"></div>
  `;
}

function renderSkillCard(skill, entry) {
  const points  = entry?.points ?? '';
  const rank    = points !== '' ? getRankFromPoints(Number(points)) : null;
  const color   = rank ? getRankColor(rank.name) : '#2a3040';
  const pct     = points !== '' ? Math.min(100, (Number(points) / MAX_POINTS) * 100) : 0;
  const reduction = rank?.laborReduction > 0 ? `−${rank.laborReduction}% labor` : rank ? 'no reduction' : '';

  return `
    <div class="prof-card" id="prof-card-${skill.replace(/\s/g,'_')}">
      <div class="prof-skill-name">${skill}</div>
      <div class="prof-points-row">
        <input class="prof-points-input" type="number" min="0" max="230000"
          placeholder="Points…"
          value="${points}"
          oninput="window.profUpdate('${skill}', this.value)"
          title="${skill} proficiency points">
        ${rank
          ? `<span class="prof-rank-badge" style="background:${color}22;color:${color};border:1px solid ${color}44;">
              ${rank.name}
            </span>`
          : `<span class="prof-rank-badge" style="background:transparent;color:#394252;border:1px solid #2a3040;">
              —
            </span>`
        }
      </div>
      <div class="prof-bar-wrap">
        <div class="prof-bar-fill" id="prof-bar-${skill.replace(/\s/g,'_')}"
          style="width:${pct}%;background:${color};"></div>
      </div>
      <div class="prof-reduction" id="prof-red-${skill.replace(/\s/g,'_')}">
        ${reduction}
      </div>
    </div>
  `;
}

// ─── HANDLERS ─────────────────────────────────────────────────────────────────

window.profUpdate = function(skill, rawValue) {
  const points = rawValue === '' ? null : Math.min(MAX_POINTS, Math.max(0, parseInt(rawValue) || 0));
  const data   = getProfData();

  if (points === null) {
    delete data[skill];
  } else {
    data[skill] = { points };
  }
  saveProfData(data);

  // Surgically update just this card's rank badge, bar, and reduction
  const key   = skill.replace(/\s/g, '_');
  const rank  = points !== null ? getRankFromPoints(points) : null;
  const color = rank ? getRankColor(rank.name) : '#2a3040';
  const pct   = points !== null ? Math.min(100, (points / MAX_POINTS) * 100) : 0;

  const card = document.getElementById(`prof-card-${key}`);
  if (!card) return;

  // Update rank badge
  const row = card.querySelector('.prof-points-row');
  const existing = row?.querySelector('.prof-rank-badge');
  if (existing) {
    if (rank) {
      existing.style.background = `${color}22`;
      existing.style.color      = color;
      existing.style.border     = `1px solid ${color}44`;
      existing.textContent      = rank.name;
    } else {
      existing.style.background = 'transparent';
      existing.style.color      = '#394252';
      existing.style.border     = '1px solid #2a3040';
      existing.textContent      = '—';
    }
  }

  // Update bar
  const bar = document.getElementById(`prof-bar-${key}`);
  if (bar) { bar.style.width = `${pct}%`; bar.style.backgroundColor = color; }

  // Update reduction label
  const red = document.getElementById(`prof-red-${key}`);
  if (red) {
    red.textContent = rank?.laborReduction > 0 ? `−${rank.laborReduction}% labor` : rank ? 'no reduction' : '';
  }
};

window.profResetAll = function() {
  if (!confirm('Clear all proficiency data?')) return;
  saveProfData({});
  window.renderCurrentPage();
};

window.profImportScan = async function() {
  const statusEl = document.getElementById('prof-import-status');
  if (statusEl) {
    statusEl.style.display = 'block';
    statusEl.innerHTML = `<div style="padding:10px 14px;background:#1a2535;border:1px solid #394252;border-radius:8px;color:#8d99ab;font-size:13px;">Reading scan file…</div>`;
  }

  let result;
  try {
    result = await window.electronAPI.readProficiencyScan();
  } catch(e) {
    if (statusEl) statusEl.innerHTML = `<div style="padding:10px 14px;background:#2a1a1a;border:1px solid #5a2a2a;border-radius:8px;color:#f87171;font-size:13px;">Error: ${e.message}</div>`;
    return;
  }

  if (!result.ok) {
    const msg = result.error === 'File not found'
      ? 'No scan file found. Type <strong>!profscan</strong> in-game first, then try again.'
      : `Read error: ${result.error}`;
    if (statusEl) statusEl.innerHTML = `<div style="padding:10px 14px;background:#2a1a1a;border:1px solid #5a2a2a;border-radius:8px;color:#f87171;font-size:13px;">${msg}</div>`;
    return;
  }

  // Build a lowercase lookup map of known skills
  const skillLower = {};
  for (const skill of ALL_SKILLS) skillLower[skill.toLowerCase()] = skill;

  const data = getProfData();
  let matched = 0;
  let character = '';
  const unmatched = [];

  for (const [rawName, entry] of Object.entries(result.data)) {
    const canonical = skillLower[rawName.toLowerCase()];
    if (canonical) {
      data[canonical] = { points: entry.points };
      matched++;
      if (!character && entry.character) character = entry.character;
    } else {
      unmatched.push(rawName);
    }
  }

  saveProfData(data);

  const total = Object.keys(result.data).length;
  const charLine = character ? ` from <strong style="color:#eef2f7;">${character}</strong>` : '';
  const unmatchedNote = unmatched.length
    ? `<div style="margin-top:6px;font-size:11px;color:#566174;">Skipped (not in skill list): ${unmatched.join(', ')}</div>`
    : '';

  if (statusEl) {
    statusEl.innerHTML = `
      <div style="padding:10px 14px;background:#0a2a1a;border:1px solid #16a34a;border-radius:8px;color:#4ade80;font-size:13px;">
        Imported <strong>${matched}</strong> of ${total} skills${charLine}.
        ${unmatchedNote}
      </div>`;
  }

  window.renderCurrentPage();
};
