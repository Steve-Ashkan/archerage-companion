// ─── CUSTOM TIMERS ────────────────────────────────────────────────────────────

const STORAGE_KEY = 'custom_timers';
let _tick = null;

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function save(timers) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(timers));
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

// ─── SOUND ────────────────────────────────────────────────────────────────────

function playPing() {
  try {
    const ctx  = new (window.AudioContext || window.webkitAudioContext)();
    const gain = ctx.createGain();
    gain.connect(ctx.destination);

    // Three-note chime: C5 → E5 → G5
    [[523.25, 0], [659.25, 0.18], [783.99, 0.36]].forEach(([freq, delay]) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
      osc.connect(gain);
      gain.gain.setValueAtTime(0, ctx.currentTime + delay);
      gain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + delay + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.6);
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 0.65);
    });
  } catch { /* audio not supported */ }
}

// ─── TICK ─────────────────────────────────────────────────────────────────────

function startTick() {
  if (_tick) return;
  _tick = setInterval(() => {
    const timers = load();
    let fired    = false;
    let changed  = false;

    timers.forEach(t => {
      if (!t.running || t.fired) return;
      const remaining = t.totalSeconds - Math.floor((Date.now() - t.startedAt) / 1000);
      if (remaining <= 0) {
        t.running = false;
        t.fired   = true;
        fired     = true;
        changed   = true;
        // Desktop notification
        if (Notification.permission === 'granted') {
          new Notification('⏱ Timer Done', { body: `"${t.title}" has finished!`, silent: true });
        }
      }
    });

    if (fired) {
      playPing();
      save(timers);
    }

    // Re-render if page is visible
    if (document.getElementById('timers-list')) {
      renderTimersList(timers);
      if (changed) save(timers);
    }
  }, 1000);
}

function stopTick() {
  if (_tick) { clearInterval(_tick); _tick = null; }
}

function renderTimersList(timers) {
  const el = document.getElementById('timers-list');
  if (!el) return;
  el.innerHTML = timers.length === 0
    ? `<div style="padding:32px;text-align:center;color:#394252;font-size:13px;">
        No timers yet. Enter a title and duration above and hit Start.
       </div>`
    : timers.map(t => {
        const remaining = t.running
          ? Math.max(0, t.totalSeconds - Math.floor((Date.now() - t.startedAt) / 1000))
          : (t.fired ? 0 : t.totalSeconds);

        const d = Math.floor(remaining / 86400);
        const h = Math.floor((remaining % 86400) / 3600);
        const m = Math.floor((remaining % 3600) / 60);
        const s = remaining % 60;
        const timeStr = d > 0
          ? `${d}d ${h}h ${m}m ${s}s`
          : h > 0 ? `${h}h ${m}m ${s}s`
          : m > 0 ? `${m}m ${s}s`
          : `${s}s`;

        const isExpired = t.fired;
        const color = isExpired ? '#f87171' : t.running ? '#86efac' : '#566174';
        const statusDot = `<span style="width:8px;height:8px;border-radius:50%;background:${color};
          display:inline-block;flex-shrink:0;${t.running ? 'box-shadow:0 0 6px ' + color + ';' : ''}"></span>`;

        if (t.hidden) {
          return `
            <div style="display:flex;align-items:center;gap:12px;padding:10px 16px;
              border-bottom:1px solid #0f1520;">
              ${statusDot}
              <span style="flex:1;font-size:13px;color:#566174;font-style:italic;">
                ${escHtml(t.title)} — hidden
              </span>
              <button onclick="window.timersShow('${t.id}')"
                style="padding:4px 12px;background:#1a2028;border:1px solid #2a3040;color:#566174;
                border-radius:6px;font-size:12px;cursor:pointer;">Show</button>
              <button onclick="window.timersRemove('${t.id}')"
                style="padding:4px 12px;background:#1a0a0a;border:1px solid #5a2a2a;color:#f87171;
                border-radius:6px;font-size:12px;cursor:pointer;">Remove</button>
            </div>`;
        }

        return `
          <div style="display:flex;align-items:center;gap:14px;padding:12px 16px;
            border-bottom:1px solid #0f1520;flex-wrap:wrap;">
            ${statusDot}
            <div style="flex:1;min-width:160px;">
              <div style="font-size:15px;font-weight:700;color:#eef2f7;">${escHtml(t.title)}</div>
              <div style="font-size:${isExpired ? '13px' : '22px'};font-weight:${isExpired ? '400' : '700'};
                color:${color};font-variant-numeric:tabular-nums;margin-top:2px;font-family:monospace;">
                ${isExpired ? '⏰ Timer finished!' : timeStr}
              </div>
            </div>
            <div style="display:flex;gap:6px;flex-wrap:wrap;">
              <button onclick="window.timersHide('${t.id}')"
                style="padding:6px 14px;background:#1a2028;border:1px solid #2a3040;color:#566174;
                border-radius:7px;font-size:12px;font-weight:600;cursor:pointer;">Hide</button>
              <button onclick="window.timersRestart('${t.id}')"
                style="padding:6px 14px;background:#0a2a1a;border:1px solid #2a5a2a;color:#86efac;
                border-radius:7px;font-size:12px;font-weight:600;cursor:pointer;">Restart</button>
              <button onclick="window.timersEdit('${t.id}')"
                style="padding:6px 14px;background:#1a2535;border:1px solid #2d5a8a;color:#93c5fd;
                border-radius:7px;font-size:12px;font-weight:600;cursor:pointer;">Edit</button>
              <button onclick="window.timersRemove('${t.id}')"
                style="padding:6px 14px;background:#1a0a0a;border:1px solid #5a2a2a;color:#f87171;
                border-radius:7px;font-size:12px;font-weight:600;cursor:pointer;">Remove</button>
            </div>
          </div>`;
      }).join('');
}

