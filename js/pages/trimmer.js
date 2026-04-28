import { escapeHtml } from "../utils.js";

const trimmerCsv = `Chopped Produce,,,,,,,,,
Mat,Produce,Timer,Harvest CD,FH cap,Vigor,Labor,AR FH time,Harvest,Total time
Potato,100,10m,,1,1,1,6m,1,6m
Cucumber,100,10m,,1,1,1,6m,1,6m
Carrot,100,43m,,1,1,1,25m,1,25m
Onion,100,43m,,1,1,1,25m,1,25m
Tomato,100,1h 26m,,1,1,1,51m,1,51m
Garlic,100,1h 26m,,1,1,1,51m,1,51m
Strawberry,200,4h 18m,,1,1,3,2h 34m,1,2h 34m
Pumpkin,200,4h 18m,,1,1,3,2h 34m,1,2h 34m
Yam,200,4h 18m,,1,1,3,2h 34m,1,2h 34m
Chili Pepper,450,11h 26m,,1,1,5,6h 51m,1,6h 51m
Blueberry,450,14h 18m,,1,1,5,8h 34m,1,8h 34m
Ground Grain,,,,,,,,,
Mat,Grain,Timer,Harvest CD,FH cap,Vigor,Labor,AR FH time,Harvest,Total time
Barley,100,43m,,1,1,1,25m,1,25m
Rice,100,2h 52m,,1,1,1,1h 43m,1,1h 43m
Milet,100,2h 52m,,1,1,1,1h 43m,1,1h 43m
Corn,100,2h 52m,,1,1,1,1h 43m,1,1h 43m
Wheat,200,4h 18m,,1,1,3,2h 34m,1,2h 34m
Oats,200,4h 18m,,1,1,3,2h 34m,1,2h 34m
Rye,200,11h 26m,,1,1,3,6h 51m,1,6h 51m
Peanut,200,11h 26m,,1,1,3,6h 51m,1,6h 51m
Bean,450,1d 2h,,1,1,5,15h 25m,1,15h 25m
Quinoa,450,1d 2h,,1,1,5,15h 25m,1,15h 25m
Dried Flower,,,,,,,,,
Mat,Flower,Timer,Harvest CD,FH cap,Vigor,Labor,AR FH time,Harvest,Total time
Azalea,100,29 min,,1,1,1,17m,1,17m
Clover,100,1h,,1,1,1,25m,1,25m
Narcissus,100,1h 26m,,1,1,1,51m,1,51m
Rose,100,1h 26m,,1,1,1,51m,1,51m
Lily,200,2h 52m,,1,1,3,1h 43m,1,1h 43m
Lotus,200,4h,,1,1,3,2h 24m,1,2h 24m
Cornflower,200,4h 18m,,1,1,3,3h 25m,1,3h 25m
Cactus,450,5h 43m,,1,1,5,3h 25m,1,3h 25m
Jinn's Tongue,450,,,,,,,,
Ground Spices,,,,,,,,,
Mat,Spices,Timer,Harvest CD,FH cap,Vigor,Labor,AR FH time,Harvest,Total time
Iris,100,1h 26m,,1,1,1,51m,1,51m
Lavender,100,1h 26m,,1,1,1,51m,1,51m
Mint,200,4h 18m,,1,1,3,3h 25m,1,3h 25m
Rosemary,200,3h,,1,1,3,1h 48m,1,1h 48m
Sunflower,200,4h,,1,1,3,2h 24m,1,2h 24m
Turmeric,450,5h 43m,,1,1,5,3h 25m,1,3h 25m
Poppy,450,1d 10h,,1,1,5,20h 34m,1,20h 34m
Saffron,450,11h 26m,,1,1,5,20h 34m,1,20h 34m
Vanilla,450,14h 18m,,1,1,5,8h 34m,1,8h 34m
Pepper,450,14h 18m,,1,1,5,8h 34m,1,8h 34m
Medicinal Powder,,,,,,,,,
Mat,Speed,Timer,Harvest CD,FH cap,Vigor,Labor,AR FH time,Harvest,Total time
Mushroom,100,2h,,1,1,1,1h 12m,1,1h 12m
Thistle,100,2h 52m,,1,1,1,3h 25m,1,3h 25m
Bay Leaf,200,11h 26m,5h 43m,5,100,10,3h 25m,5,17h 5m
Ginkgo Leaf,200,1d 2h,14h 18m,20,100,10,8h 34m,5,1d 18h 50m
Aloe,200,14h 18m,,1,1,5,8h 34m,1,8h 34m
Cultivated Gingseng,450,1d 10h,,1,1,5,20h 34m,1,20h 34m
Clubhead Fungus,450,,,,,,,,
Orchard Puree,,,,,,,,,
Mat,Puree,Timer,Harvest CD,FH cap,Vigor,Labor,AR FH time,Harvest,Total time
Grape,100,5h 43m,14h 18m,5,25,5,2h 34m,5,12h 50m
Fig,100,5h 43m,14h 18m,5,25,5,2h 34m,5,12h 50m
Avocado,100,5h 43m,14h 18m,10,50,5,2h 34m,5,12h 50m
Lemon,100,14h 18m,11h 26m,10,50,5,6h 51m,5,1d 10h 15m
Apple,100,14h 18m,11h 26m,10,50,5,6h 51m,5,1d 10h 15m
Banana,100,1d 2h,14h 18m,5,25,5,8h 34m,5,1d 18h 50m
Acorn,100,2d 1h,1d 10h,20,100,5,20h 34m,5,4d 6h 50m
Baobab,200,1d 2h,14h 18m,5,25,5,8h 34m,5,1d 18h 50m
Olive,200,1d 2h,14h 15m,10,50,10,8h 34m,5,1d 18h 50m
Pomegranate,200,1d 7h,1d 2h,30,150,10,15h 25m,5,3d 5h 5m
Orange,200,1d 7h,1d 2h,30,150,10,15h 25m,5,3d 5h 5m
Jujube,450,1d 7h,1d 2h,10,50,15,15h 25m,5,3d 5h 5m
Cherry,450,2d 1h,1d 10h,30,150,20,20h 34m,5,4d 6h 50m
Moringa,450,2d 1h,1d 10h,25,125,20,20h 34m,5,4d 6h 50m
Cottonwood,450,1d 7h,1d 2h,20,100,20,15h 25m,5,3d 5h 5m
Apricot,450,2d 21h,1d 10h,30,150,20,20h 34m,5,4d 6h 50m
Coconut,450,2d 21h,1d 10h,10,50,10,20h 34m,5,4d 6h 50m
Beechnut,450,2d 1h,1d 10h,20,100,25,20h 34m,5,4d 6h 50m
Chestnut,450,4d 7h,2d 21h,30,150,25,1d 17h 8m,5,8d 13h 40m
Cacao,450,,,,,,,,
Trimmed Meat,,,,,,,,,
Mat,Becomes,Growth time,TIme per harvest,Farmhand Cap,Vigor,Labor,AR FH time,Harvest,Total time
Pork,300,,,,,,,,
Chicken Meat,300,,,,,,,,
Duck Meat,300,,,,,,,,
Turkey,300,,,,,,,,
Goose Meat,300,,,,,,,,
Mutton,300,,,,,,,,
Goat Meat,300,,,,,,,,
Beef,500,,,,,,,,
Yata Meat,1000,,,,,,,,`;

