// src/lib/security/custom-roles.ts
// Custom Role Engine - Dynamic role-based access control (P2-17)

import { db } from '@/lib/db'
import { ApiError, ErrorCode } from '@/lib/errors/api-error'

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

export interface Permission {
  resource: string
  action: string
  scope: 'own' | 'department' | 'all'
}

export interface ResolvedRole {
  id: string
  code: string
  name: string
  level: number
  permissions: Permission[]
}

// ═══════════════════════════════════════════════════════════════
// Legacy role mapping (backward compat with UserRole enum)
// ═══════════════════════════════════════════════════════════════

const LEGACY_ROLE_MAP: Record<string, { level: number; code: string }> = {
  SUPER_ADMIN: { level: 100, code: 'SUPER_ADMIN' },
  ADMIN: { level: 90, code: 'ADMIN' },
  HR_MANAGER: { level: 80, code: 'HR_MANAGER' },
  HR_STAFF: { level: 70, code: 'HR_STAFF' },
  VIEWER: { level: 10, code: 'VIEWER' },
}

// Default permissions for legacy roles (all scopes = 'all')
const LEGACY_PERMISSIONS: Record<string, Permission[]> = {
  SUPER_ADMIN: [
    { resource: '*', action: '*', scope: 'all' },
  ],
  ADMIN: [
    { resource: 'employees', action: 'read', scope: 'all' },
    { resource: 'employees', action: 'create', scope: 'all' },
    { resource: 'employees', action: 'update', scope: 'all' },
    { resource: 'employees', action: 'delete', scope: 'all' },
    { resource: 'employees', action: 'export', scope: 'all' },
    { resource: 'departments', action: '*', scope: 'all' },
    { resource: 'positions', action: '*', scope: 'all' },
    { resource: 'attendance', action: '*', scope: 'all' },
    { resource: 'payroll', action: '*', scope: 'all' },
    { resource: 'leave', action: '*', scope: 'all' },
    { resource: 'overtime', action: '*', scope: 'all' },
    { resource: 'contracts', action: '*', scope: 'all' },
    { resource: 'reports', action: '*', scope: 'all' },
    { resource: 'settings', action: '*', scope: 'all' },
    { resource: 'users', action: '*', scope: 'all' },
    { resource: 'audit', action: 'read', scope: 'all' },
    { resource: 'ai', action: 'read', scope: 'all' },
  ],
  HR_MANAGER: [
    { resource: 'employees', action: 'read', scope: 'all' },
    { resource: 'employees', action: 'create', scope: 'all' },
    { resource: 'employees', action: 'update', scope: 'all' },
    { resource: 'employees', action: 'delete', scope: 'all' },
    { resource: 'employees', action: 'export', scope: 'all' },
    { resource: 'departments', action: 'read', scope: 'all' },
    { resource: 'departments', action: 'create', scope: 'all' },
    { resource: 'departments', action: 'update', scope: 'all' },
    { resource: 'positions', action: '*', scope: 'all' },
    { resource: 'attendance', action: '*', scope: 'all' },
    { resource: 'payroll', action: 'read', scope: 'all' },
    { resource: 'payroll', action: 'create', scope: 'all' },
    { resource: 'payroll', action: 'update', scope: 'all' },
    { resource: 'payroll', action: 'export', scope: 'all' },
    { resource: 'leave', action: '*', scope: 'all' },
    { resource: 'overtime', action: '*', scope: 'all' },
    { resource: 'contracts', action: '*', scope: 'all' },
    { resource: 'reports', action: 'read', scope: 'all' },
    { resource: 'reports', action: 'export', scope: 'all' },
    { resource: 'ai', action: 'read', scope: 'all' },
  ],
  HR_STAFF: [
    { resource: 'employees', action: 'read', scope: 'all' },
    { resource: 'employees', action: 'create', scope: 'all' },
    { resource: 'employees', action: 'update', scope: 'all' },
    { resource: 'employees', action: 'export', scope: 'all' },
    { resource: 'departments', action: 'read', scope: 'all' },
    { resource: 'positions', action: 'read', scope: 'all' },
    { resource: 'attendance', action: 'read', scope: 'all' },
    { resource: 'attendance', action: 'create', scope: 'all' },
    { resource: 'attendance', action: 'update', scope: 'all' },
    { resource: 'attendance', action: 'export', scope: 'all' },
    { resource: 'leave', action: 'read', scope: 'all' },
    { resource: 'leave', action: 'create', scope: 'all' },
    { resource: 'leave', action: 'update', scope: 'all' },
    { resource: 'overtime', action: 'read', scope: 'all' },
    { resource: 'overtime', action: 'create', scope: 'all' },
    { resource: 'overtime', action: 'update', scope: 'all' },
    { resource: 'contracts', action: 'read', scope: 'all' },
    { resource: 'ai', action: 'read', scope: 'all' },
  ],
  VIEWER: [
    { resource: 'employees', action: 'read', scope: 'own' },
    { resource: 'departments', action: 'read', scope: 'all' },
    { resource: 'positions', action: 'read', scope: 'all' },
    { resource: 'attendance', action: 'read', scope: 'own' },
    { resource: 'leave', action: 'read', scope: 'own' },
    { resource: 'leave', action: 'create', scope: 'own' },
    { resource: 'overtime', action: 'read', scope: 'own' },
    { resource: 'ai', action: 'read', scope: 'all' },
  ],
}

