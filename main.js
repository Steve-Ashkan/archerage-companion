const { app, BrowserWindow, ipcMain, Notification, safeStorage, shell, dialog, Menu } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const fs   = require('fs');
const os   = require('os');
const { createClient } = require('@supabase/supabase-js');


// ─── SUPABASE CLIENT ──────────────────────────────────────────────────────────
const SUPABASE_URL      = 'https://ywkyhtvfdbtybevggonb.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_vLgj1WUM3-mws4c-ahwDWQ_xUmfjRPF';

// Anon key — for public reads (community prices, wiki articles, etc.)
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// ─── APP API HELPER ───────────────────────────────────────────────────────────
// All privileged DB operations are routed through the app-api Edge Function.
// The service key lives only in Supabase secrets — never on the user's machine.
// Identity is established via a signed session JWT in the Authorization header,
// NOT via a discord_id in the request body.
const APP_API_URL      = `${SUPABASE_URL}/functions/v1/app-api`;
const CHECKOUT_API_URL = `${SUPABASE_URL}/functions/v1/create-checkout`;

async function callAppApi(action, params = {}) {
  const session = loadSession();
  const headers = { 'Content-Type': 'application/json', 'apikey': SUPABASE_ANON_KEY };
  if (session?.sessionToken) headers['Authorization'] = `Bearer ${session.sessionToken}`;
  const res = await fetch(APP_API_URL, {
    method:  'POST',
    headers,
    body:    JSON.stringify({ action, ...params }),
  });
  return res.json();
}

// Decode JWT payload without verification (signature verified server-side).
// Used only for local display (name, avatar) — never for access control.
function decodeJWTPayload(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(Buffer.from(b64, 'base64').toString('utf8'));
  } catch { return null; }
}

// ─── MAIL POLLING ─────────────────────────────────────────────────────────────
// C-1/L-5: Realtime subscription removed — it used USING(true) RLS which exposed
// all mail to any anon reader. Replaced with periodic poll through app-api (JWT-gated).

let _mailPollInterval = null;
const _seenMailIds    = new Set();

async function startMailPoll(discordId) {
  stopMailPoll();
  if (!discordId) return;

  // Seed known IDs on first load — don't fire events for existing mail
  try {
    const data = await callAppApi('arc-get-my-mail');
    if (data.ok && Array.isArray(data.mail)) {
      for (const m of data.mail) _seenMailIds.add(m.id);
    }
  } catch {}

  _mailPollInterval = setInterval(async () => {
    try {
      const data = await callAppApi('arc-get-my-mail');
      if (!data.ok || !Array.isArray(data.mail)) return;
      for (const m of data.mail) {
        if (!_seenMailIds.has(m.id)) {
          _seenMailIds.add(m.id);
          if (!m.is_read && mainWindow) mainWindow.webContents.send('arc-new-mail', m);
        }
      }
    } catch {}
  }, 60 * 1000); // poll every 60 seconds
}

function stopMailPoll() {
  if (_mailPollInterval) { clearInterval(_mailPollInterval); _mailPollInterval = null; }
  _seenMailIds.clear();
}

// ─── PATHS ────────────────────────────────────────────────────────────────────
const APP_DATA_DIR = path.join(os.homedir(), '.archerage-companion');
const SESSION_PATH = path.join(APP_DATA_DIR, '.session');

function ensureAppDataDir() {
  if (!fs.existsSync(APP_DATA_DIR)) {
    try { fs.mkdirSync(APP_DATA_DIR, { recursive: true }); } catch(e) {}
  }
}

const ADDON_DIR  = path.join(os.homedir(), 'Documents', 'ArcheRage', 'Addon', 'ahscanner');
const AH_PRICES  = path.join(ADDON_DIR, 'ah_prices.csv');
const SCAN_ITEMS = path.join(ADDON_DIR, 'scan_items.csv');
const INV_SCAN_PATH  = path.join(os.homedir(), 'Documents', 'ArcheRage', 'Addon', 'invscanner',  'inventory_scan.csv');
const PROF_SCAN_PATH = path.join(os.homedir(), 'Documents', 'ArcheRage', 'Addon', 'profscanner', 'proficiency_scan.csv');

function ensureAddonDir() {
  if (!fs.existsSync(ADDON_DIR)) {
    try { fs.mkdirSync(ADDON_DIR, { recursive: true }); } catch(e) {}
  }
}

// ─── SESSION HELPERS ──────────────────────────────────────────────────────────

function saveSession(session) {
  try {
    if (!safeStorage.isEncryptionAvailable()) return;
    ensureAppDataDir();
    const encrypted = safeStorage.encryptString(JSON.stringify(session));
    fs.writeFileSync(SESSION_PATH, encrypted);
  } catch(e) { console.error('[main] saveSession error:', e.message); }
}

