'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  BarChart3,
  RefreshCw,
  Eye,
  Lightbulb,
  Building2,
  ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type {
  TurnoverAnalysisResult,
  TurnoverPrediction,
  RiskLevel
} from '@/lib/ai/predictions/types'

function getRiskBadgeVariant(level: RiskLevel): 'default' | 'secondary' | 'destructive' | 'outline' {
  const variants: Record<RiskLevel, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    LOW: 'secondary',
    MEDIUM: 'outline',
    HIGH: 'default',
    CRITICAL: 'destructive'
  }
  return variants[level]
}

function getRiskLabel(level: RiskLevel): string {
  const labels: Record<RiskLevel, string> = {
    LOW: 'Thấp',
    MEDIUM: 'Trung bình',
    HIGH: 'Cao',
    CRITICAL: 'Rất cao'
  }
  return labels[level]
}

function getRiskColor(score: number): string {
  if (score >= 80) return 'text-red-600'
  if (score >= 60) return 'text-orange-600'
  if (score >= 40) return 'text-yellow-600'
  return 'text-green-600'
}

function getProgressColor(score: number): string {
  if (score >= 80) return 'bg-red-500'
  if (score >= 60) return 'bg-orange-500'
  if (score >= 40) return 'bg-yellow-500'
  return 'bg-green-500'
}

function TrendIcon({ trend }: { trend: 'increasing' | 'stable' | 'decreasing' }) {
  if (trend === 'increasing') return <TrendingUp className="h-3 w-3 text-red-500" />
  if (trend === 'decreasing') return <TrendingDown className="h-3 w-3 text-green-500" />
  return <Minus className="h-3 w-3 text-gray-500" />
}

