/**
 * Inventory API - Bulk Snapshots
 * POST /api/operations/inventory/snapshots-bulk - Create multiple snapshots at once
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from '@/_lib/prisma';
import { getUserFromRequest } from '../../_lib/auth';

interface SnapshotItem {
  customerId?: string;
  customerCode?: string;
  productId?: string;
  productSku?: string;
  quantity: number;
  value: number;
  location?: string;
  batchNumber?: string;
  expiryDate?: string;
}

interface BulkResult {
  success: boolean;
  index: number;
  customerId?: string;
  productId?: string;
  error?: string;
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
    const {
      snapshotDate,
      items,
      mode = 'create', // 'create' | 'replace'
    } = req.body as {
      snapshotDate: string;
      items: SnapshotItem[];
      mode?: 'create' | 'replace';
    };

    // Validate
    if (!snapshotDate) {
      return res.status(400).json({ error: 'snapshotDate is required' });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'items array is required' });
    }

    if (items.length > 1000) {
      return res.status(400).json({ error: 'Maximum 1000 items per request' });
    }

    const parsedDate = new Date(snapshotDate);

    // Get unique customer codes and product SKUs for lookup
    const customerCodes = [...new Set(items.filter((i) => i.customerCode).map((i) => i.customerCode!))];
    const productSkus = [...new Set(items.filter((i) => i.productSku).map((i) => i.productSku!))];

    // Lookup customers and products
    const [customers, products] = await Promise.all([
      customerCodes.length > 0
        ? prisma.customer.findMany({
            where: { code: { in: customerCodes } },
            select: { id: true, code: true },
          })
        : [],
      productSkus.length > 0
        ? prisma.product.findMany({
            where: { sku: { in: productSkus } },
            select: { id: true, sku: true },
          })
        : [],
    ]);

    const customerMap = new Map<string, string>((customers as any[]).map((c) => [c.code, c.id]));
    const productMap = new Map<string, string>((products as any[]).map((p) => [p.sku, p.id]));

    // Process items
    const results: BulkResult[] = [];
    let created = 0;
    let replaced = 0;
    let failed = 0;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      // Resolve customer ID
      let customerId = item.customerId;
      if (!customerId && item.customerCode) {
        customerId = customerMap.get(item.customerCode);
        if (!customerId) {
          results.push({
            success: false,
            index: i,
            error: `Customer not found: ${item.customerCode}`,
          });
          failed++;
          continue;
        }
      }

      if (!customerId) {
        results.push({
          success: false,
          index: i,
          error: 'customerId or customerCode is required',
        });
        failed++;
        continue;
      }

      // Resolve product ID
      let productId = item.productId;
      if (!productId && item.productSku) {
        productId = productMap.get(item.productSku);
        if (!productId) {
          results.push({
            success: false,
            index: i,
            error: `Product not found: ${item.productSku}`,
          });
          failed++;
          continue;
        }
      }

      if (!productId) {
        results.push({
          success: false,
          index: i,
          error: 'productId or productSku is required',
        });
        failed++;
        continue;
      }

      try {
        // If replace mode, delete existing snapshot for this date/customer/product
        if (mode === 'replace') {
          const deleted = await prisma.inventorySnapshot.deleteMany({
            where: {
              customerId,
              productId,
              snapshotDate: parsedDate,
            },
          });
          if (deleted.count > 0) replaced++;
        }

        // Create new snapshot
        await prisma.inventorySnapshot.create({
          data: {
            customerId,
            productId,
            snapshotDate: parsedDate,
            quantity: parseInt(String(item.quantity)) || 0,
            value: parseFloat(String(item.value)) || 0,
            location: item.location || null,
            batchNumber: item.batchNumber || null,
            expiryDate: item.expiryDate ? new Date(item.expiryDate) : null,
          },
        });

        created++;
        results.push({
          success: true,
          index: i,
          customerId,
          productId,
        });
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Database error';
        results.push({
          success: false,
          index: i,
          customerId,
          productId,
          error: errorMessage,
        });
        failed++;
      }
    }

    return res.status(200).json({
      success: true,
      summary: {
        total: items.length,
        created,
        replaced,
        failed,
        successRate: Math.round(((created) / items.length) * 100),
      },
      results: results.slice(0, 100),
      hasMore: results.length > 100,
      meta: {
        snapshotDate,
        mode,
      },
    });
  } catch (error) {
    console.error('Bulk snapshots error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
