// ─── FIRST-TIME ONBOARDING WIZARD ─────────────────────────────────────────────
// Shows on first launch only. Skipped automatically for existing users who already
// have price/storage data in localStorage.

import { getAuth } from './auth.js';
import { escapeHtml } from './utils.js';

const DONE_KEY = 'onboardingDone';
const STEP_KEY = 'onboardingStep';

function isDone()    { return localStorage.getItem(DONE_KEY) === 'true'; }
function getStep()   { return parseInt(localStorage.getItem(STEP_KEY) || '0'); }
function saveStep(n) { localStorage.setItem(STEP_KEY, String(n)); }

function finish() {
  localStorage.setItem(DONE_KEY, 'true');
  localStorage.removeItem(STEP_KEY);
  removeOverlay();
  removeFloatBar();
}

function removeOverlay()  { document.getElementById('ob-overlay')?.remove(); }
function removeFloatBar() { document.getElementById('ob-float')?.remove(); }

function injectStyle() {
  if (document.getElementById('ob-style')) return;
  const s = document.createElement('style');
  s.id = 'ob-style';
  s.textContent = `
    @keyframes ob-bounce { 0%,100%{transform:translateX(0)} 50%{transform:translateX(9px)} }
    .ob-bounce { display:inline-block; animation:ob-bounce 0.75s ease-in-out infinite; }
    .ob-btn-primary {
      width:100%;padding:13px;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;
      background:#1a3a5a;border:1px solid #2d5a8a;color:#93c5fd;margin-bottom:10px;
    }
    .ob-btn-skip {
      width:100%;padding:9px;border-radius:10px;font-size:13px;cursor:pointer;
      background:transparent;border:1px solid #1e2d3d;color:#566174;
    }
    .ob-btn-discord {
      width:100%;padding:13px;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;
      background:#4752C4;border:1px solid #5865F2;color:#fff;margin-bottom:10px;
    }
  `;
  document.head.appendChild(s);
}

function showStep(step) {
  removeOverlay();
  removeFloatBar();
  saveStep(step);
  injectStyle();

  if (step >= 4) { showDoneScreen(); return; }

  const overlay = document.createElement('div');
  overlay.id = 'ob-overlay';
  overlay.style.cssText = `position:fixed;inset:0;background:rgba(0,0,0,0.88);z-index:8000;
    display:flex;align-items:center;justify-content:center;`;

  const RENDERS = [renderWelcome, renderGuide, renderAddons, renderSignIn];
  overlay.innerHTML = `
    <div style="background:#1a2535;border:1px solid #2a3a52;border-radius:16px;
      padding:36px;width:560px;max-width:95vw;max-height:88vh;overflow-y:auto;">
      ${step > 0 ? progressBar(step) : ''}
      ${RENDERS[step]()}
    </div>`;
  document.body.appendChild(overlay);
}

function showDoneScreen() {
  const overlay = document.createElement('div');
  overlay.id = 'ob-overlay';
  overlay.style.cssText = `position:fixed;inset:0;background:rgba(0,0,0,0.88);z-index:8000;
    display:flex;align-items:center;justify-content:center;`;
  overlay.innerHTML = `
    <div style="background:#1a2535;border:1px solid #2a3a52;border-radius:16px;
      padding:40px 36px;width:480px;max-width:95vw;text-align:center;">
      <div style="font-size:3em;margin-bottom:16px;">✅</div>
      <h2 style="margin:0 0 10px;color:#eef2f7;">You're All Set!</h2>
      <p style="color:#8d99ab;font-size:14px;line-height:1.7;margin:0 0 28px;">
        Everything is in the sidebar on the left.<br>
        Come back to the <strong style="color:#eef2f7;">Guide</strong> any time if you get stuck.
      </p>
      <button class="ob-btn-primary" onclick="window._obFinish()" style="margin-bottom:0;">
        Start Using the App →
      </button>
    </div>`;
  document.body.appendChild(overlay);
}

