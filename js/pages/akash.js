import { escapeHtml, jsEscape } from "../utils.js";

const LOCAL_KEY = "akashLevelProgressState";

const RESOURCE_HEADERS = [
  { key: "rune1", short: "R1", label: "Ewan's Rune Rank 1" },
  { key: "rune2", short: "R2", label: "Ewan's Rune Rank 2" },
  { key: "rune3", short: "R3", label: "Ewan's Rune Rank 3" },
  { key: "herstan", short: "H", label: "Herstan's Resilience" },
  { key: "gedlon", short: "G", label: "Gedlon's Strength" },
  { key: "yordan", short: "Y", label: "Yordan's Wisdom" },
  { key: "demigod", short: "D", label: "Demigod Essence" }
];

const SECTION_LINKS = [
  { id: "akash-gear-visual", label: "Gear View" },
  { id: "akash-rank-progress", label: "Rank Progress" },
  { id: "akash-quest-rewards", label: "Quest Rewards" },
  { id: "akash-reference", label: "Reference" }
];

const GEAR_LAYOUT = {
  armor: ["Helmet", "Chest", "Waist", "Wrist", "Hands", "Legs", "Feet"],
  weapons: ["Main Hand", "Off Hand", "Ranged"],
  accessories: ["Necklace", "Ring 1", "Ring 2", "Earring 1", "Earring 2", "Instrument"]
};

const RANK_ROWS = [
  {
    id: "rank-2-armor",
    label: "Rank 2 Armor",
    category: "Armor",
    rank: 2,
    maxPieces: 7,
    pieceWeight: 1,
    futureWeight: 0,
    pieceSource: "rune1",
    requirements: { rune1: 7, herstan: 7 }
  },
  {
    id: "rank-3-armor",
    label: "Rank 3 Armor",
    category: "Armor",
    rank: 3,
    maxPieces: 7,
    pieceWeight: 3,
    futureWeight: 0,
    pieceSource: "rune1",
    requirements: { rune1: 7, herstan: 21 }
  },
  {
    id: "rank-4-armor",
    label: "Rank 4 Armor",
    category: "Armor",
    rank: 4,
    maxPieces: 7,
    pieceWeight: 5,
    futureWeight: 0,
    pieceSource: "rune1",
    requirements: { rune1: 7, herstan: 35 }
  },
  {
    id: "rank-5-armor",
    label: "Rank 5 Armor",
    category: "Armor",
    rank: 5,
    maxPieces: 7,
    pieceWeight: 4,
    futureWeight: 4,
    pieceSource: "rune2",
    requirements: { rune2: 7, herstan: 28, demigod: 28 }
  },
  {
    id: "rank-6-armor",
    label: "Rank 6 Armor",
    category: "Armor",
    rank: 6,
    maxPieces: 7,
    pieceWeight: 6,
    futureWeight: 4,
    pieceSource: "rune2",
    requirements: { rune2: 7, herstan: 42, demigod: 28 }
  },
  {
    id: "rank-7-armor",
    label: "Rank 7 Armor",
    category: "Armor",
    rank: 7,
    maxPieces: 7,
    pieceWeight: 8,
    futureWeight: 4,
    pieceSource: "rune2",
    requirements: { rune2: 7, herstan: 56, demigod: 28 }
  },
  {
    id: "rank-8-armor",
    label: "Rank 8 Armor",
    category: "Armor",
    rank: 8,
    maxPieces: 7,
    pieceWeight: 9,
    futureWeight: 4,
    pieceSource: "rune3",
    requirements: { rune3: 7, herstan: 63, demigod: 28 }
  },
  {
    id: "rank-9-armor",
    label: "Rank 9 Armor",
    category: "Armor",
    rank: 9,
    maxPieces: 7,
    pieceWeight: 10,
    futureWeight: 4,
    pieceSource: "rune3",
    requirements: { rune3: 7, herstan: 70, demigod: 28 }
  },
  {
    id: "rank-10-armor",
    label: "Rank 10 Armor",
    category: "Armor",
    rank: 10,
    maxPieces: 7,
    pieceWeight: 8,
    futureWeight: 8,
    pieceSource: "rune3",
    requirements: { rune3: 7, herstan: 56, demigod: 56 }
  },

  {
    id: "rank-2-weapons",
    label: "Rank 2 Weapons",
    category: "Weapon",
    rank: 2,
    maxPieces: 3,
    pieceWeight: 2,
    futureWeight: 0,
    pieceSource: "rune1",
    requirements: { rune1: 3, gedlon: 6 }
  },
  {
    id: "rank-3-weapons",
    label: "Rank 3 Weapons",
    category: "Weapon",
    rank: 3,
    maxPieces: 3,
    pieceWeight: 4,
    futureWeight: 4,
    pieceSource: "rune1",
    requirements: { rune1: 3, gedlon: 12, demigod: 12 }
  },
  {
    id: "rank-4-weapons",
    label: "Rank 4 Weapons",
    category: "Weapon",
    rank: 4,
    maxPieces: 3,
    pieceWeight: 9,
    futureWeight: 4,
    pieceSource: "rune1",
    requirements: { rune1: 3, gedlon: 27, demigod: 12 }
  },
  {
    id: "rank-5-weapons",
    label: "Rank 5 Weapons",
    category: "Weapon",
    rank: 5,
    maxPieces: 3,
    pieceWeight: 10,
    futureWeight: 8,
    pieceSource: "rune2",
    requirements: { rune2: 3, gedlon: 30, demigod: 24 }
  },
  {
    id: "rank-6-weapons",
    label: "Rank 6 Weapons",
    category: "Weapon",
    rank: 6,
    maxPieces: 3,
    pieceWeight: 14,
    futureWeight: 8,
    pieceSource: "rune2",
    requirements: { rune2: 3, gedlon: 42, demigod: 24 }
  },
  {
    id: "rank-7-weapons",
    label: "Rank 7 Weapons",
    category: "Weapon",
    rank: 7,
    maxPieces: 3,
    pieceWeight: 13,
    futureWeight: 12,
    pieceSource: "rune2",
    requirements: { rune2: 3, gedlon: 39, demigod: 36 }
  },
  {
    id: "rank-8-weapons",
    label: "Rank 8 Weapons",
    category: "Weapon",
    rank: 8,
    maxPieces: 3,
    pieceWeight: 15,
    futureWeight: 12,
    pieceSource: "rune3",
    requirements: { rune3: 3, gedlon: 45, demigod: 36 }
  },
  {
    id: "rank-9-weapons",
    label: "Rank 9 Weapons",
    category: "Weapon",
    rank: 9,
    maxPieces: 3,
    pieceWeight: 17,
    futureWeight: 12,
    pieceSource: "rune3",
    requirements: { rune3: 3, gedlon: 51, demigod: 36 }
  },
  {
    id: "rank-10-weapons",
    label: "Rank 10 Weapons",
    category: "Weapon",
    rank: 10,
    maxPieces: 3,
    pieceWeight: 16,
    futureWeight: 16,
    pieceSource: "rune3",
    requirements: { rune3: 3, gedlon: 48, demigod: 48 }
  },

  {
    id: "rank-2-accessories",
    label: "Rank 2 Accessories",
    category: "Accessories",
    rank: 2,
    maxPieces: 6,
    pieceWeight: 6,
    futureWeight: 4,
    pieceSource: "rune1",
    requirements: { rune1: 6, yordan: 36, demigod: 24 }
  },
  {
    id: "rank-3-accessories",
    label: "Rank 3 Accessories",
    category: "Accessories",
    rank: 3,
    maxPieces: 6,
    pieceWeight: 18,
    futureWeight: 12,
    pieceSource: "rune1",
    requirements: { rune1: 6, yordan: 108, demigod: 72 }
  },
  {
    id: "rank-4-accessories",
    label: "Rank 4 Accessories",
    category: "Accessories",
    rank: 4,
    maxPieces: 6,
    pieceWeight: 24,
    futureWeight: 20,
    pieceSource: "rune1",
    requirements: { rune1: 6, yordan: 144, demigod: 120 }
  }
];

