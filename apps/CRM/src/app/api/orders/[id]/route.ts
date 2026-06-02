import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, AuthError } from '@/lib/auth/get-current-user'
import { requireOwnerOrRole, isErrorResponse, forbiddenResponse, canAccess } from '@/lib/auth/rbac'
import { validateRequest, updateOrderSchema } from '@/lib/validations'
import { handleApiError } from '@/lib/api/errors'

// GET /api/orders/[id] — Get order with items and relations
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    const { id } = params

    const order = await prisma.salesOrder.findUnique({
      where: { id },
      include: {
        items: { include: { product: true } },
        company: true,
        deal: { select: { id: true, title: true, value: true } },
        quote: { select: { id: true, quoteNumber: true, total: true } },
        createdBy: { select: { id: true, name: true, email: true } },
        statusHistory: {
          orderBy: { createdAt: 'desc' },
          include: { user: { select: { id: true, name: true } } },
        },
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (!canAccess(user, 'view_all') && order.createdById !== user.id) {
      return forbiddenResponse()
    }

    return NextResponse.json(order)
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('GET /api/orders/[id] error:', error)
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 })
  }
}

// PATCH /api/orders/[id] — Update order
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const existing = await prisma.salesOrder.findUnique({ where: { id }, select: { createdById: true } })
    if (!existing) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

    const result = await requireOwnerOrRole(existing.createdById, ['ADMIN', 'MANAGER'])
    if (isErrorResponse(result)) return result

    const body = await req.json()
    const updateData = validateRequest(updateOrderSchema, body)

    const order = await prisma.salesOrder.update({
      where: { id },
      data: updateData,
      include: {
        items: { include: { product: true } },
        company: { select: { id: true, name: true } },
        deal: { select: { id: true, title: true } },
        createdBy: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json(order)
  } catch (error) {
    return handleApiError(error, '/api/orders/[id]')
  }
}

// DELETE /api/orders/[id] — Delete order
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const existing = await prisma.salesOrder.findUnique({ where: { id }, select: { createdById: true } })
    if (!existing) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

    const result = await requireOwnerOrRole(existing.createdById, ['ADMIN', 'MANAGER'])
    if (isErrorResponse(result)) return result

    await prisma.salesOrder.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error?.code === 'P2025') return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    console.error('DELETE /api/orders/[id] error:', error)
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 })
  }
}
