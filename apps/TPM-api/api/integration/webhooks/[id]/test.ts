/**
 * Webhook Test API
 * POST /api/integration/webhooks/:id/test - Send test webhook
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import prisma from '../../../../_lib/prisma';
import crypto from 'crypto';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ success: false, error: 'Endpoint ID is required' });
  }

  try {
    const endpoint = await (prisma as any).webhookEndpoint.findUnique({
      where: { id },
    });

    if (!endpoint) {
      return res.status(404).json({
        success: false,
        error: 'Webhook endpoint not found',
      });
    }

    // Create test payload
    const testPayload = {
      event: 'webhook.test',
      timestamp: new Date().toISOString(),
      data: {
        message: 'This is a test webhook delivery',
        endpointId: id,
        endpointName: endpoint.name,
      },
    };

    // Generate signature
    const signature = generateSignature(testPayload, endpoint.secret);

    // Send test webhook
    const deliveryResult = await deliverWebhook(endpoint, testPayload, signature);

    // Create delivery record
    await (prisma as any).webhookDelivery.create({
      data: {
        endpointId: id,
        event: 'webhook.test',
        payload: testPayload,
        status: deliveryResult.success ? 'DELIVERED' : 'FAILED',
        attempts: 1,
        lastAttemptAt: new Date(),
        responseStatus: deliveryResult.status,
        responseBody: deliveryResult.body?.slice(0, 1000),
        error: deliveryResult.error,
      },
    });

    return res.status(200).json({
      success: true,
      data: {
        delivered: deliveryResult.success,
        responseStatus: deliveryResult.status,
        latency: deliveryResult.latency,
        error: deliveryResult.error,
      },
      message: deliveryResult.success ? 'Test webhook delivered successfully' : 'Test webhook delivery failed',
    });
  } catch (error) {
    console.error('Webhook test API error:', error);
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

async function deliverWebhook(
  endpoint: WebhookEndpoint,
  payload: unknown,
  signature: string
): Promise<{ success: boolean; status?: number; body?: string; error?: string; latency: number }> {
  const startTime = Date.now();

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Webhook-Signature': signature,
      'X-Webhook-Event': 'webhook.test',
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
