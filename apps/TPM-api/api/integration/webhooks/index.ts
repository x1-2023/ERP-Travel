/**
 * Webhooks API - List & Create
 * GET /api/integration/webhooks - List webhook endpoints
 * POST /api/integration/webhooks - Create new webhook endpoint
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from '../../../_lib/prisma';
import crypto from 'crypto';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    switch (req.method) {
      case 'GET':
        return handleGet(req, res);
      case 'POST':
        return handlePost(req, res);
      default:
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Webhooks API error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

async function handleGet(req: VercelRequest, res: VercelResponse) {
  const { isActive, search } = req.query;

  const where: Record<string, unknown> = {};

  if (isActive !== undefined && isActive !== 'all') {
    where.isActive = isActive === 'true';
  }
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { url: { contains: search, mode: 'insensitive' } },
    ];
  }

  const endpoints = await (prisma as any).webhookEndpoint.findMany({
    where,
    include: {
      createdBy: {
        select: { id: true, name: true },
      },
      _count: {
        select: { deliveries: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Get today's delivery stats
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayDeliveries = await (prisma as any).webhookDelivery.groupBy({
    by: ['status'],
    where: {
      createdAt: { gte: today },
    },
    _count: true,
  });

  const deliveredToday = todayDeliveries.find((d: any) => d.status === 'DELIVERED')?._count || 0;
  const failedToday = todayDeliveries.find((d: any) => d.status === 'FAILED')?._count || 0;

  return res.status(200).json({
    success: true,
    data: endpoints.map((e: any) => ({
      ...e,
      secret: undefined, // Hide secret
    })),
    summary: {
      total: endpoints.length,
      active: endpoints.filter((e: any) => e.isActive).length,
      deliveredToday,
      failedToday,
    },
  });
}

async function handlePost(req: VercelRequest, res: VercelResponse) {
  const { name, url, events, headers, retryConfig } = req.body;

  if (!name || !url || !events || events.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Name, url, and events are required',
    });
  }

  // Validate URL
  try {
    new URL(url);
  } catch {
    return res.status(400).json({
      success: false,
      error: 'Invalid URL format',
    });
  }

  // Validate events
  const validEvents = [
    'promotion.created',
    'promotion.updated',
    'promotion.approved',
    'promotion.rejected',
    'promotion.completed',
    'claim.submitted',
    'claim.approved',
    'claim.rejected',
    'claim.paid',
    'delivery.created',
    'delivery.delivered',
    'inventory.low_stock',
    'inventory.near_expiry',
  ];

  const invalidEvents = events.filter((e: string) => !validEvents.includes(e));
  if (invalidEvents.length > 0) {
    return res.status(400).json({
      success: false,
      error: `Invalid events: ${invalidEvents.join(', ')}`,
    });
  }

  // Check for duplicate
  const existing = await (prisma as any).webhookEndpoint.findFirst({
    where: { url },
  });

  if (existing) {
    return res.status(400).json({
      success: false,
      error: 'Webhook endpoint with this URL already exists',
    });
  }

  // Generate secret
  const secret = crypto.randomBytes(32).toString('hex');

  // Create endpoint
  const endpoint = await (prisma as any).webhookEndpoint.create({
    data: {
      name,
      url,
      events,
      headers: headers || {},
      retryConfig: retryConfig || {
        maxAttempts: 3,
        initialDelay: 60,
        backoffMultiplier: 2,
      },
      secret,
      isActive: true,
      createdById: req.body.userId || 'system',
    },
  });

  return res.status(201).json({
    success: true,
    data: endpoint,
    message: 'Webhook endpoint created successfully',
  });
}
