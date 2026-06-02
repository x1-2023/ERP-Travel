import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import * as empCompService from '@/services/compensation/employee-compensation.service'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const employeeId = request.nextUrl.searchParams.get('employeeId') || undefined
    const result = await empCompService.getCompensationChanges(session.user.tenantId, employeeId)
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await request.json()
    const result = await empCompService.recordCompensationChange(session.user.tenantId, {
      ...body, effectiveDate: new Date(body.effectiveDate), approvedById: session.user.id,
    })
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
