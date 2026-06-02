import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireOwnerOrRole, isErrorResponse } from '@/lib/auth/rbac'
import { validateRequest, updateActivitySchema } from '@/lib/validations'
import { handleApiError } from '@/lib/api/errors'

// PATCH /api/activities/[id] — Update activity (mark complete, edit)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const existing = await prisma.activity.findUnique({ where: { id }, select: { userId: true } })
    if (!existing) return NextResponse.json({ error: 'Activity not found' }, { status: 404 })

    const result = await requireOwnerOrRole(existing.userId, ['ADMIN', 'MANAGER'])
    if (isErrorResponse(result)) return result

    const body = await req.json()
    const updateData = validateRequest(updateActivitySchema, body)

    // Auto-set completedAt based on isCompleted
    const prismaData: any = { ...updateData }
    if (updateData.isCompleted === true) {
      prismaData.completedAt = new Date()
    }
    if (updateData.isCompleted === false) {
      prismaData.completedAt = null
    }

    const activity = await prisma.activity.update({
      where: { id },
      data: prismaData,
      include: {
        contact: { select: { id: true, firstName: true, lastName: true } },
        company: { select: { id: true, name: true } },
        deal: { select: { id: true, title: true } },
        user: { select: { id: true, name: true, avatarUrl: true } },
      },
    })

    return NextResponse.json(activity)
  } catch (error) {
    return handleApiError(error, '/api/activities/[id]')
  }
}

// DELETE /api/activities/[id] — Delete activity
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const existing = await prisma.activity.findUnique({ where: { id }, select: { userId: true } })
    if (!existing) return NextResponse.json({ error: 'Activity not found' }, { status: 404 })

    const result = await requireOwnerOrRole(existing.userId, ['ADMIN', 'MANAGER'])
    if (isErrorResponse(result)) return result

    await prisma.activity.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error?.code === 'P2025') return NextResponse.json({ error: 'Activity not found' }, { status: 404 })
    console.error('DELETE /api/activities/[id] error:', error)
    return NextResponse.json({ error: 'Failed to delete activity' }, { status: 500 })
  }
}
