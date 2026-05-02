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
ADDON:ImportAPI(API_TYPE.BAG.id)
ADDON:ImportAPI(API_TYPE.BANK.id)
ADDON:ImportAPI(API_TYPE.COFFER.id)
ADDON:ImportAPI(API_TYPE.GUILD_BANK.id)

local OUTPUT_FILE = "../Documents/Addon/invscanner/inventory_scan.csv"

-- results[itemName] = { bag=0, bank=0, coffer=0, guild=0 }
local results      = {}
local scanWindow   = nil
local lblStep      = nil
local lblInstr     = nil
local lblStatus    = nil
local btnPrimary   = nil
local btnSecondary = nil

local function Msg(text)
    X2Chat:DispatchChatMessage(CMF_SYSTEM, "[InvScanner] " .. tostring(text))
end

-- --- ITEM HELPERS ------------------------------------------------------------

local function IsSellable(info)
    if not info then return false end
    if info.sellable == false then return false end
    if info.soul_bound and info.soul_bound == 1 then return false end
    if info.soul_bind == "soulbound" then return false end
    return true
end

local function AddItem(name, qty, container)
    if not name or name == "" or not qty or qty <= 0 then return end
    if not results[name] then
        results[name] = { bag = 0, bank = 0, coffer = 0, guild = 0 }
    end
    results[name][container] = (results[name][container] or 0) + qty
end

-- --- SCAN FUNCTIONS ----------------------------------------------------------

-- Bag: X2Bag:GetBagItemInfo(bagId, slot) -- 2 params, confirmed working
local function DoScanBag()
    for name, e in pairs(results) do e.bag = 0 end
    local found, skipped = 0, 0
    for slot = 0, 149 do
        local info = nil
        local ok = pcall(function() info = X2Bag:GetBagItemInfo(0, slot) end)
        if ok and info ~= nil and type(info) == "table" then
            local name = info.name or info.itemName or info.Name
            local qty  = info.count or info.stack or info.qty or 1
            if name and name ~= "" then
                if IsSellable(info) then
                    AddItem(name, qty, "bag")
                    found = found + 1
                else
                    skipped = skipped + 1
                end
            end
        end
    end
    return found, skipped
end

-- Bank: X2Bank:GetBagItemInfo(slot) -- 1 param, fixed 4/14 by Sparkle
local function DoScanBank()
    for name, e in pairs(results) do e.bank = 0 end
    local found, skipped = 0, 0
    for slot = 0, 149 do
        local info = nil
        local ok = pcall(function() info = X2Bank:GetBagItemInfo(slot) end)
        if ok and info ~= nil and type(info) == "table" then
            local name = info.name or info.itemName or info.Name
            local qty  = info.count or info.stack or info.qty or 1
            if name and name ~= "" then
                if IsSellable(info) then
                    AddItem(name, qty, "bank")
                    found = found + 1
                else
                    skipped = skipped + 1
                end
            end
        end
    end
    return found, skipped
end

