import { escapeHtml } from "../utils.js";

const sections = [
  {
    id: "chopped-produce",
    title: "Chopped Produce",
    leftLabel: "Farmhand",
    columns: [
      "Mat",
      "Produce",
      "Timer",
      "FH cap",
      "Vigor",
      "Labor",
      "AR FH time",
      "Total time"
    ],
    rows: [
      ["Potato", "100", "10m", "1", "1", "1", "6m", "6m"],
      ["Cucumber", "100", "10m", "1", "1", "1", "6m", "6m"],
      ["Carrot", "100", "43m", "1", "1", "1", "25m", "25m"],
      ["Onion", "100", "43m", "1", "1", "1", "25m", "25m"],
      ["Tomato", "100", "1h 26m", "1", "1", "1", "51m", "51m"],
      ["Garlic", "100", "1h 26m", "1", "1", "1", "51m", "51m"],
      ["Strawberry", "200", "4h 18m", "1", "1", "3", "2h 34m", "2h 34m"],
      ["Pumpkin", "200", "4h 18m", "1", "1", "3", "2h 34m", "2h 34m"],
      ["Yam", "200", "4h 18m", "1", "1", "3", "2h 34m", "2h 34m"],
      ["Chili Pepper", "450", "11h 26m", "1", "1", "5", "6h 51m", "6h 51m"],
      ["Blueberry", "450", "14h 18m", "1", "1", "5", "8h 34m", "8h 34m"]
    ]
  },
  {
    id: "ground-grain",
    title: "Ground Grain",
    leftLabel: "Farmhand",
    columns: [
      "Mat",
      "Grain",
      "Timer",
      "FH cap",
      "Vigor",
      "Labor",
      "AR FH time",
      "Total time"
    ],
    rows: [
      ["Barley", "100", "43m", "1", "1", "1", "25m", "25m"],
      ["Rice", "100", "2h 52m", "1", "1", "1", "1h 43m", "1h 43m"],
      ["Milet", "100", "2h 52m", "1", "1", "1", "1h 43m", "1h 43m"],
      ["Corn", "100", "2h 52m", "1", "1", "1", "1h 43m", "1h 43m"],
      ["Wheat", "200", "4h 18m", "1", "1", "3", "2h 34m", "2h 34m"],
      ["Oats", "200", "4h 18m", "1", "1", "3", "2h 34m", "2h 34m"],
      ["Rye", "200", "11h 26m", "1", "1", "3", "6h 51m", "6h 51m"],
      ["Peanut", "200", "11h 26m", "1", "1", "3", "6h 51m", "6h 51m"],
      ["Bean", "450", "1d 2h", "1", "1", "5", "15h 25m", "15h 25m"],
      ["Quinoa", "450", "1d 2h", "1", "1", "5", "15h 25m", "15h 25m"]
    ]
  },
  {
    id: "dried-flower",
    title: "Dried Flower",
    leftLabel: "Farmhand",
    columns: [
      "Mat",
      "Flower",
      "Timer",
      "FH cap",
      "Vigor",
      "Labor",
      "AR FH time",
      "Total time"
    ],
    rows: [
      ["Azalea", "100", "29m", "1", "1", "1", "17m", "17m"],
      ["Clover", "100", "1h", "1", "1", "1", "25m", "25m"],
      ["Narcissus", "100", "1h 26m", "1", "1", "1", "51m", "51m"],
      ["Rose", "100", "1h 26m", "1", "1", "1", "51m", "51m"],
      ["Lily", "200", "2h 52m", "1", "1", "3", "1h 43m", "1h 43m"],
      ["Lotus", "200", "4h", "1", "1", "3", "2h 24m", "2h 24m"],
      ["Cornflower", "200", "4h 18m", "1", "1", "3", "3h 25m", "3h 25m"],
      ["Cactus", "450", "5h 43m", "1", "1", "5", "3h 25m", "3h 25m"],
      ["Jinn's Tongue", "450", "", "", "", "", "", ""]
    ]
  },
  {
    id: "ground-spices",
    title: "Ground Spices",
    leftLabel: "Farmhand",
    columns: [
      "Mat",
      "Spices",
      "Timer",
      "FH cap",
      "Vigor",
      "Labor",
      "AR FH time",
      "Total time"
    ],
    rows: [
      ["Iris", "100", "1h 26m", "1", "1", "1", "51m", "51m"],
      ["Lavender", "100", "1h 26m", "1", "1", "1", "51m", "51m"],
      ["Mint", "200", "4h 18m", "1", "1", "3", "3h 25m", "3h 25m"],
      ["Rosemary", "200", "3h", "1", "1", "3", "1h 48m", "1h 48m"],
      ["Sunflower", "200", "4h", "1", "1", "3", "2h 24m", "2h 24m"],
      ["Turmeric", "450", "5h 43m", "1", "1", "5", "3h 25m", "3h 25m"],
      ["Poppy", "450", "1d 10h", "1", "1", "5", "20h 34m", "20h 34m"],
      ["Saffron", "450", "11h 26m", "1", "1", "5", "20h 34m", "20h 34m"],
      ["Vanilla", "450", "14h 18m", "1", "1", "5", "8h 34m", "8h 34m"],
      ["Pepper", "450", "14h 18m", "1", "1", "5", "8h 34m", "8h 34m"]
    ]
  },
  {
    id: "medicinal-powder",
    title: "Medicinal Powder",
    leftLabel: "Farmhand",
    columns: [
      "Mat",
      "Powder",
      "Timer",
      "FH cap",
      "Vigor",
      "Labor",
      "AR FH time",
      "Total time"
    ],
    rows: [
      ["Mushroom", "100", "2h", "1", "1", "1", "1h 12m", "1h 12m"],
      ["Thistle", "100", "2h 52m", "1", "1", "1", "3h 25m", "3h 25m"],
      ["Bay Leaf", "200", "11h 26m", "5", "100", "10", "3h 25m", "17h 5m"],
      ["Ginkgo Leaf", "200", "1d 2h", "20", "100", "10", "8h 34m", "1d 18h 50m"],
      ["Aloe", "200", "14h 18m", "1", "1", "5", "8h 34m", "8h 34m"],
      ["Cultivated Gingseng", "450", "1d 10h", "1", "1", "5", "20h 34m", "20h 34m"],
      ["Clubhead Fungus", "450", "", "", "", "", "", ""]
    ]
  },
  {
    id: "orchard-puree",
    title: "Orchard Puree",
    leftLabel: "Farmhand",
    columns: [
      "Mat",
      "Puree",
      "Timer",
      "FH cap",
      "Vigor",
      "Labor",
      "AR FH time",
      "Total time"
    ],
    rows: [
      ["Grape", "100", "5h 43m", "5", "25", "5", "2h 34m", "12h 50m"],
      ["Fig", "100", "5h 43m", "5", "25", "5", "2h 34m", "12h 50m"],
      ["Avocado", "100", "5h 43m", "10", "50", "5", "2h 34m", "12h 50m"],
      ["Lemon", "100", "14h 18m", "10", "50", "5", "6h 51m", "1d 10h 15m"],
      ["Apple", "100", "14h 18m", "10", "50", "5", "6h 51m", "1d 10h 15m"],
      ["Banana", "100", "1d 2h", "5", "25", "5", "8h 34m", "1d 18h 50m"],
      ["Acorn", "100", "2d 1h", "20", "100", "5", "20h 34m", "4d 6h 50m"],
      ["Baobab", "200", "1d 2h", "5", "25", "5", "8h 34m", "1d 18h 50m"],
      ["Olive", "200", "1d 2h", "10", "50", "10", "8h 34m", "1d 18h 50m"],
      ["Pomegranate", "200", "1d 7h", "30", "150", "10", "15h 25m", "3d 5h 5m"],
      ["Orange", "200", "1d 7h", "30", "150", "10", "15h 25m", "3d 5h 5m"],
      ["Jujube", "450", "1d 7h", "10", "50", "15", "15h 25m", "3d 5h 5m"],
      ["Cherry", "450", "2d 1h", "30", "150", "20", "20h 34m", "4d 6h 50m"],
      ["Moringa", "450", "2d 1h", "25", "125", "20", "20h 34m", "4d 6h 50m"],
      ["Cottonwood", "450", "1d 7h", "20", "100", "20", "15h 25m", "3d 5h 5m"],
      ["Apricot", "450", "2d 21h", "30", "150", "20", "20h 34m", "4d 6h 50m"],
      ["Coconut", "450", "2d 21h", "10", "50", "10", "20h 34m", "4d 6h 50m"],
      ["Beechnut", "450", "2d 1h", "20", "100", "25", "20h 34m", "4d 6h 50m"],
      ["Chestnut", "450", "4d 7h", "30", "150", "25", "1d 17h 8m", "8d 13h 40m"],
      ["Cacao", "450", "", "", "", "", "", ""]
    ]
  },
  {
    id: "trimmed-meat",
    title: "Trimmed Meat",
    leftLabel: "Farmhand",
    columns: [
      "Mat",
      "Becomes",
      "Growth time",
      "FH cap",
      "Vigor",
      "Labor",
      "AR FH time",
      "Total time"
    ],
    rows: [
      ["Pork", "300", "", "", "", "", "", ""],
      ["Chicken Meat", "300", "", "", "", "", "", ""],
      ["Duck Meat", "300", "", "", "", "", "", ""],
      ["Turkey", "300", "", "", "", "", "", ""],
      ["Goose Meat", "300", "", "", "", "", "", ""],
      ["Mutton", "300", "", "", "", "", "", ""],
      ["Goat Meat", "300", "", "", "", "", "", ""],
      ["Beef", "500", "", "", "", "", "", ""],
      ["Yata Meat", "1000", "", "", "", "", "", ""]
    ]
  }
];

