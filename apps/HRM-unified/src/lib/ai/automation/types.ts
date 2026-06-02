// src/lib/ai/automation/types.ts
// Smart Automation Types

export type WorkflowType =
  | 'LEAVE_REQUEST'
  | 'OVERTIME_REQUEST'
  | 'EMPLOYEE_ONBOARDING'
  | 'CONTRACT_RENEWAL'
  | 'PERFORMANCE_REVIEW'
  | 'SALARY_ADJUSTMENT'
  | 'TERMINATION'

export type SuggestionTrigger =
  | 'PAGE_LOAD'
  | 'USER_ACTION'
  | 'SCHEDULE'
  | 'DATA_CHANGE'

export interface WorkflowSuggestion {
  id: string
  type: WorkflowType
  title: string
  description: string
  reason: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  actions: WorkflowAction[]
  metadata?: Record<string, unknown>
  createdAt: Date
  expiresAt?: Date
}

export interface WorkflowAction {
  type: 'navigate' | 'create' | 'approve' | 'remind' | 'schedule'
  label: string
  url?: string
  params?: Record<string, unknown>
}

export interface FormSuggestion {
  fieldName: string
  suggestedValue: unknown
  reason: string
  confidence: number
}

export interface SmartFormContext {
  formType: string
  currentValues: Record<string, unknown>
  userContext: {
    employeeId?: string
    departmentId?: string
    role: string
  }
}

export interface SmartFormResult {
  suggestions: FormSuggestion[]
  warnings: string[]
  recommendations: string[]
}

export interface AutomationContext {
  tenantId: string
  userId: string
  employeeId?: string
  role: string
  currentPage?: string
}