export default function TurnoverPredictionsPage() {
  const [data, setData] = useState<TurnoverAnalysisResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all')
  const [selectedPrediction, setSelectedPrediction] = useState<TurnoverPrediction | null>(null)

  const fetchPredictions = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (selectedDepartment && selectedDepartment !== 'all') {
        params.append('departmentId', selectedDepartment)
      }
      params.append('limit', '50')

      const res = await fetch(`/api/ai/predictions/turnover?${params}`)

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Failed to fetch predictions')
      }

      const result = await res.json()
      setData(result.data ?? result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPredictions()
  }, [selectedDepartment])

  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <h2 className="text-xl font-semibold">Không thể tải dữ liệu</h2>
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={fetchPredictions}>Thử lại</Button>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dự đoán nghỉ việc</h1>
          <p className="text-muted-foreground">
            Phân tích AI về rủi ro nghỉ việc của nhân viên
          </p>
        </div>
        <Button onClick={fetchPredictions} variant="outline" disabled={isLoading}>
          <RefreshCw className={cn('h-4 w-4 mr-2', isLoading && 'animate-spin')} />
          Làm mới
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tổng phân tích</p>
                <p className="text-2xl font-bold">{data.summary.totalAnalyzed}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rủi ro rất cao</p>
                <p className="text-2xl font-bold text-red-600">{data.summary.criticalRisk}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rủi ro cao</p>
                <p className="text-2xl font-bold text-orange-600">{data.summary.highRisk}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rủi ro trung bình</p>
                <p className="text-2xl font-bold text-yellow-600">{data.summary.mediumRisk}</p>
              </div>
              <Minus className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rủi ro thấp</p>
                <p className="text-2xl font-bold text-green-600">{data.summary.lowRisk}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Table */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Danh sách nhân viên</CardTitle>
                <CardDescription>
                  Sắp xếp theo điểm rủi ro cao nhất
                </CardDescription>
              </div>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Tất cả phòng ban" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả phòng ban</SelectItem>
                  {data.insights.topRiskDepartments.map(dept => (
                    <SelectItem key={dept.name} value={dept.name}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nhân viên</TableHead>
                    <TableHead>Phòng ban</TableHead>
                    <TableHead className="text-center">Điểm rủi ro</TableHead>
                    <TableHead className="text-center">Mức độ</TableHead>
                    <TableHead className="text-right">Chi tiết</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.predictions.map(prediction => (
                    <TableRow key={prediction.employeeId}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{prediction.employeeName}</p>
                          <p className="text-xs text-muted-foreground">
                            {prediction.employeeCode}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{prediction.departmentName}</p>
                          <p className="text-xs text-muted-foreground">
                            {prediction.positionName}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col items-center gap-1">
                          <span className={cn('font-bold', getRiskColor(prediction.riskScore))}>
                            {prediction.riskScore}
                          </span>
                          <Progress
                            value={prediction.riskScore}
                            className={cn('h-1.5 w-16', getProgressColor(prediction.riskScore))}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={getRiskBadgeVariant(prediction.riskLevel)}>
                          {getRiskLabel(prediction.riskLevel)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedPrediction(prediction)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Xem
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>
                                Chi tiết dự đoán - {prediction.employeeName}
                              </DialogTitle>
                              <DialogDescription>
                                {prediction.employeeCode} | {prediction.departmentName} | {prediction.positionName}
                              </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-6 py-4">
                              {/* Risk Score */}
                              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                                <div>
                                  <p className="text-sm text-muted-foreground">Điểm rủi ro tổng thể</p>
                                  <p className={cn('text-3xl font-bold', getRiskColor(prediction.riskScore))}>
                                    {prediction.riskScore}/100
                                  </p>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {prediction.predictedTimeframe}
                                  </p>
                                </div>
                                <Badge variant={getRiskBadgeVariant(prediction.riskLevel)} className="text-lg px-4 py-2">
                                  {getRiskLabel(prediction.riskLevel)}
                                </Badge>
                              </div>

                              {/* Factors */}
                              <div>
                                <h4 className="font-semibold mb-3 flex items-center gap-2">
                                  <BarChart3 className="h-4 w-4" />
                                  Phân tích các yếu tố
                                </h4>
                                <div className="space-y-3">
                                  {prediction.factors
                                    .sort((a, b) => b.contribution - a.contribution)
                                    .map((factor, idx) => (
                                      <div key={idx} className="p-3 border rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                          <div className="flex items-center gap-2">
                                            <span className="font-medium">{factor.name}</span>
                                            <TrendIcon trend={factor.trend} />
                                          </div>
                                          <span className={cn('font-bold', getRiskColor(factor.score))}>
                                            {factor.score}/100
                                          </span>
                                        </div>
                                        <Progress
                                          value={factor.score}
                                          className="h-2 mb-2"
                                        />
                                        <p className="text-sm text-muted-foreground">
                                          {factor.description}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                          Trọng số: {factor.weight}% | Đóng góp: {factor.contribution.toFixed(1)} điểm
                                        </p>
                                      </div>
                                    ))}
                                </div>
                              </div>

                              {/* Recommendations */}
                              <div>
                                <h4 className="font-semibold mb-3 flex items-center gap-2">
                                  <Lightbulb className="h-4 w-4 text-yellow-500" />
                                  Đề xuất hành động
                                </h4>
                                <div className="space-y-2">
                                  {prediction.aiRecommendations.map((rec, idx) => (
                                    <div
                                      key={idx}
                                      className="flex items-start gap-2 p-3 bg-muted rounded-lg"
                                    >
                                      <ChevronRight className="h-4 w-4 mt-0.5 text-primary" />
                                      <span className="text-sm">{rec}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Confidence */}
                              <div className="text-xs text-muted-foreground text-center">
                                Độ tin cậy: {prediction.confidence}% | Tính toán lúc:{' '}
                                {new Date(prediction.calculatedAt).toLocaleString('vi-VN')}
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Sidebar - Insights */}
        <div className="space-y-6">
          {/* Risk by Department */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Rủi ro theo phòng ban
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.insights.topRiskDepartments.map((dept, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="truncate">{dept.name}</span>
                      <span className={cn('font-medium', getRiskColor(dept.riskScore))}>
                        {dept.riskScore}
                      </span>
                    </div>
                    <Progress value={dept.riskScore} className="h-1.5" />
                    <p className="text-xs text-muted-foreground">
                      {dept.employeeCount} nhân viên
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Common Factors */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Yếu tố rủi ro phổ biến
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.insights.commonRiskFactors.map((factor, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 bg-muted rounded"
                  >
                    <span className="text-sm">{factor.factor}</span>
                    <Badge variant="secondary">{factor.frequency} NV</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Xu hướng chung</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                {data.insights.trendDirection === 'improving' && (
                  <>
                    <TrendingDown className="h-8 w-8 text-green-500" />
                    <div>
                      <p className="font-medium text-green-600">Đang cải thiện</p>
                      <p className="text-sm text-muted-foreground">
                        Rủi ro nghỉ việc có xu hướng giảm
                      </p>
                    </div>
                  </>
                )}
                {data.insights.trendDirection === 'worsening' && (
                  <>
                    <TrendingUp className="h-8 w-8 text-red-500" />
                    <div>
                      <p className="font-medium text-red-600">Cần chú ý</p>
                      <p className="text-sm text-muted-foreground">
                        Rủi ro nghỉ việc có xu hướng tăng
                      </p>
                    </div>
                  </>
                )}
                {data.insights.trendDirection === 'stable' && (
                  <>
                    <Minus className="h-8 w-8 text-gray-500" />
                    <div>
                      <p className="font-medium">Ổn định</p>
                      <p className="text-sm text-muted-foreground">
                        Không có thay đổi đáng kể
                      </p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <Skeleton className="h-10 w-28" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
