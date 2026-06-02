'use client'

import { WifiOff, RefreshCw, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function OfflinePage() {
  const handleRetry = () => {
    window.location.reload()
  }

  const handleHome = () => {
    window.location.href = '/'
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center max-w-md mx-auto space-y-6">
        {/* Icon */}
        <div className="mx-auto w-24 h-24 rounded-full bg-muted flex items-center justify-center">
          <WifiOff className="h-12 w-12 text-muted-foreground" />
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Không có kết nối</h1>
          <p className="text-muted-foreground">
            Bạn đang offline. Vui lòng kiểm tra kết nối mạng và thử lại.
          </p>
        </div>

        {/* Offline features info */}
        <div className="p-4 rounded-lg bg-muted/50 text-left space-y-2">
          <p className="text-sm font-medium">Khi offline, bạn vẫn có thể:</p>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Xem dữ liệu đã cache</li>
            <li>• Chấm công (sẽ đồng bộ khi online)</li>
            <li>• Xem thông tin cá nhân</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={handleRetry} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Thử lại
          </Button>
          <Button variant="outline" onClick={handleHome} className="gap-2">
            <Home className="h-4 w-4" />
            Trang chủ
          </Button>
        </div>

        {/* App info */}
        <p className="text-xs text-muted-foreground">
          Lạc Việt HR • Phiên bản 2.0
        </p>
      </div>
    </div>
  )
}