function progressBar(current) {
  return `
    <div style="display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:28px;">
      ${[1,2,3].map(n => `
        <div style="height:6px;border-radius:3px;transition:all 0.3s;
          width:${n === current ? '32px' : '10px'};
          background:${n <= current ? '#2d5a8a' : '#1e2d3d'};"></div>
      `).join('')}
      <span style="font-size:11px;color:#394252;margin-left:4px;">${current} / 3</span>
    </div>`;
}

// ── STEP RENDERERS ────────────────────────────────────────────────────────────

function renderWelcome() {
  return `
    <div style="text-align:center;">
      <div style="font-size:3em;margin-bottom:16px;">⚔️</div>
      <h2 style="margin:0 0 10px;color:#eef2f7;font-size:1.6em;">Welcome to ArcheRage Companion</h2>
      <p style="color:#8d99ab;font-size:14px;line-height:1.7;margin:0 0 24px;">
        Your all-in-one desktop tool for the ArcheRage private server.
        Let's get you set up in 3 quick steps.
      </p>
      <div style="display:flex;flex-direction:column;gap:8px;text-align:left;margin-bottom:28px;">
        ${[
          ['⚙', 'Crafting calculators — Erenor, Hiram, Library, Akash & more'],
          ['💰', 'AH price tracking with the in-game scanner addon'],
          ['📅', 'Live event schedule with desktop notifications'],
          ['📦', 'Inventory tracking and net worth calculator'],
        ].map(([icon, text]) => `
          <div style="display:flex;align-items:center;gap:12px;padding:10px 14px;
            background:#0f1923;border:1px solid #1e2d3d;border-radius:8px;">
            <span style="font-size:1.1em;flex-shrink:0;">${icon}</span>
            <span style="font-size:13px;color:#cbd5e1;">${text}</span>
          </div>`).join('')}
      </div>
      <button class="ob-btn-primary" onclick="window._obNext()" style="margin-bottom:0;">
        Let's Get Started →
      </button>
    </div>`;
}

function renderGuide() {
  return `
    <h3 style="margin:0 0 6px;color:#eef2f7;font-size:1.15em;">Step 1 — Read the Guide</h3>
    <p style="color:#8d99ab;font-size:13px;line-height:1.6;margin:0 0 16px;">
      Covers everything you need to know — free vs Pro, how the scanners work, and what to do first.
      Takes about 2 minutes and saves a lot of confusion later.
    </p>
    <div style="background:#0f1923;border:1px solid #1e2d3d;border-radius:10px;padding:14px;margin-bottom:20px;">
      <div style="font-size:11px;font-weight:700;color:#566174;text-transform:uppercase;
        letter-spacing:0.06em;margin-bottom:10px;">What's in the guide</div>
      ${[
        'How to install the AH Scanner and Inventory Scanner addons',
        'Free vs Pro — what you can do on each tier',
        'How to import prices and inventory from the game',
        'ARC Points — how to earn and redeem rewards',
      ].map(t => `
        <div style="display:flex;gap:8px;padding:4px 0;font-size:13px;color:#cbd5e1;">
          <span style="color:#2d5a8a;flex-shrink:0;margin-top:1px;">▸</span>${t}
        </div>`).join('')}
    </div>
    <button class="ob-btn-primary" onclick="window._obOpenGuide()">
      <span class="ob-bounce">→</span>&nbsp; Open the Guide
    </button>
    <button class="ob-btn-skip" onclick="window._obNext()">
      Skip — I'll figure it out on my own
    </button>`;
}

