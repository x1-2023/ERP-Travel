import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, AuthError } from '@/lib/auth/get-current-user'
import { requireOwnerOrRole, isErrorResponse, forbiddenResponse, canAccess } from '@/lib/auth/rbac'
import { validateRequest, updateContactSchema } from '@/lib/validations'
import { handleApiError } from '@/lib/api/errors'

// GET /api/contacts/[id] — Get contact with relations
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    const { id } = params

    const contact = await prisma.contact.findUnique({
      where: { id },
      include: {
        company: true,
        tags: { include: { tag: true } },
        deals: {
          include: {
            deal: {
              include: {
                stage: { select: { id: true, name: true, color: true } },
              },
            },
          },
        },
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            user: { select: { id: true, name: true, avatarUrl: true } },
          },
        },
        _count: {
          select: {
            deals: true,
            activities: true,
            quotes: true,
          },
        },
      },
    })

    if (!contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 })
    }

    // MEMBER/VIEWER can only view own contacts
    if (!canAccess(user, 'view_all') && contact.ownerId !== user.id) {
      return forbiddenResponse()
    }

    return NextResponse.json(contact)
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('GET /api/contacts/[id] error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch contact' },
      { status: 500 }
    )
  }
}

// PATCH /api/contacts/[id] — Update contact
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Find the resource first to check ownership
    const existing = await prisma.contact.findUnique({
      where: { id },
      select: { ownerId: true },
    })
    if (!existing) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 })
    }

    const result = await requireOwnerOrRole(existing.ownerId, ['ADMIN', 'MANAGER'])
    if (isErrorResponse(result)) return result

    const body = await req.json()
    const updateData = validateRequest(updateContactSchema, body)

    const contact = await prisma.contact.update({
      where: { id },
      data: updateData as any,
      include: {
        company: { select: { id: true, name: true } },
        tags: { include: { tag: true } },
      },
    })

    return NextResponse.json(contact)
  } catch (error) {
    return handleApiError(error, '/api/contacts/[id]')
  }
}

// DELETE /api/contacts/[id] — Delete contact
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const existing = await prisma.contact.findUnique({
      where: { id },
      select: { ownerId: true },
    })
    if (!existing) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 })
    }

    const result = await requireOwnerOrRole(existing.ownerId, ['ADMIN', 'MANAGER'])
    if (isErrorResponse(result)) return result

    await prisma.contact.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 })
    }
    console.error('DELETE /api/contacts/[id] error:', error)
    return NextResponse.json(
      { error: 'Failed to delete contact' },
      { status: 500 }
    )
  }
}
