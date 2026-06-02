/**
 * Inventory API - Snapshots
 * GET /api/operations/inventory/snapshots - Get historical snapshots
 * POST /api/operations/inventory/snapshots - Create single snapshot
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from '@/_lib/prisma';
import { getUserFromRequest } from '../../_lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const user = getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'GET') {
    return handleGetSnapshots(req, res);
  } else if (req.method === 'POST') {
    return handleCreateSnapshot(req, res);
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function handleGetSnapshots(req: VercelRequest, res: VercelResponse) {
  try {
    const {
      customerId,
      productId,
      dateFrom,
      dateTo,
      location,
      page = '1',
      limit = '50',
      groupBy, // 'date' | 'customer' | 'product'
    } = req.query as Record<string, string>;

    // Build where clause
    const where: Record<string, unknown> = {};
    if (customerId) where.customerId = customerId;
    if (productId) where.productId = productId;
    if (location) where.location = location;
    if (dateFrom || dateTo) {
      where.snapshotDate = {};
      if (dateFrom) (where.snapshotDate as Record<string, Date>).gte = new Date(dateFrom);
      if (dateTo) (where.snapshotDate as Record<string, Date>).lte = new Date(dateTo);
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Fetch snapshots
    const [snapshots, total] = await Promise.all([
      prisma.inventorySnapshot.findMany({
        where,
        include: {
          customer: { select: { id: true, code: true, name: true } },
          product: { select: { id: true, sku: true, name: true, category: true } },
        },
        orderBy: { snapshotDate: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.inventorySnapshot.count({ where }),
    ]);

    // If groupBy is specified, aggregate the data
    let groupedData = null;
    if (groupBy) {
      const allSnapshots = await prisma.inventorySnapshot.findMany({
        where,
        include: {
          customer: { select: { id: true, code: true, name: true } },
          product: { select: { id: true, sku: true, name: true } },
        },
      });

      if (groupBy === 'date') {
        const byDate = new Map<string, { qty: number; value: number; count: number }>();
        for (const s of allSnapshots) {
          const dateStr = s.snapshotDate.toISOString().split('T')[0];
          const existing = byDate.get(dateStr) || { qty: 0, value: 0, count: 0 };
          existing.qty += s.quantity;
          existing.value += Number(s.value);
          existing.count++;
          byDate.set(dateStr, existing);
        }
        groupedData = Array.from(byDate.entries())
          .map(([date, data]) => ({
            date,
            totalQuantity: data.qty,
            totalValue: Math.round(data.value * 100) / 100,
            snapshotCount: data.count,
          }))
          .sort((a, b) => a.date.localeCompare(b.date));
      } else if (groupBy === 'customer') {
        const byCustomer = new Map<string, { name: string; qty: number; value: number; count: number }>();
        for (const s of allSnapshots) {
          const existing = byCustomer.get(s.customerId) || { name: s.customer?.name || '', qty: 0, value: 0, count: 0 };
          existing.qty += s.quantity;
          existing.value += Number(s.value);
          existing.count++;
          byCustomer.set(s.customerId, existing);
        }
        groupedData = Array.from(byCustomer.entries())
          .map(([customerId, data]) => ({
            customerId,
            customerName: data.name,
            totalQuantity: data.qty,
            totalValue: Math.round(data.value * 100) / 100,
            snapshotCount: data.count,
          }))
          .sort((a, b) => b.totalValue - a.totalValue);
      } else if (groupBy === 'product') {
        const byProduct = new Map<string, { name: string; qty: number; value: number; count: number }>();
        for (const s of allSnapshots) {
          const existing = byProduct.get(s.productId) || { name: s.product?.name || '', qty: 0, value: 0, count: 0 };
          existing.qty += s.quantity;
          existing.value += Number(s.value);
          existing.count++;
          byProduct.set(s.productId, existing);
        }
        groupedData = Array.from(byProduct.entries())
          .map(([productId, data]) => ({
            productId,
            productName: data.name,
            totalQuantity: data.qty,
            totalValue: Math.round(data.value * 100) / 100,
            snapshotCount: data.count,
          }))
          .sort((a, b) => b.totalValue - a.totalValue);
      }
    }

    // Get unique dates for timeline
    const uniqueDates = [...new Set(snapshots.map((s) => s.snapshotDate.toISOString().split('T')[0]))].sort();

    // Calculate totals
    const totals = {
      quantity: snapshots.reduce((sum, s) => sum + s.quantity, 0),
      value: Math.round(snapshots.reduce((sum, s) => sum + Number(s.value), 0) * 100) / 100,
    };

    return res.status(200).json({
      data: snapshots.map((s) => ({
        id: s.id,
        customerId: s.customerId,
        customer: s.customer,
        productId: s.productId,
        product: s.product,
        snapshotDate: s.snapshotDate.toISOString().split('T')[0],
        quantity: s.quantity,
        value: Number(s.value),
        location: s.location,
        batchNumber: s.batchNumber,
        expiryDate: s.expiryDate?.toISOString().split('T')[0],
        createdAt: s.createdAt,
      })),
      groupedData,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
      totals,
      timeline: uniqueDates,
      meta: {
        filters: { customerId, productId, dateFrom, dateTo, location },
        groupBy,
      },
    });
  } catch (error) {
    console.error('Get snapshots error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleCreateSnapshot(req: VercelRequest, res: VercelResponse) {
  try {
    const {
      customerId,
      productId,
      snapshotDate,
      quantity,
      value,
      location,
      batchNumber,
      expiryDate,
    } = req.body;

    // Validate required fields
    if (!customerId || !productId || !snapshotDate || quantity === undefined || value === undefined) {
      return res.status(400).json({
        error: 'Missing required fields: customerId, productId, snapshotDate, quantity, value',
      });
    }

    // Validate customer exists
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      select: { id: true, name: true },
    });
    if (!customer) {
      return res.status(400).json({ error: 'Customer not found' });
    }

    // Validate product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, name: true },
    });
    if (!product) {
      return res.status(400).json({ error: 'Product not found' });
    }

    // Create snapshot
    const snapshot = await prisma.inventorySnapshot.create({
      data: {
        customerId,
        productId,
        snapshotDate: new Date(snapshotDate),
        quantity: parseInt(quantity),
        value: parseFloat(value),
        location: location || null,
        batchNumber: batchNumber || null,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
      },
      include: {
        customer: { select: { id: true, code: true, name: true } },
        product: { select: { id: true, sku: true, name: true } },
      },
    });

    return res.status(201).json({
      success: true,
      data: snapshot,
      message: 'Inventory snapshot created successfully',
    });
  } catch (error) {
    console.error('Create snapshot error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