function renderAddons() {
  return `
    <h3 style="margin:0 0 6px;color:#eef2f7;font-size:1.15em;">
      Step 2 — Install the Addons
      <span style="font-size:12px;font-weight:400;color:#566174;margin-left:6px;">(optional)</span>
    </h3>
    <p style="color:#8d99ab;font-size:13px;line-height:1.6;margin:0 0 14px;">
      The <strong style="color:#eef2f7;">AH Scanner</strong> and
      <strong style="color:#eef2f7;">Inventory Scanner</strong> are Lua addons that run inside
      ArcheRage and send data directly to this app.
    </p>
    <div style="background:#1a1000;border-left:3px solid #fcd34d;border-radius:0 8px 8px 0;
      padding:10px 14px;margin-bottom:18px;font-size:13px;color:#fcd34d;line-height:1.6;">
      <strong>Don't want them?</strong> No problem — you can still use every calculator and tracker.
      You'll just enter prices and quantities manually instead of importing them.
    </div>
    <div id="ob-addon-status" style="min-height:0;margin-bottom:12px;"></div>
    <button class="ob-btn-primary" id="ob-install-btn" onclick="window._obInstallAddons()">
      <span class="ob-bounce">→</span>&nbsp; Select Addon Folder &amp; Install
    </button>
    <button class="ob-btn-skip" onclick="window._obNext()">
      Skip — I don't need the scanners right now
    </button>`;
}

function renderSignIn() {
  const auth = getAuth();
  if (auth?.user) {
    return `
      <h3 style="margin:0 0 16px;color:#eef2f7;font-size:1.15em;">Step 3 — Sign In with Discord</h3>
      <div style="background:#0f2a0f;border:1px solid #2a5a2a;border-radius:10px;padding:16px;
        margin-bottom:20px;display:flex;align-items:center;gap:14px;">
        ${auth.user.avatar
          ? `<img src="${escapeHtml(auth.user.avatar)}" style="width:44px;height:44px;border-radius:50%;">`
          : ''}
        <div>
          <div style="font-weight:700;color:#eef2f7;">${escapeHtml(auth.user.name)}</div>
          <div style="font-size:12px;color:#86efac;margin-top:2px;">✓ Already signed in — you're good to go</div>
        </div>
      </div>
      <button class="ob-btn-primary" onclick="window._obNext()" style="margin-bottom:0;">
        Continue →
      </button>`;
  }

  return `
    <h3 style="margin:0 0 6px;color:#eef2f7;font-size:1.15em;">Step 3 — Sign In with Discord</h3>
    <p style="color:#8d99ab;font-size:13px;line-height:1.6;margin:0 0 16px;">
      Sign in to earn ARC Points, submit prices and recipes, and unlock Pro features.
    </p>
    <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:20px;">
      ${[
        ['🔒', 'Username &amp; avatar only — no email, no password, nothing else'],
        ['🎯', 'Earn ARC Points by contributing prices, recipes, and guides'],
        ['⭐', 'Unlock Pro: Net Worth, daily price feeds, inventory import'],
      ].map(([icon, text]) => `
        <div style="display:flex;gap:10px;align-items:center;padding:8px 12px;
          background:#0f1923;border:1px solid #1e2d3d;border-radius:8px;">
          <span style="flex-shrink:0;">${icon}</span>
          <span style="font-size:13px;color:#cbd5e1;">${text}</span>
        </div>`).join('')}
    </div>
    <div style="background:#0d1520;border:1px solid #1a2a3a;border-radius:8px;padding:10px 14px;
      margin-bottom:16px;font-size:12px;color:#566174;line-height:1.6;">
      <strong style="color:#8d99ab;">Having trouble signing in?</strong>
      If Discord asks for a passkey or QR code and gets stuck, open Discord in your browser
      and log in there first, then come back and try again.
    </div>
    <button class="ob-btn-discord" onclick="window._obSignIn()">
      <span class="ob-bounce">→</span>&nbsp; Sign In with Discord
    </button>
    <button class="ob-btn-skip" onclick="window._obNext()">
      Skip — Continue as Free User
    </button>`;
}

// ── FLOAT BAR (shown while reading the guide) ─────────────────────────────────

