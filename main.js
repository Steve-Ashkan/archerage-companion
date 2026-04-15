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

// Service role — for privileged writes and user-specific reads.
// This key bypasses RLS. main.js is the trusted process so this is acceptable.
// Get from: Supabase dashboard → Settings → API → service_role (secret)
const SUPABASE_SERVICE_KEY = 'sb_secret_dL11QnulhY6R7um5JyYI1Q_Q92_w-Br';
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// ─── REALTIME: USER MAIL ──────────────────────────────────────────────────────
let _mailChannel = null;

function setupRealtimeMail(discordId) {
  if (_mailChannel) { supabase.removeChannel(_mailChannel); _mailChannel = null; }
  if (!discordId) return;

  _mailChannel = supabase
    .channel(`user-mail-${discordId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'user_mail',
      filter: `recipient_discord_id=eq.${discordId}`,
    }, (payload) => {
      if (mainWindow) mainWindow.webContents.send('arc-new-mail', payload.new);
    })
    .subscribe();
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
const INV_SCAN_PATH = path.join(os.homedir(), 'Documents', 'ArcheRage', 'Addon', 'invscanner', 'inventory_scan.csv');

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
    return JSON.parse(safeStorage.decryptString(encrypted));
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
    const prof = await getProfile(session.discordId);
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
    console.log('[main] second-instance fired. args:', commandLine);
    // On Windows the deep link URL is the last command-line argument
    const url = commandLine.find(arg => arg.startsWith('archerage://'));
    console.log('[main] deep link url found:', url || 'NONE');
    if (url) handleOAuthDeepLink(url);

    const wins = BrowserWindow.getAllWindows();
    if (wins[0]) {
      if (wins[0].isMinimized()) wins[0].restore();
      wins[0].focus();
    }
  });
}

function handleOAuthDeepLink(url) {
  console.log('[main] OAuth deep link:', url);
  if (mainWindow) mainWindow.webContents.send('oauth-callback', url);
}

ipcMain.handle('open-external', (event, url) => {
  if (typeof url === 'string' && (url.startsWith('https://') || url.startsWith('http://'))) {
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
    const content = ['item_name', ...items.map(i => String(i).trim())].join('\n') + '\n';
    fs.writeFileSync(SCAN_ITEMS, content, 'utf8');
    return { ok: true, count: items.length };
  } catch(e) { return { ok: false, error: e.message }; }
});

// Add a single item to scan_items.csv (dev only — called from dev panel)
ipcMain.handle('add-to-scan-list', async (event, { itemName }) => {
  try {
    await enforceRole('dev');
    ensureAddonDir();
    let items = [];
    if (fs.existsSync(SCAN_ITEMS)) {
      items = fs.readFileSync(SCAN_ITEMS, 'utf8')
        .split('\n').map(l => l.trim()).filter(l => l && l !== 'item_name');
    }
    if (!items.includes(itemName)) {
      items.push(itemName);
      const content = ['item_name', ...items].join('\n') + '\n';
      fs.writeFileSync(SCAN_ITEMS, content, 'utf8');
    }
    return { ok: true, items };
  } catch(e) { return { ok: false, error: e.message }; }
});

// Submit inventory items to Supabase (runs for all users silently)
ipcMain.handle('submit-inventory', async (event, items) => {
  try {
    const { data, error } = await supabase.rpc('submit_inventory', { p_items: items });
    if (error) return { ok: false, error: error.message };
    return { ok: true, result: data };
  } catch(e) { return { ok: false, error: e.message }; }
});

// Submit authoritative prices (staff+ only — server-verified before writing)
ipcMain.handle('submit-authoritative-prices', async (event, items) => {
  try {
    await enforceRole('staff');
    let pushed = 0;
    for (const { item_name, price } of items) {
      const { error } = await supabase.rpc('submit_authoritative_price', {
        p_item_name: item_name,
        p_price:     price,
      });
      if (!error) pushed++;
    }
    return { ok: true, pushed };
  } catch(e) { return { ok: false, error: e.message }; }
});

// Get items with no price yet (pending_price) — dev panel only
ipcMain.handle('get-pending-price-items', async () => {
  try {
    await enforceRole('dev');
    const { data, error } = await supabase.rpc('get_pending_price_items');
    if (error) return { ok: false, error: error.message };
    return { ok: true, items: data || [] };
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

// ─── IPC: AUTH ────────────────────────────────────────────────────────────────

// Fetches role + pro_expires_at from profiles table (source of truth).
// Falls back to 'free' on any error.
async function getProfile(discordId) {
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('role, pro_expires_at, ign, discord_name, avatar')
      .eq('discord_id', discordId)
      .single();
    if (!error && data) return {
      role:       data.role        || 'free',
      proExpires: data.pro_expires_at || null,
      ign:        data.ign         || null,
      discordName: data.discord_name || null,
      avatar:     data.avatar      || null,
    };
  } catch {}
  return { role: 'free', proExpires: null, ign: null, discordName: null, avatar: null };
}

// Updates last_seen_at in profiles.
async function touchProfile(discordId) {
  try {
    await supabaseAdmin.from('profiles').update({ last_seen_at: new Date().toISOString() }).eq('discord_id', discordId);
  } catch {}
}

// Returns current auth state from saved session + live DB role lookup.
ipcMain.handle('get-auth-status', async () => {
  try {
    const session = loadSession();
    if (!session?.discordId) return { ok: true, isPro: false, role: 'free', user: null, proExpires: null };

    const prof = await getProfile(session.discordId);
    touchProfile(session.discordId);
    setupRealtimeMail(session.discordId);

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
    console.error('[main] get-auth-status error:', e.message);
    return { ok: true, isPro: false, role: 'free', user: null, proExpires: null };
  }
});

// Opens Discord OAuth in an Electron popup window.
// redirect_uri points to our Edge Function (HTTPS) — Discord requires HTTPS.
// The Edge Function exchanges the code and redirects back to archerage://.
const EDGE_FN_URL = `${SUPABASE_URL}/functions/v1/super-endpoint`;

ipcMain.handle('open-discord-auth', async () => {
  try {
    const authUrl = `https://discord.com/api/oauth2/authorize?${new URLSearchParams({
      client_id:     '1491287833598496929',
      redirect_uri:  EDGE_FN_URL,
      response_type: 'code',
      scope:         'identify',
    })}`;
    console.log('[main] open-discord-auth popup URL:', authUrl?.slice(0, 120));

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
        console.log('[main] OAuth popup intercepted archerage:// redirect:', url.slice(0, 120));
        handleOAuthDeepLink(url);
        setImmediate(() => { try { popup.close(); } catch {} });
        return true;
      }
      if (url.startsWith('discord://')) {
        console.log('[main] OAuth popup blocked discord:// navigation (keeping auth in popup)');
        return true; // block it
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
// The Edge Function already exchanged the code — we just receive identity params.
ipcMain.handle('handle-oauth-callback', async (event, callbackUrl) => {
  try {
    console.log('[main] handle-oauth-callback URL:', callbackUrl);
    const url       = new URL(callbackUrl);
    const error     = url.searchParams.get('error');
    if (error) return { ok: false, error: decodeURIComponent(error) };

    const discordId = url.searchParams.get('discord_id');
    const name      = url.searchParams.get('name')   || 'Unknown';
    const avatar    = url.searchParams.get('avatar') || null;

    if (!discordId) {
      console.error('[main] No discord_id in callback URL:', callbackUrl);
      return { ok: false, error: 'No discord_id in callback' };
    }

    // Save minimal session — no tokens, no email
    saveSession({ discordId, discordName: name, avatar: avatar || null });
    setupRealtimeMail(discordId);
    touchProfile(discordId);

    // Fetch live role from DB — never trust URL params for role
    const prof  = await getProfile(discordId);
    const isPro = ['pro', 'curator', 'staff', 'admin', 'dev'].includes(prof.role);

    return {
      ok:   true,
      auth: {
        ok:         true,
        isPro,
        role:       prof.role,
        user:       { id: discordId, name, avatar: avatar || null },
        proExpires: prof.proExpires || null,
      },
    };
  } catch(e) { return { ok: false, error: e.message }; }
});

// Sign out — clears local session. No Supabase Auth session to revoke.
ipcMain.handle('sign-out', () => {
  clearSession();
  setupRealtimeMail(null);
  return { ok: true };
});

// ─── IPC: ADMIN ───────────────────────────────────────────────────────────────

ipcMain.handle('admin-get-users', async () => {
  try {
    await enforceRole('admin');
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('discord_id, discord_name, avatar, role, ign, pro_expires_at, last_seen_at')
      .order('last_seen_at', { ascending: false });
    if (error) return { ok: false, error: error.message };
    // Map to shape devPanel expects: id = discord_id, avatar_url = avatar
    const users = (data || []).map(u => ({
      id:            u.discord_id,
      discord_name:  u.discord_name,
      avatar_url:    u.avatar,
      role:          u.role,
      ign:           u.ign,
      pro_expires_at: u.pro_expires_at,
      last_seen_at:  u.last_seen_at,
    }));
    return { ok: true, users };
  } catch(e) { return { ok: false, error: e.message }; }
});

ipcMain.handle('admin-set-role', async (event, { userId, role }) => {
  // userId is discord_id
  try {
    await enforceRole('admin');
    const { error } = await supabaseAdmin.from('profiles').update({ role }).eq('discord_id', userId);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch(e) { return { ok: false, error: e.message }; }
});

ipcMain.handle('admin-grant-pro', async (event, { userId, days }) => {
  // userId is discord_id
  try {
    await enforceRole('admin');
    const expires = new Date();
    expires.setDate(expires.getDate() + parseInt(days, 10));
    const { error } = await supabaseAdmin.from('profiles')
      .update({ role: 'pro', pro_expires_at: expires.toISOString() })
      .eq('discord_id', userId);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch(e) { return { ok: false, error: e.message }; }
});

ipcMain.handle('admin-revoke-pro', async (event, { userId }) => {
  // userId is discord_id
  try {
    await enforceRole('admin');
    const { error } = await supabaseAdmin.from('profiles')
      .update({ role: 'free', pro_expires_at: null })
      .eq('discord_id', userId);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch(e) { return { ok: false, error: e.message }; }
});

// ─── IPC: COMMUNITY PRICES ───────────────────────────────────────────────────

ipcMain.handle('get-community-prices', async () => {
  try {
    const { data, error } = await supabase.rpc('get_community_prices');
    if (error) return { ok: false, error: error.message };
    const prices = {};
    for (const row of (data || [])) {
      prices[row.item_name] = { price: row.price, updatedAt: row.updated_at };
    }
    return { ok: true, prices };
  } catch(e) { return { ok: false, error: e.message }; }
});

ipcMain.handle('submit-community-price', async (event, { itemName, price }) => {
  try {
    const { data, error } = await supabase.rpc('submit_price', { p_item_name: itemName, p_price: price });
    if (error) return { ok: false, error: error.message };
    return { ok: true, result: data };
  } catch(e) { return { ok: false, error: e.message }; }
});

ipcMain.handle('bulk-submit-community-prices', async (event, items) => {
  try {
    if (!Array.isArray(items) || items.length === 0) return { ok: false, error: 'No items' };
    let accepted = 0, rejected = 0, gray = 0;
    for (const { item_name, price } of items) {
      const { data, error } = await supabase.rpc('submit_price', { p_item_name: item_name, p_price: price });
      if (!error && data) {
        if (data.status === 'accepted') accepted++;
        else if (data.status === 'gray') gray++;
        else rejected++;
      }
    }
    return { ok: true, accepted, gray, rejected };
  } catch(e) { return { ok: false, error: e.message }; }
});

ipcMain.handle('get-item-price-history', async (event, { itemName }) => {
  try {
    const { data, error } = await supabase.rpc('get_item_price_history', { p_item_name: itemName });
    if (error) return { ok: false, error: error.message };
    return { ok: true, history: data || [] };
  } catch(e) { return { ok: false, error: e.message }; }
});

ipcMain.handle('admin-get-flagged-prices', async () => {
  try {
    await enforceRole('staff');
    const { data, error } = await supabase.rpc('admin_get_flagged_prices');
    if (error) return { ok: false, error: error.message };
    return { ok: true, items: data || [] };
  } catch(e) { return { ok: false, error: e.message }; }
});

ipcMain.handle('admin-accept-price', async (event, { itemName, price }) => {
  try {
    await enforceRole('staff');
    const { error } = await supabase.rpc('admin_accept_price', { p_item_name: itemName, p_price: price });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch(e) { return { ok: false, error: e.message }; }
});

ipcMain.handle('admin-reject-price', async (event, { itemName }) => {
  try {
    await enforceRole('staff');
    const { error } = await supabase.rpc('admin_reject_price', { p_item_name: itemName });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch(e) { return { ok: false, error: e.message }; }
});

// Legacy token handlers kept for compatibility
ipcMain.handle('store-token', (event, token) => {
  try {
    if (typeof token !== 'string' || token.length === 0 || token.length > 8192) {
      return { ok: false, error: 'Invalid token' };
    }
    if (!safeStorage.isEncryptionAvailable()) return { ok: false, error: 'safeStorage unavailable' };
    ensureAppDataDir();
    const encrypted = safeStorage.encryptString(token);
    fs.writeFileSync(path.join(APP_DATA_DIR, '.auth'), encrypted);
    return { ok: true };
  } catch(e) { return { ok: false, error: e.message }; }
});

ipcMain.handle('clear-token', () => {
  clearSession();
  return { ok: true };
});

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
    const session = loadSession();
    if (!session?.discordId) return { ok: false, error: 'Not authenticated' };
    const { error } = await supabaseAdmin.from('profiles').update({ ign }).eq('discord_id', session.discordId);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch(e) { return { ok: false, error: e.message }; }
});

// ─── IPC: WIKI SUBMISSIONS ────────────────────────────────────────────────────

ipcMain.handle('wiki-submit', async (event, { title, category, content, discordName, ign }) => {
  try {
    const session = loadSession();
    if (!session?.discordId) return { ok: false, error: 'Not authenticated' };
    const { error } = await supabaseAdmin.from('wiki_submissions').insert({
      submitter_discord_id: session.discordId,
      title, category, content,
      discord_name: discordName || null,
      ign:          ign         || null,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch(e) { return { ok: false, error: e.message }; }
});

ipcMain.handle('wiki-admin-get-submissions', async () => {
  try {
    await enforceRole('curator');
    const { data, error } = await supabase.rpc('admin_get_wiki_submissions');
    if (error) return { ok: false, error: error.message };
    return { ok: true, submissions: data || [] };
  } catch(e) { return { ok: false, error: e.message }; }
});

ipcMain.handle('wiki-admin-approve', async (event, { id }) => {
  try {
    await enforceRole('curator');
    const { error } = await supabaseAdmin.from('wiki_submissions')
      .update({ status: 'approved', reviewed_at: new Date().toISOString() })
      .eq('id', id);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch(e) { return { ok: false, error: e.message }; }
});

ipcMain.handle('wiki-admin-reject', async (event, { id, feedback }) => {
  try {
    await enforceRole('curator');
    const { error } = await supabaseAdmin.from('wiki_submissions')
      .update({ status: 'rejected', feedback: feedback || null, reviewed_at: new Date().toISOString() })
      .eq('id', id);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch(e) { return { ok: false, error: e.message }; }
});

ipcMain.handle('wiki-get-news', async () => {
  try {
    const { data, error } = await supabase.rpc('get_approved_wiki_articles');
    if (error) return { ok: false, error: error.message };
    return { ok: true, articles: data || [] };
  } catch(e) { return { ok: false, error: e.message }; }
});

// ─── IPC: ARC POINTS ─────────────────────────────────────────────────────────

ipcMain.handle('arc-get-my-points', async () => {
  try {
    const session = loadSession();
    if (!session?.discordId) return { ok: true, points: 0 };
    const { data, error } = await supabaseAdmin.rpc('get_my_points', { p_discord_id: session.discordId });
    if (error) return { ok: false, error: error.message };
    return { ok: true, points: data || 0 };
  } catch(e) { return { ok: false, error: e.message }; }
});

ipcMain.handle('arc-get-point-history', async () => {
  try {
    const session = loadSession();
    if (!session?.discordId) return { ok: true, history: [] };
    const { data, error } = await supabaseAdmin.rpc('get_my_point_history', { p_discord_id: session.discordId });
    if (error) return { ok: false, error: error.message };
    return { ok: true, history: data || [] };
  } catch(e) { return { ok: false, error: e.message }; }
});

ipcMain.handle('arc-submit-redemption', async (event, { rewardId, rewardLabel, pointsSpent, ignSnapshot, discordName, recipientId }) => {
  try {
    // discord_id comes from the verified session — never trust the client to supply it
    const session = loadSession();
    if (!session?.discordId) return { ok: false, error: 'Not authenticated' };
    const { error } = await supabaseAdmin.from('arc_redemptions').insert({
      discord_id:   session.discordId,
      reward_id:    rewardId,
      reward_label: rewardLabel,
      points_spent: pointsSpent,
      ign_snapshot: ignSnapshot || null,
      discord_name: discordName || null,
      recipient_id: recipientId || null,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch(e) { return { ok: false, error: e.message }; }
});

ipcMain.handle('arc-get-all-redemptions', async () => {
  try {
    await enforceRole('admin');
    const { data, error } = await supabase.rpc('get_pending_redemptions');
    if (error) return { ok: false, error: error.message };
    return { ok: true, redemptions: data || [] };
  } catch(e) { return { ok: false, error: e.message }; }
});

ipcMain.handle('arc-fulfill-redemption', async (event, { id, notes }) => {
  try {
    await enforceRole('admin');
    const { error } = await supabaseAdmin.from('arc_redemptions')
      .update({ status: 'fulfilled', notes: notes || null, fulfilled_at: new Date().toISOString() })
      .eq('id', id);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch(e) { return { ok: false, error: e.message }; }
});

ipcMain.handle('arc-cancel-redemption', async (event, { id }) => {
  try {
    await enforceRole('admin');
    const { error } = await supabaseAdmin.from('arc_redemptions')
      .update({ status: 'cancelled' })
      .eq('id', id);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch(e) { return { ok: false, error: e.message }; }
});

// ─── IPC: USER MAIL ───────────────────────────────────────────────────────────

ipcMain.handle('arc-get-my-mail', async () => {
  try {
    const session = loadSession();
    if (!session?.discordId) return { ok: true, mail: [] };
    const { data, error } = await supabaseAdmin
      .from('user_mail')
      .select('*')
      .eq('recipient_discord_id', session.discordId)
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) return { ok: false, error: error.message };
    return { ok: true, mail: data || [] };
  } catch(e) { return { ok: false, error: e.message }; }
});

ipcMain.handle('arc-mark-mail-read', async (event, { id }) => {
  try {
    const session = loadSession();
    if (!session?.discordId) return { ok: false, error: 'Not authenticated' };
    const { error } = await supabaseAdmin
      .from('user_mail')
      .update({ is_read: true })
      .eq('id', id)
      .eq('recipient_discord_id', session.discordId); // only own mail
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch(e) { return { ok: false, error: e.message }; }
});

ipcMain.handle('arc-lookup-user', async (event, { discordName }) => {
  try {
    await enforceRole('staff');
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('discord_id, discord_name, role, ign')
      .ilike('discord_name', discordName)
      .limit(5);
    if (error) return { ok: false, error: error.message };
    // Map to shape devPanel expects: id = discord_id
    const user = data?.[0] ? { id: data[0].discord_id, ...data[0] } : null;
    return { ok: true, user };
  } catch(e) { return { ok: false, error: e.message }; }
});

ipcMain.handle('arc-send-mail', async (event, { recipientId, subject, body, referenceId }) => {
  try {
    // Sending mail requires staff+; sender is set from the verified session
    await enforceRole('staff');
    const session = loadSession();
    const { error } = await supabaseAdmin.from('user_mail').insert({
      sender_discord_id:    session?.discordId || null,
      recipient_discord_id: recipientId,
      subject,
      body,
      reference_id: referenceId || null,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch(e) { return { ok: false, error: e.message }; }
});

// ─── IPC: ADDON INSTALLER ────────────────────────────────────────────────────

// Where bundled addons live (works in both dev and packaged builds)
function getBundledAddonsDir() {
  return app.isPackaged
    ? path.join(process.resourcesPath, 'addons')
    : path.join(__dirname, 'addons');
}

const ADDON_NAMES = ['ahscanner', 'invscanner'];

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
ipcMain.handle('check-addon-status', (event, { targetBase } = {}) => {
  const bundledDir = getBundledAddonsDir();
  const base = targetBase ? path.resolve(targetBase) : path.join(os.homedir(), 'Documents', 'ArcheRage', 'Addon');
  if (targetBase && !base.startsWith(os.homedir())) {
    return { ok: false, error: 'Invalid path' };
  }

  console.log('[addon] bundledDir:', bundledDir);
  console.log('[addon] targetBase:', base);

  const status = {};
  for (const name of ADDON_NAMES) {
    const bundled = path.join(bundledDir, name);
    const target  = path.join(base, name);
    const bundledExists = fs.existsSync(bundled);
    const installed     = fs.existsSync(target);
    console.log(`[addon] ${name} — bundled: ${bundledExists} (${bundled}), installed: ${installed} (${target})`);
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
    const session = loadSession();
    if (!session?.discordId) return { ok: false, error: 'Not authenticated' };
    const { error } = await supabaseAdmin.from('recipe_submissions').insert({
      submitter_discord_id: session.discordId,
      output,
      output_qty:   outputQty || 1,
      profession:   profession || null,
      labor:        labor || 0,
      materials:    materials || [],
      notes:        notes || null,
      ign:          ign || null,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch(e) { return { ok: false, error: e.message }; }
});

ipcMain.handle('recipe-admin-get-submissions', async () => {
  try {
    await enforceRole('curator');
    const { data, error } = await supabase.rpc('admin_get_recipe_submissions');
    if (error) return { ok: false, error: error.message };
    return { ok: true, submissions: data || [] };
  } catch(e) { return { ok: false, error: e.message }; }
});

ipcMain.handle('recipe-admin-approve', async (event, { id, output, outputQty, profession, labor, materials, notes }) => {
  try {
    await enforceRole('curator');
    const { error } = await supabase.from('recipe_submissions')
      .update({
        status:      'approved',
        output,
        output_qty:  outputQty,
        profession,
        labor,
        materials,
        notes:       notes || null,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch(e) { return { ok: false, error: e.message }; }
});

ipcMain.handle('recipe-admin-reject', async (event, { id, feedback }) => {
  try {
    await enforceRole('curator');
    const { error } = await supabase.from('recipe_submissions')
      .update({ status: 'rejected', feedback: feedback || null, reviewed_at: new Date().toISOString() })
      .eq('id', id);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch(e) { return { ok: false, error: e.message }; }
});

// Fetch all approved community recipes — shown to all users in Recipe Lookup
ipcMain.handle('recipe-get-approved', async () => {
  try {
    const { data, error } = await supabase
      .from('recipe_submissions')
      .select('id, output, output_qty, profession, labor, materials, notes')
      .eq('status', 'approved')
      .order('reviewed_at', { ascending: false });
    if (error) return { ok: false, recipes: [] };
    return { ok: true, recipes: data || [] };
  } catch(e) { return { ok: false, recipes: [] }; }
});

// ─── WINDOW ───────────────────────────────────────────────────────────────────

function createWindow() {
  const preloadPath = path.join(__dirname, 'preload.js');
  console.log('[main] preload path:', preloadPath);

  // Apply restricted menu before window opens
  Menu.setApplicationMenu(buildAppMenu());

  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: preloadPath,
      nodeIntegration: true,
      contextIsolation: false,
      sandbox: false,
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
