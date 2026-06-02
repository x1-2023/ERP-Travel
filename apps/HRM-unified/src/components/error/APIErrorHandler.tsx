'use client'

import { AlertCircle, RefreshCw, WifiOff, ShieldX, FileX } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface APIError {
  status?: number
  message?: string
  code?: string
}

interface Props {
  error: APIError | Error | null
  onRetry?: () => void
  compact?: boolean
}

function getErrorDetails(error: APIError | Error) {
  if ('status' in error) {
    switch (error.status) {
      case 400:
        return {
          icon: AlertCircle,
          title: 'Yêu cầu không hợp lệ',
          description: error.message || 'Dữ liệu gửi lên không đúng định dạng.',
          color: 'yellow'
        }
      case 401:
        return {
          icon: ShieldX,
          title: 'Chưa đăng nhập',
          description: 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.',
          color: 'orange'
        }
      case 403:
        return {
          icon: ShieldX,
          title: 'Không có quyền truy cập',
          description: 'Bạn không có quyền thực hiện thao tác này.',
          color: 'red'
        }
      case 404:
        return {
          icon: FileX,
          title: 'Không tìm thấy',
          description: error.message || 'Dữ liệu yêu cầu không tồn tại.',
          color: 'gray'
        }
      case 500:
        return {
          icon: AlertCircle,
          title: 'Lỗi máy chủ',
          description: 'Đã xảy ra lỗi. Vui lòng thử lại sau.',
          color: 'red'
        }
      default:
        return {
          icon: WifiOff,
          title: 'Lỗi kết nối',
          description: error.message || 'Không thể kết nối đến máy chủ.',
          color: 'red'
        }
    }
  }

  return {
    icon: AlertCircle,
    title: 'Đã xảy ra lỗi',
    description: error.message || 'Vui lòng thử lại.',
    color: 'red'
  }
}

export function APIErrorHandler({ error, onRetry, compact = false }: Props) {
  if (!error) return null

  const details = getErrorDetails(error)
  const Icon = details.icon

  const colorClasses = {
    red: 'bg-red-500/10 border-red-500/20 text-red-400',
    yellow: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
    orange: 'bg-orange-500/10 border-orange-500/20 text-orange-400',
    gray: 'bg-zinc-500/10 border-zinc-500/20 text-zinc-400'
  }

  const iconColorClasses = {
    red: 'text-red-500',
    yellow: 'text-yellow-500',
    orange: 'text-orange-500',
    gray: 'text-zinc-500'
  }

  if (compact) {
    return (
      <div className={`flex items-center gap-3 p-3 rounded-lg border ${colorClasses[details.color as keyof typeof colorClasses]}`}>
        <Icon className={`w-5 h-5 flex-shrink-0 ${iconColorClasses[details.color as keyof typeof iconColorClasses]}`} />
        <span className="text-sm flex-1">{details.description}</span>
        {onRetry && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRetry}
            className="text-zinc-400 hover:text-zinc-100"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className={`rounded-lg border p-6 ${colorClasses[details.color as keyof typeof colorClasses]}`}>
      <div className="flex flex-col items-center text-center">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${details.color === 'red' ? 'bg-red-500/20' : details.color === 'yellow' ? 'bg-yellow-500/20' : details.color === 'orange' ? 'bg-orange-500/20' : 'bg-zinc-500/20'}`}>
          <Icon className={`w-6 h-6 ${iconColorClasses[details.color as keyof typeof iconColorClasses]}`} />
        </div>

        <h3 className="text-lg font-semibold text-zinc-100 mb-1">
          {details.title}
        </h3>

        <p className="text-sm text-zinc-400 mb-4">
          {details.description}
        </p>

        {onRetry && (
          <Button
            variant="outline"
            onClick={onRetry}
            className="gap-2 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
          >
            <RefreshCw className="w-4 h-4" />
            Thử lại
          </Button>
        )}
      </div>
    </div>
  )
}

export default APIErrorHandler
