import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

// GET /api/recruitment/requisitions/[id]/pipeline
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const requisition = await db.jobRequisition.findUnique({
      where: { id: params.id },
      include: {
        department: { select: { id: true, name: true } },
      },
    })

    if (!requisition) {
      return NextResponse.json({ error: 'Requisition not found' }, { status: 404 })
    }

    // Get all applications for this requisition
    const applications = await db.application.findMany({
      where: { requisitionId: params.id },
      include: {
        candidate: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            source: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Define pipeline stages based on actual ApplicationStatus enum
    const pipelineStages = [
      { id: 'NEW', label: 'Mới', color: 'bg-blue-100' },
      { id: 'SCREENING', label: 'Sàng lọc', color: 'bg-yellow-100' },
      { id: 'PHONE_SCREEN', label: 'Phỏng vấn ĐT', color: 'bg-amber-100' },
      { id: 'INTERVIEW', label: 'Phỏng vấn', color: 'bg-orange-100' },
      { id: 'ASSESSMENT', label: 'Đánh giá', color: 'bg-purple-100' },
      { id: 'OFFER', label: 'Đề xuất offer', color: 'bg-indigo-100' },
      { id: 'HIRED', label: 'Đã tuyển', color: 'bg-emerald-100' },
      { id: 'REJECTED', label: 'Từ chối', color: 'bg-red-100' },
      { id: 'WITHDRAWN', label: 'Rút hồ sơ', color: 'bg-gray-100' },
    ]

    // Calculate stats
    const stats = {
      total: applications.length,
      new: applications.filter(a => a.status === 'NEW').length,
      inProgress: applications.filter(a =>
        ['SCREENING', 'PHONE_SCREEN', 'INTERVIEW', 'ASSESSMENT'].includes(a.status)
      ).length,
      offered: applications.filter(a => a.status === 'OFFER').length,
      hired: applications.filter(a => a.status === 'HIRED').length,
      rejected: applications.filter(a => a.status === 'REJECTED').length,
    }

    return NextResponse.json({
      success: true,
      data: {
        job: {
          id: requisition.id,
          code: requisition.requisitionCode,
          title: requisition.title,
          department: requisition.department,
          headcount: requisition.headcount,
          filledCount: requisition.filledCount,
          status: requisition.status,
        },
        stages: pipelineStages,
        applications: applications.map(app => ({
          id: app.id,
          candidateId: app.candidate.id,
          candidateName: app.candidate.fullName,
          candidateEmail: app.candidate.email,
          candidatePhone: app.candidate.phone,
          source: app.source,
          status: app.status,
          appliedAt: app.createdAt,
          rating: app.overallRating ? Number(app.overallRating) : null,
        })),
        stats,
      },
    })
  } catch (error) {
    console.error('Error fetching pipeline:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pipeline' },
      { status: 500 }
    )
  }
}