// ═══════════════════════════════════════════════════════════════
// Core Functions
// ═══════════════════════════════════════════════════════════════

/**
 * Resolve all effective permissions for a user.
 * Checks both legacy UserRole and custom roles, merging permissions.
 */
export async function resolveUserPermissions(
  userId: string,
  legacyRole: string
): Promise<ResolvedRole[]> {
  const roles: ResolvedRole[] = []

  // 1. Legacy role permissions
  const legacy = LEGACY_ROLE_MAP[legacyRole]
  if (legacy) {
    roles.push({
      id: `legacy:${legacyRole}`,
      code: legacy.code,
      name: legacyRole,
      level: legacy.level,
      permissions: LEGACY_PERMISSIONS[legacyRole] || [],
    })
  }

  // 2. Custom roles from DB
  const customRoles = await db.userCustomRole.findMany({
    where: { userId },
    include: {
      role: {
        include: {
          permissions: true,
        },
      },
    },
  })

  for (const ucr of customRoles) {
    if (!ucr.role.isActive) continue
    roles.push({
      id: ucr.role.id,
      code: ucr.role.code,
      name: ucr.role.name,
      level: ucr.role.level,
      permissions: ucr.role.permissions.map((p) => ({
        resource: p.resource,
        action: p.action,
        scope: p.scope as Permission['scope'],
      })),
    })
  }

  return roles
}

/**
 * Check if a user has a specific permission.
 * Supports wildcard matching (* for resource/action).
 */
export function checkDynamicPermission(
  roles: ResolvedRole[],
  resource: string,
  action: string
): { allowed: boolean; scope: Permission['scope'] } {
  let bestScope: Permission['scope'] | null = null

  for (const role of roles) {
    for (const perm of role.permissions) {
      const resourceMatch = perm.resource === '*' || perm.resource === resource
      const actionMatch = perm.action === '*' || perm.action === action
      if (resourceMatch && actionMatch) {
        // Broader scope wins: all > department > own
        if (!bestScope || scopePriority(perm.scope) > scopePriority(bestScope)) {
          bestScope = perm.scope
        }
      }
    }
  }

  return {
    allowed: bestScope !== null,
    scope: bestScope || 'own',
  }
}

function scopePriority(scope: string): number {
  switch (scope) {
    case 'all': return 3
    case 'department': return 2
    case 'own': return 1
    default: return 0
  }
}

/**
 * Get the highest role level for a user (for hierarchy checks).
 */
export function getHighestLevel(roles: ResolvedRole[]): number {
  return Math.max(0, ...roles.map((r) => r.level))
}

/**
 * Require dynamic permission or throw.
 */
export function requireDynamicPermission(
  roles: ResolvedRole[],
  resource: string,
  action: string
): Permission['scope'] {
  const result = checkDynamicPermission(roles, resource, action)
  if (!result.allowed) {
    throw new ApiError(
      ErrorCode.FORBIDDEN,
      `Bạn không có quyền ${action} trên ${resource}`
    )
  }
  return result.scope
}

// ═══════════════════════════════════════════════════════════════
// CRUD Operations for Custom Roles
// ═══════════════════════════════════════════════════════════════

export async function createCustomRole(
  tenantId: string,
  data: {
    name: string
    code: string
    description?: string
    level?: number
    permissions: { resource: string; action: string; scope?: string }[]
  }
) {
  return db.customRole.create({
    data: {
      tenantId,
      name: data.name,
      code: data.code,
      description: data.description,
      level: data.level ?? 50,
      permissions: {
        create: data.permissions.map((p) => ({
          resource: p.resource,
          action: p.action,
          scope: p.scope || 'all',
        })),
      },
    },
    include: { permissions: true },
  })
}

export async function updateCustomRole(
  roleId: string,
  data: {
    name?: string
    description?: string
    level?: number
    isActive?: boolean
    permissions?: { resource: string; action: string; scope?: string }[]
  }
) {
  // If permissions provided, replace all
  if (data.permissions) {
    await db.rolePermission.deleteMany({ where: { roleId } })
    await db.rolePermission.createMany({
      data: data.permissions.map((p) => ({
        roleId,
        resource: p.resource,
        action: p.action,
        scope: p.scope || 'all',
      })),
    })
  }

  return db.customRole.update({
    where: { id: roleId },
    data: {
      name: data.name,
      description: data.description,
      level: data.level,
      isActive: data.isActive,
    },
    include: { permissions: true },
  })
}

export async function assignRoleToUser(userId: string, roleId: string) {
  return db.userCustomRole.create({
    data: { userId, roleId },
  })
}

export async function removeRoleFromUser(userId: string, roleId: string) {
  return db.userCustomRole.deleteMany({
    where: { userId, roleId },
  })
}
