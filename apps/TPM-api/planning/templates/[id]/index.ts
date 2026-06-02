/**
 * Promotion Template API - Single Template Operations
 * GET /api/planning/templates/[id] - Get template details
 * PUT /api/planning/templates/[id] - Update template (creates version)
 * DELETE /api/planning/templates/[id] - Soft delete template
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from '../../../_lib/prisma';
import { getUserFromRequest } from '../../../_lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Template ID is required' });
  }

  const user = getUserFromRequest(req);

  try {
    if (req.method === 'GET') {
      return handleGet(id, res);
    } else if (req.method === 'PUT') {
      return handleUpdate(id, req, res, user?.userId || '');
    } else if (req.method === 'DELETE') {
      return handleDelete(id, res);
    } else {
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error: any) {
    console.error('Template API error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}

async function handleGet(id: string, res: VercelResponse) {
  const template = await prisma.promotionTemplate.findUnique({
    where: { id },
    include: {
      createdBy: {
        select: { id: true, name: true, email: true },
      },
      versions: {
        orderBy: { version: 'desc' },
        take: 10,
        select: {
          id: true,
          version: true,
          changes: true,
          createdAt: true,
        },
      },
    },
  });

  if (!template) {
    return res.status(404).json({ error: 'Template not found' });
  }

  return res.status(200).json({
    success: true,
    data: template,
  });
}

async function handleUpdate(id: string, req: VercelRequest, res: VercelResponse, userId: string) {
  const template = await prisma.promotionTemplate.findUnique({
    where: { id },
    include: {
      versions: {
        orderBy: { version: 'desc' },
        take: 1,
      },
    },
  });

  if (!template) {
    return res.status(404).json({ error: 'Template not found' });
  }

  const {
    name,
    description,
    category,
    isPublic,
    templateData,
  } = req.body;

  // Build changes object for version tracking
  const changes: Record<string, { old: any; new: any }> = {};
  const updateData: any = { updatedAt: new Date() };

  if (name !== undefined && name !== template.name) {
    changes.name = { old: template.name, new: name };
    updateData.name = name;
  }
  if (description !== undefined && description !== template.description) {
    changes.description = { old: template.description, new: description };
    updateData.description = description;
  }
  if (category !== undefined && category !== template.category) {
    changes.category = { old: template.category, new: category };
    updateData.category = category;
  }
  if (isPublic !== undefined && isPublic !== template.isPublic) {
    changes.isPublic = { old: template.isPublic, new: isPublic };
    updateData.isPublic = isPublic;
  }
  if (templateData !== undefined) {
    changes.template = { old: template.template, new: templateData };
    updateData.template = templateData;
  }

  // If no changes, return current template
  if (Object.keys(changes).length === 0) {
    return res.status(200).json({
      success: true,
      data: template,
      message: 'No changes detected',
    });
  }

  // Calculate new version number
  const currentVersion = template.versions[0]?.version || 0;
  const newVersion = currentVersion + 1;

  // Update template and create new version in transaction
  const result = await prisma.$transaction(async (tx: any) => {
    // Update template
    const updated = await tx.promotionTemplate.update({
      where: { id },
      data: updateData,
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Create new version
    await tx.templateVersion.create({
      data: {
        templateId: id,
        version: newVersion,
        changes,
        snapshot: {
          ...template,
          ...updateData,
        },
        createdById: userId,
      },
    });

    return updated;
  });

  return res.status(200).json({
    success: true,
    data: result,
    version: newVersion,
  });
}

async function handleDelete(id: string, res: VercelResponse) {
  const template = await prisma.promotionTemplate.findUnique({
    where: { id },
    include: {
      _count: {
        select: { versions: true },
      },
    },
  });

  if (!template) {
    return res.status(404).json({ error: 'Template not found' });
  }

  // Check if template is in use by active promotions
  const activePromotions = await prisma.promotion.count({
    where: {
      templateId: id,
      status: { in: ['DRAFT', 'PLANNED', 'CONFIRMED', 'EXECUTING'] },
    },
  });

  if (activePromotions > 0) {
    return res.status(400).json({
      error: `Cannot delete: ${activePromotions} active promotion(s) using this template`,
    });
  }

  // Soft delete - mark as inactive
  await prisma.promotionTemplate.update({
    where: { id },
    data: { isPublic: false },
  });

  return res.status(200).json({
    success: true,
    message: 'Template deactivated successfully',
  });
}
