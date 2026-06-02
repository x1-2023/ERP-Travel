export async function createExcelBuffer(data: Record<string, unknown>[], sheetName = 'Sheet1'): Promise<Buffer> {
  const XLSX = await import('xlsx')
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(data)
  XLSX.utils.book_append_sheet(wb, ws, sheetName)
  return Buffer.from(XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }))
}

export function createCsvBuffer(data: Record<string, unknown>[]): Buffer {
  if (data.length === 0) return Buffer.from('')
  const headers = Object.keys(data[0])
  const lines = [
    headers.join(','),
    ...data.map(row =>
      headers.map(h => {
        const val = row[h]
        const str = val == null ? '' : String(val)
        return str.includes(',') ? `"${str}"` : str
      }).join(',')
    ),
  ]
  return Buffer.from(lines.join('\n'), 'utf-8')
}
