/**
 * DMS Connection Detail API
 * GET /api/integration/dms/:id - Get connection details
 * PUT /api/integration/dms/:id - Update connection
 * DELETE /api/integration/dms/:id - Delete connection
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
    console.error('DMS Detail API error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

async function handleGet(id: string, res: VercelResponse) {
  const connection = await (prisma as any).dMSConnection.findUnique({
    where: { id },
    include: {
      distributor: {
        select: { id: true, name: true, code: true },
      },
      createdBy: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  if (!connection) {
    return res.status(404).json({
      success: false,
      error: 'DMS connection not found',
    });
  }

  // Get sync stats from sell tracking
  const sellTrackingStats = await prisma.sellTracking.aggregate({
    where: { customerId: connection.distributorId },
    _count: true,
    _sum: {
      sellOutQty: true,
      sellOutValue: true,
    },
  });

  return res.status(200).json({
    success: true,
    data: {
      ...connection,
      stats: {
        totalRecords: sellTrackingStats._count,
        totalSellOut: sellTrackingStats._sum.sellOutQty || 0,
        totalValue: sellTrackingStats._sum.sellOutValue || 0,
      },
    },
  });
}

async function handlePut(id: string, req: VercelRequest, res: VercelResponse) {
  const { name, config, syncSchedule, status } = req.body;

  const connection = await (prisma as any).dMSConnection.findUnique({
    where: { id },
  });

  if (!connection) {
    return res.status(404).json({
      success: false,
      error: 'DMS connection not found',
    });
  }

  const updatedConnection = await (prisma as any).dMSConnection.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(config && { config: { ...((connection.config as object) || {}), ...config } }),
      ...(syncSchedule !== undefined && { syncSchedule }),
      ...(status && { status }),
    },
    include: {
      distributor: {
        select: { id: true, name: true, code: true },
      },
    },
  });

  return res.status(200).json({
    success: true,
    data: updatedConnection,
    message: 'DMS connection updated successfully',
  });
}

async function handleDelete(id: string, res: VercelResponse) {
  const connection = await (prisma as any).dMSConnection.findUnique({
    where: { id },
  });

  if (!connection) {
    return res.status(404).json({
      success: false,
      error: 'DMS connection not found',
    });
  }

  await (prisma as any).dMSConnection.delete({ where: { id } });

  return res.status(200).json({
    success: true,
    message: 'DMS connection deleted successfully',
  });
}
