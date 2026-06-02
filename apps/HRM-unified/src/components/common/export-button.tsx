'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, Loader2 } from 'lucide-react'

interface ExportButtonProps {
  /** API endpoint to call for export (e.g. '/api/admin/export/employees') */
  endpoint: string
  /** Optional query params to append (e.g. { departmentId: '123' }) */
  params?: Record<string, string | undefined>
  /** Button label (default: 'Xuất Excel') */
  label?: string
  /** Downloaded file name */
  fileName?: string
  /** Button variant */
  variant?: 'default' | 'outline' | 'secondary' | 'ghost'
  /** Button size */
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

export function ExportButton({
  endpoint,
  params,
  label = 'Xuất Excel',
  fileName,
  variant = 'outline',
  size = 'sm',
}: ExportButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleExport = async () => {
    setLoading(true)
    try {
      const url = new URL(endpoint, window.location.origin)
      if (params) {
        for (const [key, value] of Object.entries(params)) {
          if (value) url.searchParams.set(key, value)
        }
      }

      const res = await fetch(url.toString())
      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: 'Export failed' }))
        throw new Error(error.error || 'Export failed')
      }

      const blob = await res.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = fileName || getFileNameFromResponse(res) || 'export.xlsx'
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(downloadUrl)
    } catch (error) {
      console.error('Export error:', error)
      alert(error instanceof Error ? error.message : 'Xuất file thất bại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button variant={variant} size={size} onClick={handleExport} disabled={loading}>
      {loading ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Download className="h-4 w-4 mr-1.5" />}
      {label}
    </Button>
  )
}

function getFileNameFromResponse(res: Response): string | null {
  const disposition = res.headers.get('Content-Disposition')
  if (!disposition) return null
  const match = disposition.match(/filename="?(.+)"?/)
  return match ? match[1] : null
}
