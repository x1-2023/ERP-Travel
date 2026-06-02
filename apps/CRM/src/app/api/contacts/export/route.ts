import { NextResponse } from 'next/server'
import Papa from 'papaparse'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, AuthError } from '@/lib/auth/get-current-user'
import { canAccess } from '@/lib/auth/rbac'

// GET /api/contacts/export?format=csv
export async function GET() {
  try {
    const user = await getCurrentUser()

    // MEMBER+ can export (view access)
    if (!canAccess(user, 'export')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const where = canAccess(user, 'view_all') ? {} : { ownerId: user.id }

    const contacts = await prisma.contact.findMany({
      where,
      include: {
        company: { select: { name: true } },
      },
      orderBy: { updatedAt: 'desc' },
    })

    const csvData = contacts.map((c) => ({
      firstName: c.firstName,
      lastName: c.lastName,
      email: c.email || '',
      phone: c.phone || '',
      status: c.status,
      leadScore: c.score ?? 0,
      company: c.company?.name || '',
      title: c.jobTitle || '',
      source: c.source || '',
      createdAt: c.createdAt.toISOString().split('T')[0],
    }))

    const csv = Papa.unparse(csvData)
    const date = new Date().toISOString().split('T')[0]

    // BOM prefix for Vietnamese Excel compatibility
    return new NextResponse('\uFEFF' + csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="contacts-${date}.csv"`,
      },
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('GET /api/contacts/export error:', error)
    return NextResponse.json({ error: 'Export failed' }, { status: 500 })
  }
}
