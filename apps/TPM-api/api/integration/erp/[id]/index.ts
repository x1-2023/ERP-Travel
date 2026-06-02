/**
 * ERP Connection Detail API
 * GET /api/integration/erp/:id - Get connection details
 * PUT /api/integration/erp/:id - Update connection
 * DELETE /api/integration/erp/:id - Delete connection
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from '../../../../_lib/prisma';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ success: false, error: 'Connection ID is required' });
  }

  try {
    switch (req.method) {
      case 'GET':
        return handleGet(id, res);
      case 'PUT':
        return handlePut(id, req, res);
      case 'DELETE':
        return handleDelete(id, res);
      default:
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('ERP Detail API error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

async function handleGet(id: string, res: VercelResponse) {
  const connection = await prisma.eRPConnection.findUnique({
    where: { id },
    include: {
      mappings: {
        where: { isActive: true },
        orderBy: { entityType: 'asc' },
      },
      createdBy: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  if (!connection) {
    return res.status(404).json({
      success: false,
      error: 'ERP connection not found',
    });
  }

  // Get recent sync logs
  const recentLogs = await (prisma as any).eRPSyncLog.findMany({
    where: { connectionId: id },
    orderBy: { startedAt: 'desc' },
    take: 10,
  });

  // Calculate stats
  const allLogs = await (prisma as any).eRPSyncLog.findMany({
    where: { connectionId: id },
    select: { status: true, duration: true },
  });

  const totalSyncs = allLogs.length;
  const successfulSyncs = allLogs.filter(
    (l: any) => l.status === 'COMPLETED' || l.status === 'COMPLETED_WITH_ERRORS'
  ).length;
  const successRate = totalSyncs > 0 ? (successfulSyncs / totalSyncs) * 100 : 0;
  const avgDuration =
    allLogs.filter((l: any) => l.duration).reduce((sum: any, l: any) => sum + (l.duration || 0), 0) /
      (allLogs.filter((l: any) => l.duration).length || 1);

  const lastErrors = recentLogs
    .filter((l: any) => l.status === 'FAILED' && l.errors)
    .slice(0, 5)
    .flatMap((l: any) => (l.errors as string[]) || []);

  return res.status(200).json({
    success: true,
    data: {
      ...connection,
      recentLogs,
      stats: {
        totalSyncs,
        successRate: Math.round(successRate * 10) / 10,
        avgDuration: Math.round(avgDuration),
        lastErrors,
      },
    },
  });
}

async function handlePut(id: string, req: VercelRequest, res: VercelResponse) {
  const { name, config, syncSchedule, status } = req.body;

  const connection = await prisma.eRPConnection.findUnique({
    where: { id },
  });

  if (!connection) {
    return res.status(404).json({
      success: false,
      error: 'ERP connection not found',
    });
  }

  // Check for duplicate name
  if (name && name !== connection.name) {
    const existing = await prisma.eRPConnection.findFirst({
      where: { name, id: { not: id } },
    });
    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'Connection with this name already exists',
      });
    }
  }

  const updatedConnection = await prisma.eRPConnection.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(status && { status }),
    },
  });

  return res.status(200).json({
    success: true,
    data: updatedConnection,
    message: 'ERP connection updated successfully',
  });
}

async function handleDelete(id: string, res: VercelResponse) {
  const connection = await prisma.eRPConnection.findUnique({
    where: { id },
    include: { _count: { select: { syncJobs: true } } },
  });

  if (!connection) {
    return res.status(404).json({
      success: false,
      error: 'ERP connection not found',
    });
  }

  // Delete related data first
  await (prisma as any).eRPMapping.deleteMany({ where: { connectionId: id } });
  await (prisma as any).eRPSyncLog.deleteMany({ where: { connectionId: id } });

  // Delete connection
  await prisma.eRPConnection.delete({ where: { id } });

  return res.status(200).json({
    success: true,
    message: 'ERP connection deleted successfully',
  });
}
