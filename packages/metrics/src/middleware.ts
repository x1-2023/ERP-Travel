import { NextApiRequest, NextApiResponse } from 'next';
import { httpRequestDuration, httpRequestTotal } from './index';

// Type for Next.js API route handler
export type NextApiHandler = (req: NextApiRequest, res: NextApiResponse) => Promise<void> | void;

/**
 * Higher-order function that wraps a Next.js API route handler with metrics collection.
 * Measures request duration and increments request counter with method, route, status_code, and app labels.
 * @param handler The Next.js API route handler to wrap
 * @param app The application name for labeling metrics
 * @returns Wrapped handler function
 */
export function withMetrics(
  handler: NextApiHandler,
  app: string = 'default'
): NextApiHandler {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const startTime = Date.now();
    const route = req.url || 'unknown';
    const method = req.method || 'GET';

    // Wrap the response.end to capture status code
    const originalEnd = res.end;
    res.end = function (
      chunk?: string | Buffer | (() => void),
      encoding?: BufferEncoding | (() => void) | undefined,
      callback?: (() => void) | undefined
    ) {
      const statusCode = res.statusCode.toString();
      const duration = (Date.now() - startTime) / 1000; // Convert to seconds

      // Record metrics
      httpRequestDuration.labels(method, route, statusCode, app).observe(duration);
      httpRequestTotal.labels(method, route, statusCode, app).inc();

      // Call original end
      return originalEnd.call(res, chunk as any, encoding as any, callback);
    };

    try {
      await handler(req, res);
    } catch (error) {
      const statusCode = res.statusCode.toString();
      const duration = (Date.now() - startTime) / 1000;
      httpRequestDuration.labels(method, route, statusCode, app).observe(duration);
      httpRequestTotal.labels(method, route, statusCode, app).inc();
      throw error;
    }
  };
}

/**
 * Wraps a Prisma client with query timing metrics.
 * @param prismaClient The Prisma client instance to wrap
 * @param app The application name for labeling metrics
 * @returns Wrapped Prisma client
 */
export function withPrismaMetrics(
  prismaClient: any,
  app: string = 'default'
): any {
  if (!prismaClient.$use) {
    console.warn(
      'Prisma client does not support middleware ($use). Ensure you are using Prisma with middleware support.'
    );
    return prismaClient;
  }

  prismaClient.$use(async (params: any, next: any) => {
    const startTime = Date.now();
    const operation = params.action || 'unknown';
    const model = params.model || 'unknown';

    try {
      const result = await next(params);
      const duration = (Date.now() - startTime) / 1000;
      dbQueryDuration.labels(operation, model, app).observe(duration);
      return result;
    } catch (error) {
      const duration = (Date.now() - startTime) / 1000;
      dbQueryDuration.labels(operation, model, app).observe(duration);
      throw error;
    }
  });

  return prismaClient;
}

// Import for use in middleware
import { dbQueryDuration } from './index';
