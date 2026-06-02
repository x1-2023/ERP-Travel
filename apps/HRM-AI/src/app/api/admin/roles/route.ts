// src/app/api/admin/roles/route.ts
// Custom Role management API (P2-17)

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { createCustomRole } from '@/lib/security/custom-roles'
import { z } from 'zod'

const createRoleSchema = z.object({
  name: z.string().min(1).max(100),
  code: z.string().min(1).max(50).regex(/^[A-Z_]+$/, 'Mã role phải viết hoa, dùng gạch dưới'),
  description: z.string().optional(),
  level: z.number().min(1).max(99).optional(),
  permissions: z.array(z.object({
    resource: z.string(),
    action: z.string(),
    scope: z.enum(['own', 'department', 'all']).optional(),
  })),
})

// GET - List custom roles
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const roles = await db.customRole.findMany({
      where: { tenantId: session.user.tenantId },
      include: {
        permissions: true,
        _count: { select: { users: true } },
      },
      orderBy: { level: 'desc' },
    })

    return NextResponse.json({ success: true, data: roles })
  } catch (error) {
    console.error('List roles error:', error)
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 })
  }
}

// POST - Create custom role
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || !['SUPER_ADMIN', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const validated = createRoleSchema.parse(body)

    const role = await createCustomRole(session.user.tenantId, validated)

    return NextResponse.json({ success: true, data: role }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Dữ liệu không hợp lệ', details: error.issues }, { status: 400 })
    }
    console.error('Create role error:', error)
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 })
  }
}