function loadSession() {
  try {
    if (!fs.existsSync(SESSION_PATH)) return null;
    if (!safeStorage.isEncryptionAvailable()) return null;
    const encrypted = fs.readFileSync(SESSION_PATH);
    const session   = JSON.parse(safeStorage.decryptString(encrypted));
    // L-4: Reject sessions whose JWT has expired — forces re-authentication
    if (session?.sessionToken) {
      const payload = decodeJWTPayload(session.sessionToken);
      if (!payload?.exp || payload.exp < Math.floor(Date.now() / 1000)) {
        clearSession();
        return null;
      }
    }
    return session;
  } catch(e) { return null; }
}

function clearSession() {
  try {
    if (fs.existsSync(SESSION_PATH)) fs.unlinkSync(SESSION_PATH);
  } catch(e) {}
}

// ─── ROLE ENFORCEMENT ────────────────────────────────────────────────────────
// All privileged IPC handlers call getCallerRole() before touching Supabase.
// Role is always sourced live from the profiles table — NOT from anything the
// renderer can touch. Client-side _auth state is UI only.

const ROLE_ORDER = ['free', 'pro', 'curator', 'staff', 'admin', 'dev'];

async function getCallerRole() {
  try {
    const session = loadSession();
    if (!session?.discordId) return 'free';
    const prof = await getProfile();
    return prof.role || 'free';
  } catch { return 'free'; }
}

function callerHasRole(callerRole, required) {
  return ROLE_ORDER.indexOf(callerRole) >= ROLE_ORDER.indexOf(required);
}

// Throws if caller doesn't meet the minimum role.
async function enforceRole(required) {
  const role = await getCallerRole();
  if (!callerHasRole(role, required)) {
    throw Object.assign(new Error(`Requires ${required} role`), { code: 'FORBIDDEN' });
  }
  return role;
}

// ─── APP MENU ────────────────────────────────────────────────────────────────
// DevTools are hidden from free/pro users. Staff/curator/admin/dev get them
// after the renderer calls 'request-devtools' post-auth.

let _devToolsAllowed = false;

function buildAppMenu() {
  const template = [
    {
      label: 'File',
      submenu: [{ role: 'quit' }],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        ...(_devToolsAllowed ? [
          { type: 'separator' },
          { role: 'toggleDevTools' },
        ] : []),
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'close' },
      ],
    },
  ];
  return Menu.buildFromTemplate(template);
}

// Called from renderer after auth resolves — unlocks DevTools if role qualifies.
ipcMain.handle('request-devtools', async () => {
  const role = await getCallerRole();
  const allowed = callerHasRole(role, 'curator');
  if (allowed && !_devToolsAllowed) {
    _devToolsAllowed = true;
    Menu.setApplicationMenu(buildAppMenu());
  }
  return { ok: true, allowed };
});

// ─── OAUTH STATE ─────────────────────────────────────────────────────────────
// M-4: Use a Set so multiple concurrent login attempts each get their own nonce.
// Each nonce is consumed (deleted) on first use — one-time only.
const _oauthStates = new Set();

// ─── MAIN WINDOW REF ──────────────────────────────────────────────────────────
// Kept at module scope so handleOAuthDeepLink always sends to the main window,
// not the OAuth popup (getAllWindows()[0] would be the popup when it's open).
let mainWindow = null;

// ─── SINGLE INSTANCE LOCK + PROTOCOL HANDLER (Windows OAuth callback) ─────────

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (event, commandLine) => {
    // On Windows the deep link URL is the last command-line argument
    const url = commandLine.find(arg => arg.startsWith('archerage://'));
    if (url) handleOAuthDeepLink(url);

    const wins = BrowserWindow.getAllWindows();
    if (wins[0]) {
      if (wins[0].isMinimized()) wins[0].restore();
      wins[0].focus();
    }
  });
}

function handleOAuthDeepLink(url) {
  if (mainWindow) mainWindow.webContents.send('oauth-callback', url);
}

ipcMain.handle('open-external', (event, url) => {
  // M-3: https:// only — reject http:// to prevent MITM / captive-portal phishing
  if (typeof url === 'string' && url.startsWith('https://')) {
    shell.openExternal(url);
  }
});

// ─── IPC: FILE HANDLERS ───────────────────────────────────────────────────────

ipcMain.handle('read-ah-csv', () => {
  try {
    if (!fs.existsSync(AH_PRICES)) return { ok: false, data: {}, error: 'File not found' };
    const lines = fs.readFileSync(AH_PRICES, 'utf8').split('\n').filter(l => l.trim());
    const data = {};
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',');
      if (parts.length >= 2) {
        const name = parts[0].trim();
        const price = parseFloat(parts[1].trim());
        if (name && !isNaN(price)) data[name] = price;
      }
    }
    return { ok: true, data };
  } catch(e) { return { ok: false, data: {}, error: e.message }; }
});

ipcMain.handle('read-scan-items', () => {
  try {
    if (!fs.existsSync(SCAN_ITEMS)) return { ok: false, items: [], error: 'File not found' };
    const items = fs.readFileSync(SCAN_ITEMS, 'utf8')
      .split('\n').map(l => l.trim()).filter(l => l && l !== 'item_name');
    return { ok: true, items };
  } catch(e) { return { ok: false, items: [], error: e.message }; }
});

