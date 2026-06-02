// src/app/api/analytics/compensation/benchmarks/route.ts
// Salary Benchmarks CRUD API

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!['ADMIN', 'HR_MANAGER', 'MANAGER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const position = searchParams.get('position')
    const level = searchParams.get('level')
    const department = searchParams.get('department')

    const where: Record<string, unknown> = {
      tenantId: session.user.tenantId,
    }

    if (position) where.position = position
    if (level) where.level = level
    if (department) where.department = department

    const benchmarks = await db.salaryBenchmark.findMany({
      where,
      orderBy: [{ position: 'asc' }, { level: 'asc' }],
    })

    return NextResponse.json({ data: benchmarks })
  } catch (error) {
    console.error('Error fetching salary benchmarks:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const {
      position,
      level,
      department,
      marketMin,
      marketMid,
      marketMax,
      source,
      validFrom,
      validUntil,
    } = body

    if (!position || !level || !marketMin || !marketMid || !marketMax || !validFrom) {
      return NextResponse.json(
        { error: 'Thiếu thông tin bắt buộc: position, level, marketMin, marketMid, marketMax, validFrom' },
        { status: 400 }
      )
    }

    const benchmark = await db.salaryBenchmark.create({
      data: {
        tenantId: session.user.tenantId,
        position,
        level,
        department: department || null,
        marketMin,
        marketMid,
        marketMax,
        source: source || null,
        validFrom: new Date(validFrom),
        validUntil: validUntil ? new Date(validUntil) : null,
      },
    })

    return NextResponse.json(benchmark, { status: 201 })
  } catch (error) {
    console.error('Error creating salary benchmark:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
