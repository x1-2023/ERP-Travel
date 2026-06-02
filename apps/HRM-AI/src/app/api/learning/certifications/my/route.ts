import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import * as certificationService from '@/services/learning/certification.service'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const tenantId = session.user.tenantId
    const userId = session.user.id

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || undefined

    const result = await certificationService.getEmployeeCertifications(tenantId, userId, { status })
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching my certifications:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
