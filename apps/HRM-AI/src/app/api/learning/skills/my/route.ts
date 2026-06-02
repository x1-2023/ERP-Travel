import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import * as skillService from '@/services/learning/skill.service'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const tenantId = session.user.tenantId
    const userId = session.user.id

    const result = await skillService.getEmployeeSkills(tenantId, userId)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching my skills:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
