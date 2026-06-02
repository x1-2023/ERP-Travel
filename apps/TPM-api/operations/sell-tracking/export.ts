/**
 * Sell Tracking API - Export
 * GET /api/operations/sell-tracking/export - Export data to CSV/JSON
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
      periodFrom,
      periodTo,
      includeCustomer = 'true',
      includeProduct = 'true',
    } = req.query as Record<string, string>;

    // Build where clause
    const where: Record<string, unknown> = {};

    if (customerId) where.customerId = customerId;
    if (productId) where.productId = productId;

    if (periodFrom || periodTo) {
      where.period = {};
      if (periodFrom) (where.period as Record<string, string>).gte = periodFrom;
      if (periodTo) (where.period as Record<string, string>).lte = periodTo;
    }

    // Fetch all matching records
    const records = await prisma.sellTracking.findMany({
      where,
      orderBy: [{ period: 'desc' }, { customerId: 'asc' }, { productId: 'asc' }],
      include: {
        customer:
          includeCustomer === 'true'
            ? { select: { id: true, code: true, name: true, channel: true } }
            : false,
        product:
          includeProduct === 'true'
            ? { select: { id: true, sku: true, name: true, category: true, brand: true } }
            : false,
      },
    });

    if (format === 'json') {
      // Return raw JSON
      res.setHeader('Content-Type', 'application/json');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="sell-tracking-${new Date().toISOString().split('T')[0]}.json"`
      );
      return res.status(200).json({
        exportedAt: new Date().toISOString(),
        recordCount: records.length,
        filters: { customerId, productId, periodFrom, periodTo },
        data: records,
      });
    }

    // Default: CSV format
    const csvHeaders = [
      'Period',
      'Customer Code',
      'Customer Name',
      'Channel',
      'Product Code',
      'Product Name',
      'SKU',
      'Category',
      'Brand',
      'Sell-In Qty',
      'Sell-In Value',
      'Sell-Out Qty',
      'Sell-Out Value',
      'Stock Qty',
      'Stock Value',
      'Sell-Through Rate (%)',
      'Days of Stock',
    ];

    const csvRows = records.map((record) => {
      // Calculate sell-through rate
      const sellThroughRate =
        record.sellInQty > 0
          ? Math.round((record.sellOutQty / record.sellInQty) * 100 * 100) / 100
          : 0;

      // Calculate days of stock (assuming 30-day month)
      const avgDailyOut = record.sellOutQty / 30;
      const daysOfStock = avgDailyOut > 0 ? Math.round(record.stockQty / avgDailyOut) : 0;

      const customer = (record as any).customer as {
        code?: string;
        name?: string;
        channel?: string;
      } | null;
      const product = (record as any).product as {
        sku?: string;
        name?: string;
        category?: string;
        brand?: string;
      } | null;

      return [
        record.period,
        customer?.code || '',
        escapeCsvField(customer?.name || ''),
        customer?.channel || '',
        product?.sku || '',
        escapeCsvField(product?.name || ''),
        product?.sku || '',
        product?.category || '',
        product?.brand || '',
        record.sellInQty,
        Number(record.sellInValue).toFixed(2),
        record.sellOutQty,
        Number(record.sellOutValue).toFixed(2),
        record.stockQty,
        Number(record.stockValue).toFixed(2),
        sellThroughRate.toFixed(2),
        daysOfStock,
      ].join(',');
    });

    const csvContent = [csvHeaders.join(','), ...csvRows].join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="sell-tracking-${new Date().toISOString().split('T')[0]}.csv"`
    );
    return res.status(200).send(csvContent);
  } catch (error) {
    console.error('Sell tracking export error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

function escapeCsvField(field: string): string {
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}
