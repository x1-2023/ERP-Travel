/**
 * Scenario Clone API
 * POST /api/planning/scenarios/[id]/clone - Clone a scenario
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Prisma } from '@prisma/client';
import prisma from '../../../_lib/prisma';
import { getUserFromRequest } from '../../../_lib/auth';

interface CloneRequest {
  name?: string;
  description?: string;
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
    return res.status(400).json({ error: 'Scenario ID is required' });
  }

  try {
    // Fetch original scenario
    const original = await prisma.scenario.findUnique({
      where: { id },
      include: {
        baseline: {
          select: { id: true, category: true, brand: true },
        },
      },
    });

    if (!original) {
      return res.status(404).json({ error: 'Scenario not found' });
    }

    const { name, description } = (req.body || {}) as CloneRequest;

    // Generate clone name if not provided
    const cloneName = name?.trim() || `${original.name} (Copy)`;

    // Create cloned scenario
    const cloned = await prisma.scenario.create({
      data: {
        name: cloneName,
        description: description?.trim() || original.description,
        baselineId: original.baselineId,
        parameters: original.parameters as any,
        assumptions: original.assumptions as any,
        status: 'DRAFT',
        results: Prisma.JsonNull, // Don't copy results - new scenario needs to run
        createdById: user.userId,
      },
      include: {
        baseline: {
          select: { id: true, category: true, brand: true },
        },
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return res.status(201).json({
      success: true,
      data: cloned,
      message: `Scenario cloned from "${original.name}"`,
    });
  } catch (error: any) {
    console.error('Scenario clone error:', error);
    return res.status(500).json({ error: error.message || 'Clone failed' });
  }
}
