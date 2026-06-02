import type { VercelResponse } from '@vercel/node';
import prisma from '../_lib/prisma';
import { kamPlus, type AuthenticatedRequest } from '../_lib/auth';

/**
 * /geographic-units/:id
 * GET - Get single geographic unit
 * PUT/PATCH - Update geographic unit
 * DELETE - Delete geographic unit
 * Sprint 0+1: RBAC + Standard errors
 */
export default kamPlus(async (req: AuthenticatedRequest, res: VercelResponse) => {
  const { id } = req.query;
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Missing or invalid id' } });
  }

  try {
    if (req.method === 'GET') {
      const { includeTree } = req.query as Record<string, string>;

      const unit = await prisma.geographicUnit.findUnique({
        where: { id },
        include: {
          parent: { select: { id: true, code: true, name: true, level: true } },
          children: includeTree === 'true' ? {
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
          } : {
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' },
          },
          _count: { select: { children: true, budgetAllocations: true, targetAllocations: true } },
        },
      });

      if (!unit) {
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Geographic unit not found' } });
      }

      return res.status(200).json({ success: true, data: unit });
    }

    if (req.method === 'PUT' || req.method === 'PATCH') {
      const { name, nameEn, parentId, latitude, longitude, sortOrder, isActive } = req.body;

      const existing = await prisma.geographicUnit.findUnique({ where: { id } });
      if (!existing) {
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Geographic unit not found' } });
      }

      if (parentId && parentId !== existing.parentId) {
        const parent = await prisma.geographicUnit.findUnique({ where: { id: parentId } });
        if (!parent) {
          return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Parent geographic unit not found' } });
        }
        if (parentId === id) {
          return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Cannot set self as parent' } });
        }
      }

      const updated = await prisma.geographicUnit.update({
        where: { id },
        data: {
          name: name ?? existing.name,
          nameEn: nameEn !== undefined ? nameEn : existing.nameEn,
          parentId: parentId !== undefined ? parentId : existing.parentId,
          latitude: latitude !== undefined ? (latitude ? parseFloat(latitude) : null) : existing.latitude,
          longitude: longitude !== undefined ? (longitude ? parseFloat(longitude) : null) : existing.longitude,
          sortOrder: sortOrder !== undefined ? parseInt(sortOrder) : existing.sortOrder,
          isActive: isActive !== undefined ? isActive : existing.isActive,
        },
        include: {
          parent: { select: { id: true, code: true, name: true, level: true } },
        },
      });

      return res.status(200).json({ success: true, data: updated });
    }

    if (req.method === 'DELETE') {
      const existing = await prisma.geographicUnit.findUnique({
        where: { id },
        include: { _count: { select: { children: true, budgetAllocations: true, targetAllocations: true } } },
      });

      if (!existing) {
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Geographic unit not found' } });
      }

      if (existing._count.children > 0) {
        return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Cannot delete: has child units' } });
      }
      if (existing._count.budgetAllocations > 0 || existing._count.targetAllocations > 0) {
        return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Cannot delete: has linked allocations' } });
      }

      await prisma.geographicUnit.delete({ where: { id } });
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ success: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'Method not allowed' } });
  } catch (error) {
    console.error('Geographic Unit error:', error);
    return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } });
  }
});
