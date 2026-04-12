const { app, BrowserWindow, ipcMain, Notification, safeStorage, shell, dialog } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const fs   = require('fs');
const os   = require('os');
const { createClient } = require('@supabase/supabase-js');

// ─── SUPABASE CLIENT ──────────────────────────────────────────────────────────
const SUPABASE_URL      = 'https://ywkyhtvfdbtybevggonb.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_vLgj1WUM3-mws4c-ahwDWQ_xUmfjRPF';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ─── REALTIME: USER MAIL ──────────────────────────────────────────────────────
let _mailChannel = null;

function setupRealtimeMail(userId) {
  if (_mailChannel) { supabase.removeChannel(_mailChannel); _mailChannel = null; }
  if (!userId) return;

  _mailChannel = supabase
    .channel(`user-mail-${userId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'user_mail',
      filter: `recipient_id=eq.${userId}`,
    }, (payload) => {
      const wins = BrowserWindow.getAllWindows();
      if (wins[0]) wins[0].webContents.send('arc-new-mail', payload.new);
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

// Derive app-level auth state from a Supabase session object.
// role defaults to 'free' until backend assigns it via user_metadata or a DB lookup.
function sessionToAuthState(session) {
  if (!session?.user) return { ok: true, isPro: false, role: 'free', user: null, proExpires: null };
  const meta = session.user.user_metadata || {};
  const role  = meta.role || 'free';
  const isPro = ['pro', 'curator', 'staff', 'admin', 'dev'].includes(role);
  return {
    ok: true,
    isPro,
    role,
    user: {
      id:     session.user.id,
      name:   meta.full_name || meta.name || session.user.email || 'Unknown',
      avatar: meta.avatar_url || null,
    },
    proExpires: meta.pro_expires || null,
  };
}

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
  console.log('[main] OAuth deep link:', url);
  const wins = BrowserWindow.getAllWindows();
  if (wins[0]) wins[0].webContents.send('oauth-callback', url);
}

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
async function getProfile(userId) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('role, pro_expires_at')
      .eq('id', userId)
      .single();
    if (!error && data) return { role: data.role || 'free', proExpires: data.pro_expires_at || null };
  } catch {}
  return { role: 'free', proExpires: null };
}

// Updates last_seen_at in profiles.
async function touchProfile(userId) {
  try {
    await supabase.from('profiles').update({ last_seen_at: new Date().toISOString() }).eq('id', userId);
  } catch {}
}

// Returns current auth state — checks saved session first, then Supabase.
// Role is sourced from the profiles table, not user_metadata.
ipcMain.handle('get-auth-status', async () => {
  try {
    const saved = loadSession();
    if (saved) {
      const { data, error } = await supabase.auth.setSession(saved);
      if (!error && data.session) {
        saveSession(data.session);
        setupRealtimeMail(data.session.user.id);
        const base  = sessionToAuthState(data.session);
        const prof  = await getProfile(data.session.user.id);
        touchProfile(data.session.user.id);
        return { ...base, role: prof.role, isPro: ['pro','curator','staff','admin','dev'].includes(prof.role), proExpires: prof.proExpires };
      }
      clearSession();
    }
    return { ok: true, isPro: false, role: 'free', user: null, proExpires: null };
  } catch(e) {
    console.error('[main] get-auth-status error:', e.message);
    return { ok: true, isPro: false, role: 'free', user: null, proExpires: null };
  }
});

// Opens Discord OAuth URL in the system browser.
ipcMain.handle('open-discord-auth', async () => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: {
        redirectTo: 'archerage://auth/callback',
        skipBrowserRedirect: true,
        scopes: 'identify',
      },
    });
    if (error) return { ok: false, error: error.message };
    await shell.openExternal(data.url);
    return { ok: true };
  } catch(e) { return { ok: false, error: e.message }; }
});

// Called by renderer when it receives the archerage:// deep link.
// Extracts tokens from the URL and saves the session.
ipcMain.handle('handle-oauth-callback', async (event, callbackUrl) => {
  try {
    const url = new URL(callbackUrl);

    // Supabase returns tokens in the hash fragment: #access_token=...&refresh_token=...
    const hash   = url.hash.slice(1); // strip leading #
    const params = new URLSearchParams(hash);

    const accessToken  = params.get('access_token');
    const refreshToken = params.get('refresh_token');

    if (!accessToken || !refreshToken) {
      return { ok: false, error: 'No tokens in callback URL' };
    }

    const { data, error } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
    if (error) return { ok: false, error: error.message };

    saveSession(data.session);
    setupRealtimeMail(data.session.user.id);
    const base = sessionToAuthState(data.session);
    const prof = await getProfile(data.session.user.id);
    touchProfile(data.session.user.id);
    return { ok: true, auth: { ...base, role: prof.role, isPro: ['pro','curator','staff','admin','dev'].includes(prof.role), proExpires: prof.proExpires } };
  } catch(e) { return { ok: false, error: e.message }; }
});

// Sign out — clears Supabase session and saved session file.
ipcMain.handle('sign-out', async () => {
  try {
    await supabase.auth.signOut();
    clearSession();
    return { ok: true };
  } catch(e) { return { ok: false, error: e.message }; }
});

// ─── IPC: ADMIN ───────────────────────────────────────────────────────────────

ipcMain.handle('admin-get-users', async () => {
  try {
    const { data, error } = await supabase.rpc('admin_get_users');
    if (error) return { ok: false, error: error.message };
    return { ok: true, users: data };
  } catch(e) { return { ok: false, error: e.message }; }
});

ipcMain.handle('admin-set-role', async (event, { userId, role }) => {
  try {
    const { error } = await supabase.rpc('admin_set_role', { target_id: userId, new_role: role });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch(e) { return { ok: false, error: e.message }; }
});

ipcMain.handle('admin-grant-pro', async (event, { userId, days }) => {
  try {
    const { error } = await supabase.rpc('admin_grant_pro', { target_id: userId, days });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch(e) { return { ok: false, error: e.message }; }
});

ipcMain.handle('admin-revoke-pro', async (event, { userId }) => {
  try {
    const { error } = await supabase.rpc('admin_revoke_pro', { target_id: userId });
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
    const { data, error } = await supabase.rpc('admin_get_flagged_prices');
    if (error) return { ok: false, error: error.message };
    return { ok: true, items: data || [] };
  } catch(e) { return { ok: false, error: e.message }; }
});

ipcMain.handle('admin-accept-price', async (event, { itemName, price }) => {
  try {
    const { error } = await supabase.rpc('admin_accept_price', { p_item_name: itemName, p_price: price });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch(e) { return { ok: false, error: e.message }; }
});

ipcMain.handle('admin-reject-price', async (event, { itemName }) => {
  try {
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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: 'Not authenticated' };
    const { error } = await supabase.from('profiles').update({ ign }).eq('id', user.id);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch(e) { return { ok: false, error: e.message }; }
});

// ─── IPC: WIKI SUBMISSIONS ────────────────────────────────────────────────────

ipcMain.handle('wiki-submit', async (event, { title, category, content, discordName, ign }) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: 'Not authenticated' };
    const { error } = await supabase.from('wiki_submissions').insert({
      submitted_by: user.id,
      title, category, content,
      discord_name: discordName || null,
      ign: ign || null,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch(e) { return { ok: false, error: e.message }; }
});

ipcMain.handle('wiki-admin-get-submissions', async () => {
  try {
    const { data, error } = await supabase.rpc('admin_get_wiki_submissions');
    if (error) return { ok: false, error: error.message };
    return { ok: true, submissions: data || [] };
  } catch(e) { return { ok: false, error: e.message }; }
});

ipcMain.handle('wiki-admin-approve', async (event, { id }) => {
  try {
    const { error } = await supabase.from('wiki_submissions')
      .update({ status: 'approved', reviewed_at: new Date().toISOString() })
      .eq('id', id);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch(e) { return { ok: false, error: e.message }; }
});

ipcMain.handle('wiki-admin-reject', async (event, { id, feedback }) => {
  try {
    const { error } = await supabase.from('wiki_submissions')
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
    const { data, error } = await supabase.rpc('get_my_points');
    if (error) return { ok: false, error: error.message };
    return { ok: true, points: data || 0 };
  } catch(e) { return { ok: false, error: e.message }; }
});

ipcMain.handle('arc-get-point-history', async () => {
  try {
    const { data, error } = await supabase.rpc('get_my_point_history');
    if (error) return { ok: false, error: error.message };
    return { ok: true, history: data || [] };
  } catch(e) { return { ok: false, error: e.message }; }
});

ipcMain.handle('arc-submit-redemption', async (event, { rewardId, rewardLabel, pointsSpent, ignSnapshot, discordName, recipientId }) => {
  try {
    const { error } = await supabase.from('arc_redemptions').insert({
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
    const { data, error } = await supabase.rpc('get_pending_redemptions');
    if (error) return { ok: false, error: error.message };
    return { ok: true, redemptions: data || [] };
  } catch(e) { return { ok: false, error: e.message }; }
});

ipcMain.handle('arc-fulfill-redemption', async (event, { id, notes }) => {
  try {
    const { error } = await supabase.from('arc_redemptions')
      .update({ status: 'fulfilled', notes: notes || null, fulfilled_at: new Date().toISOString() })
      .eq('id', id);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch(e) { return { ok: false, error: e.message }; }
});

ipcMain.handle('arc-cancel-redemption', async (event, { id }) => {
  try {
    const { error } = await supabase.from('arc_redemptions')
      .update({ status: 'cancelled' })
      .eq('id', id);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch(e) { return { ok: false, error: e.message }; }
});

// ─── IPC: USER MAIL ───────────────────────────────────────────────────────────

ipcMain.handle('arc-get-my-mail', async () => {
  try {
    const { data, error } = await supabase
      .from('user_mail')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) return { ok: false, error: error.message };
    return { ok: true, mail: data || [] };
  } catch(e) { return { ok: false, error: e.message }; }
});

ipcMain.handle('arc-mark-mail-read', async (event, { id }) => {
  try {
    const { error } = await supabase
      .from('user_mail')
      .update({ is_read: true })
      .eq('id', id);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch(e) { return { ok: false, error: e.message }; }
});

ipcMain.handle('arc-lookup-user', async (event, { discordName }) => {
  try {
    const { data, error } = await supabase.rpc('lookup_user_by_discord', { p_name: discordName });
    if (error) return { ok: false, error: error.message };
    return { ok: true, user: data?.[0] || null };
  } catch(e) { return { ok: false, error: e.message }; }
});

ipcMain.handle('arc-send-mail', async (event, { recipientId, subject, body, referenceId }) => {
  try {
    const { error } = await supabase.from('user_mail').insert({
      recipient_id: recipientId,
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
  const base = targetBase || path.join(os.homedir(), 'Documents', 'ArcheRage', 'Addon');

  const status = {};
  for (const name of ADDON_NAMES) {
    const bundled = path.join(bundledDir, name);
    const target  = path.join(base, name);
    status[name] = {
      bundledExists: fs.existsSync(bundled),
      installed:     fs.existsSync(target),
    };
  }
  return { ok: true, status, targetBase: base };
});

// Copy bundled addons to the specified folder (or default location).
// Always overwrites — keeps addon up to date with app updates.
ipcMain.handle('install-addons', (event, { names, targetBase } = {}) => {
  const bundledDir = getBundledAddonsDir();
  const base       = targetBase || path.join(os.homedir(), 'Documents', 'ArcheRage', 'Addon');
  const toInstall  = (names && names.length) ? names : ADDON_NAMES;

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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: 'Not authenticated' };
    const { error } = await supabase.from('recipe_submissions').insert({
      submitted_by: user.id,
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
    const { data, error } = await supabase.rpc('admin_get_recipe_submissions');
    if (error) return { ok: false, error: error.message };
    return { ok: true, submissions: data || [] };
  } catch(e) { return { ok: false, error: e.message }; }
});

ipcMain.handle('recipe-admin-approve', async (event, { id, output, outputQty, profession, labor, materials, notes }) => {
  try {
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
    const { error } = await supabase.from('recipe_submissions')
      .update({ status: 'rejected', feedback: feedback || null, reviewed_at: new Date().toISOString() })
      .eq('id', id);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch(e) { return { ok: false, error: e.message }; }
});

// ─── WINDOW ───────────────────────────────────────────────────────────────────

function createWindow() {
  const preloadPath = path.join(__dirname, 'preload.js');
  console.log('[main] preload path:', preloadPath);

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
    autoUpdater.checkForUpdates();

    // Check every 2 hours
    setInterval(() => autoUpdater.checkForUpdates(), 2 * 60 * 60 * 1000);

    autoUpdater.on('update-downloaded', (info) => {
      const wins = BrowserWindow.getAllWindows();
      if (wins[0]) wins[0].webContents.send('update-ready', info.version);
    });

    autoUpdater.on('error', (err) => {
      console.error('[updater] Error:', err.message);
    });
  }
});

ipcMain.handle('install-update', () => {
  autoUpdater.quitAndInstall();
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
