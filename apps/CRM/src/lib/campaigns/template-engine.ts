/**
 * Campaign Template Variable Engine
 *
 * Replaces {{variableName}} or {{variable_name}} placeholders in campaign content
 * with contact-specific values.
 */

// ── Types ────────────────────────────────────────────────────────────

export interface ContactWithCompany {
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  jobTitle: string | null
  company: { name: string } | null
}

export interface AvailableVariable {
  key: string
  label: string
  description: string
}

// ── Available Variables (for UI) ─────────────────────────────────────

export const AVAILABLE_VARIABLES: AvailableVariable[] = [
  { key: 'firstName', label: 'Tên', description: 'Tên của liên hệ' },
  { key: 'lastName', label: 'Họ', description: 'Họ của liên hệ' },
  { key: 'fullName', label: 'Họ tên', description: 'Họ và tên đầy đủ' },
  { key: 'email', label: 'Email', description: 'Email liên hệ' },
  { key: 'company', label: 'Công ty', description: 'Tên công ty' },
  { key: 'title', label: 'Chức danh', description: 'Chức danh / vị trí' },
  { key: 'unsubscribeUrl', label: 'Link hủy đăng ký', description: 'Tự động tạo' },
]

// ── Variable aliases (snake_case → camelCase) ────────────────────────

const ALIASES: Record<string, string> = {
  first_name: 'firstName',
  last_name: 'lastName',
  full_name: 'fullName',
  company_name: 'company',
  job_title: 'title',
  unsubscribe_url: 'unsubscribeUrl',
}

// ── Replace variables ────────────────────────────────────────────────

/**
 * Replace all {{variableName}} placeholders in content with values.
 * Supports both camelCase and snake_case variable names.
 * Missing variables are replaced with empty string.
 */
export function replaceVariables(
  content: string,
  variables: Record<string, string>
): string {
  return content.replace(/\{\{(\w+)\}\}/g, (_match, key: string) => {
    // Try direct match first
    if (key in variables) return variables[key]
    // Try alias
    const aliasKey = ALIASES[key]
    if (aliasKey && aliasKey in variables) return variables[aliasKey]
    // Missing → empty string
    return ''
  })
}

// ── Extract variables from contact ──────────────────────────────────

/**
 * Build a variables map from a contact record.
 */
export function getContactVariables(
  contact: ContactWithCompany,
  extra?: Record<string, string>
): Record<string, string> {
  const vars: Record<string, string> = {
    firstName: contact.firstName || '',
    lastName: contact.lastName || '',
    fullName: [contact.firstName, contact.lastName].filter(Boolean).join(' '),
    email: contact.email || '',
    company: contact.company?.name || '',
    title: contact.jobTitle || '',
  }

  if (extra) {
    Object.assign(vars, extra)
  }

  return vars
}
