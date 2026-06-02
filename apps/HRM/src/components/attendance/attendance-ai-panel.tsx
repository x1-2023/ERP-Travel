"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertTriangle, Brain, TrendingUp, Zap,
  ChevronDown, ChevronUp, Loader2, Sparkles
} from "lucide-react"

interface AnomalyRecord {
  employeeId: string
  employeeCode: string
  employeeName: string
  department: string
  type: string
  severity: "high" | "medium" | "low"
  description: string
  dates: string[]
  suggestion: string
}

interface SmartSyncSuggestion {
  employeeId: string
  employeeCode: string
  employeeName: string
  type: "auto_ot" | "auto_leave" | "low_attendance" | "missing_records"
  description: string
  actionLabel: string
}

interface ForecastResult {
  department: string
  date: string
  dayOfWeek: string
  predictedPresent: number
  totalEmployees: number
  riskLevel: "high" | "medium" | "low"
  riskFactors: string[]
}

const ANOMALY_TYPE_LABELS: Record<string, string> = {
  frequent_late: "Đi muộn liên tục",
  frequent_absent: "Vắng nhiều",
  pattern_absence: "Pattern nghỉ",
  short_hours: "Giờ làm ngắn",
  early_checkout: "Về sớm",
  overtime_unrecorded: "OT chưa ghi nhận",
  no_checkout: "Thiếu check-out",
}

const SEVERITY_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  high: { bg: "bg-red-100", text: "text-red-800", label: "Nghiêm trọng" },
  medium: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Cần lưu ý" },
  low: { bg: "bg-blue-100", text: "text-blue-800", label: "Thông tin" },
}

const SUGGESTION_ICONS: Record<string, string> = {
  auto_ot: "OT",
  auto_leave: "NP",
  low_attendance: "CC",
  missing_records: "TD",
}

const SUGGESTION_COLORS: Record<string, string> = {
  auto_ot: "bg-purple-100 text-purple-800",
  auto_leave: "bg-orange-100 text-orange-800",
  low_attendance: "bg-red-100 text-red-800",
  missing_records: "bg-gray-100 text-gray-800",
}

const RISK_COLORS: Record<string, string> = {
  high: "bg-red-500",
  medium: "bg-yellow-500",
  low: "bg-green-500",
}

