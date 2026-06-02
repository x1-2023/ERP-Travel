"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatNumber } from "@/lib/utils/format"

interface TaxRow {
  stt: number
  fullName: string
  nationalId: string
  taxCode: string
  totalIncome: number
  totalDeductions: number
  taxableIncome: number
  pitPaid: number
  dependentCount: number
}

const fmt = formatNumber

export function TaxTable({ rows }: { rows: TaxRow[] }) {
  if (rows.length === 0) {
    return <p className="text-sm text-muted-foreground py-4 text-center">Không có dữ liệu</p>
  }

  const totalIncome = rows.reduce((s, r) => s + r.totalIncome, 0)
  const totalDeductions = rows.reduce((s, r) => s + r.totalDeductions, 0)
  const totalTaxable = rows.reduce((s, r) => s + r.taxableIncome, 0)
  const totalPIT = rows.reduce((s, r) => s + r.pitPaid, 0)

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">STT</TableHead>
            <TableHead>Họ Tên</TableHead>
            <TableHead>MST</TableHead>
            <TableHead className="text-right">Tổng TN</TableHead>
            <TableHead className="text-right">Giảm trừ</TableHead>
            <TableHead className="text-right">TN tính thuế</TableHead>
            <TableHead className="text-right">Thuế nộp</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.stt}>
              <TableCell>{row.stt}</TableCell>
              <TableCell className="font-medium">{row.fullName}</TableCell>
              <TableCell className="text-xs">{row.taxCode || row.nationalId}</TableCell>
              <TableCell className="text-right">{fmt(row.totalIncome)}</TableCell>
              <TableCell className="text-right">{fmt(row.totalDeductions)}</TableCell>
              <TableCell className="text-right">{fmt(row.taxableIncome)}</TableCell>
              <TableCell className="text-right font-medium">{fmt(row.pitPaid)}</TableCell>
            </TableRow>
          ))}
          <TableRow className="font-bold bg-muted/50">
            <TableCell colSpan={3}>TỔNG CỘNG</TableCell>
            <TableCell className="text-right">{fmt(totalIncome)}</TableCell>
            <TableCell className="text-right">{fmt(totalDeductions)}</TableCell>
            <TableCell className="text-right">{fmt(totalTaxable)}</TableCell>
            <TableCell className="text-right">{fmt(totalPIT)}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  )
}
