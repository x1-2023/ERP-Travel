// src/lib/ai/action-executor.ts
// Parse and build action URLs from AI responses

import type { AIAction } from '@/types/ai'

// Action type to URL mapping
const ACTION_ROUTES: Record<string, string> = {
  create_leave_request: '/ess/leave/new',
  create_ot_request: '/ess/overtime/new',
  view_payslip: '/ess/payslip',
  view_attendance: '/ess/attendance',
  generate_report: '/reports/generate',
  navigate: '',
}

// Navigation targets
const NAV_TARGETS: Record<string, string> = {
  'trang chủ': '/dashboard',
  dashboard: '/dashboard',
  'nghỉ phép': '/ess/leave',
  'xin nghỉ': '/ess/leave',
  leave: '/ess/leave',
  'tăng ca': '/ess/overtime',
  overtime: '/ess/overtime',
  'chấm công': '/ess/attendance',
  attendance: '/ess/attendance',
  'bảng lương': '/ess/payslip',
  payslip: '/ess/payslip',
  'phê duyệt': '/approvals',
  approvals: '/approvals',
  'báo cáo': '/reports',
  reports: '/reports',
  'cài đặt': '/settings',
  settings: '/settings',
  'hồ sơ': '/profile',
  profile: '/profile',
}

/**
 * Parse action block from AI response
 */
export function parseActionFromResponse(response: string): AIAction | null {
  const actionRegex = /\[ACTION:(\w+)\]\s*(\{[\s\S]*?\})\s*\[\/ACTION\]/
  const match = response.match(actionRegex)

  if (!match) {
    return null
  }

  const [, actionType, jsonStr] = match

  try {
    const data = JSON.parse(jsonStr)
    return {
      type: actionType as AIAction['type'],
      data,
    }
  } catch (error) {
    console.error('Failed to parse action data:', error)
    return null
  }
}

/**
 * Remove action block from response to get clean message
 */
export function cleanActionFromResponse(response: string): string {
  return response
    .replace(/\[ACTION:\w+\][\s\S]*?\[\/ACTION\]/g, '')
    .trim()
}

/**
 * Build URL for an action
 */
export function buildActionUrl(action: AIAction): string {
  const baseUrl = ACTION_ROUTES[action.type]

  if (action.type === 'navigate') {
    // Handle navigation
    const target = (action.data.target as string)?.toLowerCase() || ''
    return NAV_TARGETS[target] || '/dashboard'
  }

  if (!baseUrl) {
    return '/dashboard'
  }

  // Build query params from action data
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(action.data)) {
    if (value !== undefined && value !== null) {
      params.append(key, String(value))
    }
  }

  const queryString = params.toString()
  return queryString ? `${baseUrl}?${queryString}` : baseUrl
}

/**
 * Get action label for display
 */
export function getActionLabel(action: AIAction): string {
  if (action.label) {
    return action.label
  }

  const labels: Record<string, string> = {
    create_leave_request: '📝 Tạo đơn xin nghỉ',
    create_ot_request: '⏰ Tạo đơn tăng ca',
    view_payslip: '💰 Xem phiếu lương',
    view_attendance: '📊 Xem chấm công',
    generate_report: '📈 Tạo báo cáo',
    navigate: '🔗 Đi đến trang',
  }

  return labels[action.type] || 'Thực hiện'
}

/**
 * Process AI response and extract clean message + action
 */
export function processAIResponse(response: string): {
  message: string
  action: AIAction | null
} {
  const action = parseActionFromResponse(response)
  const message = cleanActionFromResponse(response)

  if (action) {
    action.label = getActionLabel(action)
  }

  return { message, action }
}
