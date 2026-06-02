import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole, isErrorResponse } from '@/lib/auth/rbac'
import { handleApiError } from '@/lib/api/errors'
import { compatibilitySchema } from '@/lib/validations/bundle'

// GET /api/product-compatibility — List rules
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const productId = searchParams.get('productId')

    const where = productId
      ? { OR: [{ productId }, { relatedProductId: productId }] }
      : {}

    const rules = await prisma.productCompatibility.findMany({
      where,
      include: {
        product: { select: { id: true, name: true, sku: true } },
        relatedProduct: { select: { id: true, name: true, sku: true } },
      },
    })

    return NextResponse.json({ data: rules })
  } catch (error) {
    console.error('GET /api/product-compatibility error:', error)
    return NextResponse.json({ error: 'Failed to fetch compatibility rules' }, { status: 500 })
  }
}

// POST /api/product-compatibility — Create rule
export async function POST(req: NextRequest) {
  try {
    const result = await requireRole(['ADMIN'])
    if (isErrorResponse(result)) return result

    const body = await req.json()
    const data = compatibilitySchema.parse(body)

    const rule = await prisma.productCompatibility.create({
      data: {
        productId: data.productId,
        relatedProductId: data.relatedProductId,
        type: data.type,
        notes: data.notes,
      },
      include: {
        product: { select: { id: true, name: true, sku: true } },
        relatedProduct: { select: { id: true, name: true, sku: true } },
      },
    })

    return NextResponse.json(rule, { status: 201 })
  } catch (error) {
    return handleApiError(error, '/api/product-compatibility')
  }
}
