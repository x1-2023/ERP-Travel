// src/app/api/admin/erasure/[requestId]/route.ts
// GDPR Erasure Request - Review & Execute (P2-20)

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import {
  getErasureRequest,
  reviewErasureRequest,
  executeErasure,
} from '@/services/erasure.service'
import { z } from 'zod'

const reviewSchema = z.object({
  action: z.enum(['APPROVED', 'REJECTED']),
  notes: z.string().optional(),
})

const executeSchema = z.object({
  confirm: z.literal(true, { message: 'Phải xác nhận trước khi xóa dữ liệu' }),
})

// GET - Get erasure request details
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || !['SUPER_ADMIN', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { requestId } = await params
    const request = await getErasureRequest(requestId)

    if (!request) {
      return NextResponse.json({ error: 'Không tìm thấy' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: request })
  } catch (error) {
    console.error('Get erasure request error:', error)
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 })
  }
}

// PATCH - Review (approve/reject) erasure request
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || !['SUPER_ADMIN', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { requestId } = await params
    const body = await request.json()
    const validated = reviewSchema.parse(body)

    const result = await reviewErasureRequest(
      requestId,
      session.user.id,
      validated.action,
      validated.notes
    )

    return NextResponse.json({ success: true, data: result })
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

// POST - Execute the approved erasure
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Chỉ SUPER_ADMIN mới có thể thực hiện xóa dữ liệu' }, { status: 403 })
    }

    const { requestId } = await params
    const body = await request.json()
    executeSchema.parse(body)

    const result = await executeErasure(requestId, session.user.id)

    return NextResponse.json({ success: true, data: result })
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
