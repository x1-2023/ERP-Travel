import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { importService } from '@/services/import.service'

export async function GET(_request: Request, { params }: { params: { jobId: string } }) {
  try {
    const session = await auth()
    if (!session?.user || !['ADMIN', 'HR_MANAGER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const job = await importService.getJob(session.user.tenantId, params.jobId)
    if (!job) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json({ data: job })
  } catch (error) {
    console.error('Get import job error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
