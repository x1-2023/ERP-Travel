import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { safeParseInt } from '@/lib/api/parse-params'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tenantId = searchParams.get('tenantId')

    if (!tenantId) {
      return NextResponse.json(
        { success: false, error: 'tenantId is required' },
        { status: 400 }
      )
    }

    const jobType = searchParams.get('jobType') || undefined
    const workMode = searchParams.get('workMode') || undefined
    const search = searchParams.get('search') || undefined
    const page = safeParseInt(searchParams.get('page'), 1)
    const pageSize = safeParseInt(searchParams.get('pageSize'), 20)

    const where: Record<string, unknown> = {
      tenantId,
      status: 'PUBLISHED',
      isPublic: true,
      OR: [
        { expiresAt: null },
        { expiresAt: { gte: new Date() } },
      ],
    }

    if (jobType) {
      where.jobType = jobType
    }

    if (workMode) {
      where.workMode = workMode
    }

    if (search) {
      where.AND = [
        {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
            { location: { contains: search, mode: 'insensitive' } },
          ],
        },
      ]
    }

    const [jobs, total] = await Promise.all([
      db.jobPosting.findMany({
        where,
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          location: true,
          jobType: true,
          workMode: true,
          salaryDisplay: true,
          requirements: true,
          benefits: true,
          expiresAt: true,
          publishedAt: true,
          viewCount: true,
          applicationCount: true,
        },
        orderBy: { publishedAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.jobPosting.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        items: jobs,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    })
  } catch (error) {
    console.error('GET /api/public/careers/jobs error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
