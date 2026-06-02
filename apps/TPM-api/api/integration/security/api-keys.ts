/**
 * API Keys Management API
 * GET /api/integration/security/api-keys - List API keys
 * POST /api/integration/security/api-keys - Create API key
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
    console.error('API Keys API error:', error);
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
    where.name = { contains: search, mode: 'insensitive' };
  }

  const apiKeys = await prisma.aPIKey.findMany({
    where,
    include: {
      createdBy: {
        select: { id: true, name: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Calculate summary
  const now = new Date();
  const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const total = apiKeys.length;
  const active = apiKeys.filter((k: any) => k.isActive).length;
  const expiringSoon = apiKeys.filter(
    (k: any) => k.isActive && k.expiresAt && new Date(k.expiresAt) <= sevenDaysLater && new Date(k.expiresAt) > now
  ).length;

  return res.status(200).json({
    success: true,
    data: apiKeys.map((k: any) => ({
      ...k,
      key: undefined, // Never expose the full key
    })),
    summary: {
      total,
      active,
      expiringSoon,
    },
  });
}

async function handlePost(req: VercelRequest, res: VercelResponse) {
  const { name, permissions, expiresAt, rateLimit, allowedIPs } = req.body;

  if (!name || !permissions || permissions.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Name and permissions are required',
    });
  }

  // Validate permissions
  const validPermissions = [
    'read:promotions',
    'write:promotions',
    'read:claims',
    'write:claims',
    'read:customers',
    'write:customers',
    'read:products',
    'write:products',
    'read:reports',
    'admin:all',
  ];

  const invalidPerms = permissions.filter((p: string) => !validPermissions.includes(p));
  if (invalidPerms.length > 0) {
    return res.status(400).json({
      success: false,
      error: `Invalid permissions: ${invalidPerms.join(', ')}`,
    });
  }

  // Generate API key
  const rawKey = `pm_live_${crypto.randomBytes(24).toString('hex')}`;
  const hashedKey = crypto.createHash('sha256').update(rawKey).digest('hex');
  const keyPreview = rawKey.slice(-4);

  // Check for duplicate name
  const existing = await prisma.aPIKey.findFirst({
    where: { name },
  });

  if (existing) {
    return res.status(400).json({
      success: false,
      error: 'API key with this name already exists',
    });
  }

  // Create API key
  const apiKey = await prisma.aPIKey.create({
    data: {
      name,
      keyHash: hashedKey,
      keyPrefix: keyPreview,
      scopes: permissions,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      rateLimitRequests: rateLimit || 1000,
      allowedIPs: allowedIPs || [],
      status: 'ACTIVE',
      totalRequests: 0,
      createdById: req.body.userId || 'system',
      companyId: req.body.companyId || 'system',
    },
  });

  // Create audit log
  await prisma.immutableAuditLog.create({
    data: {
      userId: req.body.userId || 'system',
      action: 'CREATE',
      entityType: 'APIKey',
      entityId: apiKey.id,
      description: `Created API key: ${name}`,
      newValues: { name, permissions },
      companyId: req.body.companyId || 'system',
      sequenceNumber: Date.now(),
      entryHash: hashedKey,
    },
  });

  return res.status(201).json({
    success: true,
    data: {
      ...apiKey,
      key: rawKey, // Only show the raw key once
    },
    message: 'API key created successfully. Save the key - it will not be shown again.',
  });
}
