import { describe, it, expect } from 'vitest'
import { parseCSV, autoMapColumns } from '../csv-importer'

describe('CSV Importer — Pure Logic', () => {
  describe('parseCSV()', () => {
    it('parses simple CSV with headers', () => {
      const csv = 'Name,Email\nAlice,alice@test.com\nBob,bob@test.com'
      const result = parseCSV(csv)
      expect(result.headers).toEqual(['Name', 'Email'])
      expect(result.rows).toHaveLength(2)
      expect(result.rows[0]).toEqual({ Name: 'Alice', Email: 'alice@test.com' })
      expect(result.rows[1]).toEqual({ Name: 'Bob', Email: 'bob@test.com' })
    })

    it('strips BOM character', () => {
      const bom = '\uFEFF'
      const csv = `${bom}Name,Email\nAlice,alice@test.com`
      const result = parseCSV(csv)
      expect(result.headers).toEqual(['Name', 'Email'])
      expect(result.rows).toHaveLength(1)
    })

    it('trims whitespace from headers', () => {
      const csv = ' Name , Email \nAlice,alice@test.com'
      const result = parseCSV(csv)
      expect(result.headers).toEqual(['Name', 'Email'])
    })

    it('skips empty lines', () => {
      const csv = 'Name,Email\nAlice,alice@test.com\n\n\nBob,bob@test.com\n'
      const result = parseCSV(csv)
      expect(result.rows).toHaveLength(2)
    })

    it('handles Vietnamese text in cells', () => {
      const csv = 'Họ,Tên,Email\nNguyễn,An,an@test.com'
      const result = parseCSV(csv)
      expect(result.headers).toEqual(['Họ', 'Tên', 'Email'])
      expect(result.rows[0]['Họ']).toBe('Nguyễn')
      expect(result.rows[0]['Tên']).toBe('An')
    })

    it('handles quoted fields with commas', () => {
      const csv = 'Name,Address\nAlice,"123 Main St, Apt 4"'
      const result = parseCSV(csv)
      expect(result.rows[0].Address).toBe('123 Main St, Apt 4')
    })

    it('returns empty rows for header-only CSV', () => {
      const csv = 'Name,Email'
      const result = parseCSV(csv)
      expect(result.headers).toEqual(['Name', 'Email'])
      expect(result.rows).toHaveLength(0)
    })

    it('returns errors array (may be empty)', () => {
      const csv = 'Name\nAlice'
      const result = parseCSV(csv)
      expect(Array.isArray(result.errors)).toBe(true)
    })
  })

  describe('autoMapColumns() — contacts', () => {
    it('maps standard English headers', () => {
      const headers = ['FirstName', 'LastName', 'Email', 'Phone']
      const mappings = autoMapColumns(headers, 'contacts')
      expect(mappings.find((m) => m.csvColumn === 'FirstName')?.crmField).toBe('firstName')
      expect(mappings.find((m) => m.csvColumn === 'LastName')?.crmField).toBe('lastName')
      expect(mappings.find((m) => m.csvColumn === 'Email')?.crmField).toBe('email')
      expect(mappings.find((m) => m.csvColumn === 'Phone')?.crmField).toBe('phone')
    })

    it('maps Vietnamese headers', () => {
      const headers = ['Họ', 'Tên', 'Điện thoại', 'Công ty']
      const mappings = autoMapColumns(headers, 'contacts')
      expect(mappings.find((m) => m.csvColumn === 'Họ')?.crmField).toBe('lastName')
      expect(mappings.find((m) => m.csvColumn === 'Tên')?.crmField).toBe('firstName')
      expect(mappings.find((m) => m.csvColumn === 'Điện thoại')?.crmField).toBe('phone')
      expect(mappings.find((m) => m.csvColumn === 'Công ty')?.crmField).toBe('companyName')
    })

    it('maps Vietnamese without diacritics', () => {
      const headers = ['ho', 'ten', 'dien thoai', 'cong ty']
      const mappings = autoMapColumns(headers, 'contacts')
      expect(mappings.find((m) => m.csvColumn === 'ho')?.crmField).toBe('lastName')
      expect(mappings.find((m) => m.csvColumn === 'ten')?.crmField).toBe('firstName')
      expect(mappings.find((m) => m.csvColumn === 'dien thoai')?.crmField).toBe('phone')
      expect(mappings.find((m) => m.csvColumn === 'cong ty')?.crmField).toBe('companyName')
    })

    it('maps full name variants', () => {
      const headers1 = autoMapColumns(['Họ và tên'], 'contacts')
      expect(headers1[0].crmField).toBe('fullName')

      const headers2 = autoMapColumns(['ho va ten'], 'contacts')
      expect(headers2[0].crmField).toBe('fullName')

      const headers3 = autoMapColumns(['tên đầy đủ'], 'contacts')
      expect(headers3[0].crmField).toBe('fullName')
    })

    it('maps underscore and space variants', () => {
      const headers = ['first_name', 'last_name', 'job_title', 'lead_score', 'phone_number']
      const mappings = autoMapColumns(headers, 'contacts')
      expect(mappings.find((m) => m.csvColumn === 'first_name')?.crmField).toBe('firstName')
      expect(mappings.find((m) => m.csvColumn === 'last_name')?.crmField).toBe('lastName')
      expect(mappings.find((m) => m.csvColumn === 'job_title')?.crmField).toBe('jobTitle')
      expect(mappings.find((m) => m.csvColumn === 'lead_score')?.crmField).toBe('score')
      expect(mappings.find((m) => m.csvColumn === 'phone_number')?.crmField).toBe('phone')
    })

    it('maps Vietnamese phone abbreviations', () => {
      const mappings1 = autoMapColumns(['sdt'], 'contacts')
      expect(mappings1[0].crmField).toBe('phone')

      const mappings2 = autoMapColumns(['sđt'], 'contacts')
      expect(mappings2[0].crmField).toBe('phone')
    })

    it('returns empty crmField for unknown headers', () => {
      const mappings = autoMapColumns(['RandomColumn', 'xyzzy'], 'contacts')
      expect(mappings[0].crmField).toBe('')
      expect(mappings[1].crmField).toBe('')
    })

    it('is case-insensitive', () => {
      const mappings = autoMapColumns(['EMAIL', 'Phone', 'FIRSTNAME'], 'contacts')
      expect(mappings.find((m) => m.csvColumn === 'EMAIL')?.crmField).toBe('email')
      expect(mappings.find((m) => m.csvColumn === 'Phone')?.crmField).toBe('phone')
      expect(mappings.find((m) => m.csvColumn === 'FIRSTNAME')?.crmField).toBe('firstName')
    })

    it('sets default transform to trim', () => {
      const mappings = autoMapColumns(['Email'], 'contacts')
      expect(mappings[0].transform).toBe('trim')
    })
  })

  describe('autoMapColumns() — companies', () => {
    it('maps standard company headers', () => {
      const headers = ['Name', 'Domain', 'Industry', 'Phone', 'Email']
      const mappings = autoMapColumns(headers, 'companies')
      expect(mappings.find((m) => m.csvColumn === 'Name')?.crmField).toBe('name')
      expect(mappings.find((m) => m.csvColumn === 'Domain')?.crmField).toBe('domain')
      expect(mappings.find((m) => m.csvColumn === 'Industry')?.crmField).toBe('industry')
      expect(mappings.find((m) => m.csvColumn === 'Phone')?.crmField).toBe('phone')
      expect(mappings.find((m) => m.csvColumn === 'Email')?.crmField).toBe('email')
    })

    it('maps Vietnamese company headers', () => {
      const headers = ['Tên công ty', 'Ngành nghề', 'Địa chỉ', 'Mã số thuế']
      const mappings = autoMapColumns(headers, 'companies')
      expect(mappings.find((m) => m.csvColumn === 'Tên công ty')?.crmField).toBe('name')
      expect(mappings.find((m) => m.csvColumn === 'Ngành nghề')?.crmField).toBe('industry')
      expect(mappings.find((m) => m.csvColumn === 'Địa chỉ')?.crmField).toBe('address')
      expect(mappings.find((m) => m.csvColumn === 'Mã số thuế')?.crmField).toBe('taxCode')
    })

    it('maps tax code abbreviation', () => {
      const mappings = autoMapColumns(['mst'], 'companies')
      expect(mappings[0].crmField).toBe('taxCode')
    })

    it('maps company_name and tax_code variants', () => {
      const mappings = autoMapColumns(['company_name', 'tax_code'], 'companies')
      expect(mappings.find((m) => m.csvColumn === 'company_name')?.crmField).toBe('name')
      expect(mappings.find((m) => m.csvColumn === 'tax_code')?.crmField).toBe('taxCode')
    })

    it('maps Vietnamese location fields', () => {
      const headers = ['Thành phố', 'Tỉnh', 'Quốc gia']
      const mappings = autoMapColumns(headers, 'companies')
      expect(mappings.find((m) => m.csvColumn === 'Thành phố')?.crmField).toBe('city')
      expect(mappings.find((m) => m.csvColumn === 'Tỉnh')?.crmField).toBe('province')
      expect(mappings.find((m) => m.csvColumn === 'Quốc gia')?.crmField).toBe('country')
    })
  })
})
