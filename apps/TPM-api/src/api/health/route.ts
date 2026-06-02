/**
 * Health Check API Endpoint
 * Provides system health status for monitoring and load balancers
 */

import type { Request, Response } from 'express';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface HealthCheck {
  name: string;
  status: 'ok' | 'degraded' | 'error';
  message?: string;
  latency?: number;
}

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  timestamp: string;
  uptime: number;
  environment: string;
  checks: {
    database: HealthCheck;
    memory: HealthCheck;
    disk?: HealthCheck;
  };
  metrics?: {
    memoryUsage: {
      heapUsed: number;
      heapTotal: number;
      external: number;
      rss: number;
    };
    cpuUsage?: NodeJS.CpuUsage;
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// HEALTH CHECK FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

async function checkDatabase(): Promise<HealthCheck> {
  const start = Date.now();

  try {
    // Simple database connectivity check
    // In production, replace with actual Prisma query:
    // await prisma.$queryRaw`SELECT 1`;
    await new Promise(resolve => setTimeout(resolve, 10));

    return {
      name: 'database',
      status: 'ok',
      latency: Date.now() - start,
    };
  } catch (error) {
    return {
      name: 'database',
      status: 'error',
      message: error instanceof Error ? error.message : 'Database connection failed',
      latency: Date.now() - start,
    };
  }
}

function checkMemory(): HealthCheck {
  const memUsage = process.memoryUsage();
  const heapUsedPercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;

  if (heapUsedPercent > 90) {
    return {
      name: 'memory',
      status: 'error',
      message: `Heap usage critical: ${heapUsedPercent.toFixed(1)}%`,
    };
  }

  if (heapUsedPercent > 75) {
    return {
      name: 'memory',
      status: 'degraded',
      message: `Heap usage high: ${heapUsedPercent.toFixed(1)}%`,
    };
  }

  return {
    name: 'memory',
    status: 'ok',
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROUTE HANDLERS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * GET /api/health
 * Returns comprehensive health status
 */
export async function GET(req: Request, res: Response) {
  const [databaseCheck, memoryCheck] = await Promise.all([
    checkDatabase(),
    Promise.resolve(checkMemory()),
  ]);

  const memUsage = process.memoryUsage();

  const status: HealthStatus = {
    status: 'healthy',
    version: process.env.npm_package_version || '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    checks: {
      database: databaseCheck,
      memory: memoryCheck,
    },
    metrics: {
      memoryUsage: {
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
        external: Math.round(memUsage.external / 1024 / 1024), // MB
        rss: Math.round(memUsage.rss / 1024 / 1024), // MB
      },
    },
  };

  // Determine overall status
  const checks = Object.values(status.checks);

  if (checks.some(c => c.status === 'error')) {
    status.status = 'unhealthy';
  } else if (checks.some(c => c.status === 'degraded')) {
    status.status = 'degraded';
  }

  // Set appropriate HTTP status code
  const httpStatus = status.status === 'healthy' ? 200 :
                     status.status === 'degraded' ? 200 : 503;

  res.status(httpStatus).json(status);
}

/**
 * GET /api/health/live
 * Simple liveness probe for Kubernetes
 */
export function getLive(req: Request, res: Response) {
  res.status(200).json({ status: 'ok' });
}

/**
 * GET /api/health/ready
 * Readiness probe - checks if service can accept traffic
 */
export async function getReady(req: Request, res: Response) {
  try {
    const dbCheck = await checkDatabase();

    if (dbCheck.status === 'error') {
      res.status(503).json({
        status: 'not ready',
        reason: 'Database unavailable',
      });
      return;
    }

    res.status(200).json({ status: 'ready' });
  } catch (error) {
    res.status(503).json({
      status: 'not ready',
      reason: 'Health check failed',
    });
  }
}

export default { GET, getLive, getReady };
