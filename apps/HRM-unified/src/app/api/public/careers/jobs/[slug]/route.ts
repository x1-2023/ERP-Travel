import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const { searchParams } = new URL(request.url)
    const tenantId = searchParams.get('tenantId')

    if (!tenantId) {
      return NextResponse.json(
        { success: false, error: 'tenantId is required' },
        { status: 400 }
      )
    }

    const job = await db.jobPosting.findFirst({
      where: {
        slug,
        tenantId,
        status: 'PUBLISHED',
        isPublic: true,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        requirements: true,
        benefits: true,
        location: true,
        jobType: true,
        workMode: true,
        salaryDisplay: true,
        expiresAt: true,
        publishedAt: true,
        viewCount: true,
        applicationCount: true,
        requisition: {
          select: {
            id: true,
            title: true,
            department: { select: { name: true } },
          },
        },
      },
    })

    if (!job) {
      return NextResponse.json(
        { success: false, error: 'Job posting not found' },
        { status: 404 }
      )
    }

    // Increment view count asynchronously
    db.jobPosting.update({
      where: { id: job.id },
      data: { viewCount: { increment: 1 } },
    }).catch((err) => {
      console.error('Failed to increment view count:', err)
    })

    return NextResponse.json({ success: true, data: job })
  } catch (error) {
    console.error('GET /api/public/careers/jobs/[slug] error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
