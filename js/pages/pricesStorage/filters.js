export function getCategoryOptions(categories) {
  return ["All", ...Object.keys(categories)];
}

export function getFilteredItems(items, search, category) {
  const safeSearch = String(search || "").trim().toLowerCase();
  const safeCategory = category || "All";

  return items.filter((row) => {
    const matchesCategory = safeCategory === "All" || row.category === safeCategory;
    const matchesSearch = !safeSearch || String(row.item || "").toLowerCase().includes(safeSearch);
    return matchesCategory && matchesSearch;
  });
}