export function AttendanceAIPanel({ month, year }: { month: number; year: number }) {
  const [activeTab, setActiveTab] = useState("anomalies")
  const [expandedAnomaly, setExpandedAnomaly] = useState<number | null>(null)

  // Anomalies
  const { data: anomalyData, isLoading: loadingAnomalies } = useQuery({
    queryKey: ["attendance-ai-anomalies", month, year],
    queryFn: async () => {
      const res = await fetch(`/api/attendance/ai?action=anomalies&month=${month}&year=${year}`)
      if (!res.ok) throw new Error("Failed")
      return res.json()
    },
  })

  // Smart Sync Suggestions
  const { data: suggestData, isLoading: loadingSuggestions } = useQuery({
    queryKey: ["attendance-ai-suggestions", month, year],
    queryFn: async () => {
      const res = await fetch(`/api/attendance/ai?action=suggestions&month=${month}&year=${year}`)
      if (!res.ok) throw new Error("Failed")
      return res.json()
    },
  })

  // Forecast
  const { data: forecastData, isLoading: loadingForecast } = useQuery({
    queryKey: ["attendance-ai-forecast"],
    queryFn: async () => {
      const res = await fetch(`/api/attendance/ai?action=forecast`)
      if (!res.ok) throw new Error("Failed")
      return res.json()
    },
  })

  // AI Analysis
  const { data: analysisData, isLoading: loadingAnalysis, refetch: refetchAnalysis } = useQuery({
    queryKey: ["attendance-ai-analysis", month, year],
    queryFn: async () => {
      const res = await fetch(`/api/attendance/ai?action=analysis&month=${month}&year=${year}`)
      if (!res.ok) throw new Error("Failed")
      return res.json()
    },
    enabled: false, // Manual trigger
  })

  const anomalies: AnomalyRecord[] = anomalyData?.anomalies || []
  const suggestions: SmartSyncSuggestion[] = suggestData?.suggestions || []
  const forecast: ForecastResult[] = forecastData?.forecast || []
  const highCount = anomalies.filter(a => a.severity === "high").length
  const otCount = suggestions.filter(s => s.type === "auto_ot").length
  const leaveCount = suggestions.filter(s => s.type === "auto_leave").length

  return (
    <Card className="border-l-4 border-l-indigo-500">
      <CardHeader className="py-3">
        <CardTitle className="text-sm flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-indigo-600" />
            AI Attendance Intelligence
          </span>
          <div className="flex items-center gap-2">
            {highCount > 0 && (
              <Badge variant="destructive" className="text-[10px]">{highCount} nghiêm trọng</Badge>
            )}
            {otCount > 0 && (
              <Badge className="text-[10px] bg-purple-100 text-purple-800">{otCount} OT</Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => refetchAnalysis()}
              disabled={loadingAnalysis}
            >
              {loadingAnalysis ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Sparkles className="h-3 w-3 mr-1" />}
              Phân tích AI
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {/* AI Analysis text (if available) */}
        {analysisData?.analysis && (
          <div className="mb-4 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
            <div className="text-xs font-medium text-indigo-700 mb-1 flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> Phân tích AI — T{month}/{year}
            </div>
            <div className="text-xs text-indigo-900 whitespace-pre-wrap leading-relaxed prose-sm">
              {analysisData.analysis.split("**").map((part: string, i: number) =>
                i % 2 === 1
                  ? <strong key={i}>{part}</strong>
                  : <span key={i}>{part}</span>
              )}
            </div>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 h-8">
            <TabsTrigger value="anomalies" className="text-xs gap-1">
              <AlertTriangle className="h-3 w-3" />
              Bất thường ({anomalies.length})
            </TabsTrigger>
            <TabsTrigger value="suggestions" className="text-xs gap-1">
              <Zap className="h-3 w-3" />
              Gợi ý ({suggestions.length})
            </TabsTrigger>
            <TabsTrigger value="forecast" className="text-xs gap-1">
              <TrendingUp className="h-3 w-3" />
              Dự báo
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: Anomalies */}
          <TabsContent value="anomalies" className="mt-2">
            {loadingAnomalies ? (
              <div className="py-4 text-center text-xs text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin mx-auto mb-1" />
                Đang phân tích...
              </div>
            ) : anomalies.length === 0 ? (
              <div className="py-4 text-center text-xs text-muted-foreground">
                Không phát hiện bất thường trong tháng {month}/{year}
              </div>
            ) : (
              <div className="space-y-1 max-h-[300px] overflow-y-auto">
                {anomalies.map((anomaly, idx) => {
                  const style = SEVERITY_STYLES[anomaly.severity]
                  const isExpanded = expandedAnomaly === idx
                  return (
                    <div
                      key={idx}
                      className={`${style.bg} rounded p-2 cursor-pointer transition-all`}
                      onClick={() => setExpandedAnomaly(isExpanded ? null : idx)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <Badge variant="outline" className={`text-[9px] shrink-0 ${style.text}`}>
                            {style.label}
                          </Badge>
                          <span className="text-xs font-medium truncate">{anomaly.employeeName}</span>
                          <span className="text-[10px] text-muted-foreground shrink-0">
                            {anomaly.employeeCode}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-muted-foreground">
                            {ANOMALY_TYPE_LABELS[anomaly.type] || anomaly.type}
                          </span>
                          {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                        </div>
                      </div>
                      {isExpanded && (
                        <div className="mt-2 text-xs space-y-1">
                          <p>{anomaly.description}</p>
                          <p className="text-muted-foreground">
                            Phòng: {anomaly.department}
                          </p>
                          {anomaly.dates.length > 0 && (
                            <p className="text-muted-foreground">
                              Ngày: {anomaly.dates.slice(0, 5).join(", ")}
                              {anomaly.dates.length > 5 ? ` (+${anomaly.dates.length - 5})` : ""}
                            </p>
                          )}
                          <p className="font-medium mt-1">{anomaly.suggestion}</p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </TabsContent>

          {/* TAB 2: Smart Sync Suggestions */}
          <TabsContent value="suggestions" className="mt-2">
            {loadingSuggestions ? (
              <div className="py-4 text-center text-xs text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin mx-auto mb-1" />
                Đang phân tích...
              </div>
            ) : suggestions.length === 0 ? (
              <div className="py-4 text-center text-xs text-muted-foreground">
                Không có gợi ý cho tháng {month}/{year}
              </div>
            ) : (
              <div className="space-y-1 max-h-[300px] overflow-y-auto">
                {/* Summary */}
                <div className="flex gap-2 mb-2 flex-wrap">
                  {otCount > 0 && (
                    <Badge className="bg-purple-100 text-purple-800 text-[10px]">{otCount} OT chưa ghi nhận</Badge>
                  )}
                  {leaveCount > 0 && (
                    <Badge className="bg-orange-100 text-orange-800 text-[10px]">{leaveCount} vắng chưa có đơn</Badge>
                  )}
                </div>

                {suggestions.map((s, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-muted/50 rounded text-xs">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${SUGGESTION_COLORS[s.type]}`}>
                        {SUGGESTION_ICONS[s.type]}
                      </span>
                      <div className="min-w-0">
                        <span className="font-medium">{s.employeeName}</span>
                        <span className="text-muted-foreground ml-1">({s.employeeCode})</span>
                        <p className="text-muted-foreground truncate">{s.description}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="h-6 text-[10px] shrink-0">
                      {s.actionLabel}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* TAB 3: Forecast */}
          <TabsContent value="forecast" className="mt-2">
            {loadingForecast ? (
              <div className="py-4 text-center text-xs text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin mx-auto mb-1" />
                Đang dự báo...
              </div>
            ) : forecast.length === 0 ? (
              <div className="py-4 text-center text-xs text-muted-foreground">
                Chưa đủ dữ liệu lịch sử để dự báo
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-[10px] text-muted-foreground">
                  Dự báo tuần từ {forecastData?.weekStart} (dựa trên 3 tháng lịch sử + đơn phép)
                </p>

                {/* Group by date */}
                {Array.from(new Set(forecast.map(f => f.date))).map(date => {
                  const dayForecasts = forecast.filter(f => f.date === date)
                  const dow = dayForecasts[0]?.dayOfWeek || ""
                  return (
                    <div key={date} className="border rounded p-2">
                      <div className="text-xs font-medium mb-1">{dow} — {date}</div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-1">
                        {dayForecasts.map((f, i) => (
                          <div key={i} className="flex items-center gap-1.5 text-[10px]">
                            <div className={`w-2 h-2 rounded-full ${RISK_COLORS[f.riskLevel]}`} />
                            <span className="truncate">{f.department}</span>
                            <span className="font-mono text-muted-foreground">
                              {f.predictedPresent}/{f.totalEmployees}
                            </span>
                          </div>
                        ))}
                      </div>
                      {dayForecasts.some(f => f.riskFactors.length > 0) && (
                        <div className="mt-1 text-[10px] text-muted-foreground">
                          {dayForecasts
                            .filter(f => f.riskFactors.length > 0)
                            .flatMap(f => f.riskFactors)
                            .filter((v, i, a) => a.indexOf(v) === i)
                            .slice(0, 3)
                            .map((rf, i) => (
                              <span key={i} className="mr-2">- {rf}</span>
                            ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
