// src/app/api/workflow/delegations/[id]/route.ts
// Single delegation API

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { delegationService } from '@/services/delegation.service'

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
    const delegation = await delegationService.getById(
      session.user.tenantId,
      id
    )

    if (!delegation) {
      return NextResponse.json({ error: 'Delegation not found' }, { status: 404 })
    }

    return NextResponse.json(delegation)
  } catch (error) {
    console.error('Error fetching delegation:', error)
    return NextResponse.json(
      { error: 'Failed to fetch delegation' },
      { status: 500 }
    )
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

    const { id } = await params
    const body = await request.json()

    const data = {
      ...body,
      ...(body.startDate && { startDate: new Date(body.startDate) }),
      ...(body.endDate && { endDate: new Date(body.endDate) }),
    }

    const delegation = await delegationService.update(
      session.user.tenantId,
      id,
      data
    )

    return NextResponse.json(delegation)
  } catch (error) {
    console.error('Error updating delegation:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update delegation' },
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

    const { id } = await params
    await delegationService.delete(
      session.user.tenantId,
      id
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting delegation:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete delegation' },
      { status: 400 }
    )
  }
}
