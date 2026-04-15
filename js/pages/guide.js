// ─── GUIDE PAGE ───────────────────────────────────────────────────────────────

const SECTIONS = [
  { id: 'install-addons',   icon: '⬇',  label: 'Step 1: Install Addons' },
  { id: 'getting-started',  icon: '🚀', label: 'Getting Started'       },
  { id: 'ah-scanner',       icon: '💰', label: 'AH Scanner'            },
  { id: 'inv-scanner',      icon: '🎒', label: 'Inventory Scanner'     },
  { id: 'prices-storage',   icon: '📦', label: 'Prices & Storage'      },
  { id: 'calculators',      icon: '⚙',  label: 'Calculators'           },
  { id: 'events',           icon: '📅', label: 'Events Schedule'       },
  { id: 'wiki',             icon: '📖', label: 'Wiki & Guides'         },
  { id: 'arc-points',       icon: '✦',  label: 'ARC Points'            },
  { id: 'costume-builder',  icon: '👗', label: 'Costume Builder'       },
  { id: 'pro',              icon: '⭐', label: 'Free vs Pro'           },
];

function tip(text) {
  return `<div style="background:#0f1923;border-left:3px solid #93c5fd;border-radius:0 8px 8px 0;
    padding:10px 14px;margin:10px 0;font-size:13px;color:#93c5fd;">${text}</div>`;
}

function warn(text) {
  return `<div style="background:#1a1000;border-left:3px solid #fcd34d;border-radius:0 8px 8px 0;
    padding:10px 14px;margin:10px 0;font-size:13px;color:#fcd34d;">${text}</div>`;
}

function cmd(text) {
  return `<code style="background:#0f1923;border:1px solid #2a3a52;padding:2px 8px;
    border-radius:5px;font-size:13px;color:#86efac;font-family:monospace;">${text}</code>`;
}

function step(n, title, body) {
  return `
    <div style="display:flex;gap:12px;margin-bottom:14px;">
      <div style="width:28px;height:28px;border-radius:50%;background:#1a2535;border:1px solid #2d5a8a;
        display:flex;align-items:center;justify-content:center;flex-shrink:0;
        font-size:13px;font-weight:700;color:#93c5fd;margin-top:1px;">${n}</div>
      <div>
        <div style="font-size:14px;font-weight:600;color:#eef2f7;margin-bottom:4px;">${title}</div>
        <div style="font-size:13px;color:#94a3b8;line-height:1.6;">${body}</div>
      </div>
    </div>
  `;
}

function section(id, icon, title, content) {
  return `
    <div id="guide-${id}" class="card" style="scroll-margin-top:20px;">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">
        <span style="font-size:1.4em;">${icon}</span>
        <h3 style="margin:0;color:#eef2f7;">${title}</h3>
      </div>
      ${content}
    </div>
  `;
}

function renderTableOfContents() {
  const items = SECTIONS.map(s => `
    <a href="#guide-${s.id}" onclick="document.getElementById('guide-${s.id}')?.scrollIntoView({behavior:'smooth'});return false;"
      style="display:flex;align-items:center;gap:8px;padding:8px 12px;background:#1a2028;
      border:1px solid #2a3040;border-radius:8px;text-decoration:none;color:#cbd5e1;
      font-size:13px;transition:background 0.15s;"
      onmouseover="this.style.background='#1e2535'" onmouseout="this.style.background='#1a2028'">
      <span>${s.icon}</span><span>${s.label}</span>
    </a>
  `).join('');

  return `
    <div class="card">
      <h3 style="margin:0 0 14px;color:#eef2f7;">What do you need help with?</h3>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:8px;">
        ${items}
      </div>
    </div>
  `;
}

