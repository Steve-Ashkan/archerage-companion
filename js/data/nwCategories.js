// ─── NET WORTH CATEGORIES ─────────────────────────────────────────────────────
// Financial groupings used by the Net Worth page.
// These are separate from game categories in categories.js —
// they represent how items are bucketed for wealth tracking.
//
// When adding a new item to categories.js, add its NW mapping here too.

export const NW_CATEGORIES = [
  "Raw Farmables",
  "Archeum",
  "Gems",
  "Ingots",
  "Craft Components",
  "Boss / Rare Drops",
  "Points / Currency",
  "Regrade Items",
  "Uncategorized",
];

export const NW_CATEGORY_COLORS = {
  "Raw Farmables":     "#84cc16",
  "Archeum":           "#a78bfa",
  "Gems":              "#38bdf8",
  "Ingots":            "#94a3b8",
  "Craft Components":  "#fb923c",
  "Boss / Rare Drops": "#f87171",
  "Points / Currency": "#fcd34d",
  "Regrade Items":     "#f472b6",
  "Uncategorized":     "#465062",
};

export const NW_CATEGORY_ICONS = {
  "Raw Farmables":     "🌾",
  "Archeum":           "✨",
  "Gems":              "💎",
  "Ingots":            "⚙️",
  "Craft Components":  "🔧",
  "Boss / Rare Drops": "🐉",
  "Points / Currency": "🪙",
  "Regrade Items":     "⚔️",
  "Uncategorized":     "📦",
};

// Maps built-in item names → NW category.
// Custom items store their nwCategory in localStorage via pricesStorage.
export const ITEM_NW_MAP = {
  // ── Raw Farmables ──────────────────────────────────────────────────────────
  "Rice": "Raw Farmables", "Corn": "Raw Farmables", "Narcissus": "Raw Farmables",
  "Azalea": "Raw Farmables", "Clover": "Raw Farmables", "Rose": "Raw Farmables",
  "Red Coral": "Raw Farmables", "Green Coral": "Raw Farmables",
  "Peanut": "Raw Farmables", "Wheat": "Raw Farmables", "Oats": "Raw Farmables",
  "Lotus": "Raw Farmables", "Antler Coral": "Raw Farmables", "Rosemary": "Raw Farmables",
  "Pearl": "Raw Farmables", "Rye": "Raw Farmables", "Cornflower": "Raw Farmables",
  "Lily": "Raw Farmables", "Mint": "Raw Farmables", "Cactus": "Raw Farmables",
  "Turmeric": "Raw Farmables", "Chili Pepper": "Raw Farmables", "Quinoa": "Raw Farmables",
  "Cultivated Ginseng": "Raw Farmables", "Bean": "Raw Farmables", "Poppy": "Raw Farmables",
  "Saffron": "Raw Farmables", "Blueberry": "Raw Farmables", "Vanilla": "Raw Farmables",
  "Pepper": "Raw Farmables", "Coconut": "Raw Farmables", "Beechnut": "Raw Farmables",
  "Chestnut": "Raw Farmables",
  "Lumber": "Raw Farmables", "Leather": "Raw Farmables", "Fabric": "Raw Farmables",
  "Flaming Log": "Raw Farmables", "Archeum Log": "Raw Farmables",
  "Thunderstruck Tree": "Raw Farmables", "Thunderstruck Log": "Raw Farmables",
  "Natural Rubber": "Raw Farmables",

  // ── Archeum ────────────────────────────────────────────────────────────────
  "Moonlight Archeum Dust": "Archeum", "Moonlight Archeum Crystal": "Archeum",
  "Moonlight Archeum Essence": "Archeum", "Starlight Archeum Dust": "Archeum",
  "Starlight Archeum Shard": "Archeum", "Starlight Archeum Crystal": "Archeum",
  "Starlight Archeum Essence": "Archeum", "Sunlight Archeum Crystal": "Archeum",
  "Sunlight Archeum Essence": "Archeum", "Onyx Archeum Essence": "Archeum",

  // ── Gems ───────────────────────────────────────────────────────────────────
  "Amethyst": "Gems", "Sapphire": "Gems", "Ruby": "Gems",
  "Topaz": "Gems", "Emerald": "Gems", "Diamond": "Gems",

  // ── Ingots ─────────────────────────────────────────────────────────────────
  "Iron Ingot": "Ingots", "Silver Ingot": "Ingots", "Copper Ingot": "Ingots",
  "Gold Ingot": "Ingots", "Archeum Ingot": "Ingots", "Anya Ingot": "Ingots",
  "Starshard Ingot": "Ingots",

  // ── Craft Components ───────────────────────────────────────────────────────
  "Dragon Essence Stabilizer": "Craft Components",
  "Blank Regrade Scroll": "Craft Components",
  "Mysterious Garden Powder": "Craft Components",
  "Sparkling Shell Dust": "Craft Components",
  "Dawn Lake Light Essence": "Craft Components",
  "Clear Synthium Shard": "Craft Components",
  "Book of Auroria": "Craft Components",
  "Misagon's Crystal": "Craft Components",
  "Glowing Prism": "Craft Components",
  "Vehicle Upgrade Device": "Craft Components",
  "Lucky Sunpoint": "Craft Components",

  // ── Boss / Rare Drops ──────────────────────────────────────────────────────
  "Red Dragon Spinal Ridge": "Boss / Rare Drops",
  "Cursed Armor Piece": "Boss / Rare Drops",
  "Acidic Poison Pouch": "Boss / Rare Drops",

  // ── Points / Currency ──────────────────────────────────────────────────────
  "Moonpoint": "Points / Currency",
  "Sunpoint": "Points / Currency",
  "Starpoint": "Points / Currency",

  // ── Regrade Items ──────────────────────────────────────────────────────────
  "Red Regrade": "Regrade Items",
  "Celestial Weapon Anchoring Charm": "Regrade Items",
  "Resplendent Weapon Regrade Scroll": "Regrade Items",
  "Superior Red Regrade Charm": "Regrade Items",
  "Silver Regrade Charm": "Regrade Items",
  "Ayanad Weaponsmithing Scroll": "Regrade Items",
};
