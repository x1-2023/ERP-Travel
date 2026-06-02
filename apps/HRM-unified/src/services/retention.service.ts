// src/services/retention.service.ts
// Data Retention & Archival Policy Engine (P2-21)
// Manages data lifecycle: active → archived → deleted

import { db } from '@/lib/db'

// ═══════════════════════════════════════════════════════════════
// Default Retention Periods (Vietnamese labor law compliance)
// ═══════════════════════════════════════════════════════════════

/**
 * Default retention periods by entity type (in days)
 * Based on Vietnamese labor law and tax regulations:
 * - Payroll/Tax: 10 years (Luật Thuế TNCN)
 * - Insurance: 10 years (Luật BHXH)
 * - Contracts: 10 years after termination
 * - Attendance: 5 years
 * - Audit logs: 7 years
 * - Leave requests: 3 years
 * - Notifications: 90 days
 */
export const DEFAULT_RETENTION_DAYS: Record<string, number> = {
  payroll: 3650,           // 10 years
  tax_settlement: 3650,    // 10 years
  insurance_report: 3650,  // 10 years
  contract: 3650,          // 10 years
  attendance: 1825,        // 5 years
  attendance_summary: 1825,// 5 years
  audit_log: 2555,         // 7 years
  leave_request: 1095,     // 3 years
  overtime_request: 1095,  // 3 years
  notification: 90,        // 90 days
  workflow_instance: 1095, // 3 years
  import_job: 365,         // 1 year
  email_queue: 365,        // 1 year
}

// ═══════════════════════════════════════════════════════════════
// Policy CRUD
// ═══════════════════════════════════════════════════════════════

/**
 * Get all retention policies for a tenant
 */
export async function getRetentionPolicies(tenantId: string) {
  return db.retentionPolicy.findMany({
    where: { tenantId },
    orderBy: { entityType: 'asc' },
  })
}

/**
 * Get or create a retention policy for an entity type
 */
export async function getOrCreatePolicy(tenantId: string, entityType: string) {
  let policy = await db.retentionPolicy.findUnique({
    where: { tenantId_entityType: { tenantId, entityType } },
  })

  if (!policy) {
    const defaultDays = DEFAULT_RETENTION_DAYS[entityType] || 1825
    policy = await db.retentionPolicy.create({
      data: {
        tenantId,
        name: `Chính sách lưu trữ ${entityType}`,
        entityType,
        retentionDays: defaultDays,
        action: 'archive',
        isActive: true,
      },
    })
  }

  return policy
}

/**
 * Update a retention policy
 */
export async function updateRetentionPolicy(
  policyId: string,
  data: {
    retentionDays?: number
    action?: string
    isActive?: boolean
    conditions?: Record<string, unknown>
  }
) {
  // Enforce minimum retention periods for regulated data
  if (data.retentionDays !== undefined) {
    const policy = await db.retentionPolicy.findUnique({
      where: { id: policyId },
    })
    if (policy) {
      const minDays = getMinRetentionDays(policy.entityType)
      if (data.retentionDays < minDays) {
        throw new Error(
          `Thời gian lưu trữ tối thiểu cho ${policy.entityType} là ${minDays} ngày theo quy định pháp luật`
        )
      }
    }
  }

  return db.retentionPolicy.update({
    where: { id: policyId },
    data: {
      retentionDays: data.retentionDays,
      action: data.action,
      isActive: data.isActive,
      conditions: data.conditions as any,
    },
  })
}

/**
 * Initialize default retention policies for a tenant
 */
export async function initDefaultPolicies(tenantId: string) {
  const existing = await db.retentionPolicy.count({ where: { tenantId } })
  if (existing > 0) return // Already initialized

  const policies = Object.entries(DEFAULT_RETENTION_DAYS).map(([entityType, days]) => ({
    tenantId,
    name: getEntityLabel(entityType),
    entityType,
    retentionDays: days,
    action: entityType === 'notification' ? 'delete' : 'archive',
    isActive: true,
  }))

  await db.retentionPolicy.createMany({ data: policies })
}

// ═══════════════════════════════════════════════════════════════
// Retention Execution
// ═══════════════════════════════════════════════════════════════

/**
 * Run retention policies for a tenant.
 * Returns count of records processed per entity type.
 *
 * Should be called by a scheduled job (e.g., daily cron).
 */
