// ─── RECIPE DATABASE ──────────────────────────────────────────────────────────
// Sourced from wiki.archerage.to — needs in-game verification.
// Status: 'unverified' | 'verified' | 'wrong'
// Use the Recipe Lookup page to verify/correct while in-game.

export const RECIPES = [
  // ── Basic Materials ───────────────────────────────────────────────────────
  {
    id: 'lumber',
    output: 'Lumber',
    outputQty: 1,
    profession: 'Carpentry',
    labor: 5,
    materials: [
      { item: 'Log', qty: 3 },
    ],
  },
  {
    id: 'fine_lumber',
    output: 'Fine Lumber',
    outputQty: 1,
    profession: 'Carpentry',
    labor: 10,
    materials: [
      { item: 'Lumber', qty: 10 },
      { item: 'Small Seed Oil', qty: 1 },
    ],
  },
  {
    id: 'stone_brick',
    output: 'Stone Brick',
    outputQty: 1,
    profession: 'Masonry',
    labor: 5,
    materials: [
      { item: 'Raw Stone', qty: 3 },
    ],
  },
  {
    id: 'iron_ingot',
    output: 'Iron Ingot',
    outputQty: 1,
    profession: 'Metalwork',
    labor: 5,
    materials: [
      { item: 'Iron Ore', qty: 3 },
    ],
  },
  {
    id: 'fabric_cotton',
    output: 'Fabric',
    outputQty: 1,
    profession: 'Tailoring',
    labor: 5,
    materials: [
      { item: 'Cotton', qty: 10 },
    ],
  },
  {
    id: 'leather',
    output: 'Leather',
    outputQty: 1,
    profession: 'Leatherwork',
    labor: 5,
    materials: [
      { item: 'Rawhide', qty: 3 },
    ],
  },
  {
    id: 'fine_leather',
    output: 'Fine Leather',
    outputQty: 1,
    profession: 'Leatherwork',
    labor: 10,
    materials: [
      { item: 'Leather', qty: 10 },
      { item: 'Small Seed Oil', qty: 1 },
    ],
  },

  // ── Archeum ───────────────────────────────────────────────────────────────
  {
    id: 'archeum_ore',
    output: 'Archeum Ore',
    outputQty: 1,
    profession: 'Alchemy',
    labor: 5,
    materials: [
      { item: 'Archeum Essence', qty: 5 },
    ],
  },
  {
    id: 'sunlight_archeum_dust',
    output: 'Sunlight Archeum Dust',
    outputQty: 4,
    profession: 'Alchemy',
    labor: 10,
    materials: [
      { item: 'Sunlight Archeum Shard', qty: 1 },
    ],
  },
  {
    id: 'lucid_synthium_stone',
    output: 'Lucid Synthium Stone',
    outputQty: 1,
    profession: 'Alchemy',
    labor: 25,
    materials: [
      { item: 'Vivid Synthium Stone', qty: 1 },
      { item: "Misagon's Crystal", qty: 1 },
    ],
  },
  {
    id: 'superior_lunarite',
    output: 'Superior Lunarite',
    outputQty: 10,
    profession: 'Alchemy',
    labor: 50,
    materials: [
      { item: 'Fine Lunarite', qty: 5 },
    ],
  },

  // ── Processed Materials ───────────────────────────────────────────────────
  {
    id: 'wind_spirit_leather',
    output: 'Wind Spirit Leather',
    outputQty: 1,
    profession: 'Leatherwork',
    labor: 20,
    materials: [
      { item: 'Fine Leather', qty: 10 },
      { item: 'Mysterious Garden Powder', qty: 5 },
      { item: 'Viscous Glossy Oil', qty: 1 },
    ],
  },
  {
    id: 'wooden_beam_bundle',
    output: 'Wooden Beam Bundle',
    outputQty: 1,
    profession: 'Construction',
    labor: 25,
    materials: [
      { item: 'Lumber', qty: 50 },
    ],
  },

  // ── Commerce Packs ────────────────────────────────────────────────────────
  {
    id: 'solzreed_strawberry_jam',
    output: 'Solzreed Strawberry Jam',
    outputQty: 1,
    profession: 'Commerce',
    labor: 50,
    materials: [
      { item: 'Quality Certificate', qty: 1 },
      { item: 'Strawberry', qty: 100 },
    ],
  },
  {
    id: 'gweonid_grilled_goose',
    output: 'Gweonid Grilled Goose',
    outputQty: 1,
    profession: 'Commerce',
    labor: 50,
    materials: [
      { item: 'Quality Certificate', qty: 1 },
      { item: 'Goose Meat', qty: 30 },
    ],
  },
  {
    id: 'falcorth_clover_feed',
    output: 'Falcorth Plains Clover Feed',
    outputQty: 1,
    profession: 'Commerce',
    labor: 50,
    materials: [
      { item: 'Quality Certificate', qty: 1 },
      { item: 'Clover', qty: 150 },
    ],
  },
  {
    id: 'falcorth_bedding',
    output: 'Falcorth Plains Bedding',
    outputQty: 1,
    profession: 'Commerce',
    labor: 50,
    materials: [
      { item: 'Quality Certificate', qty: 1 },
      { item: 'Cotton', qty: 200 },
    ],
  },
  {
    id: 'halcyona_fine_flour',
    output: 'Halcyona Fine Flour',
    outputQty: 1,
    profession: 'Commerce',
    labor: 50,
    materials: [
      { item: 'Quality Certificate', qty: 1 },
      { item: 'Wheat', qty: 50 },
    ],
  },
  {
    id: 'rookborne_carrot_ale',
    output: 'Rookborne Basin Carrot Ale',
    outputQty: 1,
    profession: 'Commerce',
    labor: 50,
    materials: [
      { item: 'Quality Certificate', qty: 1 },
      { item: 'Carrot', qty: 150 },
    ],
  },
  {
    id: 'hasla_treated_bamboo',
    output: 'Hasla Treated Bamboo',
    outputQty: 1,
    profession: 'Commerce',
    labor: 50,
    materials: [
      { item: 'Quality Certificate', qty: 1 },
      { item: 'Bamboo Stalk', qty: 50 },
    ],
  },
  {
    id: 'falcorth_tanned_leather',
    output: 'Falcorth Plains Tanned Leather',
    outputQty: 1,
    profession: 'Commerce',
    labor: 50,
    materials: [
      { item: 'Quality Certificate', qty: 1 },
      { item: 'Lucky Clover', qty: 3 },
      { item: 'Oily Cotton Seed', qty: 3 },
      { item: 'Leather', qty: 30 },
    ],
  },
  {
    id: 'hasla_synthetic_fiber',
    output: 'Hasla Light Synthetic Fiber',
    outputQty: 1,
    profession: 'Commerce',
    labor: 50,
    materials: [
      { item: 'Quality Certificate', qty: 1 },
      { item: 'Bamboo Shoot', qty: 2 },
      { item: 'Soft Duck Down', qty: 3 },
      { item: 'Fabric', qty: 30 },
    ],
  },

  // ── Erenor Bow (example high-end craft) ───────────────────────────────────
  {
    id: 'erenor_bow',
    output: 'Erenor Bow',
    outputQty: 1,
    profession: 'Carpentry',
    labor: 2800,
    materials: [
      { item: 'Weapon Regrade Scroll', qty: 10 },
      { item: 'Sunlight Archeum Essence', qty: 172 },
      { item: 'Ipnysh Sunlight Blessing', qty: 1 },
      { item: 'Blazing Nuri Forest Lumber', qty: 17 },
      { item: 'Archeum Ingot', qty: 132 },
    ],
  },

  // ── Machining ─────────────────────────────────────────────────────────────
  {
    id: 'timber_coupe_frame',
    output: 'Crafted Vehicle Frame: Timber Coupe',
    outputQty: 1,
    profession: 'Handicrafts',
    labor: 50,
    materials: [
      { item: 'Yellow Pigment', qty: 10 },
      { item: 'Nuri Forest Lumber', qty: 10 },
      { item: 'Cloudspun Fabric', qty: 10 },
      { item: 'Wind Spirit Leather', qty: 10 },
      { item: 'Gold Ingot', qty: 10 },
    ],
  },
];

export const PROFESSIONS = [
  'Alchemy', 'Carpentry', 'Commerce', 'Construction', 'Cooking',
  'Handicrafts', 'Leatherwork', 'Machining', 'Masonry', 'Metalwork',
  'Tailoring', 'Weaponry',
];
