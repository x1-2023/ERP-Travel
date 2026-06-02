import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getApplication } from '@/services/marketplace/marketplace.service'

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const application = await getApplication(session.user.tenantId, id)
    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: application })
  } catch (error) {
    console.error('Error getting application:', error)
    return NextResponse.json({ error: 'Failed to get application' }, { status: 500 })
  }
}
