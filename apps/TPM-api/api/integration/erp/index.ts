/**
 * ERP Integration API - List & Create
 * GET /api/integration/erp - List ERP connections
 * POST /api/integration/erp - Create new ERP connection
 * Sprint 0 Fix 3: ADMIN ONLY
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from '../../../_lib/prisma';
import { adminOnly, type AuthenticatedRequest } from '../../../_lib/auth';

export default adminOnly(async (req: AuthenticatedRequest, res: VercelResponse) => {
  try {
    switch (req.method) {
      case 'GET':
        return handleGet(req, res);
      case 'POST':
        return handlePost(req, res);
      default:
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('ERP API error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

async function handleGet(req: VercelRequest, res: VercelResponse) {
  const { type, status, search } = req.query;

  const where: Record<string, unknown> = {};

  if (type && type !== 'all') {
    where.erpType = type;
  }
  if (status && status !== 'all') {
    where.status = status;
  }
  if (search) {
    where.name = { contains: search, mode: 'insensitive' };
  }

  const connections = await prisma.eRPConnection.findMany({
    where,
    include: {
      createdBy: {
        select: { id: true, name: true },
      },
      _count: {
        select: { mappings: true, syncJobs: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Calculate summary
  const total = connections.length;
  const active = connections.filter((c) => c.status === 'ACTIVE').length;
  const byType: Record<string, number> = {};
  const lastSyncErrors = connections.filter(
    (c: any) => c.lastPingStatus === false
  ).length;

  connections.forEach((c: any) => {
    byType[c.erpType] = (byType[c.erpType] || 0) + 1;
  });

  return res.status(200).json({
    success: true,
    data: connections,
    summary: {
      total,
      active,
      byType,
      lastSyncErrors,
    },
  });
}

async function handlePost(req: VercelRequest, res: VercelResponse) {
  const { name, type, config, syncSchedule } = req.body;

  if (!name || !type || !config) {
    return res.status(400).json({
      success: false,
      error: 'Name, type, and config are required',
    });
  }

  // Validate type
  const validTypes = ['SAP', 'ORACLE', 'DYNAMICS', 'CUSTOM'];
  if (!validTypes.includes(type)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid ERP type',
    });
  }

  // Check for duplicate name
  const existing = await prisma.eRPConnection.findFirst({
    where: { name },
  });

  if (existing) {
    return res.status(400).json({
      success: false,
      error: 'Connection with this name already exists',
    });
  }

  // Create connection
  const connection = await prisma.eRPConnection.create({
    data: {
      name,
      erpType: type,
      baseUrl: config?.baseUrl || '',
      status: 'INACTIVE',
      createdById: req.body.userId || 'system',
      companyId: req.body.companyId || 'system',
    },
  });

  return res.status(201).json({
    success: true,
    data: connection,
    message: 'ERP connection created successfully',
  });
}
