import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { apiKeyService } from '@/services/api-key.service'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const keys = await apiKeyService.getAll(session.user.tenantId)
    return NextResponse.json({ data: keys })
  } catch (error) {
    console.error('Get API keys error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const ctx = { tenantId: session.user.tenantId, userId: session.user.id, userEmail: session.user.email }
    const result = await apiKeyService.create(session.user.tenantId, ctx, {
      name: body.name,
      description: body.description,
      permissions: body.permissions || [],
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined,
    })

    return NextResponse.json({ data: result }, { status: 201 })
  } catch (error) {
    console.error('Create API key error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
