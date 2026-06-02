/**
 * Logging Middleware
 * Structured logging with Pino for production-grade observability
 */

// @ts-ignore -- pino may not be installed yet
import pino from 'pino';
import type { Request, Response, NextFunction } from 'express';

// ═══════════════════════════════════════════════════════════════════════════════
// LOGGER CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

const isProduction = process.env.NODE_ENV === 'production';

export const logger = pino({
  level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),

  // Pretty print in development
  transport: isProduction
    ? undefined
    : {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      },

  // Redact sensitive fields
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'req.body.password',
      'req.body.token',
      'req.body.secret',
      'res.headers["set-cookie"]',
    ],
    censor: '[REDACTED]',
  },

  // Add base fields to all logs
  base: {
    service: 'vierp-tpm-api',
    version: process.env.npm_package_version || '1.0.0',
    env: process.env.NODE_ENV || 'development',
  },

  // Custom serializers
  serializers: {
    req: (req: any) => ({
      method: req.method,
      url: req.url,
      path: req.path,
      query: req.query,
      params: req.params,
      userAgent: req.headers?.['user-agent'],
      contentType: req.headers?.['content-type'],
      requestId: req.headers?.['x-request-id'],
    }),
    res: (res: any) => ({
      statusCode: res.statusCode,
      contentType: res.getHeader?.('content-type'),
    }),
    err: pino.stdSerializers.err,
  },

  // Timestamp format
  timestamp: pino.stdTimeFunctions.isoTime,
});

// ═══════════════════════════════════════════════════════════════════════════════
// REQUEST LOGGING MIDDLEWARE
// ═══════════════════════════════════════════════════════════════════════════════

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  const requestId = req.headers['x-request-id'] as string;

  // Log request start
  logger.debug({
    type: 'request',
    requestId,
    method: req.method,
    path: req.path,
    query: req.query,
    userAgent: req.headers['user-agent'],
  }, `→ ${req.method} ${req.path}`);

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - start;
    const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';

    logger[level]({
      type: 'response',
      requestId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
      userId: (req as any).user?.id,
      contentLength: res.getHeader('content-length'),
    }, `← ${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
  });

  next();
}

// ═══════════════════════════════════════════════════════════════════════════════
// ERROR LOGGING MIDDLEWARE
// ═══════════════════════════════════════════════════════════════════════════════

export function errorLogger(err: Error, req: Request, res: Response, next: NextFunction) {
  const requestId = req.headers['x-request-id'] as string;

  logger.error({
    type: 'error',
    requestId,
    method: req.method,
    path: req.path,
    error: {
      message: err.message,
      stack: err.stack,
      name: err.name,
    },
    userId: (req as any).user?.id,
  }, `Error: ${err.message}`);

  next(err);
}

// ═══════════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Log an audit event
 */
export function logAudit(event: {
  action: string;
  userId: string;
  entityType: string;
  entityId?: string;
  metadata?: Record<string, any>;
}) {
  logger.info({
    type: 'audit',
    ...event,
  }, `Audit: ${event.action} on ${event.entityType}`);
}

/**
 * Log a security event
 */
export function logSecurity(event: {
  type: 'auth_failure' | 'rate_limit' | 'suspicious_activity' | 'permission_denied';
  ip: string;
  userId?: string;
  details?: Record<string, any>;
}) {
  const { type: eventType, ...rest } = event;
  logger.warn({
    type: 'security',
    securityType: eventType,
    ...rest,
  }, `Security: ${eventType}`);
}

/**
 * Log a performance metric
 */
export function logPerformance(metric: {
  operation: string;
  duration: number;
  metadata?: Record<string, any>;
}) {
  logger.info({
    type: 'performance',
    ...metric,
  }, `Performance: ${metric.operation} took ${metric.duration}ms`);
}

export default logger;
