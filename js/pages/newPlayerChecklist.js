import { escapeHtml } from "../utils.js";
import { eventData } from "../data/events.js";
import { DAILY_TASKS, WEEKLY_TASKS } from "./newPlayerGuide.js";

const STORAGE_KEY = "newPlayerGuideChecklist";
const RESET_TIME_ZONE = "America/New_York";
const DAILY_RESET_EVENT = "Daily Reset";
const WEEKLY_RESET_EVENT = "Weekly Reset";

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
    <button type="button" onclick="window.npclOpenEventSchedule('${jsString(eventName)}')">
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
      <input type="checkbox" ${checked ? "checked" : ""} onchange="window.npclToggleTask('${task.id}')">
      <span class="npg-check-body">
        <span class="npg-check-title">
          <span>${escapeHtml(task.title)}</span>
          <span class="${priorityClass(task.priority)}">${escapeHtml(task.priority)}</span>
        </span>
        ${task.location ? `<span class="npg-meta"><strong>Where:</strong> ${escapeHtml(task.location)}</span>` : ""}
        ${task.reward ? `<span class="npg-meta"><strong>Why:</strong> ${escapeHtml(task.reward)}</span>` : ""}
        <span class="npg-detail">${escapeHtml(task.detail)}</span>
        <span class="npg-cadence">${escapeHtml(cadence)}</span>
      </span>
    </label>
  `;
}

function renderChecklistSection(id, title, subtitle, tasks, cadence, resetHandler) {
  return `
    <section id="npcl-${id}" class="npg-panel">
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

function renderHero() {
  const daily = progressFor(DAILY_TASKS);
  const weekly = progressFor(WEEKLY_TASKS);

  return `
    <header class="npg-hero">
      <div>
        <span class="npg-kicker">Fresh 55 repeatables</span>
        <h2>New Player Checklist</h2>
        <p>Use this as the daily and weekly punch list for support pack progression. Do the IMPORTANT items first, then add the lighter stuff when you have time.</p>
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
        <div><span>Daily</span><strong>${daily.done}/${daily.total}</strong></div>
        <div><span>Weekly</span><strong>${weekly.done}/${weekly.total}</strong></div>
        <div><span>Guide</span><strong><button type="button" onclick="window.showPage?.('newPlayerGuide')">Open</button></strong></div>
      </div>
    </header>
  `;
}

function renderNav() {
  return `
    <nav class="npg-nav">
      <a class="section-link" href="#npcl-daily" onclick="document.getElementById('npcl-daily')?.scrollIntoView({behavior:'smooth'});return false;">Daily</a>
      <a class="section-link" href="#npcl-weekly" onclick="document.getElementById('npcl-weekly')?.scrollIntoView({behavior:'smooth'});return false;">Weekly</a>
      <button type="button" onclick="window.showPage?.('newPlayerGuide')">Back to Guide</button>
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
        "daily",
        "Daily checklist",
        "Do not burn out trying to do every single thing. Hit the IMPORTANT items first, then add more as you get comfortable.",
        DAILY_TASKS,
        "Resets with the Daily Reset notification in Event Schedule.",
        "window.npclResetDaily()"
      )}
      ${renderChecklistSection(
        "weekly",
        "Weekly checklist",
        "These stay checked through the week and reset Saturday night into Sunday at 00:00 server time.",
        WEEKLY_TASKS,
        "Resets with the Weekly Reset notification in Event Schedule.",
        "window.npclResetWeekly()"
      )}
    </div>
  `;
}

window.npclToggleTask = function(id) {
  state.done[id] = !state.done[id];
  saveState();
  window.renderCurrentPage?.();
};

window.npclOpenEventSchedule = function(eventName) {
  localStorage.setItem("eventFocusName", eventName);
  window.showPage?.("events");
};

function resetTasks(tasks) {
  for (const task of tasks) delete state.done[task.id];
  saveState();
  window.renderCurrentPage?.();
}

window.npclResetDaily = function() {
  resetTasks(DAILY_TASKS);
};

window.npclResetWeekly = function() {
  resetTasks(WEEKLY_TASKS);
};
