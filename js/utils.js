export function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function jsEscape(value) {
  return String(value).replaceAll("\\", "\\\\").replaceAll("'", "\\'");
}

export function formatGold(value) {
  return `${Number(value || 0).toFixed(2)}g`;
}

export function getStatus(required, storage) {
  if (required <= 0) return { label: "No target", className: "green" };
  if (storage <= 0) return { label: "Nothing farmed", className: "red" };
  if (storage >= required) return { label: "Done", className: "green" };
  return { label: "In progress", className: "orange" };
}

export function getStillNeedClass(required, storage) {
  if (required <= 0) return "green";
  if (storage <= 0) return "red";
  if (storage >= required) return "green";
  return "orange";
}

// Renders a no-scroll card-based materials list.
// items: Array of {
//   name        string   — item display name
//   required    number   — total amount needed
//   inStorage   number   — amount currently in storage
//   price       number   — gold per unit
//   stillNeed   number   — max(0, required - inStorage)
//   goldStillNeed number — stillNeed * price
//   totalGold   number   — required * price
//   seeds?      number   — total seeds (optional)
//   totalVoc?   number   — total vocation (optional)
//   crafted?    string   — crafted item label e.g. "357× Small Seed Oil" (optional)
//   note?       string   — fallback label when price=0 (optional)
// }
export function renderMaterialsGrid(items) {
  let sumGoldStillNeed = 0;
  let sumTotalGold     = 0;
  let sumTotalVoc      = 0;

  const rows = items.map(item => {
    sumGoldStillNeed += item.goldStillNeed || 0;
    sumTotalGold     += item.totalGold     || 0;
    sumTotalVoc      += item.totalVoc      || 0;

    const status       = getStatus(item.required, item.inStorage);
    const stillNeedCls = getStillNeedClass(item.required, item.inStorage);

    const parts = [];
    parts.push(`Have <strong>${(item.inStorage || 0).toLocaleString()}</strong>`);

    if ((item.stillNeed || 0) > 0) {
      parts.push(`<span class="still-need ${stillNeedCls}">Need ${item.stillNeed.toLocaleString()}</span>`);
    }

    if ((item.goldStillNeed || 0) > 0) {
      parts.push(`<span class="price-text">${formatGold(item.goldStillNeed)}</span>`);
    } else if (item.note) {
      parts.push(`<span style="opacity:0.6;">${escapeHtml(item.note)}</span>`);
    }

    if ((item.seeds || 0) > 0) {
      parts.push(`Seeds: ${item.seeds.toLocaleString()}`);
      if ((item.totalVoc || 0) > 0) {
        parts.push(`Voc: ${item.totalVoc.toLocaleString()}`);
      }
    }

    if (item.crafted) {
      parts.push(`<span style="opacity:0.65;">\u2192 ${escapeHtml(item.crafted)}</span>`);
    }

    const dot = ' <span style="opacity:0.25">·</span> ';

    return `
      <div class="mat-row">
        <div class="mat-qty">${(item.required || 0).toLocaleString()}</div>
        <div>
          <div class="mat-name">${escapeHtml(item.name)}</div>
          ${parts.length ? `<div class="mat-details">${parts.join(dot)}</div>` : ""}
        </div>
        <div><span class="badge ${status.className}">${escapeHtml(status.label)}</span></div>
      </div>
    `;
  }).join("");

  const summaryParts = [];
  if (sumGoldStillNeed > 0) summaryParts.push(`Gold to buy: <strong class="price-text">${formatGold(sumGoldStillNeed)}</strong>`);
  if (sumTotalGold     > 0) summaryParts.push(`Total value: <strong class="price-text">${formatGold(sumTotalGold)}</strong>`);
  if (sumTotalVoc      > 0) summaryParts.push(`Total vocation: <strong>${sumTotalVoc.toLocaleString()}</strong>`);

  const dot = ' <span style="opacity:0.25">·</span> ';

  return `
    <div class="mat-grid">${rows}</div>
    ${summaryParts.length ? `<div class="mat-summary">${summaryParts.join(dot)}</div>` : ""}
  `;
}
