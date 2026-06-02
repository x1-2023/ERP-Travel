/**
 * Template Versions API
 * GET /api/planning/templates/[id]/versions - Get version history
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from '../../../_lib/prisma';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Template ID is required' });
  }

  try {
    // Verify template exists
    const template = await prisma.promotionTemplate.findUnique({
      where: { id },
      select: { id: true, name: true },
    });

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    // Get all versions
    const versions = await prisma.templateVersion.findMany({
      where: { templateId: id },
      orderBy: { version: 'desc' },
    });

    return res.status(200).json({
      success: true,
      data: {
        template,
        versions,
        totalVersions: versions.length,
      },
    });
  } catch (error: any) {
    console.error('Template versions error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
