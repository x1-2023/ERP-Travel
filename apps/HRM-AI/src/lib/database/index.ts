// src/lib/database/index.ts

/**
 * LAC VIET HR - Database Module
 * Optimized database access with connection pooling
 */

// Connection Pool
export {
  type DatabaseConfig,
  type QueryMetrics,
  default as DatabasePool,
  getDatabasePool,
  getPrismaClient,
  prisma,
} from './connection-pool';
