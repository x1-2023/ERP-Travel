// src/services/engagement/recognition.service.ts
// Recognition & Kudos Service

import { db } from '@/lib/db'

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface CreateRecognitionInput {
  receiverId: string
  categoryId: string
  message: string
  isPublic?: boolean
}

// ═══════════════════════════════════════════════════════════════
// RECOGNITIONS
// ═══════════════════════════════════════════════════════════════

export async function createRecognition(tenantId: string, giverId: string, input: CreateRecognitionInput) {
  // Get category for points value
  const category = await db.recognitionCategory.findFirst({
    where: { id: input.categoryId, tenantId, isActive: true }
  })
  if (!category) throw new Error('Category not found')

  return db.recognition.create({
    data: {
      tenantId,
      giverId,
      receiverId: input.receiverId,
      categoryId: input.categoryId,
      message: input.message,
      isPublic: input.isPublic ?? true,
      pointsAwarded: category.pointsValue,
    },
    include: {
      giver: { select: { id: true, fullName: true } },
      receiver: { select: { id: true, fullName: true } },
      category: true,
    }
  })
}

export async function listRecognitions(tenantId: string, filters?: {
  receiverId?: string
  giverId?: string
  isPublic?: boolean
  page?: number
  limit?: number
}) {
  const page = filters?.page || 1
  const limit = filters?.limit || 20
  const where: Record<string, unknown> = { tenantId }
  if (filters?.receiverId) where.receiverId = filters.receiverId
  if (filters?.giverId) where.giverId = filters.giverId
  if (filters?.isPublic !== undefined) where.isPublic = filters.isPublic

  const [recognitions, total] = await Promise.all([
    db.recognition.findMany({
      where,
      include: {
        giver: { select: { id: true, fullName: true } },
        receiver: { select: { id: true, fullName: true } },
        category: true,
        reactions: { select: { id: true, emoji: true, employeeId: true } },
        comments: { select: { id: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.recognition.count({ where })
  ])

  return {
    recognitions: recognitions.map(r => ({
      ...r,
      reactionCount: r.reactions.length,
      commentCount: r.comments.length,
    })),
    total,
    page,
    limit,
  }
}

export async function getRecognition(tenantId: string, recognitionId: string) {
  return db.recognition.findFirst({
    where: { id: recognitionId, tenantId },
    include: {
      giver: { select: { id: true, fullName: true } },
      receiver: { select: { id: true, fullName: true } },
      category: true,
      reactions: {
        include: { employee: { select: { id: true, fullName: true } } }
      },
      comments: {
        include: { author: { select: { id: true, fullName: true } } },
        orderBy: { createdAt: 'asc' },
      },
    }
  })
}

// ═══════════════════════════════════════════════════════════════
// REACTIONS
// ═══════════════════════════════════════════════════════════════

export async function addReaction(tenantId: string, recognitionId: string, employeeId: string, emoji: string) {
  const recognition = await db.recognition.findFirst({ where: { id: recognitionId, tenantId } })
  if (!recognition) throw new Error('Recognition not found')

  // Upsert - if already reacted, update the emoji
  return db.recognitionReaction.upsert({
    where: { recognitionId_employeeId: { recognitionId, employeeId } },
    update: { emoji },
    create: { recognitionId, employeeId, emoji },
  })
}

// ═══════════════════════════════════════════════════════════════
// COMMENTS
// ═══════════════════════════════════════════════════════════════

export async function getComments(tenantId: string, recognitionId: string) {
  const recognition = await db.recognition.findFirst({ where: { id: recognitionId, tenantId } })
  if (!recognition) throw new Error('Recognition not found')

  return db.recognitionComment.findMany({
    where: { recognitionId },
    include: {
      author: { select: { id: true, fullName: true } }
    },
    orderBy: { createdAt: 'asc' },
  })
}

export async function addComment(tenantId: string, recognitionId: string, authorId: string, content: string) {
  const recognition = await db.recognition.findFirst({ where: { id: recognitionId, tenantId } })
  if (!recognition) throw new Error('Recognition not found')

  return db.recognitionComment.create({
    data: { recognitionId, authorId, content },
    include: {
      author: { select: { id: true, fullName: true } }
    }
  })
}

// ═══════════════════════════════════════════════════════════════
// CATEGORIES
// ═══════════════════════════════════════════════════════════════

export async function listCategories(tenantId: string) {
  return db.recognitionCategory.findMany({
    where: { tenantId, isActive: true },
    orderBy: { sortOrder: 'asc' },
  })
}
