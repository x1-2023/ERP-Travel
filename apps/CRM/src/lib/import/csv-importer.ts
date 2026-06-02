import Papa from 'papaparse'
import { prisma } from '@/lib/prisma'
import { createContactSchema } from '@/lib/validations/contact'
import { createCompanySchema } from '@/lib/validations/company'
import { formatZodErrors } from '@/lib/validations/utils'

// ── Types ───────────────────────────────────────────────────────────

export interface ParseResult {
  headers: string[]
  rows: Record<string, string>[]
  errors: Papa.ParseError[]
}

export interface ColumnMapping {
  csvColumn: string
  crmField: string
  transform?: 'none' | 'lowercase' | 'uppercase' | 'trim'
}

export interface ImportOptions {
  duplicateAction: 'skip' | 'update' | 'create'
  dryRun: boolean
  batchSize: number
}

export interface ImportError {
  row: number
  field: string
  message: string
}

export interface ImportResult {
  total: number
  created: number
  updated: number
  skipped: number
  failed: number
  errors: ImportError[]
}

// ── Vietnamese column auto-mapping ──────────────────────────────────

const CONTACT_COLUMN_MAP: Record<string, string> = {
  // Exact matches
  firstname: 'firstName',
  lastname: 'lastName',
  email: 'email',
  phone: 'phone',
  mobile: 'mobile',
  status: 'status',
  source: 'source',
  score: 'score',
  leadscore: 'score',
  jobtitle: 'jobTitle',
  title: 'jobTitle',
  department: 'department',
  company: 'companyName',
  notes: 'notes',
  // Vietnamese matches
  'họ': 'lastName',
  'ho': 'lastName',
  'tên': 'firstName',
  'ten': 'firstName',
  'tên đầy đủ': 'fullName',
  'ten day du': 'fullName',
  'họ và tên': 'fullName',
  'ho va ten': 'fullName',
  'ho ten': 'fullName',
  'điện thoại': 'phone',
  'dien thoai': 'phone',
  'số điện thoại': 'phone',
  'so dien thoai': 'phone',
  'sdt': 'phone',
  'sđt': 'phone',
  'di động': 'mobile',
  'di dong': 'mobile',
  'trạng thái': 'status',
  'trang thai': 'status',
  'nguồn': 'source',
  'nguon': 'source',
  'điểm': 'score',
  'diem': 'score',
  'chức danh': 'jobTitle',
  'chuc danh': 'jobTitle',
  'phòng ban': 'department',
  'phong ban': 'department',
  'công ty': 'companyName',
  'cong ty': 'companyName',
  'ghi chú': 'notes',
  'ghi chu': 'notes',
  // Common English aliases
  'first name': 'firstName',
  'last name': 'lastName',
  'first_name': 'firstName',
  'last_name': 'lastName',
  'lead score': 'score',
  'lead_score': 'score',
  'job title': 'jobTitle',
  'job_title': 'jobTitle',
  'phone number': 'phone',
  'phone_number': 'phone',
}

const COMPANY_COLUMN_MAP: Record<string, string> = {
  // Exact
  name: 'name',
  domain: 'domain',
  industry: 'industry',
  size: 'size',
  phone: 'phone',
  email: 'email',
  address: 'address',
  city: 'city',
  province: 'province',
  country: 'country',
  taxcode: 'taxCode',
  website: 'website',
  notes: 'notes',
  // Vietnamese
  'tên công ty': 'name',
  'ten cong ty': 'name',
  'công ty': 'name',
  'cong ty': 'name',
  'tên': 'name',
  'ten': 'name',
  'ngành nghề': 'industry',
  'nganh nghe': 'industry',
  'ngành': 'industry',
  'nganh': 'industry',
  'quy mô': 'size',
  'quy mo': 'size',
  'điện thoại': 'phone',
  'dien thoai': 'phone',
  'sdt': 'phone',
  'sđt': 'phone',
  'địa chỉ': 'address',
  'dia chi': 'address',
  'thành phố': 'city',
  'thanh pho': 'city',
  'tỉnh': 'province',
  'tinh': 'province',
  'quốc gia': 'country',
  'quoc gia': 'country',
  'mã số thuế': 'taxCode',
  'ma so thue': 'taxCode',
  'mst': 'taxCode',
  'ghi chú': 'notes',
  'ghi chu': 'notes',
  // English aliases
  'tax code': 'taxCode',
  'tax_code': 'taxCode',
  'company name': 'name',
  'company_name': 'name',
}

// ── Parse CSV ───────────────────────────────────────────────────────

export function parseCSV(text: string): ParseResult {
  // Strip BOM if present
  const clean = text.charCodeAt(0) === 0xFEFF ? text.slice(1) : text

  const result = Papa.parse<Record<string, string>>(clean, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  })

  return {
    headers: result.meta.fields || [],
    rows: result.data,
    errors: result.errors,
  }
}

