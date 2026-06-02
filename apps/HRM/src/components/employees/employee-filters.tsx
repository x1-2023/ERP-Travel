"use client"

import { useQuery } from "@tanstack/react-query"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, RotateCcw } from "lucide-react"

interface Department {
  id: string
  name: string
  code: string
}

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Đang làm việc" },
  { value: "PROBATION", label: "Thử việc" },
  { value: "ON_LEAVE", label: "Nghỉ phép" },
  { value: "RESIGNED", label: "Đã nghỉ" },
  { value: "TERMINATED", label: "Đã chấm dứt" },
  { value: "SUSPENDED", label: "Tạm đình chỉ" },
]

interface EmployeeFiltersProps {
  search: string
  department: string
  status: string
  onSearchChange: (value: string) => void
  onDepartmentChange: (value: string) => void
  onStatusChange: (value: string) => void
  onReset: () => void
}

export function EmployeeFilters({
  search,
  department,
  status,
  onSearchChange,
  onDepartmentChange,
  onStatusChange,
  onReset,
}: EmployeeFiltersProps) {
  const { data: departments = [] } = useQuery<Department[]>({
    queryKey: ["departments"],
    queryFn: () => fetch("/api/departments").then((r) => r.json()),
  })

  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Tìm theo tên, mã NV, email..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
      <Select value={department} onValueChange={onDepartmentChange}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Phòng Ban" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tất cả phòng ban</SelectItem>
          {departments.map((dept) => (
            <SelectItem key={dept.id} value={dept.id}>
              {dept.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={status} onValueChange={onStatusChange}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Trạng Thái" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tất cả trạng thái</SelectItem>
          {STATUS_OPTIONS.map((s) => (
            <SelectItem key={s.value} value={s.value}>
              {s.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button variant="outline" onClick={onReset} className="gap-2">
        <RotateCcw className="h-4 w-4" />
        Reset
      </Button>
    </div>
  )
}
