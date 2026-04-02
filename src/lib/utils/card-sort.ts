/**
 * Canonical card sort order:
 * 1. Coronados
 * 2. Realeza
 * 3. Arroje
 * 4. Estrategia Primigenia
 * 5. Estrategia
 * 6. Tropas Nv.1 → Nv.4
 */

const CATEGORY_RANK: Record<string, number> = {
  Coronados:              0,
  Realeza:                1,
  Arroje:                 2,
  "Estrategia Primigenia": 3,
  Estrategia:             4,
  Tropas:                 5,
};

/**
 * Returns a sort rank for a card based on category + level.
 * Lower = earlier in the list.
 */
export function cardRank(category: string, level: number | null): number {
  const base = CATEGORY_RANK[category] ?? 99;
  // For Tropas, further sort by level (1-4); default to 0 if null
  const lvl = category === "Tropas" ? (level ?? 0) : 0;
  return base * 10 + lvl;
}

/**
 * Comparator for sorting an array of card-like objects.
 * Sorts by category rank first, then alphabetically by name within the same rank.
 */
export function compareCards<T extends { category: string; level: number | null; name: string }>(
  a: T,
  b: T
): number {
  const rankDiff = cardRank(a.category, a.level) - cardRank(b.category, b.level);
  if (rankDiff !== 0) return rankDiff;
  return a.name.localeCompare(b.name);
}