// ── Auto-map columns ────────────────────────────────────────────────

export function autoMapColumns(
  headers: string[],
  entity: 'contacts' | 'companies'
): ColumnMapping[] {
  const map = entity === 'contacts' ? CONTACT_COLUMN_MAP : COMPANY_COLUMN_MAP

  return headers.map((header) => {
    const normalized = header.toLowerCase().trim()
    const crmField = map[normalized] || ''
    return {
      csvColumn: header,
      crmField,
      transform: 'trim' as const,
    }
  })
}

// ── Apply mapping to a row ──────────────────────────────────────────

function applyMapping(
  row: Record<string, string>,
  mapping: ColumnMapping[]
): Record<string, any> {
  const result: Record<string, any> = {}

  for (const m of mapping) {
    if (!m.crmField || m.crmField === '__skip__') continue
    let value = row[m.csvColumn] ?? ''

    // Apply transform
    switch (m.transform) {
      case 'lowercase':
        value = value.toLowerCase()
        break
      case 'uppercase':
        value = value.toUpperCase()
        break
      case 'trim':
        value = value.trim()
        break
    }

    // Handle fullName → split into firstName + lastName
    if (m.crmField === 'fullName' && value) {
      const parts = value.trim().split(/\s+/)
      if (parts.length >= 2) {
        result.lastName = parts.slice(0, -1).join(' ')
        result.firstName = parts[parts.length - 1]
      } else {
        result.firstName = value
        result.lastName = ''
      }
      continue
    }

    // Handle score as number
    if (m.crmField === 'score' && value) {
      result[m.crmField] = parseInt(value, 10) || 0
      continue
    }

    result[m.crmField] = value || undefined
  }

  return result
}

// ── Import Contacts ─────────────────────────────────────────────────

export async function importContacts(
  rows: Record<string, string>[],
  mapping: ColumnMapping[],
  options: ImportOptions,
  userId: string
): Promise<ImportResult> {
  const result: ImportResult = {
    total: rows.length,
    created: 0,
    updated: 0,
    skipped: 0,
    failed: 0,
    errors: [],
  }

  // Pre-fetch existing emails for duplicate check
  const allEmails = rows
    .map((row) => {
      const mapped = applyMapping(row, mapping)
      return mapped.email?.toLowerCase()
    })
    .filter(Boolean) as string[]

  const existingContacts = allEmails.length > 0
    ? await prisma.contact.findMany({
        where: { email: { in: allEmails, mode: 'insensitive' } },
        select: { id: true, email: true },
      })
    : []

  const existingEmailMap = new Map(
    existingContacts.map((c) => [c.email!.toLowerCase(), c.id])
  )

  // Process in batches
  const batchSize = options.batchSize || 50
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize)

    for (let j = 0; j < batch.length; j++) {
      const rowIndex = i + j + 2 // +2: 1-indexed + header row
      const row = batch[j]
      const mapped = applyMapping(row, mapping)

      // Ensure required fields have defaults
      if (!mapped.firstName) mapped.firstName = ''
      if (!mapped.lastName) mapped.lastName = ''
      if (!mapped.status) mapped.status = 'LEAD'

      // Remove companyName (not a schema field)
      delete mapped.companyName

      // Validate with Zod
      const validation = createContactSchema.safeParse(mapped)
      if (!validation.success) {
        const fieldErrors = formatZodErrors(validation.error)
        for (const [field, message] of Object.entries(fieldErrors)) {
          result.errors.push({ row: rowIndex, field, message })
        }
        result.failed++
        continue
      }

      const data = validation.data

      // Check duplicate by email
      if (data.email) {
        const existingId = existingEmailMap.get(data.email.toLowerCase())
        if (existingId) {
          if (options.duplicateAction === 'skip') {
            result.skipped++
            continue
          }
          if (options.duplicateAction === 'update') {
            if (!options.dryRun) {
              await prisma.contact.update({
                where: { id: existingId },
                data: {
                  firstName: data.firstName,
                  lastName: data.lastName,
                  phone: data.phone || undefined,
                  mobile: data.mobile || undefined,
                  jobTitle: data.jobTitle || undefined,
                  department: data.department || undefined,
                  source: (data.source || undefined) as any,
                  status: data.status,
                  notes: data.notes || undefined,
                },
              })
            }
            result.updated++
            continue
          }
          // 'create' — fall through to create anyway
        }
      }

      if (!options.dryRun) {
        await prisma.contact.create({
          data: {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email || undefined,
            phone: data.phone || undefined,
            mobile: data.mobile || undefined,
            jobTitle: data.jobTitle || undefined,
            department: data.department || undefined,
            source: (data.source || undefined) as any,
            status: data.status,
            notes: data.notes || undefined,
            ownerId: userId,
          },
        })
      }
      result.created++
    }
  }

  return result
}

