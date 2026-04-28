import { eventCategories } from '../data/events.js';

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const SERVER_TZ        = 'America/New_York';
const NOTIFY_THRESHOLD = 15 * 60 * 1000;
const SNOOZE_MS        = 5  * 60 * 1000;
const URGENT_MS        = 5  * 60 * 1000;
const NOT_GOING_MS     = 2  * 60 * 60 * 1000;

const EVENT_DURATIONS_MIN = {
  'Hasla 2 Rifts': 30,
  'Black Dragon': 60,
  'Siege Raid Apply': 60,
  'Red Dragon': 60,
  'Kadum': 60,
  'Leviathan': 60,
  'Crimson Rift': 60,
  'Abyss Attack': 60,
  'Dimensional Raid': 15,
  'DGS West Spawn': 60,
  'DGS East Spawn': 60,
  'Castle Siege': 60,
  'Guardian Scramble': 60,
  'Garden Anthalon': 60,
  'Garden War': 110,
  'Lusca': 60,
  'Wonderland Miraculous Races': 15,
  'Exile Language Tutor': 5,
  'Sungold Crimson Rift': 60,
  'Aragog': 60,
  'Charybdis': 60,
  'Akasch Quests': 15,
  'Hiram Rift': 120,
  'Akasch Mobs': 20,
  'Halcyona War': 60,
  'Evenbard': 100,
  'Grimghast Rift': 70,
  'Wonderland Boss': 30,
  'Sea Spirit General': 60,
  'Harbinger in Peace': 60,
  'Harbinger in War': 60,
  'Jola, Meina & Glenn': 60,
  'Noryette Arena': 60,
  'Daily Reset': 5,
  'Weekly Reset': 5,
  'Faction Activity Reset': 20,
  'Hero Nui Reset': 5,
  'Merchants Day (Land Packs)': 1440,
  'Fishing Day': 1440,
  'Treasures Hunter Day': 1440,
  'Castle Transport': 1200,
  'Merchants Day (Onyx Packs)': 1440,
  'Merchants Day (Drag Essence Packs)': 1440,
  'DS Ocleera Rift': 35,
  'DS War': 120,
  'Server Maintenance': 60,
  'Fall of Hiram': 120,
  'GM Hide & Seek (maybe)': 30,
  'Kraken': 60,
  'Siege Commander Apply': 480,
  'Ayanad Merchant': 360,
  'Kraken Cultist': 30,
  'GM Raging Tank (maybe)': 30,
  'GM Dragon (maybe)': 30,
  'Wonderland Treasure': 30,
  'GM Wonderland Races (maybe)': 30,
  'Jadegale Hasla Rift': 30,
  'Gigantic Honeybee Festival': 30,
};

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
  return new Date();
}

function formatServerClock(date) {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
    timeZone: SERVER_TZ,
  });
}

function formatServerTime(date) {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    timeZone: SERVER_TZ,
  });
}

function formatServerDate(date) {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    timeZone: SERVER_TZ,
  });
}

function getUtcDayName(date) {
  return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getUTCDay()];
}

function getUtcOccurrence(baseDate, daysAhead, time) {
  const [h, m] = time.split(':').map(Number);
  return new Date(Date.UTC(
    baseDate.getUTCFullYear(),
    baseDate.getUTCMonth(),
    baseDate.getUTCDate() + daysAhead,
    h,
    m,
    0,
    0
  ));
}

function getEventDurationMs(event) {
  const direct = EVENT_DURATIONS_MIN[event.name];
  if (direct != null) return direct * 60 * 1000;

  const castleSiege = event.name.startsWith('Castle Siege');
  if (castleSiege) return EVENT_DURATIONS_MIN['Castle Siege'] * 60 * 1000;

  return 60 * 60 * 1000;
}

