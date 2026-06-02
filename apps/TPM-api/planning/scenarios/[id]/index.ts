/**
 * Scenario API - Single Scenario Operations
 * GET /api/planning/scenarios/[id] - Get scenario details
 * PUT /api/planning/scenarios/[id] - Update scenario
 * DELETE /api/planning/scenarios/[id] - Delete scenario
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from '@/_lib/prisma';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Scenario ID is required' });
  }

  try {
    if (req.method === 'GET') {
      return handleGet(id, res);
    } else if (req.method === 'PUT') {
      return handleUpdate(id, req, res);
    } else if (req.method === 'DELETE') {
      return handleDelete(id, res);
    } else {
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error: any) {
    console.error('Scenario API error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}

async function handleGet(id: string, res: VercelResponse) {
  const scenario = await prisma.scenario.findUnique({
    where: { id },
    include: {
      baseline: {
        select: {
          id: true,
          category: true,
          brand: true,
          baselineVolume: true,
          baselineRevenue: true,
        },
      },
      createdBy: {
        select: { id: true, name: true, email: true },
      },
      versions: {
        orderBy: { version: 'desc' },
        take: 10,
        select: {
          id: true,
          version: true,
          parameters: true,
          results: true,
          notes: true,
          createdAt: true,
        },
      },
    },
  });

  if (!scenario) {
    return res.status(404).json({ error: 'Scenario not found' });
  }

  return res.status(200).json({
    success: true,
    data: scenario,
  });
}

async function handleUpdate(id: string, req: VercelRequest, res: VercelResponse) {
  const scenario = await prisma.scenario.findUnique({
    where: { id },
  });

  if (!scenario) {
    return res.status(404).json({ error: 'Scenario not found' });
  }

  const {
    name,
    description,
    parameters,
    assumptions,
    status,
  } = req.body;

  // Build update data
  const updateData: any = { updatedAt: new Date() };

  if (name !== undefined) updateData.name = name;
  if (description !== undefined) updateData.description = description;
  if (parameters !== undefined) updateData.parameters = parameters;
  if (assumptions !== undefined) updateData.assumptions = assumptions;
  if (status !== undefined) updateData.status = status;

  // If parameters changed, clear previous results
  if (parameters !== undefined) {
    updateData.results = null;
    updateData.status = 'DRAFT';
  }

  const updated = await prisma.scenario.update({
    where: { id },
    data: updateData,
    include: {
      baseline: {
        select: { id: true, category: true, brand: true },
      },
      createdBy: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  return res.status(200).json({
    success: true,
    data: updated,
  });
}

async function handleDelete(id: string, res: VercelResponse) {
  const scenario = await prisma.scenario.findUnique({
    where: { id },
  });

  if (!scenario) {
    return res.status(404).json({ error: 'Scenario not found' });
  }

  // Delete versions first, then scenario
  await prisma.$transaction([
    prisma.scenarioVersion.deleteMany({ where: { scenarioId: id } }),
    prisma.scenario.delete({ where: { id } }),
  ]);

  return res.status(200).json({
    success: true,
    message: 'Scenario deleted successfully',
  });
}
