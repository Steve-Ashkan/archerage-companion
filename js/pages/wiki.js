// ─── ARCHERAGE WIKI / GUIDES PAGE ────────────────────────────────────────────
// All content stored in localStorage, seeded with AviPedia content.

const WIKI_KEY = "wikiData";
const WIKI_VERSION = 2; // bump to re-seed if content updates

// ─── DEFAULT CONTENT ─────────────────────────────────────────────────────────

const DEFAULT_WIKI = {
  version: WIKI_VERSION,
  categories: [
    { id: "newbie",        icon: "🌱", name: "Newbie Guides",       color: "#86efac" },
    { id: "gear",          icon: "⚔️",  name: "Gear Guides",         color: "#93c5fd" },
    { id: "utility",       icon: "🔧", name: "Utility & Info",      color: "#fcd34d" },
    { id: "proficiency",   icon: "🎣", name: "Proficiency Guides",  color: "#fb923c" },
    { id: "entertainment", icon: "🎮", name: "Entertainment",        color: "#c4b5fd" },
    { id: "classes",       icon: "🗡️", name: "Class Guides",         color: "#f87171" },
    { id: "personal",      icon: "📓", name: "My Notes",             color: "#94a3b8" }
  ],
  guides: [

    // ── NEWBIE ──────────────────────────────────────────────────────────────

    {
      id: "early-game", categoryId: "newbie",
      title: "Must-Know Early Game Info",
      summary: "Gems, daily contracts, recommended settings, level milestones and more.",
      content: `# Must-Know Early Game Info

## General Level Info

**Below lv52 you can:**
- Use labor for: Larceny (opening purses/crates), auto fishing, refining archeum, crafting songs
- Do Crimson Rift (unlocks lv30)
- Some daily contracts
- Join a guild for buffs and exp
- Work on low-level achievements (press V)
- Sparring arena lv30, Drill Camp lv40
- Start the custom questline at lv50 in Golden Ruins

**At lv52:**
- Blue Salt Brotherhood questline (rewards Dawnsdrop set)
- Join Grimghast Rift (can pick up dropped packs)
- Apply for support pack in the AR Discord
- Turn labor into gold/gems

**At lv55:**
- Finish upgrading quest gear to T1 Hiram
- Join raids for Hiram weeklies
- Unlock Ancestral levels for skill varieties
- Join Whalesong and Aegis events for honor
- Castle quests for territory coins
- Red Dragon, Halcyona War (gear requirement)

**Other:** At lv45 you can be power leveled — ask in nation chat. Lv50 unlocks seasonal events.

---

## Daily Contracts

Contracts earn 3–50g, 1–3 gilda, and some vocation. Open all 7 contracts for the bonus reward.

You have **3 attempts** to reroll a contract if it's too tough. Click the button in the top right of the contract UI.

---

## (!) Gems Define Your Gear

Gems are critical — neglecting them means your gear won't perform.

**Avoid T1 honor store gems** — upgrading one gem to max costs 7k honor to buy + 30k to reach T6, plus 51 superior glow lunarite, territory coins, and tons of labor.

**Better approach:** Sell 2x Serendipity Stones (from 40k honor) and buy a T3 gem on the AH. Saves labor and lets you keep territory coins for other projects.

**Key gem facts:**
- Crafting gems = Handicrafts prof; slotting gems = Alchemy prof (reduces cost from 500→300 labor at 230k)
- Honor-enhanced gems **cannot be extracted** — crafted gems CAN be moved to new gear
- Glorious evenglow gems drop from world bosses, cannot be upgraded but are reusable
- Sunglow gems drop from last dungeon bosses, can be upgraded like honor gems
- If you lack Handicrafts prof to craft T2/T3 gems, use the Craft Request Board (press O, search lunagem)

---

## Recommended Settings

1. Choose custom camera mode for better FOV
2. Enable health/mana display in top-right corner (relog required)
3. Check the five smoothness boxes in game settings
4. Disable chat filter; use fixed overhead sign for marked players
5. Enable all skillbars
6. Turn off random chat icons in chat window settings

---

## Random Info

- **Credits:** Donate, buy on AH (1000 credit pack is best value per credit), or earn from events
- **Rowboat achievement:** Post a boat on craft request board for 10 lumber to get a basic fishing rod reward
- **Check Details tab** in Daily Schedule UI for custom events (labor pots, merit badges, etc.)
- **All proficiencies** can turn labor into gold — find what you enjoy
- **New player buff token:** Save it for when you can farm mobs more efficiently
- **Guild missions:** Complete them for prestige — your guild values the support greatly
- **In-game encyclopedia:** Hit Escape → middle of system menu to check gear stats at various grades`
    },

    {
      id: "newbie-faq", categoryId: "newbie",
      title: "Newbie FAQ",
      summary: "Common questions about gearing, server, gold, bag space, dungeons, commerce, mounts and more.",
      content: `# AR Newbie FAQ

*Use Ctrl+F to search for specific topics.*

---

## Quick Answers

**Q: Is it worth starting this server as a new player?**
A: Yes. Many custom features help new players catch up. Helpful community, custom events like racing, plenty to do.

**Q: How do I make gold?**
A: Turn labor into gold, sell quest/event items, pick something you enjoy. All proficiencies can generate income.

**Q: When do dailies/weeklies reset?**
A: Dailies reset at 12am server time. Weekly reset is Sunday 12am (server time). EDT in spring/summer, EST in fall/winter.

**Q: Is there a wiki?**
A: Yes — ArcheRage Wiki, regularly updated with custom items, quests, and screenshots.

**Q: How is fishing on this server?**
A: Custom buffed — gold yield increases with proficiency. Custom event quests on Tuesdays/Saturdays for extra rewards.

**Q: Should I upgrade gems with folio recipes or luna charms?**
A: Use folio recipes to T3 glorious — cheaper on AR. Luna charms require huge honor and labor investment.

**Q: Does the server run on Linux?**
A: Yes, via Wine. Not officially supported but it works.

**Q: Do I need to join a guild?**
A: Yes — guild buffs are a huge help for leveling and gearing. Join early, don't wait.

**Q: Where is a Farmer's Workstation?**
A: Any 8x8 scarecrow garden in housing zones has a public one. Also available on marketplace for 500 credits.

**Q: Where can I see server time?**
A: Game launcher and the Daily Schedule UI (bottom right corner of screen).

---

## Bag Space

**Options:**
- Increase warehouse/bag space (50→100 slots with gold, 100→150 needs expansion scrolls from marketplace/manastorm/AH)
- Get land: gardens/farms hold 1 dimensional chest, houses hold multiple, silos same as mansions
- New character for extra bag/warehouse space
- Achievement storage boxes (mounts, gliders, pets, vehicles, instruments, music sheets)

**Achievement storage boxes:**
- Pale Pal → mount storage
- Airshow Expert → glider storage
- Pretty Darn Adorable → pet storage
- Sailor → vehicle storage
- Musician → instrument storage
- Composer → music sheet storage
- Coin Hoarder → infusion storage

**Grind option:** Treasure Hunt event on Wednesdays for Sea Diver's Chest.
**Long term:** Pocket Chests in marketplace (100 slots, no upgrade).

---

## Useful Credit Items

**Must-Haves:**
- Multi-Wagon Upgrade Ticket (100cr x7) — upgrades support pack wagon
- Farmer's Blessing Stipend (1000cr/month) — increases labor cap + daily pots
- Various Pocket Chests (1000cr each) — inventory space
- Expansion Scrolls v1 (50cr x10) — bag/warehouse 100→150
- Otherworld Storage Chest (500cr) — fits on any plot
- Expansion Scrolls v2 (50cr x5) — expand otherworld chest

**Avoid Buying:**
- "Packages" (hiram packs) — extremely overpriced
- Consumables: revive scrolls, tonics, alembics, taxes, snowflakes — found at merchants or drop from purses/events
- Breeze or Armageddon mount armor — get free armor from Serpentis instead

---

## Dungeons

Do greater dungeons! Reasons:
- All bosses drop 1-3 clear synthium shards (needed for stat costumes and undergarments)
- Last boss has chance for sunglow lunagem (needed for waist gems + salvage for superior glow lunarite)
- Salvage all armor/weapons for sunlight/moonlight archeum crystals
- Use abyssal shards to craft more armor at Distorted Dimension Workbench at dungeon entrances

---

## Commerce

Seeing as rewards increase with proficiency, level that first.

**Ways to start:**
- Pick up packs dropped at Community Centers for free proficiency
- Craft larders at Farmer's Workstation (Salve type has no prof requirement)
- Run basic or fertilizer packs for short traderuns

**Good to know:**
- Saturdays: custom Merchant's Day quests reward 45 loyalty for 28 packs
- Regular packs + gilda packs: pick up daily for 1 Lucky Coin per 20 packs
- Dawnsdrop Boots boost gold earned per pack

---

## Land Issues

**Option 1:** Join a guild/family — guildies often share land access.

**Option 2:** Farmhand system — minimum space is an 8x8 private workbench (upgrade to silo for more storage). Farmhand crops not affected by climate.

**Option 3:** Farm in the wild — every zone has crops/trees for its local specialty packs. Wild spawns reset every maintenance.

**Option 4 (new/returning players):** Mistmerrow plot — one plot allowed, no land elsewhere. Sizes: 8x8, 16x16, 24x24.

---

## Mounts

**Early game recommendations:** mounts with stealth, invincibility dash, or extra movement skill.

**Race mounts:** Snowlion (Nuia), Leomorph (Haranya), Black Arrow (from Mirage Isle horse quest — 50 gilda).

**Black Arrow quest:**
1. Go to Mirage Isle, find horses
2. Buy one horse for 50 Gilda Stars
3. Find Daru "Lunaru" for the quest
4. Raise horse to lv50, buy Purebred Certificate at any Stablehand
5. Return to Mirage Isle to deliver quest

**Manastorm crystals** can also buy various mounts from the manastorm shop.`
    },

    {
      id: "daru-guide", categoryId: "newbie",
      title: "Daru Potato Guide",
      summary: "Daru transformation, costumes, synthesis stats, Isle of Abundance dungeon.",
      content: `# Daru Potato Guide

## Daru Transformation

A questline is required to unlock the daru transformation. For each faction, it starts in their respective hero hall at the warehouse daru. The quest is called **"Jealousy"** and a **180k achievement for any proficiency** is required.

Once you finish the questline (lots of walking between NPCs), you'll receive a scroll to activate the transformation skill. Scroll all the way down in the skill UI to find it. Use it again to cancel.

---

## Daru Costumes

### Acquiring Costumes

**Two types of stat costumes + one skin crate:**

1. **Vocation store costume** — goes up to Legendary, buy once per month. Legendary has 3 stats.
2. **Credit store costume** — goes up to Eternal, 3 stats available.

The stat and skin costumes equip in a separate slot (small button below regular costumes in char info).

**Opening a costume box:**
- Only the **grade rolled** and **rerolls remaining** matter — not what you choose from the list
- One free reroll, additional rerolls cost 2 Manastorm Crystals each
- Once Eternal is rolled, a popup prevents accidental re-rolling
- If you close the UI accidentally, reopen at bottom-right of screen (next to loyalty button)
- 30-minute window to choose

### Synthesis Stats

Amount of stats per grade:
- **3 stats:** Legendary–Eternal
- **2 stats:** Heroic(?)–Epic
- **1 stat:** Grand–Arcane(?)

Aim for Legendary or higher. Stats are randomly assigned when opening a crate.

**Important:** This gear is mainly for min-maxing. Don't waste gold on credit costumes if other things are higher priority.

### Salvaging Costumes

- 10 vocation store costumes → 10 Daru Costume Pieces → combine into new costume
- Credit store costume salvage → 2 Manastorm Crystals
- **Note:** Despite descriptions saying otherwise, you CANNOT increase costume grade. "Synthesis Available (~Eternal)" is inaccurate. Only the listed acquiring methods get you Eternal.

### Improving Costumes

Awaken costumes and change stats using materials from the Isle of Abundance dungeon. Crafted at Mirage Isle.
- Awakening improves synthesis stats and equip effects
- Special serendipity stone randomly changes one stat

---

## Isle of Abundance

**Requirements:** Must have the Daru transformation unlocked.

After transforming, you get a single-use quest requiring 500 labor to enter.

**Group:** 4 players, queues similarly to Abyssal Library.

### Stage 1
- You become a Daru character — check the exclamation above your head for your assigned job
- Go to your assigned area on the map (follow the arrow signboards)
- Mine, farm, gather, or log as many items as possible
- Part of the reward is based on individual contribution
- Collect 2 shinies → use second skill for production speed boost
- After stage ends, take the teleport gate to stage 2

### Stage 2
- Interact with the cactus to choose one of two skills (bugs or crabs)
- All 4 players must communicate which skill they choose — split evenly
- Press H to start phase 2: protect the cactus
- Kill your assigned mob type ASAP
- Shiny versions have more health

### Rewards
- After protecting the cactus, it drops a treasure chest all players can claim
- Stage 1 contribution rewards delivered to mail`
    },

    // ── GEAR ────────────────────────────────────────────────────────────────

    {
      id: "hiram-guide", categoryId: "gear",
      title: "Hiram Gear Guide (10.0)",
      summary: "Everything about Hiram: getting gear, quests, Garden of the Gods, upgrading, T6 and Hiram Rifts.",
      content: `# Hiram Gear Guide (10.0)

Hiram is grindable gear that doesn't require large gold investment like Erenor.

**Lock your pieces as soon as you have the stats you want to avoid accidental feeding!**

---

## Easy Starting Options

- **Support pack** (new players): Divine Radiant Hiram set — apply in AR Discord
- **Returning player pack**: Celestial Radiant Hiram set
- **Achievements**: Gear pieces starting at Grand grade (more reroll attempts), later achievements give infusions and tempers (solar then lunar)

---

## Daily/Weekly Quests

### Weekly Rewards
- **Diamond Shores Guard (DS/Sungold Fields):** 60x Awakening Scroll + 20x Unidentified Auroran Crystal; choose 42x Mysterious Infusion OR 56x Awakening Scroll
- **Guardian of Reedwind (Exeloch/Reedwind):** 90x Awakening Scroll, 30x Radiant Infusion, 1x Decrystallization Scroll
- **West Hiram Mountains (two weeklies):** Choose 70x or 140x Radiant Awakening Scroll, or 56x/112x Radiant Infusion

**Tip:** If you still need to awaken gear, choose scroll rewards — achievements supply extra infusions.

### EHM Daily Rewards
- Mammoth/Treant: 20x Brilliant Hiram Awakening Scroll each

### EHM Weekly Rewards
- Amaitan Meadows: 80x Exalted Infusion OR 30x Brilliant Awakening Scroll
- Waterfall: 150x Radiant Infusion OR 15x Brilliant Awakening Scroll + 1x Decrystallization Scroll

### Free Daily Quests (Marketplace)
Press N → search "quest" → claim free quests daily for 2x Mysterious Infusion + 5x each Awakening Scroll type.

---

## Garden of the Gods

Located in Eastern Hiram Mountains. Accept the "Fairy Request" daily quest inside.

**Point collection:**
- Various activities give 1–10 points each
- Rank 6 minimum = 1x T5 awakening chance per day
- Rank 12 = chance at eternal chest (not necessary for most players)

**Important notes:**
- More ranks = more points required
- In groups, points are split between players with the quest active
- Dying loses points and risks rank loss
- Use Fairy Protection potion (1x/hour) to safeguard points + get +50% points
- To exit safely: go to character select

### Garden Fishing (for future prep)
Auto fish with first rod skill = 10 points per fish. With famed fishing + buffs, Rank 1 (2500 pts) takes ~27 minutes. Rank 2 achievable in one hour. Recommend max Rank 2 by fishing.

### Garden Raids
4 bosses spawn every war cycle. Killing all with a raid gives points near Rank 6 to everyone in the raid. Both factions usually make daily raids. Pop Fairy Protection after first boss dies.

---

## Making Hiram Gear

Since 10.0, all gear can be bought from armor/weapon merchants. Infusions combined into [Story Quest Infusion].

**Process:**
1. Buy armor/weapon box from merchant (leather/cloth/plate are cosmetic choice only)
2. Buy feed from general merchant
3. Feed to max stage
4. Awaken using Equipment Awakening Scroll (Rank 1, 2, or 3)
5. Rank 3 scroll must be crafted or bought for honor at Proven Warrior Workbench in hero hall

**Awakening stages:**
- T1 (Hiram) → T2 (Radiant): 1st awakening adds first stat
- T2 → T3 (Brilliant): 2nd awakening adds second stat
- T3 → T4 (Glorious): must be crafted at Proven Warrior Workbench — be 100% sure of stats!

**First stat = one of 5 main stats:** Strength, Agility, Spirit, Stamina, Intelligence

---

## Commonly Used Stats

- **Healers:** Spirit, Stamina + healing power frosts
- **Melees:** Strength/Agility, Stamina; Swiftblade uses dual wield + crit damage in PvP
- **Ranged:** Agility, Stamina; Gunners can use def pen instead of crit damage
- **Mages:** Intelligence, Stamina

---

## Farming Hiram Gear

**Gear zones** (drops gear): Diamond Shores, Heedmar, Nuimari, Marcala, Calmlands
**Infusion/scroll zones**: Reedwind, Sungold Fields, Exeloch, Western Hiram Mnt, Eastern Hiram Mnt

Only mobs tagged **[Abyssal Legion]** drop Hiram gear/items (except West Hiram Mnt where all mobs drop scrolls/infusions).

---

## Upgrading Gear

**Synthesis button** at bottom of bag. Costs 20 labor per synthesis + gold based on exp granted.

**Grade increases** = option to reroll one stat. Save up to 5 reroll chances.

**If piece hits max grade:** Use Serendipity Stone to reroll (expensive — save for costumes/underwear if possible).

---

## Awakening Process

Current tiers: T1 Hiram (max Celestial) → T2 Radiant (max Divine) → T3 Brilliant (max Epic) → T4 Glorious (max Eternal) → T5 Exalted (max Eternal)

**Scroll requirements:** T1→T2: 10x | T2→T3: 25x | T3→T4: 50x | T4→T5: 75x Sacred scrolls

- Every attempt costs 300 labor
- Has chance to fail — fail stacks increase next attempt's success
- Can crystallize on fail — 10k honor scroll to revert (no labor)
- Exp carries over to next tier (max exp divine → Brilliant starts near celestial)
- Special scrolls crafted at printing press give increased success rate + preserve temper

---

## T6 Gear & Hiram Rifts (9.5+)

T5 Hiram must be Eternal before awakening to T6. 75 scrolls per awakening attempt.

**Rift spawns:** Every 4 hours (first at ~5:50am server time), random location in WHM or EHM. Always during war — expect PvP. Map will ping spawn location.

**Quests** (from Encio in WHM or Erika in EHM, requires Ancestral lv33):
- Stop various mob types
- Boss quest required for skill point achievement
- Prequest gives 75x Sacred Hiram Awakening Scroll

---

## Miscellaneous Tips

- Increase larceny proficiency to reduce labor spent identifying gear and infusions
- Don't grind gear in Diamond Shores or Golden Ruins (cluttered with non-drop basic mobs)
- Feed leftover hiram gear into your chosen pieces
- Crimson Rift stage 2: up to 30x Radiant Infusion Supply Kits
- Fall of Hiram City: up to 15x Mysterious Infusion
- Alchemy proficiency lowers gem-slotting cost to minimum 300 labor (from 500) at 230k prof`
    },

    {
      id: "erenor-guidelines", categoryId: "gear",
      title: "Erenor Guidelines",
      summary: "Tips and tricks for crafting and feeding Erenor gear, accessories, weapons, armor and lunafrosts.",
      content: `# Erenor Guidelines

Mentally prepare for a serious grind. Find someone to share it with for efficiency.

---

## General Info

**Tips to survive the grind:**
- Use the direct craft option at an Armorer's
- Save early: boss gear, Territory coins, Acid Gobbets/Cursed Armor Scraps, Mysterious Garden Powder
- Never risk a small proc into the next grade if avoidable
- Salvage dungeon gear for archeum crystals/essences
- Double-check your math (or have someone check it)
- Stock up on labor pots for mass crafting
- Dedicate storage chests to Erenor mats
- Decide which materials to farm vs buy

**All Erenor pieces share:** same experience to feed, same labor for final craft, same gold fee.

**Recommended proficiencies:**
- Alchemy (lunafrosts/infusions/awakening)
- Metalwork/Tailoring/Leatherwork (infusions/crafting)
- Gathering/Farming/Mining (materials)
- Carpentry (most weapons)
- Commerce (more onyx/stabs per cargo)

---

## Accessories

Earrings and rings are the **cheapest** Erenor pieces to feed. Good starting point.

**Don't craft an Erenor necklace** — Eternal Soul Liberator and Archeum Evernight Necklace (Rank 14) are better.

**Starlight Archeum sources:**
- Dungeon accessories: Serpentis, Noryette, SoDL, Hereafter Rebellion
- Shroudmaster/Dreadnaught accessories from dungeons, Karkasse, Hasla
- Rumbling Archeum Trees (vocation/merit/loyalty stores)
- Mineral/Radiant Archeum Tree Saplings
- Treasure maps (any grade), RNG boxes, Auction House, Ancestral Purses

---

## Weapons

**Two recipe types:**
- Weaponry + blazing sunridge ingots (expensive)
- Carpentry + blazing nuri forest lumber (cheaper — recommended)

You can use carpentry to craft a staff/bow/scepter and convert to your weapon type (costs credits). NOT possible for 1H weapons or shields.

**Important:** Convert before T3 — conversion is more expensive at T3.

**Sunlight Archeum sources:**
- Dungeon weapons: Serpentis, MSS easy, GBC, GHF
- Archeum trees (vocation/merit/loyalty stores)
- Treasure maps, RNG boxes, AH, Ancestral Purses

---

## Armor

Chest is most expensive. All armor types use same material amounts, just different types (ingots/leather/fabric).

Cloth and leather sets most popular (plate set effect gets nerfed in future).

**Moonlight Archeum sources:**
- Dungeon armor: Serpentis, MSS normal, GHA, GKC
- Archeum trees, treasure maps, RNG boxes, AH, Ancestral Purses

---

## Stats & Awakening

- Roll **main stat** after crafting (first slot)
- Roll **stamina** in second slot after unlocking
- Save free reroll chances for reaching Legendary
- At Legendary, awaken to T2 Radiant to unlock third slot
- T4 Refined is the final tier (added June 10th per patch notes)

---

## Feeding Methods

### General
- Save boss gear (arcane/heroic/unique/celestial) for early grades
- Regrade boss gear to get to ~90% exp before feeding 6 infusions into next grade
- Use cheap regrade charms to decrease fail chance
- Only use regular Armor Regrade Scrolls (not resplendent)

### Accessories
- Useful at Legendary (stats barely increase above that)
- Only need boss gear at start, highest crafted infusion needed is Epic
- At ~90% epic, just enough to reach legendary

### Weapons
- Use Ayanad staves (lumber-based) instead of infusions at high grades — cheaper
- At divine ~85-90%: feed 6 divine Ayanad staves to skip to epic
- Feed legendary staves into high mythic, awaken to T3
- Once T3, add first 4 weapon levels, max exp, then feed 14k exp into eternal all at once → unlocks lv10 without needing eternal weapon infusions
- **Shields have no levels** — feed 6 legendary staves at highest % to skip to eternal

### Armor
- Cheaper than weapons to infuse (easy to farm cotton/wool)
- Feed 6 divine crafted infusions to high % → use epic infusions → 6 epic Ayanad staves = mythic
- For levels: feed enough to go 3500 exp over 0% eternal (covers all 5 armor levels) all at once

---

## Lunafrosts

Only useful with a full set (weapon + gear). Set bonus is the key.

- **Mages/Healers:** Ocean Lunafrost set
- **Melees/Archers:** Typhoon Lunafrost set

Same material amounts for all frosts, only T4 potion type varies.

**Book of Auroria sources:** Haunted Chest, treasure maps, Marathon event reward, Magic Bean (marketplace), Auction House

---

## Miscellaneous

- Hide/change Erenor wing color with marketplace items
- Wing color previews available on AR forum`
    },

    {
      id: "accessories-guide", categoryId: "gear",
      title: "Accessories in 10.0",
      summary: "Complete overview of rings, earrings, necklaces, quest rings, lunafrosts and special accessories.",
      content: `# Accessories in 10.0

Generally: earrings = defensive stats, rings = offensive, necklaces = either. Accessories are usually the last thing to work on — they mainly serve to min/max.

**Notes:**
- Accessories cannot be tempered or have gems added
- Dungeon/world boss drops can be salvaged for starlight archeum crystals
- Crafted lunafrosts or loyalty store lunafrosts can be added

---

## Early Game Options

### Option 1: Illustrious Accessories
- Buy for 50g at armor merchant, or craft with 500 Revenant Soul Stones
- Quest in Diamond Shores (near dungeon portal): use 500 stones → rewards 1500 more stones
- Farm Riven Gates (DS) for stones; daily quest rewards 60 stones for 50 mob kills

### Option 2: Noryette (T1/T2)
- Rings have PvE damage boost; earrings reduce damage taken from mobs
- Guaranteed drop at wave 30+ completion
- T1 heroic keeps the small PvE boost; T2 adds +1% PvE stat per accessory
- Wearing these during Noryette grants extra in-instance buffs

### Option 3: Carmilla's Earring (Healer)
- Drops from crate after 2nd room boss in Serpentis
- Binds on pickup, cannot be regraded/synthesized/awakened
- Can wear two at once; can be frosted

---

## Long-Term Options

### Noryette T3
- Mainly used by healers (Erenor ring doesn't cover all healer stats)
- Insanely expensive to feed vs stat increase — don't go above Legendary if just farming mobs
- Combo/equip effects only increase per tier, not per grade

### Erenor T2 (BiS for PvP)
- Extra 4th synthesis stat vs Noryette
- No combo/equip effect
- Earring stats similar for all classes; ring stats tailored to class
- Most common combo: 3x Erenor accessories + Hiram ring
- Since 9.5: can awaken Erenor accessories to T3 Brilliant

---

## Quest Rings

### #1 Crimson Watch Ring
- Quest reward from race quest Chapter 16: Security Concerns
- Cannot be regraded, awakened, or upgraded
- Can add a lunafrost

### #2 Ynys Ring
- Quest starter from last boss in Greater Howling Abyss (Ancient Titan Musperosa)
- Found in quest log under "Myths and Legends"
- Good option for an off-spec ring
- Less effort to max than Dream Ring or Hiram Ring

### #3 Flawless Dream Ring
- Quest starter drops from last boss in Serpentis — takes you all over Erenor
- Start ASAP — long grind
- Ring upgrades from arcane to celestial as you complete questline
- Timed version needs reactivation every 3 months
- Detailed guide available on AR forum

### #4 Augmented Hiram's Chosen Ring
- Quest starter from killing mammoth in Eastern Hiram Mountains (same as daily quest mammoth)
- Start ASAP alongside Dream Ring for efficiency
- Has defensive stats — only ring with resilience and toughness

### #5 Flawless Hiram's Chosen Ring (BiS Endgame)
- Combines Augmented Hiram's Chosen Ring + Flawless Dream Ring
- Can have both offensive AND defensive stats
- Each character gets only one of each ring — choose stats for your main class

---

## Necklaces

### Honor Necklace (Evernight/Daeier)
- Evernight most commonly used: good survivability in PvE/PvP
- Mainly healers and frontliners in PvP
- Put on skillbar to use shield/immunity effect
- Evernight shield can stack with Mana Barrier from Vitalism

### Soul Liberator (Best-in-Slot)
- From Hereafter Rebellion solo dungeon
- Used by healers (PvE farming) and DPS (PvE + PvP)
- Can make multiple versions for different classes

---

## Special Accessories

- **Arena Ring:** Rank 1 reward, similar to Ynys Ring but with Toughness instead of Def Pen
- **Mermaid's Breath:** Earring from Riesig (ocean world boss) — breathe underwater permanently
- **Seasong Earring:** From Dahuta in SoDL — increases swim speed (equip two, or combine with Mermaid's Breath)
- **Forsaken Pirate Set:** From Nazar (ocean boss) — up to 6% cannon damage with 5-piece set

---

## Lunafrosts

- Indomitable: physical defense
- Distorted: magic defense
- Transcendent: magic attack
- Love: healing power
- Tracker: ranged attack
- Hostility: melee attack

Available in loyalty store and folio (differ only in pigments/oils used).`
    },

    {
      id: "costumes-undergarments", categoryId: "gear",
      title: "Costumes & Undergarments",
      summary: "Old and new costume systems, materials, feeding methods, lunafrosts and storage.",
      content: `# Costumes & Undergarments

Per 8.0, old system mainly for mages/melees. New system better for other classes (easier to get needed stats).

**Per 9.0:** Costumes now have descriptions indicating which feeding system they use. No soap needed to refresh new system stats every 30 days.

---

## Old System (Pre-8.0)

### Sources
- **Costumes:** Crafted (folio) or marketplace (look for "basic costume" in name)
- **Undergarments:** Crafted or marketplace (loyalty or merits)

### Materials
- Same materials still available
- Misagon's Crystal moved from prestige store to **honor store**

### Special Feeding Method (Cheaper Alternative)
Uses fewer Misagon's Crystals, more synthium stones (stones are cheaper).

**Costumes:**
- Feed to **Divine** before rolling stats (stat pool increases penultimate time at divine, last at legendary)
- Roll Received Damage Reduction before reaching rare grade
- Feed 5x extra Clear Synthium Stone when going grand→rare
- Feed 6x Vivid Synthium Stone when one stone from heroic
- No need to feed stones after hitting divine
- Saves ~429x Misagon's Crystals vs original method (~15-20k gold value)

**Undergarments:**
- Feed to **Celestial** before rolling final stats (stat pool increases last time here)
- Same stone feeding trick at grand→rare and near heroic
- At celestial: feed 24x Lucid Synthium Stone or end result won't be 4400/4400 eternal
- Saves ~413x Misagon's Crystals vs original method (~14-19k gold)

---

## New System (Post-8.0)

### Synthesis Materials Sources
- Basic grade worn costume in honor store
- Unidentified worn costumes in manastorm shop (must identify, can vary in grade)

### Feeding (45k total exp)
- Procs possible while feeding — save high-grade feed (celestial/unique) for big procs
- Fewer unrelated stats in stat pool (no magic backstab/melee crit rate etc.)

### New System Costumes
- Crafted only — search "combat costume" in folio
- Same recipe as old costumes — double-check you craft the correct type!

### New System Undergarments
- Currently only available for credits

---

## Lunafrosts

**Undergarments:** +9 lunafrosts from loyalty store available
**Costumes:** Also found in honor store

---

## Temporary Starter Costume
New to the server and not ready to grind? In Mirage Isle, enter the building behind you when you arrive. Find Librarian Lutino on the right side. 6 mannequins sell 14-day stat costumes for **50 Gilda Stars** each.

---

## Costume Storage

**Splendid Costume Chest:** Trade bound synthium shards between characters for use on stat costume/undergarments.

**Trading costumes between characters:** Craft dimensional storage chests at your house. Accessible by all characters on your account — allows trading stat costumes, skins, and undergarments.

*This trading method only works for this specific chest type.*`
    },

    {
      id: "library-gear-guide", categoryId: "gear",
      title: "Library Gear Guide",
      summary: "Disciple's and Immortal Warden gear progression, EXP requirements and awakening paths.",
      content: `# Library Gear Guide

See the **Library Gear** tab in this app for full EXP requirement tables and Specialisation Level costs.

---

## Overview

Three tiers of library gear:
- **T1 Disciple's** — starts at Grand, awakens at Mythic
- **T2 Radiant Disciple's** — awakens at Mythic
- **T3 Immortal Warden** — awakens at Unknown (highest tier)

---

## Awakening Paths

### Disciple's → Immortal Warden (Optimal Gold Path)
1. Awaken T1 up to **Eternal**
2. Make it T2 (will be Legendary with ~20k EXP needed to hit Mythic)
3. Once T2, make it **Eternal** again
4. Feed enough EXP for specialisation lv 1→2 for gear and 1→4 for weapons
5. Cap the piece as close to max EXP as possible
6. Awaken to T3 (will still be Eternal)
7. Feed enough EXP to finish lv 3→5 for gear and 5→10 for weapons

### Immortal Warden (Ipnysh Drop Shortcut)
If you get a gear/weapon drop in Ipnysh Sanctuary it will be **Celestial**. Just make it Eternal and reach lv5/10 specialisation to finish the piece.

---

## Specialisation Levels

- **Weapons:** 10 levels, armor: 5 levels
- Requires EXP, gold, and labor per level
- See the Library Gear tab for full cost table

---

## 20k Infusion Tip

The T3 Immortal Warden tier uses 20k infusions at key grade thresholds. Plan feeding accordingly to avoid waste.`
    },

    // ── UTILITY ─────────────────────────────────────────────────────────────

    {
      id: "error-faq", categoryId: "utility",
      title: "The Error FAQ",
      summary: "Common bugs, game won't start fixes, keyboard bugs, combat bugs and launcher issues.",
      content: `# The Error FAQ

## FAQ

**Q: My game won't start?**
A: See "My Game Won't Start 101" section below.

**Q: Verification/authorization emails not arriving?**
A: Check spam folder; avoid Hotmail (use Gmail); mail delivery bots can be slow.

**Q: Wrong login info error?**
A: Option 1: Wrong launcher (NA vs EU). Option 2: Using forum credentials (different from game/website credentials).

**Q: Can't apply for support pack?**
A: Website packs require prior donation. Go to the AR Discord and apply in #service_requests.

**Q: Item won't count for my achievement?**
A: You had the item before the achievement was added. Drop it in warehouse/storage chest and take it back out. If still broken, contact Sparkle.

**Q: Terrible loading times?**
A: Contact support with your system specs for specific fixes.

**Q: In-game chat won't show special characters (ë á ç û)?**
A: You've selected Korean Font — it doesn't support special characters.

**Q: Optimization button won't turn off?**
A: Go to Settings and find the check box for default appearances instead of using the button. There's also an addon for this in Discord.

---

## Common Bugs

### Farmhand Vigor Not Resetting (Mondays)
Close game, go to "Date & time" settings, then either:
- Untick "adjust for daylight savings time automatically"
- Change your time zone

Restart game and try adding vigor. Also try applying a Vitalizing Treat.

### Keyboard Bugs
Tab out and back in, or spam the Ctrl key if:
- Skills requiring a target are unusable
- Pressing V in chat pastes clipboard text
- Pressing A in chat deletes text

### Combat Bug
If stuck in combat:
- Hit a mob and drop aggro (stealth/Nui/sky emp)
- Hit a mob and kill it
- Hit a player and wait
- Let your character die

### Relog Bugs (relog to character select fixes these)
- Visual bug: burning residence
- Empty NPC merchant store
- Unable to add pack to castle warehouse
- Combat bug after guard death

### Item Bugs
If using evenstones/purses/infusions while a loading screen triggers, items may become unusable.
Fix: Wait a while, or restart the game.

---

## My Game Won't Start 101

### Loading Screen Crashes
1. Clear game cache: close everything → go to C:\\ArcheRage\\Documents → remove all files EXCEPT screenshot folder
2. Unplug headset (SteelSeries/Arctis7 are known to cause issues)
3. Uninstall/reinstall audio software (e.g. Razer Synapse) → restart PC → run launcher repair
4. Add AR game files to anti-virus exceptions → restart PC → run repair
5. Delete game_pak file → run repair
6. Install via torrent download instead of launcher
7. Reset router or try VPN

### Splash Screen Crashes
- Stuck at first 3 words (+ PC crash): delete game_pak → run launcher repair
- Stuck at last 3 words: delete and reinstall Razer Synapse → restart PC
- Error "CryRenderD3D9.dll error 126": reinstall DirectX 9.0c
- "Failed to load game data": delete game_pak → run launcher repair

### Server Select Screen Issues
If server select looks wrong/broken:
Go to Documents/ArcheRage → open system.cfg → find ui_scale → set to 1.0 → save → relaunch
OR: delete system.cfg entirely and relaunch.

### Crashes While Playing
- Swap DirectX setting in screen settings
- Lower game's sound quality
- Get a new computer :^)

### Launcher Issues
- Version check error: connection issue, reset router or try later
- Stuck on "verifying files": wait or restart launcher
- Stuck on "Save client data…" or "Launch Error": anti-virus blocking files — add to exceptions, run launcher as admin, run repair, restart PC
- Wrong credentials: double check you're using the correct launcher for your region (NA vs EU)

### "I Click Play and Nothing Happens"
Check that cloud delivered protection is turned off. If all usual fixes fail (delete game_pak, add AV exceptions), check Discord for additional support.

### PC Memory Goes to 100%
Make sure display settings and GPU settings match Hz (e.g., if one is 59.92Hz and other is 75Hz, they must match).`
    },

    {
      id: "addons-101", categoryId: "utility",
      title: "Addons 101",
      summary: "How to install addons, addon manager, key addons: dark mode, title swap, raid schedules, AviPedia and more.",
      content: `# Addons 101

**Important:** Access this guide in a browser while installing addons, not via the in-game AviPedia addon — easier to tweak settings with game closed.

---

## Setup (Do This First!)

1. Launch your game normally
2. Click **Settings** in top-right of server selection screen
3. Choose "Addons" from the left list
4. Check the boxes for addons you want to enable
5. **Close your game**
6. Extract addon files into: Documents\\ArcheRage\\Addon\\

**!!! Any changes to the addon folder MUST be done before starting the game !!!**

**Good to know:** Redo your standard settings after copying addons (some reset to default like UI size).

---

## Addon Manager

Download from the AR Discord. Extract zip to desktop and run.

- Login with Discord account in top-right corner
- Not every developer uploads here — some still use Discord threads
- Includes a backup folder for overwritten addons
- Sort addons by various methods; list view shows more preview text
- Dark mode available via the cogwheel button

**Always check the box for any new addon downloaded via the manager!**

---

## Key Addons

### Bluesalt Bonds (!bsb)
Shows which BSB quest is in which zone on your current continent.

Install: Download zip from Discord → extract to addon folder → launch game → type !bsb

### Dark Mode
Converts regular UI to dark mode — highly recommended.

Install: Download from Discord or Addon Manager (recommended for easier updates) → extract to addon folder → click yes to replace ui folder → launch game.

*Updates are posted in the Discord thread. Big updates happen periodically.*

### Title Swap
Swap titles instantly without navigating menus.

**Setup:**
1. Download from Discord
2. Extract to addon folder
3. Find title IDs on AR Wiki (use Title tab, NOT buff tab)
4. Open titlechange.lua in notepad
5. Edit button names and title ID numbers
6. Optional: add more buttons by copying code lines
7. Find your title name via wiki, add ID to code
8. **9.5 fix:** Replace "ApplyButtonSkin(button, GetButtonSkin())" with "button:SetStyle("text_default")"
9. Save, launch game

*Buttons won't work in Garden of the Gods, Decorated Warrior, or similar instances.*

### Auto Role Setter
Auto-sets your party role — must-have for rushed content or PvP.

Install: Download → extract to addon folder → open LUA file → change role number to your preferred role (healer = pink) → save → launch game.

### Power Ranger Button
Quick button to toggle performance mode when many players are around (PvP/events).

Install: Download → extract to addon folder → launch game → activate in character selection.

### Raid Schedules
See event timers in-game without tabbing out. Alternative to sadly.io for single-screen setups.

Install: Download → extract → activate in character selection → drag button to preferred position.

### AviPedia In-Game
Access AviPedia guides without leaving the game.

Install: Download globals folder + avipedia folder → place both in Documents\\ArcheRage\\Addon\\ → activate in character selection → check "avipedia" box.

*Has its own refresh timer — relaunching game doesn't affect it.*

### Bag Counter
Shows bag slot count at a glance without opening bag UI.

Install: Download → extract → activate → move icon to preferred position.

---

## Bug Fixes: Button Position Not Saving

1. Go to the "Working" folder inside your game installation folder
2. Find the "pos" file for the addon
3. Right-click → Properties → turn off "Read Only" → click OK
4. Open file, change coordinates (X = horizontal, Y = vertical)
5. Save file
6. Right-click → Properties → turn Read Only back ON (required or game will override it)
7. Launch game

---

## Other Recommended Addons (from Addon Manager)

- **Treasure map hunter** — sort and find treasure maps
- **Health plate and symbol resizing** — more efficient PvP in big bar mode
- **Folio 2.0** — see pack values before running them (affected by prof and buffs)
- **Default appearance changer** — power ranger mode without opening settings
- **TalkDock** — cross-chat between Discord and in-game guild chat (requires guild bot)`
    },

    {
      id: "annoying-quests", categoryId: "utility",
      title: "Info on Annoying Quests",
      summary: "Detailed help for custom race quests, dream ring, Hiram ring, RNG quests and lore quests.",
      content: `# Info on Annoying Quests

*Use Ctrl+F to search for specific quest names.*

---

## Quest FAQ

**Q: Can't find my next green/race quest?**
A: Change quest settings to Unlimited: Options UI → "Quest Details Map Display" → Unlimited. Check any zone map to find it.

**Q: Quest marker on map but no quest at location?**
A: Event quest NPC — either seasonal, only spawns at certain time of day, or both.

**Q: When do dailies/weeklies reset?**
A: Dailies: 12am server time. Weekly: Monday 12am server time.

**Q: Castle water/log not working for quest?**
A: Pick up the quest FIRST, then gather log or water from the tree trunks/veins.

**Q: Green quest abandons itself on logout?**
A: You have 2/2 green quests already. A third will abandon itself on logout. Free up a slot.

---

## Custom Race Quest Highlights

### Chapter 100 - Quest 3: Dangerous Journey
Spots: Bone Island, Seabug Isle, Kraken Island, Ynys Isle (west side beach). Signs reset so same location can be used 4x. Ynys Isle easiest from Solzreed.

### Chapter 100 - Quest 10: The Enemy is Near!
Quest item on highest tower of Riven Gates in Diamond Shores. Closest TP: "Crimson Watch Guardpost."

### Chapter 101 - Quest 16: Tiny Magic
No land yet? Place the magic seed on a guild or family member's property.

### Chapter 101 - Quest 17: Up!
If spot won't complete: check your elevation. Quest tracker shows if you need to be higher or lower.

### Chapter 102 - Quest 10: The Border
Use quest mount skills to summon and kill mobs. Bring a healer to heal the mount.

### Chapter 102 - Quest 12: Backstage
Follow quest marker, look west. Underwater — bring Dahuta's Bubble, UBA, or Mermaid's Breath.

### Chapter 102 - Quest 16: The Mysterious Tree
"Find a way to climb" ≠ "climb up." There's a TP at the bottom that triggers the quest.

### Chapter 102 - Quest 19: The Beginning of the End
Equip quest armor + weapon. Use ONLY basic attack to eliminate 200 demons. You'll aggro many at once — bring a healer friend if nervous.

### Chapter 103 - Quest 6: Nightmare Echoes
You take damage in Sea of Graves. Bring pots/sandwiches, spec Vitalism, or bring healer friend. Underwater — bring bubble/UBA/Mermaid's Breath.

### Chapter 104 - Quest 2: Necronomicon Items
| Item | Source |
|------|--------|
| Onyx Archeum Essence | Cargo packs cross-continent / AH |
| Dragon Essence Stabilizer | Cargo packs to Freedich / AH |
| Acid Gobbet | Aegis event / Aegis mobs / AH |
| Barracuda | Tropical saltwater AFK fishing (Mahadevi/Sanddeep/DS) |
| Skipjack Tuna | Subarctic salt water AFK fishing (Miroir Tundra/Karkasse/DS/Whalesong) |

Necronomicon location: In water near CC in Ynystere.

### Chapter 104 - Quest 4: The Great Combinator
Tap books in order: **yellow, blue, green, red, white, grey** (Colour-blind: 2-1-6-5-4-3). Mess up = die.

### Chapter 104 - Quest 5: Endless Ale
Drink the beer 3 times, then use the skill that appears (default keybind R) to start the brawl with Gelbin.

### Chapter 104 - Quest 25: Eanna Nimush's Song
A buff appears on your health bar like fishing. Drag it near your skillbar. Match skills to the buff. Skills appear in RANDOM ORDER each time — memorize or read carefully. Turn off "Display Text in Skills" in game info options for easier reading.

### Chapter 104 - Quest 26: The Riddle of Mirage
Inside Mirage Isle, underwater. Tap swords in order: **6 - 2 - 3 - 1 - 4 - 5**.

---

## Dream Ring / Hiram Ring Tips

### Kraken's Eye
- Be there when it spawns (two possible spawn spots — check codex page for info)
- Be in range when it dies
- If enemy faction is killing it: bring a bubble and hide underwater

### Vyrava's Manastone
- Need a Timespace Scroll: buy on AH OR farm 100 scraps at orc camps in Reedwind (war time = extra drop rate)
- Hand in scrap quest in Nuimari first, then kill boss in Heedmar (6h respawn timer)

### Hanure's Heart
Easiest right after weekly maintenance on Tuesdays — no wait time needed.

### Protector Quests (Wizard Tokens, Diamond Shores)
Custom mobs in Nuimari, Heedmar, and Calmlands respawn nearly instantly. Gather all quests for efficiency, then do them in one go.

---

## RNG Quests (Have Faith and Keep Trying)

- Custom ch.100: quests 9 and 11
- Custom ch.101: quests 3 and 9
- Custom ch.102: quests 12 and 20
- Custom ch.103: quest 13
- Custom ch.104: quests 12 and 16
- Dream Ring: quest 5 "The Sunken Tome"

---

## Daily Contract Tips

- **Sea bug locations:** Check the codex page (kills in Castaway Strait, Halcyona Gulf, or Arcadian Sea)
- **Ghost ship locations:** Rotating path — Thunder Island is a hot spot
- **Labor contracts:** Various in-game sources for needed crafting materials`
    },

    {
      id: "alt-guide", categoryId: "utility",
      title: "How to Alt on ArcheRage",
      summary: "Using extra characters for vocation, proficiencies, gilda, event rewards, territory coins and more.",
      content: `# How to Alt on ArcheRage

**IMPORTANT:** Two accounts is bannable. This guide is about extra characters on your ONE account (up to 5 free, last 3 cost credits).

**(!) Be mindful of which character you:**
- Login on first for the daily labor stipend
- Click the login tracker button

---

## Basic Recommendations

### Vocation
- Park alt at a Nui statue with a stack of bricks for two vocation dailies
- Add a stack of lilies for a third quest
- Unlock vocation dailies in daily contracts tab
- Buy tradeable items (axle grease, vocation hasteners) without draining main's vocation

### Proficiencies
- Limited famed proficiencies per character — put extras on alts
- Great for bulk refining, mining drills, chopping majestic trees
- Doesn't take much time but gives access to proficiency bonuses

### Request Board
- List bulk items (bricks/ingots) on request board on main → relog alt to craft them (1 click per 1k vs ten separate crafts)

### Gilda
- Green quests on alt → bonus gilda for main's use
- Use alt's gilda for cheap designs (50 gilda clipper) to save main's gilda for larger purchases

### Farm Quests
- Do Blue Salt Brotherhood questline from Solisa, Halcyona for extra 8x8 garden (turns into farm workstation or 16x16 farm)

### Event Rewards
- Alt at higher level = access to event quests
- Trade tradeable furniture directly; place bind-on-placement furniture on a cheap workbench (200 bricks) to sell to yourself (costs 30 credits for building management title)

---

## Tryhard Options

### Blue Salt Bonds (BSB)
- Trade for honor at hero hall board, OR save 230 for an Ayanad staff
- 2.50g per 20 materials used — adds up over time
- Group with guildies for shared hereafter stone load

### Daily Contracts
- All 7 contracts → labor pots, gilda, slow gold accumulation
- 3 rerolls per day for bad contracts

### Prestige Farming
- Add alt to guild → do extra guild missions
- Especially useful for guilds struggling with prestige grind

### Custom Guild Dailies (if available)
- Thieves: Find Thieves Caches → Merit Badges
- Demons Invasion: Disable Energy Demon Stones → Honor Points
- Whalesong Recruit: Defeat Jakar → 2 labor pots (relog to use)
- Anthalon's Crimson Army: Shining Fragments for Evenglow Lunarite

### Territory Coins
- Tradeable items available at castle workbench
- Even just moving a water/log for the quest enables saving coins
- Warehouse pack quest available every other day

---

## Tips
- Synthesize on alt cheaply: buy materials from armor/general merchants, feed low-tier gear
- Harani alt → has recall reset (useful for double recall guild mission)
- Vocation quest at Nui statue = easy exp for exp mission
- **Don't overdo it — take breaks, eat, go outside!**`
    },

    {
      id: "dungeon-drops", categoryId: "utility",
      title: "Dungeon Drops",
      summary: "Abyssal shards/crystals, archeum farming, useful gear, skins, furniture, titles and emotes from dungeons.",
      content: `# Dungeon Drops

---

## Abyssal Shards & Crystals

Stack these up — you'll need many for quests and crafting.

**Best shard sources** (mob drops, can use loot buffs):
- Low-level dungeons: fixed quest amount only
- Greater dungeons: much more with loot buffs on mobs

**Crystal sources** (static boss/quest drops — can't buff for more):
- Abyssal Library (can reset for more)
- Various boss kills

**Alternative: MSS Jade Orbs**
- 1 jar = 2 Jade Orb shards; 12 shards = 1 orb
- Opening orb: chance of 1-2 crystals OR 10-20 shards
- 12 jars per MSS entry, multiple spawn locations per jar
- Combine jar farming with mob farming for efficiency

---

## Other Loot

| Item | Best Source |
|------|-------------|
| Clear Synthium Shards | All greater dungeons (every boss drops 1-3) |
| Sunglow Lunagems | Last bosses (can loot buff) |
| Sunset Portal Stones | MSS bosses and oni on straight paths |

**Bonus drops:**
- Serpentis/Greater Serpentis: potion crate (2nd room), moonpoints/sunpoints (5th room) — guaranteed
- SoDL: crate with ribs; armor piece is quest item drop
- MSS: Sunset Portal Stones from jars too

---

## Archeum Farming

Salvage all gear you get from dungeons:
- **Sunlight crystals:** MSS easy, GBC, GHF, Serpentis weapons
- **Moonlight crystals:** MSS normal, GHA, GKC, Serpentis armor
- **Starlight crystals:** Noryette rings/earrings (4 crystals each), Serpentis accessories, SoDL

**Tips:**
- GHA and GKC: extra armor drops from mobs with loot buffs (15-20 pieces per run)
- MSS: choose easy mode for sunlight, normal for moonlight; no need for hard mode unless farming skins
- Weapons salvage for more crystals than armor (3-4 vs 1-2)
- Craft more dungeon gear at Distorted Dimension Workbench with abyssal shards (craft 1H weapons only — cheaper, same crystal yield as 2H)
- Salvaging no longer requires labor — just evenstones

---

## Useful Gear

### Stealthfang Shield (MSS)
- T1 Superior drops from Sojung (easy mode), awaken to Supreme
- Use heal effect from skillbar (affected by healing power, can crit)
- ~750 less physical defense than Hiram shield, ~1k less than Erenor
- Good for weapon swapping healers

### Frontliner Shield (Library/Ipnysh)
- T1 from Abyssal Library, T3 chance from first boss in Ipnysh
- Can awaken MSS shield into the T1

### Dungeon Armor (Ipnysh Sanctuary)
- **Leather sets** (Brawler/Swift): mainly melees and archers
- **Cloth Serenity set**: some healers use for mob farming
- **Plate set**: mainly for skins
- Can awaken MSS gear → Library gear → Ipnysh (very RNG heavy, pricey mats)

**Feeding dungeon gear:** Use abyssal enhancers from dungeons/events, or craft with abyssal crystals/shards. Also possible to feed other dungeon gear (but that's a primary archeum source — think carefully).

### Weapon Swaps (for effects)
Put on skillbar, swap to use effect, swap back:
- Various dungeon weapons with useful on-use effects
- No need to upgrade unless increasing range/decreasing damage reduction

---

## Entertainment

### Skins
- Use fusion alembics to merge skins with gear
- Use extraction alembics to remove skins safely for later use
- Preview skins in in-game encyclopedia

**MSS:** Cool skins from bosses across all difficulties. Hard mode has unique drops.
**Library:** Same appearance as Ayanad gear but different colors. Color updates on awakening to T2. Also has costume drops (some count toward Fashion Icon achievements).

### Furniture

**MSS Achievements:**
- 3 boss paintings, 1 Taris figurine (from hard mode achievement), 1 Jade Orb painting
- Interact with furniture to rewatch dungeon cutscenes

**Abyssal Library:**
- Find scrolls on floors → trigger quests → reward furniture
- 4 scrolls total, each triggers a cutscene
- 1 painting from Ayanad Earring questline (earring painting scraps)
- 2 more paintings acquired outside dungeon (quest NPC accessed inside)

### Titles
- MSS titles, Noryette titles (choose one), Ipnysh Sanctuary title
- Various other instance-related titles

### Emotes
- Two emotes from MSS: one from Sojung, one from Aria

### Other
- GHA last boss: relatively high chance to drop a pet for Shapeshifter achievements
- SoDL assorted ribs crate: also has chance for reinforced tailfin frame (used for submarine mount crafting — need 3 total)`
    },

    {
      id: "guild-info", categoryId: "utility",
      title: "Guild Info",
      summary: "Guild missions, buffs, prestige costs, custom content, guild questline and guild furniture.",
      content: `# Guild Info

---

## Guild Missions Overview

### Group Missions (Weeklies)
- Can be rerolled by guild lead for 40 prestige if undoable
- World boss missions count in raids (no regular world boss quest required)
- The "1250/700/300 solo missions" mission: spam "Guild Supplies Distribution" (donate materials to guild manager) — much easier than it looks

**Cheapest way to finish the "use pots/foods" mission:**
Spam Sweet Breads and Sweet Soups. Craft as a guild effort, use together on Sundays. Requires 40k cooking.

**For mob killing missions:**
- Custom quest mob locations (see Dream Ring section in quest guide)
- Diamond Shores: Riven Gates
- Western Hiram Mountains
- Golden Ruins
Split into 5-10 guildies for efficiency. Reroll if you don't have enough people.

### Solo Missions
- Top mission (guild pack) cannot be changed
- Other 4 can be rerolled (3x per day per member)
- "Guild Supplies Distribution" can be spammed endlessly
- Kill 50 mobs mission: counts in raids
- Join events for easy: honor missions, mob missions, exp missions

---

## Guild Buffs

Prestige costs increase significantly at higher levels. Grand total to max all buffs: **1,743,000 prestige** (excluding house costs and weekly tax).

At maximum prestige earning: **~48+ weeks** to get all buffs. Realistically well over a year.

**Strategy recommendations:**
- Prioritize buffs that are most impactful for early levels (lv1 +1% PvE damage = 2k prestige vs lv8 +1% = 45k prestige)
- Consider your guild's direction (newbie guild = exp buff; endgame = PvP buffs)
- Don't buy a guild house until ready to upgrade past level 5 (to avoid weekly prestige tax)

### Custom Guild House (9.5+)
Micro guild houses added due to land scarcity. Tiny structures whose sole purpose is accessing higher-level guild buffs.

**Types and costs:**
- Swept-Roof Cottage / Thatched Farmhouse: 5000 prestige + 1500/week tax
- Tudor Spring Chalet: 6000 prestige + 1700/week tax
- Spired Chateau / Midnight Mansion: 7000 prestige + 1800/week tax

**Custom housing zones:** Marianople (south), Mahadevi (northeast), Sungold Fields (north)

---

## Custom Guild Content

### Guild Functions (requires 6+ members + questline)
Available functions:
1. Guild bank
2. Extra guild buff
3. Improved guild store
4. Custom daily quests

Activate on **Mondays** for best value (reset is Monday). Can prolong multiple weeks at once.

Multiple members can be assigned permission to manage functions and prestige.

### Custom Guild Buffs (per class/level)
The "Defender" buff recommended for new players — helps survive PvE and PvP content.

Swapping guild buff costs gold (same as stat migration swap).

### Guild Questline: Heavy Cargo

**Haranya Route:**
- Cars: Sunbite → Arcum → Mahadevi → Solis
- Galleons: Solis outlet → Castaway → Arcadian → Diamond Shores
- Cars: DS → Reedwind

**Nuia Route:**
- Cars: Ahnimar → Hellswamp
- Boats: Halcyona Gulf → Castaway → Arcadian Sea
- Cars: DS → Reedwind

Sail galleon from Austera outlet at angle to maintain north speedboost the entire trip (~12-15 minutes).

### Guild Furniture (9.5+)
Convert regular furniture to guild versions using Guild Engineer Blueprint (from prestige merchant):
- Regal workbenches
- Multipurpose workbench
- Proficiency boost furniture
- Training target
- Guild Merchants

Conversion costs 25 labor (base) + blueprint(s). Higher carpentry = lower labor cost.

### Custom Guild House Features
- 3-day memory ember (instead of 1-day)
- 7-day warm memory ember
- Pickup point for custom daily quests
- Option to change custom guild buff`
    },

    {
      id: "random-stuff", categoryId: "utility",
      title: "Random Stuff",
      summary: "Custom tax system, gear levels, damage types, turtlecraft locations, experia, custom shop tips.",
      content: `# Random Stuff

---

## Custom Tax & Housing System

When active: if your land exceeds **8000 m²**, ALL plots start paying increased tax.

**Land sizes for calculating total:**
- 8x8 = 64 m²
- 16x16 = 256 m²
- 24x24 = 576 m²
- Beanstalk = 1936 m²

Every 100 m² above 8000 m² = +1% tax increase (rounds up).

**Example:** 4 beanstalks + 3 16x16 farms = 8512 m² → 6% tax increase on ALL plots.

### Land Rule Changes
- Cannot place land while in stealth
- Building burn timers randomized (can't countdown placement)
- After first player tries to place, others enter a dice roll system — highest roll wins
- Max 5 plots for sale simultaneously
- Cannot pay tax for unbuilt plots
- Memory hearth can be placed on silos
- Can demo and reposition land in a small safe window
- Mistmerrow: one plot per account for new/returning players (8x8/16x16/24x24 only)

---

## Gear Levels

The 4th tab in the gear details UI shows weapon damage type bonuses and armor damage type resistances.

**Basics:**
- Default damage type bonus on weapon: 450 at lv0
- Armor levels help resist enemy weapon damage bonuses
- Resistance type depends on armor type (cloth/leather/plate)
- Only end tiers can have levels: Exalted Hiram, Brilliant Erenor, Immortal Warden
- Max levels: Eternal weapons = 10, eternal armors = 5
- At Mythic: armor to lv2, weapons to lv4 (done for Erenor to save on infusions)

**How to enhance levels:**
Find synthesis UI → go to 3rd option "Enhance."

**Important for Glorious Hiram (T4):** Cannot feed bonus exp into eternal at T4. Don't overfeed before awakening to T5 Exalted!

---

## Titan Title Info

Titan titles earned by farming [Titan's Magic Quintessence].

Total quintessence needed for ALL titles: **28,460**.

---

## Turtlecraft Locations

Turtlecrafts are hidden underwater around the world. Use a raising totem to bring them up.

Check the AR Wiki or "Where to Find Stuff" sheet for specific coordinates.

---

## Experia (Guild Exp)

Custom boosted on AR server (e.g., sunflowers give 10/15/20 instead of 5/10/15).

**Notes:**
- Seeds/saplings: buy in vocation store to lower gold cost
- Crafted at Farmer's Workstations (always public at credit 8x8/16x16)
- Plant and uproot method completes the guild mission for prestige, but no guild exp gained
- Sunflowers: fastest to complete guild exp mission
- Pine: more guild exp per day, takes less space

---

## Custom Guild Shop Strategy

Guild lead can open the improved guild shop by spending 300 guild exp for 3x Sealed Guild Certificate (Level 1).

Once opened, ALL guild members can buy Level 1 certificates with prestige (43 prestige with 5% discount).

**Example with 15 active members:** All donate 1 certificate → shop reopens for 5 more weeks. Cost per person: 43 prestige every 5 weeks. The 5% discount on items like Misagon's Crystals easily offsets this.`
    },

    {
      id: "hero-life", categoryId: "utility",
      title: "A Hero's Life",
      summary: "Hero requirements, voting schedule, castle duties, siege mechanics, Garden authorities, and custom hero rewards.",
      content: `# A Hero's Life

---

## Introduction

Hero is a significant commitment. Prepare for:
- Being an example to your faction
- Finishing hero missions
- Leading instanced events
- Managing faction castles
- Grinding honor events
- Investing blue salt bonds into faction
- Communicating with other heroes
- Slowly losing your sanity 😅

**Recommended gear:** 18–20k GS before trying for hero (you'll have a target on your back during sieges and open-world PvP).

---

## Voting Schedule

First weekend of every month is voting weekend.

- **Wednesday** before first weekend = last day to gain leadership to enter top 16 candidates
- **Thursday** = withdrawal day (remove yourself from rankings if you don't want to be hero)
- **Friday–Saturday** = voting
- **Sunday** = new heroes announced

The first weekend's exact date varies greatly by month — some hero months are very short, others long. This affects flare/flag usage and time to complete missions.

---

## You're a Hero, Now What?

Items arrive in mailbox (amount depends on cloak grade).

Open **hero missions** immediately — raids you lead won't count toward progress otherwise. Each mission costs 30 gilda stars to unlock. Complete 100/100 missions for 300 leadership reward.

---

## Leadership Sources

- Playing the game naturally generates leadership over time
- Various event participations
- Guild and faction content contributions

---

## Blue Salt Bonds (BSB)

Heroes invest a lot of BSB into the faction. Hero rewards each month include a big chunk of them plus other quests for more.

---

## Castle Stuff

Only heroes can place castle parts. Buy designs from the NPC next to the lodestone in the castle center.

### Activating Events (Heroes Only)
- **Mining event:** Exchange BSB for a pack → take to ore area → interact with flag. Players mine unidentified ores, bring to territory workshop. Enemy faction can steal — defend your loot!
- **Warehouse event:** Every Wednesday, extra NPC at castle with two quests. At 50/100/150/200 packs delivered, castle funds increase. Enemy faction can salvage packs for territory pence.
- **Water/Log event:** Workshop Steward announcement triggers availability. 50 logs or 50 waters needed. Adds gold to castle funds. Heedmar/Nuimari = logs; Marcala/Calmlands = water.
- **Polluted water event:** 7-day event, mining event disabled during. Usually skipped since mining is more valuable.

### Castle Items
- **Wyvern:** Every 6h, one hero can grab a wyvern for 1 Territory Coin (lasts 6h)
- **Hero Costume:** Crafted at Advanced Workbench at territory workshop. Lasts 7 days. Better stats than regular costume, requires special serendipities for stat changes, grants aura that debuffs enemies, detects stealthed players when used on skillbar.

---

## Siege

Heroes must apply for Siege Commander at siege pedestal in hero hall.

- Apply Fridays, 12pm–8pm server time
- Multiple heroes: highest cloak grade gets commander position
- No applications = no siege

All heroes have siege-specific skills (AoE freeze, AoE damage reduction buff).

**Remove status sensitivity keybinds** before siege starts to avoid accidental hero skill use!

**Offensive siege phase 2:** After lodestone dies, channel orbs spread around the siege area outside the castle. Sufficient orbs channeled = siege won.

**After defensive siege:** Pray at altar statue to reactivate mailbox/workbench etc. If altar was destroyed, rebuild it first.

### Healing the Castle
- **Option 1:** Use Auroran repair tool on lodestone, buildings, walls. Stack healing % stat for better results.
- **Option 2:** Demo heavily damaged walls/towers and rebuild (cheaper in BSB than healing).

**Sources of healing %:**
- Hero cloak stats
- Various gear with healing power
- Erenor greatclub (healers with 8/8 ocean frosts don't need extra 2H for this)

---

## Garden

Every war cycle, a mini boss called **Salazar** can spawn. Killing it drops Authority orbs.

- Heroes must wear their cloak BEFORE entering Garden to interact with orbs
- One hero per faction can take an orb at a time
- Bring the fragment to its corresponding throne

**Throne locations:**
- Circle of Authority: Shatigon, Dahuta, Kyrios, Rampolis thrones
- Portal thrones at Amber Ridge, Shimmering Glade, Radiant Ridge, Secret Grotto

**Active skills:** 3 charges, 24h to recharge one. Don't pick up same active skill within 72h if all charges are used.

---

## Miscellaneous Hero Powers

- **Hero Nuis:** Activate to prevent trauma debuff when players die + increase nui buff (no cost)
- **Strength of the Faction:** PvE buff for faction, costs 1 BSB, 4h cooldown shared with WT
- **War Time (WT) buff:** PvP buff for faction, costs 1 BSB, 4h cooldown shared with SotF

---

## Custom Hero Rewards

- **12 full months as hero:** Special cloak + custom furniture items (Heroes Alley)
- **Longest-sitting heroes:** Special statue in Diamond Shores Heroes Alley
- **Per 9.0:** Hero cloak — choose skin AND which 5 stats you want`
    },

    // ── PROFICIENCY ─────────────────────────────────────────────────────────

    {
      id: "potato-life", categoryId: "proficiency",
      title: "Potato Life 101",
      summary: "Seedbeds vs bundles, farmhand gear and tips, labor sleep system, CC info and random potato tidbits.",
      content: `# Potato Life 101

*For traderuns, check the Commerce Guide. For alts, check the Alt Guide. For Daru, check the Daru Potato Guide.*

---

## Seedbeds vs Bundles

General rule: bundles tend to be more time-efficient for some seeds, seedbeds for others.

To get best bundle timers:
- Plant in matching climate zone
- Water bundles after planting

Items marked in italics in the full tables are the shorter/more efficient option per seed type. Grand/rare seeds have generic bundle timers, while seedbeds have more variety.

**Use this info for:** Finding seeds suitable for overnight growing, efficiency comparison.

---

## Farmhand Tips

### Gear
**Skip the credit sets** — there's a cheaper vocation-badge gear set available:

1. Acquire vocation farmhand set (check vocation quests sheet)
2. Upgrade through crafting recipes (similar stats to credit sets)
3. Materials: royal seed, scented leaf, heavy hardwood, handicraft yarn
4. Awaken with Farmhand Awakening Scrolls (credits) — 1850 credits total, guaranteed first scroll

The crafted set + commerce stats makes it a good all-around choice without extra credit investment.

### Farmhand Treats (Vitalizing Treat)
No need to spend credits! Sources:
- Loyalty token shop (1x daily, 10 loyalty tokens)
- Manastorm shop (1 or 3x for 2 Manastorm Crystals)
- Login tracker (days 8 and 18 — use on the character that "owns" the farmhand)
- Collection achievement reward (3x Vitalizing Treat)

### Removing Your Farmhand
Find the "mark" button in farmhand UI (Shift+H) → remove mark.

**Use ALL vigor and labor first!** Anything unused is lost.

Items returned to mailbox: equipped gear, farms/aquafarms, wagon/hauler/freighter, powerstone pet.

### Aquafarms
Unlocked at farmhand lv16. Two types:
- **Pearl Aquafarm:** 400 capacity (same as gazebos/pavilions)
- **Regular Aquafarm:** 180 capacity

Both found in marketplace. Pearl aquafarms also drop from RNG boxes (account limit on marketplace, but extras from boxes allowed).

### Items Farmhand CANNOT Collect
Natural Rubber, Community specialty seeds, Impatiens, Pineapple, Watermelon, Amaranth, Hibiscus, Pansy, Bamboo Shoot, Thunderstruck Tree, Black Pearl, Shining Clubhead, Shatigon's Sand

### Items You CANNOT Add to Farmhand
Drills, Mining Drills, Majestic Trees, Cornucopia items, Archeum trees, Regrade Brazier, Fishing Pond, Small Bamboo Trap

---

## Labor Sleep

**Bare minimum:** 50 labor/day from public CC bed. **Maximum:** 1300 labor/day with full setup.

### Beds
**Basic crafted beds (50-100 labor):**
Use one of three Furniture Collection items in recipe:
- Basic Furniture Collection — Carpentry Merchant, 1 gold
- Advanced Furniture Collection — Carpentry Merchant, 10 gold
- Prodigy's Furniture Collection — Vocation Store, 10k vocation badges

**Event beds:** Various unique designs, 100 labor (sometimes less). From event workbenches. Snuggly Plushie from New Year Gift boxes. Green-Quilted Pumpkin Coach Bed from Blue Ribbon tokens year-round.

**150 labor beds:** Most from marketplace rotation (credits or RNG boxes). Some permanently available.

### PJ Sets
Two sets available: credit marketplace + **Lullaby Pajamas** (earnable in-game, has its own achievement).

Sources for Lullaby Pajamas: vocation store pieces + marketplace.

Can convert separate pieces to single costume at Regal Cloth Armor Form or Multipurpose Workbench.

**Important:** PJs used as image item/costume cannot be used for labor sleep.

### Hats
- **Sheep Sleep Hat:** Marketplace rotation
- **Wool Hat:** Event tokens during Holiday season

Both improve sleep effects.

### Daru Costume (10.0+)
Second labor sleep costume slot (while transformed as Daru). Epic grade: reduces sleep time from 7 min to ~4min 18sec when combined with time reduction items.

### Sleep Resets
Decor items remove Clear Mind debuff for a 2nd labor sleep per day. Available in marketplace. One use per day; effects cannot be stacked.

### Time Reductions
Three items that each reduce labor sleep by 3 minutes. Check marketplace rotation.

### Dreams
10k+ artistry proficiency = acquire dream shards while sleeping (1 shard per sleep, max 2/day). Check furniture guide for designs from these shards.

### Good to Know
- Every sleep gives a production speed buff (not affected by Clear Mind buff)
- Labor sleeps are not account-limited — any character can use them
- Can labor sleep during Golden Plains Battle in CC
- Wearing PJs will NOT increase labor gained

---

## Community Center Info

**Possible tent placement for max output (6 pack quests + all 5 material quests):**
Sanddeep, Solzreed, Cinderstone, Hasla, Villanelle, Ynystere

---

## Random Tidbits

### Vocation Badge Saving
- Use Hasla rift loot to craft scrolls instead of spending vocation
- Buy mounts/pets from zone baskets for a few silver (Arcum Iris, Sunbite Wilds, Falcorth Plains, Villanelle for Haranya; Solzreed, Gweonid, Aubre Cradle, Airain Rock, Marianople for Nuia)

### Slightly Short on Crops?
Check wild-growing versions. See "Where to Find Stuff" sheet for locations.

### Plushie Pets
Invest for permanent buffs. Greenman version sometimes available from events.
Credit gear (100 credits per piece, pages 6-8 of Pet Armors): Pacifier and Ducky Flippers are popular choices.

### Watering Crops Efficiently
- Don't use a well (1-5 water each time)
- Use farmhouses, plazas, upgraded properties for **bulk water drawing**
- **Rainbow Sprinkler:** Requires 50k Gathering OR Farming prof. Waters while performing an action.
- Daily quest pops up when you place + water a bundle: rewards 3x sprinklers. Up to 6x per day per character.

### Vocational Speed Buffs
Stack multiple buffs with Dawnsdrop gear for maximum production speed. Using 4 buffs + Dawnsdrop is usually sufficient.

**When production speed is extremely short:** Use attack speed boosts too (dual wield weapons, Freerunner buff, Secret Gift potion). The global cooldown can't keep up at max speed otherwise.`
    },

    // ── ENTERTAINMENT ───────────────────────────────────────────────────────

    {
      id: "wonderland", categoryId: "entertainment",
      title: "Wonderland",
      summary: "Custom zone for 7k+ GS players with daily quests and the permanent Sunday race event.",
      content: `# Wonderland

Wonderland is a **custom zone** with:
- Special daily quests for players with **7000+ GS**
- Custom events (temporary and permanent)
- **Wonderland Race** event every Sunday

---

## Getting In

Requirements to access Wonderland quests:
- 7000+ gearscore
- Pick up the entry ticket
- Quest Details set to Unlimited
- You do NOT already have the ticket on another character

---

## Quest and Ticket Booth

The quest and ticket booth is inside the Wonderland zone. Check the AR forum for full quest details and more information on custom content.

---

## Tips

If you can't find the quests, verify:
1. Are you 7k GS or higher?
2. Did you pick up the ticket?
3. Are Quest Details set to Unlimited (scroll all the way down in Game Settings → Quest Details Map Display)?
4. Do you already have the ticket on another character?`
    },

    {
      id: "car-guide", categoryId: "entertainment",
      title: "The AR Car Guide",
      summary: "Complete info about all cars, car components, and related content.",
      content: `# The AR Car Guide

Full detailed car guide information is available on the AR Forum and ArcheRage Wiki.

---

## Getting Cars

Car designs are spread across:
- Marketplace (credits section)
- Awards tab in marketplace
- NPCs in your main city
- Diamond Shores faction base
- Mirage Isle (if not found elsewhere)

---

## Car Components

Car components can be crafted using the Machining proficiency. Various components affect speed, handling, and other stats.

Check the Machining section of the folio for crafting recipes, or the AR Wiki for a complete component list.

---

## Racing Event

The **Wonderland Race** runs every Sunday and is one of the most popular custom events on ArcheRage. Cars used in the race don't need to be specifically race-built.

Check the AR Forum for current race event details and Wonderland info.

---

## Notes

- Car designs include both regular vehicles and racing variants
- Some car skins are available from events and the marketplace
- Car storage boxes are available for organizing your vehicle collection`
    },

    // ── CLASSES ─────────────────────────────────────────────────────────────

    {
      id: "healer", categoryId: "classes",
      title: "Healer",
      summary: "Healer gear, gems, PvE farming, PvP builds and more.",
      content: `# Healer Guide

*Content based on AviPedia's Healer guide — fill in with your own notes and experience!*

---

## Gear Priority

**Early game:**
- Get your Hiram gear with Spirit as first stat
- Stamina as second stat
- Work on T3 gems

**Long-term:**
- Erenor weapons and armor (cloth)
- Ocean Lunafrost set for the set bonus
- Soul Liberator necklace (from Hereafter Rebellion)
- Carmilla's earrings (Serpentis)

---

## Key Stats

- Spirit (main healing stat)
- Stamina (survivability)
- Healing Power (from frosts/gems)
- Max Health

---

## Gems

- Slot gems based on your healing power needs
- Sunglow lunafrosts for waist
- Alchemy proficiency at 230k reduces gem slotting to 300 labor

---

## PvE Farming

Use Cloth Serenity set from Ipnysh for mob farming if available. Soul Liberator is excellent for solo PvE content.

---

## Notes

Add your own class-specific builds, rotation tips, and discoveries here!`
    },

    {
      id: "melee", categoryId: "classes",
      title: "Melee",
      summary: "Melee builds, gear, gems and stats.",
      content: `# Melee Guide

---

## Key Stats

**General Melee:**
- Strength or Agility (class dependent)
- Stamina
- Attack Speed / Melee Crit Rate

**Swiftblade:**
- Uses Dual Wield (not 2H)
- Uses Crit Damage in PvP

---

## Gear Priority

- Hiram Leather gear
- Typhoon Lunafrost set (set bonus with Erenor)
- Erenor weapons using Carpentry recipe (lumber-based, cheaper)

---

## Notes

Add your own builds, tips, and progression notes here!`
    },

    {
      id: "tank", categoryId: "classes",
      title: "Tank",
      summary: "Tank builds and progression notes.",
      content: `# Tank Guide

---

## Key Gear

- **Augmented Hiram's Chosen Ring** — only ring with Resilience and Toughness (defensive stats)
- Plate armor (or leather depending on build)
- Shield — dungeon shields useful for swap effects

---

## Key Stats

- Toughness (reduces damage taken in PvP)
- Resilience (reduces critical damage taken)
- Max Health
- Physical/Magic Defense

---

## Notes

Add your own tank builds, rotations, and tips here!`
    },

    {
      id: "ranged", categoryId: "classes",
      title: "Ranged",
      summary: "Ranged (archer/gunner) gear, gems, stats and builds.",
      content: `# Ranged Guide

---

## Key Stats

- Agility (primary)
- Stamina
- Ranged Crit Rate / Ranged Attack
- Defense Penetration (Gunners — optional, not required)

---

## Gear Priority

- Hiram Leather gear (Agility/Stamina)
- Typhoon Lunafrost set
- Forsaken Pirate set accessories if into naval content (6% cannon damage with 5-piece)

---

## Gems

- Tracker Lunafrost for ranged attack
- T3 gems as priority — see Newbie Guide for gem advice

---

## Notes

Add your own ranged builds, rotations, and tips here!`
    },

    {
      id: "mage", categoryId: "classes",
      title: "Mage",
      summary: "Mage builds, gear, gems and stats.",
      content: `# Mage Guide

---

## Key Stats

- Intelligence (primary)
- Stamina
- Magic Crit Rate / Magic Attack

---

## Gear Priority

- Hiram Cloth gear (Intelligence/Stamina)
- Ocean Lunafrost set
- Erenor weapons using Carpentry recipe

---

## Special Gear Note

Serpentis mage armor set sleeves: combine all mage armor pieces from Serpentis for a useful sleeve option. Cannot be synthesized — must regrade it (can break at higher grades).

---

## Notes

Add your own mage builds, rotations, and tips here!`
    },

    // ── MY NOTES ────────────────────────────────────────────────────────────

    {
      id: "my-notes-general", categoryId: "personal",
      title: "General Notes",
      summary: "Your personal notes and reminders.",
      content: ""
    },

    {
      id: "price-tracking-notes", categoryId: "personal",
      title: "Price Tracking Notes",
      summary: "Notes about market prices, trends and when to sell.",
      content: ""
    },

    {
      id: "crafting-plans", categoryId: "personal",
      title: "Crafting Plans",
      summary: "Your current crafting projects and material lists.",
      content: ""
    }
  ]
};

