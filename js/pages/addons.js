// ─── ADDONS PAGE ──────────────────────────────────────────────────────────────

import { escapeHtml } from '../utils.js';

const ADDON_PATH_KEY = 'addonInstallPath';

let _status   = null;  // { ahscanner: { bundledExists, installed }, invscanner: ... }
let _checked  = false;
let _checking = false;

const ADDONS = {
  ahscanner: {
    label:    'AH Scanner',
    desc:     'Scans the Auction House for item prices and exports them to the app.',
    commands: [
      { cmd: '!scan',       desc: 'Smart scan — skips items scanned in the last 3 days' },
      { cmd: '!scanfull',   desc: 'Scan everything regardless of age' },
      { cmd: '!scanstop',   desc: 'Stop an in-progress scan' },
      { cmd: '!scanstatus', desc: 'Show current progress' },
      { cmd: '!scanhelp',   desc: 'Show all commands' },
    ],
  },
  invscanner: {
    label:    'Inventory Scanner',
    desc:     'Scans your bags and exports quantities to the app. Run !scanstart in-game.',
    commands: [
      { cmd: '!scanstart', desc: 'Launch the guided scan wizard' },
    ],
  },
};

function getPath() {
  return localStorage.getItem(ADDON_PATH_KEY) || null;
}

async function checkStatus() {
  if (_checking) return;
  _checking = true;
  const savedPath = getPath();
  const result = await window.electronAPI?.checkAddonStatus(
    savedPath ? { targetBase: savedPath } : undefined
  );
  _checking = false;
  _checked  = true;
  if (result?.ok) {
    _status = result.status;
    window.renderCurrentPage?.();
  }
}

// ─── RENDER ───────────────────────────────────────────────────────────────────

export function renderPage() {
  if (!_checked) {
    checkStatus();
  }

  const savedPath = getPath();
  const defaultPath = 'Documents\\ArcheRage\\Addon';

  return `
    <div style="max-width:760px;margin:0 auto;">

      <div style="margin-bottom:20px;">
        <h2 style="margin:0 0 4px;color:#eef2f7;">Addons</h2>
        <div style="font-size:13px;color:#566174;">
          Install and manage the in-game addons that connect ArcheRage to this app.
        </div>
      </div>

      <!-- Install Path -->
      <div class="card" style="margin-bottom:16px;">
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">
          <div>
            <div style="font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;
              color:#566174;margin-bottom:4px;">Addon Install Path</div>
            <div style="font-size:13px;color:${savedPath ? '#eef2f7' : '#566174'};">
              ${savedPath
                ? `<code style="background:#0f1923;padding:2px 8px;border-radius:5px;font-size:12px;">${escapeHtml(savedPath)}</code>`
                : `<span>Using default: <code style="background:#0f1923;padding:2px 8px;border-radius:5px;font-size:12px;">${defaultPath}</code></span>`
              }
            </div>
          </div>
          <div style="display:flex;gap:8px;">
            <button onclick="window.addonsPickPath()"
              style="padding:7px 16px;background:#1a2535;border:1px solid #2d5a8a;color:#93c5fd;
              border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;">
              ${savedPath ? 'Change Path' : 'Select Folder'}
            </button>
            <button onclick="window.addonsRecheck()"
              style="padding:7px 14px;background:#1e2535;border:1px solid #2a3a52;color:#566174;
              border-radius:8px;font-size:13px;cursor:pointer;">
              ${_checking ? 'Checking…' : 'Re-check'}
            </button>
          </div>
        </div>
      </div>

      <!-- Addon Cards -->
      ${Object.entries(ADDONS).map(([id, addon]) => renderAddonCard(id, addon)).join('')}

      <!-- Install All -->
      <div class="card" style="margin-top:8px;">
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">
          <div>
            <div style="font-size:14px;font-weight:600;color:#eef2f7;margin-bottom:3px;">Install / Reinstall All</div>
            <div style="font-size:13px;color:#8d99ab;">
              Copies both addons to your ArcheRage folder. Safe to run again — overwrites existing files with the latest version.
            </div>
          </div>
          <button onclick="window.addonsInstallAll()"
            style="padding:9px 22px;background:#3a1a1a;border:1px solid #c0392b;color:#f87171;
            border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;white-space:nowrap;">
            Install All Addons
          </button>
        </div>
      </div>

    </div>
  `;
}

