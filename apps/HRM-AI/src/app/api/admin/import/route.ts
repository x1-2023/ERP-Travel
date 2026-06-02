import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { importService } from '@/services/import.service'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user || !['ADMIN', 'HR_MANAGER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const jobs = await importService.getJobs(session.user.tenantId)
    return NextResponse.json({ data: jobs })
  } catch (error) {
    console.error('Get import jobs error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
