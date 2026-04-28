import { appState } from "../state.js";
import { getProfData, getRankFromPoints } from "../data/proficiency.js";
import { escapeHtml, formatGold, getStatus, getStillNeedClass, jsEscape } from "../utils.js";

const LOCAL_KEY = "erenorCraftQuantities";
const FILTER_KEY = "erenorCraftProfessionFilter";
const GUIDE_STATE_KEY = "erenorCraftGuideState";

function getQuantities() {
  return JSON.parse(localStorage.getItem(LOCAL_KEY) || "{}");
}

function saveQuantity(id, value) {
  const data = getQuantities();
  data[id] = Math.max(0, Number(value) || 0);
  localStorage.setItem(LOCAL_KEY, JSON.stringify(data));
}

function getProfessionFilter() {
  return localStorage.getItem(FILTER_KEY) || "All";
}

function saveProfessionFilter(value) {
  localStorage.setItem(FILTER_KEY, value);
}

function getGuideState() {
  try {
    return JSON.parse(localStorage.getItem(GUIDE_STATE_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveGuideState(data) {
  localStorage.setItem(GUIDE_STATE_KEY, JSON.stringify(data));
}

function clearGuideChecks(state, recipeId) {
  const prefix = `${recipeId}:`;
  Object.keys(state).forEach((key) => {
    if (key.startsWith(prefix) && key !== `${recipeId}:open`) {
      delete state[key];
    }
  });
}

const craftGuides = {
  "erenor-ring-earring": {
    title: "Erenor Ring, Earring Craft Guide",
    proficiency: { skill: "Handicrafts", required: 180000 },
    steps: [
      {
        id: "accessory-scrolls",
        title: "Make 10 Accessory Regrade Scrolls",
        body: "Craft the scrolls first so the final combine is ready when everything else is gathered.",
        checks: [
          { id: "starpoints", label: "Do you have 10 Starpoints?", item: "Starpoint", qty: 10 },
          { id: "blank-scrolls", label: "Do you have 10 Blank Regrade Scrolls?", item: "Blank Regrade Scroll", qty: 10 },
          { id: "crafted-scrolls", label: "Accessory Regrade Scrolls crafted", manual: true }
        ]
      },
      {
        id: "starlight-essence",
        title: "Obtain 93 Starlight Archeum Essence",
        body: "Confirm the essence is in your inventory before moving forward.",
        checks: [
          { id: "essence", label: "Do you have 93 Starlight Archeum Essence?", item: "Starlight Archeum Essence", qty: 93 }
        ]
      },
      {
        id: "ipnysh-blessing",
        title: "Obtain Ipnysh Starlight Blessing",
        body: "Gather the Ipnysh blessing inputs.",
        checks: [
          { id: "acidic-pouches", label: "Do you have 4 Acidic Poison Pouches?", item: "Acidic Poison Pouch", qty: 4 },
          { id: "cursed-pieces", label: "Do you have 4 Cursed Armor Pieces?", item: "Cursed Armor Piece", qty: 4 },
          { id: "dragon-stabilizer", label: "Do you have 50 Dragon Essence Stabilizers?", item: "Dragon Essence Stabilizer", qty: 50 }
        ]
      },
      {
        id: "prismatic-diamonds",
        title: "Obtain 39 Prismatic Diamonds",
        body: "Confirm the six gem stacks used for the prismatic diamonds.",
        checks: [
          { id: "amethyst", label: "Do you have 39 Amethyst?", item: "Amethyst", qty: 39 },
          { id: "topaz", label: "Do you have 39 Topaz?", item: "Topaz", qty: 39 },
          { id: "sapphire", label: "Do you have 39 Sapphire?", item: "Sapphire", qty: 39 },
          { id: "ruby", label: "Do you have 39 Ruby?", item: "Ruby", qty: 39 },
          { id: "emerald", label: "Do you have 39 Emerald?", item: "Emerald", qty: 39 },
          { id: "diamond", label: "Do you have 39 Diamond?", item: "Diamond", qty: 39 }
        ]
      },
      {
        id: "gold-ingots",
        title: "Obtain 91 Gold Ingots",
        body: "Either bring the ore and craft the ingots, or confirm the ingots are already made.",
        checks: [
          { id: "gold-ore", label: "Do you have 273 Gold Ore?", item: "Gold Ore", qty: 273 },
          { id: "gold-ingots-made", label: "Have you already made 91 Gold Ingots?", item: "Gold Ingot", qty: 91 }
        ]
      },
      {
        id: "final-craft",
        title: "Craft at an Armorer's House",
        body: "Proceed to an Armorer's House of your choosing and make the Erenor Ring or Earring.",
        checks: [
          { id: "proficiency", label: "Handicrafts proficiency is 180,000 or higher", proficiency: "Handicrafts", qty: 180000 },
          { id: "at-armorer-house", label: "I am at the Armorer's House and ready to craft", manual: true },
          { id: "crafted-item", label: "Erenor Ring or Earring crafted", manual: true }
        ]
      }
    ]
  },
  "erenor-necklace": {
    title: "Erenor Necklace Craft Guide",
    proficiency: { skill: "Handicrafts", required: 180000 },
    steps: [
      {
        id: "accessory-scrolls",
        title: "Make 10 Accessory Regrade Scrolls",
        body: "Craft the scrolls first so the final combine is ready when everything else is gathered.",
        checks: [
          { id: "starpoints", label: "Do you have 10 Starpoints?", item: "Starpoint", qty: 10 },
          { id: "blank-scrolls", label: "Do you have 10 Blank Regrade Scrolls?", item: "Blank Regrade Scroll", qty: 10 },
          { id: "crafted-scrolls", label: "Accessory Regrade Scrolls crafted", manual: true }
        ]
      },
      {
        id: "starlight-essence",
        title: "Obtain 110 Starlight Archeum Essence",
        body: "Confirm the essence is in your inventory before moving forward.",
        checks: [
          { id: "essence", label: "Do you have 110 Starlight Archeum Essence?", item: "Starlight Archeum Essence", qty: 110 }
        ]
      },
      {
        id: "ipnysh-blessing",
        title: "Obtain Ipnysh Starlight Blessing",
        body: "Gather the Ipnysh blessing inputs.",
        checks: [
          { id: "acidic-pouches", label: "Do you have 4 Acidic Poison Pouches?", item: "Acidic Poison Pouch", qty: 4 },
          { id: "cursed-pieces", label: "Do you have 4 Cursed Armor Pieces?", item: "Cursed Armor Piece", qty: 4 },
          { id: "dragon-stabilizer", label: "Do you have 50 Dragon Essence Stabilizers?", item: "Dragon Essence Stabilizer", qty: 50 }
        ]
      },
      {
        id: "prismatic-diamonds",
        title: "Obtain 39 Prismatic Diamonds",
        body: "Confirm the six gem stacks used for the prismatic diamonds.",
        checks: [
          { id: "amethyst", label: "Do you have 39 Amethyst?", item: "Amethyst", qty: 39 },
          { id: "topaz", label: "Do you have 39 Topaz?", item: "Topaz", qty: 39 },
          { id: "sapphire", label: "Do you have 39 Sapphire?", item: "Sapphire", qty: 39 },
          { id: "ruby", label: "Do you have 39 Ruby?", item: "Ruby", qty: 39 },
          { id: "emerald", label: "Do you have 39 Emerald?", item: "Emerald", qty: 39 },
          { id: "diamond", label: "Do you have 39 Diamond?", item: "Diamond", qty: 39 }
        ]
      },
      {
        id: "gold-ingots",
        title: "Obtain 91 Gold Ingots",
        body: "Either bring the ore and craft the ingots, or confirm the ingots are already made.",
        checks: [
          { id: "gold-ore", label: "Do you have 273 Gold Ore?", item: "Gold Ore", qty: 273 },
          { id: "gold-ingots-made", label: "Have you already made 91 Gold Ingots?", item: "Gold Ingot", qty: 91 }
        ]
      },
      {
        id: "final-craft",
        title: "Craft at an Armorer's House",
        body: "Proceed to an Armorer's House of your choosing and make the Erenor Necklace.",
        checks: [
          { id: "proficiency", label: "Handicrafts proficiency is 180,000 or higher", proficiency: "Handicrafts", qty: 180000 },
          { id: "at-armorer-house", label: "I am at the Armorer's House and ready to craft", manual: true },
          { id: "crafted-item", label: "Erenor Necklace crafted", manual: true }
        ]
      }
    ]
  },
  "erenor-flute-lute": {
    title: "Erenor Flute, Lute Craft Guide",
    proficiency: { skill: "Handicrafts", required: 180000 },
    steps: [
      {
        id: "small-seed-oil",
        title: "Make 1,700 Small Seed Oil",
        body: "Make Small Seed Oil at an Alchemy Table, or use the Multipurpose Workbench batch craft. The ratio is 3 Onyx Archeum Essence, 20 Rice, and 20 Corn per oil.",
        checks: [
          { id: "onyx", label: "Do you have 5,100 Onyx Archeum Essence?", item: "Onyx Archeum Essence", qty: 5100 },
          { id: "rice", label: "Do you have 34,000 Rice?", item: "Rice", qty: 34000 },
          { id: "corn", label: "Do you have 34,000 Corn?", item: "Corn", qty: 34000 },
          { id: "crafted-oil", label: "1,700 Small Seed Oil crafted", manual: true }
        ]
      },
      {
        id: "fine-lumber",
        title: "Make 1,700 Fine Lumber",
        body: "Craft at a Sawmill Station. Each Fine Lumber uses 10 Lumber and 1 Small Seed Oil.",
        labor: { skill: "Carpentry", baseEach: 12, qty: 1700 },
        checks: [
          { id: "lumber", label: "Do you have 17,000 Lumber?", item: "Lumber", qty: 17000 },
          { id: "crafted-fine-lumber", label: "1,700 Fine Lumber crafted", manual: true }
        ]
      },
      {
        id: "viscous-glossy-oil",
        title: "Make 170 Viscous Glossy Oil",
        body: "Make Viscous Glossy Oil for the Nuri Forest Lumber chain.",
        checks: [
          { id: "onyx", label: "Do you have 850 Onyx Archeum Essence?", item: "Onyx Archeum Essence", qty: 850 },
          { id: "peanut", label: "Do you have 5,100 Peanut?", item: "Peanut", qty: 5100 },
          { id: "wheat", label: "Do you have 5,100 Wheat?", item: "Wheat", qty: 5100 },
          { id: "red-coral", label: "Do you have 3,400 Red Coral?", item: "Red Coral", qty: 3400 },
          { id: "crafted-glossy-oil", label: "170 Viscous Glossy Oil crafted", manual: true }
        ]
      },
      {
        id: "nuri-forest-lumber",
        title: "Make 170 Nuri Forest Lumber",
        body: "Craft at a Sawmill Station. Each Nuri Forest Lumber uses 10 Fine Lumber, 5 Mysterious Garden Powder, and 1 Viscous Glossy Oil.",
        labor: { skill: "Carpentry", baseEach: 23, qty: 170 },
        checks: [
          { id: "fine-lumber-ready", label: "Do you have 1,700 Fine Lumber ready?", manual: true },
          { id: "garden-powder", label: "Do you have 850 Mysterious Garden Powder?", item: "Mysterious Garden Powder", qty: 850 },
          { id: "viscous-glossy-oil-ready", label: "Do you have 170 Viscous Glossy Oil ready?", manual: true },
          { id: "crafted-nuri-lumber", label: "170 Nuri Forest Lumber crafted", manual: true }
        ]
      },
      {
        id: "blazing-nuri-lumber",
        title: "Make 17 Blazing Nuri Forest Lumber",
        body: "Craft at a Sawmill Station. Each Blazing Nuri Forest Lumber uses 10 Nuri Forest Lumber, 9 Anya Ingots, 25 Dragon Essence Stabilizers, and 6 Flaming Logs.",
        labor: { skill: "Carpentry", baseEach: 117, qty: 17 },
        checks: [
          { id: "nuri-lumber-ready", label: "Do you have 170 Nuri Forest Lumber ready?", manual: true },
          { id: "anya-ingot", label: "Do you have 153 Anya Ingots?", item: "Anya Ingot", qty: 153 },
          { id: "flaming-log", label: "Do you have 102 Flaming Logs?", item: "Flaming Log", qty: 102 },
          { id: "dragon-stabilizer", label: "Do you have 425 Dragon Essence Stabilizers?", item: "Dragon Essence Stabilizer", qty: 425 },
          { id: "crafted-blazing-lumber", label: "17 Blazing Nuri Forest Lumber crafted", manual: true }
        ]
      },
      {
        id: "weapon-scrolls",
        title: "Make 10 Weapon Regrade Scrolls",
        body: "Craft the weapon scrolls for the final instrument craft.",
        checks: [
          { id: "sunpoints", label: "Do you have 10 Sunpoints?", item: "Sunpoint", qty: 10 },
          { id: "blank-scrolls", label: "Do you have 10 Blank Regrade Scrolls?", item: "Blank Regrade Scroll", qty: 10 },
          { id: "crafted-scrolls", label: "10 Weapon Regrade Scrolls crafted", manual: true }
        ]
      },
      {
        id: "ipnysh-blessings",
        title: "Make 1 Ipnysh Sunlight Blessing",
        body: "Gather the Ipnysh blessing inputs for the final craft.",
        checks: [
          { id: "acidic-pouches", label: "Do you have 4 Acidic Poison Pouches?", item: "Acidic Poison Pouch", qty: 4 },
          { id: "cursed-pieces", label: "Do you have 4 Cursed Armor Pieces?", item: "Cursed Armor Piece", qty: 4 },
          { id: "crafted-ipnysh-blessing", label: "1 Ipnysh Sunlight Blessing crafted", manual: true }
        ]
      },
      {
        id: "sunlight-essence",
        title: "Obtain 172 Sunlight Archeum Essence",
        body: "Confirm the essence is ready for the final craft.",
        checks: [
          { id: "essence", label: "Do you have 172 Sunlight Archeum Essence?", item: "Sunlight Archeum Essence", qty: 172 }
        ]
      },
      {
        id: "archeum-ingots",
        title: "Obtain 132 Archeum Ingots",
        body: "Confirm the Archeum Ingots are ready for the final craft.",
        checks: [
          { id: "archeum-ingots-ready", label: "Do you have 132 Archeum Ingots?", item: "Archeum Ingot", qty: 132 }
        ]
      },
      {
        id: "final-craft",
        title: "Craft at an Armorer's House",
        body: "Proceed to an Armorer's House of your choosing and make the Erenor Flute or Lute.",
        checks: [
          { id: "proficiency", label: "Handicrafts proficiency is 180,000 or higher", proficiency: "Handicrafts", qty: 180000 },
          { id: "at-armorer-house", label: "I am at the Armorer's House and ready to craft", manual: true },
          { id: "crafted-item", label: "Erenor Flute or Lute crafted", manual: true }
        ]
      }
    ]
  },
  "erenor-flame-wave-lightning-lunafrost": {
    title: "Erenor Flame, Wave, Lightning Lunafrost Craft Guide",
    proficiency: { skill: "Alchemy", required: 70000 },
    steps: [
      {
        id: "rainbow-polish",
        title: "Make 3 Rainbow Polish",
        body: "Craft Rainbow Polish first: each one uses 3 Dragon Essence Stabilizers, 50 Turmeric, 50 Cactus, 10 Sparkling Shell Dust, and 10 Beechnut.",
        checks: [
          { id: "dragon-stabilizer", label: "Do you have 9 Dragon Essence Stabilizers?", item: "Dragon Essence Stabilizer", qty: 9 },
          { id: "turmeric", label: "Do you have 150 Turmeric?", item: "Turmeric", qty: 150 },
          { id: "cactus", label: "Do you have 150 Cactus?", item: "Cactus", qty: 150 },
          { id: "shell-dust", label: "Do you have 30 Sparkling Shell Dust?", item: "Sparkling Shell Dust", qty: 30 },
          { id: "beechnut", label: "Do you have 30 Beechnut?", item: "Beechnut", qty: 30 },
          { id: "crafted-rainbow-polish", label: "3 Rainbow Polish crafted", manual: true }
        ]
      },
      {
        id: "lunarite",
        title: "Make 4,500 Lunarite",
        body: "Prepare the base Lunarite. The chain starts here: 5 Lunarite makes 1 Fine Lunarite.",
        checks: [
          { id: "moonlight-dust", label: "Do you have 150 Moonlight Archeum Dust?", item: "Moonlight Archeum Dust", qty: 150 },
          { id: "garden-powder", label: "Do you have 150 Mysterious Garden Powder?", item: "Mysterious Garden Powder", qty: 150 },
          { id: "crafted-lunarite", label: "4,500 Lunarite crafted", manual: true }
        ]
      },
      {
        id: "fine-lunarite",
        title: "Upgrade 4,500 Lunarite into 900 Fine Lunarite",
        body: "Use 5 Lunarite to make 1 Fine Lunarite.",
        checks: [
          { id: "lunarite-ready", label: "Do you have 4,500 Lunarite ready?", manual: true },
          { id: "crafted-fine-lunarite", label: "900 Fine Lunarite crafted", manual: true }
        ]
      },
      {
        id: "superior-lunarite",
        title: "Upgrade 900 Fine Lunarite into 300 Superior Lunarite",
        body: "Use 3 Fine Lunarite to make 1 Superior Lunarite.",
        checks: [
          { id: "fine-lunarite-ready", label: "Do you have 900 Fine Lunarite ready?", manual: true },
          { id: "crafted-superior-lunarite", label: "300 Superior Lunarite crafted", manual: true }
        ]
      },
      {
        id: "prime-lunarite",
        title: "Upgrade 300 Superior Lunarite into 100 Prime Lunarite",
        body: "Use 3 Superior Lunarite to make 1 Prime Lunarite.",
        checks: [
          { id: "superior-lunarite-ready", label: "Do you have 300 Superior Lunarite ready?", manual: true },
          { id: "crafted-prime-lunarite", label: "100 Prime Lunarite crafted", manual: true }
        ]
      },
      {
        id: "prismatic-diamonds",
        title: "Make 5 Prismatic Diamonds",
        body: "Confirm the six gem stacks for the Prismatic Diamonds.",
        checks: [
          { id: "diamond", label: "Do you have 5 Diamond?", item: "Diamond", qty: 5 },
          { id: "ruby", label: "Do you have 5 Ruby?", item: "Ruby", qty: 5 },
          { id: "sapphire", label: "Do you have 5 Sapphire?", item: "Sapphire", qty: 5 },
          { id: "amethyst", label: "Do you have 5 Amethyst?", item: "Amethyst", qty: 5 },
          { id: "emerald", label: "Do you have 5 Emerald?", item: "Emerald", qty: 5 },
          { id: "topaz", label: "Do you have 5 Topaz?", item: "Topaz", qty: 5 },
          { id: "crafted-prismatic-diamonds", label: "5 Prismatic Diamonds crafted", manual: true }
        ]
      },
      {
        id: "ipnysh-starlight-blessing",
        title: "Make 1 Ipnysh Starlight Blessing",
        body: "Gather the Ipnysh blessing materials from the verified list.",
        checks: [
          { id: "acidic-pouches", label: "Do you have 4 Acidic Poison Pouches?", item: "Acidic Poison Pouch", qty: 4 },
          { id: "cursed-pieces", label: "Do you have 4 Cursed Armor Pieces?", item: "Cursed Armor Piece", qty: 4 },
          { id: "dragon-stabilizer", label: "Do you have 50 Dragon Essence Stabilizers?", item: "Dragon Essence Stabilizer", qty: 50 },
          { id: "crafted-ipnysh-blessing", label: "1 Ipnysh Starlight Blessing crafted", manual: true }
        ]
      },
      {
        id: "final-materials",
        title: "Gather Final Lunafrost Inputs",
        body: "These are the remaining materials shown on the verified sheet before the final craft.",
        checks: [
          { id: "book-of-auroria", label: "Do you have 8 Book of Auroria?", item: "Book of Auroria", qty: 8 }
        ]
      },
      {
        id: "final-craft",
        title: "Craft the Lunafrost",
        body: "Finish the chain into the Erenor Flame, Wave, or Lightning Lunafrost.",
        checks: [
          { id: "proficiency", label: "Alchemy proficiency is 70,000 or higher", proficiency: "Alchemy", qty: 70000 },
          { id: "rainbow-polish-ready", label: "Do you have 3 Rainbow Polish ready?", manual: true },
          { id: "prime-lunarite-ready", label: "Do you have 100 Prime Lunarite ready?", manual: true },
          { id: "prismatic-diamonds-ready", label: "Do you have 5 Prismatic Diamonds ready?", manual: true },
          { id: "ipnysh-blessing-ready", label: "Do you have 1 Ipnysh Starlight Blessing ready?", manual: true },
          { id: "crafted-item", label: "Erenor Flame, Wave, or Lightning Lunafrost crafted", manual: true }
        ]
      }
    ]
  },
  "erenor-gale-life-typhoon-lunafrost": {
    title: "Erenor Gale, Life, Typhoon Lunafrost Craft Guide",
    proficiency: { skill: "Alchemy", required: 70000 },
    steps: [
      {
        id: "deeply-colored-oil",
        title: "Make 3 Deeply Colored Oil",
        body: "Craft Deeply Colored Oil first: each one uses 3 Dragon Essence Stabilizers, 50 Quinoa, 50 Cultivated Ginseng, 10 Sparkling Shell Dust, and 10 Coconut.",
        checks: [
          { id: "dragon-stabilizer", label: "Do you have 9 Dragon Essence Stabilizers?", item: "Dragon Essence Stabilizer", qty: 9 },
          { id: "quinoa", label: "Do you have 150 Quinoa?", item: "Quinoa", qty: 150 },
          { id: "cultivated-ginseng", label: "Do you have 150 Cultivated Ginseng?", item: "Cultivated Ginseng", qty: 150 },
          { id: "shell-dust", label: "Do you have 30 Sparkling Shell Dust?", item: "Sparkling Shell Dust", qty: 30 },
          { id: "coconut", label: "Do you have 30 Coconut?", item: "Coconut", qty: 30 },
          { id: "crafted-deeply-colored-oil", label: "3 Deeply Colored Oil crafted", manual: true }
        ]
      },
      {
        id: "lunarite",
        title: "Make 4,500 Lunarite",
        body: "Prepare the base Lunarite. The chain starts here: 5 Lunarite makes 1 Fine Lunarite.",
        checks: [
          { id: "moonlight-dust", label: "Do you have 150 Moonlight Archeum Dust?", item: "Moonlight Archeum Dust", qty: 150 },
          { id: "garden-powder", label: "Do you have 150 Mysterious Garden Powder?", item: "Mysterious Garden Powder", qty: 150 },
          { id: "crafted-lunarite", label: "4,500 Lunarite crafted", manual: true }
        ]
      },
      {
        id: "fine-lunarite",
        title: "Upgrade 4,500 Lunarite into 900 Fine Lunarite",
        body: "Use 5 Lunarite to make 1 Fine Lunarite.",
        checks: [
          { id: "lunarite-ready", label: "Do you have 4,500 Lunarite ready?", manual: true },
          { id: "crafted-fine-lunarite", label: "900 Fine Lunarite crafted", manual: true }
        ]
      },
      {
        id: "superior-lunarite",
        title: "Upgrade 900 Fine Lunarite into 300 Superior Lunarite",
        body: "Use 3 Fine Lunarite to make 1 Superior Lunarite.",
        checks: [
          { id: "fine-lunarite-ready", label: "Do you have 900 Fine Lunarite ready?", manual: true },
          { id: "crafted-superior-lunarite", label: "300 Superior Lunarite crafted", manual: true }
        ]
      },
      {
        id: "prime-lunarite",
        title: "Upgrade 300 Superior Lunarite into 100 Prime Lunarite",
        body: "Use 3 Superior Lunarite to make 1 Prime Lunarite.",
        checks: [
          { id: "superior-lunarite-ready", label: "Do you have 300 Superior Lunarite ready?", manual: true },
          { id: "crafted-prime-lunarite", label: "100 Prime Lunarite crafted", manual: true }
        ]
      },
      {
        id: "prismatic-diamonds",
        title: "Make 5 Prismatic Diamonds",
        body: "Confirm the six gem stacks for the Prismatic Diamonds.",
        checks: [
          { id: "diamond", label: "Do you have 5 Diamond?", item: "Diamond", qty: 5 },
          { id: "ruby", label: "Do you have 5 Ruby?", item: "Ruby", qty: 5 },
          { id: "sapphire", label: "Do you have 5 Sapphire?", item: "Sapphire", qty: 5 },
          { id: "amethyst", label: "Do you have 5 Amethyst?", item: "Amethyst", qty: 5 },
          { id: "emerald", label: "Do you have 5 Emerald?", item: "Emerald", qty: 5 },
          { id: "topaz", label: "Do you have 5 Topaz?", item: "Topaz", qty: 5 },
          { id: "crafted-prismatic-diamonds", label: "5 Prismatic Diamonds crafted", manual: true }
        ]
      },
      {
        id: "ipnysh-starlight-blessing",
        title: "Make 1 Ipnysh Starlight Blessing",
        body: "Gather the Ipnysh blessing materials from the verified list.",
        checks: [
          { id: "acidic-pouches", label: "Do you have 4 Acidic Poison Pouches?", item: "Acidic Poison Pouch", qty: 4 },
          { id: "cursed-pieces", label: "Do you have 4 Cursed Armor Pieces?", item: "Cursed Armor Piece", qty: 4 },
          { id: "dragon-stabilizer", label: "Do you have 50 Dragon Essence Stabilizers?", item: "Dragon Essence Stabilizer", qty: 50 },
          { id: "crafted-ipnysh-blessing", label: "1 Ipnysh Starlight Blessing crafted", manual: true }
        ]
      },
      {
        id: "final-materials",
        title: "Gather Final Lunafrost Inputs",
        body: "These are the remaining materials shown on the verified sheet before the final craft.",
        checks: [
          { id: "book-of-auroria", label: "Do you have 8 Book of Auroria?", item: "Book of Auroria", qty: 8 }
        ]
      },
      {
        id: "final-craft",
        title: "Craft the Lunafrost",
        body: "Finish the chain into the Erenor Gale, Life, or Typhoon Lunafrost.",
        checks: [
          { id: "proficiency", label: "Alchemy proficiency is 70,000 or higher", proficiency: "Alchemy", qty: 70000 },
          { id: "deeply-colored-oil-ready", label: "Do you have 3 Deeply Colored Oil ready?", manual: true },
          { id: "prime-lunarite-ready", label: "Do you have 100 Prime Lunarite ready?", manual: true },
          { id: "prismatic-diamonds-ready", label: "Do you have 5 Prismatic Diamonds ready?", manual: true },
          { id: "ipnysh-blessing-ready", label: "Do you have 1 Ipnysh Starlight Blessing ready?", manual: true },
          { id: "crafted-item", label: "Erenor Gale, Life, or Typhoon Lunafrost crafted", manual: true }
        ]
      }
    ]
  },
  "erenor-earth-ocean-lunafrost": {
    title: "Erenor Earth, Ocean Lunafrost Craft Guide",
    proficiency: { skill: "Alchemy", required: 70000 },
    steps: [
      {
        id: "scented-petal-pigment",
        title: "Make 3 Scented Petal Pigment",
        body: "Craft Scented Petal Pigment first: each one uses 3 Dragon Essence Stabilizers, 50 Poppy, 50 Saffron, 10 Sparkling Shell Dust, and 10 Chestnut.",
        checks: [
          { id: "dragon-stabilizer", label: "Do you have 9 Dragon Essence Stabilizers?", item: "Dragon Essence Stabilizer", qty: 9 },
          { id: "chestnut", label: "Do you have 30 Chestnut?", item: "Chestnut", qty: 30 },
          { id: "poppy", label: "Do you have 150 Poppy?", item: "Poppy", qty: 150 },
          { id: "saffron", label: "Do you have 150 Saffron?", item: "Saffron", qty: 150 },
          { id: "shell-dust", label: "Do you have 30 Sparkling Shell Dust?", item: "Sparkling Shell Dust", qty: 30 },
          { id: "crafted-scented-petal-pigment", label: "3 Scented Petal Pigment crafted", manual: true }
        ]
      },
      {
        id: "lunarite",
        title: "Make 4,500 Lunarite",
        body: "Prepare the base Lunarite. The chain starts here: 5 Lunarite makes 1 Fine Lunarite.",
        checks: [
          { id: "moonlight-dust", label: "Do you have 150 Moonlight Archeum Dust?", item: "Moonlight Archeum Dust", qty: 150 },
          { id: "garden-powder", label: "Do you have 150 Mysterious Garden Powder?", item: "Mysterious Garden Powder", qty: 150 },
          { id: "crafted-lunarite", label: "4,500 Lunarite crafted", manual: true }
        ]
      },
      {
        id: "fine-lunarite",
        title: "Upgrade 4,500 Lunarite into 900 Fine Lunarite",
        body: "Use 5 Lunarite to make 1 Fine Lunarite.",
        checks: [
          { id: "lunarite-ready", label: "Do you have 4,500 Lunarite ready?", manual: true },
          { id: "crafted-fine-lunarite", label: "900 Fine Lunarite crafted", manual: true }
        ]
      },
      {
        id: "superior-lunarite",
        title: "Upgrade 900 Fine Lunarite into 300 Superior Lunarite",
        body: "Use 3 Fine Lunarite to make 1 Superior Lunarite.",
        checks: [
          { id: "fine-lunarite-ready", label: "Do you have 900 Fine Lunarite ready?", manual: true },
          { id: "crafted-superior-lunarite", label: "300 Superior Lunarite crafted", manual: true }
        ]
      },
      {
        id: "prime-lunarite",
        title: "Upgrade 300 Superior Lunarite into 100 Prime Lunarite",
        body: "Use 3 Superior Lunarite to make 1 Prime Lunarite.",
        checks: [
          { id: "superior-lunarite-ready", label: "Do you have 300 Superior Lunarite ready?", manual: true },
          { id: "crafted-prime-lunarite", label: "100 Prime Lunarite crafted", manual: true }
        ]
      },
      {
        id: "prismatic-diamonds",
        title: "Make 5 Prismatic Diamonds",
        body: "Confirm the six gem stacks for the Prismatic Diamonds.",
        checks: [
          { id: "diamond", label: "Do you have 5 Diamond?", item: "Diamond", qty: 5 },
          { id: "ruby", label: "Do you have 5 Ruby?", item: "Ruby", qty: 5 },
          { id: "sapphire", label: "Do you have 5 Sapphire?", item: "Sapphire", qty: 5 },
          { id: "amethyst", label: "Do you have 5 Amethyst?", item: "Amethyst", qty: 5 },
          { id: "emerald", label: "Do you have 5 Emerald?", item: "Emerald", qty: 5 },
          { id: "topaz", label: "Do you have 5 Topaz?", item: "Topaz", qty: 5 },
          { id: "crafted-prismatic-diamonds", label: "5 Prismatic Diamonds crafted", manual: true }
        ]
      },
      {
        id: "ipnysh-starlight-blessing",
        title: "Make 1 Ipnysh Starlight Blessing",
        body: "Gather the Ipnysh blessing materials from the verified list.",
        checks: [
          { id: "acidic-pouches", label: "Do you have 4 Acidic Poison Pouches?", item: "Acidic Poison Pouch", qty: 4 },
          { id: "cursed-pieces", label: "Do you have 4 Cursed Armor Pieces?", item: "Cursed Armor Piece", qty: 4 },
          { id: "dragon-stabilizer", label: "Do you have 50 Dragon Essence Stabilizers?", item: "Dragon Essence Stabilizer", qty: 50 },
          { id: "crafted-ipnysh-blessing", label: "1 Ipnysh Starlight Blessing crafted", manual: true }
        ]
      },
      {
        id: "final-materials",
        title: "Gather Final Lunafrost Inputs",
        body: "These are the remaining materials shown on the verified sheet before the final craft.",
        checks: [
          { id: "book-of-auroria", label: "Do you have 8 Book of Auroria?", item: "Book of Auroria", qty: 8 }
        ]
      },
      {
        id: "final-craft",
        title: "Craft the Lunafrost",
        body: "Finish the chain into the Erenor Earth or Ocean Lunafrost.",
        checks: [
          { id: "proficiency", label: "Alchemy proficiency is 70,000 or higher", proficiency: "Alchemy", qty: 70000 },
          { id: "scented-petal-pigment-ready", label: "Do you have 3 Scented Petal Pigment ready?", manual: true },
          { id: "prime-lunarite-ready", label: "Do you have 100 Prime Lunarite ready?", manual: true },
          { id: "prismatic-diamonds-ready", label: "Do you have 5 Prismatic Diamonds ready?", manual: true },
          { id: "ipnysh-blessing-ready", label: "Do you have 1 Ipnysh Starlight Blessing ready?", manual: true },
          { id: "crafted-item", label: "Erenor Earth or Ocean Lunafrost crafted", manual: true }
        ]
      }
    ]
  },
  "erenor-bow-scepter-staff": {
    title: "Erenor Bow, Scepter, Staff Craft Guide",
    proficiency: { skill: "Carpentry", required: 180000 },
    steps: [
      {
        id: "small-seed-oil",
        title: "Make 1,700 Small Seed Oil",
        body: "Make Small Seed Oil at an Alchemy Table, or use the Multipurpose Workbench batch craft. The ratio is 3 Onyx Archeum Essence, 20 Rice, and 20 Corn per oil.",
        checks: [
          { id: "onyx", label: "Do you have 5,100 Onyx Archeum Essence?", item: "Onyx Archeum Essence", qty: 5100 },
          { id: "rice", label: "Do you have 34,000 Rice?", item: "Rice", qty: 34000 },
          { id: "corn", label: "Do you have 34,000 Corn?", item: "Corn", qty: 34000 },
          { id: "crafted-small-seed-oil", label: "1,700 Small Seed Oil crafted", manual: true }
        ]
      },
      {
        id: "fine-lumber",
        title: "Make 1,700 Fine Lumber",
        body: "Craft at a Sawmill Station. Each Fine Lumber uses 10 Lumber and 1 Small Seed Oil.",
        labor: { skill: "Carpentry", baseEach: 12, qty: 1700 },
        checks: [
          { id: "lumber", label: "Do you have 17,000 Lumber?", item: "Lumber", qty: 17000 },
          { id: "crafted-fine-lumber", label: "1,700 Fine Lumber crafted", manual: true }
        ]
      },
      {
        id: "viscous-glossy-oil",
        title: "Make 170 Viscous Glossy Oil",
        body: "Make Viscous Glossy Oil for the Nuri Forest Lumber chain.",
        checks: [
          { id: "onyx", label: "Do you have 850 Onyx Archeum Essence?", item: "Onyx Archeum Essence", qty: 850 },
          { id: "peanut", label: "Do you have 5,100 Peanut?", item: "Peanut", qty: 5100 },
          { id: "wheat", label: "Do you have 5,100 Wheat?", item: "Wheat", qty: 5100 },
          { id: "red-coral", label: "Do you have 3,400 Red Coral?", item: "Red Coral", qty: 3400 },
          { id: "crafted-viscous-glossy-oil", label: "170 Viscous Glossy Oil crafted", manual: true }
        ]
      },
      {
        id: "nuri-forest-lumber",
        title: "Make 170 Nuri Forest Lumber",
        body: "Craft at a Sawmill Station. Each Nuri Forest Lumber uses 10 Fine Lumber, 5 Mysterious Garden Powder, and 1 Viscous Glossy Oil.",
        labor: { skill: "Carpentry", baseEach: 23, qty: 170 },
        checks: [
          { id: "fine-lumber-ready", label: "Do you have 1,700 Fine Lumber ready?", manual: true },
          { id: "garden-powder", label: "Do you have 850 Mysterious Garden Powder?", item: "Mysterious Garden Powder", qty: 850 },
          { id: "viscous-glossy-oil-ready", label: "Do you have 170 Viscous Glossy Oil ready?", manual: true },
          { id: "crafted-nuri-lumber", label: "170 Nuri Forest Lumber crafted", manual: true }
        ]
      },
      {
        id: "blazing-nuri-forest-lumber",
        title: "Make 17 Blazing Nuri Forest Lumber",
        body: "Craft at a Sawmill Station. Each Blazing Nuri Forest Lumber uses 10 Nuri Forest Lumber, 9 Anya Ingots, 25 Dragon Essence Stabilizers, and 6 Flaming Logs.",
        labor: { skill: "Carpentry", baseEach: 117, qty: 17 },
        checks: [
          { id: "nuri-lumber-ready", label: "Do you have 170 Nuri Forest Lumber ready?", manual: true },
          { id: "anya-ingot", label: "Do you have 153 Anya Ingots?", item: "Anya Ingot", qty: 153 },
          { id: "flaming-log", label: "Do you have 102 Flaming Logs?", item: "Flaming Log", qty: 102 },
          { id: "dragon-stabilizer", label: "Do you have 425 Dragon Essence Stabilizers?", item: "Dragon Essence Stabilizer", qty: 425 },
          { id: "crafted-blazing-nuri-lumber", label: "17 Blazing Nuri Forest Lumber crafted", manual: true }
        ]
      },
      {
        id: "weapon-regrade-scrolls",
        title: "Make 10 Weapon Regrade Scrolls",
        body: "Craft the weapon scrolls shown on the verified sheet.",
        checks: [
          { id: "sunpoint", label: "Do you have 10 Sunpoints?", item: "Sunpoint", qty: 10 },
          { id: "blank-scroll", label: "Do you have 10 Blank Regrade Scrolls?", item: "Blank Regrade Scroll", qty: 10 },
          { id: "crafted-scrolls", label: "10 Weapon Regrade Scrolls crafted", manual: true }
        ]
      },
      {
        id: "ipnysh-sunlight-blessing",
        title: "Make 1 Ipnysh Sunlight Blessing",
        body: "Gather the Ipnysh blessing materials from the verified list.",
        checks: [
          { id: "acidic-pouches", label: "Do you have 4 Acidic Poison Pouches?", item: "Acidic Poison Pouch", qty: 4 },
          { id: "cursed-pieces", label: "Do you have 4 Cursed Armor Pieces?", item: "Cursed Armor Piece", qty: 4 },
          { id: "crafted-ipnysh-blessing", label: "1 Ipnysh Sunlight Blessing crafted", manual: true }
        ]
      },
      {
        id: "final-materials",
        title: "Gather Final Weapon Inputs",
        body: "Confirm the final direct materials before crafting the weapon.",
        checks: [
          { id: "sunlight-essence", label: "Do you have 172 Sunlight Archeum Essence?", item: "Sunlight Archeum Essence", qty: 172 },
          { id: "archeum-ingot", label: "Do you have 132 Archeum Ingots?", item: "Archeum Ingot", qty: 132 }
        ]
      },
      {
        id: "final-craft",
        title: "Craft at an Armorer's House",
        body: "Proceed to an Armorer's House of your choosing and make the Erenor Bow, Scepter, or Staff.",
        checks: [
          { id: "proficiency", label: "Carpentry proficiency is 180,000 or higher", proficiency: "Carpentry", qty: 180000 },
          { id: "blazing-nuri-ready", label: "Do you have 17 Blazing Nuri Forest Lumber ready?", manual: true },
          { id: "scrolls-ready", label: "Do you have 10 Weapon Regrade Scrolls ready?", manual: true },
          { id: "ipnysh-blessing-ready", label: "Do you have 1 Ipnysh Sunlight Blessing ready?", manual: true },
          { id: "at-armorer-house", label: "I am at the Armorer's House and ready to craft", manual: true },
          { id: "crafted-item", label: "Erenor Bow, Scepter, or Staff crafted", manual: true }
        ]
      }
    ]
  },
  "erenor-shield": {
    title: "Erenor Shield Craft Guide",
    proficiency: { skill: "Weaponry", required: 180000 },
    steps: [
      {
        id: "small-seed-oil",
        title: "Make 1,700 Small Seed Oil",
        body: "Make Small Seed Oil at an Alchemy Table, or use the Multipurpose Workbench batch craft. The ratio is 3 Onyx Archeum Essence, 20 Rice, and 20 Corn per oil.",
        checks: [
          { id: "onyx", label: "Do you have 5,100 Onyx Archeum Essence?", item: "Onyx Archeum Essence", qty: 5100 },
          { id: "rice", label: "Do you have 34,000 Rice?", item: "Rice", qty: 34000 },
          { id: "corn", label: "Do you have 34,000 Corn?", item: "Corn", qty: 34000 },
          { id: "crafted-small-seed-oil", label: "1,700 Small Seed Oil crafted", manual: true }
        ]
      },
      {
        id: "fine-lumber",
        title: "Make 1,700 Fine Lumber",
        body: "Craft at a Sawmill Station. Each Fine Lumber uses 10 Lumber and 1 Small Seed Oil.",
        labor: { skill: "Carpentry", baseEach: 12, qty: 1700 },
        checks: [
          { id: "lumber", label: "Do you have 17,000 Lumber?", item: "Lumber", qty: 17000 },
          { id: "crafted-fine-lumber", label: "1,700 Fine Lumber crafted", manual: true }
        ]
      },
      {
        id: "viscous-glossy-oil",
        title: "Make 170 Viscous Glossy Oil",
        body: "Make Viscous Glossy Oil for the Nuri Forest Lumber chain.",
        checks: [
          { id: "onyx", label: "Do you have 850 Onyx Archeum Essence?", item: "Onyx Archeum Essence", qty: 850 },
          { id: "peanut", label: "Do you have 5,100 Peanut?", item: "Peanut", qty: 5100 },
          { id: "wheat", label: "Do you have 5,100 Wheat?", item: "Wheat", qty: 5100 },
          { id: "red-coral", label: "Do you have 3,400 Red Coral?", item: "Red Coral", qty: 3400 },
          { id: "crafted-viscous-glossy-oil", label: "170 Viscous Glossy Oil crafted", manual: true }
        ]
      },
      {
        id: "nuri-forest-lumber",
        title: "Make 170 Nuri Forest Lumber",
        body: "Craft at a Sawmill Station. Each Nuri Forest Lumber uses 10 Fine Lumber, 5 Mysterious Garden Powder, and 1 Viscous Glossy Oil.",
        labor: { skill: "Carpentry", baseEach: 23, qty: 170 },
        checks: [
          { id: "fine-lumber-ready", label: "Do you have 1,700 Fine Lumber ready?", manual: true },
          { id: "garden-powder", label: "Do you have 850 Mysterious Garden Powder?", item: "Mysterious Garden Powder", qty: 850 },
          { id: "viscous-glossy-oil-ready", label: "Do you have 170 Viscous Glossy Oil ready?", manual: true },
          { id: "crafted-nuri-lumber", label: "170 Nuri Forest Lumber crafted", manual: true }
        ]
      },
      {
        id: "blazing-nuri-forest-lumber",
        title: "Make 17 Blazing Nuri Forest Lumber",
        body: "Craft at a Sawmill Station. Each Blazing Nuri Forest Lumber uses 10 Nuri Forest Lumber, 9 Anya Ingots, 25 Dragon Essence Stabilizers, and 6 Flaming Logs.",
        labor: { skill: "Carpentry", baseEach: 117, qty: 17 },
        checks: [
          { id: "nuri-lumber-ready", label: "Do you have 170 Nuri Forest Lumber ready?", manual: true },
          { id: "anya-ingot", label: "Do you have 153 Anya Ingots?", item: "Anya Ingot", qty: 153 },
          { id: "flaming-log", label: "Do you have 102 Flaming Logs?", item: "Flaming Log", qty: 102 },
          { id: "dragon-stabilizer", label: "Do you have 425 Dragon Essence Stabilizers?", item: "Dragon Essence Stabilizer", qty: 425 },
          { id: "crafted-blazing-nuri-lumber", label: "17 Blazing Nuri Forest Lumber crafted", manual: true }
        ]
      },
      {
        id: "weapon-regrade-scrolls",
        title: "Make 10 Weapon Regrade Scrolls",
        body: "Craft the weapon scrolls shown on the verified sheet.",
        checks: [
          { id: "sunpoint", label: "Do you have 10 Sunpoints?", item: "Sunpoint", qty: 10 },
          { id: "blank-scroll", label: "Do you have 10 Blank Regrade Scrolls?", item: "Blank Regrade Scroll", qty: 10 },
          { id: "crafted-scrolls", label: "10 Weapon Regrade Scrolls crafted", manual: true }
        ]
      },
      {
        id: "ipnysh-sunlight-blessing",
        title: "Make 1 Ipnysh Sunlight Blessing",
        body: "Gather the Ipnysh blessing materials from the verified list.",
        checks: [
          { id: "acidic-pouches", label: "Do you have 4 Acidic Poison Pouches?", item: "Acidic Poison Pouch", qty: 4 },
          { id: "cursed-pieces", label: "Do you have 4 Cursed Armor Pieces?", item: "Cursed Armor Piece", qty: 4 },
          { id: "crafted-ipnysh-blessing", label: "1 Ipnysh Sunlight Blessing crafted", manual: true }
        ]
      },
      {
        id: "final-materials",
        title: "Gather Final Shield Inputs",
        body: "Confirm the final direct materials before crafting the shield.",
        checks: [
          { id: "sunlight-essence", label: "Do you have 172 Sunlight Archeum Essence?", item: "Sunlight Archeum Essence", qty: 172 },
          { id: "archeum-ingot", label: "Do you have 132 Archeum Ingots?", item: "Archeum Ingot", qty: 132 }
        ]
      },
      {
        id: "final-craft",
        title: "Craft at an Armorer's House",
        body: "Proceed to an Armorer's House of your choosing and make the Erenor Shield.",
        checks: [
          { id: "proficiency", label: "Weaponry proficiency is 180,000 or higher", proficiency: "Weaponry", qty: 180000 },
          { id: "blazing-nuri-ready", label: "Do you have 17 Blazing Nuri Forest Lumber ready?", manual: true },
          { id: "scrolls-ready", label: "Do you have 10 Weapon Regrade Scrolls ready?", manual: true },
          { id: "ipnysh-blessing-ready", label: "Do you have 1 Ipnysh Sunlight Blessing ready?", manual: true },
          { id: "at-armorer-house", label: "I am at the Armorer's House and ready to craft", manual: true },
          { id: "crafted-item", label: "Erenor Shield crafted", manual: true }
        ]
      }
    ]
  },
  "erenor-weapon-set": {
    title: "Erenor Weapon Set Craft Guide",
    proficiency: { skill: "Weaponry", required: 180000 },
    steps: [
      {
        id: "opaque-polish",
        title: "Make 1,700 Opaque Polish",
        body: "Start the polish chain from the verified weapon sheet.",
        checks: [
          { id: "oats", label: "Do you have 5,100 Oats?", item: "Oats", qty: 5100 },
          { id: "narcissus", label: "Do you have 34,000 Narcissus?", item: "Narcissus", qty: 34000 },
          { id: "lotus", label: "Do you have 5,100 Lotus?", item: "Lotus", qty: 5100 },
          { id: "azalea", label: "Do you have 34,000 Azalea?", item: "Azalea", qty: 34000 },
          { id: "crafted-opaque-polish", label: "1,700 Opaque Polish crafted", manual: true }
        ]
      },
      {
        id: "sturdy-ingot",
        title: "Make 1,700 Sturdy Ingot",
        body: "Craft at a Smelter. Each Sturdy Ingot uses 8 Iron Ingots, 1 Copper Ingot, 1 Silver Ingot, and 1 Opaque Polish.",
        labor: { skill: "Metalwork", baseEach: 11, qty: 1700 },
        checks: [
          { id: "iron-ingot", label: "Do you have 13,600 Iron Ingots?", item: "Iron Ingot", qty: 13600 },
          { id: "copper-ingot", label: "Do you have 1,700 Copper Ingots?", item: "Copper Ingot", qty: 1700 },
          { id: "silver-ingot", label: "Do you have 1,700 Silver Ingots?", item: "Silver Ingot", qty: 1700 },
          { id: "opaque-polish-ready", label: "Do you have 1,700 Opaque Polish ready?", manual: true },
          { id: "crafted-sturdy-ingot", label: "1,700 Sturdy Ingot crafted", manual: true }
        ]
      },
      {
        id: "rough-polish",
        title: "Make 170 Rough Polish",
        body: "Upgrade the Opaque Polish into Rough Polish.",
        checks: [
          { id: "opaque-polish-ready", label: "Do you have 1,700 Opaque Polish ready?", manual: true },
          { id: "crafted-rough-polish", label: "170 Rough Polish crafted", manual: true }
        ]
      },
      {
        id: "sunridge-ingot",
        title: "Make 170 Sunridge Ingot",
        body: "Craft at a Smelter. Each Sunridge Ingot uses 10 Sturdy Ingots, 5 Mysterious Garden Powder, and 1 Rough Polish.",
        labor: { skill: "Metalwork", baseEach: 21, qty: 170 },
        checks: [
          { id: "sturdy-ingot-ready", label: "Do you have 1,700 Sturdy Ingot ready?", manual: true },
          { id: "garden-powder", label: "Do you have 850 Mysterious Garden Powder?", item: "Mysterious Garden Powder", qty: 850 },
          { id: "rough-polish-ready", label: "Do you have 170 Rough Polish ready?", manual: true },
          { id: "crafted-sunridge-ingot", label: "170 Sunridge Ingot crafted", manual: true }
        ]
      },
      {
        id: "blazing-sunridge-ingot",
        title: "Make 17 Blazing Sunridge Ingot",
        body: "Craft at a Smelter. Each Blazing Sunridge Ingot uses 10 Sunridge Ingots, 9 Anya Ingots, 25 Dragon Essence Stabilizers, and 6 Flaming Logs.",
        labor: { skill: "Metalwork", baseEach: 106, qty: 17 },
        checks: [
          { id: "sunridge-ingot-ready", label: "Do you have 170 Sunridge Ingot ready?", manual: true },
          { id: "anya-ingot", label: "Do you have 153 Anya Ingots?", item: "Anya Ingot", qty: 153 },
          { id: "flaming-log", label: "Do you have 102 Flaming Logs?", item: "Flaming Log", qty: 102 },
          { id: "dragon-stabilizer", label: "Do you have 425 Dragon Essence Stabilizers?", item: "Dragon Essence Stabilizer", qty: 425 },
          { id: "crafted-blazing-sunridge-ingot", label: "17 Blazing Sunridge Ingot crafted", manual: true }
        ]
      },
      {
        id: "weapon-regrade-scrolls",
        title: "Make 10 Weapon Regrade Scrolls",
        body: "Craft the weapon scrolls shown on the verified sheet.",
        checks: [
          { id: "sunpoint", label: "Do you have 10 Sunpoints?", item: "Sunpoint", qty: 10 },
          { id: "blank-scroll", label: "Do you have 10 Blank Regrade Scrolls?", item: "Blank Regrade Scroll", qty: 10 },
          { id: "crafted-scrolls", label: "10 Weapon Regrade Scrolls crafted", manual: true }
        ]
      },
      {
        id: "ipnysh-sunlight-blessing",
        title: "Make 1 Ipnysh Sunlight Blessing",
        body: "Gather the Ipnysh blessing materials from the verified list.",
        checks: [
          { id: "acidic-pouches", label: "Do you have 4 Acidic Poison Pouches?", item: "Acidic Poison Pouch", qty: 4 },
          { id: "cursed-pieces", label: "Do you have 4 Cursed Armor Pieces?", item: "Cursed Armor Piece", qty: 4 },
          { id: "crafted-ipnysh-blessing", label: "1 Ipnysh Sunlight Blessing crafted", manual: true }
        ]
      },
      {
        id: "final-materials",
        title: "Gather Final Weapon Inputs",
        body: "Confirm the final direct materials before crafting the weapon.",
        checks: [
          { id: "sunlight-essence", label: "Do you have 172 Sunlight Archeum Essence?", item: "Sunlight Archeum Essence", qty: 172 },
          { id: "archeum-ingot", label: "Do you have 132 Archeum Ingots?", item: "Archeum Ingot", qty: 132 }
        ]
      },
      {
        id: "final-craft",
        title: "Craft at an Armorer's House",
        body: "Proceed to an Armorer's House of your choosing and make the selected Erenor weapon.",
        checks: [
          { id: "proficiency", label: "Weaponry proficiency is 180,000 or higher", proficiency: "Weaponry", qty: 180000 },
          { id: "blazing-sunridge-ready", label: "Do you have 17 Blazing Sunridge Ingots ready?", manual: true },
          { id: "scrolls-ready", label: "Do you have 10 Weapon Regrade Scrolls ready?", manual: true },
          { id: "ipnysh-blessing-ready", label: "Do you have 1 Ipnysh Sunlight Blessing ready?", manual: true },
          { id: "at-armorer-house", label: "I am at the Armorer's House and ready to craft", manual: true },
          { id: "crafted-item", label: "Erenor weapon crafted", manual: true }
        ]
      }
    ]
  },
  "full-plate-set": {
    title: "Full Plate Set Craft Guide",
    proficiency: { skill: "Metalwork", required: 180000 },
    steps: [
      {
        id: "opaque-polish",
        title: "Make 7,600 Opaque Polish",
        body: "Start the polish chain from the verified armor sheet.",
        checks: [
          { id: "oats", label: "Do you have 22,800 Oats?", item: "Oats", qty: 22800 },
          { id: "narcissus", label: "Do you have 152,000 Narcissus?", item: "Narcissus", qty: 152000 },
          { id: "lotus", label: "Do you have 22,800 Lotus?", item: "Lotus", qty: 22800 },
          { id: "azalea", label: "Do you have 152,000 Azalea?", item: "Azalea", qty: 152000 },
          { id: "crafted-opaque-polish", label: "7,600 Opaque Polish crafted", manual: true }
        ]
      },
      {
        id: "rough-polish",
        title: "Make 760 Rough Polish",
        body: "Upgrade the Opaque Polish into Rough Polish.",
        checks: [
          { id: "opaque-polish-ready", label: "Do you have 7,600 Opaque Polish ready?", manual: true },
          { id: "cactus", label: "Do you have 12,250 Cactus?", item: "Cactus", qty: 12250 },
          { id: "beechnut", label: "Do you have 2,450 Beechnut?", item: "Beechnut", qty: 2450 },
          { id: "crafted-rough-polish", label: "760 Rough Polish crafted", manual: true }
        ]
      },
      {
        id: "non-stick-polish",
        title: "Make 245 Non-Stick Polish",
        body: "Finish the polish chain for the plate set.",
        checks: [
          { id: "rough-polish-ready", label: "Do you have 760 Rough Polish ready?", manual: true },
          { id: "turmeric", label: "Do you have 12,250 Turmeric?", item: "Turmeric", qty: 12250 },
          { id: "crafted-non-stick-polish", label: "245 Non-Stick Polish crafted", manual: true }
        ]
      },
      {
        id: "sturdy-ingot",
        title: "Make 7,600 Sturdy Ingot",
        body: "Prepare the ingot chain for Sunridge Ingots.",
        checks: [
          { id: "iron-ingot", label: "Do you have 60,800 Iron Ingots?", item: "Iron Ingot", qty: 60800 },
          { id: "copper-ingot", label: "Do you have 7,600 Copper Ingots?", item: "Copper Ingot", qty: 7600 },
          { id: "crafted-sturdy-ingot", label: "7,600 Sturdy Ingot crafted", manual: true }
        ]
      },
      {
        id: "sunridge-ingot",
        title: "Make 760 Sunridge Ingot",
        body: "Combine Sturdy Ingots, Anya Ingots, and Non-Stick Polish.",
        checks: [
          { id: "sturdy-ingot-ready", label: "Do you have 7,600 Sturdy Ingot ready?", manual: true },
          { id: "anya-ingot", label: "Do you have 684 Anya Ingots?", item: "Anya Ingot", qty: 684 },
          { id: "non-stick-polish-ready", label: "Do you have 245 Non-Stick Polish ready?", manual: true },
          { id: "crafted-sunridge-ingot", label: "760 Sunridge Ingot crafted", manual: true }
        ]
      },
      {
        id: "blazing-sunridge-ingot",
        title: "Make 76 Blazing Sunridge Ingot",
        body: "Upgrade the Sunridge Ingots into Blazing Sunridge Ingots.",
        checks: [
          { id: "sunridge-ingot-ready", label: "Do you have 760 Sunridge Ingot ready?", manual: true },
          { id: "silver-ingot", label: "Do you have 7,600 Silver Ingots?", item: "Silver Ingot", qty: 7600 },
          { id: "flaming-log", label: "Do you have 456 Flaming Logs?", item: "Flaming Log", qty: 456 },
          { id: "antler-coral", label: "Do you have 15,200 Antler Coral?", item: "Antler Coral", qty: 15200 },
          { id: "garden-powder", label: "Do you have 3,800 Mysterious Garden Powder?", item: "Mysterious Garden Powder", qty: 3800 },
          { id: "onyx", label: "Do you have 26,600 Onyx Archeum Essence?", item: "Onyx Archeum Essence", qty: 26600 },
          { id: "crafted-blazing-sunridge-ingot", label: "76 Blazing Sunridge Ingot crafted", manual: true }
        ]
      },
      {
        id: "armor-regrade-scrolls",
        title: "Make 70 Armor Regrade Scrolls",
        body: "Craft the armor scrolls shown on the verified sheet.",
        checks: [
          { id: "moonpoint", label: "Do you have 70 Moonpoints?", item: "Moonpoint", qty: 70 },
          { id: "blank-scroll", label: "Do you have 70 Blank Regrade Scrolls?", item: "Blank Regrade Scroll", qty: 70 },
          { id: "crafted-scrolls", label: "70 Armor Regrade Scrolls crafted", manual: true }
        ]
      },
      {
        id: "ipnysh-moonlight-blessings",
        title: "Make 7 Ipnysh Moonlight Blessings",
        body: "Gather the Ipnysh blessing materials for the full plate set.",
        checks: [
          { id: "sparkling-shell-dust", label: "Do you have 2,450 Sparkling Shell Dust?", item: "Sparkling Shell Dust", qty: 2450 },
          { id: "acidic-pouches", label: "Do you have 28 Acidic Poison Pouches?", item: "Acidic Poison Pouch", qty: 28 },
          { id: "cursed-pieces", label: "Do you have 28 Cursed Armor Pieces?", item: "Cursed Armor Piece", qty: 28 },
          { id: "dragon-stabilizer", label: "Do you have 2,985 Dragon Essence Stabilizers?", item: "Dragon Essence Stabilizer", qty: 2985 },
          { id: "crafted-ipnysh-blessings", label: "7 Ipnysh Moonlight Blessings crafted", manual: true }
        ]
      },
      {
        id: "final-materials",
        title: "Gather Final Plate Inputs",
        body: "Confirm the final direct materials before crafting the plate set.",
        checks: [
          { id: "moonlight-essence", label: "Do you have 605 Moonlight Archeum Essence?", item: "Moonlight Archeum Essence", qty: 605 }
        ]
      },
      {
        id: "final-craft",
        title: "Craft at an Armorer's House",
        body: "Proceed to an Armorer's House of your choosing and make the Full Plate Set.",
        checks: [
          { id: "proficiency", label: "Metalwork proficiency is 180,000 or higher", proficiency: "Metalwork", qty: 180000 },
          { id: "blazing-sunridge-ready", label: "Do you have 76 Blazing Sunridge Ingots ready?", manual: true },
          { id: "scrolls-ready", label: "Do you have 70 Armor Regrade Scrolls ready?", manual: true },
          { id: "ipnysh-blessings-ready", label: "Do you have 7 Ipnysh Moonlight Blessings ready?", manual: true },
          { id: "at-armorer-house", label: "I am at the Armorer's House and ready to craft", manual: true },
          { id: "crafted-item", label: "Full Plate Set crafted", manual: true }
        ]
      }
    ]
  },
  "full-leather-set": {
    title: "Full Leather Set Craft Guide",
    proficiency: { skill: "Leatherwork", required: 180000 },
    steps: [
      {
        id: "small-seed-oil",
        title: "Make 7,600 Small Seed Oil",
        body: "Make Small Seed Oil at an Alchemy Table, or use the Multipurpose Workbench batch craft. The ratio is 3 Onyx Archeum Essence, 20 Rice, and 20 Corn per oil.",
        checks: [
          { id: "onyx", label: "Do you have 22,800 Onyx Archeum Essence?", item: "Onyx Archeum Essence", qty: 22800 },
          { id: "rice", label: "Do you have 152,000 Rice?", item: "Rice", qty: 152000 },
          { id: "corn", label: "Do you have 152,000 Corn?", item: "Corn", qty: 152000 },
          { id: "crafted-small-seed-oil", label: "7,600 Small Seed Oil crafted", manual: true }
        ]
      },
      {
        id: "viscous-glossy-oil",
        title: "Make 760 Viscous Glossy Oil",
        body: "Make Viscous Glossy Oil for the Wind Spirit Leather chain.",
        checks: [
          { id: "onyx", label: "Do you have 3,800 Onyx Archeum Essence?", item: "Onyx Archeum Essence", qty: 3800 },
          { id: "peanut", label: "Do you have 22,800 Peanut?", item: "Peanut", qty: 22800 },
          { id: "wheat", label: "Do you have 22,800 Wheat?", item: "Wheat", qty: 22800 },
          { id: "red-coral", label: "Do you have 15,200 Red Coral?", item: "Red Coral", qty: 15200 },
          { id: "crafted-viscous-glossy-oil", label: "760 Viscous Glossy Oil crafted", manual: true }
        ]
      },
      {
        id: "deeply-colored-oil",
        title: "Make 245 Deeply Colored Oil",
        body: "Craft Deeply Colored Oil for the final leather crafts.",
        checks: [
          { id: "dragon-stabilizer", label: "Do you have 735 Dragon Essence Stabilizers?", item: "Dragon Essence Stabilizer", qty: 735 },
          { id: "quinoa", label: "Do you have 12,250 Quinoa?", item: "Quinoa", qty: 12250 },
          { id: "cultivated-ginseng", label: "Do you have 12,250 Cultivated Ginseng?", item: "Cultivated Ginseng", qty: 12250 },
          { id: "shell-dust", label: "Do you have 2,450 Sparkling Shell Dust?", item: "Sparkling Shell Dust", qty: 2450 },
          { id: "coconut", label: "Do you have 2,450 Coconut?", item: "Coconut", qty: 2450 },
          { id: "crafted-deeply-colored-oil", label: "245 Deeply Colored Oil crafted", manual: true }
        ]
      },
      {
        id: "fine-leather",
        title: "Make 7,600 Fine Leather",
        body: "Craft at a Leather Workbench. Each Fine Leather uses 10 Leather and 1 Small Seed Oil.",
        labor: { skill: "Leatherwork", baseEach: 11, qty: 7600 },
        checks: [
          { id: "leather", label: "Do you have 76,000 Leather?", item: "Leather", qty: 76000 },
          { id: "small-seed-oil-ready", label: "Do you have 7,600 Small Seed Oil ready?", manual: true },
          { id: "crafted-fine-leather", label: "7,600 Fine Leather crafted", manual: true }
        ]
      },
      {
        id: "wind-spirit-leather",
        title: "Make 760 Wind Spirit Leather",
        body: "Craft at a Leather Workbench. Each Wind Spirit Leather uses 10 Fine Leather, 5 Mysterious Garden Powder, and 1 Viscous Glossy Oil.",
        labor: { skill: "Leatherwork", baseEach: 21, qty: 760 },
        checks: [
          { id: "fine-leather-ready", label: "Do you have 7,600 Fine Leather ready?", manual: true },
          { id: "garden-powder", label: "Do you have 3,800 Mysterious Garden Powder?", item: "Mysterious Garden Powder", qty: 3800 },
          { id: "viscous-glossy-oil-ready", label: "Do you have 760 Viscous Glossy Oil ready?", manual: true },
          { id: "crafted-wind-spirit-leather", label: "760 Wind Spirit Leather crafted", manual: true }
        ]
      },
      {
        id: "blazing-wind-spirit-leather",
        title: "Make 76 Blazing Wind Spirit Leather",
        body: "Craft at a Leather Workbench. Each Blazing Wind Spirit Leather uses 10 Wind Spirit Leather, 9 Anya Ingots, 25 Dragon Essence Stabilizers, and 6 Flaming Logs.",
        labor: { skill: "Leatherwork", baseEach: 106, qty: 76 },
        checks: [
          { id: "wind-spirit-leather-ready", label: "Do you have 760 Wind Spirit Leather ready?", manual: true },
          { id: "anya-ingot", label: "Do you have 684 Anya Ingots?", item: "Anya Ingot", qty: 684 },
          { id: "flaming-log", label: "Do you have 456 Flaming Logs?", item: "Flaming Log", qty: 456 },
          { id: "dragon-stabilizer", label: "Do you have 1,900 Dragon Essence Stabilizers?", item: "Dragon Essence Stabilizer", qty: 1900 },
          { id: "crafted-blazing-wind-spirit-leather", label: "76 Blazing Wind Spirit Leather crafted", manual: true }
        ]
      },
      {
        id: "armor-regrade-scrolls",
        title: "Make 70 Armor Regrade Scrolls",
        body: "Craft the armor scrolls shown on the verified sheet.",
        checks: [
          { id: "moonpoint", label: "Do you have 70 Moonpoints?", item: "Moonpoint", qty: 70 },
          { id: "blank-scroll", label: "Do you have 70 Blank Regrade Scrolls?", item: "Blank Regrade Scroll", qty: 70 },
          { id: "crafted-scrolls", label: "70 Armor Regrade Scrolls crafted", manual: true }
        ]
      },
      {
        id: "ipnysh-moonlight-blessings",
        title: "Make 7 Ipnysh Moonlight Blessings",
        body: "Gather the Ipnysh blessing materials for the full leather set.",
        checks: [
          { id: "acidic-pouches", label: "Do you have 28 Acidic Poison Pouches?", item: "Acidic Poison Pouch", qty: 28 },
          { id: "cursed-pieces", label: "Do you have 28 Cursed Armor Pieces?", item: "Cursed Armor Piece", qty: 28 },
          { id: "dragon-stabilizer", label: "Do you have 350 Dragon Essence Stabilizers?", item: "Dragon Essence Stabilizer", qty: 350 },
          { id: "crafted-ipnysh-blessings", label: "7 Ipnysh Moonlight Blessings crafted", manual: true }
        ]
      },
      {
        id: "final-materials",
        title: "Gather Final Leather Inputs",
        body: "Confirm the final direct materials before crafting the leather set.",
        checks: [
          { id: "moonlight-essence", label: "Do you have 605 Moonlight Archeum Essence?", item: "Moonlight Archeum Essence", qty: 605 }
        ]
      },
      {
        id: "final-craft",
        title: "Craft at an Armorer's House",
        body: "Proceed to an Armorer's House of your choosing and make the Full Leather Set.",
        checks: [
          { id: "proficiency", label: "Leatherwork proficiency is 180,000 or higher", proficiency: "Leatherwork", qty: 180000 },
          { id: "blazing-leather-ready", label: "Do you have 76 Blazing Wind Spirit Leather ready?", manual: true },
          { id: "scrolls-ready", label: "Do you have 70 Armor Regrade Scrolls ready?", manual: true },
          { id: "ipnysh-blessings-ready", label: "Do you have 7 Ipnysh Moonlight Blessings ready?", manual: true },
          { id: "at-armorer-house", label: "I am at the Armorer's House and ready to craft", manual: true },
          { id: "crafted-item", label: "Full Leather Set crafted", manual: true }
        ]
      }
    ]
  },
  "full-cloth-set": {
    title: "Full Cloth Set Craft Guide",
    proficiency: { skill: "Tailoring", required: 180000 },
    steps: [
      {
        id: "small-root-pigment",
        title: "Make 7,600 Small Root Pigment",
        body: "Start the pigment chain from the verified cloth sheet.",
        checks: [
          { id: "cornflower", label: "Do you have 22,800 Cornflower?", item: "Cornflower", qty: 22800 },
          { id: "lily", label: "Do you have 22,800 Lily?", item: "Lily", qty: 22800 },
          { id: "crafted-small-root-pigment", label: "7,600 Small Root Pigment crafted", manual: true }
        ]
      },
      {
        id: "small-leaf-pigment",
        title: "Make 760 Small Leaf Pigment",
        body: "Upgrade the Small Root Pigment into Small Leaf Pigment.",
        checks: [
          { id: "small-root-pigment-ready", label: "Do you have 7,600 Small Root Pigment ready?", manual: true },
          { id: "clover", label: "Do you have 152,000 Clover?", item: "Clover", qty: 152000 },
          { id: "rose", label: "Do you have 152,000 Rose?", item: "Rose", qty: 152000 },
          { id: "crafted-small-leaf-pigment", label: "760 Small Leaf Pigment crafted", manual: true }
        ]
      },
      {
        id: "scented-petal-pigment",
        title: "Make 245 Scented Petal Pigment",
        body: "Prepare the scented pigment for Cloudspun Fabric.",
        checks: [
          { id: "chestnut", label: "Do you have 2,450 Chestnut?", item: "Chestnut", qty: 2450 },
          { id: "poppy", label: "Do you have 12,250 Poppy?", item: "Poppy", qty: 12250 },
          { id: "saffron", label: "Do you have 12,250 Saffron?", item: "Saffron", qty: 12250 },
          { id: "crafted-scented-petal-pigment", label: "245 Scented Petal Pigment crafted", manual: true }
        ]
      },
      {
        id: "beautifully-colored-fabric",
        title: "Make 7,600 Beautifully Colored Fabric",
        body: "Prepare the fabric chain for Cloudspun Fabric.",
        checks: [
          { id: "fabric", label: "Do you have 76,000 Fabric?", item: "Fabric", qty: 76000 },
          { id: "crafted-beautifully-colored-fabric", label: "7,600 Beautifully Colored Fabric crafted", manual: true }
        ]
      },
      {
        id: "cloudspun-fabric",
        title: "Make 760 Cloudspun Fabric",
        body: "Combine Beautifully Colored Fabric, Anya Ingots, and prepared pigments.",
        checks: [
          { id: "beautifully-colored-fabric-ready", label: "Do you have 7,600 Beautifully Colored Fabric ready?", manual: true },
          { id: "anya-ingot", label: "Do you have 684 Anya Ingots?", item: "Anya Ingot", qty: 684 },
          { id: "small-leaf-pigment-ready", label: "Do you have 760 Small Leaf Pigment ready?", manual: true },
          { id: "scented-petal-pigment-ready", label: "Do you have 245 Scented Petal Pigment ready?", manual: true },
          { id: "crafted-cloudspun-fabric", label: "760 Cloudspun Fabric crafted", manual: true }
        ]
      },
      {
        id: "blazing-cloudspun-fabric",
        title: "Make 76 Blazing Cloudspun Fabric",
        body: "Upgrade the Cloudspun Fabric into Blazing Cloudspun Fabric.",
        checks: [
          { id: "cloudspun-fabric-ready", label: "Do you have 760 Cloudspun Fabric ready?", manual: true },
          { id: "flaming-log", label: "Do you have 456 Flaming Logs?", item: "Flaming Log", qty: 456 },
          { id: "green-coral", label: "Do you have 15,200 Green Coral?", item: "Green Coral", qty: 15200 },
          { id: "garden-powder", label: "Do you have 3,800 Mysterious Garden Powder?", item: "Mysterious Garden Powder", qty: 3800 },
          { id: "onyx", label: "Do you have 26,600 Onyx Archeum Essence?", item: "Onyx Archeum Essence", qty: 26600 },
          { id: "crafted-blazing-cloudspun-fabric", label: "76 Blazing Cloudspun Fabric crafted", manual: true }
        ]
      },
      {
        id: "armor-regrade-scrolls",
        title: "Make 70 Armor Regrade Scrolls",
        body: "Craft the armor scrolls shown on the verified sheet.",
        checks: [
          { id: "moonpoint", label: "Do you have 70 Moonpoints?", item: "Moonpoint", qty: 70 },
          { id: "blank-scroll", label: "Do you have 70 Blank Regrade Scrolls?", item: "Blank Regrade Scroll", qty: 70 },
          { id: "crafted-scrolls", label: "70 Armor Regrade Scrolls crafted", manual: true }
        ]
      },
      {
        id: "ipnysh-moonlight-blessings",
        title: "Make 7 Ipnysh Moonlight Blessings",
        body: "Gather the Ipnysh blessing materials for the full cloth set.",
        checks: [
          { id: "sparkling-shell-dust", label: "Do you have 2,450 Sparkling Shell Dust?", item: "Sparkling Shell Dust", qty: 2450 },
          { id: "acidic-pouches", label: "Do you have 28 Acidic Poison Pouches?", item: "Acidic Poison Pouch", qty: 28 },
          { id: "cursed-pieces", label: "Do you have 28 Cursed Armor Pieces?", item: "Cursed Armor Piece", qty: 28 },
          { id: "dragon-stabilizer", label: "Do you have 2,985 Dragon Essence Stabilizers?", item: "Dragon Essence Stabilizer", qty: 2985 },
          { id: "crafted-ipnysh-blessings", label: "7 Ipnysh Moonlight Blessings crafted", manual: true }
        ]
      },
      {
        id: "final-materials",
        title: "Gather Final Cloth Inputs",
        body: "Confirm the final direct materials before crafting the cloth set.",
        checks: [
          { id: "moonlight-essence", label: "Do you have 605 Moonlight Archeum Essence?", item: "Moonlight Archeum Essence", qty: 605 }
        ]
      },
      {
        id: "final-craft",
        title: "Craft at an Armorer's House",
        body: "Proceed to an Armorer's House of your choosing and make the Full Cloth Set.",
        checks: [
          { id: "proficiency", label: "Tailoring proficiency is 180,000 or higher", proficiency: "Tailoring", qty: 180000 },
          { id: "blazing-fabric-ready", label: "Do you have 76 Blazing Cloudspun Fabric ready?", manual: true },
          { id: "scrolls-ready", label: "Do you have 70 Armor Regrade Scrolls ready?", manual: true },
          { id: "ipnysh-blessings-ready", label: "Do you have 7 Ipnysh Moonlight Blessings ready?", manual: true },
          { id: "at-armorer-house", label: "I am at the Armorer's House and ready to craft", manual: true },
          { id: "crafted-item", label: "Full Cloth Set crafted", manual: true }
        ]
      }
    ]
  }
};

const recipes = [
  {
    id: "erenor-ring-earring",
    profession: "Handicrafts",
    label: "Erenor Ring, Earring",
    defaultQty: 1,
    items: [
      { item: "Diamond", qty: 39 },
      { item: "Ruby", qty: 39 },
      { item: "Sapphire", qty: 39 },
      { item: "Amethyst", qty: 39 },
      { item: "Emerald", qty: 39 },
      { item: "Topaz", qty: 39 },
      { item: "Starlight Archeum Essence", qty: 93 },
      { item: "Gold Ingot", qty: 91 },
      { item: "Blank Regrade Scroll", qty: 10 },
      { item: "Starpoint", qty: 10 },
      { item: "Dragon Essence Stabilizer", qty: 50 },
      { item: "Cursed Armor Piece", qty: 4 },
      { item: "Acidic Poison Pouch", qty: 4 }
    ]
  },
  {
    id: "erenor-necklace",
    profession: "Handicrafts",
    label: "Erenor Necklace",
    defaultQty: 1,
    items: [
      { item: "Diamond", qty: 39 },
      { item: "Ruby", qty: 39 },
      { item: "Sapphire", qty: 39 },
      { item: "Amethyst", qty: 39 },
      { item: "Emerald", qty: 39 },
      { item: "Topaz", qty: 39 },
      { item: "Starlight Archeum Essence", qty: 110 },
      { item: "Gold Ingot", qty: 91 },
      { item: "Blank Regrade Scroll", qty: 10 },
      { item: "Starpoint", qty: 10 },
      { item: "Dragon Essence Stabilizer", qty: 50 },
      { item: "Cursed Armor Piece", qty: 4 },
      { item: "Acidic Poison Pouch", qty: 4 }
    ]
  },
  {
    id: "erenor-flute-lute",
    profession: "Handicrafts",
    label: "Erenor Flute, Lute",
    defaultQty: 1,
    items: [
      { item: "Rice", qty: 34000 },
      { item: "Peanut", qty: 5100 },
      { item: "Wheat", qty: 5100 },
      { item: "Corn", qty: 34000 },
      { item: "Lumber", qty: 17000 },
      { item: "Anya Ingot", qty: 153 },
      { item: "Sunlight Archeum Essence", qty: 172 },
      { item: "Archeum Ingot", qty: 132 },
      { item: "Flaming Log", qty: 102 },
      { item: "Red Coral", qty: 3400 },
      { item: "Mysterious Garden Powder", qty: 850 },
      { item: "Sunpoint", qty: 10 },
      { item: "Blank Regrade Scroll", qty: 10 },
      { item: "Onyx Archeum Essence", qty: 5950 },
      { item: "Dragon Essence Stabilizer", qty: 425 },
      { item: "Cursed Armor Piece", qty: 4 },
      { item: "Acidic Poison Pouch", qty: 4 }
    ]
  },
  {
    id: "erenor-flame-wave-lightning-lunafrost",
    profession: "Alchemy",
    label: "Erenor Flame, Wave, Lightning Lunafrost",
    defaultQty: 1,
    items: [
      { item: "Cactus", qty: 150 },
      { item: "Beechnut", qty: 30 },
      { item: "Diamond", qty: 5 },
      { item: "Ruby", qty: 5 },
      { item: "Sapphire", qty: 5 },
      { item: "Amethyst", qty: 5 },
      { item: "Emerald", qty: 5 },
      { item: "Topaz", qty: 5 },
      { item: "Turmeric", qty: 150 },
      { item: "Moonlight Archeum Dust", qty: 150 },
      { item: "Mysterious Garden Powder", qty: 150 },
      { item: "Book of Auroria", qty: 8 },
      { item: "Sparkling Shell Dust", qty: 30 },
      { item: "Dragon Essence Stabilizer", qty: 59 },
      { item: "Cursed Armor Piece", qty: 4 },
      { item: "Acidic Poison Pouch", qty: 4 }
    ]
  },
  {
    id: "erenor-gale-life-typhoon-lunafrost",
    profession: "Alchemy",
    label: "Erenor Gale, Life, Typhoon Lunafrost",
    defaultQty: 1,
    items: [
      { item: "Quinoa", qty: 150 },
      { item: "Cultivated Ginseng", qty: 150 },
      { item: "Coconut", qty: 30 },
      { item: "Diamond", qty: 5 },
      { item: "Ruby", qty: 5 },
      { item: "Sapphire", qty: 5 },
      { item: "Amethyst", qty: 5 },
      { item: "Emerald", qty: 5 },
      { item: "Topaz", qty: 5 },
      { item: "Moonlight Archeum Dust", qty: 150 },
      { item: "Mysterious Garden Powder", qty: 150 },
      { item: "Book of Auroria", qty: 8 },
      { item: "Sparkling Shell Dust", qty: 30 },
      { item: "Dragon Essence Stabilizer", qty: 59 },
      { item: "Cursed Armor Piece", qty: 4 },
      { item: "Acidic Poison Pouch", qty: 4 }
    ]
  },
  {
    id: "erenor-earth-ocean-lunafrost",
    profession: "Alchemy",
    label: "Erenor Earth, Ocean Lunafrost",
    defaultQty: 1,
    items: [
      { item: "Chestnut", qty: 30 },
      { item: "Poppy", qty: 150 },
      { item: "Diamond", qty: 5 },
      { item: "Ruby", qty: 5 },
      { item: "Sapphire", qty: 5 },
      { item: "Amethyst", qty: 5 },
      { item: "Emerald", qty: 5 },
      { item: "Topaz", qty: 5 },
      { item: "Saffron", qty: 150 },
      { item: "Moonlight Archeum Dust", qty: 150 },
      { item: "Mysterious Garden Powder", qty: 150 },
      { item: "Book of Auroria", qty: 8 },
      { item: "Sparkling Shell Dust", qty: 30 },
      { item: "Dragon Essence Stabilizer", qty: 59 },
      { item: "Cursed Armor Piece", qty: 4 },
      { item: "Acidic Poison Pouch", qty: 4 }
    ]
  },
  {
    id: "erenor-bow-scepter-staff",
    profession: "Carpentry",
    label: "Erenor Bow, Scepter, Staff",
    defaultQty: 1,
    items: [
      { item: "Rice", qty: 34000 },
      { item: "Peanut", qty: 5100 },
      { item: "Wheat", qty: 5100 },
      { item: "Corn", qty: 34000 },
      { item: "Lumber", qty: 17000 },
      { item: "Anya Ingot", qty: 153 },
      { item: "Sunlight Archeum Essence", qty: 172 },
      { item: "Archeum Ingot", qty: 132 },
      { item: "Flaming Log", qty: 102 },
      { item: "Red Coral", qty: 3400 },
      { item: "Mysterious Garden Powder", qty: 850 },
      { item: "Sunpoint", qty: 10 },
      { item: "Blank Regrade Scroll", qty: 10 },
      { item: "Onyx Archeum Essence", qty: 5950 },
      { item: "Dragon Essence Stabilizer", qty: 425 },
      { item: "Cursed Armor Piece", qty: 4 },
      { item: "Acidic Poison Pouch", qty: 4 }
    ]
  },
  {
    id: "erenor-shield",
    profession: "Weaponry",
    label: "Erenor Shield",
    defaultQty: 1,
    items: [
      { item: "Rice", qty: 34000 },
      { item: "Peanut", qty: 5100 },
      { item: "Wheat", qty: 5100 },
      { item: "Corn", qty: 34000 },
      { item: "Lumber", qty: 17000 },
      { item: "Anya Ingot", qty: 153 },
      { item: "Sunlight Archeum Essence", qty: 172 },
      { item: "Archeum Ingot", qty: 132 },
      { item: "Flaming Log", qty: 102 },
      { item: "Red Coral", qty: 3400 },
      { item: "Mysterious Garden Powder", qty: 850 },
      { item: "Sunpoint", qty: 10 },
      { item: "Blank Regrade Scroll", qty: 10 },
      { item: "Onyx Archeum Essence", qty: 5950 },
      { item: "Dragon Essence Stabilizer", qty: 425 },
      { item: "Cursed Armor Piece", qty: 4 },
      { item: "Acidic Poison Pouch", qty: 4 }
    ]
  },
  {
    id: "erenor-weapon-set",
    profession: "Weaponry",
    label: "Erenor Dagger, Sword, Greatsword, Katana, Nodachi, Club, Greatclub, Shortspear, Longspear, Axe, Greataxe, Rifle",
    defaultQty: 1,
    items: [
      { item: "Oats", qty: 5100 },
      { item: "Narcissus", qty: 34000 },
      { item: "Lotus", qty: 5100 },
      { item: "Azalea", qty: 34000 },
      { item: "Iron Ingot", qty: 13600 },
      { item: "Copper Ingot", qty: 1700 },
      { item: "Anya Ingot", qty: 153 },
      { item: "Sunlight Archeum Essence", qty: 172 },
      { item: "Silver Ingot", qty: 1700 },
      { item: "Archeum Ingot", qty: 132 },
      { item: "Flaming Log", qty: 102 },
      { item: "Antler Coral", qty: 1530 },
      { item: "Mysterious Garden Powder", qty: 850 },
      { item: "Sunpoint", qty: 10 },
      { item: "Blank Regrade Scroll", qty: 10 },
      { item: "Onyx Archeum Essence", qty: 5950 },
      { item: "Dragon Essence Stabilizer", qty: 425 },
      { item: "Cursed Armor Piece", qty: 4 },
      { item: "Acidic Poison Pouch", qty: 4 }
    ]
  },
  {
    id: "full-plate-set",
    profession: "Metalwork",
    label: "Full Plate Set",
    defaultQty: 1,
    items: [
      { item: "Oats", qty: 22800 },
      { item: "Cactus", qty: 12250 },
      { item: "Narcissus", qty: 152000 },
      { item: "Lotus", qty: 22800 },
      { item: "Azalea", qty: 152000 },
      { item: "Beechnut", qty: 2450 },
      { item: "Iron Ingot", qty: 60800 },
      { item: "Copper Ingot", qty: 7600 },
      { item: "Anya Ingot", qty: 684 },
      { item: "Turmeric", qty: 12250 },
      { item: "Moonlight Archeum Essence", qty: 605 },
      { item: "Silver Ingot", qty: 7600 },
      { item: "Flaming Log", qty: 456 },
      { item: "Antler Coral", qty: 15200 },
      { item: "Mysterious Garden Powder", qty: 3800 },
      { item: "Moonpoint", qty: 70 },
      { item: "Blank Regrade Scroll", qty: 70 },
      { item: "Sparkling Shell Dust", qty: 2450 },
      { item: "Onyx Archeum Essence", qty: 26600 },
      { item: "Dragon Essence Stabilizer", qty: 2985 },
      { item: "Cursed Armor Piece", qty: 28 },
      { item: "Acidic Poison Pouch", qty: 28 }
    ]
  },
  {
    id: "full-leather-set",
    profession: "Leatherwork",
    label: "Full Leather Set",
    defaultQty: 1,
    items: [
      { item: "Rice", qty: 152000 },
      { item: "Quinoa", qty: 12250 },
      { item: "Cultivated Ginseng", qty: 12250 },
      { item: "Peanut", qty: 22800 },
      { item: "Wheat", qty: 22800 },
      { item: "Corn", qty: 152000 },
      { item: "Coconut", qty: 2450 },
      { item: "Anya Ingot", qty: 684 },
      { item: "Leather", qty: 76000 },
      { item: "Moonlight Archeum Essence", qty: 605 },
      { item: "Flaming Log", qty: 456 },
      { item: "Red Coral", qty: 15200 },
      { item: "Mysterious Garden Powder", qty: 3800 },
      { item: "Moonpoint", qty: 70 },
      { item: "Blank Regrade Scroll", qty: 70 },
      { item: "Sparkling Shell Dust", qty: 2450 },
      { item: "Onyx Archeum Essence", qty: 26600 },
      { item: "Dragon Essence Stabilizer", qty: 2985 },
      { item: "Cursed Armor Piece", qty: 28 },
      { item: "Acidic Poison Pouch", qty: 28 }
    ]
  },
  {
    id: "full-cloth-set",
    profession: "Tailoring",
    label: "Full Cloth Set",
    defaultQty: 1,
    items: [
      { item: "Cornflower", qty: 22800 },
      { item: "Lily", qty: 22800 },
      { item: "Clover", qty: 152000 },
      { item: "Chestnut", qty: 2450 },
      { item: "Rose", qty: 152000 },
      { item: "Poppy", qty: 12250 },
      { item: "Fabric", qty: 76000 },
      { item: "Anya Ingot", qty: 684 },
      { item: "Saffron", qty: 12250 },
      { item: "Moonlight Archeum Essence", qty: 605 },
      { item: "Flaming Log", qty: 456 },
      { item: "Green Coral", qty: 15200 },
      { item: "Mysterious Garden Powder", qty: 3800 },
      { item: "Moonpoint", qty: 70 },
      { item: "Blank Regrade Scroll", qty: 70 },
      { item: "Sparkling Shell Dust", qty: 2450 },
      { item: "Onyx Archeum Essence", qty: 26600 },
      { item: "Dragon Essence Stabilizer", qty: 2985 },
      { item: "Cursed Armor Piece", qty: 28 },
      { item: "Acidic Poison Pouch", qty: 28 }
    ]
  }
];

function getProfessionOptions() {
  const professions = Array.from(new Set(recipes.map(recipe => recipe.profession)));
  return ["All", ...professions];
}

function calculateRecipe(recipe, quantity) {
  const rows = recipe.items.map((row) => {
    const required = row.qty * quantity;
    const stored = Number(appState.storage[row.item] || 0);
    const price = Number(appState.prices[row.item] || 0);
    const stillNeed = Math.max(0, required - stored);
    const goldStillNeed = stillNeed * price;
    const ownedTowardGoal = Math.min(stored, required);

    return {
      ...row,
      required,
      stored,
      price,
      stillNeed,
      goldStillNeed,
      ownedTowardGoal
    };
  });

  const totalGold = rows.reduce((sum, row) => sum + row.goldStillNeed, 0);

  const totalRequired = rows.reduce((sum, row) => sum + row.required, 0);
  const totalOwnedTowardGoal = rows.reduce((sum, row) => sum + row.ownedTowardGoal, 0);

  const progress = totalRequired > 0
    ? Math.round((totalOwnedTowardGoal / totalRequired) * 100)
    : 0;

  return { rows, totalGold, progress };
}

function getStoredQty(item) {
  return Number(appState.storage[item] || 0);
}

function getProficiencyPoints(skill) {
  const data = getProfData();
  return Number(data?.[skill]?.points || 0);
}

function getLaborInfo(skill, baseEach, qty) {
  const points = getProficiencyPoints(skill);
  const rank = getRankFromPoints(points);
  const reducedEach = Math.round(baseEach * (1 - rank.laborReduction / 100));
  return {
    points,
    rank,
    baseEach,
    baseTotal: baseEach * qty,
    reducedEach,
    reducedTotal: reducedEach * qty
  };
}

function renderStepLabor(step) {
  if (!step.labor) return "";
  const info = getLaborInfo(step.labor.skill, step.labor.baseEach, step.labor.qty);
  return `
    <div style="font-size:12px;color:#93c5fd;margin-top:5px;line-height:1.45;">
      Labor: ${info.reducedEach.toLocaleString()} each / ${info.reducedTotal.toLocaleString()} total
      <span style="color:#8d99ab;">
        (${escapeHtml(step.labor.skill)} ${info.points.toLocaleString()}, ${escapeHtml(info.rank.name)}, -${info.rank.laborReduction}% from base ${info.baseEach.toLocaleString()} each)
      </span>
    </div>
  `;
}

function isAutoCheckSatisfied(check) {
  if (check.item) return getStoredQty(check.item) >= check.qty;
  if (check.proficiency) return getProficiencyPoints(check.proficiency) >= check.qty;
  return false;
}

function isCheckComplete(recipeId, stepId, check) {
  const state = getGuideState();
  const key = `${recipeId}:${stepId}:${check.id}`;
  return state[key] === true;
}

function getStepProgress(recipeId, step) {
  const done = step.checks.filter(check => isCheckComplete(recipeId, step.id, check)).length;
  return { done, total: step.checks.length, complete: done === step.checks.length };
}

function getGuideProgress(recipeId, guide) {
  const steps = guide.steps.map(step => getStepProgress(recipeId, step));
  const completeSteps = steps.filter(step => step.complete).length;
  const firstOpenIndex = steps.findIndex(step => !step.complete);
  return {
    steps,
    completeSteps,
    totalSteps: guide.steps.length,
    allComplete: completeSteps === guide.steps.length,
    firstOpenIndex: firstOpenIndex === -1 ? guide.steps.length - 1 : firstOpenIndex
  };
}

function renderCheckMeta(check) {
  if (check.item) {
    const have = getStoredQty(check.item);
    const good = have >= check.qty;
    return `
      <span style="font-size:11px;color:${good ? "#86efac" : "#fcd34d"};">
        Storage: ${have.toLocaleString()} / ${check.qty.toLocaleString()}
      </span>
    `;
  }
  if (check.proficiency) {
    const points = getProficiencyPoints(check.proficiency);
    const good = points >= check.qty;
    return `
      <span style="font-size:11px;color:${good ? "#86efac" : "#fcd34d"};">
        Proficiency: ${points.toLocaleString()} / ${check.qty.toLocaleString()}
      </span>
    `;
  }
  return `<span style="font-size:11px;color:#566174;">Manual confirmation</span>`;
}

function renderCraftGuide(recipe, guide, materialsReady) {
  const state = getGuideState();
  const open = state[`${recipe.id}:open`] === true;
  const guideProgress = getGuideProgress(recipe.id, guide);
  const canStart = true;

  return `
    <div style="margin-top:16px;border-top:1px solid #394252;padding-top:14px;">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;">
        <div>
          <div style="font-size:13px;font-weight:700;color:#eef2f7;">Crafting Guide</div>
          <div style="font-size:12px;color:${canStart ? "#86efac" : "#8d99ab"};margin-top:3px;">
            ${guideProgress.completeSteps} / ${guideProgress.totalSteps} steps complete
          </div>
        </div>
        <button
          type="button"
          onclick="${open ? `window.closeErenorCraftGuide('${jsEscape(recipe.id)}')` : `window.openErenorCraftGuide('${jsEscape(recipe.id)}')`}"
          ${canStart ? "" : "disabled"}
          style="padding:9px 18px;border-radius:8px;font-size:13px;font-weight:700;cursor:${canStart ? "pointer" : "not-allowed"};
            background:${canStart ? "#1a3a2a" : "#1b2028"};border:1px solid ${canStart ? "#2d6a2d" : "#394252"};
            color:${canStart ? "#86efac" : "#566174"};"
        >
          ${open ? "Hide Craft Guide" : "Proceed to Craft"}
        </button>
      </div>
    </div>
    ${open && canStart ? renderCraftGuideModal(recipe, guide, guideProgress) : ""}
  `;
}

function renderCraftGuideModal(recipe, guide, guideProgress) {
  return `
    <div
      id="erenor-craft-guide-modal"
      onclick="if(event.target === this) window.closeErenorCraftGuide('${jsEscape(recipe.id)}')"
      style="position:fixed;inset:0;background:rgba(5,10,18,0.78);z-index:6000;display:flex;align-items:center;justify-content:center;padding:22px;"
    >
      <div
        class="card"
        style="width:min(980px,96vw);height:min(820px,86vh);margin:0;padding:0;overflow:hidden;border-color:#2d5a8a;box-shadow:0 18px 70px rgba(0,0,0,0.62);display:flex;flex-direction:column;"
      >
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:14px;padding:18px 20px;border-bottom:1px solid #394252;background:#202733;flex:0 0 auto;">
          <div>
            <div style="font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#93c5fd;margin-bottom:5px;">
              Crafting Guide
            </div>
            <h3 style="margin:0;color:#f8fafc;">${escapeHtml(guide.title)}</h3>
            <div style="font-size:12px;color:#8d99ab;margin-top:6px;">
              ${guideProgress.completeSteps} / ${guideProgress.totalSteps} steps complete
            </div>
          </div>
          <button
            type="button"
            onclick="window.closeErenorCraftGuide('${jsEscape(recipe.id)}')"
            aria-label="Close craft guide"
            style="width:34px;height:34px;border-radius:8px;background:#1b2028;border:1px solid #485366;color:#cbd5e1;font-size:20px;line-height:1;cursor:pointer;"
          >
            &times;
          </button>
        </div>
        <div id="erenor-craft-guide-scroll" style="flex:1 1 auto;min-height:0;overflow-y:auto;overflow-x:hidden;padding:18px 20px 34px;">
          ${renderCraftGuideSteps(recipe, guide, guideProgress)}
        </div>
      </div>
    </div>
  `;
}

function renderCraftGuideSteps(recipe, guide, guideProgress) {
  return `
    <div style="display:flex;flex-direction:column;gap:10px;">
      ${guide.steps.map((step, index) => {
        const progress = guideProgress.steps[index];
        const available = index <= guideProgress.firstOpenIndex || progress.complete;
        const isCurrent = index === guideProgress.firstOpenIndex && !progress.complete;
        const border = progress.complete ? "#2d6a2d" : isCurrent ? "#2d5a8a" : "#394252";
        const bg = progress.complete ? "#132a1d" : isCurrent ? "#16283a" : "#21262f";
        const badge = progress.complete
          ? `<span class="badge green">Complete</span>`
          : isCurrent
            ? `<span class="badge orange">Current</span>`
            : `<span class="badge red">Locked</span>`;

        return `
          <div style="background:${bg};border:1px solid ${border};border-radius:10px;padding:14px;opacity:${available ? "1" : "0.52"};">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap;">
              <div>
                <div style="font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#8d99ab;">
                  Step ${index + 1}
                </div>
                <div style="font-size:15px;font-weight:700;color:#eef2f7;margin-top:3px;">${escapeHtml(step.title)}</div>
                <div style="font-size:12px;color:#cbd5e1;margin-top:5px;line-height:1.5;">${escapeHtml(step.body)}</div>
                ${renderStepLabor(step)}
              </div>
              <div style="display:flex;align-items:center;gap:8px;">
                <span style="font-size:12px;color:#8d99ab;">${progress.done}/${progress.total}</span>
                ${badge}
              </div>
            </div>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:8px;margin-top:12px;">
              ${step.checks.map(check => renderCraftGuideCheck(recipe.id, step.id, check, available)).join("")}
            </div>
          </div>
        `;
      }).join("")}

      ${guideProgress.allComplete ? `
        <div style="padding:14px 16px;background:#0a2a1a;border:1px solid #16a34a;border-radius:10px;color:#86efac;font-size:13px;font-weight:700;">
          All checks complete. You are ready to craft the Erenor Ring or Earring.
        </div>
      ` : ""}
    </div>
  `;
}

function renderCraftGuideCheck(recipeId, stepId, check, available) {
  const checked = isCheckComplete(recipeId, stepId, check);
  const disabled = !available;

  return `
    <label style="display:flex;align-items:flex-start;gap:10px;background:#1b2028;border:1px solid ${checked ? "#2d6a2d" : "#394252"};
      border-radius:8px;padding:10px 11px;cursor:${disabled ? "default" : "pointer"};">
      <input
        type="checkbox"
        ${checked ? "checked" : ""}
        ${disabled ? "disabled" : ""}
        onchange="window.toggleErenorCraftGuideCheck('${jsEscape(recipeId)}','${jsEscape(stepId)}','${jsEscape(check.id)}', this.checked)"
        style="margin-top:2px;accent-color:#22c55e;"
      >
      <span style="display:flex;flex-direction:column;gap:4px;min-width:0;">
        <span style="font-size:13px;color:${checked ? "#eef2f7" : "#cbd5e1"};font-weight:600;">${escapeHtml(check.label)}</span>
        ${renderCheckMeta(check)}
      </span>
    </label>
  `;
}

function renderProfessionButtons(active) {
  return `
    <div class="section-nav" style="margin-top:12px;">
      ${getProfessionOptions().map((profession) => `
        <button
          type="button"
          class="section-link${profession === active ? " active-filter" : ""}"
          onclick="window.updateErenorProfessionFilter('${jsEscape(profession)}')"
        >
          ${escapeHtml(profession)}
        </button>
      `).join("")}
    </div>
  `;
}

function renderRecipeCard(recipe, quantity) {
  const { rows, totalGold, progress } = calculateRecipe(recipe, quantity);
  const materialsReady = rows.every(row => row.stored >= row.required);
  const guide = craftGuides[recipe.id];

  return `
    <div class="card" style="margin-bottom:20px;">
      <div style="display:flex;justify-content:space-between;align-items:flex-end;gap:12px;flex-wrap:wrap;">
        <div>
          <h3 style="margin:0;">${escapeHtml(recipe.label)}</h3>
          <p class="notice" style="margin:6px 0 0 0;">Profession: ${escapeHtml(recipe.profession)} · Progress: ${progress}%</p>
        </div>
        <div>
          <label style="display:block;margin-bottom:4px;">How many to craft?</label>
          <input
            type="number"
            min="0"
            value="${quantity}"
            onchange="window.updateCraftQty('${jsEscape(recipe.id)}', this.value)"
            style="width:90px;"
          >
        </div>
      </div>

      <div class="table-wrap" style="margin-top:14px;">
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Required</th>
              <th>Stored</th>
              <th>Still Need</th>
              <th>Price / Unit</th>
              <th>Gold Still Need</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${rows.map((row) => {
              const status = getStatus(row.required, row.stored);
              return `
                <tr>
                  <td>${escapeHtml(row.item)}</td>
                  <td>${row.required.toLocaleString()}</td>
                  <td>${row.stored.toLocaleString()}</td>
                  <td class="still-need ${getStillNeedClass(row.required, row.stored)}">${row.stillNeed.toLocaleString()}</td>
                  <td class="price-text">${formatGold(row.price)}</td>
                  <td class="price-text">${formatGold(row.goldStillNeed)}</td>
                  <td><span class="badge ${status.className}">${status.label}</span></td>
                </tr>
              `;
            }).join("")}
            <tr>
              <td colspan="5"><strong>Total Gold Still Need</strong></td>
              <td class="price-text"><strong>${formatGold(totalGold)}</strong></td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>
      ${guide ? renderCraftGuide(recipe, guide, materialsReady) : ""}
    </div>
  `;
}

export function renderPage() {
  const quantities = getQuantities();
  const activeProfession = getProfessionFilter();

  const filteredRecipes = recipes.filter((recipe) => {
    return activeProfession === "All" || recipe.profession === activeProfession;
  });

  return `
    <div class="card">
      <h2>Erenor Crafts</h2>
      <p class="notice" style="margin:8px 0 0 0;">
        Uses your Prices & Storage values automatically. Status bubbles show nothing farmed, in progress, or done.
      </p>
      ${renderProfessionButtons(activeProfession)}
    </div>

    ${filteredRecipes.map((recipe) => {
      const quantity = Number(quantities[recipe.id] ?? recipe.defaultQty ?? 0);
      return renderRecipeCard(recipe, quantity);
    }).join("")}
  `;
}

window.updateCraftQty = function(id, value) {
  saveQuantity(id, value);
  window.renderCurrentPage();
};

window.updateErenorProfessionFilter = function(value) {
  saveProfessionFilter(value);
  window.renderCurrentPage();
};

window.openErenorCraftGuide = function(recipeId) {
  const state = getGuideState();
  clearGuideChecks(state, recipeId);
  state[`${recipeId}:open`] = true;
  saveGuideState(state);
  window.renderCurrentPage();
};

window.closeErenorCraftGuide = function(recipeId) {
  const state = getGuideState();
  clearGuideChecks(state, recipeId);
  state[`${recipeId}:open`] = false;
  saveGuideState(state);
  window.renderCurrentPage();
};

window.toggleErenorCraftGuide = function(recipeId) {
  const state = getGuideState();
  if (state[`${recipeId}:open`] === true) {
    window.closeErenorCraftGuide(recipeId);
  } else {
    window.openErenorCraftGuide(recipeId);
  }
};

window.toggleErenorCraftGuideCheck = function(recipeId, stepId, checkId, checked) {
  const scrollEl = document.getElementById("erenor-craft-guide-scroll");
  const scrollTop = scrollEl ? scrollEl.scrollTop : 0;
  const state = getGuideState();
  state[`${recipeId}:${stepId}:${checkId}`] = checked === true;
  saveGuideState(state);
  window.renderCurrentPage();
  window.requestAnimationFrame(() => {
    const nextScrollEl = document.getElementById("erenor-craft-guide-scroll");
    if (nextScrollEl) nextScrollEl.scrollTop = scrollTop;
  });
};