-- Coffer: X2Coffer:GetBagItemInfo(slot) -- 1 param, fixed 4/14 by Sparkle
-- Results ACCUMULATE across coffer scans (don't reset per coffer)
local function DoScanCoffer()
    local found, skipped = 0, 0
    for slot = 0, 149 do
        local info = nil
        local ok = pcall(function() info = X2Coffer:GetBagItemInfo(slot) end)
        if ok and info ~= nil and type(info) == "table" then
            local name = info.name or info.itemName or info.Name
            local qty  = info.count or info.stack or info.qty or 1
            if name and name ~= "" then
                if IsSellable(info) then
                    AddItem(name, qty, "coffer")
                    found = found + 1
                else
                    skipped = skipped + 1
                end
            end
        end
    end
    return found, skipped
end

-- GuildBank: X2GuildBank:GetBagItemInfo(slot) -- 1 param, fixed 4/14 by Sparkle
-- Results ACCUMULATE across guild cell scans (don't reset per cell)
local function DoScanGuild()
    local found, skipped = 0, 0
    for slot = 0, 149 do
        local info = nil
        local ok = pcall(function() info = X2GuildBank:GetBagItemInfo(slot) end)
        if ok and info ~= nil and type(info) == "table" then
            local name = info.name or info.itemName or info.Name
            local qty  = info.count or info.stack or info.qty or 1
            if name and name ~= "" then
                if IsSellable(info) then
                    AddItem(name, qty, "guild")
                    found = found + 1
                else
                    skipped = skipped + 1
                end
            end
        end
    end
    return found, skipped
end

-- --- CSV WRITER --------------------------------------------------------------

local function WriteCSV()
    local playerName = X2Unit:UnitName("player") or "Unknown"
    local f = io.open(OUTPUT_FILE, "w")
    if not f then Msg("ERROR: Cannot write file!") return 0 end
    f:write("item_name,total,bag,bank,guild_bank,coffer,character,last_scanned\n")
    local ts = os.time()
    local count = 0
    for name, e in pairs(results) do
        local total = (e.bag or 0) + (e.bank or 0) + (e.coffer or 0) + (e.guild or 0)
        if total > 0 then
            local safeName = tostring(name):gsub("\r", ""):gsub("\n", ""):gsub(",", "")
            f:write(string.format("%s,%d,%d,%d,%d,%d,%s,%d\n",
                safeName, total,
                e.bag or 0, e.bank or 0, e.guild or 0, e.coffer or 0,
                playerName, ts))
            count = count + 1
        end
    end
    f:close()
    Msg(string.format("Saved %d sellable items. Import in Companion App!", count))
    return count
end

-- --- WIZARD UI ---------------------------------------------------------------

local function SetStep(step, instr, status, statusR, statusG, statusB, btn1Text, btn1Fn, btn2Text, btn2Fn)
    if lblStep   then lblStep:SetText(step) end
    if lblInstr  then lblInstr:SetText(instr) end
    if lblStatus then
        lblStatus:SetText(status)
        lblStatus.style:SetColor(statusR or 0.6, statusG or 0.6, statusB or 0.6, 1)
    end
    if btnPrimary then
        btnPrimary:SetText(btn1Text)
        btnPrimary:SetHandler("OnClick", btn1Fn)
        btnPrimary:Show(true)
    end
    if btnSecondary then
        if btn2Text and btn2Fn then
            btnSecondary:SetText(btn2Text)
            btnSecondary:SetHandler("OnClick", btn2Fn)
            btnSecondary:Show(true)
        else
            btnSecondary:Show(false)
        end
    end
    if scanWindow then scanWindow:Show(true) end
end

local function SetStatus(text, r, g, b)
    if lblStatus then
        lblStatus:SetText(text)
        lblStatus.style:SetColor(r or 0.6, g or 0.6, b or 0.6, 1)
    end
end

-- Forward declare steps
local StepBag, StepBank, StepCoffer, StepGuild, StepDone

StepDone = function()
    local total = WriteCSV()
    SetStep(
        "All Done!",
        string.format("Saved %d sellable items.", total),
        "Import: Companion App -> Prices & Storage -> Import Inventory",
        0.2, 1, 0.4,
        "Close",
        function() if scanWindow then scanWindow:Show(false) end end,
        nil, nil
    )
end

StepGuild = function(cell)
    SetStep(
        string.format("Step 4: Guild Vault - Cell %d of 8", cell),
        string.format("Open Guild Vault Cell %d, then click Scan Cell %d", cell, cell),
        "Waiting...",
        0.6, 0.6, 0.6,
        string.format("Scan Cell %d", cell),
        function()
            SetStatus("Scanning guild cell " .. cell .. "...", 1, 0.84, 0)
            local found, skipped = DoScanGuild()
            SetStatus(string.format("Cell %d: %d sellable, %d skipped", cell, found, skipped), 0.2, 1, 0.4)
            Msg(string.format("Guild Cell %d: %d sellable stacks", cell, found))
            if cell < 8 then
                StepGuild(cell + 1)
            else
                StepDone()
            end
        end,
        "Skip Cell",
        function()
            Msg(string.format("Skipped guild cell %d", cell))
            if cell < 8 then
                StepGuild(cell + 1)
            else
                StepDone()
            end
        end
    )
end

StepCoffer = function(cofferNum)
    cofferNum = cofferNum or 1
    SetStep(
        string.format("Step 3: Coffer %d", cofferNum),
        string.format("Open Coffer %d, then click Scan Coffer %d", cofferNum, cofferNum),
        "Waiting for you to open Coffer...",
        0.6, 0.6, 0.6,
        string.format("Scan Coffer %d", cofferNum),
        function()
            SetStatus(string.format("Scanning coffer %d...", cofferNum), 1, 0.84, 0)
            local found, skipped = DoScanCoffer()
            SetStatus(string.format("Coffer %d: %d sellable, %d skipped", cofferNum, found, skipped), 0.2, 1, 0.4)
            Msg(string.format("Coffer %d: %d sellable stacks scanned", cofferNum, found))
            StepCoffer(cofferNum + 1)
        end,
        cofferNum == 1 and "Skip All Coffers" or "All Coffers Done",
        function()
            if cofferNum == 1 then
                Msg("Skipped all coffers")
            else
                Msg(string.format("Done scanning %d coffer(s)", cofferNum - 1))
            end
            StepGuild(1)
        end
    )
end

StepBank = function()
    SetStep(
        "Step 2: Storage",
        "Open your Storage NPC, then click Scan Storage",
        "Waiting for you to open Storage...",
        0.6, 0.6, 0.6,
        "Scan Storage",
        function()
            SetStatus("Scanning storage...", 1, 0.84, 0)
            local found, skipped = DoScanBank()
            SetStatus(string.format("Storage: %d sellable, %d skipped", found, skipped), 0.2, 1, 0.4)
            Msg(string.format("Storage: %d sellable stacks scanned", found))
            StepCoffer()
        end,
        "Skip Storage",
        function()
            Msg("Skipped storage scan")
            StepCoffer()
        end
    )
end

StepBag = function()
    SetStep(
        "Step 1: Bag",
        "Click Scan Bag to scan your inventory",
        "Ready",
        0.6, 0.6, 0.6,
        "Scan Bag",
        function()
            SetStatus("Scanning bag...", 1, 0.84, 0)
            local found, skipped = DoScanBag()
            SetStatus(string.format("Bag: %d sellable, %d skipped", found, skipped), 0.2, 1, 0.4)
            Msg(string.format("Bag: %d sellable stacks scanned", found))
            StepBank()
        end,
        "Cancel",
        function()
            if scanWindow then scanWindow:Show(false) end
        end
    )
end

-- --- WINDOW BUILDER ----------------------------------------------------------

local function BuildWindow()
    local W, H = 380, 200
    scanWindow = CreateEmptyWindow("InvScannerWindow", "UIParent")
    scanWindow:SetExtent(W, H)
    scanWindow:AddAnchor("CENTER", "UIParent", 0, 0)
    scanWindow:SetCloseOnEscape(true)
    scanWindow:SetHandler("OnShow", function() SettingWindowSkin(scanWindow) end)

    lblStep = scanWindow:CreateChildWidget("label", "invLblStep", 0, false)
    lblStep:SetText("")
    lblStep:AddAnchor("TOP", scanWindow, 0, 14)
    lblStep.style:SetAlign(ALIGN_CENTER)
    lblStep.style:SetColor(1, 0.84, 0, 1)

    lblInstr = scanWindow:CreateChildWidget("label", "invLblInstr", 0, false)
    lblInstr:SetText("")
    lblInstr:AddAnchor("TOP", scanWindow, 0, 40)
    lblInstr.style:SetAlign(ALIGN_CENTER)
    lblInstr.style:SetColor(0.85, 0.85, 0.85, 1)

    local div = scanWindow:CreateChildWidget("label", "invDiv", 0, false)
    div:SetText("-------------------------------------")
    div:AddAnchor("TOP", scanWindow, 0, 62)
    div.style:SetAlign(ALIGN_CENTER)
    div.style:SetColor(0.25, 0.25, 0.25, 1)

    lblStatus = scanWindow:CreateChildWidget("label", "invLblStatus", 0, false)
    lblStatus:SetText("")
    lblStatus:AddAnchor("TOP", scanWindow, 0, 78)
    lblStatus.style:SetAlign(ALIGN_CENTER)
    lblStatus.style:SetColor(0.6, 0.6, 0.6, 1)

    btnPrimary = scanWindow:CreateChildWidget("button", "invBtnPrimary", 0, true)
    btnPrimary:SetText("Scan")
    btnPrimary:SetStyle("text_default")
    btnPrimary:AddAnchor("BOTTOM", scanWindow, -70, -20)
    btnPrimary:Show(true)

    btnSecondary = scanWindow:CreateChildWidget("button", "invBtnSecondary", 0, true)
    btnSecondary:SetText("Cancel")
    btnSecondary:SetStyle("text_default")
    btnSecondary:AddAnchor("BOTTOM", scanWindow, 70, -20)
    btnSecondary:Show(true)

    scanWindow:Show(false)
end

-- --- ENTRY POINT -------------------------------------------------------------

local function EnteredWorld()
    local chatListener = CreateEmptyWindow("InvScannerListener", "UIParent")
    chatListener:Show(false)
    chatListener:SetHandler("OnEvent", function(this, event, channel, relation, name, message, info)
        local msg = string.lower(message or "")

        if msg == "!scanstart" then
            results = {}
            StepBag()

        elseif msg == "!scanshow" then
            if scanWindow then scanWindow:Show(true) end

        elseif msg == "!scanclose" then
            if scanWindow then scanWindow:Show(false) end

        elseif msg == "!scanwrite" then
            local total = WriteCSV()
            Msg(string.format("Saved %d items. Import in Companion App!", total))

        elseif msg == "!scanhelp" then
            Msg("Commands:")
            Msg("  !scanstart  - begin guided scan (bag, storage, coffer, guild vault)")
            Msg("  !scanwrite  - save current results to CSV")
            Msg("  !scanshow   - reopen wizard window")
        end
    end)
    chatListener:RegisterEvent("CHAT_MESSAGE")

    BuildWindow()
    Msg(string.format("Loaded for %s! !scanstart to begin.",
        X2Unit:UnitName("player") or "Unknown"))
end

UIParent:SetEventHandler(UIEVENT_TYPE.ENTERED_WORLD, EnteredWorld)
