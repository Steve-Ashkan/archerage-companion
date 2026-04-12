ADDON:ImportObject(OBJECT_TYPE.TEXT_STYLE)
ADDON:ImportObject(OBJECT_TYPE.DRAWABLE)
ADDON:ImportObject(OBJECT_TYPE.BUTTON)
ADDON:ImportObject(OBJECT_TYPE.NINE_PART_DRAWABLE)
ADDON:ImportObject(OBJECT_TYPE.COLOR_DRAWABLE)
ADDON:ImportObject(OBJECT_TYPE.WINDOW)
ADDON:ImportObject(OBJECT_TYPE.LABEL)
ADDON:ImportObject(OBJECT_TYPE.ICON_DRAWABLE)
ADDON:ImportObject(OBJECT_TYPE.IMAGE_DRAWABLE)
ADDON:ImportObject(OBJECT_TYPE.TEXTBOX)

ADDON:ImportAPI(API_TYPE.CHAT.id)
ADDON:ImportAPI(API_TYPE.UNIT.id)
ADDON:ImportAPI(API_TYPE.MAP.id)
ADDON:ImportAPI(API_TYPE.AUCTION.id)

-- ─── PATHS ────────────────────────────────────────────────────────────────────
local OUTPUT_FILE     = "../Documents/Addon/ahscanner/ah_prices.csv"
local SCAN_ITEMS_FILE = "../Documents/Addon/ahscanner/scan_items.csv"

-- ─── CONSTANTS ───────────────────────────────────────────────────────────────
local SEARCH_COOLDOWN  = 1.2     -- seconds between AH searches
local ELLIPSIS_MS      = 400     -- ms between loading dot updates
local SEARCH_TIMEOUT   = 5       -- seconds before giving up on one item
local DEFAULT_MAX_AGE  = 3       -- days before a price is considered stale
local SECONDS_PER_DAY  = 86400

-- ─── STATE ───────────────────────────────────────────────────────────────────
local scanResults      = {}   -- item -> { price, timestamp } for newly scanned
local savedPrices      = {}   -- item -> { price, timestamp } loaded from CSV
local scanQueue        = {}   -- items queued for scanning
local scanList         = {}   -- full list for this session
local skippedItems     = {}   -- items skipped as recent
local scanActive       = false
local scanCurrentItem  = nil
local lastSearchTime   = 0
local waitingForResult = false
local ellipsisTimer    = 0
local ellipsisState    = 0
local maxAgeDays       = DEFAULT_MAX_AGE  -- can be changed with !scanage N
local forceFull        = false            -- set true by !scanfull

-- ─── WIDGETS ─────────────────────────────────────────────────────────────────
local updaterWidget     = nil
local scanWindow        = nil
local scanProgressLabel = nil
local scanSkipLabel     = nil
local scanItemLabel     = nil
local scanSavedLabel    = nil
local scanNewLabel      = nil
local scanVarianceLabel = nil
local scanStatusLabel   = nil
local scanAgeLabel      = nil
local stopBtn           = nil

