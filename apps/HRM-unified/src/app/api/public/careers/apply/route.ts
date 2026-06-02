import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { findOrCreateCandidate } from '@/services/recruitment/candidate.service'
import { createApplication } from '@/services/recruitment/application.service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      tenantId,
      jobPostingId,
      fullName,
      email,
      phone,
      cvUrl,
      cvFileName,
      coverLetter,
      expectedSalary,
      yearsOfExperience,
      linkedinUrl,
      portfolioUrl,
      source,
    } = body as {
      tenantId: string
      jobPostingId: string
      fullName: string
      email: string
      phone?: string
      cvUrl?: string
      cvFileName?: string
      coverLetter?: string
      expectedSalary?: number
      yearsOfExperience?: number
      linkedinUrl?: string
      portfolioUrl?: string
      source?: string
    }

    if (!tenantId || !jobPostingId || !fullName || !email) {
      return NextResponse.json(
        { success: false, error: 'tenantId, jobPostingId, fullName, and email are required' },
        { status: 400 }
      )
    }

    // Look up jobPosting to get requisitionId
    const jobPosting = await db.jobPosting.findFirst({
      where: { id: jobPostingId, tenantId, status: 'PUBLISHED', isPublic: true },
      select: { id: true, requisitionId: true },
    })

    if (!jobPosting) {
      return NextResponse.json(
        { success: false, error: 'Job posting not found or not accepting applications' },
        { status: 404 }
      )
    }

    // Find or create candidate
    const candidate = await findOrCreateCandidate(tenantId, {
      fullName,
      email,
      phone,
      cvUrl,
      cvFileName,
      expectedSalary,
      yearsOfExperience,
      linkedinUrl,
      portfolioUrl,
      source: source || 'CAREER_PAGE',
    })

    // Create application
    const application = await createApplication(tenantId, {
      candidateId: candidate.id,
      requisitionId: jobPosting.requisitionId,
      jobPostingId,
      coverLetter,
      source: source || 'CAREER_PAGE',
    })

    return NextResponse.json(
      { success: true, data: { applicationId: application.id, candidateId: candidate.id } },
      { status: 201 }
    )
  } catch (error) {
    console.error('POST /api/public/careers/apply error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