// ─── STATE ───────────────────────────────────────────────────────────────────

let wikiState = {
  view: "home",
  activeCategoryId: null,
  activeGuideId: null,
  filterCategoryId: null,
  searchQuery: ""
};

function loadWiki() {
  try {
    const saved = JSON.parse(localStorage.getItem(WIKI_KEY) || "null");
    if (!saved || saved.version !== WIKI_VERSION) {
      // New version — merge saved content into fresh defaults
      const fresh = JSON.parse(JSON.stringify(DEFAULT_WIKI));
      if (saved) {
        // Preserve user-written content
        const savedContent = {};
        (saved.guides || []).forEach(g => { if (g.content) savedContent[g.id] = g.content; });
        fresh.guides.forEach(g => { if (savedContent[g.id]) g.content = savedContent[g.id]; });
        // Preserve user-added custom guides (not in defaults)
        const defaultIds = new Set(fresh.guides.map(g => g.id));
        (saved.guides || []).filter(g => !defaultIds.has(g.id)).forEach(g => fresh.guides.push(g));
        // Preserve user-added custom categories
        const defaultCatIds = new Set(fresh.categories.map(c => c.id));
        (saved.categories || []).filter(c => !defaultCatIds.has(c.id)).forEach(c => fresh.categories.push(c));
      }
      saveWiki(fresh);
      return fresh;
    }
    return saved;
  } catch { return JSON.parse(JSON.stringify(DEFAULT_WIKI)); }
}

