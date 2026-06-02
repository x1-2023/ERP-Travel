/**
 * Sell Tracking API - Bulk Operations
 * POST /api/operations/sell-tracking/bulk - Perform bulk operations
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from '@/_lib/prisma';
import { getUserFromRequest } from '../../_lib/auth';

interface BulkDeleteRequest {
  action: 'delete';
  ids: string[];
}

interface BulkUpdateRequest {
  action: 'update';
  ids: string[];
  data: {
    sellInQty?: number;
    sellInValue?: number;
    sellOutQty?: number;
    sellOutValue?: number;
    stockQty?: number;
    stockValue?: number;
  };
}

interface BulkDeleteByFilterRequest {
  action: 'deleteByFilter';
  filters: {
    customerId?: string;
    productId?: string;
    periodFrom?: string;
    periodTo?: string;
  };
}

type BulkRequest = BulkDeleteRequest | BulkUpdateRequest | BulkDeleteByFilterRequest;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const body = req.body as BulkRequest;

    if (!body.action) {
      return res.status(400).json({ error: 'Action is required' });
    }

    switch (body.action) {
      case 'delete':
        return handleBulkDelete(req, res, body as BulkDeleteRequest);
      case 'update':
        return handleBulkUpdate(req, res, body as BulkUpdateRequest);
      case 'deleteByFilter':
        return handleDeleteByFilter(req, res, body as BulkDeleteByFilterRequest);
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error('Sell tracking bulk error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleBulkDelete(
  req: VercelRequest,
  res: VercelResponse,
  body: BulkDeleteRequest
) {
  const { ids } = body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'IDs array is required' });
  }

  if (ids.length > 1000) {
    return res.status(400).json({ error: 'Maximum 1000 records can be deleted at once' });
  }

  // Verify records exist
  const existing = await prisma.sellTracking.findMany({
    where: { id: { in: ids } },
    select: { id: true },
  });

  const existingIds = existing.map((e) => e.id);
  const notFoundIds = ids.filter((id) => !existingIds.includes(id));

  // Delete existing records
  const result = await prisma.sellTracking.deleteMany({
    where: { id: { in: existingIds } },
  });

  return res.status(200).json({
    success: true,
    action: 'delete',
    deleted: result.count,
    notFound: notFoundIds.length,
    notFoundIds: notFoundIds.length > 0 ? notFoundIds.slice(0, 10) : undefined,
  });
}

async function handleBulkUpdate(
  req: VercelRequest,
  res: VercelResponse,
  body: BulkUpdateRequest
) {
  const { ids, data } = body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'IDs array is required' });
  }

  if (!data || Object.keys(data).length === 0) {
    return res.status(400).json({ error: 'Update data is required' });
  }

  if (ids.length > 500) {
    return res.status(400).json({ error: 'Maximum 500 records can be updated at once' });
  }

  // Build update data
  const updateData: Record<string, number> = {};
  if (data.sellInQty !== undefined) updateData.sellInQty = data.sellInQty;
  if (data.sellInValue !== undefined) updateData.sellInValue = data.sellInValue;
  if (data.sellOutQty !== undefined) updateData.sellOutQty = data.sellOutQty;
  if (data.sellOutValue !== undefined) updateData.sellOutValue = data.sellOutValue;
  if (data.stockQty !== undefined) updateData.stockQty = data.stockQty;
  if (data.stockValue !== undefined) updateData.stockValue = data.stockValue;

  // Verify records exist
  const existing = await prisma.sellTracking.findMany({
    where: { id: { in: ids } },
    select: { id: true },
  });

  const existingIds = existing.map((e) => e.id);
  const notFoundIds = ids.filter((id) => !existingIds.includes(id));

  // Update existing records
  const result = await prisma.sellTracking.updateMany({
    where: { id: { in: existingIds } },
    data: updateData,
  });

  return res.status(200).json({
    success: true,
    action: 'update',
    updated: result.count,
    notFound: notFoundIds.length,
    notFoundIds: notFoundIds.length > 0 ? notFoundIds.slice(0, 10) : undefined,
  });
}

async function handleDeleteByFilter(
  req: VercelRequest,
  res: VercelResponse,
  body: BulkDeleteByFilterRequest
) {
  const { filters } = body;

  if (!filters || Object.keys(filters).length === 0) {
    return res.status(400).json({
      error: 'At least one filter is required for safety',
    });
  }

  // Build where clause
  const where: Record<string, unknown> = {};

  if (filters.customerId) where.customerId = filters.customerId;
  if (filters.productId) where.productId = filters.productId;

  if (filters.periodFrom || filters.periodTo) {
    where.period = {};
    if (filters.periodFrom) (where.period as Record<string, string>).gte = filters.periodFrom;
    if (filters.periodTo) (where.period as Record<string, string>).lte = filters.periodTo;
  }

  // Count records to be deleted
  const count = await prisma.sellTracking.count({ where });

  if (count > 10000) {
    return res.status(400).json({
      error: 'Too many records to delete. Please narrow down the filters.',
      recordCount: count,
      maxAllowed: 10000,
    });
  }

  // Delete records
  const result = await prisma.sellTracking.deleteMany({ where });

  return res.status(200).json({
    success: true,
    action: 'deleteByFilter',
    deleted: result.count,
    filters,
  });
}
