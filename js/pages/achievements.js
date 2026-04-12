import { escapeHtml, jsEscape } from "../utils.js";
import { ALL_ACHIEVEMENTS } from "../data/achievements/index.js";

const LOCAL_KEY = "achievementsState";
const EXPANDED_KEY = "achievementsExpanded";

/* =========================
   STATE
========================= */
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

/* =========================
   COLUMN CONFIG
========================= */
const COLUMNS = [
  { key: "name", label: "Mount / Pet" },
  { key: "manastorm", label: "Manastorm Crystals", align: "center" },
  { key: "store", label: "Store", align: "center" },
  { key: "boss", label: "Boss Drop / RNG Box", align: "center" },
  { key: "vendor", label: "Vendor", align: "center" },
  { key: "quest", label: "Quest", align: "center" },
  { key: "kyrios", label: "Kyrios Badges", align: "center" },
  { key: "vocation", label: "Vocation", align: "center" },
  { key: "gilda", label: "Gilda Design", align: "center" },
  { key: "wonderland", label: "Wonderland", align: "center" },
  { key: "loyalty", label: "Loyalty", align: "center" },
  { key: "merit", label: "Merit Badge", align: "center" },
  { key: "goldenToken", label: "Golden Token*", align: "center" },
  { key: "loginBadge", label: "Login Badge", align: "center" },
  { key: "credits", label: "Credits*", align: "center" }
];

const ACHIEVEMENTS = ALL_ACHIEVEMENTS;

/* =========================
   CALCULATIONS
========================= */
function calculateGroupProgress(group) {
  let totalItems = 0;
  let totalChecked = 0;

  group.subAchievements.forEach((sub) => {
    const stateData = getState()[sub.id] || {};
    const checked = stateData.checked || {};
    totalItems += sub.items.length;
    totalChecked += sub.items.filter((_, i) => checked[`${sub.id}_${i}`] === true).length;
  });

  return totalItems > 0 ? Math.round((totalChecked / totalItems) * 100) : 0;
}

function calculateSubAchievement(sub, stateData) {
  const checked = stateData.checked || {};
  const checkedCount = sub.items.filter((_, i) => checked[`${sub.id}_${i}`] === true).length;
  const progress = sub.items.length > 0 ? Math.round((checkedCount / sub.items.length) * 100) : 0;
  const isFullyCompleted = checkedCount === sub.items.length;

  return { progress, isFullyCompleted };
}

/* =========================
   CELL RENDERERS
========================= */
function renderQuestCell(item) {
  const value = item.quest || "—";
  const hasNote = Boolean(item.questNote);
  const hasLink = Boolean(item.questLink);

  if (value === "—") {
    return `<td style="text-align:center;">—</td>`;
  }

  let content = escapeHtml(value);

  if (hasLink) {
    content = `<a href="${escapeHtml(item.questLink)}" target="_blank" rel="noopener noreferrer" style="color:#8fc3ff; text-decoration:underline;">${escapeHtml(value)}</a>`;
  }

  if (hasNote) {
    content += ` <span class="achievement-note" title="${escapeHtml(item.questNote)}" aria-label="Important note">⚠️</span>`;
  }

  return `<td style="text-align:center;">${content}</td>`;
}

function renderCell(item, col) {
  if (col.key === "quest") {
    return renderQuestCell(item);
  }

  return `<td style="text-align:${col.align || "left"};">${escapeHtml(item[col.key] || "—")}</td>`;
}

function renderEmptyGroupMessage(group) {
  if (group.subAchievements.length > 0) return "";

  return `
    <div style="margin-top:10px; color:#94a3b8; font-size:0.95em;">
      Data not added yet.
    </div>
  `;
}

/* =========================
   RENDER
========================= */
export function renderPage() {
  return `
    <h1>Achievements</h1>
    <div class="card">
      <h2>Collection Achievements</h2>
    </div>

    ${ACHIEVEMENTS.map((group) => {
      const groupProgress = calculateGroupProgress(group);
      const isGroupExpanded = getExpanded()[group.id] === true;

      return `
        <div class="card">
          <div
            onclick="window.toggleExpanded('${jsEscape(group.id)}')"
            style="cursor:pointer; padding:16px 20px; font-size:1.25em; font-weight:bold; display:flex; align-items:center; justify-content:space-between;"
          >
            ${escapeHtml(group.title)}
            <div style="display:flex; align-items:center; gap:12px;">
              <span style="font-size:0.95em; color:#888;">In Progress ${groupProgress}%</span>
              <span style="font-size:1.1em;">${isGroupExpanded ? "▲" : "▼"}</span>
            </div>
          </div>

          ${isGroupExpanded ? `
            ${renderEmptyGroupMessage(group)}
            ${group.subAchievements.map((sub) => {
              const stateData = getState()[sub.id] || {};
              const calc = calculateSubAchievement(sub, stateData);
              const isSubExpanded = getExpanded()[sub.id] === true;

              return `
                <div style="margin-left:20px; margin-top:8px;">
                  <div
                    onclick="window.toggleExpanded('${jsEscape(sub.id)}')"
                    style="cursor:pointer; padding:12px 16px; display:flex; align-items:center; justify-content:space-between; background:#1f2937; border-radius:6px;"
                  >
                    <div>
                      <strong>${escapeHtml(sub.title)}</strong>
                      <div style="font-size:0.9em; color:#888;">Reward: ${escapeHtml(sub.reward)}</div>
                    </div>
                    <div style="font-weight:bold; color:${calc.isFullyCompleted ? "#4ade80" : "#888"};">
                      ${calc.isFullyCompleted ? "✓ Completed" : `${calc.progress}%`}
                    </div>
                  </div>

                  ${isSubExpanded ? `
                    <div class="table-wrap" style="margin-top:8px;">
                      <table>
                        <thead>
                          <tr>
                            <th style="width:50px;">✓</th>
                            ${COLUMNS.map((col) => `<th>${escapeHtml(col.label)}</th>`).join("")}
                          </tr>
                        </thead>
                        <tbody>
                          ${sub.items.map((item, index) => {
                            const checkedKey = `${sub.id}_${index}`;
                            const isChecked = stateData.checked && stateData.checked[checkedKey];

                            return `
                              <tr>
                                <td style="text-align:center;">
                                  <input
                                    type="checkbox"
                                    ${isChecked ? "checked" : ""}
                                    onchange="window.toggleAchievementItem('${jsEscape(sub.id)}', '${checkedKey}', this.checked)"
                                  >
                                </td>
                                ${COLUMNS.map((col) => renderCell(item, col)).join("")}
                              </tr>
                            `;
                          }).join("")}
                        </tbody>
                      </table>
                    </div>
                  ` : ""}
                </div>
              `;
            }).join("")}
          ` : ""}
        </div>
      `;
    }).join("")}
  `;
}

/* =========================
   HANDLERS
========================= */
window.toggleExpanded = (id) => {
  toggleExpanded(id);
  window.renderCurrentPage();
};

window.toggleAchievementItem = (subId, checkedKey, isChecked) => {
  const state = getState();
  const subState = state[subId] || {};
  const checked = subState.checked || {};
  checked[checkedKey] = isChecked;
  saveAchievement(subId, { checked });
  window.renderCurrentPage();
};