// ─── DEV / ADMIN PANEL ────────────────────────────────────────────────────────
// Accessible via Ctrl+Shift+D only. Never shown in the tab bar.
// Requires 'admin' or 'dev' role in production.

import { getAuth, getRole, devSetRole } from "../auth.js";
import { ROLE_LABELS, ROLE_COLORS, ROLE_LEVEL, ALL_ROLES, ALL_ROLES_DISPLAY } from "../roles.js";
import { CONFIG } from "../config.js";
import { escapeHtml } from "../utils.js";

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function rolePill(role) {
  const color = ROLE_COLORS[role] || '#566174';
  const label = ROLE_LABELS[role] || role;
  return `<span style="display:inline-block;padding:2px 10px;border-radius:20px;font-size:12px;font-weight:700;
    background:${color}22;color:${color};border:1px solid ${color}55;">${label}</span>`;
}

function formatExpiry(iso) {
  if (!iso) return '<span style="color:#566174;">—</span>';
  const d    = new Date(iso);
  const now  = new Date();
  const days = Math.ceil((d - now) / 86400000);
  if (days <= 0) return '<span style="color:#f87171;">Expired</span>';
  const color = days < 3 ? '#f87171' : days < 7 ? '#fcd34d' : '#86efac';
  return `<span style="color:${color};">${d.toLocaleDateString()} (${days}d)</span>`;
}

function formatLastSeen(iso) {
  if (!iso) return '<span style="color:#566174;">—</span>';
  const d    = new Date(iso);
  const now  = new Date();
  const diff = now - d;
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 2)   return '<span style="color:#86efac;">Just now</span>';
  if (mins  < 60)  return `<span style="color:#94a3b8;">${mins}m ago</span>`;
  if (hours < 24)  return `<span style="color:#94a3b8;">${hours}h ago</span>`;
  return `<span style="color:#566174;">${days}d ago</span>`;
}

