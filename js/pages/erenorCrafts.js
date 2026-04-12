import { appState } from "../state.js";
import { escapeHtml, formatGold, getStatus, getStillNeedClass, jsEscape } from "../utils.js";

const LOCAL_KEY = "erenorCraftQuantities";
const FILTER_KEY = "erenorCraftProfessionFilter";

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
    defaultQty: 2,
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
      { item: "Cursed Armor Piece", qty: 1 },
      { item: "Acidic Poison Pouch", qty: 1 }
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
      { item: "Onyx Archeum Essence", qty: 51 },
      { item: "Dragon Essence Stabilizer", qty: 59 },
      { item: "Cursed Armor Piece", qty: 1 },
      { item: "Acidic Poison Pouch", qty: 1 }
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
      { item: "Onyx Archeum Essence", qty: 51 },
      { item: "Dragon Essence Stabilizer", qty: 59 },
      { item: "Cursed Armor Piece", qty: 1 },
      { item: "Acidic Poison Pouch", qty: 1 }
    ]
  },
  {
    id: "erenor-bow-scepter-staff",
    profession: "Carpentry",
    label: "Erenor Bow, Scepter, Staff",
    defaultQty: 1,
    items: [
      { item: "Rice", qty: 8500 },
      { item: "Peanut", qty: 1275 },
      { item: "Wheat", qty: 1275 },
      { item: "Corn", qty: 8500 },
      { item: "Lumber", qty: 4250 },
      { item: "Anya Ingot", qty: 39 },
      { item: "Sunlight Archeum Essence", qty: 44 },
      { item: "Archeum Ingot", qty: 32 },
      { item: "Flaming Log", qty: 24 },
      { item: "Red Coral", qty: 850 },
      { item: "Mysterious Garden Powder", qty: 213 },
      { item: "Sunpoint", qty: 10 },
      { item: "Blank Regrade Scroll", qty: 10 },
      { item: "Onyx Archeum Essence", qty: 1488 },
      { item: "Dragon Essence Stabilizer", qty: 106 },
      { item: "Cursed Armor Piece", qty: 1 },
      { item: "Acidic Poison Pouch", qty: 1 }
    ]
  },
  {
    id: "erenor-shield",
    profession: "Weaponry",
    label: "Erenor Shield",
    defaultQty: 1,
    items: [
      { item: "Rice", qty: 8500 },
      { item: "Corn", qty: 8500 },
      { item: "Lumber", qty: 4250 },
      { item: "Cultivated Ginseng", qty: 1275 },
      { item: "Bean", qty: 1275 },
      { item: "Anya Ingot", qty: 39 },
      { item: "Sunlight Archeum Essence", qty: 44 },
      { item: "Archeum Ingot", qty: 32 },
      { item: "Flaming Log", qty: 24 },
      { item: "Natural Rubber", qty: 850 },
      { item: "Mysterious Garden Powder", qty: 213 },
      { item: "Sunpoint", qty: 10 },
      { item: "Blank Regrade Scroll", qty: 10 },
      { item: "Onyx Archeum Essence", qty: 1488 },
      { item: "Dragon Essence Stabilizer", qty: 106 },
      { item: "Cursed Armor Piece", qty: 1 },
      { item: "Acidic Poison Pouch", qty: 1 }
    ]
  },
  {
    id: "erenor-weapon-set",
    profession: "Weaponry",
    label: "Erenor Dagger, Sword, Greatsword, Katana, Nodachi, Club, Greatclub, Shortspear, Longspear, Axe, Greataxe, Rifle",
    defaultQty: 1,
    items: [
      { item: "Rice", qty: 8500 },
      { item: "Corn", qty: 8500 },
      { item: "Iron Ingot", qty: 4250 },
      { item: "Cultivated Ginseng", qty: 1275 },
      { item: "Bean", qty: 1275 },
      { item: "Anya Ingot", qty: 39 },
      { item: "Sunlight Archeum Essence", qty: 44 },
      { item: "Archeum Ingot", qty: 32 },
      { item: "Flaming Log", qty: 24 },
      { item: "Natural Rubber", qty: 850 },
      { item: "Mysterious Garden Powder", qty: 213 },
      { item: "Sunpoint", qty: 10 },
      { item: "Blank Regrade Scroll", qty: 10 },
      { item: "Onyx Archeum Essence", qty: 1488 },
      { item: "Dragon Essence Stabilizer", qty: 106 },
      { item: "Cursed Armor Piece", qty: 1 },
      { item: "Acidic Poison Pouch", qty: 1 }
    ]
  },
  {
    id: "full-plate-set",
    profession: "Metalwork",
    label: "Full Plate Set",
    defaultQty: 1,
    items: [
      { item: "Narcissus", qty: 27900 },
      { item: "Azalea", qty: 27900 },
      { item: "Poppy", qty: 2100 },
      { item: "Bean", qty: 2100 },
      { item: "Turmeric", qty: 1680 },
      { item: "Pepper", qty: 210 },
      { item: "Pearl", qty: 840 },
      { item: "Iron Ingot", qty: 12000 },
      { item: "Anya Ingot", qty: 108 },
      { item: "Moonlight Archeum Essence", qty: 97 },
      { item: "Flaming Log", qty: 72 },
      { item: "Antler Coral", qty: 2940 },
      { item: "Mysterious Garden Powder", qty: 600 },
      { item: "Moonpoint", qty: 10 },
      { item: "Blank Regrade Scroll", qty: 10 },
      { item: "Sparkling Shell Dust", qty: 350 },
      { item: "Onyx Archeum Essence", qty: 5155 },
      { item: "Dragon Essence Stabilizer", qty: 455 },
      { item: "Cursed Armor Piece", qty: 4 },
      { item: "Acidic Poison Pouch", qty: 4 }
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
      { item: "Cornflower", qty: 6300 },
      { item: "Lily", qty: 6300 },
      { item: "Cactus", qty: 1400 },
      { item: "Clover", qty: 27100 },
      { item: "Chestnut", qty: 350 },
      { item: "Rose", qty: 27100 },
      { item: "Poppy", qty: 1750 },
      { item: "Pepper", qty: 175 },
      { item: "Pearl", qty: 700 },
      { item: "Fabric", qty: 12000 },
      { item: "Mint", qty: 1400 },
      { item: "Anya Ingot", qty: 108 },
      { item: "Moonlight Archeum Essence", qty: 97 },
      { item: "Flaming Log", qty: 72 },
      { item: "Green Coral", qty: 2940 },
      { item: "Mysterious Garden Powder", qty: 600 },
      { item: "Moonpoint", qty: 10 },
      { item: "Blank Regrade Scroll", qty: 10 },
      { item: "Sparkling Shell Dust", qty: 350 },
      { item: "Onyx Archeum Essence", qty: 5155 },
      { item: "Dragon Essence Stabilizer", qty: 455 },
      { item: "Cursed Armor Piece", qty: 4 },
      { item: "Acidic Poison Pouch", qty: 4 }
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