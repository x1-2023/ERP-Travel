import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, AuthError } from '@/lib/auth/get-current-user'
import { handleApiError } from '@/lib/api/errors'
import { screenEntity } from '@/lib/compliance/screening'
import { validateRequest, screenEntitySchema } from '@/lib/validations'

// POST /api/compliance/screen — Screen entity against denied party list
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    const body = await req.json()
    const data = validateRequest(screenEntitySchema, body)

    const result = await screenEntity({ name: data.name, country: data.country })

    // Save compliance check record
    const check = await prisma.complianceCheck.create({
      data: {
        entityType: data.entityType,
        entityId: data.entityId,
        checkType: 'DENIED_PARTY',
        status: result.status as any,
        riskLevel: result.riskLevel as any,
        result: result as any,
        checkedById: user.id,
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
      },
    })

    // Update entity compliance status if deal or company
    if (data.entityType === 'DEAL') {
      await prisma.deal.update({
        where: { id: data.entityId },
        data: { complianceStatus: result.status as any },
      })
    } else if (data.entityType === 'COMPANY') {
      await prisma.company.update({
        where: { id: data.entityId },
        data: { sanctionsStatus: result.status as any },
      })
    }

    return NextResponse.json({ check, screening: result })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    return handleApiError(error, '/api/compliance/screen')
  }
}
