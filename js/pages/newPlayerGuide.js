import { escapeHtml } from "../utils.js";
import { eventData } from "../data/events.js";

const STORAGE_KEY = "newPlayerGuideChecklist";
const RESET_TIME_ZONE = "America/New_York";
const DAILY_RESET_EVENT = "Daily Reset";
const WEEKLY_RESET_EVENT = "Weekly Reset";

const SOURCE_LINKS = [
  {
    label: "ArcheRage forum thread",
    url: "https://na.archerage.to/forums/threads/new-player-guide-level-55-what-now.12967/",
  },
  {
    label: "Dumpling written guide",
    url: "https://docs.google.com/document/d/1IHYF9NoABcFv8HwzJ4yBUu-e8Pw5HonW9EBl5q3p2yw/edit?tab=t.0",
  },
  {
    label: "Video guide",
    url: "https://www.youtube.com/watch?v=59MH7MZD-tk",
  },
  {
    label: "Black Forest Treants quest data",
    url: "https://archeagecodex.com/us/quest/9318/",
  },
  {
    label: "Millennium Mammoths quest data",
    url: "https://archeagecodex.com/us/quest/9317/",
  },
];

const STARTER_TASKS = [
  {
    id: "starter-55-ancestral",
    title: "Unlock Ancestral skills",
    priority: "IMPORTANT",
    detail: "Be level 55 with 100% exp, then open Skill Page > Ancestral tab > top-right arrow.",
  },
  {
    id: "starter-support-pack",
    title: "Claim your Support Pack",
    priority: "IMPORTANT",
    detail: "Join the official ArcheRage NA Discord, go to #service-request, and type !support_pack Character Name.",
  },
  {
    id: "starter-open-boxes",
    title: "Open gear boxes slowly",
    priority: "IMPORTANT",
    detail: "You get 7 armor boxes and 4 weapon boxes. Open one at a time and pick the pieces for your build.",
  },
  {
    id: "starter-server-time",
    title: "Turn on server and in-game time",
    priority: "Important",
    detail: "Settings > Game Info. This makes CR, GR, Whalesong, Aegis, and reset timing much easier to follow.",
  },
  {
    id: "starter-dont-invest-bad-rolls",
    title: "Do not gem gear you dislike",
    priority: "IMPORTANT",
    detail: "Early imperfect rolls are okay, but avoid heavy upgrading or gemming until you are happy with the piece.",
  },
];

