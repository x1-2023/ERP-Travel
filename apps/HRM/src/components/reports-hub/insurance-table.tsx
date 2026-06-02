"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatNumber } from "@/lib/utils/format"

interface InsuranceRow {
  stt: number
  fullName: string
  dateOfBirth: string
  gender: string
  nationalId: string
  insuranceCode: string
  salary: number
  fromDate?: string
  toDate?: string
}

const fmtCurrency = formatNumber

export function InsuranceTable({ rows, type }: { rows: InsuranceRow[]; type: "all" | "new" | "term" | "adjust" }) {
  if (rows.length === 0) {
    return <p className="text-sm text-muted-foreground py-4 text-center">Không có dữ liệu</p>
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">STT</TableHead>
            <TableHead>Họ Tên</TableHead>
            <TableHead>Ngày Sinh</TableHead>
            <TableHead className="w-16">GT</TableHead>
            <TableHead>Lương đóng BH</TableHead>
            <TableHead>{type === "term" ? "Đến ngày" : "Từ ngày"}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.stt}>
              <TableCell>{row.stt}</TableCell>
              <TableCell className="font-medium">{row.fullName}</TableCell>
              <TableCell>{row.dateOfBirth}</TableCell>
              <TableCell>{row.gender}</TableCell>
              <TableCell>{fmtCurrency(row.salary)}</TableCell>
              <TableCell>{type === "term" ? row.toDate : row.fromDate}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
