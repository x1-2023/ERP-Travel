// src/app/api/compliance/insurance/reports/route.ts
// API endpoint for insurance reports (C12, D02, D03)

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/db'
import {
  generateC12Report,
  generateD02Report,
  generateD03Report,
  saveC12Report,
  saveD02Report,
  saveD03Report,
} from '@/lib/compliance/insurance'
import { z } from 'zod'

// ═══════════════════════════════════════════════════════════════
// REQUEST SCHEMA
// ═══════════════════════════════════════════════════════════════

const generateReportSchema = z.object({
  reportType: z.enum(['C12_TS', 'D02_TS', 'D03_TS']),
  month: z.number().min(1).max(12),
  year: z.number().min(2020).max(2100),
  save: z.boolean().optional().default(false),
})

// ═══════════════════════════════════════════════════════════════
// GET - List reports
// ═══════════════════════════════════════════════════════════════

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tenantId = session.user.tenantId
    const { searchParams } = new URL(request.url)

    const reportType = searchParams.get('reportType')
    const year = searchParams.get('year')
    const status = searchParams.get('status')

    const where: Record<string, unknown> = { tenantId }

    if (reportType) {
      where.reportType = reportType
    }

    if (year) {
      where.reportYear = parseInt(year, 10)
    }

    if (status) {
      where.status = status
    }

    const reports = await prisma.insuranceReport.findMany({
      where,
      orderBy: [{ reportYear: 'desc' }, { reportMonth: 'desc' }],
      take: 50,
    })

    return NextResponse.json({
      success: true,
      data: reports,
    })
  } catch (error) {
    console.error('List insurance reports error:', error)
    return NextResponse.json(
      { error: 'Không thể tải danh sách báo cáo' },
      { status: 500 }
    )
  }
}

// ═══════════════════════════════════════════════════════════════
// POST - Generate report
// ═══════════════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tenantId = session.user.tenantId
    const body = await request.json()
    const validated = generateReportSchema.parse(body)

    let reportData
    let reportId: string | undefined

    switch (validated.reportType) {
      case 'C12_TS':
        reportData = await generateC12Report(tenantId, validated.month, validated.year)
        if (validated.save) {
          reportId = await saveC12Report(tenantId, reportData)
        }
        break

      case 'D02_TS':
        reportData = await generateD02Report(tenantId, validated.month, validated.year)
        if (validated.save) {
          reportId = await saveD02Report(tenantId, reportData)
        }
        break

      case 'D03_TS':
        reportData = await generateD03Report(tenantId, validated.month, validated.year)
        if (validated.save) {
          reportId = await saveD03Report(tenantId, reportData)
        }
        break

      default:
        return NextResponse.json(
          { error: 'Loại báo cáo không hợp lệ' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      data: {
        report: reportData,
        saved: validated.save,
        reportId,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dữ liệu không hợp lệ', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Generate insurance report error:', error)
    return NextResponse.json(
      { error: 'Không thể tạo báo cáo' },
      { status: 500 }
    )
  }
}