// ── Import Companies ────────────────────────────────────────────────

export async function importCompanies(
  rows: Record<string, string>[],
  mapping: ColumnMapping[],
  options: ImportOptions,
  userId: string
): Promise<ImportResult> {
  const result: ImportResult = {
    total: rows.length,
    created: 0,
    updated: 0,
    skipped: 0,
    failed: 0,
    errors: [],
  }

  // Pre-fetch existing companies by name for duplicate check
  const allNames = rows
    .map((row) => {
      const mapped = applyMapping(row, mapping)
      return mapped.name?.toLowerCase()
    })
    .filter(Boolean) as string[]

  const existingCompanies = allNames.length > 0
    ? await prisma.company.findMany({
        where: { name: { in: allNames, mode: 'insensitive' } },
        select: { id: true, name: true },
      })
    : []

  const existingNameMap = new Map(
    existingCompanies.map((c) => [c.name.toLowerCase(), c.id])
  )

  const batchSize = options.batchSize || 50
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize)

    for (let j = 0; j < batch.length; j++) {
      const rowIndex = i + j + 2
      const row = batch[j]
      const mapped = applyMapping(row, mapping)

      if (!mapped.name) mapped.name = ''

      const validation = createCompanySchema.safeParse(mapped)
      if (!validation.success) {
        const fieldErrors = formatZodErrors(validation.error)
        for (const [field, message] of Object.entries(fieldErrors)) {
          result.errors.push({ row: rowIndex, field, message })
        }
        result.failed++
        continue
      }

      const data = validation.data

      // Check duplicate by name
      const existingId = existingNameMap.get(data.name.toLowerCase())
      if (existingId) {
        if (options.duplicateAction === 'skip') {
          result.skipped++
          continue
        }
        if (options.duplicateAction === 'update') {
          if (!options.dryRun) {
            await prisma.company.update({
              where: { id: existingId },
              data: {
                domain: data.domain || undefined,
                industry: data.industry || undefined,
                size: data.size || undefined,
                phone: data.phone || undefined,
                email: data.email || undefined,
                website: data.website || undefined,
                address: data.address || undefined,
                city: data.city || undefined,
                province: data.province || undefined,
                country: data.country || 'VN',
                taxCode: data.taxCode || undefined,
                notes: data.notes || undefined,
              },
            })
          }
          result.updated++
          continue
        }
      }

      if (!options.dryRun) {
        await prisma.company.create({
          data: {
            name: data.name,
            domain: data.domain || undefined,
            industry: data.industry || undefined,
            size: data.size || undefined,
            phone: data.phone || undefined,
            email: data.email || undefined,
            website: data.website || undefined,
            address: data.address || undefined,
            city: data.city || undefined,
            province: data.province || undefined,
            country: data.country || 'VN',
            taxCode: data.taxCode || undefined,
            notes: data.notes || undefined,
            ownerId: userId,
          },
        })
      }
      result.created++
    }
  }

  return result
}

// ── CRM fields list (for mapping UI) ────────────────────────────────

export const CONTACT_CRM_FIELDS = [
  { value: 'firstName', labelKey: 'contacts.firstName' },
  { value: 'lastName', labelKey: 'contacts.lastName' },
  { value: 'email', labelKey: 'common.email' },
  { value: 'phone', labelKey: 'common.phone' },
  { value: 'mobile', labelKey: 'contacts.mobile' },
  { value: 'status', labelKey: 'common.status' },
  { value: 'source', labelKey: 'contacts.source' },
  { value: 'score', labelKey: 'audienceField.score' },
  { value: 'jobTitle', labelKey: 'contacts.jobTitle' },
  { value: 'department', labelKey: 'contacts.department' },
  { value: 'companyName', labelKey: 'contacts.company' },
  { value: 'notes', labelKey: 'common.notes' },
  { value: 'fullName', labelKey: 'import.fullName' },
] as const

export const COMPANY_CRM_FIELDS = [
  { value: 'name', labelKey: 'common.name' },
  { value: 'domain', labelKey: 'import.domain' },
  { value: 'industry', labelKey: 'companies.industry' },
  { value: 'size', labelKey: 'companies.size' },
  { value: 'phone', labelKey: 'common.phone' },
  { value: 'email', labelKey: 'common.email' },
  { value: 'website', labelKey: 'import.website' },
  { value: 'address', labelKey: 'import.address' },
  { value: 'city', labelKey: 'import.city' },
  { value: 'taxCode', labelKey: 'settings.taxCode' },
  { value: 'notes', labelKey: 'common.notes' },
] as const