const AKASH_QUEST_REWARDS = {
  daily: [
    { quest: "Akash Token Crate Quest Starter (2k credits)", reward: "3 Akash Token Crates" },
    { quest: "Cracking Eggs", reward: "2 Akash Token Crates" }
  ],
  weekly: [
    { quest: "Hostile Wildlife", reward: "10 Akash Token Crates" },
    { quest: "Abyssal Nuisances", reward: "10 Akash Token Crates" },
    { quest: "Food Chain in the Great Prairie", reward: "12 Akash Token Crates" },
    { quest: "Akash Invasion (win)", reward: "10 Akash Token Crates" },
    { quest: "Akasch Generals", reward: "3 Akash Token Crates" },
    { quest: "Serpent Commanders", reward: "3 Akash Token Crates" },
    { quest: "Combat Intel", reward: "2 Akash Token Crates" },
    { quest: "Defeat the Enemy", reward: "2 Akash Token Crates" },
    { quest: "Ethereal Haven Investigation", reward: "2 Akash Token Crates" },
    { quest: "Serpent Eggs", reward: "2 Akash Token Crates" },
    { quest: "Arcane Spheres 1", reward: "1 Akash Token Crate" },
    { quest: "Arcane Spheres 2", reward: "2 Akash Token Crates" },
    { quest: "Arcane Spheres 3", reward: "3 Akash Token Crates" },
    { quest: "Scrying Eyes 1", reward: "1 Akash Token Crate" },
    { quest: "Scrying Eyes 2", reward: "2 Akash Token Crates" },
    { quest: "Scrying Eyes 3", reward: "3 Akash Token Crates" },
    { quest: "Void Compass 1", reward: "1 Akash Token Crate" },
    { quest: "Void Compass 2", reward: "2 Akash Token Crates" },
    { quest: "Void Compass 3", reward: "3 Akash Token Crates" },
    { quest: "Guardian Scramble Faction Activity", reward: "15 Akash Token Crates" },
    { quest: "Win", reward: "15 Akash Token Crates" },
    { quest: "Lose", reward: "5 Akash Token Crates" }
  ]
};

const INFUSION_REWARDS = {
  daily: [
    { quest: "(Nuimari) Urgent Task", radiant: "5", mysterious: "", exalted: "" },
    { quest: "(Marcala) Urgent Task", radiant: "5", mysterious: "", exalted: "" },
    { quest: "(Heedmar) Urgent Task", radiant: "5", mysterious: "", exalted: "" },
    { quest: "(Calmlands) Urgent Task", radiant: "5", mysterious: "", exalted: "" },
    { quest: "Ynyster War", radiant: "20", mysterious: "", exalted: "" },
    { quest: "Cinderstone War", radiant: "20", mysterious: "", exalted: "" },
    { quest: "Crimson Rift", radiant: "30", mysterious: "9", exalted: "" },
    { quest: "Grimgast Rift", radiant: "30", mysterious: "9", exalted: "" },
    { quest: "Garden Lv 6", radiant: "", mysterious: "", exalted: "50" }
  ],
  weekly: [
    { quest: "(WHM) Animal Control", radiant: "56", mysterious: "", exalted: "" },
    { quest: "(WHM) Mutated Animals", radiant: "56", mysterious: "", exalted: "" },
    { quest: "(WHM) The Abyssal Legion", radiant: "56", mysterious: "", exalted: "" },
    { quest: "(EHM) Hiradium Abominations", radiant: "150", mysterious: "", exalted: "" },
    { quest: "(EHM) Meadows", radiant: "", mysterious: "", exalted: "80" },
    { quest: "(DS) Diamond Shores Guard", radiant: "", mysterious: "42", exalted: "" },
    { quest: "(SG) Guardian of Sungold Field", radiant: "", mysterious: "56", exalted: "" },
    { quest: "(EXE) Guardian of Exeloch", radiant: "", mysterious: "56", exalted: "" },
    { quest: "(REED) Guardian of Reedwind", radiant: "", mysterious: "56", exalted: "" }
  ]
};

