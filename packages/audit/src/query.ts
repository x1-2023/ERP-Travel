/**
 * Audit Log Query Helpers
 * Provides convenient query functions for common audit trail operations
 */

import { AuditAction, AuditEntry, AuditQueryOptions } from "./types";
import { AuditStore } from "./store";

/**
 * Query audit log with filters and pagination
 */
export async function queryAuditLog(
  store: AuditStore,
  options: Partial<AuditQueryOptions>
): Promise<{ entries: AuditEntry[]; total: number }> {
  const queryOptions: AuditQueryOptions = {
    module: options.module,
    entity: options.entity,
    userId: options.userId,
    action: options.action,
    dateFrom: options.dateFrom,
    dateTo: options.dateTo,
    limit: options.limit || 50,
    offset: options.offset || 0,
  };

  const [entries, total] = await Promise.all([
    store.query(queryOptions),
    store.count({
      module: options.module,
      entity: options.entity,
      userId: options.userId,
      action: options.action,
      dateFrom: options.dateFrom,
      dateTo: options.dateTo,
    }),
  ]);

  return { entries, total };
}

/**
 * Get full change history for a specific entity
 */
export async function getEntityHistory(
  store: AuditStore,
  entity: string,
  entityId: string,
  limit: number = 100
): Promise<AuditEntry[]> {
  const { entries } = await queryAuditLog(store, {
    entity,
    limit,
    offset: 0,
  });

  return entries.filter((e) => e.entityId === entityId);
}

/**
 * Get all actions performed by a specific user
 */
export async function getUserActivity(
  store: AuditStore,
  userId: string,
  options?: {
    dateFrom?: Date;
    dateTo?: Date;
    action?: AuditAction;
    limit?: number;
    offset?: number;
  }
): Promise<{ entries: AuditEntry[]; total: number }> {
  return queryAuditLog(store, {
    userId,
    dateFrom: options?.dateFrom,
    dateTo: options?.dateTo,
    action: options?.action,
    limit: options?.limit || 100,
    offset: options?.offset || 0,
  });
}

/**
 * Get all actions in a specific module
 */
export async function getModuleActivity(
  store: AuditStore,
  module: string,
  options?: {
    dateFrom?: Date;
    dateTo?: Date;
    action?: AuditAction;
    limit?: number;
    offset?: number;
  }
): Promise<{ entries: AuditEntry[]; total: number }> {
  return queryAuditLog(store, {
    module,
    dateFrom: options?.dateFrom,
    dateTo: options?.dateTo,
    action: options?.action,
    limit: options?.limit || 100,
    offset: options?.offset || 0,
  });
}

/**
 * Get activity timeline for a date range
 */
export async function getActivityTimeline(
  store: AuditStore,
  dateFrom: Date,
  dateTo: Date,
  options?: {
    module?: string;
    userId?: string;
    limit?: number;
    offset?: number;
  }
): Promise<{ entries: AuditEntry[]; total: number }> {
  return queryAuditLog(store, {
    module: options?.module,
    userId: options?.userId,
    dateFrom,
    dateTo,
    limit: options?.limit || 100,
    offset: options?.offset || 0,
  });
}

/**
 * Count changes by action type
 */
export async function countByAction(
  store: AuditStore,
  dateFrom?: Date,
  dateTo?: Date
): Promise<Record<AuditAction, number>> {
  const actions = Object.values(AuditAction);
  const counts: Record<AuditAction, number> = {} as Record<AuditAction, number>;

  for (const action of actions) {
    counts[action] = await store.count({
      action,
      dateFrom,
      dateTo,
    });
  }

  return counts;
}

/**
 * Count changes by module
 */
export async function countByModule(
  store: AuditStore,
  dateFrom?: Date,
  dateTo?: Date
): Promise<Record<string, number>> {
  const modules = ["users", "products", "orders", "invoices", "customers"];
  const counts: Record<string, number> = {};

  for (const module of modules) {
    counts[module] = await store.count({
      module,
      dateFrom,
      dateTo,
    });
  }

  return counts;
}

/**
 * Get most active users
 */
export async function getMostActiveUsers(
  store: AuditStore,
  limit: number = 10,
  dateFrom?: Date,
  dateTo?: Date
): Promise<Array<{ userId: string; userName: string; count: number }>> {
  const { entries } = await queryAuditLog(store, {
    limit: Number.MAX_SAFE_INTEGER,
    offset: 0,
    dateFrom,
    dateTo,
  });

  const userCounts = new Map<string, { userId: string; userName: string; count: number }>();

  for (const entry of entries) {
    const key = entry.userId;
    if (userCounts.has(key)) {
      const record = userCounts.get(key)!;
      record.count += 1;
    } else {
      userCounts.set(key, {
        userId: entry.userId,
        userName: entry.userName,
        count: 1,
      });
    }
  }

  return Array.from(userCounts.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/**
 * Get audit entries for approval workflow
 */
export async function getApprovalRequests(
  store: AuditStore,
  options?: {
    module?: string;
    dateFrom?: Date;
    dateTo?: Date;
    limit?: number;
    offset?: number;
  }
): Promise<{ entries: AuditEntry[]; total: number }> {
  const entries = await Promise.all([
    queryAuditLog(store, {
      action: AuditAction.APPROVE,
      module: options?.module,
      dateFrom: options?.dateFrom,
      dateTo: options?.dateTo,
      limit: options?.limit || 50,
      offset: options?.offset || 0,
    }),
    queryAuditLog(store, {
      action: AuditAction.REJECT,
      module: options?.module,
      dateFrom: options?.dateFrom,
      dateTo: options?.dateTo,
      limit: options?.limit || 50,
      offset: options?.offset || 0,
    }),
  ]);

  const combined = [...entries[0].entries, ...entries[1].entries]
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  return {
    entries: combined.slice(0, options?.limit || 50),
    total: entries[0].total + entries[1].total,
  };
}

/**
 * Export audit log to JSON or CSV
 */
export async function exportAuditLog(
  store: AuditStore,
  format: "json" | "csv",
  options?: {
    dateFrom?: Date;
    dateTo?: Date;
  }
): Promise<string> {
  return store.export(format, options?.dateFrom, options?.dateTo);
}

/**
 * Purge old audit entries
 */
export async function purgeOldEntries(
  store: AuditStore,
  olderThan: Date
): Promise<number> {
  return store.purge(olderThan);
}
