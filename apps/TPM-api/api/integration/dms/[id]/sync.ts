/**
 * DMS Sync API
 * POST /api/integration/dms/:id/sync - Sync data from DMS
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from '../../../../_lib/prisma';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ success: false, error: 'Connection ID is required' });
  }

  try {
    const { dataType = 'ALL', periodFrom, periodTo } = req.body;

    const connection = await (prisma as any).dMSConnection.findUnique({
      where: { id },
      include: { distributor: true },
    });

    if (!connection) {
      return res.status(404).json({
        success: false,
        error: 'DMS connection not found',
      });
    }

    if (connection.status !== 'ACTIVE') {
      return res.status(400).json({
        success: false,
        error: 'Connection is not active',
      });
    }

    // Simulate DMS data fetch and sync
    const syncResult = await executeDMSSync(connection, dataType, periodFrom, periodTo);

    // Update connection last sync
    await (prisma as any).dMSConnection.update({
      where: { id },
      data: {
        lastSyncAt: new Date(),
        lastSyncStatus: syncResult.success ? 'COMPLETED' : 'FAILED',
      },
    });

    return res.status(200).json({
      success: true,
      data: syncResult,
      message: `Synced ${syncResult.recordsSynced} records from DMS`,
    });
  } catch (error) {
    console.error('DMS sync API error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

interface DMSConnection {
  id: string;
  distributorId: string;
  config: unknown;
  distributor: { id: string; name: string } | null;
}

async function executeDMSSync(
  connection: DMSConnection,
  dataType: string,
  periodFrom?: string,
  periodTo?: string
): Promise<{ success: boolean; recordsSynced: number; errors: string[] }> {
  let recordsSynced = 0;
  const errors: string[] = [];

  try {
    // Generate mock DMS data based on dataType
    const dataTypes = dataType === 'ALL' ? ['SELL_OUT', 'STOCK'] : [dataType];

    for (const type of dataTypes) {
      if (type === 'SELL_OUT') {
        // Simulate sell-out data
        const mockSellOut = generateMockSellOutData(10, periodFrom);

        for (const record of mockSellOut) {
          try {
            await prisma.sellTracking.upsert({
              where: {
                customerId_productId_period: {
                  customerId: connection.distributorId,
                  productId: record.productId,
                  period: record.period,
                },
              },
              update: {
                sellOutQty: record.quantity,
                sellOutValue: record.value,
              },
              create: {
                customerId: connection.distributorId,
                productId: record.productId,
                period: record.period,
                sellOutQty: record.quantity,
                sellOutValue: record.value,
                sellInQty: 0,
                sellInValue: 0,
                stockQty: 0,
                stockValue: 0,
              },
            });
            recordsSynced++;
          } catch (error) {
            errors.push(`Sell-out ${record.productId}: ${error instanceof Error ? error.message : 'Error'}`);
          }
        }
      }

      if (type === 'STOCK') {
        // Simulate stock data
        const mockStock = generateMockStockData(10);

        for (const record of mockStock) {
          try {
            await prisma.inventorySnapshot.create({
              data: {
                customerId: connection.distributorId,
                productId: record.productId,
                snapshotDate: new Date(),
                quantity: record.quantity,
                value: record.value,
              },
            });
            recordsSynced++;
          } catch (error) {
            errors.push(`Stock ${record.productId}: ${error instanceof Error ? error.message : 'Error'}`);
          }
        }
      }
    }

    return {
      success: errors.length === 0,
      recordsSynced,
      errors,
    };
  } catch (error) {
    return {
      success: false,
      recordsSynced: 0,
      errors: [error instanceof Error ? error.message : 'Sync failed'],
    };
  }
}

function generateMockSellOutData(count: number, periodFrom?: string): Array<{
  productId: string;
  period: string;
  quantity: number;
  value: number;
}> {
  const period = periodFrom || new Date().toISOString().slice(0, 7);
  return Array.from({ length: count }, (_, i) => ({
    productId: `product-${i + 1}`,
    period,
    quantity: Math.floor(Math.random() * 100) + 10,
    value: Math.floor(Math.random() * 10000) + 1000,
  }));
}

function generateMockStockData(count: number): Array<{
  productId: string;
  quantity: number;
  value: number;
}> {
  return Array.from({ length: count }, (_, i) => ({
    productId: `product-${i + 1}`,
    quantity: Math.floor(Math.random() * 500) + 50,
    value: Math.floor(Math.random() * 50000) + 5000,
  }));
}