function renderAddonCard(id, addon) {
  const s = _status?.[id];

  let statusBadge;
  if (!_checked) {
    statusBadge = `<span style="font-size:12px;color:#566174;padding:3px 10px;border-radius:20px;
      background:#1a2028;border:1px solid #2a3040;">Checking…</span>`;
  } else if (s?.installed) {
    statusBadge = `<span style="font-size:12px;color:#86efac;padding:3px 10px;border-radius:20px;
      background:#0a2a1a;border:1px solid #2a5a2a;">✓ Installed</span>`;
  } else {
    statusBadge = `<span style="font-size:12px;color:#f87171;padding:3px 10px;border-radius:20px;
      background:#2a1a1a;border:1px solid #5a2a2a;">✗ Not Installed</span>`;
  }

  const commands = addon.commands.map(c => `
    <div style="display:flex;align-items:center;gap:10px;padding:6px 10px;
      background:#0f1923;border:1px solid #1e2d3d;border-radius:7px;">
      <code style="font-size:12px;color:#86efac;font-family:monospace;white-space:nowrap;">${c.cmd}</code>
      <span style="font-size:12px;color:#566174;">${c.desc}</span>
    </div>
  `).join('');

  return `
    <div class="card" style="margin-bottom:12px;${s?.installed ? 'border-color:#2a5a2a;' : (!_checked ? '' : 'border-color:#5a2a2a;')}">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:14px;">
        <div>
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:4px;">
            <span style="font-size:15px;font-weight:700;color:#eef2f7;">${addon.label}</span>
            ${statusBadge}
          </div>
          <div style="font-size:13px;color:#8d99ab;">${addon.desc}</div>
        </div>
        <button onclick="window.addonsInstallOne('${id}')"
          style="padding:7px 18px;background:#1a2535;border:1px solid #2d5a8a;color:#93c5fd;
          border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;white-space:nowrap;flex-shrink:0;">
          ${s?.installed ? 'Reinstall' : 'Install'}
        </button>
      </div>

      <div style="font-size:10px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;
        color:#566174;margin-bottom:8px;">In-Game Commands</div>
      <div style="display:flex;flex-direction:column;gap:5px;">
        ${commands}
      </div>
    </div>
  `;
}

// ─── HANDLERS ─────────────────────────────────────────────────────────────────

window.addonsPickPath = async function() {
  const savedPath = getPath();
  const picked = await window.electronAPI?.pickFolder({ defaultPath: savedPath });
  if (!picked?.ok || !picked.path) return;
  localStorage.setItem(ADDON_PATH_KEY, picked.path);
  _checked = false;
  _status  = null;
  window.renderCurrentPage?.();
};

window.addonsRecheck = async function() {
  _checked = false;
  _status  = null;
  window.renderCurrentPage?.();
};

window.addonsInstallOne = async function(id) {
  const savedPath = getPath();
  if (!savedPath) {
    const picked = await window.electronAPI?.pickFolder({});
    if (!picked?.ok || !picked.path) return;
    localStorage.setItem(ADDON_PATH_KEY, picked.path);
  }

  const targetBase = getPath();
  const result = await window.electronAPI?.installAddons({ names: [id], targetBase });
  if (!result?.ok || !result.results[id]?.ok) {
    alert(`Install failed: ${result?.results?.[id]?.error || result?.error || 'Unknown error'}`);
    return;
  }
  _checked = false;
  _status  = null;
  window.renderCurrentPage?.();
};

window.addonsInstallAll = async function() {
  const savedPath = getPath();
  if (!savedPath) {
    const picked = await window.electronAPI?.pickFolder({});
    if (!picked?.ok || !picked.path) return;
    localStorage.setItem(ADDON_PATH_KEY, picked.path);
  }

  const targetBase = getPath();
  const result = await window.electronAPI?.installAddons({ targetBase });
  if (!result?.ok) {
    alert(`Install failed: ${result?.error || 'Unknown error'}`);
    return;
  }

  const failed = Object.entries(result.results || {}).filter(([, r]) => !r.ok);
  if (failed.length) {
    alert('Some addons failed:\n' + failed.map(([n, r]) => `${n}: ${r.error}`).join('\n'));
  }

  _checked = false;
  _status  = null;
  window.renderCurrentPage?.();
};
