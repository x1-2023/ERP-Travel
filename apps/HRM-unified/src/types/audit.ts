export interface AuditLogEntry {
  id: string
  tenantId: string
  userId?: string | null
  userEmail?: string | null
  action: string
  entityType: string
  entityId?: string | null
  entityName?: string | null
  changes?: Record<string, { old: unknown; new: unknown }> | null
  metadata?: Record<string, unknown> | null
  ipAddress?: string | null
  userAgent?: string | null
  createdAt: Date
}

export interface AuditContext {
  tenantId: string
  userId?: string
  userEmail?: string
  ipAddress?: string
  userAgent?: string
}

export interface AuditFilters {
  action?: string
  entityType?: string
  entityId?: string
  userId?: string
  startDate?: Date
  endDate?: Date
}