const ARMOR_ARTIFACT = {
  title: "Armor Artifacts",
  intro:
    "Leveling up your Armor Artifacts will increase their Physical Defence, Magical Defence and Gearscore. Once you hit Lv 5 and Lv 10 it will also let you choose an extra effect.",
  optionBlocks: [
    {
      title: "For Artifact level 5 your options are",
      color: "#ffef63",
      items: ["Strength 20", "Agility 20", "Stamina 20", "Intelligence 20", "Spirit 20"]
    },
    {
      title: "For Artifact level 10 your options are",
      color: "#ff9d2e",
      items: ["Resilience 192", "Max Health 187", "Move Speed 0.5%", "Toughness 104"]
    }
  ],
  rows: [
    { level: "Level 2", exp: "100", rune: "Ewan's Rune Rank 1", noEssence: "1 Herstan Resilience", withEssence: "", noCost: ["110", "0", "4g 44s 91c"], withCost: ["", "", "", ""] },
    { level: "Level 3", exp: "300", rune: "Ewan's Rune Rank 1", noEssence: "3 Herstan Resiliences", withEssence: "", noCost: ["180", "0", "14g 68s 20c"], withCost: ["", "", "", ""] },
    { level: "Level 4", exp: "500", rune: "Ewan's Rune Rank 1", noEssence: "5 Herstan Resiliences", withEssence: "", noCost: ["250", "0", "26g 69s 45c"], withCost: ["", "", "", ""] },
    { level: "Level 5", exp: "700", rune: "Ewan's Rune Rank 2", noEssence: "7 Herstan Resiliences", withEssence: "4 Herstan Resiliences + 4 Demigod Essences", noCost: ["470", "10", "53g 38s 90c"], withCost: ["365", "10", "400", "25g 72s 56c"] },
    { level: "Level 6", exp: "900", rune: "Ewan's Rune Rank 2", noEssence: "9 Herstan Resiliences", withEssence: "6 Herstan Resiliences + 4 Demigod Essences", noCost: ["540", "10", "106g 77s 87c"], withCost: ["435", "10", "400", "67g 46s 62c"] },
    { level: "Level 7", exp: "1100", rune: "Ewan's Rune Rank 2", noEssence: "11 Herstan Resiliences", withEssence: "8 Herstan Resiliences + 4 Demigod Essences", noCost: ["610", "10", "213g 55s 73c"], withCost: ["505", "10", "400", "143g 14s 08c"] },
    { level: "Level 8", exp: "1200", rune: "Ewan's Rune Rank 3", noEssence: "12 Herstan Resiliences", withEssence: "9 Herstan Resiliences + 4 Demigod Essences", noCost: ["1095", "60", "533g 89s 20c"], withCost: ["990", "60", "400", "365g 54s 75c"] },
    { level: "Level 9", exp: "1300", rune: "Ewan's Rune Rank 3", noEssence: "13 Herstan Resiliences", withEssence: "10 Herstan Resiliences + 4 Demigod Essences", noCost: ["1130", "60", "1334g 73s 08c"], withCost: ["1025", "60", "400", "930g 14s 84c"] },
    { level: "Level 10", exp: "1400", rune: "Ewan's Rune Rank 3", noEssence: "14 Herstan Resiliences", withEssence: "8 Herstan Resiliences + 8 Demigod Essences", noCost: ["1165", "60", "3336g 82s 72c"], withCost: ["955", "60", "800", "1906g 75s 84c"] }
  ],
  totals: {
    exp: "7500",
    noEssence: "75 Herstan Resiliences",
    withEssence: "45 Herstan Resiliences + 28 Demigod Essences",
    noCost: ["5550", "210", "5625g 00s 06c"],
    withCost: ["4275", "210", "2800", "3438g 78s 69c"]
  },
  summary: {
    perPieceNo: "11100 Akash Tokens, 210 Serpent Scales, 5625g 00s 06c",
    perPieceWith: "8480 Akash Tokens, 210 Serpent Scales, 2800 Radiant Hiram Infusions, 3429g 78s 24c",
    fullNo: "77700 Akash Tokens, 1470 Serpent Scales, 39375g 00s 42c",
    fullWith: "59360 Akash Tokens, 1470 Serpent Scales, 19600 Radiant Hiram Infusions, 24001g 47s 68c"
  }
};

const WEAPON_ARTIFACT = {
  title: "Weapon Artifacts",
  intro:
    "Leveling up your Weapon Artifacts will increase their DPS, Attack and Gearscore. Once you hit Lv 5 and Lv 10 it will also let you choose an extra effect.",
  optionBlocks: [
    {
      title: "For Artifact level 5 your options are",
      color: "#ffef63",
      items: ["Strength 20", "Agility 20", "Stamina 20", "Intelligence 20", "Spirit 20"]
    },
    {
      title: "For Artifact level 10 your options are",
      color: "#ff9d2e",
      items: ["Cast Time 1.2%", "Attack speed 18", "Focus 430", "Evasion 0.9%"]
    }
  ],
  rows: [
    { level: "Level 2", exp: "200", rune: "Ewan's Rune Rank 1", noEssence: "2 Gedlon's Strength", withEssence: "", noCost: ["145", "0", "7g 70s 74c"], withCost: ["", "", "", ""] },
    { level: "Level 3", exp: "700", rune: "Ewan's Rune Rank 1", noEssence: "7 Gedlon's Strengths", withEssence: "4 Gedlon's Strengths + 4 Demigod Essences", noCost: ["320", "0", "29g 67s 37c"], withCost: ["215", "0", "400", "14g 70s 12c"] },
    { level: "Level 4", exp: "1200", rune: "Ewan's Rune Rank 1", noEssence: "12 Gedlon's Strengths", withEssence: "9 Gedlon's Strengths + 4 Demigod Essences", noCost: ["495", "0", "55g 49s 40c"], withCost: ["390", "0", "400", "39g 16s 01c"] },
    { level: "Level 5", exp: "1600", rune: "Ewan's Rune Rank 2", noEssence: "16 Gedlon's Strengths", withEssence: "10 Gedlon's Strengths + 8 Demigod Essences", noCost: ["785", "10", "110g 98s 72c"], withCost: ["575", "10", "800", "61g 98s 62c"] },
    { level: "Level 6", exp: "2000", rune: "Ewan's Rune Rank 2", noEssence: "20 Gedlon's Strengths", withEssence: "14 Gedlon's Strengths + 8 Demigod Essences", noCost: ["925", "10", "221g 97s 40c"], withCost: ["715", "10", "800", "143g 57s 30c"] },
    { level: "Level 7", exp: "2200", rune: "Ewan's Rune Rank 2", noEssence: "22 Gedlon's Strengths", withEssence: "13 Gedlon's Strengths + 12 Demigod Essences", noCost: ["995", "10", "443g 94s 68c"], withCost: ["680", "10", "1200", "230g 12s 66c"] },
    { level: "Level 8", exp: "2400", rune: "Ewan's Rune Rank 3", noEssence: "24 Gedlon's Strengths", withEssence: "15 Gedlon's Strengths + 12 Demigod Essences", noCost: ["1515", "60", "1109g 86s 80c"], withCost: ["1200", "60", "1200", "619g 86s 27c"] },
    { level: "Level 9", exp: "2600", rune: "Ewan's Rune Rank 3", noEssence: "26 Gedlon's Strengths", withEssence: "17 Gedlon's Strengths + 12 Demigod Essences", noCost: ["1585", "60", "2774g 67s 06c"], withCost: ["1270", "60", "1200", "1643g 88s 81c"] },
    { level: "Level 10", exp: "2800", rune: "Ewan's Rune Rank 3", noEssence: "28 Gedlon's Strengths", withEssence: "16 Gedlon's Strengths + 16 Demigod Essences", noCost: ["1655", "60", "6936g 67s 80c"], withCost: ["1235", "60", "1600", "3436g 63s 68c"] }
  ],
  totals: {
    exp: "15700",
    noEssence: "157 Gedlon's Strengths",
    withEssence: "98 Gedlon's Strengths + 76 Demigod Essences",
    noCost: ["8420", "210", "11690g 99s 97c"],
    withCost: ["6280", "210", "7600", "6189g 93s 47c"]
  },
  summary: {
    perPieceNo: "16840 Akash Tokens, 210 Serpent Scales, 11690g 99s 97c",
    perPieceWith: "12770 Akash Tokens, 210 Serpent Scales, 7600 Radiant Hiram Infusions, 6203g 80s 82c",
    fullNo: "50520 Akash Tokens, 630 Serpent Scales, 35072g 99s 91c",
    fullWith: "38310 Akash Tokens, 630 Serpent Scales, 22800 Radiant Hiram Infusions, 18611g 42s 46c"
  }
};

