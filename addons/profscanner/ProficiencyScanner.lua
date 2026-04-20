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
ADDON:ImportAPI(API_TYPE.ABILITY.id)
ADDON:ImportAPI(API_TYPE.UNIT.id)

local OUTPUT_FILE = "../Documents/Addon/profscanner/proficiency_scan.csv"

local function Msg(text)
    X2Chat:DispatchChatMessage(CMF_SYSTEM, "[ProfScanner] " .. tostring(text))
end

local function ScanAndWrite()
    local allInfos = X2Ability:GetAllMyActabilityInfos()
    if not allInfos then
        Msg("No proficiency data found. Try again after fully loading into the world.")
        return
    end

    local charName = X2Unit:UnitName("player") or "Unknown"
    local timestamp = os.date("%Y-%m-%d %H:%M:%S")

    local lines = {}
    lines[1] = "skill_name,points,character,last_scanned"
    local count = 0

    for _, info in pairs(allInfos) do
        if info and info.name then
            local name = tostring(info.name)
            -- Remove CSV-unsafe characters
            name = name:gsub("[,\"\r\n]", "")
            if name ~= "" then
                local points = (info.point or 0) + (info.modifyPoint or 0)
                local charSafe = charName:gsub("[,\"\r\n]", "")
                local tsSafe   = timestamp:gsub("[,\"\r\n]", "")
                count = count + 1
                lines[count + 1] = name .. "," .. tostring(points) .. "," .. charSafe .. "," .. tsSafe
            end
        end
    end

    local file = io.open(OUTPUT_FILE, "w")
    if file then
        file:write(table.concat(lines, "\n"))
        file:close()
        Msg(string.format("Exported %d proficiencies. Import in the Companion App!", count))
    else
        Msg("Error: Could not write file. Check the profscanner folder exists.")
    end
end

local function EnteredWorld()
    local listener = CreateEmptyWindow("ProfScannerListener", "UIParent")
    listener:Show(false)
    listener:SetHandler("OnEvent", function(this, event, channel, relation, name, message, info)
        local msg = string.lower(message or "")
        if msg == "!profscan" then
            ScanAndWrite()
        elseif msg == "!profhelp" then
            Msg("Commands:")
            Msg("  !profscan  - scan all proficiencies and export to CSV")
            Msg("  !profhelp  - show this help")
        end
    end)
    listener:RegisterEvent("CHAT_MESSAGE")

    local charName = X2Unit:UnitName("player") or "Unknown"
    Msg(string.format("Loaded for %s. Type !profscan to export proficiencies.", charName))
end

UIParent:SetEventHandler(UIEVENT_TYPE.ENTERED_WORLD, EnteredWorld)
