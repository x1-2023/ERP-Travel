import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import * as empCompService from '@/services/compensation/employee-compensation.service'

export async function GET(request: NextRequest, { params }: { params: { employeeId: string } }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const result = await empCompService.getEmployeeCompensation(session.user.tenantId, params.employeeId)
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { employeeId: string } }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await request.json()
    const result = await empCompService.setEmployeeCompensation(session.user.tenantId, params.employeeId, {
      ...body, effectiveDate: new Date(body.effectiveDate),
    })
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
