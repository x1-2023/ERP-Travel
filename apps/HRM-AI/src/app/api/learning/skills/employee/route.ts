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
    const employeeId = searchParams.get('employeeId') || userId

    const result = await skillService.getEmployeeSkills(tenantId, employeeId)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching employee skills:', error)
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
    const { skillId, ...data } = body
    const result = await skillService.updateEmployeeSkill(tenantId, userId, skillId, data, userId)
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Error adding employee skill:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
