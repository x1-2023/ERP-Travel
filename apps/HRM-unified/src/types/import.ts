export interface ImportJob {
  id: string
  importType: string
  fileName: string
  fileSize?: number | null
  status: string
  totalRows: number
  processedRows: number
  successRows: number
  errorRows: number
  errors?: ImportError[] | null
  summary?: Record<string, unknown> | null
  createdAt: Date
  startedAt?: Date | null
  completedAt?: Date | null
  user?: { name: string; email: string }
}

export interface ImportError {
  row: number
  field: string
  value?: unknown
  error: string
}

export interface ImportColumn {
  key: string
  label: string
  required: boolean
  type: 'string' | 'number' | 'date' | 'email' | 'phone'
  example?: string
}