function renderCell(value) {
  return escapeHtml(value || "");
}

function renderSectionNav() {
  return `
    <div class="section-nav">
      ${sections
        .map(
          (section) => `
            <a href="#${escapeHtml(section.id)}" class="section-link">
              ${escapeHtml(section.title)}
            </a>
          `
        )
        .join("")}
    </div>
  `;
}

function renderSection(section) {
  const rowCount = Math.max(section.rows.length, 1);

  return `
    <div class="card" id="${escapeHtml(section.id)}">
      <h3>${escapeHtml(section.title)}</h3>
      <div class="table-wrap">
        <table class="trimmer-table">
          <thead>
            <tr>
              ${section.columns
                .slice(0, 3)
                .map((column) => `<th>${escapeHtml(column)}</th>`)
                .join("")}
              <th class="farmhand-bar-header"></th>
              ${section.columns
                .slice(3)
                .map((column) => `<th>${escapeHtml(column)}</th>`)
                .join("")}
            </tr>
          </thead>
          <tbody>
            ${section.rows
              .map(
                (row, index) => `
                  <tr>
                    ${row
                      .slice(0, 3)
                      .map((cell) => `<td>${renderCell(cell)}</td>`)
                      .join("")}
                    ${
                      index === 0
                        ? `<td class="farmhand-bar-cell" rowspan="${rowCount}"><span>${escapeHtml(
                            section.leftLabel
                          )}</span></td>`
                        : ""
                    }
                    ${row
                      .slice(3)
                      .map((cell) => `<td>${renderCell(cell)}</td>`)
                      .join("")}
                  </tr>
                `
              )
              .join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

export function renderPage() {
  return `
    <div class="card">
      <h2>Multipurpose Trimmer</h2>
      <p class="notice">
        Reference page built directly from the CSV with a dedicated Farmhand divider.
      </p>
      ${renderSectionNav()}
    </div>

    <style>

      .trimmer-table .farmhand-bar-header {
        width: 44px;
        min-width: 44px;
        padding: 0;
        background: #2f394d;
        border-left: 2px solid rgba(255,255,255,0.08);
        border-right: 2px solid rgba(255,255,255,0.08);
      }

      .trimmer-table .farmhand-bar-cell {
        width: 44px;
        min-width: 44px;
        padding: 0;
        text-align: center;
        vertical-align: middle;
        background: linear-gradient(180deg, #33415c 0%, #2f394d 100%);
        border-left: 2px solid rgba(255,255,255,0.08);
        border-right: 2px solid rgba(255,255,255,0.08);
      }

      .trimmer-table .farmhand-bar-cell span {
        display: inline-block;
        writing-mode: vertical-rl;
        transform: rotate(180deg);
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: #ffffff;
        padding: 12px 0;
      }
    </style>

    ${sections.map(renderSection).join("")}
  `;
}