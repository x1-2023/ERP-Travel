import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { toggleBookmark } from '@/services/marketplace/marketplace.service'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId || !session.user.employeeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { postingId } = await request.json()
    const result = await toggleBookmark(session.user.tenantId, session.user.employeeId, postingId)
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('Error toggling bookmark:', error)
    return NextResponse.json({ error: 'Failed to toggle bookmark' }, { status: 500 })
  }
}
