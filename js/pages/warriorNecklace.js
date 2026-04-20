import { appState } from "../state.js";
import { escapeHtml, formatGold, jsEscape, renderMaterialsGrid } from "../utils.js";

const LOCAL_KEY = "warriorNecklaceQuantities";

function getQuantities() {
  return JSON.parse(localStorage.getItem(LOCAL_KEY) || "{}");
}

function saveQuantity(id, value) {
  const data = getQuantities();
  data[id] = Math.max(0, Number(value) || 0);
  localStorage.setItem(LOCAL_KEY, JSON.stringify(data));
}

const sections = [
  {
    id: "complete-proven-warrior-necklace",
    title: "Complete Proven Warrior Necklace",
    prompt: "Enter how many necklaces you want to craft:",
    defaultQty: 1,
    rows: [
      {
        item: "Starlight Archeum Dust",
        qty: 15,
        craftedAmount: 1,
        craftedItemName: "Proven Warrior Necklace Rank 1"
      },
      {
        item: "Starlight Archeum Shard",
        qty: 35,
        craftedAmount: 1,
        craftedItemName: "Proven Warrior Awakening Scroll (Rank 1 -> 13)"
      },
      {
        item: "Starlight Archeum Crystal",
        qty: 38,
        craftedAmount: "",
        craftedItemName: ""
      },
      {
        item: "Starlight Archeum Essence",
        qty: 75,
        craftedAmount: "",
        craftedItemName: ""
      },
      {
        item: "Honorforged Medal",
        qty: 393,
        craftedAmount: "",
        craftedItemName: "",
        specialDisplay: "786000 Honor",
        noMarketPrice: true,
        noGoldCalc: true
      },
      {
        item: "Blank Regrade Scroll",
        qty: 430,
        craftedAmount: "",
        craftedItemName: ""
      }
    ]
  },
  {
    id: "proven-warrior-necklace-rank-1",
    title: "Proven Warrior Necklace Rank 1",
    prompt: "Enter how many necklaces you want to craft:",
    defaultQty: 1,
    rows: [
      {
        item: "Starlight Archeum Dust",
        qty: 15,
        craftedAmount: 1,
        craftedItemName: "Proven Warrior Necklace Rank 1"
      }
    ]
  },
  {
    id: "proven-warrior-awakening-scroll-rank-1",
    title: "Proven Warrior Awakening Scroll (Rank 1)",
    prompt: "Enter how many Scrolls you want to craft:",
    defaultQty: 1,
    rows: [
      {
        item: "Starlight Archeum Dust",
        qty: 10,
        craftedAmount: 1,
        craftedItemName: "Proven Warrior Awakening Scroll (Rank 1)"
      },
      {
        item: "Honorforged Medal",
        qty: 4,
        craftedAmount: "",
        craftedItemName: "",
        specialDisplay: "8000 Honor",
        noMarketPrice: true,
        noGoldCalc: true
      }
    ]
  },
  {
    id: "proven-warrior-awakening-scroll-rank-2",
    title: "Proven Warrior Awakening Scroll (Rank 2)",
    prompt: "Enter how many Scrolls you want to craft:",
    defaultQty: 1,
    rows: [
      {
        item: "Starlight Archeum Shard",
        qty: 5,
        craftedAmount: 1,
        craftedItemName: "Proven Warrior Awakening Scroll (Rank 2)"
      },
      {
        item: "Honorforged Medal",
        qty: 6,
        craftedAmount: "",
        craftedItemName: "",
        specialDisplay: "10000 Honor",
        noMarketPrice: true,
        noGoldCalc: true
      }
    ]
  },
  {
    id: "proven-warrior-awakening-scroll-rank-3",
    title: "Proven Warrior Awakening Scroll (Rank 3)",
    prompt: "Enter how many Scrolls you want to craft:",
    defaultQty: 1,
    rows: [
      {
        item: "Starlight Archeum Shard",
        qty: 10,
        craftedAmount: 1,
        craftedItemName: "Proven Warrior Awakening Scroll (Rank 3)"
      },
      {
        item: "Honorforged Medal",
        qty: 8,
        craftedAmount: "",
        craftedItemName: "",
        specialDisplay: "14000 Honor",
        noMarketPrice: true,
        noGoldCalc: true
      }
    ]
  },
  {
    id: "proven-warrior-awakening-scroll-rank-4",
    title: "Proven Warrior Awakening Scroll (Rank 4)",
    prompt: "Enter how many Scrolls you want to craft:",
    defaultQty: 1,
    rows: [
      {
        item: "Starlight Archeum Shard",
        qty: 20,
        craftedAmount: 1,
        craftedItemName: "Proven Warrior Awakening Scroll (Rank 4)"
      },
      {
        item: "Honorforged Medal",
        qty: 10,
        craftedAmount: "",
        craftedItemName: "",
        specialDisplay: "20000 Honor",
        noMarketPrice: true,
        noGoldCalc: true
      }
    ]
  },
  {
    id: "proven-warrior-awakening-scroll-rank-5",
    title: "Proven Warrior Awakening Scroll (Rank 5)",
    prompt: "Enter how many Scrolls you want to craft:",
    defaultQty: 1,
    rows: [
      {
        item: "Starlight Archeum Crystal",
        qty: 5,
        craftedAmount: 1,
        craftedItemName: "Proven Warrior Awakening Scroll (Rank 5)"
      },
      {
        item: "Honorforged Medal",
        qty: 12,
        craftedAmount: "",
        craftedItemName: "",
        specialDisplay: "24000 Honor",
        noMarketPrice: true,
        noGoldCalc: true
      }
    ]
  },
  {
    id: "proven-warrior-awakening-scroll-rank-6",
    title: "Proven Warrior Awakening Scroll (Rank 6)",
    prompt: "Enter how many Scrolls you want to craft:",
    defaultQty: 1,
    rows: [
      {
        item: "Starlight Archeum Crystal",
        qty: 6,
        craftedAmount: 1,
        craftedItemName: "Proven Warrior Awakening Scroll (Rank 6)"
      },
      {
        item: "Honorforged Medal",
        qty: 16,
        craftedAmount: "",
        craftedItemName: "",
        specialDisplay: "32000 Honor",
        noMarketPrice: true,
        noGoldCalc: true
      },
      {
        item: "Blank Regrade Scroll",
        qty: 10,
        craftedAmount: "",
        craftedItemName: ""
      }
    ]
  },
  {
    id: "proven-warrior-awakening-scroll-rank-7",
    title: "Proven Warrior Awakening Scroll (Rank 7)",
    prompt: "Enter how many Scrolls you want to craft:",
    defaultQty: 1,
    rows: [
      {
        item: "Starlight Archeum Crystal",
        qty: 12,
        craftedAmount: 1,
        craftedItemName: "Proven Warrior Awakening Scroll (Rank 7)"
      },
      {
        item: "Honorforged Medal",
        qty: 20,
        craftedAmount: "",
        craftedItemName: "",
        specialDisplay: "40000 Honor",
        noMarketPrice: true,
        noGoldCalc: true
      },
      {
        item: "Blank Regrade Scroll",
        qty: 20,
        craftedAmount: "",
        craftedItemName: ""
      }
    ]
  },
  {
    id: "proven-warrior-awakening-scroll-rank-8",
    title: "Proven Warrior Awakening Scroll (Rank 8)",
    prompt: "Enter how many Scrolls you want to craft:",
    defaultQty: 1,
    rows: [
      {
        item: "Starlight Archeum Crystal",
        qty: 15,
        craftedAmount: 1,
        craftedItemName: "Proven Warrior Awakening Scroll (Rank 8)"
      },
      {
        item: "Honorforged Medal",
        qty: 25,
        craftedAmount: "",
        craftedItemName: "",
        specialDisplay: "44000 Honor",
        noMarketPrice: true,
        noGoldCalc: true
      },
      {
        item: "Blank Regrade Scroll",
        qty: 25,
        craftedAmount: "",
        craftedItemName: ""
      }
    ]
  },
  {
    id: "proven-warrior-awakening-scroll-rank-9",
    title: "Proven Warrior Awakening Scroll (Rank 9)",
    prompt: "Enter how many Scrolls you want to craft:",
    defaultQty: 1,
    rows: [
      {
        item: "Starlight Archeum Essence",
        qty: 3,
        craftedAmount: 1,
        craftedItemName: "Proven Warrior Awakening Scroll (Rank 9)"
      },
      {
        item: "Honorforged Medal",
        qty: 35,
        craftedAmount: "",
        craftedItemName: "",
        specialDisplay: "70000 Honor",
        noMarketPrice: true,
        noGoldCalc: true
      },
      {
        item: "Blank Regrade Scroll",
        qty: 25,
        craftedAmount: "",
        craftedItemName: ""
      }
    ]
  },
  {
    id: "proven-warrior-awakening-scroll-rank-10",
    title: "Proven Warrior Awakening Scroll (Rank 10)",
    prompt: "Enter how many Scrolls you want to craft:",
    defaultQty: 1,
    rows: [
      {
        item: "Starlight Archeum Essence",
        qty: 6,
        craftedAmount: 1,
        craftedItemName: "Proven Warrior Awakening Scroll (Rank 10)"
      },
      {
        item: "Honorforged Medal",
        qty: 45,
        craftedAmount: "",
        craftedItemName: "",
        specialDisplay: "70000 Honor",
        noMarketPrice: true,
        noGoldCalc: true
      },
      {
        item: "Blank Regrade Scroll",
        qty: 50,
        craftedAmount: "",
        craftedItemName: ""
      }
    ]
  },
  {
    id: "proven-warrior-awakening-scroll-rank-11",
    title: "Proven Warrior Awakening Scroll (Rank 11)",
    prompt: "Enter how many Scrolls you want to craft:",
    defaultQty: 1,
    rows: [
      {
        item: "Starlight Archeum Essence",
        qty: 14,
        craftedAmount: 1,
        craftedItemName: "Proven Warrior Awakening Scroll (Rank 11)"
      },
      {
        item: "Honorforged Medal",
        qty: 55,
        craftedAmount: "",
        craftedItemName: "",
        specialDisplay: "90000 Honor",
        noMarketPrice: true,
        noGoldCalc: true
      },
      {
        item: "Blank Regrade Scroll",
        qty: 75,
        craftedAmount: "",
        craftedItemName: ""
      }
    ]
  },
  {
    id: "proven-warrior-awakening-scroll-rank-12",
    title: "Proven Warrior Awakening Scroll (Rank 12)",
    prompt: "Enter how many Scrolls you want to craft:",
    defaultQty: 1,
    rows: [
      {
        item: "Starlight Archeum Essence",
        qty: 22,
        craftedAmount: 1,
        craftedItemName: "Proven Warrior Awakening Scroll (Rank 12)"
      },
      {
        item: "Honorforged Medal",
        qty: 70,
        craftedAmount: "",
        craftedItemName: "",
        specialDisplay: "120000 Honor",
        noMarketPrice: true,
        noGoldCalc: true
      },
      {
        item: "Blank Regrade Scroll",
        qty: 100,
        craftedAmount: "",
        craftedItemName: ""
      }
    ]
  },
  {
    id: "proven-warrior-awakening-scroll-rank-13",
    title: "Proven Warrior Awakening Scroll (Rank 13)",
    prompt: "Enter how many Scrolls you want to craft:",
    defaultQty: 1,
    rows: [
      {
        item: "Starlight Archeum Essence",
        qty: 30,
        craftedAmount: 1,
        craftedItemName: "Proven Warrior Awakening Scroll (Rank 13)"
      },
      {
        item: "Honorforged Medal",
        qty: 85,
        craftedAmount: "",
        craftedItemName: "",
        specialDisplay: "176000 Honor",
        noMarketPrice: true,
        noGoldCalc: true
      },
      {
        item: "Blank Regrade Scroll",
        qty: 125,
        craftedAmount: "",
        craftedItemName: ""
      }
    ]
  }
];

