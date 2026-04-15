// ─── GATING ───────────────────────────────────────────────────────────────────
// Single source of truth for all pages: labels, groups, and minimum role.
//
// minRole controls access:
//   undefined / 'free' → everyone
//   'pro'              → pro and above
//   'admin'            → admin and above
//   'dev'              → dev only
//
// To move a page between tiers: change minRole here. Nothing else.

import { hasRole } from "./roles.js";

export const PAGES = [
  // ── Core ──────────────────────────────────────────────────────────────────
  { id: "landing",         label: "Home",                 group: "core"  },
  { id: "guide",           label: "Guide",                group: "core"  },
  { id: "events",          label: "Events Schedule",      group: "core"  },
  { id: "wiki",            label: "Wiki",                 group: "core"  },
  { id: "pricesStorage",   label: "Prices & Storage",     group: "core"  },

  // ── Calculators ───────────────────────────────────────────────────────────
  { id: "akash",           label: "Akash Level Progress", group: "calc"  },
  { id: "ipnyshArtifacts", label: "Ipnysh Artifacts",     group: "calc"  },
  { id: "erenorCrafts",    label: "Erenor Crafts",        group: "calc"  },
  { id: "castleInfusions", label: "Castle Infusions",     group: "calc"  },
  { id: "erenorUpgrading", label: "Erenor Upgrading",     group: "calc"  },
  { id: "erenorCloak",     label: "Erenor Cloak",         group: "calc"  },
  { id: "libraryGear",     label: "Library Gear",         group: "calc"  },
  { id: "hiramGear",       label: "Hiram Gear",           group: "calc"  },
  { id: "warriorNecklace", label: "Warrior Necklace",     group: "calc"  },
  { id: "misc",            label: "Misc.",                group: "calc"  },

  // ── Tools ─────────────────────────────────────────────────────────────────
  { id: "addons",          label: "Addons",               group: "tools" },
  { id: "trimmer",         label: "Multipurpose Trimmer", group: "tools" },
  { id: "achievements",    label: "Achievements",         group: "tools" },
  { id: "costumeBuilder",  label: "Costume Builder",      group: "tools" },
  { id: "proficiency",     label: "Proficiency",          group: "tools" },
  { id: "submitRecipe",    label: "Submit a Recipe",      group: "tools" },
  { id: "recipeLookup",    label: "Recipe Lookup",        group: "pro",   minRole: "pro" },
  { id: "arcPoints",       label: "ARC Points",           group: "tools", minRole: "dev" },

  // ── Pro ───────────────────────────────────────────────────────────────────
  { id: "netWorth",        label: "Net Worth",            group: "pro",   minRole: "pro"  },
];

// Dev panel is NOT in the tab bar — accessed via Ctrl+Shift+D only.
// Registered in PAGE_REGISTRY in app.js but excluded from PAGES so it stays hidden.
export const DEV_PANEL_ID = "devPanel";

// Group metadata — display order and section labels.
export const GROUPS = [
  { id: "core",  label: null          },
  { id: "calc",  label: "Calculators" },
  { id: "tools", label: "Tools"       },
  { id: "pro",   label: "Pro"         },
];

// Returns true if the user's role does not meet the page's minRole.
export function isPageLocked(pageId, userRole) {
  const page = PAGES.find(p => p.id === pageId);
  if (!page?.minRole) return false;
  return !hasRole(userRole, page.minRole);
}

// Returns the minRole required for a page, or null if open to all.
export function pageMinRole(pageId) {
  return PAGES.find(p => p.id === pageId)?.minRole ?? null;
}
