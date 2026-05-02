// ArcheRage Event Schedule Data
// Source: AR Event Timers schedule supplied by Ashkan.
// All times and days below are UTC, matching the original timer source.

const DAYS = {
  sun: 'Sunday',
  mon: 'Monday',
  tue: 'Tuesday',
  wed: 'Wednesday',
  thu: 'Thursday',
  fri: 'Friday',
  sat: 'Saturday',
};

function getCurrentSiegeName() {
  const rotations = ['Heedmar', 'Nuimari', 'Marcala', 'Calmlands'];
  const anchorMs = Date.UTC(2025, 0, 4, 2, 0);
  const weeksSince = Math.floor((Date.now() - anchorMs) / (7 * 24 * 3600000));
  return rotations[((weeksSince % rotations.length) + rotations.length) % rotations.length];
}

export const eventCategories = [
  {
    id: 'rifts',
    name: 'Rifts',
    icon: '🌀',
    events: [
      { name: 'Crimson Rift', times: ['00:20', '04:20', '08:20', '12:20', '16:20', '20:20'], days: 'Daily' },
      { name: 'Sungold Crimson Rift', times: ['01:20', '05:20', '09:20', '13:20', '17:20', '21:20'], days: 'Daily' },
      { name: 'Hiram Rift', times: ['01:50', '05:50', '09:50', '13:50', '17:50', '21:50'], days: 'Daily' },
      { name: 'Grimghast Rift', times: ['02:20', '06:20', '10:20', '14:20', '18:20', '22:20'], days: 'Daily' },
      { name: 'DS Ocleera Rift', times: ['04:00', '16:00'], days: 'Daily' },
      { name: 'Hasla 2 Rifts', times: ['00:00'], days: 'Daily' },
      { name: 'Hasla 1 Rift', times: ['17:00'], days: 'Daily' },
      { name: 'Jadegale Hasla Rift', times: ['23:00'], days: 'Daily' },
    ],
  },

  {
    id: 'instances',
    name: 'Instances',
    icon: '⚔️',
    events: [
      { name: 'Halcyona War', times: ['12:00'], days: 'Daily' },
      { name: 'Halcyona War', times: ['02:00', '18:00'], days: [DAYS.tue, DAYS.wed, DAYS.thu, DAYS.fri, DAYS.sat] },
      { name: 'Halcyona War', times: ['02:30', '16:30'], days: [DAYS.sun, DAYS.mon] },
      { name: 'Red Dragon', times: ['00:00'], days: [DAYS.mon, DAYS.tue, DAYS.thu, DAYS.sat] },
      { name: 'Red Dragon', times: ['11:30', '15:00'], days: [DAYS.sun, DAYS.mon, DAYS.wed, DAYS.fri] },
      { name: 'Kadum', times: ['00:00'], days: [DAYS.sun, DAYS.mon, DAYS.wed, DAYS.fri] },
      { name: 'Kadum', times: ['11:30', '15:00'], days: [DAYS.sun, DAYS.tue, DAYS.thu, DAYS.sat] },
      { name: 'Noryette Arena', times: ['03:30', '20:30', '22:30'], days: 'Daily' },
      { name: 'Dimensional Raid', times: ['00:30', '02:30'], days: [DAYS.sun, DAYS.mon] },
      { name: 'Dimensional Raid', times: ['10:30', '19:30', '22:30'], days: [DAYS.sun, DAYS.sat] },
      { name: 'Fall of Hiram', times: ['12:00'], days: [DAYS.fri] },
      { name: 'Fall of Hiram', times: ['22:00'], days: [DAYS.sun] },
    ],
  },

  {
    id: 'world_bosses',
    name: 'World Bosses',
    icon: '💀',
    events: [
      { name: 'Jola, Meina & Glenn', times: ['03:20', '07:20', '11:20', '15:20', '19:20', '23:20'], days: 'Daily' },
      { name: 'Kraken', times: ['14:30'], days: [DAYS.sun] },
      { name: 'Kraken', times: ['22:30'], days: [DAYS.tue, DAYS.sat] },
      { name: 'Black Dragon', times: ['00:00'], days: [DAYS.wed] },
      { name: 'Black Dragon', times: ['13:00'], days: [DAYS.sun] },
      { name: 'Black Dragon', times: ['21:00'], days: [DAYS.sat] },
      { name: 'Charybdis', times: ['01:30'], days: [DAYS.mon, DAYS.fri] },
      { name: 'Leviathan', times: ['00:05'], days: [DAYS.tue, DAYS.thu, DAYS.sat] },
      { name: 'DGS West Spawn', times: ['01:00'], days: [DAYS.mon, DAYS.thu] },
      { name: 'DGS East Spawn', times: ['01:00'], days: [DAYS.tue, DAYS.sat] },
      { name: 'Garden Anthalon', times: ['01:00'], days: [DAYS.sun, DAYS.thu] },
      { name: 'Garden Anthalon', times: ['17:00'], days: [DAYS.sun] },
      { name: 'Aragog', times: ['01:30'], days: [DAYS.mon, DAYS.sat] },
      { name: 'Aragog', times: ['15:30'], days: [DAYS.sun, DAYS.fri] },
      { name: 'Sea Spirit General', times: ['02:30'], days: [DAYS.sun, DAYS.thu] },
      { name: 'Sea Spirit General', times: ['17:30'], days: [DAYS.wed, DAYS.sat] },
      { name: 'Harbinger in Peace', times: ['02:30'], days: [DAYS.tue, DAYS.sat] },
      { name: 'Harbinger in War', times: ['17:30'], days: [DAYS.mon, DAYS.fri] },
      { name: 'Kraken Cultist', times: ['18:30', '23:00'], days: [DAYS.tue, DAYS.thu, DAYS.sat] },
    ],
  },

  {
    id: 'world_events',
    name: 'World Events',
    icon: '🗺️',
    events: [
      { name: 'Lusca', times: ['01:00', '20:30'], days: 'Daily' },
      { name: 'Abyss Attack', times: ['00:30'], days: [DAYS.sun, DAYS.wed, DAYS.fri] },
      { name: 'Abyss Attack', times: ['20:00'], days: [DAYS.tue, DAYS.thu, DAYS.sat] },
      { name: 'Akasch Quests', times: ['01:36'], days: [DAYS.sun, DAYS.tue] },
      { name: 'Akasch Quests', times: ['12:36', '20:36'], days: [DAYS.mon, DAYS.sat] },
      { name: 'Akasch Mobs', times: ['01:51'], days: [DAYS.sun, DAYS.tue] },
      { name: 'Akasch Mobs', times: ['12:51', '20:51'], days: [DAYS.mon, DAYS.sat] },
      { name: 'Guardian Scramble', times: ['01:00'], days: [DAYS.mon, DAYS.wed] },
      { name: 'Guardian Scramble', times: ['13:00'], days: [DAYS.sun, DAYS.tue] },
    ],
  },

  {
    id: 'war_zones',
    name: 'War Zones',
    icon: '🏰',
    events: [
      { name: 'Garden War', times: ['01:00', '05:00', '09:00', '13:00', '17:00', '21:00'], days: 'Daily' },
      { name: 'DS War', times: ['05:00', '11:00', '17:00', '23:00'], days: 'Daily' },
    ],
  },

  {
    id: 'castle',
    name: 'Castle Siege',
    icon: '🏯',
    events: [
      { name: 'Siege Commander Apply', times: ['16:00'], days: [DAYS.fri] },
      { name: 'Siege Raid Apply', times: ['00:00'], days: [DAYS.sat] },
      { name: `Castle Siege - ${getCurrentSiegeName()}`, times: ['01:00'], days: [DAYS.sat] },
      { name: 'Castle Transport', times: ['04:00'], days: [DAYS.wed] },
    ],
  },

  {
    id: 'wonderland',
    name: 'Wonderland',
    icon: '🎪',
    events: [
      { name: 'Wonderland Boss', times: ['02:30', '18:30'], days: 'Daily' },
      { name: 'Wonderland Miraculous Races', times: ['01:00', '07:00', '13:00', '19:00'], days: 'Daily' },
      { name: 'Wonderland Treasure', times: ['21:00'], days: [DAYS.wed] },
      { name: 'Wonderland Treasure', times: ['23:30'], days: [DAYS.sat] },
    ],
  },

  {
    id: 'custom_events',
    name: 'Custom Events',
    icon: '🎉',
    events: [
      { name: 'Merchants Day (Drag Essence Packs)', times: ['04:00'], days: [DAYS.fri] },
      { name: 'Merchants Day (Onyx Packs)', times: ['04:00'], days: [DAYS.mon] },
      { name: 'Merchants Day (Land Packs)', times: ['04:00'], days: [DAYS.sat] },
      { name: 'Treasures Hunter Day', times: ['04:00'], days: [DAYS.wed] },
      { name: 'Fishing Day', times: ['04:00'], days: [DAYS.tue, DAYS.sat] },
      { name: 'GM Dragon (maybe)', times: ['18:00'], days: [DAYS.sat] },
      { name: 'GM Wonderland Races (maybe)', times: ['23:00'], days: [DAYS.mon] },
      { name: 'GM Hide & Seek (maybe)', times: ['14:00'], days: [DAYS.sat] },
      { name: 'GM Raging Tank (maybe)', times: ['18:00'], days: [DAYS.sun] },
    ],
  },

  {
    id: 'other',
    name: 'Other Events',
    icon: '📅',
    events: [
      { name: 'Exile Language Tutor', times: ['01:10', '05:10', '09:10', '13:10', '17:10', '21:10'], days: 'Daily' },
      { name: 'Ayanad Merchant', times: ['16:00', '22:00'], days: 'Daily' },
      { name: 'Evenbard', times: ['02:00', '06:00', '10:00', '14:00', '18:00', '22:00'], days: 'Daily' },
      { name: 'Hero Nui Reset', times: ['04:00'], days: [DAYS.sun] },
      { name: 'Faction Activity Reset', times: ['04:00'], days: [DAYS.sun] },
      { name: 'Daily Reset', times: ['04:00'], days: [DAYS.mon, DAYS.tue, DAYS.wed, DAYS.thu, DAYS.fri, DAYS.sat] },
      { name: 'Weekly Reset', times: ['04:00'], days: [DAYS.sun] },
      { name: 'Server Maintenance', times: ['11:00'], days: [DAYS.tue] },
    ],
  },

  {
    id: 'festival',
    name: 'Festival',
    icon: '🎊',
    events: [
      { name: 'Gigantic Honeybee Festival', times: ['04:00', '18:00', '23:00'], days: 'Daily' },
    ],
  },
];

export const eventData = {
  serverEvents: eventCategories.flatMap((cat) => cat.events),
};
