import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockContact } = vi.hoisted(() => ({
  mockContact: {
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
}))

vi.mock('@/lib/prisma', () => ({
  prisma: { contact: mockContact },
}))

import { importContacts, autoMapColumns, parseCSV } from '../csv-importer'
import type { ColumnMapping, ImportOptions } from '../csv-importer'

describe('importContacts (async)', () => {
  const defaultOptions: ImportOptions = { duplicateAction: 'skip', dryRun: false, batchSize: 50 }

  beforeEach(() => {
    vi.clearAllMocks()
    mockContact.findMany.mockResolvedValue([])
    mockContact.create.mockResolvedValue({ id: 'c-1' })
  })

  function makeRows(csv: string) {
    const parsed = parseCSV(csv)
    const mapping = autoMapColumns(parsed.headers, 'contacts')
    return { rows: parsed.rows, mapping }
  }

  it('creates new contacts for non-duplicate emails', async () => {
    const { rows, mapping } = makeRows('FirstName,LastName,Email\nAlice,Nguyen,alice@test.com\nBob,Tran,bob@test.com')
    const result = await importContacts(rows, mapping, defaultOptions, 'user-1')
    expect(result.created).toBe(2)
    expect(result.skipped).toBe(0)
    expect(mockContact.create).toHaveBeenCalledTimes(2)
  })

  it('skips duplicates in skip mode', async () => {
    const { rows, mapping } = makeRows('FirstName,LastName,Email\nAlice,Nguyen,alice@test.com')
    mockContact.findMany.mockResolvedValue([{ id: 'existing-1', email: 'alice@test.com' }])
    const result = await importContacts(rows, mapping, { ...defaultOptions, duplicateAction: 'skip' }, 'user-1')
    expect(result.skipped).toBe(1)
    expect(result.created).toBe(0)
  })

  it('updates duplicates in update mode', async () => {
    const { rows, mapping } = makeRows('FirstName,LastName,Email\nAlice,Updated,alice@test.com')
    mockContact.findMany.mockResolvedValue([{ id: 'existing-1', email: 'alice@test.com' }])
    const result = await importContacts(rows, mapping, { ...defaultOptions, duplicateAction: 'update' }, 'user-1')
    expect(result.updated).toBe(1)
    expect(mockContact.update).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 'existing-1' } }))
  })

  it('returns correct counts for mixed results', async () => {
    const { rows, mapping } = makeRows('FirstName,LastName,Email\nAlice,A,alice@test.com\nBob,B,bob@test.com\nNew,U,new@test.com')
    mockContact.findMany.mockResolvedValue([{ id: 'e-1', email: 'alice@test.com' }, { id: 'e-2', email: 'bob@test.com' }])
    const result = await importContacts(rows, mapping, defaultOptions, 'user-1')
    expect(result.total).toBe(3)
    expect(result.skipped).toBe(2)
    expect(result.created).toBe(1)
  })

  it('does not create records in dry run mode', async () => {
    const { rows, mapping } = makeRows('FirstName,LastName,Email\nAlice,Nguyen,alice@test.com')
    const result = await importContacts(rows, mapping, { ...defaultOptions, dryRun: true }, 'user-1')
    expect(result.created).toBe(1)
    expect(mockContact.create).not.toHaveBeenCalled()
  })
})
