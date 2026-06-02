import { prisma } from '@/lib/prisma'
import type { ContactWithCompany } from './template-engine'
import { resolveAudienceByRules } from './rule-engine'
import type { AudienceRules } from '@/lib/audience-fields'

export interface ResolvedContact extends ContactWithCompany {
  id: string
}

/**
 * Resolve audience members to contacts with emails.
 * STATIC: query AudienceMember table.
 * DYNAMIC: evaluate rules against contacts.
 * Filters out: contacts without email, unsubscribed emails.
 */
export async function getAudienceContacts(
  audienceId: string
): Promise<ResolvedContact[]> {
  // Check audience type
  const audience = await prisma.audience.findUnique({
    where: { id: audienceId },
    select: { type: true, rules: true },
  })

  if (!audience) return []

  // DYNAMIC: resolve by rules
  if (audience.type === 'DYNAMIC' && audience.rules) {
    return resolveAudienceByRules(audience.rules as unknown as AudienceRules)
  }

  // STATIC: existing logic
  const members = await prisma.audienceMember.findMany({
    where: { audienceId },
    include: {
      contact: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          jobTitle: true,
          company: { select: { name: true } },
        },
      },
    },
  })

  // Get all unsubscribed emails
  const unsubscribed = await prisma.unsubscribe.findMany({
    select: { email: true },
  })
  const unsubscribedSet = new Set(unsubscribed.map((u) => u.email.toLowerCase()))

  // Filter: must have email, not unsubscribed
  return members
    .map((m) => m.contact)
    .filter((c): c is ResolvedContact => {
      if (!c.email) return false
      if (unsubscribedSet.has(c.email.toLowerCase())) return false
      return true
    })
}
