// ─── PROFICIENCY DATA ─────────────────────────────────────────────────────────
// Shared between the Proficiency tracker, Recipe Lookup, and Submit a Recipe.

// Rank definitions — min/max proficiency points, labor reduction at that rank.
// Based on ArcheRage proficiency system. Max cap per skill: 230,000.
// Celebrity → Famed requires reaching the 230k cap.
export const PROFICIENCY_RANKS = [
  { name: 'Novice',    min: 0,      max: 9999,   range: '0–10k',      laborReduction: 0  },
  { name: 'Veteran',   min: 10000,  max: 19999,  range: '10k–20k',    laborReduction: 0  },
  { name: 'Expert',    min: 20000,  max: 29999,  range: '20k–30k',    laborReduction: 0  },
  { name: 'Master',    min: 30000,  max: 39999,  range: '30k–40k',    laborReduction: 0  },
  { name: 'Authority', min: 40000,  max: 49999,  range: '40k–50k',    laborReduction: 10 },
  { name: 'Champion',  min: 50000,  max: 69999,  range: '50k–70k',    laborReduction: 15 },
  { name: 'Adept',     min: 70000,  max: 89999,  range: '70k–90k',    laborReduction: 20 },
  { name: 'Herald',    min: 90000,  max: 109999, range: '90k–110k',   laborReduction: 20 },
  { name: 'Virtuoso',  min: 110000, max: 129999, range: '110k–130k',  laborReduction: 20 },
  { name: 'Celebrity', min: 130000, max: 229999, range: '130k–230k',  laborReduction: 30 },
  { name: 'Famed',     min: 230000, max: Infinity,range: '230k (max)', laborReduction: 40 },
];

// Color progression: muted → blue → purple → gold
export const RANK_COLORS = [
  '#566174', // Novice
  '#566174', // Veteran
  '#566174', // Expert
  '#64748b', // Master
  '#5b8ab5', // Authority
  '#4a9cc7', // Champion
  '#4e90c0', // Adept
  '#5b8fd4', // Herald
  '#6b7fd4', // Virtuoso
  '#c084fc', // Celebrity
  '#ffd166', // Famed
];

export function getRankColor(rankName) {
  const idx = PROFICIENCY_RANKS.findIndex(r => r.name === rankName);
  return idx >= 0 ? RANK_COLORS[idx] : '#566174';
}

export function getRankFromPoints(points) {
  if (points === null || points === undefined) return PROFICIENCY_RANKS[0];
  for (let i = PROFICIENCY_RANKS.length - 1; i >= 0; i--) {
    if (points >= PROFICIENCY_RANKS[i].min) return PROFICIENCY_RANKS[i];
  }
  return PROFICIENCY_RANKS[0];
}

export function effectiveLabor(baseLabor, rankName) {
  const rank = PROFICIENCY_RANKS.find(r => r.name === rankName) || PROFICIENCY_RANKS[0];
  return Math.round(baseLabor * (1 - rank.laborReduction / 100));
}

// ─── SKILL GROUPS ─────────────────────────────────────────────────────────────
// Based on the in-game Proficiency tab under Skills.

export const SKILL_GROUPS = [
  {
    label: 'Harvesting',
    icon: '🌾',
    skills: ['Husbandry', 'Farming', 'Fishing', 'Logging', 'Gathering', 'Mining'],
  },
  {
    label: 'Crafting',
    icon: '⚒',
    skills: [
      'Alchemy', 'Cooking', 'Handicrafts', 'Machining',
      'Metalwork', 'Printing', 'Masonry', 'Tailoring',
      'Leatherwork', 'Weaponry', 'Carpentry',
    ],
  },
  {
    label: 'Special',
    icon: '✦',
    skills: ['Artistry', 'Commerce', 'Construction', 'Exploration', 'Larceny'],
  },
];

// All skills flat, for quick lookup
export const ALL_SKILLS = SKILL_GROUPS.flatMap(g => g.skills);

// Which recipe professions map to which proficiency skill name
// (most match 1:1 but recipe list uses slightly different names in some cases)
export const RECIPE_TO_SKILL = {
  Alchemy:     'Alchemy',
  Carpentry:   'Carpentry',
  Commerce:    'Commerce',
  Construction:'Construction',
  Cooking:     'Cooking',
  Handicrafts: 'Handicrafts',
  Leatherwork: 'Leatherwork',
  Machining:   'Machining',
  Masonry:     'Masonry',
  Metalwork:   'Metalwork',
  Tailoring:   'Tailoring',
  Weaponry:    'Weaponry',
  Printing:    'Printing',
};

// ─── STORAGE ──────────────────────────────────────────────────────────────────

export const PROF_KEY = 'proficiencyData';

export function getProfData() {
  try { return JSON.parse(localStorage.getItem(PROF_KEY) || '{}'); } catch { return {}; }
}

export function saveProfData(data) {
  localStorage.setItem(PROF_KEY, JSON.stringify(data));
}

// Returns the rank object for a given skill name, or null if not set.
export function getSkillRank(skillName) {
  const data  = getProfData();
  const entry = data[skillName];
  if (!entry || entry.points === null || entry.points === undefined) return null;
  return getRankFromPoints(entry.points);
}

// Returns rank for a recipe profession (via RECIPE_TO_SKILL mapping), or null.
export function getProfessionRank(recipeProfession) {
  const skill = RECIPE_TO_SKILL[recipeProfession];
  if (!skill) return null;
  return getSkillRank(skill);
}
