/**
 * Apply Template API
 * POST /api/planning/templates/[id]/apply - Create promotion from template
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from '../../../_lib/prisma';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Template ID is required' });
  }

  try {
    const template = await prisma.promotionTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    if (!template.isPublic) {
      return res.status(400).json({ error: 'Template is not public' });
    }

    // Extract template data from the template JSON field
    const templateData = template.template as any || {};

    const {
      name,
      startDate,
      endDate,
      budget,
      customerId,
      fundId,
      overrides,
    } = req.body;

    // Validate required fields
    if (!name || !startDate || !endDate) {
      return res.status(400).json({
        error: 'Missing required fields: name, startDate, endDate',
      });
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      return res.status(400).json({
        error: 'Start date must be before end date',
      });
    }

    // If customerId provided, verify customer exists
    if (customerId) {
      const customer = await prisma.customer.findUnique({
        where: { id: customerId },
      });
      if (!customer) {
        return res.status(400).json({ error: 'Customer not found' });
      }
    }

    // If fundId provided, verify fund exists and has budget
    if (fundId) {
      const fund = await prisma.fund.findUnique({
        where: { id: fundId },
      });
      if (!fund) {
        return res.status(400).json({ error: 'Fund not found' });
      }
    }

    // Generate promotion code
    const count = await prisma.promotion.count();
    const promotionCode = `PROMO-${String(count + 1).padStart(6, '0')}`;

    // Create promotion from template
    const result = await prisma.$transaction(async (tx: any) => {
      // Create promotion
      const promotion = await tx.promotion.create({
        data: {
          code: promotionCode,
          name,
          status: 'DRAFT',
          startDate: start,
          endDate: end,
          budget: budget ? parseFloat(budget) : templateData.defaultBudget || 0,
          customerId: customerId,
          fundId: fundId,
          templateId: id,
          description: `Created from template: ${template.name}`,
        },
        include: {
          customer: {
            select: { id: true, code: true, name: true },
          },
          fund: {
            select: { id: true, code: true, name: true },
          },
        },
      });

      // Increment template usage count
      await tx.promotionTemplate.update({
        where: { id },
        data: { usageCount: { increment: 1 } },
      });

      return promotion;
    });

    return res.status(201).json({
      success: true,
      data: result,
      message: `Promotion ${promotionCode} created from template ${template.name}`,
    });
  } catch (error: any) {
    console.error('Apply template error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
