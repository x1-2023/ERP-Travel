import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createSurvey, listSurveys } from '@/services/engagement/engagement.service'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const result = await listSurveys(session.user.tenantId, {
      status: searchParams.get('status') as never,
      type: searchParams.get('type') as never,
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
    })

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('Error listing surveys:', error)
    return NextResponse.json({ error: 'Failed to list surveys' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const survey = await createSurvey(session.user.tenantId, session.user.id, body)
    return NextResponse.json({ success: true, data: survey }, { status: 201 })
  } catch (error) {
    console.error('Error creating survey:', error)
    return NextResponse.json({ error: 'Failed to create survey' }, { status: 500 })
  }
}
