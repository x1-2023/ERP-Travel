import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, AuthError } from '@/lib/auth/get-current-user'
import { requireRole, isErrorResponse } from '@/lib/auth/rbac'
import { handleApiError } from '@/lib/api/errors'
import { sanitizeObject } from '@/lib/api/sanitize'
import { createExchangeRateSchema } from '@/lib/validations/exchange-rate'
import { validateRequest } from '@/lib/validations'

// GET /api/exchange-rates — List all exchange rates
export async function GET() {
  try {
    await getCurrentUser()

    const rates = await prisma.exchangeRate.findMany({
      orderBy: [{ isBase: 'desc' }, { currency: 'asc' }],
    })

    return NextResponse.json({ data: rates })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    return handleApiError(error, '/api/exchange-rates')
  }
}

// POST /api/exchange-rates — Create new exchange rate (ADMIN only)
export async function POST(req: NextRequest) {
  try {
    const result = await requireRole(['ADMIN'])
    if (isErrorResponse(result)) return result
    const user = result

    const body = await req.json()
    const validated = validateRequest(createExchangeRateSchema, body)
    const data = sanitizeObject(validated)

    // If setting as base, unset other base currencies
    if (data.isBase) {
      await prisma.exchangeRate.updateMany({
        where: { isBase: true },
        data: { isBase: false },
      })
    }

    const rate = await prisma.exchangeRate.create({
      data: {
        currency: data.currency.toUpperCase(),
        symbol: data.symbol,
        name: data.name,
        rateToBase: data.rateToBase,
        isBase: data.isBase,
        isActive: data.isActive,
        updatedById: user.id,
      },
    })

    return NextResponse.json(rate, { status: 201 })
  } catch (error) {
    return handleApiError(error, '/api/exchange-rates')
  }
}