const ACCESSORY_ARTIFACT = {
  title: "Accessory Artifacts",
  intro:
    "Leveling up your Accessory Artifacts will increase their Gearscore. Once you hit Lv 2, 3 and 4 it will also let you choose an extra effect.",
  optionBlocks: [
    {
      title: "For Artifact level 2 your options are",
      color: "#ffef63",
      items: ["Strength 20", "Agility 20", "Stamina 20", "Intelligence 20", "Spirit 20"]
    },
    {
      title: "For Artifact level 3 your options are",
      color: "#ff9d2e",
      items: ["Melee Attack 4", "Range Attack 4", "Magic Attack 4", "Healing Power 4"]
    },
    {
      title: "For Artifact level 4 your options are",
      color: "#4dff2b",
      items: [
        "Melee Critical Rate 1%",
        "Ranged Critical Rate 1%",
        "Magic Critical Rate 1%",
        "Critical Healing Rate 1%",
        "Received Healing 1%"
      ]
    }
  ],
  rows: [
    { level: "Level 2", exp: "900", rune: "Ewan's Rune Rank 1", noEssence: "9 Jodan's Wisdoms", withEssence: "6 Jordan's Wisdoms + 4 Demigod Essences", noCost: ["390", "0", "48g 03s 12c"], withCost: ["285", "0", "400", "26g 68s 40c"] },
    { level: "Level 3", exp: "2700", rune: "Ewan's Rune Rank 1", noEssence: "27 Jodan's Wisdoms", withEssence: "18 Jordan's Wisdoms + 12 Demigod Essences", noCost: ["1020", "0", "373g 57s 74c"], withCost: ["705", "0", "1200", "232g 44s 84c"] },
    { level: "Level 4", exp: "3900", rune: "Ewan's Rune Rank 1", noEssence: "39 Jodan's Wisdoms", withEssence: "24 Jordan's Wisdoms + 20 Demigod Essences", noCost: ["1440", "0", "5203g 39s 17c"], withCost: ["915", "0", "2000", "2701g 76s 12c"] }
  ],
  totals: {
    exp: "7500",
    noEssence: "75 Jodan's Wisdoms",
    withEssence: "48 Jordan's Wisdoms + 36 Demigod Essences",
    noCost: ["2850", "0", "5625g 00s 03c"],
    withCost: ["1905", "0", "3600", "2960g 89s 36c"]
  },
  summary: {
    perPieceNo: "5700 Akash Tokens, 5625g 00s 03c",
    perPieceWith: "3810 Akash Tokens, 3600 Radiant Hiram Infusions, 2960g 89s 36c",
    fullNo: "34200 Akash Tokens, 33750g 00s 18c",
    fullWith: "22860 Akash Tokens, 21600 Radiant Hiram Infusions, 17765g 36s 16c"
  }
};

const UPGRADE_REFERENCE_ROWS = [
  { step: "1 ➜ 2", weapon: "2× Gedlon", armor: "1× Herstan", accessory: "4× Yordan + 2× Demigod" },
  { step: "2 ➜ 3", weapon: "4× Gedlon + 1× Demigod", armor: "2× Herstan + 1× Demigod", accessory: "15× Yordan + 1× Demigod" },
  { step: "3 ➜ 4", weapon: "7× Gedlon + 1× Demigod", armor: "3× Herstan + 1× Demigod", accessory: "22× Yordan + 1× Demigod" },
  { step: "4 ➜ 5", weapon: "8× Gedlon + 2× Demigod", armor: "4× Herstan + 2× Demigod", accessory: "" },
  { step: "5 ➜ 6", weapon: "11× Gedlon + 1× Demigod", armor: "4× Herstan + 2× Demigod", accessory: "" },
  { step: "6 ➜ 7", weapon: "12× Gedlon + 1× Demigod", armor: "6× Herstan + 1× Demigod", accessory: "" },
  { step: "7 ➜ 8", weapon: "14× Gedlon", armor: "6× Herstan + 2× Demigod", accessory: "" },
  { step: "8 ➜ 9", weapon: "15× Gedlon", armor: "7× Herstan + 1× Demigod", accessory: "" },
  { step: "9 ➜ 10", weapon: "16× Gedlon", armor: "8× Herstan", accessory: "" }
];

const SET_EFFECTS = {
  ranks: [
    {
      rank: 1,
      effects: ["Max Health +2000", "Max Mana +1000"]
    },
    {
      rank: 2,
      effects: ["Physical Defense +750", "Magic Defense +750"]
    },
    {
      rank: 3,
      effects: ["Toughness +500", "Resilience +200"]
    }
  ],
  requirements: {
    Weapon: [12, 21, 30],
    Armor: [28, 49, 70],
    Accessories: [12, 18, 24]
  }
};

function getDefaultState() {
  const piecesDone = {};
  RANK_ROWS.forEach((row) => {
    piecesDone[row.id] = 0;
  });
  return { piecesDone };
}

function getState() {
  const fallback = getDefaultState();
  try {
    const saved = JSON.parse(localStorage.getItem(LOCAL_KEY) || "{}");
    return {
      piecesDone: {
        ...fallback.piecesDone,
        ...(saved.piecesDone || {})
      }
    };
  } catch {
    return fallback;
  }
}

function saveState(state) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(state));
}

function getPiecesValue(rowId) {
  const state = getState();
  return Math.max(0, Number(state.piecesDone?.[rowId] || 0));
}

function setPiecesValue(rowId, value) {
  const state = getState();
  state.piecesDone[rowId] = Math.max(0, Number(value) || 0);
  saveState(state);
}

function resetAkashToBase() {
  saveState(getDefaultState());
  window.renderCurrentPage();
}

function getPerPieceRequirement(row, resourceKey) {
  const required = Number(row.requirements?.[resourceKey] || 0);
  if (!required || !row.maxPieces) return 0;
  return required / row.maxPieces;
}

function getRowPiecesDone(row) {
  return Math.min(row.maxPieces, getPiecesValue(row.id));
}

function getRowResourceTotal(row, resourceKey) {
  return Math.round(getRowPiecesDone(row) * getPerPieceRequirement(row, resourceKey));
}

function getRowPieceTotal(row) {
  return getRowPiecesDone(row) * row.pieceWeight;
}

function getRowFutureTotal(row) {
  return getRowPiecesDone(row) * row.futureWeight;
}

function getCategoryRows(category) {
  return RANK_ROWS
    .filter((row) => row.category === category)
    .sort((a, b) => a.rank - b.rank);
}

function getCategorySetEffectTotal(category) {
  return buildPieceRanks(category).reduce((sum, rank) => sum + rank, 0);
}

