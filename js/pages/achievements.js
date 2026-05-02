import { escapeHtml, jsEscape } from "../utils.js";
import { ALL_ACHIEVEMENTS } from "../data/achievements/index.js";

const LOCAL_KEY = "achievementsState";
const EXPANDED_KEY = "achievementsExpanded";

const COLUMNS = [
  { key: "name", label: "Mount / Pet" },
  { key: "manastorm", label: "Manastorm", align: "center" },
  { key: "store", label: "Store", align: "center" },
  { key: "boss", label: "Boss / RNG", align: "center" },
  { key: "vendor", label: "Vendor", align: "center" },
  { key: "quest", label: "Quest", align: "center" },
  { key: "kyrios", label: "Kyrios", align: "center" },
  { key: "vocation", label: "Vocation", align: "center" },
  { key: "gilda", label: "Gilda", align: "center" },
  { key: "wonderland", label: "Wonderland", align: "center" },
  { key: "loyalty", label: "Loyalty", align: "center" },
  { key: "merit", label: "Merit", align: "center" },
  { key: "goldenToken", label: "Golden Token", align: "center" },
  { key: "loginBadge", label: "Login Badge", align: "center" },
  { key: "credits", label: "Credits", align: "center" },
];

const ACHIEVEMENTS = ALL_ACHIEVEMENTS;

function getState() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY)) || {};
  } catch {
    return {};
  }
}

function saveAchievement(achId, updates) {
  const state = getState();
  state[achId] = { ...(state[achId] || {}), ...updates };
  localStorage.setItem(LOCAL_KEY, JSON.stringify(state));
}

function getExpanded() {
  try {
    return JSON.parse(localStorage.getItem(EXPANDED_KEY)) || {};
  } catch {
    return {};
  }
}

function toggleExpanded(id) {
  const expanded = getExpanded();
  expanded[id] = !expanded[id];
  localStorage.setItem(EXPANDED_KEY, JSON.stringify(expanded));
}

function countCheckedItems(sub, stateData) {
  const checked = stateData.checked || {};
  return sub.items.filter((_, i) => checked[`${sub.id}_${i}`] === true).length;
}

function calculateSubAchievement(sub, stateData) {
  const checkedCount = countCheckedItems(sub, stateData);
  const total = sub.items.length;
  const progress = total > 0 ? Math.round((checkedCount / total) * 100) : 0;
  return {
    checkedCount,
    total,
    progress,
    isFullyCompleted: total > 0 && checkedCount === total,
  };
}

function calculateGroupProgress(group, state = getState()) {
  let totalItems = 0;
  let totalChecked = 0;
  let completedSubs = 0;

  group.subAchievements.forEach((sub) => {
    const calc = calculateSubAchievement(sub, state[sub.id] || {});
    totalItems += calc.total;
    totalChecked += calc.checkedCount;
    if (calc.isFullyCompleted) completedSubs += 1;
  });

  return {
    totalItems,
    totalChecked,
    completedSubs,
    totalSubs: group.subAchievements.length,
    progress: totalItems > 0 ? Math.round((totalChecked / totalItems) * 100) : 0,
  };
}

function calculateOverallProgress() {
  const state = getState();
  return ACHIEVEMENTS.reduce(
    (totals, group) => {
      const groupProgress = calculateGroupProgress(group, state);
      totals.items += groupProgress.totalItems;
      totals.checked += groupProgress.totalChecked;
      totals.subs += groupProgress.totalSubs;
      totals.completedSubs += groupProgress.completedSubs;
      return totals;
    },
    { items: 0, checked: 0, subs: 0, completedSubs: 0 }
  );
}

function renderProgressBar(progress, tone = "blue") {
  return `
    <div class="ach-progress">
      <div class="ach-progress-fill ${tone}" style="width:${Math.max(0, Math.min(100, progress))}%"></div>
    </div>
  `;
}

function emptyValue() {
  return `<span class="ach-empty">-</span>`;
}

function renderQuestCell(item) {
  const value = item.quest || "";
  const hasNote = Boolean(item.questNote);
  const hasLink = Boolean(item.questLink);

  if (!value) {
    return `<td class="ach-center">${emptyValue()}</td>`;
  }

  let content = escapeHtml(value);
  if (hasLink) {
    content = `<a href="${escapeHtml(item.questLink)}" target="_blank" rel="noopener noreferrer" class="ach-link">${escapeHtml(value)}</a>`;
  }

  if (hasNote) {
    content += ` <span class="achievement-note" title="${escapeHtml(item.questNote)}" aria-label="Important note">!</span>`;
  }

  return `<td class="ach-center">${content}</td>`;
}

