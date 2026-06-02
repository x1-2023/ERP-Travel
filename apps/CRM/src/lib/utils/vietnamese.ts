/**
 * Remove Vietnamese diacritics from a string for search normalization.
 * "Nguyễn" → "Nguyen", "đại" → "dai"
 */
export function removeDiacritics(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
}
