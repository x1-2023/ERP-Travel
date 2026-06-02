import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getMarketplaceDashboard } from '@/services/marketplace/marketplace.service'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const dashboard = await getMarketplaceDashboard(session.user.tenantId)
    return NextResponse.json({ success: true, data: dashboard })
  } catch (error) {
    console.error('Error fetching marketplace dashboard:', error)
    return NextResponse.json({ error: 'Failed to fetch dashboard' }, { status: 500 })
  }
}
