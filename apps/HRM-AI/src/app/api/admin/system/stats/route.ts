import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const tenantId = session.user.tenantId

    const [
      employeeCount,
      userCount,
      auditLogCount,
      emailQueuePending,
      importJobsRecent,
      apiKeyCount,
      webhookCount,
    ] = await Promise.all([
      db.employee.count({ where: { tenantId, status: 'ACTIVE' } }),
      db.user.count({ where: { tenantId, isActive: true } }),
      db.auditLog.count({ where: { tenantId, createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } }),
      db.emailQueue.count({ where: { tenantId, status: 'PENDING' } }),
      db.importJob.count({ where: { tenantId, createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } }),
      db.apiKey.count({ where: { tenantId, isActive: true } }),
      db.webhook.count({ where: { tenantId, status: 'ACTIVE' } }),
    ])

    return NextResponse.json({
      data: {
        employees: employeeCount,
        users: userCount,
        auditLogs30d: auditLogCount,
        emailQueuePending,
        importJobs7d: importJobsRecent,
        activeApiKeys: apiKeyCount,
        activeWebhooks: webhookCount,
      },
    })
  } catch (error) {
    console.error('Get system stats error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