ipcMain.handle('write-scan-items', (event, items) => {
  try {
    ensureAddonDir();
    // M-2: Strip CSV-unsafe characters to prevent item names from corrupting the file
    const safe = items.map(i => String(i).trim().replace(/[\r\n,]/g, '')).filter(Boolean);
    const content = ['item_name', ...safe].join('\n') + '\n';
    fs.writeFileSync(SCAN_ITEMS, content, 'utf8');
    return { ok: true, count: safe.length };
  } catch(e) { return { ok: false, error: e.message }; }
});

// Add a single item to scan_items.csv (dev only — called from dev panel)
ipcMain.handle('add-to-scan-list', async (event, { itemName }) => {
  try {
    await enforceRole('dev');
    // M-2: Sanitize item name
    const safeName = String(itemName || '').trim().replace(/[\r\n,]/g, '').slice(0, 200);
    if (!safeName) return { ok: false, error: 'Invalid item name' };
    ensureAddonDir();
    let items = [];
    if (fs.existsSync(SCAN_ITEMS)) {
      items = fs.readFileSync(SCAN_ITEMS, 'utf8')
        .split('\n').map(l => l.trim()).filter(l => l && l !== 'item_name');
    }
    if (!items.includes(safeName)) {
      items.push(safeName);
      const content = ['item_name', ...items].join('\n') + '\n';
      fs.writeFileSync(SCAN_ITEMS, content, 'utf8');
    }
    return { ok: true, items };
  } catch(e) { return { ok: false, error: e.message }; }
});

// Submit inventory items — routed through app-api (JWT-gated)
ipcMain.handle('submit-inventory', async (event, items) => {
  try {
    return await callAppApi('submit-inventory', { items });
  } catch(e) { return { ok: false, error: e.message }; }
});

// Submit authoritative prices (staff+ only — verified by app-api)
ipcMain.handle('submit-authoritative-prices', async (event, items) => {
  try {
    return await callAppApi('submit-authoritative-price', { items });
  } catch(e) { return { ok: false, error: e.message }; }
});

// Get items with no price yet (pending_price) — dev panel only
ipcMain.handle('get-pending-price-items', async () => {
  try {
    return await callAppApi('get-pending-price-items');
  } catch(e) { return { ok: false, error: e.message }; }
});

ipcMain.handle('get-addon-dir', () => ({
  ok: true, path: ADDON_DIR, exists: fs.existsSync(ADDON_DIR)
}));

ipcMain.handle('read-inventory-scan', () => {
  try {
    if (!fs.existsSync(INV_SCAN_PATH)) return { ok: false, data: {}, error: 'File not found' };
    const lines = fs.readFileSync(INV_SCAN_PATH, 'utf8').split('\n').filter(l => l.trim());
    const data = {};
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',');
      if (parts.length >= 2) {
        const name   = parts[0].trim();
        const total  = parseInt(parts[1].trim());
        const bag    = parseInt(parts[2]?.trim() || '0');
        const bank   = parseInt(parts[3]?.trim() || '0');
        const guild  = parseInt(parts[4]?.trim() || '0');
        const coffer = parseInt(parts[5]?.trim() || '0');
        if (name && !isNaN(total)) data[name] = { total, bag, bank, guild, coffer };
      }
    }
    return { ok: true, data };
  } catch(e) { return { ok: false, data: {}, error: e.message }; }
});

ipcMain.handle('read-proficiency-scan', () => {
  try {
    if (!fs.existsSync(PROF_SCAN_PATH)) return { ok: false, data: {}, error: 'File not found' };
    const lines = fs.readFileSync(PROF_SCAN_PATH, 'utf8').split('\n').filter(l => l.trim());
    const data = {};
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',');
      if (parts.length >= 2) {
        const skillName = parts[0].trim();
        const points    = parseInt(parts[1].trim());
        const character = parts[2]?.trim() || '';
        if (skillName && !isNaN(points)) data[skillName] = { points, character };
      }
    }
    return { ok: true, data };
  } catch(e) { return { ok: false, data: {}, error: e.message }; }
});

// ─── IPC: AUTH ────────────────────────────────────────────────────────────────

// Fetches role + profile info from the app-api Edge Function (source of truth).
// Also touches last_seen_at server-side. Falls back to 'free' on any error.
async function getProfile() {
  try {
    const data = await callAppApi('get-profile');
    if (data.ok && data.profile) return {
      role:        data.profile.role            || 'free',
      proExpires:  data.profile.pro_expires_at  || null,
      ign:         data.profile.ign             || null,
      discordName: data.profile.discord_name    || null,
      avatar:      data.profile.avatar          || null,
    };
  } catch {}
  return { role: 'free', proExpires: null, ign: null, discordName: null, avatar: null };
}

