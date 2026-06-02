import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { generateEmployeeTemplate, generateAttendanceTemplate } from '@/lib/import/parser'

export async function GET(_request: Request, { params }: { params: { type: string } }) {
  try {
    const session = await auth()
    if (!session?.user || !['ADMIN', 'HR_MANAGER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    let buffer: Buffer
    let fileName: string

    if (params.type === 'employees') {
      buffer = await generateEmployeeTemplate()
      fileName = 'import-nhan-vien-template.xlsx'
    } else if (params.type === 'attendance') {
      buffer = await generateAttendanceTemplate()
      fileName = 'import-cham-cong-template.xlsx'
    } else {
      return NextResponse.json({ error: 'Invalid template type' }, { status: 400 })
    }

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    })
  } catch (error) {
    console.error('Generate import template error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
