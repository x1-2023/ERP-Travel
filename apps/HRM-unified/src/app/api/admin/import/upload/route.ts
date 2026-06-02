import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { importService } from '@/services/import.service'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'application/vnd.ms-excel', // .xls
  'text/csv',
]
const ALLOWED_EXTENSIONS = ['.xlsx', '.xls', '.csv']

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user || !['ADMIN', 'HR_MANAGER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check Content-Length header before parsing body
    const contentLength = parseInt(request.headers.get('content-length') || '0')
    if (contentLength > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File quá lớn. Tối đa ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 413 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const importType = formData.get('importType') as string | null

    if (!file || !importType) {
      return NextResponse.json({ error: 'File and importType required' }, { status: 400 })
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File quá lớn (${(file.size / 1024 / 1024).toFixed(1)}MB). Tối đa ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 413 }
      )
    }

    // Validate file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!ALLOWED_EXTENSIONS.includes(fileExtension) && !ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Loại file không hợp lệ. Chỉ chấp nhận .xlsx, .xls, .csv' },
        { status: 400 }
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const jobId = await importService.createJob(
      session.user.tenantId,
      session.user.id,
      importType,
      file.name,
      buffer
    )

    return NextResponse.json({ data: { jobId } }, { status: 201 })
  } catch (error) {
    console.error('Upload import file error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
