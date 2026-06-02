// src/lib/cache/cache-keys.ts

/**
 * LAC VIET HR - Cache Key Generator
 * Consistent cache key generation and naming conventions
 */

import crypto from 'crypto';

// ════════════════════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════════════════════

export interface CacheKeyParams {
  entity?: string;
  id?: string;
  action?: string;
  userId?: string;
  tenantId?: string;
  params?: Record<string, unknown>;
  version?: string;
}

// ════════════════════════════════════════════════════════════════════════════════
// CACHE KEY PREFIXES
// ════════════════════════════════════════════════════════════════════════════════

export const CachePrefix = {
  // Entities
  EMPLOYEE: 'employee',
  DEPARTMENT: 'department',
  POSITION: 'position',
  USER: 'user',
  LEAVE: 'leave',
  ATTENDANCE: 'attendance',
  PAYROLL: 'payroll',
  RECRUITMENT: 'recruitment',
  TRAINING: 'training',
  PERFORMANCE: 'performance',

  // Auth & Session
  SESSION: 'session',
  TOKEN: 'token',
  PERMISSION: 'permission',
  ROLE: 'role',
  MFA: 'mfa',

  // System
  CONFIG: 'config',
  SETTINGS: 'settings',
  NOTIFICATION: 'notification',

  // Analytics
  STATS: 'stats',
  REPORT: 'report',
  DASHBOARD: 'dashboard',

  // Lists
  LIST: 'list',
  SEARCH: 'search',

  // Rate Limiting
  RATE_LIMIT: 'ratelimit',
  LOCKOUT: 'lockout',

  // Temporary
  TEMP: 'temp',
  CACHE: 'cache',
} as const;

// ════════════════════════════════════════════════════════════════════════════════
// KEY GENERATION FUNCTIONS
// ════════════════════════════════════════════════════════════════════════════════

/**
 * Generate a consistent cache key from parameters
 */
export function generateCacheKey(params: CacheKeyParams): string {
  const parts: string[] = [];

  // Add tenant if multi-tenant
  if (params.tenantId) {
    parts.push(`t:${params.tenantId}`);
  }

  // Add entity
  if (params.entity) {
    parts.push(params.entity);
  }

  // Add action
  if (params.action) {
    parts.push(params.action);
  }

  // Add ID
  if (params.id) {
    parts.push(params.id);
  }

  // Add user scope
  if (params.userId) {
    parts.push(`u:${params.userId}`);
  }

  // Add version
  if (params.version) {
    parts.push(`v:${params.version}`);
  }

  // Add params hash
  if (params.params && Object.keys(params.params).length > 0) {
    const paramsHash = hashParams(params.params);
    parts.push(`p:${paramsHash}`);
  }

  return parts.join(':');
}

/**
 * Hash parameters for cache key
 */
export function hashParams(params: Record<string, unknown>): string {
  const sorted = Object.keys(params)
    .sort()
    .reduce((acc, key) => {
      acc[key] = params[key];
      return acc;
    }, {} as Record<string, unknown>);

  const json = JSON.stringify(sorted);
  return crypto.createHash('md5').update(json).digest('hex').substring(0, 8);
}

// ════════════════════════════════════════════════════════════════════════════════
// ENTITY-SPECIFIC KEY GENERATORS
// ════════════════════════════════════════════════════════════════════════════════

