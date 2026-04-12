import { eventCategories } from '../data/events.js';

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const SERVER_TZ        = 'America/New_York';
const NOTIFY_THRESHOLD = 15 * 60 * 1000;
const SNOOZE_MS        = 5  * 60 * 1000;
const URGENT_MS        = 5  * 60 * 1000;
const NOT_GOING_MS     = 2  * 60 * 60 * 1000;

// ─── STATE ────────────────────────────────────────────────────────────────────
const snoozed    = {};
const notGoing   = {};
const notified   = {};

// Per-event notification toggle — saved to localStorage
function getEventToggles() {
  try { return JSON.parse(localStorage.getItem('eventToggles') || '{}'); } catch(e) { return {}; }
}
function saveEventToggles(t) {
  localStorage.setItem('eventToggles', JSON.stringify(t));
}

// Per-category collapse state
function getCategoryCollapsed() {
  try { return JSON.parse(localStorage.getItem('eventCategoryCollapsed') || '{}'); } catch(e) { return {}; }
}
function saveCategoryCollapsed(c) {
  localStorage.setItem('eventCategoryCollapsed', JSON.stringify(c));
}

let soundEnabled = JSON.parse(localStorage.getItem('eventSoundEnabled') ?? 'true');
let notifEnabled = JSON.parse(localStorage.getItem('eventNotifEnabled') ?? 'true');

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function getServerNow() {
  return new Date(new Date().toLocaleString('en-US', { timeZone: SERVER_TZ }));
}

function playPing() {
  if (!soundEnabled) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator(), gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.5);
  } catch(e) {}
}

function getNextOccurrence(event, now) {
  // Search up to 14 days ahead to find next occurrence
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
  // Fallback: return tomorrow at midnight (should never reach here)
  const fallback = new Date(now);
  fallback.setDate(fallback.getDate() + 1);
  fallback.setHours(0, 0, 0, 0);
  return fallback;
}

