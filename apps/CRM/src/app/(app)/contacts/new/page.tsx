'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

import { useTranslation } from '@/i18n'
import { PageShell } from '@/components/layout/PageShell'
import { Button } from '@/components/ui/button'
import { ContactForm } from '@/components/contacts/ContactForm'
import { useCreateContact } from '@/hooks/use-contacts'
import type { Contact } from '@/types'

export default function NewContactPage() {
  const router = useRouter()
  const createContact = useCreateContact()
  const { t } = useTranslation()

  function handleSubmit(data: Partial<Contact>) {
    createContact.mutate(data, {
      onSuccess: () => {
        router.push('/contacts')
      },
    })
  }

  return (
    <PageShell
      title={t('contacts.addNew')}
      actions={
        <Link href="/contacts">
          <Button
            variant="outline"
            size="sm"
            className="border-[var(--crm-border)] text-[var(--crm-text-secondary)] hover:text-[var(--crm-text-primary)]"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('common.cancel')}
          </Button>
        </Link>
      }
    >
      <ContactForm
        onSubmit={handleSubmit}
        isLoading={createContact.isPending}
      />
    </PageShell>
  )
}
