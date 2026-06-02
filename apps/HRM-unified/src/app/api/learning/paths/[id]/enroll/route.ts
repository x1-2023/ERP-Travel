import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import * as learningPathService from '@/services/learning/learning-path.service'

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
    const result = await learningPathService.enrollInPath(tenantId, userId, id)
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Error enrolling in learning path:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
