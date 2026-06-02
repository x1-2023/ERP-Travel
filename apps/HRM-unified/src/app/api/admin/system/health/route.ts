import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const dbHealth = await checkDatabase()

    return NextResponse.json({
      data: {
        status: dbHealth ? 'healthy' : 'degraded',
        timestamp: new Date().toISOString(),
        services: {
          database: { status: dbHealth ? 'up' : 'down' },
          api: { status: 'up' },
        },
        uptime: process.uptime(),
        memory: process.memoryUsage(),
      },
    })
  } catch (error) {
    console.error('Health check error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function checkDatabase(): Promise<boolean> {
  try {
    await db.$queryRaw`SELECT 1`
    return true
  } catch {
    return false
  }
}
