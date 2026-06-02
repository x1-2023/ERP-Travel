export interface EventSchema<T = unknown> {
    type: string;
    version: number;
    description: string;
    /** Transform from previous version to this version */
    upMigrate?: (data: any) => T;
    /** Validate data matches this version */
    validate?: (data: any) => {
        valid: boolean;
        errors?: string[];
    };
}
export interface VersionedEnvelope<T = unknown> {
    id: string;
    type: string;
    version: number;
    source: string;
    timestamp: string;
    tenantId: string;
    userId: string;
    correlationId?: string;
    causationId?: string;
    idempotencyKey?: string;
    data: T;
    metadata?: Record<string, any>;
}
declare class EventSchemaRegistry {
    private schemas;
    /**
     * Register an event schema version
     */
    register<T>(schema: EventSchema<T>): void;
    /**
     * Get latest version number for an event type
     */
    getLatestVersion(type: string): number;
    /**
     * Get schema for specific version
     */
    getSchema(type: string, version: number): EventSchema | undefined;
    /**
     * Migrate event data from one version to the latest
     */
    migrate<T>(type: string, data: any, fromVersion: number): {
        data: T;
        version: number;
    };
    /**
     * Validate event data against its schema
     */
    validate(type: string, version: number, data: any): {
        valid: boolean;
        errors?: string[];
    };
    /**
     * List all registered event types and their versions
     */
    catalog(): Array<{
        type: string;
        versions: number[];
        latestVersion: number;
        description: string;
    }>;
}
export declare function getSchemaRegistry(): EventSchemaRegistry;
export interface IdempotencyRecord {
    key: string;
    eventId: string;
    processedAt: string;
    result: 'success' | 'error';
    expiresAt: number;
}
export declare class IdempotencyStore {
    private records;
    private maxSize;
    private defaultTTLMs;
    private cleanupInterval;
    constructor(options?: {
        maxSize?: number;
        defaultTTLMs?: number;
    });
    /**
     * Generate idempotency key from event properties
     */
    static generateKey(params: {
        type: string;
        tenantId: string;
        entityId?: string;
        userId?: string;
        timestamp?: string;
    }): string;
    /**
     * Check if an event has already been processed
     */
    isDuplicate(key: string): boolean;
    /**
     * Get the idempotency record for a key
     */
    get(key: string): IdempotencyRecord | undefined;
    /**
     * Record that an event has been processed
     */
    record(key: string, eventId: string, result: 'success' | 'error', ttlMs?: number): void;
    /**
     * Remove expired records
     */
    cleanup(): number;
    /**
     * Get store size
     */
    get size(): number;
    /**
     * Destroy store and stop cleanup timer
     */
    destroy(): void;
}
export declare function getIdempotencyStore(): IdempotencyStore;
/**
 * Generate a correlation ID for tracing event chains
 * All events in a business transaction share the same correlationId
 */
export declare function generateCorrelationId(): string;
/**
 * Generate a causation ID (the event that caused this event)
 */
export declare function generateCausationId(parentEventId: string): string;
/**
 * Create a versioned event envelope with correlation + idempotency
 */
export declare function createVersionedEnvelope<T>(params: {
    type: string;
    data: T;
    tenantId: string;
    userId: string;
    source?: string;
    correlationId?: string;
    causationId?: string;
    idempotencyKey?: string;
    metadata?: Record<string, any>;
}): VersionedEnvelope<T>;
/**
 * Process incoming event with version migration + idempotency check
 */
export declare function processIncomingEvent<T>(envelope: VersionedEnvelope<T>, options?: {
    checkIdempotency?: boolean;
}): {
    data: T;
    version: number;
    isDuplicate: boolean;
};
export {};
//# sourceMappingURL=versioning.d.ts.map