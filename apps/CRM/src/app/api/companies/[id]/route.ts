import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, AuthError } from '@/lib/auth/get-current-user'
import { requireOwnerOrRole, isErrorResponse, forbiddenResponse, canAccess } from '@/lib/auth/rbac'
import { validateRequest, updateCompanySchema } from '@/lib/validations'
import { handleApiError } from '@/lib/api/errors'

// GET /api/companies/[id] — Get company with relations
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    const { id } = params

    const company = await prisma.company.findUnique({
      where: { id },
      include: {
        contacts: {
          orderBy: { updatedAt: 'desc' },
          include: {
            tags: { include: { tag: true } },
          },
        },
        deals: {
          orderBy: { updatedAt: 'desc' },
          include: {
            stage: { select: { id: true, name: true, color: true } },
          },
        },
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: {
            user: { select: { id: true, name: true, avatarUrl: true } },
          },
        },
        tags: { include: { tag: true } },
        parent: { select: { id: true, name: true } },
        children: { select: { id: true, name: true, industry: true, country: true } },
        _count: {
          select: {
            contacts: true,
            deals: true,
            activities: true,
            quotes: true,
            orders: true,
            documents: true,
          },
        },
      },
    })

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    if (!canAccess(user, 'view_all') && company.ownerId !== user.id) {
      return forbiddenResponse()
    }

    return NextResponse.json(company)
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('GET /api/companies/[id] error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch company' },
      { status: 500 }
    )
  }
}

// PATCH /api/companies/[id] — Update company
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const existing = await prisma.company.findUnique({ where: { id }, select: { ownerId: true } })
    if (!existing) return NextResponse.json({ error: 'Company not found' }, { status: 404 })

    const result = await requireOwnerOrRole(existing.ownerId, ['ADMIN', 'MANAGER'])
    if (isErrorResponse(result)) return result

    const body = await req.json()
    const updateData = validateRequest(updateCompanySchema, body)

    const company = await prisma.company.update({
      where: { id },
      data: updateData,
      include: {
        tags: { include: { tag: true } },
        _count: { select: { contacts: true, deals: true } },
      },
    })

    return NextResponse.json(company)
  } catch (error) {
    return handleApiError(error, '/api/companies/[id]')
  }
}

// DELETE /api/companies/[id] — Delete company
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const existing = await prisma.company.findUnique({ where: { id }, select: { ownerId: true } })
    if (!existing) return NextResponse.json({ error: 'Company not found' }, { status: 404 })

    const result = await requireOwnerOrRole(existing.ownerId, ['ADMIN', 'MANAGER'])
    if (isErrorResponse(result)) return result

    await prisma.company.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error?.code === 'P2025') return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    console.error('DELETE /api/companies/[id] error:', error)
    return NextResponse.json({ error: 'Failed to delete company' }, { status: 500 })
  }
}
