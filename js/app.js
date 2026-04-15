import { appState } from "./state.js";
import { initAuth, isPro, getRole, getAuth, logout } from "./auth.js";
import { PAGES, GROUPS, DEV_PANEL_ID, isPageLocked } from "./gating.js";
import { hasRole } from "./roles.js";
import { CONFIG } from "./config.js";
import { renderLandingPage, stopLandingRefresh } from "./pages/landing.js";
import { renderEventSchedule } from './modules/events.js';
import { renderPage as renderNetWorthPage } from "./pages/netWorth.js";
import { renderPricesStoragePage } from "./pages/pricesStorage.js";
import { renderPage as renderAkashPage } from "./pages/akash.js";
import { renderPage as renderErenorCraftsPage } from "./pages/erenorCrafts.js";
import { renderPage as renderCastleInfusionsPage } from "./pages/castleInfusions.js";
import { renderPage as renderErenorUpgradingPage } from "./pages/erenorUpgrading.js";
import { renderPage as renderErenorCloakPage } from "./pages/erenorCloak.js";
import { renderPage as renderLibraryGearPage } from "./pages/libraryGear.js";
import { renderPage as renderHiramGearPage } from "./pages/hiramGear.js";
import { renderPage as renderTrimmerPage } from "./pages/trimmer.js";
import { renderPage as renderAchievementsPage } from "./pages/achievements.js";
import { renderPage as renderMiscPage } from "./pages/misc.js";
import { renderPage as renderWarriorNecklacePage } from "./pages/warriorNecklace.js";
import { renderPage as renderIpnyshArtifactsPage } from "./pages/ipnyshArtifacts.js";
import { renderPage as renderWikiPage } from "./pages/wiki.js";
import { renderCostumeBuilderPage } from "./pages/costumebuilder.js";
import { renderPage as renderDevPanelPage, initDevPanel } from "./pages/devPanel.js";
import { renderPage as renderGuidePage } from "./pages/guide.js";
import { renderPage as renderAddonsPage } from "./pages/addons.js";
import { renderLoginPage } from "./pages/login.js";
import { renderPage as renderRecipeLookupPage } from "./pages/recipeLookup.js";
import { renderPage as renderArcPointsPage } from "./pages/arcPoints.js";
import { renderPage as renderSubmitRecipePage, initSubmitRecipe } from "./pages/submitRecipe.js";
import { renderPage as renderProficiencyPage } from "./pages/proficiency.js";
import { setupCommunityPrices } from "./communityPrices.js";
import { initMailSystem } from "./mail.js";

// ─── PAGE REGISTRY ────────────────────────────────────────────────────────────
// inject: true  → content.innerHTML = render()
// inject: false → render() handles its own DOM insertion

const PAGE_REGISTRY = {
  login:           { render: renderLoginPage,           inject: true  },
  landing:         { render: renderLandingPage,         inject: true  },
  guide:           { render: renderGuidePage,           inject: true  },
  events:          { render: renderEventSchedule,        inject: false },
  wiki:            { render: renderWikiPage,             inject: true  },
  netWorth:        { render: renderNetWorthPage,         inject: true  },
  pricesStorage:   { render: renderPricesStoragePage,    inject: true  },
  akash:           { render: renderAkashPage,            inject: true  },
  ipnyshArtifacts: { render: renderIpnyshArtifactsPage,  inject: true  },
  erenorCrafts:    { render: renderErenorCraftsPage,     inject: true  },
  castleInfusions: { render: renderCastleInfusionsPage,  inject: true  },
  erenorUpgrading: { render: renderErenorUpgradingPage,  inject: true  },
  erenorCloak:     { render: renderErenorCloakPage,      inject: true  },
  libraryGear:     { render: renderLibraryGearPage,      inject: true  },
  hiramGear:       { render: renderHiramGearPage,        inject: true  },
  addons:          { render: renderAddonsPage,            inject: true  },
  trimmer:         { render: renderTrimmerPage,          inject: true  },
  achievements:    { render: renderAchievementsPage,     inject: true  },
  misc:            { render: renderMiscPage,             inject: true  },
  warriorNecklace: { render: renderWarriorNecklacePage,  inject: true  },
  recipeLookup:    { render: renderRecipeLookupPage,     inject: true  },
  arcPoints:       { render: renderArcPointsPage,        inject: true  },
  proficiency:     { render: renderProficiencyPage,      inject: true  },
  submitRecipe:    { render: renderSubmitRecipePage,     inject: true,  afterRender: initSubmitRecipe },
  devPanel:        { render: renderDevPanelPage,         inject: true,  afterRender: initDevPanel },
  costumeBuilder:  { render: renderCostumeBuilderPage,   inject: false },
};

