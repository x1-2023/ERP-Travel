import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole, isErrorResponse } from '@/lib/auth/rbac'
import { AuthError } from '@/lib/auth/get-current-user'

// GET /api/internal/customers — Customer data for TPM integration (Phase 3 stub)
export async function GET(req: NextRequest) {
  try {
    const result = await requireRole(['ADMIN'])
    if (isErrorResponse(result)) return result
    const { searchParams } = req.nextUrl
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50')))
    const skip = (page - 1) * limit

    // Return companies with CUSTOMER-status contacts and deal stats
    const companies = await prisma.company.findMany({
      where: {
        contacts: {
          some: { status: 'CUSTOMER' },
        },
      },
      select: {
        id: true,
        name: true,
        domain: true,
        industry: true,
        size: true,
        phone: true,
        email: true,
        address: true,
        city: true,
        province: true,
        taxCode: true,
        externalTpmId: true,
        contacts: {
          where: { status: 'CUSTOMER' },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            jobTitle: true,
          },
        },
        _count: {
          select: {
            deals: true,
            orders: true,
          },
        },
      },
      orderBy: { name: 'asc' },
      skip,
      take: limit,
    })

    const total = await prisma.company.count({
      where: {
        contacts: {
          some: { status: 'CUSTOMER' },
        },
      },
    })

    return NextResponse.json({
      data: companies,
      total,
      page,
      limit,
      generatedAt: new Date().toISOString(),
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('GET /api/internal/customers error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch customer data' },
      { status: 500 }
    )
  }
}
