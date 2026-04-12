import { appState, saveLandingText } from "../state.js";
import { getAuth, getRole, userHasRole } from "../auth.js";
import { escapeHtml, formatGold } from "../utils.js";
import { eventCategories } from "../data/events.js";
import { ROLE_COLORS, ROLE_LABELS } from "../roles.js";

// ─── EVENTS ───────────────────────────────────────────────────────────────────

function getServerNow() {
  return new Date(new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }));
}

function getNextOccurrence(event, now) {
  for (let daysAhead = 0; daysAhead < 14; daysAhead++) {
    const candidate = new Date(now);
    candidate.setDate(candidate.getDate() + daysAhead);
    const dayName = candidate.toLocaleDateString('en-US', { weekday: 'long' });
    const matchesDay = event.days === 'Daily' ||
      (Array.isArray(event.days) && event.days.includes(dayName));
    if (!matchesDay) continue;
    for (const t of event.times) {
      const [h, m] = t.split(':');
      const d = new Date(candidate);
      d.setHours(parseInt(h), parseInt(m), 0, 0);
      if (d > now) return d;
    }
  }
  return null;
}

function getUpcomingEvents(count = 5) {
  const now = getServerNow();
  const all = [];
  for (const cat of eventCategories) {
    for (const ev of cat.events) {
      const next = getNextOccurrence(ev, now);
      if (next) all.push({ name: ev.name, category: cat.name, icon: cat.icon, next, msAway: next - now });
    }
  }
  return all.sort((a, b) => a.msAway - b.msAway).slice(0, count);
}

