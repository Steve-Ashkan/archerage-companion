// C-2: Use contextBridge to expose a safe, explicit API surface to the renderer.
// The renderer cannot access Node.js or Electron internals directly.
try {
  const { contextBridge, ipcRenderer } = require('electron');

  contextBridge.exposeInMainWorld('electronAPI', {
    // ── Shell ─────────────────────────────────────────────────────────────
    openExternal: (url) => ipcRenderer.invoke('open-external', url),

    // ── File I/O ──────────────────────────────────────────────────────────
    readAHCsv:         ()      => ipcRenderer.invoke('read-ah-csv'),
    readScanItems:     ()      => ipcRenderer.invoke('read-scan-items'),
    writeScanItems:    (items) => ipcRenderer.invoke('write-scan-items', items),
    getAddonDir:       ()      => ipcRenderer.invoke('get-addon-dir'),
    readInventoryScan: ()      => ipcRenderer.invoke('read-inventory-scan'),

    // ── Auth ──────────────────────────────────────────────────────────────
    getAuthStatus:       ()    => ipcRenderer.invoke('get-auth-status'),
    openDiscordAuth:     ()    => ipcRenderer.invoke('open-discord-auth'),
    handleOAuthCallback: (url) => ipcRenderer.invoke('handle-oauth-callback', url),
    signOut:             ()    => ipcRenderer.invoke('sign-out'),

    // Listen for OAuth deep link callback sent from main process
    onOAuthCallback: (cb) => {
      ipcRenderer.removeAllListeners('oauth-callback');
      ipcRenderer.once('oauth-callback', (e, url) => cb(url));
    },

    // ── Community Prices ──────────────────────────────────────────────────
    getCommunityPrices:         ()               => ipcRenderer.invoke('get-community-prices'),
    submitCommunityPrice:       (itemName, price) => ipcRenderer.invoke('submit-community-price', { itemName, price }),
    bulkSubmitCommunityPrices:  (items)          => ipcRenderer.invoke('bulk-submit-community-prices', items),
    getItemPriceHistory:        (itemName)       => ipcRenderer.invoke('get-item-price-history', { itemName }),
    adminGetFlaggedPrices:      ()               => ipcRenderer.invoke('admin-get-flagged-prices'),
    adminAcceptPrice:           (itemName, price) => ipcRenderer.invoke('admin-accept-price', { itemName, price }),
    adminRejectPrice:           (itemName)       => ipcRenderer.invoke('admin-reject-price', { itemName }),

    // ── Admin ─────────────────────────────────────────────────────────────
    adminGetUsers:  ()                     => ipcRenderer.invoke('admin-get-users'),
    adminSetRole:   (userId, role)         => ipcRenderer.invoke('admin-set-role',  { userId, role }),
    adminGrantPro:  (userId, days)         => ipcRenderer.invoke('admin-grant-pro', { userId, days }),
    adminRevokePro: (userId)               => ipcRenderer.invoke('admin-revoke-pro', { userId }),

    // ── Native Windows Notification ───────────────────────────────────────
    showNotification: (opts) => ipcRenderer.invoke('show-notification', opts),

    onNotificationSnooze:   (cb) => ipcRenderer.on('notification-snooze',    (e, name) => cb(name)),
    onNotificationNotGoing: (cb) => ipcRenderer.on('notification-not-going', (e, name) => cb(name)),

    // ── ARC Points ────────────────────────────────────────────────────────
    arcGetMyPoints:       ()      => ipcRenderer.invoke('arc-get-my-points'),
    arcGetPointHistory:   ()      => ipcRenderer.invoke('arc-get-point-history'),
    arcSubmitRedemption:  (opts)  => ipcRenderer.invoke('arc-submit-redemption', opts),
    arcGetAllRedemptions: ()      => ipcRenderer.invoke('arc-get-all-redemptions'),
    arcLookupUser:        (name)  => ipcRenderer.invoke('arc-lookup-user', { discordName: name }),
    arcFulfillRedemption: (opts)  => ipcRenderer.invoke('arc-fulfill-redemption', opts),
    arcCancelRedemption:  (id)    => ipcRenderer.invoke('arc-cancel-redemption', { id }),

    // ── User Mail ─────────────────────────────────────────────────────────
    arcGetMyMail:    ()     => ipcRenderer.invoke('arc-get-my-mail'),
    arcMarkMailRead: (id)   => ipcRenderer.invoke('arc-mark-mail-read', { id }),
    arcSendMail:     (opts) => ipcRenderer.invoke('arc-send-mail', opts),

    onNewMail: (cb) => ipcRenderer.on('arc-new-mail', (e, mail) => cb(mail)),

    // ── Profile ───────────────────────────────────────────────────────────
    updateIgn: (ign) => ipcRenderer.invoke('update-ign', { ign }),

    // ── Wiki Submissions ──────────────────────────────────────────────────
    wikiSubmit:              (opts) => ipcRenderer.invoke('wiki-submit', opts),
    wikiAdminGetSubmissions: ()     => ipcRenderer.invoke('wiki-admin-get-submissions'),
    wikiAdminApprove:        (id)   => ipcRenderer.invoke('wiki-admin-approve', { id }),
    wikiAdminReject:         (opts) => ipcRenderer.invoke('wiki-admin-reject', opts),
    wikiGetNews:             ()     => ipcRenderer.invoke('wiki-get-news'),

    // ── Addon Installer ───────────────────────────────────────────────────
    pickFolder:        (opts) => ipcRenderer.invoke('pick-folder', opts),
    checkAddonStatus:  (opts) => ipcRenderer.invoke('check-addon-status', opts),
    validateAddonPath: (opts) => ipcRenderer.invoke('validate-addon-path', opts),
    installAddons:     (opts) => ipcRenderer.invoke('install-addons', opts),

    // ── Recipe Submissions ────────────────────────────────────────────────
    recipeSubmit:       (opts) => ipcRenderer.invoke('recipe-submit', opts),
    recipeAdminGet:     ()     => ipcRenderer.invoke('recipe-admin-get-submissions'),
    recipeAdminApprove: (opts) => ipcRenderer.invoke('recipe-admin-approve', opts),
    recipeAdminReject:  (opts) => ipcRenderer.invoke('recipe-admin-reject', opts),
    recipeGetApproved:  ()     => ipcRenderer.invoke('recipe-get-approved'),

    // ── Crowdsourced Prices / Inventory ───────────────────────────────────
    addToScanList:             (itemName) => ipcRenderer.invoke('add-to-scan-list', { itemName }),
    submitInventory:           (items)    => ipcRenderer.invoke('submit-inventory', items),
    submitAuthoritativePrices: (items)    => ipcRenderer.invoke('submit-authoritative-prices', items),
    getPendingPriceItems:      ()         => ipcRenderer.invoke('get-pending-price-items'),

    // ── Stripe Checkout ───────────────────────────────────────────────────
    // Runs through main process — session token never exposed to renderer
    createCheckout: () => ipcRenderer.invoke('create-checkout'),

    // ── DevTools ──────────────────────────────────────────────────────────
    requestDevTools: () => ipcRenderer.invoke('request-devtools'),

    // ── Auto-updater ──────────────────────────────────────────────────────
    installUpdate:  ()   => ipcRenderer.invoke('install-update'),
    checkForUpdate: ()   => ipcRenderer.invoke('check-for-update'),
    onUpdateReady:  (cb) => ipcRenderer.on('update-ready', (e, version) => cb(version)),
    onUpdateError:  (cb) => ipcRenderer.on('update-error', (e, msg)     => cb(msg)),
  });

  console.log('[preload] electronAPI loaded OK');

} catch(e) {
  console.error('[preload] FAILED to load electronAPI:', e.message);
}
