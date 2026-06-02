// src/app/(dashboard)/analytics/reports/builder/page.tsx
// Report Builder Page

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  Save,
  Play,
  ArrowLeft,
  Plus,
  X,
  GripVertical,
  Eye,
} from 'lucide-react'

interface DataSource {
  id: string
  name: string
  type: string
}

interface Column {
  id: string
  field: string
  label: string
  type: string
  selected: boolean
}

export default function ReportBuilderPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [dataSources, setDataSources] = useState<DataSource[]>([])
  const [columns, setColumns] = useState<Column[]>([])

  // Report config
  const [reportName, setReportName] = useState('')
  const [reportDescription, setReportDescription] = useState('')
  const [selectedDataSource, setSelectedDataSource] = useState('')
  const [selectedColumns, setSelectedColumns] = useState<string[]>([])
  const [filters, setFilters] = useState<Array<{ field: string; operator: string; value: string }>>([])
  const [groupBy, setGroupBy] = useState('')
  const [sortBy, setSortBy] = useState('')
  const [sortOrder, setSortOrder] = useState('asc')

  useEffect(() => {
    fetchDataSources()
  }, [])

  useEffect(() => {
    if (selectedDataSource) {
      fetchColumns()
    }
  }, [selectedDataSource])

  const fetchDataSources = async () => {
    try {
      const response = await fetch('/api/analytics/reports/data-sources')
      if (response.ok) {
        const data = await response.json()
        setDataSources(data.data || [])
      } else {
        // Mock data sources
        setDataSources([
          { id: 'employees', name: 'Nhân viên', type: 'table' },
          { id: 'departments', name: 'Phòng ban', type: 'table' },
          { id: 'attendance', name: 'Chấm công', type: 'table' },
          { id: 'payroll', name: 'Bảng lương', type: 'table' },
          { id: 'performance', name: 'Đánh giá', type: 'table' },
        ])
      }
    } catch (error) {
      console.error('Error fetching data sources:', error)
    }
  }

  const fetchColumns = async () => {
    // Mock columns based on data source
    const columnsBySource: Record<string, Column[]> = {
      employees: [
        { id: '1', field: 'employeeCode', label: 'Mã NV', type: 'string', selected: true },
        { id: '2', field: 'fullName', label: 'Họ tên', type: 'string', selected: true },
        { id: '3', field: 'department', label: 'Phòng ban', type: 'string', selected: true },
        { id: '4', field: 'position', label: 'Chức vụ', type: 'string', selected: false },
        { id: '5', field: 'hireDate', label: 'Ngày vào', type: 'date', selected: false },
        { id: '6', field: 'status', label: 'Trạng thái', type: 'string', selected: true },
        { id: '7', field: 'gender', label: 'Giới tính', type: 'string', selected: false },
        { id: '8', field: 'email', label: 'Email', type: 'string', selected: false },
      ],
      departments: [
        { id: '1', field: 'code', label: 'Mã phòng', type: 'string', selected: true },
        { id: '2', field: 'name', label: 'Tên phòng', type: 'string', selected: true },
        { id: '3', field: 'manager', label: 'Trưởng phòng', type: 'string', selected: true },
        { id: '4', field: 'employeeCount', label: 'Số nhân viên', type: 'number', selected: true },
      ],
      attendance: [
        { id: '1', field: 'employeeName', label: 'Nhân viên', type: 'string', selected: true },
        { id: '2', field: 'date', label: 'Ngày', type: 'date', selected: true },
        { id: '3', field: 'checkIn', label: 'Giờ vào', type: 'time', selected: true },
        { id: '4', field: 'checkOut', label: 'Giờ ra', type: 'time', selected: true },
        { id: '5', field: 'status', label: 'Trạng thái', type: 'string', selected: true },
      ],
      payroll: [
        { id: '1', field: 'employeeName', label: 'Nhân viên', type: 'string', selected: true },
        { id: '2', field: 'baseSalary', label: 'Lương cơ bản', type: 'number', selected: true },
        { id: '3', field: 'allowances', label: 'Phụ cấp', type: 'number', selected: true },
        { id: '4', field: 'deductions', label: 'Khấu trừ', type: 'number', selected: true },
        { id: '5', field: 'netSalary', label: 'Thực nhận', type: 'number', selected: true },
      ],
      performance: [
        { id: '1', field: 'employeeName', label: 'Nhân viên', type: 'string', selected: true },
        { id: '2', field: 'period', label: 'Kỳ đánh giá', type: 'string', selected: true },
        { id: '3', field: 'score', label: 'Điểm', type: 'number', selected: true },
        { id: '4', field: 'rating', label: 'Xếp loại', type: 'string', selected: true },
      ],
    }

    setColumns(columnsBySource[selectedDataSource] || [])
    setSelectedColumns(
      (columnsBySource[selectedDataSource] || [])
        .filter((c) => c.selected)
        .map((c) => c.field)
    )
  }

  const toggleColumn = (field: string) => {
    setSelectedColumns((prev) =>
      prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field]
    )
  }

  const addFilter = () => {
    setFilters((prev) => [...prev, { field: '', operator: 'eq', value: '' }])
  }

  const removeFilter = (index: number) => {
    setFilters((prev) => prev.filter((_, i) => i !== index))
  }

  const updateFilter = (index: number, updates: Partial<typeof filters[0]>) => {
    setFilters((prev) =>
      prev.map((filter, i) => (i === index ? { ...filter, ...updates } : filter))
    )
  }

  const saveReport = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/analytics/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: reportName,
          description: reportDescription,
          dataSource: selectedDataSource,
          columns: selectedColumns,
          filters,
          groupBy,
          sortBy,
          sortOrder,
        }),
      })

      if (response.ok) {
        router.push('/analytics/reports')
      }
    } catch (error) {
      console.error('Error saving report:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Tạo báo cáo mới</h1>
            <p className="text-muted-foreground">
              Thiết kế báo cáo tùy chỉnh theo nhu cầu
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Eye className="h-4 w-4 mr-2" />
            Xem trước
          </Button>
          <Button onClick={saveReport} disabled={loading || !reportName}>
            <Save className="h-4 w-4 mr-2" />
            Lưu báo cáo
          </Button>
        </div>
      </div>

      {/* Steps */}
      <div className="flex items-center gap-2 mb-6">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <button
              onClick={() => setStep(s)}
              className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${
                step === s
                  ? 'bg-primary text-primary-foreground'
                  : step > s
                  ? 'bg-green-500 text-white'
                  : 'bg-muted'
              }`}
            >
              {s}
            </button>
            <span className={step === s ? 'font-medium' : 'text-muted-foreground'}>
              {s === 1 ? 'Thông tin cơ bản' : s === 2 ? 'Chọn dữ liệu' : 'Tùy chỉnh'}
            </span>
            {s < 3 && <div className="w-8 h-0.5 bg-muted" />}
          </div>
        ))}
      </div>

      {/* Step 1: Basic Info */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Thông tin cơ bản</CardTitle>
            <CardDescription>Đặt tên và mô tả cho báo cáo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tên báo cáo *</Label>
              <Input
                id="name"
                value={reportName}
                onChange={(e) => setReportName(e.target.value)}
                placeholder="VD: Báo cáo nhân sự quý 1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                placeholder="Mô tả ngắn về báo cáo..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Nguồn dữ liệu *</Label>
              <Select value={selectedDataSource} onValueChange={setSelectedDataSource}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn nguồn dữ liệu" />
                </SelectTrigger>
                <SelectContent>
                  {dataSources.map((source) => (
                    <SelectItem key={source.id} value={source.id}>
                      {source.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end">
              <Button
                onClick={() => setStep(2)}
                disabled={!reportName || !selectedDataSource}
              >
                Tiếp tục
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Select Data */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Chọn dữ liệu</CardTitle>
            <CardDescription>Chọn các cột muốn hiển thị trong báo cáo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {columns.map((column) => (
                <div
                  key={column.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedColumns.includes(column.field)
                      ? 'border-primary bg-primary/5'
                      : 'hover:bg-muted'
                  }`}
                  onClick={() => toggleColumn(column.field)}
                >
                  <div className="flex items-center gap-2">
                    <Checkbox checked={selectedColumns.includes(column.field)} />
                    <div>
                      <p className="font-medium text-sm">{column.label}</p>
                      <p className="text-xs text-muted-foreground">{column.type}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge>{selectedColumns.length}</Badge>
              cột được chọn
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                Quay lại
              </Button>
              <Button onClick={() => setStep(3)} disabled={selectedColumns.length === 0}>
                Tiếp tục
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Customize */}
      {step === 3 && (
        <div className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Bộ lọc</CardTitle>
                  <CardDescription>Lọc dữ liệu theo điều kiện</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={addFilter}>
                  <Plus className="h-4 w-4 mr-1" />
                  Thêm bộ lọc
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {filters.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Chưa có bộ lọc nào. Nhấn "Thêm bộ lọc" để bắt đầu.
                </p>
              ) : (
                filters.map((filter, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Select
                      value={filter.field}
                      onValueChange={(value) => updateFilter(index, { field: value })}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Chọn cột" />
                      </SelectTrigger>
                      <SelectContent>
                        {columns.map((col) => (
                          <SelectItem key={col.field} value={col.field}>
                            {col.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={filter.operator}
                      onValueChange={(value) => updateFilter(index, { operator: value })}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="eq">Bằng</SelectItem>
                        <SelectItem value="neq">Khác</SelectItem>
                        <SelectItem value="gt">Lớn hơn</SelectItem>
                        <SelectItem value="lt">Nhỏ hơn</SelectItem>
                        <SelectItem value="contains">Chứa</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      value={filter.value}
                      onChange={(e) => updateFilter(index, { value: e.target.value })}
                      placeholder="Giá trị"
                      className="flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFilter(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Sort & Group */}
          <Card>
            <CardHeader>
              <CardTitle>Sắp xếp & Nhóm</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nhóm theo</Label>
                  <Select value={groupBy} onValueChange={setGroupBy}>
                    <SelectTrigger>
                      <SelectValue placeholder="Không nhóm" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Không nhóm</SelectItem>
                      {columns.map((col) => (
                        <SelectItem key={col.field} value={col.field}>
                          {col.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Sắp xếp theo</Label>
                  <div className="flex gap-2">
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Chọn cột" />
                      </SelectTrigger>
                      <SelectContent>
                        {columns.map((col) => (
                          <SelectItem key={col.field} value={col.field}>
                            {col.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={sortOrder} onValueChange={setSortOrder}>
                      <SelectTrigger className="w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asc">Tăng dần</SelectItem>
                        <SelectItem value="desc">Giảm dần</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(2)}>
              Quay lại
            </Button>
            <div className="flex gap-2">
              <Button variant="outline">
                <Eye className="h-4 w-4 mr-2" />
                Xem trước
              </Button>
              <Button onClick={saveReport} disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                Lưu báo cáo
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
