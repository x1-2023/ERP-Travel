import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, AuthError } from '@/lib/auth/get-current-user'
import { handleApiError } from '@/lib/api/errors'

// GET /api/deals/[id]/checklist — Get deal compliance checklist
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await getCurrentUser()
    const { id } = await params

    const items = await prisma.dealChecklist.findMany({
      where: { dealId: id },
      orderBy: { key: 'asc' },
    })

    return NextResponse.json({ data: items })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    return handleApiError(error, '/api/deals/[id]/checklist')
  }
}

// PATCH /api/deals/[id]/checklist — Update checklist item
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    const { id: dealId } = await params
    const body = await req.json()
    const { key, checked, notes } = body

    if (!key) {
      return NextResponse.json({ error: 'key is required' }, { status: 400 })
    }

    const item = await prisma.dealChecklist.update({
      where: { dealId_key: { dealId, key } },
      data: {
        checked,
        checkedAt: checked ? new Date() : null,
        checkedBy: checked ? user.id : null,
        notes: notes ?? undefined,
      },
    })

    return NextResponse.json(item)
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Checklist item not found' }, { status: 404 })
    }
    return handleApiError(error, '/api/deals/[id]/checklist')
  }
}
