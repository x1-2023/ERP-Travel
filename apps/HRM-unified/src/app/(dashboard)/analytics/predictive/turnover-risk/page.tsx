// src/app/(dashboard)/analytics/predictive/turnover-risk/page.tsx
// Turnover Risk Predictions

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Brain,
  Search,
  RefreshCw,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  ChevronRight,
} from 'lucide-react'

interface Prediction {
  id: string
  entityId: string
  entityName: string
  score: number
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  confidence: number
  factors: Array<{
    name: string
    value: number
    weight: number
    impact: 'positive' | 'negative' | 'neutral'
    description: string
  }>
  recommendations: string[]
  predictedAt: string
}

const RISK_COLORS = {
  LOW: 'bg-green-100 text-green-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-orange-100 text-orange-800',
  CRITICAL: 'bg-red-100 text-red-800',
}

const RISK_LABELS = {
  LOW: 'Thấp',
  MEDIUM: 'Trung bình',
  HIGH: 'Cao',
  CRITICAL: 'Nghiêm trọng',
}

export default function TurnoverRiskPage() {
  const [loading, setLoading] = useState(true)
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [filteredPredictions, setFilteredPredictions] = useState<Prediction[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [riskFilter, setRiskFilter] = useState<string>('all')
  const [selectedPrediction, setSelectedPrediction] = useState<Prediction | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    filterPredictions()
  }, [predictions, searchQuery, riskFilter])

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/analytics/predictions?modelType=TURNOVER_RISK&limit=200')
      if (response.ok) {
        const data = await response.json()
        setPredictions(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching predictions:', error)
    } finally {
      setLoading(false)
    }
  }

  const runPredictions = async () => {
    setLoading(true)
    try {
      await fetch('/api/analytics/predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modelType: 'TURNOVER_RISK' }),
      })
      await fetchData()
    } catch (error) {
      console.error('Error running predictions:', error)
    }
  }

  const filterPredictions = () => {
    let filtered = [...predictions]

    if (searchQuery) {
      filtered = filtered.filter((p) =>
        p.entityName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (riskFilter !== 'all') {
      filtered = filtered.filter((p) => p.riskLevel === riskFilter)
    }

    setFilteredPredictions(filtered)
  }

  const viewDetails = (prediction: Prediction) => {
    setSelectedPrediction(prediction)
    setDetailOpen(true)
  }

  const getRiskStats = () => {
    const stats = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 }
    predictions.forEach((p) => {
      stats[p.riskLevel]++
    })
    return stats
  }

  const stats = getRiskStats()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dự đoán nguy cơ nghỉ việc</h1>
          <p className="text-muted-foreground mt-1">
            Phân tích và dự báo nhân viên có khả năng nghỉ việc
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={fetchData}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button onClick={runPredictions}>
            <Brain className="h-4 w-4 mr-2" />
            Chạy dự đoán mới
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Nguy cơ thấp</p>
                <p className="text-2xl font-bold text-green-600">{stats.LOW}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-full">
                <TrendingDown className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Nguy cơ TB</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.MEDIUM}</p>
              </div>
              <div className="p-2 bg-yellow-100 rounded-full">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Nguy cơ cao</p>
                <p className="text-2xl font-bold text-orange-600">{stats.HIGH}</p>
              </div>
              <div className="p-2 bg-orange-100 rounded-full">
                <TrendingUp className="h-5 w-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Nghiêm trọng</p>
                <p className="text-2xl font-bold text-red-600">{stats.CRITICAL}</p>
              </div>
              <div className="p-2 bg-red-100 rounded-full">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm nhân viên..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={riskFilter} onValueChange={setRiskFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Mức nguy cơ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="CRITICAL">Nghiêm trọng</SelectItem>
                <SelectItem value="HIGH">Cao</SelectItem>
                <SelectItem value="MEDIUM">Trung bình</SelectItem>
                <SelectItem value="LOW">Thấp</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Predictions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách dự đoán</CardTitle>
          <CardDescription>
            {filteredPredictions.length} nhân viên được phân tích
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredPredictions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nhân viên</TableHead>
                  <TableHead>Điểm rủi ro</TableHead>
                  <TableHead>Mức nguy cơ</TableHead>
                  <TableHead>Độ tin cậy</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPredictions.map((prediction) => (
                  <TableRow key={prediction.id}>
                    <TableCell className="font-medium">{prediction.entityName}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              prediction.score >= 70
                                ? 'bg-red-500'
                                : prediction.score >= 50
                                ? 'bg-orange-500'
                                : prediction.score >= 30
                                ? 'bg-yellow-500'
                                : 'bg-green-500'
                            }`}
                            style={{ width: `${prediction.score}%` }}
                          />
                        </div>
                        <span className="text-sm">{prediction.score.toFixed(0)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={RISK_COLORS[prediction.riskLevel]}>
                        {RISK_LABELS[prediction.riskLevel]}
                      </Badge>
                    </TableCell>
                    <TableCell>{prediction.confidence.toFixed(0)}%</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => viewDetails(prediction)}
                      >
                        Chi tiết
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              {predictions.length === 0
                ? 'Chưa có dữ liệu dự đoán. Nhấn "Chạy dự đoán mới" để bắt đầu.'
                : 'Không tìm thấy kết quả phù hợp.'}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-600" />
              Chi tiết dự đoán: {selectedPrediction?.entityName}
            </DialogTitle>
            <DialogDescription>
              Phân tích các yếu tố ảnh hưởng đến nguy cơ nghỉ việc
            </DialogDescription>
          </DialogHeader>

          {selectedPrediction && (
            <div className="space-y-6">
              {/* Summary */}
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Điểm rủi ro</p>
                  <p className="text-3xl font-bold">{selectedPrediction.score.toFixed(0)}</p>
                </div>
                <Badge className={`text-lg py-1 px-3 ${RISK_COLORS[selectedPrediction.riskLevel]}`}>
                  {RISK_LABELS[selectedPrediction.riskLevel]}
                </Badge>
              </div>

              {/* Factors */}
              <div>
                <h4 className="font-medium mb-3">Các yếu tố ảnh hưởng</h4>
                <div className="space-y-3">
                  {selectedPrediction.factors.map((factor, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{factor.name}</span>
                        <Badge
                          variant="outline"
                          className={
                            factor.impact === 'negative'
                              ? 'text-red-600 border-red-600'
                              : factor.impact === 'positive'
                              ? 'text-green-600 border-green-600'
                              : ''
                          }
                        >
                          {factor.impact === 'negative'
                            ? 'Tiêu cực'
                            : factor.impact === 'positive'
                            ? 'Tích cực'
                            : 'Trung lập'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{factor.description}</p>
                      <div className="mt-2 flex items-center gap-2 text-sm">
                        <span>Giá trị: {factor.value}</span>
                        <span className="text-muted-foreground">|</span>
                        <span>Trọng số: {(factor.weight * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              {selectedPrediction.recommendations.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">Đề xuất hành động</h4>
                  <ul className="space-y-2">
                    {selectedPrediction.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-medium text-purple-600">{index + 1}</span>
                        </div>
                        <span className="text-sm">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
