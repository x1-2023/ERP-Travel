import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import * as cycleService from '@/services/compensation/cycle.service'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const year = request.nextUrl.searchParams.get('year')
    const result = await cycleService.getCompensationCycles(session.user.tenantId, year ? parseInt(year) : undefined)
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
    const result = await cycleService.createCompensationCycle(session.user.tenantId, {
      ...body, startDate: new Date(body.startDate), endDate: new Date(body.endDate),
    })
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
