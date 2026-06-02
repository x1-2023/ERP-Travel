import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getMyResponse } from '@/services/engagement/engagement.service'

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId || !session.user.employeeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const response = await getMyResponse(id, session.user.employeeId)
    return NextResponse.json({ success: true, data: response })
  } catch (error) {
    console.error('Error getting my response:', error)
    return NextResponse.json({ error: 'Failed to get response' }, { status: 500 })
  }
}