export const DAILY_TASKS = [
  {
    id: "daily-labor-stipend",
    title: "Farmer's or Traveler's Blessing Stipend",
    priority: "IMPORTANT",
    location: "Credit Marketplace",
    reward: "4000 free labor",
    detail: "The source guide calls this out hard. Make this a daily habit if you can.",
  },
  {
    id: "daily-mammoth",
    title: "Hall of Warriors - Millennium Mammoth",
    priority: "Important",
    location: "Hall of Warriors / Frozen Highlands, start NPC: Lewia",
    reward: "Brilliant Awakening Scrolls",
    detail: "Good early support pack progression. Do in a raid if the mobs feel rough.",
  },
  {
    id: "daily-treant",
    title: "Black Forest Camp - Treant daily",
    priority: "Important",
    location: "Black Forest Camp, start NPC: Soboron",
    reward: "Brilliant Awakening Scrolls",
    detail: "The written guide calls it Something Treant. Ashkan can verify exact NPC/quest text in-game.",
  },
  {
    id: "daily-cr",
    title: "Crimson Rift",
    priority: "Important",
    location: "Cinderstone Moor or Ynystere, 12:00 in-game time",
    reward: "Honor, green boxes, blue boxes, Gilda Stars",
    detail: "There is usually a raid at reset and more during the day. Use Raid Recruit if needed.",
  },
  {
    id: "daily-sgcr",
    title: "Sungold Fields Crimson Rift",
    priority: "You can do this later",
    location: "Sungold Fields, 18:00 in-game time",
    reward: "Backup CR plus extra Gilda from Anthalon or Xarkath",
    detail: "Nice if you missed Yny/Cinder or want the extra rewards.",
  },
  {
    id: "daily-gr",
    title: "Grimghast Rift",
    priority: "Important",
    location: "Cinderstone Moor or Ynystere, 00:00 in-game time",
    reward: "CR-style rewards plus Superior Glow Lunarite",
    detail: "Useful for gem upgrade materials.",
  },
  {
    id: "daily-cinder-yny-war",
    title: "Cinderstone or Ynystere War",
    priority: "You can do this later",
    location: "When the zone is pushed to Conflict/War",
    reward: "Honor and blue boxes",
    detail: "Good when a raid forms. Not worth stressing over if you are still learning.",
  },
  {
    id: "daily-whalesong",
    title: "Whalesong Harbor",
    priority: "Important",
    location: "When Whalesong Harbor is in Conflict/War",
    reward: "Honor and Gilda",
    detail: "Usually done with a raid.",
  },
  {
    id: "daily-aegis",
    title: "Aegis Island",
    priority: "Important",
    location: "When Aegis Island is in Conflict/War",
    reward: "Honor and Gilda",
    detail: "Same general idea as Whalesong. Raid recommended.",
  },
  {
    id: "daily-garden",
    title: "Garden daily",
    priority: "Important",
    location: "Navel of the World, Eastern Hiram Mountains",
    reward: "Glorious Hiram Awakening Scrolls and big Hiram infusions",
    detail: "Enter the main door, pick a colored door, take the fairy quest, then build rank by killing mobs or bait fishing.",
  },
  {
    id: "daily-noryette",
    title: "Noryette Challenge",
    priority: "You can do this later",
    location: "Instance menu, bottom-right of screen",
    reward: "Endgame earrings and ring",
    detail: "One free entry per day. This is more team/setup dependent than the basic progression chores.",
  },
  {
    id: "daily-red-dragon",
    title: "Red Dragon Raid",
    priority: "You can do this later",
    location: "Instance menu at listed Red Dragon times",
    reward: "Honor, Dragon Ridges, glider achievement progress",
    detail: "Queue as soon as it opens so you land in a full raid.",
  },
  {
    id: "daily-halcy-arena-manager",
    title: "Arena Manager token after Halcy",
    priority: "You can do this later",
    location: "Arena Manager in most major cities/towns",
    reward: "Consumes the mailbox token from Halcy rewards",
    detail: "Halcy unlocks at 8000 gear score and requires at least one kill, assist, or death for rewards.",
  },
  {
    id: "daily-hereafter",
    title: "Hereafter Rebellion",
    priority: "You can do this later",
    location: "Solo dungeon, unlocked at 8000 gear score",
    reward: "Best-in-slot DPS necklace path",
    detail: "One entry per day, no resets. Tanks/healers usually use Proven Warrior Necklace instead.",
  },
];

