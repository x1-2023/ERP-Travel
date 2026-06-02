// src/lib/cache/invalidation.ts

/**
 * LAC VIET HR - Cache Invalidation
 * Event-driven cache invalidation with pub/sub support
 */

import { getCacheManager, CacheManager } from './cache-manager';
import { InvalidationPatterns, CacheKeys, CacheTags } from './cache-keys';
import { getRedisClient } from './redis-client';

// ════════════════════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════════════════════

export type EntityType =
  | 'employee'
  | 'department'
  | 'user'
  | 'leave'
  | 'attendance'
  | 'payroll'
  | 'recruitment'
  | 'training'
  | 'performance';

export type EventType = 'create' | 'update' | 'delete' | 'bulk';

export interface InvalidationEvent {
  entity: EntityType;
  event: EventType;
  id?: string;
  ids?: string[];
  metadata?: Record<string, unknown>;
  timestamp?: number;
}

export interface InvalidationResult {
  success: boolean;
  keysInvalidated: number;
  patterns: string[];
  duration: number;
}

type InvalidationHandler = (event: InvalidationEvent) => Promise<string[]>;

// ════════════════════════════════════════════════════════════════════════════════
// INVALIDATION STRATEGIES
// ════════════════════════════════════════════════════════════════════════════════

const invalidationStrategies: Record<EntityType, InvalidationHandler> = {
  employee: async (event) => {
    const patterns: string[] = [];

    if (event.id) {
      patterns.push(...InvalidationPatterns.employee(event.id));
    }

    if (event.ids) {
      event.ids.forEach(id => {
        patterns.push(...InvalidationPatterns.employee(id));
      });
    }

    // Always invalidate list caches on any employee change
    patterns.push('employee:list:*');
    patterns.push('employee:search:*');
    patterns.push('employee:count');
    patterns.push('employee:stats');

    // Invalidate related department employee caches
    if (event.metadata?.departmentId) {
      patterns.push(`employee:dept:${event.metadata.departmentId}`);
    }

    // Invalidate dashboard caches
    patterns.push('dashboard:*');

    return [...new Set(patterns)];
  },

  department: async (event) => {
    const patterns: string[] = [];

    if (event.id) {
      patterns.push(...InvalidationPatterns.department(event.id));
    }

    // Department changes affect many things
    patterns.push('department:list');
    patterns.push('department:tree');
    patterns.push('employee:dept:*');
    patterns.push('dashboard:*');

    return [...new Set(patterns)];
  },

  user: async (event) => {
    const patterns: string[] = [];

    if (event.id) {
      patterns.push(...InvalidationPatterns.userAuth(event.id));
    }

    if (event.ids) {
      event.ids.forEach(id => {
        patterns.push(...InvalidationPatterns.userAuth(id));
      });
    }

    return [...new Set(patterns)];
  },

  leave: async (event) => {
    const patterns: string[] = [];

    if (event.id) {
      patterns.push(`leave:${event.id}*`);
    }

    if (event.metadata?.employeeId) {
      patterns.push(...InvalidationPatterns.leave(event.metadata.employeeId as string));
    }

    // Leave changes affect calendar views
    patterns.push('leave:calendar:*');
    patterns.push('leave:pending:*');
    patterns.push('dashboard:*');

    return [...new Set(patterns)];
  },

  attendance: async (event) => {
    const patterns: string[] = [];

    if (event.metadata?.employeeId) {
      const empId = event.metadata.employeeId as string;
      patterns.push(`attendance:${empId}:*`);
      patterns.push(`attendance:summary:${empId}:*`);
    }

    patterns.push('dashboard:*');

    return [...new Set(patterns)];
  },

  payroll: async (event) => {
    const patterns: string[] = [];

    if (event.metadata?.employeeId) {
      const empId = event.metadata.employeeId as string;
      patterns.push(`payroll:slip:${empId}:*`);
      patterns.push(`payroll:calc:${empId}:*`);
    }

    if (event.metadata?.period) {
      patterns.push(`payroll:summary:${event.metadata.period}`);
    }

    return [...new Set(patterns)];
  },

  recruitment: async (event) => {
    const patterns: string[] = [];

    if (event.id) {
      patterns.push(`recruitment:${event.id}*`);
    }

    patterns.push('recruitment:list:*');
    patterns.push('recruitment:stats:*');
    patterns.push('dashboard:*');

    return [...new Set(patterns)];
  },

  training: async (event) => {
    const patterns: string[] = [];

    if (event.id) {
      patterns.push(`training:${event.id}*`);
    }

    patterns.push('training:list:*');
    patterns.push('training:stats:*');

    return [...new Set(patterns)];
  },

  performance: async (event) => {
    const patterns: string[] = [];

    if (event.id) {
      patterns.push(`performance:${event.id}*`);
    }

    if (event.metadata?.employeeId) {
      patterns.push(`performance:emp:${event.metadata.employeeId}:*`);
    }

    patterns.push('performance:stats:*');
    patterns.push('dashboard:*');

    return [...new Set(patterns)];
  },
};

// ════════════════════════════════════════════════════════════════════════════════
// CACHE INVALIDATOR CLASS
// ════════════════════════════════════════════════════════════════════════════════

export class CacheInvalidator {
  private cache: CacheManager;
  private pubSubEnabled: boolean = false;
  private subscriberClient: any = null;

