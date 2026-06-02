import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import * as courseService from '@/services/learning/course.service'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const tenantId = session.user.tenantId
    const userId = session.user.id

    const { id } = await params
    const result = await courseService.publishCourse(id, tenantId)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error publishing course:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