// ─── TOP BUTTON ───────────────────────────────────────────────────────────────

let topButtonActivated = false;

function getTopButton() {
  return document.getElementById("floatingTopBtn");
}

function pageHasSectionNav() {
  return Boolean(document.querySelector(".section-link"));
}

function updateTopButtonVisibility() {
  const topButton = getTopButton();
  if (!topButton) return;
  const shouldShow = topButtonActivated && pageHasSectionNav() && window.scrollY > 120;
  topButton.classList.toggle("visible", shouldShow);
}

function resetTopButtonState() {
  topButtonActivated = false;
  updateTopButtonVisibility();
}

function initTopButton() {
  const topButton = getTopButton();
  if (!topButton || topButton.dataset.ready === "true") return;
  topButton.dataset.ready = "true";
  topButton.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    window.setTimeout(() => {
      if (window.scrollY <= 120) {
        topButtonActivated = false;
        updateTopButtonVisibility();
      }
    }, 250);
  });
  window.addEventListener("scroll", updateTopButtonVisibility, { passive: true });
  document.addEventListener("click", (event) => {
    const sectionLink = event.target.closest(".section-link");
    if (!sectionLink) return;
    topButtonActivated = true;
    window.requestAnimationFrame(updateTopButtonVisibility);
  });
}

// ─── TAB BAR ─────────────────────────────────────────────────────────────────


function isTabBarCollapsed() {
  return localStorage.getItem("tabBarCollapsed") === "true";
}

export function buildTabBar() {
  const tabBar = document.getElementById("tab-bar");
  if (!tabBar) return;
  const userRole = getRole();
  const collapsed = isTabBarCollapsed();

  // Index pages by group
  const byGroup = {};
  for (const page of PAGES) {
    if (!byGroup[page.group]) byGroup[page.group] = [];
    byGroup[page.group].push(page);
  }

  const groupHTML = GROUPS.map((group, idx) => {
    const pages = byGroup[group.id] || [];
    if (!pages.length) return "";

    const divider = idx === 0
      ? ""
      : `<div class="tab-section">${group.label ? `<span class="tab-section-label">${group.label}</span>` : ""}</div>`;

    const buttons = pages.map(page => {
      const locked = isPageLocked(page.id, userRole);
      const cls = locked ? "tab-locked" : group.id === "pro" ? "tab-pro" : "";
      const title = locked ? 'title="Pro feature — upgrade to unlock"' : "";
      return `<button data-page="${page.id}" onclick="showPage('${page.id}')" ${cls ? `class="${cls}"` : ""} ${title}>${page.label}</button>`;
    }).join("");

    return divider + buttons;
  }).join("");

  tabBar.innerHTML =
    `<div class="tab-toggle-strip" onclick="window.toggleTabBar()" title="${collapsed ? "Expand menu" : "Collapse menu"}">
      <span id="tab-toggle-arrow">${collapsed ? "▲" : "▼"}</span>
    </div>` + groupHTML;

  tabBar.classList.toggle("collapsed", collapsed);
  document.body.classList.toggle("tab-collapsed", collapsed);
}

window.toggleTabBar = function() {
  const tabBar = document.getElementById("tab-bar");
  if (!tabBar) return;
  const nowCollapsed = !tabBar.classList.contains("collapsed");
  tabBar.classList.toggle("collapsed", nowCollapsed);
  document.body.classList.toggle("tab-collapsed", nowCollapsed);
  localStorage.setItem("tabBarCollapsed", nowCollapsed);
  const arrow = document.getElementById("tab-toggle-arrow");
  if (arrow) arrow.textContent = nowCollapsed ? "▲" : "▼";
  const strip = document.querySelector(".tab-toggle-strip");
  if (strip) strip.title = nowCollapsed ? "Expand menu" : "Collapse menu";
};

function syncActiveTab() {
  document.querySelectorAll("#tab-bar button").forEach(btn => {
    btn.classList.toggle("active-tab", btn.dataset.page === appState.currentPage);
  });
}

// ─── ROUTING ─────────────────────────────────────────────────────────────────