-- ─── FALLBACK ITEM LIST ──────────────────────────────────────────────────────
local FALLBACK_ITEMS = {
    "Rice", "Corn", "Narcissus", "Azalea", "Clover", "Rose", "Red Coral", "Green Coral",
    "Peanut", "Wheat", "Oats", "Lotus", "Antler Coral", "Rosemary", "Pearl", "Rye",
    "Cornflower", "Lily", "Mint", "Cactus", "Turmeric", "Chili Pepper", "Quinoa",
    "Cultivated Ginseng", "Bean", "Poppy", "Saffron", "Blueberry", "Vanilla", "Pepper",
    "Coconut", "Beechnut", "Chestnut",
    "Amethyst", "Sapphire", "Ruby", "Topaz", "Emerald", "Diamond",
    "Iron Ingot", "Silver Ingot", "Copper Ingot", "Gold Ingot", "Archeum Ingot", "Anya Ingot",
    "Starshard Ingot",
    "Moonlight Archeum Dust", "Moonlight Archeum Crystal", "Moonlight Archeum Essence",
    "Starlight Archeum Dust", "Starlight Archeum Shard", "Starlight Archeum Crystal",
    "Starlight Archeum Essence", "Sunlight Archeum Crystal", "Sunlight Archeum Essence",
    "Moonpoint", "Sunpoint", "Starpoint", "Lucky Sunpoint",
    "Dragon Essence Stabilizer", "Red Dragon Spinal Ridge", "Onyx Archeum Essence",
    "Cursed Armor Piece", "Acidic Poison Pouch", "Flaming Log", "Archeum Log",
    "Thunderstruck Tree", "Thunderstruck Log", "Natural Rubber", "Book of Auroria",
    "Blank Regrade Scroll", "Mysterious Garden Powder", "Sparkling Shell Dust",
    "Dawn Lake Light Essence", "Clear Synthium Shard", "Glowing Prism",
    "Lumber", "Leather", "Fabric", "Misagon's Crystal",
    "Ayanad Weaponsmithing Scroll", "Celestial Weapon Anchoring Charm",
    "Red Regrade", "Resplendent Weapon Regrade Scroll",
    "Silver Regrade Charm", "Superior Red Regrade Charm",
    "Vehicle Upgrade Device"
}

-- ─── CSV HELPERS ─────────────────────────────────────────────────────────────

