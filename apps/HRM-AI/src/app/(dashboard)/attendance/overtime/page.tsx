// src/app/(dashboard)/attendance/overtime/page.tsx
// Overtime management page

"use client"

import { useState } from "react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import {
  Plus,
  Search,
  CalendarIcon,
  Check,
  X,
  Clock,
  MoreHorizontal,
  Trash2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { OvertimeForm } from "@/components/attendance/overtime-form"
import { DataTablePagination } from "@/components/common/data-table-pagination"
import {
  useOvertimeRequests,
  useCreateOvertime,
  useApproveOvertime,
  useRejectOvertime,
  useDeleteOvertime,
} from "@/hooks/use-overtime"
import { useDepartments } from "@/hooks/use-departments"
import { useToast } from "@/hooks/use-toast"
import { OT_STATUS_LABELS, OT_STATUS_COLORS, DAY_TYPE_LABELS } from "@/constants/attendance"
import type { OvertimeRequestFormData } from "@/lib/validations/attendance"

export default function OvertimePage() {
  const { toast } = useToast()
  const [search, setSearch] = useState("")
  const [departmentId, setDepartmentId] = useState("")
  const [status, setStatus] = useState("")
  const [dateFrom, setDateFrom] = useState<Date | undefined>()
  const [dateTo, setDateTo] = useState<Date | undefined>()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState("")

  const { data: departments } = useDepartments()
  const { data: overtimeData, isLoading } = useOvertimeRequests({
    search: search || undefined,
    departmentId: departmentId || undefined,
    status: (status as "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED") || undefined,
    dateFrom: dateFrom?.toISOString(),
    dateTo: dateTo?.toISOString(),
    page,
    pageSize,
  })

  const createOvertime = useCreateOvertime()
  const approveOvertime = useApproveOvertime()
  const rejectOvertime = useRejectOvertime()
  const deleteOvertime = useDeleteOvertime()

  const handleCreate = async (data: OvertimeRequestFormData) => {
    try {
      await createOvertime.mutateAsync(data)
      toast({ title: "Gửi đơn tăng ca thành công" })
      setIsFormOpen(false)
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể gửi đơn",
        variant: "destructive",
      })
    }
  }

  const handleApprove = async (id: string) => {
    try {
      await approveOvertime.mutateAsync({ id })
      toast({ title: "Duyệt đơn thành công" })
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể duyệt đơn",
        variant: "destructive",
      })
    }
  }

  const handleReject = async () => {
    if (!rejectingId || !rejectReason) return

    try {
      await rejectOvertime.mutateAsync({ id: rejectingId, reason: rejectReason })
      toast({ title: "Từ chối đơn thành công" })
      setRejectingId(null)
      setRejectReason("")
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể từ chối đơn",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async () => {
    if (!deletingId) return

    try {
      await deleteOvertime.mutateAsync(deletingId)
      toast({ title: "Xóa đơn thành công" })
      setDeletingId(null)
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể xóa đơn",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quản lý tăng ca</h1>
          <p className="text-muted-foreground">
            Duyệt và quản lý các đơn đăng ký tăng ca
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Tạo đơn tăng ca
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách đơn tăng ca</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Tìm theo tên nhân viên..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                className="pl-9"
              />
            </div>

            <Select value={departmentId || "all"} onValueChange={(v) => setDepartmentId(v === "all" ? "" : v)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Phòng ban" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                {departments?.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={status || "all"} onValueChange={(v) => setStatus(v === "all" ? "" : v)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                {Object.entries(OT_STATUS_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[140px]">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateFrom ? format(dateFrom, "dd/MM") : "Từ ngày"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateFrom}
                  onSelect={setDateFrom}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[140px]">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateTo ? format(dateTo, "dd/MM") : "Đến ngày"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateTo}
                  onSelect={setDateTo}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nhân viên</TableHead>
                  <TableHead>Ngày</TableHead>
                  <TableHead>Thời gian</TableHead>
                  <TableHead>Số giờ</TableHead>
                  <TableHead>Loại ngày</TableHead>
                  <TableHead>Hệ số</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="w-[120px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      Đang tải...
                    </TableCell>
                  </TableRow>
                ) : !overtimeData?.data.length ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Không có đơn tăng ca nào
                    </TableCell>
                  </TableRow>
                ) : (
                  overtimeData.data.map((ot) => (
                    <TableRow key={ot.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{ot.employee?.fullName}</div>
                          <div className="text-sm text-muted-foreground">
                            {ot.employee?.employeeCode}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(new Date(ot.date), "dd/MM/yyyy", { locale: vi })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(ot.startTime), "HH:mm")} -{" "}
                          {format(new Date(ot.endTime), "HH:mm")}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{Number(ot.plannedHours)}h</span>
                        {ot.actualHours && Number(ot.actualHours) !== Number(ot.plannedHours) && (
                          <span className="text-sm text-muted-foreground ml-1">
                            (thực tế: {Number(ot.actualHours)}h)
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{DAY_TYPE_LABELS[ot.dayType]}</TableCell>
                      <TableCell>
                        <span className="font-medium">{Math.round(Number(ot.multiplier) * 100)}%</span>
                        {ot.isNightShift && (
                          <Badge variant="outline" className="ml-1 text-xs">
                            Đêm
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={OT_STATUS_COLORS[ot.status]}>
                          {OT_STATUS_LABELS[ot.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {ot.status === "PENDING" && (
                            <>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-green-600"
                                onClick={() => handleApprove(ot.id)}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-red-600"
                                onClick={() => setRejectingId(ot.id)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => setDeletingId(ot.id)}
                                disabled={ot.status === "APPROVED"}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Xóa
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {overtimeData?.pagination && (
            <DataTablePagination
              page={page}
              pageSize={pageSize}
              total={overtimeData.pagination.total}
              totalPages={overtimeData.pagination.totalPages}
              onPageChange={setPage}
              onPageSizeChange={(size) => {
                setPageSize(size)
                setPage(1)
              }}
            />
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Tạo đơn tăng ca</DialogTitle>
          </DialogHeader>
          <OvertimeForm
            onSubmit={handleCreate}
            isLoading={createOvertime.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <AlertDialog open={!!rejectingId} onOpenChange={() => setRejectingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Từ chối đơn tăng ca</AlertDialogTitle>
            <AlertDialogDescription>
              Vui lòng nhập lý do từ chối:
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            placeholder="Lý do từ chối..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleReject} disabled={!rejectReason}>
              Từ chối
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa đơn tăng ca này?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Xóa</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
