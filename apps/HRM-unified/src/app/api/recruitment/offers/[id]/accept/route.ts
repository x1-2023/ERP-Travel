import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

// POST /api/recruitment/offers/[id]/accept
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const offer = await db.offer.findUnique({
      where: { id: params.id },
      include: {
        application: {
          include: {
            candidate: true,
            requisition: {
              include: {
                department: true,
              },
            },
          },
        },
        department: true,
      },
    })

    if (!offer) {
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 })
    }

    if (offer.status !== 'SENT' && offer.status !== 'APPROVED') {
      return NextResponse.json(
        { error: 'Offer must be sent or approved before accepting' },
        { status: 400 }
      )
    }

    // Transaction: Update offer, application, and create employee
    const result = await db.$transaction(async (tx) => {
      // 1. Update offer status
      await tx.offer.update({
        where: { id: params.id },
        data: {
          status: 'ACCEPTED',
          respondedAt: new Date(),
        },
      })

      // 2. Update application status
      await tx.application.update({
        where: { id: offer.applicationId },
        data: {
          status: 'HIRED',
          hiredAt: new Date(),
          hiredById: session.user.id,
        },
      })

      // 3. Generate employee code
      const employeeCount = await tx.employee.count({
        where: { tenantId: session.user.tenantId },
      })
      const employeeCode = `NV${String(employeeCount + 1).padStart(5, '0')}`

      // 4. Create employee record
      const employee = await tx.employee.create({
        data: {
          tenantId: session.user.tenantId,
          employeeCode,
          fullName: offer.application.candidate.fullName,
          workEmail: offer.application.candidate.email,
          phone: offer.application.candidate.phone,
          departmentId: offer.departmentId,
          hireDate: offer.startDate,
          status: 'ACTIVE',
        },
      })

      // 5. Update requisition filled count
      const requisition = await tx.jobRequisition.update({
        where: { id: offer.application.requisitionId },
        data: {
          filledCount: { increment: 1 },
        },
      })

      // 6. Check if all positions filled
      if (requisition.filledCount >= requisition.headcount) {
        await tx.jobRequisition.update({
          where: { id: requisition.id },
          data: { status: 'FILLED' },
        })
      }

      // 7. Log activity
      await tx.applicationActivity.create({
        data: {
          applicationId: offer.applicationId,
          action: 'hired',
          description: `Đã tuyển dụng. Mã nhân viên: ${employeeCode}`,
          performedById: session.user.id,
        },
      })

      return employee
    })

    return NextResponse.json({
      success: true,
      data: {
        employee: result,
        message: `Employee created successfully: ${result.employeeCode}`,
      },
    })
  } catch (error) {
    console.error('Error accepting offer:', error)
    return NextResponse.json(
      { error: 'Failed to accept offer' },
      { status: 500 }
    )
  }
}