export const WEEKLY_TASKS = [
  {
    id: "weekly-cragtear",
    title: "Cragtear Scars",
    priority: "IMPORTANT",
    location: "Cragtear Scars",
    reward: "Akasch Token Crates",
    detail: "Strong mobs. Highly recommend doing this in a raid.",
  },
  {
    id: "weekly-windwhip",
    title: "Windwhip Temporary Camp",
    priority: "IMPORTANT",
    location: "Windwhip Temporary Camp",
    reward: "Akasch Token Crates",
    detail: "Strong mobs. Highly recommend doing this in a raid.",
  },
  {
    id: "weekly-amaitan",
    title: "Amaitan Meadows Camp",
    priority: "IMPORTANT",
    location: "Amaitan Meadows Camp",
    reward: "Brilliant Awakening Scrolls, T3 to T4",
    detail: "Strong mobs. Highly recommend doing this in a raid.",
  },
  {
    id: "weekly-waterfall",
    title: "Waterfall Stairs Camp",
    priority: "Important",
    location: "Waterfall Stairs Camp",
    reward: "Brilliant Awakening Scrolls",
    detail: "Raid recommended.",
  },
  {
    id: "weekly-illusion-cave",
    title: "Illusion Cave",
    priority: "Important",
    location: "Illusion Cave",
    reward: "Radiant Awakening Scrolls, T2 to T3",
    detail: "Good support pack progression weekly.",
  },
  {
    id: "weekly-hiram-cave",
    title: "Hiram Cave",
    priority: "Important",
    location: "Hiram Cave",
    reward: "Radiant Awakening Scrolls",
    detail: "Good support pack progression weekly.",
  },
  {
    id: "weekly-reedwind-exeloch",
    title: "Reedwind or Exeloch",
    priority: "Important",
    location: "Reedwind or Exeloch",
    reward: "Awakening Scrolls T1 to T2 and Decrystallization Scroll",
    detail: "Useful if you are still moving early Hiram/support gear through tiers.",
  },
  {
    id: "weekly-diamond-sungold",
    title: "Diamond Shores or Sungold Fields",
    priority: "Important",
    location: "Diamond Shores or Sungold Fields",
    reward: "Awakening Scrolls",
    detail: "Another weekly source of awakening materials.",
  },
];

const GEAR_ROWS = [
  ["Tanks", "Cloth for CC PVP tanks", "Scepter + physical shield", "Stamina"],
  ["Healers", "Cloth", "Club + physical shield, or Greatclub", "Spirit"],
  ["Mage DPS", "Cloth or leather", "Staff", "Intelligence"],
  ["Melee DPS", "Leather", "Any 2-hander, Longspear recommended by the guide", "Strength"],
  ["Ranged DPS", "Leather", "Bow for Archery, Rifle for Gunslinger", "Agility"],
];

const ROADMAP = [
  {
    label: "First 30 minutes",
    title: "Get the support pack and make the gear usable",
    items: [
      "Claim support pack through Discord.",
      "Unlock Ancestral skills.",
      "Pick the correct armor type and weapons.",
      "Aim for your main attribute on each piece, with stamina pieces okay early.",
    ],
  },
  {
    label: "First few days",
    title: "Build the daily/weekly rhythm",
    items: [
      "Do the free labor stipend daily.",
      "Join raids for CR, GR, Whalesong, Aegis, Mammoth, Treant, and Hiram weeklies.",
      "Start collecting honor, scrolls, infusions, Gilda, and gem materials.",
    ],
  },
  {
    label: "Next goal",
    title: "Push toward 8000 gear score",
    items: [
      "Temper weapons and armor with Solar and Lunar Tempers.",
      "Feed and awaken pieces you do not plan to remake.",
      "Upgrade and gem weapons first, then armor once weapons get expensive.",
      "Use cheap Glorious Evenglow Lunagems for sleeves if they help.",
    ],
  },
  {
    label: "Later projects",
    title: "Pick a gold engine and long quests",
    items: [
      "Commerce with a Farm Freighter is the guide maker's favorite gold path.",
      "Look for land, especially a 16x16 plot in Mistmerrow if available.",
      "Work on Dream Ring and Hiram Ring over time.",
      "Join a guild for buffs, missions, and the Jakar daily at guild level 6+.",
    ],
  },
];

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // Rebuild below.
  }
  return {
    version: 1,
    dailyResetKey: getDailyResetKey(),
    weeklyResetKey: getWeeklyResetKey(),
    done: {},
  };
}

let state = loadState();

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function getServerDateParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: RESET_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const map = {};
  for (const part of parts) map[part.type] = part.value;
  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
    hour: Number(map.hour),
    minute: Number(map.minute),
    weekday: map.weekday,
  };
}