function showFloatBar() {
  removeFloatBar();
  const bar = document.createElement('div');
  bar.id = 'ob-float';
  bar.style.cssText = `position:fixed;bottom:0;left:0;right:0;z-index:8000;
    background:#1a2535;border-top:2px solid #2d5a8a;padding:14px 24px;
    display:flex;align-items:center;justify-content:space-between;
    flex-wrap:wrap;gap:12px;box-shadow:0 -4px 24px rgba(0,0,0,0.5);`;
  bar.innerHTML = `
    <div style="display:flex;align-items:center;gap:12px;">
      <span class="ob-bounce" style="font-size:1.3em;color:#93c5fd;">→</span>
      <span style="color:#cbd5e1;font-size:14px;">
        Take your time — read through the guide. Click when you're done.
      </span>
    </div>
    <button onclick="window._obGuideRead()"
      style="padding:10px 24px;background:#1a3a5a;border:1px solid #2d5a8a;color:#93c5fd;
      border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;white-space:nowrap;">
      I've Read the Guide ✓
    </button>`;
  document.body.appendChild(bar);
}

// ── WINDOW HANDLERS ───────────────────────────────────────────────────────────

window._obNext = function() {
  showStep(Math.min(getStep() + 1, 4));
};

window._obFinish = function() { finish(); };

window._obOpenGuide = function() {
  saveStep(1);
  removeOverlay();
  window.showPage?.('guide');
  showFloatBar();
};

window._obGuideRead = function() {
  removeFloatBar();
  showStep(2);
};

window._obSignIn = function() {
  saveStep(3);
  removeOverlay();
  window.showPage?.('login');
};

window._obInstallAddons = async function() {
  const btn      = document.getElementById('ob-install-btn');
  const statusEl = document.getElementById('ob-addon-status');
  if (btn) { btn.disabled = true; btn.style.opacity = '0.6'; }

  const savedPath = localStorage.getItem('addonInstallPath') || null;
  const picked    = await window.electronAPI?.pickFolder({ defaultPath: savedPath });
  if (!picked?.ok || !picked.path) {
    if (btn) { btn.disabled = false; btn.style.opacity = '1'; }
    return;
  }

  localStorage.setItem('addonInstallPath', picked.path);
  if (statusEl) statusEl.innerHTML = `<div style="color:#93c5fd;font-size:13px;padding:6px 0;">Installing…</div>`;

  const result = await window.electronAPI?.installAddons({ targetBase: picked.path });
  if (!result?.ok) {
    if (statusEl) statusEl.innerHTML = `
      <div style="color:#f87171;font-size:13px;padding:6px 0;">
        Install failed — you can retry any time from the Addons page.
      </div>`;
    if (btn) { btn.disabled = false; btn.style.opacity = '1'; btn.textContent = 'Try Again'; }
    return;
  }

  if (statusEl) statusEl.innerHTML = `
    <div style="background:#0f2a0f;border:1px solid #2a5a2a;border-radius:8px;
      padding:10px 14px;font-size:13px;color:#86efac;line-height:1.6;">
      ✓ Addons installed! Restart ArcheRage, log in, and type
      <code style="background:#0a1a0a;padding:1px 6px;border-radius:4px;">!scanhelp</code>
      in chat to confirm.
    </div>`;
  if (btn) { btn.innerHTML = 'Installed ✓'; btn.style.opacity = '0.6'; }
};

// ── PUBLIC API ────────────────────────────────────────────────────────────────

export function initOnboarding() {
  // Skip entirely for existing users who already have price/storage data
  if (isDone()) return;
  if (localStorage.getItem('priceData') || localStorage.getItem('storageData')) {
    localStorage.setItem(DONE_KEY, 'true');
    return;
  }

  const step = getStep();
  const auth = getAuth();

  // If they left mid-sign-in flow and are now logged in, jump to done
  if (step === 3 && auth?.user) {
    showStep(4);
    return;
  }

  showStep(step);
}