function renderInstallAddons() {
  return section('install-addons', '⬇', 'Step 1: Install the Addons', `
    <div style="background:#1a0f0f;border:1px solid #5a2a2a;border-radius:10px;padding:14px 16px;margin-bottom:16px;">
      <div style="font-size:14px;font-weight:700;color:#f87171;margin-bottom:6px;">Do this before anything else.</div>
      <div style="font-size:13px;color:#94a3b8;line-height:1.6;">
        The AH Scanner and Inventory Scanner are Lua addons that run inside ArcheRage.
        Without them, the app can't pull prices or inventory from the game.
        Install them first — you can always reinstall from the <strong style="color:#93c5fd;">Addons</strong> page if something goes wrong.
      </div>
    </div>

    ${step(1, 'Open the Addons page',
      `Click <strong style="color:#93c5fd;">Addons</strong> in the left menu under Tools.`
    )}
    ${step(2, 'Select your ArcheRage addon folder',
      `Click <strong>Select Folder</strong> and navigate to your
      <code style="background:#0f1923;padding:1px 5px;border-radius:4px;">Documents\\ArcheRage\\Addon</code> folder.
      This is where ArcheRage loads addons from.`
    )}
    ${step(3, 'Click Install All Addons',
      `The app copies the AH Scanner and Inventory Scanner into your addon folder automatically.`
    )}
    ${step(4, 'Restart ArcheRage',
      `Log in and type ${cmd('!scanhelp')} in chat. If you see a response, the addon loaded correctly.`
    )}

    ${tip('If the install fails or something breaks, go back to the <strong>Addons</strong> page and click Reinstall at any time. It overwrites the existing files with a clean copy.')}
    ${warn('The Addons page shows a green "Installed" badge once each addon is detected. If it still shows red after installing, double-check you selected the right folder.')}
  `);
}

function renderGettingStarted() {
  return section('getting-started', '🚀', 'Getting Started', `
    <p style="font-size:13px;color:#94a3b8;margin:0 0 16px;line-height:1.6;">
      Welcome to the ArcheRage Companion app — a desktop tool built specifically for the ArcheRage private server.
      Here's how to get up and running in a few minutes.
    </p>

    ${step(1, 'Sign in with Discord',
      `Click <strong style="color:#93c5fd;">Sign in with Discord</strong> on the home screen.
      A Discord login window will pop up — authorize the app and you're in.
      Your Discord username is used for your account. No password needed.`
    )}

    ${step(2, 'Install the addons',
      `If you want to use the AH Scanner or Inventory Scanner, the app will show a red banner at the top
      saying the addons aren't found. Click <strong style="color:#f87171;">Install Addons</strong>,
      select your <code style="background:#0f1923;padding:1px 5px;border-radius:4px;">Documents\\ArcheRage\\Addon</code> folder,
      and the app copies everything over automatically.`
    )}

    ${step(3, 'Set your In-Game Name (IGN)',
      `Click <strong>✎ Profile</strong> on the home screen and enter your ArcheRage character name.
      This is used for ARC Point redemptions and wiki article credits.`
    )}

    ${step(4, 'Explore the tools',
      `Use the tab bar on the left to navigate. Calculators are under <strong>Calculators</strong>,
      scanners live under <strong>Prices &amp; Storage</strong>, and community guides are in <strong>Wiki</strong>.`
    )}

    ${tip('Free users get access to all calculators, events, wiki, and the AH Scanner addon. Pro unlocks Net Worth, Recipe Lookup, daily price feeds, and more.')}
  `);
}

