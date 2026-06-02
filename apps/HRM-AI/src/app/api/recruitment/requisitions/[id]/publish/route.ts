import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

// POST /api/recruitment/requisitions/[id]/publish
export async function POST(
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
    })

    if (!requisition) {
      return NextResponse.json({ error: 'Requisition not found' }, { status: 404 })
    }

    if (requisition.status !== 'DRAFT' && requisition.status !== 'APPROVED') {
      return NextResponse.json(
        { error: 'Only draft or approved requisitions can be published' },
        { status: 400 }
      )
    }

    // Update requisition status to OPEN
    const updatedRequisition = await db.jobRequisition.update({
      where: { id: params.id },
      data: {
        status: 'OPEN',
      },
      include: {
        department: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json({
      success: true,
      data: updatedRequisition,
      message: 'Requisition published successfully',
    })
  } catch (error) {
    console.error('Error publishing requisition:', error)
    return NextResponse.json(
      { error: 'Failed to publish requisition' },
      { status: 500 }
    )
  }
}
