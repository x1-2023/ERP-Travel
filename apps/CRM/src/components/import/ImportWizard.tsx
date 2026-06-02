'use client'

import { useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  Upload,
  Download,
  ArrowLeft,
  ArrowRight,
  Check,
  AlertCircle,
  FileText,
  X,
} from 'lucide-react'
import Papa from 'papaparse'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useTranslation } from '@/i18n'
import {
  parseCSV,
  autoMapColumns,
  CONTACT_CRM_FIELDS,
  COMPANY_CRM_FIELDS,
  type ColumnMapping,
  type ImportResult,
  type ImportError,
} from '@/lib/import/csv-importer'

interface ImportWizardProps {
  entity: 'contacts' | 'companies'
}

type Step = 'upload' | 'mapping' | 'preview' | 'result'

export function ImportWizard({ entity }: ImportWizardProps) {
  const { t } = useTranslation()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [step, setStep] = useState<Step>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [headers, setHeaders] = useState<string[]>([])
  const [rows, setRows] = useState<Record<string, string>[]>([])
  const [mapping, setMapping] = useState<ColumnMapping[]>([])
  const [duplicateAction, setDuplicateAction] = useState<'skip' | 'update' | 'create'>('skip')
  const [previewResult, setPreviewResult] = useState<ImportResult | null>(null)
  const [finalResult, setFinalResult] = useState<ImportResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const crmFields = entity === 'contacts' ? CONTACT_CRM_FIELDS : COMPANY_CRM_FIELDS
  const templateUrl = `/templates/${entity}-template.csv`
  const listUrl = entity === 'contacts' ? '/contacts' : '/companies'

  // ── Step 1: Upload ──────────────────────────────────────────────

  const handleFileSelect = useCallback(
    (selectedFile: File) => {
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError(t('import.fileTooLarge'))
        return
      }

      setFile(selectedFile)
      setError(null)

      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target?.result as string
        const parsed = parseCSV(text)
        setHeaders(parsed.headers)
        setRows(parsed.rows)

        // Auto-map columns
        const autoMapping = autoMapColumns(parsed.headers, entity)
        setMapping(autoMapping)
      }
      reader.readAsText(selectedFile)
    },
    [entity, t]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile && (droppedFile.name.endsWith('.csv') || droppedFile.name.endsWith('.tsv'))) {
        handleFileSelect(droppedFile)
      }
    },
    [handleFileSelect]
  )

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0]
      if (selectedFile) handleFileSelect(selectedFile)
    },
    [handleFileSelect]
  )

  // ── Step 2: Mapping ─────────────────────────────────────────────

  const updateMapping = useCallback(
    (csvColumn: string, crmField: string) => {
      setMapping((prev) =>
        prev.map((m) => (m.csvColumn === csvColumn ? { ...m, crmField } : m))
      )
    },
    []
  )

  const mappedCount = mapping.filter((m) => m.crmField && m.crmField !== '__skip__').length

  // ── Step 3: Preview (dryRun) ────────────────────────────────────

  const runPreview = useCallback(async () => {
    if (!file) return
    setLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('mapping', JSON.stringify(mapping))
      formData.append('duplicateAction', duplicateAction)
      formData.append('dryRun', 'true')

      const res = await fetch(`/api/${entity}/import`, {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || 'Preview failed')
      }

      const result = await res.json()
      setPreviewResult(result)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [file, mapping, duplicateAction, entity])

  // ── Step 4: Execute import ──────────────────────────────────────

  const runImport = useCallback(async () => {
    if (!file) return
    setLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('mapping', JSON.stringify(mapping))
      formData.append('duplicateAction', duplicateAction)
      formData.append('dryRun', 'false')

      const res = await fetch(`/api/${entity}/import`, {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || 'Import failed')
      }

      const result = await res.json()
      setFinalResult(result)
      setStep('result')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [file, mapping, duplicateAction, entity])

  // ── Error report download ───────────────────────────────────────

  const downloadErrorReport = useCallback(
    (errors: ImportError[]) => {
      const csvData = errors.map((e) => ({
        [t('import.rowNumber')]: e.row,
        [t('import.fieldName')]: e.field,
        [t('import.errorMessage')]: e.message,
      }))
      const csv = Papa.unparse(csvData)
      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `import-errors-${Date.now()}.csv`
      a.click()
      URL.revokeObjectURL(url)
    },
    [t]
  )

  // ── Navigation ──────────────────────────────────────────────────

  const goToMapping = () => setStep('mapping')
  const goToPreview = async () => {
    setStep('preview')
    await runPreview()
  }

  // ── Render ──────────────────────────────────────────────────────

  return (
    <div className="max-w-3xl space-y-3">
      {/* Step indicator */}
      <div className="flex items-center gap-2 text-xs">
        {(['upload', 'mapping', 'preview', 'result'] as Step[]).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            {i > 0 && <div className="w-8 h-px bg-[var(--crm-border)]" />}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-colors ${
                step === s
                  ? 'bg-[#10B981]/20 text-[#10B981]'
                  : i < ['upload', 'mapping', 'preview', 'result'].indexOf(step)
                    ? 'text-[#10B981]'
                    : 'text-[var(--crm-text-muted)]'
              }`}
            >
              <span className="font-medium">{i + 1}</span>
              <span>{t(`import.step${s.charAt(0).toUpperCase() + s.slice(1)}`)}</span>
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* ── STEP 1: Upload ── */}
      {step === 'upload' && (
        <div className="glass-card-static p-6 space-y-5">
          <h3 className="text-sm font-medium text-[var(--crm-text-primary)]">
            {t('import.uploadTitle', { entity: t(entity === 'contacts' ? 'contacts.title' : 'companies.title') })}
          </h3>

          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-[var(--crm-border)] rounded-xl p-10 text-center cursor-pointer hover:border-[#10B981]/40 transition-colors"
          >
            {file ? (
              <div className="flex items-center justify-center gap-3">
                <FileText className="w-8 h-8 text-[#10B981]" />
                <div className="text-left">
                  <p className="text-sm font-medium text-[var(--crm-text-primary)]">{file.name}</p>
                  <p className="text-xs text-[var(--crm-text-muted)]">
                    {rows.length} {t('import.rows')} &middot; {headers.length} {t('import.columns')}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setFile(null)
                    setHeaders([])
                    setRows([])
                    setMapping([])
                  }}
                  className="ml-2 p-1 rounded hover:bg-[var(--crm-bg-subtle)] text-[var(--crm-text-muted)]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <Upload className="w-10 h-10 text-[var(--crm-text-muted)] mx-auto mb-3" />
                <p className="text-sm text-[var(--crm-text-secondary)]">
                  {t('import.dropOrClick')}
                </p>
                <p className="text-xs text-[var(--crm-text-muted)] mt-1">
                  {t('import.supportedFormats')}
                </p>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.tsv"
              className="hidden"
              onChange={handleFileInput}
            />
          </div>

          <a
            href={templateUrl}
            download
            className="inline-flex items-center gap-1.5 text-xs text-[#10B981] hover:underline"
          >
            <Download className="w-3.5 h-3.5" />
            {t('import.downloadTemplate')}
          </a>

          <div className="flex justify-end">
            <Button
              onClick={goToMapping}
              disabled={!file || rows.length === 0}
              className="btn-accent-glow"
            >
              {t('import.next')}
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* ── STEP 2: Column Mapping ── */}
      {step === 'mapping' && (
        <div className="glass-card-static p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-[var(--crm-text-primary)]">
              {t('import.columnMapping')}
            </h3>
            <span className="text-xs text-[var(--crm-text-muted)]">
              {t('import.autoDetected', { n: mappedCount, total: headers.length })}
            </span>
          </div>

          <div className="space-y-2">
            {mapping.map((m) => (
              <div key={m.csvColumn} className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <span className="text-xs text-[var(--crm-text-secondary)] bg-[var(--crm-bg-subtle)] px-2 py-1 rounded font-mono truncate block">
                    {m.csvColumn}
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-[var(--crm-text-muted)] flex-shrink-0" />
                <Select
                  value={m.crmField || '__skip__'}
                  onValueChange={(v) => updateMapping(m.csvColumn, v)}
                >
                  <SelectTrigger className="w-[180px] h-8 input-premium bg-[var(--crm-bg-page)] border-[var(--crm-border)] text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__skip__" className="text-xs text-[var(--crm-text-muted)]">
                      ({t('import.skip')})
                    </SelectItem>
                    {crmFields.map((f) => (
                      <SelectItem key={f.value} value={f.value} className="text-xs">
                        {t(f.labelKey)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setStep('upload')}
              className="border-[var(--crm-border)] text-[var(--crm-text-secondary)]"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              {t('common.back')}
            </Button>
            <Button
              onClick={goToPreview}
              disabled={mappedCount === 0}
              className="btn-accent-glow"
            >
              {t('import.next')}
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* ── STEP 3: Preview & Duplicate Check ── */}
      {step === 'preview' && (
        <div className="glass-card-static p-6 space-y-5">
          <h3 className="text-sm font-medium text-[var(--crm-text-primary)]">
            {t('import.previewTitle')}
          </h3>

          {loading ? (
            <div className="py-8 text-center text-sm text-[var(--crm-text-muted)]">
              {t('import.analyzing')}
            </div>
          ) : previewResult ? (
            <>
              {/* Stats */}
              <div className="flex flex-wrap gap-3">
                <Badge className="badge-premium border-0 text-xs" style={{ backgroundColor: '#6B728020', color: '#6B7280' }}>
                  {t('import.totalRows')}: {previewResult.total}
                </Badge>
                <Badge className="badge-premium border-0 text-xs" style={{ backgroundColor: '#10B98120', color: '#10B981' }}>
                  {t('import.valid')}: {previewResult.created + previewResult.updated}
                </Badge>
                {previewResult.failed > 0 && (
                  <Badge className="badge-premium border-0 text-xs" style={{ backgroundColor: '#EF444420', color: '#EF4444' }}>
                    {t('import.errors')}: {previewResult.failed}
                  </Badge>
                )}
                {previewResult.skipped > 0 && (
                  <Badge className="badge-premium border-0 text-xs" style={{ backgroundColor: '#F59E0B20', color: '#F59E0B' }}>
                    {t('import.duplicates')}: {previewResult.skipped}
                  </Badge>
                )}
                {previewResult.updated > 0 && (
                  <Badge className="badge-premium border-0 text-xs" style={{ backgroundColor: '#3B82F620', color: '#3B82F6' }}>
                    {t('import.toUpdate')}: {previewResult.updated}
                  </Badge>
                )}
              </div>

              {/* Duplicate action selector */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-[var(--crm-text-secondary)] uppercase tracking-wide">
                  {t('import.duplicateHandling')}
                </label>
                <div className="flex flex-col gap-2">
                  {(['skip', 'update', 'create'] as const).map((action) => (
                    <label
                      key={action}
                      className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                        duplicateAction === action
                          ? 'border-[#10B981]/40 bg-[#10B981]/5'
                          : 'border-[var(--crm-border)] hover:bg-[var(--glass-bg)]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="duplicateAction"
                        value={action}
                        checked={duplicateAction === action}
                        onChange={() => setDuplicateAction(action)}
                        className="accent-[#10B981]"
                      />
                      <span className="text-sm text-[var(--crm-text-primary)]">
                        {t(`import.duplicate_${action}`)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Preview table */}
              {rows.length > 0 && (
                <div className="overflow-x-auto">
                  <p className="text-xs text-[var(--crm-text-muted)] mb-2">
                    {t('import.previewFirst5')}
                  </p>
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-[var(--crm-border)]">
                        <th className="py-2 px-2 text-left text-[var(--crm-text-muted)]">#</th>
                        {mapping
                          .filter((m) => m.crmField && m.crmField !== '__skip__')
                          .slice(0, 5)
                          .map((m) => (
                            <th key={m.csvColumn} className="py-2 px-2 text-left text-[var(--crm-text-muted)]">
                              {t(crmFields.find((f) => f.value === m.crmField)?.labelKey || m.crmField)}
                            </th>
                          ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.slice(0, 5).map((row, i) => (
                        <tr key={i} className="border-b border-[var(--crm-border-subtle)]">
                          <td className="py-2 px-2 text-[var(--crm-text-muted)]">{i + 1}</td>
                          {mapping
                            .filter((m) => m.crmField && m.crmField !== '__skip__')
                            .slice(0, 5)
                            .map((m) => (
                              <td key={m.csvColumn} className="py-2 px-2 text-[var(--crm-text-primary)]">
                                {row[m.csvColumn] || '-'}
                              </td>
                            ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Validation errors */}
              {previewResult.errors.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-red-400">
                    {t('import.validationErrors', { n: previewResult.errors.length })}
                  </p>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {previewResult.errors.slice(0, 10).map((err, i) => (
                      <p key={i} className="text-xs text-[var(--crm-text-muted)]">
                        {t('import.errorRow', { row: err.row })}: {err.field} — {err.message}
                      </p>
                    ))}
                    {previewResult.errors.length > 10 && (
                      <p className="text-xs text-[var(--crm-text-muted)]">
                        ...{t('import.andMore', { n: previewResult.errors.length - 10 })}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : null}

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setStep('mapping')}
              className="border-[var(--crm-border)] text-[var(--crm-text-secondary)]"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              {t('common.back')}
            </Button>
            <Button
              onClick={async () => {
                // Re-run preview if duplicate action changed
                await runPreview()
                await runImport()
              }}
              disabled={loading || !previewResult || (previewResult.created + previewResult.updated) === 0}
              className="btn-accent-glow"
            >
              {loading
                ? t('common.processing')
                : t('import.importCount', { n: previewResult ? previewResult.created + previewResult.updated : 0 })
              }
            </Button>
          </div>
        </div>
      )}

      {/* ── STEP 4: Results ── */}
      {step === 'result' && finalResult && (
        <div className="glass-card-static p-6 space-y-5">
          <div className="text-center py-4">
            <div className="w-12 h-12 rounded-full bg-[#10B981]/20 flex items-center justify-center mx-auto mb-3">
              <Check className="w-6 h-6 text-[#10B981]" />
            </div>
            <h3 className="text-lg font-medium text-[var(--crm-text-primary)]">
              {t('import.completed')}
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="text-center p-3 rounded-lg bg-[var(--crm-bg-subtle)]">
              <p className="text-2xl font-bold text-[#10B981]">{finalResult.created}</p>
              <p className="text-xs text-[var(--crm-text-muted)]">{t('import.created')}</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-[var(--crm-bg-subtle)]">
              <p className="text-2xl font-bold text-[#3B82F6]">{finalResult.updated}</p>
              <p className="text-xs text-[var(--crm-text-muted)]">{t('import.updated')}</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-[var(--crm-bg-subtle)]">
              <p className="text-2xl font-bold text-[#F59E0B]">{finalResult.skipped}</p>
              <p className="text-xs text-[var(--crm-text-muted)]">{t('import.skippedCount')}</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-[var(--crm-bg-subtle)]">
              <p className="text-2xl font-bold text-[#EF4444]">{finalResult.failed}</p>
              <p className="text-xs text-[var(--crm-text-muted)]">{t('import.failedCount')}</p>
            </div>
          </div>

          {finalResult.errors.length > 0 && (
            <button
              onClick={() => downloadErrorReport(finalResult.errors)}
              className="inline-flex items-center gap-1.5 text-xs text-[#10B981] hover:underline"
            >
              <Download className="w-3.5 h-3.5" />
              {t('import.downloadErrorReport')}
            </button>
          )}

          <div className="flex justify-center">
            <Button
              onClick={() => router.push(listUrl)}
              className="btn-accent-glow"
            >
              {t('import.viewList')}
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
