const MAX_STRING_LENGTH = 10_000

/**
 * Sanitize a string for safe storage and rendering.
 * - Trims whitespace
 * - Removes null bytes
 * - Encodes HTML entities to prevent XSS
 * - Limits length
 */
export function sanitizeString(input: string, maxLength = MAX_STRING_LENGTH): string {
  return input
    .trim()
    .replace(/\0/g, '') // remove null bytes
    .slice(0, maxLength)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

/**
 * Deep-sanitize all string values in an object.
 * Preserves non-string values (numbers, booleans, null, etc.).
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      result[key] = sanitizeString(value)
    } else if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      result[key] = sanitizeObject(value as Record<string, unknown>)
    } else if (Array.isArray(value)) {
      result[key] = value.map((item) => {
        if (typeof item === 'string') return sanitizeString(item)
        if (item !== null && typeof item === 'object') return sanitizeObject(item as Record<string, unknown>)
        return item
      })
    } else {
      result[key] = value
    }
  }
  return result as T
}

// Tags that are safe to keep in rich text
const SAFE_TAGS = new Set([
  'p', 'br', 'strong', 'b', 'em', 'i', 'u',
  'ul', 'ol', 'li', 'a',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'blockquote', 'pre', 'code', 'span', 'div',
])

/**
 * Sanitize HTML for rich text fields (campaign content, notes).
 * Strips dangerous tags and event handler attributes.
 * Allows safe formatting tags.
 */
export function sanitizeHtml(input: string): string {
  let html = input
    .replace(/\0/g, '') // null bytes

  // Remove dangerous tags entirely (including content)
  html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  html = html.replace(/<iframe\b[^>]*>.*?<\/iframe>/gi, '')
  html = html.replace(/<iframe\b[^>]*\/>/gi, '')
  html = html.replace(/<embed\b[^>]*\/?>/gi, '')
  html = html.replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
  html = html.replace(/<object\b[^>]*\/>/gi, '')
  html = html.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')

  // Remove on* event handler attributes from all tags
  html = html.replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')

  // Remove javascript: protocol in href/src
  html = html.replace(/(?:href|src)\s*=\s*(?:"javascript:[^"]*"|'javascript:[^']*')/gi, '')

  // Strip tags that aren't in the safe list
  html = html.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*\/?>/g, (match, tagName) => {
    if (SAFE_TAGS.has(tagName.toLowerCase())) {
      // For safe tags, still remove event handlers (already done above)
      return match
    }
    return '' // strip unknown tags
  })

  return html
}