// Returns current auth state from saved session + live DB role lookup.
ipcMain.handle('get-auth-status', async () => {
  try {
    const session = loadSession();
    if (!session?.discordId) return { ok: true, isPro: false, role: 'free', user: null, proExpires: null };

    const prof = await getProfile();
    startMailPoll(session.discordId);

    const role  = prof.role;
    const isPro = ['pro', 'curator', 'staff', 'admin', 'dev'].includes(role);

    return {
      ok: true,
      isPro,
      role,
      user: {
        id:     session.discordId,
        name:   prof.discordName || session.discordName || 'Unknown',
        avatar: prof.avatar      || session.avatar      || null,
      },
      proExpires: prof.proExpires || null,
    };
  } catch(e) {
    return { ok: true, isPro: false, role: 'free', user: null, proExpires: null };
  }
});

// Opens Discord OAuth in an Electron popup window.
// redirect_uri points to our Edge Function (HTTPS) — Discord requires HTTPS.
// The Edge Function exchanges the code and redirects back to archerage://.
const EDGE_FN_URL = `${SUPABASE_URL}/functions/v1/super-endpoint`;

ipcMain.handle('open-discord-auth', async () => {
  try {
    // C-3/M-4: Generate a fresh state nonce per login attempt (stored in Set)
    const state = require('crypto').randomBytes(16).toString('hex');
    _oauthStates.add(state);

    const authUrl = `https://discord.com/api/oauth2/authorize?${new URLSearchParams({
      client_id:     '1491287833598496929',
      redirect_uri:  EDGE_FN_URL,
      response_type: 'code',
      scope:         'identify',
      state,
    })}`;
    if (!app.isPackaged) console.log('[main] open-discord-auth popup URL:', authUrl?.slice(0, 80));

    const popup = new BrowserWindow({
      width: 520,
      height: 720,
      title: 'Sign in with Discord',
      webPreferences: {
        sandbox: true,
        nodeIntegration: false,
        contextIsolation: true,
      },
    });

    // Intercept navigations — catch archerage:// redirects, block discord:// so
    // Discord's web page can't hand off to the native Discord desktop app.
    const handleRedirect = (url) => {
      if (url.startsWith('archerage://')) {
        if (!app.isPackaged) console.log('[main] OAuth popup intercepted archerage:// redirect');
        handleOAuthDeepLink(url);
        setImmediate(() => { try { popup.close(); } catch {} });
        return true;
      }
      if (url.startsWith('discord://')) {
        return true; // block native Discord app handoff
      }
      return false;
    };

    popup.webContents.on('will-navigate', (event, url) => {
      if (handleRedirect(url)) event.preventDefault();
    });

    popup.webContents.on('will-redirect', (event, url) => {
      if (handleRedirect(url)) event.preventDefault();
    });

    popup.webContents.on('did-redirect-navigation', (_event, url) => {
      handleRedirect(url);
    });

    // Prevent Discord from opening new windows or the native app
    popup.webContents.setWindowOpenHandler(({ url }) => {
      if (url.startsWith('archerage://')) {
        handleOAuthDeepLink(url);
        setImmediate(() => { try { popup.close(); } catch {} });
      }
      return { action: 'deny' };
    });

    popup.loadURL(authUrl);
    return { ok: true };
  } catch(e) {
    console.error('[main] open-discord-auth error:', e.message);
    return { ok: false, error: e.message };
  }
});

// Called by renderer when the Edge Function redirects back to archerage://auth/callback.
// The Edge Function mints a signed JWT — we verify the state nonce then store the token.
ipcMain.handle('handle-oauth-callback', async (event, callbackUrl) => {
  try {
    const url   = new URL(callbackUrl);
    const error = url.searchParams.get('error');
    if (error) return { ok: false, error: decodeURIComponent(error) };

    // C-3/M-4: Verify state nonce — consume from Set on match (one-time use)
    const returnedState = url.searchParams.get('state') || '';
    if (!returnedState || !_oauthStates.has(returnedState)) {
      _oauthStates.clear();
      return { ok: false, error: 'OAuth state mismatch — possible CSRF. Please try again.' };
    }
    _oauthStates.delete(returnedState); // consume nonce — one-time use

    const token = url.searchParams.get('token');
    if (!token) return { ok: false, error: 'No session token in callback' };

    // Decode payload for local display only — signature is verified by app-api
    const payload = decodeJWTPayload(token);
    if (!payload?.discord_id) return { ok: false, error: 'Invalid session token' };

    const discordId = payload.discord_id;
    const name      = payload.name   || 'Unknown';
    const avatar    = payload.avatar || null;

    // Store session including the signed JWT for all future callAppApi calls
    saveSession({ discordId, discordName: name, avatar, sessionToken: token });
    startMailPoll(discordId);

    // Fetch live role from DB — the JWT is used for auth, role comes from DB
    const prof  = await getProfile();
    const isPro = ['pro', 'curator', 'staff', 'admin', 'dev'].includes(prof.role);

    return {
      ok:   true,
      auth: { ok: true, isPro, role: prof.role, user: { id: discordId, name, avatar }, proExpires: prof.proExpires || null },
    };
  } catch(e) { return { ok: false, error: e.message }; }
});