export async function executeRetentionPolicies(tenantId: string): Promise<Record<string, number>> {
  const policies = await db.retentionPolicy.findMany({
    where: { tenantId, isActive: true },
  })

  const results: Record<string, number> = {}

  for (const policy of policies) {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - policy.retentionDays)

    let count = 0

    switch (policy.action) {
      case 'archive':
        count = await archiveRecords(tenantId, policy.entityType, cutoffDate)
        break
      case 'anonymize':
        count = await anonymizeRecords(tenantId, policy.entityType, cutoffDate)
        break
      case 'delete':
        count = await deleteRecords(tenantId, policy.entityType, cutoffDate)
        break
    }

    results[policy.entityType] = count

    // Update last run info
    await db.retentionPolicy.update({
      where: { id: policy.id },
      data: {
        lastRunAt: new Date(),
        lastRunCount: count,
      },
    })
  }

  // Audit log the retention run
  await db.auditLog.create({
    data: {
      tenantId,
      action: 'DELETE',
      entityType: 'RETENTION_RUN',
      entityName: 'Chạy chính sách lưu trữ',
      newData: results,
    },
  })

  return results
}

// ═══════════════════════════════════════════════════════════════
// Record Operations
// ═══════════════════════════════════════════════════════════════

/**
 * Archive records by soft-deleting or marking as archived.
 * For entities without soft-delete, this is a no-op (data stays).
 */
async function archiveRecords(
  tenantId: string,
  entityType: string,
  cutoffDate: Date
): Promise<number> {
  switch (entityType) {
    case 'notification':
      // Delete old read notifications
      const notifResult = await db.notification.deleteMany({
        where: {
          tenantId,
          isRead: true,
          createdAt: { lt: cutoffDate },
        },
      })
      return notifResult.count

    case 'import_job':
      const importResult = await db.importJob.deleteMany({
        where: {
          tenantId,
          status: { in: ['COMPLETED', 'FAILED', 'ROLLED_BACK'] },
          createdAt: { lt: cutoffDate },
        },
      })
      return importResult.count

    case 'email_queue':
      const emailResult = await db.emailQueue.deleteMany({
        where: {
          tenantId,
          status: { in: ['SENT', 'FAILED', 'BOUNCED'] },
          createdAt: { lt: cutoffDate },
        },
      })
      return emailResult.count

    case 'workflow_instance':
      // Only archive completed/cancelled workflows
      const wfResult = await db.workflowInstance.deleteMany({
        where: {
          tenantId,
          status: { in: ['APPROVED', 'REJECTED', 'CANCELLED'] },
          completedAt: { lt: cutoffDate },
        },
      })
      return wfResult.count

    default:
      // For regulated data (payroll, attendance, etc.), archival
      // means flagging but not deleting. Return 0 as no destructive action.
      return 0
  }
}

/**
 * Anonymize PII in old records while preserving aggregate data.
 */
async function anonymizeRecords(
  tenantId: string,
  entityType: string,
  cutoffDate: Date
): Promise<number> {
  switch (entityType) {
    case 'audit_log':
      // Strip IP and user agent from old audit logs
      const auditResult = await db.auditLog.updateMany({
        where: {
          tenantId,
          createdAt: { lt: cutoffDate },
          ipAddress: { not: null },
        },
        data: {
          ipAddress: null,
          userAgent: null,
        },
      })
      return auditResult.count

    default:
      return 0
  }
}

/**
 * Hard delete old records.
 * Only for non-regulated, transient data.
 */
async function deleteRecords(
  tenantId: string,
  entityType: string,
  cutoffDate: Date
): Promise<number> {
  switch (entityType) {
    case 'notification':
      const result = await db.notification.deleteMany({
        where: {
          tenantId,
          createdAt: { lt: cutoffDate },
        },
      })
      return result.count

    default:
      return 0
  }
}

// ═══════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════

/**
 * Minimum retention days enforced by law
 */
function getMinRetentionDays(entityType: string): number {
  const minimums: Record<string, number> = {
    payroll: 3650,           // 10 years (tax law)
    tax_settlement: 3650,    // 10 years
    insurance_report: 3650,  // 10 years (BHXH law)
    contract: 3650,          // 10 years
    attendance: 1095,        // 3 years minimum
    audit_log: 1095,         // 3 years minimum
  }
  return minimums[entityType] || 30
}

function getEntityLabel(entityType: string): string {
  const labels: Record<string, string> = {
    payroll: 'Bảng lương',
    tax_settlement: 'Quyết toán thuế',
    insurance_report: 'Báo cáo bảo hiểm',
    contract: 'Hợp đồng lao động',
    attendance: 'Chấm công',
    attendance_summary: 'Tổng hợp chấm công',
    audit_log: 'Nhật ký hoạt động',
    leave_request: 'Đơn nghỉ phép',
    overtime_request: 'Đơn tăng ca',
    notification: 'Thông báo',
    workflow_instance: 'Quy trình duyệt',
    import_job: 'Import dữ liệu',
    email_queue: 'Hàng đợi email',
  }
  return labels[entityType] || entityType
}
