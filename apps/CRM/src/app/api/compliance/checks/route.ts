import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, AuthError } from '@/lib/auth/get-current-user'
import { handleApiError } from '@/lib/api/errors'

// GET /api/compliance/checks — List compliance checks for an entity
export async function GET(req: NextRequest) {
  try {
    await getCurrentUser()
    const { searchParams } = req.nextUrl
    const entityType = searchParams.get('entityType')
    const entityId = searchParams.get('entityId')

    if (!entityType || !entityId) {
      return NextResponse.json({ error: 'entityType and entityId are required' }, { status: 400 })
    }

    const checks = await prisma.complianceCheck.findMany({
      where: { entityType, entityId },
      include: {
        checkedBy: { select: { id: true, name: true } },
      },
      orderBy: { checkedAt: 'desc' },
    })

    return NextResponse.json({ data: checks })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    return handleApiError(error, '/api/compliance/checks')
  }
}
