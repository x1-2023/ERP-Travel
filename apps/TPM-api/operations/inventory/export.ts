/**
 * Inventory API - Export
 * GET /api/operations/inventory/export - Export inventory data
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from '@/_lib/prisma';
import { getUserFromRequest } from '../../_lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const {
      format = 'csv',
      customerId,
      productId,
      snapshotDateFrom,
      snapshotDateTo,
      location,
    } = req.query as Record<string, string>;

    // Build where clause
    const where: Record<string, unknown> = {};
    if (customerId) where.customerId = customerId;
    if (productId) where.productId = productId;
    if (location) where.location = location;
    if (snapshotDateFrom || snapshotDateTo) {
      where.snapshotDate = {};
      if (snapshotDateFrom) (where.snapshotDate as Record<string, Date>).gte = new Date(snapshotDateFrom);
      if (snapshotDateTo) (where.snapshotDate as Record<string, Date>).lte = new Date(snapshotDateTo);
    }

    // Fetch all matching records
    const records = await prisma.inventorySnapshot.findMany({
      where,
      orderBy: [{ snapshotDate: 'desc' }, { customerId: 'asc' }, { productId: 'asc' }],
      include: {
        customer: { select: { id: true, code: true, name: true, channel: true } },
        product: { select: { id: true, sku: true, name: true, category: true, brand: true } },
      },
    });

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="inventory-${new Date().toISOString().split('T')[0]}.json"`
      );
      return res.status(200).json({
        exportedAt: new Date().toISOString(),
        recordCount: records.length,
        filters: { customerId, productId, snapshotDateFrom, snapshotDateTo, location },
        data: records,
      });
    }

    // Default: CSV format
    const csvHeaders = [
      'Snapshot Date',
      'Customer Code',
      'Customer Name',
      'Channel',
      'Product SKU',
      'Product Name',
      'Category',
      'Brand',
      'Quantity',
      'Value',
      'Location',
      'Batch Number',
      'Expiry Date',
    ];

    const csvRows = records.map((record) => {
      return [
        record.snapshotDate.toISOString().split('T')[0],
        record.customer?.code || '',
        escapeCsvField(record.customer?.name || ''),
        record.customer?.channel || '',
        record.product?.sku || '',
        escapeCsvField(record.product?.name || ''),
        record.product?.category || '',
        record.product?.brand || '',
        record.quantity,
        Number(record.value).toFixed(2),
        record.location || '',
        record.batchNumber || '',
        record.expiryDate ? record.expiryDate.toISOString().split('T')[0] : '',
      ].join(',');
    });

    const csvContent = [csvHeaders.join(','), ...csvRows].join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="inventory-${new Date().toISOString().split('T')[0]}.csv"`
    );
    return res.status(200).send(csvContent);
  } catch (error) {
    console.error('Inventory export error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

function escapeCsvField(field: string): string {
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}
