import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, AuthError } from '@/lib/auth/get-current-user'
import { canAccess } from '@/lib/auth/rbac'
import { BadRequest, Unauthorized, handleApiError } from '@/lib/api/errors'
import { apiSuccess } from '@/lib/api/response'
import { removeDiacritics } from '@/lib/utils/vietnamese'

// GET /api/search?q=term — Global search across contacts, companies, deals, quotes
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()

    const { searchParams } = req.nextUrl
    const q = searchParams.get('q')

    if (!q || q.trim().length < 2) {
      throw BadRequest('Từ khóa tìm kiếm cần ít nhất 2 ký tự')
    }

    const searchTerm = q.trim()
    const normalizedTerm = removeDiacritics(searchTerm)
    const searchTerms = [searchTerm]
    if (normalizedTerm !== searchTerm) searchTerms.push(normalizedTerm)

    const maxResults = 8
    const viewAll = canAccess(user, 'view_all')

    // RBAC: MEMBER sees only own records, MANAGER+ sees all
    const ownerFilter = viewAll ? {} : { ownerId: user.id }
    const createdByFilter = viewAll ? {} : { createdById: user.id }

    const [contacts, companies, deals, quotes] = await Promise.all([
      prisma.contact.findMany({
        where: {
          ...ownerFilter,
          OR: searchTerms.flatMap((term) => [
            { firstName: { contains: term, mode: 'insensitive' as const } },
            { lastName: { contains: term, mode: 'insensitive' as const } },
            { email: { contains: term, mode: 'insensitive' as const } },
            { phone: { contains: term, mode: 'insensitive' as const } },
          ]),
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          company: { select: { name: true } },
        },
        take: maxResults,
        orderBy: { updatedAt: 'desc' },
      }),

      prisma.company.findMany({
        where: {
          ...ownerFilter,
          OR: searchTerms.flatMap((term) => [
            { name: { contains: term, mode: 'insensitive' as const } },
            { domain: { contains: term, mode: 'insensitive' as const } },
            { email: { contains: term, mode: 'insensitive' as const } },
          ]),
        },
        select: {
          id: true,
          name: true,
          industry: true,
          _count: { select: { contacts: true, deals: true } },
        },
        take: maxResults,
        orderBy: { updatedAt: 'desc' },
      }),

      prisma.deal.findMany({
        where: {
          ...ownerFilter,
          OR: searchTerms.flatMap((term) => [
            { title: { contains: term, mode: 'insensitive' as const } },
          ]),
        },
        select: {
          id: true,
          title: true,
          value: true,
          stage: { select: { name: true, color: true } },
          company: { select: { name: true } },
        },
        take: maxResults,
        orderBy: { updatedAt: 'desc' },
      }),

      prisma.quote.findMany({
        where: {
          ...createdByFilter,
          OR: searchTerms.flatMap((term) => [
            { quoteNumber: { contains: term, mode: 'insensitive' as const } },
            { contact: { firstName: { contains: term, mode: 'insensitive' as const } } },
            { contact: { lastName: { contains: term, mode: 'insensitive' as const } } },
            { company: { name: { contains: term, mode: 'insensitive' as const } } },
          ]),
        },
        select: {
          id: true,
          quoteNumber: true,
          status: true,
          total: true,
          company: { select: { name: true } },
        },
        take: maxResults,
        orderBy: { updatedAt: 'desc' },
      }),
    ])

    return apiSuccess({ contacts, companies, deals, quotes })
  } catch (error) {
    if (error instanceof AuthError) {
      return handleApiError(Unauthorized(error.message), '/api/search')
    }
    return handleApiError(error, '/api/search')
  }
}
