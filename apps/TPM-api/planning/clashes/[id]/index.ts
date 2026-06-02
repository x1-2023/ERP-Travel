/**
 * Clash API - Single Clash Operations
 * GET /api/planning/clashes/[id] - Get clash details
 * PUT /api/planning/clashes/[id] - Update clash status
 * DELETE /api/planning/clashes/[id] - Delete/dismiss clash
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from '@/_lib/prisma';
import { getUserFromRequest } from '../../../_lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const user = getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Clash ID is required' });
  }

  try {
    if (req.method === 'GET') {
      return handleGet(id, res);
    } else if (req.method === 'PUT') {
      return handleUpdate(id, req, res, user.userId);
    } else if (req.method === 'DELETE') {
      return handleDelete(id, res);
    } else {
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error: any) {
    console.error('Clash API error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}

async function handleGet(id: string, res: VercelResponse) {
  const clash = await prisma.promotionClash.findUnique({
    where: { id },
    include: {
      promotionA: {
        include: {
          customer: { select: { id: true, code: true, name: true } },
          tactics: { include: { items: true } },
          fund: { select: { id: true, code: true, name: true } },
        },
      },
      promotionB: {
        include: {
          customer: { select: { id: true, code: true, name: true } },
          tactics: { include: { items: true } },
          fund: { select: { id: true, code: true, name: true } },
        },
      },
      resolvedBy: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  if (!clash) {
    return res.status(404).json({ error: 'Clash not found' });
  }

  // Calculate additional analysis
  const analysis = analyzeClash(clash);

  return res.status(200).json({
    success: true,
    data: {
      ...clash,
      analysis,
    },
  });
}

async function handleUpdate(
  id: string,
  req: VercelRequest,
  res: VercelResponse,
  userId: string
) {
  const clash = await prisma.promotionClash.findUnique({
    where: { id },
  });

  if (!clash) {
    return res.status(404).json({ error: 'Clash not found' });
  }

  const { status, resolution, notes } = req.body;

  const updateData: any = { updatedAt: new Date() };

  if (status) {
    updateData.status = status;

    // If resolving, set resolution data
    if (status === 'RESOLVED') {
      updateData.resolvedAt = new Date();
      updateData.resolvedById = userId;
    }
  }

  if (resolution) {
    updateData.resolutionNote = resolution;
  }

  if (notes !== undefined) {
    updateData.description = notes;
  }

  const updated = await prisma.promotionClash.update({
    where: { id },
    data: updateData,
    include: {
      promotionA: {
        select: { id: true, code: true, name: true },
      },
      promotionB: {
        select: { id: true, code: true, name: true },
      },
      resolvedBy: {
        select: { id: true, name: true },
      },
    },
  });

  return res.status(200).json({
    success: true,
    data: updated,
  });
}

async function handleDelete(id: string, res: VercelResponse) {
  const clash = await prisma.promotionClash.findUnique({
    where: { id },
  });

  if (!clash) {
    return res.status(404).json({ error: 'Clash not found' });
  }

  await prisma.promotionClash.delete({
    where: { id },
  });

  return res.status(200).json({
    success: true,
    message: 'Clash dismissed',
  });
}

function analyzeClash(clash: any) {
  const promoA = clash.promotionA;
  const promoB = clash.promotionB;

  // Calculate overlap days
  const overlapStart = new Date(clash.overlapStart);
  const overlapEnd = new Date(clash.overlapEnd);
  const overlapDays = Math.ceil(
    (overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Calculate budget at risk
  const budgetA = promoA?.budget?.toNumber?.() || promoA?.budget || 0;
  const budgetB = promoB?.budget?.toNumber?.() || promoB?.budget || 0;

  // Overlap percentage of each promotion's duration
  const aDuration = promoA?.endDate && promoA?.startDate
    ? Math.ceil((new Date(promoA.endDate).getTime() - new Date(promoA.startDate).getTime()) / (1000 * 60 * 60 * 24))
    : 1;
  const bDuration = promoB?.endDate && promoB?.startDate
    ? Math.ceil((new Date(promoB.endDate).getTime() - new Date(promoB.startDate).getTime()) / (1000 * 60 * 60 * 24))
    : 1;

  const aOverlapPercent = (overlapDays / aDuration) * 100;
  const bOverlapPercent = (overlapDays / bDuration) * 100;

  // Recommendations
  const recommendations: string[] = [];

  if (clash.clashType === 'FULL_OVERLAP') {
    recommendations.push('Consider adjusting dates to avoid overlap');
    recommendations.push('Merge promotions into a single combined offer');
    recommendations.push('Prioritize one promotion and postpone the other');
  } else if (clash.clashType === 'CUSTOMER_OVERLAP') {
    recommendations.push('Review if multiple promotions are intentional for this customer');
    recommendations.push('Consider combining into a tiered promotion');
  } else if (clash.clashType === 'PRODUCT_OVERLAP') {
    recommendations.push('Ensure pricing strategies don\'t conflict');
    recommendations.push('Review product allocation between promotions');
  }

  return {
    overlapDays,
    budgetAtRisk: {
      promotionA: Math.round(budgetA * (aOverlapPercent / 100)),
      promotionB: Math.round(budgetB * (bOverlapPercent / 100)),
      total: Math.round(budgetA * (aOverlapPercent / 100) + budgetB * (bOverlapPercent / 100)),
    },
    overlapPercentage: {
      promotionA: Math.round(aOverlapPercent),
      promotionB: Math.round(bOverlapPercent),
    },
    recommendations,
  };
}