export const CacheKeys = {
  // Employee keys
  employee: {
    byId: (id: string) => `${CachePrefix.EMPLOYEE}:${id}`,
    profile: (id: string) => `${CachePrefix.EMPLOYEE}:${id}:profile`,
    list: (params?: Record<string, unknown>) =>
      generateCacheKey({ entity: CachePrefix.EMPLOYEE, action: 'list', params }),
    search: (query: string, params?: Record<string, unknown>) =>
      generateCacheKey({ entity: CachePrefix.EMPLOYEE, action: 'search', params: { q: query, ...params } }),
    byDepartment: (departmentId: string) =>
      `${CachePrefix.EMPLOYEE}:dept:${departmentId}`,
    count: () => `${CachePrefix.EMPLOYEE}:count`,
    stats: () => `${CachePrefix.EMPLOYEE}:stats`,
  },

  // Department keys
  department: {
    byId: (id: string) => `${CachePrefix.DEPARTMENT}:${id}`,
    list: () => `${CachePrefix.DEPARTMENT}:list`,
    tree: () => `${CachePrefix.DEPARTMENT}:tree`,
    withEmployees: (id: string) => `${CachePrefix.DEPARTMENT}:${id}:employees`,
  },

  // User/Auth keys
  user: {
    byId: (id: string) => `${CachePrefix.USER}:${id}`,
    byEmail: (email: string) => `${CachePrefix.USER}:email:${email.toLowerCase()}`,
    permissions: (id: string) => `${CachePrefix.PERMISSION}:${id}`,
    roles: (id: string) => `${CachePrefix.ROLE}:${id}`,
    session: (sessionId: string) => `${CachePrefix.SESSION}:${sessionId}`,
    sessions: (userId: string) => `${CachePrefix.SESSION}:user:${userId}`,
    token: (tokenId: string) => `${CachePrefix.TOKEN}:${tokenId}`,
    mfa: (userId: string) => `${CachePrefix.MFA}:${userId}`,
  },

  // Leave keys
  leave: {
    byId: (id: string) => `${CachePrefix.LEAVE}:${id}`,
    byEmployee: (employeeId: string) => `${CachePrefix.LEAVE}:emp:${employeeId}`,
    balance: (employeeId: string, year: number) =>
      `${CachePrefix.LEAVE}:balance:${employeeId}:${year}`,
    pending: (managerId: string) => `${CachePrefix.LEAVE}:pending:${managerId}`,
    calendar: (year: number, month: number) =>
      `${CachePrefix.LEAVE}:calendar:${year}:${month}`,
  },

  // Attendance keys
  attendance: {
    today: (employeeId: string) =>
      `${CachePrefix.ATTENDANCE}:${employeeId}:${new Date().toISOString().split('T')[0]}`,
    byDate: (employeeId: string, date: string) =>
      `${CachePrefix.ATTENDANCE}:${employeeId}:${date}`,
    summary: (employeeId: string, month: string) =>
      `${CachePrefix.ATTENDANCE}:summary:${employeeId}:${month}`,
  },

  // Payroll keys
  payroll: {
    slip: (employeeId: string, period: string) =>
      `${CachePrefix.PAYROLL}:slip:${employeeId}:${period}`,
    summary: (period: string) => `${CachePrefix.PAYROLL}:summary:${period}`,
    calculation: (employeeId: string, period: string) =>
      `${CachePrefix.PAYROLL}:calc:${employeeId}:${period}`,
  },

  // Analytics/Dashboard keys
  analytics: {
    dashboard: (userId: string) => `${CachePrefix.DASHBOARD}:${userId}`,
    stats: (type: string, period: string) => `${CachePrefix.STATS}:${type}:${period}`,
    report: (reportId: string) => `${CachePrefix.REPORT}:${reportId}`,
    kpi: (type: string) => `${CachePrefix.STATS}:kpi:${type}`,
  },

  // System keys
  system: {
    config: (key: string) => `${CachePrefix.CONFIG}:${key}`,
    settings: () => `${CachePrefix.SETTINGS}:global`,
    tenantSettings: (tenantId: string) => `${CachePrefix.SETTINGS}:tenant:${tenantId}`,
  },

  // Rate limiting keys
  rateLimit: {
    api: (identifier: string) => `${CachePrefix.RATE_LIMIT}:api:${identifier}`,
    login: (identifier: string) => `${CachePrefix.RATE_LIMIT}:login:${identifier}`,
    lockout: (identifier: string) => `${CachePrefix.LOCKOUT}:${identifier}`,
  },
};

// ════════════════════════════════════════════════════════════════════════════════
// INVALIDATION PATTERNS
// ════════════════════════════════════════════════════════════════════════════════

export const InvalidationPatterns = {
  // Invalidate all employee caches
  allEmployees: () => `${CachePrefix.EMPLOYEE}:*`,

  // Invalidate specific employee and related
  employee: (id: string) => [
    `${CachePrefix.EMPLOYEE}:${id}*`,
    `${CachePrefix.EMPLOYEE}:list:*`,
  ],

  // Invalidate department and related
  department: (id: string) => [
    `${CachePrefix.DEPARTMENT}:${id}*`,
    `${CachePrefix.DEPARTMENT}:list`,
    `${CachePrefix.DEPARTMENT}:tree`,
    `${CachePrefix.EMPLOYEE}:dept:${id}`,
  ],

  // Invalidate user auth caches
  userAuth: (userId: string) => [
    `${CachePrefix.USER}:${userId}*`,
    `${CachePrefix.PERMISSION}:${userId}`,
    `${CachePrefix.ROLE}:${userId}`,
    `${CachePrefix.SESSION}:user:${userId}`,
  ],

  // Invalidate leave caches
  leave: (employeeId: string) => [
    `${CachePrefix.LEAVE}:emp:${employeeId}`,
    `${CachePrefix.LEAVE}:balance:${employeeId}:*`,
    `${CachePrefix.LEAVE}:calendar:*`,
  ],

  // Invalidate all analytics
  allAnalytics: () => [
    `${CachePrefix.DASHBOARD}:*`,
    `${CachePrefix.STATS}:*`,
    `${CachePrefix.REPORT}:*`,
  ],
};

// ════════════════════════════════════════════════════════════════════════════════
// CACHE TAGS
// ════════════════════════════════════════════════════════════════════════════════

export const CacheTags = {
  // Entity tags
  EMPLOYEES: 'employees',
  DEPARTMENTS: 'departments',
  USERS: 'users',
  LEAVES: 'leaves',
  ATTENDANCE: 'attendance',
  PAYROLL: 'payroll',

  // Scope tags
  USER_SCOPED: (userId: string) => `user:${userId}`,
  TENANT_SCOPED: (tenantId: string) => `tenant:${tenantId}`,
  DEPARTMENT_SCOPED: (deptId: string) => `dept:${deptId}`,

  // Type tags
  LIST: 'list',
  DETAIL: 'detail',
  STATS: 'stats',
  CONFIG: 'config',
};

export default CacheKeys;
