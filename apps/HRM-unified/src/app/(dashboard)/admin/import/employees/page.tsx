'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function ImportEmployeesPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const downloadTemplate = () => {
    window.open('/api/admin/import/templates/employees', '_blank')
  }

  const handleUpload = async () => {
    if (!file) return
    setLoading(true)
    setError('')

    const formData = new FormData()
    formData.append('file', file)
    formData.append('importType', 'employees')

    try {
      const res = await fetch('/api/admin/import/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.data?.jobId) {
        router.push('/admin/import')
      } else {
        setError(data.error || 'Upload failed')
      }
    } catch {
      setError('Upload failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Import nhân viên</h1>

      <Card>
        <CardHeader><CardTitle>Bước 1: Tải template</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">Tải file mẫu Excel, điền thông tin nhân viên theo format yêu cầu.</p>
          <Button variant="outline" onClick={downloadTemplate}>Tải Template Excel</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Bước 2: Upload file</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Input type="file" accept=".xlsx,.xls,.csv" onChange={e => setFile(e.target.files?.[0] || null)} />
          {file && <p className="text-sm text-muted-foreground">{file.name} ({(file.size / 1024).toFixed(1)} KB)</p>}
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button onClick={handleUpload} disabled={!file || loading}>{loading ? 'Đang xử lý...' : 'Upload & Import'}</Button>
        </CardContent>
      </Card>
    </div>
  )
}