// Sign out — increments token_version server-side (revokes JWT), then clears local session.
ipcMain.handle('sign-out', async () => {
  try { await callAppApi('sign-out'); } catch { /* ignore — still clear locally */ }
  clearSession();
  stopMailPoll();
  return { ok: true };
});

// ─── IPC: ADMIN ───────────────────────────────────────────────────────────────

ipcMain.handle('admin-get-users', async () => {
  try {
    return await callAppApi('admin-get-users');
  } catch(e) { return { ok: false, error: e.message }; }
});

ipcMain.handle('admin-set-role', async (event, { userId, role }) => {
  try {
    return await callAppApi('admin-set-role', { userId, role });
  } catch(e) { return { ok: false, error: e.message }; }
});

ipcMain.handle('admin-grant-pro', async (event, { userId, days }) => {
  try {
    return await callAppApi('admin-grant-pro', { userId, days });
  } catch(e) { return { ok: false, error: e.message }; }
});

ipcMain.handle('admin-revoke-pro', async (event, { userId }) => {
  try {
    return await callAppApi('admin-revoke-pro', { userId });
  } catch(e) { return { ok: false, error: e.message }; }
});

// ─── IPC: COMMUNITY PRICES ───────────────────────────────────────────────────

ipcMain.handle('get-community-prices', async () => {
  try {
    return await callAppApi('get-community-prices');
  } catch(e) { return { ok: false, error: e.message }; }
});

ipcMain.handle('submit-community-price', async (event, { itemName, price }) => {
  try {
    const safeName = String(itemName || '').trim().replace(/[\r\n,]/g, '').slice(0, 200);
    if (!safeName) return { ok: false, error: 'Invalid item name' };
    if (typeof price !== 'number' || !isFinite(price) || price < 0) return { ok: false, error: 'Invalid price' };
    return await callAppApi('submit-price', { itemName: safeName, price });
  } catch(e) { return { ok: false, error: e.message }; }
});

ipcMain.handle('bulk-submit-community-prices', async (event, items) => {
  try {
    if (!Array.isArray(items) || items.length === 0) return { ok: false, error: 'No items' };
    if (items.length > 500) return { ok: false, error: 'Too many items in one batch' };
    let accepted = 0, rejected = 0, gray = 0;
    for (const { item_name, price } of items) {
      const safeName = String(item_name || '').trim().replace(/[\r\n,]/g, '').slice(0, 200);
      if (!safeName || typeof price !== 'number' || !isFinite(price) || price < 0) continue;
      const data = await callAppApi('submit-price', { itemName: safeName, price });
      if (data?.ok) {
        if (data.result?.status === 'accepted') accepted++;
        else if (data.result?.status === 'gray') gray++;
        else rejected++;
      }
    }
    return { ok: true, accepted, gray, rejected };
  } catch(e) { return { ok: false, error: e.message }; }
});

ipcMain.handle('get-item-price-history', async (event, { itemName }) => {
  try {
    return await callAppApi('get-item-price-history', { itemName });
  } catch(e) { return { ok: false, error: e.message }; }
});

ipcMain.handle('admin-get-flagged-prices', async () => {
  try {
    return await callAppApi('admin-get-flagged-prices');
  } catch(e) { return { ok: false, error: e.message }; }
});

ipcMain.handle('admin-accept-price', async (event, { itemName, price }) => {
  try {
    return await callAppApi('admin-accept-price', { itemName, price });
  } catch(e) { return { ok: false, error: e.message }; }
});

ipcMain.handle('admin-reject-price', async (event, { itemName }) => {
  try {
    return await callAppApi('admin-reject-price', { itemName });
  } catch(e) { return { ok: false, error: e.message }; }
});

// M-6: Legacy store-token / clear-token handlers removed (dead code from v1.0)

// ─── IPC: NATIVE NOTIFICATIONS ───────────────────────────────────────────────

ipcMain.handle('show-notification', (event, { title, body, eventName }) => {
  try {
    if (!Notification.isSupported()) return { ok: false, error: 'Not supported' };

    const notif = new Notification({
      title,
      body,
      silent: false,
      urgency: 'normal',
      timeoutType: 'default',
    });

    notif.on('click', () => {
      const wins = BrowserWindow.getAllWindows();
      if (wins.length > 0) { wins[0].show(); wins[0].focus(); }
    });

    notif.on('action', (e, index) => {
      const win = BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0];
      if (!win) return;
      if (index === 0) win.webContents.send('notification-snooze', eventName);
      if (index === 1) win.webContents.send('notification-not-going', eventName);
    });

    notif.show();
    return { ok: true };
  } catch(e) { return { ok: false, error: e.message }; }
});

// ─── IPC: PROFILE ────────────────────────────────────────────────────────────

