import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import * as benefitService from '@/services/compensation/benefit.service'

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const result = await benefitService.cancelBenefitEnrollment(params.id, session.user.tenantId)
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
