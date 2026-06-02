import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { apiKeyService } from '@/services/api-key.service'

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const ctx = { tenantId: session.user.tenantId, userId: session.user.id, userEmail: session.user.email }
    const success = await apiKeyService.revoke(params.id, session.user.tenantId, ctx)

    if (!success) {
      return NextResponse.json({ error: 'API key not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Revoke API key error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