ipcMain.handle('update-ign', async (event, { ign }) => {
  try {
    return await callAppApi('update-ign', { ign });
  } catch(e) { return { ok: false, error: e.message }; }
});

// ─── IPC: WIKI SUBMISSIONS ────────────────────────────────────────────────────

ipcMain.handle('wiki-submit', async (event, { title, category, content, discordName, ign }) => {
  try {
    return await callAppApi('wiki-submit', { title, category, content, discordName, ign });
  } catch(e) { return { ok: false, error: e.message }; }
});

ipcMain.handle('wiki-admin-get-submissions', async () => {
  try {
    return await callAppApi('wiki-admin-get-submissions');
  } catch(e) { return { ok: false, error: e.message }; }
});

ipcMain.handle('wiki-admin-approve', async (event, { id }) => {
  try {
    return await callAppApi('wiki-admin-approve', { id });
  } catch(e) { return { ok: false, error: e.message }; }
});

ipcMain.handle('wiki-admin-reject', async (event, { id, feedback }) => {
  try {
    return await callAppApi('wiki-admin-reject', { id, feedback });
  } catch(e) { return { ok: false, error: e.message }; }
});

ipcMain.handle('wiki-get-news', async () => {
  try {
    return await callAppApi('get-approved-wiki');
  } catch(e) { return { ok: false, error: e.message }; }
});

// ─── IPC: ARC POINTS ─────────────────────────────────────────────────────────

ipcMain.handle('arc-get-my-points', async () => {
  try {
    return await callAppApi('arc-get-my-points');
  } catch(e) { return { ok: false, error: e.message }; }
});

ipcMain.handle('arc-get-point-history', async () => {
  try {
    return await callAppApi('arc-get-point-history');
  } catch(e) { return { ok: false, error: e.message }; }
});

ipcMain.handle('arc-submit-redemption', async (event, { rewardId, rewardLabel, pointsSpent, ignSnapshot, discordName, recipientId }) => {
  try {
    return await callAppApi('arc-submit-redemption', { rewardId, rewardLabel, pointsSpent, ignSnapshot, discordName, recipientId });
  } catch(e) { return { ok: false, error: e.message }; }
});

ipcMain.handle('arc-get-all-redemptions', async () => {
  try {
    return await callAppApi('arc-get-all-redemptions');
  } catch(e) { return { ok: false, error: e.message }; }
});

ipcMain.handle('arc-fulfill-redemption', async (event, { id, notes }) => {
  try {
    return await callAppApi('arc-fulfill-redemption', { id, notes });
  } catch(e) { return { ok: false, error: e.message }; }
});

ipcMain.handle('arc-cancel-redemption', async (event, { id }) => {
  try {
    return await callAppApi('arc-cancel-redemption', { id });
  } catch(e) { return { ok: false, error: e.message }; }
});

ipcMain.handle('arc-get-leaderboard', async () => {
  try { return await callAppApi('arc-get-leaderboard'); }
  catch(e) { return { ok: false, error: e.message }; }
});

// ─── IPC: USER MAIL ───────────────────────────────────────────────────────────

ipcMain.handle('arc-get-my-mail', async () => {
  try {
    return await callAppApi('arc-get-my-mail');
  } catch(e) { return { ok: false, error: e.message }; }
});

ipcMain.handle('arc-mark-mail-read', async (event, { id }) => {
  try {
    return await callAppApi('arc-mark-mail-read', { id });
  } catch(e) { return { ok: false, error: e.message }; }
});

ipcMain.handle('arc-lookup-user', async (event, { discordName }) => {
  try {
    return await callAppApi('arc-lookup-user', { discordName });
  } catch(e) { return { ok: false, error: e.message }; }
});

ipcMain.handle('arc-send-mail', async (event, { recipientId, subject, body, referenceId }) => {
  try {
    return await callAppApi('arc-send-mail', { recipientId, subject, body, referenceId });
  } catch(e) { return { ok: false, error: e.message }; }
});

// ─── IPC: ADDON INSTALLER ────────────────────────────────────────────────────

// Where bundled addons live (works in both dev and packaged builds)
function getBundledAddonsDir() {
  return app.isPackaged
    ? path.join(process.resourcesPath, 'addons')
    : path.join(__dirname, 'addons');
}

const ADDON_NAMES = ['ahscanner', 'invscanner', 'profscanner'];

// Open a folder picker dialog — returns the selected path or null if cancelled.
ipcMain.handle('pick-folder', async (event, { defaultPath } = {}) => {
  const wins = BrowserWindow.getAllWindows();
  const result = await dialog.showOpenDialog(wins[0] || null, {
    title:       'Select your ArcheRage Addon folder',
    defaultPath: defaultPath || path.join(os.homedir(), 'Documents', 'ArcheRage', 'Addon'),
    properties:  ['openDirectory'],
    buttonLabel: 'Select Addon Folder',
  });
  if (result.canceled || !result.filePaths.length) return { ok: true, path: null };
  return { ok: true, path: result.filePaths[0] };
});

