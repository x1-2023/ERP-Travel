/**
 * ERP Sync API
 * POST /api/integration/erp/:id/sync - Trigger sync
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
    const { entityType = 'ALL', direction = 'BIDIRECTIONAL', syncType = 'INCREMENTAL', dateFrom } = req.body;

    const connection = await prisma.eRPConnection.findUnique({
      where: { id },
      include: {
        mappings: {
          where: { isActive: true },
        },
      },
    });

    if (!connection) {
      return res.status(404).json({
        success: false,
        error: 'ERP connection not found',
      });
    }

    if (connection.status !== 'ACTIVE') {
      return res.status(400).json({
        success: false,
        error: 'Connection is not active. Please test the connection first.',
      });
    }

    // Check for running sync
    const runningSync = await (prisma as any).eRPSyncLog.findFirst({
      where: {
        connectionId: id,
        status: 'RUNNING',
      },
    });

    if (runningSync) {
      return res.status(400).json({
        success: false,
        error: 'A sync is already in progress',
      });
    }

    // Create sync log
    const syncLog = await (prisma as any).eRPSyncLog.create({
      data: {
        connectionId: id,
        syncType,
        entityType,
        direction,
        status: 'RUNNING',
        startedAt: new Date(),
        recordsTotal: 0,
        recordsSuccess: 0,
        recordsFailed: 0,
      },
    });

    // Start sync in background (simulated)
    executeSyncJob(syncLog.id, connection, entityType, direction, syncType, dateFrom).catch(console.error);

    return res.status(200).json({
      success: true,
      data: syncLog,
      message: 'Sync started successfully',
    });
  } catch (error) {
    console.error('ERP sync API error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

async function executeSyncJob(
  logId: string,
  connection: any,
  entityType: string,
  direction: string,
  syncType: string,
  dateFrom?: string
) {
  const startTime = Date.now();
  let recordsTotal = 0;
  let recordsSuccess = 0;
  let recordsFailed = 0;
  const errors: string[] = [];

  try {
    // Simulate fetching data from ERP
    const entities = entityType === 'ALL' ? ['PRODUCT', 'CUSTOMER', 'ORDER'] : [entityType];

    for (const entity of entities) {
      // Simulate data sync
      const mockData = generateMockERPData(entity, 50);
      recordsTotal += mockData.length;

      for (const record of mockData) {
        try {
          // Simulate processing each record
          await processERPRecord(entity, record, direction);
          recordsSuccess++;
        } catch (error) {
          recordsFailed++;
          errors.push(`${entity} ${record.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    }

    const duration = Math.round((Date.now() - startTime) / 1000);

    // Update sync log
    await (prisma as any).eRPSyncLog.update({
      where: { id: logId },
      data: {
        status: recordsFailed === 0 ? 'COMPLETED' : 'COMPLETED_WITH_ERRORS',
        recordsTotal,
        recordsSuccess,
        recordsFailed,
        errors: errors.length > 0 ? errors.slice(0, 100) : null,
        completedAt: new Date(),
        duration,
      },
    });

    // Update connection last sync
    await prisma.eRPConnection.update({
      where: { id: connection.id },
      data: {
        lastPingAt: new Date(),
        lastPingStatus: recordsFailed === 0,
      },
    });
  } catch (error) {
    await (prisma as any).eRPSyncLog.update({
      where: { id: logId },
      data: {
        status: 'FAILED',
        errors: [error instanceof Error ? error.message : 'Sync failed'],
        completedAt: new Date(),
        duration: Math.round((Date.now() - startTime) / 1000),
      },
    });

    await prisma.eRPConnection.update({
      where: { id: connection.id },
      data: {
        lastPingAt: new Date(),
        lastPingStatus: false,
      },
    });
  }
}

function generateMockERPData(entityType: string, count: number): Array<{ id: string; name: string }> {
  return Array.from({ length: count }, (_, i) => ({
    id: `${entityType.toLowerCase()}-${i + 1}`,
    name: `${entityType} ${i + 1}`,
  }));
}

async function processERPRecord(entityType: string, record: { id: string; name: string }, direction: string): Promise<void> {
  // Simulate processing delay
  await new Promise((resolve) => setTimeout(resolve, 10));

  // Simulate random failure (5% chance)
  if (Math.random() < 0.05) {
    throw new Error('Validation failed');
  }
}