function renderCell(item, col) {
  if (col.key === "quest") return renderQuestCell(item);
  const value = item[col.key];
  const content = value ? escapeHtml(value) : emptyValue();
  const className = col.key === "name" ? "ach-item-name" : "ach-center";
  return `<td class="${className}" style="text-align:${col.align || "left"};">${content}</td>`;
}

function renderEmptyGroupMessage(group) {
  if (group.subAchievements.length > 0) return "";
  return `<div class="ach-empty-group">Data not added yet.</div>`;
}

function getSubSearchText(sub) {
  return [
    sub.title,
    sub.reward,
    ...sub.items.flatMap((item) => COLUMNS.map((col) => item[col.key] || "")),
  ].join(" ").toLowerCase();
}

function getGroupSearchText(group) {
  return [
    group.title,
    ...group.subAchievements.map(getSubSearchText),
  ].join(" ").toLowerCase();
}

function renderHero() {
  const totals = calculateOverallProgress();
  const overall = totals.items > 0 ? Math.round((totals.checked / totals.items) * 100) : 0;

  return `
    <div class="card ach-hero">
      <div class="ach-hero-copy">
        <h2>Collection Achievements</h2>
        <p class="notice">Track mounts, pets, costumes, and ArcheRage collection sets without losing the source columns that matter.</p>
        ${renderProgressBar(overall, overall === 100 ? "green" : "blue")}
      </div>
      <div class="ach-stats">
        <div><strong>${overall}%</strong><span>Overall</span></div>
        <div><strong>${totals.checked}/${totals.items}</strong><span>Items</span></div>
        <div><strong>${totals.completedSubs}/${totals.subs}</strong><span>Sets</span></div>
      </div>
    </div>
  `;
}

function renderToolbar() {
  return `
    <div class="card ach-toolbar">
      <input
        type="search"
        id="achievement-search"
        placeholder="Search achievement, reward, mount, pet, or source"
        oninput="window.filterAchievements(this.value)"
      >
      <div class="ach-toolbar-actions">
        <button onclick="window.expandAllAchievements()">Expand all</button>
        <button onclick="window.collapseAllAchievements()">Collapse all</button>
      </div>
    </div>
  `;
}

function renderGroup(group) {
  const groupProgress = calculateGroupProgress(group);
  const isGroupExpanded = getExpanded()[group.id] === true;
  const completed = groupProgress.progress === 100 && groupProgress.totalItems > 0;

  return `
    <section class="card ach-group" data-ach-group data-search="${escapeHtml(getGroupSearchText(group))}">
      <button class="ach-group-head" onclick="window.toggleExpanded('${jsEscape(group.id)}')">
        <div>
          <h3>${escapeHtml(group.title)}</h3>
          <p>${groupProgress.completedSubs}/${groupProgress.totalSubs} sets complete · ${groupProgress.totalChecked}/${groupProgress.totalItems} items checked</p>
        </div>
        <div class="ach-group-status">
          <span class="ach-percent ${completed ? "complete" : ""}">${completed ? "Completed" : `${groupProgress.progress}%`}</span>
          <span class="ach-chevron">${isGroupExpanded ? "▲" : "▼"}</span>
        </div>
      </button>
      <div class="ach-group-bar">${renderProgressBar(groupProgress.progress, completed ? "green" : "blue")}</div>

      ${isGroupExpanded ? `
        <div class="ach-sub-list">
          ${renderEmptyGroupMessage(group)}
          ${group.subAchievements.map(renderSubAchievement).join("")}
        </div>
      ` : ""}
    </section>
  `;
}

function renderSubAchievement(sub) {
  const stateData = getState()[sub.id] || {};
  const calc = calculateSubAchievement(sub, stateData);
  const isSubExpanded = getExpanded()[sub.id] === true;

  return `
    <article class="ach-sub" data-ach-sub data-search="${escapeHtml(getSubSearchText(sub))}">
      <button class="ach-sub-head" onclick="window.toggleExpanded('${jsEscape(sub.id)}')">
        <div>
          <h4>${escapeHtml(sub.title)}</h4>
          <p>Reward: ${escapeHtml(sub.reward)}</p>
        </div>
        <div class="ach-sub-status">
          <span class="${calc.isFullyCompleted ? "complete" : ""}">
            ${calc.isFullyCompleted ? "Completed" : `${calc.checkedCount}/${calc.total}`}
          </span>
          <span>${isSubExpanded ? "▲" : "▼"}</span>
        </div>
      </button>
      ${renderProgressBar(calc.progress, calc.isFullyCompleted ? "green" : "blue")}

      ${isSubExpanded ? `
        <div class="table-wrap ach-table-wrap">
          <table class="ach-table">
            <thead>
              <tr>
                <th class="ach-check-col">Done</th>
                ${COLUMNS.map((col) => `<th>${escapeHtml(col.label)}</th>`).join("")}
              </tr>
            </thead>
            <tbody>
              ${sub.items.map((item, index) => renderAchievementRow(sub, item, index, stateData)).join("")}
            </tbody>
          </table>
        </div>
      ` : ""}
    </article>
  `;
}

