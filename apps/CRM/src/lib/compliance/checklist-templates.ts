import { DEFAULT_CHECKLISTS } from '@/lib/constants'

export function getChecklistTemplate(dealType: string | null | undefined) {
  if (!dealType) return []
  return DEFAULT_CHECKLISTS[dealType] || []
}
