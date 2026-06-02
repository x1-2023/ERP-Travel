// lib/audit/audit-logger.ts

/**
 * LAC VIET HR - Audit Logger
 * Enterprise security audit logging system
 */

// ════════════════════════════════════════════════════════════════════════════════
// AUDIT EVENT TYPES
// ════════════════════════════════════════════════════════════════════════════════

export const AUDIT_EVENTS = {
  // Authentication Events
  AUTH_LOGIN_SUCCESS: 'auth.login.success',
  AUTH_LOGIN_FAILED: 'auth.login.failed',
  AUTH_LOGOUT: 'auth.logout',
  AUTH_TOKEN_REFRESH: 'auth.token.refresh',
  AUTH_PASSWORD_CHANGE: 'auth.password.change',
  AUTH_PASSWORD_RESET_REQUEST: 'auth.password.reset_request',
  AUTH_PASSWORD_RESET_COMPLETE: 'auth.password.reset_complete',
  AUTH_MFA_ENABLED: 'auth.mfa.enabled',
  AUTH_MFA_DISABLED: 'auth.mfa.disabled',
  AUTH_MFA_VERIFIED: 'auth.mfa.verified',
  AUTH_MFA_FAILED: 'auth.mfa.failed',
  AUTH_SESSION_REVOKED: 'auth.session.revoked',
  AUTH_ACCOUNT_LOCKED: 'auth.account.locked',
  AUTH_ACCOUNT_UNLOCKED: 'auth.account.unlocked',

  // User Management Events
  USER_CREATED: 'user.created',
  USER_UPDATED: 'user.updated',
  USER_DELETED: 'user.deleted',
  USER_ROLE_CHANGED: 'user.role.changed',
  USER_PERMISSIONS_CHANGED: 'user.permissions.changed',
  USER_PROFILE_VIEWED: 'user.profile.viewed',

  // Employee Management Events
  EMPLOYEE_CREATED: 'employee.created',
  EMPLOYEE_UPDATED: 'employee.updated',
  EMPLOYEE_DELETED: 'employee.deleted',
  EMPLOYEE_STATUS_CHANGED: 'employee.status.changed',
  EMPLOYEE_VIEWED: 'employee.viewed',

  // Leave Management Events
  LEAVE_REQUESTED: 'leave.requested',
  LEAVE_APPROVED: 'leave.approved',
  LEAVE_REJECTED: 'leave.rejected',
  LEAVE_CANCELLED: 'leave.cancelled',

  // Data Access Events
  DATA_EXPORT: 'data.export',
  DATA_IMPORT: 'data.import',
  DATA_BULK_UPDATE: 'data.bulk_update',
  DATA_BULK_DELETE: 'data.bulk_delete',
  REPORT_GENERATED: 'report.generated',
  REPORT_VIEWED: 'report.viewed',

  // System Events
  SYSTEM_CONFIG_CHANGED: 'system.config.changed',
  SYSTEM_BACKUP_CREATED: 'system.backup.created',
  SYSTEM_MAINTENANCE_MODE: 'system.maintenance.mode',
  SYSTEM_ERROR: 'system.error',

  // Security Events
  SECURITY_SUSPICIOUS_ACTIVITY: 'security.suspicious_activity',
  SECURITY_RATE_LIMIT_HIT: 'security.rate_limit.hit',
  SECURITY_UNAUTHORIZED_ACCESS: 'security.unauthorized_access',
  SECURITY_PERMISSION_DENIED: 'security.permission_denied',
  SECURITY_IP_BLOCKED: 'security.ip_blocked',
  SECURITY_CSRF_VIOLATION: 'security.csrf_violation',
} as const;

export type AuditEventType = typeof AUDIT_EVENTS[keyof typeof AUDIT_EVENTS];

// ════════════════════════════════════════════════════════════════════════════════
// AUDIT LOG INTERFACES
// ════════════════════════════════════════════════════════════════════════════════

export type AuditSeverity = 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
export type ActorType = 'USER' | 'SYSTEM' | 'API' | 'WEBHOOK';

export interface AuditLog {
  id: string;
  timestamp: Date;
  event: AuditEventType;
  severity: AuditSeverity;

