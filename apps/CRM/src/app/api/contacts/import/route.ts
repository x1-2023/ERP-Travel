import { NextRequest, NextResponse } from 'next/server'
import { requireRole, isErrorResponse } from '@/lib/auth/rbac'
import { AuthError } from '@/lib/auth/get-current-user'
import {
  parseCSV,
  autoMapColumns,
  importContacts,
  type ColumnMapping,
  type ImportOptions,
} from '@/lib/import/csv-importer'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_ROWS = 5000

// POST /api/contacts/import — MANAGER+ only
export async function POST(req: NextRequest) {
  try {
    const result = await requireRole(['ADMIN', 'MANAGER'])
    if (isErrorResponse(result)) return result
    const user = result

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const mappingJson = formData.get('mapping') as string | null
    const duplicateAction = (formData.get('duplicateAction') as string) || 'skip'
    const dryRun = formData.get('dryRun') === 'true'

    if (!file) {
      return NextResponse.json({ error: 'File required' }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 })
    }

    const fileName = file.name || ''
    if (!fileName.endsWith('.csv') && file.type !== 'text/csv') {
      return NextResponse.json({ error: 'Only CSV files are allowed' }, { status: 400 })
    }

    const text = await file.text()
    const parsed = parseCSV(text)

    if (parsed.rows.length > MAX_ROWS) {
      return NextResponse.json(
        { error: `Too many rows (max ${MAX_ROWS})` },
        { status: 400 }
      )
    }

    if (parsed.rows.length === 0) {
      return NextResponse.json({ error: 'CSV is empty' }, { status: 400 })
    }

    // Use provided mapping or auto-map
    let mapping: ColumnMapping[]
    if (mappingJson) {
      mapping = JSON.parse(mappingJson)
    } else {
      mapping = autoMapColumns(parsed.headers, 'contacts')
    }

    const options: ImportOptions = {
      duplicateAction: duplicateAction as 'skip' | 'update' | 'create',
      dryRun,
      batchSize: 50,
    }

    const importResult = await importContacts(parsed.rows, mapping, options, user.id)

    return NextResponse.json({
      ...importResult,
      headers: parsed.headers,
      mapping,
      preview: dryRun ? parsed.rows.slice(0, 5) : undefined,
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('POST /api/contacts/import error:', error)
    return NextResponse.json({ error: 'Import failed' }, { status: 500 })
  }
}
