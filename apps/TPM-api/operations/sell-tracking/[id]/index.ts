/**
 * Sell Tracking API - Single Record Operations
 * GET /api/operations/sell-tracking/[id] - Get single record
 * PUT /api/operations/sell-tracking/[id] - Update record
 * DELETE /api/operations/sell-tracking/[id] - Delete record
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
    console.error('Sell tracking [id] error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleGet(req: VercelRequest, res: VercelResponse, id: string) {
  const record = await prisma.sellTracking.findUnique({
    where: { id },
    include: {
      customer: {
        select: {
          id: true,
          code: true,
          name: true,
          channel: true,
          subChannel: true,
        },
      },
      product: {
        select: {
          id: true,
          sku: true,
          name: true,
          category: true,
          brand: true,
        },
      },
    },
  });

  if (!record) {
    return res.status(404).json({ error: 'Record not found' });
  }

  // Calculate sell-through rate for current record
  const currentSellThroughRate = record.sellInQty > 0
    ? Math.round((record.sellOutQty / record.sellInQty) * 100 * 100) / 100
    : 0;

  // Get historical data for trends (last 6 periods)
  const rawHistory = await prisma.sellTracking.findMany({
    where: {
      customerId: record.customerId,
      productId: record.productId,
      period: { lte: record.period },
    },
    orderBy: { period: 'desc' },
    take: 6,
    select: {
      period: true,
      sellInQty: true,
      sellInValue: true,
      sellOutQty: true,
      sellOutValue: true,
      stockQty: true,
      stockValue: true,
    },
  });

  // Add calculated sell-through rate to history
  const history = rawHistory.map((h) => ({
    ...h,
    sellThroughRate: h.sellInQty > 0
      ? Math.round((h.sellOutQty / h.sellInQty) * 100 * 100) / 100
      : 0,
  }));

  // Calculate trends
  const currentIdx = 0;
  const previousIdx = 1;
  const trends = history.length > 1
    ? {
        sellInChange: history[previousIdx]?.sellInQty
          ? Math.round(((history[currentIdx].sellInQty - history[previousIdx].sellInQty) / history[previousIdx].sellInQty) * 100)
          : 0,
        sellOutChange: history[previousIdx]?.sellOutQty
          ? Math.round(((history[currentIdx].sellOutQty - history[previousIdx].sellOutQty) / history[previousIdx].sellOutQty) * 100)
          : 0,
        stockChange: history[previousIdx]?.stockQty
          ? Math.round(((history[currentIdx].stockQty - history[previousIdx].stockQty) / history[previousIdx].stockQty) * 100)
          : 0,
        sellThroughChange: history[previousIdx]?.sellThroughRate
          ? Math.round((history[currentIdx].sellThroughRate - history[previousIdx].sellThroughRate) * 100) / 100
          : 0,
      }
    : null;

  return res.status(200).json({
    data: {
      ...record,
      sellThroughRate: currentSellThroughRate,
    },
    history: history.reverse(), // Return in chronological order
    trends,
  });
}

async function handleUpdate(req: VercelRequest, res: VercelResponse, id: string) {
  const {
    sellInQty,
    sellInValue,
    sellOutQty,
    sellOutValue,
    stockQty,
    stockValue,
  } = req.body;

  // Check if record exists
  const existing = await prisma.sellTracking.findUnique({
    where: { id },
  });

  if (!existing) {
    return res.status(404).json({ error: 'Record not found' });
  }

  // Build update data
  const updateData: Record<string, number> = {};

  if (sellInQty !== undefined) updateData.sellInQty = parseInt(sellInQty);
  if (sellInValue !== undefined) updateData.sellInValue = parseFloat(sellInValue);
  if (sellOutQty !== undefined) updateData.sellOutQty = parseInt(sellOutQty);
  if (sellOutValue !== undefined) updateData.sellOutValue = parseFloat(sellOutValue);
  if (stockQty !== undefined) updateData.stockQty = parseInt(stockQty);
  if (stockValue !== undefined) updateData.stockValue = parseFloat(stockValue);

  const record = await prisma.sellTracking.update({
    where: { id },
    data: updateData,
    include: {
      customer: { select: { id: true, code: true, name: true } },
      product: { select: { id: true, sku: true, name: true } },
    },
  });

  // Calculate sell-through rate for response
  const sellThroughRate = record.sellInQty > 0
    ? Math.round((record.sellOutQty / record.sellInQty) * 100 * 100) / 100
    : 0;

  return res.status(200).json({
    data: {
      ...record,
      sellThroughRate,
    },
  });
}

async function handleDelete(req: VercelRequest, res: VercelResponse, id: string) {
  // Check if record exists
  const existing = await prisma.sellTracking.findUnique({
    where: { id },
  });

  if (!existing) {
    return res.status(404).json({ error: 'Record not found' });
  }

  await prisma.sellTracking.delete({
    where: { id },
  });

  return res.status(200).json({
    success: true,
    message: 'Record deleted successfully',
  });
}
