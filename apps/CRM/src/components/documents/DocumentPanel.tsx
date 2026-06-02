'use client'

import { useState, useRef } from 'react'
import { FileUp, Download, Trash2, Upload, File, FileText, FileCheck, Shield, Cpu, Award, Receipt } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { useDocuments, useUploadDocument, useDeleteDocument, useUploadVersion } from '@/hooks/use-documents'
import { toast } from '@/hooks/use-toast'
import { useTranslation } from '@/i18n'
import { DOCUMENT_CATEGORIES } from '@/lib/constants'

interface DocumentPanelProps {
  entityType: 'deal' | 'company' | 'contact'
  entityId: string
}

const CATEGORY_ICONS: Record<string, typeof File> = {
  PROPOSAL: FileText,
  CONTRACT: FileCheck,
  NDA: Shield,
  COMPLIANCE: Shield,
  TECHNICAL: Cpu,
  CERTIFICATE: Award,
  INVOICE: Receipt,
  OTHER: File,
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function DocumentPanel({ entityType, entityId }: DocumentPanelProps) {
  const { t } = useTranslation()
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadCategory, setUploadCategory] = useState('OTHER')
  const [uploadName, setUploadName] = useState('')

  const queryParams = {
    dealId: entityType === 'deal' ? entityId : undefined,
    companyId: entityType === 'company' ? entityId : undefined,
    contactId: entityType === 'contact' ? entityId : undefined,
    category: categoryFilter !== 'ALL' ? categoryFilter : undefined,
  }

  const { data: documents = [], isLoading } = useDocuments(queryParams)
  const uploadDoc = useUploadDocument()
  const deleteDoc = useDeleteDocument()
  const uploadVersion = useUploadVersion()

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)
    formData.append('name', uploadName || file.name)
    formData.append('category', uploadCategory)
    if (entityType === 'deal') formData.append('dealId', entityId)
    if (entityType === 'company') formData.append('companyId', entityId)
    if (entityType === 'contact') formData.append('contactId', entityId)

    uploadDoc.mutate(formData, {
      onSuccess: () => {
        toast({ title: t('document.uploaded') })
        setUploadName('')
        if (fileInputRef.current) fileInputRef.current.value = ''
      },
      onError: (err) => {
        toast({ title: t('common.error'), description: err.message, variant: 'destructive' })
      },
    })
  }

  const handleDownload = async (docId: string) => {
    try {
      const res = await fetch(`/api/documents/${docId}`)
      const json = await res.json()
      if (json.url) {
        window.open(json.url, '_blank')
      }
    } catch {
      toast({ title: t('common.error'), description: 'Download failed', variant: 'destructive' })
    }
  }

  const handleDelete = (docId: string) => {
    deleteDoc.mutate(docId, {
      onSuccess: () => toast({ title: t('document.deleted') }),
      onError: (err) => toast({ title: t('common.error'), description: err.message, variant: 'destructive' }),
    })
  }

  const handleUploadVersion = async (docId: string) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const formData = new FormData()
      formData.append('file', file)
      uploadVersion.mutate({ id: docId, formData }, {
        onSuccess: () => toast({ title: t('document.versionUploaded') }),
        onError: (err) => toast({ title: t('common.error'), description: err.message, variant: 'destructive' }),
      })
    }
    input.click()
  }

  return (
    <Card className="bg-[var(--crm-bg-card)] border-[var(--crm-border)]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-[var(--crm-text-primary)]">
            {t('document.title')} ({documents.length})
          </CardTitle>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[140px] h-8 text-xs bg-[var(--crm-bg-page)] border-[var(--crm-border)]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[var(--crm-bg-hover)] border-[var(--crm-border)]">
              <SelectItem value="ALL" className="text-xs">{t('common.all')}</SelectItem>
              {DOCUMENT_CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value} className="text-xs">
                  {t(cat.labelKey)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Upload area */}
        <div className="border border-dashed border-[var(--crm-border)] rounded-lg p-3 space-y-2">
          <div className="flex gap-2">
            <Input
              placeholder={t('document.namePlaceholder')}
              value={uploadName}
              onChange={(e) => setUploadName(e.target.value)}
              className="h-8 text-xs bg-[var(--crm-bg-page)] border-[var(--crm-border)] text-[var(--crm-text-primary)]"
            />
            <Select value={uploadCategory} onValueChange={setUploadCategory}>
              <SelectTrigger className="w-[120px] h-8 text-xs bg-[var(--crm-bg-page)] border-[var(--crm-border)]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[var(--crm-bg-hover)] border-[var(--crm-border)]">
                {DOCUMENT_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value} className="text-xs">
                    {t(cat.labelKey)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelect} />
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadDoc.isPending}
          >
            <FileUp className="w-3 h-3 mr-1" />
            {uploadDoc.isPending ? t('common.processing') : t('document.upload')}
          </Button>
        </div>

        {/* Document list */}
        {isLoading ? (
          <p className="text-xs text-[var(--crm-text-muted)]">{t('common.loading')}</p>
        ) : documents.length === 0 ? (
          <p className="text-xs text-[var(--crm-text-muted)] text-center py-4">
            {t('document.empty')}
          </p>
        ) : (
          <div className="space-y-2">
            {documents.map((doc) => {
              const IconComp = CATEGORY_ICONS[doc.category] || File
              return (
                <div
                  key={doc.id}
                  className="flex items-center gap-2 p-2 rounded-md bg-[var(--crm-bg-page)] border border-[var(--crm-border)]"
                >
                  <IconComp className="w-4 h-4 text-[var(--crm-text-muted)] flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[var(--crm-text-primary)] truncate">{doc.name}</p>
                    <p className="text-[10px] text-[var(--crm-text-muted)]">
                      {formatFileSize(doc.fileSize)} · v{doc.version} · {new Date(doc.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                    {t(DOCUMENT_CATEGORIES.find((c) => c.value === doc.category)?.labelKey || 'document.other')}
                  </Badge>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleDownload(doc.id)}>
                      <Download className="w-3 h-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleUploadVersion(doc.id)}>
                      <Upload className="w-3 h-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-red-400 hover:text-red-500" onClick={() => handleDelete(doc.id)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
