import { NextRequest, NextResponse } from 'next/server'
import { getPortalSession } from '@/lib/portal-auth'
import { prisma } from '@/lib/prisma'
import { portalProfileSchema } from '@/lib/validations/portal'
import { formatZodErrors } from '@/lib/validations/utils'

// PUT /api/portal/profile — Update portal user profile
export async function PUT(req: NextRequest) {
  const session = await getPortalSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const parsed = portalProfileSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dữ liệu không hợp lệ', details: formatZodErrors(parsed.error) },
        { status: 400 }
      )
    }

    const { firstName, lastName, phone } = parsed.data

    const updated = await prisma.portalUser.update({
      where: { id: session.portalUser.id },
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone?.trim() || null,
      },
      include: { company: { select: { id: true, name: true } } },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('PUT /api/portal/profile error:', error)
    return NextResponse.json({ error: 'Cập nhật thất bại' }, { status: 500 })
  }
}
