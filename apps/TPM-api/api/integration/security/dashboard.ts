/**
 * Security Dashboard API
 * GET /api/integration/security/dashboard - Get security overview
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from '../../../_lib/prisma';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // API Keys stats
    const apiKeys = await prisma.aPIKey.findMany({
      select: {
        status: true,
        expiresAt: true,
        totalRequests: true,
        lastUsedAt: true,
      },
    });

    const activeKeys = apiKeys.filter((k: any) => k.status === 'ACTIVE').length;
    const expiringSoon = apiKeys.filter(
      (k: any) => k.status === 'ACTIVE' && k.expiresAt && new Date(k.expiresAt) <= sevenDaysLater && new Date(k.expiresAt) > now
    ).length;
    const totalAPIUsage = apiKeys.reduce((sum: any, k: any) => sum + Number(k.totalRequests), 0);

    // Audit logs stats
    const [todayLogins, todayActions, recentSensitiveActions] = await Promise.all([
      prisma.immutableAuditLog.count({
        where: {
          action: 'LOGIN',
          timestamp: { gte: today },
        },
      }),
      prisma.immutableAuditLog.count({
        where: {
          timestamp: { gte: today },
        },
      }),
      prisma.immutableAuditLog.findMany({
        where: {
          action: { in: ['DELETE', 'APPROVE', 'REJECT'] },
          timestamp: { gte: sevenDaysAgo },
        },
        include: {
          user: {
            select: { name: true },
          },
        },
        orderBy: { timestamp: 'desc' },
        take: 10,
      }),
    ]);

    // Actions by type (last 7 days)
    const actionsByType = await prisma.immutableAuditLog.groupBy({
      by: ['action'],
      where: {
        timestamp: { gte: sevenDaysAgo },
      },
      _count: true,
      orderBy: {
        _count: {
          action: 'desc',
        },
      },
    });

    // Entity types modified (last 7 days)
    const entityTypes = await prisma.immutableAuditLog.groupBy({
      by: ['entityType'],
      where: {
        timestamp: { gte: sevenDaysAgo },
        action: { in: ['CREATE', 'UPDATE', 'DELETE'] },
      },
      _count: true,
      orderBy: {
        _count: {
          entityType: 'desc',
        },
      },
    });

    return res.status(200).json({
      success: true,
      data: {
        apiKeys: {
          total: apiKeys.length,
          active: activeKeys,
          expiringSoon,
          totalUsage: totalAPIUsage,
        },
        audit: {
          todayLogins,
          todayActions,
          recentSensitiveActions: recentSensitiveActions.map((a: any) => ({
            id: a.id,
            action: a.action,
            entityType: a.entityType,
            entityId: a.entityId,
            user: a.user?.name || 'System',
            timestamp: a.timestamp,
          })),
          actionsByType: actionsByType.map((a: any) => ({
            action: a.action,
            count: a._count,
          })),
          entityTypes: entityTypes.map((e: any) => ({
            entityType: e.entityType,
            count: e._count,
          })),
        },
      },
    });
  } catch (error) {
    console.error('Security Dashboard API error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
