/**
 * Scenario Versions API
 * GET /api/planning/scenarios/[id]/versions - Get version history
 * POST /api/planning/scenarios/[id]/versions/restore - Restore a version
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
    return res.status(400).json({ error: 'Scenario ID is required' });
  }

  try {
    if (req.method === 'GET') {
      return handleGetVersions(id, req, res);
    } else if (req.method === 'POST') {
      return handleRestoreVersion(id, req, res);
    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error: any) {
    console.error('Scenario versions error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}

async function handleGetVersions(
  scenarioId: string,
  req: VercelRequest,
  res: VercelResponse
) {
  const { page = '1', limit = '10' } = req.query as Record<string, string>;

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  // Check scenario exists
  const scenario = await prisma.scenario.findUnique({
    where: { id: scenarioId },
    select: { id: true, name: true },
  });

  if (!scenario) {
    return res.status(404).json({ error: 'Scenario not found' });
  }

  // Fetch versions
  const [versions, total] = await Promise.all([
    prisma.scenarioVersion.findMany({
      where: { scenarioId },
      skip,
      take: limitNum,
      orderBy: { version: 'desc' },
      select: {
        id: true,
        version: true,
        parameters: true,
        results: true,
        notes: true,
        createdAt: true,
      },
    }),
    prisma.scenarioVersion.count({ where: { scenarioId } }),
  ]);

  // Add computed fields to versions
  const versionsWithSummary = versions.map((v) => {
    const results = v.results as any;
    return {
      ...v,
      summary: results
        ? {
            roi: results.roi,
            netMargin: results.netMargin,
            salesLiftPercent: results.salesLiftPercent,
            paybackDays: results.paybackDays,
          }
        : null,
    };
  });

  return res.status(200).json({
    success: true,
    data: {
      scenario: { id: scenario.id, name: scenario.name },
      versions: versionsWithSummary,
    },
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  });
}

async function handleRestoreVersion(
  scenarioId: string,
  req: VercelRequest,
  res: VercelResponse
) {
  const { versionId } = req.body;

  if (!versionId) {
    return res.status(400).json({ error: 'Version ID is required' });
  }

  // Fetch the version to restore
  const version = await prisma.scenarioVersion.findUnique({
    where: { id: versionId },
  });

  if (!version) {
    return res.status(404).json({ error: 'Version not found' });
  }

  if (version.scenarioId !== scenarioId) {
    return res.status(400).json({ error: 'Version does not belong to this scenario' });
  }

  // Update scenario with version's parameters and results
  const updated = await prisma.scenario.update({
    where: { id: scenarioId },
    data: {
      parameters: version.parameters as any,
      results: version.results as any,
      status: version.results ? 'COMPLETED' : 'DRAFT',
      updatedAt: new Date(),
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

  return res.status(200).json({
    success: true,
    data: updated,
    message: `Restored to version ${version.version}`,
  });
}
