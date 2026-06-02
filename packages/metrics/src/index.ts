import {
  Registry,
  collectDefaultMetrics,
  Histogram,
  Counter,
} from 'prom-client';

// Create Prometheus Registry
export const metricsRegistry = new Registry();

// Collect default Node.js metrics
collectDefaultMetrics({ register: metricsRegistry });

// HTTP Request Duration Histogram
export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code', 'app'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
  registers: [metricsRegistry],
});

// HTTP Request Total Counter
export const httpRequestTotal = new Counter({
  name: 'http_request_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code', 'app'],
  registers: [metricsRegistry],
});

// Database Query Duration Histogram
export const dbQueryDuration = new Histogram({
  name: 'db_query_duration_seconds',
  help: 'Duration of database queries in seconds',
  labelNames: ['operation', 'model', 'app'],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1],
  registers: [metricsRegistry],
});

// NATS Event Total Counter
export const natsEventTotal = new Counter({
  name: 'nats_event_total',
  help: 'Total number of NATS events processed',
  labelNames: ['subject', 'type', 'app'],
  registers: [metricsRegistry],
});

// Cache Hit Total Counter
export const cacheHitTotal = new Counter({
  name: 'cache_hit_total',
  help: 'Total number of cache hits',
  labelNames: ['operation', 'app'],
  registers: [metricsRegistry],
});

// Metrics Handler for API routes
export async function metricsHandler(): Promise<string> {
  return metricsRegistry.metrics();
}

// Export registry and collectDefaultMetrics for advanced usage
export { Registry, collectDefaultMetrics };
