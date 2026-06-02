import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createPosting, listPostings } from '@/services/marketplace/marketplace.service'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const result = await listPostings(session.user.tenantId, {
      status: searchParams.get('status') as never,
      departmentId: searchParams.get('departmentId') || undefined,
      jobType: searchParams.get('jobType') as never,
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
    })

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('Error listing postings:', error)
    return NextResponse.json({ error: 'Failed to list postings' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId || !session.user.employeeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const posting = await createPosting(session.user.tenantId, session.user.employeeId, body)
    return NextResponse.json({ success: true, data: posting }, { status: 201 })
  } catch (error) {
    console.error('Error creating posting:', error)
    return NextResponse.json({ error: 'Failed to create posting' }, { status: 500 })
  }
}