function lsSize(key) {
  const val = localStorage.getItem(key);
  if (!val) return '0 B';
  const bytes = new Blob([val]).size;
  return bytes > 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${bytes} B`;
}

function lsPreview(key) {
  const val = localStorage.getItem(key);
  if (!val) return '';
  return val.length > 120 ? val.slice(0, 120) + '…' : val;
}

// ─── RENDER ───────────────────────────────────────────────────────────────────

export function renderPage() {
  const auth   = getAuth();
  const role   = getRole();
  const lsKeys = Object.keys(localStorage).sort();

  return `
    <style>
      .dp-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
      .dp-grid-full { grid-column: 1 / -1; }
      .dp-label { font-size: 11px; font-weight: 700; letter-spacing: 0.08em;
        text-transform: uppercase; color: #566174; margin-bottom: 6px; }
      .dp-value { font-size: 14px; color: #eef2f7; }
      .dp-mono  { font-family: monospace; font-size: 13px; color: #94a3b8; word-break: break-all; }
      .dp-action-row { display: flex; flex-wrap: wrap; gap: 8px; }
      .dp-btn { padding: 7px 16px; border-radius: 8px; font-size: 13px; font-weight: 600;
        cursor: pointer; border: 1px solid #3a4353; background: #262c36; color: #eef2f7;
        transition: background 0.15s; }
      .dp-btn:hover  { background: #313949; }
      .dp-btn:disabled { opacity: 0.45; cursor: default; }
      .dp-btn.danger  { background: #2a1a1a; border-color: #5a2a2a; color: #f87171; }
      .dp-btn.danger:hover  { background: #3a1a1a; }
      .dp-btn.success { background: #1a2a1a; border-color: #2a5a2a; color: #86efac; }
      .dp-btn.success:hover { background: #1a3a1a; }
      .dp-btn.warn    { background: #2a2410; border-color: #5a4a10; color: #fcd34d; }
      .dp-btn.warn:hover    { background: #3a3410; }
      .dp-ls-row  { display: flex; align-items: center; gap: 10px; padding: 8px 0;
        border-bottom: 1px solid #2a3040; font-size: 13px; }
      .dp-ls-key  { font-family: monospace; color: #93c5fd; min-width: 180px; }
      .dp-ls-size { color: #566174; font-size: 11px; min-width: 50px; }
      .dp-ls-preview { color: #64748b; font-size: 11px; flex: 1; overflow: hidden;
        white-space: nowrap; text-overflow: ellipsis; }
      .dp-role-btn { padding: 5px 14px; border-radius: 20px; font-size: 12px; font-weight: 700;
        cursor: pointer; border: 1px solid; transition: all 0.15s; }
      .dp-section-sep { border: none; border-top: 1px solid #2a3040; margin: 4px 0; }

      /* User table */
      .dp-user-table { width: 100%; border-collapse: collapse; font-size: 13px; }
      .dp-user-table th { background: #1a2535; color: #566174; font-size: 11px;
        text-transform: uppercase; letter-spacing: 0.08em; padding: 8px 12px; text-align: left; }
      .dp-user-table td { padding: 10px 12px; border-bottom: 1px solid #1e2d3d; color: #cbd5e1;
        vertical-align: middle; }
      .dp-user-table tr:hover td { background: #1a2535; }
      .dp-user-avatar { width: 28px; height: 28px; border-radius: 50%; object-fit: cover;
        vertical-align: middle; margin-right: 8px; }
      .dp-user-name { font-weight: 600; }

      /* Role picker modal */
      .dp-role-modal { position: fixed; inset: 0; background: rgba(0,0,0,0.6);
        display: flex; align-items: center; justify-content: center; z-index: 9999; }
      .dp-role-modal-box { background: #1a2535; border: 1px solid #2a3a52; border-radius: 12px;
        padding: 24px; min-width: 280px; }
      .dp-role-modal-title { font-size: 15px; font-weight: 700; margin: 0 0 16px; color: #eef2f7; }
      .dp-role-modal-grid  { display: flex; flex-wrap: wrap; gap: 8px; }
      .dp-role-modal-cancel { margin-top: 16px; width: 100%; }

      /* Days input row */
      .dp-days-row { display: flex; gap: 6px; align-items: center; }
      .dp-days-input { background: #1a2535; border: 1px solid #2a3a52; border-radius: 6px;
        color: #eef2f7; padding: 5px 10px; font-size: 13px; width: 70px; }

      /* Status badge */
      .dp-table-status { font-size: 12px; color: #566174; margin: 10px 0 0; }
    </style>

    <h1>Dev / Admin Panel</h1>
    <p style="color:#566174;font-size:13px;margin:-12px 0 24px;">
      Ctrl+Shift+D to toggle. Not visible in the tab bar.
    </p>

    <div class="dp-grid">

      <!-- ── Auth State ───────────────────────────────────────────────────── -->
      <div class="card">
        <h3 style="margin-top:0;">Auth State</h3>
        <div style="display:flex;flex-direction:column;gap:12px;">
          <div>
            <div class="dp-label">Current Role</div>
            <div class="dp-value">${rolePill(role)}</div>
          </div>
          <div>
            <div class="dp-label">Pro Status</div>
            <div class="dp-value" style="color:${auth.isPro ? '#86efac' : '#566174'}">
              ${auth.isPro ? 'Active' : 'Inactive'}
            </div>
          </div>
          <div>
            <div class="dp-label">Pro Expires</div>
            <div class="dp-value">${formatExpiry(auth.proExpires)}</div>
          </div>
          <div>
            <div class="dp-label">User</div>
            <div class="dp-value">${auth.user
              ? `${escapeHtml(auth.user.name)} <span style="color:#566174;">(${escapeHtml(auth.user.id)})</span>`
              : '<span style="color:#566174;">Not logged in</span>'
            }</div>
          </div>
          <div>
            <div class="dp-label">Auth Enabled</div>
            <div class="dp-value" style="color:${CONFIG.AUTH_ENABLED ? '#86efac' : '#f59e0b'}">
              ${CONFIG.AUTH_ENABLED ? 'Yes' : 'No — dev mode'}
            </div>
          </div>
        </div>
      </div>

      <!-- ── Role Switcher ────────────────────────────────────────────────── -->
      <div class="card">
        <h3 style="margin-top:0;">Role Switcher <span style="font-size:12px;font-weight:400;color:#566174;">(local only)</span></h3>
        <p style="font-size:12px;color:#566174;margin:0 0 14px;">
          Simulates different roles for UI testing. Resets on refresh unless DEV_FORCE_PRO is set.
        </p>
        <div style="display:flex;flex-wrap:wrap;gap:8px;">
          ${ALL_ROLES_DISPLAY.map(r => {
            const color    = ROLE_COLORS[r];
            const isActive = r === role;
            return `<button class="dp-role-btn"
              style="background:${isActive ? color + '33' : 'transparent'};
                     color:${color};border-color:${color}${isActive ? '' : '44'};"
              onclick="window.devSwitchRole('${r}')">
              ${ROLE_LABELS[r]}
            </button>`;
          }).join('')}
        </div>
        <hr class="dp-section-sep" style="margin-top:16px;">
        <p style="font-size:11px;color:#3d4f64;margin:10px 0 0;">
          To persist across restarts set <code style="color:#93c5fd;">DEV_FORCE_PRO: true</code>
          and <code style="color:#93c5fd;">DEV_ROLE: '${escapeHtml(role)}'</code> in <code style="color:#93c5fd;">js/config.js</code>.
        </p>
      </div>

      <!-- ── Quick Actions ────────────────────────────────────────────────── -->
      <div class="card">
        <h3 style="margin-top:0;">Quick Actions</h3>
        <div class="dp-action-row">
          <button class="dp-btn success" onclick="window.devTestNotification()">Test Notification</button>
          <button class="dp-btn" onclick="window.devOpenAddonFolder()">Open Addon Folder</button>
          <button class="dp-btn danger" onclick="window.devClearToken()">Clear Auth Token</button>
        </div>
      </div>

      <!-- ── App Info ─────────────────────────────────────────────────────── -->
      <div class="card">
        <h3 style="margin-top:0;">App Info</h3>
        <div style="display:flex;flex-direction:column;gap:8px;font-size:13px;">
          <div><span style="color:#566174;">Version</span> &nbsp; v${CONFIG.version}</div>
          <div><span style="color:#566174;">Backend</span> &nbsp;
            ${CONFIG.API_BASE
              ? `<span style="color:#86efac;">${CONFIG.API_BASE}</span>`
              : '<span style="color:#566174;">Not connected</span>'}
          </div>
          <div><span style="color:#566174;">Supabase</span> &nbsp;
            ${CONFIG.SUPABASE_URL
              ? `<span style="color:#86efac;">Connected</span>`
              : '<span style="color:#566174;">Not configured</span>'}
          </div>
          <div><span style="color:#566174;">Discord App</span> &nbsp;
            ${CONFIG.DISCORD_CLIENT_ID
              ? `<span style="color:#86efac;">${CONFIG.DISCORD_CLIENT_ID}</span>`
              : '<span style="color:#566174;">Not configured</span>'}
          </div>
        </div>
      </div>

      <!-- ── User Management ─────────────────────────────────────────────── -->
      <div class="card dp-grid-full">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
          <h3 style="margin:0;">User Management</h3>
          <button class="dp-btn" id="dp-refresh-btn" onclick="window.loadAdminUsers()">Refresh</button>
        </div>

        <div id="dp-user-table-wrap">
          <div style="color:#566174;font-size:13px;padding:20px 0;">Loading users…</div>
        </div>
      </div>

      <!-- ── Pending Price Items ───────────────────────────────────────────── -->
      <div class="card dp-grid-full">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
          <h3 style="margin:0;">Pending Price Items <span style="font-size:12px;font-weight:400;color:#566174;">crowdsourced — not yet in scan list</span></h3>
          <div style="display:flex;gap:8px;">
            <button class="dp-btn success" id="dp-pending-add-all-btn" onclick="window.addAllPendingToScanList()">Add All to Scan List</button>
            <button class="dp-btn" id="dp-pending-refresh-btn" onclick="window.loadPendingPriceItems()">Refresh</button>
          </div>
        </div>
        <div id="dp-pending-wrap">
          <div style="color:#566174;font-size:13px;padding:20px 0;">Loading…</div>
        </div>
      </div>

      <!-- ── Flagged Prices ────────────────────────────────────────────────── -->
      <div class="card dp-grid-full">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
          <h3 style="margin:0;">Flagged Prices <span style="font-size:12px;font-weight:400;color:#566174;">3+ gray zone submissions</span></h3>
          <button class="dp-btn" id="dp-flagged-refresh-btn" onclick="window.loadFlaggedPrices()">Refresh</button>
        </div>
        <div id="dp-flagged-wrap">
          <div style="color:#566174;font-size:13px;padding:20px 0;">Loading…</div>
        </div>
      </div>

      <!-- ── Wiki Submissions ────────────────────────────────────────────── -->
      <div class="card dp-grid-full">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
          <h3 style="margin:0;">Wiki Submissions</h3>
          <button class="dp-btn" id="dp-wiki-refresh-btn" onclick="window.loadWikiSubmissions()">Refresh</button>
        </div>
        <div id="dp-wiki-wrap">
          <div style="color:#566174;font-size:13px;padding:20px 0;">Loading…</div>
        </div>
      </div>

      <!-- ── Recipe Submissions ────────────────────────────────────────── -->
      <div class="card dp-grid-full">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
          <h3 style="margin:0;">Recipe Submissions</h3>
          <button class="dp-btn" id="dp-recipe-refresh-btn" onclick="window.loadRecipeSubmissions()">Refresh</button>
        </div>
        <div id="dp-recipe-wrap">
          <div style="color:#566174;font-size:13px;padding:20px 0;">Loading…</div>
        </div>
      </div>

      <!-- ── Redemption Queue ────────────────────────────────────────────── -->
      <div class="card dp-grid-full">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
          <h3 style="margin:0;">ARC Redemption Queue</h3>
          <button class="dp-btn" id="dp-redeem-refresh-btn" onclick="window.loadRedemptionQueue()">Refresh</button>
        </div>
        <div id="dp-redeem-wrap">
          <div style="color:#566174;font-size:13px;padding:20px 0;">Loading…</div>
        </div>
      </div>

      <!-- ── Send Mail ───────────────────────────────────────────────────── -->
      <div class="card dp-grid-full">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
          <h3 style="margin:0;">Send Mail</h3>
        </div>

        <div style="display:flex;flex-direction:column;gap:12px;max-width:600px;">
          <div>
            <div class="dp-label">Recipient Discord Name</div>
            <input id="dp-mail-recipient" type="text" placeholder="Their Discord username..."
              oninput="window.dpLookupMailRecipient(this.value)"
              style="width:100%;box-sizing:border-box;padding:8px 12px;background:#0f1923;
              border:1px solid #2a3a52;color:#eef2f7;border-radius:8px;font-size:13px;">
            <div id="dp-mail-lookup" style="font-size:12px;margin-top:5px;min-height:16px;"></div>
          </div>
          <div>
            <div class="dp-label">Subject</div>
            <input id="dp-mail-subject" type="text" placeholder="e.g. Wiki submission feedback"
              style="width:100%;box-sizing:border-box;padding:8px 12px;background:#0f1923;
              border:1px solid #2a3a52;color:#eef2f7;border-radius:8px;font-size:13px;">
          </div>
          <div>
            <div class="dp-label">Message</div>
            <textarea id="dp-mail-body" placeholder="Write your message..."
              style="width:100%;box-sizing:border-box;padding:8px 12px;background:#0f1923;
              border:1px solid #2a3a52;color:#eef2f7;border-radius:8px;font-size:13px;
              min-height:100px;resize:vertical;font-family:inherit;"></textarea>
          </div>
          <div>
            <button id="dp-mail-send-btn" class="dp-btn success" onclick="window.adminSendMail()" disabled
              style="opacity:0.4;cursor:not-allowed;">
              Send Mail
            </button>
            <span id="dp-mail-status" style="font-size:12px;margin-left:12px;"></span>
          </div>
        </div>
      </div>

      <!-- ── localStorage Inspector ───────────────────────────────────────── -->
      <div class="card dp-grid-full">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
          <h3 style="margin:0;">localStorage Inspector</h3>
          <button class="dp-btn danger" onclick="window.devClearAllStorage()">Clear All</button>
        </div>
        ${lsKeys.length === 0
          ? '<p style="color:#566174;font-size:13px;">localStorage is empty.</p>'
          : lsKeys.map(key => `
              <div class="dp-ls-row">
                <span class="dp-ls-key">${escapeHtml(key)}</span>
                <span class="dp-ls-size">${lsSize(key)}</span>
                <span class="dp-ls-preview">${escapeHtml(lsPreview(key))}</span>
                <button class="dp-btn danger" style="padding:3px 10px;font-size:11px;white-space:nowrap;"
                  data-ls-key="${escapeHtml(key)}" class="dp-ls-clear-btn">Clear</button>
              </div>
            `).join('')
        }
      </div>

    </div>
  `;
}

// ─── ADMIN USER TABLE ─────────────────────────────────────────────────────────

function renderUserTable(users) {
  if (!users?.length) {
    return '<p style="color:#566174;font-size:13px;">No users found.</p>';
  }

  const sorted = [...users].sort((a, b) => (ROLE_LEVEL[b.role] ?? 0) - (ROLE_LEVEL[a.role] ?? 0));

  const rows = sorted.map(u => {
    const isSelf = u.id === getAuth().user?.id;
    const avatar = u.avatar_url
      ? `<img class="dp-user-avatar" src="${escapeHtml(u.avatar_url)}" onerror="this.style.display='none'">`
      : `<span style="display:inline-block;width:28px;height:28px;border-radius:50%;background:#2a3a52;margin-right:8px;vertical-align:middle;"></span>`;

    return `
      <tr data-user-id="${escapeHtml(u.id)}">
        <td>
          ${avatar}
          <span class="dp-user-name">${escapeHtml(u.discord_name || 'Unknown')}</span>
          ${isSelf ? '<span style="font-size:10px;color:#566174;margin-left:6px;">(you)</span>' : ''}
        </td>
        <td id="dp-role-cell-${escapeHtml(u.id)}">${rolePill(u.role)}</td>
        <td id="dp-pro-cell-${escapeHtml(u.id)}">${formatExpiry(u.pro_expires_at)}</td>
        <td>${formatLastSeen(u.last_seen_at)}</td>
        <td>
          <div style="display:flex;gap:6px;flex-wrap:wrap;">
            ${!isSelf ? `
              <div class="dp-days-row">
                <input class="dp-days-input" type="number" min="1" max="365" value="30"
                  id="dp-days-${escapeHtml(u.id)}" title="Days to grant">
                <button class="dp-btn success" style="padding:4px 10px;font-size:11px;"
                  data-action="grant-pro" data-uid="${escapeHtml(u.id)}">Grant Pro</button>
              </div>
              <button class="dp-btn" style="padding:4px 10px;font-size:11px;"
                data-action="open-role-picker" data-uid="${escapeHtml(u.id)}" data-name="${escapeHtml(u.discord_name || 'User')}" data-role="${escapeHtml(u.role)}">Role</button>
              <button class="dp-btn danger" style="padding:4px 10px;font-size:11px;"
                data-action="revoke-pro" data-uid="${escapeHtml(u.id)}">Revoke</button>
            ` : '<span style="color:#3d4f64;font-size:11px;">—</span>'}
          </div>
        </td>
      </tr>
    `;
  }).join('');

  return `
    <table class="dp-user-table">
      <thead>
        <tr>
          <th>Discord</th>
          <th>Role</th>
          <th>Pro Expires</th>
          <th>Last Seen</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <p class="dp-table-status" id="dp-table-status"></p>
  `;
}

// ─── INIT (called by app.js afterRender) ─────────────────────────────────────

export function initDevPanel() {
  window.loadAdminUsers();
  window.loadPendingPriceItems();
  window.loadFlaggedPrices();
  window.loadWikiSubmissions();
  window.loadRecipeSubmissions();
  window.loadRedemptionQueue();

  // Delegated handler for user table buttons (data-action)
  document.getElementById('dp-user-table-wrap')?.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;
    const uid    = btn.dataset.uid;
    if (action === 'grant-pro')        window.adminGrantPro(uid);
    if (action === 'revoke-pro')       window.adminRevokePro(uid);
    if (action === 'open-role-picker') window.adminOpenRolePicker(uid, btn.dataset.name, btn.dataset.role);
  });

  // Delegated handler for localStorage clear buttons (data-ls-key)
  document.querySelector('.dp-grid')?.addEventListener('click', (e) => {
    const btn = e.target.closest('.dp-ls-clear-btn');
    if (!btn) return;
    window.devClearKey(btn.dataset.lsKey);
  });

  // Delegated handler for flagged prices table buttons (data-action)
  document.getElementById('dp-flagged-wrap')?.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;
    if (action === 'accept-flagged') window.adminAcceptFlaggedPrice(btn.dataset.item, Number(btn.dataset.price));
    if (action === 'reject-flagged') window.adminRejectFlaggedPrice(btn.dataset.item);
  });

  // Delegated handler for pending items "Add to Scan List" buttons
  document.getElementById('dp-pending-wrap')?.addEventListener('click', (e) => {
    const btn = e.target.closest('.dp-pending-add-btn');
    if (!btn) return;
    window.addPendingItemToScanList(btn, btn.dataset.itemName);
  });

  // Delegated handler for wiki submission buttons (data-action)
  document.getElementById('dp-wiki-wrap')?.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;
    if (action === 'approve-wiki') window.adminApproveWiki(btn.dataset.id, btn.dataset.discord, btn.dataset.title);
    if (action === 'reject-wiki')  window.adminOpenRejectWiki(btn.dataset.id, btn.dataset.discord, btn.dataset.title);
  });

  // Delegated handler for recipe submission buttons (data-action)
  document.getElementById('dp-recipe-wrap')?.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;
    if (action === 'approve-recipe') window.adminOpenApproveRecipe(btn.dataset.id);
    if (action === 'reject-recipe')  window.adminOpenRejectRecipe(btn.dataset.id, btn.dataset.discord, btn.dataset.output);
  });

  // Delegated handler for redemption queue buttons (data-action)
  document.getElementById('dp-redeem-wrap')?.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;
    if (action === 'fulfill-redemption') window.adminOpenFulfillModal(btn.dataset.id, btn.dataset.uid, btn.dataset.discord, btn.dataset.reward);
    if (action === 'cancel-redemption')  window.adminCancelRedemption(btn.dataset.id);
  });
}

// ─── HANDLERS ─────────────────────────────────────────────────────────────────

window.loadAdminUsers = async function() {
  const wrap = document.getElementById('dp-user-table-wrap');
  const btn  = document.getElementById('dp-refresh-btn');
  if (!wrap) return;

  if (btn) { btn.disabled = true; btn.textContent = 'Loading…'; }
  wrap.innerHTML = '<div style="color:#566174;font-size:13px;padding:20px 0;">Loading users…</div>';

  if (!window.electronAPI?.adminGetUsers) {
    wrap.innerHTML = '<p style="color:#f87171;font-size:13px;">Admin API not available.</p>';
    if (btn) { btn.disabled = false; btn.textContent = 'Refresh'; }
    return;
  }

  const result = await window.electronAPI.adminGetUsers();
  if (btn) { btn.disabled = false; btn.textContent = 'Refresh'; }

  if (!result?.ok) {
    wrap.innerHTML = `<p style="color:#f87171;font-size:13px;">Error: ${result?.error || 'Unknown error'}</p>`;
    return;
  }

  wrap.innerHTML = renderUserTable(result.users);
};

window.adminGrantPro = async function(userId) {
  const input = document.getElementById(`dp-days-${userId}`);
  const days  = parseInt(input?.value || '30');
  if (!days || days < 1) return;

  const status = document.getElementById('dp-table-status');
  const result = await window.electronAPI?.adminGrantPro(userId, days);

  if (result?.ok) {
    if (status) { status.style.color = '#86efac'; status.textContent = `Granted ${days} days of Pro.`; }
    window.loadAdminUsers();
  } else {
    if (status) { status.style.color = '#f87171'; status.textContent = result?.error || 'Failed.'; }
  }
};

window.adminRevokePro = async function(userId) {
  if (!confirm('Revoke Pro and reset to free?')) return;
  const status = document.getElementById('dp-table-status');
  const result = await window.electronAPI?.adminRevokePro(userId);

  if (result?.ok) {
    if (status) { status.style.color = '#86efac'; status.textContent = 'Pro revoked.'; }
    window.loadAdminUsers();
  } else {
    if (status) { status.style.color = '#f87171'; status.textContent = result?.error || 'Failed.'; }
  }
};

window.adminOpenRolePicker = function(userId, name, currentRole) {
  // Remove any existing modal
  document.getElementById('dp-role-modal')?.remove();

  const modal = document.createElement('div');
  modal.id        = 'dp-role-modal';
  modal.className = 'dp-role-modal';
  modal.innerHTML = `
    <div class="dp-role-modal-box">
      <p class="dp-role-modal-title">Change role for ${escapeHtml(name)}</p>
      <div class="dp-role-modal-grid">
        ${ALL_ROLES_DISPLAY.map(r => {
          const color    = ROLE_COLORS[r];
          const isActive = r === currentRole;
          return `<button class="dp-role-btn"
            style="background:${isActive ? color + '33' : 'transparent'};
                   color:${color};border-color:${color}${isActive ? '' : '44'};"
            data-action="set-role" data-uid="${escapeHtml(String(userId))}" data-role="${escapeHtml(r)}">
            ${ROLE_LABELS[r]}
          </button>`;
        }).join('')}
      </div>
      <button class="dp-btn dp-role-modal-cancel" onclick="document.getElementById('dp-role-modal')?.remove()">
        Cancel
      </button>
    </div>
  `;
  // Close on backdrop click; handle role selection via delegation
  modal.addEventListener('click', (e) => {
    if (e.target === modal) { modal.remove(); return; }
    const btn = e.target.closest('[data-action="set-role"]');
    if (btn) window.adminSetRole(btn.dataset.uid, btn.dataset.role);
  });
  document.body.appendChild(modal);
};

window.adminSetRole = async function(userId, role) {
  document.getElementById('dp-role-modal')?.remove();
  const status = document.getElementById('dp-table-status');
  const result = await window.electronAPI?.adminSetRole(userId, role);

  if (result?.ok) {
    if (status) { status.style.color = '#86efac'; status.textContent = `Role updated to ${role}.`; }
    window.loadAdminUsers();
  } else {
    if (status) { status.style.color = '#f87171'; status.textContent = result?.error || 'Failed.'; }
  }
};

// ─── FLAGGED PRICES ───────────────────────────────────────────────────────────

function renderFlaggedPricesTable(items) {
  if (!items?.length) {
    return '<p style="color:#566174;font-size:13px;">No flagged prices. Market looks stable.</p>';
  }

  const rows = items.map(item => {
    const variance = item.current_price
      ? Math.round(Math.abs((item.avg_submission - item.current_price) / item.current_price * 100))
      : null;
    const varColor = variance > 30 ? '#f87171' : '#fcd34d';

    return `
      <tr>
        <td style="font-weight:600;">${escapeHtml(item.item_name)}</td>
        <td>${item.current_price != null ? formatGoldRaw(item.current_price) : '<span style="color:#566174;">None</span>'}</td>
        <td style="color:${varColor};">${item.avg_submission != null ? formatGoldRaw(item.avg_submission) : '—'}</td>
        <td>${variance != null ? `<span style="color:${varColor};">±${variance}%</span>` : '—'}</td>
        <td style="color:#94a3b8;">${escapeHtml(String(item.gray_count))}</td>
        <td>
          <div style="display:flex;gap:6px;">
            <button class="dp-btn success" style="padding:4px 10px;font-size:11px;"
              data-action="accept-flagged" data-item="${escapeHtml(item.item_name)}" data-price="${Number(item.avg_submission)}">
              Accept avg
            </button>
            <button class="dp-btn danger" style="padding:4px 10px;font-size:11px;"
              data-action="reject-flagged" data-item="${escapeHtml(item.item_name)}">
              Dismiss
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  return `
    <table class="dp-user-table">
      <thead>
        <tr>
          <th>Item</th>
          <th>Current Price</th>
          <th>Avg Submission</th>
          <th>Variance</th>
          <th>Reports</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <p class="dp-table-status" id="dp-flagged-status"></p>
  `;
}

// Simple gold formatter for raw copper values
function formatGoldRaw(copper) {
  if (!copper && copper !== 0) return '—';
  const g = Math.floor(copper / 10000);
  const s = Math.floor((copper % 10000) / 100);
  const c = Math.floor(copper % 100);
  const parts = [];
  if (g) parts.push(`${g}g`);
  if (s) parts.push(`${s}s`);
  if (c || !parts.length) parts.push(`${c}c`);
  return parts.join(' ');
}

// ─── PENDING PRICE ITEMS ──────────────────────────────────────────────────────

window.loadPendingPriceItems = async function() {
  const wrap = document.getElementById('dp-pending-wrap');
  const btn  = document.getElementById('dp-pending-refresh-btn');
  if (!wrap) return;

  if (btn) { btn.disabled = true; btn.textContent = 'Loading…'; }
  wrap.innerHTML = '<div style="color:#566174;font-size:13px;padding:20px 0;">Loading…</div>';

  const result = await window.electronAPI?.getPendingPriceItems?.();
  if (btn) { btn.disabled = false; btn.textContent = 'Refresh'; }

  if (!result?.ok) {
    wrap.innerHTML = `<p style="color:#f87171;font-size:13px;">Error: ${result?.error || 'Unknown error'}</p>`;
    return;
  }

  wrap.innerHTML = renderPendingPriceItems(result.items || []);
};

window.addAllPendingToScanList = async function() {
  const wrap = document.getElementById('dp-pending-wrap');
  const btn  = document.getElementById('dp-pending-add-all-btn');
  const rows = wrap?.querySelectorAll('[data-pending-item]');
  if (!rows?.length) return;

  if (btn) { btn.disabled = true; btn.textContent = 'Adding…'; }
  let added = 0;
  for (const row of rows) {
    const name = row.dataset.pendingItem;
    if (name) {
      const r = await window.electronAPI?.addToScanList?.(name);
      if (r?.ok) added++;
    }
  }
  if (btn) { btn.disabled = false; btn.textContent = 'Add All to Scan List'; }
  const status = document.createElement('p');
  status.style.cssText = 'color:#86efac;font-size:13px;margin:8px 0 0;';
  status.textContent = `Added ${added} items to scan_items.csv`;
  wrap.appendChild(status);
  setTimeout(() => status.remove(), 3000);
};

window.addPendingItemToScanList = async function(btn, itemName) {
  btn.disabled = true;
  btn.textContent = 'Adding…';
  const result = await window.electronAPI?.addToScanList?.(itemName);
  if (result?.ok) {
    btn.textContent = 'Added ✓';
    btn.className = btn.className.replace('success', '') + ' success';
    btn.style.opacity = '0.6';
  } else {
    btn.textContent = result?.reason === 'exists' ? 'Already in list' : 'Failed';
    btn.disabled = false;
  }
};

function renderPendingPriceItems(items) {
  if (!items.length) {
    return '<p style="color:#566174;font-size:13px;">No pending items. All community items have prices.</p>';
  }

  const rows = items.map(item => `
    <tr data-pending-item="${escapeHtml(item.item_name)}" style="border-bottom:1px solid #1e2a3a;">
      <td style="padding:10px 12px;color:#eef2f7;">${escapeHtml(item.item_name)}</td>
      <td style="padding:10px 12px;color:#94a3b8;font-size:13px;">${escapeHtml(String(item.submission_count || 0))} users</td>
      <td style="padding:10px 12px;color:#566174;font-size:12px;">${item.last_updated ? new Date(item.last_updated).toLocaleDateString() : '—'}</td>
      <td style="padding:10px 12px;">
        <button class="dp-btn success dp-pending-add-btn" style="padding:4px 12px;font-size:12px;"
          data-item-name="${escapeHtml(item.item_name)}">
          Add to Scan List
        </button>
      </td>
    </tr>
  `).join('');

  return `
    <table class="dp-table" style="width:100%;border-collapse:collapse;">
      <thead>
        <tr style="border-bottom:1px solid #2a3a52;text-align:left;">
          <th style="padding:8px 12px;color:#566174;font-size:12px;font-weight:600;">Item Name</th>
          <th style="padding:8px 12px;color:#566174;font-size:12px;font-weight:600;">Seen By</th>
          <th style="padding:8px 12px;color:#566174;font-size:12px;font-weight:600;">First Seen</th>
          <th style="padding:8px 12px;color:#566174;font-size:12px;font-weight:600;">Action</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <p style="color:#566174;font-size:12px;margin:12px 0 0;">${items.length} item${items.length !== 1 ? 's' : ''} waiting for a price scan</p>
  `;
}

window.loadFlaggedPrices = async function() {
  const wrap = document.getElementById('dp-flagged-wrap');
  const btn  = document.getElementById('dp-flagged-refresh-btn');
  if (!wrap) return;

  if (btn) { btn.disabled = true; btn.textContent = 'Loading…'; }
  wrap.innerHTML = '<div style="color:#566174;font-size:13px;padding:20px 0;">Loading…</div>';

  if (!window.electronAPI?.adminGetFlaggedPrices) {
    wrap.innerHTML = '<p style="color:#f87171;font-size:13px;">API not available.</p>';
    if (btn) { btn.disabled = false; btn.textContent = 'Refresh'; }
    return;
  }

  const result = await window.electronAPI.adminGetFlaggedPrices();
  if (btn) { btn.disabled = false; btn.textContent = 'Refresh'; }

  if (!result?.ok) {
    wrap.innerHTML = `<p style="color:#f87171;font-size:13px;">Error: ${result?.error || 'Unknown'}</p>`;
    return;
  }

  wrap.innerHTML = renderFlaggedPricesTable(result.items);
};

window.adminAcceptFlaggedPrice = async function(itemName, price) {
  const status = document.getElementById('dp-flagged-status');
  const result = await window.electronAPI?.adminAcceptPrice(itemName, price);
  if (result?.ok) {
    if (status) { status.style.color = '#86efac'; status.textContent = `Accepted new price for ${itemName}.`; }
    window.loadFlaggedPrices();
  } else {
    if (status) { status.style.color = '#f87171'; status.textContent = result?.error || 'Failed.'; }
  }
};

window.adminRejectFlaggedPrice = async function(itemName) {
  const status = document.getElementById('dp-flagged-status');
  const result = await window.electronAPI?.adminRejectPrice(itemName);
  if (result?.ok) {
    if (status) { status.style.color = '#86efac'; status.textContent = `Dismissed submissions for ${itemName}.`; }
    window.loadFlaggedPrices();
  } else {
    if (status) { status.style.color = '#f87171'; status.textContent = result?.error || 'Failed.'; }
  }
};

// ─── WIKI SUBMISSIONS ─────────────────────────────────────────────────────────

const STATUS_COLOR = { pending: '#fcd34d', approved: '#86efac', rejected: '#f87171' };

function renderWikiSubmissions(items) {
  if (!items?.length) return '<p style="color:#566174;font-size:13px;">No submissions yet.</p>';

  return items.map(s => {
    const date  = s.created_at ? new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';
    const color = STATUS_COLOR[s.status] || '#566174';
    const preview = s.content?.slice(0, 200) + (s.content?.length > 200 ? '…' : '');

    return `
      <div style="background:#0f1923;border:1px solid #1e2d3d;border-radius:10px;padding:16px;margin-bottom:10px;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:8px;margin-bottom:10px;">
          <div>
            <div style="font-weight:700;color:#eef2f7;font-size:14px;">${escapeHtml(s.title || '')}</div>
            <div style="font-size:12px;color:#566174;margin-top:2px;">
              ${escapeHtml(s.category || '')} · ${escapeHtml(s.ign || s.discord_name || 'Unknown')} · ${date}
            </div>
          </div>
          <span style="font-size:12px;padding:2px 10px;border-radius:20px;
            background:${color}22;color:${color};border:1px solid ${color}44;white-space:nowrap;">
            ${escapeHtml(s.status || '')}
          </span>
        </div>
        <div style="font-size:12px;color:#566174;font-family:monospace;
          background:#0a1018;border-radius:6px;padding:10px;margin-bottom:12px;
          white-space:pre-wrap;line-height:1.5;">${s.content ? escapeHtml(s.content.slice(0,300) + (s.content.length > 300 ? '…' : '')) : ''}</div>
        ${s.status === 'pending' ? `
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <button class="dp-btn success" style="padding:5px 14px;font-size:12px;"
              data-action="approve-wiki" data-id="${escapeHtml(String(s.id))}" data-discord="${escapeHtml(s.discord_name || '')}" data-title="${escapeHtml(s.title || '')}">
              ✓ Approve (+25 pts)
            </button>
            <button class="dp-btn danger" style="padding:5px 14px;font-size:12px;"
              data-action="reject-wiki" data-id="${escapeHtml(String(s.id))}" data-discord="${escapeHtml(s.discord_name || '')}" data-title="${escapeHtml(s.title || '')}">
              ✗ Reject
            </button>
          </div>
        ` : ''}
      </div>
    `;
  }).join('');
}

window.loadWikiSubmissions = async function() {
  const wrap = document.getElementById('dp-wiki-wrap');
  const btn  = document.getElementById('dp-wiki-refresh-btn');
  if (!wrap) return;

  if (btn) { btn.disabled = true; btn.textContent = 'Loading…'; }
  wrap.innerHTML = '<div style="color:#566174;font-size:13px;padding:20px 0;">Loading…</div>';

  const result = await window.electronAPI?.wikiAdminGetSubmissions();
  if (btn) { btn.disabled = false; btn.textContent = 'Refresh'; }

  if (!result?.ok) {
    wrap.innerHTML = `<p style="color:#f87171;font-size:13px;">Error: ${result?.error || 'Unknown'}</p>`;
    return;
  }
  wrap.innerHTML = renderWikiSubmissions(result.submissions);
};

window.adminApproveWiki = async function(id, discordName, title) {
  const result = await window.electronAPI?.wikiAdminApprove(id);
  if (result?.ok) {
    // Send congrats mail to submitter
    const userLookup = await window.electronAPI?.arcLookupUser(discordName);
    if (userLookup?.ok && userLookup.user) {
      await window.electronAPI?.arcSendMail({
        recipientId: userLookup.user.id,
        subject: `Your guide "${title}" was approved!`,
        body: `Great news — your community guide "${title}" has been approved and is now live on the wiki.\n\n+25 ARC Points have been added to your account. Thanks for contributing!`,
        referenceId: id,
      });
    }
    window.loadWikiSubmissions();
  } else {
    alert('Failed: ' + (result?.error || 'Unknown error'));
  }
};

window.adminOpenRejectWiki = function(id, discordName, title) {
  document.getElementById('dp-wiki-reject-modal')?.remove();
  const modal = document.createElement('div');
  modal.id = 'dp-wiki-reject-modal';
  modal.className = 'dp-role-modal';
  modal.innerHTML = `
    <div class="dp-role-modal-box" style="min-width:380px;">
      <p class="dp-role-modal-title">Reject: ${escapeHtml(title)}</p>
      <div style="margin-bottom:14px;">
        <div class="dp-label">Feedback for submitter</div>
        <textarea id="dp-reject-feedback" placeholder="Tell them why it was rejected or what to improve..."
          style="width:100%;box-sizing:border-box;padding:8px 12px;background:#0f1923;
          border:1px solid #2a3a52;color:#eef2f7;border-radius:8px;font-size:13px;
          min-height:80px;resize:vertical;font-family:inherit;"></textarea>
      </div>
      <div style="display:flex;gap:8px;">
        <button class="dp-btn danger" style="flex:1;"
          data-action="confirm-reject-wiki" data-id="${escapeHtml(String(id))}" data-discord="${escapeHtml(discordName)}" data-title="${escapeHtml(title)}">
          Reject & Notify
        </button>
        <button class="dp-btn" style="flex:1;"
          onclick="document.getElementById('dp-wiki-reject-modal')?.remove()">Cancel</button>
      </div>
    </div>
  `;
  modal.addEventListener('click', e => {
    if (e.target === modal) { modal.remove(); return; }
    const btn = e.target.closest('[data-action="confirm-reject-wiki"]');
    if (btn) window.adminRejectWiki(btn.dataset.id, btn.dataset.discord, btn.dataset.title);
  });
  document.body.appendChild(modal);
};

window.adminRejectWiki = async function(id, discordName, title) {
  const feedback = document.getElementById('dp-reject-feedback')?.value?.trim() || '';
  document.getElementById('dp-wiki-reject-modal')?.remove();

  const result = await window.electronAPI?.wikiAdminReject({ id, feedback });
  if (result?.ok) {
    // Send rejection mail with feedback
    const userLookup = await window.electronAPI?.arcLookupUser(discordName);
    if (userLookup?.ok && userLookup.user) {
      await window.electronAPI?.arcSendMail({
        recipientId: userLookup.user.id,
        subject: `Feedback on your guide submission: "${title}"`,
        body: feedback
          ? `Your guide "${title}" wasn't approved this time.\n\nFeedback: ${feedback}\n\nFeel free to revise and resubmit!`
          : `Your guide "${title}" wasn't approved at this time. Feel free to revise and resubmit!`,
        referenceId: id,
      });
    }
    window.loadWikiSubmissions();
  } else {
    alert('Failed: ' + (result?.error || 'Unknown error'));
  }
};

// ─── RECIPE SUBMISSIONS ───────────────────────────────────────────────────────

const RECIPE_PROFESSIONS = [
  'Alchemy', 'Carpentry', 'Commerce', 'Construction', 'Cooking',
  'Handicrafts', 'Leatherwork', 'Machining', 'Masonry', 'Metalwork',
  'Tailoring', 'Weaponry',
];

// Map of submission id → full object, populated when rendering. Avoids passing
// complex data through inline onclick attributes.
const _recipeSubmissionCache = {};

function renderRecipeSubmissions(items) {
  if (!items?.length) return '<p style="color:#566174;font-size:13px;">No recipe submissions yet.</p>';

  // Cache all items for retrieval by id
  for (const s of items) _recipeSubmissionCache[s.id] = s;

  return items.map(s => {
    const date  = s.created_at ? new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';
    const color = STATUS_COLOR[s.status] || '#566174';
    const mats  = Array.isArray(s.materials) ? s.materials : [];

    return `
      <div style="background:#0f1923;border:1px solid #1e2d3d;border-radius:10px;padding:16px;margin-bottom:10px;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:8px;margin-bottom:12px;">
          <div>
            <div style="font-weight:700;color:#eef2f7;font-size:14px;">
              ${s.output_qty > 1 ? `${escapeHtml(String(s.output_qty))}× ` : ''}${escapeHtml(s.output || '')}
            </div>
            <div style="font-size:12px;color:#566174;margin-top:2px;">
              ${escapeHtml(s.profession || '—')} · ${escapeHtml(String(s.labor || 0))} labor · ${escapeHtml(s.ign || s.discord_name || 'Unknown')} · ${date}
            </div>
          </div>
          <span style="font-size:12px;padding:2px 10px;border-radius:20px;
            background:${color}22;color:${color};border:1px solid ${color}44;white-space:nowrap;">
            ${escapeHtml(s.status || '')}
          </span>
        </div>

        <!-- Materials preview -->
        <div style="margin-bottom:12px;">
          ${mats.length
            ? mats.map(m => `<span style="display:inline-block;margin:2px 4px 2px 0;padding:3px 8px;
                background:#1a2535;border:1px solid #2a3a52;border-radius:6px;font-size:12px;color:#cbd5e1;">
                ${escapeHtml(String(m.qty))}× ${escapeHtml(m.item || '')}
              </span>`).join('')
            : '<span style="color:#566174;font-size:12px;">No materials listed</span>'
          }
        </div>

        ${s.notes ? `<div style="font-size:12px;color:#8d99ab;margin-bottom:12px;">Note: ${escapeHtml(s.notes)}</div>` : ''}

        ${s.status === 'pending' ? `
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <button class="dp-btn success" style="padding:5px 14px;font-size:12px;"
              data-action="approve-recipe" data-id="${escapeHtml(String(s.id))}">
              ✓ Approve & Edit (+5 pts)
            </button>
            <button class="dp-btn danger" style="padding:5px 14px;font-size:12px;"
              data-action="reject-recipe" data-id="${escapeHtml(String(s.id))}" data-discord="${escapeHtml(s.discord_name || '')}" data-output="${escapeHtml(s.output || '')}">
              ✗ Reject
            </button>
          </div>
        ` : ''}
      </div>
    `;
  }).join('');
}

window.loadRecipeSubmissions = async function() {
  const wrap = document.getElementById('dp-recipe-wrap');
  const btn  = document.getElementById('dp-recipe-refresh-btn');
  if (!wrap) return;

  if (btn) { btn.disabled = true; btn.textContent = 'Loading…'; }
  wrap.innerHTML = '<div style="color:#566174;font-size:13px;padding:20px 0;">Loading…</div>';

  const result = await window.electronAPI?.recipeAdminGet();
  if (btn) { btn.disabled = false; btn.textContent = 'Refresh'; }

  if (!result?.ok) {
    wrap.innerHTML = `<p style="color:#f87171;font-size:13px;">Error: ${result?.error || 'Unknown'}</p>`;
    return;
  }
  wrap.innerHTML = renderRecipeSubmissions(result.submissions);
};

window.adminOpenApproveRecipe = function(id) {
  const s = _recipeSubmissionCache[id];
  if (!s) return;
  document.getElementById('dp-recipe-approve-modal')?.remove();
  const mats = Array.isArray(s.materials) ? s.materials : [];

  const matsHtml = mats.map((m, i) => `
    <div style="display:grid;grid-template-columns:1fr 70px 28px;gap:6px;align-items:center;margin-bottom:6px;" id="rma-row-${i}">
      <input type="text" value="${escapeHtml(m.item||'')}"
        onchange="window._rmaUpdateMat(${i},'item',this.value)"
        style="padding:6px 10px;background:#0a1018;border:1px solid #2a3a52;color:#eef2f7;border-radius:6px;font-size:13px;">
      <input type="number" min="1" value="${escapeHtml(String(m.qty||1))}"
        onchange="window._rmaUpdateMat(${i},'qty',this.value)"
        style="padding:6px 8px;background:#0a1018;border:1px solid #2a3a52;color:#eef2f7;border-radius:6px;font-size:13px;text-align:center;">
      <button onclick="window._rmaRemoveMat(${i})" title="Remove"
        style="width:28px;height:28px;border-radius:6px;background:#2a1a1a;border:1px solid #5a2a2a;
        color:#f87171;font-size:16px;cursor:pointer;line-height:1;">×</button>
    </div>
  `).join('');

  const profOptions = RECIPE_PROFESSIONS.map(p =>
    `<option value="${p}" ${p === s.profession ? 'selected' : ''}>${p}</option>`
  ).join('');

  const modal = document.createElement('div');
  modal.id = 'dp-recipe-approve-modal';
  modal.className = 'dp-role-modal';
  modal.innerHTML = `
    <div class="dp-role-modal-box" style="min-width:460px;max-width:520px;max-height:85vh;overflow-y:auto;">
      <p class="dp-role-modal-title">Approve Recipe: ${escapeHtml(s.output || '')}</p>
      <p style="font-size:12px;color:#566174;margin:-8px 0 16px;">
        Edit anything before approving. The corrected version goes live.
      </p>

      <div style="display:flex;gap:10px;margin-bottom:12px;">
        <div style="flex:1;">
          <div class="dp-label">Output Item</div>
          <input id="rma-output" type="text" value="${escapeHtml(s.output||'')}"
            style="width:100%;box-sizing:border-box;padding:7px 10px;background:#0a1018;
            border:1px solid #2a3a52;color:#eef2f7;border-radius:6px;font-size:13px;">
        </div>
        <div style="width:80px;">
          <div class="dp-label">Qty</div>
          <input id="rma-output-qty" type="number" min="1" value="${s.output_qty||1}"
            style="width:100%;box-sizing:border-box;padding:7px 8px;background:#0a1018;
            border:1px solid #2a3a52;color:#eef2f7;border-radius:6px;font-size:13px;text-align:center;">
        </div>
      </div>
      <div style="display:flex;gap:10px;margin-bottom:12px;">
        <div style="flex:1;">
          <div class="dp-label">Profession</div>
          <select id="rma-profession"
            style="width:100%;box-sizing:border-box;padding:7px 10px;background:#0a1018;
            border:1px solid #2a3a52;color:#eef2f7;border-radius:6px;font-size:13px;">
            ${profOptions}
          </select>
        </div>
        <div style="width:100px;">
          <div class="dp-label">Base Labor</div>
          <input id="rma-labor" type="number" min="0" value="${s.labor||0}"
            style="width:100%;box-sizing:border-box;padding:7px 8px;background:#0a1018;
            border:1px solid #2a3a52;color:#eef2f7;border-radius:6px;font-size:13px;text-align:center;">
        </div>
      </div>

      <div class="dp-label">Materials</div>
      <div id="rma-mats-list" style="margin-bottom:8px;">${matsHtml}</div>
      <button onclick="window._rmaAddMat()"
        style="padding:5px 14px;background:#1a2535;border:1px dashed #2a3a52;
        color:#93c5fd;border-radius:6px;font-size:12px;cursor:pointer;margin-bottom:14px;">
        + Add Material
      </button>

      <div style="margin-bottom:14px;">
        <div class="dp-label">Notes</div>
        <input id="rma-notes" type="text" value="${escapeHtml(s.notes||'')}"
          placeholder="Optional"
          style="width:100%;box-sizing:border-box;padding:7px 10px;background:#0a1018;
          border:1px solid #2a3a52;color:#eef2f7;border-radius:6px;font-size:13px;">
      </div>

      <div style="display:flex;gap:8px;">
        <button class="dp-btn success" style="flex:1;"
          data-action="confirm-approve-recipe" data-id="${escapeHtml(String(s.id))}" data-discord="${escapeHtml(s.discord_name||'')}" data-output="${escapeHtml(s.output||'')}">
          ✓ Approve (+5 pts)
        </button>
        <button class="dp-btn" style="flex:1;"
          onclick="document.getElementById('dp-recipe-approve-modal')?.remove()">Cancel</button>
      </div>
    </div>
  `;
  modal.addEventListener('click', e => {
    if (e.target === modal) { modal.remove(); return; }
    const btn = e.target.closest('[data-action="confirm-approve-recipe"]');
    if (btn) window.adminApproveRecipe(btn.dataset.id, btn.dataset.discord, btn.dataset.output);
  });
  document.body.appendChild(modal);

  // Store working copy of materials for this modal
  window._rmaMats = mats.map(m => ({ ...m }));
};

// Material row helpers for the approve modal
window._rmaAddMat = function() {
  if (!window._rmaMats) return;
  window._rmaMats.push({ item: '', qty: 1 });
  // Re-render all rows
  const list = document.getElementById('rma-mats-list');
  if (!list) return;
  list.innerHTML = window._rmaMats.map((m, i) => `
    <div style="display:grid;grid-template-columns:1fr 70px 28px;gap:6px;align-items:center;margin-bottom:6px;">
      <input type="text" value="${escapeHtml(m.item||'')}"
        onchange="window._rmaUpdateMat(${i},'item',this.value)"
        style="padding:6px 10px;background:#0a1018;border:1px solid #2a3a52;color:#eef2f7;border-radius:6px;font-size:13px;">
      <input type="number" min="1" value="${escapeHtml(String(m.qty||1))}"
        onchange="window._rmaUpdateMat(${i},'qty',this.value)"
        style="padding:6px 8px;background:#0a1018;border:1px solid #2a3a52;color:#eef2f7;border-radius:6px;font-size:13px;text-align:center;">
      <button onclick="window._rmaRemoveMat(${i})" title="Remove"
        style="width:28px;height:28px;border-radius:6px;background:#2a1a1a;border:1px solid #5a2a2a;
        color:#f87171;font-size:16px;cursor:pointer;line-height:1;">×</button>
    </div>
  `).join('');
};

window._rmaUpdateMat = function(idx, field, value) {
  if (!window._rmaMats?.[idx]) return;
  window._rmaMats[idx][field] = field === 'qty' ? Math.max(1, parseInt(value) || 1) : value;
};

window._rmaRemoveMat = function(idx) {
  if (!window._rmaMats || window._rmaMats.length <= 1) return;
  window._rmaMats.splice(idx, 1);
  const list = document.getElementById('rma-mats-list');
  if (!list) return;
  list.innerHTML = window._rmaMats.map((m, i) => `
    <div style="display:grid;grid-template-columns:1fr 70px 28px;gap:6px;align-items:center;margin-bottom:6px;">
      <input type="text" value="${escapeHtml(m.item||'')}"
        onchange="window._rmaUpdateMat(${i},'item',this.value)"
        style="padding:6px 10px;background:#0a1018;border:1px solid #2a3a52;color:#eef2f7;border-radius:6px;font-size:13px;">
      <input type="number" min="1" value="${m.qty||1}"
        onchange="window._rmaUpdateMat(${i},'qty',this.value)"
        style="padding:6px 8px;background:#0a1018;border:1px solid #2a3a52;color:#eef2f7;border-radius:6px;font-size:13px;text-align:center;">
      <button onclick="window._rmaRemoveMat(${i})" title="Remove"
        style="width:28px;height:28px;border-radius:6px;background:#2a1a1a;border:1px solid #5a2a2a;
        color:#f87171;font-size:16px;cursor:pointer;line-height:1;">×</button>
    </div>
  `).join('');
};

window.adminApproveRecipe = async function(id, discordName, originalOutput) {
  // Read edited values from the modal
  const output     = document.getElementById('rma-output')?.value?.trim() || originalOutput;
  const outputQty  = parseInt(document.getElementById('rma-output-qty')?.value || '1');
  const profession = document.getElementById('rma-profession')?.value || null;
  const labor      = parseInt(document.getElementById('rma-labor')?.value || '0');
  const notes      = document.getElementById('rma-notes')?.value?.trim() || null;
  const materials  = (window._rmaMats || []).filter(m => m.item.trim()).map(m => ({
    item: m.item.trim(),
    qty:  Math.max(1, parseInt(m.qty) || 1),
  }));

  document.getElementById('dp-recipe-approve-modal')?.remove();

  const result = await window.electronAPI?.recipeAdminApprove({ id, output, outputQty, profession, labor, materials, notes });
  if (result?.ok) {
    // Send congrats mail
    const userLookup = await window.electronAPI?.arcLookupUser(discordName);
    if (userLookup?.ok && userLookup.user) {
      await window.electronAPI?.arcSendMail({
        recipientId: userLookup.user.id,
        subject:     `Your recipe "${output}" was approved!`,
        body:        `Your submitted recipe for "${output}" has been approved and is now live in the Recipe Lookup page.\n\n+5 ARC Points have been added to your account. Thanks for contributing!`,
        referenceId: id,
      });
    }
    window.loadRecipeSubmissions();
  } else {
    alert('Failed: ' + (result?.error || 'Unknown error'));
  }
};

window.adminOpenRejectRecipe = function(id, discordName, output) {
  document.getElementById('dp-recipe-reject-modal')?.remove();
  const modal = document.createElement('div');
  modal.id = 'dp-recipe-reject-modal';
  modal.className = 'dp-role-modal';
  modal.innerHTML = `
    <div class="dp-role-modal-box" style="min-width:380px;">
      <p class="dp-role-modal-title">Reject: ${escapeHtml(output)}</p>
      <div style="margin-bottom:14px;">
        <div class="dp-label">Feedback (optional)</div>
        <textarea id="dp-recipe-reject-feedback" placeholder="Tell them what was wrong or how to improve..."
          style="width:100%;box-sizing:border-box;padding:8px 12px;background:#0f1923;
          border:1px solid #2a3a52;color:#eef2f7;border-radius:8px;font-size:13px;
          min-height:80px;resize:vertical;font-family:inherit;"></textarea>
      </div>
      <div style="display:flex;gap:8px;">
        <button class="dp-btn danger" style="flex:1;"
          data-action="confirm-reject-recipe" data-id="${escapeHtml(String(id))}" data-discord="${escapeHtml(discordName)}" data-output="${escapeHtml(output)}">
          Reject & Notify
        </button>
        <button class="dp-btn" style="flex:1;"
          onclick="document.getElementById('dp-recipe-reject-modal')?.remove()">Cancel</button>
      </div>
    </div>
  `;
  modal.addEventListener('click', e => {
    if (e.target === modal) { modal.remove(); return; }
    const btn = e.target.closest('[data-action="confirm-reject-recipe"]');
    if (btn) window.adminRejectRecipe(btn.dataset.id, btn.dataset.discord, btn.dataset.output);
  });
  document.body.appendChild(modal);
};

window.adminRejectRecipe = async function(id, discordName, output) {
  const feedback = document.getElementById('dp-recipe-reject-feedback')?.value?.trim() || '';
  document.getElementById('dp-recipe-reject-modal')?.remove();

  const result = await window.electronAPI?.recipeAdminReject({ id, feedback });
  if (result?.ok) {
    const userLookup = await window.electronAPI?.arcLookupUser(discordName);
    if (userLookup?.ok && userLookup.user) {
      await window.electronAPI?.arcSendMail({
        recipientId: userLookup.user.id,
        subject:     `Feedback on your recipe submission: "${output}"`,
        body:        feedback
          ? `Your recipe submission for "${output}" wasn't approved this time.\n\nFeedback: ${feedback}\n\nFeel free to revise and resubmit!`
          : `Your recipe submission for "${output}" wasn't approved at this time. Feel free to revise and resubmit!`,
        referenceId: id,
      });
    }
    window.loadRecipeSubmissions();
  } else {
    alert('Failed: ' + (result?.error || 'Unknown error'));
  }
};

// ─── REDEMPTION QUEUE ─────────────────────────────────────────────────────────

function renderRedemptionQueue(items) {
  if (!items?.length) {
    return '<p style="color:#566174;font-size:13px;">No redemptions yet.</p>';
  }

  const statusColor = { pending: '#fcd34d', fulfilled: '#86efac', cancelled: '#f87171' };

  const rows = items.map(r => {
    const date = r.created_at
      ? new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
      : '—';
    const color = statusColor[r.status] || '#566174';
    const isGold = r.reward_id?.startsWith('gold_');

    return `
      <tr>
        <td>
          <div style="font-weight:600;color:#eef2f7;">${escapeHtml(r.discord_name || '—')}</div>
          ${r.ign_snapshot ? `<div style="font-size:11px;color:#566174;">IGN: ${escapeHtml(r.ign_snapshot)}</div>` : ''}
        </td>
        <td style="color:#cbd5e1;">${escapeHtml(r.reward_label || '')}</td>
        <td style="color:#ffd166;">${escapeHtml(String(r.points_spent?.toLocaleString() ?? ''))} pts</td>
        <td style="color:#566174;font-size:12px;">${date}</td>
        <td>
          <span style="font-size:12px;padding:2px 10px;border-radius:20px;
            background:${color}22;color:${color};border:1px solid ${color}44;">
            ${escapeHtml(r.status || '')}
          </span>
        </td>
        <td>
          ${r.status === 'pending' ? `
            <div style="display:flex;gap:6px;">
              <button class="dp-btn success" style="padding:4px 10px;font-size:11px;"
                data-action="fulfill-redemption" data-id="${escapeHtml(String(r.id))}" data-uid="${escapeHtml(r.user_id || '')}" data-discord="${escapeHtml(r.discord_name || '')}" data-reward="${escapeHtml(r.reward_label || '')}">
                Fulfill
              </button>
              <button class="dp-btn danger" style="padding:4px 10px;font-size:11px;"
                data-action="cancel-redemption" data-id="${escapeHtml(String(r.id))}">
                Cancel
              </button>
            </div>
          ` : '<span style="color:#3d4f64;font-size:11px;">—</span>'}
        </td>
      </tr>
    `;
  }).join('');

  return `
    <table class="dp-user-table">
      <thead>
        <tr>
          <th>User</th>
          <th>Reward</th>
          <th>Points</th>
          <th>Requested</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <p class="dp-table-status" id="dp-redeem-status"></p>
  `;
}

window.loadRedemptionQueue = async function() {
  const wrap = document.getElementById('dp-redeem-wrap');
  const btn  = document.getElementById('dp-redeem-refresh-btn');
  if (!wrap) return;

  if (btn) { btn.disabled = true; btn.textContent = 'Loading…'; }
  wrap.innerHTML = '<div style="color:#566174;font-size:13px;padding:20px 0;">Loading…</div>';

  const result = await window.electronAPI?.arcGetAllRedemptions();
  if (btn) { btn.disabled = false; btn.textContent = 'Refresh'; }

  if (!result?.ok) {
    wrap.innerHTML = `<p style="color:#f87171;font-size:13px;">Error: ${result?.error || 'Unknown'}</p>`;
    return;
  }
  wrap.innerHTML = renderRedemptionQueue(result.redemptions);
};

window.adminOpenFulfillModal = function(id, userId, discordName, rewardLabel) {
  document.getElementById('dp-fulfill-modal')?.remove();
  const modal = document.createElement('div');
  modal.id = 'dp-fulfill-modal';
  modal.className = 'dp-role-modal';
  modal.innerHTML = `
    <div class="dp-role-modal-box" style="min-width:360px;">
      <p class="dp-role-modal-title">Fulfill: ${escapeHtml(rewardLabel)}</p>
      <p style="font-size:13px;color:#8d99ab;margin:0 0 14px;">For: <strong style="color:#eef2f7;">${escapeHtml(discordName)}</strong></p>
      <div style="margin-bottom:14px;">
        <div class="dp-label">Notes (optional — sent to user)</div>
        <textarea id="dp-fulfill-notes" placeholder="e.g. Gold sent in-game!"
          style="width:100%;box-sizing:border-box;padding:8px 12px;background:#0f1923;
          border:1px solid #2a3a52;color:#eef2f7;border-radius:8px;font-size:13px;
          min-height:70px;resize:vertical;font-family:inherit;"></textarea>
      </div>
      <div style="display:flex;gap:8px;">
        <button class="dp-btn success" style="flex:1;"
          data-action="confirm-fulfill" data-id="${escapeHtml(String(id))}" data-uid="${escapeHtml(userId)}" data-discord="${escapeHtml(discordName)}" data-reward="${escapeHtml(rewardLabel)}">
          Mark Fulfilled
        </button>
        <button class="dp-btn dp-role-modal-cancel" style="flex:1;margin:0;"
          onclick="document.getElementById('dp-fulfill-modal')?.remove()">Cancel</button>
      </div>
    </div>
  `;
  modal.addEventListener('click', e => {
    if (e.target === modal) { modal.remove(); return; }
    const btn = e.target.closest('[data-action="confirm-fulfill"]');
    if (btn) window.adminFulfillRedemption(btn.dataset.id, btn.dataset.uid, btn.dataset.discord, btn.dataset.reward);
  });
  document.body.appendChild(modal);
};

window.adminFulfillRedemption = async function(id, userId, discordName, rewardLabel) {
  const notes = document.getElementById('dp-fulfill-notes')?.value?.trim() || '';
  document.getElementById('dp-fulfill-modal')?.remove();

  const result = await window.electronAPI?.arcFulfillRedemption({ id, notes });
  const status = document.getElementById('dp-redeem-status');

  if (result?.ok) {
    if (status) { status.style.color = '#86efac'; status.textContent = `Fulfilled for ${discordName}.`; }
    // Send mail to user using their actual user_id
    if (userId) {
      await window.electronAPI?.arcSendMail({
        recipientId: userId,
        subject:     `Your ${rewardLabel} has been fulfilled!`,
        body:        notes || `Your reward "${rewardLabel}" has been fulfilled. Enjoy!`,
        referenceId: id,
      });
    }
    window.loadRedemptionQueue();
  } else {
    if (status) { status.style.color = '#f87171'; status.textContent = result?.error || 'Failed.'; }
  }
};

window.adminCancelRedemption = async function(id) {
  if (!confirm('Cancel this redemption? The user will not be notified automatically.')) return;
  const result  = await window.electronAPI?.arcCancelRedemption(id);
  const status  = document.getElementById('dp-redeem-status');
  if (result?.ok) {
    if (status) { status.style.color = '#86efac'; status.textContent = 'Redemption cancelled.'; }
  } else {
    if (status) { status.style.color = '#f87171'; status.textContent = result?.error || 'Failed.'; }
  }
  window.loadRedemptionQueue();
};

// ─── SEND MAIL ────────────────────────────────────────────────────────────────

let _dpMailRecipientId = null;
let _dpMailLookupTimeout = null;

window.dpLookupMailRecipient = function(val) {
  const statusEl = document.getElementById('dp-mail-lookup');
  const sendBtn  = document.getElementById('dp-mail-send-btn');
  _dpMailRecipientId = null;
  if (sendBtn) { sendBtn.disabled = true; sendBtn.style.opacity = '0.4'; sendBtn.style.cursor = 'not-allowed'; }

  clearTimeout(_dpMailLookupTimeout);
  if (!val.trim()) { if (statusEl) statusEl.textContent = ''; return; }
  if (statusEl) statusEl.innerHTML = '<span style="color:#566174;">Searching…</span>';

  _dpMailLookupTimeout = setTimeout(async () => {
    const result = await window.electronAPI?.arcLookupUser(val.trim());
    if (!statusEl) return;
    if (result?.ok && result.user) {
      const u = result.user;
      const ignNote = u.ign ? ` · IGN: ${escapeHtml(u.ign)}` : ' · No IGN set';
      statusEl.innerHTML = `<span style="color:#86efac;">✓ ${escapeHtml(u.discord_name)}${ignNote}</span>`;
      _dpMailRecipientId = u.id;
      if (sendBtn) { sendBtn.disabled = false; sendBtn.style.opacity = '1'; sendBtn.style.cursor = 'pointer'; }
    } else {
      statusEl.innerHTML = '<span style="color:#f87171;">✗ No account found</span>';
    }
  }, 500);
};

window.adminSendMail = async function() {
  if (!_dpMailRecipientId) return;
  const subject  = document.getElementById('dp-mail-subject')?.value?.trim();
  const body     = document.getElementById('dp-mail-body')?.value?.trim();
  const statusEl = document.getElementById('dp-mail-status');
  const sendBtn  = document.getElementById('dp-mail-send-btn');

  if (!subject) { if (statusEl) { statusEl.style.color = '#f87171'; statusEl.textContent = 'Subject is required.'; } return; }
  if (!body)    { if (statusEl) { statusEl.style.color = '#f87171'; statusEl.textContent = 'Message body is required.'; } return; }

  if (sendBtn) { sendBtn.disabled = true; sendBtn.textContent = 'Sending…'; }

  const result = await window.electronAPI?.arcSendMail({
    recipientId: _dpMailRecipientId,
    subject,
    body,
    referenceId: null,
  });

  if (sendBtn) { sendBtn.disabled = false; sendBtn.textContent = 'Send Mail'; }

  if (result?.ok) {
    if (statusEl) { statusEl.style.color = '#86efac'; statusEl.textContent = 'Sent!'; }
    document.getElementById('dp-mail-recipient').value = '';
    document.getElementById('dp-mail-subject').value   = '';
    document.getElementById('dp-mail-body').value      = '';
    document.getElementById('dp-mail-lookup').textContent = '';
    _dpMailRecipientId = null;
    if (sendBtn) { sendBtn.disabled = true; sendBtn.style.opacity = '0.4'; sendBtn.style.cursor = 'not-allowed'; }
    setTimeout(() => { if (statusEl) statusEl.textContent = ''; }, 3000);
  } else {
    if (statusEl) { statusEl.style.color = '#f87171'; statusEl.textContent = result?.error || 'Failed to send.'; }
  }
};

window.devSwitchRole = function(role) {
  devSetRole(role);
  if (window.buildTabBar)       window.buildTabBar();
  if (window.renderCurrentPage) window.renderCurrentPage();
};

window.devTestNotification = async function() {
  if (window.electronAPI?.showNotification) {
    await window.electronAPI.showNotification({
      title: 'ArcheRage Companion',
      body:  'Test notification from the dev panel.',
      eventName: '__dev_test__',
    });
  } else {
    alert('Notification API not available (web mode).');
  }
};

window.devOpenAddonFolder = async function() {
  if (window.electronAPI?.getAddonDir) {
    await window.electronAPI.getAddonDir();
  }
};

window.devClearToken = async function() {
  if (window.electronAPI?.clearToken) {
    await window.electronAPI.clearToken();
    alert('Auth token cleared. Refresh to apply.');
  }
};

window.devClearKey = function(key) {
  if (!confirm(`Clear localStorage key "${key}"?`)) return;
  localStorage.removeItem(key);
  if (window.renderCurrentPage) window.renderCurrentPage();
};

window.devClearAllStorage = function() {
  if (!confirm('Clear ALL localStorage? This resets prices, storage, settings, and all saved data.')) return;
  localStorage.clear();
  if (window.renderCurrentPage) window.renderCurrentPage();
};