function formatCountdown(ms) {
  if (ms < 0) return 'NOW';
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────

async function showNativeNotification(eventName, minutesLeft) {
  if (!window.electronAPI?.showNotification) return;
  const timeStr = minutesLeft <= 1 ? 'less than 1 minute' : `${minutesLeft} minutes`;
  await window.electronAPI.showNotification({
    title: `⚔️ ${eventName} starting soon!`,
    body: `Starting in ${timeStr} — open ArcheRage Companion`,
    eventName,
  });
}

function showInAppToast(eventName, minutesLeft) {
  const safeId = `toast-${eventName.replace(/[^a-z0-9]/gi,'_')}`;
  const existing = document.getElementById(safeId);
  if (existing) existing.remove();

  if (!document.getElementById('toast-anim-style')) {
    const s = document.createElement('style');
    s.id = 'toast-anim-style';
    s.textContent = `
      @keyframes toastIn  { from { transform:translateX(120%); opacity:0; } to { transform:translateX(0); opacity:1; } }
      @keyframes toastOut { from { transform:translateX(0); opacity:1; } to { transform:translateX(120%); opacity:0; } }
    `;
    document.head.appendChild(s);
  }

  const toast = document.createElement('div');
  toast.id = safeId;
  toast.style.cssText = `
    position:fixed;bottom:24px;right:24px;background:#1a2535;border:1px solid #93c5fd;
    border-radius:14px;padding:16px 18px;min-width:295px;max-width:355px;
    box-shadow:0 8px 32px rgba(0,0,0,0.55);z-index:9999;font-family:Arial,sans-serif;
    animation:toastIn 0.3s ease;
  `;
  const timeStr = minutesLeft <= 1 ? 'less than 1 min' : `${minutesLeft} minutes`;
  toast.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
      <span style="font-size:22px;">⚔️</span>
      <div style="flex:1;">
        <div style="font-weight:700;color:#f8fafc;font-size:14px;">${eventName}</div>
        <div style="color:#94a3b8;font-size:12px;">Starting in ${timeStr}</div>
      </div>
      <button onclick="document.getElementById('${safeId}')?.remove()" style="background:none;border:none;color:#475569;font-size:18px;cursor:pointer;padding:2px 4px;">×</button>
    </div>
    <div style="display:flex;gap:7px;">
      <button style="flex:1;background:#1e2a38;border:1px solid #2a3a52;border-radius:8px;padding:8px 4px;color:#94a3b8;font-size:11px;cursor:pointer;font-family:Arial,sans-serif;transition:all 0.15s;"
        onmouseover="this.style.borderColor='#fcd34d';this.style.color='#fcd34d'"
        onmouseout="this.style.borderColor='#2a3a52';this.style.color='#94a3b8'"
        onclick="window.snoozeEvent('${eventName}')">😴 Snooze 5m</button>
      <button style="flex:1;background:#3a1a1a;border:1px solid #6a2d2d;border-radius:8px;padding:8px 4px;color:#fca5a5;font-size:11px;cursor:pointer;font-family:Arial,sans-serif;transition:all 0.15s;"
        onmouseover="this.style.background='#4a2020'" onmouseout="this.style.background='#3a1a1a'"
        onclick="window.notGoingEvent('${eventName}')">✗ Not Going</button>
      <button style="flex:1;background:#1e3a5f;border:1px solid #93c5fd;border-radius:8px;padding:8px 4px;color:#93c5fd;font-size:11px;cursor:pointer;font-family:Arial,sans-serif;transition:all 0.15s;"
        onmouseover="this.style.background='#1e4a7a'" onmouseout="this.style.background='#1e3a5f'"
        onclick="document.getElementById('${safeId}')?.remove()">✓ Got it</button>
    </div>
  `;
  document.body.appendChild(toast);
  setTimeout(() => {
    const el = document.getElementById(safeId);
    if (el) { el.style.animation = 'toastOut 0.3s ease forwards'; setTimeout(() => el.remove(), 300); }
  }, 30000);
  playPing();
}

function checkNotifications(allEvents) {
  if (!notifEnabled) return;
  const toggles = getEventToggles();
  const now = Date.now();
  allEvents.forEach(event => {
    if (toggles[event.name] === false) return; // per-event opt out
    const ms = event.diff;
    if (ms < 0 || ms > NOTIFY_THRESHOLD) return;
    if (snoozed[event.name]  && now < snoozed[event.name])  return;
    if (notGoing[event.name] && now < notGoing[event.name]) return;
    const bucket = Math.floor(ms / 60000);
    const key = `${event.name}-${bucket}`;
    if (notified[key]) return;
    notified[key] = true;
    const minutesLeft = Math.ceil(ms / 60000);
    showNativeNotification(event.name, minutesLeft);
    showInAppToast(event.name, minutesLeft);
  });
}

// ─── RENDER ───────────────────────────────────────────────────────────────────

export function renderEventSchedule() {
  const container = document.getElementById('content');
  container.innerHTML = `
    <style>
      .ev-wrapper { padding:20px; max-width:1200px; margin:0 auto; }
      .ev-header { display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:20px;flex-wrap:wrap;gap:12px; }
      .ev-title { font-size:32px;font-weight:700;color:#f8fafc;margin:0 0 4px; }
      .ev-subtitle { color:#64748b;margin:0;font-size:14px;font-family:Arial,sans-serif; }
      .ev-controls { display:flex;align-items:center;gap:10px;flex-wrap:wrap; }
      .clock-card { background:#1a2535;border:1px solid #2a3a52;border-radius:12px;padding:12px 20px;text-align:center; }
      .clock-label { display:block;font-size:10px;font-family:Arial,sans-serif;color:#64748b;letter-spacing:1px;text-transform:uppercase;margin-bottom:4px; }
      #digital-clock { font-size:28px;font-weight:700;color:#22d3ee;font-family:monospace;letter-spacing:2px; }
      .toggle-btn { background:#1a2535;border:1px solid #2a3a52;border-radius:8px;padding:8px 14px;color:#94a3b8;font-size:12px;font-family:Arial,sans-serif;cursor:pointer;transition:all 0.15s;white-space:nowrap; }
      .toggle-btn:hover { border-color:#93c5fd;color:#93c5fd; }
      .toggle-btn.active { background:#1e3a5f;border-color:#93c5fd;color:#93c5fd; }

      /* Category sections */
      .ev-category { margin-bottom:20px;background:#111a26;border:1px solid #1e2d3d;border-radius:16px;overflow:hidden; }
      .ev-cat-header { display:flex;align-items:center;justify-content:space-between;padding:14px 18px;cursor:pointer;user-select:none;transition:background 0.15s; }
      .ev-cat-header:hover { background:#1a2535; }
      .ev-cat-title { font-size:16px;font-weight:700;color:#f8fafc;font-family:Arial,sans-serif;display:flex;align-items:center;gap:8px; }
      .ev-cat-count { font-size:11px;color:#64748b;font-family:Arial,sans-serif; }
      .ev-cat-chevron { color:#64748b;font-size:12px;transition:transform 0.2s; }
      .ev-cat-chevron.open { transform:rotate(180deg); }
      .ev-cat-body { display:none; }
      .ev-cat-body.open { display:block; }

      /* Event grid */
      .ev-grid { display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:10px;padding:12px; }
      .ev-card { background:#1a2535;border:1px solid #2a3a52;border-radius:12px;padding:14px 16px;transition:all 0.2s;position:relative; }
      .ev-card:hover { border-color:#3a5a82; }
      .ev-card.urgent { border-color:#f87171;box-shadow:0 0 16px rgba(248,113,113,0.15);animation:urgentPulse 2s ease-in-out infinite; }
      .ev-card.soon { border-color:#fcd34d;box-shadow:0 0 12px rgba(252,211,77,0.1); }
      .ev-card.disabled { opacity:0.4; }
      @keyframes urgentPulse {
        0%,100% { box-shadow:0 0 16px rgba(248,113,113,0.15); }
        50%      { box-shadow:0 0 28px rgba(248,113,113,0.35); }
      }
      .ev-card-top { display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px; }
      .ev-name { font-size:13px;font-weight:700;color:#f8fafc;font-family:Arial,sans-serif;flex:1;margin-right:8px; }
      .ev-timer { font-size:14px;font-weight:700;color:#22d3ee;font-family:monospace;white-space:nowrap; }
      .ev-timer.urgent-text { color:#f87171; }
      .ev-timer.soon-text   { color:#fcd34d; }
      .ev-badge { font-size:9px;font-family:Arial,sans-serif;padding:2px 6px;border-radius:6px;display:inline-block;margin-bottom:8px; }
      .badge-daily  { background:#1a3a2a;color:#86efac; }
      .badge-weekly { background:#1a2a4a;color:#93c5fd; }
      .ev-bar { height:3px;background:#0f1923;border-radius:3px;overflow:hidden;margin-bottom:6px; }
      .ev-fill { height:100%;border-radius:3px;min-width:2px;background:linear-gradient(90deg,#0ea5e9,#22d3ee);box-shadow:0 0 6px rgba(34,211,238,0.4);transition:width 1s linear; }
      .ev-fill.urgent-bar { background:linear-gradient(90deg,#dc2626,#f87171);box-shadow:0 0 6px rgba(248,113,113,0.4); }
      .ev-fill.soon-bar   { background:linear-gradient(90deg,#d97706,#fcd34d);box-shadow:0 0 6px rgba(252,211,77,0.3); }
      .ev-footer { display:flex;justify-content:space-between;align-items:center; }
      .ev-next { font-size:10px;color:#475569;font-family:Arial,sans-serif; }
      .ev-notif-toggle { background:none;border:none;cursor:pointer;font-size:13px;opacity:0.6;transition:opacity 0.15s;padding:0; }
      .ev-notif-toggle:hover { opacity:1; }
      .ev-notif-toggle.on { opacity:1; }
    </style>

    <div class="ev-wrapper">
      <header class="ev-header">
        <div>
          <h1 class="ev-title">World Events</h1>
          <p id="server-date" class="ev-subtitle"></p>
        </div>
        <div class="ev-controls">
          <button class="toggle-btn ${soundEnabled ? 'active' : ''}" id="sound-toggle" onclick="window.toggleEventSound(this)">
            🔔 Sound ${soundEnabled ? 'ON' : 'OFF'}
          </button>
          <button class="toggle-btn ${notifEnabled ? 'active' : ''}" id="notif-toggle" onclick="window.toggleEventNotif(this)">
            🔔 Alerts ${notifEnabled ? 'ON' : 'OFF'}
          </button>
          <div class="clock-card">
            <span class="clock-label">SERVER TIME</span>
            <span id="digital-clock">00:00:00</span>
          </div>
        </div>
      </header>
      <div id="events-categories"></div>
    </div>
  `;

  // Wire native notification handlers
  if (window.electronAPI?.onNotificationSnooze)   window.electronAPI.onNotificationSnooze(n => window.snoozeEvent(n));
  if (window.electronAPI?.onNotificationNotGoing) window.electronAPI.onNotificationNotGoing(n => window.notGoingEvent(n));

  updateUI();
  const interval = setInterval(() => {
    if (!document.getElementById('events-categories')) { clearInterval(interval); return; }
    updateUI();
  }, 1000);
}

function updateUI() {
  const now = getServerNow();
  const clockEl = document.getElementById('digital-clock');
  const dateEl  = document.getElementById('server-date');
  const catEl   = document.getElementById('events-categories');
  if (!catEl) return;

  if (clockEl) clockEl.innerText = now.toLocaleTimeString('en-US', { hour12: false });
  if (dateEl)  dateEl.innerText  = now.toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' });

  const toggles   = getEventToggles();
  const collapsed  = getCategoryCollapsed();

  // Compute diffs for all events for notification check
  const allWithDiff = eventCategories.flatMap(cat =>
    cat.events.map(ev => {
      const nextTime = getNextOccurrence(ev, now);
      return { ...ev, nextTime, diff: nextTime - now };
    })
  );
  checkNotifications(allWithDiff);

  // Render categories
  catEl.innerHTML = eventCategories.map(cat => {
    const isOpen = collapsed[cat.id] !== true; // default open
    const events = cat.events.map(ev => {
      const nextTime = getNextOccurrence(ev, now);
      const diff     = nextTime - now;
      return { ...ev, nextTime, diff };
    }).sort((a, b) => a.diff - b.diff);

    const upcomingSoon = events.filter(e => e.diff >= 0 && e.diff < NOTIFY_THRESHOLD).length;

    return `
      <div class="ev-category" id="cat-${cat.id}">
        <div class="ev-cat-header" onclick="window.toggleCategory('${cat.id}')">
          <div class="ev-cat-title">
            <span>${cat.icon}</span>
            <span>${cat.name}</span>
            ${upcomingSoon > 0 ? `<span style="background:#1e3a5f;color:#93c5fd;font-size:10px;padding:2px 7px;border-radius:8px;">${upcomingSoon} soon</span>` : ''}
          </div>
          <div style="display:flex;align-items:center;gap:10px;">
            <span class="ev-cat-count">${cat.events.length} events</span>
            <span class="ev-cat-chevron ${isOpen ? 'open' : ''}">▼</span>
          </div>
        </div>
        <div class="ev-cat-body ${isOpen ? 'open' : ''}" id="body-${cat.id}">
          <div class="ev-grid">
            ${events.map(ev => renderEventCard(ev, toggles, now)).join('')}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function renderEventCard(event, toggles, now) {
  const ms       = event.diff;
  const isDaily  = event.days === 'Daily';
  const urgent   = ms >= 0 && ms < URGENT_MS;
  const soon     = ms >= URGENT_MS && ms < NOTIFY_THRESHOLD;
  const started  = ms < 0;
  const disabled = toggles[event.name] === false;

  const windowMs  = 2 * 3600000;
  const fillPct   = started ? 100 : Math.max(0, Math.min(100, (1 - ms / windowMs) * 100));
  const barClass  = urgent ? 'urgent-bar' : soon ? 'soon-bar' : '';
  const timerClass = urgent ? 'urgent-text' : soon ? 'soon-text' : '';
  const cardClass  = disabled ? 'disabled' : urgent ? 'urgent' : soon ? 'soon' : '';

  const nextTimeStr = event.nextTime.toLocaleTimeString('en-US', {
    hour:'2-digit', minute:'2-digit', hour12: false, timeZone: SERVER_TZ
  });

  const notifOn = toggles[event.name] !== false;
  const safeName = event.name.replace(/'/g, "\\'");

  return `
    <div class="ev-card ${cardClass}">
      <div class="ev-card-top">
        <div class="ev-name">${event.name}${started ? ' <span style="color:#f87171;font-size:10px;">(Active)</span>' : ''}</div>
        <span class="ev-timer ${timerClass}">${formatCountdown(ms)}</span>
      </div>
      <span class="ev-badge ${isDaily ? 'badge-daily' : 'badge-weekly'}">${isDaily ? 'Daily' : 'Weekly'}</span>
      <div class="ev-bar">
        <div class="ev-fill ${barClass}" style="width:${fillPct}%"></div>
      </div>
      <div class="ev-footer">
        <span class="ev-next">Next: ${nextTimeStr} server</span>
        <button class="ev-notif-toggle ${notifOn ? 'on' : ''}"
          title="${notifOn ? 'Notifications ON — click to disable' : 'Notifications OFF — click to enable'}"
          onclick="window.toggleEventNotification('${safeName}', this)">
          ${notifOn ? '🔔' : '🔕'}
        </button>
      </div>
    </div>
  `;
}

// ─── WINDOW HANDLERS ─────────────────────────────────────────────────────────

window.toggleCategory = function(catId) {
  const body     = document.getElementById(`body-${catId}`);
  const chevron  = document.querySelector(`#cat-${catId} .ev-cat-chevron`);
  const collapsed = getCategoryCollapsed();
  const isOpen   = body.classList.contains('open');
  if (isOpen) {
    body.classList.remove('open');
    chevron?.classList.remove('open');
    collapsed[catId] = true;
  } else {
    body.classList.add('open');
    chevron?.classList.add('open');
    delete collapsed[catId];
  }
  saveCategoryCollapsed(collapsed);
};

window.toggleEventNotification = function(eventName, btn) {
  const toggles = getEventToggles();
  const current = toggles[eventName] !== false;
  toggles[eventName] = !current;
  saveEventToggles(toggles);
  btn.textContent = toggles[eventName] ? '🔔' : '🔕';
  btn.classList.toggle('on', toggles[eventName]);
  btn.title = toggles[eventName] ? 'Notifications ON — click to disable' : 'Notifications OFF — click to enable';
};

window.snoozeEvent = function(eventName) {
  snoozed[eventName] = Date.now() + SNOOZE_MS;
  Object.keys(notified).forEach(k => { if (k.startsWith(eventName)) delete notified[k]; });
  const safeId = `toast-${eventName.replace(/[^a-z0-9]/gi,'_')}`;
  const el = document.getElementById(safeId);
  if (el) { el.style.animation = 'toastOut 0.3s ease forwards'; setTimeout(() => el.remove(), 300); }
};

window.notGoingEvent = function(eventName) {
  notGoing[eventName] = Date.now() + NOT_GOING_MS;
  Object.keys(notified).forEach(k => { if (k.startsWith(eventName)) delete notified[k]; });
  const safeId = `toast-${eventName.replace(/[^a-z0-9]/gi,'_')}`;
  const el = document.getElementById(safeId);
  if (el) { el.style.animation = 'toastOut 0.3s ease forwards'; setTimeout(() => el.remove(), 300); }
};

window.toggleEventSound = function(btn) {
  soundEnabled = !soundEnabled;
  localStorage.setItem('eventSoundEnabled', JSON.stringify(soundEnabled));
  btn.textContent = `🔔 Sound ${soundEnabled ? 'ON' : 'OFF'}`;
  btn.classList.toggle('active', soundEnabled);
  if (soundEnabled) playPing();
};

window.toggleEventNotif = function(btn) {
  notifEnabled = !notifEnabled;
  localStorage.setItem('eventNotifEnabled', JSON.stringify(notifEnabled));
  btn.textContent = `🔔 Alerts ${notifEnabled ? 'ON' : 'OFF'}`;
  btn.classList.toggle('active', notifEnabled);
};