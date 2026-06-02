/**
 * DMS Push API
 * POST /api/integration/dms/:id/push - Push data to DMS
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from '../../../../_lib/prisma';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ success: false, error: 'Connection ID is required' });
  }

  try {
    const { dataType, ids } = req.body;

    if (!dataType) {
      return res.status(400).json({
        success: false,
        error: 'dataType is required (PROMOTIONS, PRODUCTS, or PRICE_LIST)',
      });
    }

    const connection = await (prisma as any).dMSConnection.findUnique({
      where: { id },
      include: { distributor: true },
    });

    if (!connection) {
      return res.status(404).json({
        success: false,
        error: 'DMS connection not found',
      });
    }

    if (connection.status !== 'ACTIVE') {
      return res.status(400).json({
        success: false,
        error: 'Connection is not active',
      });
    }

    let pushResult: { success: boolean; recordsPushed: number; errors: string[] };

    switch (dataType) {
      case 'PROMOTIONS':
        pushResult = await pushPromotions(connection, ids);
        break;
      case 'PRODUCTS':
        pushResult = await pushProducts(connection, ids);
        break;
      case 'PRICE_LIST':
        pushResult = await pushPriceList(connection, ids);
        break;
      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid dataType',
        });
    }

    return res.status(200).json({
      success: true,
      data: pushResult,
      message: `Pushed ${pushResult.recordsPushed} records to DMS`,
    });
  } catch (error) {
    console.error('DMS push API error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

interface DMSConnection {
  id: string;
  distributorId: string;
  config: unknown;
  distributor: { id: string; name: string } | null;
}

async function pushPromotions(
  connection: DMSConnection,
  ids?: string[]
): Promise<{ success: boolean; recordsPushed: number; errors: string[] }> {
  const errors: string[] = [];

  // Get promotions for this distributor
  const promotions = await prisma.promotion.findMany({
    where: {
      ...(ids && { id: { in: ids } }),
      status: 'EXECUTING',
      customerId: connection.distributorId,
    },
  });

  // Simulate pushing to DMS
  for (const promo of promotions) {
    try {
      // In production, would call DMS API
      console.log(`Pushing promotion ${promo.code} to DMS ${connection.id}`);
    } catch (error) {
      errors.push(`Promotion ${promo.code}: ${error instanceof Error ? error.message : 'Push failed'}`);
    }
  }

  return {
    success: errors.length === 0,
    recordsPushed: promotions.length - errors.length,
    errors,
  };
}

async function pushProducts(
  connection: DMSConnection,
  ids?: string[]
): Promise<{ success: boolean; recordsPushed: number; errors: string[] }> {
  const errors: string[] = [];

  const products = await prisma.product.findMany({
    where: {
      ...(ids && { id: { in: ids } }),
      isActive: true,
    },
    select: {
      id: true,
      sku: true,
      name: true,
      price: true,
      category: true,
    },
  });

  // Simulate pushing to DMS
  for (const product of products) {
    try {
      console.log(`Pushing product ${product.sku} to DMS ${connection.id}`);
    } catch (error) {
      errors.push(`Product ${product.sku}: ${error instanceof Error ? error.message : 'Push failed'}`);
    }
  }

  return {
    success: errors.length === 0,
    recordsPushed: products.length - errors.length,
    errors,
  };
}

async function pushPriceList(
  connection: DMSConnection,
  ids?: string[]
): Promise<{ success: boolean; recordsPushed: number; errors: string[] }> {
  const errors: string[] = [];

  // Get price list for this distributor
  const prices = await prisma.product.findMany({
    where: {
      ...(ids && { id: { in: ids } }),
      isActive: true,
    },
    select: {
      id: true,
      sku: true,
      name: true,
      price: true,
    },
  });

  // Simulate pushing to DMS
  for (const price of prices) {
    try {
      console.log(`Pushing price for ${price.sku} to DMS ${connection.id}`);
    } catch (error) {
      errors.push(`Price ${price.sku}: ${error instanceof Error ? error.message : 'Push failed'}`);
    }
  }

  return {
    success: errors.length === 0,
    recordsPushed: prices.length - errors.length,
    errors,
  };
}
