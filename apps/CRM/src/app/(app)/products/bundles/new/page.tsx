'use client'

import { PageShell } from '@/components/layout/PageShell'
import { BundleBuilder } from '@/components/bundles/BundleBuilder'
import { useTranslation } from '@/i18n'

export default function NewBundlePage() {
  const { t } = useTranslation()

  return (
    <PageShell title={t('bundles.create')}>
      <BundleBuilder />
    </PageShell>
  )
}
