// ArcheRage Event Schedule Data
// Times are in server time (America/New_York)
// Sources: wiki.archerage.to/schedules/events + sadly.io

export const eventCategories = [
  {
    id: 'rifts',
    name: 'Rifts',
    icon: '🌀',
    events: [
      { name: 'Crimson Rift (Auroria)',                    times: ['00:20','04:20','08:20','12:20','16:20','20:20'], days: 'Daily' },
      { name: 'Crimson Rift (Ynystere / Cinderstone Moor)', times: ['03:20','07:20','11:20','15:20','19:20','23:20'], days: 'Daily' },
      { name: 'Grimghast Rift (Ynystere / Cinderstone Moor)', times: ['01:21','05:21','09:21','13:21','17:21','21:21'], days: 'Daily' },
      { name: 'Hiram Rift',                                times: ['00:50','04:50','08:50','12:50','16:50','20:50'], days: 'Daily' },
      { name: 'Oblivion Rift',                             times: ['01:40','03:40','05:40','07:40','09:40','11:40','13:40','15:40','17:40','19:40','21:40','23:40'], days: 'Daily' },
      { name: 'Clockwork Rebellion',                       times: ['01:40','03:40','05:40','07:40','09:40','11:40','13:40','15:40','17:40','19:40','21:40','23:40'], days: 'Daily' },
      { name: 'Hasla Zombie Apocalypse',                   times: ['12:00','19:00'], days: 'Daily' },
      { name: 'Hasla Zombie Apocalypse (Novice)',           times: ['18:00'], days: ['Sunday','Monday','Tuesday','Wednesday'] },
      { name: 'Lusca Awakening',                           times: ['15:30','20:00'], days: 'Daily' },
    ]
  },
  {
    id: 'instances',
    name: 'Instances',
    icon: '⚔️',
    events: [
      { name: 'Kadum',               times: ['06:30','10:00','19:00'], days: ['Tuesday','Saturday','Sunday'] },
      { name: 'Golden Plains Battle', times: ['07:00','11:30','21:00'], days: 'Daily' },
      { name: 'The Fall of Hiram City', times: ['07:00','17:00'],      days: ['Friday','Sunday'] },
      { name: "Red Dragon's Keep",   times: ['06:30','10:00','19:00'], days: ['Sunday','Monday','Wednesday'] },
    ]
  },
  {
    id: 'world_bosses',
    name: 'World Bosses',
    icon: '💀',
    events: [
      { name: 'Jola, Meina & Glenn', times: ['02:20','06:20','10:20','14:20','18:20','22:20'], days: 'Daily' },
      { name: 'Leviathan',           times: ['19:05'], days: ['Monday','Wednesday','Friday'] },
      { name: 'Kraken',              times: ['17:30'], days: ['Tuesday','Saturday'] },
      { name: 'Kraken',              times: ['09:30'], days: ['Sunday'] },
      { name: 'Black Dragon',        times: ['16:00'], days: ['Saturday'] },
      { name: 'Black Dragon',        times: ['08:00'], days: ['Sunday'] },
      { name: 'Black Dragon',        times: ['19:00'], days: ['Tuesday'] },
      { name: 'Charybdis',           times: ['20:30'], days: ['Thursday','Sunday'] },
      { name: 'Anthalon (Garden)',   times: ['20:00'], days: ['Wednesday','Saturday'] },
      { name: 'Anthalon (Garden)',   times: ['12:00'], days: ['Sunday'] },
    ]
  },
  {
    id: 'custom_events',
    name: 'Custom Events',
    icon: '🎉',
    events: [
      { name: 'The Fishers Day!',        times: ['23:00'], days: ['Monday','Friday'] },
      { name: 'Treasures Hunter Day!',   times: ['23:00'], days: ['Tuesday'] },
      { name: 'The Merchants Day!',      times: ['23:00'], days: ['Thursday','Friday','Sunday'] },
      { name: 'Relentless Dragons Hunt', times: ['13:00'], days: ['Saturday'] },
      { name: 'Gladiators Tournament',   times: ['15:00'], days: ['Sunday'] },
      { name: 'Wonderland Races',        times: ['18:00'], days: ['Monday'] },
    ]
  },
  {
    id: 'custom_bosses',
    name: 'Custom Bosses',
    icon: '👹',
    events: [
      { name: 'Sea Spirit General',  times: ['23:00'], days: ['Tuesday','Friday'] },
      { name: 'Sea Spirit General',  times: ['12:30'], days: ['Wednesday','Saturday'] },
      { name: 'Aragog',              times: ['10:30','20:30'], days: ['Friday','Sunday'] },
      { name: 'Harbinger',           times: ['12:30'], days: ['Monday','Friday'] },
      { name: 'Harbinger',           times: ['23:00'], days: ['Sunday','Thursday'] },
    ]
  },
  {
    id: 'pvp',
    name: 'PvP Events',
    icon: '🏹',
    events: [
      { name: 'Abyssal Attack',     times: ['14:59','19:29'], days: ['Tuesday','Thursday','Saturday'] },
      { name: 'Guardian Scramble',  times: ['08:00','20:00'], days: ['Sunday','Tuesday'] },
    ]
  },
  {
    id: 'war_zones',
    name: 'War Zones',
    icon: '🏰',
    events: [
      { name: 'Garden of the Gods', times: ['00:00','04:00','08:00','12:00','16:00','20:00'], days: 'Daily' },
      { name: 'Diamond Shores',     times: ['02:00','08:00','14:00','20:00'],                 days: 'Daily' },
      { name: 'Akasch Invasion',    times: ['07:30','15:30','20:30'], days: ['Saturday','Monday'] },
    ]
  },
  {
    id: 'wonderland',
    name: 'Wonderland',
    icon: '🎪',
    events: [
      { name: 'Miraculous Races',    times: ['02:00','08:00','14:00','20:00'], days: 'Daily' },
      { name: 'Boss Waking Nightmare', times: ['13:30','21:30'],              days: 'Daily' },
      { name: 'Wonderland Treasure', times: ['15:55'], days: ['Wednesday'] },
      { name: 'Wonderland Treasure', times: ['18:25'], days: ['Saturday'] },
    ]
  },
  {
    id: 'other',
    name: 'Other Events',
    icon: '📅',
    events: [
      { name: 'Mirage Isle Fish-Fest', times: ['11:00'], days: ['Saturday'] },
      { name: 'Language Instructor',   times: ['03:00','07:00','11:00','15:00','19:00','23:00'], days: 'Daily' },
      { name: 'Daily Reset',           times: ['23:00'], days: 'Daily' },
      { name: 'Weekly Reset',          times: ['23:00'], days: ['Sunday'] },
    ]
  },
];

// Flat list for backwards compatibility
export const eventData = {
  serverEvents: eventCategories.flatMap(cat => cat.events)
};