function getCategoryStarLevel(category) {
  const thresholds = SET_EFFECTS.requirements[category] || [];
  const total = getCategorySetEffectTotal(category);

  let starLevel = 0;
  thresholds.forEach((threshold, index) => {
    if (total >= threshold) starLevel = index + 1;
  });

  return starLevel;
}

function getGlobalSetRank() {
  const weaponStars = getCategoryStarLevel("Weapon");
  const armorStars = getCategoryStarLevel("Armor");
  const accessoryStars = getCategoryStarLevel("Accessories");
  return Math.min(weaponStars, armorStars, accessoryStars);
}

function getBlockingCategoriesForRank(targetRank) {
  const categories = [
    { key: "Weapon", label: "Weapon", stars: getCategoryStarLevel("Weapon") },
    { key: "Armor", label: "Armor", stars: getCategoryStarLevel("Armor") },
    { key: "Accessories", label: "Accessories", stars: getCategoryStarLevel("Accessories") }
  ];

  return categories.filter((category) => category.stars < targetRank);
}

function buildPieceRanks(category) {
  const rows = getCategoryRows(category);
  const slotCount =
    category === "Armor" ? GEAR_LAYOUT.armor.length :
    category === "Weapon" ? GEAR_LAYOUT.weapons.length :
    GEAR_LAYOUT.accessories.length;

  const slots = Array.from({ length: slotCount }, () => 1);

  rows.forEach((row) => {
    const pieces = Math.min(row.maxPieces, getRowPiecesDone(row));
    for (let i = 0; i < pieces && i < slots.length; i += 1) {
      slots[i] = Math.max(slots[i], row.rank);
    }
  });

  return slots;
}

function getResourceTotalsForRows(rows) {
  const totals = {};
  RESOURCE_HEADERS.forEach((resource) => {
    totals[resource.key] = { required: 0, done: 0 };
  });

  rows.forEach((row) => {
    RESOURCE_HEADERS.forEach((resource) => {
      const required = Number(row.requirements?.[resource.key] || 0);
      totals[resource.key].required += required;
      totals[resource.key].done += getRowResourceTotal(row, resource.key);
    });
  });

  return totals;
}

function getStillNeedTotals(rows) {
  const totals = getResourceTotalsForRows(rows);
  const needed = {};

  RESOURCE_HEADERS.forEach((resource) => {
    needed[resource.key] = Math.max(0, totals[resource.key].required - totals[resource.key].done);
  });

  return needed;
}

function renderSectionNav() {
  return `
    <div class="card">
      <h2>Akash Level Progress</h2>
      <div class="section-nav">
        ${SECTION_LINKS.map((link) => `
          <a class="section-link" href="#${escapeHtml(link.id)}">${escapeHtml(link.label)}</a>
        `).join("")}
      </div>
    </div>
  `;
}

function renderTrackerLegend() {
  return `
    <div class="card">
      <p class="notice" style="margin:0;">
        Yellow cells are editable under <strong>Pieces Done</strong>. Everything else updates automatically.
      </p>
    </div>
  `;
}

function renderGearVisualSection() {
  return `
    <div class="card" id="akash-gear-visual">
      <h3>Auto Gear Progress</h3>
      <p class="notice" style="margin-bottom:16px;">
        Slot ranks are auto-calculated from the tracker below.
      </p>

      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:18px;align-items:start;">
        ${renderGearPanel("Armor", GEAR_LAYOUT.armor, buildPieceRanks("Armor"))}
        ${renderGearPanel("Weapons", GEAR_LAYOUT.weapons, buildPieceRanks("Weapon"))}
        ${renderGearPanel("Accessories", GEAR_LAYOUT.accessories, buildPieceRanks("Accessories"))}
      </div>
    </div>
  `;
}

function renderSetEffectsSection() {
  const weaponStars = getCategoryStarLevel("Weapon");
  const armorStars = getCategoryStarLevel("Armor");
  const accessoryStars = getCategoryStarLevel("Accessories");
  const globalRank = getGlobalSetRank();

  const cards = [
    {
      title: "Weapon",
      category: "Weapon",
      current: getCategorySetEffectTotal("Weapon"),
      stars: weaponStars
    },
    {
      title: "Armor",
      category: "Armor",
      current: getCategorySetEffectTotal("Armor"),
      stars: armorStars
    },
    {
      title: "Accessories",
      category: "Accessories",
      current: getCategorySetEffectTotal("Accessories"),
      stars: accessoryStars
    }
  ];

  return `
    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:14px;">
        <h3 style="margin:0;">Set Effects</h3>
        <div class="badge ${globalRank >= 3 ? "green" : globalRank >= 1 ? "orange" : "red"}" style="font-size:14px;padding:8px 14px;">
          Set Rank ${globalRank}
        </div>
      </div>

      <p class="notice" style="margin-top:0;margin-bottom:16px;">
        Rank 1, 2, and 3 only unlock when <strong>Weapon, Armor, and Accessories</strong> all reach that same star tier.
      </p>

      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:18px;align-items:start;margin-bottom:18px;">
        ${cards.map((card) => {
          const thresholds = SET_EFFECTS.requirements[card.category];

          return `
            <div class="summary-box">
              <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:12px;">
                <div style="font-weight:bold;">${escapeHtml(card.title)}</div>
                <div class="badge ${card.stars >= 3 ? "green" : card.stars >= 1 ? "orange" : "red"}">
                  ★ ${card.stars}
                </div>
              </div>

              <div class="notice" style="margin-bottom:12px;">
                Progress: <strong>${card.current}</strong> / ${thresholds[2]}
              </div>

              <div style="display:grid;gap:10px;">
                ${thresholds.map((threshold, index) => {
                  const unlocked = card.current >= threshold;

                  return `
                    <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;background:#1f2530;border:1px solid ${unlocked ? "rgba(34,197,94,0.35)" : "#394252"};border-radius:12px;padding:10px 12px;">
                      <div style="font-weight:700;">★ ${index + 1}</div>
                      <div style="font-weight:700;${unlocked ? "color:#86efac;" : ""}">${threshold}</div>
                    </div>
                  `;
                }).join("")}
              </div>
            </div>
          `;
        }).join("")}
      </div>

            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:18px;align-items:start;">
        ${SET_EFFECTS.ranks.map((row) => {
          const unlocked = globalRank >= row.rank;
          const blockers = getBlockingCategoriesForRank(row.rank);

          return `
            <div class="summary-box">
              <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:10px;">
                <div style="font-weight:bold;">Rank ${row.rank}</div>
                <div class="badge ${unlocked ? "green" : "red"}">
                  ${unlocked ? "Unlocked" : "Locked"}
                </div>
              </div>

              <div style="display:grid;gap:6px;">
                ${row.effects.map((effect) => `
                  <div class="notice" style="font-size:13px;line-height:1.45;">${escapeHtml(effect)}</div>
                `).join("")}
              </div>

              ${!unlocked ? `
                <div class="notice" style="margin-top:12px;color:#fcd34d;">
                  Waiting on: <strong>${blockers.map((blocker) => `${blocker.label} ★${row.rank}`).join(", ")}</strong>
                </div>
              ` : ""}
            </div>
          `;
        }).join("")}
      </div>
    </div>
  `;
}