// ─── RENDER ───────────────────────────────────────────────────────────────────

export function renderPage() {
  const timers = load();
  startTick();

  // Request notification permission if not yet granted
  if (Notification.permission === 'default') {
    Notification.requestPermission();
  }

  return `
    <div style="max-width:760px;margin:0 auto;">

      <!-- Header -->
      <div style="margin-bottom:20px;">
        <h2 style="margin:0 0 4px;color:#eef2f7;">Timers</h2>
        <div style="font-size:13px;color:#566174;">Set countdowns for crops, cooldowns, or anything else. Fires a chime when done.</div>
      </div>

      <!-- Add Timer Card -->
      <div class="card" style="margin-bottom:16px;">
        <div style="font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;
          color:#566174;margin-bottom:12px;">New Timer</div>
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">

          <input id="timer-title" type="text" placeholder="Enter Title"
            onkeydown="if(event.key==='Enter')window.timersStart()"
            style="flex:1;min-width:140px;padding:8px 14px;background:#0f1923;border:1px solid #2a3a52;
            color:#eef2f7;border-radius:8px;font-size:14px;">

          ${['Day','Hr','Min','Sec'].map(unit => `
            <div style="display:flex;align-items:center;gap:6px;">
              <span style="font-size:13px;color:#566174;font-weight:600;">${unit}:</span>
              <input id="timer-${unit.toLowerCase()}" type="number" value="0" min="0"
                ${unit === 'Hr' || unit === 'Min' || unit === 'Sec' ? 'max="59"' : ''}
                style="width:58px;padding:8px 10px;background:#0f1923;border:1px solid #2a3a52;
                color:#eef2f7;border-radius:8px;font-size:14px;font-weight:700;text-align:center;">
            </div>
          `).join('')}

          <button onclick="window.timersStart()"
            style="padding:8px 22px;background:#0a2a1a;border:1px solid #2a5a2a;color:#86efac;
            border-radius:8px;font-size:14px;font-weight:700;cursor:pointer;white-space:nowrap;">
            Start Timer
          </button>
        </div>
      </div>

      <!-- Timer List -->
      <div class="card" style="padding:0;overflow:hidden;">
        <div id="timers-list"></div>
      </div>

    </div>
  `;
}

// Call after render to populate the live list
export function initTimersPage() {
  renderTimersList(load());
}

function escHtml(v) {
  return String(v).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');
}

function getTotalSeconds() {
  const d = parseInt(document.getElementById('timer-day')?.value  || 0, 10) || 0;
  const h = parseInt(document.getElementById('timer-hr')?.value   || 0, 10) || 0;
  const m = parseInt(document.getElementById('timer-min')?.value  || 0, 10) || 0;
  const s = parseInt(document.getElementById('timer-sec')?.value  || 0, 10) || 0;
  return d * 86400 + h * 3600 + m * 60 + s;
}

// ─── HANDLERS ─────────────────────────────────────────────────────────────────

window.timersStart = function() {
  const title = document.getElementById('timer-title')?.value?.trim();
  if (!title) { document.getElementById('timer-title')?.focus(); return; }
  const total = getTotalSeconds();
  if (total <= 0) return;

  const timers = load();
  timers.unshift({
    id: uid(), title, totalSeconds: total,
    startedAt: Date.now(), running: true, hidden: false, fired: false,
  });
  save(timers);

  // Reset inputs
  document.getElementById('timer-title').value = '';
  ['day','hr','min','sec'].forEach(u => {
    const el = document.getElementById(`timer-${u}`);
    if (el) el.value = '0';
  });

  renderTimersList(timers);
};

window.timersRemove = function(id) {
  const timers = load().filter(t => t.id !== id);
  save(timers);
  renderTimersList(timers);
};

window.timersHide = function(id) {
  const timers = load();
  const t = timers.find(t => t.id === id);
  if (t) t.hidden = true;
  save(timers);
  renderTimersList(timers);
};

window.timersShow = function(id) {
  const timers = load();
  const t = timers.find(t => t.id === id);
  if (t) t.hidden = false;
  save(timers);
  renderTimersList(timers);
};

window.timersRestart = function(id) {
  const timers = load();
  const t = timers.find(t => t.id === id);
  if (!t) return;
  t.startedAt = Date.now();
  t.running   = true;
  t.fired     = false;
  save(timers);
  renderTimersList(timers);
};

window.timersEdit = function(id) {
  const timers = load();
  const t = timers.find(t => t.id === id);
  if (!t) return;

  const d = Math.floor(t.totalSeconds / 86400);
  const h = Math.floor((t.totalSeconds % 86400) / 3600);
  const m = Math.floor((t.totalSeconds % 3600) / 60);
  const s = t.totalSeconds % 60;

  // Populate the add-timer inputs with this timer's values, then remove it
  const titleEl = document.getElementById('timer-title');
  if (titleEl) titleEl.value = t.title;
  ['day','hr','min','sec'].forEach((u, i) => {
    const el = document.getElementById(`timer-${u}`);
    if (el) el.value = [d, h, m, s][i];
  });

  // Remove from list so user can re-start it
  const updated = timers.filter(x => x.id !== id);
  save(updated);
  renderTimersList(updated);
  document.getElementById('timer-title')?.focus();
};