function renderAHScanner() {
  return section('ah-scanner', '💰', 'AH Scanner', `
    <p style="font-size:13px;color:#94a3b8;margin:0 0 16px;line-height:1.6;">
      The AH Scanner is a Lua addon that searches the Auction House for a list of items and records
      their prices. You run it in-game, then import the results into the app.
    </p>

    <div style="font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;
      color:#566174;margin-bottom:10px;">Setup (one-time)</div>

    ${step(1, 'Install the addon',
      `From the Home page, click <strong style="color:#f87171;">Install Addons</strong> when the red banner appears,
      or go to Home and click the Install button. Select your ArcheRage Addon folder.`
    )}

    ${step(2, 'Restart ArcheRage',
      `Log into the game and type ${cmd('!scanhelp')} in chat to confirm the addon loaded.`
    )}

    <div style="font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;
      color:#566174;margin:16px 0 10px;">In-Game Commands</div>

    <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:16px;">
      ${[
        ['!scan',          'Smart scan — skips items scanned in the last 3 days'],
        ['!scanfull',      'Scan everything regardless of age'],
        ['!scanage 7',     'Scan items older than 7 days'],
        ['!scanstatus',    'Show current scan progress'],
        ['!scanstop',      'Stop an in-progress scan'],
        ['!scanshow',      'Show the last scan results in chat'],
        ['!scanhelp',      'Show all commands'],
      ].map(([c, d]) => `
        <div style="display:flex;align-items:center;gap:10px;padding:7px 10px;
          background:#1a2028;border:1px solid #2a3040;border-radius:8px;">
          ${cmd(c)}
          <span style="font-size:13px;color:#8d99ab;">${d}</span>
        </div>
      `).join('')}
    </div>

    <div style="font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;
      color:#566174;margin-bottom:10px;">Importing Prices</div>

    ${step(1, 'Run a scan in-game', `Type ${cmd('!scan')} and wait for it to finish. The addon will say "Scan complete" when done.`)}
    ${step(2, 'Import in the app', `Go to <strong>Prices &amp; Storage</strong> and click <strong style="color:#86efac;">Import AH Prices</strong>. The app reads the scan file and updates all prices automatically.`)}

    ${tip('The scan reads items from a list called <strong>scan_items.csv</strong> inside the addon folder. Ashkan manages this list — new items get added as they\'re discovered by the community.')}
    ${warn('The AH search is substring-based — the scanner filters results to exact name matches so prices are always accurate.')}
  `);
}

