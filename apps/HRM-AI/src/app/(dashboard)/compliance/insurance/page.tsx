'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FileSpreadsheet, FileText, Download, Users, Building2, Calculator, RefreshCw } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

// ═══════════════════════════════════════════════════════════════
// INSURANCE COMPLIANCE PAGE
// ═══════════════════════════════════════════════════════════════

export default function InsuranceCompliancePage() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const queryClient = useQueryClient()
  const { toast } = useToast()

  // Fetch insurance summary
  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ['insurance-summary', selectedYear, selectedMonth],
    queryFn: async () => {
      const res = await fetch(`/api/compliance/insurance/summary?year=${selectedYear}&month=${selectedMonth}`)
      if (!res.ok) {
        // Return mock data for now
        return {
          totalEmployees: 150,
          employerTotal: 45_750_000,
          employeeTotal: 22_312_500,
          grandTotal: 68_062_500,
          breakdown: {
            socialInsurance: { employer: 35_250_000, employee: 16_500_000 },
            healthInsurance: { employer: 6_000_000, employee: 3_000_000 },
            unemploymentInsurance: { employer: 2_000_000, employee: 2_000_000 },
            accidentInsurance: { employer: 1_500_000, employee: 0 },
            unionFee: { employer: 1_000_000, employee: 812_500 },
          },
        }
      }
      const json = await res.json()
      return json.data ?? json
    },
  })

  // Fetch reports
  const { data: reports, isLoading: reportsLoading } = useQuery({
    queryKey: ['insurance-reports', selectedYear],
    queryFn: async () => {
      const res = await fetch(`/api/compliance/insurance/reports?year=${selectedYear}`)
      if (!res.ok) {
        return { reports: [] }
      }
      const json = await res.json()
      return json.data ?? json
    },
  })

  // Generate report mutation
  const generateReport = useMutation({
    mutationFn: async ({ reportType, month, year }: { reportType: string; month: number; year: number }) => {
      const res = await fetch('/api/compliance/insurance/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportType, month, year }),
      })
      if (!res.ok) throw new Error('Failed to generate report')
      return res.json()
    },
    onSuccess: () => {
      toast({
        title: 'Thành công',
        description: 'Báo cáo đã được tạo',
      })
      queryClient.invalidateQueries({ queryKey: ['insurance-reports'] })
    },
    onError: (error: Error) => {
      toast({
        title: 'Lỗi',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i)
  const months = Array.from({ length: 12 }, (_, i) => i + 1)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quản lý BHXH</h1>
          <p className="text-muted-foreground">Bảo hiểm Xã hội, Y tế, Thất nghiệp</p>
        </div>

        <div className="flex items-center gap-2">
          <Select value={selectedMonth.toString()} onValueChange={(v) => setSelectedMonth(parseInt(v))}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Tháng" />
            </SelectTrigger>
            <SelectContent>
              {months.map((m) => (
                <SelectItem key={m} value={m.toString()}>
                  Tháng {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Năm" />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={y.toString()}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tổng NV tham gia</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.totalEmployees || 0}</div>
            <p className="text-xs text-muted-foreground">người lao động</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">BHXH Công ty</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary?.employerTotal || 0)}</div>
            <p className="text-xs text-muted-foreground">21.5% lương đóng BHXH</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">BHXH Nhân viên</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary?.employeeTotal || 0)}</div>
            <p className="text-xs text-muted-foreground">10.5% lương đóng BHXH</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tổng cộng</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{formatCurrency(summary?.grandTotal || 0)}</div>
            <p className="text-xs text-muted-foreground">
              phải nộp tháng {selectedMonth}/{selectedYear}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Insurance Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Chi tiết các khoản đóng BHXH</CardTitle>
          <CardDescription>Phân tích theo loại bảo hiểm</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            <div className="space-y-2 p-4 rounded-lg bg-blue-50 dark:bg-blue-950">
              <div className="text-sm font-medium text-blue-600">BHXH</div>
              <div className="text-lg font-bold">{formatCurrency(summary?.breakdown?.socialInsurance?.employer || 0)}</div>
              <div className="text-xs text-muted-foreground">Công ty: 17.5%</div>
              <div className="text-sm">{formatCurrency(summary?.breakdown?.socialInsurance?.employee || 0)}</div>
              <div className="text-xs text-muted-foreground">NV: 8%</div>
            </div>

            <div className="space-y-2 p-4 rounded-lg bg-green-50 dark:bg-green-950">
              <div className="text-sm font-medium text-green-600">BHYT</div>
              <div className="text-lg font-bold">{formatCurrency(summary?.breakdown?.healthInsurance?.employer || 0)}</div>
              <div className="text-xs text-muted-foreground">Công ty: 3%</div>
              <div className="text-sm">{formatCurrency(summary?.breakdown?.healthInsurance?.employee || 0)}</div>
              <div className="text-xs text-muted-foreground">NV: 1.5%</div>
            </div>

            <div className="space-y-2 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-950">
              <div className="text-sm font-medium text-yellow-600">BHTN</div>
              <div className="text-lg font-bold">{formatCurrency(summary?.breakdown?.unemploymentInsurance?.employer || 0)}</div>
              <div className="text-xs text-muted-foreground">Công ty: 1%</div>
              <div className="text-sm">{formatCurrency(summary?.breakdown?.unemploymentInsurance?.employee || 0)}</div>
              <div className="text-xs text-muted-foreground">NV: 1%</div>
            </div>

            <div className="space-y-2 p-4 rounded-lg bg-red-50 dark:bg-red-950">
              <div className="text-sm font-medium text-red-600">BHTNLĐ-BNN</div>
              <div className="text-lg font-bold">{formatCurrency(summary?.breakdown?.accidentInsurance?.employer || 0)}</div>
              <div className="text-xs text-muted-foreground">Công ty: 0.5%</div>
              <div className="text-sm">0 đ</div>
              <div className="text-xs text-muted-foreground">NV: 0%</div>
            </div>

            <div className="space-y-2 p-4 rounded-lg bg-purple-50 dark:bg-purple-950">
              <div className="text-sm font-medium text-purple-600">Công đoàn</div>
              <div className="text-lg font-bold">{formatCurrency(summary?.breakdown?.unionFee?.employer || 0)}</div>
              <div className="text-xs text-muted-foreground">Công ty: 2%</div>
              <div className="text-sm">{formatCurrency(summary?.breakdown?.unionFee?.employee || 0)}</div>
              <div className="text-xs text-muted-foreground">NV: 1%</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="reports">
        <TabsList>
          <TabsTrigger value="reports">Báo cáo BHXH</TabsTrigger>
          <TabsTrigger value="employees">Danh sách NV</TabsTrigger>
          <TabsTrigger value="adjustments">Điều chỉnh</TabsTrigger>
        </TabsList>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">
              Báo cáo BHXH tháng {selectedMonth}/{selectedYear}
            </h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() =>
                  generateReport.mutate({
                    reportType: 'D02_TS',
                    month: selectedMonth,
                    year: selectedYear,
                  })
                }
                disabled={generateReport.isPending}
              >
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Tạo D02-TS
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  generateReport.mutate({
                    reportType: 'C12_TS',
                    month: selectedMonth,
                    year: selectedYear,
                  })
                }
                disabled={generateReport.isPending}
              >
                <FileText className="mr-2 h-4 w-4" />
                Tạo C12-TS
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  generateReport.mutate({
                    reportType: 'D03_TS',
                    month: selectedMonth,
                    year: selectedYear,
                  })
                }
                disabled={generateReport.isPending}
              >
                <FileText className="mr-2 h-4 w-4" />
                Tạo D03-TS
              </Button>
            </div>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã báo cáo</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead>Kỳ</TableHead>
                  <TableHead>Số NV</TableHead>
                  <TableHead>Tổng tiền</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports?.reports?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground">
                      Chưa có báo cáo nào
                    </TableCell>
                  </TableRow>
                ) : (
                  reports?.reports?.map((report: Record<string, unknown>) => (
                    <TableRow key={report.id as string}>
                      <TableCell className="font-mono">{report.reportCode as string}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{(report.reportType as string).replace('_', '-')}</Badge>
                      </TableCell>
                      <TableCell>
                        {report.periodMonth as number}/{report.periodYear as number}
                      </TableCell>
                      <TableCell>{report.totalEmployees as number}</TableCell>
                      <TableCell>
                        {formatCurrency(
                          Number(report.totalSiAmount) + Number(report.totalHiAmount) + Number(report.totalUiAmount)
                        )}
                      </TableCell>
                      <TableCell>
                        <ReportStatusBadge status={report.status as string} />
                      </TableCell>
                      <TableCell>{formatDate(new Date(report.createdAt as string))}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              window.open(`/api/compliance/insurance/reports/${report.id}/export?format=xlsx`)
                            }
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Employees Tab */}
        <TabsContent value="employees">
          <InsuranceEmployeeList month={selectedMonth} year={selectedYear} />
        </TabsContent>

        {/* Adjustments Tab */}
        <TabsContent value="adjustments">
          <InsuranceAdjustments month={selectedMonth} year={selectedYear} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════

function ReportStatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    DRAFT: { label: 'Nháp', variant: 'outline' },
    PENDING_REVIEW: { label: 'Chờ duyệt', variant: 'secondary' },
    APPROVED: { label: 'Đã duyệt', variant: 'default' },
    SUBMITTED: { label: 'Đã nộp', variant: 'default' },
    REJECTED: { label: 'Từ chối', variant: 'destructive' },
    COMPLETED: { label: 'Hoàn thành', variant: 'default' },
  }

  const config = statusConfig[status] || { label: status, variant: 'outline' as const }

  return <Badge variant={config.variant}>{config.label}</Badge>
}

function InsuranceEmployeeList({ month, year }: { month: number; year: number }) {
  const { data: employees, isLoading } = useQuery({
    queryKey: ['insurance-employees', year, month],
    queryFn: async () => {
      // Return mock data for now
      return {
        employees: [
          {
            id: '1',
            employeeCode: 'NV001',
            fullName: 'Nguyễn Văn A',
            department: 'Phòng IT',
            insuranceSalary: 15_000_000,
            siEmployee: 1_200_000,
            siEmployer: 2_625_000,
            hiEmployee: 225_000,
            hiEmployer: 450_000,
            uiEmployee: 150_000,
            uiEmployer: 150_000,
          },
          {
            id: '2',
            employeeCode: 'NV002',
            fullName: 'Trần Thị B',
            department: 'Phòng Kế toán',
            insuranceSalary: 12_000_000,
            siEmployee: 960_000,
            siEmployer: 2_100_000,
            hiEmployee: 180_000,
            hiEmployer: 360_000,
            uiEmployee: 120_000,
            uiEmployer: 120_000,
          },
        ],
      }
    },
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Danh sách nhân viên tham gia BHXH</CardTitle>
        <CardDescription>
          Tháng {month}/{year}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã NV</TableHead>
              <TableHead>Họ tên</TableHead>
              <TableHead>Phòng ban</TableHead>
              <TableHead className="text-right">Lương đóng BH</TableHead>
              <TableHead className="text-right">BHXH NV</TableHead>
              <TableHead className="text-right">BHXH CT</TableHead>
              <TableHead className="text-right">BHYT NV</TableHead>
              <TableHead className="text-right">BHTN NV</TableHead>
              <TableHead className="text-right">Tổng</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees?.employees?.map((emp: Record<string, unknown>) => (
              <TableRow key={emp.id as string}>
                <TableCell className="font-mono">{emp.employeeCode as string}</TableCell>
                <TableCell>{emp.fullName as string}</TableCell>
                <TableCell>{emp.department as string}</TableCell>
                <TableCell className="text-right">{formatCurrency(emp.insuranceSalary as number)}</TableCell>
                <TableCell className="text-right">{formatCurrency(emp.siEmployee as number)}</TableCell>
                <TableCell className="text-right">{formatCurrency(emp.siEmployer as number)}</TableCell>
                <TableCell className="text-right">{formatCurrency(emp.hiEmployee as number)}</TableCell>
                <TableCell className="text-right">{formatCurrency(emp.uiEmployee as number)}</TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(
                    (emp.siEmployee as number) +
                      (emp.siEmployer as number) +
                      (emp.hiEmployee as number) +
                      (emp.hiEmployer as number) +
                      (emp.uiEmployee as number) +
                      (emp.uiEmployer as number)
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function InsuranceAdjustments({ month, year }: { month: number; year: number }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Điều chỉnh BHXH</CardTitle>
        <CardDescription>
          Tăng mới, giảm, thay đổi mức đóng - Tháng {month}/{year}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-green-200 bg-green-50 dark:bg-green-950">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-green-700">Tăng mới</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">5</div>
              <p className="text-xs text-green-600">nhân viên mới tham gia</p>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-red-50 dark:bg-red-950">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-red-700">Giảm</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-700">2</div>
              <p className="text-xs text-red-600">nhân viên nghỉ việc</p>
            </CardContent>
          </Card>

          <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-yellow-700">Thay đổi mức</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-700">8</div>
              <p className="text-xs text-yellow-600">điều chỉnh lương đóng BH</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6">
          <h4 className="text-sm font-medium mb-4">Chi tiết điều chỉnh</h4>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã NV</TableHead>
                <TableHead>Họ tên</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead>Ngày hiệu lực</TableHead>
                <TableHead className="text-right">Mức cũ</TableHead>
                <TableHead className="text-right">Mức mới</TableHead>
                <TableHead>Ghi chú</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-mono">NV003</TableCell>
                <TableCell>Lê Văn C</TableCell>
                <TableCell>
                  <Badge variant="default" className="bg-green-500">
                    Tăng mới
                  </Badge>
                </TableCell>
                <TableCell>01/01/2024</TableCell>
                <TableCell className="text-right">-</TableCell>
                <TableCell className="text-right">{formatCurrency(10_000_000)}</TableCell>
                <TableCell>Nhân viên mới</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono">NV001</TableCell>
                <TableCell>Nguyễn Văn A</TableCell>
                <TableCell>
                  <Badge variant="secondary">Thay đổi</Badge>
                </TableCell>
                <TableCell>01/01/2024</TableCell>
                <TableCell className="text-right">{formatCurrency(12_000_000)}</TableCell>
                <TableCell className="text-right">{formatCurrency(15_000_000)}</TableCell>
                <TableCell>Tăng lương</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
