import { NextResponse } from 'next/server'
import { getPortalSession } from '@/lib/portal-auth'

export async function GET() {
  const session = await getPortalSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return NextResponse.json(session.portalUser)
}
