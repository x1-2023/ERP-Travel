import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import * as skillService from '@/services/learning/skill.service'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const tenantId = session.user.tenantId
    const userId = session.user.id

    const { searchParams } = new URL(request.url)
    const params = {
      tenantId,
      departmentId: searchParams.get('departmentId') || undefined,
      skillId: searchParams.get('skillId') || undefined,
    }

    const result = await skillService.getSkillsMatrix(tenantId, {
      departmentId: params.departmentId,
      skillIds: params.skillId ? [params.skillId] : undefined,
    })
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching skill matrix:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
