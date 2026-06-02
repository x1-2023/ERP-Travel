import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getRecommendations } from '@/services/marketplace/marketplace.service'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.tenantId || !session.user.employeeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const recommendations = await getRecommendations(session.user.tenantId, session.user.employeeId)
    return NextResponse.json({ success: true, data: recommendations })
  } catch (error) {
    console.error('Error getting recommendations:', error)
    return NextResponse.json({ error: 'Failed to get recommendations' }, { status: 500 })
  }
}
