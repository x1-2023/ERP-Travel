/**
 * DMS Integration API - List & Create
 * GET /api/integration/dms - List DMS connections
 * POST /api/integration/dms - Create new DMS connection
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
    console.error('DMS API error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

async function handleGet(req: VercelRequest, res: VercelResponse) {
  const { type, status, search } = req.query;

  const where: Record<string, unknown> = {};

  if (type && type !== 'all') {
    where.type = type;
  }
  if (status && status !== 'all') {
    where.status = status;
  }
  if (search) {
    where.name = { contains: search, mode: 'insensitive' };
  }

  const connections = await (prisma as any).dMSConnection.findMany({
    where,
    include: {
      distributor: {
        select: { id: true, name: true, code: true },
      },
      createdBy: {
        select: { id: true, name: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Calculate summary
  const total = connections.length;
  const active = connections.filter((c: any) => c.status === 'ACTIVE').length;
  const pendingSync = connections.filter(
    (c: any) => c.status === 'ACTIVE' && (!c.lastSyncAt || daysSince(c.lastSyncAt) > 1)
  ).length;

  return res.status(200).json({
    success: true,
    data: connections,
    summary: {
      total,
      active,
      pendingSync,
    },
  });
}

async function handlePost(req: VercelRequest, res: VercelResponse) {
  const { name, type, distributorId, config, syncSchedule } = req.body;

  if (!name || !type || !distributorId || !config) {
    return res.status(400).json({
      success: false,
      error: 'Name, type, distributorId, and config are required',
    });
  }

  // Validate type
  const validTypes = ['MISA', 'FAST', 'DMS_VIET', 'CUSTOM'];
  if (!validTypes.includes(type)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid DMS type',
    });
  }

  // Check distributor exists
  const distributor = await prisma.customer.findUnique({
    where: { id: distributorId },
  });

  if (!distributor) {
    return res.status(400).json({
      success: false,
      error: 'Distributor not found',
    });
  }

  // Check for duplicate
  const existing = await (prisma as any).dMSConnection.findFirst({
    where: {
      OR: [{ name }, { distributorId }],
    },
  });

  if (existing) {
    return res.status(400).json({
      success: false,
      error: 'Connection with this name or distributor already exists',
    });
  }

  // Create connection
  const connection = await (prisma as any).dMSConnection.create({
    data: {
      name,
      type,
      distributorId,
      config,
      syncSchedule,
      status: 'INACTIVE',
      createdById: req.body.userId || 'system',
    },
    include: {
      distributor: {
        select: { id: true, name: true, code: true },
      },
    },
  });

  return res.status(201).json({
    success: true,
    data: connection,
    message: 'DMS connection created successfully',
  });
}

function daysSince(date: Date): number {
  return Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
}
