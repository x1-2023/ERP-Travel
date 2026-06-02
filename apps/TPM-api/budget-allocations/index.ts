import type { VercelResponse } from '@vercel/node';
import prisma from '../_lib/prisma';
import { kamPlus, type AuthenticatedRequest } from '../_lib/auth';

/**
 * /budget-allocations
 * GET - List/tree budget allocations
 * POST - Create new budget allocation
 * Sprint 0+1: RBAC + Standard errors
 */

function generateAllocationCode(budgetCode: string, geoCode: string): string {
  return `BA-${budgetCode}-${geoCode}`;
}

function calculateAvailable(allocated: number, childrenAllocated: number): number {
  return Math.max(0, allocated - childrenAllocated);
}

export default kamPlus(async (req: AuthenticatedRequest, res: VercelResponse) => {
  try {
    if (req.method === 'GET') {
      const { budgetId, tree, parentId, status, geographicUnitId } = req.query as Record<string, string>;

      if (tree === 'true' && budgetId) {
        const rootAllocations = await prisma.budgetAllocation.findMany({
          where: { budgetId, parentId: null },
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

        return res.status(200).json({ success: true, data: rootAllocations });
      }

      const where: Record<string, unknown> = {};
      if (budgetId) where.budgetId = budgetId;
      if (parentId) where.parentId = parentId;
      if (status) where.status = status;
      if (geographicUnitId) where.geographicUnitId = geographicUnitId;

      const allocations = await prisma.budgetAllocation.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          budget: { select: { id: true, code: true, name: true, totalAmount: true } },
          geographicUnit: true,
          parent: { select: { id: true, code: true, allocatedAmount: true } },
          _count: { select: { children: true } },
        },
      });

      return res.status(200).json({ success: true, data: allocations });
    }

    if (req.method === 'POST') {
      const { budgetId, geographicUnitId, parentId, allocatedAmount, notes } = req.body;

      if (!budgetId || !geographicUnitId || allocatedAmount === undefined) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Missing required fields: budgetId, geographicUnitId, allocatedAmount' },
        });
      }

      const budget = await prisma.budget.findUnique({ where: { id: budgetId } });
      if (!budget) {
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Budget not found' } });
      }

      const geoUnit = await prisma.geographicUnit.findUnique({ where: { id: geographicUnitId } });
      if (!geoUnit) {
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Geographic unit not found' } });
      }

      const existing = await prisma.budgetAllocation.findUnique({
        where: { budgetId_geographicUnitId: { budgetId, geographicUnitId } },
      });
      if (existing) {
        return res.status(409).json({
          success: false,
          error: { code: 'DUPLICATE_ENTRY', message: 'Allocation already exists for this geographic unit' },
        });
      }

      let parentAllocation = null;
      if (parentId) {
        parentAllocation = await prisma.budgetAllocation.findUnique({ where: { id: parentId } });
        if (!parentAllocation) {
          return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Parent allocation not found' } });
        }
        if (parentAllocation.budgetId !== budgetId) {
          return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Parent allocation belongs to different budget' } });
        }
        const parentAvailable = Number(parentAllocation.availableToAllocate);
        if (Number(allocatedAmount) > parentAvailable) {
          return res.status(422).json({
            success: false,
            error: { code: 'INSUFFICIENT_FUND', message: `Amount (${allocatedAmount}) exceeds parent available (${parentAvailable})` },
          });
        }
      } else {
        const currentRootTotal = await prisma.budgetAllocation.aggregate({
          where: { budgetId, parentId: null },
          _sum: { allocatedAmount: true },
        });
        const totalRoot = Number(currentRootTotal._sum.allocatedAmount || 0);
        if (totalRoot + Number(allocatedAmount) > Number(budget.totalAmount)) {
          return res.status(422).json({
            success: false,
            error: { code: 'INSUFFICIENT_FUND', message: 'Total root allocations exceed budget total' },
          });
        }
      }

      const code = generateAllocationCode(budget.code, geoUnit.code);
      const allocation = await prisma.budgetAllocation.create({
        data: {
          code,
          budgetId,
          geographicUnitId,
          parentId: parentId || null,
          allocatedAmount: Number(allocatedAmount),
          availableToAllocate: Number(allocatedAmount),
          notes: notes || null,
          createdBy: req.auth.userId,
        },
        include: {
          budget: { select: { id: true, code: true, name: true } },
          geographicUnit: true,
          parent: { select: { id: true, code: true } },
        },
      });

      if (parentId && parentAllocation) {
        const newChildrenAllocated = Number(parentAllocation.childrenAllocated) + Number(allocatedAmount);
        await prisma.budgetAllocation.update({
          where: { id: parentId },
          data: {
            childrenAllocated: newChildrenAllocated,
            availableToAllocate: calculateAvailable(Number(parentAllocation.allocatedAmount), newChildrenAllocated),
          },
        });
      }

      await prisma.budget.update({
        where: { id: budgetId },
        data: { allocatedAmount: { increment: Number(allocatedAmount) } },
      });

      return res.status(201).json({ success: true, data: allocation });
    }

    return res.status(405).json({ success: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'Method not allowed' } });
  } catch (error) {
    console.error('Budget Allocations error:', error);
    return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } });
  }
});
