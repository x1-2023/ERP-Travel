/**
 * Inventory API - Single Record Operations
 * GET /api/operations/inventory/[id] - Get single snapshot
 * PUT /api/operations/inventory/[id] - Update snapshot
 * DELETE /api/operations/inventory/[id] - Delete snapshot
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from '@/_lib/prisma';
import { getUserFromRequest } from '../../../_lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const user = getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { id } = req.query;
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid ID' });
  }

  try {
    if (req.method === 'GET') {
      return handleGet(req, res, id);
    }

    if (req.method === 'PUT') {
      return handleUpdate(req, res, id);
    }

    if (req.method === 'DELETE') {
      return handleDelete(req, res, id);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Inventory [id] error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleGet(req: VercelRequest, res: VercelResponse, id: string) {
  const snapshot = await prisma.inventorySnapshot.findUnique({
    where: { id },
    include: {
      customer: {
        select: {
          id: true,
          code: true,
          name: true,
          channel: true,
        },
      },
      product: {
        select: {
          id: true,
          sku: true,
          name: true,
          category: true,
          brand: true,
          price: true,
        },
      },
    },
  });

  if (!snapshot) {
    return res.status(404).json({ error: 'Snapshot not found' });
  }

  // Get historical snapshots for the same customer-product pair
  const history = await prisma.inventorySnapshot.findMany({
    where: {
      customerId: snapshot.customerId,
      productId: snapshot.productId,
      snapshotDate: { lte: snapshot.snapshotDate },
    },
    orderBy: { snapshotDate: 'desc' },
    take: 10,
    select: {
      id: true,
      snapshotDate: true,
      quantity: true,
      value: true,
      location: true,
    },
  });

  // Calculate trends
  const currentIdx = 0;
  const previousIdx = 1;
  const trends = history.length > 1
    ? {
        quantityChange: history[previousIdx]?.quantity
          ? Math.round(((history[currentIdx].quantity - history[previousIdx].quantity) / history[previousIdx].quantity) * 100)
          : 0,
        valueChange: Number(history[previousIdx]?.value || 0) > 0
          ? Math.round(((Number(history[currentIdx].value) - Number(history[previousIdx].value)) / Number(history[previousIdx].value)) * 100)
          : 0,
      }
    : null;

  return res.status(200).json({
    data: snapshot,
    history: history.reverse(),
    trends,
  });
}

async function handleUpdate(req: VercelRequest, res: VercelResponse, id: string) {
  const { quantity, value, location, batchNumber, expiryDate } = req.body;

  const existing = await prisma.inventorySnapshot.findUnique({
    where: { id },
  });

  if (!existing) {
    return res.status(404).json({ error: 'Snapshot not found' });
  }

  const updateData: Record<string, unknown> = {};

  if (quantity !== undefined) updateData.quantity = parseInt(quantity);
  if (value !== undefined) updateData.value = parseFloat(value);
  if (location !== undefined) updateData.location = location || null;
  if (batchNumber !== undefined) updateData.batchNumber = batchNumber || null;
  if (expiryDate !== undefined) updateData.expiryDate = expiryDate ? new Date(expiryDate) : null;

  const snapshot = await prisma.inventorySnapshot.update({
    where: { id },
    data: updateData,
    include: {
      customer: { select: { id: true, code: true, name: true } },
      product: { select: { id: true, sku: true, name: true } },
    },
  });

  return res.status(200).json({ data: snapshot });
}

async function handleDelete(req: VercelRequest, res: VercelResponse, id: string) {
  const existing = await prisma.inventorySnapshot.findUnique({
    where: { id },
  });

  if (!existing) {
    return res.status(404).json({ error: 'Snapshot not found' });
  }

  await prisma.inventorySnapshot.delete({
    where: { id },
  });

  return res.status(200).json({
    success: true,
    message: 'Snapshot deleted successfully',
  });
}
