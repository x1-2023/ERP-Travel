import { AllEventSchemas, type AllEventTypes } from './schemas';
import type { BaseEvent, EventBusConfig, SubscriptionOptions, TypedEventHandler } from './types';
import type { z } from 'zod';
/**
 * Type-safe Event Bus for publishing and subscribing to events
 * Event Bus có kiểm tra kiểu và validation
 */
export declare class EventBus {
    private config;
    private subscriptions;
    constructor(config: EventBusConfig);
    /**
     * Publish a typed event with schema validation
     * Publish một event có kiểm tra schema
     */
    publish<T extends AllEventTypes>(eventType: T, payload: z.infer<typeof AllEventSchemas[T]>, context: {
        tenantId: string;
        userId: string;
        correlationId?: string;
        causationId?: string;
        metadata?: Record<string, unknown>;
    }): Promise<BaseEvent>;
    /**
     * Subscribe to a typed event with handler
     * Subscribe vào một event type có xử lý
     */
    subscribe<T extends AllEventTypes>(eventType: T, handler: TypedEventHandler<typeof AllEventSchemas[T]>, options?: SubscriptionOptions): Promise<void>;
    /**
     * Publish multiple events atomically
     * Publish nhiều events cùng lúc
     */
    publishBatch<T extends AllEventTypes>(events: Array<{
        eventType: T;
        payload: z.infer<typeof AllEventSchemas[T]>;
    }>, context: {
        tenantId: string;
        userId: string;
        correlationId?: string;
        metadata?: Record<string, unknown>;
    }): Promise<BaseEvent[]>;
    /**
     * Get subscription stats
     */
    getSubscriptionStats(): Record<string, boolean>;
    /**
     * Cleanup resources
     */
    close(): Promise<void>;
}
/**
 * Factory function to create EventBus instance
 * Tạo EventBus instance
 */
export declare function createEventBus(config: EventBusConfig): EventBus;
//# sourceMappingURL=event-bus.d.ts.map