function getEventOccurrence(event, now) {
  let next = null;
  const duration = getEventDurationMs(event);

  for (let daysAhead = -1; daysAhead < 14; daysAhead++) {
    const candidate = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + daysAhead
    ));
    const dayName = getUtcDayName(candidate);
    const matchesDay = event.days === 'Daily' ||
                       (Array.isArray(event.days) && event.days.includes(dayName));
    if (!matchesDay) continue;

    for (const t of event.times) {
      const start = getUtcOccurrence(now, daysAhead, t);
      const end = new Date(start.getTime() + duration);

      if (start <= now && now < end) {
        return {
          nextTime: start,
          endTime: end,
          diff: start - now,
          active: true,
          duration,
        };
      }

      if (start > now && (!next || start < next.nextTime)) {
        next = {
          nextTime: start,
          endTime: end,
          diff: start - now,
          active: false,
          duration,
        };
      }
    }
  }

  const fallbackStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
  return {
    nextTime: fallbackStart,
    endTime: new Date(fallbackStart.getTime() + duration),
    diff: fallbackStart - now,
    active: false,
    duration,
  };
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
  return getEventOccurrence(event, now).nextTime;
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

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function jsString(value) {
  return String(value)
    .replaceAll('\\', '\\\\')
    .replaceAll("'", "\\'")
    .replaceAll('"', '\\"')
    .replaceAll('\n', '\\n')
    .replaceAll('\r', '\\r');
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
  const eventArg = jsString(eventName);
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
        <div style="font-weight:700;color:#f8fafc;font-size:14px;">${escapeHtml(eventName)}</div>
        <div style="color:#94a3b8;font-size:12px;">Starting in ${timeStr}</div>
      </div>
      <button onclick="document.getElementById('${safeId}')?.remove()" style="background:none;border:none;color:#475569;font-size:18px;cursor:pointer;padding:2px 4px;">×</button>
    </div>
    <div style="display:flex;gap:7px;">
      <button style="flex:1;background:#1e2a38;border:1px solid #2a3a52;border-radius:8px;padding:8px 4px;color:#94a3b8;font-size:11px;cursor:pointer;font-family:Arial,sans-serif;transition:all 0.15s;"
        onmouseover="this.style.borderColor='#fcd34d';this.style.color='#fcd34d'"
        onmouseout="this.style.borderColor='#2a3a52';this.style.color='#94a3b8'"
        onclick="window.snoozeEvent('${eventArg}')">😴 Snooze 5m</button>
      <button style="flex:1;background:#3a1a1a;border:1px solid #6a2d2d;border-radius:8px;padding:8px 4px;color:#fca5a5;font-size:11px;cursor:pointer;font-family:Arial,sans-serif;transition:all 0.15s;"
        onmouseover="this.style.background='#4a2020'" onmouseout="this.style.background='#3a1a1a'"
        onclick="window.notGoingEvent('${eventArg}')">✗ Not Going</button>
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
    if (event.active) return;
    if (toggles[event.name] === false) return; // per-event opt out
    const ms = event.diff;
    if (ms < 0 || ms > NOTIFY_THRESHOLD) return;
    if (snoozed[event.name]  && now < snoozed[event.name])  return;
    if (notGoing[event.name] && now < notGoing[event.name]) return;
    const key = `${event.name}-${event.nextTime?.toISOString?.() || Math.round(event.nextTime / 60000)}`;
    if (notified[key]) return;
    notified[key] = true;
    const minutesLeft = Math.ceil(ms / 60000);
    showNativeNotification(event.name, minutesLeft);
    showInAppToast(event.name, minutesLeft);
  });
}

// ─── RENDER ───────────────────────────────────────────────────────────────────

// ─── BACKGROUND NOTIFICATION LOOP ────────────────────────────────────────────
// Runs independently of the Events page UI. Starts once at app launch and never
// stops, so notifications fire regardless of which page the user is on.

let _bgInterval = null;

export function startBackgroundNotifications() {
  if (_bgInterval) return; // already running
  function tick() {
    const now = getServerNow();
    const allWithDiff = eventCategories.flatMap(cat =>
      cat.events.map(ev => {
        return { ...ev, ...getEventOccurrence(ev, now) };
      })
    );
    checkNotifications(allWithDiff);
  }
  tick(); // run immediately on start
  _bgInterval = setInterval(tick, 30_000); // check every 30 seconds
}

