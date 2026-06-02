'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { PageShell } from '@/components/layout/PageShell'
import { Button } from '@/components/ui/button'
import { ImportWizard } from '@/components/import/ImportWizard'
import { useTranslation } from '@/i18n'

export default function ImportCompaniesPage() {
  const { t } = useTranslation()
  const router = useRouter()

  return (
    <PageShell
      title={t('import.importCompanies')}
      actions={
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="border-[var(--crm-border)] text-[var(--crm-text-secondary)] hover:text-[var(--crm-text-primary)] hover:bg-[var(--crm-bg-subtle)]"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          {t('common.back')}
        </Button>
      }
    >
      <ImportWizard entity="companies" />
    </PageShell>
  )
}
