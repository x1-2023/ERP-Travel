/**
 * Sell Tracking API - Import
 * POST /api/operations/sell-tracking/import - Import data from CSV
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from '@/_lib/prisma';
import { getUserFromRequest } from '../../_lib/auth';

interface ImportRow {
  customerCode: string;
  productCode?: string; // Product code (alias for sku)
  productSku?: string; // Product SKU
  period: string;
  sellInQty?: number | string;
  sellInValue?: number | string;
  sellOutQty?: number | string;
  sellOutValue?: number | string;
  stockQty?: number | string;
  stockValue?: number | string;
}

interface ImportResult {
  success: boolean;
  row: number;
  customerCode: string;
  productSku: string;
  period: string;
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
    const { data, mode = 'upsert' } = req.body as {
      data: ImportRow[];
      mode?: 'upsert' | 'create' | 'update';
    };

    if (!data || !Array.isArray(data) || data.length === 0) {
      return res.status(400).json({ error: 'No data provided' });
    }

    // Validate data structure
    const firstRow = data[0];
    const hasProductCode = 'productCode' in firstRow;
    const hasProductSku = 'productSku' in firstRow;

    if (!('customerCode' in firstRow)) {
      return res.status(400).json({
        error: 'Missing required field: customerCode',
        providedFields: Object.keys(firstRow),
      });
    }

    if (!hasProductCode && !hasProductSku) {
      return res.status(400).json({
        error: 'Missing required field: productCode or productSku',
        providedFields: Object.keys(firstRow),
      });
    }

    if (!('period' in firstRow)) {
      return res.status(400).json({
        error: 'Missing required field: period',
        providedFields: Object.keys(firstRow),
      });
    }

    // Get all unique customer and product codes/SKUs
    const customerCodes = [...new Set(data.map((r) => r.customerCode))];
    const productSkus = [...new Set(data.map((r) => r.productSku || r.productCode))];

    // Lookup customers and products
    const [customers, products] = await Promise.all([
      prisma.customer.findMany({
        where: { code: { in: customerCodes } },
        select: { id: true, code: true },
      }),
      prisma.product.findMany({
        where: { sku: { in: productSkus as string[] } },
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
      const productSku = row.productSku || row.productCode || '';

      // Validate period format
      if (!/^\d{4}-\d{2}$/.test(row.period)) {
        results.push({
          success: false,
          row: rowNum,
          customerCode: row.customerCode,
          productSku,
          period: row.period,
          error: 'Invalid period format. Expected YYYY-MM',
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
          productSku,
          period: row.period,
          error: `Customer not found: ${row.customerCode}`,
        });
        failed++;
        continue;
      }

      // Get product ID
      const productId = productMap.get(productSku);
      if (!productId) {
        results.push({
          success: false,
          row: rowNum,
          customerCode: row.customerCode,
          productSku,
          period: row.period,
          error: `Product not found: ${productSku}`,
        });
        failed++;
        continue;
      }

      // Parse numeric values
      const sellInQty = row.sellInQty !== undefined ? parseInt(String(row.sellInQty)) || 0 : 0;
      const sellInValue = row.sellInValue !== undefined ? parseFloat(String(row.sellInValue)) || 0 : 0;
      const sellOutQty = row.sellOutQty !== undefined ? parseInt(String(row.sellOutQty)) || 0 : 0;
      const sellOutValue = row.sellOutValue !== undefined ? parseFloat(String(row.sellOutValue)) || 0 : 0;
      const stockQty = row.stockQty !== undefined ? parseInt(String(row.stockQty)) || 0 : 0;
      const stockValue = row.stockValue !== undefined ? parseFloat(String(row.stockValue)) || 0 : 0;

      try {
        const recordData = {
          sellInQty,
          sellInValue,
          sellOutQty,
          sellOutValue,
          stockQty,
          stockValue,
        };

        if (mode === 'upsert') {
          const existing = await prisma.sellTracking.findUnique({
            where: {
              customerId_productId_period: { customerId, productId, period: row.period },
            },
          });

          await prisma.sellTracking.upsert({
            where: {
              customerId_productId_period: { customerId, productId, period: row.period },
            },
            update: recordData,
            create: {
              customerId,
              productId,
              period: row.period,
              ...recordData,
            },
          });

          if (existing) {
            updated++;
            results.push({
              success: true,
              row: rowNum,
              customerCode: row.customerCode,
              productSku,
              period: row.period,
              action: 'updated',
            });
          } else {
            created++;
            results.push({
              success: true,
              row: rowNum,
              customerCode: row.customerCode,
              productSku,
              period: row.period,
              action: 'created',
            });
          }
        } else if (mode === 'create') {
          await prisma.sellTracking.create({
            data: {
              customerId,
              productId,
              period: row.period,
              ...recordData,
            },
          });
          created++;
          results.push({
            success: true,
            row: rowNum,
            customerCode: row.customerCode,
            productSku,
            period: row.period,
            action: 'created',
          });
        } else if (mode === 'update') {
          const existing = await prisma.sellTracking.findUnique({
            where: {
              customerId_productId_period: { customerId, productId, period: row.period },
            },
          });

          if (!existing) {
            results.push({
              success: false,
              row: rowNum,
              customerCode: row.customerCode,
              productSku,
              period: row.period,
              error: 'Record not found for update',
            });
            failed++;
            continue;
          }

          await prisma.sellTracking.update({
            where: { id: existing.id },
            data: recordData,
          });
          updated++;
          results.push({
            success: true,
            row: rowNum,
            customerCode: row.customerCode,
            productSku,
            period: row.period,
            action: 'updated',
          });
        }
      } catch (error: any) {
        results.push({
          success: false,
          row: rowNum,
          customerCode: row.customerCode,
          productSku,
          period: row.period,
          error: error.message || 'Database error',
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
      results: results.slice(0, 100), // Limit results to first 100 for large imports
      hasMore: results.length > 100,
    });
  } catch (error) {
    console.error('Sell tracking import error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
