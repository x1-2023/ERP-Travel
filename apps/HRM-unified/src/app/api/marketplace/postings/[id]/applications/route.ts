import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { submitApplication, listApplications } from '@/services/marketplace/marketplace.service'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const result = await listApplications(session.user.tenantId, { postingId: id })
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('Error listing applications:', error)
    return NextResponse.json({ error: 'Failed to list applications' }, { status: 500 })
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
    const application = await submitApplication(session.user.tenantId, id, session.user.employeeId, body)
    return NextResponse.json({ success: true, data: application }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to submit application'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
