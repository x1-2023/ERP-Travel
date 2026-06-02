'use client'

import { useState, useEffect, useCallback } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import {
  Activity,
  AlertTriangle,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Bell,
  Brain,
  Calendar,
  CheckCircle,
  ChevronRight,
  Clock,
  DollarSign,
  FileText,
  Gauge,
  Globe,
  Layers,
  LayoutDashboard,
  LineChart,
  MessageSquare,
  MoreHorizontal,
  PieChart,
  Play,
  RefreshCw,
  Settings,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  UserCheck,
  UserMinus,
  UserPlus,
  Users,
  Zap,
  Shield,
  Server,
  Wifi,
  WifiOff,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
} from 'recharts'

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

interface LiveKPI {
  id: string
  label: string
  value: number | string
  previousValue?: number
  change?: number
  changeType: 'increase' | 'decrease' | 'neutral'
  trend: 'up' | 'down' | 'stable'
  unit?: string
  icon: React.ReactNode
  color: string
  sparkline?: number[]
}

interface Alert {
  id: string
  type: 'critical' | 'warning' | 'info' | 'success'
  title: string
  message: string
  timestamp: Date
  source: string
  actionUrl?: string
  isRead: boolean
}

interface QuickAction {
  id: string
  label: string
  description: string
  icon: React.ReactNode
  action: () => void
  badge?: string
  variant: 'default' | 'primary' | 'warning' | 'success'
}

interface AIRecommendation {
  id: string
  type: 'optimization' | 'warning' | 'opportunity' | 'insight'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  confidence: number
  actionLabel?: string
  actionUrl?: string
}

interface SystemStatus {
  name: string
  status: 'operational' | 'degraded' | 'outage'
  uptime: number
  lastCheck: Date
}

// ═══════════════════════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════════════════════

const ALERT_COLORS = {
  critical: 'bg-red-500',
  warning: 'bg-amber-500',
  info: 'bg-blue-500',
  success: 'bg-green-500',
}

const ALERT_ICONS = {
  critical: <AlertTriangle className="h-4 w-4" />,
  warning: <Clock className="h-4 w-4" />,
  info: <Bell className="h-4 w-4" />,
  success: <CheckCircle className="h-4 w-4" />,
}

// ═══════════════════════════════════════════════════════════════
// Components
// ═══════════════════════════════════════════════════════════════

function LiveIndicator({ isLive }: { isLive: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className={cn(
        'h-2 w-2 rounded-full',
        isLive ? 'bg-green-500 animate-pulse' : 'bg-muted-foreground'
      )} />
      <span className="text-xs font-medium text-muted-foreground">
        {isLive ? 'LIVE' : 'OFFLINE'}
      </span>
    </div>
  )
}

