export interface ParsedRow {
  [key: string]: unknown
}

export async function parseExcel(buffer: Buffer): Promise<ParsedRow[]> {
  const XLSX = await import('xlsx')
  const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true })
  const sheetName = workbook.SheetNames[0]
  const sheet = workbook.Sheets[sheetName]

  const data = XLSX.utils.sheet_to_json(sheet, {
    raw: false,
    dateNF: 'yyyy-mm-dd',
  })

  return data as ParsedRow[]
}

export async function parseCsv(buffer: Buffer): Promise<ParsedRow[]> {
  const content = buffer.toString('utf-8')
  const lines = content.split('\n').filter(line => line.trim())

  if (lines.length < 2) return []

  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
  const rows: ParsedRow[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''))
    const row: ParsedRow = {}

    headers.forEach((header, index) => {
      row[header] = values[index] || null
    })

    rows.push(row)
  }

  return rows
}

export async function generateEmployeeTemplate(): Promise<Buffer> {
  const XLSX = await import('xlsx')
  const wb = XLSX.utils.book_new()
  const headers = ['Mã NV', 'Họ và tên', 'Email', 'Số điện thoại', 'Ngày sinh', 'Giới tính', 'Mã phòng ban', 'Chức vụ', 'Ngày vào làm', 'Lương cơ bản']
  const example = ['NV001', 'Nguyễn Văn A', 'nguyenvana@company.com', '0901234567', '1990-01-15', 'Nam', 'DEPT001', 'Nhân viên', '2024-01-01', '15000000']

  const ws = XLSX.utils.aoa_to_sheet([headers, example])
  ws['!cols'] = headers.map(() => ({ wch: 20 }))
  XLSX.utils.book_append_sheet(wb, ws, 'Nhân viên')

  return Buffer.from(XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }))
}

export async function generateAttendanceTemplate(): Promise<Buffer> {
  const XLSX = await import('xlsx')
  const wb = XLSX.utils.book_new()
  const headers = ['Mã NV', 'Ngày', 'Giờ vào', 'Giờ ra']
  const example = ['NV001', '2024-01-15', '08:00', '17:30']

  const ws = XLSX.utils.aoa_to_sheet([headers, example])
  ws['!cols'] = headers.map(() => ({ wch: 15 }))
  XLSX.utils.book_append_sheet(wb, ws, 'Chấm công')

  return Buffer.from(XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }))
}
