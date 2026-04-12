try {
  const { ipcRenderer } = require('electron');

  window.electronAPI = {
    // ── File I/O ──────────────────────────────────────────────────────────
    readAHCsv:         ()      => ipcRenderer.invoke('read-ah-csv'),
    readScanItems:     ()      => ipcRenderer.invoke('read-scan-items'),
    writeScanItems:    (items) => ipcRenderer.invoke('write-scan-items', items),
    getAddonDir:       ()      => ipcRenderer.invoke('get-addon-dir'),
    readInventoryScan: ()      => ipcRenderer.invoke('read-inventory-scan'),

    // ── Auth / Token Storage ──────────────────────────────────────────────
    // Session is encrypted by the OS via safeStorage — never stored raw.
    getAuthStatus:       ()    => ipcRenderer.invoke('get-auth-status'),
    openDiscordAuth:     ()    => ipcRenderer.invoke('open-discord-auth'),
    handleOAuthCallback: (url) => ipcRenderer.invoke('handle-oauth-callback', url),
    signOut:             ()    => ipcRenderer.invoke('sign-out'),
    // Legacy
    storeToken: (token) => ipcRenderer.invoke('store-token', token),
    clearToken: ()      => ipcRenderer.invoke('clear-token'),

    // Listen for OAuth deep link callback sent from main process
    onOAuthCallback: (cb) => ipcRenderer.on('oauth-callback', (e, url) => cb(url)),

    // ── Community Prices ──────────────────────────────────────────────────────
    getCommunityPrices:         ()               => ipcRenderer.invoke('get-community-prices'),
    submitCommunityPrice:       (itemName, price)=> ipcRenderer.invoke('submit-community-price', { itemName, price }),
    bulkSubmitCommunityPrices:  (items)          => ipcRenderer.invoke('bulk-submit-community-prices', items),
    getItemPriceHistory:        (itemName)       => ipcRenderer.invoke('get-item-price-history', { itemName }),
    adminGetFlaggedPrices:      ()               => ipcRenderer.invoke('admin-get-flagged-prices'),
    adminAcceptPrice:           (itemName, price)=> ipcRenderer.invoke('admin-accept-price', { itemName, price }),
    adminRejectPrice:           (itemName)       => ipcRenderer.invoke('admin-reject-price', { itemName }),

    // ── Admin ─────────────────────────────────────────────────────────────────
    adminGetUsers:  ()                     => ipcRenderer.invoke('admin-get-users'),
    adminSetRole:   (userId, role)         => ipcRenderer.invoke('admin-set-role',  { userId, role }),
    adminGrantPro:  (userId, days)         => ipcRenderer.invoke('admin-grant-pro', { userId, days }),
    adminRevokePro: (userId)               => ipcRenderer.invoke('admin-revoke-pro', { userId }),

    // ── Native Windows Notification ───────────────────────────────────────
    showNotification: (opts) => ipcRenderer.invoke('show-notification', opts),

    // Listen for snooze/not-going responses from notification clicks
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

    // Realtime — fires instantly when Ashkan sends mail
    onNewMail: (cb) => ipcRenderer.on('arc-new-mail', (e, mail) => cb(mail)),

    // ── Profile ───────────────────────────────────────────────────────────
    updateIgn: (ign) => ipcRenderer.invoke('update-ign', { ign }),

    // ── Wiki Submissions ──────────────────────────────────────────────────
    wikiSubmit:           (opts) => ipcRenderer.invoke('wiki-submit', opts),
    wikiAdminGetSubmissions: ()  => ipcRenderer.invoke('wiki-admin-get-submissions'),
    wikiAdminApprove:     (id)   => ipcRenderer.invoke('wiki-admin-approve', { id }),
    wikiAdminReject:      (opts) => ipcRenderer.invoke('wiki-admin-reject', opts),
    wikiGetNews:          ()     => ipcRenderer.invoke('wiki-get-news'),

    // ── Addon Installer ───────────────────────────────────────────────────
    checkAddonStatus: ()      => ipcRenderer.invoke('check-addon-status'),
    installAddons:    (names) => ipcRenderer.invoke('install-addons', names),

    // ── Recipe Submissions ────────────────────────────────────────────────
    recipeSubmit:           (opts) => ipcRenderer.invoke('recipe-submit', opts),
    recipeAdminGet:         ()     => ipcRenderer.invoke('recipe-admin-get-submissions'),
    recipeAdminApprove:     (opts) => ipcRenderer.invoke('recipe-admin-approve', opts),
    recipeAdminReject:      (opts) => ipcRenderer.invoke('recipe-admin-reject', opts),

    // ── Auto-updater ──────────────────────────────────────────────────────
    installUpdate:  ()   => ipcRenderer.invoke('install-update'),
    onUpdateReady:  (cb) => ipcRenderer.on('update-ready', (e, version) => cb(version)),
  };

  console.log('[preload] electronAPI loaded OK');

} catch(e) {
  console.error('[preload] FAILED to load electronAPI:', e.message);
  window.electronAPI = null;
}