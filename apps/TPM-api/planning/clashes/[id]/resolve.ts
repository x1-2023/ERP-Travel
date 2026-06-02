/**
 * Clash Resolution API
 * POST /api/planning/clashes/[id]/resolve - Resolve a clash with action
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from '@/_lib/prisma';
import { getUserFromRequest } from '../../../_lib/auth';

interface ResolveRequest {
  resolution: 'ADJUST_DATES' | 'MERGE' | 'CANCEL_ONE' | 'ACCEPT_OVERLAP' | 'OTHER';
  action?: {
    promotionId: string;
    newStartDate?: string;
    newEndDate?: string;
    cancel?: boolean;
  };
  notes?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const user = getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Clash ID is required' });
  }

  try {
    const clash = await prisma.promotionClash.findUnique({
      where: { id },
      include: {
        promotionA: true,
        promotionB: true,
      },
    });

    if (!clash) {
      return res.status(404).json({ error: 'Clash not found' });
    }

    if (clash.status === 'RESOLVED') {
      return res.status(400).json({ error: 'Clash is already resolved' });
    }

    const { resolution, action, notes } = req.body as ResolveRequest;

    if (!resolution) {
      return res.status(400).json({ error: 'Resolution type is required' });
    }

    // Execute resolution action
    let actionResult: any = null;

    if (resolution === 'ADJUST_DATES' && action?.promotionId) {
      // Adjust promotion dates
      const updateData: any = {};
      if (action.newStartDate) updateData.startDate = new Date(action.newStartDate);
      if (action.newEndDate) updateData.endDate = new Date(action.newEndDate);

      if (Object.keys(updateData).length > 0) {
        actionResult = await prisma.promotion.update({
          where: { id: action.promotionId },
          data: updateData,
          select: { id: true, code: true, name: true, startDate: true, endDate: true },
        });
      }
    } else if (resolution === 'CANCEL_ONE' && action?.promotionId && action?.cancel) {
      // Cancel one promotion
      actionResult = await prisma.promotion.update({
        where: { id: action.promotionId },
        data: { status: 'CANCELLED' },
        select: { id: true, code: true, name: true, status: true },
      });
    }

    // Update clash status
    const updated = await prisma.promotionClash.update({
      where: { id },
      data: {
        status: 'RESOLVED',
        resolutionNote: resolution,
        description: notes || null,
        resolvedAt: new Date(),
        resolvedById: user.userId,
      },
      include: {
        promotionA: {
          select: { id: true, code: true, name: true, startDate: true, endDate: true, status: true },
        },
        promotionB: {
          select: { id: true, code: true, name: true, startDate: true, endDate: true, status: true },
        },
        resolvedBy: {
          select: { id: true, name: true },
        },
      },
    });

    return res.status(200).json({
      success: true,
      data: updated,
      actionResult,
      message: `Clash resolved with ${resolution.toLowerCase().replace('_', ' ')}`,
    });
  } catch (error: any) {
    console.error('Clash resolve error:', error);
    return res.status(500).json({ error: error.message || 'Resolution failed' });
  }
}
