'use client'

import { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'

interface PdfDownloadButtonProps {
  url: string
  filename: string
  label?: string
  variant?: 'default' | 'outline' | 'ghost'
  className?: string
}

export function PdfDownloadButton({
  url,
  filename,
  label = 'Tải PDF',
  variant = 'outline',
  className,
}: PdfDownloadButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleDownload = async () => {
    setLoading(true)
    try {
      const response = await fetch(url)

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.error || 'Không thể tạo PDF')
      }

      const blob = await response.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(blobUrl)
    } catch (error: any) {
      toast({
        title: 'Lỗi tạo PDF',
        description: error.message || 'Đã xảy ra lỗi khi tạo PDF',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant={variant}
      onClick={handleDownload}
      disabled={loading}
      className={className || 'border-[var(--crm-border)] text-[var(--crm-text-secondary)] hover:text-[var(--crm-text-primary)] hover:bg-[var(--crm-bg-subtle)]'}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
      ) : (
        <Download className="w-4 h-4 mr-1.5" />
      )}
      {loading ? 'Đang tạo...' : label}
    </Button>
  )
}