function renderLockedPage(pageId) {
  const content = document.getElementById("content");
  content.innerHTML = `
    <div class="card" style="text-align:center;padding:60px 20px;max-width:480px;margin:60px auto;">
      <div style="font-size:48px;margin-bottom:16px;">🔒</div>
      <h2 style="margin:0 0 12px 0;">Pro Feature</h2>
      <p style="color:#94a3b8;margin:0 0 24px 0;">
        This page is part of the Pro plan.<br>
        Upgrade for $5.99/month — 7-day free trial, no card required.
      </p>
      <button onclick="showPage('landing')" style="padding:10px 24px;">Back to Home</button>
    </div>
  `;
}

function initPageEnhancements() {
  const sectionLinks = document.querySelectorAll('.section-link');
  if (!sectionLinks.length) {
    resetTopButtonState();
    return;
  }
  updateTopButtonVisibility();
}

export function showPage(pageName) {
  if (pageName !== 'landing') stopLandingRefresh();
  appState.currentPage = pageName;
  window.scrollTo({ top: 0, behavior: "auto" });
  renderCurrentPage();
  syncActiveTab();
}

export function renderCurrentPage() {
  const content = document.getElementById("content");

  if (isPageLocked(appState.currentPage, getRole())) {
    renderLockedPage(appState.currentPage);
    initPageEnhancements();
    return;
  }

  const page = PAGE_REGISTRY[appState.currentPage];
  if (!page) {
    content.innerHTML = renderLandingPage();
  } else if (page.inject) {
    content.innerHTML = page.render();
    page.afterRender?.();
  } else {
    page.render();
  }

  initPageEnhancements();
}

// ─── INIT ─────────────────────────────────────────────────────────────────────

window.showPage = showPage;
window.renderCurrentPage = renderCurrentPage;
window.buildTabBar = buildTabBar;

// Called by auth.js after a successful login or logout.
// Rebuilds the tab bar and navigates to the right page.
window.__onAuthChange = function() {
  if (hasRole(getRole(), "admin")) window.__devPanelUnlocked = true;
  buildTabBar();
  const needsLogin = CONFIG.AUTH_ENABLED && !getAuth().user;
  showPage(needsLogin ? "login" : "landing");
};

// Sign-out handler — exposed so any page can call window.doSignOut()
window.doSignOut = async function() {
  await logout();
  // __onAuthChange will handle navigation
};

// Ctrl+Shift+D — toggle dev panel (available to admin/dev roles, or when DEV_FORCE_PRO is on)
document.addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.shiftKey && e.key === "D") {
    e.preventDefault();
    const role = getRole();
    if (!hasRole(role, "admin") && !window.__devPanelUnlocked) {
      // Not an admin/dev — ignore silently in production
      return;
    }
    if (appState.currentPage === DEV_PANEL_ID) {
      showPage("landing");
    } else {
      showPage(DEV_PANEL_ID);
    }
  }
});


initTopButton();

// Show update banner when a new version is downloaded and ready
window.electronAPI?.onUpdateReady?.((version) => {
  const banner = document.getElementById('update-banner');
  if (banner) {
    banner.querySelector('span').textContent = `⬆ v${version} ready — restart to apply`;
    banner.style.display = 'flex';
  }
});

// Log update errors to console so we can diagnose
window.electronAPI?.onUpdateError?.((msg) => {
  console.error('[updater] Error received in renderer:', msg);
});

// Manual update check — callable from dev panel or console
window.checkForUpdate = () => window.electronAPI?.checkForUpdate?.();

// Auth must resolve before we build the tab bar or render any page.
initAuth().then(() => {
  // Unlock dev panel if auth gives admin/dev role
  if (hasRole(getRole(), "admin")) window.__devPanelUnlocked = true;

  // Unlock DevTools in the menu if role is curator or above (server-verified)
  if (hasRole(getRole(), "curator")) {
    window.electronAPI?.requestDevTools?.();
  }

  setupCommunityPrices();
  initMailSystem();
  buildTabBar();

  // If auth is enabled and user isn't logged in, show login page.
  // Dev mode (DEV_FORCE_PRO) bypasses this and always lands on landing.
  const needsLogin = CONFIG.AUTH_ENABLED && !CONFIG.DEV_FORCE_PRO && !getAuth().user;
  showPage(needsLogin ? "login" : "landing");
});
