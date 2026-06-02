import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getRecognition } from '@/services/engagement/recognition.service'

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const recognition = await getRecognition(session.user.tenantId, id)
    if (!recognition) {
      return NextResponse.json({ error: 'Recognition not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: recognition })
  } catch (error) {
    console.error('Error getting recognition:', error)
    return NextResponse.json({ error: 'Failed to get recognition' }, { status: 500 })
  }
}
