// src/app/api/admin/roles/[roleId]/route.ts
// Custom Role CRUD by ID (P2-17)

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { updateCustomRole } from '@/lib/security/custom-roles'
import { z } from 'zod'

const updateRoleSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  level: z.number().min(1).max(99).optional(),
  isActive: z.boolean().optional(),
  permissions: z.array(z.object({
    resource: z.string(),
    action: z.string(),
    scope: z.enum(['own', 'department', 'all']).optional(),
  })).optional(),
})

// GET - Get role details
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ roleId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { roleId } = await params
    const role = await db.customRole.findUnique({
      where: { id: roleId },
      include: {
        permissions: true,
        fieldPermissions: true,
        users: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
    })

    if (!role || role.tenantId !== session.user.tenantId) {
      return NextResponse.json({ error: 'Không tìm thấy' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: role })
  } catch (error) {
    console.error('Get role error:', error)
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 })
  }
}

// PATCH - Update role
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ roleId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || !['SUPER_ADMIN', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { roleId } = await params
    const existing = await db.customRole.findUnique({ where: { id: roleId } })

    if (!existing || existing.tenantId !== session.user.tenantId) {
      return NextResponse.json({ error: 'Không tìm thấy' }, { status: 404 })
    }

    if (existing.isSystem) {
      return NextResponse.json({ error: 'Không thể sửa role hệ thống' }, { status: 403 })
    }

    const body = await request.json()
    const validated = updateRoleSchema.parse(body)

    const role = await updateCustomRole(roleId, validated)
    return NextResponse.json({ success: true, data: role })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Dữ liệu không hợp lệ', details: error.issues }, { status: 400 })
    }
    console.error('Update role error:', error)
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 })
  }
}

// DELETE - Delete role
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ roleId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { roleId } = await params
    const existing = await db.customRole.findUnique({ where: { id: roleId } })

    if (!existing || existing.tenantId !== session.user.tenantId) {
      return NextResponse.json({ error: 'Không tìm thấy' }, { status: 404 })
    }

    if (existing.isSystem) {
      return NextResponse.json({ error: 'Không thể xóa role hệ thống' }, { status: 403 })
    }

    await db.customRole.delete({ where: { id: roleId } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete role error:', error)
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 })
  }
}