function renderInvScanner() {
  return section('inv-scanner', '🎒', 'Inventory Scanner', `
    <p style="font-size:13px;color:#94a3b8;margin:0 0 16px;line-height:1.6;">
      The Inventory Scanner records what items you have in your bags and where they are.
      Import the results to keep your Prices &amp; Storage quantities up to date automatically.
    </p>

    ${step(1, 'Open your bags in-game', `Make sure your character\'s bags are visible.`)}
    ${step(2, 'Start the scan', `Type ${cmd('!scanstart')} in chat. A guided wizard window will appear.`)}
    ${step(3, 'Follow the wizard', `The wizard walks you through scanning your bag, storage, and guild bank cells one at a time. Click the buttons it shows — it tells you exactly what to open.`)}
    ${step(4, 'Import in the app', `Go to <strong>Prices &amp; Storage</strong> and click <strong style="color:#86efac;">Import Inventory</strong>. Your quantities update instantly.`)}

    ${warn('Bank, Guild Bank, and Coffer scanning are currently limited due to a server-side API issue. Bag scanning works fully. The other containers will be enabled once the server is updated.')}
    ${tip('The inventory scanner replaces your stored quantities with the scan results — it\'s the source of truth. Running it regularly keeps your Net Worth accurate.')}
  `);
}

function renderPricesStorage() {
  return section('prices-storage', '📦', 'Prices & Storage', `
    <p style="font-size:13px;color:#94a3b8;margin:0 0 16px;line-height:1.6;">
      Prices &amp; Storage is your item database. Track how much things are worth and how many you have.
      It powers the Net Worth page and all the calculator cost estimates.
    </p>

    <div style="font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;
      color:#566174;margin-bottom:10px;">Ways to update prices</div>

    <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px;">
      <div style="padding:10px 14px;background:#1a2028;border:1px solid #2a3040;border-radius:8px;">
        <div style="font-size:13px;font-weight:600;color:#eef2f7;margin-bottom:3px;">AH Scanner Import</div>
        <div style="font-size:13px;color:#8d99ab;">Run ${cmd('!scan')} in-game, then click Import AH Prices. Fast and accurate.</div>
      </div>
      <div style="padding:10px 14px;background:#1a2028;border:1px solid #2a3040;border-radius:8px;">
        <div style="font-size:13px;font-weight:600;color:#eef2f7;margin-bottom:3px;">Community Prices</div>
        <div style="font-size:13px;color:#8d99ab;">Prices submitted by other players and verified by Ashkan are auto-filled for Pro users.</div>
      </div>
      <div style="padding:10px 14px;background:#1a2028;border:1px solid #2a3040;border-radius:8px;">
        <div style="font-size:13px;font-weight:600;color:#eef2f7;margin-bottom:3px;">Manual Entry</div>
        <div style="font-size:13px;color:#8d99ab;">Click any price field to type it in directly. Good for one-off updates.</div>
      </div>
    </div>

    <div style="font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;
      color:#566174;margin-bottom:10px;">Ways to update quantities</div>

    <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px;">
      <div style="padding:10px 14px;background:#1a2028;border:1px solid #2a3040;border-radius:8px;">
        <div style="font-size:13px;font-weight:600;color:#eef2f7;margin-bottom:3px;">Inventory Scanner Import</div>
        <div style="font-size:13px;color:#8d99ab;">Run ${cmd('!scanstart')} in-game, then click Import Inventory. Replaces all quantities with the scan results.</div>
      </div>
      <div style="padding:10px 14px;background:#1a2028;border:1px solid #2a3040;border-radius:8px;">
        <div style="font-size:13px;font-weight:600;color:#eef2f7;margin-bottom:3px;">Manual Entry</div>
        <div style="font-size:13px;color:#8d99ab;">Click any quantity field to type it in. Useful if you\'ve crafted or sold items since your last scan.</div>
      </div>
    </div>

    ${tip('Use the search and filter bar at the top to find items quickly. You can filter by category, or show only items with prices, quantities, or both.')}
  `);
}

function renderCalculators() {
  const calcs = [
    { name: 'Erenor Crafts',      desc: 'Calculate material costs and profit margins for crafting Erenor-grade gear.' },
    { name: 'Erenor Upgrading',   desc: 'Plan your Erenor upgrade path and see how many synthesis stones you need.' },
    { name: 'Erenor Cloak',       desc: 'Track crafting progress and material requirements for the Erenor Cloak.' },
    { name: 'Library Gear',       desc: 'Calculate the cost and labor to craft Library gear pieces.' },
    { name: 'Hiram Gear',         desc: 'Plan Hiram gear upgrades from Awakened to Radiant and beyond.' },
    { name: 'Warrior Necklace',   desc: 'Calculate upgrade costs and infusion requirements for the Warrior Necklace.' },
    { name: 'Akash Progress',     desc: 'Track your Akash level progression and remaining material needs.' },
    { name: 'Ipnysh Artifacts',   desc: 'Calculate the synthesis and upgrade costs for Ipnysh artifacts.' },
    { name: 'Castle Infusions',   desc: 'Plan your castle infusion costs across multiple upgrade tiers.' },
    { name: 'Misc.',              desc: 'Smaller calculators that don\'t fit elsewhere — check it out for hidden gems.' },
  ];

  const rows = calcs.map(c => `
    <div style="padding:10px 14px;background:#1a2028;border:1px solid #2a3040;border-radius:8px;">
      <div style="font-size:13px;font-weight:600;color:#eef2f7;margin-bottom:3px;">${c.name}</div>
      <div style="font-size:13px;color:#8d99ab;">${c.desc}</div>
    </div>
  `).join('');

  return section('calculators', '⚙', 'Calculators', `
    <p style="font-size:13px;color:#94a3b8;margin:0 0 16px;line-height:1.6;">
      All calculators pull prices from your Prices &amp; Storage data automatically.
      Keep your prices up to date with the AH Scanner for the most accurate cost estimates.
    </p>
    <div style="display:flex;flex-direction:column;gap:8px;">
      ${rows}
    </div>
    ${tip('Set your prices in Prices & Storage first — the calculators use them to give you real gold cost estimates instead of zeros.')}
  `);
}

function renderEvents() {
  return section('events', '📅', 'Events Schedule', `
    <p style="font-size:13px;color:#94a3b8;margin:0 0 16px;line-height:1.6;">
      35 ArcheRage events across 8 categories, all with live countdown timers.
      Times are shown in server time (Eastern Time).
    </p>

    ${step(1, 'Browse upcoming events', `The Home page shows the next 5 events. For the full schedule with all categories, go to <strong>Events Schedule</strong> in the tab bar.`)}
    ${step(2, 'Turn on notifications', `Click the bell icon next to any event to get a desktop notification when it\'s about to start. Notifications are saved — they stay on after you restart the app.`)}
    ${step(3, 'Use the in-app toast', `When a notification fires, an in-app popup appears with three options: <strong>Snooze 5m</strong>, <strong>Not Going</strong>, and <strong>Got it</strong>. Snooze is great if you\'re mid-fight.`)}

    ${tip('Event categories are collapsible — click the category header to fold it up and keep the schedule clean.')}
    ${warn('All times are Eastern Time (ET). The app handles daylight saving time automatically.')}
  `);
}

function renderWiki() {
  return section('wiki', '📖', 'Wiki & Guides', `
    <p style="font-size:13px;color:#94a3b8;margin:0 0 16px;line-height:1.6;">
      Community-written guides reviewed and approved by Ashkan. Browse tips, builds, and game knowledge
      — or contribute your own.
    </p>

    ${step(1, 'Browse guides', `Go to <strong>Wiki</strong> in the tab bar. Guides are sorted by category. Click any guide to read it.`)}
    ${step(2, 'Submit your own guide', `Go to <strong>Submit a Recipe</strong> (or use the button on the Wiki page). Write your guide, pick a category, and submit. Ashkan reviews and approves it.`)}
    ${step(3, 'Earn ARC Points', `Approved wiki guides earn you <strong style="color:#86efac;">+25 ARC Points</strong>. Approved recipes earn +5. Points can be redeemed for Pro time and other rewards.`)}

    ${tip('The Home page shows the 5 most recently approved guides so you always see what\'s new without digging.')}
  `);
}

function renderArcPoints() {
  return section('arc-points', '✦', 'ARC Points', `
    <p style="font-size:13px;color:#94a3b8;margin:0 0 16px;line-height:1.6;">
      ARC Points are the app\'s reward currency. Earn them by contributing to the community,
      spend them on Pro time, in-game gold, and more.
    </p>

    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;margin-bottom:16px;">
      <div>
        <div style="font-size:10px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;
          color:#566174;margin-bottom:8px;">How to earn</div>
        <div style="display:flex;flex-direction:column;gap:6px;">
          ${[
            ['📖 Submit a wiki guide',   '+25 pts', '#86efac'],
            ['⚗ Submit a recipe',       '+5 pts',  '#93c5fd'],
            ['💰 Submit an AH price',   '+1 pt',   '#8d99ab'],
          ].map(([action, pts, color]) => `
            <div style="display:flex;justify-content:space-between;align-items:center;
              padding:8px 12px;background:#1a2028;border:1px solid #2a3040;border-radius:8px;">
              <span style="font-size:13px;color:#cbd5e1;">${action}</span>
              <span style="font-size:13px;font-weight:700;color:${color};">${pts}</span>
            </div>
          `).join('')}
        </div>
      </div>
      <div>
        <div style="font-size:10px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;
          color:#566174;margin-bottom:8px;">Redeem for</div>
        <div style="display:flex;flex-direction:column;gap:6px;">
          ${[
            ['1 week Pro',   '500 pts'],
            ['1 month Pro',  '2,000 pts'],
            ['In-game gold', 'varies'],
            ['Gift Pro',     'varies'],
          ].map(([label, cost]) => `
            <div style="display:flex;justify-content:space-between;align-items:center;
              padding:8px 12px;background:#1a2028;border:1px solid #2a3040;border-radius:8px;">
              <span style="font-size:13px;color:#cbd5e1;">${label}</span>
              <span style="font-size:13px;font-weight:600;color:#ffd166;">${cost}</span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>

    ${tip('Pro subscribers get 20% off all ARC Point redemptions. Grind guides, save on Pro.')}
  `);
}

function renderCostumeBuilder() {
  return section('costume-builder', '👗', 'Costume Builder', `
    <p style="font-size:13px;color:#94a3b8;margin:0 0 16px;line-height:1.6;">
      Plan your costume and undergarment stat combinations before you commit in-game.
    </p>

    ${step(1, 'Pick your tab', `Switch between <strong>Costume</strong> and <strong>Undergarments</strong> using the tabs at the top.`)}
    ${step(2, 'Select stats', `Choose up to 5 stats from the dropdown. The builder shows you the values at each grade level.`)}
    ${step(3, 'Check the grade badges', `Each stat shows a color-coded grade badge — higher grades give better values. Use this to compare options before crafting.`)}
    ${step(4, 'Use the build order wizard', `The wizard at the bottom of the page tells you the optimal order to apply stats based on what you\'ve selected.`)}

    ${tip('The stat reference table at the bottom of the page shows Eternal-grade (100%) values for every available stat — useful for planning min-maxed builds.')}
  `);
}

function renderPro() {
  return section('pro', '⭐', 'Free vs Pro', `
    <p style="font-size:13px;color:#94a3b8;margin:0 0 16px;line-height:1.6;">
      Most of the app is completely free. Pro unlocks the tools that need backend infrastructure to run.
    </p>

    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;margin-bottom:16px;">
      <div>
        <div style="font-size:10px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;
          color:#566174;margin-bottom:8px;">Free tier — always free</div>
        ${[
          'All crafting calculators',
          'Events schedule with live timers',
          'Wiki & community guides',
          'Costume Builder',
          'AH Scanner addon',
          'Browse community prices',
          'Submit recipes & guides for ARC Points',
        ].map(f => `
          <div style="display:flex;gap:8px;align-items:flex-start;padding:5px 0;
            font-size:13px;color:#94a3b8;border-bottom:1px solid #1e2a38;">
            <span style="color:#86efac;flex-shrink:0;">✓</span>${f}
          </div>
        `).join('')}
      </div>
      <div>
        <div style="font-size:10px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;
          color:#a07a10;margin-bottom:8px;">Pro only</div>
        ${[
          'Net Worth tracker',
          'Bag & Vault Scanner',
          'Daily price feed — auto-updated from AH scans',
          'Add & manage custom items',
          'Recipe Lookup — check if you have the mats',
          '20% discount on ARC Point redemptions',
        ].map(p => `
          <div style="display:flex;gap:8px;align-items:flex-start;padding:5px 0;
            font-size:13px;color:#eef2f7;border-bottom:1px solid #1e2a38;">
            <span style="color:#ffd166;flex-shrink:0;">✦</span>${p}
          </div>
        `).join('')}
      </div>
    </div>

    <div style="font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;
      color:#566174;margin-bottom:10px;">How to get Pro</div>

    <div style="display:flex;flex-direction:column;gap:8px;">
      <div style="padding:10px 14px;background:#1a1a0a;border:1px solid #3a3018;border-radius:8px;">
        <div style="font-size:13px;font-weight:600;color:#ffd166;margin-bottom:3px;">$5.99/month</div>
        <div style="font-size:13px;color:#8d99ab;">Monthly subscription with a 7-day free trial. Payment system coming soon.</div>
      </div>
      <div style="padding:10px 14px;background:#0a1a1a;border:1px solid #1a3a3a;border-radius:8px;">
        <div style="font-size:13px;font-weight:600;color:#86efac;margin-bottom:3px;">2,000 In-Game Credits</div>
        <div style="font-size:13px;color:#8d99ab;">Mail 2,000 credits to <strong style="color:#eef2f7;">Ashkan</strong> in-game, then message <strong style="color:#93c5fd;">Sean6774</strong> on Discord. Pro activated within 1 hour.</div>
      </div>
      <div style="padding:10px 14px;background:#0a0a1a;border:1px solid #1a1a3a;border-radius:8px;">
        <div style="font-size:13px;font-weight:600;color:#93c5fd;margin-bottom:3px;">2,000 ARC Points</div>
        <div style="font-size:13px;color:#8d99ab;">Earn points by submitting guides and recipes. Redeem for 1 month of Pro.</div>
      </div>
    </div>
  `);
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────

export function renderPage() {
  return `
    <div style="max-width:800px;margin:0 auto;">
      <div style="margin-bottom:20px;">
        <h2 style="margin:0 0 4px;color:#eef2f7;">App Guide</h2>
        <div style="font-size:13px;color:#566174;">Everything you need to know to get the most out of ArcheRage Companion.</div>
      </div>

      ${renderTableOfContents()}
      ${renderInstallAddons()}
      ${renderGettingStarted()}
      ${renderAHScanner()}
      ${renderInvScanner()}
      ${renderPricesStorage()}
      ${renderCalculators()}
      ${renderEvents()}
      ${renderWiki()}
      ${renderArcPoints()}
      ${renderCostumeBuilder()}
      ${renderPro()}
    </div>
  `;
}
