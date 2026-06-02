// src/app/api/health/route.ts
// Health check endpoint for Docker and load balancers

import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export const dynamic = 'force-dynamic'

interface HealthStatus {
  status: 'healthy' | 'unhealthy'
  module: string
  timestamp: string
  uptime: number
  version: string
  checks: {
    database: {
      status: 'up' | 'down'
      latency?: number
    }
    memory: {
      used: number
      total: number
      percentage: number
    }
  }
}

export async function GET(): Promise<NextResponse<HealthStatus>> {
  const startTime = Date.now()

  // Check database connection
  let dbStatus: 'up' | 'down' = 'down'
  let dbLatency: number | undefined

  try {
    const dbStart = Date.now()
    await prisma.$queryRaw`SELECT 1`
    dbLatency = Date.now() - dbStart
    dbStatus = 'up'
  } catch {
    dbStatus = 'down'
  }

  // Check memory usage
  const memoryUsage = process.memoryUsage()
  const totalMemory = memoryUsage.heapTotal
  const usedMemory = memoryUsage.heapUsed

  const healthStatus: HealthStatus = {
    status: dbStatus === 'up' ? 'healthy' : 'unhealthy',
    module: 'prismy-hrm',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    checks: {
      database: {
        status: dbStatus,
        latency: dbLatency,
      },
      memory: {
        used: Math.round(usedMemory / 1024 / 1024),
        total: Math.round(totalMemory / 1024 / 1024),
        percentage: Math.round((usedMemory / totalMemory) * 100),
      },
    },
  }

  return NextResponse.json(healthStatus, {
    status: healthStatus.status === 'healthy' ? 200 : 503,
    headers: {
      'Cache-Control': 'no-store',
    },
  })
}
