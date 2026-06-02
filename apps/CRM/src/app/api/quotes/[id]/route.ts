import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, AuthError } from '@/lib/auth/get-current-user'
import { requireOwnerOrRole, isErrorResponse, forbiddenResponse, canAccess } from '@/lib/auth/rbac'
import { validateRequest, updateQuoteSchema } from '@/lib/validations'
import { handleApiError } from '@/lib/api/errors'

// GET /api/quotes/[id] — Get quote with items and relations
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    const { id } = params

    const quote = await prisma.quote.findUnique({
      where: { id },
      include: {
        items: {
          orderBy: { sortOrder: 'asc' },
          include: { product: true },
        },
        contact: true,
        company: true,
        deal: { select: { id: true, title: true, value: true } },
        order: { select: { id: true, orderNumber: true, status: true, total: true } },
        createdBy: { select: { id: true, name: true, email: true } },
      },
    })

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
    }

    if (!canAccess(user, 'view_all') && quote.createdById !== user.id) {
      return forbiddenResponse()
    }

    return NextResponse.json(quote)
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('GET /api/quotes/[id] error:', error)
    return NextResponse.json({ error: 'Failed to fetch quote' }, { status: 500 })
  }
}

// PATCH /api/quotes/[id] — Update quote and items
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const existing = await prisma.quote.findUnique({ where: { id }, select: { createdById: true } })
    if (!existing) return NextResponse.json({ error: 'Quote not found' }, { status: 404 })

    const result = await requireOwnerOrRole(existing.createdById, ['ADMIN', 'MANAGER'])
    if (isErrorResponse(result)) return result

    const body = await req.json()
    const validatedData = validateRequest(updateQuoteSchema, body)
    const { items, ...quoteData } = validatedData

    if (items) {
      let subtotal = 0
      const processedItems = items.map((item, index: number) => {
        const itemTotal = item.quantity * item.unitPrice - (item.discount || 0)
        subtotal += itemTotal
        return {
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount || 0,
          total: itemTotal,
          description: item.description,
          productId: item.productId || undefined,
          sortOrder: index,
        }
      })

      const discPct = quoteData.discountPercent || 0
      const discountAmount = subtotal * (discPct / 100)
      const afterDiscount = subtotal - discountAmount
      const taxPct = quoteData.taxPercent !== undefined ? quoteData.taxPercent : 10
      const taxAmount = afterDiscount * (taxPct / 100)
      const total = afterDiscount + taxAmount

      await prisma.quoteItem.deleteMany({ where: { quoteId: id } })

      const quote = await prisma.quote.update({
        where: { id },
        data: {
          ...quoteData,
          subtotal,
          discountPercent: discPct,
          discountAmount,
          taxPercent: taxPct,
          taxAmount,
          total,
          items: { create: processedItems },
        },
        include: {
          items: { orderBy: { sortOrder: 'asc' }, include: { product: true } },
          contact: { select: { id: true, firstName: true, lastName: true } },
          company: { select: { id: true, name: true } },
        },
      })

      return NextResponse.json(quote)
    }

    const quote = await prisma.quote.update({
      where: { id },
      data: quoteData,
      include: {
        items: { orderBy: { sortOrder: 'asc' }, include: { product: true } },
        contact: { select: { id: true, firstName: true, lastName: true } },
        company: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json(quote)
  } catch (error) {
    return handleApiError(error, '/api/quotes/[id]')
  }
}

// DELETE /api/quotes/[id] — Delete quote
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const existing = await prisma.quote.findUnique({ where: { id }, select: { createdById: true } })
    if (!existing) return NextResponse.json({ error: 'Quote not found' }, { status: 404 })

    const result = await requireOwnerOrRole(existing.createdById, ['ADMIN', 'MANAGER'])
    if (isErrorResponse(result)) return result

    await prisma.quote.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error?.code === 'P2025') return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
    console.error('DELETE /api/quotes/[id] error:', error)
    return NextResponse.json({ error: 'Failed to delete quote' }, { status: 500 })
  }
}
