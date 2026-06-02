/**
 * Prisma Middleware for Audit Trail
 * Automatically logs CREATE, UPDATE, DELETE operations
 */

import { PrismaClient } from "@prisma/client";
import { computeDiff, maskSensitiveData } from "./differ";
import { AuditAction, AuditContext } from "./types";
import { AuditStore } from "./store";

/**
 * Buffer for batching audit entries
 */
interface BufferedEntry {
  timestamp: Date;
  userId: string;
  userName: string;
  module: string;
  entity: string;
  entityId: string;
  action: AuditAction;
  changes: Array<{
    field: string;
    oldValue: unknown;
    newValue: unknown;
  }>;
  oldValue?: Record<string, unknown> | null;
  newValue?: Record<string, unknown> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, unknown> | null;
}

/**
 * Audit middleware manager
 */
export class AuditMiddleware {
  private buffer: BufferedEntry[] = [];
  private flushInterval: NodeJS.Timeout | null = null;
  private readonly BATCH_SIZE = 100;
  private readonly BATCH_TIMEOUT = 5000; // 5 seconds
  private auditStore: AuditStore;
  private context: AuditContext;

  constructor(auditStore: AuditStore, context: AuditContext) {
    this.auditStore = auditStore;
    this.context = context;
    this.startBatchFlusher();
  }

  /**
   * Start the batch flusher interval
   */
  private startBatchFlusher(): void {
    this.flushInterval = setInterval(() => {
      if (this.buffer.length > 0) {
        this.flush();
      }
    }, this.BATCH_TIMEOUT);
  }

  /**
   * Stop the batch flusher
   */
  stop(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
    if (this.buffer.length > 0) {
      this.flush();
    }
  }

  /**
   * Add entry to buffer
   */
  private bufferEntry(entry: BufferedEntry): void {
    this.buffer.push(entry);
    if (this.buffer.length >= this.BATCH_SIZE) {
      this.flush();
    }
  }

  /**
   * Flush buffer to audit store
   */
  private async flush(): Promise<void> {
    if (this.buffer.length === 0) return;

    const entriesToWrite = [...this.buffer];
    this.buffer = [];

    try {
      for (const entry of entriesToWrite) {
        await this.auditStore.write(entry);
      }
    } catch (error) {
      console.error("Failed to flush audit entries:", error);
      // Re-add entries to buffer for retry
      this.buffer.unshift(...entriesToWrite);
    }
  }

  /**
   * Create middleware extension for Prisma
   */
  createMiddleware() {
    return async (
      params: any,
      next: (params: any) => Promise<any>
    ) => {
      const result = await next(params);
      const { model, action, args } = params;

      // Skip non-data operations
      if (!model || !["create", "update", "delete", "createMany"].includes(action)) {
        return result;
      }

      // Extract module from model name (e.g., "User" -> "users", "Product" -> "products")
      const module = model.charAt(0).toLowerCase() + model.slice(1);
      const entity = model;
      const now = new Date();

      try {
        if (action === "create") {
          const entityId = this.extractEntityId(result, model);
          const changes = computeDiff(null, args.data);

          this.bufferEntry({
            timestamp: now,
            userId: this.context.userId,
            userName: this.context.userName,
            module,
            entity,
            entityId,
            action: AuditAction.CREATE,
            changes,
            oldValue: null,
            newValue: maskSensitiveData(args.data),
            ipAddress: this.context.ipAddress,
            userAgent: this.context.userAgent,
            metadata: this.context.metadata,
          });
        } else if (action === "update") {
          const entityId = this.extractEntityId(result, model);
          const oldData = args.data;
          const newData = result;
          const changes = computeDiff(oldData, newData);

          if (changes.length > 0) {
            this.bufferEntry({
              timestamp: now,
              userId: this.context.userId,
              userName: this.context.userName,
              module,
              entity,
              entityId,
              action: AuditAction.UPDATE,
              changes,
              oldValue: maskSensitiveData(oldData),
              newValue: maskSensitiveData(newData),
              ipAddress: this.context.ipAddress,
              userAgent: this.context.userAgent,
              metadata: this.context.metadata,
            });
          }
        } else if (action === "delete") {
          const entityId = this.extractEntityId(args.where || {}, model);

          this.bufferEntry({
            timestamp: now,
            userId: this.context.userId,
            userName: this.context.userName,
            module,
            entity,
            entityId,
            action: AuditAction.DELETE,
            changes: [],
            oldValue: maskSensitiveData(result),
            newValue: null,
            ipAddress: this.context.ipAddress,
            userAgent: this.context.userAgent,
            metadata: this.context.metadata,
          });
        } else if (action === "createMany") {
          // Log each created item
          const items = Array.isArray(result.count)
            ? result.count
            : [result];
          for (const item of items) {
            const entityId = this.extractEntityId(item, model);
            const changes = computeDiff(null, item);

            this.bufferEntry({
              timestamp: now,
              userId: this.context.userId,
              userName: this.context.userName,
              module,
              entity,
              entityId,
              action: AuditAction.CREATE,
              changes,
              oldValue: null,
              newValue: maskSensitiveData(item),
              ipAddress: this.context.ipAddress,
              userAgent: this.context.userAgent,
              metadata: this.context.metadata,
            });
          }
        }
      } catch (error) {
        console.error("Error in audit middleware:", error);
        // Don't throw - audit logging shouldn't break the main operation
      }

      return result;
    };
  }

  /**
   * Extract entity ID from object
   */
  private extractEntityId(obj: any, model: string): string {
    if (!obj) return "unknown";

    // Try common ID patterns
    if (obj.id) return String(obj.id);
    if (obj.uuid) return String(obj.uuid);
    if (obj[`${model.toLowerCase()}Id`]) {
      return String(obj[`${model.toLowerCase()}Id`]);
    }

    // Fallback
    const firstKey = Object.keys(obj)[0];
    return firstKey ? String(obj[firstKey]) : "unknown";
  }
}

/**
 * Create and apply audit middleware to Prisma client
 */
export function withAudit(
  prisma: PrismaClient,
  auditStore: AuditStore,
  context: AuditContext
): AuditMiddleware {
  const middleware = new AuditMiddleware(auditStore, context);
  (prisma as any).$use(middleware.createMiddleware());
  return middleware;
}
