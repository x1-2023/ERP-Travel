// src/app/api/workflow/delegations/route.ts
// Delegations API

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { delegationService } from '@/services/delegation.service'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const delegations = await delegationService.getByDelegator(
      session.user.tenantId,
      session.user.id
    )

    return NextResponse.json({ data: delegations })
  } catch (error) {
    console.error('Error fetching delegations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch delegations' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const data = {
      ...body,
      delegatorId: session.user.id,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
    }

    const delegation = await delegationService.create(
      session.user.tenantId,
      data
    )

    return NextResponse.json(delegation, { status: 201 })
  } catch (error) {
    console.error('Error creating delegation:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create delegation' },
      { status: 400 }
    )
  }
}
