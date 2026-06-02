// src/lib/security/field-permissions.ts
// Field-level access control for sensitive data (P2-18)
// Controls visibility of fields like salary, CCCD, bank account per role

import { db } from '@/lib/db'

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

export type FieldAccess = 'hidden' | 'masked' | 'read' | 'write'

export interface FieldPermissionRule {
  entity: string
  fieldName: string
  access: FieldAccess
}

// ═══════════════════════════════════════════════════════════════
// Sensitive field definitions
// ═══════════════════════════════════════════════════════════════

/** Fields considered sensitive per entity type */
export const SENSITIVE_FIELDS: Record<string, string[]> = {
  employee: [
    'idNumber',        // CCCD/CMND
    'taxCode',         // Mã số thuế
    'socialInsuranceNumber',
    'bankAccount',
    'bankName',
    'bankBranch',
    'personalEmail',
    'phone',
    'permanentAddress',
    'currentAddress',
    'dateOfBirth',
  ],
  payroll: [
    'baseSalary',
    'insuranceSalary',
    'grossSalary',
    'netSalary',
    'pit',
    'totalDeductions',
    'totalInsuranceEmployee',
    'bankAccount',
  ],
  contract: [
    'baseSalary',
    'insuranceSalary',
    'allowances',
  ],
}

// Default access for legacy roles (roles without custom field permissions)
const DEFAULT_FIELD_ACCESS: Record<string, FieldAccess> = {
  SUPER_ADMIN: 'write',
  ADMIN: 'write',
  HR_MANAGER: 'write',
  HR_STAFF: 'read',
  VIEWER: 'hidden',
}

// ═══════════════════════════════════════════════════════════════
// Core Functions
// ═══════════════════════════════════════════════════════════════

/**
 * Get field permissions for a user's custom roles.
 * Returns a map of entity.field → best access level.
 */
export async function getUserFieldPermissions(
  userId: string,
  legacyRole: string
): Promise<Map<string, FieldAccess>> {
  const result = new Map<string, FieldAccess>()

  // Start with legacy role defaults for all sensitive fields
  const defaultAccess = DEFAULT_FIELD_ACCESS[legacyRole] || 'hidden'
  for (const [entity, fields] of Object.entries(SENSITIVE_FIELDS)) {
    for (const field of fields) {
      result.set(`${entity}.${field}`, defaultAccess)
    }
  }

  // Override with custom role field permissions (highest access wins)
  const customPermissions = await db.fieldPermission.findMany({
    where: {
      role: {
        users: { some: { userId } },
        isActive: true,
      },
    },
  })

  for (const fp of customPermissions) {
    const key = `${fp.entity}.${fp.fieldName}`
    const current = result.get(key)
    const incoming = fp.access as FieldAccess
    if (!current || accessPriority(incoming) > accessPriority(current)) {
      result.set(key, incoming)
    }
  }

  return result
}

function accessPriority(access: FieldAccess): number {
  switch (access) {
    case 'write': return 4
    case 'read': return 3
    case 'masked': return 2
    case 'hidden': return 1
    default: return 0
  }
}

/**
 * Apply field-level access control to a data object.
 * Strips hidden fields, masks masked fields, leaves read/write as-is.
 */
export function applyFieldAccess<T extends Record<string, unknown>>(
  data: T,
  entity: string,
  fieldPermissions: Map<string, FieldAccess>
): T {
  const sensitiveFields = SENSITIVE_FIELDS[entity]
  if (!sensitiveFields) return data

  const result: Record<string, unknown> = { ...data }

  for (const field of sensitiveFields) {
    if (!(field in result)) continue

    const key = `${entity}.${field}`
    const access = fieldPermissions.get(key) || 'hidden'

    switch (access) {
      case 'hidden':
        delete result[field]
        break
      case 'masked':
        result[field] = maskValue(result[field])
        break
      // 'read' and 'write' - leave as-is
    }
  }

  return result as T
}

/**
 * Apply field access to an array of records.
 */
export function applyFieldAccessToList<T extends Record<string, unknown>>(
  items: T[],
  entity: string,
  fieldPermissions: Map<string, FieldAccess>
): T[] {
  return items.map((item) => applyFieldAccess(item, entity, fieldPermissions))
}

/**
 * Check if a user can write to a specific field.
 */
export function canWriteField(
  entity: string,
  fieldName: string,
  fieldPermissions: Map<string, FieldAccess>
): boolean {
  const key = `${entity}.${fieldName}`
  const sensitiveFields = SENSITIVE_FIELDS[entity]

  // Non-sensitive fields are always writable
  if (!sensitiveFields?.includes(fieldName)) return true

  return fieldPermissions.get(key) === 'write'
}

// ═══════════════════════════════════════════════════════════════
// Masking Helpers
// ═══════════════════════════════════════════════════════════════

function maskValue(value: unknown): unknown {
  if (value === null || value === undefined) return value

  if (typeof value === 'string') {
    if (value.length <= 4) return '***'
    return '***' + value.slice(-4)
  }

  if (typeof value === 'number') {
    return 0 // Mask salary as 0
  }

  // For objects/arrays, return null
  return null
}

// ═══════════════════════════════════════════════════════════════
// Admin CRUD for Field Permissions
// ═══════════════════════════════════════════════════════════════

export async function setFieldPermissions(
  roleId: string,
  permissions: { entity: string; fieldName: string; access: FieldAccess }[]
) {
  // Delete existing and recreate
  await db.fieldPermission.deleteMany({ where: { roleId } })

  if (permissions.length > 0) {
    await db.fieldPermission.createMany({
      data: permissions.map((p) => ({
        roleId,
        entity: p.entity,
        fieldName: p.fieldName,
        access: p.access,
      })),
    })
  }
}

export async function getFieldPermissionsForRole(roleId: string) {
  return db.fieldPermission.findMany({
    where: { roleId },
    orderBy: [{ entity: 'asc' }, { fieldName: 'asc' }],
  })
}
