import {
  createReviewCycle,
  getReviewCycles,
  getReviewCycleById,
  launchReviewCycle,
} from './review.service'

export async function listCycles(tenantId: string, params: {
  status?: string
  year?: number
  page?: number
  pageSize?: number
}) {
  return getReviewCycles(tenantId, params)
}

export async function createCycle(tenantId: string, userId: string, data: Record<string, unknown>) {
  return createReviewCycle(tenantId, userId, data as any)
}

export async function getCycleById(tenantId: string, id: string) {
  return getReviewCycleById(id, tenantId)
}

export async function updateCycle(tenantId: string, id: string, _userId: string, data: Record<string, unknown>) {
  const { db } = await import('@/lib/db')
  return db.reviewCycle.update({
    where: { id, tenantId },
    data: data as Record<string, unknown>,
  })
}

export async function launchCycle(tenantId: string, id: string, _userId: string, _body: Record<string, unknown>) {
  return launchReviewCycle(id, tenantId)
}
