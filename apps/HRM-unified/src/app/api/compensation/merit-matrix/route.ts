import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import * as meritService from '@/services/compensation/merit-matrix.service'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const year = request.nextUrl.searchParams.get('year')
    const result = await meritService.getMeritMatrix(session.user.tenantId, year ? parseInt(year) : undefined)
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
    if (Array.isArray(body)) {
      const result = await meritService.bulkUpsertMeritMatrix(session.user.tenantId, body)
      return NextResponse.json(result, { status: 201 })
    }
    const result = await meritService.upsertMeritMatrix(session.user.tenantId, body)
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
