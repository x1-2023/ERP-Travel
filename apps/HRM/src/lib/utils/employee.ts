// Vietnamese accent mapping
const ACCENT_MAP: Record<string, string> = {
  // Lowercase
  "à": "a", "á": "a", "ả": "a", "ã": "a", "ạ": "a",
  "â": "a", "ầ": "a", "ấ": "a", "ẩ": "a", "ẫ": "a", "ậ": "a",
  "ă": "a", "ằ": "a", "ắ": "a", "ẳ": "a", "ẵ": "a", "ặ": "a",
  "è": "e", "é": "e", "ẻ": "e", "ẽ": "e", "ẹ": "e",
  "ê": "e", "ề": "e", "ế": "e", "ể": "e", "ễ": "e", "ệ": "e",
  "ì": "i", "í": "i", "ỉ": "i", "ĩ": "i", "ị": "i",
  "ò": "o", "ó": "o", "ỏ": "o", "õ": "o", "ọ": "o",
  "ô": "o", "ồ": "o", "ố": "o", "ổ": "o", "ỗ": "o", "ộ": "o",
  "ơ": "o", "ờ": "o", "ớ": "o", "ở": "o", "ỡ": "o", "ợ": "o",
  "ù": "u", "ú": "u", "ủ": "u", "ũ": "u", "ụ": "u",
  "ư": "u", "ừ": "u", "ứ": "u", "ử": "u", "ữ": "u", "ự": "u",
  "ỳ": "y", "ý": "y", "ỷ": "y", "ỹ": "y", "ỵ": "y",
  "đ": "d",
  // Uppercase
  "À": "A", "Á": "A", "Ả": "A", "Ã": "A", "Ạ": "A",
  "Â": "A", "Ầ": "A", "Ấ": "A", "Ẩ": "A", "Ẫ": "A", "Ậ": "A",
  "Ă": "A", "Ằ": "A", "Ắ": "A", "Ẳ": "A", "Ẵ": "A", "Ặ": "A",
  "È": "E", "É": "E", "Ẻ": "E", "Ẽ": "E", "Ẹ": "E",
  "Ê": "E", "Ề": "E", "Ế": "E", "Ể": "E", "Ễ": "E", "Ệ": "E",
  "Ì": "I", "Í": "I", "Ỉ": "I", "Ĩ": "I", "Ị": "I",
  "Ò": "O", "Ó": "O", "Ỏ": "O", "Õ": "O", "Ọ": "O",
  "Ô": "O", "Ồ": "O", "Ố": "O", "Ổ": "O", "Ỗ": "O", "Ộ": "O",
  "Ơ": "O", "Ờ": "O", "Ớ": "O", "Ở": "O", "Ỡ": "O", "Ợ": "O",
  "Ù": "U", "Ú": "U", "Ủ": "U", "Ũ": "U", "Ụ": "U",
  "Ư": "U", "Ừ": "U", "Ứ": "U", "Ử": "U", "Ữ": "U", "Ự": "U",
  "Ỳ": "Y", "Ý": "Y", "Ỷ": "Y", "Ỹ": "Y", "Ỵ": "Y",
  "Đ": "D",
}

/**
 * Convert Vietnamese accented name to non-accented uppercase
 * VD: "Nguyễn Văn An" → "NGUYEN VAN AN"
 */
export function convertToNoAccent(name: string): string {
  let result = ""
  for (const char of name) {
    result += ACCENT_MAP[char] ?? char
  }
  return result.toUpperCase()
}

/**
 * Calculate days until contract expiry
 * Returns negative if already expired
 */
export function daysUntilExpiry(date: Date): number {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const target = new Date(date)
  target.setHours(0, 0, 0, 0)
  const diff = target.getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}