  // Actor information
  actorId?: string;
  actorEmail?: string;
  actorRole?: string;
  actorType: ActorType;

  // Target information
  targetType?: string;
  targetId?: string;

  // Request context
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
  sessionId?: string;

  // Event details
  description: string;
  metadata?: Record<string, unknown>;

  // Change tracking
  previousValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;

  // Status
  success: boolean;
  errorMessage?: string;
}

export interface AuditLogInput {
  event: AuditEventType;
  severity?: AuditSeverity;
  actorId?: string;
  actorEmail?: string;
  actorRole?: string;
  actorType?: ActorType;
  targetType?: string;
  targetId?: string;
  description: string;
  metadata?: Record<string, unknown>;
  previousValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  success?: boolean;
  errorMessage?: string;
  request?: {
    ip?: string;
    userAgent?: string;
    requestId?: string;
    sessionId?: string;
  };
}

// ════════════════════════════════════════════════════════════════════════════════
// AUDIT LOG STORAGE INTERFACE
// ════════════════════════════════════════════════════════════════════════════════

export interface AuditLogStorage {
  save(log: AuditLog): Promise<void>;
  query(params: AuditQueryParams): Promise<{ logs: AuditLog[]; total: number }>;
  getById(id: string): Promise<AuditLog | null>;
}

export interface AuditQueryParams {
  startDate?: Date;
  endDate?: Date;
  event?: AuditEventType | AuditEventType[];
  severity?: AuditSeverity | AuditSeverity[];
  actorId?: string;
  targetId?: string;
  targetType?: string;
  success?: boolean;
  ipAddress?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'timestamp' | 'severity' | 'event';
  sortOrder?: 'asc' | 'desc';
}

// ════════════════════════════════════════════════════════════════════════════════
// IN-MEMORY STORAGE (for development)
// ════════════════════════════════════════════════════════════════════════════════

class InMemoryAuditStorage implements AuditLogStorage {
  private logs: AuditLog[] = [];
  private maxSize = 10000;

  async save(log: AuditLog): Promise<void> {
    this.logs.unshift(log);

    // Trim if exceeds max size
    if (this.logs.length > this.maxSize) {
      this.logs = this.logs.slice(0, this.maxSize);
    }
  }

  async query(params: AuditQueryParams): Promise<{ logs: AuditLog[]; total: number }> {
    let filtered = [...this.logs];

    // Apply filters
    if (params.startDate) {
      filtered = filtered.filter(l => l.timestamp >= params.startDate!);
    }
    if (params.endDate) {
      filtered = filtered.filter(l => l.timestamp <= params.endDate!);
    }
    if (params.event) {
      const events = Array.isArray(params.event) ? params.event : [params.event];
      filtered = filtered.filter(l => events.includes(l.event));
    }
    if (params.severity) {
      const severities = Array.isArray(params.severity) ? params.severity : [params.severity];
      filtered = filtered.filter(l => severities.includes(l.severity));
    }
    if (params.actorId) {
      filtered = filtered.filter(l => l.actorId === params.actorId);
    }
    if (params.targetId) {
      filtered = filtered.filter(l => l.targetId === params.targetId);
    }
    if (params.targetType) {
      filtered = filtered.filter(l => l.targetType === params.targetType);
    }
    if (params.success !== undefined) {
      filtered = filtered.filter(l => l.success === params.success);
    }
    if (params.ipAddress) {
      filtered = filtered.filter(l => l.ipAddress === params.ipAddress);
    }
    if (params.search) {
      const searchLower = params.search.toLowerCase();
      filtered = filtered.filter(l =>
        l.description.toLowerCase().includes(searchLower) ||
        l.actorEmail?.toLowerCase().includes(searchLower)
      );
    }

    // Sort
    const sortBy = params.sortBy || 'timestamp';
    const sortOrder = params.sortOrder || 'desc';
    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'timestamp') {
        comparison = a.timestamp.getTime() - b.timestamp.getTime();
      } else if (sortBy === 'severity') {
        const severityOrder = { INFO: 0, WARNING: 1, ERROR: 2, CRITICAL: 3 };
        comparison = severityOrder[a.severity] - severityOrder[b.severity];
      } else if (sortBy === 'event') {
        comparison = a.event.localeCompare(b.event);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    // Paginate
    const page = params.page || 1;
    const limit = params.limit || 50;
    const start = (page - 1) * limit;
    const paginated = filtered.slice(start, start + limit);

    return { logs: paginated, total: filtered.length };
  }

