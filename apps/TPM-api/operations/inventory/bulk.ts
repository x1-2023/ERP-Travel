/**
 * Inventory API - Bulk Operations
 * POST /api/operations/inventory/bulk - Perform bulk operations
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from '@/_lib/prisma';
import { getUserFromRequest } from '../../_lib/auth';

interface BulkDeleteRequest {
  action: 'delete';
  ids: string[];
}

interface BulkDeleteByFilterRequest {
  action: 'deleteByFilter';
  filters: {
    customerId?: string;
    productId?: string;
    snapshotDateFrom?: string;
    snapshotDateTo?: string;
    location?: string;
  };
}

interface BulkUpdateRequest {
  action: 'update';
  ids: string[];
  data: {
    quantity?: number;
    value?: number;
    location?: string;
  };
}

type BulkRequest = BulkDeleteRequest | BulkDeleteByFilterRequest | BulkUpdateRequest;

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
      case 'deleteByFilter':
        return handleDeleteByFilter(req, res, body as BulkDeleteByFilterRequest);
      case 'update':
        return handleBulkUpdate(req, res, body as BulkUpdateRequest);
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error('Inventory bulk error:', error);
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

  const existing = await prisma.inventorySnapshot.findMany({
    where: { id: { in: ids } },
    select: { id: true },
  });

  const existingIds = existing.map((e) => e.id);
  const notFoundIds = ids.filter((id) => !existingIds.includes(id));

  const result = await prisma.inventorySnapshot.deleteMany({
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
  if (filters.location) where.location = filters.location;
  if (filters.snapshotDateFrom || filters.snapshotDateTo) {
    where.snapshotDate = {};
    if (filters.snapshotDateFrom) {
      (where.snapshotDate as Record<string, Date>).gte = new Date(filters.snapshotDateFrom);
    }
    if (filters.snapshotDateTo) {
      (where.snapshotDate as Record<string, Date>).lte = new Date(filters.snapshotDateTo);
    }
  }

  // Count records to be deleted
  const count = await prisma.inventorySnapshot.count({ where });

  if (count > 10000) {
    return res.status(400).json({
      error: 'Too many records to delete. Please narrow down the filters.',
      recordCount: count,
      maxAllowed: 10000,
    });
  }

  const result = await prisma.inventorySnapshot.deleteMany({ where });

  return res.status(200).json({
    success: true,
    action: 'deleteByFilter',
    deleted: result.count,
    filters,
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

  const updateData: Record<string, unknown> = {};
  if (data.quantity !== undefined) updateData.quantity = data.quantity;
  if (data.value !== undefined) updateData.value = data.value;
  if (data.location !== undefined) updateData.location = data.location || null;

  const existing = await prisma.inventorySnapshot.findMany({
    where: { id: { in: ids } },
    select: { id: true },
  });

  const existingIds = existing.map((e) => e.id);
  const notFoundIds = ids.filter((id) => !existingIds.includes(id));

  const result = await prisma.inventorySnapshot.updateMany({
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
