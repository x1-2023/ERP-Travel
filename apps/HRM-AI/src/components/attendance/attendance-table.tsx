// src/components/attendance/attendance-table.tsx
// Attendance data table

"use client"

import { format } from "date-fns"
import { vi } from "date-fns/locale"
import {
  Clock,
  MapPin,
  MoreHorizontal,
  Edit,
  Trash2,
  AlertTriangle,
} from "lucide-react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Skeleton } from "@/components/ui/skeleton"
import { DataTablePagination } from "@/components/common/data-table-pagination"
import {
  ATTENDANCE_STATUS_LABELS,
  ATTENDANCE_STATUS_COLORS,
  ATTENDANCE_SOURCE_LABELS,
} from "@/constants/attendance"
import type { AttendanceWithRelations, PaginatedResponse } from "@/types"

interface AttendanceTableProps {
  data?: PaginatedResponse<AttendanceWithRelations>
  isLoading?: boolean
  onEdit?: (attendance: AttendanceWithRelations) => void
  onDelete?: (id: string) => void
  page: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
}

export function AttendanceTable({
  data,
  isLoading,
  onEdit,
  onDelete,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: AttendanceTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nhân viên</TableHead>
                <TableHead>Ngày</TableHead>
                <TableHead>Check in</TableHead>
                <TableHead>Check out</TableHead>
                <TableHead>Giờ công</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    )
  }

  if (!data?.data.length) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Không có dữ liệu chấm công
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nhân viên</TableHead>
              <TableHead>Ngày</TableHead>
              <TableHead>Check in</TableHead>
              <TableHead>Check out</TableHead>
              <TableHead>Giờ công</TableHead>
              <TableHead>OT</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.data.map((attendance) => (
              <TableRow key={attendance.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{attendance.employee?.fullName}</div>
                    <div className="text-sm text-muted-foreground">
                      {attendance.employee?.employeeCode}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span>
                      {format(new Date(attendance.date), "dd/MM/yyyy", { locale: vi })}
                    </span>
                    {attendance.anomalies && attendance.anomalies.length > 0 && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          </TooltipTrigger>
                          <TooltipContent>
                            {attendance.anomalies.length} bất thường
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {attendance.checkIn ? (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {format(new Date(attendance.checkIn), "HH:mm")}
                            {attendance.checkInLat && (
                              <MapPin className="h-3 w-3 text-muted-foreground" />
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="text-xs">
                            <div>Nguồn: {ATTENDANCE_SOURCE_LABELS[attendance.checkInSource || "MANUAL"]}</div>
                            {attendance.checkInAddress && (
                              <div className="max-w-[200px] truncate">{attendance.checkInAddress}</div>
                            )}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    <span className="text-muted-foreground">--:--</span>
                  )}
                  {attendance.lateMinutes && attendance.lateMinutes > 0 && (
                    <span className="ml-1 text-xs text-destructive">
                      (+{attendance.lateMinutes}p)
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  {attendance.checkOut ? (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {format(new Date(attendance.checkOut), "HH:mm")}
                            {attendance.checkOutLat && (
                              <MapPin className="h-3 w-3 text-muted-foreground" />
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="text-xs">
                            <div>Nguồn: {ATTENDANCE_SOURCE_LABELS[attendance.checkOutSource || "MANUAL"]}</div>
                            {attendance.checkOutAddress && (
                              <div className="max-w-[200px] truncate">{attendance.checkOutAddress}</div>
                            )}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    <span className="text-muted-foreground">--:--</span>
                  )}
                  {attendance.earlyMinutes && attendance.earlyMinutes > 0 && (
                    <span className="ml-1 text-xs text-orange-500">
                      (-{attendance.earlyMinutes}p)
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  {attendance.workHours ? (
                    <span className="font-medium">
                      {Number(attendance.workHours).toFixed(1)}h
                    </span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {attendance.otHours && Number(attendance.otHours) > 0 ? (
                    <span className="text-blue-600 font-medium">
                      {Number(attendance.otHours).toFixed(1)}h
                    </span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge className={ATTENDANCE_STATUS_COLORS[attendance.status]}>
                    {ATTENDANCE_STATUS_LABELS[attendance.status]}
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
                      <DropdownMenuItem onClick={() => onEdit?.(attendance)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Chỉnh sửa
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => onDelete?.(attendance.id)}
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

      {data.pagination && (
        <DataTablePagination
          page={page}
          pageSize={pageSize}
          total={data.pagination.total}
          totalPages={data.pagination.totalPages}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      )}
    </div>
  )
}
