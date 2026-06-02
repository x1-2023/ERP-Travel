import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getOrCreateProfile, updateProfile } from '@/services/marketplace/marketplace.service'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.tenantId || !session.user.employeeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const profile = await getOrCreateProfile(session.user.tenantId, session.user.employeeId)
    return NextResponse.json({ success: true, data: profile })
  } catch (error) {
    console.error('Error getting profile:', error)
    return NextResponse.json({ error: 'Failed to get profile' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId || !session.user.employeeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const profile = await updateProfile(session.user.tenantId, session.user.employeeId, body)
    return NextResponse.json({ success: true, data: profile })
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
