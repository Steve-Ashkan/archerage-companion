# ArcheRage Companion App — Claude Code Briefing

## Who I'm talking to
- **Ashkan** — the developer and ArcheRage player building this app
- Casual, direct conversation style — not overly formal
- He knows what he wants, thinks in product terms, great instincts
- He plays on **ArcheRage** private server (not retail ArcheAge)
- In-game character name: **Ashkan**

---

## What This Project Is

A desktop **Electron app** (companion tool) for the ArcheRage private server. It replaces a Google Sheets workflow with a proper app. Ashkan has permission from the server owner **Sparkle** to monetize it.

The app has:
- Crafting calculators (Erenor Cloak, Erenor Crafts, Erenor Upgrading, Hiram, Library, Akash, Ipnysh, Warrior Necklace, Castle Infusions, Misc)
- Wiki / AviPedia guides
- Events schedule with timers and notifications
- Costume Builder
- Prices & Storage (item price + quantity tracker)
- Net Worth page
- Achievements tracker
- Inventory page (shows what's where across containers)
- AH Scanner integration (Lua addon)
- Inventory Scanner integration (Lua addon — bag working, bank/guild/coffer blocked server-side)
- Trimmer tool

---

## App File Structure

```
Root/
├── main.js              ← Electron main process, IPC handlers
├── preload.js           ← Exposes electronAPI to renderer
├── index.html           ← Tab navigation
├── style.css            ← Global styles
├── js/
│   ├── app.js           ← Page router, renderCurrentPage()
│   ├── state.js         ← appState, saveStorage(), savePrice()
│   ├── utils.js         ← formatGold(), escapeHtml(), etc.
│   ├── state/
│   │   └── inventory.js ← loadNumberMap(), saveNumberValue()
│   ├── data/
│   │   ├── categories.js      ← allItems[], categories[] — master item list
│   │   ├── events.js          ← All 35 game events across 8 categories
│   │   └── achievements/
│   │       ├── index.js
│   │       ├── archeRageExclusive.js
│   │       ├── crazyCatPerson.js
│   │       ├── fashionIcon.js
│   │       ├── placeholders.js
│   │       ├── shapeShifter.js
│   │       ├── skyEmperor.js
│   │       ├── skywarden.js
│   │       ├── stradaCar.js
│   │       └── tuskora.js
│   ├── modules/
│   │   └── events.js          ← Event timer logic, notifications
│   └── pages/
│       ├── landing.js
│       ├── wiki.js
│       ├── achievements.js
│       ├── netWorth.js
│       ├── trimmer.js
│       ├── costumebuilder.js
│       ├── erenorCloak.js
│       ├── erenorCrafts.js
│       ├── erenorCrafts/
│       │   ├── data.js
│       │   └── state.js
│       ├── erenorUpgrading.js
│       ├── hiramGear.js
│       ├── libraryGear.js
│       ├── akash.js
│       ├── ipnyshArtifacts.js
│       ├── warriorNecklace.js
│       ├── castleInfusions.js
│       ├── castleInfusions/
│       │   ├── data.js
│       │   └── state.js
│       ├── misc.js
│       ├── pricesStorage.js
│       └── pricesStorage/
│           ├── constants.js
│           ├── currency.js
│           ├── filters.js
│           ├── priceTracking.js
│           └── wizardState.js
```

---

## Addon File Structure

```
C:\Users\froze\Documents\ArcheRage\Addon\
├── ahscanner/           ← AH Price Scanner (WORKING)
│   ├── toc.g
│   ├── AHScanner.lua
│   ├── apitypes.lua
│   ├── window.lua
│   ├── windowcommon.lua
│   ├── button.lua
│   ├── buttoncommon.lua
│   ├── scan_items.csv
│   └── ah_prices.csv    ← Output file
└── invscanner/          ← Inventory Scanner (BAG WORKING, BANK/GUILD/COFFER BLOCKED)
    ├── toc.g
    ├── InventoryScanner.lua
    ├── apitypes.lua
    ├── window.lua
    ├── windowcommon.lua
    ├── button.lua
    ├── buttoncommon.lua
    └── inventory_scan.csv  ← Output file
```

---

## Key Technical Notes

### Electron Setup
- Electron version ~41
- Requires: `sandbox: false`, `nodeIntegration: true`, `contextIsolation: false`
- IPC pattern: `ipcMain.handle()` in main.js, `ipcRenderer.invoke()` in preload.js
- `window.electronAPI` exposes: `readAHCsv()`, `readInventoryScan()`, `getAddonDir()`

### Lua Addon Rules (CRITICAL)
- **Pure ASCII only** — no Unicode, emoji, box-drawing chars, em dashes, arrows
- `toc.g` must use **Unix `\n` line endings** (NOT `\r\n`)
- File order in toc.g: `apitypes.lua`, `windowcommon.lua`, `window.lua`, `buttoncommon.lua`, `button.lua`, `MainAddon.lua`
- Always verify with: `python3 -c "with open('file.lua','rb') as f: data=f.read(); print(sum(1 for b in data if b > 127))"`

### CSV File Paths (Lua)
- AH Scanner output: `../Documents/Addon/ahscanner/ah_prices.csv`
- Inventory Scanner output: `../Documents/Addon/invscanner/inventory_scan.csv`

### CSV Format — Inventory Scanner
```
item_name,total,bag,bank,guild_bank,coffer,character,last_scanned
```

---

## AH Scanner — Status: WORKING

**Commands:** `!scan` (smart, skips items <3 days old), `!scanfull`, `!scanage N`, `!scanstatus`, `!scanstop`, `!scanshow`, `!scanhelp`

**How it works:**
- Reads `scan_items.csv` (list of items to scan)
- Opens AH search for each item
- Writes prices to `ah_prices.csv`
- App imports via `readAHCsv()` IPC call

**AH Search API:** `SearchAuctionArticle(1, 0, 999, 1, 0, false, name, "0", "0")`

---

## Inventory Scanner — Status: BAG WORKING, BANK/GUILD/COFFER BLOCKED

### What Works
- `!scanstart` — launches guided wizard UI
- **Bag scan** — fully working, correct counts, sellable filter applied
- Wizard flow: Step 1 Bag → Step 2 Storage → Steps 3-10 Guild Cells 1-8 with Skip
- CSV export and app import working

### Bag API (CONFIRMED WORKING)
```lua
X2Bag:GetBagItemInfo(bagId, slot, IIK_NAME)   -- three params
X2Bag:GetBagItemInfo(bagId, slot, IIK_SELL)
X2Bag:ItemStack(slot)
X2Bag:CountItems()
-- bagId=0, slot 0-149
```

### Sellable Filter
```lua
local function IsSellable(info)
    if not info then return false end
    if info.sellable == false then return false end
    if info.soul_bound and info.soul_bound == 1 then return false end
    if info.soul_bind == "soulbound" then return false end
    return true
end
```

### Bank/Guild/Coffer API — FIXED (2026-04-14)
Sparkle fixed the server-side bug. All containers now work.

**Correct API signatures (1-param form for bank/coffer/guild):**
- Bag:       `X2Bag:GetBagItemInfo(0, slot)` — 2 params
- Bank:      `X2Bank:GetBagItemInfo(slot)` — 1 param
- Coffer:    `X2Coffer:GetBagItemInfo(slot)` — 1 param
- GuildBank: `X2GuildBank:GetBagItemInfo(slot)` — 1 param

### Guild Bank Notes
- 8 cells (tabs), tab switching NOT enabled by server
- Manual workflow: open each cell → scan per cell
- Results accumulate across cells in same session

---

## Prices & Storage Page

### Key Functions
```javascript
saveStorage(name, qty)   // saves to appState.storage + localStorage
savePrice(name, price)   // saves to appState.prices + localStorage
```

### Import Inventory Behavior
- Scanner import **REPLACES** quantities (scanner is source of truth)
- Auto-registers new items as custom items under "Scanned Items" category if not in built-in list
- Built-in items list: `allItems` from `js/data/categories.js`
- Custom items stored in localStorage under `customItems` key

### localStorage Keys
- `storageData` — item quantities
- `priceData` — item prices
- `requiredData` — required quantities
- `customItems` — user-added items
- `inventoryBreakdown` — full scan breakdown with per-container quantities
- `inventoryFilter` — current filter state for inventory page

---

## Monetization Plan (NOT YET BUILT)

### Pricing
- **$5.99/month** subscription
- **7-day free trial**, no card required
- Cancel anytime, no lifetime option (ethical — server could go down)

### Free vs Pro Split
| Feature | Free | Pro |
|---|---|---|
| All crafting calculators | ✅ | ✅ |
| Wiki, Events, Costume Builder | ✅ | ✅ |
| AH Scanner addon (self-scan) | ✅ | ✅ |
| Built-in prices list | ✅ read-only | ✅ full |
| Add custom items | ❌ | ✅ |
| Daily price feed from Ashkan's scans | ❌ | ✅ auto |
| Bag/Vault Scanner | ❌ | ✅ |
| Net Worth | ❌ | ✅ |
| Cloud sync | ❌ | ✅ |

### Backend Architecture (NOT BUILT YET)
- Discord OAuth + JWT session tokens
- Supabase PostgreSQL database
- Stripe at $5.99/month
- Price variance system:
  - ±10% from verified price → auto-accept as community data
  - >50% variance → auto-reject, log as suspicious
  - 10-50% gray zone → log, weight less
  - 3+ users in gray zone → flag for Ashkan's review ("possible market shift")
- Crowdsourced item discovery: user-added items submitted to master DB, Ashkan verifies
- Staff scanner role (`@Scanner`) for trusted members to push price data
- Admin panel: flagged items, rejected submissions, pending new items

### Gating Implementation Plan
```javascript
// In renderCurrentPage() in app.js:
function requiresPro(pageName) {
  return ['netWorth', 'pricesStorage', 'inventory'].includes(pageName);
}
if (requiresPro(appState.currentPage) && appState.user?.role !== 'pro') {
  renderLockedPage(appState.currentPage);
  return;
}
```

---

## Events Page

- 35 events across 8 categories
- Timezone: `America/New_York` (handles EDT/EST automatically)
- Progress bars: cyan/teal normal, yellow <15min, red <5min with pulse
- Per-event notification toggle, saved to localStorage
- Windows toast notifications via Electron `Notification` API
- In-app toast with: Snooze 5m | Not Going | Got it
- Collapsible categories

---

## Costume Builder Page

- Two tabs: Costume and Undergarments
- Stat selector (up to 5), grade-colored badges, build order wizard
- Full stat reference table with Eternal 100% values
- Data from CSV files

---

## Pending Work

### HIGH PRIORITY
1. **electron-builder `.exe` packaging** with JS obfuscation
2. **Recipe Lookup data verification** — page exists but gated dev-only; scraped data has errors, needs in-game verification before opening to pro users

### MEDIUM PRIORITY
3. **Event timer data verification** against sadly.io
4. **Inventory page** — data layer exists, page not built yet

### DONE
- ✅ Bank/Guild/Coffer scan — fixed by Sparkle 2026-04-14
- ✅ Backend auth — Discord OAuth + Supabase + role system
- ✅ Login screen + gating
- ✅ Crowdsourced price database
- ✅ ARC Points system
- ✅ Recipe Lookup page (dev-only pending data verification)

---

## Conversation Style Notes
- Ashkan is casual and direct — match his energy
- He thinks in product terms and has great instincts — trust them
- When he says something is a good idea, build it
- Don't over-explain — be concise
- He appreciates honesty about what will and won't work
- He calls the server owner "Sparkle" (she's the one who enables API functions)
- "Nov" is another developer/player on the Discord who has been debugging the same APIs — not November, just Nov
