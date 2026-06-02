'use client'

import { useEffect, useState } from 'react'
import { FileText, Download, Loader2 } from 'lucide-react'

interface PortalDocument {
  id: string
  name: string
  fileName: string
  fileSize: number
  mimeType: string
  category: string
  version: number
  createdAt: string
  uploadedBy: { name: string }
}

const CATEGORY_LABELS: Record<string, string> = {
  PROPOSAL: 'Proposal',
  CONTRACT: 'Hợp đồng',
  NDA: 'NDA',
  COMPLIANCE: 'Compliance',
  TECHNICAL: 'Kỹ thuật',
  CERTIFICATE: 'Chứng chỉ',
  INVOICE: 'Hóa đơn',
  OTHER: 'Khác',
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1048576).toFixed(1)} MB`
}

export default function PortalDocumentsPage() {
  const [documents, setDocuments] = useState<PortalDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const token = localStorage.getItem('portal_token')
        if (!token) return

        const res = await fetch('/api/portal/documents', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const json = await res.json()
          setDocuments(json.data || [])
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleDownload = async (doc: PortalDocument) => {
    setDownloading(doc.id)
    try {
      const token = localStorage.getItem('portal_token')
      const res = await fetch(`/api/documents/${doc.id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      if (res.ok) {
        const { url } = await res.json()
        window.open(url, '_blank')
      }
    } finally {
      setDownloading(null)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Tài liệu</h1>

      {documents.length === 0 ? (
        <div className="text-center py-16 border border-gray-200 rounded-lg bg-gray-50">
          <FileText className="w-10 h-10 mx-auto text-gray-400 mb-3" />
          <p className="text-sm text-gray-500">Chưa có tài liệu nào</p>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500 px-4 py-3">Tên</th>
                <th className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500 px-4 py-3">Loại</th>
                <th className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500 px-4 py-3">Kích thước</th>
                <th className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500 px-4 py-3">Ngày</th>
                <th className="text-right text-xs font-semibold uppercase tracking-wide text-gray-500 px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr key={doc.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-400 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
                        <p className="text-xs text-gray-500">{doc.fileName}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                      {CATEGORY_LABELS[doc.category] || doc.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{formatFileSize(doc.fileSize)}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{new Date(doc.createdAt).toLocaleDateString('vi-VN')}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDownload(doc)}
                      disabled={downloading === doc.id}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors disabled:opacity-50"
                    >
                      {downloading === doc.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Download className="w-3.5 h-3.5" />
                      )}
                      Tải về
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
