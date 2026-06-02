import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getOnboardingById } from '@/services/recruitment/onboarding.service'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const result = await getOnboardingById(id, session.user.tenantId)

    if (!result) {
      return NextResponse.json({ success: false, error: 'Onboarding not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('GET /api/recruitment/onboarding/[id] error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