function formatCountdown(ms) {
  if (ms < 60000) return `${Math.floor(ms / 1000)}s`;
  if (ms < 3600000) {
    const m = Math.floor(ms / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return s > 0 ? `${m}m ${s}s` : `${m}m`;
  }
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function getCountdownColor(ms) {
  if (ms < 5 * 60 * 1000)  return '#f87171';
  if (ms < 15 * 60 * 1000) return '#fcd34d';
  return '#86efac';
}

// ─── IGN ──────────────────────────────────────────────────────────────────────

const IGN_KEY = 'userIgn';

function getIGN() {
  return localStorage.getItem(IGN_KEY) || '';
}

function saveIGN(ign) {
  localStorage.setItem(IGN_KEY, ign.trim());
  window.electronAPI?.updateIgn(ign.trim());
}

// ─── STATS ────────────────────────────────────────────────────────────────────

function getQuickStats() {
  const prices  = appState.prices  || {};
  const storage = appState.storage || {};

  const pricesTracked  = Object.values(prices).filter(p => Number(p) > 0).length;
  const itemsInStorage = Object.values(storage).filter(q => Number(q) > 0).length;

  let netWorth = 0;
  for (const [item, qty] of Object.entries(storage)) {
    netWorth += Number(qty) * Number(prices[item] || 0);
  }

  return { pricesTracked, itemsInStorage, netWorth };
}

// ─── RENDER SECTIONS ──────────────────────────────────────────────────────────

function renderUserCard() {
  const auth  = getAuth();
  const role  = getRole();
  const user  = auth.user;
  const color = ROLE_COLORS[role] || '#566174';
  const label = ROLE_LABELS[role] || role;
  const ign   = getIGN();

  const avatar = user?.avatar
    ? `<img src="${escapeHtml(user.avatar)}" style="width:52px;height:52px;border-radius:50%;border:2px solid ${color};object-fit:cover;">`
    : `<div style="width:52px;height:52px;border-radius:50%;background:#21262f;border:2px solid ${color};
        display:flex;align-items:center;justify-content:center;font-size:1.4em;color:${color};">
        ${user?.name ? escapeHtml(user.name[0].toUpperCase()) : '?'}
       </div>`;

  const proExpiry = auth.proExpires
    ? `<div style="font-size:0.78em;color:#8d99ab;margin-top:2px;">
        Pro expires ${new Date(auth.proExpires).toLocaleDateString()}
       </div>`
    : '';

  const ignLine = user ? (ign
    ? `<div style="font-size:0.82em;color:#8d99ab;margin-top:3px;">
        IGN: <span style="color:#cbd5e1;">${escapeHtml(ign)}</span>
       </div>`
    : `<div style="font-size:0.82em;margin-top:3px;">
        <span style="color:#f87171;cursor:pointer;" onclick="window.openProfileModal()">
          ⚠ Set your in-game name
        </span>
       </div>`) : '';

  return `
    <div class="card" style="display:flex;align-items:center;gap:16px;flex-wrap:wrap;">
      ${avatar}
      <div style="flex:1;min-width:0;">
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
          <span style="font-size:1.15em;font-weight:700;color:#eef2f7;">
            ${user ? escapeHtml(user.name) : 'Not signed in'}
          </span>
          <span style="font-size:0.75em;font-weight:600;padding:2px 10px;border-radius:20px;
            background:${color}22;color:${color};border:1px solid ${color}44;letter-spacing:0.05em;">
            ${escapeHtml(label)}
          </span>
        </div>
        <div style="font-size:0.85em;color:#8d99ab;margin-top:2px;">ArcheRage Companion</div>
        ${ignLine}
        ${proExpiry}
      </div>
      <div style="display:flex;gap:8px;align-items:center;flex-shrink:0;">
        ${user ? `
          <button onclick="window.openProfileModal()"
            style="background:#1e2535;border:1px solid #2a3a52;color:#8d99ab;padding:6px 14px;border-radius:8px;font-size:0.82em;cursor:pointer;"
            title="Edit profile">
            ✎ Profile
          </button>
        ` : ''}
        ${!user ? `
          <button onclick="window.showPage('login')"
            style="background:#1a2a3a;border:1px solid #2d5a8a;color:#93c5fd;padding:8px 18px;border-radius:8px;font-size:0.9em;cursor:pointer;">
            Sign in with Discord
          </button>
        ` : `
          <button onclick="window.doSignOut()"
            style="background:#1e2535;border:1px solid #2a3a52;color:#566174;padding:8px 18px;border-radius:8px;font-size:0.85em;cursor:pointer;">
            Sign out
          </button>
        `}
      </div>
    </div>
  `;
}

function renderQuickStats() {
  const { pricesTracked, itemsInStorage, netWorth } = getQuickStats();

  const stats = [
    { label: 'Prices Tracked',   value: pricesTracked.toLocaleString(),  color: '#93c5fd' },
    { label: 'Items in Storage', value: itemsInStorage.toLocaleString(), color: '#86efac' },
    { label: 'Net Worth',        value: formatGold(netWorth),            color: '#ffd166' },
  ];

  return `
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;margin-bottom:0;">
      ${stats.map(s => `
        <div style="background:#21262f;border:1px solid #394252;border-radius:10px;padding:14px 16px;">
          <div style="font-size:0.75em;color:#8d99ab;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:6px;">${s.label}</div>
          <div style="font-size:1.3em;font-weight:700;color:${s.color};">${s.value}</div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderUpcomingEvents() {
  const events = getUpcomingEvents(5);

  const rows = events.map(ev => {
    const color = getCountdownColor(ev.msAway);
    return `
      <div style="display:flex;justify-content:space-between;align-items:center;
        padding:9px 0;border-bottom:1px solid #1e2a38;">
        <div style="display:flex;align-items:center;gap:8px;min-width:0;">
          <span style="font-size:1em;">${ev.icon}</span>
          <div style="min-width:0;">
            <div style="font-size:0.88em;color:#eef2f7;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
              ${escapeHtml(ev.name)}
            </div>
            <div style="font-size:0.75em;color:#8d99ab;">${escapeHtml(ev.category)}</div>
          </div>
        </div>
        <div style="font-size:0.88em;font-weight:700;color:${color};flex-shrink:0;margin-left:12px;
          ${ev.msAway < 5 * 60 * 1000 ? 'animation:pulse 1s infinite;' : ''}">
          ${formatCountdown(ev.msAway)}
        </div>
      </div>
    `;
  }).join('');

  return `
    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
        <h3 style="margin:0;">Upcoming Events</h3>
        <button onclick="window.showPage('events')"
          style="background:none;border:none;color:#93c5fd;font-size:0.82em;cursor:pointer;padding:0;">
          View all →
        </button>
      </div>
      ${rows}
      <div style="font-size:0.75em;color:#394252;margin-top:10px;">Times in server time (ET)</div>
    </div>
  `;
}

function renderDevNotes() {
  const isDev   = userHasRole('dev');
  const isStaff = userHasRole('staff');
  const content = appState.landingText || '';

  if (isDev) {
    return `
      <div class="card">
        <h3 style="margin-top:0;">Dev Notes</h3>
        <p class="notice" style="margin:0 0 10px 0;">
          What you write here is shown to all users. Use it for patch notes, tips, or announcements.
        </p>
        <textarea
          class="landing-editor"
          placeholder="Write a note for your users..."
          oninput="window.setLandingText(this.value)"
          style="min-height:120px;"
        >${escapeHtml(content)}</textarea>
      </div>
    `;
  }

  if (!content.trim()) return '';

  return `
    <div class="card">
      <h3 style="margin-top:0;">From the Developer</h3>
      <div style="color:#cbd5e1;line-height:1.7;white-space:pre-wrap;font-size:0.9em;">${escapeHtml(content)}</div>
    </div>
  `;
}

// ─── NEWS FEED ────────────────────────────────────────────────────────────────

let _newsCache = null;

async function loadNews() {
  if (!window.electronAPI?.wikiGetNews) return;
  const result = await window.electronAPI.wikiGetNews();
  if (result?.ok) {
    _newsCache = result.articles;
    window.renderCurrentPage?.();
  }
}

function renderNewsFeed() {
  if (!_newsCache) { loadNews(); return ''; }
  if (_newsCache.length === 0) return '';

  return `
    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
        <h3 style="margin:0;">Community Guides</h3>
        <button onclick="window.showPage('wiki')"
          style="background:none;border:none;color:#93c5fd;font-size:0.82em;cursor:pointer;padding:0;">
          View wiki →
        </button>
      </div>
      ${_newsCache.map(a => {
        const date = a.reviewed_at
          ? new Date(a.reviewed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          : '';
        return `
          <div style="display:flex;justify-content:space-between;align-items:center;
            padding:9px 0;border-bottom:1px solid #1e2a38;">
            <div style="min-width:0;">
              <div style="font-size:0.88em;color:#eef2f7;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                ${escapeHtml(a.title)}
              </div>
              <div style="font-size:0.75em;color:#8d99ab;">
                ${escapeHtml(a.category)}${a.ign ? ` · by ${escapeHtml(a.ign)}` : ''}
              </div>
            </div>
            <div style="font-size:0.75em;color:#394252;flex-shrink:0;margin-left:12px;">${escapeHtml(date)}</div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

// ─── PRO PITCH + ARC POINTS ──────────────────────────────────────────────────

function renderProPitch() {
  const FREE = [
    'All crafting calculators (Erenor, Hiram, Library…)',
    'Events schedule with live timers',
    'Wiki & community guides',
    'Costume Builder',
    'AH Scanner addon',
    'Browse community prices',
    'Submit recipes & guides for ARC Points',
  ];

  const PRO_ONLY = [
    'Net Worth tracker',
    'Bag & Vault Scanner',
    'Daily price feed — auto-updated from AH scans',
    'Add & manage custom items',
    'Recipe Lookup — check if you have the mats',
    '20% discount on all ARC Point redemptions',
  ];

  const freeRows = FREE.map(f =>
    `<div style="display:flex;align-items:flex-start;gap:8px;padding:5px 0;font-size:13px;color:#94a3b8;border-bottom:1px solid #1e2a38;">
      <span style="color:#86efac;flex-shrink:0;margin-top:1px;">✓</span>${f}
    </div>`
  ).join('');

  const proRows = PRO_ONLY.map(p =>
    `<div style="display:flex;align-items:flex-start;gap:8px;padding:5px 0;font-size:13px;color:#eef2f7;border-bottom:1px solid #1e2a38;">
      <span style="color:#ffd166;flex-shrink:0;margin-top:1px;">✦</span>${p}
    </div>`
  ).join('');

  return `
    <div class="card" style="border-color:#3a3018;background:linear-gradient(135deg,#21262f 0%,#1e2010 100%);">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px;margin-bottom:18px;">
        <div>
          <h3 style="margin:0 0 4px;color:#ffd166;">Unlock Pro</h3>
          <div style="font-size:13px;color:#8d99ab;">$5.99/month · 7-day free trial · cancel anytime</div>
        </div>
        <button onclick="window.showPage('login')"
          style="padding:9px 22px;background:#2a2010;border:1px solid #ffd166;color:#ffd166;
          border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;white-space:nowrap;
          transition:background 0.15s;"
          onmouseover="this.style.background='#3a3018'" onmouseout="this.style.background='#2a2010'">
          Start Free Trial →
        </button>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px;">
        <div>
          <div style="font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;
            color:#566174;margin-bottom:8px;">Free tier</div>
          ${freeRows}
        </div>
        <div>
          <div style="font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;
            color:#a07a10;margin-bottom:8px;">Pro only</div>
          ${proRows}
        </div>
      </div>
    </div>
  `;
}

function renderArcPointsCard() {
  const auth  = getAuth();
  const isPro = auth.isPro;

  const EARN = [
    { action: 'Submit a wiki guide',    pts: '+25',  color: '#86efac', icon: '📖' },
    { action: 'Submit a recipe',        pts: '+5',   color: '#93c5fd', icon: '⚗' },
    { action: 'Submit an AH price',     pts: '+1',   color: '#94a3b8', icon: '💰' },
  ];

  const REDEEM = [
    { label: '1 week Pro',   cost: '500 pts'   },
    { label: '1 month Pro',  cost: '2,000 pts' },
    { label: 'In-game gold', cost: 'varies'    },
    { label: 'Gift Pro',     cost: 'varies'    },
  ];

  const earnRows = EARN.map(e => `
    <div style="display:flex;align-items:center;gap:10px;padding:7px 10px;
      background:#1a2028;border:1px solid #2a3040;border-radius:8px;">
      <span style="font-size:16px;line-height:1;">${e.icon}</span>
      <span style="font-size:13px;color:#cbd5e1;flex:1;">${e.action}</span>
      <span style="font-size:13px;font-weight:700;color:${e.color};">${e.pts}</span>
    </div>
  `).join('');

  const redeemRows = REDEEM.map(r => `
    <div style="display:flex;justify-content:space-between;align-items:center;
      padding:6px 0;border-bottom:1px solid #1e2a38;font-size:13px;">
      <span style="color:#cbd5e1;">${r.label}</span>
      <span style="color:#ffd166;font-weight:600;">${r.cost}${isPro ? ' <span style="color:#86efac;font-size:11px;">−20%</span>' : ''}</span>
    </div>
  `).join('');

  const proNote = isPro
    ? `<div style="font-size:12px;color:#86efac;background:#1a2a1a;border:1px solid #2a5a2a;
        border-radius:8px;padding:8px 12px;margin-top:12px;">
        ✓ Pro subscriber — you get <strong>20% off</strong> all redemptions
      </div>`
    : `<div style="font-size:12px;color:#8d99ab;margin-top:10px;">
        Pro subscribers get 20% off all redemptions.
      </div>`;

  return `
    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;flex-wrap:wrap;gap:8px;">
        <div>
          <h3 style="margin:0 0 2px;">ARC Points</h3>
          <div style="font-size:12px;color:#566174;">Contribute to the app. Earn rewards.</div>
        </div>
        <button onclick="window.showPage('submitRecipe')"
          style="background:#1a2535;border:1px solid #2a3a52;color:#93c5fd;
          padding:6px 14px;border-radius:8px;font-size:12px;cursor:pointer;">
          Submit a Recipe →
        </button>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:20px;">
        <div>
          <div style="font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;
            color:#566174;margin-bottom:8px;">How to earn</div>
          <div style="display:flex;flex-direction:column;gap:6px;">${earnRows}</div>
        </div>
        <div>
          <div style="font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;
            color:#566174;margin-bottom:8px;">Redeem for</div>
          ${redeemRows}
          ${proNote}
        </div>
      </div>
    </div>
  `;
}

// ─── ADDON STATUS ────────────────────────────────────────────────────────────

let _addonStatus = null; // null = not checked yet, {} = checked

async function loadAddonStatus() {
  if (!window.electronAPI?.checkAddonStatus) return;
  const result = await window.electronAPI.checkAddonStatus();
  if (result?.ok) {
    _addonStatus = result.status;
    // Only re-render if something is missing
    const anyMissing = Object.values(result.status).some(s => s.bundledExists && !s.installed);
    if (anyMissing) window.renderCurrentPage?.();
  }
}

function renderAddonBanner() {
  if (!_addonStatus) { loadAddonStatus(); return ''; }

  const LABELS = { ahscanner: 'AH Scanner', invscanner: 'Inventory Scanner' };
  const missing = Object.entries(_addonStatus)
    .filter(([, s]) => s.bundledExists && !s.installed)
    .map(([name]) => name);

  if (!missing.length) return '';

  const list = missing.map(n => `<strong>${LABELS[n] || n}</strong>`).join(' and ');

  return `
    <div class="card" style="border-color:#2d5a8a;background:linear-gradient(135deg,#1a2535,#111d2e);margin-bottom:0;">
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">
        <div>
          <div style="font-weight:700;color:#93c5fd;margin-bottom:4px;">Addon Setup</div>
          <div style="font-size:13px;color:#8d99ab;">
            ${list} ${missing.length > 1 ? 'are' : 'is'} not installed in your ArcheRage addon folder.
            Install now to enable in-game scanning.
          </div>
        </div>
        <button onclick="window.installAddons()"
          style="padding:8px 20px;background:#1a3a5a;border:1px solid #2d5a8a;color:#93c5fd;
          border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;white-space:nowrap;flex-shrink:0;">
          Install Addons
        </button>
      </div>
    </div>
  `;
}

window.installAddons = async function() {
  const btn = event?.target;
  if (btn) { btn.disabled = true; btn.textContent = 'Installing…'; }

  const result = await window.electronAPI?.installAddons();
  if (!result?.ok) {
    alert('Install failed. Check that ArcheRage is installed and try again.');
    if (btn) { btn.disabled = false; btn.textContent = 'Install Addons'; }
    return;
  }

  const failed = Object.entries(result.results).filter(([, r]) => !r.ok);
  if (failed.length) {
    alert('Some addons failed to install:\n' + failed.map(([n, r]) => `${n}: ${r.error}`).join('\n'));
  }

  // Re-check status and refresh
  _addonStatus = null;
  window.renderCurrentPage?.();
};

// ─── AUTO-REFRESH ─────────────────────────────────────────────────────────────

let _landingTimer = null;

function startLandingRefresh() {
  stopLandingRefresh();
  _landingTimer = setInterval(() => {
    if (appState.currentPage === 'landing') {
      window.renderCurrentPage?.();
    }
  }, 30000);
}

export function stopLandingRefresh() {
  if (_landingTimer) { clearInterval(_landingTimer); _landingTimer = null; }
}

// ─── MAIN EXPORT ─────────────────────────────────────────────────────────────

export function renderLandingPage() {
  const auth  = getAuth();
  const isPro = auth.isPro;

  startLandingRefresh();

  return `
    ${renderAddonBanner()}

    ${renderUserCard()}

    <div class="card" style="padding:16px 20px;">
      <div style="font-size:0.75em;color:#8d99ab;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:10px;">Quick Stats</div>
      ${renderQuickStats()}
    </div>

    ${renderUpcomingEvents()}

    ${renderNewsFeed()}

    ${!isPro ? renderProPitch() : ''}

    ${renderArcPointsCard()}

    ${renderDevNotes()}
  `;
}

// ─── HANDLERS ─────────────────────────────────────────────────────────────────

window.setLandingText = function(value) {
  saveLandingText(value);
};

window.openProfileModal = function() {
  document.getElementById('profile-modal')?.remove();
  const ign   = getIGN();
  const auth  = getAuth();
  const user  = auth.user;

  const modal = document.createElement('div');
  modal.id = 'profile-modal';
  modal.style.cssText = `position:fixed;inset:0;background:rgba(0,0,0,0.6);
    display:flex;align-items:center;justify-content:center;z-index:9999;`;

  modal.innerHTML = `
    <div style="background:#1a2535;border:1px solid #2a3a52;border-radius:12px;
      padding:24px;width:420px;max-width:95vw;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
        <h3 style="margin:0;color:#eef2f7;">Edit Profile</h3>
        <button onclick="document.getElementById('profile-modal')?.remove()"
          style="background:none;border:none;color:#566174;font-size:18px;cursor:pointer;">✕</button>
      </div>

      <div style="margin-bottom:16px;">
        <label style="font-size:11px;color:#566174;display:block;margin-bottom:4px;text-transform:uppercase;letter-spacing:0.06em;">
          Discord Name
        </label>
        <div style="padding:8px 12px;background:#0f1923;border:1px solid #1e2d3d;border-radius:8px;
          color:#566174;font-size:13px;">
          ${user ? escapeHtml(user.name) : '—'}
          <span style="font-size:11px;color:#394252;margin-left:8px;">(from Discord — read only)</span>
        </div>
      </div>

      <div style="margin-bottom:20px;">
        <label style="font-size:11px;color:#566174;display:block;margin-bottom:4px;text-transform:uppercase;letter-spacing:0.06em;">
          In-Game Name (IGN)
        </label>
        <input id="profile-ign" type="text"
          value="${escapeHtml(ign)}"
          placeholder="Your ArcheRage character name"
          maxlength="32"
          style="width:100%;box-sizing:border-box;padding:8px 12px;background:#0f1923;
            border:1px solid #2a3a52;color:#eef2f7;border-radius:8px;font-size:14px;">
        <div style="font-size:11px;color:#394252;margin-top:6px;">
          Required for gold redemptions and wiki article credits.
        </div>
      </div>

      <div style="display:flex;gap:10px;">
        <button onclick="window.saveProfileModal()"
          style="flex:1;padding:9px;background:#1a2a3a;border:1px solid #2d5a8a;
          color:#93c5fd;border-radius:8px;font-weight:600;cursor:pointer;">
          Save
        </button>
        <button onclick="document.getElementById('profile-modal')?.remove()"
          style="flex:1;padding:9px;background:#1e2535;border:1px solid #2a3a52;
          color:#566174;border-radius:8px;cursor:pointer;">
          Cancel
        </button>
      </div>
    </div>
  `;

  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
  document.body.appendChild(modal);
  document.getElementById('profile-ign')?.focus();
};

window.saveProfileModal = function() {
  const ign = document.getElementById('profile-ign')?.value?.trim() || '';
  saveIGN(ign);
  document.getElementById('profile-modal')?.remove();
  window.renderCurrentPage();
};
