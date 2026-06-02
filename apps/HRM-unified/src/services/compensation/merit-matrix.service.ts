import { db } from '@/lib/db'

export async function getMeritMatrix(tenantId: string, year?: number) {
  const effectiveYear = year || new Date().getFullYear()
  return db.meritMatrix.findMany({
    where: { tenantId, effectiveYear, isActive: true },
    orderBy: [{ performanceRating: 'asc' }, { compaRatioMin: 'asc' }],
  })
}

export async function upsertMeritMatrix(tenantId: string, data: {
  performanceRating: number; compaRatioMin: number; compaRatioMax: number;
  meritIncreasePercent: number; compaRatioLabel?: string; effectiveYear: number;
}) {
  const existing = await db.meritMatrix.findFirst({
    where: {
      tenantId,
      effectiveYear: data.effectiveYear,
      performanceRating: data.performanceRating,
      compaRatioMin: data.compaRatioMin,
    },
  })
  if (existing) {
    return db.meritMatrix.update({
      where: { id: existing.id },
      data: { meritIncreasePercent: data.meritIncreasePercent, compaRatioLabel: data.compaRatioLabel },
    })
  }
  return db.meritMatrix.create({ data: { ...data, tenantId } })
}

export async function bulkUpsertMeritMatrix(tenantId: string, entries: {
  performanceRating: number; compaRatioMin: number; compaRatioMax: number;
  meritIncreasePercent: number; compaRatioLabel?: string; effectiveYear: number;
}[]) {
  const results = []
  for (const entry of entries) {
    const result = await upsertMeritMatrix(tenantId, entry)
    results.push(result)
  }
  return results
}