export function renderEventSchedule() {
  const container = document.getElementById('content');
  container.innerHTML = `
    <style>
      .ev-wrapper { padding:22px; max-width:1240px; margin:0 auto; }
      .ev-header { display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:22px;flex-wrap:wrap;gap:14px; }
      .ev-title { font-size:32px;font-weight:800;color:#f8fafc;margin:0 0 5px;letter-spacing:0; }
      .ev-subtitle { color:#7b8da6;margin:0;font-size:13px;font-family:Arial,sans-serif; }
      .ev-controls { display:flex;align-items:center;gap:10px;flex-wrap:wrap; }
      .clock-card { background:#121c29;border:1px solid #29405d;border-radius:8px;padding:12px 18px;text-align:center;box-shadow:inset 0 1px 0 rgba(255,255,255,0.035),0 12px 28px rgba(0,0,0,0.22); }
      .clock-label { display:block;font-size:10px;font-family:Arial,sans-serif;color:#7b8da6;letter-spacing:.08em;text-transform:uppercase;margin-bottom:4px; }
      #digital-clock { font-size:28px;font-weight:800;color:#38d9d1;font-family:monospace;letter-spacing:1px;text-shadow:0 0 14px rgba(56,217,209,0.18); }
      .toggle-btn { background:#121c29;border:1px solid #29405d;border-radius:8px;padding:8px 14px;color:#a7b4c8;font-size:12px;font-family:Arial,sans-serif;cursor:pointer;transition:all 0.15s;white-space:nowrap; }
      .toggle-btn:hover { border-color:#93c5fd;color:#93c5fd; }
      .toggle-btn.active { background:#153756;border-color:#3aa9c9;color:#d5f7ff; }

      /* Category sections */
      .ev-category { margin-bottom:16px;background:#0f1823;border:1px solid #24364c;border-radius:8px;overflow:hidden;box-shadow:0 14px 36px rgba(0,0,0,0.2); }
      .ev-cat-header { display:flex;align-items:center;justify-content:space-between;padding:14px 18px;cursor:pointer;user-select:none;transition:background 0.15s,border-color 0.15s; }
      .ev-cat-header:hover { background:#142133; }
      .ev-cat-title { font-size:15px;font-weight:800;color:#f8fafc;font-family:Arial,sans-serif;display:flex;align-items:center;gap:8px; }
      .ev-cat-name { display:inline-flex;align-items:center;gap:8px; }
      .ev-cat-name::before { content:"";width:5px;height:18px;border-radius:4px;background:#38d9d1;box-shadow:0 0 12px rgba(56,217,209,0.28); }
      .ev-cat-count { font-size:11px;color:#7b8da6;font-family:Arial,sans-serif; }
      .ev-cat-chevron { color:#7b8da6;font-size:12px;transition:transform 0.2s; }
      .ev-cat-chevron.open { transform:rotate(180deg); }
      .ev-cat-body { display:none; }
      .ev-cat-body.open { display:block; }

      /* Event grid */
      .ev-grid { display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:10px;padding:12px;background:rgba(4,9,15,0.22); }
      .ev-card { background:#152131;border:1px solid #2a4058;border-radius:8px;padding:14px 16px;transition:transform 0.16s,border-color 0.16s,background 0.16s;position:relative; }
      .ev-card:hover { border-color:#4b759c;background:#18273a;transform:translateY(-1px); }
      .ev-card.urgent { border-color:#f87171;box-shadow:0 0 16px rgba(248,113,113,0.15);animation:urgentPulse 2s ease-in-out infinite; }
      .ev-card.soon { border-color:#fcd34d;box-shadow:0 0 12px rgba(252,211,77,0.1); }
      .ev-card.disabled { opacity:0.4; }
      @keyframes urgentPulse {
        0%,100% { box-shadow:0 0 16px rgba(248,113,113,0.15); }
        50%      { box-shadow:0 0 28px rgba(248,113,113,0.35); }
      }
      .ev-card-top { display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px; }
      .ev-name { font-size:13px;font-weight:800;color:#f8fafc;font-family:Arial,sans-serif;flex:1;margin-right:8px;line-height:1.3; }
      .ev-timer { font-size:14px;font-weight:800;color:#38d9d1;font-family:monospace;white-space:nowrap; }
      .ev-timer.urgent-text { color:#f87171; }
      .ev-timer.soon-text   { color:#fcd34d; }
      .ev-badge { font-size:9px;font-family:Arial,sans-serif;padding:3px 7px;border-radius:6px;display:inline-block;margin-bottom:9px;text-transform:uppercase;letter-spacing:.04em; }
      .badge-daily  { background:#17362c;color:#8ff0bc;border:1px solid rgba(143,240,188,0.18); }
      .badge-weekly { background:#182b48;color:#a8d2ff;border:1px solid rgba(168,210,255,0.18); }
      .ev-bar { height:4px;background:#0b121c;border-radius:4px;overflow:hidden;margin-bottom:7px; }
      .ev-fill { height:100%;border-radius:4px;min-width:2px;background:linear-gradient(90deg,#1685c5,#38d9d1);box-shadow:0 0 7px rgba(56,217,209,0.35);transition:width 1s linear; }
      .ev-fill.urgent-bar { background:linear-gradient(90deg,#dc2626,#f87171);box-shadow:0 0 6px rgba(248,113,113,0.4); }
      .ev-fill.soon-bar   { background:linear-gradient(90deg,#d97706,#fcd34d);box-shadow:0 0 6px rgba(252,211,77,0.3); }
      .ev-footer { display:flex;justify-content:space-between;align-items:center; }
      .ev-next { font-size:10px;color:#7b8da6;font-family:Arial,sans-serif; }
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
            <span class="clock-label">SERVER TIME (ET)</span>
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

  if (clockEl) {
    clockEl.innerText = formatServerClock(now);
  }
  if (dateEl) {
    dateEl.innerText = formatServerDate(now);
  }

  const toggles   = getEventToggles();
  const collapsed  = getCategoryCollapsed();

  // Compute diffs for all events for notification check
  const allWithDiff = eventCategories.flatMap(cat =>
    cat.events.map(ev => {
      return { ...ev, ...getEventOccurrence(ev, now) };
    })
  );
  checkNotifications(allWithDiff);

  // Render categories
  catEl.innerHTML = eventCategories.map(cat => {
    const isOpen = collapsed[cat.id] !== true; // default open
    const events = cat.events.map(ev => {
      return { ...ev, ...getEventOccurrence(ev, now) };
    }).sort((a, b) => a.diff - b.diff);

    const upcomingSoon = events.filter(e => e.diff >= 0 && e.diff < NOTIFY_THRESHOLD).length;

    return `
      <div class="ev-category" id="cat-${cat.id}">
        <div class="ev-cat-header" onclick="window.toggleCategory('${cat.id}')">
          <div class="ev-cat-title">
            ${cat.icon ? `<span>${escapeHtml(cat.icon)}</span>` : ''}
            <span class="ev-cat-name">${escapeHtml(cat.name)}</span>
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
  const displayMs = event.active ? event.endTime - now : ms;
  const urgent   = !event.active && ms >= 0 && ms < URGENT_MS;
  const soon     = !event.active && ms >= URGENT_MS && ms < NOTIFY_THRESHOLD;
  const started  = event.active === true;
  const disabled = toggles[event.name] === false;

  const windowMs  = event.duration || 2 * 3600000;
  const fillPct   = started
    ? Math.max(0, Math.min(100, ((now - event.nextTime) / windowMs) * 100))
    : Math.max(0, Math.min(100, (1 - ms / (2 * 3600000)) * 100));
  const barClass  = urgent ? 'urgent-bar' : soon ? 'soon-bar' : '';
  const timerClass = urgent ? 'urgent-text' : soon ? 'soon-text' : '';
  const cardClass  = disabled ? 'disabled' : urgent ? 'urgent' : soon ? 'soon' : '';

  // Convert UTC event time to server time for display.
  const displayUtc = started ? event.endTime : event.nextTime;
  const nextTimeStr = formatServerTime(displayUtc);

  const notifOn = toggles[event.name] !== false;
  const safeName = jsString(event.name);
  const eventName = escapeHtml(event.name);

  return `
    <div class="ev-card ${cardClass}">
      <div class="ev-card-top">
        <div class="ev-name">${eventName}${started ? ' <span style="color:#f87171;font-size:10px;">(Active)</span>' : ''}</div>
        <span class="ev-timer ${timerClass}">${formatCountdown(displayMs)}</span>
      </div>
      <span class="ev-badge ${isDaily ? 'badge-daily' : 'badge-weekly'}">${isDaily ? 'Daily' : 'Weekly'}</span>
      <div class="ev-bar">
        <div class="ev-fill ${barClass}" style="width:${fillPct}%"></div>
      </div>
      <div class="ev-footer">
        <span class="ev-next">${started ? 'Ends' : 'Next'}: ${nextTimeStr} server</span>
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
