export interface WebhookInfo {
  id: string
  name: string
  url: string
  events: string[]
  status: string
  totalDeliveries: number
  successDeliveries: number
  failedDeliveries: number
  lastDeliveryAt?: Date | null
  createdAt: Date
}

export interface WebhookDeliveryInfo {
  id: string
  event: string
  status: string
  statusCode?: number | null
  duration?: number | null
  errorMessage?: string | null
  createdAt: Date
}

export const WEBHOOK_EVENTS = [
  'employee.created',
  'employee.updated',
  'employee.terminated',
  'attendance.clock_in',
  'attendance.clock_out',
  'leave.requested',
  'leave.approved',
  'leave.rejected',
  'payroll.processed',
  'payroll.paid',
] as const
