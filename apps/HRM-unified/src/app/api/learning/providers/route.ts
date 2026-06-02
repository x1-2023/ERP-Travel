import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const tenantId = session.user.tenantId

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || undefined

    const where: any = { tenantId }
    if (search) {
      where.name = { contains: search, mode: 'insensitive' }
    }

    const providers = await db.trainingProvider.findMany({
      where,
      orderBy: { name: 'asc' },
    })
    return NextResponse.json(providers)
  } catch (error) {
    console.error('Error fetching providers:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const tenantId = session.user.tenantId

    const body = await request.json()
    const provider = await db.trainingProvider.create({
      data: {
        tenantId,
        name: body.name,
        code: body.code,
        type: body.type || 'EXTERNAL',
        contactName: body.contactName,
        contactEmail: body.contactEmail,
        contactPhone: body.contactPhone,
        website: body.website,
        address: body.address,
        notes: body.notes,
        isActive: true,
      },
    })

    return NextResponse.json(provider, { status: 201 })
  } catch (error) {
    console.error('Error creating provider:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
