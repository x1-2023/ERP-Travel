import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole, isErrorResponse } from '@/lib/auth/rbac'
import { handleApiError } from '@/lib/api/errors'
import { updateExchangeRateSchema } from '@/lib/validations/exchange-rate'
import { validateRequest } from '@/lib/validations'

// PATCH /api/exchange-rates/[id] — Update exchange rate (ADMIN only)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const result = await requireRole(['ADMIN'])
    if (isErrorResponse(result)) return result
    const user = result

    const { id } = await params
    const body = await req.json()
    const data = validateRequest(updateExchangeRateSchema, body)

    // If setting as base, unset other base currencies
    if (data.isBase) {
      await prisma.exchangeRate.updateMany({
        where: { isBase: true, id: { not: id } },
        data: { isBase: false },
      })
    }

    const rate = await prisma.exchangeRate.update({
      where: { id },
      data: {
        ...data,
        updatedById: user.id,
      },
    })

    return NextResponse.json(rate)
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Exchange rate not found' }, { status: 404 })
    }
    return handleApiError(error, '/api/exchange-rates/[id]')
  }
}

// DELETE /api/exchange-rates/[id] — Delete exchange rate (ADMIN only)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const result = await requireRole(['ADMIN'])
    if (isErrorResponse(result)) return result

    const { id } = await params

    // Don't allow deleting the base currency
    const rate = await prisma.exchangeRate.findUnique({ where: { id } })
    if (!rate) {
      return NextResponse.json({ error: 'Exchange rate not found' }, { status: 404 })
    }
    if (rate.isBase) {
      return NextResponse.json({ error: 'Cannot delete base currency' }, { status: 400 })
    }

    await prisma.exchangeRate.delete({ where: { id } })
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    return handleApiError(error, '/api/exchange-rates/[id]')
  }
}
