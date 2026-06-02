import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, AuthError } from '@/lib/auth/get-current-user'
import { handleApiError } from '@/lib/api/errors'

// GET /api/audit — Get audit trail for entity (read-only)
export async function GET(req: NextRequest) {
  try {
    await getCurrentUser()
    const { searchParams } = req.nextUrl
    const entity = searchParams.get('entity')
    const entityId = searchParams.get('entityId')
    const limit = Math.min(100, parseInt(searchParams.get('limit') || '50'))

    if (!entity || !entityId) {
      return NextResponse.json({ error: 'entity and entityId are required' }, { status: 400 })
    }

    const logs = await prisma.auditLog.findMany({
      where: { entity, entityId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    return NextResponse.json({ data: logs })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    return handleApiError(error, '/api/audit')
  }
}