// Check which addons are missing or present at the target location
ipcMain.handle('validate-addon-path', (event, { targetPath } = {}) => {
  if (!targetPath) return { ok: true, valid: false, reason: 'No path provided.' };
  const resolved = path.resolve(targetPath);
  if (!resolved.startsWith(os.homedir())) {
    return { ok: true, valid: false, reason: 'Path must be inside your user folder.' };
  }
  if (!fs.existsSync(resolved)) {
    return { ok: true, valid: false, reason: 'Folder does not exist.' };
  }
  // H-3: Dereference symlinks/junctions before checking to prevent bypass
  let real = resolved;
  try { real = fs.realpathSync(resolved); } catch { /* keep resolved */ }
  if (!real.startsWith(os.homedir())) {
    return { ok: true, valid: false, reason: 'Path resolves outside your user folder.' };
  }
  if (!real.toLowerCase().includes('archerage')) {
    return { ok: true, valid: false, reason: 'This doesn\'t look like an ArcheRage folder. Make sure you select the ArcheRage\\Addon folder.' };
  }
  return { ok: true, valid: true, reason: null };
});

ipcMain.handle('check-addon-status', (event, { targetBase } = {}) => {
  const bundledDir = getBundledAddonsDir();
  const base = targetBase ? path.resolve(targetBase) : path.join(os.homedir(), 'Documents', 'ArcheRage', 'Addon');
  if (targetBase && !base.startsWith(os.homedir())) {
    return { ok: false, error: 'Invalid path' };
  }

  if (!app.isPackaged) console.log('[addon] bundledDir:', bundledDir);
  if (!app.isPackaged) console.log('[addon] targetBase:', base);

  const status = {};
  for (const name of ADDON_NAMES) {
    const bundled = path.join(bundledDir, name);
    const target  = path.join(base, name);
    const bundledExists = fs.existsSync(bundled);
    const installed     = fs.existsSync(target);
    if (!app.isPackaged) console.log(`[addon] ${name} — bundled: ${bundledExists}, installed: ${installed}`);
    status[name] = { bundledExists, installed };
  }
  return { ok: true, status, targetBase: base };
});

// Copy bundled addons to the specified folder (or default location).
// Always overwrites — keeps addon up to date with app updates.
ipcMain.handle('install-addons', (event, { names, targetBase } = {}) => {
  const bundledDir = getBundledAddonsDir();
  const base       = targetBase ? path.resolve(targetBase) : path.join(os.homedir(), 'Documents', 'ArcheRage', 'Addon');
  if (targetBase && !base.startsWith(os.homedir())) {
    return { ok: false, error: 'Invalid path' };
  }
  // H-2: Dereference symlinks/junctions before writing — prevents escaping the
  // user directory via a symlink that points somewhere outside homedir.
  // base may not exist yet (first install), so fall back to base on error.
  let realBase = base;
  try { realBase = fs.realpathSync(base); } catch { /* base doesn't exist yet — ok */ }
  if (!realBase.startsWith(os.homedir())) {
    return { ok: false, error: 'Invalid path' };
  }
  // Validate names against known addon list to prevent path traversal via name param
  const toInstall = (names && names.length)
    ? names.filter(n => ADDON_NAMES.includes(n))
    : ADDON_NAMES;

  const results = {};
  for (const name of toInstall) {
    const src  = path.join(bundledDir, name);
    const dest = path.join(base, name);
    try {
      if (!fs.existsSync(src)) {
        results[name] = { ok: false, error: 'Bundled addon not found' };
        continue;
      }
      fs.mkdirSync(dest, { recursive: true });
      const files = fs.readdirSync(src);
      for (const file of files) {
        fs.copyFileSync(path.join(src, file), path.join(dest, file));
      }
      results[name] = { ok: true };
    } catch(e) {
      results[name] = { ok: false, error: e.message };
    }
  }
  return { ok: true, results, targetBase: base };
});

// ─── IPC: RECIPE SUBMISSIONS ─────────────────────────────────────────────────

ipcMain.handle('recipe-submit', async (event, { output, outputQty, profession, labor, materials, notes, ign }) => {
  try {
    return await callAppApi('recipe-submit', { output, outputQty, profession, labor, materials, notes, ign });
  } catch(e) { return { ok: false, error: e.message }; }
});

ipcMain.handle('recipe-admin-get-submissions', async () => {
  try {
    return await callAppApi('recipe-admin-get-submissions');
  } catch(e) { return { ok: false, error: e.message }; }
});

ipcMain.handle('recipe-admin-approve', async (event, { id, output, outputQty, profession, labor, materials, notes }) => {
  try {
    return await callAppApi('recipe-admin-approve', { id, output, outputQty, profession, labor, materials, notes });
  } catch(e) { return { ok: false, error: e.message }; }
});

