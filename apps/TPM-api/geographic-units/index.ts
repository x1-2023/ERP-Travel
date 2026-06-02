import type { VercelResponse } from '@vercel/node';
import prisma from '../_lib/prisma';
import { kamPlus, type AuthenticatedRequest } from '../_lib/auth';

/**
 * /geographic-units
 * GET - List/tree geographic units (KAM+)
 * POST - Create new geographic unit (KAM+)
 * Sprint 0+1: RBAC + Standard errors
 */

export default kamPlus(async (req: AuthenticatedRequest, res: VercelResponse) => {
  try {
    if (req.method === 'GET') {
      const { level, parentId, tree, search } = req.query as Record<string, string>;

      if (tree === 'true') {
        const rootUnits = await prisma.geographicUnit.findMany({
          where: { parentId: null, isActive: true },
          orderBy: { sortOrder: 'asc' },
          include: {
            children: {
              where: { isActive: true },
              orderBy: { sortOrder: 'asc' },
              include: {
                children: {
                  where: { isActive: true },
                  orderBy: { sortOrder: 'asc' },
                  include: {
                    children: {
                      where: { isActive: true },
                      orderBy: { sortOrder: 'asc' },
                      include: {
                        children: {
                          where: { isActive: true },
                          orderBy: { sortOrder: 'asc' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        });

        return res.status(200).json({ success: true, data: rootUnits });
      }

      const where: Record<string, unknown> = { isActive: true };

      if (level) where.level = level;
      if (parentId) where.parentId = parentId;
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { code: { contains: search, mode: 'insensitive' } },
          { nameEn: { contains: search, mode: 'insensitive' } },
        ];
      }

      const units = await prisma.geographicUnit.findMany({
        where,
        orderBy: [{ level: 'asc' }, { sortOrder: 'asc' }],
        include: {
          parent: { select: { id: true, code: true, name: true, level: true } },
          _count: { select: { children: true, budgetAllocations: true, targetAllocations: true } },
        },
      });

      return res.status(200).json({ success: true, data: units });
    }

    if (req.method === 'POST') {
      const { code, name, nameEn, level, parentId, latitude, longitude, sortOrder } = req.body;

      if (!code || !name || !level) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Missing required fields: code, name, level' },
        });
      }

      const validLevels = ['COUNTRY', 'REGION', 'PROVINCE', 'DISTRICT', 'DEALER'];
      if (!validLevels.includes(level)) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Invalid geographic level' },
        });
      }

      const existing = await prisma.geographicUnit.findUnique({ where: { code } });
      if (existing) {
        return res.status(409).json({
          success: false,
          error: { code: 'DUPLICATE_ENTRY', message: 'Geographic unit code already exists' },
        });
      }

      if (parentId) {
        const parent = await prisma.geographicUnit.findUnique({ where: { id: parentId } });
        if (!parent) {
          return res.status(404).json({
            success: false,
            error: { code: 'NOT_FOUND', message: 'Parent geographic unit not found' },
          });
        }
      }

      const unit = await prisma.geographicUnit.create({
        data: {
          code,
          name,
          nameEn: nameEn || null,
          level,
          parentId: parentId || null,
          latitude: latitude ? parseFloat(latitude) : null,
          longitude: longitude ? parseFloat(longitude) : null,
          sortOrder: sortOrder ? parseInt(sortOrder) : 0,
        },
        include: {
          parent: { select: { id: true, code: true, name: true, level: true } },
        },
      });

      return res.status(201).json({ success: true, data: unit });
    }

    return res.status(405).json({ success: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'Method not allowed' } });
  } catch (error) {
    console.error('Geographic Units error:', error);
    return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } });
  }
});
