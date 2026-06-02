// src/app/api/admin/retention/route.ts
// Data Retention Policy API (P2-21)

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import {
  getRetentionPolicies,
  updateRetentionPolicy,
  initDefaultPolicies,
  executeRetentionPolicies,
} from '@/services/retention.service'
import { z } from 'zod'

const updateSchema = z.object({
  policyId: z.string().min(1),
  retentionDays: z.number().min(1).optional(),
  action: z.enum(['archive', 'anonymize', 'delete']).optional(),
  isActive: z.boolean().optional(),
})

// GET - List retention policies
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user || !['SUPER_ADMIN', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const tenantId = session.user.tenantId

    // Auto-initialize defaults if no policies exist
    await initDefaultPolicies(tenantId)

    const policies = await getRetentionPolicies(tenantId)
    return NextResponse.json({ success: true, data: policies })
  } catch (error) {
    console.error('List retention policies error:', error)
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 })
  }
}

// PATCH - Update a policy
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || !['SUPER_ADMIN', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const validated = updateSchema.parse(body)

    const policy = await updateRetentionPolicy(validated.policyId, {
      retentionDays: validated.retentionDays,
      action: validated.action,
      isActive: validated.isActive,
    })

    return NextResponse.json({ success: true, data: policy })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Dữ liệu không hợp lệ', details: error.issues }, { status: 400 })
    }
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 })
  }
}

// POST - Execute retention policies now
export async function POST() {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const results = await executeRetentionPolicies(session.user.tenantId)

    return NextResponse.json({
      success: true,
      data: results,
      message: 'Đã chạy chính sách lưu trữ thành công',
    })
  } catch (error) {
    console.error('Execute retention error:', error)
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 })
  }
}