function getPrice(itemName) {
  return Number(appState.prices[itemName] || 0);
}

function getStorage(itemName) {
  return Number(appState.storage[itemName] || 0);
}

// ─── Where Am I ───────────────────────────────────────────────────────────────

const WAI_KEY_WN = 'warriorNecklaceWAI';
const MAX_NECKLACE_RANK = 13;

function getWAINecklaceRank() { return parseInt(localStorage.getItem(WAI_KEY_WN) ?? '0'); }
function saveWAINecklaceRank(r) { localStorage.setItem(WAI_KEY_WN, String(r)); }

function renderNecklaceWhereAmI() {
  const currentRank = getWAINecklaceRank();
  const pct         = Math.round((currentRank / MAX_NECKLACE_RANK) * 100);
  const remaining   = MAX_NECKLACE_RANK - currentRank;

  const rankOpts = Array.from({ length: MAX_NECKLACE_RANK + 1 }, (_, i) =>
    `<option value="${i}" ${i === currentRank ? 'selected' : ''}>Rank ${i}${i === 0 ? ' (just crafted)' : i === MAX_NECKLACE_RANK ? ' (max)' : ''}</option>`
  ).join('');

  return `
    <div class="card" id="necklace-where-am-i">
      <h3 style="margin-top:0;">Where Am I?</h3>
      <p class="notice" style="margin:0 0 16px 0;">
        Select your necklace's current rank to see how many Awakening Scrolls you still need.
      </p>
      <div style="margin-bottom:16px;">
        <label style="display:block;font-size:0.8em;color:#8d99ab;margin-bottom:4px;text-transform:uppercase;letter-spacing:0.05em;">Current Rank</label>
        <select onchange="window.updateNecklaceWAI(parseInt(this.value))"
          style="width:100%;max-width:260px;background:#131920;border:1px solid #394252;border-radius:6px;color:#eef2f7;padding:8px 10px;font-size:0.9em;">
          ${rankOpts}
        </select>
      </div>
      <div style="background:#1a2535;border:1px solid #394252;border-radius:10px;padding:16px;">
        <div style="font-size:0.78em;color:#8d99ab;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px;">Your Necklace</div>
        <div style="font-size:1.05em;font-weight:700;color:#5b8fd4;">Proven Warrior Necklace — Rank ${currentRank}</div>
        <div style="margin-top:6px;">
          <div style="height:10px;background:#0d1b2a;border-radius:5px;overflow:hidden;">
            <div style="height:100%;width:${pct}%;background:#5b8fd4;border-radius:5px;transition:width 0.3s ease;"></div>
          </div>
          <div style="font-size:0.78em;color:#8d99ab;margin-top:3px;">${currentRank} / ${MAX_NECKLACE_RANK} ranks completed</div>
        </div>
        ${currentRank >= MAX_NECKLACE_RANK
          ? `<div style="color:#4ade80;font-weight:700;margin-top:12px;">Your necklace is fully upgraded!</div>`
          : `<div style="color:#8d99ab;font-size:0.88em;margin-top:10px;">
               You still need <strong style="color:#eef2f7;">${remaining}</strong> Awakening Scroll${remaining !== 1 ? 's' : ''}
               (Rank ${currentRank + 1}–${MAX_NECKLACE_RANK}).
             </div>`
        }
      </div>
    </div>
  `;
}

