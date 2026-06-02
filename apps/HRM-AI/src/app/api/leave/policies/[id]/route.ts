// src/app/api/leave/policies/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { leavePolicyService } from '@/services/leave-policy.service'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const policy = await leavePolicyService.getById(session.user.tenantId, id)

    if (!policy) {
      return NextResponse.json({ error: 'Policy not found' }, { status: 404 })
    }

    return NextResponse.json(policy)
  } catch (error) {
    console.error('Error fetching policy:', error)
    return NextResponse.json({ error: 'Failed to fetch policy' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!['ADMIN', 'HR_MANAGER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const policy = await leavePolicyService.update(session.user.tenantId, id, body)

    return NextResponse.json(policy)
  } catch (error) {
    console.error('Error updating policy:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update policy' },
      { status: 400 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!['ADMIN', 'HR_MANAGER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    const { id } = await params
    await leavePolicyService.delete(session.user.tenantId, id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting policy:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete policy' },
      { status: 400 }
    )
  }
}