function renderGearPanel(title, labels, ranks) {
  return `
    <div class="summary-box">
      <div style="font-weight:bold;margin-bottom:12px;">${escapeHtml(title)}</div>
      <div style="display:grid;gap:10px;">
        ${labels.map((label, index) => renderGearSlot(label, ranks[index] || 1, title)).join("")}
      </div>
    </div>
  `;
}

function renderGearSlot(label, rank, category) {
  const normalizedCategory = category === "Weapons" ? "Weapon" : category;

  const isMax =
    (normalizedCategory === "Weapon" && rank >= 10) ||
    (normalizedCategory === "Armor" && rank >= 10) ||
    (normalizedCategory === "Accessories" && rank >= 4);

  const badgeBg = isMax
    ? "rgba(245, 158, 11, 0.18)"
    : "rgba(59, 130, 246, 0.18)";

  const badgeColor = isMax
    ? "#fcd34d"
    : "#93c5fd";

  return `
    <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;background:#1f2530;border:1px solid #394252;border-radius:12px;padding:10px 12px;">
      <div style="display:flex;align-items:center;gap:10px;min-width:0;">
        <div style="width:42px;height:42px;border-radius:10px;background:#313949;border:1px solid #465062;display:flex;align-items:center;justify-content:center;font-size:18px;">
          ◈
        </div>
        <div style="min-width:0;">
          <div style="font-weight:600;">${escapeHtml(label)}</div>
          <div class="notice" style="font-size:12px;">Current rank</div>
        </div>
      </div>
      <div style="padding:6px 10px;border-radius:999px;background:${badgeBg};color:${badgeColor};font-weight:700;white-space:nowrap;">
        ★ ${rank}
      </div>
    </div>
  `;
}

function renderResourceHeader(resource) {
  return `
    <th colspan="2">
      <div style="display:flex;flex-direction:column;gap:4px;">
        <span>${escapeHtml(resource.short)}</span>
        <span style="font-size:11px;color:#cbd5e1;font-weight:600;line-height:1.3;">
          ${escapeHtml(resource.label)}
        </span>
      </div>
    </th>
  `;
}

function renderResourceBadge(resource) {
  return `
    <div style="display:inline-flex;align-items:center;justify-content:center;min-width:34px;height:28px;padding:0 10px;border-radius:999px;background:#313949;border:1px solid #465062;color:#ffd166;font-weight:700;font-size:12px;">
      ${escapeHtml(resource.short)}
    </div>
  `;
}

function renderStillNeedSummary(rows) {
  const needed = getStillNeedTotals(rows);

  return `
    <div class="card" style="margin-top:18px;">
      <h3 style="margin-bottom:12px;">Still Need</h3>
      <p class="notice" style="margin-top:0;margin-bottom:16px;">
        This is what is still left to farm based on your current Pieces Done.
      </p>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px;">
        ${RESOURCE_HEADERS.map((resource) => {
          const value = needed[resource.key];
          const done = value <= 0;

          return `
            <div class="summary-box" style="background:${done ? "rgba(34,197,94,0.12)" : "#2b313c"};border-color:${done ? "rgba(34,197,94,0.22)" : "#343c49"};">
              <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px;">
                ${renderResourceBadge(resource)}
                <div class="badge ${done ? "green" : "orange"}">
                  ${done ? "Done" : "Needed"}
                </div>
              </div>

              <div style="font-weight:700;line-height:1.45;margin-bottom:8px;">
                ${escapeHtml(resource.label)}
              </div>

              <div class="summary-value" style="font-size:28px;">
                ${value}
              </div>
            </div>
          `;
        }).join("")}
      </div>
    </div>
  `;
}

function renderRankTrackerTable() {
  const armorRows = getCategoryRows("Armor");
  const weaponRows = getCategoryRows("Weapon");
  const accessoryRows = getCategoryRows("Accessories");
  const allRows = [...armorRows, ...weaponRows, ...accessoryRows];

  return `
    <div class="card" id="akash-rank-progress">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:12px;">
        <h3 style="margin:0;">Rank Progress</h3>
        <button
          type="button"
          onclick="window.resetAkashTracker()"
          style="
            padding:8px 14px;
            border-radius:999px;
            border:1px solid #7c2d2d;
            background:#3a1f1f;
            color:#ffb4b4;
            font-weight:700;
            cursor:pointer;
          "
        >
          Reset to Base
        </button>
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th rowspan="2">Rank</th>
              ${RESOURCE_HEADERS.map((resource) => renderResourceHeader(resource)).join("")}
              <th rowspan="2" class="editable-col">Pieces Done</th>
            </tr>
            <tr>
              ${RESOURCE_HEADERS.map(() => `
                <th>Req</th>
                <th>Total</th>
              `).join("")}
            </tr>
          </thead>
          <tbody>
            ${RANK_ROWS.map((row) => renderRankRow(row)).join("")}
            ${renderTotalsRow("Armor", armorRows)}
            ${renderTotalsRow("Weapon", weaponRows)}
            ${renderTotalsRow("Accessories", accessoryRows)}
            ${renderTotalsRow("Everything", allRows)}
          </tbody>
        </table>
      </div>

      ${renderStillNeedSummary(allRows)}
    </div>
  `;
}

function renderRankRow(row) {
  const pieces = getRowPiecesDone(row);

  return `
    <tr>
      <td>${escapeHtml(row.label)}</td>
      ${RESOURCE_HEADERS.map((resource) => {
        const hasRequirement = Object.prototype.hasOwnProperty.call(row.requirements, resource.key);
        if (!hasRequirement) {
          return `<td></td><td></td>`;
        }

        const required = Number(row.requirements[resource.key] || 0);
        const done = getRowResourceTotal(row, resource.key);

        return `
          <td style="text-align:center;">${required}</td>
          <td style="text-align:center;background:${done >= required ? "#2d6a27" : done > 0 ? "#8a5c10" : "#5a511b"};color:#fff4b0;font-weight:700;">
            ${done}
          </td>
        `;
      }).join("")}
      <td style="background:#7c6f2b;padding:4px;">
        <input
          type="number"
          min="0"
          max="${row.maxPieces}"
          value="${pieces}"
          data-akash-row-id="${escapeHtml(row.id)}"
          style="width:72px;background:#fff266;border:1px solid #a98f2c;color:#1e1e1e;font-weight:700;text-align:center;"
          oninput="window.updateAkashPiecesDone('${jsEscape(row.id)}', this.value, true)"
          onchange="window.updateAkashPiecesDone('${jsEscape(row.id)}', this.value, false)"
        >
      </td>
    </tr>
  `;
}

