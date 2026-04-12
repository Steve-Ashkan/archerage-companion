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
ADDON:ImportAPI(API_TYPE.GUILD_BANK.id)

local OUTPUT_FILE = "../Documents/Addon/invscanner/inventory_scan.csv"

local results     = {}
local scanWindow  = nil
local lblStep     = nil
local lblInstr    = nil
local lblStatus   = nil
local btnPrimary  = nil
local btnSecondary = nil
local chatListenerEvents = {}

local function Msg(text)
    X2Chat:DispatchChatMessage(CMF_SYSTEM, "[InvScanner] " .. tostring(text))
end

local function AddItem(name, qty, container)
    if not name or name == "" or not qty or qty <= 0 then return end
    if not results[name] then
        results[name] = { bag = 0, bank = 0, guild = 0 }
    end
    results[name][container] = (results[name][container] or 0) + qty
end

local function IsSellable(info)
    if not info then return false end
    if info.sellable == false then return false end
    if info.soul_bound and info.soul_bound == 1 then return false end
    if info.soul_bind == "soulbound" then return false end
    return true
end

local function DoScanBag()
    for name, e in pairs(results) do e.bag = 0 end
    local found, skipped = 0, 0
    for slot = 0, 149 do
        local info = nil
        local ok = pcall(function() info = X2Bag:GetBagItemInfo(0, slot) end)
        if ok and info ~= nil then
            local name = info.name or info.itemName or info.Name
            local qty  = info.count or info.stack or info.qty or 1
            if name and name ~= "" then
                if IsSellable(info) then AddItem(name, qty, "bag") found = found + 1
                else skipped = skipped + 1 end
            end
        end
    end
    return found, skipped
end


local function DebugBank()
    Msg("=== BANK DEBUG v3 ===")
    -- SingleParam returns a NUMBER - check slots 0-10 for values
    Msg("Checking which slots have numbers (item IDs):")
    for slot = 0, 10 do
        local val = nil
        local ok = pcall(function() val = X2Bank:GetBagItemInfo(slot) end)
        local stk = nil
        local sok = pcall(function() stk = X2Bank:ItemStack(slot) end)
        if ok and val ~= nil then
            Msg(string.format("  Slot %d: GetBagItemInfo=%s(%s) ItemStack=%s",
                slot, type(val), tostring(val), tostring(stk)))
        end
    end
    -- The number is likely item type ID
    -- Try X2Item if available to look up name from ID
    local info1 = nil
    local ok1 = pcall(function() info1 = X2Bank:GetBagItemInfo(1) end)
    Msg(string.format("Slot 1 raw value: %s (type=%s)", tostring(info1), type(info1)))
    -- Check if X2Item can resolve the name
    if info1 then
        local name = nil
        local nok = pcall(function() 
            -- Try common item name lookup patterns
            name = X2Item and X2Item:GetItemName(info1) or nil
        end)
        Msg(string.format("X2Item lookup: ok=%s name=%s", tostring(nok), tostring(name)))
    end
    Msg("=== END v3 ===")
end

local function DoScanBank()
    for name, e in pairs(results) do e.bank = 0 end
    local found, skipped = 0, 0
    -- Bank uses same two-param as bag: GetBagItemInfo(0, slot)
    -- Single-param version crashes the game
    for slot = 0, 149 do
        local info = nil
        local ok = pcall(function() info = X2Bank:GetBagItemInfo(0, slot) end)
        if ok and info ~= nil then
            local name = info.name or info.itemName or info.Name
            local qty  = info.count or info.stack or info.qty or 1
            if name and name ~= "" then
                if IsSellable(info) then AddItem(name, qty, "bank") found = found + 1
                else skipped = skipped + 1 end
            end
        end
    end
    return found, skipped
end

local function DoScanGuild()
    local found, skipped = 0, 0
    -- Guild bank uses same two-param as bag: GetBagItemInfo(0, slot)
    for slot = 0, 149 do
        local info = nil
        local ok = pcall(function() info = X2GuildBank:GetBagItemInfo(0, slot) end)
        if ok and info ~= nil then
            local name = info.name or info.itemName or info.Name
            local qty  = info.count or info.stack or info.qty or 1
            if name and name ~= "" then
                if IsSellable(info) then AddItem(name, qty, "guild") found = found + 1
                else skipped = skipped + 1 end
            end
        end
    end
    return found, skipped
end

local function WriteCSV()
    local playerName = X2Unit:UnitName("player") or "Unknown"
    local f = io.open(OUTPUT_FILE, "w")
    if not f then Msg("ERROR: Cannot write file!") return 0 end
    f:write("item_name,total,bag,bank,guild_bank,coffer,character,last_scanned\n")
    local ts = os.time()
    local count = 0
    for name, e in pairs(results) do
        local total = (e.bag or 0) + (e.bank or 0) + (e.guild or 0)
        if total > 0 then
            f:write(string.format("%s,%d,%d,%d,%d,0,%s,%d\n",
                name, total, e.bag or 0, e.bank or 0, e.guild or 0, playerName, ts))
            count = count + 1
        end
    end
    f:close()
    Msg(string.format("Saved %d sellable items. Import in Companion App!", count))
    return count
end

-- Update the single set of persistent labels/buttons
local function SetStep(step, instr, status, btn1Text, btn1Fn, btn2Text, btn2Fn)
    if lblStep   then lblStep:SetText(step) end
    if lblInstr  then lblInstr:SetText(instr) end
    if lblStatus then lblStatus:SetText(status) lblStatus.style:SetColor(0.6, 0.6, 0.6, 1) end

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
local StepBag, StepBank, StepGuild

