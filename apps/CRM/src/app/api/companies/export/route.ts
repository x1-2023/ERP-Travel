import { NextResponse } from 'next/server'
import Papa from 'papaparse'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, AuthError } from '@/lib/auth/get-current-user'
import { canAccess } from '@/lib/auth/rbac'

// GET /api/companies/export?format=csv
export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!canAccess(user, 'export')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const where = canAccess(user, 'view_all') ? {} : { ownerId: user.id }

    const companies = await prisma.company.findMany({
      where,
      include: {
        _count: { select: { contacts: true } },
      },
      orderBy: { updatedAt: 'desc' },
    })

    const csvData = companies.map((c) => ({
      name: c.name,
      domain: c.domain || '',
      industry: c.industry || '',
      size: c.size || '',
      phone: c.phone || '',
      email: c.email || '',
      address: c.address || '',
      contactCount: c._count.contacts,
      createdAt: c.createdAt.toISOString().split('T')[0],
    }))

    const csv = Papa.unparse(csvData)
    const date = new Date().toISOString().split('T')[0]

    return new NextResponse('\uFEFF' + csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="companies-${date}.csv"`,
      },
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('GET /api/companies/export error:', error)
    return NextResponse.json({ error: 'Export failed' }, { status: 500 })
  }
}