function KPICard({ kpi, isLoading }: { kpi: LiveKPI; isLoading: boolean }) {
  if (isLoading) {
    return (
      <Card className="relative overflow-hidden">
        <CardContent className="p-4">
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-3 w-20" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
      {/* Gradient accent */}
      <div className={cn(
        'absolute top-0 left-0 right-0 h-1',
        kpi.color
      )} />

      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {kpi.label}
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight">
                {typeof kpi.value === 'number' ? kpi.value.toLocaleString('vi-VN') : kpi.value}
              </span>
              {kpi.unit && (
                <span className="text-sm text-muted-foreground">{kpi.unit}</span>
              )}
            </div>
          </div>
          <div className={cn(
            'p-2 rounded-lg',
            kpi.color.replace('bg-', 'bg-').replace('-500', '-100'),
            'dark:bg-opacity-20'
          )}>
            {kpi.icon}
          </div>
        </div>

        {/* Change indicator */}
        {kpi.change !== undefined && (
          <div className="flex items-center gap-2 mt-2">
            <div className={cn(
              'flex items-center gap-0.5 text-xs font-semibold',
              kpi.changeType === 'increase' && 'text-green-600',
              kpi.changeType === 'decrease' && 'text-red-600',
              kpi.changeType === 'neutral' && 'text-muted-foreground'
            )}>
              {kpi.trend === 'up' && <ArrowUp className="h-3 w-3" />}
              {kpi.trend === 'down' && <ArrowDown className="h-3 w-3" />}
              {Math.abs(kpi.change).toFixed(1)}%
            </div>
            <span className="text-xs text-muted-foreground">so với kỳ trước</span>
          </div>
        )}

        {/* Mini sparkline */}
        {kpi.sparkline && kpi.sparkline.length > 0 && (
          <div className="mt-3 h-8">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={kpi.sparkline.map((v, i) => ({ v, i }))}>
                <Area
                  type="monotone"
                  dataKey="v"
                  stroke={kpi.color.replace('bg-', 'hsl(var(--')}
                  fill={kpi.color.replace('bg-', 'hsl(var(--')}
                  fillOpacity={0.2}
                  strokeWidth={1.5}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function AlertItem({ alert, onDismiss }: { alert: Alert; onDismiss: (id: string) => void }) {
  return (
    <div className={cn(
      'flex items-start gap-3 p-3 rounded-lg border transition-all duration-200',
      !alert.isRead && 'bg-muted/50',
      alert.type === 'critical' && 'border-red-500/50',
      alert.type === 'warning' && 'border-amber-500/50'
    )}>
      <div className={cn(
        'p-1.5 rounded-full text-white',
        ALERT_COLORS[alert.type]
      )}>
        {ALERT_ICONS[alert.type]}
      </div>
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold">{alert.title}</p>
          <Badge variant="outline" className="text-[10px] h-4 flex-shrink-0">
            {alert.source}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2">{alert.message}</p>
        <div className="flex items-center gap-2 pt-1">
          <span className="text-[10px] text-muted-foreground">
            {formatDistanceToNow(alert.timestamp, { addSuffix: true, locale: vi })}
          </span>
          {alert.actionUrl && (
            <Button variant="link" size="sm" className="h-auto p-0 text-xs" asChild>
              <a href={alert.actionUrl}>Xem chi tiết</a>
            </Button>
          )}
        </div>
      </div>
      <Button
        size="icon"
        variant="ghost"
        className="h-6 w-6 flex-shrink-0"
        onClick={() => onDismiss(alert.id)}
      >
        <MoreHorizontal className="h-3 w-3" />
      </Button>
    </div>
  )
}

function QuickActionButton({ action }: { action: QuickAction }) {
  return (
    <Button
      variant="outline"
      className={cn(
        'h-auto p-4 flex flex-col items-center gap-2 hover:shadow-md transition-all',
        action.variant === 'primary' && 'border-primary/50 hover:bg-primary/5',
        action.variant === 'warning' && 'border-amber-500/50 hover:bg-amber-500/5',
        action.variant === 'success' && 'border-green-500/50 hover:bg-green-500/5'
      )}
      onClick={action.action}
    >
      <div className="relative">
        {action.icon}
        {action.badge && (
          <Badge className="absolute -top-2 -right-2 h-4 px-1 text-[10px]">
            {action.badge}
          </Badge>
        )}
      </div>
      <span className="text-xs font-medium">{action.label}</span>
    </Button>
  )
}

function AIRecommendationCard({ recommendation }: { recommendation: AIRecommendation }) {
  const typeConfig = {
    optimization: { icon: <Zap className="h-4 w-4" />, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    warning: { icon: <AlertTriangle className="h-4 w-4" />, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    opportunity: { icon: <Target className="h-4 w-4" />, color: 'text-green-500', bg: 'bg-green-500/10' },
    insight: { icon: <Brain className="h-4 w-4" />, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  }

  const config = typeConfig[recommendation.type]

  return (
    <div className="p-4 rounded-lg border bg-gradient-to-br from-primary/5 via-transparent to-transparent hover:shadow-md transition-all">
      <div className="flex items-start gap-3">
        <div className={cn('p-2 rounded-lg', config.bg, config.color)}>
          {config.icon}
        </div>
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-3 w-3 text-primary" />
            <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">
              AI Recommendation
            </span>
            <Badge
              variant={recommendation.impact === 'high' ? 'default' : 'secondary'}
              className="text-[10px] h-4"
            >
              {recommendation.impact === 'high' ? 'Ưu tiên cao' : recommendation.impact === 'medium' ? 'Trung bình' : 'Thấp'}
            </Badge>
          </div>
          <h4 className="font-semibold text-sm">{recommendation.title}</h4>
          <p className="text-xs text-muted-foreground">{recommendation.description}</p>

          {/* Confidence meter */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground">Độ tin cậy:</span>
            <Progress value={recommendation.confidence} className="h-1.5 flex-1" />
            <span className="text-[10px] font-medium">{recommendation.confidence}%</span>
          </div>

          {recommendation.actionLabel && (
            <Button size="sm" className="h-7 text-xs mt-2" asChild>
              <a href={recommendation.actionUrl}>
                {recommendation.actionLabel}
                <ChevronRight className="h-3 w-3 ml-1" />
              </a>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

function SystemStatusIndicator({ systems }: { systems: SystemStatus[] }) {
  const allOperational = systems.every(s => s.status === 'operational')

  return (
    <div className="flex items-center gap-3">
      <div className={cn(
        'flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium',
        allOperational ? 'bg-green-500/10 text-green-600' : 'bg-amber-500/10 text-amber-600'
      )}>
        {allOperational ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
        {allOperational ? 'Hệ thống hoạt động bình thường' : 'Một số dịch vụ đang gặp sự cố'}
      </div>

      <TooltipProvider>
        {systems.map((system) => (
          <Tooltip key={system.name}>
            <TooltipTrigger>
              <div className={cn(
                'h-2.5 w-2.5 rounded-full',
                system.status === 'operational' && 'bg-green-500',
                system.status === 'degraded' && 'bg-amber-500',
                system.status === 'outage' && 'bg-red-500'
              )} />
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-xs">
                <p className="font-medium">{system.name}</p>
                <p className="text-muted-foreground">Uptime: {system.uptime}%</p>
              </div>
            </TooltipContent>
          </Tooltip>
        ))}
      </TooltipProvider>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════

export default function CommandCenterPage() {
  const [isLive, setIsLive] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [kpis, setKpis] = useState<LiveKPI[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([])
  const [activityData, setActivityData] = useState<Array<{ time: string; value: number }>>([])
  const [systemStatus, setSystemStatus] = useState<SystemStatus[]>([])

  // Generate mock data
  const generateData = useCallback(() => {
    // KPIs
    const newKpis: LiveKPI[] = [
      {
        id: '1',
        label: 'Tổng nhân sự',
        value: 247 + Math.floor(Math.random() * 5),
        change: 2.5,
        changeType: 'increase',
        trend: 'up',
        icon: <Users className="h-5 w-5 text-blue-500" />,
        color: 'bg-blue-500',
        sparkline: Array.from({ length: 12 }, () => 240 + Math.random() * 20),
      },
      {
        id: '2',
        label: 'Đang làm việc',
        value: 198 + Math.floor(Math.random() * 10),
        change: -0.8,
        changeType: 'neutral',
        trend: 'stable',
        icon: <UserCheck className="h-5 w-5 text-green-500" />,
        color: 'bg-green-500',
        sparkline: Array.from({ length: 12 }, () => 190 + Math.random() * 15),
      },
      {
        id: '3',
        label: 'Tuyển mới tháng này',
        value: 12,
        change: 50,
        changeType: 'increase',
        trend: 'up',
        icon: <UserPlus className="h-5 w-5 text-emerald-500" />,
        color: 'bg-emerald-500',
      },
      {
        id: '4',
        label: 'Nghỉ việc tháng này',
        value: 3,
        change: -25,
        changeType: 'decrease',
        trend: 'down',
        icon: <UserMinus className="h-5 w-5 text-red-500" />,
        color: 'bg-red-500',
      },
      {
        id: '5',
        label: 'Tỷ lệ chuyên cần',
        value: (95 + Math.random() * 3).toFixed(1),
        unit: '%',
        change: 1.2,
        changeType: 'increase',
        trend: 'up',
        icon: <Target className="h-5 w-5 text-purple-500" />,
        color: 'bg-purple-500',
        sparkline: Array.from({ length: 12 }, () => 93 + Math.random() * 5),
      },
      {
        id: '6',
        label: 'Chi phí lương',
        value: '5.2B',
        unit: 'VND',
        change: 3.2,
        changeType: 'increase',
        trend: 'up',
        icon: <DollarSign className="h-5 w-5 text-amber-500" />,
        color: 'bg-amber-500',
      },
      {
        id: '7',
        label: 'Yêu cầu chờ duyệt',
        value: 8 + Math.floor(Math.random() * 5),
        changeType: 'neutral',
        trend: 'stable',
        icon: <FileText className="h-5 w-5 text-orange-500" />,
        color: 'bg-orange-500',
      },
      {
        id: '8',
        label: 'Hiệu suất AI',
        value: (88 + Math.random() * 10).toFixed(0),
        unit: '%',
        changeType: 'increase',
        trend: 'up',
        icon: <Brain className="h-5 w-5 text-violet-500" />,
        color: 'bg-violet-500',
        sparkline: Array.from({ length: 12 }, () => 85 + Math.random() * 12),
      },
    ]
    setKpis(newKpis)

    // Alerts
    const newAlerts: Alert[] = [
      {
        id: '1',
        type: 'critical',
        title: 'Phát hiện nghỉ việc bất thường',
        message: 'AI phát hiện 3 nhân viên có dấu hiệu nghỉ việc trong phòng Kinh doanh',
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
        source: 'AI Analytics',
        actionUrl: '/analytics/predictions/turnover',
        isRead: false,
      },
      {
        id: '2',
        type: 'warning',
        title: '5 yêu cầu phê duyệt quá hạn',
        message: 'Có yêu cầu nghỉ phép đã chờ phê duyệt quá 48 giờ',
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        source: 'Workflow',
        actionUrl: '/approvals',
        isRead: false,
      },
      {
        id: '3',
        type: 'info',
        title: 'Báo cáo lương tháng 1 đã sẵn sàng',
        message: 'Báo cáo tổng hợp lương tháng 1/2026 đã được tạo tự động',
        timestamp: new Date(Date.now() - 1000 * 60 * 60),
        source: 'Payroll',
        actionUrl: '/payroll/reports',
        isRead: true,
      },
      {
        id: '4',
        type: 'success',
        title: 'Import nhân viên hoàn tất',
        message: '15 nhân viên mới đã được import thành công từ file Excel',
        timestamp: new Date(Date.now() - 1000 * 60 * 120),
        source: 'Import',
        isRead: true,
      },
    ]
    setAlerts(newAlerts)

    // AI Recommendations
    const newRecommendations: AIRecommendation[] = [
      {
        id: '1',
        type: 'warning',
        title: 'Rủi ro nghỉ việc phòng Kinh doanh',
        description: 'Phân tích cho thấy 3 nhân viên có xác suất nghỉ việc cao (>70%) trong 3 tháng tới. Đề xuất phỏng vấn giữ chân.',
        impact: 'high',
        confidence: 87,
        actionLabel: 'Xem chi tiết',
        actionUrl: '/analytics/predictions/turnover',
      },
      {
        id: '2',
        type: 'optimization',
        title: 'Tối ưu hóa lịch ca làm việc',
        description: 'AI phát hiện có thể tiết kiệm 15% chi phí OT bằng cách tái phân bổ ca làm việc cho nhóm Sản xuất.',
        impact: 'medium',
        confidence: 75,
        actionLabel: 'Xem đề xuất',
        actionUrl: '/shifts/optimization',
      },
      {
        id: '3',
        type: 'opportunity',
        title: 'Cơ hội đào tạo nội bộ',
        description: '8 nhân viên có tiềm năng thăng tiến cao. Đề xuất chương trình đào tạo leadership.',
        impact: 'medium',
        confidence: 82,
        actionLabel: 'Lập kế hoạch',
        actionUrl: '/training/plans',
      },
      {
        id: '4',
        type: 'insight',
        title: 'Xu hướng tuyển dụng Q1',
        description: 'Dự đoán cần tuyển thêm 8-12 nhân viên trong Q1 để đáp ứng mục tiêu tăng trưởng.',
        impact: 'low',
        confidence: 68,
      },
    ]
    setRecommendations(newRecommendations)

    // Activity chart data
    const hours = Array.from({ length: 24 }, (_, i) => ({
      time: `${i.toString().padStart(2, '0')}:00`,
      value: Math.floor(50 + Math.random() * 150),
    }))
    setActivityData(hours)

    // System status
    setSystemStatus([
      { name: 'API Server', status: 'operational', uptime: 99.9, lastCheck: new Date() },
      { name: 'Database', status: 'operational', uptime: 99.95, lastCheck: new Date() },
      { name: 'AI Engine', status: 'operational', uptime: 99.5, lastCheck: new Date() },
      { name: 'Email Service', status: 'operational', uptime: 98.5, lastCheck: new Date() },
    ])

    setLastUpdate(new Date())
    setIsLoading(false)
  }, [])

  // Initial load
  useEffect(() => {
    generateData()
  }, [generateData])

  // Auto-refresh every 30 seconds when live
  useEffect(() => {
    if (!isLive) return

    const interval = setInterval(() => {
      generateData()
    }, 30000)

    return () => clearInterval(interval)
  }, [isLive, generateData])

  // Quick actions
  const quickActions: QuickAction[] = [
    {
      id: '1',
      label: 'Phê duyệt',
      description: 'Xử lý yêu cầu',
      icon: <CheckCircle className="h-5 w-5 text-green-500" />,
      action: () => window.location.href = '/approvals',
      badge: '8',
      variant: 'primary',
    },
    {
      id: '2',
      label: 'Thêm NV',
      description: 'Tạo hồ sơ mới',
      icon: <UserPlus className="h-5 w-5 text-blue-500" />,
      action: () => window.location.href = '/employees/new',
      variant: 'default',
    },
    {
      id: '3',
      label: 'Tính lương',
      description: 'Chạy bảng lương',
      icon: <DollarSign className="h-5 w-5 text-amber-500" />,
      action: () => window.location.href = '/payroll/calculate',
      variant: 'warning',
    },
    {
      id: '4',
      label: 'Báo cáo',
      description: 'Tạo báo cáo',
      icon: <FileText className="h-5 w-5 text-purple-500" />,
      action: () => window.location.href = '/reports',
      variant: 'default',
    },
    {
      id: '5',
      label: 'AI Chat',
      description: 'Hỏi AI',
      icon: <MessageSquare className="h-5 w-5 text-violet-500" />,
      action: () => window.location.href = '/ai',
      variant: 'success',
    },
    {
      id: '6',
      label: 'Analytics',
      description: 'Phân tích',
      icon: <LineChart className="h-5 w-5 text-cyan-500" />,
      action: () => window.location.href = '/analytics',
      variant: 'default',
    },
  ]

  const handleDismissAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id))
  }

  const criticalAlerts = alerts.filter(a => a.type === 'critical' && !a.isRead)
  const pendingApprovals = kpis.find(k => k.label === 'Yêu cầu chờ duyệt')?.value || 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
            <Gauge className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Command Center</h1>
            <p className="text-muted-foreground">
              Trung tâm điều khiển real-time
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <SystemStatusIndicator systems={systemStatus} />

          <div className="h-6 w-px bg-border" />

          <LiveIndicator isLive={isLive} />

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsLive(!isLive)}
          >
            {isLive ? <Play className="h-4 w-4 mr-1.5" /> : <RefreshCw className="h-4 w-4 mr-1.5" />}
            {isLive ? 'Live' : 'Paused'}
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={generateData}
            disabled={isLoading}
          >
            <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Tùy chỉnh Dashboard
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell className="h-4 w-4 mr-2" />
                Cài đặt thông báo
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Shield className="h-4 w-4 mr-2" />
                Quyền truy cập
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Critical Alerts Banner */}
      {criticalAlerts.length > 0 && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-4">
          <AlertTriangle className="h-6 w-6 text-red-500 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-red-600 dark:text-red-400">
              {criticalAlerts.length} cảnh báo khẩn cấp cần xử lý
            </p>
            <p className="text-sm text-muted-foreground">
              {criticalAlerts[0]?.title}
            </p>
          </div>
          <Button variant="destructive" size="sm" asChild>
            <a href={criticalAlerts[0]?.actionUrl || '/alerts'}>
              Xử lý ngay
              <ChevronRight className="h-4 w-4 ml-1" />
            </a>
          </Button>
        </div>
      )}

      {/* Live KPIs Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.slice(0, 8).map((kpi) => (
          <KPICard key={kpi.id} kpi={kpi} isLoading={isLoading} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Hoạt động hệ thống
                </CardTitle>
                <CardDescription>Số lượng hoạt động theo giờ hôm nay</CardDescription>
              </div>
              <Badge variant="outline" className="text-xs">
                Cập nhật: {lastUpdate.toLocaleTimeString('vi-VN')}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="time"
                    tick={{ fontSize: 10 }}
                    interval={2}
                    className="text-muted-foreground"
                  />
                  <YAxis tick={{ fontSize: 10 }} className="text-muted-foreground" />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar
                    dataKey="value"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-500" />
              Quick Actions
            </CardTitle>
            <CardDescription>Thao tác nhanh</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2">
              {quickActions.map((action) => (
                <QuickActionButton key={action.id} action={action} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alert Dashboard */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-orange-500" />
                  Alert Dashboard
                </CardTitle>
                <CardDescription>Cảnh báo và thông báo quan trọng</CardDescription>
              </div>
              <Badge variant={criticalAlerts.length > 0 ? 'destructive' : 'secondary'}>
                {alerts.filter(a => !a.isRead).length} mới
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[350px] px-6">
              <div className="space-y-3 pb-4">
                {alerts.map((alert) => (
                  <AlertItem
                    key={alert.id}
                    alert={alert}
                    onDismiss={handleDismissAlert}
                  />
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* AI Recommendations */}
        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-500" />
                  AI Recommendations
                </CardTitle>
                <CardDescription>Đề xuất thông minh từ AI</CardDescription>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Sparkles className="h-3 w-3 text-primary" />
                Powered by AI
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[350px] px-6">
              <div className="space-y-4 pb-4">
                {recommendations.map((rec) => (
                  <AIRecommendationCard key={rec.id} recommendation={rec} />
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Footer Stats */}
      <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-4">
        <div className="flex items-center gap-4">
          <span>Cập nhật lần cuối: {lastUpdate.toLocaleString('vi-VN')}</span>
          <span>|</span>
          <span>Auto-refresh: {isLive ? '30s' : 'Tắt'}</span>
        </div>
        <div className="flex items-center gap-2">
          <Server className="h-3 w-3" />
          <span>Lạc Việt HR v2.0</span>
          <span>|</span>
          <Globe className="h-3 w-3" />
          <span>Việt Nam</span>
        </div>
      </div>
    </div>
  )
}
