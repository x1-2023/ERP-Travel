import { NatsConnection, JetStreamClient, JetStreamManager } from 'nats';
export declare const sc: import("nats").Codec<string>;
/**
 * Get or create NATS connection (singleton)
 */
export declare function getConnection(): Promise<NatsConnection>;
/**
 * Get JetStream client (for publish/subscribe with persistence)
 */
export declare function getJetStream(): Promise<JetStreamClient>;
/**
 * Get JetStream Manager (for stream/consumer management)
 */
export declare function getJetStreamManager(): Promise<JetStreamManager>;
/**
 * Ensure ERP streams exist (call once at app startup)
 */
export declare function ensureStreams(): Promise<void>;
/**
 * Gracefully close connection
 */
export declare function closeConnection(): Promise<void>;
//# sourceMappingURL=connection.d.ts.map