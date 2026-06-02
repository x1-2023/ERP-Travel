import type { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from '@/_lib/prisma';
import { getUserFromRequest } from '../_lib/auth';
import { Prisma } from '@prisma/client';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const user = getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    if (req.method === 'GET') {
      const {
        page = '1',
        limit = '20',
        year,
        quarter,
        fundType,
        approvalStatus,
        status,
        category,
        search
      } = req.query as Record<string, string>;

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const take = parseInt(limit);

      // Build where clause
      const where: Prisma.BudgetWhereInput = {};

      // Filter by company (multi-tenant)
      const userRecord = await prisma.user.findUnique({ where: { id: user.userId } });
      if (userRecord?.companyId) {
        where.companyId = userRecord.companyId;
      }

      if (year) where.year = parseInt(year);
      if (quarter) where.quarter = parseInt(quarter);
      if (fundType) where.fundType = fundType as any;
      if (approvalStatus) where.approvalStatus = approvalStatus as any;
      if (status) where.status = status;
      if (category) where.category = category;

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { code: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [budgets, total] = await Promise.all([
        prisma.budget.findMany({
          where,
          skip,
          take,
          orderBy: [{ year: 'desc' }, { quarter: 'desc' }, { createdAt: 'desc' }],
          include: {
            company: { select: { id: true, name: true, code: true } },
            _count: { select: { allocations: true, approvals: true, activities: true } },
          },
        }),
        prisma.budget.count({ where }),
      ]);

      // Calculate utilization for each budget
      const budgetsWithMetrics = budgets.map(budget => ({
        ...budget,
        totalAmount: Number(budget.totalAmount),
        allocatedAmount: Number(budget.allocatedAmount),
        spentAmount: Number(budget.spentAmount),
        utilizationRate: Number(budget.totalAmount) > 0
          ? Math.round((Number(budget.spentAmount) / Number(budget.totalAmount)) * 100)
          : 0,
        allocationRate: Number(budget.totalAmount) > 0
          ? Math.round((Number(budget.allocatedAmount) / Number(budget.totalAmount)) * 100)
          : 0,
      }));

      return res.status(200).json({
        data: budgetsWithMetrics,
        pagination: {
          page: parseInt(page),
          limit: take,
          total,
          totalPages: Math.ceil(total / take)
        },
      });
    }

    if (req.method === 'POST') {
      const {
        code,
        name,
        description,
        category,
        fundType,
        year,
        quarter,
        startDate,
        endDate,
        totalAmount,
        constraints,
      } = req.body;

      // Validation
      if (!code || !name || !year || totalAmount === undefined) {
        return res.status(400).json({
          error: 'Missing required fields: code, name, year, totalAmount'
        });
      }

      // Check for duplicate code
      const existing = await prisma.budget.findUnique({ where: { code } });
      if (existing) {
        return res.status(400).json({ error: 'Budget code already exists' });
      }

      // Get user's company
      const userRecord = await prisma.user.findUnique({ where: { id: user.userId } });
      if (!userRecord) return res.status(404).json({ error: 'User not found' });

      // Calculate approval level based on amount (Aforza-style)
      const amount = parseFloat(totalAmount);
      let approvalLevel = 1; // Default: KAM Manager
      if (amount >= 500_000_000_000) {
        approvalLevel = 3; // > 500M → Finance Director
      } else if (amount >= 100_000_000_000) {
        approvalLevel = 2; // > 100M → Trade Marketing Manager
      }

      const budget = await prisma.budget.create({
        data: {
          code,
          name,
          description,
          category,
          fundType: fundType || 'PROMOTIONAL',
          year: parseInt(year),
          quarter: quarter ? parseInt(quarter) : null,
          startDate: startDate ? new Date(startDate) : null,
          endDate: endDate ? new Date(endDate) : null,
          totalAmount: amount,
          allocatedAmount: 0,
          spentAmount: 0,
          approvalStatus: 'DRAFT',
          approvalLevel,
          currentLevel: 0,
          status: 'DRAFT',
          isActive: true,
          constraints: constraints || null,
          companyId: userRecord.companyId,
          createdBy: user.userId,
        },
        include: {
          company: { select: { id: true, name: true, code: true } },
        },
      });

      return res.status(201).json({
        data: {
          ...budget,
          totalAmount: Number(budget.totalAmount),
          allocatedAmount: Number(budget.allocatedAmount),
          spentAmount: Number(budget.spentAmount),
        }
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Budgets error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