function saveWiki(data) {
  localStorage.setItem(WIKI_KEY, JSON.stringify(data));
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function esc(str) {
  return String(str || "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function renderMarkdown(text) {
  if (!text || !text.trim()) return "<p style='color:#64748b;font-style:italic;'>No content yet. Click Edit to add your notes.</p>";

  let html = text
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    // Headers
    .replace(/^### (.+)$/gm, '<h3 class="wh3">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="wh2">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="wh1">$1</h1>')
    // Bold / italic / code
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code class="wcode">$1</code>')
    // HR
    .replace(/^---$/gm, '<hr class="whr">')
    // Blockquote
    .replace(/^> (.+)$/gm, '<blockquote class="wquote">$1</blockquote>')
    // Table rows
    .replace(/^\|(.+)\|$/gm, function(match, inner) {
      const cells = inner.split('|').map(c => c.trim());
      const isDivider = cells.every(c => /^[-:]+$/.test(c));
      if (isDivider) return '__TABLE_DIVIDER__';
      const tag = 'td';
      return '<tr>' + cells.map(c => `<${tag}>${c}</${tag}>`).join('') + '</tr>';
    })
    // Wrap table rows
    .replace(/(__TABLE_DIVIDER__\n?)+/g, '')
    .replace(/((<tr>.+<\/tr>\n?)+)/g, '<table class="wtable">$1</table>')
    // Lists
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*?<\/li>\n?)+/g, '<ul class="wul">$&</ul>')
    // Paragraphs
    .split('\n\n').map(block => {
      const trimmed = block.trim();
      if (!trimmed) return '';
      if (/^<(h[1-3]|ul|blockquote|table|hr)/.test(trimmed)) return trimmed;
      return `<p class="wp">${trimmed.replace(/\n/g, '<br>')}</p>`;
    }).join('\n');

  return html;
}

// ─── STYLES ──────────────────────────────────────────────────────────────────

const WIKI_STYLES = `
<style>
.wwrap { font-family: 'Georgia', serif; }
.whero { background:linear-gradient(135deg,#1a2535 0%,#0f1923 100%); border:1px solid #2a3a52; border-radius:16px; padding:32px; margin-bottom:24px; position:relative; overflow:hidden; }
.whero::before { content:''; position:absolute; top:-40px; right:-40px; width:200px; height:200px; background:radial-gradient(circle,rgba(147,197,253,0.08) 0%,transparent 70%); border-radius:50%; }
.whero-title { font-size:28px; font-weight:700; color:#f8fafc; margin:0 0 8px; letter-spacing:-0.5px; }
.whero-sub { color:#94a3b8; font-size:14px; margin:0 0 24px; font-family:Arial,sans-serif; }
.wsearch { width:100%; box-sizing:border-box; background:#0f1923; border:1px solid #2a3a52; border-radius:10px; padding:12px 16px; color:#eef2f7; font-size:15px; font-family:Arial,sans-serif; outline:none; transition:border-color .2s; }
.wsearch:focus { border-color:#93c5fd; }
.wsearch::placeholder { color:#475569; }
.wstats { display:flex; gap:20px; flex-wrap:wrap; margin-top:16px; }
.wstat { font-size:12px; font-family:Arial,sans-serif; color:#475569; }
.wstat span { color:#94a3b8; font-weight:600; }
.wfilters { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:20px; }
.wfbtn { background:#1e2a38; border:1px solid #2a3a52; border-radius:20px; padding:6px 14px; color:#94a3b8; font-size:12px; font-family:Arial,sans-serif; cursor:pointer; transition:all .15s; white-space:nowrap; }
.wfbtn:hover { border-color:#93c5fd; color:#e2e8f0; }
.wfbtn.active { background:#1e3a5f; border-color:#93c5fd; color:#93c5fd; }
.wsection { margin-bottom:32px; }
.wsec-hdr { display:flex; align-items:center; gap:10px; margin-bottom:14px; padding-bottom:10px; border-bottom:1px solid #1e2a38; }
.wsec-title { font-size:16px; font-weight:700; color:#f8fafc; font-family:Arial,sans-serif; }
.wsec-count { font-size:11px; color:#475569; font-family:Arial,sans-serif; margin-left:auto; }
.wgrid { display:grid; grid-template-columns:repeat(auto-fill,minmax(260px,1fr)); gap:12px; }
.wcard { background:#1a2535; border:1px solid #2a3a52; border-radius:12px; padding:16px; cursor:pointer; transition:all .15s; position:relative; overflow:hidden; }
.wcard::before { content:''; position:absolute; top:0; left:0; width:3px; height:100%; background:var(--cc,#93c5fd); opacity:.6; transition:opacity .15s; }
.wcard:hover { border-color:var(--cc,#93c5fd); transform:translateY(-1px); box-shadow:0 4px 16px rgba(0,0,0,.3); }
.wcard:hover::before { opacity:1; }
.wcard-title { font-size:14px; font-weight:700; color:#e2e8f0; margin:0 0 6px; font-family:Arial,sans-serif; line-height:1.3; }
.wcard-sum { font-size:12px; color:#64748b; margin:0; font-family:Arial,sans-serif; line-height:1.4; }
.wstatus { display:inline-block; font-size:10px; font-family:Arial,sans-serif; padding:2px 7px; border-radius:10px; margin-top:8px; }
.wstatus.has { background:#1a3a2a; color:#86efac; }
.wstatus.empty { background:#1e2a38; color:#475569; }
.wadd { background:#131d2a; border:1px dashed #2a3a52; border-radius:12px; padding:16px; cursor:pointer; transition:all .15s; display:flex; align-items:center; gap:10px; color:#475569; font-size:13px; font-family:Arial,sans-serif; }
.wadd:hover { border-color:#93c5fd; color:#93c5fd; }
.wg-hdr { display:flex; align-items:flex-start; justify-content:space-between; gap:16px; margin-bottom:24px; flex-wrap:wrap; }
.wbadge { display:inline-flex; align-items:center; gap:5px; font-size:11px; font-family:Arial,sans-serif; padding:3px 10px; border-radius:12px; background:#1a2535; border:1px solid #2a3a52; color:#94a3b8; margin-bottom:8px; }
.wg-title { font-size:26px; font-weight:700; color:#f8fafc; margin:0 0 6px; letter-spacing:-0.5px; }
.wg-sum { font-size:14px; color:#64748b; font-family:Arial,sans-serif; margin:0; font-style:italic; }
.wacts { display:flex; gap:8px; flex-wrap:wrap; }
.wbtn-back { background:#1a2535; border:1px solid #2a3a52; border-radius:8px; padding:8px 14px; color:#94a3b8; font-size:13px; font-family:Arial,sans-serif; cursor:pointer; transition:all .15s; white-space:nowrap; }
.wbtn-back:hover { border-color:#93c5fd; color:#93c5fd; }
.wbtn-edit { background:#1e3a5f; border:1px solid #93c5fd; border-radius:8px; padding:8px 16px; color:#93c5fd; font-size:13px; font-family:Arial,sans-serif; cursor:pointer; transition:all .15s; }
.wbtn-edit:hover { background:#1e4a7a; }
.wbtn-del { background:#3a1a1a; border:1px solid #6a2d2d; border-radius:8px; padding:8px 16px; color:#fca5a5; font-size:13px; font-family:Arial,sans-serif; cursor:pointer; transition:all .15s; }
.wbtn-del:hover { background:#4a2020; }
.wcontent { background:#131d2a; border:1px solid #1e2a38; border-radius:12px; padding:28px 32px; min-height:200px; line-height:1.8; color:#cbd5e1; }
.wh1 { font-size:22px; color:#f8fafc; margin:24px 0 12px; }
.wh2 { font-size:18px; color:#e2e8f0; margin:20px 0 10px; border-bottom:1px solid #1e2a38; padding-bottom:6px; }
.wh3 { font-size:15px; color:#93c5fd; margin:16px 0 8px; font-family:Arial,sans-serif; letter-spacing:.3px; }
.wp { margin:0 0 12px; }
.wul { margin:0 0 12px; padding-left:20px; }
.wul li { margin-bottom:4px; }
.wcode { background:#0f1923; border:1px solid #2a3a52; border-radius:4px; padding:1px 6px; font-size:13px; font-family:monospace; color:#86efac; }
.whr { border:none; border-top:1px solid #2a3a52; margin:20px 0; }
.wquote { border-left:3px solid #93c5fd; margin:12px 0; padding:8px 16px; color:#94a3b8; background:#1a2535; border-radius:0 8px 8px 0; font-style:italic; }
.wtable { border-collapse:collapse; width:100%; margin:12px 0; font-family:Arial,sans-serif; font-size:13px; }
.wtable td { border:1px solid #2a3a52; padding:6px 10px; color:#cbd5e1; }
.wtable tr:nth-child(even) td { background:#0f1923; }
.wtable tr:first-child td { background:#1a2535; font-weight:600; color:#e2e8f0; }
.wetoolbar { display:flex; gap:6px; flex-wrap:wrap; padding:10px 12px; background:#0f1923; border:1px solid #2a3a52; border-bottom:none; border-radius:10px 10px 0 0; }
.wetbtn { background:#1a2535; border:1px solid #2a3a52; border-radius:6px; padding:4px 10px; color:#94a3b8; font-size:12px; font-family:monospace; cursor:pointer; transition:all .1s; }
.wetbtn:hover { border-color:#93c5fd; color:#93c5fd; }
.weta { width:100%; box-sizing:border-box; min-height:380px; background:#131d2a; border:1px solid #2a3a52; border-top:none; border-radius:0 0 10px 10px; padding:20px; color:#cbd5e1; font-size:14px; font-family:'Georgia',serif; line-height:1.8; resize:vertical; outline:none; }
.weta:focus { border-color:#93c5fd; }
.wehint { font-size:11px; color:#475569; font-family:Arial,sans-serif; margin-top:8px; line-height:1.6; }
.wsavebar { display:flex; gap:10px; margin-top:16px; justify-content:flex-end; }
.wbtn-save { background:#1a3a2a; border:1px solid #86efac; border-radius:8px; padding:10px 24px; color:#86efac; font-size:14px; font-family:Arial,sans-serif; cursor:pointer; font-weight:600; transition:all .15s; }
.wbtn-save:hover { background:#1e4a34; }
.wbtn-cancel { background:#1a2535; border:1px solid #2a3a52; border-radius:8px; padding:10px 20px; color:#94a3b8; font-size:14px; font-family:Arial,sans-serif; cursor:pointer; transition:all .15s; }
.wbtn-cancel:hover { border-color:#64748b; color:#e2e8f0; }
.wflabel { display:block; font-size:12px; font-family:Arial,sans-serif; font-weight:600; color:#94a3b8; margin-bottom:6px; letter-spacing:.5px; text-transform:uppercase; }
.wfinput { width:100%; box-sizing:border-box; background:#0f1923; border:1px solid #2a3a52; border-radius:8px; padding:10px 14px; color:#eef2f7; font-size:14px; font-family:Arial,sans-serif; outline:none; transition:border-color .2s; }
.wfinput:focus { border-color:#93c5fd; }
.wfselect { width:100%; box-sizing:border-box; background:#0f1923; border:1px solid #2a3a52; border-radius:8px; padding:10px 14px; color:#eef2f7; font-size:14px; font-family:Arial,sans-serif; outline:none; }
.wff { margin-bottom:16px; }
</style>`;

// ─── RENDER FUNCTIONS ─────────────────────────────────────────────────────────

function renderHome(wiki) {
  const query = wikiState.searchQuery.toLowerCase();
  const filterCat = wikiState.filterCategoryId;
  let filtered = wiki.guides;
  if (query) filtered = filtered.filter(g => g.title.toLowerCase().includes(query) || g.summary.toLowerCase().includes(query) || g.content.toLowerCase().includes(query));
  if (filterCat) filtered = filtered.filter(g => g.categoryId === filterCat);
  const totalGuides = wiki.guides.length;
  const filledGuides = wiki.guides.filter(g => g.content && g.content.trim()).length;
  const categoryFilters = `<div class="wfilters"><button class="wfbtn ${!filterCat ? 'active' : ''}" onclick="window.wikiSetFilter(null)">All</button>${wiki.categories.map(cat => `<button class="wfbtn ${filterCat === cat.id ? 'active' : ''}" onclick="window.wikiSetFilter('${cat.id}')">${cat.icon} ${esc(cat.name)}</button>`).join("")}</div>`;
  const sections = wiki.categories.map(cat => {
    const guides = filtered.filter(g => g.categoryId === cat.id);
    if (guides.length === 0 && (query || filterCat)) return "";
    if (guides.length === 0 && !query && !filterCat) return "";
    const cards = guides.map(g => `<div class="wcard" style="--cc:${cat.color}" onclick="window.wikiOpenGuide('${g.id}')"><div class="wcard-title">${esc(g.title)}</div><div class="wcard-sum">${esc(g.summary)}</div><span class="wstatus ${g.content && g.content.trim() ? 'has' : 'empty'}">${g.content && g.content.trim() ? '✓ Has notes' : '○ Empty'}</span></div>`).join("");
    const addCard = !query && !filterCat ? `<div class="wadd" onclick="window.wikiNewGuide('${cat.id}')"><span style="font-size:18px;">＋</span><span>Add guide</span></div>` : "";
    return `<div class="wsection"><div class="wsec-hdr"><span style="font-size:18px;">${cat.icon}</span><span class="wsec-title">${esc(cat.name)}</span><span class="wsec-count">${guides.length} guide${guides.length !== 1 ? 's' : ''}</span></div><div class="wgrid">${cards}${addCard}</div></div>`;
  }).join("");
  return `<div class="whero"><div class="whero-title">📚 ArcheRage Wiki</div><div class="whero-sub">Your personal knowledge base — all notes stored locally, fully offline.</div><input class="wsearch" type="text" placeholder="Search all guides..." value="${esc(wikiState.searchQuery)}" oninput="window.wikiSearch(this.value)"><div class="wstats"><div class="wstat"><span>${totalGuides}</span> guides total</div><div class="wstat"><span>${filledGuides}</span> with notes</div><div class="wstat"><span>${totalGuides - filledGuides}</span> waiting to be filled</div></div></div>${categoryFilters}${sections || `<div class="card" style="text-align:center;padding:40px;color:#475569;">No guides match your search.</div>`}<div style="display:flex;gap:10px;margin-top:8px;flex-wrap:wrap;"><button class="wbtn-back" style="color:#fcd34d;border-color:#fcd34d;" onclick="window.wikiNewCategory()">＋ New Category</button><button class="wbtn-back" style="color:#86efac;border-color:#86efac;" onclick="window.wikiOpenSubmitModal()">📤 Submit Community Guide</button></div>`;
}

function renderGuide(wiki, guideId) {
  const guide = wiki.guides.find(g => g.id === guideId);
  if (!guide) return renderHome(wiki);
  const cat = wiki.categories.find(c => c.id === guide.categoryId);
  const isDefault = DEFAULT_WIKI.guides.some(d => d.id === guide.id);
  return `<div class="wg-hdr"><div><div class="wbadge">${cat ? cat.icon : "📄"} ${esc(cat ? cat.name : "")}</div><div class="wg-title">${esc(guide.title)}</div>${guide.summary ? `<p class="wg-sum">${esc(guide.summary)}</p>` : ""}</div><div class="wacts"><button class="wbtn-back" onclick="window.wikiGoHome()">← Back</button><button class="wbtn-edit" onclick="window.wikiEditGuide('${guideId}')">✏️ Edit</button>${!isDefault ? `<button class="wbtn-del" onclick="window.wikiDeleteGuide('${guideId}')">🗑 Delete</button>` : ""}</div></div><div class="wcontent">${renderMarkdown(guide.content)}</div>`;
}

function renderEditor(wiki, guideId) {
  const guide = wiki.guides.find(g => g.id === guideId);
  if (!guide) return renderHome(wiki);
  const cat = wiki.categories.find(c => c.id === guide.categoryId);
  return `<div class="wg-hdr"><div><div class="wbadge">${cat ? cat.icon : "📄"} ${esc(cat ? cat.name : "")}</div><div class="wg-title">✏️ ${esc(guide.title)}</div></div></div><div class="wetoolbar"><button class="wetbtn" onclick="window.wikiInsert('# ','')">H1</button><button class="wetbtn" onclick="window.wikiInsert('## ','')">H2</button><button class="wetbtn" onclick="window.wikiInsert('### ','')">H3</button><span style="width:1px;background:#2a3a52;margin:2px 4px;"></span><button class="wetbtn" onclick="window.wikiWrap('**','**')"><b>B</b></button><button class="wetbtn" onclick="window.wikiWrap('*','*')"><i>I</i></button><button class="wetbtn" onclick="window.wikiWrap('\`','\`')">code</button><span style="width:1px;background:#2a3a52;margin:2px 4px;"></span><button class="wetbtn" onclick="window.wikiInsert('- ','')">• List</button><button class="wetbtn" onclick="window.wikiInsert('> ','')">Quote</button><button class="wetbtn" onclick="window.wikiInsert('---','')">─ Line</button></div><textarea id="wikiTA" class="weta" placeholder="Start writing...">${esc(guide.content)}</textarea><div class="wehint">Tip: # heading | **bold** | *italic* | \`code\` | - bullet | &gt; quote | --- line</div><div class="wsavebar"><button class="wbtn-cancel" onclick="window.wikiOpenGuide('${guideId}')">Cancel</button><button class="wbtn-save" onclick="window.wikiSave('${guideId}')">💾 Save</button></div>`;
}

function renderNewGuide(wiki, catId) {
  return `<div class="wg-hdr"><div><div class="wg-title">＋ New Guide</div></div><button class="wbtn-back" onclick="window.wikiGoHome()">← Back</button></div><div class="card"><div class="wff"><label class="wflabel">Guide Title</label><input id="ngTitle" class="wfinput" type="text" placeholder="e.g. My Farming Route"></div><div class="wff"><label class="wflabel">Short Description</label><input id="ngSummary" class="wfinput" type="text" placeholder="One-line summary"></div><div class="wff"><label class="wflabel">Category</label><select id="ngCat" class="wfselect">${wiki.categories.map(cat => `<option value="${cat.id}" ${cat.id === catId ? 'selected' : ''}>${cat.icon} ${cat.name}</option>`).join("")}</select></div><div class="wsavebar"><button class="wbtn-cancel" onclick="window.wikiGoHome()">Cancel</button><button class="wbtn-save" onclick="window.wikiCreateGuide()">Create Guide</button></div></div>`;
}

function renderNewCategory() {
  return `<div class="wg-hdr"><div><div class="wg-title">＋ New Category</div></div><button class="wbtn-back" onclick="window.wikiGoHome()">← Back</button></div><div class="card"><div class="wff"><label class="wflabel">Category Name</label><input id="ncName" class="wfinput" type="text" placeholder="e.g. PvP Strategies"></div><div class="wff"><label class="wflabel">Icon (emoji)</label><input id="ncIcon" class="wfinput" type="text" placeholder="🗺️" maxlength="4" style="width:80px;"></div><div class="wff"><label class="wflabel">Accent Color</label><input id="ncColor" class="wfinput" type="color" value="#93c5fd" style="width:80px;height:40px;padding:4px;"></div><div class="wsavebar"><button class="wbtn-cancel" onclick="window.wikiGoHome()">Cancel</button><button class="wbtn-save" onclick="window.wikiCreateCat()">Create Category</button></div></div>`;
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────

export function renderPage() {
  const wiki = loadWiki();
  let body = "";
  switch (wikiState.view) {
    case "guide":      body = renderGuide(wiki, wikiState.activeGuideId); break;
    case "edit":       body = renderEditor(wiki, wikiState.activeGuideId); break;
    case "newGuide":   body = renderNewGuide(wiki, wikiState.activeCategoryId); break;
    case "newCat":     body = renderNewCategory(); break;
    default:           body = renderHome(wiki); break;
  }
  return `${WIKI_STYLES}<div class="wwrap">${body}</div>`;
}

// ─── HANDLERS ────────────────────────────────────────────────────────────────

window.wikiGoHome = function() { wikiState.view = "home"; wikiState.activeGuideId = null; window.renderCurrentPage(); };
window.wikiSetFilter = function(id) { wikiState.filterCategoryId = id; window.renderCurrentPage(); };
window.wikiSearch = function(v) {
  wikiState.searchQuery = v;
  window.renderCurrentPage();
  setTimeout(() => { const el = document.querySelector(".wsearch"); if (el) { el.focus(); el.setSelectionRange(v.length, v.length); } }, 0);
};
window.wikiOpenGuide = function(id) { wikiState.view = "guide"; wikiState.activeGuideId = id; window.renderCurrentPage(); };
window.wikiEditGuide = function(id) { wikiState.view = "edit"; wikiState.activeGuideId = id; window.renderCurrentPage(); };
window.wikiSave = function(id) {
  const ta = document.getElementById("wikiTA");
  if (!ta) return;
  const wiki = loadWiki();
  const g = wiki.guides.find(x => x.id === id);
  if (g) { g.content = ta.value; saveWiki(wiki); }
  wikiState.view = "guide";
  window.renderCurrentPage();
};
window.wikiNewGuide = function(catId) { wikiState.view = "newGuide"; wikiState.activeCategoryId = catId; window.renderCurrentPage(); };
window.wikiCreateGuide = function() {
  const title = document.getElementById("ngTitle")?.value.trim();
  const summary = document.getElementById("ngSummary")?.value.trim();
  const catId = document.getElementById("ngCat")?.value;
  if (!title) { alert("Please enter a title."); return; }
  const wiki = loadWiki();
  const id = "guide-" + Date.now();
  wiki.guides.push({ id, categoryId: catId, title, summary: summary || "", content: "" });
  saveWiki(wiki);
  wikiState.view = "edit"; wikiState.activeGuideId = id;
  window.renderCurrentPage();
};
window.wikiNewCategory = function() { wikiState.view = "newCat"; window.renderCurrentPage(); };
window.wikiCreateCat = function() {
  const name = document.getElementById("ncName")?.value.trim();
  const icon = document.getElementById("ncIcon")?.value.trim() || "📄";
  const color = document.getElementById("ncColor")?.value || "#93c5fd";
  if (!name) { alert("Please enter a category name."); return; }
  const wiki = loadWiki();
  wiki.categories.push({ id: "cat-" + Date.now(), icon, name, color });
  saveWiki(wiki);
  wikiState.view = "home";
  window.renderCurrentPage();
};
window.wikiDeleteGuide = function(id) {
  if (!confirm("Delete this guide? This cannot be undone.")) return;
  const wiki = loadWiki();
  wiki.guides = wiki.guides.filter(g => g.id !== id);
  saveWiki(wiki);
  wikiState.view = "home";
  window.renderCurrentPage();
};
window.wikiInsert = function(pre, suf) {
  const ta = document.getElementById("wikiTA"); if (!ta) return;
  const s = ta.selectionStart, e = ta.selectionEnd;
  const sel = ta.value.substring(s, e) || "text";
  ta.value = ta.value.substring(0, s) + pre + sel + suf + ta.value.substring(e);
  ta.focus(); ta.selectionStart = s + pre.length; ta.selectionEnd = s + pre.length + sel.length;
};
window.wikiWrap = function(pre, suf) { window.wikiInsert(pre, suf); };

// ─── COMMUNITY SUBMIT ─────────────────────────────────────────────────────────

window.wikiOpenSubmitModal = function() {
  document.getElementById('wiki-submit-modal')?.remove();
  const wiki = loadWiki();
  const ign  = localStorage.getItem('userIgn') || '';

  const modal = document.createElement('div');
  modal.id = 'wiki-submit-modal';
  modal.style.cssText = `position:fixed;inset:0;background:rgba(0,0,0,0.6);
    display:flex;align-items:center;justify-content:center;z-index:9999;`;

  modal.innerHTML = `
    <div style="background:#1a2535;border:1px solid #2a3a52;border-radius:12px;
      padding:24px;width:600px;max-width:95vw;max-height:90vh;overflow-y:auto;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
        <h3 style="margin:0;color:#eef2f7;">📤 Submit Community Guide</h3>
        <button onclick="document.getElementById('wiki-submit-modal')?.remove()"
          style="background:none;border:none;color:#566174;font-size:18px;cursor:pointer;">✕</button>
      </div>

      <p style="font-size:13px;color:#566174;margin:0 0 16px;">
        Submitted guides are reviewed before going live. Approved guides earn you <strong style="color:#ffd166;">+25 ARC Points</strong>
        and will be credited to your IGN.
      </p>

      <div style="display:flex;flex-direction:column;gap:12px;">
        <div>
          <label style="font-size:11px;color:#566174;display:block;margin-bottom:4px;text-transform:uppercase;letter-spacing:0.06em;">Title</label>
          <input id="ws-title" type="text" placeholder="e.g. How to farm Auroria efficiently"
            style="width:100%;box-sizing:border-box;padding:8px 12px;background:#0f1923;
            border:1px solid #2a3a52;color:#eef2f7;border-radius:8px;font-size:13px;">
        </div>
        <div>
          <label style="font-size:11px;color:#566174;display:block;margin-bottom:4px;text-transform:uppercase;letter-spacing:0.06em;">Category</label>
          <select id="ws-category" style="width:100%;box-sizing:border-box;padding:8px 12px;
            background:#0f1923;border:1px solid #2a3a52;color:#eef2f7;border-radius:8px;font-size:13px;">
            ${wiki.categories.map(c => `<option value="${esc(c.name)}">${c.icon} ${esc(c.name)}</option>`).join('')}
          </select>
        </div>
        <div>
          <label style="font-size:11px;color:#566174;display:block;margin-bottom:4px;text-transform:uppercase;letter-spacing:0.06em;">Content</label>
          <textarea id="ws-content" placeholder="Write your guide here... (markdown supported)"
            style="width:100%;box-sizing:border-box;padding:8px 12px;background:#0f1923;
            border:1px solid #2a3a52;color:#eef2f7;border-radius:8px;font-size:13px;
            min-height:200px;resize:vertical;font-family:monospace;"></textarea>
        </div>
        <div style="font-size:12px;color:#566174;">
          Submitting as: <strong style="color:#8d99ab;">${ign ? esc(ign) : 'No IGN set — set it on the Home page first'}</strong>
        </div>
      </div>

      <div style="display:flex;gap:10px;margin-top:20px;">
        <button onclick="window.wikiSubmitGuide()"
          ${!ign ? 'disabled style="opacity:0.4;cursor:not-allowed;"' : ''}
          style="flex:1;padding:9px;background:#1a2a1a;border:1px solid #2a5a2a;
          color:#86efac;border-radius:8px;font-weight:600;cursor:pointer;">
          Submit for Review
        </button>
        <button onclick="document.getElementById('wiki-submit-modal')?.remove()"
          style="flex:1;padding:9px;background:#1e2535;border:1px solid #2a3a52;
          color:#566174;border-radius:8px;cursor:pointer;">Cancel</button>
      </div>
      <div id="ws-status" style="font-size:12px;margin-top:10px;min-height:16px;"></div>
    </div>
  `;
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
  document.body.appendChild(modal);
};

window.wikiSubmitGuide = async function() {
  const title    = document.getElementById('ws-title')?.value?.trim();
  const category = document.getElementById('ws-category')?.value;
  const content  = document.getElementById('ws-content')?.value?.trim();
  const statusEl = document.getElementById('ws-status');
  const ign      = localStorage.getItem('userIgn') || '';

  if (!title)   { if (statusEl) { statusEl.style.color = '#f87171'; statusEl.textContent = 'Title is required.'; } return; }
  if (!content) { if (statusEl) { statusEl.style.color = '#f87171'; statusEl.textContent = 'Content is required.'; } return; }

  if (statusEl) { statusEl.style.color = '#566174'; statusEl.textContent = 'Submitting…'; }

  const result = await window.electronAPI?.wikiSubmit({ title, category, content, ign });

  if (result?.ok) {
    if (statusEl) { statusEl.style.color = '#86efac'; statusEl.textContent = '✓ Submitted! You\'ll be notified when it\'s reviewed.'; }
    setTimeout(() => document.getElementById('wiki-submit-modal')?.remove(), 2000);
  } else {
    if (statusEl) { statusEl.style.color = '#f87171'; statusEl.textContent = result?.error || 'Submission failed.'; }
  }
};