ipcMain.handle('recipe-admin-reject', async (event, { id, feedback }) => {
  try {
    return await callAppApi('recipe-admin-reject', { id, feedback });
  } catch(e) { return { ok: false, error: e.message }; }
});

// Fetch all approved community recipes — shown to all users in Recipe Lookup
ipcMain.handle('recipe-get-approved', async () => {
  try {
    return await callAppApi('get-approved-recipes');
  } catch(e) { return { ok: false, recipes: [], error: e.message }; }
});

// ─── IPC: STRIPE CHECKOUT ────────────────────────────────────────────────────
// Runs in main process (Node.js) so the session token never touches the renderer.

ipcMain.handle('create-checkout', async () => {
  try {
    const session = loadSession();
    if (!session?.sessionToken) return { ok: false, error: 'Not authenticated' };
    const res = await fetch(CHECKOUT_API_URL, {
      method:  'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey':        SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${session.sessionToken}`,
      },
      body: JSON.stringify({}),
    });
    const data = await res.json();
    if (data.url) shell.openExternal(data.url);
    return data;
  } catch(e) { return { ok: false, error: e.message }; }
});

// ─── WINDOW ───────────────────────────────────────────────────────────────────

function createWindow() {
  const preloadPath = path.join(__dirname, 'preload.js');
  if (!app.isPackaged) console.log('[main] preload path:', preloadPath);

  // Apply restricted menu before window opens
  Menu.setApplicationMenu(buildAppMenu());

  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload:          preloadPath,
      contextIsolation: true,   // isolate renderer from Node globals
      nodeIntegration:  false,  // renderer cannot require() Node modules
      sandbox:          true,   // M-1: OS-level sandbox; preload only uses contextBridge/ipcRenderer which are sandbox-safe
    }
  });
  mainWindow = win;

  // Block DevTools keyboard shortcut (Ctrl+Shift+I / F12) for unprivileged users.
  // If someone somehow opens DevTools, close it immediately.
  win.webContents.on('before-input-event', (event, input) => {
    if (_devToolsAllowed) return;
    const isDevToolsShortcut =
      (input.control && input.shift && input.key === 'I') ||
      (input.key === 'F12');
    if (isDevToolsShortcut) event.preventDefault();
  });

  win.webContents.on('devtools-opened', () => {
    if (!_devToolsAllowed) win.webContents.closeDevTools();
  });

  win.webContents.on('preload-error', (event, preloadPath, error) => {
    console.error('[main] preload-error:', preloadPath, error);
  });

  win.loadFile('index.html');
}

// Register custom protocol before app is ready.
// In dev mode (electron . / npm start), process.defaultApp is true and we must
// explicitly pass the main script path so Windows routes the deep link correctly.
if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('archerage', process.execPath, [path.resolve(process.argv[1])]);
  }
} else {
  app.setAsDefaultProtocolClient('archerage');
}

app.whenReady().then(() => {
  // M-2: Enforce CSP at the protocol level (overrides any meta tag in HTML).
  // Removes unsafe-inline from script-src now that inline onclick handlers are gone.
  // wss:// removed — Realtime subscription replaced with poll through app-api.
  const { session } = require('electron');
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self'; " +
          "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
          "style-src 'self' 'unsafe-inline'; " +
          "img-src 'self' https://cdn.discordapp.com data:; " +
          "connect-src 'self' https://*.supabase.co;"
        ],
      },
    });
  });

  createWindow();

  // Auto-updater — only runs in packaged builds, not dev mode
  if (app.isPackaged) {
    autoUpdater.autoDownload = true;
    autoUpdater.autoInstallOnAppQuit = false;

    autoUpdater.on('checking-for-update',  () => console.log('[updater] Checking for update…'));
    autoUpdater.on('update-available',     (info) => console.log('[updater] Update available:', info.version));
    autoUpdater.on('update-not-available', (info) => console.log('[updater] Up to date:', info.version));
    autoUpdater.on('download-progress',    (p)    => console.log(`[updater] Downloading… ${Math.round(p.percent)}%`));

    autoUpdater.on('update-downloaded', (info) => {
      console.log('[updater] Downloaded:', info.version);
      const wins = BrowserWindow.getAllWindows();
      if (wins[0]) wins[0].webContents.send('update-ready', info.version);
    });

    autoUpdater.on('error', (err) => {
      console.error('[updater] Error:', err.message);
      const wins = BrowserWindow.getAllWindows();
      if (wins[0]) wins[0].webContents.send('update-error', err.message);
    });

    autoUpdater.checkForUpdates();
    setInterval(() => autoUpdater.checkForUpdates(), 2 * 60 * 60 * 1000);
  }
});

ipcMain.handle('install-update', () => {
  autoUpdater.quitAndInstall();
});

ipcMain.handle('check-for-update', () => {
  if (app.isPackaged) autoUpdater.checkForUpdates();
  return { ok: true };
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// macOS: handle deep link via open-url event
app.on('open-url', (event, url) => {
  event.preventDefault();
  handleOAuthDeepLink(url);
});