StepGuild = function(cell)
    SetStep(
        string.format("Step 3: Guild Vault - Cell %d of 8", cell),
        string.format("Open Guild Vault Cell %d, then click Scan Cell %d", cell, cell),
        "Waiting...",
        string.format("Scan Cell %d", cell),
        function()
            SetStatus("Scanning...", 1, 0.84, 0)
            local found, skipped = DoScanGuild()
            SetStatus(string.format("Cell %d: %d sellable, %d skipped", cell, found, skipped), 0.2, 1, 0.4)
            Msg(string.format("Guild Cell %d: %d sellable stacks", cell, found))
            if cell < 8 then
                StepGuild(cell + 1)
            else
                local total = WriteCSV()
                SetStep(
                    "All Done!",
                    string.format("Saved %d sellable items.", total),
                    "Import in Companion App -> Prices & Storage -> Import Inventory",
                    "Close",
                    function() scanWindow:Show(false) end,
                    nil, nil
                )
                if lblStatus then lblStatus.style:SetColor(0.2, 1, 0.4, 1) end
            end
        end,
        "Skip Cell",
        function()
            Msg(string.format("Skipped guild cell %d", cell))
            if cell < 8 then
                StepGuild(cell + 1)
            else
                local total = WriteCSV()
                SetStep(
                    "All Done!",
                    string.format("Saved %d sellable items.", total),
                    "Import in Companion App -> Prices & Storage -> Import Inventory",
                    "Close",
                    function() scanWindow:Show(false) end,
                    nil, nil
                )
                if lblStatus then lblStatus.style:SetColor(0.2, 1, 0.4, 1) end
            end
        end
    )
end

StepBank = function()
    SetStep(
        "Step 2: Storage",
        "Open your Storage NPC, then click Scan Storage",
        "Waiting for you to open Storage...",
        "Scan Storage",
        function()
            SetStatus("Scanning storage...", 1, 0.84, 0)
            local found, skipped = DoScanBank()
            SetStatus(string.format("Storage: %d sellable, %d skipped", found, skipped), 0.2, 1, 0.4)
            Msg(string.format("Storage: %d sellable stacks scanned", found))
            StepGuild(1)
        end,
        "Skip Storage",
        function()
            Msg("Skipped storage scan")
            StepGuild(1)
        end
    )
end

StepBag = function()
    SetStep(
        "Step 1: Bag",
        "Waiting to scan your Bag!",
        "Click Scan Bag when ready",
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
            scanWindow:Show(false)
        end
    )
end

local function BuildWindow()
    local W, H = 360, 210
    scanWindow = CreateEmptyWindow("InvScannerWindow", "UIParent")
    scanWindow:SetExtent(W, H)
    scanWindow:AddAnchor("CENTER", "UIParent", 0, 0)
    scanWindow:SetCloseOnEscape(true)
    scanWindow:SetHandler("OnShow", function() SettingWindowSkin(scanWindow) end)

    -- Step title (bold gold)
    lblStep = scanWindow:CreateChildWidget("label", "invLblStep", 0, false)
    lblStep:SetText("")
    lblStep:AddAnchor("TOP", scanWindow, 0, 14)
    lblStep.style:SetAlign(ALIGN_CENTER)
    lblStep.style:SetColor(1, 0.84, 0, 1)

    -- Instruction line
    lblInstr = scanWindow:CreateChildWidget("label", "invLblInstr", 0, false)
    lblInstr:SetText("")
    lblInstr:AddAnchor("TOP", scanWindow, 0, 38)
    lblInstr.style:SetAlign(ALIGN_CENTER)
    lblInstr.style:SetColor(0.85, 0.85, 0.85, 1)

    -- Status line (changes color on scan result)
    lblStatus = scanWindow:CreateChildWidget("label", "invLblStatus", 0, false)
    lblStatus:SetText("")
    lblStatus:AddAnchor("TOP", scanWindow, 0, 62)
    lblStatus.style:SetAlign(ALIGN_CENTER)
    lblStatus.style:SetColor(0.6, 0.6, 0.6, 1)

    -- Primary button (Scan Bag / Scan Storage / Scan Cell N / Close)
    btnPrimary = scanWindow:CreateChildWidget("button", "invBtnPrimary", 0, true)
    btnPrimary:SetText("Scan")
    btnPrimary:SetStyle("text_default")
    btnPrimary:AddAnchor("BOTTOM", scanWindow, -70, -20)
    btnPrimary:Show(true)

    -- Secondary button (Cancel / Skip Storage / Skip Cell)
    btnSecondary = scanWindow:CreateChildWidget("button", "invBtnSecondary", 0, true)
    btnSecondary:SetText("Cancel")
    btnSecondary:SetStyle("text_default")
    btnSecondary:AddAnchor("BOTTOM", scanWindow, 70, -20)
    btnSecondary:Show(true)

    scanWindow:Show(false)
end

local function EnteredWorld()
    chatListenerEvents["CHAT_MESSAGE"] = function(channel, relation, name, message, info)
        local msg = string.lower(message or "")
        if msg == "!debugbank" then
            DebugBank()
        elseif msg == "!scanstart" then
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
            Msg("!scanstart - begin guided scan wizard")
            Msg("!scanwrite - save CSV  |  !scanclose - close window")
        end
    end

    local chatListener = CreateEmptyWindow("InvScannerListener", "UIParent")
    chatListener:Show(false)
    chatListener:SetHandler("OnEvent", function(this, event, ...)
        if chatListenerEvents[event] then chatListenerEvents[event](...) end
    end)
    chatListener:RegisterEvent("CHAT_MESSAGE")

    BuildWindow()
    Msg(string.format("Loaded for %s! Type !scanstart to begin.",
        X2Unit:UnitName("player") or "Unknown"))
end

UIParent:SetEventHandler(UIEVENT_TYPE.ENTERED_WORLD, EnteredWorld)
