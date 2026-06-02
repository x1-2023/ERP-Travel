import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createRecognition, listRecognitions } from '@/services/engagement/recognition.service'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const result = await listRecognitions(session.user.tenantId, {
      receiverId: searchParams.get('receiverId') || undefined,
      giverId: searchParams.get('giverId') || undefined,
      isPublic: searchParams.get('isPublic') === 'true' ? true : undefined,
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
    })

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('Error listing recognitions:', error)
    return NextResponse.json({ error: 'Failed to list recognitions' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId || !session.user.employeeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const recognition = await createRecognition(session.user.tenantId, session.user.employeeId, body)
    return NextResponse.json({ success: true, data: recognition }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create recognition'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
