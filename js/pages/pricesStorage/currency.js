export function decimalToGscParts(value) {
  const safeValue = Math.max(0, Number(value) || 0);
  const totalCopper = Math.round(safeValue * 10000);

  const gold = Math.floor(totalCopper / 10000);
  const silver = Math.floor((totalCopper % 10000) / 100);
  const copper = totalCopper % 100;

  return { gold, silver, copper };
}

export function gscToDecimal(gold, silver, copper) {
  const safeGold = Math.max(0, Number(gold) || 0);
  const safeSilver = Math.max(0, Math.min(99, Number(silver) || 0));
  const safeCopper = Math.max(0, Math.min(99, Number(copper) || 0));

  return safeGold + (safeSilver / 100) + (safeCopper / 10000);
}
