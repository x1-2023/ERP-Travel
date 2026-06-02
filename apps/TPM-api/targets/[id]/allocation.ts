import type { VercelResponse } from '@vercel/node';
import prisma from '../../_lib/prisma';
import { kamPlus, type AuthenticatedRequest } from '../../_lib/auth';

/**
 * /targets/:id/allocation
 * GET - Get allocation tree for a target
 * POST - Create new allocation for this target
 * Sprint 0+1: RBAC + Standard errors
 */

function generateAllocationCode(targetCode: string, geoCode: string): string {
  return `TA-${targetCode}-${geoCode}`;
}

export default kamPlus(async (req: AuthenticatedRequest, res: VercelResponse) => {
  const { id: targetId } = req.query as { id: string };
  if (!targetId) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Missing target id' } });

  try {
    const target = await prisma.target.findUnique({ where: { id: targetId } });
    if (!target) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Target not found' } });
    }

    if (req.method === 'GET') {
      const rootAllocations = await prisma.targetAllocation.findMany({
        where: { targetId, parentId: null },
        orderBy: { createdAt: 'asc' },
        include: {
          geographicUnit: true,
          children: {
            orderBy: { createdAt: 'asc' },
            include: {
              geographicUnit: true,
              children: {
                orderBy: { createdAt: 'asc' },
                include: {
                  geographicUnit: true,
                  children: {
                    orderBy: { createdAt: 'asc' },
                    include: {
                      geographicUnit: true,
                      children: {
                        orderBy: { createdAt: 'asc' },
                        include: { geographicUnit: true },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      const allAllocations = await prisma.targetAllocation.findMany({ where: { targetId } });
      const totalAllocated = allAllocations.reduce((sum, a) => sum + Number(a.targetValue), 0);
      const totalAchieved = allAllocations.reduce((sum, a) => sum + Number(a.achievedValue), 0);

      return res.status(200).json({
        success: true,
        data: rootAllocations,
        summary: {
          totalTarget: Number(target.totalTarget),
          totalAllocated,
          totalAchieved,
          unallocated: Number(target.totalTarget) - totalAllocated,
          overallProgress: Number(target.totalTarget) > 0
            ? Math.round((totalAchieved / Number(target.totalTarget)) * 1000) / 10
            : 0,
        },
      });
    }

    if (req.method === 'POST') {
      const { geographicUnitId, parentId, targetValue, metric, notes } = req.body;

      if (!geographicUnitId || targetValue === undefined) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Missing required fields: geographicUnitId, targetValue' },
        });
      }

      const geoUnit = await prisma.geographicUnit.findUnique({ where: { id: geographicUnitId } });
      if (!geoUnit) {
        return res.status(400).json({ success: false, error: { code: 'NOT_FOUND', message: 'Geographic unit not found' } });
      }

      const existing = await prisma.targetAllocation.findUnique({
        where: { targetId_geographicUnitId: { targetId, geographicUnitId } },
      });
      if (existing) {
        return res.status(409).json({
          success: false,
          error: { code: 'DUPLICATE_ENTRY', message: 'Allocation already exists for this geographic unit' },
        });
      }

      let parentAllocation = null;
      if (parentId) {
        parentAllocation = await prisma.targetAllocation.findUnique({ where: { id: parentId } });
        if (!parentAllocation) {
          return res.status(400).json({ success: false, error: { code: 'NOT_FOUND', message: 'Parent allocation not found' } });
        }
        if (parentAllocation.targetId !== targetId) {
          return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Parent allocation belongs to different target' } });
        }

        const parentRemaining = Number(parentAllocation.targetValue) - Number(parentAllocation.childrenTarget);
        if (Number(targetValue) > parentRemaining) {
          return res.status(422).json({
            success: false,
            error: {
              code: 'INSUFFICIENT_FUND',
              message: `Target value (${targetValue}) exceeds parent remaining (${parentRemaining})`,
            },
          });
        }
      } else {
        const currentRootTotal = await prisma.targetAllocation.aggregate({
          where: { targetId, parentId: null },
          _sum: { targetValue: true },
        });
        const totalRootTarget = Number(currentRootTotal._sum.targetValue || 0);
        if (totalRootTarget + Number(targetValue) > Number(target.totalTarget)) {
          return res.status(422).json({
            success: false,
            error: {
              code: 'INSUFFICIENT_FUND',
              message: `Total root allocations exceed target total`,
            },
          });
        }
      }

      const code = generateAllocationCode(target.code, geoUnit.code);

      const allocation = await prisma.targetAllocation.create({
        data: {
          code,
          targetId,
          geographicUnitId,
          parentId: parentId || null,
          targetValue: Number(targetValue),
          metric: metric || target.metric,
          notes: notes || null,
          createdBy: req.auth.userId,
        },
        include: {
          target: { select: { id: true, code: true, name: true, metric: true } },
          geographicUnit: true,
          parent: { select: { id: true, code: true } },
        },
      });

      if (parentId && parentAllocation) {
        await prisma.targetAllocation.update({
          where: { id: parentId },
          data: { childrenTarget: Number(parentAllocation.childrenTarget) + Number(targetValue) },
        });
      }

      return res.status(201).json({ success: true, data: allocation });
    }

    return res.status(405).json({ success: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'Method not allowed' } });
  } catch (error) {
    console.error('Target allocation error:', error);
    return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } });
  }
});