function renderTotalsRow(label, rows) {
  const totals = getResourceTotalsForRows(rows);
  const pieces = rows.reduce((sum, row) => sum + getRowPiecesDone(row), 0);

  return `
    <tr class="category-row">
      <td>${escapeHtml(label)}</td>
      ${RESOURCE_HEADERS.map((resource) => `
        <td style="text-align:center;">${totals[resource.key].required || ""}</td>
        <td style="text-align:center;background:${totals[resource.key].done >= totals[resource.key].required && totals[resource.key].required > 0 ? "#2d6a27" : totals[resource.key].done > 0 ? "#8a5c10" : "#1f2530"};font-weight:700;">
          ${totals[resource.key].done || ""}
        </td>
      `).join("")}
      <td style="background:#7c6f2b;text-align:center;font-weight:700;">${pieces}</td>
    </tr>
  `;
}

function renderQuestRewardsSection() {
  return `
    <div id="akash-quest-rewards">
      <div class="card">
        <h3>Quest Rewards</h3>
        <p class="notice">Clean reference only. No weekly math here — just what each quest gives.</p>
      </div>

      <div class="card">
        <h3>Akash Token Daily Quests</h3>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Quest</th>
                <th>Reward</th>
              </tr>
            </thead>
            <tbody>
              ${AKASH_QUEST_REWARDS.daily.map((row) => `
                <tr>
                  <td>${escapeHtml(row.quest)}</td>
                  <td>${escapeHtml(row.reward)}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>

      <div class="card">
        <h3>Akash Token Weekly Quests</h3>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Quest</th>
                <th>Reward</th>
              </tr>
            </thead>
            <tbody>
              ${AKASH_QUEST_REWARDS.weekly.map((row) => `
                <tr>
                  <td>${escapeHtml(row.quest)}</td>
                  <td>${escapeHtml(row.reward)}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>

      <div class="card">
        <h3>Infusion Rewards</h3>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Quest</th>
                <th>Radiant</th>
                <th>Mysterious</th>
                <th>Exalted</th>
              </tr>
            </thead>
            <tbody>
              <tr class="category-row">
                <td colspan="4">Daily</td>
              </tr>
              ${INFUSION_REWARDS.daily.map((row) => `
                <tr>
                  <td>${escapeHtml(row.quest)}</td>
                  <td>${escapeHtml(row.radiant)}</td>
                  <td>${escapeHtml(row.mysterious)}</td>
                  <td>${escapeHtml(row.exalted)}</td>
                </tr>
              `).join("")}
              <tr class="category-row">
                <td colspan="4">Weekly</td>
              </tr>
              ${INFUSION_REWARDS.weekly.map((row) => `
                <tr>
                  <td>${escapeHtml(row.quest)}</td>
                  <td>${escapeHtml(row.radiant)}</td>
                  <td>${escapeHtml(row.mysterious)}</td>
                  <td>${escapeHtml(row.exalted)}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

function renderArtifactSection(section, countLabel, countValue) {
  return `
    <div class="card" style="padding:0;overflow:hidden;">
      <div style="background:#313949;padding:18px 20px;border-bottom:1px solid #3f4a5d;">
        <h3 style="margin:0;text-align:center;">${escapeHtml(section.title)}</h3>
      </div>

      <div style="padding:22px;">
        <p class="notice" style="margin-top:0;margin-bottom:18px;line-height:1.6;">
          ${escapeHtml(section.intro)}
        </p>

        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px;margin-bottom:20px;">
          ${section.optionBlocks.map((block) => `
            <div class="summary-box" style="background:#2b313c;">
              <div style="font-weight:700;margin-bottom:10px;color:${block.color};">${escapeHtml(block.title)}</div>
              <div style="display:grid;gap:8px;">
                ${block.items.map((item) => `
                  <div style="padding:10px 12px;border-radius:10px;background:#1f2530;border:1px solid #394252;color:${block.color};font-weight:700;line-height:1.5;">${escapeHtml(item)}</div>
                `).join("")}
              </div>
            </div>
          `).join("")}
        </div>

        <div class="table-wrap" style="margin-bottom:18px;">
          <table>
            <thead>
              <tr>
                <th rowspan="2">Gear level</th>
                <th rowspan="2">EXP Required</th>
                <th rowspan="2">Ewan's Rune</th>
                <th colspan="2">Feeding material</th>
                <th colspan="3">Total Cost no essence</th>
                <th colspan="4">Total Cost with essence</th>
              </tr>
              <tr>
                <th style="background:#7fa0d4;color:#0f1720;">No Essence</th>
                <th style="background:#a8c996;color:#0f1720;">With Essence</th>
                <th style="background:#7fa0d4;color:#0f1720;">Akash Token</th>
                <th style="background:#7fa0d4;color:#0f1720;">Serpent Scales</th>
                <th style="background:#7fa0d4;color:#0f1720;">Gold</th>
                <th style="background:#a8c996;color:#0f1720;">Akash Token</th>
                <th style="background:#a8c996;color:#0f1720;">Serpent Scales</th>
                <th style="background:#a8c996;color:#0f1720;">Radiant Hiram Infusion</th>
                <th style="background:#a8c996;color:#0f1720;">Gold</th>
              </tr>
            </thead>
            <tbody>
              ${section.rows.map((row) => `
                <tr>
                  <td>${escapeHtml(row.level)}</td>
                  <td>${escapeHtml(row.exp)}</td>
                  <td>${escapeHtml(row.rune)}</td>
                  <td style="background:rgba(127,160,212,0.12);">${escapeHtml(row.noEssence)}</td>
                  <td style="background:rgba(168,201,150,0.12);">${escapeHtml(row.withEssence)}</td>
                  <td style="background:rgba(127,160,212,0.12);">${escapeHtml(row.noCost[0])}</td>
                  <td style="background:rgba(127,160,212,0.12);">${escapeHtml(row.noCost[1])}</td>
                  <td style="background:rgba(127,160,212,0.12);">${escapeHtml(row.noCost[2])}</td>
                  <td style="background:rgba(168,201,150,0.12);">${escapeHtml(row.withCost[0])}</td>
                  <td style="background:rgba(168,201,150,0.12);">${escapeHtml(row.withCost[1])}</td>
                  <td style="background:rgba(168,201,150,0.12);">${escapeHtml(row.withCost[2])}</td>
                  <td style="background:rgba(168,201,150,0.12);">${escapeHtml(row.withCost[3])}</td>
                </tr>
              `).join("")}

              <tr>
                <td style="background:#8a6a00;color:#fff;"><strong>Total</strong></td>
                <td style="background:#8a6a00;color:#fff;"><strong>${escapeHtml(section.totals.exp)}</strong></td>
                <td></td>
                <td style="background:#215ec7;color:#fff;"><strong>${escapeHtml(section.totals.noEssence)}</strong></td>
                <td style="background:#2e7d16;color:#fff;"><strong>${escapeHtml(section.totals.withEssence)}</strong></td>
                <td style="background:#215ec7;color:#fff;"><strong>${escapeHtml(section.totals.noCost[0])}</strong></td>
                <td style="background:#215ec7;color:#fff;"><strong>${escapeHtml(section.totals.noCost[1])}</strong></td>
                <td style="background:#215ec7;color:#fff;"><strong>${escapeHtml(section.totals.noCost[2])}</strong></td>
                <td style="background:#2e7d16;color:#fff;"><strong>${escapeHtml(section.totals.withCost[0])}</strong></td>
                <td style="background:#2e7d16;color:#fff;"><strong>${escapeHtml(section.totals.withCost[1])}</strong></td>
                <td style="background:#2e7d16;color:#fff;"><strong>${escapeHtml(section.totals.withCost[2])}</strong></td>
                <td style="background:#2e7d16;color:#fff;"><strong>${escapeHtml(section.totals.withCost[3])}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:16px;">
          <div class="summary-box" style="background:#2b313c;">
            <div style="font-weight:700;margin-bottom:10px;">Each ${escapeHtml(countLabel)} will cost you</div>
            <div class="notice" style="line-height:1.6;">No essence: ${escapeHtml(section.summary.perPieceNo)}</div>
            <div class="notice" style="line-height:1.6;">With Essence: ${escapeHtml(section.summary.perPieceWith)}</div>
          </div>

          <div class="summary-box" style="background:#2b313c;">
            <div style="font-weight:700;margin-bottom:10px;">All ${escapeHtml(countValue)} ${escapeHtml(countLabel)}${countValue === 1 ? "" : "s"} will cost you</div>
            <div class="notice" style="line-height:1.6;">No essence: ${escapeHtml(section.summary.fullNo)}</div>
            <div class="notice" style="line-height:1.6;">With Essence: ${escapeHtml(section.summary.fullWith)}</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderUpgradeReference() {
  return `
    <div class="card" style="padding:0;overflow:hidden;">
      <div style="background:#313949;padding:18px 20px;border-bottom:1px solid #3f4a5d;">
        <h3 style="margin:0;text-align:center;">Upgrade Reference</h3>
      </div>

      <div style="padding:22px;">
        <div class="summary-box" style="background:#2b313c;">
          <div style="display:grid;grid-template-columns:140px 1fr 1fr 1fr;gap:0;align-items:stretch;">
            <div style="padding:10px 12px;font-weight:700;border-bottom:1px solid #3d4657;"></div>
            <div style="padding:10px 12px;font-weight:700;text-align:center;border-left:1px solid #3d4657;border-bottom:1px solid #3d4657;">Weapon</div>
            <div style="padding:10px 12px;font-weight:700;text-align:center;border-left:1px solid #3d4657;border-bottom:1px solid #3d4657;">Armor</div>
            <div style="padding:10px 12px;font-weight:700;text-align:center;border-left:1px solid #3d4657;border-bottom:1px solid #3d4657;">Accessories</div>

            ${UPGRADE_REFERENCE_ROWS.map((row, index) => `
              <div style="padding:12px;border-bottom:${index === UPGRADE_REFERENCE_ROWS.length - 1 ? "0" : "1px solid #3d4657"};display:flex;align-items:center;gap:10px;font-weight:700;">
                <span style="display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:999px;background:rgba(245,158,11,0.18);color:#fcd34d;">★</span>
                <span>${escapeHtml(row.step)}</span>
              </div>

              <div style="padding:12px;border-left:1px solid #3d4657;border-bottom:${index === UPGRADE_REFERENCE_ROWS.length - 1 ? "0" : "1px solid #3d4657"};text-align:center;">
                ${row.weapon ? `<span class="notice" style="font-weight:700;color:#f3b25e;">${escapeHtml(row.weapon)}</span>` : ""}
              </div>

              <div style="padding:12px;border-left:1px solid #3d4657;border-bottom:${index === UPGRADE_REFERENCE_ROWS.length - 1 ? "0" : "1px solid #3d4657"};text-align:center;">
                ${row.armor ? `<span class="notice" style="font-weight:700;color:#8fc3ff;">${escapeHtml(row.armor)}</span>` : ""}
              </div>

              <div style="padding:12px;border-left:1px solid #3d4657;border-bottom:${index === UPGRADE_REFERENCE_ROWS.length - 1 ? "0" : "1px solid #3d4657"};text-align:center;">
                ${row.accessory ? `<span class="notice" style="font-weight:700;color:#9be27e;">${escapeHtml(row.accessory)}</span>` : ""}
              </div>
            `).join("")}
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderReferenceSections() {
  return `
    <div id="akash-reference">
      ${renderArtifactSection(ARMOR_ARTIFACT, "armor piece", 7)}
      ${renderArtifactSection(WEAPON_ARTIFACT, "weapon", 3)}
      ${renderArtifactSection(ACCESSORY_ARTIFACT, "accessory", 6)}
      ${renderUpgradeReference()}
    </div>
  `;
}

function renderLocalTopButton() {
  return `
    <button
      type="button"
      onclick="window.scrollTo({ top: 0, behavior: 'smooth' })"
      style="
        position:fixed;
        right:24px;
        bottom:82px;
        z-index:1000;
        padding:10px 14px;
        border-radius:999px;
        border:1px solid #566174;
        background:#313949;
        color:#eef2f7;
        font-size:13px;
        font-weight:700;
        letter-spacing:0.04em;
        box-shadow:0 10px 24px rgba(0,0,0,0.28);
        cursor:pointer;
      "
    >
      TOP
    </button>
  `;
}

export function renderPage() {
  return `
    ${renderSectionNav()}
    ${renderGearVisualSection()}
    ${renderSetEffectsSection()}
    ${renderTrackerLegend()}
    ${renderRankTrackerTable()}
    ${renderQuestRewardsSection()}
    ${renderReferenceSections()}
    ${renderLocalTopButton()}
  `;
}

function rerenderAkashPreservingState(rowId) {
  const scrollY = window.scrollY;
  const active = document.activeElement;
  const isInput = active && active.matches && active.matches(`[data-akash-row-id="${rowId}"]`);
  const selectionStart = isInput && typeof active.selectionStart === "number" ? active.selectionStart : null;
  const selectionEnd = isInput && typeof active.selectionEnd === "number" ? active.selectionEnd : null;

  window.renderCurrentPage();

  requestAnimationFrame(() => {
    window.scrollTo({ top: scrollY, behavior: "auto" });

    if (rowId) {
      const nextInput = document.querySelector(`[data-akash-row-id="${rowId}"]`);
      if (nextInput) {
        nextInput.focus();
        if (selectionStart !== null && selectionEnd !== null) {
          try {
            nextInput.setSelectionRange(selectionStart, selectionEnd);
          } catch {}
        }
      }
    }
  });
}

window.updateAkashPiecesDone = function (rowId, value, keepFocus) {
  setPiecesValue(rowId, value);
  rerenderAkashPreservingState(keepFocus ? rowId : "");
};

window.resetAkashTracker = resetAkashToBase;