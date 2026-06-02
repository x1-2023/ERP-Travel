/**
 * Webhook Retry API
 * POST /api/integration/webhooks/:id/retry - Retry failed delivery
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from '../../../../_lib/prisma';
import crypto from 'crypto';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { id } = req.query;
  const { deliveryId } = req.body;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ success: false, error: 'Endpoint ID is required' });
  }

  if (!deliveryId) {
    return res.status(400).json({ success: false, error: 'Delivery ID is required' });
  }

  try {
    const delivery = await (prisma as any).webhookDelivery.findFirst({
      where: {
        id: deliveryId,
        endpointId: id,
      },
      include: {
        endpoint: true,
      },
    });

    if (!delivery) {
      return res.status(404).json({
        success: false,
        error: 'Delivery not found',
      });
    }

    if (delivery.status !== 'FAILED') {
      return res.status(400).json({
        success: false,
        error: 'Can only retry failed deliveries',
      });
    }

    // Check max retry attempts
    const maxAttempts = (delivery.endpoint.retryConfig as { maxAttempts?: number })?.maxAttempts || 3;
    if (delivery.attempts >= maxAttempts) {
      return res.status(400).json({
        success: false,
        error: `Maximum retry attempts (${maxAttempts}) reached`,
      });
    }

    // Generate signature
    const signature = generateSignature(delivery.payload, delivery.endpoint.secret);

    // Retry delivery
    const result = await retryWebhookDelivery(delivery.endpoint, delivery.payload, signature);

    // Update delivery record
    await (prisma as any).webhookDelivery.update({
      where: { id: deliveryId },
      data: {
        status: result.success ? 'DELIVERED' : 'FAILED',
        attempts: { increment: 1 },
        lastAttemptAt: new Date(),
        responseStatus: result.status,
        responseBody: result.body?.slice(0, 1000),
        error: result.error,
      },
    });

    return res.status(200).json({
      success: true,
      data: {
        delivered: result.success,
        attempts: delivery.attempts + 1,
        responseStatus: result.status,
        latency: result.latency,
      },
      message: result.success ? 'Retry successful' : 'Retry failed',
    });
  } catch (error) {
    console.error('Webhook retry API error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

function generateSignature(payload: unknown, secret: string): string {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(JSON.stringify(payload));
  return `sha256=${hmac.digest('hex')}`;
}

interface WebhookEndpoint {
  id: string;
  url: string;
  secret: string;
  headers: unknown;
}

async function retryWebhookDelivery(
  endpoint: WebhookEndpoint,
  payload: unknown,
  signature: string
): Promise<{ success: boolean; status?: number; body?: string; error?: string; latency: number }> {
  const startTime = Date.now();

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Webhook-Signature': signature,
      'X-Webhook-Event': (payload as { event?: string })?.event || 'unknown',
      'X-Webhook-Delivery': crypto.randomUUID(),
      ...((endpoint.headers as Record<string, string>) || {}),
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(endpoint.url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const body = await response.text();
    const latency = Date.now() - startTime;

    return {
      success: response.ok,
      status: response.status,
      body,
      latency,
      error: response.ok ? undefined : `HTTP ${response.status}`,
    };
  } catch (error) {
    return {
      success: false,
      latency: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Delivery failed',
    };
  }
}
