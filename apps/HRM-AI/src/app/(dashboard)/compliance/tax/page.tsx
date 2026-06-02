'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calculator, Users, FileText, Download, Plus, AlertTriangle, CheckCircle } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

// ═══════════════════════════════════════════════════════════════
// TAX COMPLIANCE PAGE
// ═══════════════════════════════════════════════════════════════

export default function TaxCompliancePage() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [calculatorOpen, setCalculatorOpen] = useState(false)
  const queryClient = useQueryClient()
  const { toast } = useToast()

  // Fetch tax summary
  const { data: summary } = useQuery({
    queryKey: ['tax-summary', selectedYear],
    queryFn: async () => {
      const res = await fetch(`/api/compliance/tax/summary?year=${selectedYear}`)
      if (!res.ok) throw new Error('Failed to fetch')
      const json = await res.json()
      return json.data
    },
  })

  // Fetch settlements
  const { data: settlements } = useQuery({
    queryKey: ['tax-settlements', selectedYear],
    queryFn: async () => {
      const res = await fetch(`/api/compliance/tax/settlements?year=${selectedYear}`)
      if (!res.ok) throw new Error('Failed to fetch')
      const json = await res.json()
      return json.data
    },
  })

  // Fetch dependents
  const { data: dependents } = useQuery({
    queryKey: ['dependents'],
    queryFn: async () => {
      const res = await fetch('/api/compliance/tax/dependents')
      if (!res.ok) throw new Error('Failed to fetch')
      const json = await res.json()
      return json.data
    },
  })

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quản lý Thuế TNCN</h1>
          <p className="text-muted-foreground">Thuế Thu nhập Cá nhân - Quyết toán năm {selectedYear}</p>
        </div>

        <div className="flex items-center gap-2">
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

          <TaxCalculatorDialog open={calculatorOpen} onOpenChange={setCalculatorOpen} />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tổng NV quyết toán</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.totalEmployees || 0}</div>
            <p className="text-xs text-muted-foreground">năm {selectedYear}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Thuế phải nộp</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary?.totalTaxAmount || 0)}</div>
            <p className="text-xs text-muted-foreground">tổng thuế TNCN</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Thuế đã nộp</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(summary?.totalTaxPaid || 0)}</div>
            <p className="text-xs text-muted-foreground">đã khấu trừ hàng tháng</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Chênh lệch</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${(summary?.totalDifference || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}
            >
              {formatCurrency(Math.abs(summary?.totalDifference || 0))}
            </div>
            <p className="text-xs text-muted-foreground">
              {(summary?.totalDifference || 0) > 0 ? 'còn phải nộp' : 'được hoàn'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tax Brackets Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Biểu thuế lũy tiến 7 bậc</CardTitle>
          <CardDescription>Áp dụng cho thu nhập từ tiền lương, tiền công</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-7">
            {[
              { range: '≤ 5 triệu', rate: '5%', bracket: 1 },
              { range: '5-10 triệu', rate: '10%', bracket: 2 },
              { range: '10-18 triệu', rate: '15%', bracket: 3 },
              { range: '18-32 triệu', rate: '20%', bracket: 4 },
              { range: '32-52 triệu', rate: '25%', bracket: 5 },
              { range: '52-80 triệu', rate: '30%', bracket: 6 },
              { range: '> 80 triệu', rate: '35%', bracket: 7 },
            ].map((bracket) => {
              const bracketData = summary?.brackets?.find((b: { bracket: number }) => b.bracket === bracket.bracket)
              return (
                <div key={bracket.bracket} className="text-center p-3 rounded-lg bg-muted">
                  <div className="text-lg font-bold text-primary">{bracket.rate}</div>
                  <div className="text-xs text-muted-foreground">{bracket.range}</div>
                  <div className="mt-2 text-sm font-medium">{bracketData?.count || 0} NV</div>
                </div>
              )
            })}
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            <p>• Giảm trừ bản thân: 11.000.000 đ/tháng (132.000.000 đ/năm)</p>
            <p>• Giảm trừ người phụ thuộc: 4.400.000 đ/người/tháng (52.800.000 đ/người/năm)</p>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="settlements">
        <TabsList>
          <TabsTrigger value="settlements">Quyết toán</TabsTrigger>
          <TabsTrigger value="dependents">Người phụ thuộc</TabsTrigger>
          <TabsTrigger value="reports">Báo cáo</TabsTrigger>
        </TabsList>

        {/* Settlements Tab */}
        <TabsContent value="settlements" className="space-y-4">
          <SettlementList year={selectedYear} />
        </TabsContent>

        {/* Dependents Tab */}
        <TabsContent value="dependents">
          <DependentList dependentSummary={dependents} />
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports">
          <TaxReports year={selectedYear} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// TAX CALCULATOR DIALOG
// ═══════════════════════════════════════════════════════════════

function TaxCalculatorDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [grossSalary, setGrossSalary] = useState('')
  const [dependents, setDependents] = useState('0')
  const [insurance, setInsurance] = useState('')
  const [result, setResult] = useState<{
    taxableGrossIncome: number
    deductions: { personal: number; dependents: number; insurance: number }
    taxableIncome: number
    taxAmount: number
    effectiveRate: number
    brackets: Array<{ level: number; income: number; tax: number; rate: number }>
  } | null>(null)

  const calculate = () => {
    const gross = parseFloat(grossSalary) || 0
    const depCount = parseInt(dependents) || 0
    const ins = parseFloat(insurance) || gross * 0.105 // Default 10.5%

    // Deductions
    const personalDeduction = 11_000_000
    const dependentDeduction = 4_400_000 * depCount
    const totalDeductions = personalDeduction + dependentDeduction + ins

    // Taxable income
    const taxableIncome = Math.max(0, gross - totalDeductions)

    // Calculate tax using 7 brackets
    const brackets = [
      { level: 1, min: 0, max: 5_000_000, rate: 0.05 },
      { level: 2, min: 5_000_000, max: 10_000_000, rate: 0.1 },
      { level: 3, min: 10_000_000, max: 18_000_000, rate: 0.15 },
      { level: 4, min: 18_000_000, max: 32_000_000, rate: 0.2 },
      { level: 5, min: 32_000_000, max: 52_000_000, rate: 0.25 },
      { level: 6, min: 52_000_000, max: 80_000_000, rate: 0.3 },
      { level: 7, min: 80_000_000, max: Infinity, rate: 0.35 },
    ]

    let remainingIncome = taxableIncome
    let totalTax = 0
    const bracketDetails = []

    for (const bracket of brackets) {
      if (remainingIncome <= 0) break

      const bracketSize = bracket.max - bracket.min
      const incomeInBracket = Math.min(remainingIncome, bracketSize)
      const taxInBracket = incomeInBracket * bracket.rate

      if (incomeInBracket > 0) {
        bracketDetails.push({
          level: bracket.level,
          income: incomeInBracket,
          tax: taxInBracket,
          rate: bracket.rate,
        })
      }

      totalTax += taxInBracket
      remainingIncome -= incomeInBracket
    }

    setResult({
      taxableGrossIncome: gross,
      deductions: {
        personal: personalDeduction,
        dependents: dependentDeduction,
        insurance: ins,
      },
      taxableIncome,
      taxAmount: totalTax,
      effectiveRate: gross > 0 ? totalTax / gross : 0,
      brackets: bracketDetails,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Calculator className="mr-2 h-4 w-4" />
          Tính thuế TNCN
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Tính thuế Thu nhập Cá nhân</DialogTitle>
          <DialogDescription>Nhập thông tin để tính thuế TNCN hàng tháng</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Lương Gross (VNĐ)</Label>
            <Input
              type="number"
              placeholder="20,000,000"
              value={grossSalary}
              onChange={(e) => setGrossSalary(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Số người phụ thuộc</Label>
            <Select value={dependents} onValueChange={setDependents}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[0, 1, 2, 3, 4, 5].map((n) => (
                  <SelectItem key={n} value={n.toString()}>
                    {n} người
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>BHXH đã đóng (nếu khác)</Label>
            <Input
              type="number"
              placeholder="Tự động tính 10.5%"
              value={insurance}
              onChange={(e) => setInsurance(e.target.value)}
            />
          </div>

          <Button onClick={calculate} className="w-full">
            Tính thuế
          </Button>

          {result && (
            <Card>
              <CardContent className="pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Thu nhập chịu thuế:</span>
                  <span className="font-medium">{formatCurrency(result.taxableGrossIncome)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Giảm trừ bản thân:</span>
                  <span className="font-medium">-{formatCurrency(result.deductions?.personal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Giảm trừ NPT:</span>
                  <span className="font-medium">-{formatCurrency(result.deductions?.dependents)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Giảm trừ BHXH:</span>
                  <span className="font-medium">-{formatCurrency(result.deductions?.insurance)}</span>
                </div>
                <hr />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Thu nhập tính thuế:</span>
                  <span className="font-medium">{formatCurrency(result.taxableIncome)}</span>
                </div>

                {/* Bracket details */}
                {result.brackets.length > 0 && (
                  <div className="mt-2 text-xs space-y-1">
                    {result.brackets.map((b) => (
                      <div key={b.level} className="flex justify-between text-muted-foreground">
                        <span>
                          Bậc {b.level} ({(b.rate * 100).toFixed(0)}%):
                        </span>
                        <span>
                          {formatCurrency(b.income)} × {(b.rate * 100).toFixed(0)}% = {formatCurrency(b.tax)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <hr />
                <div className="flex justify-between text-lg">
                  <span className="font-medium">Thuế TNCN:</span>
                  <span className="font-bold text-primary">{formatCurrency(result.taxAmount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Thuế suất thực tế:</span>
                  <span>{((result.effectiveRate || 0) * 100).toFixed(2)}%</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ═══════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════

function SettlementList({ year }: { year: number }) {
  const { data } = useQuery({
    queryKey: ['tax-settlements-list', year],
    queryFn: async () => {
      const res = await fetch(`/api/compliance/tax/settlements?year=${year}`)
      if (!res.ok) throw new Error('Failed to fetch')
      const json = await res.json()
      return json.data?.settlements || []
    },
  })

  const settlementList = data || []

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quyết toán thuế năm {year}</CardTitle>
        <CardDescription>Danh sách nhân viên quyết toán thuế TNCN</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã NV</TableHead>
              <TableHead>Họ tên</TableHead>
              <TableHead className="text-right">Tổng TN</TableHead>
              <TableHead className="text-right">TN tính thuế</TableHead>
              <TableHead className="text-right">Thuế phải nộp</TableHead>
              <TableHead className="text-right">Thuế đã nộp</TableHead>
              <TableHead className="text-right">Chênh lệch</TableHead>
              <TableHead>Trạng thái</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {settlementList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                  Chưa có dữ liệu quyết toán
                </TableCell>
              </TableRow>
            ) : (
              settlementList.map((s: { id: string; employeeCode: string; fullName: string; totalIncome: number; taxableIncome: number; taxAmount: number; taxPaid: number; difference: number; status: string }) => (
                <TableRow key={s.id}>
                  <TableCell className="font-mono">{s.employeeCode}</TableCell>
                  <TableCell>{s.fullName}</TableCell>
                  <TableCell className="text-right">{formatCurrency(s.totalIncome)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(s.taxableIncome)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(s.taxAmount)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(s.taxPaid)}</TableCell>
                  <TableCell className={`text-right font-medium ${s.difference > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {s.difference > 0 ? '+' : ''}
                    {formatCurrency(s.difference)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={s.status === 'COMPLETED' || s.status === 'FINALIZED' || s.status === 'SUBMITTED' ? 'default' : 'secondary'}>
                      {s.status === 'COMPLETED' || s.status === 'SUBMITTED' ? 'Hoàn thành' : s.status === 'FINALIZED' ? 'Đã chốt' : 'Chờ xử lý'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function DependentList({ dependentSummary }: { dependentSummary?: { total: number; byType: Record<string, number> } }) {
  const { data: depData } = useQuery({
    queryKey: ['dependents-list'],
    queryFn: async () => {
      const res = await fetch('/api/compliance/tax/dependents')
      if (!res.ok) throw new Error('Failed to fetch')
      const json = await res.json()
      return json.data
    },
  })

  const dependentList = depData?.dependents || []
  const summary = depData || dependentSummary

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Người phụ thuộc</CardTitle>
          <CardDescription>Quản lý thông tin người phụ thuộc để giảm trừ thuế</CardDescription>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Thêm NPT
        </Button>
      </CardHeader>
      <CardContent>
        {/* Summary */}
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{summary?.total || 0}</div>
              <p className="text-xs text-muted-foreground">Tổng NPT</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{summary?.byType?.children || 0}</div>
              <p className="text-xs text-muted-foreground">Con</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{summary?.byType?.parents || 0}</div>
              <p className="text-xs text-muted-foreground">Cha/Mẹ</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{summary?.byType?.spouse || 0}</div>
              <p className="text-xs text-muted-foreground">Vợ/Chồng</p>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã NV</TableHead>
              <TableHead>Nhân viên</TableHead>
              <TableHead>Tên NPT</TableHead>
              <TableHead>Quan hệ</TableHead>
              <TableHead>Ngày sinh</TableHead>
              <TableHead>MST NPT</TableHead>
              <TableHead>Hiệu lực từ</TableHead>
              <TableHead>Trạng thái</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dependentList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                  Chưa có dữ liệu người phụ thuộc
                </TableCell>
              </TableRow>
            ) : (
              dependentList.map((d: { id: string; employeeCode: string; employeeName: string; dependentName: string; relationship: string; birthDate: string | null; taxCode: string; validFrom: string; status: string }) => (
                <TableRow key={d.id}>
                  <TableCell className="font-mono">{d.employeeCode}</TableCell>
                  <TableCell>{d.employeeName}</TableCell>
                  <TableCell>{d.dependentName}</TableCell>
                  <TableCell>{d.relationship}</TableCell>
                  <TableCell>{d.birthDate ? formatDate(new Date(d.birthDate)) : '-'}</TableCell>
                  <TableCell className="font-mono">{d.taxCode || '-'}</TableCell>
                  <TableCell>{formatDate(new Date(d.validFrom))}</TableCell>
                  <TableCell>
                    <Badge variant={d.status === 'ACTIVE' ? 'default' : 'secondary'}>
                      {d.status === 'ACTIVE' ? 'Hoạt động' : 'Ngừng'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function TaxReports({ year }: { year: number }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Báo cáo thuế</CardTitle>
        <CardDescription>Xuất báo cáo thuế TNCN theo mẫu quy định</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardContent className="pt-6 flex items-center gap-4">
              <FileText className="h-8 w-8 text-primary" />
              <div className="flex-1">
                <h4 className="font-medium">Mẫu 05-KK-TNCN</h4>
                <p className="text-sm text-muted-foreground">Tờ khai quyết toán thuế TNCN</p>
              </div>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" />
                Xuất
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardContent className="pt-6 flex items-center gap-4">
              <FileText className="h-8 w-8 text-primary" />
              <div className="flex-1">
                <h4 className="font-medium">Mẫu 02/QT-TNCN</h4>
                <p className="text-sm text-muted-foreground">Bảng kê chi tiết người nộp thuế</p>
              </div>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" />
                Xuất
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardContent className="pt-6 flex items-center gap-4">
              <FileText className="h-8 w-8 text-primary" />
              <div className="flex-1">
                <h4 className="font-medium">Mẫu 05-1/BK-TNCN</h4>
                <p className="text-sm text-muted-foreground">Bảng kê thu nhập cá nhân</p>
              </div>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" />
                Xuất
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardContent className="pt-6 flex items-center gap-4">
              <FileText className="h-8 w-8 text-primary" />
              <div className="flex-1">
                <h4 className="font-medium">Mẫu 05-2/BK-TNCN</h4>
                <p className="text-sm text-muted-foreground">Bảng kê người phụ thuộc</p>
              </div>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" />
                Xuất
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="pt-4 border-t">
          <h4 className="font-medium mb-3">Báo cáo hàng tháng</h4>
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
              <CardContent className="pt-6 flex items-center gap-4">
                <FileText className="h-6 w-6 text-muted-foreground" />
                <div className="flex-1">
                  <h4 className="text-sm font-medium">Tờ khai thuế tháng</h4>
                  <p className="text-xs text-muted-foreground">Mẫu 02/KK-TNCN</p>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
              <CardContent className="pt-6 flex items-center gap-4">
                <FileText className="h-6 w-6 text-muted-foreground" />
                <div className="flex-1">
                  <h4 className="text-sm font-medium">Bảng lương chi tiết</h4>
                  <p className="text-xs text-muted-foreground">Có khấu trừ thuế</p>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
              <CardContent className="pt-6 flex items-center gap-4">
                <FileText className="h-6 w-6 text-muted-foreground" />
                <div className="flex-1">
                  <h4 className="text-sm font-medium">Báo cáo tổng hợp</h4>
                  <p className="text-xs text-muted-foreground">Theo phòng ban</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
