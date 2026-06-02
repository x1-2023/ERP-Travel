/**
 * Promotion Templates API - List & Create
 * GET /api/planning/templates - List templates with filters & summary
 * POST /api/planning/templates - Create new template with initial version
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Prisma } from '@prisma/client';
import prisma from '../../_lib/prisma';
import { getUserFromRequest } from '../../_lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'GET') {
      return handleList(req, res);
    } else if (req.method === 'POST') {
      return handleCreate(req, res);
    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error: any) {
    console.error('Templates API error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}

async function handleList(req: VercelRequest, res: VercelResponse) {
  const {
    category,
    isPublic,
    search,
    page = '1',
    pageSize = '20',
  } = req.query as Record<string, string>;

  const pageNum = parseInt(page);
  const limit = parseInt(pageSize);
  const skip = (pageNum - 1) * limit;

  // Build where clause
  const where: any = {};

  if (category) {
    where.category = category;
  }

  if (isPublic !== undefined) {
    where.isPublic = isPublic === 'true';
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  // Get templates with pagination
  const [templates, total] = await Promise.all([
    prisma.promotionTemplate.findMany({
      where,
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { versions: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.promotionTemplate.count({ where }),
  ]);

  // Get summary stats
  const summaryStats = await prisma.promotionTemplate.groupBy({
    by: ['category', 'isPublic'],
    _count: { _all: true },
  });

  const byCategory: Record<string, number> = {};
  let publicCount = 0;
  let privateCount = 0;

  summaryStats.forEach((s) => {
    if (!byCategory[s.category]) byCategory[s.category] = 0;
    byCategory[s.category] += s._count._all;

    if (s.isPublic) {
      publicCount += s._count._all;
    } else {
      privateCount += s._count._all;
    }
  });

  return res.status(200).json({
    success: true,
    data: templates,
    pagination: {
      page: pageNum,
      pageSize: limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    summary: {
      total,
      public: publicCount,
      private: privateCount,
      byCategory,
    },
  });
}

async function handleCreate(req: VercelRequest, res: VercelResponse) {
  const user = getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const {
    name,
    description,
    category,
    channels,
    isPublic,
    companyId,
    templateData,
  } = req.body;

  // Validate required fields
  if (!name) {
    return res.status(400).json({
      error: 'Missing required field: name',
    });
  }

  // Check for duplicate name within company
  const existing = await prisma.promotionTemplate.findFirst({
    where: { name, companyId: companyId || user.companyId },
  });

  if (existing) {
    return res.status(400).json({
      error: `Template name '${name}' already exists`,
    });
  }

  // Create template with initial version in transaction
  const result = await prisma.$transaction(async (tx: any) => {
    // Create template
    const template = await tx.promotionTemplate.create({
      data: {
        name,
        description: description || null,
        template: templateData || {},
        category: category || 'CUSTOM',
        channels: channels || [],
        isPublic: isPublic || false,
        usageCount: 0,
        companyId: companyId || user.companyId,
        createdById: user.userId,
      },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Create initial version (version 1)
    await tx.templateVersion.create({
      data: {
        templateId: template.id,
        version: 1,
        snapshot: {
          name,
          description,
          category,
          channels,
          isPublic,
          templateData,
        },
        changes: Prisma.JsonNull,
        createdById: user.userId,
      },
    });

    return template;
  });

  return res.status(201).json({
    success: true,
    data: result,
  });
}
