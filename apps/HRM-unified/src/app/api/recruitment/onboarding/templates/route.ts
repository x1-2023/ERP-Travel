import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getOnboardingTemplates, createOnboardingTemplate } from '@/services/recruitment/onboarding.service'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tenantId = session.user.tenantId

    const result = await getOnboardingTemplates(tenantId)
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('GET /api/recruitment/onboarding/templates error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const ctx = { tenantId: session.user.tenantId, userId: session.user.id, userEmail: session.user.email || '' }

    const result = await createOnboardingTemplate(ctx.tenantId, body)
    return NextResponse.json({ success: true, data: result }, { status: 201 })
  } catch (error) {
    console.error('POST /api/recruitment/onboarding/templates error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
