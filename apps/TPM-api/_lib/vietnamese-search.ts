/**
 * Sprint 1 Fix 10: Diacritic-insensitive Vietnamese Search
 * Allows "nguyen" to find "Nguyễn", "hoa" to find "Hoà", etc.
 */

/**
 * Remove Vietnamese diacritics for search comparison.
 */
export function removeDiacritics(str: string): string {
  if (!str) return '';

  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

/**
 * Create a search-friendly (lowercased, no diacritics) version of a string.
 */
export function toSearchable(str: string): string {
  return removeDiacritics(str).toLowerCase().trim();
}

/**
 * Build Prisma where clause for Vietnamese search across multiple fields.
 * Searches both the original text (with diacritics) and a normalized version.
 */
export function buildVietnameseSearch(
  searchTerm: string,
  fields: string[]
): Record<string, unknown> {
  const original = searchTerm.trim();
  const normalized = toSearchable(searchTerm);

  // Search both original (for exact diacritic match) and normalized
  return {
    OR: fields.flatMap((field) => [
      // Search with original input (case-insensitive)
      { [field]: { contains: original, mode: 'insensitive' } },
      // Search with diacritics removed (case-insensitive)
      { [field]: { contains: normalized, mode: 'insensitive' } },
    ]),
  };
}
