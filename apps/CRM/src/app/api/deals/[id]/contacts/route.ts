import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, AuthError } from '@/lib/auth/get-current-user'
import { handleApiError } from '@/lib/api/errors'

// POST /api/deals/[id]/contacts — Add contact to deal
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await getCurrentUser()
    const { id: dealId } = await params
    const { contactId, role = 'OTHER', isPrimary = false } = await req.json()

    if (!contactId) {
      return NextResponse.json({ error: 'contactId is required' }, { status: 400 })
    }

    const dc = await prisma.dealContact.create({
      data: { dealId, contactId, role, isPrimary },
      include: {
        contact: { select: { id: true, firstName: true, lastName: true, email: true, avatarUrl: true } },
      },
    })

    return NextResponse.json(dc, { status: 201 })
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json({ error: 'Contact already added to this deal' }, { status: 409 })
    }
    return handleApiError(error, '/api/deals/[id]/contacts')
  }
}

// PATCH /api/deals/[id]/contacts — Update contact role
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await getCurrentUser()
    const { id: dealId } = await params
    const { contactId, role, isPrimary, notes } = await req.json()

    if (!contactId) {
      return NextResponse.json({ error: 'contactId is required' }, { status: 400 })
    }

    const dc = await prisma.dealContact.update({
      where: { dealId_contactId: { dealId, contactId } },
      data: {
        ...(role !== undefined && { role }),
        ...(isPrimary !== undefined && { isPrimary }),
        ...(notes !== undefined && { notes }),
      },
      include: {
        contact: { select: { id: true, firstName: true, lastName: true, email: true, avatarUrl: true } },
      },
    })

    return NextResponse.json(dc)
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Contact not found on this deal' }, { status: 404 })
    }
    return handleApiError(error, '/api/deals/[id]/contacts')
  }
}

// DELETE /api/deals/[id]/contacts — Remove contact from deal
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await getCurrentUser()
    const { id: dealId } = await params
    const { searchParams } = req.nextUrl
    const contactId = searchParams.get('contactId')

    if (!contactId) {
      return NextResponse.json({ error: 'contactId is required' }, { status: 400 })
    }

    await prisma.dealContact.delete({
      where: { dealId_contactId: { dealId, contactId } },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Contact not found on this deal' }, { status: 404 })
    }
    return handleApiError(error, '/api/deals/[id]/contacts')
  }
}