function renderAchievementRow(sub, item, index, stateData) {
  const checkedKey = `${sub.id}_${index}`;
  const isChecked = stateData.checked && stateData.checked[checkedKey];

  return `
    <tr class="${isChecked ? "ach-row-complete" : ""}">
      <td class="ach-check-col">
        <input
          type="checkbox"
          ${isChecked ? "checked" : ""}
          onchange="window.toggleAchievementItem('${jsEscape(sub.id)}', '${checkedKey}', this.checked)"
        >
      </td>
      ${COLUMNS.map((col) => renderCell(item, col)).join("")}
    </tr>
  `;
}

export function renderPage() {
  return `
    <div class="ach-page">
      <h1>Achievements</h1>
      ${renderHero()}
      ${renderToolbar()}
      ${ACHIEVEMENTS.map(renderGroup).join("")}
    </div>

    <style>
      .ach-page h1 {
        margin-bottom: 16px;
      }

      .ach-hero {
        display: flex;
        justify-content: space-between;
        align-items: stretch;
        gap: 18px;
        border-color: #3f5168;
      }

      .ach-hero-copy {
        flex: 1 1 auto;
      }

      .ach-hero-copy h2 {
        margin-bottom: 8px;
      }

      .ach-stats {
        display: grid;
        grid-template-columns: repeat(3, minmax(94px, 1fr));
        gap: 10px;
        min-width: 330px;
      }

      .ach-stats div {
        background: #1b2330;
        border: 1px solid #3a475b;
        border-radius: 8px;
        padding: 12px;
        text-align: center;
      }

      .ach-stats strong {
        display: block;
        color: #8fc3ff;
        font-size: 23px;
        line-height: 1;
      }

      .ach-stats span {
        display: block;
        color: #aeb7c6;
        font-size: 12px;
        margin-top: 6px;
        text-transform: uppercase;
      }

      .ach-toolbar {
        position: sticky;
        top: 0;
        z-index: 8;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 14px;
      }

      #achievement-search {
        flex: 1 1 420px;
        max-width: 560px;
        background: #1b2028;
        color: #eef2f7;
        border: 1px solid #485366;
        border-radius: 8px;
        padding: 10px 12px;
        font-size: 14px;
      }

      .ach-toolbar-actions {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }

      .ach-toolbar-actions button {
        background: #1b2330;
        color: #cbd5e1;
        border: 1px solid #3a475b;
        border-radius: 8px;
        padding: 9px 12px;
        cursor: pointer;
      }

      .ach-toolbar-actions button:hover {
        border-color: #8fc3ff;
        color: #f8fafc;
      }

      .ach-group {
        padding: 0;
        overflow: hidden;
      }

      .ach-group-head,
      .ach-sub-head {
        width: 100%;
        border: 0;
        color: inherit;
        text-align: left;
        cursor: pointer;
        display: flex;
        justify-content: space-between;
        gap: 16px;
        align-items: center;
      }

      .ach-group-head {
        background: #2a3140;
        padding: 18px 20px;
      }

      .ach-group-head:hover,
      .ach-sub-head:hover {
        background: #30394a;
      }

      .ach-group-head h3,
      .ach-sub-head h4 {
        margin: 0 0 6px;
      }

      .ach-group-head p,
      .ach-sub-head p {
        margin: 0;
        color: #aeb7c6;
        font-size: 13px;
      }

      .ach-group-status,
      .ach-sub-status {
        display: flex;
        align-items: center;
        gap: 12px;
        white-space: nowrap;
        font-weight: 700;
      }

      .ach-percent {
        color: #8fc3ff;
      }

      .ach-percent.complete,
      .ach-sub-status .complete {
        color: #86efac;
      }

      .ach-chevron {
        color: #94a3b8;
      }

      .ach-group-bar {
        padding: 0 20px 16px;
        background: #2a3140;
      }

      .ach-progress {
        height: 7px;
        background: #151b24;
        border-radius: 999px;
        overflow: hidden;
        border: 1px solid #343c49;
      }

      .ach-progress-fill {
        height: 100%;
        border-radius: 999px;
        transition: width 0.2s ease;
      }

      .ach-progress-fill.blue {
        background: linear-gradient(90deg, #2d7fd0, #8fc3ff);
      }

      .ach-progress-fill.green {
        background: linear-gradient(90deg, #16a34a, #86efac);
      }

      .ach-sub-list {
        padding: 14px 16px 18px;
      }

      .ach-sub {
        background: #202735;
        border: 1px solid #394252;
        border-radius: 8px;
        overflow: hidden;
        margin-top: 10px;
      }

      .ach-sub:first-child {
        margin-top: 0;
      }

      .ach-sub-head {
        background: #202735;
        padding: 14px 16px;
      }

      .ach-sub > .ach-progress {
        margin: 0 16px 14px;
      }

      .ach-table-wrap {
        border-top: 1px solid #394252;
        border-radius: 0;
      }

      .ach-table {
        min-width: 1480px;
        table-layout: fixed;
      }

      .ach-table th,
      .ach-table td {
        padding: 8px 9px;
        vertical-align: middle;
        white-space: nowrap;
      }

      .ach-table th {
        background: #1d2735;
        font-size: 12px;
      }

      .ach-table tbody tr:nth-child(even) td {
        background: rgba(255,255,255,0.018);
      }

      .ach-table tbody tr:hover td {
        background: #2b3544;
      }

      .ach-check-col {
        width: 58px;
        text-align: center;
      }

      .ach-item-name {
        position: sticky;
        left: 0;
        z-index: 2;
        background: #252c39;
        min-width: 190px;
        font-weight: 700;
        color: #f8fafc;
      }

      .ach-table th:nth-child(2) {
        position: sticky;
        left: 58px;
        z-index: 3;
      }

      .ach-table td:nth-child(2) {
        left: 58px;
      }

      .ach-center {
        color: #dce6f5;
      }

      .ach-empty {
        color: #657083;
      }

      .ach-link {
        color: #8fc3ff;
        text-decoration: underline;
      }

      .achievement-note {
        display: inline-flex;
        justify-content: center;
        align-items: center;
        width: 17px;
        height: 17px;
        border-radius: 50%;
        background: rgba(255, 209, 102, 0.14);
        border: 1px solid rgba(255, 209, 102, 0.38);
        color: #ffd166;
        font-size: 11px;
        font-weight: 800;
        cursor: help;
      }

      .ach-row-complete td {
        background: rgba(22, 163, 74, 0.08);
      }

      .ach-row-complete .ach-item-name {
        color: #86efac;
      }

      .ach-empty-group {
        color: #94a3b8;
        font-size: 0.95em;
        padding: 12px 4px;
      }

      .ach-hidden {
        display: none;
      }

      @media (max-width: 900px) {
        .ach-hero,
        .ach-toolbar {
          flex-direction: column;
          align-items: stretch;
        }

        .ach-stats {
          min-width: 0;
        }
      }
    </style>
  `;
}

