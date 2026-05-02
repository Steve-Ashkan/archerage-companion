export const categories = {
  "Basic Materials": [
    "Azalea", "Clover", "Corn", "Green Coral", "Narcissus", "Red Coral", "Rice", "Rose"
  ],
  "Vocation Plants": [
    "Antler Coral", "Bean", "Beechnut", "Blueberry", "Cactus", "Chestnut",
    "Chili Pepper", "Coconut", "Cornflower", "Cultivated Ginseng", "Lily",
    "Lotus", "Mint", "Oats", "Peanut", "Pearl", "Pepper", "Poppy",
    "Quinoa", "Rosemary", "Rye", "Saffron", "Turmeric", "Vanilla", "Wheat"
  ],
  "Processed Materials": [
    "Archeum Log", "Fabric", "Flaming Log", "Leather", "Lumber",
    "Natural Rubber", "Thunderstruck Log", "Thunderstruck Tree"
  ],
  "Advanced Materials": [
    "Acidic Poison Pouch", "Blank Regrade Scroll", "Book of Auroria",
    "Clear Synthium Shard", "Cursed Armor Piece", "Dawn Lake Light Essence",
    "Dragon Essence Stabilizer", "Glowing Prism", "Misagon's Crystal",
    "Mysterious Garden Powder", "Red Dragon Spinal Ridge", "Sparkling Shell Dust",
    "Vehicle Upgrade Device"
  ],
  "Archeum": [
    "Moonlight Archeum Crystal", "Moonlight Archeum Dust", "Moonlight Archeum Essence",
    "Onyx Archeum Essence",
    "Starlight Archeum Crystal", "Starlight Archeum Dust", "Starlight Archeum Essence",
    "Starlight Archeum Shard",
    "Sunlight Archeum Crystal", "Sunlight Archeum Essence"
  ],
  "Gems": [
    "Amethyst", "Diamond", "Emerald", "Ruby", "Sapphire", "Topaz"
  ],
  "Ingots": [
    "Anya Ingot", "Archeum Ingot", "Copper Ingot", "Gold Ingot",
    "Iron Ingot", "Silver Ingot", "Starshard Ingot"
  ],
  "Points & Currency": [
    "Lucky Sunpoint", "Moonpoint", "Starpoint", "Sunpoint"
  ],
  "Regrade & Scrolls": [
    "Ayanad Weaponsmithing Scroll", "Celestial Weapon Anchoring Charm",
    "Red Regrade", "Resplendent Weapon Regrade Scroll",
    "Silver Regrade Charm", "Superior Red Regrade Charm"
  ]
};

export const allItems = Object.entries(categories).flatMap(([category, items]) =>
  items.map(item => ({ item, category }))
);