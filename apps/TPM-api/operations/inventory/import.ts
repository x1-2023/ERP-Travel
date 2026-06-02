/**
 * Inventory API - Import
 * POST /api/operations/inventory/import - Import inventory snapshots
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from '@/_lib/prisma';
import { getUserFromRequest } from '../../_lib/auth';

interface ImportRow {
  customerCode: string;
  productSku: string;
  snapshotDate: string;
  quantity: number | string;
  value: number | string;
  location?: string;
  batchNumber?: string;
  expiryDate?: string;
}

interface ImportResult {
  success: boolean;
  row: number;
  customerCode: string;
  productSku: string;
  snapshotDate: string;
  error?: string;
  action?: 'created' | 'updated';
}

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
    const { data, mode = 'create' } = req.body as {
      data: ImportRow[];
      mode?: 'create' | 'replace';
    };

    if (!data || !Array.isArray(data) || data.length === 0) {
      return res.status(400).json({ error: 'No data provided' });
    }

    // Validate data structure
    const requiredFields = ['customerCode', 'productSku', 'snapshotDate', 'quantity', 'value'];
    const firstRow = data[0];
    const missingFields = requiredFields.filter((f) => !(f in firstRow));
    if (missingFields.length > 0) {
      return res.status(400).json({
        error: `Missing required fields: ${missingFields.join(', ')}`,
        requiredFields,
        providedFields: Object.keys(firstRow),
      });
    }

    // Get all unique customer codes and product SKUs
    const customerCodes = [...new Set(data.map((r) => r.customerCode))];
    const productSkus = [...new Set(data.map((r) => r.productSku))];

    // Lookup customers and products
    const [customers, products] = await Promise.all([
      prisma.customer.findMany({
        where: { code: { in: customerCodes } },
        select: { id: true, code: true },
      }),
      prisma.product.findMany({
        where: { sku: { in: productSkus } },
        select: { id: true, sku: true },
      }),
    ]);

    const customerMap = new Map(customers.map((c) => [c.code, c.id]));
    const productMap = new Map(products.map((p) => [p.sku, p.id]));

    // Process each row
    const results: ImportResult[] = [];
    let created = 0;
    let updated = 0;
    let failed = 0;

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNum = i + 1;

      // Validate date format
      const snapshotDate = new Date(row.snapshotDate);
      if (isNaN(snapshotDate.getTime())) {
        results.push({
          success: false,
          row: rowNum,
          customerCode: row.customerCode,
          productSku: row.productSku,
          snapshotDate: row.snapshotDate,
          error: 'Invalid snapshotDate format',
        });
        failed++;
        continue;
      }

      // Get customer ID
      const customerId = customerMap.get(row.customerCode);
      if (!customerId) {
        results.push({
          success: false,
          row: rowNum,
          customerCode: row.customerCode,
          productSku: row.productSku,
          snapshotDate: row.snapshotDate,
          error: `Customer not found: ${row.customerCode}`,
        });
        failed++;
        continue;
      }

      // Get product ID
      const productId = productMap.get(row.productSku);
      if (!productId) {
        results.push({
          success: false,
          row: rowNum,
          customerCode: row.customerCode,
          productSku: row.productSku,
          snapshotDate: row.snapshotDate,
          error: `Product not found: ${row.productSku}`,
        });
        failed++;
        continue;
      }

      try {
        const snapshotData = {
          quantity: parseInt(String(row.quantity)) || 0,
          value: parseFloat(String(row.value)) || 0,
          location: row.location || null,
          batchNumber: row.batchNumber || null,
          expiryDate: row.expiryDate ? new Date(row.expiryDate) : null,
        };

        if (mode === 'replace') {
          // Delete existing snapshot for this date and create new
          await prisma.inventorySnapshot.deleteMany({
            where: {
              customerId,
              productId,
              snapshotDate,
            },
          });
        }

        await prisma.inventorySnapshot.create({
          data: {
            customerId,
            productId,
            snapshotDate,
            ...snapshotData,
          },
        });

        created++;
        results.push({
          success: true,
          row: rowNum,
          customerCode: row.customerCode,
          productSku: row.productSku,
          snapshotDate: row.snapshotDate,
          action: 'created',
        });
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Database error';
        results.push({
          success: false,
          row: rowNum,
          customerCode: row.customerCode,
          productSku: row.productSku,
          snapshotDate: row.snapshotDate,
          error: errorMessage,
        });
        failed++;
      }
    }

    return res.status(200).json({
      summary: {
        total: data.length,
        created,
        updated,
        failed,
        successRate: Math.round(((created + updated) / data.length) * 100),
      },
      results: results.slice(0, 100),
      hasMore: results.length > 100,
    });
  } catch (error) {
    console.error('Inventory import error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
