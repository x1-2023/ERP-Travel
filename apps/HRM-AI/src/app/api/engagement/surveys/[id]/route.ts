import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getSurvey, updateSurvey, deleteSurvey } from '@/services/engagement/engagement.service'

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const survey = await getSurvey(session.user.tenantId, id)
    if (!survey) {
      return NextResponse.json({ error: 'Survey not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: survey })
  } catch (error) {
    console.error('Error getting survey:', error)
    return NextResponse.json({ error: 'Failed to get survey' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const survey = await updateSurvey(session.user.tenantId, id, body)
    return NextResponse.json({ success: true, data: survey })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update survey'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    await deleteSurvey(session.user.tenantId, id)
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete survey'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