  constructor(cache?: CacheManager) {
    this.cache = cache || getCacheManager();
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // MAIN INVALIDATION METHOD
  // ─────────────────────────────────────────────────────────────────────────────

  async invalidate(event: InvalidationEvent): Promise<InvalidationResult> {
    const startTime = Date.now();

    try {
      // Get patterns to invalidate
      const strategy = invalidationStrategies[event.entity];
      if (!strategy) {
        console.warn(`[CacheInvalidator] No strategy for entity: ${event.entity}`);
        return {
          success: false,
          keysInvalidated: 0,
          patterns: [],
          duration: Date.now() - startTime,
        };
      }

      const patterns = await strategy(event);
      let keysInvalidated = 0;

      // Delete by patterns
      for (const pattern of patterns) {
        const count = await this.cache.deletePattern(pattern);
        keysInvalidated += count;
      }

      // Publish invalidation event for distributed cache
      if (this.pubSubEnabled) {
        await this.publishInvalidationEvent(event, patterns);
      }

      return {
        success: true,
        keysInvalidated,
        patterns,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      console.error('[CacheInvalidator] Error:', error);
      return {
        success: false,
        keysInvalidated: 0,
        patterns: [],
        duration: Date.now() - startTime,
      };
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // CONVENIENCE METHODS
  // ─────────────────────────────────────────────────────────────────────────────

  async onEmployeeCreated(id: string, metadata?: Record<string, unknown>): Promise<InvalidationResult> {
    return this.invalidate({ entity: 'employee', event: 'create', id, metadata });
  }

  async onEmployeeUpdated(id: string, metadata?: Record<string, unknown>): Promise<InvalidationResult> {
    return this.invalidate({ entity: 'employee', event: 'update', id, metadata });
  }

  async onEmployeeDeleted(id: string, metadata?: Record<string, unknown>): Promise<InvalidationResult> {
    return this.invalidate({ entity: 'employee', event: 'delete', id, metadata });
  }

  async onDepartmentChanged(id: string, event: EventType = 'update'): Promise<InvalidationResult> {
    return this.invalidate({ entity: 'department', event, id });
  }

  async onUserAuthChanged(userId: string): Promise<InvalidationResult> {
    return this.invalidate({ entity: 'user', event: 'update', id: userId });
  }

  async onLeaveRequestChanged(
    id: string,
    employeeId: string,
    event: EventType = 'update'
  ): Promise<InvalidationResult> {
    return this.invalidate({
      entity: 'leave',
      event,
      id,
      metadata: { employeeId }
    });
  }

  async onAttendanceRecorded(employeeId: string): Promise<InvalidationResult> {
    return this.invalidate({
      entity: 'attendance',
      event: 'create',
      metadata: { employeeId }
    });
  }

  async onPayrollProcessed(employeeId: string, period: string): Promise<InvalidationResult> {
    return this.invalidate({
      entity: 'payroll',
      event: 'update',
      metadata: { employeeId, period }
    });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // BULK INVALIDATION
  // ─────────────────────────────────────────────────────────────────────────────

  async invalidateByTags(tags: string[]): Promise<number> {
    return this.cache.deleteByTags(tags);
  }

  async invalidateEntity(entity: EntityType): Promise<InvalidationResult> {
    return this.invalidate({ entity, event: 'bulk' });
  }

  async invalidateAll(): Promise<void> {
    await this.cache.clear();
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // PUB/SUB FOR DISTRIBUTED INVALIDATION
  // ─────────────────────────────────────────────────────────────────────────────

  async enablePubSub(): Promise<void> {
    const redis = getRedisClient();
    this.subscriberClient = redis.getClient().duplicate();

    await this.subscriberClient.subscribe('cache:invalidation');

    this.subscriberClient.on('message', async (channel: string, message: string) => {
      if (channel === 'cache:invalidation') {
        try {
          const event = JSON.parse(message) as InvalidationEvent;
          // Only process if from different instance
          if (event.metadata?.instanceId !== process.env.INSTANCE_ID) {
            await this.handleRemoteInvalidation(event);
          }
        } catch (error) {
          console.error('[CacheInvalidator] Error processing pub/sub message:', error);
        }
      }
    });

    this.pubSubEnabled = true;
  }

  private async publishInvalidationEvent(
    event: InvalidationEvent,
    patterns: string[]
  ): Promise<void> {
    const redis = getRedisClient();
    const message = JSON.stringify({
      ...event,
      patterns,
      metadata: {
        ...event.metadata,
        instanceId: process.env.INSTANCE_ID,
        timestamp: Date.now(),
      },
    });

    await redis.getClient().publish('cache:invalidation', message);
  }

  private async handleRemoteInvalidation(event: InvalidationEvent): Promise<void> {
    // Re-run local invalidation
    await this.invalidate(event);
  }

  async disablePubSub(): Promise<void> {
    if (this.subscriberClient) {
      await this.subscriberClient.unsubscribe('cache:invalidation');
      await this.subscriberClient.quit();
      this.subscriberClient = null;
    }
    this.pubSubEnabled = false;
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// SINGLETON & DECORATORS
// ════════════════════════════════════════════════════════════════════════════════

let invalidatorInstance: CacheInvalidator | null = null;

export function getCacheInvalidator(): CacheInvalidator {
  if (!invalidatorInstance) {
    invalidatorInstance = new CacheInvalidator();
  }
  return invalidatorInstance;
}

/**
 * Decorator for automatic cache invalidation
 */
export function InvalidateCache(entity: EntityType, event: EventType = 'update') {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const result = await originalMethod.apply(this, args);

      // Extract ID from result or first argument
      const id = result?.id || args[0]?.id || args[0];

      if (id) {
        const invalidator = getCacheInvalidator();
        await invalidator.invalidate({ entity, event, id });
      }

      return result;
    };

    return descriptor;
  };
}

export default CacheInvalidator;
