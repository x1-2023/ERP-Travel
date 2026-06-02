/**
 * Inventory API - List & Create
 * GET /api/operations/inventory - List inventory snapshots
 * POST /api/operations/inventory - Create a new snapshot
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

  try {
    if (req.method === 'GET') {
      return handleList(req, res);
    }

    if (req.method === 'POST') {
      return handleCreate(req, res);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Inventory error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleList(req: VercelRequest, res: VercelResponse) {
  const {
    page = '1',
    limit = '20',
    customerId,
    productId,
    snapshotDate,
    snapshotDateFrom,
    snapshotDateTo,
    location,
    search,
    sortBy = 'snapshotDate',
    sortOrder = 'desc',
    expiringWithin, // days
  } = req.query as Record<string, string>;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  // Build where clause
  const where: Record<string, unknown> = {};

  if (customerId) where.customerId = customerId;
  if (productId) where.productId = productId;
  if (location) where.location = location;

  if (snapshotDate) {
    where.snapshotDate = new Date(snapshotDate);
  } else if (snapshotDateFrom || snapshotDateTo) {
    where.snapshotDate = {};
    if (snapshotDateFrom) (where.snapshotDate as Record<string, Date>).gte = new Date(snapshotDateFrom);
    if (snapshotDateTo) (where.snapshotDate as Record<string, Date>).lte = new Date(snapshotDateTo);
  }

  if (expiringWithin) {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + parseInt(expiringWithin));
    where.expiryDate = {
      lte: expiryDate,
      gte: new Date(),
    };
  }

  if (search) {
    where.OR = [
      { customer: { name: { contains: search, mode: 'insensitive' } } },
      { customer: { code: { contains: search, mode: 'insensitive' } } },
      { product: { name: { contains: search, mode: 'insensitive' } } },
      { product: { sku: { contains: search, mode: 'insensitive' } } },
      { location: { contains: search, mode: 'insensitive' } },
      { batchNumber: { contains: search, mode: 'insensitive' } },
    ];
  }

  // Build orderBy
  const orderBy: Record<string, string> = {};
  orderBy[sortBy] = sortOrder;

  const [snapshots, total, summaryData] = await Promise.all([
    prisma.inventorySnapshot.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        customer: { select: { id: true, code: true, name: true, channel: true } },
        product: { select: { id: true, sku: true, name: true, category: true, brand: true } },
      },
    }),
    prisma.inventorySnapshot.count({ where }),
    prisma.inventorySnapshot.aggregate({
      where,
      _sum: {
        quantity: true,
        value: true,
      },
      _avg: {
        quantity: true,
        value: true,
      },
    }),
  ]);

  // Get expiring soon count
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  const expiringCount = await prisma.inventorySnapshot.count({
    where: {
      ...where,
      expiryDate: {
        lte: thirtyDaysFromNow,
        gte: new Date(),
      },
    },
  });

  const summary = {
    totalQuantity: summaryData._sum.quantity || 0,
    totalValue: Number(summaryData._sum.value || 0),
    avgQuantity: Math.round(summaryData._avg.quantity || 0),
    avgValue: Math.round(Number(summaryData._avg.value || 0) * 100) / 100,
    recordCount: total,
    expiringSoon: expiringCount,
  };

  return res.status(200).json({
    data: snapshots,
    summary,
    pagination: {
      page: parseInt(page),
      limit: take,
      total,
      totalPages: Math.ceil(total / take),
    },
  });
}

async function handleCreate(req: VercelRequest, res: VercelResponse) {
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

  // Validation
  if (!customerId || !productId || !snapshotDate || quantity === undefined || value === undefined) {
    return res.status(400).json({
      error: 'Missing required fields: customerId, productId, snapshotDate, quantity, value',
    });
  }

  // Validate customer exists
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    select: { id: true },
  });

  if (!customer) {
    return res.status(400).json({ error: 'Customer not found' });
  }

  // Validate product exists
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true },
  });

  if (!product) {
    return res.status(400).json({ error: 'Product not found' });
  }

  // Parse date
  const parsedSnapshotDate = new Date(snapshotDate);
  if (isNaN(parsedSnapshotDate.getTime())) {
    return res.status(400).json({ error: 'Invalid snapshotDate format' });
  }

  const snapshot = await prisma.inventorySnapshot.create({
    data: {
      customerId,
      productId,
      snapshotDate: parsedSnapshotDate,
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

  return res.status(201).json({ data: snapshot });
}
