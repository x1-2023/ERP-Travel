'use client'

import { useState } from 'react'
import { Plus, Activity as ActivityIcon } from 'lucide-react'
import { PageShell } from '@/components/layout/PageShell'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { ActivityFeed } from '@/components/activities/ActivityFeed'
import { ActivityForm } from '@/components/activities/ActivityForm'
import { useActivities, useCreateActivity, useUpdateActivity } from '@/hooks/use-activities'
import { useContacts } from '@/hooks/use-contacts'
import { useDeals } from '@/hooks/use-deals'
import { usePermissions } from '@/hooks/use-permissions'
import { useTranslation } from '@/i18n'

const TAB_KEYS = [
  { value: 'ALL', labelKey: 'activities.all' },
  { value: 'CALL', labelKey: 'activities.calls' },
  { value: 'EMAIL', labelKey: 'activities.emails' },
  { value: 'MEETING', labelKey: 'activities.meetings' },
  { value: 'TASK', labelKey: 'activities.tasks' },
  { value: 'INCOMPLETE', labelKey: 'activities.incomplete' },
] as const

export default function ActivitiesPage() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('ALL')
  const [dialogOpen, setDialogOpen] = useState(false)
  const { canCreate } = usePermissions()

  // Build query params from selected tab
  const params = (() => {
    if (activeTab === 'INCOMPLETE') return { completed: 'false' }
    if (activeTab !== 'ALL') return { type: activeTab }
    return {}
  })()

  const { data, isLoading } = useActivities(params)
  const createActivity = useCreateActivity()
  const updateActivity = useUpdateActivity()

  // Fetch contacts & deals for the form selectors
  const { data: contactsData } = useContacts({ limit: 100 })
  const { data: dealsData } = useDeals({ limit: 100 })

  const activities = data?.data || []
  const contacts = (contactsData?.data || []).map((c) => ({
    id: c.id,
    firstName: c.firstName,
    lastName: c.lastName,
  }))
  const deals = (dealsData?.data || []).map((d) => ({
    id: d.id,
    title: d.title,
  }))

  const handleCreate = (formData: Record<string, unknown>) => {
    createActivity.mutate(formData as Parameters<typeof createActivity.mutate>[0], {
      onSuccess: () => setDialogOpen(false),
    })
  }

  const handleToggleComplete = (id: string, completed: boolean) => {
    updateActivity.mutate({
      id,
      isCompleted: completed,
      completedAt: completed ? new Date().toISOString() : null,
    } as Parameters<typeof updateActivity.mutate>[0])
  }

  return (
    <PageShell
      title={t('activities.title')}
      description={t('activities.description')}
      actions={
        canCreate ? (
          <Button
            onClick={() => setDialogOpen(true)}
            className="bg-[#10B981] hover:bg-[#10B981]/90 text-white"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            {t('activities.logActivity')}
          </Button>
        ) : undefined
      }
    >
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-[var(--crm-bg-card)] border border-[var(--crm-border)]">
          {TAB_KEYS.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="text-[var(--crm-text-secondary)] data-[state=active]:bg-[#10B981]/10 data-[state=active]:text-[#10B981]"
            >
              {t(tab.labelKey)}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* All tabs render the same feed, filtered server-side */}
        {TAB_KEYS.map((tab) => (
          <TabsContent key={tab.value} value={tab.value}>
            <Card className="bg-[var(--crm-bg-card)] border-[var(--crm-border)] p-4 mt-2">
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex gap-3">
                      <Skeleton className="w-10 h-10 rounded-full bg-[var(--crm-bg-subtle)]" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-48 bg-[var(--crm-bg-subtle)]" />
                        <Skeleton className="h-3 w-32 bg-[var(--crm-bg-subtle)]" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : activities.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <ActivityIcon className="w-12 h-12 text-[#333] mb-3" />
                  <p className="text-[var(--crm-text-secondary)] text-sm">{t('activities.empty')}</p>
                  <p className="text-[var(--crm-text-muted)] text-xs mt-1">{t('activities.emptyHint')}</p>
                </div>
              ) : (
                <ActivityFeed
                  activities={activities}
                  onToggleComplete={handleToggleComplete}
                />
              )}
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Create Activity Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-[var(--crm-bg-card)] border-[var(--crm-border)] text-[var(--crm-text-primary)] sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-[var(--crm-text-primary)]">{t('activities.logActivity')}</DialogTitle>
            <DialogDescription className="text-[var(--crm-text-muted)]">
              {t('activities.logActivityDesc')}
            </DialogDescription>
          </DialogHeader>
          <ActivityForm
            onSubmit={handleCreate}
            contacts={contacts}
            deals={deals}
            isSubmitting={createActivity.isPending}
          />
        </DialogContent>
      </Dialog>
    </PageShell>
  )
}
