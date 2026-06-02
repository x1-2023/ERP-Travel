import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { AuthError } from '@/lib/auth/get-current-user'
import { requireRole, isErrorResponse } from '@/lib/auth/rbac'
import { handleApiError, NotFound } from '@/lib/api/errors'
import { updateBundleSchema } from '@/lib/validations/bundle'

// GET /api/bundles/[id] — Single bundle with items, compatibility, pricing
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const bundle = await prisma.productBundle.findUnique({
      where: { id: params.id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true, name: true, sku: true, unitPrice: true,
                category: true, currency: true, itar: true, eccn: true,
              },
            },
          },
          orderBy: { sortOrder: 'asc' },
        },
        pricingTiers: true,
      },
    })

    if (!bundle) return handleApiError(NotFound('Bundle'), '/api/bundles/[id]')

    // Fetch compatibility warnings for products in this bundle
    const productIds = bundle.items.map((i) => i.productId)
    const compatRules = await prisma.productCompatibility.findMany({
      where: {
        OR: [
          { productId: { in: productIds }, relatedProductId: { in: productIds } },
        ],
      },
      include: {
        product: { select: { id: true, name: true } },
        relatedProduct: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json({ ...bundle, compatibilityWarnings: compatRules })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    return handleApiError(error, '/api/bundles/[id]')
  }
}

// PATCH /api/bundles/[id] — Update bundle
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await requireRole(['ADMIN', 'MANAGER'])
    if (isErrorResponse(result)) return result

    const body = await req.json()
    const data = updateBundleSchema.parse(body)

    const existing = await prisma.productBundle.findUnique({ where: { id: params.id } })
    if (!existing) return handleApiError(NotFound('Bundle'), '/api/bundles/[id]')

    // If items provided, replace all items
    if (data.items) {
      await prisma.productBundleItem.deleteMany({ where: { bundleId: params.id } })
    }

    const bundle = await prisma.productBundle.update({
      where: { id: params.id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.sku !== undefined && { sku: data.sku }),
        ...(data.bundleType !== undefined && { bundleType: data.bundleType }),
        ...(data.basePrice !== undefined && { basePrice: data.basePrice }),
        ...(data.currency !== undefined && { currency: data.currency }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
        ...(data.items && {
          items: {
            create: data.items.map((item, idx) => ({
              productId: item.productId,
              quantity: item.quantity,
              isRequired: item.isRequired,
              sortOrder: item.sortOrder || idx,
            })),
          },
        }),
      },
      include: {
        items: {
          include: { product: { select: { id: true, name: true, sku: true, unitPrice: true, category: true } } },
          orderBy: { sortOrder: 'asc' },
        },
        pricingTiers: true,
      },
    })

    return NextResponse.json(bundle)
  } catch (error) {
    return handleApiError(error, '/api/bundles/[id]')
  }
}

// DELETE /api/bundles/[id] — Soft delete (isActive = false)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await requireRole(['ADMIN'])
    if (isErrorResponse(result)) return result

    const existing = await prisma.productBundle.findUnique({ where: { id: params.id } })
    if (!existing) return handleApiError(NotFound('Bundle'), '/api/bundles/[id]')

    const bundle = await prisma.productBundle.update({
      where: { id: params.id },
      data: { isActive: false },
    })

    return NextResponse.json(bundle)
  } catch (error) {
    return handleApiError(error, '/api/bundles/[id]')
  }
}