local function LoadScanItems()
    local items = {}
    local f = io.open(SCAN_ITEMS_FILE, "r")
    if not f then
        X2Chat:DispatchChatMessage(CMF_SYSTEM,
            "[AHScanner] scan_items.csv not found — using default list.")
        return nil
    end
    for line in f:lines() do
        line = line:match("^%s*(.-)%s*$")
        if line ~= "" and line ~= "item_name" and line ~= "Item Name" then
            table.insert(items, line)
        end
    end
    f:close()
    if #items == 0 then return nil end
    X2Chat:DispatchChatMessage(CMF_SYSTEM,
        string.format("[AHScanner] Loaded %d items from scan_items.csv", #items))
    return items
end

-- Load saved prices AND timestamps from ah_prices.csv
-- Format: item_name,price,timestamp  (timestamp is unix seconds, optional)
local function LoadSavedPrices()
    savedPrices = {}
    local f = io.open(OUTPUT_FILE, "r")
    if not f then return end
    local lineNum = 0
    for line in f:lines() do
        lineNum = lineNum + 1
        -- Strip Windows carriage returns
        line = line:gsub("\r", ""):match("^%s*(.-)%s*$")
        if lineNum > 1 and line ~= "" then
            -- Split on comma
            local parts = {}
            for part in line:gmatch("([^,]+)") do
                table.insert(parts, part:gsub("\r", ""):match("^%s*(.-)%s*$"))
            end
            if #parts >= 2 then
                local name      = parts[1]
                local price     = tonumber(parts[2])
                -- parts[3] is timestamp — may be missing in old 2-column files
                local timestamp = (parts[3] and tonumber(parts[3])) or 0
                if name and name ~= "item_name" and price then
                    savedPrices[name] = { price = price, timestamp = timestamp }
                end
            end
        end
    end
    f:close()
end

-- Write all prices back to CSV with timestamps
-- Format: item_name,price,timestamp
local function WriteCSV()
    local f = io.open(OUTPUT_FILE, "w")
    if not f then
        X2Chat:DispatchChatMessage(CMF_SYSTEM,
            "[AHScanner] ERROR: Cannot write output file!")
        return 0
    end
    f:write("item_name,price,last_scanned\n")

    -- Merge: saved prices as base, new scan results overwrite
    local merged = {}
    for name, data in pairs(savedPrices) do
        merged[name] = { price = data.price, timestamp = data.timestamp }
    end
    for name, data in pairs(scanResults) do
        merged[name] = { price = data.price / 10000, timestamp = data.timestamp }
    end

    local n = 0
    for name, data in pairs(merged) do
        -- Sanitize name — strip any carriage returns or commas
        local safeName = tostring(name):gsub("\r", ""):gsub("\n", "")
        f:write(string.format("%s,%.4f,%d\n", safeName, data.price, data.timestamp))
        n = n + 1
    end
    f:close()
    return n
end

-- ─── AGE / FRESHNESS HELPERS ─────────────────────────────────────────────────

-- Returns true if the item was scanned within maxAgeDays
local function IsRecent(itemName)
    if forceFull then return false end
    local data = savedPrices[itemName]
    if not data or not data.timestamp or data.timestamp <= 0 then
        return false  -- never scanned, not recent
    end
    local ageSeconds = os.time() - data.timestamp
    local ageDays    = ageSeconds / SECONDS_PER_DAY
    return ageDays < maxAgeDays
end

-- Human-readable age string
local function GetAgeString(itemName)
    local data = savedPrices[itemName]
    if not data or not data.timestamp or data.timestamp <= 0 then
        return "never scanned"
    end
    local ageSeconds = os.time() - data.timestamp
    local ageDays    = math.floor(ageSeconds / SECONDS_PER_DAY)
    local ageHours   = math.floor((ageSeconds % SECONDS_PER_DAY) / 3600)
    if ageDays > 0 then
        return string.format("%dd %dh ago", ageDays, ageHours)
    else
        return string.format("%dh ago", ageHours)
    end
end

-- ─── PRICE / VARIANCE HELPERS ────────────────────────────────────────────────

local function CopperToGold(copper)
    return (tonumber(copper) or 0) / 10000
end

local function GetVariance(savedGold, newCopper)
    if not savedGold or savedGold <= 0 or not newCopper or newCopper <= 0 then
        return nil, 0.5, 0.5, 0.5
    end
    local newGold = CopperToGold(newCopper)
    local pct = ((newGold - savedGold) / savedGold) * 100
    local abs = math.abs(pct)
    local r, g, b
    if abs <= 5 then
        r, g, b = 0.2, 1.0, 0.4   -- green: within 5%
    elseif abs <= 15 then
        r, g, b = 1.0, 0.84, 0.0  -- yellow: 5-15%
    else
        r, g, b = 1.0, 0.3, 0.3   -- red: >15%
    end
    return pct, r, g, b
end

-- ─── WINDOW UPDATE ───────────────────────────────────────────────────────────

local function UpdateWindow()
    if not scanWindow then return end

    local total     = #scanList
    local remaining = #scanQueue
    local done      = total - remaining - (waitingForResult and 1 or 0)
    if done < 0 then done = 0 end
    local current = math.min(done + 1, total)

    scanProgressLabel:SetText(string.format(
        "Scanning %d / %d  (%d remaining)", current, total, remaining))

    -- Skipped count
    local skippedCount = #skippedItems
    if skippedCount > 0 then
        scanSkipLabel:SetText(string.format(
            "Skipped %d recent (< %dd old)", skippedCount, maxAgeDays))
        scanSkipLabel.style:SetColor(0.5, 0.8, 1.0, 1)
    else
        scanSkipLabel:SetText("")
    end

    -- Current item
    if scanCurrentItem then
        scanItemLabel:SetText(scanCurrentItem)
        scanItemLabel.style:SetColor(1, 1, 1, 1)
    else
        scanItemLabel:SetText("—")
        scanItemLabel.style:SetColor(0.5, 0.5, 0.5, 1)
    end

    -- Age of saved price
    if scanCurrentItem then
        local ageStr = GetAgeString(scanCurrentItem)
        scanAgeLabel:SetText("Last scan:  " .. ageStr)
        scanAgeLabel.style:SetColor(0.55, 0.55, 0.55, 1)
    else
        scanAgeLabel:SetText("")
    end

    -- Saved price
    local savedData = savedPrices[scanCurrentItem]
    local savedGold = savedData and savedData.price or nil
    if savedGold and savedGold > 0 then
        scanSavedLabel:SetText(string.format("Saved:   %.4fg", savedGold))
        scanSavedLabel.style:SetColor(0.7, 0.9, 1.0, 1)
    else
        scanSavedLabel:SetText("Saved:   (no prior price)")
        scanSavedLabel.style:SetColor(0.4, 0.4, 0.4, 1)
    end

    -- AH price from scan results
    local newCopper = scanResults[scanCurrentItem] and scanResults[scanCurrentItem].price
    if newCopper and newCopper > 0 then
        local newGold = CopperToGold(newCopper)
        scanNewLabel:SetText(string.format("AH Now:  %.4fg", newGold))
        scanNewLabel.style:SetColor(0.2, 1.0, 0.4, 1)
        local pct, r, g, b = GetVariance(savedGold, newCopper)
        if pct then
            local arrow = pct > 0 and "▲" or "▼"
            scanVarianceLabel:SetText(string.format(
                "Change:  %s %.1f%%", arrow, math.abs(pct)))
            scanVarianceLabel.style:SetColor(r, g, b, 1)
        else
            scanVarianceLabel:SetText("Change:  (new item)")
            scanVarianceLabel.style:SetColor(0.4, 0.4, 0.4, 1)
        end
    else
        scanNewLabel:SetText("AH Now:  —")
        scanNewLabel.style:SetColor(0.4, 0.4, 0.4, 1)
        scanVarianceLabel:SetText("Change:  —")
        scanVarianceLabel.style:SetColor(0.4, 0.4, 0.4, 1)
    end
end

local function SetStatus(text, r, g, b)
    if not scanStatusLabel then return end
    scanStatusLabel:SetText(text)
    scanStatusLabel.style:SetColor(r or 0.7, g or 0.7, b or 0.7, 1)
end

-- ─── SCAN FLOW ───────────────────────────────────────────────────────────────

local function SearchCurrentItem()
    if not scanCurrentItem then return end
    X2Auction:SearchAuctionArticle(1, 0, 999, 1, 0, false, scanCurrentItem, "0", "0")
    lastSearchTime = os.time()
    waitingForResult = true
    -- Update window NOW so item name matches what's being searched
    UpdateWindow()
    SetStatus("Searching...", 1, 0.84, 0)
end

local function AdvanceToNext()
    waitingForResult = false
    if #scanQueue == 0 then
        local n = WriteCSV()
        local skipped = #skippedItems
        X2Chat:DispatchChatMessage(CMF_SYSTEM, string.format(
            "[AHScanner] ✓ Complete! %d scanned, %d skipped (fresh), %d total saved.",
            #scanList, skipped, n))
        scanActive = false
        scanCurrentItem = nil
        SetStatus(string.format("Done! %d scanned, %d skipped.", #scanList, skipped),
            0.2, 1.0, 0.4)
        if stopBtn then stopBtn:SetText("Close") end
        return
    end
    -- Advance to next item but don't update window yet
    -- OnUpdate will fire SearchCurrentItem after the cooldown,
    -- and UpdateWindow will be called when the next result comes back
    scanCurrentItem = table.remove(scanQueue, 1)
end

local function StopScan()
    if not scanActive then return end
    scanActive = false
    waitingForResult = false
    local n = WriteCSV()
    X2Chat:DispatchChatMessage(CMF_SYSTEM, string.format(
        "[AHScanner] Stopped. %d prices saved.", n))
    SetStatus(string.format("Stopped. %d saved.", n), 1, 0.84, 0)
    if stopBtn then stopBtn:SetText("Close") end
end

local function StartScan(fullScan)
    if scanActive then
        X2Chat:DispatchChatMessage(CMF_SYSTEM, "[AHScanner] Already scanning!")
        if scanWindow then scanWindow:Show(true) end
        return
    end

    forceFull = fullScan or false

    -- Load saved prices (with timestamps)
    LoadSavedPrices()

    -- Load item list
    local items = LoadScanItems() or FALLBACK_ITEMS

    -- Build queue — skip recently scanned items unless full scan
    scanResults    = {}
    scanQueue      = {}
    scanList       = {}
    skippedItems   = {}
    waitingForResult = false
    lastSearchTime = 0

    for _, item in ipairs(items) do
        if IsRecent(item) then
            table.insert(skippedItems, item)
        else
            table.insert(scanQueue, item)
            table.insert(scanList, item)
        end
    end

    if #scanQueue == 0 then
        X2Chat:DispatchChatMessage(CMF_SYSTEM, string.format(
            "[AHScanner] All %d items are fresh (scanned within %d days). " ..
            "Use !scanfull to force rescan.", #skippedItems, maxAgeDays))
        return
    end

    scanActive = true
    scanCurrentItem = table.remove(scanQueue, 1)

    if forceFull then
        X2Chat:DispatchChatMessage(CMF_SYSTEM, string.format(
            "[AHScanner] Full scan: scanning all %d items...", #items))
    else
        X2Chat:DispatchChatMessage(CMF_SYSTEM, string.format(
            "[AHScanner] Smart scan: %d items to scan, %d skipped (< %d days old).",
            #scanList, #skippedItems, maxAgeDays))
    end

    if scanWindow then
        if stopBtn then stopBtn:SetText("Stop Scan") end
        UpdateWindow()
        SetStatus("Starting...", 0.7, 0.7, 0.7)
        scanWindow:Show(true)
    end

    SearchCurrentItem()
end

-- ─── AUCTION RESULT EVENT ────────────────────────────────────────────────────

local function OnAuctionItemSearched()
    if not scanActive or not waitingForResult then return end
    waitingForResult = false

    local count = X2Auction:GetSearchedItemCount()
    if count and count > 0 then
        local itemInfo = X2Auction:GetSearchedItemInfo(1)
        if itemInfo then
            local copper = tonumber(itemInfo.bidPriceStr) or 0
            if copper > 0 then
                local ts = os.time()
                scanResults[scanCurrentItem] = {
                    price     = copper,
                    timestamp = ts
                }
                -- Also update savedPrices so GetAgeString reflects it immediately
                savedPrices[scanCurrentItem] = {
                    price     = CopperToGold(copper),
                    timestamp = ts
                }
                local gold = CopperToGold(copper)
                SetStatus(string.format("✓ %.4fg", gold), 0.2, 1.0, 0.4)
            else
                SetStatus("No price data", 0.6, 0.6, 0.6)
            end
        end
    else
        SetStatus("No listings", 0.5, 0.5, 0.5)
    end

    -- Update window FIRST to show result for current item
    UpdateWindow()

    -- THEN advance to next item
    AdvanceToNext()
end

-- ─── OnUpdate TIMER ──────────────────────────────────────────────────────────

local function OnUpdaterUpdate(self, dt)
    if not scanActive then return end

    if waitingForResult then
        -- Animate dots
        ellipsisTimer = ellipsisTimer + (dt or 0)
        if ellipsisTimer >= ELLIPSIS_MS then
            ellipsisTimer = 0
            ellipsisState = (ellipsisState % 3) + 1
            SetStatus("Searching" .. string.rep(".", ellipsisState), 1, 0.84, 0)
        end
        -- Timeout fallback
        local elapsed = os.time() - lastSearchTime
        if elapsed >= SEARCH_TIMEOUT then
            X2Chat:DispatchChatMessage(CMF_SYSTEM,
                "[AHScanner] Timeout: " .. (scanCurrentItem or "?") .. " — skipping")
            waitingForResult = false
            AdvanceToNext()
        end
        return
    end

    -- Fire next search after cooldown
    if scanCurrentItem and scanActive then
        local elapsed = os.time() - lastSearchTime
        if elapsed >= SEARCH_COOLDOWN then
            SearchCurrentItem()
        end
    end
end

-- ─── WINDOW BUILDER ──────────────────────────────────────────────────────────

local function BuildScanWindow()
    local W, H = 360, 290

    scanWindow = CreateEmptyWindow("AHScannerWindow", "UIParent")
    scanWindow:SetExtent(W, H)
    scanWindow:AddAnchor("RIGHT", "UIParent", -20, 0)
    scanWindow:SetCloseOnEscape(false)
    scanWindow:SetHandler("OnShow", function() SettingWindowSkin(scanWindow) end)

    -- Title
    local title = scanWindow:CreateChildWidget("label", "ahsTitle", 0, false)
    title:SetText("AH Price Scanner  [AUTO]")
    title:AddAnchor("TOP", scanWindow, 0, 12)
    title.style:SetAlign(ALIGN_CENTER)
    title.style:SetColor(1, 0.84, 0, 1)

    -- Progress
    scanProgressLabel = scanWindow:CreateChildWidget("label", "ahsProgress", 0, false)
    scanProgressLabel:SetText("Item 0 / 0")
    scanProgressLabel:AddAnchor("TOP", scanWindow, 0, 32)
    scanProgressLabel.style:SetAlign(ALIGN_CENTER)
    scanProgressLabel.style:SetColor(0.7, 0.7, 0.7, 1)

    -- Skipped count
    scanSkipLabel = scanWindow:CreateChildWidget("label", "ahsSkip", 0, false)
    scanSkipLabel:SetText("")
    scanSkipLabel:AddAnchor("TOP", scanWindow, 0, 50)
    scanSkipLabel.style:SetAlign(ALIGN_CENTER)
    scanSkipLabel.style:SetColor(0.5, 0.8, 1.0, 1)

    -- Divider
    local div1 = scanWindow:CreateChildWidget("label", "ahsDiv1", 0, false)
    div1:SetText("──────────────────────────────────")
    div1:AddAnchor("TOP", scanWindow, 0, 66)
    div1.style:SetAlign(ALIGN_CENTER)
    div1.style:SetColor(0.2, 0.2, 0.2, 1)

    -- Current item name
    scanItemLabel = scanWindow:CreateChildWidget("label", "ahsItem", 0, false)
    scanItemLabel:SetText("—")
    scanItemLabel:AddAnchor("TOP", scanWindow, 0, 78)
    scanItemLabel.style:SetAlign(ALIGN_CENTER)
    scanItemLabel.style:SetColor(1, 1, 1, 1)

    -- Status (Searching... / ✓ price / No listings)
    scanStatusLabel = scanWindow:CreateChildWidget("label", "ahsStatus", 0, false)
    scanStatusLabel:SetText("")
    scanStatusLabel:AddAnchor("TOP", scanWindow, 0, 98)
    scanStatusLabel.style:SetAlign(ALIGN_CENTER)
    scanStatusLabel.style:SetColor(0.7, 0.7, 0.7, 1)

    -- Divider
    local div2 = scanWindow:CreateChildWidget("label", "ahsDiv2", 0, false)
    div2:SetText("──────────────────────────────────")
    div2:AddAnchor("TOP", scanWindow, 0, 116)
    div2.style:SetAlign(ALIGN_CENTER)
    div2.style:SetColor(0.2, 0.2, 0.2, 1)

    -- Last scan age
    scanAgeLabel = scanWindow:CreateChildWidget("label", "ahsAge", 0, false)
    scanAgeLabel:SetText("")
    scanAgeLabel:AddAnchor("TOP", scanWindow, 0, 128)
    scanAgeLabel.style:SetAlign(ALIGN_CENTER)
    scanAgeLabel.style:SetColor(0.5, 0.5, 0.5, 1)

    -- Saved price
    scanSavedLabel = scanWindow:CreateChildWidget("label", "ahsSaved", 0, false)
    scanSavedLabel:SetText("Saved:   —")
    scanSavedLabel:AddAnchor("TOP", scanWindow, 0, 146)
    scanSavedLabel.style:SetAlign(ALIGN_CENTER)
    scanSavedLabel.style:SetColor(0.7, 0.9, 1.0, 1)

    -- AH now
    scanNewLabel = scanWindow:CreateChildWidget("label", "ahsNew", 0, false)
    scanNewLabel:SetText("AH Now:  —")
    scanNewLabel:AddAnchor("TOP", scanWindow, 0, 164)
    scanNewLabel.style:SetAlign(ALIGN_CENTER)
    scanNewLabel.style:SetColor(0.4, 0.4, 0.4, 1)

    -- Variance
    scanVarianceLabel = scanWindow:CreateChildWidget("label", "ahsVariance", 0, false)
    scanVarianceLabel:SetText("Change:  —")
    scanVarianceLabel:AddAnchor("TOP", scanWindow, 0, 182)
    scanVarianceLabel.style:SetAlign(ALIGN_CENTER)
    scanVarianceLabel.style:SetColor(0.4, 0.4, 0.4, 1)

    -- Divider
    local div3 = scanWindow:CreateChildWidget("label", "ahsDiv3", 0, false)
    div3:SetText("──────────────────────────────────")
    div3:AddAnchor("TOP", scanWindow, 0, 202)
    div3.style:SetAlign(ALIGN_CENTER)
    div3.style:SetColor(0.2, 0.2, 0.2, 1)

    -- Stop/Close button
    stopBtn = scanWindow:CreateChildWidget("button", "ahsStop", 0, true)
    stopBtn:SetText("Stop Scan")
    stopBtn:SetStyle("text_default")
    stopBtn:AddAnchor("BOTTOM", scanWindow, 0, -15)
    stopBtn:Show(true)
    stopBtn:SetHandler("OnClick", function()
        if scanActive then
            StopScan()
        else
            scanWindow:Show(false)
        end
    end)

    scanWindow:Show(false)
end

-- ─── ENTRY POINT ─────────────────────────────────────────────────────────────

local function EnteredWorld()

    -- OnUpdate ticker
    updaterWidget = CreateEmptyWindow("AHScannerUpdater", "UIParent")
    updaterWidget:Show(true)
    updaterWidget:SetHandler("OnUpdate", OnUpdaterUpdate)

    -- Build window
    BuildScanWindow()

    -- Chat commands
    local chatListener = CreateEmptyWindow("AHScannerChat", "UIParent")
    chatListener:Show(false)
    chatListener:SetHandler("OnEvent", function(this, event, channel, relation, name, message, info)
        local msg = string.lower(message or "")
        local raw = message or ""

        if msg == "!scan" then
            -- Smart scan: skip items scanned within maxAgeDays
            StartScan(false)

        elseif msg == "!scanfull" then
            -- Force rescan of everything regardless of age
            StartScan(true)

        elseif msg == "!scanstop" then
            if scanActive then StopScan()
            else X2Chat:DispatchChatMessage(CMF_SYSTEM, "[AHScanner] No scan running.") end

        elseif msg == "!scanshow" then
            if scanWindow then scanWindow:Show(true) end

        elseif msg == "!scanwrite" then
            local n = WriteCSV()
            X2Chat:DispatchChatMessage(CMF_SYSTEM,
                string.format("[AHScanner] Wrote %d prices to ah_prices.csv", n))

        elseif string.find(msg, "^!scanage%s+") then
            -- !scanage 7  — change the freshness threshold
            local days = tonumber(string.match(raw, "!scanage%s+(%d+)"))
            if days and days > 0 then
                maxAgeDays = days
                X2Chat:DispatchChatMessage(CMF_SYSTEM, string.format(
                    "[AHScanner] Skip threshold set to %d days. Use !scan to start.", days))
            else
                X2Chat:DispatchChatMessage(CMF_SYSTEM,
                    "[AHScanner] Usage: !scanage 7  (sets skip threshold to 7 days)")
            end

        elseif string.find(msg, "^!scanstatus") then
            -- Show how many items are fresh vs stale
            LoadSavedPrices()
            local allItems = LoadScanItems() or FALLBACK_ITEMS
            local fresh, stale, never = 0, 0, 0
            for _, item in ipairs(allItems) do
                local data = savedPrices[item]
                if not data or data.timestamp <= 0 then
                    never = never + 1
                elseif IsRecent(item) then
                    fresh = fresh + 1
                else
                    stale = stale + 1
                end
            end
            X2Chat:DispatchChatMessage(CMF_SYSTEM, string.format(
                "[AHScanner] Status: %d fresh (< %dd), %d stale, %d never scanned — %d total",
                fresh, maxAgeDays, stale, never, #allItems))

        elseif msg == "!scanhelp" then
            X2Chat:DispatchChatMessage(CMF_SYSTEM,
                "[AHScanner] Commands:")
            X2Chat:DispatchChatMessage(CMF_SYSTEM,
                "  !scan        — smart scan (skips items < " .. maxAgeDays .. " days old)")
            X2Chat:DispatchChatMessage(CMF_SYSTEM,
                "  !scanfull    — force rescan everything")
            X2Chat:DispatchChatMessage(CMF_SYSTEM,
                "  !scanage N   — change skip threshold (e.g. !scanage 7)")
            X2Chat:DispatchChatMessage(CMF_SYSTEM,
                "  !scanstatus  — show fresh/stale/never counts")
            X2Chat:DispatchChatMessage(CMF_SYSTEM,
                "  !scanstop    — stop and save  |  !scanshow  — reopen window")
        end
    end)
    chatListener:RegisterEvent("CHAT_MESSAGE")

    X2Chat:DispatchChatMessage(CMF_SYSTEM,
        "[AHScanner] Loaded! !scan (smart) | !scanfull (all) | !scanhelp")

    -- Load saved prices and scan list to report status on login
    LoadSavedPrices()
    local items = LoadScanItems() or FALLBACK_ITEMS
    local fresh, stale, never = 0, 0, 0
    for _, item in ipairs(items) do
        local data = savedPrices[item]
        if not data or not data.timestamp or data.timestamp <= 0 then
            never = never + 1
        elseif (os.time() - data.timestamp) / SECONDS_PER_DAY < maxAgeDays then
            fresh = fresh + 1
        else
            stale = stale + 1
        end
    end

    local needsScan = stale + never
    if needsScan == 0 then
        X2Chat:DispatchChatMessage(CMF_SYSTEM, string.format(
            "[AHScanner] All %d items are up to date (< %d days old). Nothing to scan!",
            fresh, maxAgeDays))
    elseif never > 0 and stale == 0 then
        X2Chat:DispatchChatMessage(CMF_SYSTEM, string.format(
            "[AHScanner] %d item%s never been scanned. Open the AH and type !scan.",
            never, never == 1 and " has" or "s have"))
    elseif stale > 0 and never == 0 then
        X2Chat:DispatchChatMessage(CMF_SYSTEM, string.format(
            "[AHScanner] %d item%s outdated (> %dd old). Open the AH and type !scan.",
            stale, stale == 1 and " is" or "s are", maxAgeDays))
    else
        X2Chat:DispatchChatMessage(CMF_SYSTEM, string.format(
            "[AHScanner] %d item%s need scanning (%d outdated, %d never scanned). Open the AH and type !scan.",
            needsScan, needsScan == 1 and " needs" or "s need", stale, never))
    end
end

UIParent:SetEventHandler(UIEVENT_TYPE.ENTERED_WORLD, EnteredWorld)
UIParent:SetEventHandler(UIEVENT_TYPE.AUCTION_ITEM_SEARCHED, OnAuctionItemSearched)