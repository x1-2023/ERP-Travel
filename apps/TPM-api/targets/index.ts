import type { VercelResponse } from '@vercel/node';
import prisma from '../_lib/prisma';
import { kamPlus, parsePagination, type AuthenticatedRequest } from '../_lib/auth';

// Sprint 0+1: RBAC + Pagination cap + Standard errors
export default kamPlus(async (req: AuthenticatedRequest, res: VercelResponse) => {
  try {
    if (req.method === 'GET') {
      const { year, quarter, month, status, metric, search } = req.query as Record<string, string>;
      const { skip, limit, page } = parsePagination(req.query as Record<string, unknown>);

      const where: Record<string, unknown> = {};
      if (year) where.year = parseInt(year);
      if (quarter) where.quarter = parseInt(quarter);
      if (month) where.month = parseInt(month);
      if (status) where.status = status;
      if (metric) where.metric = metric;
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { code: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [targets, total] = await Promise.all([
        prisma.target.findMany({
          where,
          skip,
          take: limit,
          orderBy: [{ year: 'desc' }, { quarter: 'desc' }, { month: 'desc' }],
          include: { _count: { select: { allocations: true } } },
        }),
        prisma.target.count({ where }),
      ]);

      const targetsWithProgress = targets.map(target => ({
        ...target,
        progressPercent: Number(target.totalTarget) > 0
          ? (Number(target.totalAchieved) / Number(target.totalTarget)) * 100
          : 0,
      }));

      return res.status(200).json({
        success: true,
        data: targetsWithProgress,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      });
    }

    if (req.method === 'POST') {
      const { code, name, description, year, quarter, month, totalTarget, metric } = req.body;

      if (!code || !name || !year || totalTarget === undefined) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Missing required fields: code, name, year, totalTarget' },
        });
      }

      const existing = await prisma.target.findUnique({ where: { code } });
      if (existing) {
        return res.status(409).json({
          success: false,
          error: { code: 'DUPLICATE_ENTRY', message: 'Target code already exists' },
        });
      }

      const validMetrics = ['CASES', 'VOLUME_LITERS', 'REVENUE_VND', 'UNITS'];
      if (metric && !validMetrics.includes(metric)) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Invalid metric type' },
        });
      }

      const target = await prisma.target.create({
        data: {
          code,
          name,
          description: description || null,
          year: parseInt(year),
          quarter: quarter ? parseInt(quarter) : null,
          month: month ? parseInt(month) : null,
          totalTarget: Number(totalTarget),
          metric: metric || 'CASES',
          createdBy: req.auth.userId,
        },
      });

      return res.status(201).json({ success: true, data: target });
    }

    return res.status(405).json({ success: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'Method not allowed' } });
  } catch (error) {
    console.error('Targets error:', error);
    return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } });
  }
});