function parseCsvLine(line) {
  return line.split(",").map((value) => value.trim());
}

function slug(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function headerLabel(header) {
  if (header === "TIme per harvest") return "Time per harvest";
  if (header === "Farmhand Cap") return "FH cap";
  return header;
}

function parseTrimmerCsv(csv) {
  const lines = csv.split(/\r?\n/).filter(Boolean);
  const parsed = [];

  for (let i = 0; i < lines.length;) {
    const sectionLine = parseCsvLine(lines[i]);
    const title = sectionLine[0];
    const isSection = title && sectionLine.slice(1).every((value) => value === "");

    if (!isSection) {
      i += 1;
      continue;
    }

    const columns = parseCsvLine(lines[i + 1]).map(headerLabel);
    const rows = [];
    i += 2;

    while (i < lines.length) {
      const row = parseCsvLine(lines[i]);
      const nextSection = row[0] && row.slice(1).every((value) => value === "");
      if (nextSection) break;
      rows.push(row.slice(0, columns.length));
      i += 1;
    }

    parsed.push({
      id: slug(title),
      title,
      columns,
      rows,
    });
  }

  return parsed;
}

const sections = parseTrimmerCsv(trimmerCsv);
const totalRows = sections.reduce((sum, section) => sum + section.rows.length, 0);
const verifiedRows = sections.reduce(
  (sum, section) => sum + section.rows.filter((row) => row.slice(2).some(Boolean)).length,
  0
);

function renderCell(value, columnIndex) {
  if (!value) return `<span class="trimmer-empty">-</span>`;
  const className = columnIndex === 0 ? "trimmer-mat" : columnIndex >= 4 ? "trimmer-farmhand-value" : "";
  return `<span class="${className}">${escapeHtml(value)}</span>`;
}

function renderSectionNav() {
  return `
    <div class="trimmer-nav">
      ${sections
        .map(
          (section) => `
            <a href="#${escapeHtml(section.id)}" class="section-link trimmer-nav-link">
              ${escapeHtml(section.title)}
            </a>
          `
        )
        .join("")}
    </div>
  `;
}

function renderSection(section) {
  const timedRows = section.rows.filter((row) => row.slice(2).some(Boolean)).length;

  return `
    <section class="card trimmer-section" id="${escapeHtml(section.id)}">
      <div class="trimmer-section-head">
        <div>
          <h3>${escapeHtml(section.title)}</h3>
          <p>${timedRows} of ${section.rows.length} entries have verified timing data.</p>
        </div>
        <span class="trimmer-count">${section.rows.length} items</span>
      </div>
      <div class="table-wrap trimmer-table-wrap">
        <table class="trimmer-table">
          <colgroup>
            <col class="trimmer-col-mat">
            <col class="trimmer-col-yield">
            <col class="trimmer-col-time">
            <col class="trimmer-col-time">
            <col class="trimmer-col-small">
            <col class="trimmer-col-small">
            <col class="trimmer-col-small">
            <col class="trimmer-col-time">
            <col class="trimmer-col-small">
            <col class="trimmer-col-time">
          </colgroup>
          <thead>
            <tr class="trimmer-group-row">
              <th colspan="4">Crop details</th>
              <th colspan="6">Farmhand plan</th>
            </tr>
            <tr>
              ${section.columns.map((column) => `<th>${escapeHtml(column)}</th>`).join("")}
            </tr>
          </thead>
          <tbody>
            ${section.rows
              .map(
                (row) => `
                  <tr class="${row.slice(2).some(Boolean) ? "" : "trimmer-incomplete"}">
                    ${section.columns
                      .map((_, index) => `<td>${renderCell(row[index], index)}</td>`)
                      .join("")}
                  </tr>
                `
              )
              .join("")}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

export function renderPage() {
  return `
    <div class="card trimmer-hero">
      <div>
        <h2>Multipurpose Trimmer</h2>
        <p class="notice">
          Verified trimmer reference for crop output, growth timers, harvest cooldowns, farmhand caps, vigor, labor, and total farmhand timing.
        </p>
      </div>
      <div class="trimmer-stats">
        <div><strong>${sections.length}</strong><span>Groups</span></div>
        <div><strong>${totalRows}</strong><span>Items</span></div>
        <div><strong>${verifiedRows}</strong><span>Timed</span></div>
      </div>
    </div>

    <div class="card trimmer-toolbar">
      <input
        type="search"
        id="trimmer-search"
        placeholder="Search material or group"
        oninput="window.filterTrimmerRows(this.value)"
      >
      ${renderSectionNav()}
    </div>

    <style>
      .trimmer-hero {
        display: flex;
        justify-content: space-between;
        align-items: stretch;
        gap: 18px;
        border-color: #3f5168;
      }

      .trimmer-hero h2 {
        margin-bottom: 8px;
      }

      .trimmer-stats {
        display: grid;
        grid-template-columns: repeat(3, minmax(84px, 1fr));
        gap: 10px;
        min-width: 300px;
      }

      .trimmer-stats div {
        background: #1b2330;
        border: 1px solid #3a475b;
        border-radius: 8px;
        padding: 12px;
        text-align: center;
      }

      .trimmer-stats strong {
        display: block;
        color: #8fc3ff;
        font-size: 24px;
        line-height: 1;
      }

      .trimmer-stats span {
        display: block;
        color: #aeb7c6;
        font-size: 12px;
        margin-top: 6px;
        text-transform: uppercase;
      }

      .trimmer-toolbar {
        position: sticky;
        top: 0;
        z-index: 5;
        display: flex;
        flex-direction: column;
        gap: 14px;
      }

      #trimmer-search {
        width: min(420px, 100%);
        background: #1b2028;
        color: #eef2f7;
        border: 1px solid #485366;
        border-radius: 8px;
        padding: 10px 12px;
        font-size: 14px;
      }

      .trimmer-nav {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .trimmer-nav-link {
        border: 1px solid #3a475b;
        background: #1b2330;
        color: #cbd5e1;
        border-radius: 8px;
        padding: 7px 10px;
        font-size: 12px;
        text-decoration: none;
      }

      .trimmer-nav-link:hover {
        border-color: #8fc3ff;
        color: #f8fafc;
      }

      .trimmer-section {
        padding: 0;
        overflow: hidden;
      }

      .trimmer-section-head {
        display: flex;
        justify-content: space-between;
        gap: 16px;
        align-items: center;
        padding: 18px 20px;
        border-bottom: 1px solid #343c49;
        background: #2a3140;
      }

      .trimmer-section-head h3 {
        margin: 0 0 6px;
      }

      .trimmer-section-head p {
        margin: 0;
        color: #aeb7c6;
        font-size: 13px;
      }

      .trimmer-count {
        flex: 0 0 auto;
        color: #ffd166;
        border: 1px solid rgba(255, 209, 102, 0.35);
        background: rgba(255, 209, 102, 0.08);
        border-radius: 8px;
        padding: 7px 10px;
        font-size: 12px;
        font-weight: 700;
      }

      .trimmer-table-wrap {
        border-radius: 0;
      }

      .trimmer-table {
        min-width: 1120px;
        table-layout: fixed;
      }

      .trimmer-table th,
      .trimmer-table td {
        padding: 8px 10px;
        vertical-align: middle;
        white-space: nowrap;
      }

      .trimmer-table tbody tr:nth-child(even) td {
        background: rgba(255, 255, 255, 0.018);
      }

      .trimmer-table tbody tr:hover td {
        background: #2b3544;
      }

      .trimmer-group-row th {
        position: static !important;
        background: #1d2735;
        color: #8fc3ff;
        text-align: center;
        text-transform: uppercase;
        font-size: 11px;
        letter-spacing: 0.06em;
      }

      .trimmer-col-mat { width: 170px; }
      .trimmer-col-yield { width: 90px; }
      .trimmer-col-time { width: 128px; }
      .trimmer-col-small { width: 86px; }

      .trimmer-table th:first-child,
      .trimmer-table td:first-child {
        position: sticky;
        left: 0;
        z-index: 2;
        background: #252c39;
      }

      .trimmer-table thead th:first-child {
        z-index: 3;
      }

      .trimmer-mat {
        color: #f8fafc;
        font-weight: 700;
      }

      .trimmer-farmhand-value {
        color: #d6f3ff;
      }

      .trimmer-empty {
        color: #657083;
      }

      .trimmer-incomplete td {
        opacity: 0.72;
      }

      .trimmer-hidden {
        display: none;
      }

      @media (max-width: 850px) {
        .trimmer-hero {
          flex-direction: column;
        }

        .trimmer-stats {
          min-width: 0;
        }
      }
    </style>

    ${sections.map(renderSection).join("")}
  `;
}

window.filterTrimmerRows = function filterTrimmerRows(value) {
  const query = String(value || "").trim().toLowerCase();

  document.querySelectorAll(".trimmer-section").forEach((section) => {
    const title = section.querySelector("h3")?.textContent.toLowerCase() || "";
    let visibleRows = 0;

    section.querySelectorAll("tbody tr").forEach((row) => {
      const matches = !query || title.includes(query) || row.textContent.toLowerCase().includes(query);
      row.classList.toggle("trimmer-hidden", !matches);
      if (matches) visibleRows += 1;
    });

    section.classList.toggle("trimmer-hidden", query && visibleRows === 0 && !title.includes(query));
  });
};