function toIsoDateFromUtc(date) {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function toIsoDate(parts) {
  return `${parts.year}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}`;
}

function getDailyResetKey(date = new Date()) {
  return toIsoDate(getServerDateParts(date));
}

function getWeeklyResetKey(date = new Date()) {
  const parts = getServerDateParts(date);
  const serverDateAsUtc = new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
  serverDateAsUtc.setUTCDate(serverDateAsUtc.getUTCDate() - serverDateAsUtc.getUTCDay());
  return toIsoDateFromUtc(serverDateAsUtc);
}

function getServerTimeLabel() {
  const parts = getServerDateParts();
  return `${parts.weekday} ${toIsoDate(parts)} ${String(parts.hour).padStart(2, "0")}:${String(parts.minute).padStart(2, "0")} server time`;
}

function ensureFreshResetKeys() {
  const dailyResetKey = getDailyResetKey();
  const weeklyResetKey = getWeeklyResetKey();
  let changed = false;

  if (state.dailyResetKey !== dailyResetKey) {
    for (const task of DAILY_TASKS) delete state.done[task.id];
    state.dailyResetKey = dailyResetKey;
    changed = true;
  }

  if (state.weeklyResetKey !== weeklyResetKey) {
    for (const task of WEEKLY_TASKS) delete state.done[task.id];
    state.weeklyResetKey = weeklyResetKey;
    changed = true;
  }

  if (changed) saveState();
}

function priorityClass(priority) {
  if (priority === "IMPORTANT") return "npg-priority npg-priority-high";
  if (priority === "Important") return "npg-priority npg-priority-mid";
  return "npg-priority npg-priority-later";
}

function progressFor(tasks) {
  const done = tasks.filter((task) => state.done[task.id]).length;
  const total = tasks.length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  return { done, total, pct };
}

function hasScheduledEvent(eventName) {
  return eventData.serverEvents.some((event) => event.name === eventName);
}

function jsString(value) {
  return String(value)
    .replaceAll("\\", "\\\\")
    .replaceAll("'", "\\'")
    .replaceAll('"', '\\"')
    .replaceAll("\n", "\\n")
    .replaceAll("\r", "\\r");
}

function renderResetEventButton(eventName) {
  if (!hasScheduledEvent(eventName)) return "";
  return `
    <button type="button" onclick="window.npgOpenEventSchedule('${jsString(eventName)}')">
      Open ${escapeHtml(eventName)}
    </button>
  `;
}

function renderProgress(tasks) {
  const progress = progressFor(tasks);
  return `
    <div class="npg-progress">
      <div class="npg-progress-top">
        <span>${progress.done} of ${progress.total} done</span>
        <strong>${progress.pct}%</strong>
      </div>
      <div class="npg-progress-track">
        <div class="npg-progress-fill" style="width:${progress.pct}%;"></div>
      </div>
    </div>
  `;
}

function renderChecklistItem(task, cadence) {
  const checked = Boolean(state.done[task.id]);
  return `
    <label class="npg-check-item ${checked ? "is-done" : ""}">
      <input type="checkbox" ${checked ? "checked" : ""} onchange="window.npgToggleTask('${task.id}')">
      <span class="npg-check-body">
        <span class="npg-check-title">
          <span>${escapeHtml(task.title)}</span>
          <span class="${priorityClass(task.priority)}">${escapeHtml(task.priority)}</span>
        </span>
        ${task.location ? `<span class="npg-meta"><strong>Where:</strong> ${escapeHtml(task.location)}</span>` : ""}
        ${task.reward ? `<span class="npg-meta"><strong>Why:</strong> ${escapeHtml(task.reward)}</span>` : ""}
        <span class="npg-detail">${escapeHtml(task.detail)}</span>
        ${cadence ? `<span class="npg-cadence">${escapeHtml(cadence)}</span>` : ""}
      </span>
    </label>
  `;
}

function renderChecklistSection(id, title, subtitle, tasks, cadence, resetHandler) {
  return `
    <section id="npg-${id}" class="npg-panel">
      <div class="npg-section-head">
        <div>
          <h3>${escapeHtml(title)}</h3>
          <p>${escapeHtml(subtitle)}</p>
        </div>
        <button type="button" class="npg-small-btn" onclick="${resetHandler}">Reset</button>
      </div>
      ${renderProgress(tasks)}
      <div class="npg-check-list">
        ${tasks.map((task) => renderChecklistItem(task, cadence)).join("")}
      </div>
    </section>
  `;
}

function renderGearTable() {
  return `
    <div class="npg-table-wrap">
      <table class="npg-table">
        <thead>
          <tr>
            <th>Role</th>
            <th>Armor</th>
            <th>Weapon</th>
            <th>Main stat</th>
          </tr>
        </thead>
        <tbody>
          ${GEAR_ROWS.map((row) => `
            <tr>
              ${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderRoadmap() {
  return `
    <section id="npg-roadmap" class="npg-panel">
      <div class="npg-section-head">
        <div>
          <h3>What to focus on</h3>
          <p>Simple order of operations for fresh 55 and returning players.</p>
        </div>
      </div>
      <div class="npg-roadmap">
        ${ROADMAP.map((step) => `
          <article class="npg-step">
            <span>${escapeHtml(step.label)}</span>
            <h4>${escapeHtml(step.title)}</h4>
            <ul>
              ${step.items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
            </ul>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function renderGearGuide() {
  return `
    <section id="npg-gear" class="npg-panel">
      <div class="npg-section-head">
        <div>
          <h3>Support Pack gear basics</h3>
          <p>Good enough to start, without trapping new players in bad early choices.</p>
        </div>
      </div>
      <div class="npg-callout npg-callout-red">
        <strong>IMPORTANT:</strong> It is okay if your first rolls are not perfect. Do not heavily upgrade or gem a piece you already know you want to remake.
      </div>
      ${renderGearTable()}
      <div class="npg-grid-two">
        <div class="npg-mini">
          <h4>Weapon synthesis stats</h4>
          <p>General rule: stack critical rate and critical damage/heal. Defense penetration is mostly PVP focused. Crit damage is best-in-slot for PVE and still strong in PVP when enemies are debuffed.</p>
        </div>
        <div class="npg-mini">
          <h4>Armor synthesis stats</h4>
          <p>Best-in-slot armor lines are Resilience and received melee/ranged/magic damage reduction. Belt and sleeves are different: Toughness is the big one, with backstab damage for DPS and received healing for healer/tank.</p>
        </div>
      </div>
    </section>
  `;
}

function renderAdvice() {
  return `
    <section id="npg-advice" class="npg-panel">
      <div class="npg-section-head">
        <div>
          <h3>Good start goals</h3>
          <p>Useful paths after the basics are handled.</p>
        </div>
      </div>
      <div class="npg-advice-grid">
        <div class="npg-advice-card">
          <h4>Early gold</h4>
          <p>Free-to-play path: sell some tradeable honor shop items, then save enough gold to buy 1000 Credits from the Auction House for the Farmer's Blessing Stipend.</p>
        </div>
        <div class="npg-advice-card">
          <h4>Farm Freighter</h4>
          <p>Do the Blue Salt Brotherhood questline, get Farm Wagon, buy 12 Multi-Wagon Upgrade Tickets, then upgrade through Chroma, Hauler, and Freighter at a Carpentry Workbench.</p>
        </div>
        <div class="npg-advice-card">
          <h4>Instances</h4>
          <p>Noryette, Red Dragon, Halcy, and Hereafter Rebellion are all useful, but several are easier once you have gear, a group, or 8000 gear score.</p>
        </div>
        <div class="npg-advice-card">
          <h4>Guild</h4>
          <p>A higher-level guild gives better buffs and missions. Level 6+ guilds have a daily Jakar quest in Whalesong that rewards two 1000 labor potions.</p>
        </div>
      </div>
    </section>
  `;
}

function renderSources() {
  return `
    <section class="npg-panel">
      <div class="npg-section-head">
        <div>
          <h3>Sources</h3>
          <p>Rewritten into app wording from the community guide. NPC names and coordinates are ready for Ashkan to verify in-game.</p>
        </div>
      </div>
      <div class="npg-source-row">
        ${SOURCE_LINKS.map((source) => `
          <button type="button" onclick="window.electronAPI?.openExternal?.('${source.url}')">
            ${escapeHtml(source.label)}
          </button>
        `).join("")}
      </div>
    </section>
  `;
}

function renderHero() {
  const starter = progressFor(STARTER_TASKS);

  return `
    <header class="npg-hero">
      <div>
        <span class="npg-kicker">Fresh 55 and returning player help</span>
        <h2>New Player Guide</h2>
        <p>Start here when you hit 55, get power-leveled, or come back after a long break and everything feels like soup.</p>
      </div>
      <div class="npg-reset-card">
        <span>Server time</span>
        <strong>${escapeHtml(getServerTimeLabel())}</strong>
        <p>Reset alerts live in the Event Schedule. Use the bell there for Daily Reset and Weekly Reset notifications.</p>
        <div class="npg-reset-actions">
          ${renderResetEventButton(DAILY_RESET_EVENT)}
          ${renderResetEventButton(WEEKLY_RESET_EVENT)}
        </div>
      </div>
      <div class="npg-stat-row">
        <div><span>Starter</span><strong>${starter.done}/${starter.total}</strong></div>
        <div><span>Daily</span><strong><button type="button" onclick="window.showPage?.('newPlayerChecklist')">Open</button></strong></div>
        <div><span>Weekly</span><strong><button type="button" onclick="window.showPage?.('newPlayerChecklist')">Open</button></strong></div>
      </div>
    </header>
  `;
}

function renderNav() {
  const links = [
    ["start", "Start Here"],
    ["gear", "Gear"],
    ["roadmap", "Roadmap"],
    ["advice", "Good Start"],
  ];

  return `
    <nav class="npg-nav">
      ${links.map(([id, label]) => `
        <a class="section-link" href="#npg-${id}" onclick="document.getElementById('npg-${id}')?.scrollIntoView({behavior:'smooth'});return false;">${escapeHtml(label)}</a>
      `).join("")}
    </nav>
  `;
}

export function renderPage() {
  ensureFreshResetKeys();

  return `
    <div class="new-player-guide">
      ${renderHero()}
      ${renderNav()}
      ${renderChecklistSection(
        "start",
        "Start here",
        "These do not reset. They are the one-time basics that make everything else make sense.",
        STARTER_TASKS,
        "",
        "window.npgResetStarter()"
      )}
      <section class="npg-panel">
        <div class="npg-section-head">
          <div>
            <h3>Daily and weekly checklist</h3>
            <p>The repeatable tasks have their own page now, with daily and weekly reset tracking.</p>
          </div>
          <button type="button" class="npg-small-btn" onclick="window.showPage?.('newPlayerChecklist')">Open Checklist</button>
        </div>
      </section>
      ${renderGearGuide()}
      ${renderRoadmap()}
      ${renderAdvice()}
      ${renderSources()}
    </div>
  `;
}

window.npgToggleTask = function(id) {
  state.done[id] = !state.done[id];
  saveState();
  window.renderCurrentPage?.();
};

window.npgOpenEventSchedule = function(eventName) {
  localStorage.setItem("eventFocusName", eventName);
  window.showPage?.("events");
};

function resetTasks(tasks) {
  for (const task of tasks) delete state.done[task.id];
  saveState();
  window.renderCurrentPage?.();
}

window.npgResetStarter = function() {
  resetTasks(STARTER_TASKS);
};

window.npgResetDaily = function() {
  resetTasks(DAILY_TASKS);
};

window.npgResetWeekly = function() {
  resetTasks(WEEKLY_TASKS);
};