window.toggleExpanded = (id) => {
  const y = window.scrollY;
  toggleExpanded(id);
  window.renderCurrentPage();
  window.requestAnimationFrame(() => window.scrollTo({ top: y, behavior: "auto" }));
};

window.toggleAchievementItem = (subId, checkedKey, isChecked) => {
  const y = window.scrollY;
  const searchValue = document.getElementById("achievement-search")?.value || "";
  const state = getState();
  const subState = state[subId] || {};
  const checked = subState.checked || {};
  checked[checkedKey] = isChecked;
  saveAchievement(subId, { checked });
  window.renderCurrentPage();
  window.requestAnimationFrame(() => {
    const search = document.getElementById("achievement-search");
    if (search) {
      search.value = searchValue;
      window.filterAchievements(searchValue);
    }
    window.scrollTo({ top: y, behavior: "auto" });
  });
};

window.expandAllAchievements = () => {
  const expanded = {};
  ACHIEVEMENTS.forEach((group) => {
    expanded[group.id] = true;
    group.subAchievements.forEach((sub) => {
      expanded[sub.id] = true;
    });
  });
  localStorage.setItem(EXPANDED_KEY, JSON.stringify(expanded));
  window.renderCurrentPage();
};

window.collapseAllAchievements = () => {
  localStorage.setItem(EXPANDED_KEY, JSON.stringify({}));
  window.renderCurrentPage();
};

window.filterAchievements = (value) => {
  const query = String(value || "").trim().toLowerCase();

  document.querySelectorAll("[data-ach-group]").forEach((group) => {
    let groupMatches = !query || (group.dataset.search || group.textContent).toLowerCase().includes(query);

    group.querySelectorAll("[data-ach-sub]").forEach((sub) => {
      const subMatches = !query || (sub.dataset.search || sub.textContent).toLowerCase().includes(query);
      sub.classList.toggle("ach-hidden", !subMatches);
    });

    group.classList.toggle("ach-hidden", !groupMatches);
  });
};
