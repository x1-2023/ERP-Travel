"use client"

import { useState } from "react"
import Link from "next/link"
import { Plus, Upload, MoreHorizontal, Eye, Pencil, Trash2 } from "lucide-react"
import { useEmployees, useDeleteEmployee } from "@/hooks/use-employees"
import { useDepartments } from "@/hooks/use-departments"
import { Button } from "@/components/ui/button"
import { ExportButton } from "@/components/common/export-button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/shared/page-header"
import { LoadingSpinner } from "@/components/shared/loading-spinner"
import { EmptyState } from "@/components/shared/empty-state"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { EMPLOYEE_STATUS_LABELS, EMPLOYEE_STATUS_COLORS } from "@/lib/constants"
import type { EmployeeFilters } from "@/types"

export default function EmployeesPage() {
  const [filters, setFilters] = useState<EmployeeFilters>({
    page: 1,
    pageSize: 20,
  })
  const [search, setSearch] = useState("")
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data, isLoading } = useEmployees(filters)
  const { data: departments } = useDepartments()
  const deleteEmployee = useDeleteEmployee()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setFilters((prev) => ({ ...prev, search, page: 1 }))
  }

  const handleDelete = async () => {
    if (deleteId) {
      await deleteEmployee.mutateAsync(deleteId)
      setDeleteId(null)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Nhân viên" description="Quản lý danh sách nhân viên">
        <ExportButton
          endpoint="/api/admin/export/employees"
          params={{ departmentId: filters.departmentId, status: filters.status }}
          label="Xuất Excel"
          fileName="danh-sach-nhan-vien.xlsx"
        />
        <Link href="/employees/import">
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Import Excel
          </Button>
        </Link>
        <Link href="/employees/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Thêm mới
          </Button>
        </Link>
      </PageHeader>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <Input
            placeholder="Tìm theo tên, mã NV, SĐT..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
          <Button type="submit" variant="secondary">
            Tìm kiếm
          </Button>
        </form>

        <Select
          value={filters.departmentId || "all"}
          onValueChange={(value) =>
            setFilters((prev) => ({
              ...prev,
              departmentId: value === "all" ? undefined : value,
              page: 1,
            }))
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Phòng ban" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả phòng ban</SelectItem>
            {departments?.map((dept) => (
              <SelectItem key={dept.id} value={dept.id}>
                {dept.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.status || "all"}
          onValueChange={(value) =>
            setFilters((prev) => ({
              ...prev,
              status: value === "all" ? undefined : (value as EmployeeFilters["status"]),
              page: 1,
            }))
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            {Object.entries(EMPLOYEE_STATUS_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : !data?.data.length ? (
        <EmptyState
          title="Chưa có nhân viên"
          description="Bắt đầu bằng cách thêm nhân viên mới hoặc import từ Excel"
          action={
            <Link href="/employees/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Thêm nhân viên
              </Button>
            </Link>
          }
        />
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã NV</TableHead>
                  <TableHead>Họ tên</TableHead>
                  <TableHead>Phòng ban</TableHead>
                  <TableHead>Chức danh</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.data.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium">
                      {employee.employeeCode}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{employee.fullName}</p>
                        <p className="text-sm text-muted-foreground">
                          {employee.workEmail || employee.phone}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{employee.department?.name || "-"}</TableCell>
                    <TableCell>{employee.position?.name || "-"}</TableCell>
                    <TableCell>
                      <Badge
                        className={EMPLOYEE_STATUS_COLORS[employee.status]}
                        variant="secondary"
                      >
                        {EMPLOYEE_STATUS_LABELS[employee.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <Link href={`/employees/${employee.id}`}>
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              Xem chi tiết
                            </DropdownMenuItem>
                          </Link>
                          <Link href={`/employees/${employee.id}/edit`}>
                            <DropdownMenuItem>
                              <Pencil className="mr-2 h-4 w-4" />
                              Chỉnh sửa
                            </DropdownMenuItem>
                          </Link>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setDeleteId(employee.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Xóa
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Hiển thị {data.data.length} / {data.pagination.total} nhân viên
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={filters.page === 1}
                onClick={() =>
                  setFilters((prev) => ({ ...prev, page: prev.page! - 1 }))
                }
              >
                Trước
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={filters.page === data.pagination.totalPages}
                onClick={() =>
                  setFilters((prev) => ({ ...prev, page: prev.page! + 1 }))
                }
              >
                Sau
              </Button>
            </div>
          </div>
        </>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Xóa nhân viên"
        description="Bạn có chắc chắn muốn xóa nhân viên này? Hành động này không thể hoàn tác."
        confirmText="Xóa"
        variant="destructive"
        onConfirm={handleDelete}
        loading={deleteEmployee.isPending}
      />
    </div>
  )
}
