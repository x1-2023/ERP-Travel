import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { listCategories } from '@/services/engagement/recognition.service'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const categories = await listCategories(session.user.tenantId)
    return NextResponse.json({ success: true, data: categories })
  } catch (error) {
    console.error('Error listing categories:', error)
    return NextResponse.json({ error: 'Failed to list categories' }, { status: 500 })
  }
}