  async getById(id: string): Promise<AuditLog | null> {
    return this.logs.find(l => l.id === id) || null;
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// AUDIT LOGGER CLASS
// ════════════════════════════════════════════════════════════════════════════════

export class AuditLogger {
  private storage: AuditLogStorage;
  private alertHandlers: ((log: AuditLog) => void)[] = [];

  constructor(storage?: AuditLogStorage) {
    this.storage = storage || new InMemoryAuditStorage();
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // LOG EVENT
  // ─────────────────────────────────────────────────────────────────────────────

  async log(input: AuditLogInput): Promise<AuditLog> {
    const auditLog: AuditLog = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      event: input.event,
      severity: input.severity || this.inferSeverity(input.event),
      actorId: input.actorId,
      actorEmail: input.actorEmail,
      actorRole: input.actorRole,
      actorType: input.actorType || 'USER',
      targetType: input.targetType,
      targetId: input.targetId,
      description: input.description,
      metadata: input.metadata,
      previousValue: input.previousValue,
      newValue: input.newValue,
      success: input.success ?? true,
      errorMessage: input.errorMessage,
      ipAddress: input.request?.ip,
      userAgent: input.request?.userAgent,
      requestId: input.request?.requestId,
      sessionId: input.request?.sessionId,
    };

    // Save to storage
    await this.storage.save(auditLog);

    // Trigger alerts for critical events
    if (auditLog.severity === 'CRITICAL' || auditLog.severity === 'ERROR') {
      this.triggerAlerts(auditLog);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      this.consoleLog(auditLog);
    }

    return auditLog;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // CONVENIENCE METHODS
  // ─────────────────────────────────────────────────────────────────────────────

  async logAuthSuccess(actorId: string, actorEmail: string, ip?: string): Promise<void> {
    await this.log({
      event: AUDIT_EVENTS.AUTH_LOGIN_SUCCESS,
      actorId,
      actorEmail,
      description: `User ${actorEmail} logged in successfully`,
      request: { ip },
    });
  }

  async logAuthFailure(email: string, reason: string, ip?: string): Promise<void> {
    await this.log({
      event: AUDIT_EVENTS.AUTH_LOGIN_FAILED,
      severity: 'WARNING',
      actorEmail: email,
      description: `Login failed for ${email}: ${reason}`,
      success: false,
      errorMessage: reason,
      request: { ip },
    });
  }

  async logAccountLocked(email: string, reason: string, ip?: string): Promise<void> {
    await this.log({
      event: AUDIT_EVENTS.AUTH_ACCOUNT_LOCKED,
      severity: 'CRITICAL',
      actorEmail: email,
      description: `Account locked for ${email}: ${reason}`,
      metadata: { reason },
      request: { ip },
    });
  }

  async logSuspiciousActivity(details: string, ip?: string, metadata?: Record<string, unknown>): Promise<void> {
    await this.log({
      event: AUDIT_EVENTS.SECURITY_SUSPICIOUS_ACTIVITY,
      severity: 'CRITICAL',
      actorType: 'SYSTEM',
      description: details,
      metadata,
      request: { ip },
    });
  }

  async logDataExport(actorId: string, actorEmail: string, dataType: string, recordCount: number): Promise<void> {
    await this.log({
      event: AUDIT_EVENTS.DATA_EXPORT,
      actorId,
      actorEmail,
      targetType: dataType,
      description: `Exported ${recordCount} ${dataType} records`,
      metadata: { recordCount },
    });
  }

  async logEntityChange<T extends Record<string, unknown>>(
    event: AuditEventType,
    actorId: string,
    actorEmail: string,
    entityType: string,
    entityId: string,
    previousValue?: T,
    newValue?: T
  ): Promise<void> {
    await this.log({
      event,
      actorId,
      actorEmail,
      targetType: entityType,
      targetId: entityId,
      description: `${entityType} ${entityId} was modified`,
      previousValue,
      newValue,
    });
  }

  // Static method for backward compatibility
  static async logSecurityEvent(data: {
    type: string;
    identifier: string;
    ipAddress: string;
    details: Record<string, unknown>;
  }): Promise<void> {
    const logger = getAuditLogger();
    await logger.log({
      event: AUDIT_EVENTS.SECURITY_SUSPICIOUS_ACTIVITY,
      severity: 'WARNING',
      actorType: 'SYSTEM',
      description: `Security event: ${data.type}`,
      metadata: { ...data.details, identifier: data.identifier },
      request: { ip: data.ipAddress },
    });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // QUERY LOGS
  // ─────────────────────────────────────────────────────────────────────────────

  async query(params: AuditQueryParams): Promise<{ logs: AuditLog[]; total: number }> {
    return this.storage.query(params);
  }

  async getById(id: string): Promise<AuditLog | null> {
    return this.storage.getById(id);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // ALERT HANDLERS
  // ─────────────────────────────────────────────────────────────────────────────

  onAlert(handler: (log: AuditLog) => void): void {
    this.alertHandlers.push(handler);
  }

  private triggerAlerts(log: AuditLog): void {
    for (const handler of this.alertHandlers) {
      try {
        handler(log);
      } catch (error) {
        console.error('Alert handler error:', error);
      }
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────────────────────────────────────

  private inferSeverity(event: AuditEventType): AuditSeverity {
    const criticalEvents: string[] = [
      AUDIT_EVENTS.AUTH_ACCOUNT_LOCKED,
      AUDIT_EVENTS.SECURITY_SUSPICIOUS_ACTIVITY,
      AUDIT_EVENTS.SECURITY_UNAUTHORIZED_ACCESS,
      AUDIT_EVENTS.DATA_BULK_DELETE,
    ];
    if (criticalEvents.includes(event)) {
      return 'CRITICAL';
    }

    const errorEvents: string[] = [
      AUDIT_EVENTS.USER_DELETED,
      AUDIT_EVENTS.EMPLOYEE_DELETED,
      AUDIT_EVENTS.SYSTEM_ERROR,
    ];
    if (errorEvents.includes(event)) {
      return 'ERROR';
    }

    const warningEvents: string[] = [
      AUDIT_EVENTS.AUTH_LOGIN_FAILED,
      AUDIT_EVENTS.AUTH_MFA_FAILED,
      AUDIT_EVENTS.SECURITY_RATE_LIMIT_HIT,
      AUDIT_EVENTS.SECURITY_PERMISSION_DENIED,
    ];
    if (warningEvents.includes(event)) {
      return 'WARNING';
    }

    return 'INFO';
  }

  private consoleLog(log: AuditLog): void {
    const severityColors = {
      INFO: '\x1b[36m',     // Cyan
      WARNING: '\x1b[33m',  // Yellow
      ERROR: '\x1b[31m',    // Red
      CRITICAL: '\x1b[35m', // Magenta
    };
    const reset = '\x1b[0m';
    const color = severityColors[log.severity];

  }
}

// ════════════════════════════════════════════════════════════════════════════════
// SINGLETON INSTANCE
// ════════════════════════════════════════════════════════════════════════════════

let auditLoggerInstance: AuditLogger | null = null;

export function getAuditLogger(storage?: AuditLogStorage): AuditLogger {
  if (!auditLoggerInstance) {
    auditLoggerInstance = new AuditLogger(storage);
  }
  return auditLoggerInstance;
}

// ════════════════════════════════════════════════════════════════════════════════
// HELPER: Create Audit Context from Request
// ════════════════════════════════════════════════════════════════════════════════

export function createAuditContext(
  request: Request,
  session?: { userId: string; email: string; role: string }
): Partial<AuditLogInput> {
  return {
    actorId: session?.userId,
    actorEmail: session?.email,
    actorRole: session?.role,
    actorType: session ? 'USER' : 'SYSTEM',
    request: {
      ip: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
          request.headers.get('x-real-ip') ||
          undefined,
      userAgent: request.headers.get('user-agent') || undefined,
      requestId: request.headers.get('x-request-id') || crypto.randomUUID(),
    },
  };
}
