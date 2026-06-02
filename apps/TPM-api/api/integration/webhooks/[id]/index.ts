/**
 * Webhook Endpoint Detail API
 * GET /api/integration/webhooks/:id - Get endpoint details
 * PUT /api/integration/webhooks/:id - Update endpoint
 * DELETE /api/integration/webhooks/:id - Delete endpoint
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from '../../../../_lib/prisma';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ success: false, error: 'Endpoint ID is required' });
  }

  try {
    switch (req.method) {
      case 'GET':
        return handleGet(id, res);
      case 'PUT':
        return handlePut(id, req, res);
      case 'DELETE':
        return handleDelete(id, res);
      default:
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Webhook Detail API error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

async function handleGet(id: string, res: VercelResponse) {
  const endpoint = await (prisma as any).webhookEndpoint.findUnique({
    where: { id },
    include: {
      createdBy: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  if (!endpoint) {
    return res.status(404).json({
      success: false,
      error: 'Webhook endpoint not found',
    });
  }

  // Get recent deliveries
  const recentDeliveries = await (prisma as any).webhookDelivery.findMany({
    where: { endpointId: id },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  // Get delivery stats
  const stats = await (prisma as any).webhookDelivery.groupBy({
    by: ['status'],
    where: { endpointId: id },
    _count: true,
  });

  const totalDeliveries = stats.reduce((sum: any, s: any) => sum + s._count, 0);
  const successfulDeliveries = stats.find((s: any) => s.status === 'DELIVERED')?._count || 0;
  const failedDeliveries = stats.find((s: any) => s.status === 'FAILED')?._count || 0;

  return res.status(200).json({
    success: true,
    data: {
      ...endpoint,
      secret: endpoint.secret ? `${endpoint.secret.slice(0, 8)}...` : undefined,
      recentDeliveries,
      stats: {
        totalDeliveries,
        successfulDeliveries,
        failedDeliveries,
        successRate: totalDeliveries > 0 ? Math.round((successfulDeliveries / totalDeliveries) * 100) : 0,
      },
    },
  });
}

async function handlePut(id: string, req: VercelRequest, res: VercelResponse) {
  const { name, url, events, headers, retryConfig, isActive } = req.body;

  const endpoint = await (prisma as any).webhookEndpoint.findUnique({
    where: { id },
  });

  if (!endpoint) {
    return res.status(404).json({
      success: false,
      error: 'Webhook endpoint not found',
    });
  }

  // Validate URL if provided
  if (url) {
    try {
      new URL(url);
    } catch {
      return res.status(400).json({
        success: false,
        error: 'Invalid URL format',
      });
    }
  }

  const updatedEndpoint = await (prisma as any).webhookEndpoint.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(url && { url }),
      ...(events && { events }),
      ...(headers && { headers }),
      ...(retryConfig && { retryConfig }),
      ...(isActive !== undefined && { isActive }),
    },
  });

  return res.status(200).json({
    success: true,
    data: {
      ...updatedEndpoint,
      secret: undefined,
    },
    message: 'Webhook endpoint updated successfully',
  });
}

async function handleDelete(id: string, res: VercelResponse) {
  const endpoint = await (prisma as any).webhookEndpoint.findUnique({
    where: { id },
  });

  if (!endpoint) {
    return res.status(404).json({
      success: false,
      error: 'Webhook endpoint not found',
    });
  }

  // Delete related deliveries first
  await (prisma as any).webhookDelivery.deleteMany({ where: { endpointId: id } });

  // Delete endpoint
  await (prisma as any).webhookEndpoint.delete({ where: { id } });

  return res.status(200).json({
    success: true,
    message: 'Webhook endpoint deleted successfully',
  });
}
