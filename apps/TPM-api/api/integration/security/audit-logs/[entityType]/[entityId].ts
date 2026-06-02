/**
 * Entity Audit Trail API
 * GET /api/integration/security/audit-logs/:entityType/:entityId - Get entity audit trail
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from '../../../../../_lib/prisma';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { entityType, entityId } = req.query;

  if (!entityType || !entityId || typeof entityType !== 'string' || typeof entityId !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Entity type and ID are required',
    });
  }

  try {
    const logs = await prisma.immutableAuditLog.findMany({
      where: {
        entityType,
        entityId,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { timestamp: 'desc' },
    });

    // Get entity info if available
    let entityInfo = null;
    try {
      switch (entityType) {
        case 'Promotion':
          entityInfo = await prisma.promotion.findUnique({
            where: { id: entityId },
            select: { id: true, code: true, name: true },
          });
          break;
        case 'Claim':
          entityInfo = await prisma.claim.findUnique({
            where: { id: entityId },
            select: { id: true, code: true, status: true },
          });
          break;
        case 'Customer':
          entityInfo = await prisma.customer.findUnique({
            where: { id: entityId },
            select: { id: true, code: true, name: true },
          });
          break;
        case 'Product':
          entityInfo = await prisma.product.findUnique({
            where: { id: entityId },
            select: { id: true, sku: true, name: true },
          });
          break;
        case 'User':
          entityInfo = await prisma.user.findUnique({
            where: { id: entityId },
            select: { id: true, name: true, email: true },
          });
          break;
      }
    } catch {
      // Entity might not exist anymore
    }

    return res.status(200).json({
      success: true,
      data: {
        entityType,
        entityId,
        entityInfo,
        logs,
        totalChanges: logs.length,
      },
    });
  } catch (error) {
    console.error('Entity Audit Trail API error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
