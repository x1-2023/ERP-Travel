import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole, isErrorResponse } from '@/lib/auth/rbac'
import { handleApiError } from '@/lib/api/errors'
import { pricingTierSchema } from '@/lib/validations/bundle'

// GET /api/pricing-tiers — List tiers
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const productId = searchParams.get('productId')
    const bundleId = searchParams.get('bundleId')
    const tier = searchParams.get('tier')

    const where: Record<string, unknown> = {}
    if (productId) where.productId = productId
    if (bundleId) where.bundleId = bundleId
    if (tier) where.tier = tier

    const tiers = await prisma.pricingTier.findMany({
      where,
      include: {
        product: { select: { id: true, name: true, sku: true } },
        bundle: { select: { id: true, name: true, sku: true } },
      },
    })

    return NextResponse.json({ data: tiers })
  } catch (error) {
    console.error('GET /api/pricing-tiers error:', error)
    return NextResponse.json({ error: 'Failed to fetch pricing tiers' }, { status: 500 })
  }
}

// POST /api/pricing-tiers — Create/upsert tier
export async function POST(req: NextRequest) {
  try {
    const result = await requireRole(['ADMIN'])
    if (isErrorResponse(result)) return result

    const body = await req.json()
    const data = pricingTierSchema.parse(body)

    if (!data.productId && !data.bundleId) {
      return NextResponse.json({ error: 'Either productId or bundleId is required' }, { status: 400 })
    }

    // Upsert: if tier for this product/bundle already exists, update it
    if (data.productId) {
      const tier = await prisma.pricingTier.upsert({
        where: { productId_tier: { productId: data.productId, tier: data.tier } },
        create: {
          productId: data.productId,
          tier: data.tier,
          priceMultiplier: data.priceMultiplier,
          minQuantity: data.minQuantity,
        },
        update: {
          priceMultiplier: data.priceMultiplier,
          minQuantity: data.minQuantity,
        },
      })
      return NextResponse.json(tier, { status: 201 })
    }

    const tier = await prisma.pricingTier.upsert({
      where: { bundleId_tier: { bundleId: data.bundleId!, tier: data.tier } },
      create: {
        bundleId: data.bundleId,
        tier: data.tier,
        priceMultiplier: data.priceMultiplier,
        minQuantity: data.minQuantity,
      },
      update: {
        priceMultiplier: data.priceMultiplier,
        minQuantity: data.minQuantity,
      },
    })
    return NextResponse.json(tier, { status: 201 })
  } catch (error) {
    return handleApiError(error, '/api/pricing-tiers')
  }
}
