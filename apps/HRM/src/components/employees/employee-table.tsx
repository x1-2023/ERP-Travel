"use client"

import { useRouter } from "next/navigation"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { SortableTableHead } from "@/components/ui/sortable-table-head"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Eye, Pencil, ChevronLeft, ChevronRight } from "lucide-react"
import { formatDate } from "@/lib/utils/format"

interface Employee {
  id: string
  employeeCode: string
  fullName: string
  status: string
  startDate: string | null
  department: { id: string; name: string } | null
  position: { id: string; name: string } | null
}

interface EmployeeTableProps {
  data: Employee[]
  total: number
  page: number
  totalPages: number
  isLoading: boolean
  sortColumn?: string
  sortOrder?: string
  onSort?: (column: string) => void
  onPageChange: (page: number) => void
}

const STATUS_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; className: string }> = {
  ACTIVE: { label: "Đang làm", variant: "default", className: "bg-green-500 hover:bg-green-600" },
  PROBATION: { label: "Thử việc", variant: "default", className: "bg-blue-500 hover:bg-blue-600" },
  ON_LEAVE: { label: "Nghỉ phép", variant: "default", className: "bg-yellow-500 hover:bg-yellow-600 text-black" },
  RESIGNED: { label: "Đã nghỉ", variant: "destructive", className: "" },
  TERMINATED: { label: "Chấm dứt", variant: "destructive", className: "" },
  SUSPENDED: { label: "Đình chỉ", variant: "default", className: "bg-orange-500 hover:bg-orange-600" },
}

export function EmployeeTable({
  data,
  total,
  page,
  totalPages,
  isLoading,
  sortColumn,
  sortOrder,
  onSort,
  onPageChange,
}: EmployeeTableProps) {
  const router = useRouter()

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Không tìm thấy nhân viên nào.
      </div>
    )
  }

  return (
    <div>
      <div className="text-sm text-muted-foreground mb-2">
        Đang hiển thị {data.length}/{total} nhân viên
      </div>
      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <SortableTableHead column="employeeCode" label="Mã NV" currentSort={sortColumn ?? null} currentOrder={(sortOrder as "asc" | "desc") || null} onSort={onSort ?? (() => {})} className="w-[120px]" />
              <SortableTableHead column="fullName" label="Họ Tên" currentSort={sortColumn ?? null} currentOrder={(sortOrder as "asc" | "desc") || null} onSort={onSort ?? (() => {})} />
              <TableHead className="hidden md:table-cell">Phòng / Chức Vụ</TableHead>
              <SortableTableHead column="status" label="Trạng Thái" currentSort={sortColumn ?? null} currentOrder={(sortOrder as "asc" | "desc") || null} onSort={onSort ?? (() => {})} />
              <SortableTableHead column="startDate" label="Ngày Vào" currentSort={sortColumn ?? null} currentOrder={(sortOrder as "asc" | "desc") || null} onSort={onSort ?? (() => {})} className="hidden sm:table-cell" />
              <TableHead className="w-[100px] text-right">Thao Tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((emp) => {
              const cfg = STATUS_CONFIG[emp.status] || STATUS_CONFIG.ACTIVE
              return (
                <TableRow
                  key={emp.id}
                  className="cursor-pointer hover:bg-slate-50"
                  onClick={() => router.push(`/employees/${emp.id}`)}
                >
                  <TableCell className="font-mono text-sm">{emp.employeeCode}</TableCell>
                  <TableCell className="font-medium">{emp.fullName}</TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    {[emp.department?.name, emp.position?.name].filter(Boolean).join(" / ") || "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={cfg.variant} className={cfg.className}>
                      {cfg.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {formatDate(emp.startDate)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/employees/${emp.id}`)
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/employees/${emp.id}/edit`)
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            Trang {page}/{totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