function renderSection(section, quantity) {

  return `
    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:flex-end;gap:12px;flex-wrap:wrap;margin-bottom:10px;">
        <div>
          <h3 style="margin:0;">${escapeHtml(section.title)}</h3>
        </div>
        <div>
          <label style="display:block;margin-bottom:4px;">${escapeHtml(section.prompt)}</label>
          <input
            type="number"
            min="0"
            value="${quantity}"
            onchange="window.updateWarriorNecklaceQty('${jsEscape(section.id)}', this.value)"
          >
        </div>
      </div>

      ${renderMaterialsGrid(section.rows.map(row => {
        const required      = row.qty * quantity;
        const inStorage     = getStorage(row.item);
        const price         = row.noMarketPrice ? 0 : getPrice(row.item);
        const stillNeed     = Math.max(0, required - inStorage);
        const goldStillNeed = row.noGoldCalc ? 0 : stillNeed * price;
        const totalGold     = row.noGoldCalc ? 0 : required * price;
        const craftedAmt    = row.craftedAmount ? (Number(row.craftedAmount) || 0) * quantity : 0;
        return {
          name:          row.item,
          required, inStorage, price,
          stillNeed, goldStillNeed, totalGold,
          note:    row.specialDisplay || null,
          crafted: craftedAmt && row.craftedItemName
                     ? `${craftedAmt.toLocaleString()}\u00d7 ${row.craftedItemName}`
                     : null
        };
      }))}
    </div>
  `;
}

export function renderPage() {
  const quantities = getQuantities();

  let html = `
    <div class="card">
      <h2>Warrior Necklace</h2>
      <p class="notice">
        Prices &amp; Storage is the only source of truth for Market Price and In Storage.
        Total Gold is calculated as Amount × Gold Per Unit.
        Total Gold Needed is the sum of all Total Gold rows in that section.
      </p>
    </div>
    ${renderNecklaceWhereAmI()}
  `;

  sections.forEach((section) => {
    const quantity = quantities[section.id] ?? section.defaultQty ?? 0;
    html += renderSection(section, quantity);
  });

  return html;
}

window.updateNecklaceWAI = function(rank) {
  saveWAINecklaceRank(rank);
  window.renderCurrentPage();
};

window.updateWarriorNecklaceQty = function(id, value) {
  saveQuantity(id, value);
  window.renderCurrentPage();
};