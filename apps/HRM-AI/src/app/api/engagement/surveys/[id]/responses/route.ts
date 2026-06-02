import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getResponses, submitResponse } from '@/services/engagement/engagement.service'

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const responses = await getResponses(session.user.tenantId, id)
    return NextResponse.json({ success: true, data: responses })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to get responses'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId || !session.user.employeeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const response = await submitResponse(session.user.tenantId, id, session.user.employeeId, body)
    return NextResponse.json({ success: true, data: response }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to submit response'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
