import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import * as certificationService from '@/services/learning/certification.service'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const tenantId = session.user.tenantId
    const userId = session.user.id

    const result = await certificationService.getCertificationTypes(tenantId)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching certification types:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const tenantId = session.user.tenantId
    const userId = session.user.id

    const body = await request.json()
    const result = await certificationService.createCertificationType(tenantId, body)
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Error creating certification type:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
